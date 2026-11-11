import test from 'node:test';
import assert from 'node:assert/strict';
import {scoutVerdict,restoreDraft,drawDraft,bindDraft} from '../dist/draft-mission.js';

const ids=['fischer','carter','keller'], call={key:'blocks',player:'fischer'};
test('a joint leader earns the scouting badge, a miss does not, and the next stat remains sealed',()=>{
 const v=scoutVerdict(ids,call,1);
 assert.equal(v.hit,true);assert.equal(v.shared,true);assert.deepEqual(v.leaders.map(p=>p.id).sort(),['carter','fischer']);
 assert.equal(scoutVerdict(ids,{...call,player:'keller'},1).hit,false);
 assert.equal(scoutVerdict(ids,{...call,key:'distance'},2),null);
 assert.equal(scoutVerdict(ids,{...call,player:'not-in-line'},3),null);
});
test('restoring a lock accepts old lines without inventing a prediction, rejecting invalid budgets and steps',()=>{
 assert.deepEqual(restoreDraft({ids,step:2,call}),{ids,step:2,stage:'locked',call});
 assert.equal(restoreDraft({ids,step:2}).call,null);
 assert.equal(restoreDraft({ids,step:6,call}),null);
 assert.equal(restoreDraft({ids:['keller','brooks','rossi'],step:1,call}),null);
});
test('lock, pause and settle a scouting call without awarding phantom draft points',()=>{
 const s={ids:[...ids],stage:'call',step:0,points:0};
 let saves=[],clears=0,completed;
 const buttons=new Map();
 const root={querySelector:()=>null,querySelectorAll:(sel)=>{if(!buttons.has(sel))buttons.set(sel,{dataset:{}});return [buttons.get(sel)];}};
 bindDraft(s,{root,redraw(){},saveLine:s=>saves.push(structuredClone(s)),clearLine:()=>clears++,chime(){}});
 buttons.get('#lock-draft').onclick();assert.equal(s.stage,'call');
 for(const [selector,key,value] of [['[data-focus]','focus','blocks'],['[data-star]','star','fischer']]){const b=buttons.get(selector);b.dataset[key]=value;b.onclick();}
 buttons.get('#lock-draft').onclick();assert.equal(s.stage,'locked');assert.deepEqual(saves[0].call,call);
 const view=()=>drawDraft(s,{shell:(d,html)=>html,wrapper:(id,d,score,html)=>html,onComplete:v=>completed=v,finish:(t,pts)=>pts});
 assert.match(view(),/Fischer to lead in shots blocked/);assert.doesNotMatch(view(),/badge earned|1,710/i);
 buttons.get('#draft-step').onclick();assert.match(view(),/Joint leader/);assert.equal(s.points,50);
 buttons.get('#draft-step').onclick();assert.equal(saves.at(-1).step,2);
 Object.assign(s,restoreDraft(saves.at(-1)));buttons.get('#draft-step').onclick();buttons.get('#draft-step').onclick();
 assert.match(view(),/My next-period line/);assert.equal(completed.score,147);assert.equal(clears,1);
});
