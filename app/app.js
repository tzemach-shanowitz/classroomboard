'use strict';
/* ===== ClassroomBoard : core ===== */
const $=(s,r=document)=>r.querySelector(s);
const h=(t,a={},...k)=>{const e=document.createElement(t);for(const[x,v]of Object.entries(a||{})){if(x==='class')e.className=v;else if(x==='html')e.innerHTML=v;else if(x.startsWith('on'))e.addEventListener(x.slice(2),v);else if(v===true)e.setAttribute(x,'');else if(v!==false&&v!=null)e.setAttribute(x,v)}for(const c of k.flat())if(c!=null&&c!==false)e.append(c.nodeType?c:document.createTextNode(c));return e};
const uid=()=>Math.random().toString(36).slice(2,10);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2200)}

/* ---- storage (local now; Store.dirty is the hook for the cloud sync layer) ---- */
const Store={
  p:window.__demo?'scdemo.':'sc.',
  get(k,d){try{const v=localStorage.getItem(this.p+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem(this.p+k,JSON.stringify(v));this.dirty&&this.dirty(k,v);return true}catch(e){toast('Storage full: '+e.name);return false}},
  keys(pre){const r=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith(this.p+pre))r.push(k.slice(this.p.length))}return r},
  del(k){localStorage.removeItem(this.p+k);this.dirty&&this.dirty(k,null)},
  exportAll(){const o={};for(const k of this.keys(''))o[k]=this.get(k);return o},
  importAll(o){for(const[k,v]of Object.entries(o))this.set(k,v)}
};

const LEGACY=!!Store.get('mig.roster1',false);window.__legacy=LEGACY;
if(LEGACY&&!sessionStorage.getItem('lgp')){sessionStorage.setItem('lgp','1');setTimeout(()=>{try{Store.set('mig.roster1',true)}catch(e){}},4000)}
const DEF={
  loc:LEGACY?{name:'Brooklyn, NY',lat:40.6501,lon:-73.9496,tz:'America/New_York'}:{name:'',lat:40.6501,lon:-73.9496,tz:(Intl.DateTimeFormat().resolvedOptions().timeZone||'America/New_York')},
  clock:{date:LEGACY?'heb':'std',style:'num',hour12:true,showAmPm:false,size:6.4,color:'',opacity:1,visible:true,font:LEGACY?'Georgia, "Times New Roman", serif':'-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,system-ui,sans-serif',pos:'tr'},
  bg:{auto:true,lockedId:null,brightness:1,blur:0,dim:.12,custom:[],favs:[],manualId:null,manualDay:null},
  toolbar:{order:LEGACY?['home','whiteboard','timer','schedule','supplies','library','presentations','picker','wheel','behavior','more','anno','settings','full']:['whiteboard','timer','picker','traffic','sound','text','more','settings','home','schedule','supplies','library','presentations','wheel','behavior','anno','full','cast'],hidden:LEGACY?[]:['home','schedule','supplies','library','presentations','wheel','behavior','anno','full','cast'],size:72,opacity:.18,pos:'bottom',hideSecs:5,pinned:!LEGACY},
  labels:LEGACY?{supplies:'וואס דארף מען האבן?',schedule:'סדר היום',picker:'ווער איז דער נעקסטער?',timer:'טײַמער',done:''}:{supplies:'What we need today',schedule:'Schedule',picker:"Who's next?",timer:'Timer',done:"Time's up!"},
  timer:{def:300,presets:[1,2,5,10,15,20],volume:.7,sound:'bell',alarmSecs:6,repeat:false,mute:false,anim:true,repeatN:0,tab:false,autoReset:true,red:true,redMode:'pct',redPct:25,redSec:10,theme:0},
  teach:LEGACY?{start:'13:15',end:'16:00'}:{start:'08:30',end:'15:00'},
  picker:{noRepeat:true,sound:true,size:84,mode:'one',groups:3,wheelRemove:false},
  schedFmt:{h12:true}
};
const cfg=(()=>{const s=Store.get('cfg',{});const m=(d,o)=>{const r={...d};for(const k in o)r[k]=(o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k])&&d[k]&&typeof d[k]==='object')?m(d[k],o[k]):o[k];return r};return m(DEF,s)})();
const saveCfg=()=>Store.set('cfg',cfg);

/* ---- icons ---- */
const IC={
ask:'<text x="12" y="16.4" text-anchor="middle" font-size="11.5" font-weight="800" fill="currentColor" stroke="none" font-family="-apple-system,Inter,Arial,sans-serif">AI</text>',
  mytool:'<path d="M14.7 6.3a4 4 0 0 0-5 5L4 17v3h3l5.7-5.7a4 4 0 0 0 5-5l-2.4 2.4-2.3-.7-.7-2.3z"/>',
home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
whiteboard:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21l4-4 4 4"/><path d="M7 12c2-4 3 2 5-1s3 1 5-2"/>',
timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
schedule:'<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 9h18M8 2v4M16 2v4M8 14h3M8 17h6"/>',
supplies:'<path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5z"/><path d="M12 6.5v13"/>',
library:'<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',
presentations:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8M9 9l5 2-5 2z"/>',
wheel:'<circle cx="12" cy="12" r="9"/><path d="M12 3v9l6.4 6.4M12 12H3.2M12 12l-6.4 6.4M12 12l6.4-6.4"/><path d="M12 1.5l-2 3h4z"/>',
picker:'<circle cx="9" cy="8" r="3.5" r="3.5"/><path d="M2.5 20c0-4 3-6 6.5-6s6.5 2 6.5 6"/><path d="M17 6l1 2 2 .5-1.5 1.5.4 2.2L17 11l-1.9 1.2.4-2.2L14 8.5l2-.5z"/>',
anno:'<path d="M4 20l1-4L17 4l3 3L8 19z"/><path d="M14 7l3 3"/>',
settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 00-.1-1.3l2-1.5-2-3.4-2.3.9a7 7 0 00-2.2-1.3L14 3h-4l-.4 2.4a7 7 0 00-2.2 1.3l-2.3-.9-2 3.4 2 1.5A7 7 0 005 12c0 .4 0 .9.1 1.3l-2 1.5 2 3.4 2.3-.9c.7.6 1.4 1 2.2 1.3L10 21h4l.4-2.4c.8-.3 1.5-.7 2.2-1.3l2.3.9 2-3.4-2-1.5c.1-.4.1-.9.1-1.3z"/>',
behavior:'<circle cx="8" cy="6.5" r="3.4"/><path d="M3 14.5c.6-1.8 2.4-2.8 5-2.8s4.4 1 5 2.8V21H3z"/><path d="M15.5 4.5l1.8 2 3.6-3.8"/><path d="M16 12l5 5M21 12l-5 5"/>',
audio:'<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
traffic:'<rect x="7" y="2.5" width="10" height="19" rx="3"/><circle cx="12" cy="7.5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="16.5" r="1.6"/>',
sound:'<path d="M4 10v4h3l5 4V6l-5 4z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/>',
text:'<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
cast:'<path d="M3 8V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-6"/><path d="M3 12a8 8 0 018 8M3 16a4 4 0 014 4"/><circle cx="3.6" cy="20" r=".8"/>',
full:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
close:'<path d="M6 6l12 12M18 6L6 18"/>',min:'<path d="M5 18h14"/>',pin:'<path d="M12 17v5M8 3h8l-1 7 3 3H6l3-3z"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>',redo:'<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 000 12h3"/>',
trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/>',eraser:'<path d="M3 17l9-11 8 7-6 7H8z"/><path d="M8 20h12"/>',
pen:'<path d="M4 20l1-4L17 4l3 3L8 19z"/>',hl:'<path d="M9 3l6 6-8 8-4 1 1-4z"/><path d="M3 21h18"/>',
touch:'<path d="M9 11V5a2 2 0 014 0v6l5 1v4a6 6 0 01-6 6h-1a6 6 0 01-5-3l-2-4a2 2 0 013-1z"/>'
};
const svgI=n=>`<svg viewBox="0 0 24 24">${IC[n]||(String(n).startsWith('mt_')?IC.mytool:'')}</svg>`;
const svgS=(n,px=26)=>`<svg viewBox="0 0 24 24" style="width:${px}px;height:${px}px;stroke:currentColor;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round">${IC[n]||(String(n).startsWith('mt_')?IC.mytool:'')}</svg>`;

/* ---- date helpers ---- */
const pad=n=>String(n).padStart(2,'0');
const dayKey=(d=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:cfg.loc.tz}).format(d);
function hebNum(n){if(n===15)return'ט״ו';if(n===16)return'ט״ז';const L=['','א','ב','ג','ד','ה','ו','ז','ח','ט'],T=['','י','כ','ל'];const s=(T[Math.floor(n/10)]||'')+(L[n%10]||'');return s.length===1?s+'׳':s.slice(0,-1)+'״'+s.slice(-1)}
function sunsetOn(y,m,d,lat,lon){ // NOAA-style sunset (UTC Date) for civil date y-m-d at lat/lon
  const rad=Math.PI/180;const J0=Date.UTC(y,m-1,d,12)/86400000+2440587.5;const n=Math.round(J0-2451545-0.0009-(-lon)/360);
  const Js=2451545+0.0009+(-lon)/360+n;const M=(357.5291+0.98560028*(Js-2451545))%360;
  const C=1.9148*Math.sin(M*rad)+0.02*Math.sin(2*M*rad)+0.0003*Math.sin(3*M*rad);const Lm=(M+C+180+102.9372)%360;
  const Jt=Js+0.0053*Math.sin(M*rad)-0.0069*Math.sin(2*Lm*rad);const dec=Math.asin(Math.sin(Lm*rad)*Math.sin(23.44*rad));
  const w=Math.acos((Math.sin(-0.833*rad)-Math.sin(lat*rad)*Math.sin(dec))/(Math.cos(lat*rad)*Math.cos(dec)))/rad;
  const Jset=Jt+w/360;return new Date((Jset-2440587.5)*86400000)}
function hebrewDate(now=new Date()){
  let d=now;try{const [y,m,dd]=dayKey(now).split('-').map(Number);const ss=sunsetOn(y,m,dd,cfg.loc.lat,cfg.loc.lon);if(now>=ss)d=new Date(now.getTime()+86400000)}catch(e){}
  const parts=new Intl.DateTimeFormat('he-u-ca-hebrew',{day:'numeric',month:'long',timeZone:cfg.loc.tz}).formatToParts(d);
  const day=+parts.find(p=>p.type==='day').value,mon=parts.find(p=>p.type==='month').value;return hebNum(day)+' '+mon}
function timeStr(d,h12=cfg.clock.hour12,ampm=cfg.clock.showAmPm,sec=false){const p=new Intl.DateTimeFormat('en-US',{timeZone:cfg.loc.tz,hour:'numeric',minute:'2-digit',...(sec?{second:'2-digit'}:{}),hourCycle:h12?'h12':'h23'}).formatToParts(d);let hh=p.find(x=>x.type==='hour').value,mm=p.find(x=>x.type==='minute').value;if(!h12)hh=pad(hh);return hh+':'+mm+(sec?':'+p.find(x=>x.type==='second').value:'')+(h12&&ampm?' '+(p.find(x=>x.type==='dayPeriod')||{value:''}).value:'')}
const nowMinutes=()=>{const p=new Intl.DateTimeFormat('en-US',{timeZone:cfg.loc.tz,hour:'numeric',minute:'numeric',hourCycle:'h23'}).formatToParts(new Date());return (+p.find(x=>x.type==='hour').value%24)*60+ +p.find(x=>x.type==='minute').value};
const toMin=t=>{const[a,b]=t.split(':').map(Number);return a*60+b};
const fmtT=t=>{const m=toMin(t);if(!cfg.schedFmt.h12)return t;const hh=Math.floor(m/60)%12||12;return hh+':'+pad(m%60)};

/* ---- clock ---- */
function renderClock(){
  const c=$('#clock'),k=cfg.clock,now=new Date();
  c.style.display=k.visible?'':'none';c.style.opacity=k.opacity;c.style.color=k.color||'';
  c.style.top=k.pos[0]==='t'?'var(--edge)':'auto';c.style.bottom=k.pos[0]==='b'?'var(--edge)':'auto';
  c.style.right=k.pos[1]==='r'?'var(--edge)':'auto';c.style.left=k.pos[1]==='l'?'var(--edge)':'auto';
  const t=$('#clk-time');{const u=(k.style==='words'?k.size*.8:k.size);t.style.fontSize='calc(min(1vh,1.5vw)*'+u+')';$('#clk-heb').style.fontSize='calc(min(1vh,1.5vw)*'+(u*.4).toFixed(2)+')'}t.style.fontFamily=k.font;
  t.textContent=timeStr(now);
  {const dm=k.date||'heb';let tx='';try{const std=now.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});tx=dm==='std'?std:dm==='both'?std+' · '+hebrewDate(now):dm==='none'?'':hebrewDate(now)}catch(e){tx=hebrewDate(now)}$('#clk-heb').textContent=tx}
}
setInterval(renderClock,1000);

/* ---- backgrounds ---- */
const SCENES=[
 ['Mountain dawn',['#f6c28b','#e48a8a','#5b6b9a','#243a5a'],'mtn'],['Alpine lake',['#cfe6f5','#7fb2d6','#2f6b8a','#143a52'],'lake'],
 ['Forest mist',['#dfe9dd','#9fbfa4','#4c7a5d','#1d3b2d'],'forest'],['Ocean sunset',['#ffd29a','#f58f6f','#a24c7a','#2b2250'],'sea'],
 ['Waterfall valley',['#c9e7e2','#7ec3b5','#2f7d70','#10433d'],'mtn'],['Golden hills',['#ffe7a8','#f3b663','#a86b3a','#4a2f2a'],'hills'],
 ['Blue peaks',['#d6e4f7','#8fabd6','#475f9a','#1c2a54'],'mtn'],['Quiet shore',['#f3e3d3','#cfa9a0','#7a7fa3','#2b3a5e'],'sea']];
