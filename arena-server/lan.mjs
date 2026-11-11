// One trusted event operator; all phones use this same server, not isolated demos.
import http from 'node:http';
import net from 'node:net';
import {createHash,randomBytes,timingSafeEqual} from 'node:crypto';
import {mkdir,readFile,writeFile,rename,open,unlink} from 'node:fs/promises';
import {networkInterfaces} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {newArena,arenaAction,validateFixture,DEMO_ARENA_FIXTURE} from '../dist/arena-engine.js';
const dist=fileURLToPath(new URL('../dist/',import.meta.url));
const port=Number(process.env.ARENA_PORT||4190), bind=process.env.ARENA_BIND||'0.0.0.0';
const dir=path.resolve(process.env.ARENA_STORE||fileURLToPath(new URL('../.arena-local',import.meta.url)));await mkdir(dir,{recursive:true,mode:0o700});
const save=path.join(dir,'event.json'),lock=path.join(dir,'server.lock');
let lockHandle;try{lockHandle=await open(lock,'wx',0o600);await lockHandle.writeFile(String(process.pid));}catch{throw Error('This event directory is already in use. Stop the first host, or use a new ARENA_STORE.');}
let stop=false;const cleanup=async()=>{if(stop)return;stop=true;await lockHandle.close();await unlink(lock).catch(()=>{});};process.on('SIGTERM',()=>cleanup().then(()=>process.exit(0)));process.on('SIGINT',()=>cleanup().then(()=>process.exit(0)));
const key=process.env.ARENA_HOST_KEY||randomBytes(18).toString('base64url'), hash=v=>createHash('sha256').update(v).digest();const secretHash=hash(key);
const eventId=process.env.ARENA_EVENT_ID||'exhibition-001';const fixture=process.env.ARENA_FIXTURE_FILE?validateFixture(JSON.parse(await readFile(process.env.ARENA_FIXTURE_FILE,'utf8'))):DEMO_ARENA_FIXTURE;let current;try{current=JSON.parse(await readFile(save,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;current=newArena();}
const mime={'.js':'application/javascript','.html':'text/html; charset=utf-8','.css':'text/css','.svg':'image/svg+xml','.json':'application/json'};
let tail=Promise.resolve();const task=fn=>{const p=tail.then(fn);tail=p.catch(()=>{});return p;};
const json=(res,status,body)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(body));};
const loopback=addr=>['127.0.0.1','::1','::ffff:127.0.0.1'].includes(addr);
const localAddresses=()=>Object.values(networkInterfaces()).flat().filter(x=>x&&!x.internal&&net.isIPv4(x.address)).map(x=>x.address);
const server=http.createServer(async(req,res)=>{
 try{
  const p=new URL(req.url,'http://localhost').pathname;
  if(p==='/arena-config.json'){return json(res,200,{mode:'live',eventId,fanBase:process.env.ARENA_PUBLIC_URL||((/^(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(req.headers.host||'')&&bind!=='127.0.0.1'&&localAddresses()[0])?'http://'+localAddresses()[0]+':'+server.address().port+'/':undefined),fixtureLabel:process.env.ARENA_FIXTURE_FILE?'Event period statistics':'Fictional exhibition statistics',prizeLabel:process.env.ARENA_PRIZE||''});}
  if(p==='/api/arena'){
   if(req.method!=='POST')return json(res,405,{error:'Use POST.'});
   if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return json(res,415,{error:'Use JSON.'});
   let raw='';for await(const chunk of req){raw+=chunk.toString();if(raw.length>65536)return json(res,413,{error:'Request too large.'});}
   let body;try{body=JSON.parse(raw);}catch{return json(res,400,{error:'Invalid JSON.'});}
   if(!body||Array.isArray(body)||typeof body!=='object')return json(res,400,{error:'Invalid action.'});
   if(['advance','draw','verifyClaim','loadPeriod'].includes(body.action)){
    if(!loopback(req.socket.remoteAddress)||!timingSafeEqual(secretHash,hash((req.headers.authorization||'').replace(/^Bearer /,''))))return json(res,403,{error:'Use the host computer and its operator key.'});
   }
   if(!['join','status','pick','advance','draw','verifyClaim','loadPeriod'].includes(body.action))return json(res,400,{error:'Unknown event action.'});
   const out=await task(async()=>{
    if(body.action==='status')return arenaAction(current,body,fixture);
    const next=structuredClone(current),reply=arenaAction(next,body,fixture);
    await writeFile(save+'.tmp',JSON.stringify(next),{mode:0o600});await rename(save+'.tmp',save);current=next;return reply;
   });return json(res,200,out);
  }
  if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'Method unavailable.'});
  const relative=p==='/'?'index.html':p.slice(1);
  if(!/^[\w.-]+$/.test(relative)||!mime[path.extname(relative)])return json(res,404,{error:'Not found.'});
  let bytes;try{bytes=await readFile(path.join(dist,relative));}catch{return json(res,404,{error:'Not found.'});}
  res.writeHead(200,{'Content-Type':mime[path.extname(relative)],'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:bytes);
 }catch(err){const status=Number(err.status)||500;return json(res,status,{error:status<500?err.message:'Event server unavailable.'});}
});
server.on('error',async err=>{await cleanup();throw err;});
server.listen(port,bind,()=>{
 const n=server.address().port,ips=Object.values(networkInterfaces()).flat().filter(x=>x&&!x.internal&&net.isIPv4(x.address)).map(x=>x.address);
 console.log('Fan and scoreboard (same Wi-Fi): '+(ips.length?ips.map(ip=>'http://'+ip+':'+n+'/#screen').join(' or '):'http://127.0.0.1:'+n+'/#screen'));
 console.log('Operator console: http://127.0.0.1:'+n+'/#host');
 if(!process.env.ARENA_HOST_KEY)console.log('Private operator key (do not project): '+key);
 console.log('Keep this process running. Host actions are accepted only on the host computer.');
});
