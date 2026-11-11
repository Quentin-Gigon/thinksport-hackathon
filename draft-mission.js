import {watchNote} from './scout-handoff.js';
import {SKATERS,skater,draftResult,bestDraft,periodPoints} from './match-engine.js';
import {draftStory} from './ice-stories.js';
import {shareCardButton} from './scout-share.js';

export const FOCUS = {
  blocks:{label:'Blocks', unit:'blocks', stat:'shots blocked', cue:'When a shooter winds up, look between the puck and the net. Does your player close that lane?', story:'A blocked attempt never reaches the goalie. It doesn’t tell us whether it would have gone in.', step:1},
  passes:{label:'Passes', unit:'passes', stat:'completed passes', cue:'Follow your player just before a teammate receives the puck. Did their pass give the receiver space to move?', story:'A completed pass keeps possession. Its destination tells you more about its value than the count alone.', step:2},
  distance:{label:'Distance', unit:'m', stat:'metres skated', cue:'When the puck changes teams, keep your eyes on your jersey. Notice the long trip back to cover an opponent.', story:'Distance includes the work away from the puck. More metres can also mean more ice time.', step:3}
};
export const COACH='breakout-46';
const isCoach=s=>s.challenge===COACH;
const cap=s=>isCoach(s)?46:50;
export function eligibleLine(ids,challenge){const r=draftResult(ids);return r.valid&&(challenge!==COACH||(r.cost<=46&&r.selected.some(p=>p.role==='Forward')));}
export function benchmark(challenge){
 if(challenge!==COACH)return bestDraft().points;
 let max=0;for(let i=0;i<SKATERS.length-2;i++)for(let j=i+1;j<SKATERS.length-1;j++)for(let k=j+1;k<SKATERS.length;k++){
  const ids=[SKATERS[i].id,SKATERS[j].id,SKATERS[k].id];if(eligibleLine(ids,COACH))max=Math.max(max,draftResult(ids).points);
 }return max;
}
export function validCall(ids,call){return !!(call&&ids.includes(call.player)&&Object.hasOwn(FOCUS,call.key));}
export function scoutVerdict(ids,call,step){
  if(!validCall(ids,call)||step<FOCUS[call.key].step)return null;
  const ranks=draftResult(ids).selected.map(p=>({id:p.id,name:p.name,n:p.p2[call.key]})).sort((a,b)=>b.n-a.n);
  const top=ranks[0].n,leaders=ranks.filter(row=>row.n===top),mine=ranks.find(row=>row.id===call.player);
  return {hit:mine.n===top,shared:leaders.length>1,leaders,mine,ranks};
}
export function restoreDraft(saved){
  if(!saved||!Array.isArray(saved.ids)||saved.ids.length!==3||!eligibleLine(saved.ids,saved.challenge)||(saved.challenge!=null&&saved.challenge!==COACH)||(saved.challenge===COACH&&(!validCall(saved.ids,saved.call)||saved.call.key!=='passes'))||!Number.isInteger(saved.step)||saved.step<0||saved.step>3)return null;
  return {...(saved.challenge===COACH?{challenge:COACH}:{}),ids:[...saved.ids],step:saved.step,stage:'locked',call:validCall(saved.ids,saved.call)?{player:saved.call.player,key:saved.call.key}:null};
}
const surname=p=>p.name.split(' ').at(-1);
const num=n=>n.toLocaleString('en-GB');
const uppercaseNote=t=>`<div class="dm-eyebrow">${t}</div>`;
const shirtNumber=p=>`<span aria-hidden="true" class="dm-num ${p.team==='COL'?'red':''}">${p.number}</span>`;
const metricAt=step=>Object.keys(FOCUS).find(k=>FOCUS[k].step===step);
const statPoints=(p,step)=> (step>=1?p.p2.blocks*10:0)+(step>=2?p.p2.passes:0)+(step>=3?Math.floor(p.p2.distance/100):0);
function dock(s,r){return `<div class="dm-dock"><div class="dm-lockline"><span><b>${r.selected.length}/3</b> skaters</span><span><b>${cap(s)-r.cost}</b> credits left</span></div><div class="dm-slots">${[0,1,2].map((_,i)=>r.selected[i]?`<button type="button" data-drop="${r.selected[i].id}" aria-label="Remove ${r.selected[i].name} from line">#${r.selected[i].number} ${surname(r.selected[i])} ×</button>`:'<span>Open spot</span>').join('')}</div><p class="dm-msg" role="status">${s.message||(isCoach(s)&&r.selected.length===3&&!r.selected.some(p=>p.role==='Forward')?'Swap in one forward to complete the line.':'')}</p><button class="primary wide" id="draft-scout" ${eligibleLine(s.ids,s.challenge)?'':'disabled'}>Choose my player to watch →</button></div>`;}
function setup(s,r){
 return `${uppercaseNote('01 / 02 · BUILD YOUR LINE')}<h3 class="big-question">Pick your <em>three.</em></h3><p class="dm-lede">${isCoach(s)?'Coach challenge: spend at most 46 credits and include a forward. Use what you learned to build the highest-scoring line and call its passing leader.':'Spend up to 50 credits. Only the next period scores.'}</p><ot-shift-scout></ot-shift-scout><div class="draft-rule dm-rules"><span><b>10</b> pts per block</span><span><b>1</b> per pass</span><span><b>1</b> per full 100 m</span></div>${watchNote()}<div class="dm-roster">${SKATERS.map(p=>{const picked=s.ids.includes(p.id);return `<button type="button" data-draft="${p.id}" aria-pressed="${picked}" class="dm-player ${picked?'is-picked':''}">${shirtNumber(p)}<span><b>${p.name}</b><small>${p.team} · ${p.role}</small></span><strong>${p.price} cr</strong><i aria-hidden="true">${picked?'✓':'+'}</i></button>`;}).join('')}</div>${dock(s,r)}`;}
function callForm(s,r){
 const focus=s.focusKey&&FOCUS[s.focusKey];return `${uppercaseNote(isCoach(s)?'COACH CHALLENGE · PASSING LEADER':'02 / 02 · YOUR SCOUTING CALL')}<h3 class="big-question">Who will <em>lead your line?</em></h3><p class="dm-lede">${isCoach(s)?'The coach wants to move the puck out of pressure. Pick your leader in completed passes.':'Choose a stat and a skater.'} If they lead your three in period two, you earn a scout badge. Ties count. Your lineup points stay the same.</p>${isCoach(s)?'':`<fieldset class="dm-controls"><legend>1. Pick a stat</legend><div class="dm-metrics">${Object.entries(FOCUS).map(([key,f])=>`<button type="button" data-focus="${key}" aria-pressed="${key===s.focusKey}">${f.label}</button>`).join('')}</div></fieldset>`}<fieldset class="dm-controls"><legend>${isCoach(s)?'':'2. '}Pick your leader${focus?' for '+focus.stat:''}</legend><div class="dm-stars">${r.selected.map(p=>`<button class="dm-player" type="button" data-star="${p.id}" aria-pressed="${p.id===s.starId}">${shirtNumber(p)}<span><b>${p.name}</b><small>${p.team} · ${p.role}</small></span><i aria-hidden="true">${p.id===s.starId?'✓':'○'}</i></button>`).join('')}</div></fieldset><div class="dm-callbar"><button class="secondary" id="draft-edit">Edit line</button><button class="primary" id="lock-draft" ${focus&&s.starId?'':'disabled'}>Lock line & call →</button></div>`;}
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
 const v=scoutVerdict(s.ids,s.call,3),mvp=r.selected.reduce((best,p)=>periodPoints(p.p2)>periodPoints(best.p2)?p:best),max=benchmark(s.challenge);
 const lines=[`Line: ${r.selected.map(p=>'#'+p.number).join(' · ')} • ${r.cost}/${cap(s)} credits`,`Top contributor: ${mvp.name} · ${periodPoints(mvp.p2)} pts`];if(v)lines.push(`${v.hit?'Scout badge earned':'My scout call'}: #${skater(s.call.player).number} · ${num(v.mine.n)} ${FOCUS[s.call.key].unit}`);
 onComplete({game:'draft',score:r.points});return `<div class="broadcast draft">${wrapper('draft','Your period-two scouting report.',r.points,`<section class="ice-stage dm-final">${uppercaseNote('FINAL HORN · YOUR SCOUT REPORT')}<h3 class="big-question">Your three <em>made ${r.points}.</em></h3><p class="dm-lede">#${mvp.number} ${mvp.name} brought in ${periodPoints(mvp.p2)} of your points: ${mvp.p2.blocks} blocks, ${mvp.p2.passes} passes and ${num(mvp.p2.distance)} metres.</p>${verdictCard(s,3)}${shareCardButton({game:'Next-Period Draft',score:r.points,headline:isCoach(s)?'Coach challenge · breakout line':'My next-period line',lines,route:'draft'})}<section class="dm-rematch">${uppercaseNote('COACH CHALLENGE · OPTIONAL REMATCH')}<h4>Build a breakout line.</h4><p>Same period, new puzzle: 46 credits, at least one forward. Who will lead your line in completed passes?</p><button class="primary" id="draft-coach">${isCoach(s)?'Retry the coach challenge':'Take the coach challenge'} →</button></section></section>${finish('Line on the board.',r.points+' PTS',`${isCoach(s)?'Best line with a forward and 46 credits':'Best line within 50 credits'}: ${max} points. Only the fictional second period counted.`)}`)}</div>`;}
export function drawDraft(s,{shell,finish,wrapper,onComplete}){
 const r=draftResult(s.ids);if(s.stage==='done')return finalCard(s,r,finish,wrapper,onComplete);
 s.points=s.stage==='locked'?r.selected.reduce((n,p)=>n+statPoints(p,s.step),0):0;
 const content=s.stage==='setup'?setup(s,r):s.stage==='call'?callForm(s,r):live(s,r);
 return shell('Draft three skaters. Call your leader. Follow them next period.',`<section class="ice-stage dm-stage">${content}</section>`,s.stage!=='locked'?'FIRST BREAK':s.step===3?'PERIOD 2 FINAL':'PERIOD 2 SIM');
}
export function bindDraft(s,{root,redraw,saveLine,clearLine,chime,onRestart=()=>{}}){
 const bind=(selector,fn)=>root.querySelectorAll(selector).forEach(b=>b.onclick=()=>fn(b));
 const choose=(selector)=>{redraw();root.querySelector(selector)?.focus({preventScroll:true});};
 const go=()=>{redraw();const heading=root.querySelector('.dm-stage .big-question,.dm-final .big-question');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});heading.scrollIntoView({block:'start',behavior:'instant'});}};
 bind('#draft-coach',()=>{if(s.stage!=='done')return;onRestart();Object.assign(s,{ids:[],call:null,focusKey:'passes',starId:null,stage:'setup',step:0,points:0,message:'',challenge:COACH});go();});
 const toggle=(id)=>{if(s.stage!=='setup')return;if(s.ids.includes(id)){s.ids=s.ids.filter(x=>x!==id);if(s.starId===id)s.starId=null;s.message='';}else if(s.ids.length>=3)s.message='Your line is full. Remove a skater to swap.';else if(draftResult([...s.ids,id]).cost>cap(s))s.message=`Over ${cap(s)} credits. Swap a skater or pick a cheaper one.`;else{s.ids.push(id);s.message='';}choose(`[data-draft="${id}"]`);};
 bind('[data-draft]',b=>toggle(b.dataset.draft));bind('[data-drop]',b=>toggle(b.dataset.drop));
 bind('#draft-scout',()=>{if(!eligibleLine(s.ids,s.challenge))return;s.stage='call';go();});
 bind('[data-focus]',b=>{s.focusKey=b.dataset.focus;choose(`[data-focus="${s.focusKey}"]`);});
 bind('[data-star]',b=>{s.starId=b.dataset.star;choose(`[data-star="${s.starId}"]`);});
 bind('#draft-edit',()=>{s.stage='setup';go();});
 bind('#lock-draft',()=>{const call={key:s.focusKey,player:s.starId};if(s.stage!=='call'||!eligibleLine(s.ids,s.challenge)||!validCall(s.ids,call)||(isCoach(s)&&call.key!=='passes'))return;s.call=call;s.stage='locked';saveLine(s);chime([392,523,659]);go();});
 bind('#draft-step',()=>{if(s.stage!=='locked')return;if(s.step<3){s.step++;saveLine(s);}else{s.stage='done';clearLine();}chime([392,494,659]);go();});
}