function sceneSVG(name,cols,kind){const[a,b,c,d]=cols;let g='';
 if(kind==='mtn')g=`<path d="M0 640 L260 330 L430 520 L650 250 L900 560 L1120 360 L1400 620 L1600 480 V900 H0Z" fill="${c}"/><path d="M0 720 L300 520 L560 700 L820 500 L1100 720 L1400 560 L1600 700 V900 H0Z" fill="${d}" opacity=".9"/>`;
 else if(kind==='lake')g=`<path d="M0 520 L300 300 L520 470 L760 280 L1040 500 L1300 340 L1600 520 V560 H0Z" fill="${c}"/><rect y="560" width="1600" height="340" fill="${d}"/>`;
 else if(kind==='forest'){let t='';for(let i=0;i<28;i++){const x=i*60-20,y=480+((i*53)%120),s=140+((i*37)%90);t+=`<path d="M${x} ${y+s} L${x+40} ${y} L${x+80} ${y+s}Z" fill="${i%2?c:d}"/>`}g=t+`<rect y="760" width="1600" height="140" fill="${d}"/>`}
 else if(kind==='sea')g=`<rect y="560" width="1600" height="340" fill="${c}"/><circle cx="800" cy="560" r="120" fill="#fff" opacity=".85"/><rect y="600" width="1600" height="300" fill="${d}" opacity=".7"/>`+[0,1,2,3,4].map(i=>`<rect x="${300+i*130}" y="${600+i*40}" width="${600-i*100}" height="6" rx="3" fill="#fff" opacity=".35"/>`).join('');
 else g=`<path d="M0 600 Q400 420 800 560 T1600 520 V900 H0Z" fill="${c}"/><path d="M0 700 Q500 560 900 680 T1600 650 V900 H0Z" fill="${d}"/>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".6" stop-color="${b}"/></linearGradient></defs><rect width="1600" height="900" fill="url(#s)"/>${g}</svg>`}
const PHOTOS=['Waterfall in autumn','Misty golden morning','Turquoise alpine lake','Foggy pines','Misty forest trail','Mountain lake','Misty pine hills','Mountain reflection','Snowy mountains'];
const bgList=()=>[...PHOTOS.map((n,i)=>({id:'n'+(i+1),name:n,url:'bg/n'+(i+1)+'.jpg'})),...SCENES.map((s,i)=>({id:'s'+i,name:s[0],url:'data:image/svg+xml;utf8,'+encodeURIComponent(sceneSVG(...s))})),...cfg.bg.custom.map(c=>({id:c.id,name:c.name||'Custom',url:c.url,custom:true}))];
function currentBg(){const L=bgList(),b=cfg.bg,today=dayKey();
 if(b.lockedId){const f=L.find(x=>x.id===b.lockedId);if(f)return f}
 if(b.manualId&&(b.manualDay===today||!b.auto)){const f=L.find(x=>x.id===b.manualId);if(f)return f}
 if(!b.auto)return L[0];
 const pool=b.favs.length&&b.favOnly?L.filter(x=>b.favs.includes(x.id)):(LEGACY?L:L.filter(x=>!/^s\d/.test(x.id)));
 const n=Math.floor(new Date(today+'T12:00:00Z')/86400000);return pool[n%pool.length]}
let bgImgEl=null;
function renderBg(){const b=currentBg(),e=$('#bg');e.style.backgroundImage=`url("${b.url}")`;e.style.filter=`brightness(${cfg.bg.brightness}) blur(${cfg.bg.blur}px)`;$('#bgdim').style.opacity=cfg.bg.dim;
 const img=new Image();img.crossOrigin='anonymous';img.onload=()=>{bgImgEl=img;try{const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d');x.drawImage(img,0,0,16,16);const d=x.getImageData(0,0,16,6).data;let l=0;for(let i=0;i<d.length;i+=4)l+=.299*d[i]+.587*d[i+1]+.114*d[i+2];l/=d.length/4;const eff=l*cfg.bg.brightness*(1-cfg.bg.dim);document.body.classList.toggle('dark-text',eff>185)}catch(e){}};img.src=b.url}

/* ---- daily state (resets each new day; saved data is never touched) ---- */
let day=Store.get('day',{});
const freshDay=()=>({key:dayKey(),supSel:[],pickerHist:[],lastPicks:[]});
if(day.key!==dayKey()){day=freshDay();Store.set('day',day)}
const saveDay=()=>Store.set('day',day);
setInterval(()=>{if(day.key!==dayKey()){resetScreen(true);renderBg();renderClock()}},30000);

/* ---- widget manager ---- */
const WMIN={traffic:[200,330],timer:[300,300],visual:[300,300],stopwatch:[300,220],wheel:[340,420],behavior:[420,300],picker:[300,220],scoreboard:[320,240],poll:[320,260],groups:[360,300],dice:[300,200],sound:[300,200],text:[260,200],calendar:[300,300],countdown:[300,220],schedule:[320,300],supplies:[300,260],cast:[360,320]};
const Widgets={open:{},z:10,
 create(id,title,o={}){
  if(this.open[id]){this.raise(id);return this.open[id]}
  const saved=Store.get('w.'+id,null)||{};
  const w={x:saved.x??(o.x??120),y:saved.y??(o.y??130),w:saved.w??(o.w??420),h:saved.h??(o.h??null)};
  w.x=clamp(w.x,0,Math.max(0,innerWidth-w.w));w.y=clamp(w.y,0,innerHeight-80);
  if(innerWidth<=820){w.w=Math.min(w.w,innerWidth-16);if(w.h)w.h=Math.min(w.h,innerHeight-90);w.x=clamp(w.x,8,Math.max(8,innerWidth-w.w-8));w.y=clamp(w.y,8,Math.max(8,innerHeight-(w.h||300)-90))}
  const el=h('div',{class:'widget glass',style:`left:${w.x}px;top:${w.y}px;width:${w.w}px;${w.h?`height:${w.h}px;`:''}background:rgba(20,34,46,.55);color:#fff`});
  const body=h('div',{class:'wbody'});
  const bar=h('div',{class:'wbar'},h('div',{class:'wt'},title),
   o.settings?h('button',{class:'wbtn',title:'Settings',onclick:o.settings,html:svgI('gear')}):null,
   h('button',{class:'wbtn',title:'Minimize',onclick:()=>el.classList.toggle('min'),html:svgI('min')}),
   h('button',{class:'wbtn',title:'Pin',onclick:e=>{w.pinned=!w.pinned;e.currentTarget.style.background=w.pinned?'rgba(255,255,255,.35)':''},html:svgI('pin')}),
   h('button',{class:'wbtn',title:'Close',onclick:()=>this.close(id),html:svgI('close')}));
  const rs=h('div',{class:'wresize'});
  el.append(bar,body,rs);$('#widgets').append(el);try{new ResizeObserver(()=>el.classList.toggle('nar',el.offsetWidth<340)).observe(el)}catch(e){}
  const inst={el,body,w,bar,onclose:o.onclose};this.open[id]=inst;this.raise(id);
  bar.addEventListener('pointerdown',e=>{if(e.target.closest('button')||w.pinned)return;bar.setPointerCapture(e.pointerId);const sx=e.clientX-w.x,sy=e.clientY-w.y;const mv=ev=>{w.x=clamp(ev.clientX-sx,-el.offsetWidth+100,innerWidth-100);w.y=clamp(ev.clientY-sy,0,innerHeight-60);el.style.left=w.x+'px';el.style.top=w.y+'px'};const up=()=>{bar.removeEventListener('pointermove',mv);bar.removeEventListener('pointerup',up);this.save(id)};bar.addEventListener('pointermove',mv);bar.addEventListener('pointerup',up)});
  rs.addEventListener('pointerdown',e=>{if(w.pinned)return;e.stopPropagation();rs.setPointerCapture(e.pointerId);const sx=e.clientX,sy=e.clientY,ow=el.offsetWidth,oh=el.offsetHeight,ox=w.x;const mv=ev=>{const dx=ev.clientX-sx,dy=ev.clientY-sy;w.w=Math.max((WMIN[id]||[260])[0],ow-dx);w.x=ox+(ow-w.w);w.h=Math.max((WMIN[id]||[0,200])[1],oh+dy);el.style.width=w.w+'px';el.style.height=w.h+'px';el.style.left=w.x+'px'};const up=()=>{rs.removeEventListener('pointermove',mv);rs.removeEventListener('pointerup',up);this.save(id)};rs.addEventListener('pointermove',mv);rs.addEventListener('pointerup',up)});
  el.addEventListener('pointerdown',()=>this.raise(id));
  /* second resize handle (bottom-right) + two-finger pinch to resize */
  const rs2=h('div',{class:'wresize r2'});el.append(rs2);
  rs2.addEventListener('pointerdown',e=>{if(w.pinned)return;e.stopPropagation();rs2.setPointerCapture(e.pointerId);const sx=e.clientX,sy=e.clientY,ow=el.offsetWidth,oh=el.offsetHeight;const mv=ev=>{w.w=Math.max((WMIN[id]||[260])[0],ow+ev.clientX-sx);w.h=Math.max((WMIN[id]||[0,200])[1],oh+ev.clientY-sy);el.style.width=w.w+'px';el.style.height=w.h+'px'};const up=()=>{rs2.removeEventListener('pointermove',mv);rs2.removeEventListener('pointerup',up);rs2.removeEventListener('pointercancel',up);this.save(id)};rs2.addEventListener('pointermove',mv);rs2.addEventListener('pointerup',up);rs2.addEventListener('pointercancel',up)});
  const ptrs=new Map();let pinch=null;
  el.addEventListener('pointerdown',e=>{if(w.pinned)return;ptrs.set(e.pointerId,[e.clientX,e.clientY]);if(ptrs.size===2){const[p,q]=[...ptrs.values()];pinch={d:Math.hypot(p[0]-q[0],p[1]-q[1])||1,w:el.offsetWidth,h:el.offsetHeight}}},true);
  el.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,[e.clientX,e.clientY]);if(pinch&&ptrs.size>=2){const[p,q]=[...ptrs.values()];const k=Math.hypot(p[0]-q[0],p[1]-q[1])/pinch.d;w.w=clamp(pinch.w*k,220,innerWidth*1.2);w.h=clamp(pinch.h*k,90,innerHeight*1.2);el.style.width=w.w+'px';el.style.height=w.h+'px'}},true);
  const pend=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2&&pinch){pinch=null;this.save(id)}};el.addEventListener('pointerup',pend,true);el.addEventListener('pointercancel',pend,true);
  toolbarState();return inst},
 raise(id){const i=this.open[id];if(i)i.el.style.zIndex=++this.z},
 save(id){const i=this.open[id];if(!i)return;const{x,y,w,h:hh}=i.w;Store.set('w.'+id,{x,y,w,h:hh})},
 close(id){const i=this.open[id];if(!i)return;try{i.onclose&&i.onclose()}catch(e){}i.el.remove();delete this.open[id];toolbarState()},
 closeAll(){Object.keys(this.open).forEach(k=>this.close(k))}
};

/* ---- modal + form helpers ---- */
function modal(title,build,{rtl=false,foot=null,onclose,headSave=null}={}){
  const root=$('#modal-root');const body=h('div',{class:'mbody'});
  const close=()=>{scrim.remove();onclose&&onclose()};
  const m=h('div',{class:'modal glass'+(rtl?' rtl':'')},h('div',{class:'mhead'},h('h2',{},title),...(headSave?[h('button',{class:'pill sel mhsave',type:'button',onclick:()=>{try{document.activeElement&&document.activeElement.blur()}catch(e){}headSave(close)}},'Save'),h('button',{class:'pill mhclose',type:'button',onclick:close},'Close')]:[h('button',{class:'wbtn',onclick:close,html:svgI('close')})])),body,foot?h('div',{class:'mfoot'},foot(close)):null);
  const scrim=h('div',{class:'scrim'},m);scrim.addEventListener('pointerdown',e=>{if(e.target===scrim)close()});root.append(scrim);build(body,close);return{body,close}}
const pill=(t,f,c='')=>h('button',{class:'pill '+c,onclick:f},t);
const field=(label,input)=>h('div',{},h('div',{class:'lbl'},label),input);
const numInp=(v,f,o={})=>h('input',{class:'inp',type:'number',value:v,min:o.min,max:o.max,step:o.step||1,style:'width:'+(o.w||110)+'px',onchange:e=>f(+e.target.value)});
const txtInp=(v,f,o={})=>h('input',{class:'inp',type:'text',value:v||'',placeholder:o.ph||'',style:o.style||'',dir:o.dir||'auto',onchange:e=>f(e.target.value)});
const chk=(v,f,l)=>h('label',{class:'row',style:'font-size:18px'},h('input',{type:'checkbox',checked:!!v,style:'width:26px;height:26px',onchange:e=>f(e.target.checked)}),l);
const range=(v,f,min,max,step)=>h('input',{type:'range',min,max,step,value:v,style:'width:220px',oninput:e=>f(+e.target.value)});
function ask(title,def,cb){modal(title,(b,c)=>{const i=h('input',{class:'inp',style:'width:100%',value:def||'',dir:'auto'});b.append(i,h('div',{class:'row'},pill('OK',()=>{c();cb(i.value)},'big sel'),pill('Cancel',c,'big')));setTimeout(()=>i.focus(),50)})}
function sure(title,cb){modal(title,(b,c)=>b.append(h('div',{class:'row'},pill('Yes',()=>{c();cb()},'danger big'),pill('Cancel',c,'big'))))}

