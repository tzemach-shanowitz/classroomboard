'use strict';
/* ===== More tools: traffic light, sound level, work symbols, text, stopwatch, visual timer, calendar,
   event countdown, group maker, dice, scoreboard, poll, stickers, image, video, embed, link, webcam ===== */
(function(){
const NEW=['traffic','sound','worksym','text','stopwatch','visual','calendar','countdown','groups','dice','scoreboard','poll','stickers','image','video','embed','link','webcam'];
const NAMES={traffic:'Traffic light',sound:'Sound level',worksym:'Work symbols',text:'Text',stopwatch:'Stopwatch',visual:'Visual timer',calendar:'Calendar',countdown:'Event countdown',groups:'Group maker',dice:'Dice',scoreboard:'Scoreboard',poll:'Poll',stickers:'Stickers',image:'Image',video:'Video',embed:'Web page',link:'Link',webcam:'Webcam'};
const EMO={traffic:'🚦',sound:'🔊',worksym:'🤫',text:'📝',stopwatch:'⏱️',visual:'⏳',calendar:'📅',countdown:'🎯',groups:'👥',dice:'🎲',scoreboard:'🏆',poll:'📊',stickers:'⭐',image:'🖼️',video:'🎬',embed:'🌐',link:'🔗',webcam:'📷'};
Object.assign(TOOLS,{more:'More tools'});
IC.more='<circle cx="6" cy="6" r="1.6"/><circle cx="12" cy="6" r="1.6"/><circle cx="18" cy="6" r="1.6"/><circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/><circle cx="6" cy="18" r="1.6"/><circle cx="12" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/>';
const K=id=>'w2.'+id;
const get=(id,d)=>Store.get(K(id),d), put=(id,v)=>Store.set(K(id),v);
const btn=(t,f,c='')=>h('button',{class:'pill '+c,onclick:f},t);
function mk(id,opts,build){
  if(Widgets.open[id]){Widgets.close(id);return}
  const gen=()=>window.__kit&&window.__kit.generic(id,inst);
  const inst=Widgets.create(id,NAMES[id],{x:Math.max(20,innerWidth/2-(opts.w||420)/2),y:120,w:opts.w||420,h:opts.h||null,onclose:()=>{try{inst.cleanup&&inst.cleanup()}catch(e){}},settings:opts.settings||gen});
  inst.el.dataset.w2=id;window.__kit&&window.__kit.applyAlpha(id,inst.el);
  if(opts.light!==false)inst.el.classList.add('light');
  inst.body.style.direction='ltr';inst.body.classList.add('w2');
  build(inst.body,inst);return inst}
const beep=()=>{try{Audio_.unlock();return Audio_.play('bell',.8,1)}catch(e){}};

/* 1. Traffic light: red, orange, yellow, green */
const TL=[['#e5484d','Red'],['#f5c518','Yellow'],['#46c26e','Green']];
function traffic(){mk('traffic',{w:200,h:380,light:false,settings:()=>modal('Traffic light labels',b=>{const s=get('traffic',{on:-1,labels:[]});b.append(h('div',{class:'lbl'},'Optional text next to each light'));TL.forEach((c,i)=>b.append(h('input',{class:'inp',dir:'auto',placeholder:c[1],value:(s.labels||[])[i]||'',onchange:e=>{s.labels=s.labels||[];s.labels[i]=e.target.value;put('traffic',s);Widgets.close('traffic');traffic()}})))})},(b)=>{
  const s=get('traffic',{on:-1,labels:[]});b.style.cssText+=';display:flex;flex-direction:column;align-items:center;gap:12px;padding:8px 10px 18px;direction:ltr';
  TL.forEach((c,i)=>{const row=h('div',{style:'display:flex;align-items:center;gap:10px;width:100%;justify-content:center'});
    const d=h('button',{'aria-label':c[1],style:`width:84px;height:84px;border-radius:50%;border:4px solid rgba(255,255,255,.25);background:${s.on===i?c[0]:'rgba(255,255,255,.1)'};box-shadow:${s.on===i?`0 0 34px ${c[0]}`:'none'};transition:.2s`,onclick:()=>{s.on=s.on===i?-1:i;put('traffic',s);Widgets.close('traffic');traffic()}});
    row.append(d);if((s.labels||[])[i])row.append(h('div',{dir:'auto',style:'font-size:20px;font-weight:600;max-width:90px'},s.labels[i]));b.append(row)})})}

/* 2. Sound level (microphone) */
function sound(){mk('sound',{w:380,settings:()=>modal('Sound level',b=>{const s=get('sound',{max:70});b.append(h('div',{class:'lbl'},'Too loud above (percent)'),h('input',{type:'range',min:20,max:95,value:s.max,oninput:e=>{s.max=+e.target.value;put('sound',s)}}))})},(b,inst)=>{
  const s=get('sound',{max:70});const bar=h('div',{style:'height:34px;border-radius:17px;background:#e8eaf2;overflow:hidden;margin:10px 0'});const fill=h('div',{style:'height:100%;width:0;background:#46c26e;transition:width .08s,background .2s'});bar.append(fill);
  const face=h('div',{style:'font-size:80px;text-align:center;line-height:1.1'},'🙂');const msg=h('div',{style:'text-align:center;font-size:18px;color:#667;min-height:26px'},'Tap Start to listen. The browser will ask for the microphone.');
  let stream,ctx,an,raf;const stop=()=>{cancelAnimationFrame(raf);try{stream&&stream.getTracks().forEach(t=>t.stop())}catch(e){}try{ctx&&ctx.close()}catch(e){}stream=ctx=null};inst.cleanup=stop;
  const go=btn('🎤 Start',async()=>{if(stream){stop();go.textContent='🎤 Start';return}
    try{stream=await navigator.mediaDevices.getUserMedia({audio:true});ctx=new(window.AudioContext||window.webkitAudioContext)();an=ctx.createAnalyser();an.fftSize=512;ctx.createMediaStreamSource(stream).connect(an);const buf=new Uint8Array(an.fftSize);go.textContent='⏹ Stop';msg.textContent='';let sm=0;
      const loop=()=>{an.getByteTimeDomainData(buf);let m=0;for(const v of buf)m+=Math.abs(v-128);const lv=Math.min(100,m/buf.length*14);sm=sm*.8+lv*.2;fill.style.width=sm+'%';const over=sm>s.max,mid=sm>s.max*.65;fill.style.background=over?'#e5484d':mid?'#f5c518':'#46c26e';face.textContent=over?'😠':mid?'😐':'🙂';raf=requestAnimationFrame(loop)};loop()}
    catch(e){msg.textContent='No microphone access. Allow it in the browser, or this board may not offer one.'}},'big sel');
  b.append(face,bar,msg,h('div',{style:'text-align:center;margin-top:8px'},go))})}

/* 3. Work symbols */
function worksym(){const he=!!window.LEGACY||(typeof LEGACY!=='undefined'&&LEGACY);const S=[['🤫',he?'שקט':'Silent'],['🗣️',he?'לחישה':'Whisper'],['🧑‍🤝‍🧑',he?'עם חבר':'Partner talk'],['👥',he?'בקבוצה':'Group talk'],['🙋',he?'שאלה':'Ask a question']];
  mk('worksym',{w:620},(b)=>{const s=get('worksym',{on:0});b.style.cssText+=';display:flex;flex-wrap:wrap;gap:14px;justify-content:center;padding:10px';
    const draw=()=>{b.innerHTML='';S.forEach((x,i)=>b.append(h('button',{style:`width:104px;padding:12px 4px;border-radius:18px;border:3px solid ${s.on===i?'#6d5efc':'#e3e6ee'};background:${s.on===i?'#eeeaff':'#fff'};font-size:46px;display:flex;flex-direction:column;align-items:center;gap:4px`,onclick:()=>{s.on=i;put('worksym',s);draw()}},x[0],h('span',{dir:'auto',style:'font-size:17px;font-weight:700;color:#223'},x[1]))))};draw()})}

/* 4. Text */
function text(){mk('text',{w:460,h:260},(b)=>{const s=get('text',{t:''});b.style.cssText+=';padding:8px';
  const t=h('div',{contenteditable:'true',dir:'auto',style:'min-height:150px;font-size:34px;line-height:1.3;outline:none;padding:6px;white-space:pre-wrap',oninput:()=>{s.t=t.innerText;put('text',s)}});t.innerText=s.t||'';if(!s.t)t.dataset.ph=1;b.append(t,h('div',{style:'font-size:13px;color:#99a'},'Tap the text to type.'));setTimeout(()=>t.focus(),100)})}

/* 5. Stopwatch */
function stopwatch(){mk('stopwatch',{w:360},(b,inst)=>{let t0=0,acc=0,iv=null;const fmt=ms=>{const c=Math.floor(ms/10)%100,s=Math.floor(ms/1000)%60,m=Math.floor(ms/60000);return pad(m)+':'+pad(s)+'.'+pad(c)};
  const disp=h('div',{style:'font-size:64px;font-weight:700;text-align:center;font-variant-numeric:tabular-nums;padding:10px 0;direction:ltr'},'00:00.00');const laps=h('div',{style:'font-size:16px;color:#556;text-align:center;max-height:90px;overflow:auto'});
  const tick=()=>disp.textContent=fmt(acc+(t0?Date.now()-t0:0));inst.cleanup=()=>clearInterval(iv);
  const go=btn('▶ Start',()=>{if(t0){acc+=Date.now()-t0;t0=0;clearInterval(iv);go.textContent='▶ Start';tick()}else{t0=Date.now();iv=setInterval(tick,40);go.textContent='⏸ Stop'}},'big sel');
  b.append(disp,h('div',{class:'row',style:'justify-content:center'},go,btn('Lap',()=>{laps.prepend(h('div',{},disp.textContent))}),btn('Reset',()=>{clearInterval(iv);t0=0;acc=0;laps.innerHTML='';go.textContent='▶ Start';tick()})),laps)})}

/* 6. Visual timer: shrinking disc */
function visual(){mk('visual',{w:380},(b,inst)=>{let total=300,left=300,iv=null,end=0;
  const disc=h('div',{style:'width:240px;height:240px;border-radius:50%;margin:8px auto;transition:background .3s'});const num=h('div',{style:'text-align:center;font-size:40px;font-weight:700;direction:ltr'});
  const paint=()=>{const p=total?left/total*360:0;const col=left<=10?'#e5484d':left<=total*.25?'#f08a24':'#6d5efc';disc.style.background=`conic-gradient(${col} ${p}deg,#e8eaf2 0)`;num.textContent=pad(Math.floor(left/60))+':'+pad(Math.ceil(left%60))};
  inst.cleanup=()=>clearInterval(iv);const stop=()=>{clearInterval(iv);iv=null;go.textContent='▶ Start'};
  const go=btn('▶ Start',()=>{if(iv){stop();return}if(left<=0)left=total;end=Date.now()+left*1000;go.textContent='⏸ Pause';iv=setInterval(()=>{left=Math.max(0,(end-Date.now())/1000);paint();if(left<=0){stop();beep()}},200)},'big sel');
  const set=m=>{stop();total=left=m*60;paint()};paint();
  b.append(disc,num,h('div',{class:'row',style:'justify-content:center;gap:8px'},...[1,2,5,10,15,20].map(m=>btn(m+'m',()=>set(m)))),h('div',{class:'row',style:'justify-content:center'},go,btn('Reset',()=>set(total/60))))})}

/* 7. Calendar */
function calendar(){mk('calendar',{w:440},(b)=>{let d=new Date();d.setDate(1);const heb=new Intl.DateTimeFormat('he-u-ca-hebrew',{day:'numeric'});const title=h('div',{style:'font-size:24px;font-weight:700;text-align:center;flex:1'});const grid=h('div',{style:'display:grid;grid-template-columns:repeat(7,1fr);gap:4px;direction:ltr;margin-top:8px;text-align:center'});
  const draw=()=>{title.textContent=d.toLocaleDateString('en-US',{month:'long',year:'numeric'});grid.innerHTML='';['S','M','T','W','T','F','S'].forEach(x=>grid.append(h('div',{style:'font-weight:700;color:#889'},x)));for(let i=0;i<d.getDay();i++)grid.append(h('div'));const n=new Date(d.getFullYear(),d.getMonth()+1,0).getDate(),now=new Date();
    for(let i=1;i<=n;i++){const x=new Date(d.getFullYear(),d.getMonth(),i,12);const today=x.toDateString()===now.toDateString();grid.append(h('div',{style:`padding:4px 0;border-radius:10px;${today?'background:#6d5efc;color:#fff':''}`},h('div',{style:'font-size:20px;font-weight:600'},i),h('div',{style:'font-size:11px;opacity:.65'},heb.format(x))))}};
  b.append(h('div',{class:'row',style:'align-items:center'},btn('‹',()=>{d.setMonth(d.getMonth()-1);draw()}),title,btn('›',()=>{d.setMonth(d.getMonth()+1);draw()})),grid);draw()})}

/* 8. Event countdown */
function countdown(){mk('countdown',{w:400,settings:()=>edit()},(b)=>{const s=get('countdown',{name:'',date:''});const out=h('div',{style:'text-align:center;padding:10px'});
  const draw=()=>{out.innerHTML='';if(!s.date){out.append(h('div',{style:'font-size:20px;color:#667'},'Set an event name and date.'),btn('Set event',edit,'big sel'));return}
    const days=Math.round((new Date(s.date+'T00:00:00')-new Date(new Date().toDateString()))/864e5);out.append(h('div',{dir:'auto',style:'font-size:30px;font-weight:700'},s.name||'Event'),h('div',{style:'font-size:90px;font-weight:800;color:#6d5efc;line-height:1.1'},String(Math.abs(days))),h('div',{style:'font-size:22px'},days===0?'Today!':days>0?(days===1?'day to go':'days to go'):(days===-1?'day ago':'days ago')))};
  function edit(){modal('Event countdown',m=>{m.append(h('div',{class:'lbl'},'Event name'),h('input',{class:'inp',dir:'auto',value:s.name,onchange:e=>{s.name=e.target.value;put('countdown',s);draw()}}),h('div',{class:'lbl'},'Date'),h('input',{class:'inp',type:'date',value:s.date,onchange:e=>{s.date=e.target.value;put('countdown',s);draw()}}))})}
  b.append(out);draw()})}

/* 9. Group maker (uses the active class list, skips absent students) */
function groups(){mk('groups',{w:640},(b)=>{let size=3;const out=h('div',{style:'display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;direction:ltr'});
  const make=()=>{const names=activeList().students.filter(x=>!x.absent).map(x=>x.name);out.innerHTML='';if(!names.length){out.append(h('div',{style:'color:#667'},'No students in the active list. Add names in Settings, Students.'));return}
    for(let i=names.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[names[i],names[j]]=[names[j],names[i]]}
    const n=Math.max(1,Math.round(names.length/size));const G=Array.from({length:n},()=>[]);names.forEach((x,i)=>G[i%n].push(x));
    G.forEach((g,i)=>out.append(h('div',{style:'flex:1 1 170px;border:2px solid #e3e6ee;border-radius:14px;padding:8px 12px'},h('div',{style:'font-weight:800;color:#6d5efc;margin-bottom:4px'},'Group '+(i+1)),...g.map(x=>h('div',{dir:'auto',style:'font-size:20px'},x)))))};
  const lbl=h('span',{style:'font-size:22px;font-weight:700;min-width:120px;text-align:center'},'3 per group');
  b.append(h('div',{class:'row',style:'align-items:center;justify-content:center'},btn('−',()=>{size=Math.max(2,size-1);lbl.textContent=size+' per group'}),lbl,btn('+',()=>{size=Math.min(12,size+1);lbl.textContent=size+' per group'}),btn('🔀 Make groups',make,'big sel')),out)})}

/* 10. Dice */
function dice(){mk('dice',{w:420},(b)=>{let n=2;const row=h('div',{style:'display:flex;gap:16px;justify-content:center;padding:14px;flex-wrap:wrap'});const F=['⚀','⚁','⚂','⚃','⚄','⚅'];
  const roll=()=>{row.innerHTML='';let k=0;const iv=setInterval(()=>{row.innerHTML='';for(let i=0;i<n;i++)row.append(h('div',{style:'font-size:110px;line-height:1'},F[Math.floor(Math.random()*6)]));if(++k>9){clearInterval(iv);const v=[...row.children].map(c=>F.indexOf(c.textContent)+1);b.querySelector('.sum').textContent=n>1?'Total: '+v.reduce((a,c)=>a+c,0):''}},70)};
  b.append(row,h('div',{class:'sum',style:'text-align:center;font-size:26px;font-weight:700;min-height:34px'}),h('div',{class:'row',style:'justify-content:center'},btn('1 die',()=>{n=1;roll()}),btn('2 dice',()=>{n=2;roll()}),btn('3 dice',()=>{n=3;roll()}),btn('🎲 Roll',roll,'big sel')));roll()})}

/* 11. Scoreboard */
function scoreboard(){mk('scoreboard',{w:520},(b)=>{const s=get('scoreboard',{t:[{n:'Team 1',s:0},{n:'Team 2',s:0}]});const wrap=h('div',{style:'display:flex;flex-wrap:wrap;gap:12px;justify-content:center'});const sv=()=>put('scoreboard',s);
  const draw=()=>{wrap.innerHTML='';s.t.forEach((t,i)=>{wrap.append(h('div',{style:'flex:1 1 140px;border:2px solid #e3e6ee;border-radius:16px;padding:8px;text-align:center'},
    h('input',{class:'inp',dir:'auto',value:t.n,style:'text-align:center;font-weight:700;font-size:20px;width:100%',onchange:e=>{t.n=e.target.value;sv()}}),h('div',{style:'font-size:72px;font-weight:800;line-height:1.1;color:#6d5efc'},String(t.s)),
    h('div',{class:'row',style:'justify-content:center'},btn('−',()=>{t.s--;sv();draw()}),btn('+',()=>{t.s++;sv();draw()},'sel'))))})};
  b.append(wrap,h('div',{class:'row',style:'justify-content:center;margin-top:10px'},btn('＋ Team',()=>{if(s.t.length<8){s.t.push({n:'Team '+(s.t.length+1),s:0});sv();draw()}}),btn('Remove last',()=>{if(s.t.length>1){s.t.pop();sv();draw()}}),btn('Reset scores',()=>{s.t.forEach(t=>t.s=0);sv();draw()})));draw()})}

/* 12. Poll (teacher taps to count each vote) */
function poll(){mk('poll',{w:480},(b)=>{const s=get('poll',{q:'',o:[{n:'A',v:0},{n:'B',v:0},{n:'C',v:0}]});const sv=()=>put('poll',s);const list=h('div');
  const draw=()=>{list.innerHTML='';const tot=s.o.reduce((a,c)=>a+c.v,0)||1;s.o.forEach(o=>list.append(h('div',{style:'margin:8px 0'},h('div',{class:'row',style:'align-items:center'},h('input',{class:'inp',dir:'auto',value:o.n,style:'flex:1;font-size:20px',onchange:e=>{o.n=e.target.value;sv()}}),h('b',{style:'font-size:28px;min-width:40px;text-align:center'},String(o.v)),btn('＋',()=>{o.v++;sv();draw()},'sel'),btn('−',()=>{o.v=Math.max(0,o.v-1);sv();draw()})),h('div',{style:'height:14px;border-radius:7px;background:#e8eaf2;overflow:hidden'},h('div',{style:`height:100%;width:${o.v/tot*100}%;background:#6d5efc;transition:width .3s`})))))};
  b.append(h('input',{class:'inp',dir:'auto',placeholder:'Question',value:s.q,style:'width:100%;font-size:22px;font-weight:700',onchange:e=>{s.q=e.target.value;sv()}}),list,h('div',{class:'row'},btn('＋ Option',()=>{if(s.o.length<6){s.o.push({n:String.fromCharCode(65+s.o.length),v:0});sv();draw()}}),btn('Reset votes',()=>{s.o.forEach(o=>o.v=0);sv();draw()})));draw()})}

/* 13. Stickers: tap one, it lands on the screen; drag to move, double tap to remove */
function stickers(){
  let layer=document.getElementById('stickerlayer');if(!layer){layer=h('div',{id:'stickerlayer',style:'position:fixed;inset:0;pointer-events:none;z-index:6'});document.body.append(layer)}
  const sv=()=>put('stickers',[...layer.children].map(e=>[e.textContent,parseFloat(e.style.left),parseFloat(e.style.top),parseFloat(e.style.fontSize)]));
  const add=(c,x,y,sz)=>{const e=h('div',{style:`position:absolute;left:${x}px;top:${y}px;font-size:${sz||80}px;pointer-events:auto;touch-action:none;cursor:grab;user-select:none;line-height:1`},c);let dx,dy,last=0;
    e.addEventListener('pointerdown',ev=>{const n=Date.now();if(n-last<350){e.remove();sv();return}last=n;e.setPointerCapture(ev.pointerId);dx=ev.clientX-e.offsetLeft;dy=ev.clientY-e.offsetTop;e.onpointermove=m=>{e.style.left=(m.clientX-dx)+'px';e.style.top=(m.clientY-dy)+'px'};e.onpointerup=()=>{e.onpointermove=null;sv()}});layer.append(e)};
  if(!layer.dataset.loaded){layer.dataset.loaded=1;(get('stickers',[])||[]).forEach(a=>add(a[0],a[1],a[2],a[3]))}
  mk('stickers',{w:440},(b)=>{const E=['⭐','🌟','❤️','👍','👏','🎉','🏆','🥇','😀','🤩','💡','✅','❓','❗','🔥','🌈','📚','✏️','🎵','🍎'];b.style.cssText+=';display:flex;flex-wrap:wrap;gap:6px;justify-content:center';
    E.forEach(c=>b.append(h('button',{style:'font-size:44px;background:none;border:0;padding:4px',onclick:()=>{add(c,innerWidth/2-40+Math.random()*120-60,innerHeight/2-40+Math.random()*120-60);sv()}},c)));b.append(h('div',{style:'width:100%;text-align:center;font-size:14px;color:#889'},'Drag to move. Double tap a sticker to remove it.'),btn('Clear all',()=>{layer.innerHTML='';sv()}))})}

/* 14. Image (shown for this session only; pictures are not saved to the account) */
function image(){mk('image',{w:520},(b)=>{const inp=h('input',{type:'file',accept:'image/*',style:'display:none',onchange:e=>{const f=e.target.files[0];if(!f)return;const u=URL.createObjectURL(f);b.querySelector('.pic').innerHTML='';b.querySelector('.pic').append(h('img',{src:u,style:'max-width:100%;max-height:70vh;border-radius:10px;display:block;margin:auto'}))}});
  b.append(h('div',{class:'pic',style:'min-height:80px;text-align:center'}),inp,h('div',{style:'text-align:center;margin-top:8px'},btn('🖼️ Choose picture',()=>inp.click(),'big sel'),h('div',{style:'font-size:13px;color:#889;margin-top:6px'},'Shown on this screen only. Not saved.')))})}

/* 15. Video (YouTube link) / 16. Web page / 17. Link */
function ytId(u){const m=u.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);return m&&m[1]}
function urlWidget(id,ph,render,w,h_){mk(id,{w,h:h_},(b)=>{const s=get(id,{u:''});const box=h('div',{style:'margin-top:8px'});const inp=h('input',{class:'inp',dir:'ltr',placeholder:ph,value:s.u,style:'width:100%'});
  const go=()=>{let u=inp.value.trim();if(u&&!/^https?:/i.test(u))u='https://'+u;s.u=u;put(id,s);box.innerHTML='';if(u)render(box,u)};inp.onchange=go;b.append(h('div',{class:'row'},inp,btn('Go',go,'sel')),box);if(s.u)render(box,s.u)})}
function video(){urlWidget('video','Paste a YouTube link',(box,u)=>{const v=ytId(u);box.append(v?h('iframe',{src:'https://www.youtube-nocookie.com/embed/'+v,allow:'autoplay; fullscreen',allowfullscreen:'',style:'width:100%;aspect-ratio:16/9;border:0;border-radius:10px'}):h('div',{style:'color:#c33'},'That does not look like a YouTube link.'))},640)}
function embed(){urlWidget('embed','Paste a web page address',(box,u)=>{box.append(h('iframe',{src:u,style:'width:100%;height:60vh;border:0;border-radius:10px;background:#fff'}),h('div',{style:'font-size:13px;color:#889;margin-top:4px'},'Some sites refuse to be shown inside another page. If it stays blank, use the Link tool instead.'))},760)}
function link(){mk('link',{w:380},(b)=>{const s=get('link',{u:'',t:''});const draw=()=>{b.innerHTML='';if(s.u){b.append(h('div',{style:'text-align:center;padding:8px'},h('a',{href:s.u,target:'_blank',rel:'noopener',style:'display:inline-block;background:#6d5efc;color:#fff;font-size:28px;font-weight:700;padding:16px 28px;border-radius:16px;text-decoration:none',dir:'auto'},s.t||s.u)),h('div',{style:'text-align:center'},btn('Edit',()=>{s.u='';put('link',s);draw()})))}else{const u=h('input',{class:'inp',dir:'ltr',placeholder:'Web address',style:'width:100%'}),t=h('input',{class:'inp',dir:'auto',placeholder:'Button text (optional)',style:'width:100%;margin-top:6px'});b.append(u,t,btn('Save',()=>{let x=u.value.trim();if(!x)return;if(!/^https?:/i.test(x))x='https://'+x;s.u=x;s.t=t.value.trim();put('link',s);draw()},'big sel'))}};draw()})}

/* 18. Webcam */
function webcam(){mk('webcam',{w:520},(b,inst)=>{let st;const v=h('video',{autoplay:'',playsinline:'',muted:'',style:'width:100%;border-radius:12px;background:#000;display:block;transform:scaleX(-1)'});const msg=h('div',{style:'text-align:center;color:#667;margin-top:6px'});
  inst.cleanup=()=>{try{st&&st.getTracks().forEach(t=>t.stop())}catch(e){}};
  navigator.mediaDevices.getUserMedia({video:true}).then(s=>{st=s;v.srcObject=s;v.play()}).catch(()=>{msg.textContent='No camera access. Allow it in the browser, or this board may not offer one.'});b.append(v,msg)})}

const FN={traffic,sound,worksym,text,stopwatch,visual,calendar,countdown,groups,dice,scoreboard,poll,stickers,image,video,embed,link,webcam};
window.openMore=function(){modal('More tools',b=>{b.style.cssText+=';display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;direction:ltr';
  NEW.forEach(id=>b.append(h('button',{style:'display:flex;flex-direction:column;align-items:center;gap:4px;padding:14px 6px;border-radius:16px;border:2px solid #e3e6ee;background:#fff;font-size:16px;font-weight:600;color:#223',onclick:e=>{e.currentTarget.closest('.scrim').remove();window.__more.FN[id]()}},h('span',{style:'font-size:40px;line-height:1'},EMO[id]),NAMES[id])))})};
window.__more={FN,NEW,mk,get,put,btn,NAMES,EMO,beep};
/* demo hook: ?demo=<id> */
addEventListener('load',()=>setTimeout(()=>{if(!window.__demo&&(get('stickers',[])||[]).length){try{stickers();Widgets.close('stickers')}catch(e){}}if(window.__demo&&window.__more.FN[window.__demo])try{window.__more.FN[window.__demo]()}catch(e){}},1300));
})();
