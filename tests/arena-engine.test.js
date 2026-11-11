import test from 'node:test';
import assert from 'node:assert/strict';
import {newArena,arenaAction,DEMO_ARENA_FIXTURE as fixture,validateFixture,runArena,memoryStore} from '../dist/arena-engine.js';
import {handleArenaRequest} from '../arena-server/handler.js';
import {initializeSql,dbAdapter} from '../arena-server/store.js';
const join=run=>run({action:'join',alias:'<unmoderated text>'});
const advance=(run,to)=>run({action:'advance',to});
function submitRound(run,token,period,how='correct'){
  let p=run({action:'status',token}),answers=[];
  for(const q of fixture.rounds[period-1]){
    assert.ok(p.question);const winner=q[3]>q[5]?q[2]:q[4],other=q[2]===winner?q[4]:q[2];
    const req={action:'pick',token,id:p.question.id,playerId:how==='correct'?winner:other,power:answers.length===0};
    p=run(req);answers.push(req);assert.equal(p.reveal.correct,how==='correct');assert.equal(p.reveal.winnerId,winner);assert.deepEqual(p.reveal.values.map(r=>r.value),[q[3],q[5]]);
  }return {p,answers};
}
test('the two intermissions rank separately, persist tokens, and draw exactly once from top eligible finishers',()=>{
  const state=newArena(),run=req=>arenaAction(state,req),a=join(run),b=join(run),c=join(run);
  assert.match(a.token,/^[a-f0-9]{48}$/);assert.notEqual(a.you.alias,b.you.alias);assert.ok(!a.you.alias.includes('unmoderated'));
  assert.equal(a.question,null);advance(run,'break1');assert.equal(advance(run,'break1').stage,'break1');
  assert.throws(()=>advance(run,'final'),e=>e.status===409);
  let first=run({action:'status',token:a.token});assert.ok(!JSON.stringify(first.question).includes('38.1'));assert.ok(!('winnerId' in first.question));
  const aa=submitRound(run,a.token,1),bb=submitRound(run,b.token,1);submitRound(run,c.token,1);
  assert.equal(aa.p.you.score,600);assert.equal(aa.p.you.powerUsed,true);assert.equal(aa.p.you.complete,true);assert.equal(aa.p.question,null);assert.deepEqual(aa.p.leaders,[]);
  assert.equal(run(aa.answers[0]).you.score,600);assert.throws(()=>run({...aa.answers[0],power:false}),e=>e.status===409);
  const p1=advance(run,'leaders1');assert.equal(p1.completed,3);assert.deepEqual(p1.leaders.map(r=>r.rank),[1,1,1]);assert.throws(()=>run(aa.answers[0]),e=>e.status===409);
  assert.throws(()=>run({action:'draw'}),e=>e.status===409);
  const open2=advance(run,'break2');assert.deepEqual(open2.leaders,p1.leaders);first=run({action:'status',token:a.token});
  assert.equal(first.you.answered,0);assert.equal(first.you.powerUsed,false);assert.equal(first.reveal,null);assert.equal(first.question.id,'p2q1');assert.notEqual(first.question.prompt,aa.p.reveal.prompt);
  submitRound(run,a.token,2);submitRound(run,b.token,2);const late=join(run);submitRound(run,late.token,2);
  const p2=advance(run,'leaders2');assert.equal(p2.eligible,2);assert.equal(p2.finishers,2);assert.equal(p2.completed,3);assert.equal(p2.leaders[0].score,1200);assert.deepEqual(p2.leaders.map(p=>p.rank),[1,1,3,3]);advance(run,'final');
  const fin=run({action:'draw'});assert.ok([a.you.alias,b.you.alias].includes(fin.draw.alias));assert.equal(fin.draw.score,1200);assert.deepEqual(fin.leaders.map(r=>r.rank),[1,1]);assert.deepEqual(run({action:'draw'}).draw,fin.draw);
  assert.equal(run({action:'status',token:c.token}).you.qualified,false);assert.throws(()=>run({action:'join'}),e=>e.status===409);
  const win=[a,b].find(x=>x.you.alias===fin.draw.alias),loser=win===a?b:a;
  const code=run({action:'status',token:win.token}).you.claimCode;
  assert.match(code,/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  assert.ok(!JSON.stringify(fin).includes(code));assert.ok(!JSON.stringify(run({action:'status',token:loser.token})).includes(code));
  assert.equal(run({action:'verifyClaim',code:'1234-5678'}).claimVerified,false);assert.equal(run({action:'verifyClaim',code:code.toLowerCase()}).claimVerified,true);
  const publicJSON=JSON.stringify(fin);for(const fan of [a,b,c,late])assert.ok(!publicJSON.includes(fan.token));assert.equal(fin.question,null);assert.equal(fin.reveal,null);assert.equal(fin.you,null);
});
test('fan cannot spend a second power play, skip, change, or switch periods early',()=>{
  const st=newArena(),run=r=>arenaAction(st,r),a=join(run);advance(run,'break1');
  const q=run({action:'status',token:a.token}).question;const base={action:'pick',id:q.id,token:a.token,playerId:q.players[1].id,power:true};
  assert.throws(()=>run({...base,id:'p2q1'}),e=>e.status===409);assert.throws(()=>run({...base,id:'p1q3'}),e=>e.status===409);
  const p=run(base);assert.equal(p.you.powerUsed,true);assert.equal(p.you.score,0);assert.throws(()=>run({...base,playerId:q.players[0].id}),e=>e.status===409);
  assert.throws(()=>run({...base,id:p.question.id,playerId:p.question.players[0].id}),e=>e.status===409);assert.equal(run({action:'status',token:a.token}).you.answered,1);
  assert.throws(()=>run({action:'status',token:'toString'}),e=>e.status===401);assert.throws(()=>run({action:'pick',id:q.id,playerId:q.players[0].id}),e=>e.status===401);
});
test('empty final does not draw and custom period packs reject tied or unrostered comparisons',()=>{
  const st=newArena();for(const to of ['break1','leaders1','break2','leaders2','final'])arenaAction(st,{action:'advance',to});
  assert.throws(()=>arenaAction(st,{action:'draw'}),e=>e.status===409);assert.equal(validateFixture(fixture),fixture);
  for(const update of [q=>q[3]=q[5],q=>q[2]='not-rostered',q=>q[5]=-2]){
    const bad=structuredClone(fixture);update(bad.rounds[1][0]);assert.throws(()=>validateFixture(bad));
  }
});
test('public Worker routes serve assets and config but only authenticated operators can mutate stage or draw',async()=>{
  const env={ARENA_ADMIN_SECRET:'secret-for-test',ASSETS:{fetch:()=>new Response('assets')},EVENTS:{idFromName:id=>id,get:()=>({fetch:async(_,r)=>Response.json(JSON.parse(r.body))})}};
  const u='https://ice.example/api/arena',post=(body,headers={})=>new Request(u,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
  for(const action of ['advance','draw','verifyClaim','loadPeriod']){assert.equal((await handleArenaRequest(post({action,admin:'wrong'}),env)).status,403);assert.equal((await handleArenaRequest(post({action},{Authorization:'Bearer secret-for-test'}),env)).status,200);}
  assert.equal((await handleArenaRequest(post({action:'join'},{Origin:'https://elsewhere.example'}),env)).status,403);
  assert.equal((await handleArenaRequest(post({action:'status'}),env)).status,200);
  assert.deepEqual(await(await handleArenaRequest(new Request('https://ice.example/arena-config.json'),env)).json(),{mode:'live',eventId:'exhibition-001'});
  assert.equal(await(await handleArenaRequest(new Request('https://ice.example/'),env)).text(),'assets');
});
test('SQLite storage returns the same standings, closed ranks and finalist pool as the local rehearsal',async t=>{
  let DatabaseSync;try{({DatabaseSync}=await import('node:sqlite'));}catch{t.skip('Node SQLite integration requires Node 22+');return;}
  const db=new DatabaseSync(':memory:');try{
    const sql={exec:(query,...args)=>{const rows=db.prepare(query).all(...args);return {toArray:()=>rows};}};initializeSql(sql);const store=dbAdapter(sql),mem=memoryStore(newArena());const run=(s,r)=>runArena(s,r);
    const a=join(r=>run(mem,r)),b=join(r=>run(mem,r));for(const x of [a,b])store.save(x.token,mem.get(x.token));
    for(const source of [mem,store]){const r=req=>run(source,req);advance(r,'break1');submitRound(r,a.token,1);submitRound(r,b.token,1,'wrong');advance(r,'leaders1');advance(r,'break2');submitRound(r,b.token,2,'wrong');advance(r,'leaders2');}
    for(const stage of ['leaders2','final']){if(stage==='final'){for(const s of [mem,store])run(s,{action:'advance',to:'final'});}
      const sr=run(store,{action:'status',token:b.token}),mr=run(mem,{action:'status',token:b.token});assert.deepEqual(JSON.parse(JSON.stringify(sr)),mr);}
    assert.equal(run(store,{action:'draw'}).draw.alias,b.you.alias);
  }finally{db.close();}
});

test('period uploads stay private until answered, are independent, and freeze permanently at their own horn',()=>{
 const state=newArena(),run=req=>arenaAction(state,req),token=join(run).token;
 const pack=n=>({players:['left','right'].map((side,i)=>({id:side,name:(n===1?'First':'Second')+' '+side,number:n*10+i,team:'Ice'})),
 round:Array.from({length:5},(_,i)=>['Which skater completed more passes in shift '+(i+1)+'?', 'passes','left',n===1?73:2,'right',n===1?2:84,'Illustrative example; compare the supported pass count.'])});
 const load=(n,f)=>run({action:'loadPeriod',period:n,fixture:f});
 assert.throws(()=>load(2,pack(2)),e=>e.status===409);
 const invalid=pack(1);invalid.round[0][3]=2;assert.throws(()=>load(1,invalid),e=>e.status===400);assert.deepEqual(run({action:'status'}).loadedPeriods,[]);
 const p1=pack(1);assert.deepEqual(load(1,p1).loadedPeriods,[1]);p1.players[0].name='Mutated after load';
 assert.ok(!JSON.stringify(run({action:'status'})).includes('First left'));advance(run,'break1');
 assert.throws(()=>load(1,pack(1)),e=>e.status===409);assert.throws(()=>load(2,pack(2)),e=>e.status===409);
 const s=run({action:'status',token});assert.equal(s.question.players[0].name,'First left');assert.ok(!JSON.stringify(s.question).includes('73'));
 const first=run({action:'pick',token,id:'p1q1',playerId:'left'});assert.equal(first.reveal.values[0].value,73);assert.equal(first.you.score,100);
 advance(run,'leaders1');const p2=pack(2);assert.deepEqual(load(2,p2).loadedPeriods,[1,2]);assert.ok(!JSON.stringify(run({action:'status',token})).includes('Second right'));
 assert.equal(run({action:'status',token}).reveal.players[0].name,'First left');advance(run,'break2');
 const second=run({action:'pick',token,id:'p2q1',playerId:'right'});assert.equal(second.reveal.players[0].name,'Second left');assert.equal(second.reveal.values[1].value,84);assert.equal(second.you.score,200);
 assert.throws(()=>load(2,pack(2)),e=>e.status===409);assert.deepEqual(run({action:'status'}).loadedPeriods,[1,2]);
});
