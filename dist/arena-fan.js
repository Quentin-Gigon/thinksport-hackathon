// Public fan UI. The event service owns phases, answers, locks, scores and draw.
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const open=st=>st==='break1'||st==='break2';
const stageLabel={lobby:'Before the break',break1:'First intermission',leaders1:'First-break leaders',break2:'Second intermission',leaders2:'Second-break leaders',final:'Final horn'};
const num=v=>Number(v||0).toLocaleString('en-GB',{maximumFractionDigits:2});
function jersey(p){
 const away=p.team==='COL',shirt=away?'#a83b4a':'#245c9c',trim=away?'#f0e5d2':'#f4c449';
 return `<svg class="af-jersey" aria-hidden="true" viewBox="0 0 86 82"><path fill="${shirt}" stroke="#ffffff65" d="M27 5 36 2q7 8 14 0l9 3 24 17-10 19-11-8 2 44H22l2-44-11 8L3 22z"/><path fill="${trim}" d="m23 64 40 0 .3 5H22.7zm-10-31 3-3-8-11-4 3zm60 0-3-3 8-11 4 3z"/><text x="43" y="52" text-anchor="middle" font-family="system-ui,sans-serif" font-size="31" font-weight="900" font-style="italic" fill="white">${esc(p.number)}</text></svg>`;
}
function pts(n){return `<div class="af-score">${num(n)} <small>PTS</small></div>`;}
function track(i){return `<div class="af-track" aria-hidden="true">${[0,1,2,3,4].map(j=>`<i class="${j<i?'done':j===i?'now':''}"></i>`).join('')}</div>`;}
function leaders(rows,you){if(!rows?.length)return '';return `<h3>Arena leaders</h3><ol class="af-rank">${rows.slice(0,5).map(p=>`<li class="${p.alias===you?.alias?'me':''}"><span><b class="num">#${esc(p.rank)}</b>${esc(p.alias)}${p.alias===you?.alias?' · you':''}</span><strong>${num(p.score)} <small>pts</small></strong></li>`).join('')}</ol>`;}
function join(s,demo,prize){
 const active=open(s.stage);return `<section class="af-intro"><div class="af-label">${esc(stageLabel[s.stage])}</div><h1 class="af-join-title">HEAD <em>TO</em><br>HEAD.</h1><p>${active?`Period ${s.period} is over. Pick which skater had the higher stat. Five calls, 100 points for each correct read.`:'Five player duels at each intermission. Your points from both breaks go on the big board.'}</p></section>
 <form class="af-form" data-join><button class="af-primary" type="submit">${active?'Play the five calls →':'Get my arena pass →'}</button><small class="af-help">We’ll give you a name for the scoreboard. No signup.</small></form><p class="af-prize-rule">Finish both breaks. Highest combined score qualifies for the prize draw; tied leaders all enter.${prize?' Prize: '+esc(prize)+'.':''}</p>${demo?'<details class="af-testcontrols"><summary>Demo controls</summary><a href="#host">Open rehearsal host →</a></details>':''}`;
}
function question(s,pick,power){
 const q=s.question,current=s.you,i=current.answered;
 return `<div class="af-banner"><span><small class="af-position">${esc(current.alias)}</small><br><b class="af-label">Period ${s.period} / Call ${i+1} of 5</b></span>${pts(current.score)}</div>${track(i)}
 <h2 tabindex="-1" data-af-focus>${esc(q.prompt)}</h2><p style="margin-top:6px">Tap a jersey, then lock your call.</p>
 <div class="af-players">${q.players.map((p,k)=>`<button type="button" class="af-player ${p.team==='COL'?'away':''}" data-choice="${esc(p.id)}" aria-pressed="${pick===p.id}"><span class="check" aria-hidden="true">${pick===p.id?'✓':''}</span>${jersey(p)}<span class="af-position">${esc(p.team)} · #${esc(p.number)}</span><strong>${esc(p.name)}</strong></button>`).join('')}</div>
 ${current.powerUsed?'<p class="af-used">✓ Power Play used this break.</p>':`<button type="button" data-power class="af-power" aria-pressed="${power}"><i>2×</i><span>${power?'Power Play on ✓':'Use my Power Play'}<small>One per break. Double points if right.</small></span></button>`}
 <button data-lock class="af-primary" ${!pick?'disabled':''}>${pick?'Lock '+esc(q.players.find(p=>p.id===pick)?.name.split(' ').at(-1))+' · '+(power?200:100)+' pts if right':'Choose a jersey'}</button>`;
}
function reveal(s,r){
 const win=r.players.find(p=>p.id===r.winnerId),mine=r.players.find(p=>p.id===r.playerId);
 return `<section class="af-reveal"><div class="af-banner"><span class="af-label">Period ${s.period} / Call ${s.you.answered} of 5</span>${pts(s.you.score)}</div><p class="af-label af-kicker">${r.correct?'GOOD READ':'THE STAT SHEET'} · ${r.power?'POWER PLAY · ':''}+${num(r.points)} PTS</p><h2 tabindex="-1" data-af-focus>${esc(win.name.split(' ').at(-1))} led.</h2><p style="margin-top:5px">${esc(r.prompt)}</p><ul class="af-stats">${r.players.map(p=>`<li class="${p.id===r.winnerId?'top':''}"><span>#${esc(p.number)} ${esc(p.name)}${p.id===mine?.id?'<br><small>Your pick</small>':''}</span><b>${num(r.values.find(v=>v.id===p.id)?.value)} <small>${esc(r.unit)}</small></b></li>`).join('')}</ul><div class="af-story"><span class="af-label">Why it matters</span><p>${esc(r.story)}</p></div><button data-next class="af-primary">${s.you.complete?'See my break score':'Next call'} →</button></section>`;
}
function lobby(s,demo){const u=s.you,fin=s.stage==='final',after1=s.stage==='leaders1',after2=s.stage==='leaders2';let headline='',body='',label=stageLabel[s.stage],value='';
 if(fin){headline=s.draw?.alias===u?.alias&&s.draw?'You won the draw!':'Final horn.';value=u?`${num(u.score)} pts`:'';body=s.draw?'The event draw is complete. Check the arena screen for prize announcements.':s.eligible?'The top eligible scorers are in the draw. Watch the big screen.':'No completed two-break entry is eligible for the draw.';}
 else if(after1||after2){headline=after1?'One break down.':'Calls are closed.';value=u?`${num(u.score)} pts`:'';body=after1?'Watch period two. Scan again on this phone at the next horn to add to your score.':'Keep an eye on the big screen for the final winners and prize draw.';}
 else if(u?.complete){headline='Five calls in.';label='BREAK '+s.period+' / COMPLETE';value=`${num(u.periodScore)} pts`;body=s.period===1?'Your score is locked. Watch the big screen for leaders. Return on this phone at the next intermission.':'Both breaks count toward your match total. Watch the big screen for the leaders and final draw.';}
 else {headline='See you at the horn.';body='You’re in. The first five calls open when period one ends. Keep this page or scan again on the same phone.';}
 return `<section class="af-summary"><span class="af-label">${esc(label)}</span><h2 tabindex="-1" data-af-focus>${headline}</h2>${value?`<div class="af-big">${value}</div>`:''}${u?`<span class="af-fan-code">${esc(u.alias)} · Match total ${num(u.score)} pts${u.rank&&(!open(s.stage))?' · #'+esc(u.rank):''}</span>`:''}<p>${body}</p>${fin&&s.draw?`<div class="af-story"><span class="af-label">Prize draw winner</span><strong class="af-finalName">${esc(s.draw.alias)}</strong>${u?.claimCode?`<p>Show this private code to the prize desk. Keep it off the scoreboard and social media.</p><b class="af-claim">${esc(u.claimCode)}</b>`:''}</div>`:''}</section>
 ${after1||after2||fin?leaders(s.leaders,u):''}<p class="af-refresh">This page updates automatically.</p>
 ${demo?`<details class="af-testcontrols"><summary>Demo controls</summary><p>Advance to the next break on the host screen.</p><a href="#host">Open rehearsal host →</a></details>`:''}`;
}
export function mountFan(root,client){
 let snap=null,busy=false,destroyed=false,notice='',chosen='',boost=false,questionId='',lastView='',revealId='',posted=null,flight=0,polling=false;
 const demo=client.mode==='demo';const noticeText=err=>String(err?.message||'Connection interrupted. Try again.');
 const key=r=>'ot-arena:'+client.mode+':'+(snap?.you?.alias||'')+':read:'+r.id;
 const seen=r=>{if(!r)return true;try{return sessionStorage.getItem(key(r))==='1';}catch{return false;}};
 const mark=r=>{if(r)try{sessionStorage.setItem(key(r),'1');}catch{}};
 function update(s,forceReveal=false){
  if(!s)return;const oldStage=snap?.stage;snap=s;
  if(!open(s.stage)||oldStage&&oldStage!==s.stage)revealId='';
  if(s.question?.id!==questionId){chosen='';boost=false;questionId=s.question?.id||'';}
  if(open(s.stage)&&s.reveal&&(forceReveal||(!seen(s.reveal)&&lastView!=='round')))revealId=s.reveal.id;
 }
 function draw(focus=false){
  if(destroyed)return;
  const s=snap;let content='',view='';
  if(!s){view='loading';content=notice?'<button class="af-secondary" data-retry>Try connection again</button>':'<p role="status">Opening the arena…</p>';}
  else if(!s.you&&(open(s.stage)||s.stage==='lobby')){view='join';content=join(s,demo,client.prizeLabel);}
  else if(open(s.stage)&&s.you&&s.reveal?.id&&s.reveal.id===revealId){view='reveal';content=reveal(s,s.reveal);}
  else if(open(s.stage)&&s.you&&s.question&&!s.you.complete){view='call';content=question(s,chosen,boost);}
  else {view='round';content=lobby(s,demo);}
  const before=lastView;lastView=view;
  root.innerHTML=`<div class="af"><div class="af-shell"><header class="af-head"><span class="af-brand">OT <em>/</em> ARENA</span><span class="af-tag">${demo?'Device rehearsal':'Arena event'}</span></header><div class="af-error" role="alert">${esc(notice)}</div>${content}<footer class="af-footer">${demo?'Device-only demo · fictional period stats.':''+esc(s?.loadedPeriods?.includes(s.period)?'Operator-supplied period statistics':client.fixtureLabel||'Exhibition data')+' · shared arena scoreboard.'} ${s?.you?'Fan pass: '+esc(s.you.alias):'Return on this browser to keep your score.'} ${client.memoryOnly?'Browser storage unavailable. Keep this tab open.':''}</footer></div></div>`;
  if(focus||before!==view&&before){const h=root.querySelector('[data-af-focus]');if(h){h.focus({preventScroll:true});root.scrollIntoView({block:'start',behavior:'instant'});}}
 }
 function reflect(){
  for(const b of root.querySelectorAll('[data-choice]')){const sel=b.dataset.choice===chosen;b.setAttribute('aria-pressed',String(sel));b.querySelector('.check').textContent=sel?'✓':'';}
  const p=root.querySelector('[data-power]');if(p){p.setAttribute('aria-pressed',String(boost));p.querySelector('span').firstChild.nodeValue=boost?'Power Play on ✓':'Use my Power Play';}
  const lock=root.querySelector('[data-lock]');if(lock){lock.disabled=!chosen||busy;const player=snap.question.players.find(x=>x.id===chosen);lock.textContent=player?`Lock ${player.name.split(' ').at(-1)} · ${boost?200:100} pts if right`:'Choose a jersey';}
 }
 async function refresh(manual=false){
  if(destroyed||busy||polling||document.hidden&&!manual)return;
  const ticket=flight;polling=true;
  try{const next=await client.call('status');if(destroyed||busy||flight!==ticket)return;const last=snap;const changed=!last||next.stage!==last.stage||next.you?.answered!==last.you?.answered||!!next.you!==!!last.you||next.draw?.alias!==last.draw?.alias||(lastView==='round'&&JSON.stringify(next.leaders)!==JSON.stringify(last.leaders));
   if(!changed&&!manual)return;notice='';update(next);draw();
  }catch(err){if(destroyed||busy||flight!==ticket)return;if(manual||!snap){notice=noticeText(err);draw();}}
  finally{polling=false;}
 }
 async function mutate(action,body){
  if(busy)return;const ticket=++flight;busy=true;notice='';const control=root.querySelector(action==='join'?'[data-join] button':'[data-lock]');if(control){control.disabled=true;control.textContent=action==='join'?'Joining…':'Locking…';}
  try{const result=await client.call(action,body);if(destroyed||ticket!==flight)return;posted=null;update(result,action==='pick');draw(true);}
  catch(err){if(destroyed||ticket!==flight)return;notice=noticeText(err);if(action==='pick'){try{const s=await client.call('status');if(destroyed||ticket!==flight)return;const locked=s.reveal?.id===body.id;if(locked){posted=null;notice='';}if(s.stage!==snap?.stage)posted=null;update(s,locked);}catch{}}draw();}
  finally{busy=false;}
 }
 function click(e){const b=e.target.closest('button');if(!b||!root.contains(b)||busy||b.disabled)return;
  if(b.hasAttribute('data-choice')){chosen=b.dataset.choice;posted=null;notice='';reflect();}
  else if(b.hasAttribute('data-power')){boost=!boost;posted=null;reflect();}
  else if(b.hasAttribute('data-lock')&&chosen){posted=posted||{id:snap.question.id,playerId:chosen,power:boost};mutate('pick',posted);}
  else if(b.hasAttribute('data-next')){mark(snap.reveal);revealId='';chosen='';boost=false;draw(true);}
  else if(b.hasAttribute('data-retry'))refresh(true);
 }
 function submit(e){if(!e.target.matches('[data-join]'))return;e.preventDefault();mutate('join',{});}
 function wake(){if(!document.hidden)refresh(true);}
 root.addEventListener('click',click);root.addEventListener('submit',submit);
 document.addEventListener('visibilitychange',wake);window.addEventListener('online',wake);
 draw();refresh(true);const timer=setInterval(()=>refresh(),4800);
 return ()=>{destroyed=true;flight++;clearInterval(timer);root.removeEventListener('click',click);root.removeEventListener('submit',submit);document.removeEventListener('visibilitychange',wake);window.removeEventListener('online',wake);};
}