/* ===== INK ENGINE (whiteboard + annotation overlay) ===== */
const Ink={
 cv:null,ctx:null,ctxKey:null,strokes:[],redo:[],cur:null,tool:'pen',dash:'solid',color:'#ffffff',size:7,mode:'off',visible:true,wb:null,
 init(){this.cv=$('#ink');this.ctx=this.cv.getContext('2d');const rs=()=>{const r=devicePixelRatio||1;this.cv.width=innerWidth*r;this.cv.height=innerHeight*r;this.redraw()};addEventListener('resize',rs);rs();
  const c=this.cv;c.addEventListener('pointerdown',e=>this.down(e));c.addEventListener('pointermove',e=>this.move(e));c.addEventListener('pointerup',e=>this.up(e));c.addEventListener('pointercancel',e=>this.up(e));c.addEventListener('contextmenu',e=>e.preventDefault())},
 pt(e){return[e.clientX/innerWidth,e.clientY/innerHeight]},
 btnAt(e){for(const b of document.querySelectorAll('button,.pill,a.pill,input,select')){if(this.cv.contains(b)||b.closest('.widget')||!b.offsetParent&&getComputedStyle(b).position!=='fixed')continue;const r=b.getBoundingClientRect();if(r.width&&r.height&&e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom&&getComputedStyle(b).visibility!=='hidden'){const t=document.elementFromPoint(e.clientX,e.clientY);if(t===this.cv||!t)return b}}return null},
 down(e){if(this.mode!=='write')return;const bt=this.btnAt(e);if(bt){e.preventDefault();this.bt=bt;return}e.preventDefault();try{this.cv.setPointerCapture(e.pointerId)}catch(_){}const er=this.tool==='eraser';this.cur={tool:this.tool,color:this.color,dash:this.dash,size:this.tool==='hl'?this.size*4:this.size,pts:[this.pt(e)]};if(er)this.eraseAt(e);else this.redo=[]},
 move(e){if(!this.cur)return;let evs=e.getCoalescedEvents?e.getCoalescedEvents():[];if(!evs.length)evs=[e];if(this.cur.tool==='eraser'){evs.forEach(x=>this.eraseAt(x));return}if(SHAPES.includes(this.cur.tool)){this.cur.pts=[this.cur.pts[0],this.pt(e)]}else for(const x of evs)this.cur.pts.push(this.pt(x));this.redraw()},
 up(e){if(this.bt){const b=this.bt;this.bt=null;if(e&&e.type==='pointerup'){const r=b.getBoundingClientRect();if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)b.click()}return}if(!this.cur)return;if(this.cur.tool!=='eraser'&&this.cur.pts.length)this.strokes.push(this.cur);const wasErase=this.cur.tool==='eraser';this.cur=null;this.redraw();this.persist()},
 eraseAt(e){const x=e.clientX,y=e.clientY,r=Math.max(this.size*4+10,this.palmR||0);const n=this.strokes.length;this.strokes=this.strokes.filter(s=>!s.pts.some(p=>Math.hypot(p[0]*innerWidth-x,p[1]*innerHeight-y)<r));if(this.strokes.length!==n)this.redraw()},
 drawStroke(s){const x=this.ctx,r=devicePixelRatio||1,W=innerWidth*r,Hh=innerHeight*r;x.save();x.lineCap=x.lineJoin='round';x.strokeStyle=s.color;x.lineWidth=s.size*r;if(s.tool==='hl'){x.globalAlpha=.4}if(s.dash==='dash')x.setLineDash([s.size*r*3,s.size*r*2]);else if(s.dash==='dot'){x.setLineDash([1,s.size*r*2])}
  if(SHAPES.includes(s.tool)&&s.pts.length>1){const[a0,b0]=s.pts,X0=a0[0]*W,Y0=a0[1]*Hh,X1=b0[0]*W,Y1=b0[1]*Hh;x.beginPath();if(s.tool==='rect')x.rect(X0,Y0,X1-X0,Y1-Y0);else if(s.tool==='circle')x.ellipse((X0+X1)/2,(Y0+Y1)/2,Math.abs(X1-X0)/2,Math.abs(Y1-Y0)/2,0,0,7);else{x.moveTo(X0,Y0);x.lineTo(X1,Y1);if(s.tool==='arrow'){const an=Math.atan2(Y1-Y0,X1-X0),L=Math.max(18*r,s.size*r*4);x.moveTo(X1,Y1);x.lineTo(X1-L*Math.cos(an-.45),Y1-L*Math.sin(an-.45));x.moveTo(X1,Y1);x.lineTo(X1-L*Math.cos(an+.45),Y1-L*Math.sin(an+.45))}}x.stroke();x.restore();return}

  const p=s.pts;if(p.length===1){x.beginPath();x.arc(p[0][0]*W,p[0][1]*Hh,s.size*r/2,0,7);x.fillStyle=s.color;x.fill()}else{x.beginPath();x.moveTo(p[0][0]*W,p[0][1]*Hh);for(let i=1;i<p.length-1;i++){const mx=(p[i][0]+p[i+1][0])/2*W,my=(p[i][1]+p[i+1][1])/2*Hh;x.quadraticCurveTo(p[i][0]*W,p[i][1]*Hh,mx,my)}const l=p[p.length-1];x.lineTo(l[0]*W,l[1]*Hh);x.stroke()}x.restore()},
 drawBg(){if(!this.wb)return;const x=this.ctx,r=devicePixelRatio||1,W=innerWidth*r,Hh=innerHeight*r;x.save();x.fillStyle=this.wb.dark?'#14202b':'#fbfbf6';x.fillRect(0,0,W,Hh);x.strokeStyle=this.wb.dark?'rgba(255,255,255,.14)':'rgba(30,60,110,.22)';x.lineWidth=1.5*r;const kind=this.wb.bg;if(kind==='lined'){for(let y=90*r;y<Hh;y+=64*r){x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke()}}else if(kind==='grid'){for(let y=0;y<Hh;y+=64*r){x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke()}for(let xx=0;xx<W;xx+=64*r){x.beginPath();x.moveTo(xx,0);x.lineTo(xx,Hh);x.stroke()}}x.restore()},
 redraw(){const x=this.ctx;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,this.cv.width,this.cv.height);this.drawBg();if(!this.visible)return;for(const s of this.strokes)this.drawStroke(s);if(this.cur&&this.cur.tool!=='eraser')this.drawStroke(this.cur)},
 setMode(m){this.mode=m;this.cv.classList.toggle('on',m==='write');renderAnnoBar();toolbarState()},
 undo(){const s=this.strokes.pop();if(s){this.redo.push(s);this.redraw();this.persist()}},
 doRedo(){const s=this.redo.pop();if(s){this.strokes.push(s);this.redraw();this.persist()}},
 clear(){this.redo=[];this.strokes=[];this.redraw();this.persist()},
 persist(){if(!this.ctxKey)return;if(this.wb){Store.set(this.ctxKey,{id:this.wb.id,name:this.wb.name,bg:this.wb.bg,dark:this.wb.dark,page:this.wb.page,group:this.wb.group,updated:Date.now(),strokes:this.strokes})}else Store.set(this.ctxKey,this.strokes)}
};

const SHAPES=['line','arrow','rect','circle'];
const COLORS=['#111111','#ff4d4d','#ff9f1c','#ffe14d','#3ddc84','#22d3ee','#4dabff','#b57bff','#ff5fb0','#ffffff'];
if(typeof Ink.barMin==='undefined')Ink.barMin=innerWidth<=820;
function renderAnnoBar(){const b=$('#annobar');if(Ink.mode==='off'){b.classList.add('hidden');return}
 b.classList.remove('hidden');b.innerHTML='';b.classList.toggle('mini',!!Ink.barMin);
 if(Ink.barMin){b.append(h('button',{class:'pill',title:'Show all drawing tools',style:'width:50px;padding:0;justify-content:center;font-size:22px',onclick:()=>{Ink.barMin=false;renderAnnoBar()}},'✎'),h('div',{class:'sw sel',style:`background:${Ink.tool==='eraser'?'#999':Ink.color};width:30px;height:30px`,onclick:()=>{Ink.barMin=false;renderAnnoBar()}}),h('button',{class:'pill',title:'Undo',style:'width:50px;padding:0;justify-content:center',onclick:()=>Ink.undo(),html:svgS('undo',24)}),h('button',{class:'pill',title:'Stop drawing',style:'width:50px;padding:0;justify-content:center',onclick:()=>{if(App.wb)exitWhiteboard();else Ink.setMode('off')},html:svgS('close',24)}));return}
 const P=(t,x)=>h('button',{'aria-label':t,class:'pill'+(x.on?' sel':''),title:t,style:'width:50px;padding:0;justify-content:center;font-size:24px',onclick:x.fn,...(x.svg?{html:x.svg}:{})},x.g||'');
 const wr=Ink.mode==='write',isSh=SHAPES.includes(Ink.tool),SG={line:'／',arrow:'↗',rect:'▭',circle:'◯'};
 const tool=(t,i)=>P(({pen:'Pen',hl:'Highlighter',eraser:'Eraser'})[t]||t,{on:wr&&Ink.tool===t,svg:svgS(i),fn:()=>{Ink.tool=t;Ink.setMode('write')}});
 const col=c=>h('div',{class:'sw'+(Ink.color===c&&Ink.tool!=='eraser'?' sel':''),style:`background:${c}`,onclick:()=>{Ink.color=c;if(Ink.tool==='eraser')Ink.tool='pen';Ink.setMode('write')}});
 b.append(P('Shrink',{g:'▁',fn:()=>{Ink.barMin=true;renderAnnoBar()}}),tool('pen','pen'),tool('hl','hl'),tool('eraser','eraser'),
  P('Shapes (tap to change)',{on:wr&&isSh,g:SG[isSh?Ink.tool:'rect'],fn:()=>{const i=isSh?(SHAPES.indexOf(Ink.tool)+1)%4:0;Ink.tool=SHAPES[i];Ink.setMode('write')}}),
  h('span',{class:'sep'}),...COLORS.map(col),
  h('input',{type:'color',value:'#ff2d95',title:'Custom color',style:'width:36px;height:36px;border:0;background:none;padding:0',oninput:e=>{Ink.color=e.target.value;if(Ink.tool==='eraser')Ink.tool='pen'},onchange:()=>Ink.setMode('write')}),
  h('span',{class:'sep'}),...[3,7,14].map(n=>h('button',{class:'pill'+(Ink.size===n?' sel':''),style:'width:46px;padding:0;justify-content:center',onclick:()=>{Ink.size=n;renderAnnoBar()}},h('span',{style:`display:block;border-radius:50%;background:currentColor;width:${n+4}px;height:${n+4}px`}))),
  h('span',{class:'sep'}),P('Undo',{svg:svgS('undo',24),fn:()=>Ink.undo()}),h('button',{class:'pill danger',title:'Clear',style:'width:50px;padding:0;justify-content:center',onclick:()=>sure('Clear all writing on this screen?',()=>Ink.clear()),html:svgS('trash',24)}),
  P('Done',{svg:svgS('close',24),fn:()=>{if(App.wb)exitWhiteboard();else Ink.setMode('off')}}))}
function restoreAnno(){const k=Ink.ctxKey||'anno.home';const s=Store.get(k,[]);if(!Array.isArray(s)||!s.length)return toast('No saved handwriting');Ink.ctxKey=k;Ink.strokes=s;Ink.visible=true;Ink.redraw();toast('Restored')}
function exportInk(){const c=document.createElement('canvas');c.width=Ink.cv.width;c.height=Ink.cv.height;const x=c.getContext('2d');if(!App.wb&&bgImgEl){try{x.drawImage(bgImgEl,0,0,c.width,c.height)}catch(e){}}x.drawImage(Ink.cv,0,0);let url;try{url=c.toDataURL('image/png')}catch(e){return toast('Export blocked for this background')}const a=h('a',{download:(App.wb?App.wb.name:'writing')+'.png',href:url});document.body.append(a);a.click();a.remove()}

/* ===== App / modes ===== */
const App={wb:null};
function resetScreen(auto){Widgets.closeAll();if(App.wb)exitWhiteboard();$('#app-main').innerHTML='';Ink.setMode('off');Ink.strokes=[];Ink.ctxKey=null;Ink.visible=true;Ink.redraw();day=freshDay();saveDay();toolbarState();if(!auto)toast('Screen reset. Nothing was deleted.')}

/* ---- whiteboard ---- */
const wbList=()=>Store.keys('wb.').map(k=>({key:k,...Store.get(k,{})})).filter(x=>x.id).sort((a,b)=>b.updated-a.updated);
function enterWhiteboard(id){
  if(App.wb)Ink.persist();$('#app-main').innerHTML='';
  let m=id?Store.get('wb.'+id):null;
  if(!m){const n=wbList().length+1;m={id:uid(),name:'Whiteboard '+n,bg:'plain',dark:false,page:1,strokes:[],updated:Date.now()};Store.set('wb.'+m.id,m)}
  App.wb={id:m.id,name:m.name,bg:m.bg,dark:m.dark,page:m.page||1,group:m.group};Ink.wb=App.wb;Ink.ctxKey='wb.'+m.id;Ink.strokes=m.strokes||[];Ink.redo=[];Ink.visible=true;Ink.color=m.dark?'#ffffff':'#111111';Ink.setMode('write');Ink.redraw();wbPanel();
}
function wbPanel(){let host=$('#wbhost');if(!host){host=h('div',{id:'wbhost',style:'position:fixed;inset:0;z-index:30;pointer-events:none'});document.body.append(host)}host.innerHTML='';const wb=App.wb;document.body.classList.toggle('wbmode',!!wb);document.body.classList.toggle('wblight',!!wb&&!wb.dark);if(!wb)return;
 const p=h('div',{class:'wbpages glass'});
 p.append(pill('＋ Page',()=>{Ink.persist();const nm=wb.name.replace(/ \(p\d+\)$/,'');const nid=uid();Store.set('wb.'+nid,{id:nid,name:nm+' (p'+(wb.page+1)+')',bg:wb.bg,dark:wb.dark,page:wb.page+1,strokes:[],group:wb.group||wb.id,updated:Date.now()});enterWhiteboard(nid)}),
  pill('Paper: '+wb.bg,()=>{wb.bg={plain:'lined',lined:'grid',grid:'plain'}[wb.bg];Ink.redraw();Ink.persist();wbPanel()}),
  pill(wb.dark?'Dark':'Light',()=>{wb.dark=!wb.dark;Ink.color=wb.dark?'#ffffff':'#111111';Ink.redraw();Ink.persist();wbPanel();renderAnnoBar()}),
  pill('Library',()=>wbLibrary()),pill('Rename',()=>ask('Rename whiteboard',wb.name,v=>{wb.name=v||wb.name;Ink.persist();toast('Saved')})));
 p.style.pointerEvents='auto';host.append(p);renderAnnoBar();toolbarState()}
