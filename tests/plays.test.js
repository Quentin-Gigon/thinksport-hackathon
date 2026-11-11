import test from 'node:test';
import assert from 'node:assert/strict';
import {PLAYS,CHANCES,sampleFrame,sequenceCorrect,sequencePoints,betterChance,shuffledEvents} from '../dist/plays.js';

test('all three plays have a valid choice, ordered frames and bounded complete positions',()=>{
 assert.equal(PLAYS.length,3);
 assert.equal(new Set(PLAYS.map(p=>p.target)).size,3);
 for(const play of PLAYS){
  assert.ok(play.actors.slice(0,3).some(a=>a.id===play.target));
  assert.equal(play.frames[0].t,0); assert.equal(play.frames.at(-1).t,1);
  assert.ok(play.freeze>0&&play.freeze<1);
  for(let i=0;i<play.frames.length;i++){
   const frame=play.frames[i];if(i)assert.ok(frame.t>play.frames[i-1].t);
   for(const id of [...play.actors.map(a=>a.id),'puck']){
    assert.equal(frame.positions[id].length,2);
    for(const value of frame.positions[id])assert.ok(Number.isFinite(value)&&value>=0&&value<=100);
   }
  }
 }
});
test('animation interpolates through keyframes and clamps endpoints',()=>{
 const p=PLAYS[0];assert.deepEqual(sampleFrame(p,-10).positions,p.frames[0].positions);
 assert.deepEqual(sampleFrame(p,10).positions,p.frames.at(-1).positions);
 const halfway=sampleFrame(p,.225).positions.blue;
 assert.deepEqual(halfway,[31,27.5]);
 for(const p of PLAYS)for(const f of p.frames)assert.deepEqual(sampleFrame(p,f.t).positions,f.positions);
});
test('sequence accepts only the exact chronological order, with each event once',()=>{
 PLAYS.forEach((p,i)=>{
  assert.equal(sequenceCorrect(p.events,p.events.map(e=>e.id)),true);
  assert.equal(sequenceCorrect(p.events,shuffledEvents(p,i).map(e=>e.id)),false);
  assert.equal(sequenceCorrect(p.events,p.events.slice(1).map(e=>e.id)),false);
  assert.equal(sequenceCorrect(p.events,Array(3).fill(p.events[0].id)),false);
 });
 assert.equal(sequencePoints(0),100);assert.equal(sequencePoints(1),60);assert.equal(sequencePoints(2),20);assert.equal(sequencePoints(10),20);
});
test('chance answers use probability independently of the scripted goal outcome',()=>{
 assert.equal(CHANCES.length,3);
 for(const r of CHANCES){
  assert.equal(r.shots.length,2);
  assert.equal(r.shots.filter(s=>betterChance(r,s.id)).length,1);
  assert.equal(betterChance(r,'missing'),false);
  for(const shot of r.shots)assert.ok(shot.chance>0&&shot.chance<100);
 }
 assert.equal(betterChance(CHANCES[0],'a'),true);
 assert.equal(CHANCES[0].shots[0].goal,false);
 assert.equal(CHANCES[0].shots[1].goal,true);
 assert.equal(betterChance(CHANCES[1],'b'),true);
});
