// Authored period-one teaching scenes. Coordinates are drawing coordinates, never tracking data.
import {skater} from './match-engine.js';

const shifts=[
  {title:'Race to the boards',focus:'Follow both chasing skaters after the puck gets away.',ids:['rossi','hayes','berger'],frames:[
    {caption:'The puck slides loose along the upper boards. Rossi and Hayes turn towards it.',xy:[[118,81],[166,59],[98,121],[208,33]]},
    {caption:'Rossi takes a direct route. Hayes curves around to close the space by the boards.',xy:[[197,58],[230,66],[147,118],[265,33]]},
    {caption:'Both reach the corner. Berger stays high as a passing option instead of joining the chase.',xy:[[314,42],[344,54],[218,89],[327,35]]}
  ]},
  {title:'The way out',focus:'Watch the receiver before the pass leaves the stick.',ids:['carter','brooks','fischer'],frames:[
    {caption:'Carter gathers the puck behind his net. Brooks swings wide, away from Fischer.',xy:[[74,126],[141,60],[157,106],[82,119]]},
    {caption:'Brooks turns up the boards. Carter has a clear lane and sends the puck into the opening.',xy:[[90,109],[192,49],[150,88],[147,72]]},
    {caption:'Brooks receives on the move. Fischer skates back through the middle to cover the route to goal.',xy:[[117,96],[228,43],[202,85],[238,43]]}
  ]},
  {title:'Close the lane',focus:'Follow the defender between the puck and the net.',ids:['keller','morgan','berger'],frames:[
    {caption:'Keller carries the puck into shooting range. Morgan moves across from the middle.',xy:[[227,53],[294,113],[170,111],[237,56]]},
    {caption:'Keller releases. Morgan puts a shin pad in the shot lane; Berger trails the play.',xy:[[244,63],[287,85],[185,118],[282,83]]},
    {caption:'The puck kicks sideways off Morgan. Both teams turn towards the rebound; no one has possession yet.',xy:[[261,71],[301,87],[210,121],[319,46]]}
  ]}
];
export const SCOUT_SHIFTS=shifts;
const board=`<rect x="6" y="7" width="388" height="166" rx="48" class="ot-ice"/><g class="ot-mark"><path d="M200 8v164M42 22v136m316-136v136"/><circle cx="200" cy="90" r="23"/><circle cx="93" cy="53" r="18"/><circle cx="93" cy="127" r="18"/><circle cx="307" cy="53" r="18"/><circle cx="307" cy="127" r="18"/></g><g class="ot-blue"><path d="M137 8v164m126-164v164"/></g><path class="ot-net" d="M42 83H32v14h10zm316 0h10v14h-10z"/>`;
const kit=id=>skater(id);
const motionQuery=()=>window.matchMedia('(prefers-reduced-motion: reduce)');
function symbol(p,i){return `<g class="ot-marker" data-marker="${i}">${p.team==='ALP'?'<circle r="13.5" class="ot-alp-kit"/>':'<path d="M-13-11h26v16l-13 9-13-9z" class="ot-col-kit"/>'}<text text-anchor="middle" dy="4" class="ot-num">${p.number}</text></g>`;}

// The hub synchronously replaces its screen when a jersey is tapped. Preserve the
// open reel's height and moment for that one replacement, without remembering it
// across navigation or replaying animation when the fan has moved on to a pick.
const replacements=new Map();