function exitWhiteboard(){if(!App.wb)return;document.body.classList.remove('wbmode','wblight');Ink.persist();App.wb=null;Ink.wb=null;Ink.ctxKey=null;Ink.strokes=[];Ink.setMode('off');Ink.redraw();$('#app-main').innerHTML='';const wh=$('#wbhost');if(wh)wh.innerHTML='';toolbarState()}
function wbLibrary(){modal('Saved whiteboards',(b,c)=>{const draw=()=>{b.innerHTML='';const L=wbList();if(!L.length)b.append('No saved whiteboards yet.');L.forEach(m=>b.append(h('div',{class:'item'},h('div',{class:'grow'},m.name,h('div',{class:'lbl'},new Date(m.updated).toLocaleString())),pill('Open',()=>{c();enterWhiteboard(m.id)}),pill('Delete',()=>sure('Delete "'+m.name+'"?',()=>{Store.del('wb.'+m.id);if(App.wb&&App.wb.id===m.id)exitWhiteboard();draw()}),'danger'))))};draw()})}

/* ---- timer ---- */
const Audio_={ctx:null,unlock(){try{this.ctx=this.ctx||new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume()}catch(e){}},
 tick(vol,hi){this.unlock();if(!this.ctx||cfg.timer.mute)return;const ctx=this.ctx,t=ctx.currentTime+.01,o=ctx.createOscillator(),g=ctx.createGain();o.type='square';o.frequency.value=hi?2200:1500;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.5*(vol||.7),t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+.06);o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+.08)},
 play(kind,vol,secs,repeat){this.unlock();if(!this.ctx||cfg.timer.mute)return()=>{};let stop=false,tm;const ctx=this.ctx;const end=Date.now()+secs*1000;
  const tone=(f,t,d,v)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=kind==='chime'?'sine':kind==='beep'?'square':'triangle';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*vol*.5,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+d+.05);
   if(kind==='bell'){const o2=ctx.createOscillator(),g2=ctx.createGain();o2.type='sine';o2.frequency.value=f*2.76;g2.gain.setValueAtTime(v*vol*.2,t);g2.gain.exponentialRampToValueAtTime(.0001,t+d*.6);o2.connect(g2).connect(ctx.destination);o2.start(t);o2.stop(t+d)}};
  const seq=()=>{const t=ctx.currentTime+.05;const N={bell:[880,1175,1568],chime:[784,988,1175,1568],beep:[1000,1000,1000]}[kind]||[880,1175,1568];N.forEach((f,i)=>tone(f,t+i*.28,1.2,1))};
  const loop=()=>{if(stop)return;seq();if(repeat&&Date.now()<end)tm=setTimeout(loop,2200)};loop();return()=>{stop=true;clearTimeout(tm)}}};
const TimerW={left:300,total:300,running:false,end:0,iv:null,stopAlarm:null,done:false,repeatsLeft:0};
const THEMES=[['#5b4bdb','Purple'],['#1f9d6b','Green'],['#e8890c','Orange'],['#d6458f','Pink'],['#2b7fd4','Blue'],['#12a3a3','Teal'],['#c9a400','Gold'],['glass','Glass']];
function openTimer(){
  if(Widgets.open.timer){Widgets.raise('timer');return}
  const inst=Widgets.create('timer',cfg.labels.timer,{x:innerWidth-(Math.min(Math.max(380,innerWidth*.22),640)+140),y:150,w:Math.round(Math.min(Math.max(380,innerWidth*.22),640)),h:Math.round(Math.min(Math.max(380,innerWidth*.22),640)*1.47),onclose:()=>{clearInterval(TimerW.iv);TimerW.running=false;TimerW.stopAlarm&&TimerW.stopAlarm();TimerW.done=false;TimerW.stopAlarm=null;document.title='ClassroomBoard'},settings:timerSettings});
  const th=THEMES[cfg.timer.theme]||THEMES[0];
  if(th[0]!=='glass')inst.el.classList.add('light');
  inst.el.style.setProperty('--tacc',th[0]==='glass'?'#7cc4ff':th[0]);
  if(!TimerW.running&&!TimerW.done){TimerW.left=TimerW.total=cfg.timer.def;TimerW.repeatsLeft=cfg.timer.repeatN||0}
  const body=inst.body;body.classList.add('tbody');body.style.direction='ltr';
  const mmE=h('span',{class:'tnum'}),ssE=h('span',{class:'tnum'});
  const pm=(d,sg)=>h('button',{class:'tpm',title:(sg>0?'More ':'Less ')+(d===60?'minutes':'seconds'),onclick:()=>setT((TimerW.running?TimerW.left:TimerW.total)+sg*d)},sg>0?'+':'−');
  const col=(e,d)=>h('div',{style:'display:flex;flex-direction:column;align-items:center'},pm(d,1),e,pm(d,-1));
  const num=h('div',{style:'display:flex;align-items:center;gap:2px;direction:ltr'},col(mmE,60),h('span',{class:'tnum',style:'margin-top:-4px'},':'),col(ssE,5));
  const R=100,CIR=2*Math.PI*R;
  const ringwrap=h('div',{class:'ringwrap',html:`<svg viewBox="0 0 240 240"><circle class="bgc" cx="120" cy="120" r="${R}"/><circle class="fgc" cx="120" cy="120" r="${R}" stroke-dasharray="${CIR}" stroke-dashoffset="0" transform="rotate(-90 120 120)"/></svg>`},h('div',{class:'tcenter'},num));
  const fg=ringwrap.querySelector('.fgc');
  const mini=h('div',{class:'minirow'},h('div',{class:'minicirc',onclick:()=>start(),style:'cursor:pointer',html:`<svg viewBox="0 0 40 40"><circle class="bgc" cx="20" cy="20" r="16"/><circle class="fgc" cx="20" cy="20" r="16" stroke-dasharray="${2*Math.PI*16}" stroke-dashoffset="0" transform="rotate(-90 20 20)"/></svg>`}),h('div',{class:'mininum'}));
  const fg2=mini.querySelector('.fgc'),mn=mini.querySelector('.mininum');
  const playB=h('button',{class:'tbtn play','aria-label':'Start or pause the timer',title:'Start or pause',onclick:()=>start()}),stopB=h('button',{class:'tbtn stop',title:'Stop',onclick:()=>setT(cfg.timer.def)},h('span',{class:'sq'}));
  const ctrl=h('div',{class:'tctrl'},playB,stopB);
  const presets=h('div',{class:'tpresets'},...cfg.timer.presets.map(m=>h('button',{class:'tpre',onclick:()=>setT(m*60)},m+'m')));
  body.append(ringwrap,mini,ctrl,presets);
  const paint=()=>{const m=Math.floor(TimerW.left/60),s2=TimerW.left%60;const t=pad(m)+':'+pad(s2);mmE.textContent=pad(m);ssE.textContent=pad(s2);mn.textContent=t;const frac=TimerW.total?TimerW.left/TimerW.total:0;
   fg.style.strokeDashoffset=CIR*(1-frac);fg2.style.strokeDashoffset=2*Math.PI*16*(1-frac);
   const red=cfg.timer.red&&(TimerW.running||TimerW.left<TimerW.total)&&TimerW.left>0&&(cfg.timer.redMode==='sec'?TimerW.left<=cfg.timer.redSec:frac*100<=cfg.timer.redPct);
   inst.el.classList.toggle('red',!!red);inst.el.classList.toggle('warny',TimerW.running&&TimerW.left>=1&&TimerW.left<=10);
   playB.innerHTML=TimerW.running?'<span class="pz"></span>':'<span class="pl"></span>';playB.setAttribute('aria-label',TimerW.running?'Pause the timer':'Start the timer');
   if(cfg.timer.tab)document.title=(TimerW.running?t+' · ':'')+'ClassroomBoard'};
  inst.paint=paint;
  const fit=()=>{if(inst.el.classList.contains('compact'))return;const bw=body.clientWidth-24,gap=8;const used=ctrl.offsetHeight+presets.offsetHeight+gap*3;const sz=Math.floor(Math.max(120,Math.min(bw,body.clientHeight-used,900)));ringwrap.style.width=sz+'px';body.style.setProperty('--rs',sz+'px')};
  const ro=new ResizeObserver(()=>{inst.el.classList.toggle('compact',inst.el.offsetWidth<330||inst.el.offsetHeight<250);fit()});ro.observe(inst.el);setTimeout(fit,60);
  const clearDone=()=>{const d=body.querySelector('.donebox');d&&d.remove();inst.el.classList.remove('done','dflash')};
  function setT(sec){TimerW.running=false;clearInterval(TimerW.iv);TimerW.total=TimerW.left=clamp(sec,5,5999);TimerW.done=false;TimerW.repeatsLeft=cfg.timer.repeatN||0;clearDone();TimerW.stopAlarm&&TimerW.stopAlarm();paint()}
  function finish(){clearInterval(TimerW.iv);TimerW.running=false;TimerW.done=true;inst.el.classList.remove('warny');inst.el.classList.add('dflash');if(cfg.timer.anim)inst.el.classList.add('done');TimerW.stopAlarm=Audio_.play(cfg.timer.sound,cfg.timer.volume,cfg.timer.alarmSecs,cfg.timer.repeat);
   if(TimerW.repeatsLeft>0){TimerW.repeatsLeft--;setTimeout(()=>{if(!Widgets.open.timer)return;TimerW.done=false;clearDone();TimerW.left=TimerW.total;start()},Math.max(1500,cfg.timer.alarmSecs*1000))}else showDone(inst)}
  function start(){Audio_.unlock();if(TimerW.done){TimerW.done=false;clearDone();TimerW.left=TimerW.total}if(TimerW.running){TimerW.running=false;clearInterval(TimerW.iv);paint();return}if(TimerW.left<=0)TimerW.left=TimerW.total;TimerW.running=true;TimerW.end=Date.now()+TimerW.left*1000;clearInterval(TimerW.iv);
   TimerW.iv=setInterval(()=>{TimerW.left=Math.max(0,Math.ceil((TimerW.end-Date.now())/1000));paint();if(TimerW.left>=1&&TimerW.left<=10&&TimerW.tk!==TimerW.left){TimerW.tk=TimerW.left;try{Audio_.tick(cfg.timer.volume,TimerW.left<=3)}catch(e){}}if(TimerW.left<=0)finish()},200);paint()}
  inst.setT=setT;paint();
}
function showDone(inst){const b=h('div',{class:'donebox'},cfg.labels.done?h('div',{class:'donemsg',dir:'auto'},cfg.labels.done):null,h('button',{class:'tbtn okb',onclick:()=>{TimerW.stopAlarm&&TimerW.stopAlarm();inst.el.classList.remove('done','dflash');b.remove();TimerW.done=false;if(cfg.timer.autoReset)TimerW.left=TimerW.total;inst.paint()}},'OK'));inst.body.append(b);inst.el.classList.remove('min')}
function timerSettings(){modal('Timer settings',(b,c)=>{const t=cfg.timer;const re=()=>{Widgets.open.timer&&Widgets.open.timer.paint&&Widgets.open.timer.paint()};
 const redraw=()=>{b.innerHTML='';
 b.append(field('Timer sound',h('div',{class:'row'},sel([['bell','Bell'],['chime','Chime'],['beep','Beep']],t.sound,v=>{t.sound=v;saveCfg()}),pill('🔊 Preview',()=>Audio_.play(t.sound,t.volume,1.5,false)))),
 field('Volume',range(t.volume,v=>{t.volume=v;saveCfg()},0,1,.05)),field('Alarm length (seconds)',numInp(t.alarmSecs,v=>{t.alarmSecs=v;saveCfg()},{min:1,max:60})),
 field('Repeat the timer this many times',numInp(t.repeatN,v=>{t.repeatN=Math.max(0,v);saveCfg()},{min:0,max:20})),
 chk(t.repeat,v=>{t.repeat=v;saveCfg()},'Repeat the alarm sound until dismissed or time is up'),chk(t.mute,v=>{t.mute=v;saveCfg()},'Mute'),chk(t.anim,v=>{t.anim=v;saveCfg()},'Completion animation'),
 chk(t.tab,v=>{t.tab=v;saveCfg()},'Show time in the browser tab'),chk(t.autoReset,v=>{t.autoReset=v;saveCfg()},'Reset timer when completed'),
 chk(t.red,v=>{t.red=v;saveCfg();re()},'Show red indicator near the end'),
 h('div',{class:'row'},h('label',{class:'row'},h('input',{type:'radio',name:'rm',checked:t.redMode!=='sec',onchange:()=>{t.redMode='pct';saveCfg()}}),'time has reached last'),numInp(t.redPct,v=>{t.redPct=v;saveCfg()},{min:1,max:90,w:80}),'%'),
 h('div',{class:'row'},h('label',{class:'row'},h('input',{type:'radio',name:'rm',checked:t.redMode==='sec',onchange:()=>{t.redMode='sec';saveCfg()}}),'time has reached last'),numInp(t.redSec,v=>{t.redSec=v;saveCfg()},{min:1,max:600,w:80}),'seconds'),
 h('div',{class:'lbl'},'Default time (applies to new timers)'),h('div',{class:'row'},numInp(Math.floor(t.def/60),v=>{t.def=v*60+t.def%60;saveCfg()},{min:0,max:99,w:90}),'min',numInp(t.def%60,v=>{t.def=Math.floor(t.def/60)*60+clamp(v,0,59);saveCfg()},{min:0,max:59,w:90}),'sec'),
 field('Quick presets (minutes, comma separated)',txtInp(t.presets.join(','),v=>{t.presets=v.split(',').map(x=>+x.trim()).filter(x=>x>0);saveCfg()},{dir:'ltr'})),
 h('div',{class:'lbl'},'Color theme (reopen the timer to apply)'),h('div',{class:'row'},...THEMES.map((x,i)=>h('div',{class:'sw'+(t.theme===i?' sel':''),style:`background:${x[0]==='glass'?'linear-gradient(135deg,#789,#abc)':x[0]}`,title:x[1],onclick:()=>{t.theme=i;saveCfg();redraw()}}))))};redraw()},{foot:c=>[pill('Done',()=>{c();if(Widgets.open.timer){Widgets.close('timer');openTimer()}},'big sel')]})}

