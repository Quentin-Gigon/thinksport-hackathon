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
