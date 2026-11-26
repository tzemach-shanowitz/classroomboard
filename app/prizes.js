/* ===== Prize wheel (Yiddish, 10 segments, spin-again-double) ===== */
(function(){
const DEFP=!window.__legacy?[['⭐','Sticker','A sticker'],['🍬','Candy','A candy'],['🧠','Brain teaser','A brain teaser'],['🎮','Game time','Game time'],['📚','Book pick','Pick a book'],['🪑','Special seat','A special seat'],['🏆','Line leader','Line leader'],['🎵','Song choice','Pick a song'],['🙂','Nice try','Nice try!'],['🔄','Spin again ×2','Spin again and win double!']]:[['🧊','רוביקס־קוביק','רוביקס־קוביק'],['🧠','קאָפּ־חידה','קאָפּ־חידה'],['🍩','דאָנאַט','דאָנאַט'],['🍬','לאַפי־טאָפי','לאַפי־טאָפי'],['💌','נחת־צעטל','אַ נחת־צעטל'],['🍦','אייז־קרעם','אייז־קרעם'],['🥤','סאָדע','אַ סאָדע'],['🥐','דעניש','אַ דעניש'],['🙂','לשמה','לשמה — גאָרנישט!'],['🔄','דריי נאָך אַ מאָל ×2','דריי נאָך אַ מאָל און קריג טאָפּלט וואָס דו האָסט געוואונען!']];
const PC=['#e8590c','#f59f00','#2f9e44','#1971c2','#7048e8','#d6336c','#0c8599','#c2255c','#5c940d','#e67700'];
const get=()=>{const s=Store.get('prizes2',null);return(Array.isArray(s)&&s.length===10)?s:DEFP.map(x=>x.slice())};
function prizeSettings(){modal('Prize wheel settings',(b,c)=>{
  const P=get();const re=()=>{Store.set('prizes2',P);if(Widgets.open.wheel&&Widgets.open.wheel.draw)Widgets.open.wheel.draw()};
  b.append(h('div',{class:'lbl'},'What it spins: '),sel([['prizes','Prize wheel (10 prizes)'],['names','Student names']],Store.get('wheelMode',window.__legacy?'prizes':'names'),v=>{Store.set('wheelMode',v);c();if(Widgets.open.wheel){Widgets.close('wheel');openWheel()}}),
   h('div',{class:'lbl'},'The 10 segments: icon, short name on the wheel, and the full words shown when it is won. Each has the same chance. Segment 10 is the "spin again, double" segment and the others are prizes. Students only see these in Yiddish.'));
  P.forEach((p,i)=>b.append(h('div',{class:'row',style:'flex-wrap:nowrap'},h('div',{style:'width:26px;opacity:.7'},String(i+1)),h('input',{class:'inp',value:p[0],style:'width:70px;text-align:center;font-size:26px',onchange:e=>{p[0]=e.target.value;re()}}),h('input',{class:'inp',value:p[1],dir:'rtl',style:'flex:1;min-width:0',onchange:e=>{p[1]=e.target.value;re()}}),h('input',{class:'inp',value:p[2],dir:'rtl',style:'flex:1.4;min-width:0',onchange:e=>{p[2]=e.target.value;re()}}))));
  b.append(chk(cfg.picker.sound,v=>{cfg.picker.sound=v;saveCfg()},'Sounds'),h('div',{class:'row'},pill('Put back the original 10',()=>{Store.set('prizes2',DEFP.map(x=>x.slice()));c();prizeSettings();if(Widgets.open.wheel&&Widgets.open.wheel.draw)Widgets.open.wheel.draw()})))},{foot:c=>[pill('Done',c,'big sel')]})}
window.openPrizeWheel=function(){
  if(Widgets.open.wheel){Widgets.raise('wheel');return}
  const inst=Widgets.create('wheel',window.__legacy?'דרייט דאָס מזל־רעדל!':'Spin the wheel!',{x:Math.max(10,innerWidth/2-450),y:50,w:Math.min(innerWidth-20,900),h:Math.min(innerHeight-120,600),settings:prizeSettings});
  inst.el.classList.add('light','prz');const body=inst.body;
  if(innerWidth>900&&inst.w.w<640){inst.w.w=Math.min(innerWidth-20,900);inst.w.h=Math.min(innerHeight-120,600);inst.w.x=Math.max(10,innerWidth/2-inst.w.w/2);inst.w.y=50;inst.el.style.cssText+=`;left:${inst.w.x}px;top:${inst.w.y}px;width:${inst.w.w}px;height:${inst.w.h}px`}
  body.style.cssText='display:flex;direction:ltr;gap:12px;padding:4px 14px 12px;overflow:hidden';
  let full=false,prev=null;
  const fsb=h('button',{class:'wbtn',title:'Full screen',html:svgI('full'),onclick:()=>{const e=inst.el;full=!full;if(full){prev=e.getAttribute('style');e.style.cssText+=';left:0!important;top:0!important;width:100vw!important;height:100vh!important;border-radius:0;max-width:none;max-height:none'}else{e.setAttribute('style',prev)}setTimeout(fit,80)}});
  inst.bar.insertBefore(fsb,inst.bar.querySelector('.wbtn'));
  const cv=h('canvas',{width:900,height:900,style:'flex:none;touch-action:none'});
  const panel=h('div',{class:'pzp'});
  const badge=h('div',{class:'pzb'},'');const ico=h('div',{class:'pzi'},'');const txt=h('div',{class:'pzt',dir:'rtl'},'');
  const go=h('button',{class:'pzgo'},window.__legacy?'דרייט!':'Spin!');
  panel.append(badge,ico,txt,go);body.append(cv,panel);
  let ang=0,spinning=false,P=get(),dbl=false,lock=false;
  const fit=()=>{const W=body.clientWidth,H=body.clientHeight;const wide=W>H*1.1;body.style.flexDirection=wide?'row':'column';body.style.alignItems='center';
    const s=wide?Math.max(160,Math.min(H-4,W*.62)):Math.max(160,Math.min(W-4,H*.58));cv.style.width=s+'px';cv.style.height=s+'px';panel.style.fontSize=Math.max(.55,(wide?s:s*.9)/560)+'em';panel.style.width=wide?'auto':'100%'};
  const draw=inst.draw=()=>{P=get();const x=cv.getContext('2d'),W=900,C=W/2,R=420,n=10,seg=2*Math.PI/n;x.clearRect(0,0,W,W);
    for(let i=0;i<n;i++){const a0=ang+i*seg-Math.PI/2,a1=a0+seg;x.beginPath();x.moveTo(C,C);x.arc(C,C,R,a0,a1);x.closePath();x.fillStyle=PC[i];x.fill();x.strokeStyle='#fff';x.lineWidth=5;x.stroke();
      x.save();x.translate(C,C);const mid=a0+seg/2;const fl=Math.cos(mid)<0;x.rotate(mid+(fl?Math.PI:0));const sg=fl?-1:1;x.textBaseline='middle';x.textAlign='center';x.font='64px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';x.fillText(P[i][0],sg*(R-62),0);
      x.fillStyle='#fff';x.font='bold 36px "Segoe UI","Arial Hebrew",Arial,sans-serif';x.direction='rtl';x.textAlign=fl?'left':'right';let t=P[i][1];x.shadowColor='rgba(0,0,0,.35)';x.shadowBlur=4;
      let fs=36;while(x.measureText(t).width>230&&fs>20){fs-=2;x.font='bold '+fs+'px "Segoe UI","Arial Hebrew",Arial,sans-serif'}x.fillText(t,sg*(R-120),0);x.restore()}
    x.beginPath();x.arc(C,C,56,0,7);x.fillStyle='#fff';x.fill();x.strokeStyle='#ddd';x.lineWidth=5;x.stroke();
    x.fillStyle='#222';x.beginPath();x.moveTo(C-30,-4);x.lineTo(C+30,-4);x.lineTo(C,66);x.closePath();x.save();x.translate(0,0);x.restore();
    x.beginPath();x.moveTo(C-34,4);x.lineTo(C+34,4);x.lineTo(C,80);x.closePath();x.fillStyle='#222';x.fill()};
  const tick=()=>{if(!cfg.picker.sound||!Audio_.ctx)return;const c=Audio_.ctx,o=c.createOscillator(),g=c.createGain();o.type='square';o.frequency.value=700;g.gain.setValueAtTime(.05,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.05);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+.06)};
  const fan=()=>{if(!cfg.picker.sound||!Audio_.ctx)return;const c=Audio_.ctx;[784,988,1175,1568].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=f;g.gain.setValueAtTime(.18,c.currentTime+i*.13);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+i*.13+.4);o.connect(g).connect(c.destination);o.start(c.currentTime+i*.13);o.stop(c.currentTime+i*.13+.45)})};
  function once(cb){const n=10,seg=2*Math.PI/n;const i=Math.floor(Math.random()*n);const jit=(Math.random()-.5)*.6;
    const want=-(i+.5+jit)*seg;const a0=ang;const delta=((want-a0)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)+(5+Math.floor(Math.random()*3))*2*Math.PI;
    const dur=4200+Math.random()*1200,t0=performance.now();let last=-1;
    const step=now=>{const k=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-k,3);ang=a0+delta*e;draw();const si=Math.floor((((-ang)%(2*Math.PI))+2*Math.PI)%(2*Math.PI)/seg);if(si!==last){last=si;tick()}
      if(k<1)requestAnimationFrame(step);else cb(i)};requestAnimationFrame(step)}
  function show(i,mult){const p=P[i];ico.textContent=p[0];txt.textContent=(mult>1&&i!==8?mult+' × '+p[1]:p[2]);panel.classList.remove('boom');void panel.offsetWidth;panel.classList.add('boom')}
  function spin(){if(spinning)return;spinning=true;dbl=false;badge.textContent='';ico.textContent='';txt.textContent='';Audio_.unlock();
    const round=()=>once(i=>{if(i===9){dbl=true;badge.textContent=window.__legacy?'דאפל! ×2':'DOUBLE ×2';ico.textContent='🔄';txt.textContent=window.__legacy?'דרייט נאכאמאל!':'Spin again!';fan();setTimeout(round,1600)}
      else{spinning=false;if(dbl)badge.textContent=window.__legacy?'דאפל! ×2':'DOUBLE ×2';show(i,dbl?2:1);fan()}});round()}
  go.onclick=spin;cv.addEventListener('pointerdown',spin);
  new ResizeObserver(()=>fit()).observe(body);fit();draw();
};
window.__prizePick=null;
})();
