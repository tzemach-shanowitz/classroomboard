'use strict';
/* Pen & touch: input test panel + compatibility mode (original code). */
(function(){
const icfg=()=>Store.get('inputCfg',{compat:true});
const setCfg=v=>Store.set('inputCfg',{...icfg(),...v});
window.__inputCompat=()=>icfg().compat!==false;
/* ---------- compatibility mode: patches the existing ink engine only ---------- */
const PALM_PX=34;const od=Ink.down,ou=Ink.up;let lastPtr=0,swapped=null,touchId=null;
Ink.down=function(e){
  if(!__inputCompat())return od.call(this,e);
  lastPtr=Date.now();
  if(this.mode!=='write')return;
  if(this.cur)return;                       // a second finger or palm while writing is ignored
  const eraserEnd=e.pointerType==='pen'&&((e.buttons&32)||e.button===5||(e.buttons&2));
  /* A palm, fist or the flat of a hand (a wide contact) erases, like a real eraser. A fingertip or the pen writes. */
  const palm=!eraserEnd&&e.pointerType==='touch'&&Math.max(e.width||0,e.height||0)>=PALM_PX;
  this.palmR=palm?Math.min(160,Math.max(e.width||0,e.height||0)/2+10):0;
  if(eraserEnd||palm){swapped=this.tool;this.tool='eraser'}
  od.call(this,e)};
Ink.up=function(e){ou.call(this,e);this.palmR=0;if(swapped){this.tool=swapped;swapped=null}};
/* Some boards deliver only touch or only mouse events. Pointer events normally win;
   if a touch arrives with no pointer event right before it, the touch is used instead. */
const cv=Ink.cv;
const fake=(t,id)=>({clientX:t.clientX,clientY:t.clientY,pointerId:id,pointerType:'touch',width:(t.radiusX||0)*2,height:(t.radiusY||0)*2,buttons:1,button:0,preventDefault(){}});
cv.addEventListener('touchstart',e=>{if(!__inputCompat()||Ink.mode!=='write')return;e.preventDefault();
  setTimeout(()=>{if(Date.now()-lastPtr<250||Ink.cur)return;const t=e.changedTouches[0];touchId=t.identifier;od.call(Ink,fake(t,9000))},60)},{passive:false});
cv.addEventListener('touchmove',e=>{if(!__inputCompat()||touchId===null)return;e.preventDefault();for(const t of e.changedTouches)if(t.identifier===touchId)Ink.move(fake(t,9000))},{passive:false});
const tend=e=>{if(touchId===null)return;for(const t of e.changedTouches)if(t.identifier===touchId){touchId=null;Ink.up(fake(t,9000))}};
cv.addEventListener('touchend',tend);cv.addEventListener('touchcancel',tend);
/* ---------- diagnostic ---------- */
function openDiag(){
  if(document.getElementById('indiag'))return;
  const o=h('div',{id:'indiag',dir:'ltr',style:'position:fixed;inset:0;z-index:300;direction:ltr;text-align:left;background:#0e1620;color:#e8eef5;display:flex;flex-direction:column;touch-action:none;font:16px system-ui,sans-serif;user-select:none'});
  const top=h('div',{style:'display:flex;gap:12px;align-items:center;padding:10px 16px;border-bottom:1px solid #2a3a4a'},h('b',{style:'font-size:20px;flex:1'},'Pen & touch test'),
    h('button',{class:'pill',onclick:()=>clr()},'Clear'),h('button',{class:'pill sel',onclick:()=>close()},'Close'));
  const main=h('div',{style:'flex:1;display:flex;min-height:0'});
  const pad=h('canvas',{style:'flex:1;min-width:0;background:#121e2a;touch-action:none'});
  const side=h('div',{style:'width:min(44vw,430px);overflow:auto;padding:12px 16px;font-size:15px;line-height:1.5;border-left:1px solid #2a3a4a;touch-action:pan-y'});
  main.append(pad,side);o.append(top,main);document.body.append(o);
  const px=pad.getContext('2d');
  const fit=()=>{const r=devicePixelRatio||1,b=pad.getBoundingClientRect();pad.width=b.width*r;pad.height=b.height*r;px.scale(r,r);hint()};
  const hint=()=>{px.fillStyle='#6f8499';px.font='20px system-ui';px.fillText('Write here with a marker, finger, mouse or pen.',20,40);px.font='15px system-ui';px.fillText('Colors: pen = green, touch = blue, mouse = orange, other = pink',20,66);px.fillText('Use the eraser end or button of a pen/marker too.',20,90)};
  const clr=()=>{px.clearRect(0,0,pad.width,pad.height);hint()};
  const C={pointer:0,touch:0,mouse:0,pen:0,penEraser:0,cancel:0,pressure:0};const types={};const log=[];let last=null,maxP=0,hover=0;
  const col=t=>t==='pen'?'#3ddc84':t==='touch'?'#4dabff':t==='mouse'?'#ff9f1c':'#ff5fb0';
  const bump=(k)=>{C[k]++};
  function note(kind,d){log.unshift(kind+' '+d);if(log.length>10)log.pop();draw()}
  const down={};
  const P=e=>{ if(o.contains(e.target)===false)return; const t=e.pointerType||'?';types[t]=(types[t]||0)+1;bump('pointer');if(t==='pen')bump('pen');if(e.type==='pointercancel')bump('cancel');
    if(e.pressure>0&&e.pressure!==0.5)bump('pressure');maxP=Math.max(maxP,e.pressure||0);
    const er=t==='pen'&&((e.buttons&32)||e.button===5);if(er&&e.type==='pointerdown')bump('penEraser');
    last={type:e.type,pt:t,id:e.pointerId,x:Math.round(e.clientX),y:Math.round(e.clientY),p:(e.pressure||0).toFixed(2),b:e.buttons,btn:e.button,w:Math.round(e.width||0),h:Math.round(e.height||0),tx:e.tiltX||0,ty:e.tiltY||0,prim:e.isPrimary,er};
    if(e.type!=='pointermove')note(e.type,t+' #'+e.pointerId+(er?' ERASER':'')+' btn='+e.buttons);
    const r=pad.getBoundingClientRect();
    if(e.type==='pointerdown'){down[e.pointerId]=1;}
    if((e.type==='pointermove'||e.type==='pointerdown')&&(down[e.pointerId])&&e.target===pad){px.fillStyle=er?'#fff':col(t);const rad=2+(e.pressure||.5)*5;px.beginPath();px.arc(e.clientX-r.left,e.clientY-r.top,rad,0,7);px.fill()}
    if(e.type==='pointerup'||e.type==='pointercancel'||e.type==='pointerleave')delete down[e.pointerId];
    if(e.type==='pointermove')draw()};
  const T=e=>{if(!o.contains(e.target))return;bump('touch');note(e.type,e.touches.length+' touch(es)'+(e.touches[0]&&e.touches[0].touchType?' '+e.touches[0].touchType:''))};
  const M=e=>{if(!o.contains(e.target))return;bump('mouse');if(e.type!=='mousemove')note(e.type,'btn='+e.buttons)};
  const pe=['pointerdown','pointermove','pointerup','pointercancel'],te=['touchstart','touchmove','touchend','touchcancel'],me=['mousedown','mousemove','mouseup'];
  pe.forEach(n=>addEventListener(n,P,true));te.forEach(n=>addEventListener(n,T,true));me.forEach(n=>addEventListener(n,M,true));
  function draw(){
    const mq=q=>matchMedia(q).matches;
    const rows=[['PointerEvent supported',!!window.PointerEvent],['Max touch points',navigator.maxTouchPoints],['Primary input',mq('(pointer:fine)')?'fine (mouse/pen)':mq('(pointer:coarse)')?'coarse (touch)':'unknown'],['Can hover',mq('(hover:hover)')]];
    const l=last;
    const live=l?[['Last event',l.type],['Pointer type',l.pt],['Pointer id / primary',l.id+' / '+l.prim],['Position',l.x+', '+l.y],['Pressure',l.p+' (max seen '+maxP.toFixed(2)+')'],['Buttons / button',l.b+' / '+l.btn],['Contact size',l.w+' × '+l.h],['Tilt',l.tx+', '+l.ty],['Eraser end/button',l.er?'YES':'no']]:[['Last event','nothing yet: touch the pad']];
    const tb=a=>'<table style="width:100%;border-collapse:collapse">'+a.map(r=>`<tr><td style="color:#8da2b6;padding:2px 8px 2px 0">${r[0]}</td><td style="font-weight:600">${r[1]}</td></tr>`).join('')+'</table>';
    side.innerHTML='<div style="font-weight:700;margin:2px 0 4px">Browser</div>'+tb(rows)+'<div style="font-weight:700;margin:12px 0 4px">Live</div>'+tb(live)+'<div style="font-weight:700;margin:12px 0 4px">Counts</div>'+tb([['Pointer events',C.pointer+' (pen '+C.pen+', cancelled '+C.cancel+')'],['Touch events',C.touch],['Mouse events',C.mouse],['By type',Object.entries(types).map(x=>x[0]+' '+x[1]).join(', ')||'-'],['Pen-eraser presses',C.penEraser],['Pressure values seen',C.pressure]])+'<div style="font-weight:700;margin:12px 0 4px">Reading</div><div style="color:#c9d6e2">'+verdict()+'</div><div style="font-weight:700;margin:12px 0 4px">Recent events</div><div style="font-family:monospace;font-size:13px;color:#9db0c2">'+(log.join('<br>')||'-')+'</div>'}
  function verdict(){
    if(!C.pointer&&!C.touch&&!C.mouse)return 'No input yet. Touch the pad with a finger, then the marker. If the marker draws nothing here and nothing is counted, the board is likely handling marker input before the browser sees it (a system ink layer). That is a board setting, not something the page can fix.';
    const v=[];
    if(types.pen)v.push('The browser sees PEN input'+(C.pressure?' with pressure':' (no pressure values)')+'. ClassroomBoard can write with it.');
    if(types.touch)v.push('Finger touch arrives as touch pointers.');
    if(types.mouse&&!types.pen&&!types.touch)v.push('Only MOUSE-type input so far. If that came from the marker, the board turns marker input into a mouse. Writing still works, but there is no pressure or eraser-end.');
    if(types.mouse&&(types.pen||types.touch))v.push('Mouse-type input was also seen (some boards send both).');
    if(C.cancel)v.push('Some strokes were cancelled by the system ('+C.cancel+'). Compatibility mode keeps the stroke going where it can.');
    if(!types.pen&&types.touch&&!types.mouse)v.push('Test the marker separately: if it only shows as touch, the board treats marker and finger the same.');
    return v.join(' ')}
  fit();addEventListener('resize',fit);draw();
  function close(){pe.forEach(n=>removeEventListener(n,P,true));te.forEach(n=>removeEventListener(n,T,true));me.forEach(n=>removeEventListener(n,M,true));removeEventListener('resize',fit);o.remove()}
  window.__diagClose=close;
}
window.__openInputDiag=openDiag;
S.input=function(P,re,cl){
  P.append(h('div',{class:'card'},'Writing works with finger, marker, pen and mouse. These tools help find out what your SMART Board sends to the browser.'),
   chk(icfg().compat!==false,v=>setCfg({compat:v}),'Compatibility mode (accept finger, marker, pen and mouse; eraser end of a pen erases; extra touches while writing are ignored)'),
   h('div',{class:'row'},pill('Open pen & touch test',()=>{cl();setTimeout(openDiag,50)},'big sel')),
   h('div',{class:'lbl'},'Open this test on the SMART Board, write on the pad with a finger and then with a marker, and send a photo of the result. Nothing here is saved or sent anywhere.'))};
})();
