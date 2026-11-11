import QRCode from './arena-qr-vendor.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=n=>Math.max(0,Math.floor(Number(n)||0)).toLocaleString('en-GB');
const rules={
 lobby:['BEFORE THE FIRST HORN','The ice is yours.','Join the game now. The first five calls open at the break.'],
 break1:['FIRST INTERMISSION','Read the ice.','Who did more in period one? Scan. Pick a jersey. Lock five calls.'],
 leaders1:['PERIOD ONE · CLOSED','First-break leaders','Your score carries into the next break. Return on the same phone.'],
 break2:['SECOND INTERMISSION','Back for five.','Scan again on the same phone. Five new calls. Your points add up.'],
 leaders2:['PERIOD TWO · CLOSED','Two-break leaders','Both rounds are closed. The prize draw is at the final horn.'],
 final:['FINAL HORN','Final standings','Two breaks. Ten calls. Here’s how the arena finished.']
};

export function makeQrMatrix(url){
 const q=QRCode(0,'M');q.addData(new URL(url).href,'Byte');q.make();
 const n=q.getModuleCount();return Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>q.isDark(r,c)));
}
export function generateQrSvg(url) {
 const matrix=makeQrMatrix(url),side=matrix.length+8;
 let path='';for(let y=0;y<matrix.length;y++)for(let x=0;x<matrix.length;x++)if(matrix[y][x])path+='M'+(x+4)+' '+(y+4)+'h1v1h-1z';
 return '<svg class="as-qr" shape-rendering="crispEdges" viewBox="0 0 '+side+' '+side+'" role="img" aria-label="Scan this QR code to open Head-to-Head"><rect width="'+side+'" height="'+side+'" fill="white"/><path d="'+path+'" fill="black"/></svg>';
}
function next(stage){
 return ({lobby:'Five calls at each break',break1:'Next: period-one leaders',leaders1:'Next: second intermission',break2:'Next: combined standings',leaders2:'Next: final-horn draw',final:'Thank you for playing'})[stage]||'';
}
function ranking(s){
 const rows=Array.isArray(s.leaders)?s.leaders.slice(0,5):[];
 const title=s.stage==='leaders1'||s.stage==='break2'?'Period-one standings':'Combined standings';
 return `<section class="as-board" aria-label="${title}"><div class="as-board-header"><strong>${title}${s.leaders?.length>5?' · Top 5 shown':''}</strong><span>PTS</span></div>${rows.length?`<ol>${rows.map((r,i)=>`<li class="${r.rank===1?'as-top':''}"><span class="as-rank">${String(r.rank||i+1).padStart(2,'0')}</span><span class="as-alias">${esc(r.alias)}</span><b>${number(r.score)}</b></li>`).join('')}</ol>`:'<p class="as-empty">No scores on the board yet.</p>'}</section>`;
}
export function screenMarkup(s,client,qr){
 const stage=Object.hasOwn(rules,s.stage)?s.stage:'lobby', [kicker,heading,subtitle]=rules[stage];
 const playing=['break1','break2'].includes(stage), standings=['leaders1','leaders2','final'].includes(stage);
 const final=stage==='final',draw=final&&s.draw, joined=number(s.joined);
 const prize=client.prizeLabel?esc(client.prizeLabel):'Prize draw winner';
 const art='<div class="as-rink" aria-hidden="true"><i></i><i></i><i></i><b></b></div>';
 const title=playing||stage==='lobby'?'Head<span>to</span>Head':draw?'Final horn':heading;
 const live=client.mode==='live', pre=stage==='lobby'||playing, demoLabel=live?'SHARED ARENA':'SAME-BROWSER REHEARSAL';
 const qrPanel=`<aside class="as-scan"><div class="as-qr-wrap">${qr}</div><strong>${stage==='break2'?'Scan to return':'Scan to play'}</strong><a class="as-open" href="${esc(client.joinUrl)}">Open on this device ↗</a></aside>`;
 return `<div class="as-topbar"><strong><i></i> OVERTIME <span>/ ARENA</span></strong><span>${demoLabel}</span></div>
 <div class="as-body as-${stage}"><div class="as-hero">${art}<p class="as-kicker"><i></i>${kicker}</p><h1>${title}</h1>
 ${draw?`<div class="as-draw"><span>${prize}</span><strong>${esc(s.draw.alias)}</strong><small>${number(s.draw.score)} points · Random draw from ${number(s.eligible)} eligible ${s.eligible===1?'leader':'leaders'}</small></div>`:`<p class="as-deck">${esc(pre?subtitle:final?(s.eligible?'The leaders are in. Stand by for the prize draw.':'No eligible finisher completed both breaks. No prize draw.'):subtitle)}</p>`}
 ${stage==='leaders2'?`<p class="as-draw-line">${s.eligible?number(s.eligible)+' eligible for the final draw':'No eligible two-break finishers'}</p>`:''}
 ${pre?`<div class="as-stats"><span><b>${stage==='break2'?'02':'01'}</b>BREAK</span><span><b>05</b>CALLS</span><span><b>${joined}</b>JOINED</span></div>`:''}
 </div>${pre?qrPanel:ranking(s)}${stage==='break2'&&s.leaders?.length?`<div class="as-carry"><span>LEADS AFTER P1</span><b>${esc(s.leaders[0].alias)}</b> · ${number(s.leaders[0].score)} PTS${s.leaders.filter(r=>r.rank===1).length>1?' · TIED':''}</div>`:''}</div>
 <div class="as-bottom"><span>● &nbsp;${esc(next(stage))}</span><span>${live?'FICTIONAL MATCH DATA':'Other phones open separate demos; scores here are from this browser.'}</span></div>`;
}

export function mountScreen(root,client){
 root.innerHTML='<section class="arena-display" aria-label="Head-to-Head arena scoreboard"><div class="as-controls"><a href="#play">Fan view</a><button type="button" class="as-full">Full screen</button></div><div class="as-feed" role="status"></div><div class="as-content"><p class="as-empty">Connecting to the scoreboard…</p></div></section>';
 const display=root.querySelector('.arena-display'),out=root.querySelector('.as-content'),feed=root.querySelector('.as-feed'),full=root.querySelector('.as-full');
 let alive=true,timer,last='',current=null,seq=0,qr='';
 try{qr=generateQrSvg(client.joinUrl);}catch{qr='<span class="as-missing">QR unavailable. Open the fan link below.</span>';}
 const setFull=()=>{full.textContent=document.fullscreenElement?'Exit full screen':'Full screen';};
 full.hidden=!display.requestFullscreen;
 full.onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await display.requestFullscreen();}catch{feed.textContent='Full screen is unavailable in this browser.';}};
 document.addEventListener('fullscreenchange',setFull);
 async function poll(){
   clearTimeout(timer);const n=++seq;
   try{
     const state=await client.call('status',{});if(!alive||n!==seq)return;
     current=state;const html=screenMarkup(state,client,qr);if(last!==html){out.innerHTML=html;last=html;}
     feed.textContent='';
   }catch{if(!alive||n!==seq)return;feed.textContent=current?'Connection lost · Showing last confirmed standings. Reconnecting…':'Scoreboard unavailable · Reconnecting…';}
   if(alive&&n===seq)timer=setTimeout(poll,document.hidden?10000:2500);
 }
 const wake=()=>{if(!document.hidden)poll();};window.addEventListener('online',wake);document.addEventListener('visibilitychange',wake);
 poll();
 return ()=>{alive=false;seq++;clearTimeout(timer);document.removeEventListener('fullscreenchange',setFull);document.removeEventListener('visibilitychange',wake);window.removeEventListener('online',wake);};
}
