// Exhibition 001: twelve reproducible sets of five close comparisons. Keep
// banks, ids and ordering stable so a shared card recreates the same questions.
import {DUELS,skater} from './match-engine.js';
export const DUEL_CARD_COUNT=12;
const banks={
 speed:['rossi hayes','berger morgan','fischer carter','keller brooks','fischer brooks','berger carter','keller hayes','brooks carter','morgan carter','berger fischer','keller fischer','fischer morgan'],
 distance:['fischer brooks','berger morgan','keller rossi','fischer morgan','rossi hayes','keller berger','brooks carter','keller hayes','berger rossi','brooks morgan','fischer carter','berger fischer'],
 blocks:['berger fischer','brooks hayes','berger carter','keller brooks','keller carter','berger brooks','fischer morgan','rossi brooks','rossi carter','brooks morgan','morgan carter','hayes carter'],
 passes:['carter berger','keller fischer','rossi hayes','brooks morgan','keller morgan','berger brooks','keller brooks','berger morgan','fischer rossi','fischer morgan','fischer hayes','brooks carter'],
 toi:['morgan keller','fischer brooks','berger brooks','berger morgan','berger fischer','brooks morgan','keller rossi','fischer morgan','fischer carter','keller berger','rossi hayes','brooks carter']
};
const valid=n=>Number.isInteger(Number(n))&&Number(n)>=1&&Number(n)<=DUEL_CARD_COUNT;
export function duelDeck(cardId=1){
  const idx=(valid(cardId)?Number(cardId):1)-1;
  if(!idx)return DUELS.map(q=>({...q,pair:[...q.pair]}));
  return DUELS.map((_,i)=>{
    const q=DUELS[(i+idx)%DUELS.length],pair=banks[q.key][idx].split(' ');
    // Alternate which side has the higher stat without changing answer accuracy.
    const highLeft=((i*2+idx*3)%5)<(idx%2?2:3);
    if((skater(pair[0]).p1[q.key]>skater(pair[1]).p1[q.key])!==highLeft)pair.reverse();
    return {...q,pair};
  });
}
const key='ot-exhibition001-next-duel-card-v1';
let inMemory=1;
export function startDuelCard(query=''){
  const requested=new URLSearchParams(query).get('duelCard');
  if(valid(requested))return Number(requested);
  try{const saved=localStorage.getItem(key);if(valid(saved))return Number(saved);}catch{}
  return inMemory;
}
export function finishDuelCard(cardId){
  inMemory=Number(cardId)%DUEL_CARD_COUNT+1;
  try{localStorage.setItem(key,String(inMemory));}catch{}
}
export const cardNumber=n=>String(n).padStart(2,'0');