/* ---- schedule ---- */
const SK=d=>'sched.'+d;
const schedDays=()=>Store.keys('sched.').map(k=>k.slice(6));
const tmplList=()=>Store.get('schedTemplates',[]);
const EXAMPLE=[['13:15','כתיבה'],['13:30','משניות'],['14:00','הפסקה'],['14:10','מנחה'],['14:20','משניות'],['14:50','הפסקה'],['15:15','הלכה'],['16:00','סיום']];
const BUTLER=['14:05','מורה אורח'];const dow=d=>new Date(d+'T12:00:00').getDay();
const SUBJ315={0:'נביא',1:'דברי ימי חסידים',2:'פרשה',4:'ווידאו'};
function defaultDay(date){if(!LEGACY)return[];const w=dow(date);const E=EXAMPLE.map(([t,n])=>({t,n}));
  if(w===5||w===6)return[];
  if(w===3)return[{t:'13:15',n:'כתיבה'},{t:'13:30',n:'משניות'},{t:'14:00',n:'הפסקה'},{t:BUTLER[0],n:BUTLER[1]},{t:'14:50',n:'הפסקה'},{t:'15:15',n:'מנחה'},{t:'15:30',n:'הלכה'},{t:'16:00',n:'סיום'}];
  if(SUBJ315[w])E.forEach(i=>{if(i.t==='15:15')i.n=SUBJ315[w]});return E}
const fixOld=items=>{if(items.some(i=>i.t==='14:10'&&i.n==='מנחה')&&items.some(i=>i.t==='15:15'&&i.n==='הלכה')){items=items.filter(i=>!(i.t==='14:10'&&i.n==='מנחה'));items.forEach(i=>{if(i.t==='15:15'&&i.n==='הלכה')i.n='מנחה'});items.push({t:'15:30',n:'הלכה'})}return items};
function openSchedule(date){date=date||dayKey();
  if(!Store.get(SK(date),null)){const all=schedDays().sort();const prev=all.filter(d=>d<date&&dow(d)===dow(date)).pop();const src=prev&&Store.get(SK(prev));
   const wk=Store.get('schedWeek',{})[dow(date)];const items=wk&&wk.length?wk.map(i=>({...i})):src&&src.items&&src.items.length?src.items.map(i=>{const o={...i};delete o.skip;return o}):defaultDay(date);
   Store.set(SK(date),{items:items.sort((a,b)=>toMin(a.t)-toMin(b.t))})}
  else if(LEGACY&&dow(date)===3&&!Store.get('mig.times2.'+date,false)){Store.set('mig.times2.'+date,true);const sc=Store.get(SK(date));if(sc&&sc.items){let n=fixOld(sc.items.map(i=>({...i})));if(!n.some(i=>i.n===BUTLER[1]))n.push({t:BUTLER[0],n:BUTLER[1]});sc.items=n.sort((a,b)=>toMin(a.t)-toMin(b.t));Store.set(SK(date),sc)}}
  if(LEGACY&&dow(date)===3&&!Store.get('mig.nomish.'+date,false)){Store.set('mig.nomish.'+date,true);const sc=Store.get(SK(date));if(sc&&sc.items){sc.items=sc.items.filter(i=>!(i.t==='14:20'&&i.n==='משניות'));Store.set(SK(date),sc)}}
  const had=!!Widgets.open.schedule;const inst=Widgets.create('schedule',cfg.labels.schedule,{x:80,y:130,w:480,settings:()=>scheduleEditor(inst.date)});inst.el.classList.add('light');
  inst.date=date;const body=inst.body;
  const paint=()=>{if(!Widgets.open.schedule)return;const sc=Store.get(SK(inst.date),{items:[]});body.innerHTML='';const dd0=new Date(inst.date+'T12:00:00');const hd=LEGACY?new Intl.DateTimeFormat('he',{timeZone:cfg.loc.tz,weekday:'long'}).format(dd0)+', '+hebrewDate(inst.date===dayKey()?new Date():dd0):dd0.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});body.append(h('div',{style:'font-size:20px;opacity:.85;margin-bottom:4px'},hd));if(!sc.items.length)body.append(LEGACY?h('div',{style:'font-size:22px;opacity:.8;padding:18px 4px'},'No class today. Tap the gear to add activities.'):h('div',{dir:'ltr',style:'display:flex;flex-direction:column;align-items:center;padding:14px 4px 6px'},h('div',{style:'font-size:20px;opacity:.8;margin-bottom:14px'},'Nothing planned yet'),h('button',{class:'tbtn okb',onclick:()=>window.scheduleEditor(inst.date)},'Create schedule')));
   const td=dayKey(),nm=inst.date===td?nowMinutes():(inst.date<td?99999:-1);const all0=sc.items;const items=all0.filter(i=>!i.skip&&String(i.n).trim());const nSk=all0.filter(i=>i.skip).length;let curI=-1;items.forEach((it,i)=>{if(toMin(it.t)<=nm)curI=i});
   items.forEach((it,i)=>{const cls=(i===curI&&i<items.length-1)?'cur':(i<curI||inst.date<td)?'past':(i===curI+1?'next':'');body.append(h('div',{class:'sched-row '+cls},h('span',{class:'t',style:'background:'+(/הפסקה|סיום/.test(it.n)?'#8a93a6':['#5b4bdb','#1fa971','#f08a24','#e5484d','#1c8de0','#d6409f'][i%6])+';color:#fff;border-radius:10px;padding:0 10px;text-align:center;opacity:1;font-weight:700'},fmtT(it.t)),h('span',{class:'n'},it.n),h('button',{class:'sup-x sch-x',type:'button','aria-label':'Skip '+it.n+' today',title:'Skip today',html:'<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>',onclick:ev=>{ev.stopPropagation();const s2=Store.get(SK(inst.date),{items:[]});const o=s2.items.find(z=>z.t===it.t&&z.n===it.n&&!z.skip);if(!o)return;o.skip=true;Store.set(SK(inst.date),s2);paint();
    try{window.__undoBar('Skipped \u2068'+it.n+'\u2069 for this day only',()=>{const s3=Store.get(SK(inst.date),{items:[]});const q=s3.items.find(z=>z.t===it.t&&z.n===it.n&&z.skip);if(q){delete q.skip;Store.set(SK(inst.date),s3);paint()}},'Undo')}catch(e){}}})))});
   if(nSk)body.append(h('button',{type:'button',style:'margin-top:8px;background:none;border:0;font-size:16px;opacity:.7;cursor:pointer;text-decoration:underline',onclick:()=>{const s2=Store.get(SK(inst.date),{items:[]});s2.items.forEach(z=>delete z.skip);Store.set(SK(inst.date),s2);paint()}},'Restore '+nSk+' skipped'));
   if(!items.length)body.append('—')};
  inst.paint=paint;paint();clearInterval(inst.iv);inst.iv=setInterval(paint,20000);inst.onclose=()=>clearInterval(inst.iv)}
function scheduleMenu(date){modal(cfg.labels.schedule,(b,c)=>{
  const row=(t,f,cl)=>h('div',{class:'row'},pill(t,f,'big '+(cl||'')));
  b.append(h('div',{class:'lbl'},'Date'),h('input',{type:'date',class:'inp',value:date,onchange:e=>date=e.target.value}));
  b.append(row('Open schedule for this date',()=>{if(Store.get(SK(date)))(c(),openSchedule(date));else toast('No schedule saved for this date yet')}),row('Create a new schedule',()=>{c();scheduleEditor(date)}),
   row('Duplicate a previous schedule…',()=>{c();pickDup(date)}),row('Use a template…',()=>{c();pickTmpl(date)}),row('Calendar archive…',()=>{c();scheduleArchive()}))})}
function pickDup(date){modal('Duplicate which day?',(b,c)=>{const d=schedDays().sort().reverse();if(!d.length)b.append('No saved schedules yet.');d.forEach(x=>b.append(h('div',{class:'item'},h('div',{class:'grow'},x),pill('Copy to '+date,()=>{Store.set(SK(date),{items:Store.get(SK(x)).items.map(i=>({...i}))});c();openSchedule(date)}))))})}
function pickTmpl(date){modal('Templates',(b,c)=>{const draw=()=>{b.innerHTML='';const T=tmplList();if(!T.length)b.append('No templates yet. Create a schedule, then use "Save as template" in the editor.');T.forEach((t,i)=>b.append(h('div',{class:'item'},h('div',{class:'grow'},t.name),pill('Use',()=>{Store.set(SK(date),{items:t.items.map(x=>({...x}))});c();openSchedule(date)}),pill('Delete',()=>{T.splice(i,1);Store.set('schedTemplates',T);draw()},'danger'))))};draw()})}
function scheduleArchive(){modal('Schedule archive',(b,c)=>{let ym=new Date(dayKey()+'T12:00:00');const wrap=h('div');b.append(wrap);
  const draw=()=>{wrap.innerHTML='';const y=ym.getFullYear(),m=ym.getMonth();const has=new Set(schedDays());wrap.append(h('div',{class:'row'},pill('◀',()=>{ym=new Date(y,m-1,1,12);draw()}),h('b',{style:'font-size:22px;min-width:200px;text-align:center'},ym.toLocaleString('en',{month:'long',year:'numeric'})),pill('▶',()=>{ym=new Date(y,m+1,1,12);draw()})));
   const g=h('div',{class:'cal'});['S','M','T','W','T','F','S'].forEach(x=>g.append(h('div',{style:'text-align:center;opacity:.7'},x)));const first=new Date(y,m,1).getDay();for(let i=0;i<first;i++)g.append(h('div'));const dim=new Date(y,m+1,0).getDate();
   for(let d=1;d<=dim;d++){const k=`${y}-${pad(m+1)}-${pad(d)}`;g.append(h('button',{class:'d'+(has.has(k)?' has':'')+(k===dayKey()?' today':''),onclick:()=>{c();has.has(k)?openSchedule(k):scheduleEditor(k)}},d))}wrap.append(g)};draw()})}
function scheduleEditor(date){const sc=Store.get(SK(date),null)||{items:[]};
  modal('Schedule · '+date,(b,c)=>{const list=h('div');const draw=()=>{list.innerHTML='';sc.items.forEach((it,i)=>{list.append(h('div',{class:'item'},h('input',{type:'time',class:'inp',value:it.t,onchange:e=>it.t=e.target.value}),h('input',{class:'inp',style:'flex:1',value:it.n,dir:'auto',onchange:e=>it.n=e.target.value}),
   h('button',{class:'wbtn sm',onclick:()=>{if(i>0){[sc.items[i-1],sc.items[i]]=[sc.items[i],sc.items[i-1]];draw()}}},'↑'),h('button',{class:'wbtn sm',onclick:()=>{if(i<sc.items.length-1){[sc.items[i+1],sc.items[i]]=[sc.items[i],sc.items[i+1]];draw()}}},'↓'),h('button',{class:'wbtn sm',onclick:()=>{sc.items.splice(i,1);draw()},html:svgI('trash')})))})};draw();
   const sv=()=>{sc.items=sc.items.filter(i=>i.n.trim()).sort((a,b)=>toMin(a.t)-toMin(b.t));Store.set(SK(date),sc)};
   b.append(h('div',{class:'row'},h('input',{type:'date',class:'inp',value:date,onchange:e=>date=e.target.value}),pill('Insert example day',()=>{sc.items=EXAMPLE.map(([t,n])=>({t,n}));draw()}),pill('Other days & templates…',()=>{c();scheduleMenu(date)})),list,
    h('div',{class:'row'},pill('＋ Add activity',()=>{const last=sc.items[sc.items.length-1];sc.items.push({t:last?last.t:cfg.teach.start,n:''});draw()})),
    h('div',{class:'lbl'},'Each activity runs until the next one starts. End with a closing row such as סיום.'),
    h('div',{class:'row'},pill('Save',()=>{sv();c();toast('Saved');if(Widgets.open.schedule)Widgets.close('schedule');openSchedule(date)},'big sel'),pill('Save as template',()=>ask('Template name','',n=>{if(n){sv();const T=tmplList();T.push({name:n,items:sc.items.map(x=>({...x}))});Store.set('schedTemplates',T);toast('Template saved')}})),pill('Delete schedule',()=>sure('Delete this day\'s schedule?',()=>{Store.del(SK(date));c();Widgets.close('schedule')}),'danger')))})}

/* ---- supplies ---- */
const supMaster=()=>Store.get('supplies',[]);
const supPresets=()=>Store.get('supPresets',[]);
const supItemEl=(it,big)=>h('div',{class:'sup-item'},h('div',{class:'nm',style:big?'font-size:44px':'font-size:34px',dir:'auto'},it.name));
function openSupplies(){showSupplies()}
const SUP_DEF=d=>!LEGACY?[[],[],[]]:d>4?[[],[],[]]:[['כתיבה','משניות'],[d===3?'סידור':'סידור'].concat(d===3?[]:['משניות']),d===0?['נביא']:d===3?['סידור','הלכה']:[]];
const SUP_DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const SUP_P=['Before the first break','After the first break (2:00)','After the second break (2:50)'];
const supList=d=>{const S=Store.get('supDays2',{});return S[d]||SUP_DEF(d)};
const supPeriod=()=>{const n=new Date(),m=n.getHours()*60+n.getMinutes();return m>=890?2:m>=840?1:0};
let supTimer=null,supShown=-1;
function showSupplies(){const d=new Date().getDay(),p=supPeriod(),L=supList(d)[p]||[];supShown=p;Widgets.close('supplies');
  const inst=Widgets.create('supplies',cfg.labels.supplies,{x:Math.max(20,innerWidth/2-380),y:Math.max(20,innerHeight/2-260),w:760,settings:suppliesSettings});inst.el.classList.add('light');
  inst.body.append(h('div',{style:'text-align:center;font-size:32px;font-weight:700;margin-bottom:10px',dir:'auto'},cfg.labels.supplies),
   L.length?h('div',{class:'sup-grid'},...L.map((n,i)=>{const e=supItemEl({name:n},true);const C=['#5b4bdb','#1fa971','#f08a24','#e5484d','#1c8de0','#d6409f'];e.style.background=C[i%6];e.style.color='#fff';e.style.boxShadow='0 6px 16px rgba(0,0,0,.2)';e.style.position='relative';
    const x=h('button',{class:'sup-x',type:'button','aria-label':'Remove '+n+' from this slot',title:'Remove',html:'<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>',onclick:ev=>{ev.stopPropagation();
     const S=Store.get('supDays2',{});const prev=supList(d).map(z=>[...z]);const cur=prev.map(z=>[...z]);cur[p]=cur[p].filter((_,j)=>j!==i);S[d]=cur;Store.set('supDays2',S);showSupplies();
     try{window.__undoBar('Removed \u2068'+n+'\u2069 from '+SUP_DAYS[d]+' ('+SUP_P[p].toLowerCase()+')',()=>{const S2=Store.get('supDays2',{});S2[d]=prev;Store.set('supDays2',S2);showSupplies()},'Undo')}catch(err){}}});
    e.append(x);return e})):h('div',{style:'text-align:center;font-size:26px;opacity:.8'},d>4?'No class today':'Nothing to bring'));
  inst.body.append(h('div',{style:'text-align:center;margin-top:10px'},h('button',{class:'sup-add',type:'button','aria-label':'Add an item',title:'Add an item',html:'<svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12"/></svg>',onclick:()=>supAdd(d,p)})));
  if(!supTimer)supTimer=setInterval(()=>{if(Widgets.open.supplies&&supPeriod()!==supShown)showSupplies()},20000)}
