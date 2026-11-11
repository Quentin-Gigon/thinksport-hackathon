const reply=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function handleArenaRequest(request,env){
  const url=new URL(request.url),id=env.ARENA_EVENT_ID||'exhibition-001';
  if(url.pathname.endsWith('/arena-config.json'))return reply({mode:'live',eventId:id,...(env.ARENA_PRIZE_LABEL?{prizeLabel:env.ARENA_PRIZE_LABEL}:{}),...(env.ARENA_FIXTURE_LABEL?{fixtureLabel:env.ARENA_FIXTURE_LABEL}:{})});
  if(!url.pathname.endsWith('/api/arena'))return env.ASSETS.fetch(request);
  if(request.method!=='POST')return reply({error:'Use POST.'},405);
  if(request.headers.get('Origin')&&request.headers.get('Origin')!==url.origin)return reply({error:'Open the arena site to play.'},403);
  if(!(request.headers.get('Content-Type')||'').toLowerCase().includes('application/json'))return reply({error:'Expected JSON.'},415);
  const operator=!!env.ARENA_ADMIN_SECRET&&request.headers.get('Authorization')==='Bearer '+env.ARENA_ADMIN_SECRET;
  const limit=operator?65536:4096;
  if(Number(request.headers.get('Content-Length'))>limit)return reply({error:'Request is too large.'},413);
  let body;try{const raw=await request.text();if(new TextEncoder().encode(raw).byteLength>limit)return reply({error:'Request is too large.'},413);body=JSON.parse(raw);}catch{return reply({error:'Invalid JSON.'},400);}
  if(!body||typeof body!=='object'||Array.isArray(body))return reply({error:'Expected an action.'},400);
  if(['advance','draw','verifyClaim','loadPeriod'].includes(body.action)&&!operator)return reply({error:'Host sign-in required.'},403);
  const stub=env.EVENTS.get(env.EVENTS.idFromName(id));
  return stub.fetch('https://state.internal/',{method:'POST',body:JSON.stringify(body)});
}
