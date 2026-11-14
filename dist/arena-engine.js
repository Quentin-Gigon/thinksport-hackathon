// Exhibition data for rehearsal. A Worker can instead load private period fixtures.
const PLAYERS=[
  {id:'keller',name:'Alex Keller',number:14,team:'ALP'},
  {id:'berger',name:'Noah Berger',number:7,team:'ALP'},
  {id:'fischer',name:'Leo Fischer',number:28,team:'ALP'},
  {id:'rossi',name:'Sam Rossi',number:41,team:'ALP'},
  {id:'brooks',name:'Jamie Brooks',number:9,team:'COL'},
  {id:'morgan',name:'Casey Morgan',number:22,team:'COL'},
  {id:'hayes',name:'Robin Hayes',number:16,team:'COL'},
  {id:'carter',name:'Max Carter',number:35,team:'COL'}
];

export const STAGES=['lobby','break1','leaders1','break2','leaders2','final'];
export const DEMO_ARENA_FIXTURE={
  players:PLAYERS,
  rounds:[
    [
      ['Who hit the higher top speed?','km/h','rossi',38.1,'hayes',37.4,'A burst of speed can decide who reaches a loose puck. Peak speed measures the burst, not the whole race.'],
      ['Who covered more ice?','m','fischer',1670,'brooks',1720,'A winger who races back to cover an opponent adds distance without touching the puck. Distance also depends on ice time.'],
      ['Who blocked more shots?','blocks','berger',2,'fischer',3,'A defender in the shooting lane can stop an attempt before it reaches the goalie. A block is not necessarily a goal saved.'],
      ['Who completed more passes?','passes','carter',21,'berger',19,'A short outlet pass can move a team out of trouble without earning an assist. A count alone cannot show where the puck went.'],
      ['Who spent longer on the ice?','sec','morgan',410,'keller',380,'Time on ice is opportunity. Watch who stays on for an extra shift; the total alone cannot tell you how well they played.']
    ],[
      ['Who completed more passes this period?','passes','brooks',20,'berger',18,'An outlet gives a teammate time to turn up the ice. The pass count includes short resets as well as breakout passes.'],
      ['Who covered more ice this period?','m','rossi',1580,'fischer',1710,'Following a skater away from the puck reveals the work of getting back into position. Longer distance does not always mean greater impact.'],
      ['Who blocked more shots this period?','blocks','carter',2,'morgan',4,'Closing a shooting lane matters before the goalie gets involved. Even after a block, the rebound can still be dangerous.'],
      ['Who skated farther this period?','m','hayes',1380,'keller',1350,'Look for the long recovery skate after possession changes. Both the attack and the trip back count towards distance.'],
      ['Who completed more passes this period?','passes','carter',22,'fischer',15,'A safe pass can sustain possession before a scoring opportunity develops. Whether it opened space depends on the play.']
    ]
  ]
};
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
export function validateFixture(f){
  const ids=new Set();
  if(!f||!Array.isArray(f.players)||!f.players.length||!Array.isArray(f.rounds)||f.rounds.length!==2)fail('Invalid event fixture.',500);
  for(const p of f.players){
    if(!p||typeof p.id!=='string'||!/^[-_a-zA-Z0-9]{1,60}$/.test(p.id)||ids.has(p.id)||!Number.isInteger(p.number)||p.number<0||p.number>99||![p.name,p.team].every(t=>typeof t==='string'&&t.trim()&&!/[<>]/.test(t)))fail('Invalid event player.',500);
    ids.add(p.id);
  }
  for(const round of f.rounds){if(!Array.isArray(round)||round.length!==5)fail('Each period needs five calls.',500);
    for(const q of round){if(!Array.isArray(q)||q.length!==7||q[2]===q[4]||![q[2],q[4]].every(x=>ids.has(x))||![q[3],q[5]].every(n=>Number.isFinite(n)&&n>=0)||q[3]===q[5]||![q[0],q[1],q[6]].every(t=>typeof t==='string'&&t.trim()&&!/[<>]/.test(t)))fail('Invalid event comparison.',500);}
  }return f;
}
const periodOf=s=>['break1','leaders1'].includes(s)?1:['break2','leaders2','final'].includes(s)?2:0;
const published=s=>['leaders2','final'].includes(s)?2:['leaders1','break2'].includes(s)?1:0;
const open=s=>s==='break1'||s==='break2';
const secureToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');
const claimAlphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function newClaimCode(){const raw=Array.from({length:8},()=>claimAlphabet[randomIndex(claimAlphabet.length)]).join('');return raw.slice(0,4)+'-'+raw.slice(4);}
function randomIndex(size){const max=Math.floor(0x100000000/size)*size;const a=new Uint32Array(1);do{crypto.getRandomValues(a);}while(a[0]>=max);return a[0]%size;}
const score=(calls)=>calls.reduce((total,call)=>total+call.points,0);
export function totals(p){return [score(p.rounds[0]),score(p.rounds[1]),p.rounds[0].length,p.rounds[1].length];}
const qualified=p=>p.rounds.every(c=>c.length===5);
function row(p,n){const [a,b,x,y]=totals(p);return {alias:p.alias,score:a+(n===2?b:0),completed:Number(x===5)+(n===2?Number(y===5):0)};}
export function newArena(){return {meta:{stage:'lobby',draw:null},players:{}};}
export function memoryStore(state){
  const rows=(n,finalOnly=false)=>Object.values(state.players).filter(p=>(!finalOnly||qualified(p))&&(p.rounds[0].length||(n===2&&p.rounds[1].length))).map(p=>row(p,n)).sort((a,b)=>b.score-a.score||(a.alias<b.alias?-1:a.alias>b.alias?1:0));
  const eligibleRows=()=>{const all=rows(2).filter(r=>r.completed===2);return all.filter(r=>r.score===all[0].score);};
  return {getMeta:()=>state.meta,setMeta:m=>{state.meta=m;},get:t=>Object.hasOwn(state.players,t)?state.players[t]:null,save:(t,p)=>{state.players[t]=p;},hasAlias:a=>Object.values(state.players).some(p=>p.alias.toLowerCase()===a.toLowerCase()),count:()=>Object.keys(state.players).length,completed:n=>n?Object.values(state.players).filter(p=>p.rounds[n-1].length===5).length:0,finishers:()=>Object.values(state.players).filter(qualified).length,leaders:(n,finalOnly)=>rows(n,finalOnly).slice(0,10),higher:(n,v,finalOnly)=>rows(n,finalOnly).filter(p=>p.score>v).length,eligible:()=>eligibleRows().length,drawAt:i=>eligibleRows()[i]};
}
function periodPack(meta,f,n){return meta.periodFixtures?.[n]||{players:f.players,round:f.rounds[n-1]};}
function copyPack(pack){
  try{
    validateFixture({players:pack?.players,rounds:[pack?.round,pack?.round]});
    return {players:pack.players.map(({id,name,number,team})=>({id,name,number,team})),round:pack.round.map(q=>[...q])};
  }catch(e){fail(e.message||'Invalid period data.');}
}
function question(f,period,index){
  const q=f.round?.[index];if(!q)return null;
  const players=[q[2],q[4]].map(id=>{const p=f.players.find(p=>p.id===id);return {id,name:p.name,number:p.number,team:p.team};});
  return {id:'p'+period+'q'+(index+1),prompt:q[0],unit:q[1],players};
}
function revealFor(f,period,index,call){
  const q=f.round[index];return {...question(f,period,index),playerId:call.playerId,power:call.power,correct:call.points>0,winnerId:q[3]>q[5]?q[2]:q[4],points:call.points,values:[{id:q[2],value:q[3]},{id:q[4],value:q[5]}],story:q[6]};
}
function snapshot(store,meta,f,player,showReveal){
  const {stage,draw}=meta,period=periodOf(stage),n=published(stage);
  let previousScore=null,rank=0;
  const leaders=(n?store.leaders(n,stage==='final'):[]).map((r,i)=>{if(r.score!==previousScore){rank=i+1;previousScore=r.score;}return {...r,rank};});
  const out={stage,period,loadedPeriods:[...(meta.loadedPeriods||[])],joined:store.count(),completed:store.completed(period),finishers:store.finishers(),leaders,eligible:n===2?store.eligible():0,draw,you:null,question:null,reveal:null};
  if(player){
    const calls=period?player.rounds[period-1]:[],anyPublished=n&&player.rounds.slice(0,n).some(c=>c.length);
    out.you={alias:player.alias,score:score(player.rounds.flat()),periodScore:score(calls),answered:calls.length,complete:calls.length===5,powerUsed:calls.some(c=>c.power),qualified:qualified(player),rank:anyPublished&&(stage!=='final'||qualified(player))?store.higher(n,row(player,n).score,stage==='final')+1:null};
    if(meta.draw?.alias===player.alias&&meta.claimCode)out.you.claimCode=meta.claimCode;
    const pack=period?periodPack(meta,f,period):null;
    if(open(stage))out.question=question(pack,period,calls.length);
    if(calls.length){const idx=showReveal??(calls.length-1);out.reveal=revealFor(pack,period,idx,calls[idx]);}
  }return out;
}
// Host authorization belongs to the HTTP boundary. Storage operations are synchronous
// and must execute as one transaction (the in-memory rehearsal has no concurrent writes).
export function runArena(store,req,f=DEMO_ARENA_FIXTURE){
  if(!req||typeof req.action!=='string')fail('Missing arena action.');
  let meta=store.getMeta(),t=req.token,player=null,showReveal,claimVerified,issued=false;
  if(t!=null){if(typeof t!=='string'||!/^([a-f0-9]{48})$/.test(t)||!(player=store.get(t)))fail('This fan pass is no longer valid.',401);}
  switch(req.action){
  case 'state':case 'status':break;
  case 'join':{
    if(player)break;
    if(['leaders2','final'].includes(meta.stage))fail('Entries are closed. See the final leaderboard.',409);
    const prefixes=['Alpine','Glacier','Polar','Summit','Arctic','Ice','Snow','Silver'];
    const mascots=['Lynx','Fox','Falcon','Owl','Hare','Wolf','Ibex','Bear'];
    const alias=prefixes[randomIndex(prefixes.length)]+' '+mascots[randomIndex(mascots.length)]+' '+String(store.count()+1).padStart(3,'0');
    t=secureToken();player={alias,rounds:[[],[]]};store.save(t,player);issued=true;break;
  }
  case 'pick':{
    if(!player)fail('Join the game first.',401);
    if(!open(meta.stage))fail('The horn has sounded. This break is closed.',409);
    const period=periodOf(meta.stage),pack=periodPack(meta,f,period),qIndex=pack.round.findIndex((_,i)=>req.id==='p'+period+'q'+(i+1)),calls=player.rounds[period-1];
    if(qIndex<0||qIndex>calls.length)fail('This pick does not match your current call.',409);
    if(req.power!==undefined&&typeof req.power!=='boolean')fail('Invalid Power Play.');
    const boosted=req.power===true,prev=calls[qIndex];
    if(prev){if(prev.playerId!==req.playerId||prev.power!==boosted)fail('That call is already locked.',409);showReveal=qIndex;break;}
    const q=pack.round[qIndex];
    if(req.playerId!==q[2]&&req.playerId!==q[4])fail('Choose one of the two skaters.');
    if(boosted&&calls.some(c=>c.power))fail('Your Power Play was already used this period.',409);
    const winner=q[3]>q[5]?q[2]:q[4];
    calls.push({playerId:req.playerId,power:boosted,points:winner===req.playerId?(boosted?200:100):0});store.save(t,player);showReveal=qIndex;break;
  }
  case 'loadPeriod':{
    const n=req.period;if(n!==1&&n!==2)fail('Choose period one or two.');
    if(meta.stage!==(n===1?'lobby':'leaders1'))fail('This period can only be loaded immediately before its break opens.',409);
    const pack=copyPack(req.fixture);
    meta={...meta,periodFixtures:{...meta.periodFixtures,[n]:pack},loadedPeriods:[...new Set([...(meta.loadedPeriods||[]),n])].sort()};
    store.setMeta(meta);break;
  }
  case 'advance':{
    if(!STAGES.includes(req.to))fail('Unknown match stage.');
    if(req.to===meta.stage)break;
    if(STAGES.indexOf(req.to)!==STAGES.indexOf(meta.stage)+1)fail('Move to the next stage in order.',409);
    meta={...meta,stage:req.to};if(open(req.to)){const n=periodOf(req.to);
      // Freeze the fallback too, so changing the deployment's fixture cannot alter a locked call.
      meta.periodFixtures={...meta.periodFixtures,[n]:copyPack(periodPack(meta,f,n))};
    }store.setMeta(meta);break;
  }
  case 'draw':{
    if(meta.stage!=='final')fail('Wait for the final horn to draw.',409);
    if(meta.draw)break;
    const count=store.eligible();if(!count)fail('No eligible fans completed both breaks.',409);
    const chosen=store.drawAt(randomIndex(count));meta={...meta,draw:{alias:chosen.alias,score:chosen.score},claimCode:newClaimCode()};store.setMeta(meta);break;
  }
  case 'verifyClaim':{
    const code=typeof req.code==='string'?req.code.toUpperCase().replace(/[\s-]/g,''):'';
    claimVerified=meta.stage==='final'&&!!meta.claimCode&&meta.claimCode.replace('-','')===code;break;
  }
  default:fail('Unknown arena action.',400);
  }
  const out=snapshot(store,meta,f,player,showReveal);if(issued)out.token=t;if(claimVerified!==undefined)out.claimVerified=claimVerified;return out;
}
export function arenaAction(state,req,fixture=DEMO_ARENA_FIXTURE){return runArena(memoryStore(state),req,fixture);}