function supAdd(d,p){const S0=Store.get('supDays2',{});const all=[];const seen=new Set();
  for(let dd=0;dd<7;dd++){const l=supList(dd);for(let pp=0;pp<3;pp++)(l[pp]||[]).forEach(n=>{if(!seen.has(n)){seen.add(n);all.push(n)}})}
  Store.get('supPresets',[]).forEach(n=>{if(typeof n==='string'&&!seen.has(n)){seen.add(n);all.push(n)}});
  const cur0=supList(d)[p]||[];
  const add=n=>{n=String(n).trim();if(!n)return;const S=Store.get('supDays2',{});const prev=supList(d).map(z=>[...z]);const cur=prev.map(z=>[...z]);if(cur[p].includes(n))return;cur[p].push(n);S[d]=cur;Store.set('supDays2',S);showSupplies();
   try{window.__undoBar('Added \u2068'+n+'\u2069 for now',()=>{const S2=Store.get('supDays2',{});S2[d]=prev;Store.set('supDays2',S2);showSupplies()},'Undo')}catch(e){}};
  modal('Add an item',(b,c)=>{b.append(h('div',{class:'sup-grid',style:'gap:10px'},...all.filter(n=>!cur0.includes(n)).map(n=>h('button',{type:'button',class:'pill big',dir:'auto',onclick:()=>{c();add(n)}},n))));
   b.append(h('div',{class:'row',style:'margin-top:14px'},pill('Add something else',()=>{c();ask('New item','',v=>add(v))},'big')))})}
function suppliesSettings(){modal('Supplies settings',(b,c)=>{
  b.append(field('Heading (student-facing)',txtInp(cfg.labels.supplies,v=>{cfg.labels.supplies=v;saveCfg()},{style:'width:100%'})),h('div',{class:'lbl'},'Books to bring, one per line. The widget changes by itself at each break.'));
  SUP_DAYS.forEach((n,d)=>{b.append(h('div',{class:'lbl',style:'font-weight:700;margin-top:14px'},n));
   SUP_P.forEach((pn,p)=>{const ta=h('textarea',{class:'inp',dir:'auto',rows:3,style:'width:100%'});ta.value=supList(d)[p].join('\n');
    ta.onchange=()=>{const S=Store.get('supDays2',{});const cur=supList(d).map(x=>[...x]);cur[p]=ta.value.split('\n').map(s=>s.trim()).filter(Boolean);S[d]=cur;Store.set('supDays2',S);if(Widgets.open.supplies)showSupplies()};
    b.append(h('div',{class:'lbl'},pn),ta)})})},{headSave:c=>{document.querySelectorAll('.modal textarea').forEach(t=>t.dispatchEvent(new Event('change')));toast('Saved');c()}})}

function readImg(file,max,cb){if(!file)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,max/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=im.width*s;cv.height=im.height*s;cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);cb(cv.toDataURL(max>600?'image/jpeg':'image/png',.85))};im.src=r.result};r.readAsDataURL(file)}

/* ---- random picker ---- */
const lists=()=>Store.get('studentLists',[{id:'main',name:'Class',students:[]}]);
const activeList=()=>{const L=lists();return L.find(l=>l.id===Store.get('activeList','main'))||L[0]};
function namesFrom(inst){if(inst.local)return inst.local.filter(Boolean);return activeList().students.filter(x=>!x.absent).map(x=>x.name)}
function openPicker(){if(Widgets.open.picker){Widgets.raise('picker');return}
  const inst=Widgets.create('picker',cfg.labels.picker,{x:Math.max(20,innerWidth/2-280-Math.min(120,innerWidth*.06)),y:130,w:560,settings:pickerSettings});inst.el.classList.add('light');
  const body=inst.body;body.style.direction='ltr';
  const blip=()=>{if(!cfg.picker.sound)return;Audio_.unlock();const c=Audio_.ctx;if(!c)return;const o=c.createOscillator(),g=c.createGain();o.frequency.value=988;g.gain.setValueAtTime(.2,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.6);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+.65)};
  const names=()=>activeList().students.filter(x=>!x.absent).map(x=>x.name);
  const name=h('div',{class:'picked-name dkc',dir:'auto',style:`font-size:${cfg.picker.size||96}px`},'?');
  const go=()=>{const el=names();if(!el.length){toast('Add students in settings (gear)');return}const key=activeList().id;
   let pool=cfg.picker.noRepeat?el.filter(n=>!day.pickerHist.includes(key+':'+n)):el;if(!pool.length){day.pickerHist=day.pickerHist.filter(x=>!x.startsWith(key+':'));pool=el;toast('Everyone has been picked. Starting a new round.')}
   const pick=pool[Math.floor(Math.random()*pool.length)];let n=0;Audio_.unlock();const fit=t=>{name.textContent=t;const l=t.length;name.style.fontSize=(l<=9?96:l<=16?68:l<=24?52:42)+'px'};const fin=()=>{fit(pick);day.pickerHist.push(key+':'+pick);day.lastPicks.unshift(pick);saveDay();blip()};
   if(cfg.picker.anim===false){fin();return}const tick=()=>{fit(el[Math.floor(Math.random()*el.length)]);n++;if(n<18)setTimeout(tick,40+n*9);else fin()};tick()};
  const ctl=h('div',{style:'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px'});
  const pk=h('button',{class:'tbtn okb',onclick:()=>{started=true;lay();go()}},'Pick'),rs=h('button',{class:'dpill',onclick:()=>{day.pickerHist=[];saveDay();started=false;name.textContent='?';lay();toast('Cycle reset')}},'Reset');
  let started=false;const lay=()=>{ctl.style.flexDirection=started?'row':'column';name.style.display=started?'':'none';body.style.display='flex';body.style.flexDirection='column';body.style.justifyContent='center';body.style.minHeight='200px'};
  ctl.append(pk,rs);body.append(name,ctl);lay();
  if(!names().length&&!LEGACY){name.textContent='Add your students';name.style.fontSize='34px';name.style.display='';ctl.innerHTML='';ctl.append(h('button',{class:'tbtn okb',onclick:()=>{try{(window.__addStudents||pickerSettings)()}catch(e){}}},'Add students'));ctl.style.flexDirection='column'}}
/* ---- spin the wheel ---- */
const WCOL=['#e8590c','#f59f00','#2f9e44','#1971c2','#7048e8','#d6336c','#0c8599','#c2255c','#5c940d','#e67700'];
function openWheel(){if(Widgets.open.wheel){Widgets.raise('wheel');return}
  if(Store.get('wheelMode',LEGACY?'prizes':'names')==='prizes'&&window.openPrizeWheel)return window.openPrizeWheel();
  const inst=Widgets.create('wheel','Spin the wheel',{x:Math.max(20,innerWidth/2-290),y:110,w:540,h:720,settings:()=>modal('Wheel settings',b=>{const ta=h('textarea',{class:'inp',rows:8,dir:'auto',placeholder:'One name per line'});ta.value=Store.get('wheelNames',[]).join('\n');ta.onchange=()=>{Store.set('wheelNames',ta.value.split('\n').map(x=>x.trim()).filter(Boolean));if(Widgets.open.wheel){Widgets.close('wheel');openWheel()}};b.append(h('div',{class:'lbl'},'What it spins'),sel([['prizes','Prize wheel (10 prizes)'],['names','Student names']],Store.get('wheelMode',LEGACY?'prizes':'names'),v=>{Store.set('wheelMode',v);if(Widgets.open.wheel){Widgets.close('wheel');openWheel()}}),h('div',{class:'lbl'},'Names on the wheel, one per line'),ta,chk(cfg.picker.sound,v=>{cfg.picker.sound=v;saveCfg()},'Enable sounds'),chk(cfg.picker.wheelRemove,v=>{cfg.picker.wheelRemove=v;saveCfg()},'Remove winner after each spin'))})});inst.el.classList.add('light');
  const body=inst.body;body.style.direction='ltr';let names=[],ang=0,spinning=false,removed=[];
  const cv=h('canvas',{width:900,height:900,style:'width:100%;max-width:430px;display:block;margin:0 auto;touch-action:none'});const res=h('div',{class:'wres',dir:'auto'},'');
  const src=()=>Store.get('wheelNames',[]).filter(x=>!removed.includes(x));
  const draw=()=>{names=src();const x=cv.getContext('2d'),W=900,C=W/2,R=420;x.clearRect(0,0,W,W);
   if(!names.length){x.fillStyle='#ddd';x.beginPath();x.arc(C,C,R,0,7);x.fill();x.fillStyle='#555';x.font='40px sans-serif';x.textAlign='center';x.fillText('Add names in settings (gear)',C,C);return}
   const n=names.length,seg=2*Math.PI/n;
   for(let i=0;i<n;i++){const a0=ang+i*seg-Math.PI/2,a1=a0+seg;x.beginPath();x.moveTo(C,C);x.arc(C,C,R,a0,a1);x.closePath();x.fillStyle=WCOL[i%WCOL.length];x.fill();x.strokeStyle='#fff';x.lineWidth=4;x.stroke();
    x.save();x.translate(C,C);x.rotate(a0+seg/2);x.fillStyle='#fff';x.font=`bold ${clamp(Math.floor(2*Math.PI*R*.6/n*.8),22,60)}px "Segoe UI",Arial,sans-serif`;x.textAlign='right';x.textBaseline='middle';x.direction='ltr';let t=names[i];if(t.length>14)t=t.slice(0,13)+'…';x.fillText(t,R-30,0);x.restore()}
   x.beginPath();x.arc(C,C,50,0,7);x.fillStyle='#fff';x.fill();x.strokeStyle='#ccc';x.lineWidth=4;x.stroke();
   x.beginPath();x.moveTo(C-30,6);x.lineTo(C+30,6);x.lineTo(C,76);x.closePath();x.fillStyle='#222';x.fill()};
  const spin=()=>{if(spinning)return;names=src();if(names.length<2){toast('Add at least 2 names');return}spinning=true;res.textContent='';Audio_.unlock();
   const n=names.length,seg=2*Math.PI/n;const target=Math.random()*2*Math.PI;const total=(5+Math.floor(Math.random()*3))*2*Math.PI+target;const a0=ang;const dur=4500+Math.random()*1500,t0=performance.now();let lastSeg=-1;
   const step=now=>{const k=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-k,3);ang=a0+total*e;draw();const si=Math.floor((((-ang)%(2*Math.PI))+2*Math.PI)%(2*Math.PI)/seg);if(si!==lastSeg){lastSeg=si;if(cfg.picker.sound&&Audio_.ctx){const c=Audio_.ctx,o=c.createOscillator(),g=c.createGain();o.type='square';o.frequency.value=700;g.gain.setValueAtTime(.05,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.05);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+.06)}}
    if(k<1)requestAnimationFrame(step);else{spinning=false;const w=names[Math.floor((((-ang)%(2*Math.PI))+2*Math.PI)%(2*Math.PI)/seg)];res.textContent=w;day.lastPicks.unshift(w);saveDay();if(cfg.picker.sound&&Audio_.ctx){const c=Audio_.ctx;[784,988,1175].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=f;g.gain.setValueAtTime(.18,c.currentTime+i*.14);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+i*.14+.4);o.connect(g).connect(c.destination);o.start(c.currentTime+i*.14);o.stop(c.currentTime+i*.14+.45)})}
     if(cfg.picker.wheelRemove){removed.push(w);setTimeout(draw,1200)}}};requestAnimationFrame(step)};
  cv.addEventListener('pointerdown',spin);
  body.append(cv,res,h('div',{class:'row',style:'justify-content:center'},h('button',{class:'tbtn okb',onclick:spin},'SPIN'),h('button',{class:'dpill',onclick:()=>{removed=[];res.textContent='';draw()}},'Reset'),
   h('label',{class:'row dk'},h('input',{type:'checkbox',checked:cfg.picker.wheelRemove,style:'width:26px;height:26px',onchange:e=>{cfg.picker.wheelRemove=e.target.checked;saveCfg()}}),'Remove winner')));
  draw()}
