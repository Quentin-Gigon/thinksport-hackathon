import {createClient} from './arena-client.js';
import {mountFan} from './arena-fan.js';
import {mountScreen} from './arena-screen.js';
import {mountHost} from './arena-host.js';
const root=document.getElementById('arena-root');let client,cleanup;
function route(){
 cleanup?.();cleanup=null;root.replaceChildren();window.scrollTo(0,0);
 const view=location.hash==='#screen'?'screen':location.hash==='#host'?'host':'play';
 root.dataset.view=view;document.title=({screen:'Arena scoreboard',host:'Event controls',play:'Head-to-Head'})[view]+' · Overtime';
 // Scoreboard must never carry the fan ticket of the operator.
 cleanup=view==='screen'?mountScreen(root,{mode:client.mode,joinUrl:client.joinUrl,prizeLabel:client.prizeLabel,call:()=>client.publicStatus()}):view==='host'?mountHost(root,client):mountFan(root,client);
}
async function boot(){try{client=await createClient(new URL('./',location.href));route();window.addEventListener('hashchange',route);}catch{root.innerHTML='<main class="arena-boot"><b>OT / ARENA</b><h1>Connection break.</h1><p>Reconnect to the arena and try again.</p><button id="retry">Try again</button></main>';root.querySelector('#retry').onclick=()=>location.reload();}}
boot();
