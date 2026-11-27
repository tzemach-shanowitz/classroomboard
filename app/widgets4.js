'use strict';
/* ===== Stage 2: Stopwatch, Visual timer, Calendar, Event countdown, Group maker, Dice, Scoreboard ===== */
(function(){
const M=window.__more,K=window.__kit;if(!M||!K)return;const {mk,get,put}=M,{panel}=K;
const pad2=n=>String(n).padStart(2,'0');
const reopen=(id,fn)=>{Widgets.close(id);const sv=Store.get('w.'+id,null);if(sv){delete sv.w;delete sv.h;Store.set('w.'+id,sv)}fn()};
const bt=(t,f,c='',st='')=>h('button',{class:'pill '+c,style:st,onclick:f},t);
const alphaRow=id=>{const u=get(id+'.ui',{a:100});const v=h('span',{style:'min-width:56px;text-align:right;font-weight:700'},(100-u.a)+'%');return h('div',{},h('div',{class:'lbl'},'Transparency'),h('div',{class:'row',style:'align-items:center'},h('input',{type:'range',min:20,max:100,step:5,value:u.a,style:'flex:1;min-width:200px',oninput:e=>{u.a=+e.target.value;v.textContent=(100-u.a)+'%';put(id+'.ui',u);const o=Widgets.open[id];if(o)K.applyAlpha(id,o.el)}}),v))};
const ALARM=()=>{try{Audio_.unlock();return Audio_.play((cfg.timer&&cfg.timer.sound)||'bell',(cfg.timer&&cfg.timer.volume)||.8,1)}catch(e){}};
const ACC=['#6d5efc','#2f7de1','#2e9e5b','#f08a24','#e5484d','#e56bb0','#1b2430'];
function fsBtn(inst){let on=false,keep;return h('button',{class:'wbtn',title:'Full screen',style:'font-size:20px',onclick:()=>{const el=inst.el;if(!on){keep=el.getAttribute('style');el.style.cssText+=';left:0!important;top:0!important;width:100vw!important;height:100vh!important;border-radius:0;z-index:50';on=true}else{el.setAttribute('style',keep);on=false}}},'⛶')}

/* ---------- Stopwatch ---------- */
function stopwatch(){
  let s=Object.assign({color:'#1b2430',size:100,fmt:'cs',style:'bold',laps:true},get('stopwatch',{}));const sv=()=>put('stopwatch',s);
  mk('stopwatch',{w:Math.round(380*Math.max(1,s.size/100)),settings:()=>panel('Stopwatch',s,[
    {t:'seg',k:'fmt',label:'Time format',opts:[['cs','00:00.00'],['s','00:00'],['h','0:00:00']]},
    {t:'seg',k:'style',label:'Number style',opts:[['bold','Bold'],['thin','Light'],['mono','Digital']]},
    {t:'color',k:'color',label:'Number color',colors:ACC},
    {t:'range',k:'size',label:'Size',min:80,max:200,step:10,fmt:v=>v+'%'},
    {t:'sw',k:'laps',label:'Show the Lap button'},{t:'el',el:alphaRow('stopwatch')}],()=>reopen('stopwatch',stopwatch),sv)},(b,inst)=>{
    let t0=0,acc=0,iv=null;const fmt=ms=>{const c=Math.floor(ms/10)%100,sec=Math.floor(ms/1000)%60,m=Math.floor(ms/60000)%60,hr=Math.floor(ms/3600000);return s.fmt==='h'?hr+':'+pad2(m)+':'+pad2(sec):s.fmt==='s'?pad2(Math.floor(ms/60000))+':'+pad2(sec):pad2(Math.floor(ms/60000))+':'+pad2(sec)+'.'+pad2(c)};
    const fw={bold:800,thin:200,mono:600}[s.style],ffm=s.style==='mono'?'"Courier New",monospace':'inherit';
    const disp=h('div',{style:`font-size:${Math.round(68*s.size/100)}px;font-weight:${fw};font-family:${ffm};color:${s.color};text-align:center;font-variant-numeric:tabular-nums;padding:10px 0;direction:ltr`},fmt(0));
    const laps=h('div',{style:'font-size:18px;color:#556;text-align:center;max-height:110px;overflow:auto;direction:ltr'});let n=0;
    const tick=()=>disp.textContent=fmt(acc+(t0?Date.now()-t0:0));inst.cleanup=()=>clearInterval(iv);
    const go=bt('▶ Start',()=>{if(t0){acc+=Date.now()-t0;t0=0;clearInterval(iv);go.textContent='▶ Resume';tick()}else{t0=Date.now();iv=setInterval(tick,40);go.textContent='⏸ Pause'}},'sel','font-size:22px;padding:12px 26px');
    b.append(disp,h('div',{class:'row',style:'justify-content:center'},go,s.laps?bt('Lap',()=>{if(!t0&&!acc)return;laps.prepend(h('div',{},(++n)+'  '+disp.textContent))},'','font-size:20px'):null,bt('Reset',()=>{clearInterval(iv);t0=0;acc=0;n=0;laps.innerHTML='';go.textContent='▶ Start';tick()},'','font-size:20px')),laps)})}

/* ---------- Visual timer (disc), uses the same alarm sound settings as the main Timer ---------- */
function visual(){
  let s=Object.assign({mins:5,color:'#6d5efc',num:true,sound:true,warn:true},get('visual',{}));const sv=()=>put('visual',s);
  mk('visual',{w:380,h:580,settings:()=>panel('Visual timer',s,[
    {t:'range',k:'mins',label:'Default length',min:1,max:60,step:1,fmt:v=>v+' min'},
    {t:'color',k:'color',label:'Disc color',colors:ACC},
    {t:'sw',k:'warn',label:'Turn orange, then red, near the end'},
    {t:'sw',k:'num',label:'Show the numbers'},{t:'sw',k:'sound',label:'Play the timer sound at the end (same sound as the main Timer)'},
    {t:'el',el:alphaRow('visual')}],()=>reopen('visual',visual),sv)},(b,inst)=>{
    let total=s.mins*60,left=total,iv=null,end=0,done=false;
    const D=Math.min(250,innerWidth-120);const disc=h('div',{style:`width:${D}px;height:${D}px;border-radius:50%;margin:10px auto;transition:background .3s`});
    const num=h('div',{style:'text-align:center;font-size:44px;font-weight:800;direction:ltr;min-height:56px'});
    const paint=()=>{const p=total?left/total*360:0;const col=s.warn&&left<=10?'#e5484d':s.warn&&left<=total*.2?'#f08a24':s.color;disc.style.background=`conic-gradient(${col} ${p}deg,#e8eaf2 0)`;num.textContent=s.num?pad2(Math.floor(left/60))+':'+pad2(Math.ceil(left%60)):'';disc.style.boxShadow=done?'0 0 0 8px #e5484d55':'none'};
    inst.cleanup=()=>clearInterval(iv);const stop=()=>{clearInterval(iv);iv=null;go.textContent=left<total&&left>0?'▶ Resume':'▶ Start'};
    const go=bt('▶ Start',()=>{if(iv){stop();return}if(left<=0){left=total;done=false}end=Date.now()+left*1000;go.textContent='⏸ Pause';iv=setInterval(()=>{left=Math.max(0,(end-Date.now())/1000);if(left<=0){stop();done=true;if(s.sound)ALARM();go.textContent='▶ Again'}paint()},200)},'sel','font-size:22px;padding:12px 26px');
    const set=m=>{stop();done=false;total=left=Math.max(5,m*60);go.textContent='▶ Start';paint()};
    const adj=(d)=>{stop();total=Math.max(5,total+d);left=total;done=false;go.textContent='▶ Start';paint()};
    b.append(disc,num,h('div',{class:'row',style:'justify-content:center'},bt('−1m',()=>adj(-60)),...[1,5,10,15].map(m=>bt(m+'m',()=>set(m))),bt('+1m',()=>adj(60))),h('div',{class:'row',style:'justify-content:center'},go,bt('Reset',()=>set(total/60))));
    inst.bar.insertBefore(fsBtn(inst),inst.bar.children[1]);paint()})}

/* ---------- Calendar with Hebrew dates and optional Jewish holidays ---------- */
const HM=new Intl.DateTimeFormat('en-u-ca-hebrew',{month:'long',day:'numeric'});
const HE=new Intl.DateTimeFormat('he-u-ca-hebrew',{day:'numeric'});
function hinfo(d){const p=HM.formatToParts(d);return {m:(p.find(x=>x.type==='month')||{}).value||'',d:+((p.find(x=>x.type==='day')||{}).value||0)}}
function holiday(d,diaspora=true){const {m,d:n}=hinfo(d),adar=/^Adar( II)?$/.test(m)&&(m==='Adar II'||m==='Adar');
  const t=(mm,a,b)=>m===mm&&n>=a&&n<=b;
  if(t('Tishri',1,2))return 'Rosh Hashana';if(t('Tishri',3,3))return 'Tzom Gedalia';if(t('Tishri',10,10))return 'Yom Kippur';if(t('Tishri',15,17))return 'Sukkos';if(t('Tishri',18,20))return 'Chol Hamoed';if(t('Tishri',21,21))return 'Hoshana Raba';if(t('Tishri',22,22))return 'Shemini Atzeres';if(t('Tishri',23,23))return 'Simchas Torah';
  if(t('Kislev',25,30)||(m==='Tevet'&&n<=2))return 'Chanukah';if(t('Tevet',10,10))return 'Asara B\'Teves';if(t('Shevat',15,15))return 'Tu B\'Shevat';
  if((m==='Adar II'||m==='Adar')&&n===14)return 'Purim';if(m==='Adar I'&&n===14)return 'Purim Katan';
  if(t('Nisan',15,16))return 'Pesach';if(t('Nisan',17,20))return 'Chol Hamoed';if(t('Nisan',21,22))return 'Pesach';if(t('Iyar',18,18))return 'Lag B\'Omer';if(t('Sivan',6,7))return 'Shavuos';if(t('Tammuz',17,17)||t('Tamuz',17,17))return '17 Tammuz';if(t('Av',9,9))return 'Tisha B\'Av';
  return ''}
const isLeap=d=>{const p=new Intl.DateTimeFormat('en-u-ca-hebrew',{year:'numeric'}).format(d);const y=parseInt(p);return [3,6,8,11,14,17,19].includes(((y-1)%19)+1)};
function calendar(){
  let s=Object.assign({first:0,lang:'both',hol:true,color:'#6d5efc'},get('calendar',{}));const sv=()=>put('calendar',s);
  mk('calendar',{w:500,settings:()=>panel('Calendar',s,[
    {t:'seg',k:'lang',label:'Dates shown',opts:[['both','Both'],['en','English only'],['he','Hebrew only']]},
    {t:'seg',k:'first',label:'Week starts on',opts:[[0,'Sunday'],[1,'Monday'],[6,'Saturday']]},
    {t:'sw',k:'hol',label:'Show Jewish holidays'},{t:'color',k:'color',label:'Highlight color',colors:ACC},{t:'el',el:alphaRow('calendar')}],()=>{Widgets.close('calendar');calendar()},sv)},(b)=>{
    let d=new Date();d.setDate(1);const title=h('div',{style:'font-size:26px;font-weight:800;text-align:center;flex:1'}),grid=h('div',{style:'display:grid;grid-template-columns:repeat(7,1fr);gap:4px;direction:ltr;margin-top:8px;text-align:center'}),sub=h('div',{style:'text-align:center;color:#778;font-size:15px'});
    const DN=['S','M','T','W','T','F','S'];
    const draw=()=>{const fm=+s.first;title.textContent=s.lang==='he'?new Intl.DateTimeFormat('he-u-ca-hebrew',{month:'long',year:'numeric'}).format(new Date(d.getFullYear(),d.getMonth(),15)):d.toLocaleDateString('en-US',{month:'long',year:'numeric'});
      sub.textContent=s.lang==='en'?'':new Intl.DateTimeFormat('he-u-ca-hebrew',{month:'long',year:'numeric'}).format(new Date(d.getFullYear(),d.getMonth(),15));grid.innerHTML='';
      for(let i=0;i<7;i++)grid.append(h('div',{style:'font-weight:800;color:#889;font-size:15px'},DN[(i+fm)%7]));
      for(let i=0;i<(d.getDay()-fm+7)%7;i++)grid.append(h('div'));
      const n=new Date(d.getFullYear(),d.getMonth()+1,0).getDate(),now=new Date();
      for(let i=1;i<=n;i++){const x=new Date(d.getFullYear(),d.getMonth(),i,12),today=x.toDateString()===now.toDateString(),hol=s.hol?holiday(x):'',shab=x.getDay()===6;
        const cell=h('div',{style:`padding:3px 0 4px;border-radius:12px;min-height:${hol?66:52}px;${today?`background:${s.color};color:#fff`:hol?'background:#fff4dc':shab?'background:#f1f2f8':''}`},
          s.lang!=='he'?h('div',{style:'font-size:21px;font-weight:700;line-height:1.2'},String(i)):null,
          s.lang!=='en'?h('div',{style:`font-size:${s.lang==='he'?21:12}px;font-weight:${s.lang==='he'?700:500};opacity:${s.lang==='he'?1:.7}`},HE.format(x)):null,
          hol?h('div',{style:'font-size:10px;font-weight:700;line-height:1.1;color:'+(today?'#fff':'#b36b00')},hol):null);grid.append(cell)}};
    b.append(h('div',{class:'row',style:'align-items:center'},bt('‹',()=>{d.setMonth(d.getMonth()-1);draw()}),title,bt('›',()=>{d.setMonth(d.getMonth()+1);draw()})),sub,grid);draw()})}

/* ---------- Event countdown ---------- */
function countdown(){
  let s=Object.assign({name:'',date:'',time:'00:00',fmt:'auto',color:'#6d5efc',bg:'#ffffff',font:'sans'},get('countdown',{}));const sv=()=>put('countdown',s);
  const edit=()=>panel('Event countdown',s,[{t:'text',k:'name',label:'Event name',ph:'Winter break'},
    {t:'el',el:h('div',{},h('div',{class:'lbl'},'Date and time'),h('div',{class:'row'},h('input',{class:'inp',type:'date',value:s.date,onchange:e=>{s.date=e.target.value;sv();reopen('countdown',countdown)}}),h('input',{class:'inp',type:'time',value:s.time,onchange:e=>{s.time=e.target.value;sv();reopen('countdown',countdown)}})))},
    {t:'seg',k:'fmt',label:'Show',opts:[['auto','Automatic'],['d','Days'],['hms','Days, hours, minutes, seconds']]},{t:'color',k:'color',label:'Number color',colors:ACC},{t:'color',k:'bg',label:'Background',colors:['#ffffff','#fff4dc','#e8f3ff','#eafaf0','#1b2430','#6d5efc']},{t:'el',el:alphaRow('countdown')}],()=>reopen('countdown',countdown),sv);
  mk('countdown',{w:440,settings:edit},(b,inst)=>{const out=h('div',{style:`text-align:center;padding:14px;border-radius:20px;background:${s.bg};color:${s.bg==='#1b2430'||s.bg==='#6d5efc'?'#fff':'#1b2430'}`});let iv;inst.cleanup=()=>clearInterval(iv);
    const draw=()=>{out.innerHTML='';if(!s.date){out.append(h('div',{style:'font-size:20px;opacity:.7;margin:10px'},'Set an event name and date.'),bt('Set event',edit,'sel'));return}
      const ms=new Date(s.date+'T'+(s.time||'00:00')+':00')-new Date(),past=ms<0,a=Math.abs(ms),dd=Math.floor(a/864e5),hh=Math.floor(a/36e5)%24,mm=Math.floor(a/6e4)%60,ss=Math.floor(a/1e3)%60;
      const big=(v,l)=>h('div',{style:'display:inline-block;margin:0 8px;min-width:70px'},h('div',{style:`font-size:${s.fmt==='hms'||(s.fmt==='auto'&&dd<1)?60:100}px;font-weight:800;color:${s.color};line-height:1.05;font-variant-numeric:tabular-nums`},String(v)),h('div',{style:'font-size:16px;opacity:.7'},l));
      out.append(h('div',{dir:'auto',style:'font-size:32px;font-weight:800;margin-bottom:6px'},s.name||'Event'));
      if(s.fmt==='hms'||(s.fmt==='auto'&&dd<1))out.append(big(dd,'days'),big(pad2(hh),'hours'),big(pad2(mm),'min'),big(pad2(ss),'sec'));
      else out.append(big(dd+(a%864e5>0&&!past&&s.fmt==='d'?1:0),dd===1?'day':'days'));
      out.append(h('div',{style:'font-size:18px;opacity:.7;margin-top:4px'},past?'ago':'to go'))};
    iv=setInterval(draw,1000);b.append(out);draw()})}

/* ---------- Group maker ---------- */
function groups(){
  let s=Object.assign({mode:'size',n:3,names:{}},get('groups',{}));const sv=()=>put('groups',s);let G=[];let sel=null;
  mk('groups',{w:720,settings:()=>panel('Group maker',s,[{t:'seg',k:'mode',label:'Divide by',opts:[['size','Students per group'],['count','Number of groups']]},{t:'range',k:'n',label:'Number',min:2,max:12,step:1},{t:'note',label:'Uses your class list and skips students marked absent. Group names can be edited right on the groups.'},{t:'el',el:alphaRow('groups')}],()=>{lbl()},sv)},(b)=>{
    const out=h('div',{style:'display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;direction:ltr'});const lblE=h('span',{style:'font-size:20px;font-weight:800;min-width:150px;text-align:center'});
    const lbl=()=>lblE.textContent=s.n+(s.mode==='size'?' per group':' groups');
    const make=()=>{const names=activeList().students.filter(x=>!x.absent).map(x=>x.name);sel=null;if(!names.length){G=[];draw();return}
      for(let i=names.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[names[i],names[j]]=[names[j],names[i]]}
      const n=s.mode==='size'?Math.max(1,Math.round(names.length/s.n)):Math.min(s.n,names.length);G=Array.from({length:n},()=>[]);names.forEach((x,i)=>G[i%n].push(x));draw()};
    const draw=()=>{out.innerHTML='';if(!G.length){out.append(h('div',{style:'color:#667;padding:10px'},'Tap "Make groups". If it stays empty, add students in Settings, Classroom, Class lists and students.'));return}
      const COL=['#6d5efc','#2f7de1','#2e9e5b','#f08a24','#e5484d','#e56bb0','#14a3a3','#8a6d3b','#7a4de0','#c2410c','#0f766e','#be185d'];
      G.forEach((g,gi)=>{const c=COL[gi%COL.length];const box=h('div',{style:`flex:1 1 200px;border:3px solid ${c}33;border-top:8px solid ${c};border-radius:16px;padding:6px 10px 10px;background:#fff;min-height:90px`,onclick:e=>{if(sel&&e.target===box||sel&&e.target.classList.contains('gh')){G[sel.g].splice(sel.i,1);g.push(sel.n);sel=null;draw()}}},
        h('input',{class:'inp gh',dir:'auto',value:s.names[gi]||'Group '+(gi+1),style:`border:0;background:transparent;font-weight:900;font-size:20px;color:${c};width:100%;padding:2px`,onchange:e=>{s.names[gi]=e.target.value;sv()}}),
        ...g.map((n,i)=>h('div',{dir:'auto',style:`font-size:22px;padding:4px 8px;margin:3px 0;border-radius:10px;cursor:pointer;${sel&&sel.g===gi&&sel.i===i?`background:${c};color:#fff`:'background:#f4f5fa'}`,onclick:ev=>{ev.stopPropagation();if(sel&&!(sel.g===gi&&sel.i===i)){const a=G[sel.g][sel.i];G[sel.g][sel.i]=n;g[i]=a;sel=null}else sel=sel&&sel.g===gi&&sel.i===i?null:{g:gi,i,n};draw()}},n)));out.append(box)})};
    lbl();b.append(h('div',{class:'row',style:'align-items:center;justify-content:center'},bt('−',()=>{s.n=Math.max(2,s.n-1);sv();lbl()}),lblE,bt('+',()=>{s.n=Math.min(12,s.n+1);sv();lbl()}),bt('🔀 Make groups',make,'sel','font-size:20px'),bt('Reshuffle',make)),h('div',{style:'font-size:13px;color:#889;text-align:center'},'To move someone: tap a name, then tap another name (swap) or an empty spot in a group.'),out);make()})}

/* ---------- Dice ---------- */
const PIPS={1:[[50,50]],2:[[28,28],[72,72]],3:[[28,28],[50,50],[72,72]],4:[[28,28],[72,28],[28,72],[72,72]],5:[[28,28],[72,28],[50,50],[28,72],[72,72]],6:[[28,28],[72,28],[28,50],[72,50],[28,72],[72,72]]};
function dieSvg(n,type,col,px){const dark=col==='#1b2430';const ink=dark||col==='#e5484d'||col==='#2f7de1'||col==='#2e9e5b'?'#fff':'#1b2430';
  if(type===6)return `<svg viewBox="0 0 100 100" width="${px}" height="${px}"><rect x="4" y="4" width="92" height="92" rx="20" fill="${col}" stroke="#0002" stroke-width="2"/>${PIPS[n].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="9" fill="${ink}"/>`).join('')}</svg>`;
  const shape={4:'50,6 94,88 6,88',8:'50,4 92,50 50,96 8,50',10:'50,4 92,36 76,92 24,92 8,36',12:'50,4 90,30 78,84 22,84 10,30',20:'50,4 92,28 92,72 50,96 8,72 8,28'}[type];
  return `<svg viewBox="0 0 100 100" width="${px}" height="${px}"><polygon points="${shape}" fill="${col}" stroke="#0002" stroke-width="2" stroke-linejoin="round"/><text x="50" y="${type===4?72:58}" text-anchor="middle" font-size="${n>9?34:40}" font-weight="800" font-family="system-ui,sans-serif" fill="${ink}">${n}</text></svg>`}
function dice(){
  let s=Object.assign({n:2,type:6,color:'#ffffff',sound:false},get('dice',{}));const sv=()=>put('dice',s);
  mk('dice',{w:460,settings:()=>panel('Dice',s,[{t:'seg',k:'type',label:'Dice type',opts:[[4,'4'],[6,'6'],[8,'8'],[10,'10'],[12,'12'],[20,'20']]},{t:'seg',k:'n',label:'How many',opts:[[1,'1'],[2,'2'],[3,'3'],[4,'4'],[5,'5'],[6,'6']]},{t:'color',k:'color',label:'Dice color',colors:['#ffffff','#f5c518','#f08a24','#e5484d','#2f7de1','#2e9e5b','#1b2430']},{t:'sw',k:'sound',label:'Rolling sound'},{t:'el',el:alphaRow('dice')}],()=>reopen('dice',dice),sv)},(b)=>{
    const row=h('div',{style:'display:flex;gap:14px;justify-content:center;flex-wrap:wrap;padding:12px;min-height:140px;cursor:pointer;direction:ltr'});const sum=h('div',{style:'text-align:center;font-size:28px;font-weight:800;min-height:38px'});
    const PX=s.n>3?100:130;let busy=false;
    const roll=()=>{if(busy)return;busy=true;if(s.sound)try{Audio_.unlock();const c=Audio_.ctx;for(let i=0;i<5;i++){const o=c.createOscillator(),g=c.createGain();o.type='square';o.frequency.value=180+Math.random()*120;g.gain.setValueAtTime(.05,c.currentTime+i*.07);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+i*.07+.05);o.connect(g).connect(c.destination);o.start(c.currentTime+i*.07);o.stop(c.currentTime+i*.07+.06)}}catch(e){}
      let k=0,v=[];const iv=setInterval(()=>{v=Array.from({length:s.n},()=>1+Math.floor(Math.random()*s.type));row.innerHTML='';v.forEach(x=>{const d=h('div',{style:`transform:rotate(${(Math.random()-.5)*40}deg);transition:transform .07s`,html:dieSvg(x,+s.type,s.color,PX)});row.append(d)});if(++k>10){clearInterval(iv);busy=false;sum.textContent=s.n>1?'Total: '+v.reduce((a,c)=>a+c,0):''}},70)};
    row.onclick=roll;row.append(h('div',{style:'font-size:96px;line-height:1;opacity:.5'},'🎲'));sum.textContent='Tap to roll';b.append(row,sum);{const bt=h('div',{style:'text-align:center;margin-top:6px'},h('button',{class:'pill big sel',style:'font-size:18px;padding:12px 28px',onclick:roll},'Roll'));b.append(bt)}})}

/* ---------- Scoreboard ---------- */
function scoreboard(){
  const TC=['#6d5efc','#e5484d','#2e9e5b','#f08a24','#2f7de1','#e56bb0','#14a3a3','#8a6d3b'];
  let s=Object.assign({t:[{n:'Team 1',s:0,c:TC[0]},{n:'Team 2',s:0,c:TC[1]}],inc:1,anim:true},get('scoreboard',{}));const sv=()=>put('scoreboard',s);let undo=[];
  mk('scoreboard',{w:600,settings:()=>panel('Scoreboard',s,[{t:'seg',k:'inc',label:'Points per tap',opts:[[1,'1'],[2,'2'],[5,'5'],[10,'10']]},{t:'sw',k:'anim',label:'Winning animation'},...s.t.map((t,i)=>({t:'color',k:'tc'+i,label:t.n,colors:TC})),{t:'el',el:alphaRow('scoreboard')}],()=>{s.t.forEach((t,i)=>{if(s['tc'+i])t.c=s['tc'+i]});reopen('scoreboard',scoreboard)},sv)},(b)=>{
    const wrap=h('div',{style:'display:flex;flex-wrap:wrap;gap:12px;justify-content:center;direction:ltr'});
    const chg=(t,d)=>{undo.push(s.t.map(x=>x.s));t.s+=d;sv();draw()};
    const draw=()=>{wrap.innerHTML='';const top=Math.max(...s.t.map(t=>t.s));s.t.forEach(t=>{wrap.append(h('div',{class:'sbc',style:`flex:1 1 150px;border-radius:20px;padding:8px 8px 12px;text-align:center;background:${t.c}18;border:3px solid ${t.c}`},
      h('input',{class:'inp',dir:'auto',value:t.n,style:`text-align:center;font-weight:800;font-size:22px;width:100%;border:0;background:transparent;color:${t.c}`,onchange:e=>{t.n=e.target.value;sv()}}),
      h('div',{style:`font-size:96px;font-weight:900;line-height:1.05;color:${t.c};font-variant-numeric:tabular-nums`},String(t.s)),
      h('div',{class:'row',style:'justify-content:center'},bt('−'+s.inc,()=>chg(t,-s.inc),'','font-size:22px;min-width:70px'),bt('+'+s.inc,()=>chg(t,s.inc),'sel','font-size:22px;min-width:70px;background:'+t.c))))})};
    const win=()=>{const top=Math.max(...s.t.map(t=>t.s));const w=s.t.filter(t=>t.s===top);toast('🏆 '+w.map(x=>x.n).join(' & ')+(s.anim?'  🎉':''));if(s.anim){const l=document.createElement('div');l.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:60;overflow:hidden';for(let i=0;i<40;i++){const e=document.createElement('div');e.textContent=['🎉','⭐','🏆','✨'][i%4];e.style.cssText=`position:absolute;left:${Math.random()*100}%;top:-40px;font-size:${24+Math.random()*30}px;transition:transform ${1.8+Math.random()*1.5}s ease-in,opacity 3s;`;l.append(e);setTimeout(()=>{e.style.transform=`translateY(${innerHeight+80}px) rotate(${Math.random()*540}deg)`;e.style.opacity=.2},50+Math.random()*400)}document.body.append(l);setTimeout(()=>l.remove(),4200)}};
    b.append(wrap,h('div',{class:'row',style:'justify-content:center;margin-top:10px'},bt('＋ Team',()=>{if(s.t.length<8){s.t.push({n:'Team '+(s.t.length+1),s:0,c:TC[s.t.length%8]});sv();draw()}}),bt('Remove last',()=>{if(s.t.length>1){s.t.pop();sv();draw()}}),bt('↩ Undo',()=>{const p=undo.pop();if(p){s.t.forEach((t,i)=>t.s=p[i]??t.s);sv();draw()}}),bt('Reset',()=>{undo.push(s.t.map(x=>x.s));s.t.forEach(t=>t.s=0);sv();draw()}),bt('🏆 Winner',win,'sel')));draw()})}

Object.assign(M.FN,{stopwatch,visual,calendar,countdown,groups,dice,scoreboard});
})();
