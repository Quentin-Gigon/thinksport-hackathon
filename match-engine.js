// Fictional, period-specific fixtures. Never inferred from confidential full-match totals.
export const SKATERS=[
{id:'keller',name:'Alex Keller',number:14,team:'ALP',role:'Forward',price:19,p1:{speed:36.2,distance:1420,blocks:0,passes:14,toi:380},p2:{blocks:1,passes:12,distance:1350}},
{id:'berger',name:'Noah Berger',number:7,team:'ALP',role:'Defender',price:16,p1:{speed:33.1,distance:1510,blocks:2,passes:19,toi:420},p2:{blocks:3,passes:18,distance:1480}},
{id:'fischer',name:'Leo Fischer',number:28,team:'ALP',role:'Defender',price:14,p1:{speed:34.6,distance:1670,blocks:3,passes:12,toi:440},p2:{blocks:2,passes:15,distance:1710}},
{id:'rossi',name:'Sam Rossi',number:41,team:'ALP',role:'Forward',price:18,p1:{speed:38.1,distance:1390,blocks:0,passes:9,toi:350},p2:{blocks:0,passes:10,distance:1580}},
{id:'brooks',name:'Jamie Brooks',number:9,team:'COL',role:'Forward',price:18,p1:{speed:35.4,distance:1720,blocks:1,passes:17,toi:430},p2:{blocks:1,passes:20,distance:1610}},
{id:'morgan',name:'Casey Morgan',number:22,team:'COL',role:'Defender',price:15,p1:{speed:32.8,distance:1590,blocks:2,passes:16,toi:410},p2:{blocks:4,passes:13,distance:1450}},
{id:'hayes',name:'Robin Hayes',number:16,team:'COL',role:'Forward',price:17,p1:{speed:37.4,distance:1310,blocks:0,passes:8,toi:310},p2:{blocks:0,passes:14,distance:1380}},
{id:'carter',name:'Max Carter',number:35,team:'COL',role:'Defender',price:13,p1:{speed:34.2,distance:1810,blocks:1,passes:21,toi:470},p2:{blocks:2,passes:22,distance:1850}}
];
export const METRICS={speed:{label:'Fastest burst',unit:'km/h',why:'Top speed measures a single burst—not average pace or overall performance.'},distance:{label:'Distance covered',unit:'m',why:'Distance reveals work away from the puck. More ice time creates more opportunity to cover ground.'},blocks:{label:'Shots blocked',unit:'blocks',why:'A blocked shot is defensive work that often disappears behind the goals.'},passes:{label:'Completed passes',unit:'passes',why:'This is a count of successful passes, not a completion rate. Role and ice time affect the total.'},toi:{label:'Time on ice',unit:'sec',why:'Ice time measures usage. It does not automatically mean a better performance.'}};
export const DUELS=[{key:'speed',pair:['rossi','hayes'],q:'Who hit the higher top speed?'},{key:'distance',pair:['fischer','brooks'],q:'Who covered more ice?'},{key:'blocks',pair:['berger','fischer'],q:'Who blocked more shots?'},{key:'passes',pair:['carter','berger'],q:'Who completed more passes?'},{key:'toi',pair:['morgan','keller'],q:'Who spent longer on the ice?'}];
export const CROWD=[{key:'distance',q:'Who covered the most ice?',ids:['fischer','brooks','carter','berger']},{key:'speed',q:'Who had the fastest burst?',ids:['keller','rossi','hayes','brooks']},{key:'blocks',q:'Who blocked the most shots?',ids:['berger','morgan','fischer','carter']}];
export const skater=id=>SKATERS.find(p=>p.id===id);
export function winners(ids,key){const max=Math.max(...ids.map(id=>skater(id).p1[key]));return ids.filter(id=>skater(id).p1[key]===max);}
export function crowdPoints(choice,votes,ids,key){if(!winners(ids,key).includes(choice)||!votes.length)return 0;return 100+Math.min(50,Math.round(50*(1-votes.filter(v=>v===choice).length/votes.length)));}
export function draftResult(ids){const selected=[...new Set(ids)].map(skater).filter(Boolean);return {selected,cost:selected.reduce((s,p)=>s+p.price,0),valid:selected.length===3&&selected.reduce((s,p)=>s+p.price,0)<=50,points:selected.reduce((s,p)=>s+periodPoints(p.p2),0)};}
export function periodPoints(p){return p.blocks*10+p.passes+Math.floor(p.distance/100);}
export function bestDraft(){let best={points:-1};for(let a=0;a<SKATERS.length;a++)for(let b=a+1;b<SKATERS.length;b++)for(let c=b+1;c<SKATERS.length;c++){const r=draftResult([SKATERS[a].id,SKATERS[b].id,SKATERS[c].id]);if(r.valid&&r.points>best.points)best=r;}return best;}
