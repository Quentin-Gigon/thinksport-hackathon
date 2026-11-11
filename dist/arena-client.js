const prefix='ot-h2h-arena-v1:';
function stored(k){try{return localStorage.getItem(k);}catch{return null;}}
function put(k,v){localStorage.setItem(k,v);}
export async function createClient(base){
 const configResponse=await fetch(new URL('arena-config.json',base),{cache:'no-store'});
 if(!configResponse.ok)throw Error('Game settings are unavailable. Check your connection and retry.');
 const cfg=await configResponse.json();
 if(!['demo','live'].includes(cfg.mode)||!cfg.eventId)throw Error('Event is not configured.');
 const local=cfg.mode==='demo', key=prefix+cfg.mode+':'+cfg.eventId, fanKey=key+':ticket', gameKey=key+':game';
 let sim,token=stored(fanKey),memoryOnly=false,engine=local?await import('./arena-engine.js'):null;
 const joinUrl=new URL('./',cfg.fanBase||base);joinUrl.hash='play';
 async function run(action,body,secret,viewer){
   try{return await perform(action,body,secret,viewer);}catch(e){if(e.status===401&&!viewer&&action==="status"){token=null;try{localStorage.removeItem(fanKey);}catch{}return perform("status",{},"",false);}throw e;}
 }
 async function perform(action,body,secret,viewer){
   const req={...body,action};const ticket=stored(fanKey)||token;if(!viewer&&ticket)req.token=ticket;
   let snap;
   if(local){
     const invoke=()=>{
       const raw=stored(gameKey);let s=raw?JSON.parse(raw):sim;
       if(!s){s=engine.newArena();engine.arenaAction(s,{action:'advance',to:'break1'});}
       if(action==='reset-demo'){s=engine.newArena();engine.arenaAction(s,{action:'advance',to:'break1'});token=null;try{localStorage.removeItem(fanKey);}catch{}req.action='status';delete req.token;}
       const result=engine.arenaAction(s,req);sim=s;
       if(!raw||req.action!=='status'||action==='reset-demo')try{put(gameKey,JSON.stringify(s));}catch{memoryOnly=true;}
       return result;
     };
     snap=navigator.locks?await navigator.locks.request(key,invoke):invoke();
   }else{
     const headers={'Content-Type':'application/json'};if(secret)headers.Authorization='Bearer '+secret;
     const response=await fetch(new URL('api/arena',base),{method:'POST',headers,body:JSON.stringify(req),cache:'no-store',signal:typeof AbortSignal.timeout==='function'?AbortSignal.timeout(12000):undefined});
     let json;try{json=await response.json();}catch{throw Error('Arena server did not respond. Please retry.');}
     if(!response.ok||json.error)throw Object.assign(Error(typeof json.error==='string'?json.error:'Could not complete this action.'),{status:response.status});
     snap=json;
   }
   if(action==='join'&&snap.token){token=snap.token;try{put(fanKey,token);}catch{memoryOnly=true;}}
   return snap;
 }
 return {mode:cfg.mode,joinUrl:joinUrl.href,fixtureLabel:cfg.fixtureLabel||'Fictional exhibition statistics',prizeLabel:cfg.prizeLabel||'',get memoryOnly(){return memoryOnly;},
   call:(a,body={})=>run(a,body,'',false), publicStatus:()=>run('status',{},'',true),
   hostCall:(a,body={},secret='')=>run(a,body,secret,true)};
}
