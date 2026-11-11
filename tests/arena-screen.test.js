import test from 'node:test';
import assert from 'node:assert/strict';
import {generateQrSvg,makeQrMatrix,screenMarkup} from '../dist/arena-screen.js';
const client={mode:'live',joinUrl:'https://example.test/games/#fan'}, local={...client,mode:'demo'};
const s={joined:0,leaders:[],eligible:0,draw:null};
test('board separates local rehearsals from shared arenas and never invents players',()=>{
 const html=screenMarkup({...s,stage:'break1'},local,'code');assert.match(html,/separate demos/);assert.match(html,/Scan to play/);assert.match(html,/<b>0<\/b>JOINED/);
 assert.match(screenMarkup({...s,stage:'break2'},client,'code'),/Scan to return/);
});
test('settled boards rank tied scores and never interpret fan aliases as HTML',()=>{
 const html=screenMarkup({...s,stage:'leaders2',eligible:2,leaders:[{rank:1,alias:'<Ace>',score:1100},{rank:1,alias:'B',score:1100}]},client,'code');
 assert.match(html,/2 eligible/);assert.match(html,/&lt;Ace&gt;/);assert.doesNotMatch(html,/<Ace>|Scan to play/);
});
test('final horn prints only the server-selected winner, or explicit no-draw state',()=>{
 assert.match(screenMarkup({...s,stage:'final'},client,''),/No prize draw/);
 const withDraw=screenMarkup({...s,stage:'final',eligible:2,draw:{alias:'The Stick',score:900}},client,'');
 assert.match(withDraw,/Prize draw winner/);assert.match(withDraw,/The Stick/);assert.match(withDraw,/2 eligible leaders/);
});
test('QR graphics reserve a four-module quiet zone around square symbols',()=>{
 const qr=makeQrMatrix(client.joinUrl),size=qr.length;assert.equal((size-21)%4,0);assert.ok(qr.every(row=>row.length===size));
 const svg=generateQrSvg(client.joinUrl);assert.match(svg,new RegExp('viewBox="0 0 '+(size+8)+' '+(size+8)+'"'));assert.match(svg,/M4 4h1v1h-1z/);
});
