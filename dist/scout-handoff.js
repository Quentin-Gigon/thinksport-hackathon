import {DUELS,skater,winners,METRICS} from './match-engine.js';
const key='ot-exhibition001-scout-note';
export function installHandoff(app){
  app.addEventListener('click',e=>{
    const link=e.target.closest('[data-watch-call]');
    if(link){const i=Number(link.dataset.watchCall);if(Number.isInteger(i)&&DUELS[i])try{sessionStorage.setItem(key,String(i));}catch{}}
    if(e.target.closest('[data-find-jersey]')){
      const id=e.target.closest('[data-find-jersey]').dataset.findJersey;
      const b=app.querySelector('[data-draft="'+id+'"]');if(b){b.focus({preventScroll:true});b.scrollIntoView({block:'center'});}
    }
  });
}
export function watchNote(){
  let raw;try{raw=sessionStorage.getItem(key);}catch{return '';}
  if(raw===null||!/^\d$/.test(raw)||!DUELS[Number(raw)])return '';
  const q=DUELS[Number(raw)],p=skater(winners(q.pair,q.key)[0]),other=skater(q.pair.find(x=>x!==p.id));
  return `<aside class="bench-note"><small>FROM YOUR PERIOD-ONE SCOUTING CARD</small><strong>#${p.number} ${p.name}</strong><p>${METRICS[q.key].label}: ${p.p1[q.key]} ${METRICS[q.key].unit} against ${other.name.split(' ').at(-1)}’s ${other.p1[q.key]}. Would you back this jersey for a different job in period two?</p><button class="secondary" type="button" data-find-jersey="${p.id}">Find #${p.number} on the bench ↓</button></aside>`;
}
