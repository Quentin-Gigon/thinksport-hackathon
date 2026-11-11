// Render locally from the completed demo round; no server, tracking, or roster upload.
const escape = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function shareCardButton(card) {
  return '<div class="scout-export"><button type="button" class="secondary" data-scout-share="'+escape(JSON.stringify(card))+'">Save my scouting card ↓</button><span role="status"></span></div>';
}
function block(ctx,text,x,y,width,lineHeight,limit) {
  let line='',rows=[];
  for(const word of String(text).split(/\s+/)){const next=line?line+' '+word:word;if(line&&ctx.measureText(next).width>width){rows.push(line);line=word;}else line=next;}
  if(line)rows.push(line);
  rows.slice(0,limit).forEach((row,i)=>ctx.fillText(row+(i===limit-1&&rows.length>limit?'…':''),x,y+i*lineHeight,width));
  return y+Math.min(limit,rows.length)*lineHeight;
}
export function drawCard(card) {
  const canvas=document.createElement('canvas');canvas.width=840;canvas.height=1010;
  const c=canvas.getContext('2d');c.fillStyle='#0b1a2b';c.fillRect(0,0,840,1010);
  c.strokeStyle='#243e50';c.lineWidth=2;
  for(let x=0;x<840;x+=60){c.beginPath();c.moveTo(x,0);c.lineTo(x,1010);c.stroke();}
  for(let y=0;y<1010;y+=60){c.beginPath();c.moveTo(0,y);c.lineTo(840,y);c.stroke();}
  c.fillStyle='#cbfa44';c.fillRect(0,0,840,16);c.font='bold 22px monospace';c.fillText('OVERTIME   /   FAN SCOUTING DEPT.',48,78);
  c.fillStyle='#fff';c.font='italic bold 62px sans-serif';block(c,card.game.toUpperCase(),48,170,744,70,2);
  c.font='bold 128px sans-serif';c.fillStyle='#cbfa44';c.fillText(String(card.score),44,374);
  c.font='bold 20px monospace';c.fillText('SCOUT POINTS',52,412);
  c.fillStyle='#39546a';c.fillRect(48,456,744,2);c.fillStyle='#fff';c.font='bold 36px sans-serif';
  let y=block(c,card.headline,48,519,744,42,2)+24;
  for(const ln of card.lines.slice(0,3)){c.fillStyle='#b6d3df';c.font='26px sans-serif';y=block(c,ln,48,y,744,33,2)+18;}
  c.fillStyle='#cbfa44';c.font='bold 22px monospace';c.fillText('EXHIBITION 001   /   FICTIONAL MATCH',48,955);
  return canvas;
}
export function bindShareCards(root) {
  root.addEventListener('click',async e=>{
    const button=e.target.closest('[data-scout-share]');if(!button||button.disabled)return;
    const status=button.nextElementSibling;button.disabled=true;
    try {
      const data=JSON.parse(button.dataset.scoutShare),canvas=drawCard(data);
      const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error()),'image/png'));
      const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='overtime-'+data.route+'-scouting-card.png';document.body.append(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),60000);status.textContent='PNG ready in your downloads.';
    }catch{status.textContent='Couldn’t save the image. You can still screenshot your result.';}
    finally{button.disabled=false;}
  });
}