export class ShiftScout extends (globalThis.HTMLElement??class {}){
  connectedCallback(){
    if(this._ready)return;
    this._ready=true;this.route=location.hash;const previous=replacements.get(this.route);
    replacements.delete(this.route);this.shift=previous?.shift??0;this.frame=previous?.frame??0;this.playing=false;
    this.innerHTML=`<details class="ot-film"><summary><span class="ot-reel-icon" aria-hidden="true">▷</span><span><small>OPTIONAL · PERIOD ONE</small><strong>Scout a shift</strong></span><span class="ot-disclose" aria-hidden="true">⌄</span></summary><div class="ot-film-body"><p class="ot-film-note">Missed the period? Try these illustrated shifts. They’re fictional examples, not tracking footage or full-period results.</p><label class="ot-film-choice">Choose a shift <select>${shifts.map((s,i)=>`<option value="${i}">${s.title}</option>`).join('')}</select></label><div class="ot-film-screen"><div class="ot-film-frame"><span>◎ SCOUT CAM</span><b data-moment></b></div><svg viewBox="0 0 400 180" role="img" aria-label="Illustrated rink. Play-by-play text follows below.">${board}<g data-actors></g></svg><div class="ot-film-legend"></div></div><p class="ot-watch-focus"></p><p aria-live="polite" aria-atomic="true" class="ot-film-caption"></p><div class="ot-film-controls"><button type="button" data-back aria-label="Previous moment">←</button><button type="button" data-play></button><button type="button" data-next aria-label="Next moment">→</button></div></div></details>`;
    this.$=s=>this.querySelector(s);
    this.$('details').open=previous?.open??false;
    this.$('select').value=String(this.shift);
    this.$('details').ontoggle=()=>{if(!this.$('details').open)this.pause();};
    this.$('select').onchange=()=>{this.pause();this.shift=Number(this.$('select').value);this.frame=0;this.draw(true);};
    this.$('[data-back]').onclick=()=>this.step(-1);
    this.$('[data-next]').onclick=()=>this.step(1);
    this.$('[data-play]').onclick=()=>{if(this.playing){this.pause();return;}if(this.frame===2)this.frame=0;this.playing=true;this.draw();this.timer=setInterval(()=>{if(this.frame<2){this.frame++;if(this.frame===2)this.pause();this.draw();}else this.pause();},2300);};
    this._visibility=()=>{if(document.hidden)this.pause();};
    document.addEventListener('visibilitychange',this._visibility);
    this._motion=motionQuery();this._change=()=>{this.pause();this.draw();};
    this._motion.addEventListener?.('change',this._change);
    this.draw(true);
  }
  disconnectedCallback(){
    if(!this._ready)return;
    const route=this.route, capture={open:this.$('details').open,shift:this.shift,frame:this.frame};
    replacements.set(route,capture);
    queueMicrotask(()=>{if(replacements.get(route)===capture)replacements.delete(route);});
    this.pause();document.removeEventListener('visibilitychange',this._visibility);this._motion?.removeEventListener?.('change',this._change);this._ready=false;}
  pause(){clearInterval(this.timer);this.playing=false;if(this._ready)this.$('[data-play]').textContent=this.frame===2?'↻ Replay shift':'▷ Play shift';}
  step(direction){this.pause();this.frame=Math.max(0,Math.min(2,this.frame+direction));this.draw();}
  draw(fresh=false){
    const s=shifts[this.shift], f=s.frames[this.frame];
    if(fresh){
      this.$('[data-actors]').innerHTML=s.ids.map((id,i)=>symbol(kit(id),i)).join('')+'<g class="ot-marker" data-marker="3"><circle class="ot-puck" r="4.5"/></g>';
      this.$('.ot-film-legend').innerHTML=s.ids.map(id=>{const p=kit(id);return `<span class="${p.team==='ALP'?'ot-alp-label':'ot-col-label'}"><b>#${p.number}</b> ${p.name.split(' ').at(-1)}</span>`;}).join('')+'<span class="ot-puck-label">● Puck</span>';
      this.$('.ot-watch-focus').textContent=s.focus;
    }
    this.$('[data-moment]').textContent='MOMENT '+(this.frame+1)+' / 3';
    this.$('.ot-film-caption').textContent=f.caption;
    this.$('[data-back]').disabled=this.frame===0;
    this.$('[data-next]').disabled=this.frame===2;
    this.$('[data-play]').textContent=this.playing?'Ⅱ Pause':this.frame===2?'↻ Replay shift':'▷ Play shift';
    f.xy.forEach(([x,y],i)=>{this.$('[data-marker="'+i+'"]').style.transform='translate('+x+'px,'+y+'px)';});
  }
}
if(globalThis.customElements&&!customElements.get('ot-shift-scout'))customElements.define('ot-shift-scout',ShiftScout);
