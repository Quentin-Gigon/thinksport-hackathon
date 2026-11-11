import {watchNote} from './scout-handoff.js';
import {SKATERS,skater,draftResult,bestDraft,periodPoints} from './match-engine.js';
import {draftStory} from './ice-stories.js';
import {shareCardButton} from './scout-share.js';

export const FOCUS = {
  blocks:{label:'Blocks', unit:'blocks', stat:'shots blocked', cue:'When a shooter winds up, look between the puck and the net. Does your player close that lane?', story:'A blocked attempt never reaches the goalie. It doesn’t tell us whether it would have gone in.', step:1},
  passes:{label:'Passes', unit:'passes', stat:'completed passes', cue:'Follow your player just before a teammate receives the puck. Did their pass give the receiver space to move?', story:'A completed pass keeps possession. Its destination tells you more about its value than the count alone.', step:2},
  distance:{label:'Distance', unit:'m', stat:'metres skated', cue:'When the puck changes teams, keep your eyes on your jersey. Notice the long trip back to cover an opponent.', story:'Distance includes the work away from the puck. More metres can also mean more ice time.', step:3}
};
export function validCall(ids,call){return !!(call&&ids.includes(call.player)&&Object.hasOwn(FOCUS,call.key));}
export function scoutVerdict(ids,call,step){
  if(!validCall(ids,call)||step<FOCUS[call.key].step)return null;
  const ranks=draftResult(ids).selected.map(p=>({id:p.id,name:p.name,n:p.p2[call.key]})).sort((a,b)=>b.n-a.n);
  const top=ranks[0].n,leaders=ranks.filter(row=>row.n===top),mine=ranks.find(row=>row.id===call.player);
  return {hit:mine.n===top,shared:leaders.length>1,leaders,mine,ranks};
}
export function restoreDraft(saved){
  if(!saved||!Array.isArray(saved.ids)||saved.ids.length!==3||!draftResult(saved.ids).valid||!Number.isInteger(saved.step)||saved.step<0||saved.step>3)return null;
  return {ids:[...saved.ids],step:saved.step,stage:'locked',call:validCall(saved.ids,saved.call)?{player:saved.call.player,key:saved.call.key}:null};
}
const surname=p=>p.name.split(' ').at(-1);
const num=n=>n.toLocaleString('en-GB');
const uppercaseNote=t=>`<div class="dm-eyebrow">${t}</div>`;
const shirtNumber=p=>`<span aria-hidden="true" class="dm-num ${p.team==='COL'?'red':''}">${p.number}</span>`;
const metricAt=step=>Object.keys(FOCUS).find(k=>FOCUS[k].step===step);
const statPoints=(p,step)=> (step>=1?p.p2.blocks*10:0)+(step>=2?p.p2.passes:0)+(step>=3?Math.floor(p.p2.distance/100):0);
function dock(s,r){return `<div class="dm-dock"><div class="dm-lockline"><span><b>${r.selected.length}/3</b> skaters</span><span><b>${50-r.cost}</b> credits left</span></div><div class="dm-slots">${[0,1,2].map((_,i)=>r.selected[i]?`<button type="button" data-drop="${r.selected[i].id}" aria-label="Remove ${r.selected[i].name} from line">#${r.selected[i].number} ${surname(r.selected[i])} ×</button>`:'<span>Open spot</span>').join('')}</div><p class="dm-msg" role="status">${s.message||''}</p><button class="primary wide" id="draft-scout" ${r.valid?'':'disabled'}>Choose my player to watch →</button></div>`;}
function setup(s,r){
 return `${uppercaseNote('01 / 02 · BUILD YOUR LINE')}<h3 class="big-question">Pick your <em>three.</em></h3><p class="dm-lede">Spend up to 50 credits. Only the next period scores.</p><ot-shift-scout></ot-shift-scout><div class="draft-rule dm-rules"><span><b>10</b> pts per block</span><span><b>1</b> per pass</span><span><b>1</b> per full 100 m</span></div>${watchNote()}<div class="dm-roster">${SKATERS.map(p=>{const picked=s.ids.includes(p.id);return `<button type="button" data-draft="${p.id}" aria-pressed="${picked}" class="dm-player ${picked?'is-picked':''}">${shirtNumber(p)}<span><b>${p.name}</b><small>${p.team} · ${p.role}</small></span><strong>${p.price} cr</strong><i aria-hidden="true">${picked?'✓':'+'}</i></button>`;}).join('')}</div>${dock(s,r)}`;}
function callForm(s,r){
 const focus=s.focusKey&&FOCUS[s.focusKey];return `${uppercaseNote('02 / 02 · YOUR SCOUTING CALL')}<h3 class="big-question">Who will <em>lead your line?</em></h3><p class="dm-lede">Choose a stat and a skater. If they lead your three in period two, you earn a scout badge. Ties count. Your lineup points stay the same.</p><fieldset class="dm-controls"><legend>1. Pick a stat</legend><div class="dm-metrics">${Object.entries(FOCUS).map(([key,f])=>`<button type="button" data-focus="${key}" aria-pressed="${key===s.focusKey}">${f.label}</button>`).join('')}</div></fieldset><fieldset class="dm-controls"><legend>2. Pick your leader${focus?' for '+focus.stat:''}</legend><div class="dm-stars">${r.selected.map(p=>`<button class="dm-player" type="button" data-star="${p.id}" aria-pressed="${p.id===s.starId}">${shirtNumber(p)}<span><b>${p.name}</b><small>${p.team} · ${p.role}</small></span><i aria-hidden="true">${p.id===s.starId?'✓':'○'}</i></button>`).join('')}</div></fieldset><div class="dm-callbar"><button class="secondary" id="draft-edit">Edit line</button><button class="primary" id="lock-draft" ${focus&&s.starId?'':'disabled'}>Lock line & call →</button></div>`;}
function verdictCard(s,stage){
 const v=scoutVerdict(s.ids,s.call,stage),call=s.call;if(!call)return '';
 const f=FOCUS[call.key],p=skater(call.player);
 if(!v)return `<section class="dm-pass"><div>${uppercaseNote('SCOUT PASS · YOUR PREDICTION')}<h4>#${p.number} ${surname(p)} to lead in ${f.stat}</h4><p>${f.cue}</p></div></section>`;
 return `<section class="dm-pass ${v.hit?'hit':''}">${uppercaseNote(v.hit?'✦ SCOUT BADGE EARNED':'YOUR CALL · SETTLED')}<h4>${v.hit?(v.shared?'Joint leader. Good eyes!':surname(p)+' led your line.'):'A different jersey led.'}</h4><p>Your pick: <b>${p.name}</b> · ${num(v.mine.n)} ${f.unit}. ${v.hit?'':`${v.leaders.map(l=>l.name).join(' and ')} led with ${num(v.leaders[0].n)}.`}</p><div class="dm-rank">${v.ranks.map(row=>`<div><span>${surname(skater(row.id))}</span><i><b style="width:${row.n/Math.max(1,v.leaders[0].n)*100}%"></b></i><strong>${num(row.n)}</strong></div>`).join('')}</div><p>${f.story}</p></section>`;}
function live(s,r){
 const settled=s.step===3,key=metricAt(s.step),focusNow=s.call?.key===key;
 return `${uppercaseNote('EXHIBITION · PERIOD 2 · LINE LOCKED')}<h3 class="big-question">${s.step===0?'Eyes on <em>your line.</em>':settled?'The final <em>numbers.</em>':s.step===1?'Who got in <em>the way?</em>':'Who kept the <em>puck moving?</em>'}</h3><div class="period-timeline">${['Locked','Blocks','Passing','Distance'].map((x,i)=>`<span class="${s.step>=i?'active':''}">${x}</span>`).join('')}</div>
 ${!s.step||focusNow?verdictCard(s,s.step):''}
 ${s.step&&!focusNow?draftStory(s.step,r.selected):''}
 <section class="dm-line"><div class="dm-linehead"><span>Your line</span><span>${s.step===0?'Ready':key==='distance'?'Metres':key==='blocks'?'Blocks':'Passes'}</span><span>Total pts</span></div>${r.selected.map(p=>`<div class="dm-linerow"><strong>#${p.number} ${surname(p)}</strong><span>${s.step===0?'—':num(p.p2[key])}</span><b>${statPoints(p,s.step)}</b></div>`).join('')}</section>
 <div class="dm-callbar"><div><small>${settled?'FULL PERIOD':'DEMO · STEP '+s.step+' OF 3'}</small><strong>${s.points} line pts</strong></div><button id="draft-step" class="primary">${['Reveal blocks','Reveal passes','Reveal distance','See my scout report'][s.step]} →</button></div>`;}
function finalCard(s,r,finish,wrapper,onComplete){
 const v=scoutVerdict(s.ids,s.call,3),mvp=r.selected.reduce((best,p)=>periodPoints(p.p2)>periodPoints(best.p2)?p:best),max=bestDraft().points;
 const lines=[`Line: ${r.selected.map(p=>'#'+p.number).join(' · ')} • ${r.cost}/50 credits`,`Top contributor: ${mvp.name} · ${periodPoints(mvp.p2)} pts`];if(v)lines.push(`${v.hit?'Scout badge earned':'My scout call'}: #${skater(s.call.player).number} · ${num(v.mine.n)} ${FOCUS[s.call.key].unit}`);
 onComplete({game:'draft',score:r.points});return `<div class="broadcast draft">${wrapper('draft','Your period-two scouting report.',r.points,`<section class="ice-stage dm-final">${uppercaseNote('FINAL HORN · YOUR SCOUT REPORT')}<h3 class="big-question">Your three <em>made ${r.points}.</em></h3><p class="dm-lede">#${mvp.number} ${mvp.name} brought in ${periodPoints(mvp.p2)} of your points: ${mvp.p2.blocks} blocks, ${mvp.p2.passes} passes and ${num(mvp.p2.distance)} metres.</p>${verdictCard(s,3)}${shareCardButton({game:'Next-Period Draft',score:r.points,headline:'My next-period line',lines,route:'draft'})}</section>${finish('Line on the board.',r.points+' PTS',`Best possible line under 50 credits: ${max} points. Only the fictional second period counted.`)}`)}</div>`;}
export function drawDraft(s,{shell,finish,wrapper,onComplete}){
 const r=draftResult(s.ids);if(s.stage==='done')return finalCard(s,r,finish,wrapper,onComplete);
 s.points=s.stage==='locked'?r.selected.reduce((n,p)=>n+statPoints(p,s.step),0):0;
 const content=s.stage==='setup'?setup(s,r):s.stage==='call'?callForm(s,r):live(s,r);
 return shell('Draft three skaters. Call your leader. Follow them next period.',`<section class="ice-stage dm-stage">${content}</section>`,s.stage!=='locked'?'FIRST BREAK':s.step===3?'PERIOD 2 FINAL':'PERIOD 2 SIM');
}
export function bindDraft(s,{root,redraw,saveLine,clearLine,chime}){
 const bind=(selector,fn)=>root.querySelectorAll(selector).forEach(b=>b.onclick=()=>fn(b));
 const choose=(selector)=>{redraw();root.querySelector(selector)?.focus({preventScroll:true});};
 const go=()=>{redraw();const heading=root.querySelector('.dm-stage .big-question,.dm-final .big-question');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});heading.scrollIntoView({block:'start',behavior:'instant'});}};
 const toggle=(id)=>{if(s.stage!=='setup')return;if(s.ids.includes(id)){s.ids=s.ids.filter(x=>x!==id);if(s.starId===id)s.starId=null;s.message='';}else if(s.ids.length>=3)s.message='Your line is full. Remove a skater to swap.';else if(draftResult([...s.ids,id]).cost>50)s.message='Over 50 credits. Swap a skater or pick a cheaper one.';else{s.ids.push(id);s.message='';}choose(`[data-draft="${id}"]`);};
 bind('[data-draft]',b=>toggle(b.dataset.draft));bind('[data-drop]',b=>toggle(b.dataset.drop));
 bind('#draft-scout',()=>{if(!draftResult(s.ids).valid)return;s.stage='call';go();});
 bind('[data-focus]',b=>{s.focusKey=b.dataset.focus;choose(`[data-focus="${s.focusKey}"]`);});
 bind('[data-star]',b=>{s.starId=b.dataset.star;choose(`[data-star="${s.starId}"]`);});
 bind('#draft-edit',()=>{s.stage='setup';go();});
 bind('#lock-draft',()=>{const call={key:s.focusKey,player:s.starId};if(s.stage!=='call'||!draftResult(s.ids).valid||!validCall(s.ids,call))return;s.call=call;s.stage='locked';saveLine(s);chime([392,523,659]);go();});
 bind('#draft-step',()=>{if(s.stage!=='locked')return;if(s.step<3){s.step++;saveLine(s);}else{s.stage='done';clearLine();}chime([392,494,659]);go();});
}
