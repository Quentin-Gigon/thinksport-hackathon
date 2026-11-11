import test from 'node:test';
import assert from 'node:assert/strict';
import { DUELS,winners } from '../dist/match-engine.js';
import { settleDuel,takeaway } from '../dist/duel.js';

test('one Power Play is spent even on a miss; no repeat boost or sixth call',()=>{
  const h=[];for(let i=0;i<DUELS.length;i++){
    const q=DUELS[i],win=winners(q.pair,q.key)[0];
    h.push(settleDuel(h,i?q.pair.find(p=>p===win):q.pair.find(p=>p!==win),true));
  }
  assert.equal(h[0].boosted,true);assert.equal(h[0].points,0);
  assert.ok(h.slice(1).every(v=>v.correct&&!v.boosted&&v.points===100));
  assert.equal(h.reduce((a,v)=>a+v.points,0),400); assert.equal(takeaway(h),h[0]);
  assert.equal(settleDuel(h,'rossi',true),null);
});
test('saving the Power Play for call five gives a perfect card 600 pts',()=>{
  const h=[];for(const [i,q] of DUELS.entries())h.push(settleDuel(h,winners(q.pair,q.key)[0],i===4));
  assert.equal(h.reduce((a,v)=>a+v.points,0),600);assert.equal(takeaway(h),h[4]);
});
test('unselected and out-of-pair picks cannot lock or spend a Power Play',()=>{
  assert.equal(settleDuel([],null,true),null);assert.equal(settleDuel([],'keller',true),null);
});

import {duelDeck,DUEL_CARD_COUNT,startDuelCard,finishDuelCard} from '../dist/duel-decks.js';
import {skater} from '../dist/match-engine.js';
import {scoutCard} from '../dist/duel.js';
test('twelve comparable cards reproduce by id, preserve the starter and change every metric matchup',()=>{
 const pairs=new Set(),limits={speed:1.81,distance:160,blocks:1,passes:4,toi:40};
 assert.deepEqual(duelDeck(1),DUELS);
 for(let id=1;id<=DUEL_CARD_COUNT;id++){
  const deck=duelDeck(id);assert.deepEqual(duelDeck(String(id)),deck);assert.equal(deck.length,5);
  assert.equal(new Set(deck.map(q=>q.key)).size,5);
  for(const q of deck){
   const identity=q.key+':'+[...q.pair].sort().join('-');assert.equal(pairs.has(identity),false);pairs.add(identity);
   const gap=Math.abs(skater(q.pair[0]).p1[q.key]-skater(q.pair[1]).p1[q.key]);assert.ok(gap>0&&gap<=limits[q.key]);
  }
  const h=[];for(const [i,q] of deck.entries()){const correct=winners(q.pair,q.key)[0];h.push(settleDuel(h,correct,i===1,id));}
  assert.equal(h.reduce((a,v)=>a+v.points,0),600);assert.deepEqual(h[1].pair,deck[1].pair);
  assert.ok(scoutCard(h).includes('data-duel-card="'+id+'"'));assert.ok(scoutCard(h).includes('data-watch-call="1"'));
 }
});
test('card links pin a rematch while normal starts advance after settlement and wrap',()=>{
 finishDuelCard(12);assert.equal(startDuelCard(''),1);
 finishDuelCard(1);assert.equal(startDuelCard(''),2);assert.equal(startDuelCard('?duelCard=8'),8);assert.equal(startDuelCard('?duelCard=999'),2);
 finishDuelCard(12);
});
