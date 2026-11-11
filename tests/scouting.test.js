import test from 'node:test';
import assert from 'node:assert/strict';
import {SCOUT_SHIFTS} from '../dist/scouting.js';
import {SKATERS} from '../dist/match-engine.js';
test('scouting shifts use rostered players, drawable in-rink frames and observation-only copy',()=>{
  const ids=new Set(SKATERS.map(p=>p.id));
  for(const s of SCOUT_SHIFTS){
    assert.equal(new Set(s.ids).size,3);
    assert.ok(s.ids.every(id=>ids.has(id)));
    assert.equal(s.frames.length,3);
    for(const f of s.frames){
      assert.equal(f.xy.length,s.ids.length+1);
      assert.ok(f.xy.every(([x,y])=>x>=30&&x<=370&&y>=23&&y<=157));
      assert.doesNotMatch(f.caption,/fastest|most ice|most passes|top speed|km\/h|metres|points|wins the duel/i);
    }
  }
});