function pickerSettings(){modal('Name picker settings',(b,c)=>{const draw=()=>{b.innerHTML='';const L=lists();const cur=L.find(l=>l.id===Store.get('activeList','main'))||L[0];
  const ta=h('textarea',{class:'inp',rows:3,dir:'auto',placeholder:'Paste names, one per line'});
  b.append(h('div',{class:'lbl'},'Choose list'),h('div',{class:'row'},...L.map(l=>pill(l.name+' ('+l.students.length+')'+(l.id===cur.id?' ✓':''),()=>{Store.set('activeList',l.id);draw()},l.id===cur.id?'sel':'')),pill('＋ New list',()=>ask('List name','',n=>{if(n){const id=uid();L.push({id,name:n,students:[]});Store.set('studentLists',L);Store.set('activeList',id);draw()}}))));
  b.append(h('div',{class:'lbl'},cur.name+' ('+cur.students.length+' students). Untick Present for anyone absent today.'),
   chk(cfg.picker.noRepeat,v=>{cfg.picker.noRepeat=v;saveCfg()},'No repeats until everyone has been picked'),chk(cfg.picker.sound,v=>{cfg.picker.sound=v;saveCfg()},'Sound'));
  cur.students.forEach((s,i)=>b.append(h('div',{class:'item'},h('input',{class:'inp',style:'flex:1',dir:'auto',value:s.name,onchange:e=>{s.name=e.target.value;Store.set('studentLists',L)}}),chk(!s.absent,v=>{s.absent=!v;Store.set('studentLists',L)},'Present'),h('button',{class:'wbtn sm',onclick:()=>{cur.students.splice(i,1);Store.set('studentLists',L);draw()},html:svgI('trash')}))));
  b.append(h('div',{class:'lbl'},'Add students'),ta,h('div',{class:'row'},pill('Add names',()=>{ta.value.split(/\n|,/).map(s=>s.trim()).filter(Boolean).forEach(n=>cur.students.push({name:n,absent:false}));Store.set('studentLists',L);draw()})))};draw()},{foot:c=>[pill('Done',c,'big sel')]})}

/* ---- library / presentations: saved links for now (Google Drive browsing = next step) ---- */
function openLinks(kind){const key=kind==='library'?'libLinks':'presLinks';const title=kind==='library'?'Teaching library':'Presentations';
  modal(title,(b,c)=>{const draw=()=>{b.innerHTML='';const L=Store.get(key,[]);
   if(window.MyTools&&kind==='library'){const mt=MyTools.section(c);if(mt)b.append(mt)}
   b.append(driveCard(c,kind),h('div',{class:'lbl'},'Saved items and links'));
   const g=h('div',{class:'libgrid'});L.forEach((x,i)=>g.append(h('div',{class:'libcard'},h('div',{onclick:()=>{c();openLink(x)}},h('div',{class:'ic'},x.url.includes('presentation')?'🎞️':x.url.includes('folders')?'📁':'📄'),h('div',{dir:'auto',style:'font-size:20px;margin-top:6px'},x.title||x.url)),h('div',{class:'row',style:'justify-content:center'},pill('Edit',()=>ask('Title',x.title,t=>ask('Link',x.url,u=>{if(u){x.title=t;x.url=u;Store.set(key,L);draw()}}))),pill('✕',()=>sure('Remove this link?',()=>{L.splice(i,1);Store.set(key,L);draw()}),'danger')))));
   const ti=h('input',{class:'inp',placeholder:'Title',style:'width:220px',dir:'auto'}),ui=h('input',{class:'inp',placeholder:'Paste link',style:'flex:1',dir:'ltr'});
   b.append(g,h('div',{class:'lbl'},'Add a link'),h('div',{class:'row'},ti,ui,pill('Save',()=>{const u=ui.value.trim();if(!u)return;L.push({title:ti.value.trim(),url:u});Store.set(key,L);draw()})))};draw()})}
function toEmbed(u){let m;if(m=u.match(/docs\.google\.com\/presentation\/d\/([^/]+)/))return`https://docs.google.com/presentation/d/${m[1]}/embed?start=false&loop=false`;if(m=u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/))([\w-]{11})/))return`https://www.youtube.com/embed/${m[1]}?rel=0`;if(m=u.match(/drive\.google\.com\/file\/d\/([^/]+)/))return`https://drive.google.com/file/d/${m[1]}/preview`;if(m=u.match(/drive\.google\.com\/drive\/folders\/([^?/]+)/))return`https://drive.google.com/embeddedfolderview?id=${m[1]}#grid`;return u}
function liftBar(bar,wrap){bar.style.zIndex='57';document.body.append(bar);const o=new MutationObserver(()=>{if(!wrap.isConnected){bar.remove();o.disconnect()}});o.observe(document.getElementById('app-main'),{childList:true})}
function openLink(x){try{if(window.NOEMBED&&window.NOEMBED.test(new URL(x.url).hostname)&&!/youtu|google\.com/.test(x.url)){window.open(x.url,'_blank','noopener');return}}catch(e){}if(/^https?:\/\/(www\.)?613tube\.com(\/|$)/.test(x.url||'')){window.open(x.url,'_blank','noopener');return}const wrap=h('div',{style:'position:fixed;inset:0;z-index:3;background:#000'},h('iframe',{src:toEmbed(x.url),style:'width:100%;height:100%;border:0;background:#fff',allow:'fullscreen'}),
  h('div',{class:'glass',style:'position:fixed;left:16px;top:16px;z-index:4;padding:6px;display:flex;gap:6px;direction:ltr'},h('button',{class:'pill',onclick:()=>{wrap.remove();Ink.ctxKey=null;Ink.strokes=[];Ink.setMode('off');Ink.redraw()}},'← Back'),h('a',{class:'pill',href:x.url,target:'_blank',rel:'noopener',style:'text-decoration:none;color:inherit'},'Open in new tab'),h('button',{class:'pill',onclick:()=>{Ink.setMode(Ink.mode==='write'?'view':'write')}},'✍ Write over it')));
  $('#app-main').append(wrap);{const bb=wrap.querySelector(':scope>.glass');if(bb)liftBar(bb,wrap)}Ink.strokes=[];Ink.visible=true;Ink.ctxKey='anno.link.'+x.url.slice(-60);const prev=Store.get(Ink.ctxKey,[]);if(prev.length)toast('Saved handwriting exists for this item. Use "Restore saved".')}

/* ---- settings ---- */
const TOOLS={ask:'Ask the Board',cast:'Screen share',home:'Home / reset screen',whiteboard:'Whiteboard',timer:'Timer',schedule:'Schedule',supplies:'Supplies',library:'Library',presentations:'Presentations',picker:LEGACY?'Randomizer':'Name picker',wheel:'Spin the wheel',behavior:'Behavior & stars',audio:'Mincha audio',traffic:'Traffic light',sound:'Sound level',text:'Text',anno:'Write on screen',settings:'Settings',full:'Full screen'};
function openSettings(tab='clock'){
  const tabs=[['account','👤 Account'],['clock','🕐 Clock'],['bg','🖼️ Background'],['toolbar','🧰 Toolbar'],['input','✍️ Pen & touch'],['labels','🏷️ Labels'],['timer','⏱️ Timer'],['supplies','📚 Supplies'],['students','🧒 Students'],['links','🔗 Links'],['share','📲 Share'],['data','💾 Backup']];
  const _ms=modal('Teacher settings',(b,c)=>{const draw=t=>{b.innerHTML='';b.append(h('div',{class:'tabs'},...tabs.map(([k,l])=>pill(l,()=>draw(k),k===t?'sel':''))));const P=h('div');b.append(P);S[t](P,()=>draw(t),c)};draw(tab)},{foot:c=>[pill('Done',c,'big sel')]});_ms.body.closest('.modal').classList.add('tset')}
