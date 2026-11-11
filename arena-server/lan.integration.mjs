import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {mkdtemp,rm} from 'node:fs/promises';
import {once} from 'node:events';
import assert from 'node:assert/strict';
const dir=await mkdtemp(path.join(tmpdir(),'ot-arena-test-'));let proc,origin;
async function boot(){proc=spawn(process.execPath,[new URL('./lan.mjs',import.meta.url).pathname],{env:{...process.env,ARENA_BIND:'127.0.0.1',ARENA_PORT:'0',ARENA_STORE:dir,ARENA_HOST_KEY:'test-host-secret'},stdio:['ignore','pipe','inherit']});
 origin=await new Promise((resolve,reject)=>{let joined='';const onExit=()=>reject(Error('Host stopped before setup'));proc.once('exit',onExit);proc.stdout.on('data',b=>{joined+=b;if(/Operator console: (http:\/\/127\.0\.0\.1:\d+)/.test(joined)){proc.off('exit',onExit);resolve(joined.match(/Operator console: (http:\/\/127\.0\.0\.1:\d+)/)[1]);}});});}
async function stop(){if(!proc||proc.exitCode!==null)return;const done=once(proc,'exit');proc.kill('SIGTERM');await done;proc=null;}
const send=async(action,fields={},admin=false)=>{const r=await fetch(origin+'/api/arena',{method:'POST',headers:{'Content-Type':'application/json',...(admin?{Authorization:'Bearer test-host-secret'}:{})},body:JSON.stringify({action,...fields})});return {status:r.status,...await r.json()};};
const advance=to=>send('advance',{to},true);
try{
 await boot();assert.equal((await (await fetch(origin+'/arena-config.json')).json()).mode,'live');assert.equal((await send('advance',{to:'break1'})).status,403);
 const entries=await Promise.all(Array.from({length:3},()=>send('join'))),tokens=entries.map(e=>e.token);assert.equal(new Set(tokens).size,3);
 const answers=[['rossi','brooks','fischer','carter','morgan'],['brooks','fischer','morgan','hayes','carter']];
 for(let n=1;n<=2;n++){await advance('break'+n);
  for(let i=0;i<5;i++)await Promise.all(tokens.map(async(t,j)=>{const before=await send('status',{token:t});assert.equal(before.question.id,'p'+n+'q'+(i+1));assert.ok(!('values' in before.question));const a=answers[n-1][i],playerId=j===2?before.question.players.find(p=>p.id!==a).id:a;const pick={id:before.question.id,token:t,playerId,power:i===0};const after=await send('pick',pick);assert.equal(after.you.answered,i+1);assert.equal(after.reveal.correct,j!==2);if(i===1)assert.equal((await send('pick',pick)).you.score,after.you.score);}));
  const board=await advance('leaders'+n);assert.equal(board.completed,3);assert.deepEqual(board.leaders.map(r=>[r.rank,r.score]),[[1,600*n],[1,600*n],[3,0]]);
  const pub=await send('status');assert.equal(pub.you,null);assert.equal(pub.question,null);assert.equal(pub.reveal,null);
  if(n===1){await stop();await boot();assert.equal((await send('status',{token:tokens[0]})).you.score,600);}
 }
 await advance('final');const board=await send('draw',{},true);assert.equal(board.eligible,2);assert.equal(board.draw.score,1200);assert.ok(entries.slice(0,2).some(p=>p.you.alias===board.draw.alias));assert.deepEqual((await send('draw',{},true)).draw,board.draw);
 const wi=entries.findIndex(p=>p.you.alias===board.draw.alias);const personal=await send('status',{token:tokens[wi]});assert.ok(personal.you.claimCode);
 assert.ok(!JSON.stringify(await send('status')).includes(personal.you.claimCode));
 assert.equal((await send('verifyClaim',{code:personal.you.claimCode})).status,403);assert.equal((await send('verifyClaim',{code:personal.you.claimCode},true)).claimVerified,true);
 console.log('PASS: three independent fans; ten blind picks each; two published leaderboards; restart + ticket recovery; protected host; single draw from two tied finishers; private claim verified.');
}finally{await stop();await rm(dir,{recursive:true,force:true});}
