// Opt in on Wi-Fi before heading to the arena. Only public app files are packed.
export function setupOffline(){
  const btn=document.querySelector('#pack-games'),msg=document.querySelector('#pack-status');
  if(!('serviceWorker' in navigator)||!window.isSecureContext){btn.hidden=true;msg.textContent='Offline packs are unavailable in this browser.';return;}
  const ready=()=>{btn.disabled=true;btn.textContent='Games saved on this device ✓';msg.textContent='Reopen this same address to play the fictional match offline.';};
  navigator.serviceWorker.getRegistration('./').then(reg=>{if(reg?.active?.scriptURL===new URL('arena-worker.js',document.baseURI).href)ready();}).catch(()=>{});
  btn.onclick=async()=>{
    btn.disabled=true;msg.textContent='Saving the rink, jerseys and demo match…';
    try{
      const reg=await navigator.serviceWorker.register('./arena-worker.js',{scope:'./',updateViaCache:'none'});
      const worker=reg.installing||reg.waiting||reg.active;
      if(!worker)throw Error();
      if(worker.state!=='activated'){
        await new Promise((yes,no)=>{
          const check=()=>{if(worker.state==='activated'||worker.state==='redundant'){worker.removeEventListener('statechange',check);worker.state==='activated'?yes():no();}};
          worker.addEventListener('statechange',check);check();
        });
      }ready();
    }catch{btn.disabled=false;msg.textContent='Couldn’t save all the files. Reconnect and try again.';}
  };
}
