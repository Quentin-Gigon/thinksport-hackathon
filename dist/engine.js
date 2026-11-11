// Fictional fixtures, deliberately independent of confidential challenge records.
export const DEMO = [
 {id:'p1',name:'Alex Keller',team:'Alpine HC',jersey:14,speed:36.2,passes:88,blocks:1,distance:3900,toi:990,goals:2},
 {id:'p2',name:'Noah Berger',team:'Alpine HC',jersey:7,speed:33.1,passes:95,blocks:2,distance:4300,toi:1200,goals:0},
 {id:'p3',name:'Leo Fischer',team:'Alpine HC',jersey:28,speed:34.6,passes:81,blocks:5,distance:4800,toi:1380,goals:0},
 {id:'p4',name:'Sam Rossi',team:'Alpine HC',jersey:41,speed:38.1,passes:76,blocks:0,distance:4100,toi:1020,goals:1},
 {id:'p5',name:'Jamie Brooks',team:'College Select',jersey:9,speed:35.4,passes:91,blocks:3,distance:5100,toi:1320,goals:1},
 {id:'p6',name:'Casey Morgan',team:'College Select',jersey:22,speed:32.8,passes:86,blocks:4,distance:4600,toi:1260,goals:0},
 {id:'p7',name:'Robin Hayes',team:'College Select',jersey:16,speed:37.4,passes:79,blocks:1,distance:3700,toi:900,goals:2},
 {id:'p8',name:'Max Carter',team:'College Select',jersey:35,speed:34.2,passes:93,blocks:2,distance:5400,toi:1440,goals:0}
];
export function fantasyPoints(p){return Math.round(p.blocks*8+p.passes/5+p.distance/250+p.speed/2);}
export function cost(p){return 7+Math.round(fantasyPoints(p)/8);}
export function lineupResult(players,ids){const chosen=players.filter(p=>ids.includes(p.id));return {chosen,cost:chosen.reduce((s,p)=>s+cost(p),0),points:chosen.reduce((s,p)=>s+fantasyPoints(p),0)};}
export function bestLineup(players,budget=50){let best={points:-1,ids:[]};for(let a=0;a<players.length;a++)for(let b=a+1;b<players.length;b++)for(let c=b+1;c<players.length;c++){const ids=[players[a].id,players[b].id,players[c].id];const r=lineupResult(players,ids);if(r.cost<=budget&&r.points>best.points)best={...r,ids};}return best;}
export const QUIZ = [
 {key:'speed',title:'Who recorded the fastest burst on the ice?',unit:'km/h',why:'Top speed measures the fastest recorded burst, not average pace. Speed can help a player separate from a defender, but does not tell us who played best.'},
 {key:'blocks',title:'Who got in the way of the most shots?',unit:'blocked shots',why:'A blocked shot stops an attempt before it reaches the net. It is a defensive contribution that a goals-and-assists table can hide. More blocks can also mean more time spent defending.'},
 {key:'passes',title:'Who had the highest pass completion rate?',unit:'%',why:'Pass completion is successful passes divided by attempted passes. It helps describe puck retention, but a small number of easy passes can produce a high rate too.'},
 {key:'distance',title:'Who covered the most ice?',unit:'m',why:'Distance reveals workload beyond scoring. Players with more ice time have more opportunity to travel, so compare it with time on ice rather than treating distance as a quality ranking.'},
 {key:'toi',title:'Who spent the longest time on the ice?',unit:'seconds',why:'Time on ice is a measure of usage. It can suggest a coach’s trust, but role, game situation and special teams all affect it. More time is not automatically better performance.'}
];
export function quizOptions(players,index){const key=QUIZ[index].key;const ranked=[...players].sort((a,b)=>b[key]-a[key]||a.id.localeCompare(b.id));const winner=ranked[0];const others=ranked.slice(1).filter(p=>p[key]<winner[key]).slice(0,3);const options=[winner,...others];return options.slice(index%options.length).concat(options.slice(0,index%options.length));}
export function isCorrect(player,players,key){return player[key]===Math.max(...players.map(p=>p[key]));}
export function mysteryPoints(attempts,hints){return Math.max(20,100-(attempts-1)*20-(hints-1)*15);}
export function dailyIndex(date,length,offset=0){const key=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);return ([...key].reduce((n,c)=>n*31+c.charCodeAt(0),0)>>>0)%length+offset;}
export function validatePlayers(value){if(!Array.isArray(value)||value.length<4||value.length>100)throw Error('Expected an array of 4–100 skaters.');const ids=new Set();for(const p of value){if(!p||typeof p.id!=='string'||!p.id||ids.has(p.id)||typeof p.name!=='string'||!p.name.trim()||typeof p.team!=='string'||!p.team.trim())throw Error('Each player needs a unique string id, name and team.');ids.add(p.id);for(const [key,max]of Object.entries({jersey:99,speed:60,passes:100,blocks:50,distance:30000,toi:7200,goals:30})){if(typeof p[key]!=='number'||!Number.isFinite(p[key])||p[key]<0||p[key]>max)throw Error(`Invalid ${key}: use a finite number from 0 to ${max}.`);}if(!Number.isInteger(p.jersey)||!Number.isInteger(p.blocks)||!Number.isInteger(p.goals))throw Error('Jersey, blocks and goals must be integers.');}if(bestLineup(value).points<0)throw Error('No three-player lineup fits the 50-credit budget.');return value;}
