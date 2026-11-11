// Authored synthetic plays. Positions are illustration coordinates, never match tracking.
const actors = [
  {id:'blue',name:'Blue',number:7,color:'#3863d9',shape:'circle'},
  {id:'orange',name:'Orange',number:14,color:'#be541e',shape:'square'},
  {id:'purple',name:'Purple',number:28,color:'#8046b0',shape:'diamond'},
  {id:'d1',name:'Defender',number:'×',color:'#65747b'},
  {id:'d2',name:'Defender',number:'×',color:'#65747b'},
  {id:'goalie',name:'Goalie',number:'G',color:'#65747b'}
];
const frame=(t,blue,orange,purple,d1,d2,puck,caption)=>({t,positions:{blue,orange,purple,d1,d2,goalie:[91,50],puck},caption});
export const PLAYS = [
  {id:'cross-ice',title:'The pass that opens the ice',question:'Who will set up the next shot?',target:'blue',freeze:.45,
    hint:'Watch who has the puck, and who has space across the rink.',
    explanation:'Blue #7 passes across the rink to Orange #14. The defenders have to turn, and Orange receives the puck with room to shoot. The pass creates the opportunity; the shot is only the last part.',
    metric:'One completed pass → one reception → one shot.',
    chainHint:'Blue starts with the puck. Orange must receive it before shooting.',
    events:[{id:'pass',actor:'blue',title:'Blue sends the puck across',detail:'The puck leaves Blue’s stick.'},{id:'receive',actor:'orange',title:'Orange receives the pass',detail:'Orange controls the puck near the goal.'},{id:'shot',actor:'orange',title:'Orange shoots',detail:'The puck travels from Orange towards the net.'}],
    frames:[frame(0,[22,27],[58,73],[59,29],[47,40],[64,58],[25,28],'Blue carries the puck. Orange moves into space.'),frame(.45,[40,28],[74,69],[68,26],[57,37],[65,52],[43,29],'Freeze: Blue has the puck. Look across the rink.'),frame(.7,[44,29],[76,65],[72,25],[63,40],[70,51],[76,64],'Blue’s pass crosses to Orange.'),frame(.85,[50,31],[78,62],[76,28],[68,43],[74,51],[79,61],'Orange receives, with room to shoot.'),frame(1,[55,32],[80,60],[78,30],[73,45],[78,51],[94,50],'Orange shoots. Blue supplied the pass.')]
  },
  {id:'recovery',title:'A chance starts by the boards',question:'Who will recover the loose puck?',target:'purple',freeze:.45,
    hint:'The puck is near the top boards. Which player is closest and moving towards it?',
    explanation:'Purple #28 reaches the loose puck by the boards, then passes to Blue #7. Blue shoots. Winning possession starts the attack, even though Purple is not the shooter.',
    metric:'One puck recovery → one completed pass → one shot.',
    chainHint:'The puck begins loose. Purple has to recover it before passing to Blue.',
    events:[{id:'recover',actor:'purple',title:'Purple recovers the loose puck',detail:'Possession starts by the boards.'},{id:'pass',actor:'purple',title:'Purple passes to Blue',detail:'The recovered puck goes into the middle.'},{id:'shot',actor:'blue',title:'Blue shoots',detail:'Blue uses Purple’s pass to create the shot.'}],
    frames:[frame(0,[38,57],[65,73],[28,20],[48,33],[67,50],[51,14],'A loose puck slides towards the boards.'),frame(.45,[55,55],[73,72],[48,18],[42,34],[70,47],[54,14],'Freeze: who can reach the loose puck?'),frame(.65,[63,54],[77,70],[57,16],[49,31],[72,44],[59,17],'Purple reaches and controls the puck.'),frame(.85,[73,53],[79,70],[61,20],[56,33],[77,43],[74,53],'Purple passes into the middle to Blue.'),frame(1,[77,53],[81,68],[66,23],[61,34],[80,43],[94,50],'Blue shoots. Purple began the move.')]
  },
  {id:'block',title:'The goal that never happened',question:'Who will get in the way of the shot?',target:'orange',freeze:.45,
    hint:'Follow the line between the grey puck carrier and the goal. Who is moving into that line?',
    explanation:'Orange #14 moves into the shooting lane and blocks the attempt. Purple #28 collects the loose puck and passes it to Blue #7. Preventing a shot from reaching the goalie is a contribution the scoring table can miss.',
    metric:'One blocked attempt → one recovery → one outlet pass.',
    chainHint:'Orange must block the attempt before Purple can collect the loose puck.',
    events:[{id:'block',actor:'orange',title:'Orange blocks the attempt',detail:'The puck stops before reaching the goalie.'},{id:'recover',actor:'purple',title:'Purple collects the loose puck',detail:'Purple reaches the puck after the block.'},{id:'pass',actor:'purple',title:'Purple passes out to Blue',detail:'Blue receives the puck away from danger.'}],
    frames:[frame(0,[30,74],[68,25],[48,67],[45,49],[61,76],[48,49],'Grey attacks the goal on the right.'),frame(.45,[35,72],[66,38],[57,64],[52,50],[64,74],[55,50],'Freeze: grey is about to shoot towards the goal.'),frame(.65,[39,71],[69,50],[63,61],[55,50],[67,72],[69,50],'Orange enters the shooting lane and blocks.'),frame(.85,[42,70],[71,50],[67,59],[57,49],[67,71],[67,59],'Purple collects the loose puck.'),frame(1,[43,69],[71,48],[66,58],[57,48],[66,70],[43,69],'Purple passes safely out to Blue.')]
  }
].map(p=>({...p,actors}));
export const CHANCES = [
 {id:'distance',title:'Closer isn’t a guarantee',question:'Which shot is more likely to score?',why:'Shot A is close to goal with a clear view. Shot B is much farther away. In this illustrative pair, A has the higher chance—even though it misses and B scores.',shots:[{id:'a',label:'Shot A',x:74,y:49,defenders:[[58,30],[60,74]],chance:30,goal:false,description:'Close to goal · clear lane'},{id:'b',label:'Shot B',x:29,y:44,defenders:[[52,27],[60,77]],chance:6,goal:true,description:'Far from goal · clear lane'}]},
 {id:'angle',title:'The angle changes the picture',question:'Which shot gives the shooter more of the goal to aim at?',why:'Shot B is central and offers more of the goal to aim at. Shot A is near the side boards, where the visible opening is much narrower. Both shots miss here; that does not make their chances equal.',shots:[{id:'a',label:'Shot A',x:77,y:13,defenders:[[49,40],[60,73]],chance:7,goal:false,description:'Wide angle · near the boards'},{id:'b',label:'Shot B',x:73,y:51,defenders:[[48,26],[59,77]],chance:28,goal:false,description:'Central position · clear lane'}]},
 {id:'lane',title:'Space to get the shot through',question:'Which shooter has a clearer path to goal?',why:'Shot A has an open lane. A defender stands directly in Shot B’s lane. In this illustrative pair, A has the higher chance. The goal from B is still possible; lower probability never means impossible.',shots:[{id:'a',label:'Shot A',x:71,y:42,defenders:[[62,70],[52,30]],chance:24,goal:true,description:'Open lane · defender off to the side'},{id:'b',label:'Shot B',x:71,y:42,defenders:[[81,46],[55,73]],chance:9,goal:true,description:'Defender between puck and goal'}]}
];
export function sampleFrame(play,t){
 const time=Math.max(0,Math.min(1,t));let i=0;
 while(i<play.frames.length-2&&time>play.frames[i+1].t)i++;
 const a=play.frames[i],b=play.frames[i+1];const f=Math.max(0,Math.min(1,(time-a.t)/(b.t-a.t)));
 return {positions:Object.fromEntries(Object.keys(a.positions).map(id=>[id,a.positions[id].map((v,k)=>v+(b.positions[id][k]-v)*f)])),caption:(time>=b.t?b:a).caption};
}
export function sequenceCorrect(events,ids){return ids.length===events.length&&events.every((e,i)=>e.id===ids[i]);}
export function sequencePoints(failed){return Math.max(20,100-failed*40);}
export function betterChance(round,id){const pick=round.shots.find(s=>s.id===id);return !!pick&&pick.chance===Math.max(...round.shots.map(s=>s.chance));}
export function shuffledEvents(play,index){const order=index%2?[2,0,1]:[1,2,0];return order.map(i=>play.events[i]);}