const sel=(opts,cur,f)=>h('select',{class:'inp',onchange:e=>f(e.target.value)},...opts.map(([v,n])=>h('option',{value:v,selected:cur===v},n)));
const S={
 clock(P,re){const k=cfg.clock,l=cfg.loc;P.append(h('div',{class:'card'},'Now showing: '+timeStr(new Date())+'  ·  '+hebrewDate()),chk(k.visible,v=>{k.visible=v;saveCfg();renderClock()},'Show clock'),chk(k.hour12,v=>{k.hour12=v;saveCfg();renderClock()},'12-hour time'),chk(k.showAmPm,v=>{k.showAmPm=v;saveCfg();renderClock()},'Show AM/PM'),
  field('Size',range(k.size,v=>{k.size=v;saveCfg();renderClock()},3,14,.2)),field('Transparency',range(k.opacity,v=>{k.opacity=v;saveCfg();renderClock()},.2,1,.05)),
  field('Color',h('div',{class:'row'},h('input',{type:'color',value:k.color||'#ffffff',oninput:e=>{k.color=e.target.value;saveCfg();renderClock()}}),pill('Automatic',()=>{k.color='';saveCfg();renderClock()}))),
  field('Font',sel([['Georgia, "Times New Roman", serif','Georgia'],['"Times New Roman",serif','Times'],['"Segoe UI Light","Segoe UI",sans-serif','Segoe Light'],['"Courier New",monospace','Mono']],k.font,v=>{k.font=v;saveCfg();renderClock()})),
  field('Position',sel([['tr','Top right'],['tl','Top left'],['br','Bottom right'],['bl','Bottom left']],k.pos,v=>{k.pos=v;saveCfg();renderClock()})),
  h('details',{class:'adv'},h('summary',{},'Hebrew date location (advanced)'),h('div',{class:'lbl'},'The Hebrew date changes at local sunset. Already set for Brooklyn.'),h('div',{class:'row'},txtInp(l.name,v=>{l.name=v;saveCfg()},{ph:'Name'}),numInp(l.lat,v=>{l.lat=v;saveCfg();renderClock()},{step:.0001,w:130}),numInp(l.lon,v=>{l.lon=v;saveCfg();renderClock()},{step:.0001,w:130}),txtInp(l.tz,v=>{l.tz=v;saveCfg();renderClock()},{ph:'America/New_York',dir:'ltr'}))),
  chk(cfg.schedFmt.h12,v=>{cfg.schedFmt.h12=v;saveCfg()},'Schedule shows 12-hour times'))},
 bg(P,re){const b=cfg.bg;P.append(chk(b.auto,v=>{b.auto=v;saveCfg();renderBg()},'New background every day'),field('Brightness',range(b.brightness,v=>{b.brightness=v;saveCfg();renderBg()},.4,1.4,.05)),field('Blur',range(b.blur,v=>{b.blur=v;saveCfg();renderBg()},0,20,1)),field('Dimming',range(b.dim,v=>{b.dim=v;saveCfg();renderBg()},0,.8,.02)));
  const g=h('div',{class:'row'});bgList().forEach(x=>g.append(h('div',{class:'bgthumb'+(currentBg().id===x.id?' sel':''),style:`background-image:url("${x.url}")`,onclick:()=>{b.manualId=x.id;b.manualDay=dayKey();saveCfg();renderBg();re()}},h('span',{class:'fav',onclick:e=>{e.stopPropagation();b.favs=b.favs.includes(x.id)?b.favs.filter(i=>i!==x.id):[...b.favs,x.id];saveCfg();re()}},b.favs.includes(x.id)?'★':'☆'),b.lockedId===x.id?h('span',{style:'position:absolute;bottom:2px;left:6px'},'🔒'):null)));
  P.append(h('div',{class:'lbl'},'Tap a picture to use it. Star = favorite.'),g,chk(b.favOnly,v=>{b.favOnly=v;saveCfg();renderBg()},'Daily rotation uses favorites only'),h('div',{class:'row'},pill(b.lockedId?'Unlock background':'Lock current background',()=>{b.lockedId=b.lockedId?null:currentBg().id;saveCfg();re()}),
   h('label',{class:'pill'},'Upload photo',h('input',{type:'file',accept:'image/*',style:'display:none',onchange:e=>readImg(e.target.files[0],1920,u=>{const id=uid();b.custom.push({id,name:'Upload',url:u});b.manualId=id;b.manualDay=dayKey();saveCfg();renderBg();re()})}))),
   (()=>{const i=h('input',{class:'inp',placeholder:'Paste image URL',style:'flex:1',dir:'ltr'});return h('div',{class:'row'},i,pill('Add',()=>{const u=i.value.trim();if(u){b.custom.push({id:uid(),name:'URL',url:u});saveCfg();re()}}))})(),
   b.custom.length?pill('Remove custom backgrounds',()=>sure('Remove all custom backgrounds?',()=>{b.custom=[];b.manualId=null;b.lockedId=null;saveCfg();renderBg();re()}),'danger'):null)},
 toolbar(P,re){const t=cfg.toolbar;P.append(h('div',{class:'lbl'},'Order and visibility'));t.order.forEach((id,i)=>P.append(h('div',{class:'item'},h('div',{class:'grow'},TOOLS[id]),chk(!t.hidden.includes(id),v=>{t.hidden=v?t.hidden.filter(x=>x!==id):[...t.hidden,id];saveCfg();renderToolbar()},'Visible'),h('button',{class:'wbtn sm',onclick:()=>{if(i>0){[t.order[i-1],t.order[i]]=[t.order[i],t.order[i-1]];saveCfg();renderToolbar();re()}}},'↑'),h('button',{class:'wbtn sm',onclick:()=>{if(i<t.order.length-1){[t.order[i+1],t.order[i]]=[t.order[i],t.order[i+1]];saveCfg();renderToolbar();re()}}},'↓'))));
  P.append(chk(t.pinned,v=>{t.pinned=v;saveCfg();toolbarShow(true)},'Pin toolbar (never auto-hide)'),field('Auto-hide after (seconds)',numInp(t.hideSecs,v=>{t.hideSecs=v;saveCfg()},{min:2,max:60})),field('Button size',range(t.size,v=>{t.size=v;saveCfg();renderToolbar()},48,110,2)),field('Transparency',range(t.opacity,v=>{t.opacity=v;saveCfg();renderToolbar()},.05,.7,.01)),
  field('Position',sel([['bottom','Bottom'],['top','Top']],t.pos,v=>{t.pos=v;saveCfg();renderToolbar()})))},
 labels(P){const L=cfg.labels;const nm={supplies:'Supplies heading',schedule:'Schedule heading',picker:'Name picker heading',timer:'Timer heading',done:'Timer finished message'};for(const k of Object.keys(L))P.append(field(nm[k]||k,txtInp(L[k],v=>{L[k]=v;saveCfg()},{style:'width:100%'})))},
 timer(P){P.append(pill('Open timer settings',timerSettings,'big'))},
 supplies(P){P.append(pill('Open supplies settings',suppliesSettings,'big'))},
 students(P,re){const L=lists(),cur=L.find(l=>l.id===Store.get('activeList','main'))||L[0];
  P.append(h('div',{class:'lbl'},'Class list'),h('div',{class:'row'},...L.map(l=>pill(l.name+' ('+l.students.length+')',()=>{Store.set('activeList',l.id);re()},l.id===cur.id?'sel':'')),pill('＋ New list',()=>ask('List name','',n=>{if(n){const id=uid();L.push({id,name:n,students:[]});Store.set('studentLists',L);Store.set('activeList',id);re()}}))));
  const rows=h('div');const save=()=>{Store.set('studentLists',L)};
  cur.students.forEach((s,i)=>rows.append(h('div',{class:'item'},h('input',{class:'inp',style:'flex:1',dir:'auto',value:s.name,oninput:e=>{s.name=e.target.value}}),chk(!s.absent,v=>{s.absent=!v;save()},'Present'),h('button',{class:'wbtn sm',onclick:()=>{cur.students.splice(i,1);save();re()},html:svgI('trash')}))));
  const add=h('input',{class:'inp',style:'flex:1',dir:'auto',placeholder:'New name, then Enter'});
  const addIt=()=>{const n=add.value.trim();if(!n)return;cur.students.push({name:n,absent:false});save();re()};add.onkeydown=e=>{if(e.key==='Enter')addIt()};
  P.append(rows,h('div',{class:'item'},add,pill('Add',addIt)),h('div',{class:'row'},pill('Save',()=>{cur.students.forEach(s=>{s.name=s.name.trim()});cur.students=cur.students.filter(s=>s.name);save();toast('Saved');re()},'big sel'),pill('Paste many names…',pickerSettings)))},
 links(P){P.append(chk(Store.get('driveSimple',true),v=>Store.set('driveSimple',v),'Simple buttons: PDF and Slideshow buttons open their Drive folder directly'),pill('Library links',()=>openLinks('library'),'big'),pill('Presentation links',()=>openLinks('pres'),'big'))},
 data(P){P.append(h('div',{class:'card'},'Everything is saved in this browser. When you are signed in (Account & sync) it is also saved online. Backups are an extra safety copy.'),h('div',{class:'row'},pill('Download backup',()=>{const a=h('a',{download:'classroom-backup-'+dayKey()+'.json',href:'data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(Store.exportAll()))});document.body.append(a);a.click();a.remove()},'big'),
  h('label',{class:'pill big'},'Restore backup',h('input',{type:'file',accept:'.json',style:'display:none',onchange:e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{Store.importAll(JSON.parse(t));toast('Restored. Reloading…');setTimeout(()=>location.reload(),800)}).catch(()=>toast('Not a valid backup'))}})),
  pill('Reset screen',()=>resetScreen(),'big')),h('div',{class:'lbl'},'Storage used: '+Math.round(JSON.stringify(Store.exportAll()).length/1024)+' KB'))}
};

/* ---- toolbar ---- */
let hideT=null;
function kitToggle(id){const M=window.__more;if(!M||!M.FN[id])return;if(Widgets.open[id])Widgets.close(id);else M.FN[id]()}
function renderToolbar(){const t=cfg.toolbar,tb=$('#toolbar');for(const id of DEF.toolbar.order)if(!t.order.includes(id))t.order.splice(Math.max(0,t.order.indexOf('settings')),0,id);if(!t.order.includes('ask')){const i=t.order.indexOf('more');t.order.splice(i<0?Math.max(0,t.order.indexOf('settings')):i,0,'ask');}
  if(LEGACY&&!cfg.askShown){cfg.askShown=1;t.order=t.order.filter(x=>x!=='ask').concat('ask');t.hidden=(t.hidden||[]).filter(x=>x!=='ask');try{saveCfg()}catch(e){}}const off=tb.dataset.off==='1';tb.innerHTML='';tb.className='glass'+(t.pos==='top'?' top':t.pos==='left'?' left':t.pos==='right'?' right':'')+(off?' off':'');const _u=cfg.ui||{};tb.classList.toggle('lab',!!_u.labels);document.documentElement.style.setProperty('--tb-size',(t.size*(window.__uis||1))+'px');document.documentElement.style.setProperty('--tb-op',t.opacity);
  const hd=$('#handle');hd.dataset.pos=t.pos;if(t.pos==='left'||t.pos==='right'){hd.style.bottom='';hd.style.top=''}else{hd.style.bottom=t.pos==='top'?'auto':'6px';hd.style.top=t.pos==='top'?'6px':'auto'}
  const acts={home:()=>resetScreen(),whiteboard:()=>App.wb?exitWhiteboard():enterWhiteboard(),timer:()=>Widgets.open.timer?Widgets.close('timer'):openTimer(),schedule:()=>Widgets.open.schedule?Widgets.close('schedule'):openSchedule(),supplies:()=>Widgets.open.supplies?Widgets.close('supplies'):openSupplies(),
   library:()=>!LEGACY?driveFolders('library'):Store.get('driveSimple',true)?driveBrowser((window.__PERSONAL||{}).libFolder||'root','library','PDFs'):openLinks('library'),presentations:()=>!LEGACY?driveFolders('pres'):Store.get('driveSimple',true)?driveBrowser((window.__PERSONAL||{}).presFolder||'root','pres','Slideshows'):openLinks('pres'),picker:()=>Widgets.open.picker?Widgets.close('picker'):openPicker(),wheel:()=>Widgets.open.wheel?Widgets.close('wheel'):openWheel(),behavior:()=>Widgets.open.behavior?Widgets.close('behavior'):openBehavior(),audio:()=>Widgets.open.audio?Widgets.close('audio'):openAudio(),anno:()=>{if(Ink.mode==='write')Ink.setMode('view');else{if(!App.wb&&!Ink.ctxKey)Ink.ctxKey='anno.home';Ink.visible=true;Ink.setMode('write')}},more:()=>openMore(),cast:()=>kitToggle('cast'),traffic:()=>kitToggle('traffic'),sound:()=>kitToggle('sound'),text:()=>kitToggle('text'),ask:()=>window.AskBoard&&AskBoard.toggle(),settings:()=>openSettings(),full:()=>{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen().catch(()=>{})}};
  if(LEGACY&&!cfg.castAdded){cfg.castAdded=1;if(!t.order.includes('cast')){const i=t.order.indexOf('more');t.order.splice(i<0?t.order.length:i,0,'cast')}t.hidden=(t.hidden||[]).filter(x=>x!=='cast');try{saveCfg()}catch(e){}}
  if(LEGACY&&!Store.get('seed613',0)){Store.set('seed613',1);const L=Store.get('presLinks',[]);if(!L.some(x=>x.url&&x.url.includes('PiEc1xiyZVA'))){L.push({title:'613',url:'https://youtu.be/PiEc1xiyZVA'});Store.set('presLinks',L)}}
  if(LEGACY&&!Store.get('seed613b',0)){Store.set('seed613b',1);const L=Store.get('presLinks',[]);const i=L.findIndex(x=>x.url&&x.url.includes('PiEc1xiyZVA'));if(i>=0)L[i].url='https://613tube.com/';else if(!L.some(x=>x.url&&x.url.includes('613tube.com')))L.push({title:'613',url:'https://613tube.com/'});Store.set('presLinks',L)}
  if(LEGACY&&!Store.get('seed613c',0)){Store.set('seed613c',1);const L=Store.get('presLinks',[]);const i=L.findIndex(x=>x.url&&/613tube\.com\/?$|PiEc1xiyZVA/.test(x.url));if(i>=0)L[i].url='https://613tube.com/watch/?v=PiEc1xiyZVA';else L.push({title:'613',url:'https://613tube.com/watch/?v=PiEc1xiyZVA'});Store.set('presLinks',L)}
  if(LEGACY&&!cfg.doneOff){cfg.doneOff=1;if(cfg.labels&&/צייט איז אויס/.test(cfg.labels.done||''))cfg.labels.done=''}
  if(LEGACY&&!cfg.behShown){cfg.behShown=1;if(!t.order.includes('behavior')){const i=t.order.indexOf('more');t.order.splice(i<0?t.order.length:i,0,'behavior')}t.hidden=(t.hidden||[]).filter(x=>x!=='behavior');try{saveCfg()}catch(e){}}
  if(LEGACY&&!t.order.includes('audio')){const i=t.order.indexOf('anno');t.order.splice(i<0?t.order.length:i,0,'audio')}
  for(const id of t.order){if(t.hidden.includes(id))continue;{const nm=window.__t?window.__t(TOOLS[id]):TOOLS[id];const b=h('button',{class:'tbi'+(_u.labels?' lab':''),'data-id':id,title:nm,'aria-label':nm,onclick:()=>{Audio_.unlock();(acts[id]||(()=>window.MyTools&&MyTools.open(String(id).slice(3))))();toolbarState();bump()},html:svgI(id)});if(_u.labels)b.append(h('span',{class:'tl'},nm));tb.append(b)}}
  toolbarState()}
function toolbarState(){const on={whiteboard:!!App.wb,timer:!!Widgets.open.timer,schedule:!!Widgets.open.schedule,supplies:!!Widgets.open.supplies,picker:!!Widgets.open.picker,traffic:!!Widgets.open.traffic,cast:!!Widgets.open.cast,sound:!!Widgets.open.sound,text:!!Widgets.open.text,wheel:!!Widgets.open.wheel,behavior:!!Widgets.open.behavior,audio:!!Widgets.open.audio,anno:Ink.mode==='write'&&!App.wb};document.querySelectorAll('#toolbar .tbi[data-id]').forEach(e=>e.classList.toggle('active',!!on[e.dataset.id]))}
function gearSync(){document.body.classList.toggle('nogear',!cfg.toolbar.hidden.includes('settings'))}
function toolbarShow(v){gearSync();const tb=$('#toolbar');tb.dataset.off=v?'':'1';tb.classList.toggle('off',!v);clearTimeout(hideT);if(v&&!cfg.toolbar.pinned)hideT=setTimeout(()=>toolbarShow(false),cfg.toolbar.hideSecs*1000);$('#handle').style.opacity=v?0:1}
function bump(){if($('#toolbar').dataset.off!=='1'&&!cfg.toolbar.pinned){clearTimeout(hideT);hideT=setTimeout(()=>toolbarShow(false),cfg.toolbar.hideSecs*1000)}}

/* ---- boot ---- */
Ink.init();
$('#handle').addEventListener('pointerdown',e=>{e.stopPropagation();toolbarShow(true)});
$('#toolbar').addEventListener('pointerdown',bump);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(Ink.mode!=='off'&&!App.wb)Ink.setMode('off');else toolbarShow(true)};if((e.ctrlKey||e.metaKey)&&e.key==='z'&&Ink.mode!=='off')Ink.undo()});
document.addEventListener('gesturestart',e=>e.preventDefault());
renderToolbar();toolbarShow(!LEGACY&&!!cfg.toolbar.pinned);renderBg();renderClock();
if(!window.__demo&&'serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});

window.__sc={renderToolbar,renderClock,renderBg,saveCfg,TOOLS,cfg,Store,Widgets,Ink,App,openTimer,openSchedule,openPicker,openSupplies,openSettings,enterWhiteboard,hebrewDate,toolbarShow,day:()=>day,dayKey,Audio_,TimerW,resetScreen,showSupplies,hebNum,sunsetOn};

;(function(){const g=document.getElementById('gear');if(!g)return;g.innerHTML=svgI('settings');g.addEventListener('click',()=>{try{openSettings()}catch(e){}})})();

;document.addEventListener('keydown',e=>{if((e.key==='b'||e.key==='B')&&!/INPUT|TEXTAREA|SELECT/.test((e.target.tagName||''))&&!e.ctrlKey&&!e.metaKey){const tb=document.getElementById('toolbar');toolbarShow(tb.classList.contains('off'))}});

/* ---- audio player (Mincha) ---- */
function openAudio(){if(Widgets.open.audio){Widgets.raise('audio');return}
  const inst=Widgets.create('audio','מנחה',{x:Math.max(20,innerWidth/2-170),y:innerHeight-360,w:340});
  const au=new Audio('audio/mincha.mp3');au.preload='auto';
  const fmt=s=>{s=Math.floor(s||0);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
  const pb=h('button',{class:'tbtn okb',style:'width:100%;font-size:34px;padding:18px'},'▶ Play');
  const sk=h('input',{type:'range',min:0,max:1000,value:0,style:'width:100%;height:36px'});const tm=h('div',{style:'text-align:center;font-size:20px;opacity:.85'},'0:00');
  pb.onclick=()=>{if(au.paused)au.play().catch(()=>toast('Could not play audio'));else au.pause()};
  au.onplay=()=>pb.textContent='❚❚ Pause';au.onpause=()=>pb.textContent='▶ Play';au.onended=()=>{pb.textContent='▶ Play';sk.value=0};
  au.ontimeupdate=()=>{if(au.duration&&!sk.dragging)sk.value=au.currentTime/au.duration*1000;tm.textContent=fmt(au.currentTime)+' / '+fmt(au.duration)};
  sk.oninput=()=>{sk.dragging=true;if(au.duration)au.currentTime=sk.value/1000*au.duration};sk.onchange=()=>{sk.dragging=false};
  inst.body.append(h('div',{style:'display:grid;gap:12px;padding:6px;direction:ltr'},pb,sk,tm));
  inst.onclose=()=>{au.pause();au.src=''};}
;(function(){const q=new URLSearchParams(location.search),v=q.get('view')||(location.hash.match(/phone|board/)||[''])[0];
 if(v!=='phone'&&v!=='board')return;document.body.classList.add('v-'+v);
 if(v==='phone')setTimeout(()=>{try{openSettings()}catch(e){}},400);
 if(v==='board'){setTimeout(()=>{try{document.documentElement.requestFullscreen&&0}catch(e){}},0)}})();
;(function(){const v=new URLSearchParams(location.search).get('view');
 if(v==='desktop'||(v==='board'&&screen.width<900)){document.body.classList.add('v-board');const m=document.querySelector('meta[name=viewport]');if(m)m.content='width=1280,initial-scale='+(Math.min(screen.width,screen.height||9999)>0?(screen.width/1280).toFixed(3):1)+',minimum-scale=0.2,user-scalable=yes'}})();
