import {duelDeck} from './duel-decks.js';
import {skater,winners,METRICS} from './match-engine.js';
const key='ot-exhibition001-scout-note';
export function installHandoff(app){
  app.addEventListener('click',e=>{
    const link=e.target.closest('[data-watch-call]');
    if(link){const i=Number(link.dataset.watchCall);const card=Number(link.dataset.duelCard)||1;if(Number.isInteger(i)&&duelDeck(card)[i])try{sessionStorage.setItem(key,JSON.stringify({i,card}));}catch{}}
    if(e.target.closest('[data-find-jersey]')){
      const id=e.target.closest('[data-find-jersey]').dataset.findJersey;
      const b=app.querySelector('[data-draft="'+id+'"]');if(b){b.focus({preventScroll:true});b.scrollIntoView({block:'center'});}
    }
  });
}
export function watchNote(){
  let raw;try{raw=sessionStorage.getItem(key);}catch{return '';}
  let decoded;try{decoded=JSON.parse(raw)}catch{return '';}if(decoded==null)return '';const i=typeof decoded==='number'?decoded:decoded.i;const card=typeof decoded==='number'?1:decoded.card;const q=duelDeck(card)[i];if(!q||!Number.isInteger(i))return '';
  const p=skater(winners(q.pair,q.key)[0]),other=skater(q.pair.find(x=>x!==p.id));
  return `<aside class="bench-note"><small>FROM YOUR PERIOD-ONE SCOUTING CARD</small><strong>#${p.number} ${p.name}</strong><p>${METRICS[q.key].label}: ${p.p1[q.key]} ${METRICS[q.key].unit} against ${other.name.split(' ').at(-1)}’s ${other.p1[q.key]}. Would you back this jersey for a different job in period two?</p><button class="secondary" type="button" data-find-jersey="${p.id}">Find #${p.number} on the bench ↓</button></aside>`;
}
