import {cardNumber,duelDeck} from './duel-decks.js';
import {shareCardButton} from './scout-share.js';
import {DUELS,METRICS,skater,winners} from './match-engine.js';
import {duelStory} from './ice-stories.js';

const watch={
  speed:'Watch the first strides after the puck comes loose. One short burst can decide who has the chance to attack.',
  distance:'Follow the far winger when possession changes. The work to get back into position counts, even without a touch.',
  blocks:'Keep an eye on the defender between the shooter and the net. A puck off their shin pad never reaches the goalie.',
  passes:'Look for the player offering an outlet along the boards. One short pass can get a teammate out of trouble.',
  toi:'At a line change, see who stays out. More ice time gives a skater more chances to contribute.'
};
const hint={
  speed:'Think about the quickest burst, even if it lasted only a few strides.',
  distance:'Picture the skater going end to end, shift after shift.',
  blocks:'Who got between the shooter and the net?',
  passes:'Think of the teammate who kept the puck moving.',
  toi:'Who kept coming back over the boards?'
};
const lastName=p=>p.name.split(' ').slice(-1)[0];
export function settleDuel(history,pick,armed,cardId=1){
  const q=duelDeck(cardId)[history.length];
  if(!q||!q.pair.includes(pick))return null;
  const winner=winners(q.pair,q.key)[0],correct=pick===winner,boosted=!!armed&&!history.some(h=>h.boosted);
  return {index:history.length,cardId,pair:[...q.pair],key:q.key,pick,winner,correct,boosted,points:correct?(boosted?200:100):0};
}
export function takeaway(history){
  return history.find(h=>h.boosted&&!h.correct)||history.find(h=>!h.correct)||history.find(h=>h.boosted)||history[0];
}
function progress(s){
  return `<div class="call-track" aria-label="Duel ${s.i+1} of ${DUELS.length}">${DUELS.map((_,i)=>{
    const h=s.history[i];return `<span aria-hidden="true" class="${h?(h.correct?'hit':'miss'):i===s.i?'current':''}">${h?(h.correct?'✓':'×'):String(i+1).padStart(2,'0')}</span>`;
  }).join('')}</div>`;
}
function scoreLine(key,n){
  if(key==='toi')return Math.floor(n/60)+':'+String(n%60).padStart(2,'0');
  return n.toLocaleString('en-GB',{maximumFractionDigits:1});
}
function reveal(s,q){
  const h=s.history[s.i],m=METRICS[h.key],top=skater(h.winner),p=q.pair.map(skater);
  const margin=Math.round(Math.abs(p[0].p1[h.key]-p[1].p1[h.key])*10)/10;
  const unit=q.key==='blocks'&&margin===1?'block':m.unit;
  const placed=h.boosted?'Power Play':'Your call';
  return `<section class="ice-stage scout-reveal" aria-labelledby="duel-heading">
    ${progress(s)}
    <p class="scout-kicker">${m.label} / FIRST PERIOD</p>
    <h3 class="big-question" id="duel-heading" tabindex="-1">${lastName(top)} by ${margin} ${unit}.</h3>
    <p class="call-verdict ${h.correct?'hit':'miss'}">${h.correct?'✓':'×'} ${placed}: ${lastName(skater(h.pick))} · ${h.correct?'Correct':'Missed'} · +${h.points} pts</p>
    <div class="stat-tape" aria-label="First-period values">${p.map(v=>`<div class="${v.id===h.winner?'leading':''}"><span>#${v.number} ${v.name}</span><b>${scoreLine(h.key,v.p1[h.key])} <small>${h.key==='toi'?'min:sec':m.unit}</small></b><i style="--v:${v.p1[h.key]/top.p1[h.key]*100}%" aria-hidden="true"></i></div>`).join('')}</div>
    ${duelStory(q.key,top,m.unit)}
    <button class="primary next-call" id="duel-next">${s.i===DUELS.length-1?'Get my scouting card':'Next duel'} →</button></section>`;
}
export function callScreen(s,playerButton){
  const q=duelDeck(s.cardId)[s.i];
  if(s.revealed)return reveal(s,q);
  const spent=s.history.find(h=>h.boosted);
  return `<section class="ice-stage scout-stage"><div class="call-label"><span>CALL ${String(s.i+1).padStart(2,'0')} / 05</span><span>CARD ${cardNumber(s.cardId||1)} · PERIOD 01</span></div>
    ${progress(s)}<h3 class="big-question" tabindex="-1" id="duel-heading">${q.q}</h3>
    <p class="scout-hint">${hint[q.key]}</p>
    <div class="duel-grid">${q.pair.map(pid=>playerButton(skater(pid),`data-duel="${pid}"`,s.pick===pid)).join('<span class="vs-badge" aria-hidden="true">VS</span>')}</div>
    ${spent?`<p class="spent-tag">Power Play used on call ${spent.index+1}.</p>`:`<button class="power-call" id="arm-power" aria-pressed="${!!s.armed}"><i aria-hidden="true">2×</i><span><strong>${s.armed?'Power Play on':'Use my Power Play'}</strong><small>Once in five calls. Correct = 200 instead of 100. Miss = 0.</small></span><b aria-hidden="true">${s.armed?'✓':'+'}</b></button>`}
    <button id="lock-duel" class="primary next-call" ${s.pick?'':'disabled'}>${s.pick?'Lock '+lastName(skater(s.pick))+' · '+(s.armed?200:100)+' pts if correct':'Pick a jersey first'} →</button>${s.i===0?'<ot-shift-scout></ot-shift-scout>':''}</section>`;
}
export function scoutCard(history){
  const lesson=takeaway(history),target=skater(lesson.winner),q=lesson,other=skater(q.pair.find(id=>id!==lesson.winner)),unit=lesson.key==='toi'?'min:sec':METRICS[lesson.key].unit;
  return `<section class="scout-card"><div class="call-label"><span>SCOUTING CARD</span><span>CARD ${cardNumber(lesson.cardId)} · FIRST BREAK</span></div>
  <h4>One player to watch next.</h4><strong class="scout-watch">#${target.number} · ${target.name}</strong>
  <p>${watch[lesson.key]}</p><p class="scout-evidence">Your evidence: ${lastName(target)} ${scoreLine(q.key,target.p1[q.key])} vs ${lastName(other)} ${scoreLine(q.key,other.p1[q.key])} ${unit} · ${METRICS[q.key].label}.</p>
  <a class="primary" href="#draft" data-watch-call="${lesson.index}" data-duel-card="${lesson.cardId}">Draft my next-period line →</a>
  <details class="call-receipt"><summary>Review my five calls</summary><ol>${history.map(h=>`<li><span>${METRICS[h.key].label} ${h.boosted?'· 2×':''}<small>You: ${lastName(skater(h.pick))} · Higher stat: ${lastName(skater(h.winner))}</small></span><b>${h.correct?'✓':'×'} +${h.points}</b></li>`).join('')}</ol></details></section>`;
}

export function duelShareCard(history,score){
  const lesson=takeaway(history),p=skater(lesson.winner),hits=history.filter(h=>h.correct).length,boost=history.find(h=>h.boosted);
  return shareCardButton({game:'Head-to-Head',score,headline:'Card '+cardNumber(lesson.cardId)+' · '+hits+'/5 correct',lines:[boost?'Power Play: '+METRICS[boost.key].label+' · +'+boost.points+' pts':'Power Play held in reserve','Next watch: #'+p.number+' '+p.name,METRICS[lesson.key].label+': '+scoreLine(lesson.key,p.p1[lesson.key])+' '+(lesson.key==='toi'?'min:sec':METRICS[lesson.key].unit)],route:'duel'});
}
