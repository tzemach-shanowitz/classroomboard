'use strict';
/* ===== Widget design kit + rebuilt widgets (stage 1): Traffic light, Sound level, Work symbols, Text ===== */
(function(){
const M=window.__more;if(!M)return;const {mk,get,put}=M;
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
/* ---------- shared settings panel ---------- */
const PAL=['#46c26e','#f5c518','#f08a24','#e5484d','#4aa8ff','#6d5efc','#e56bb0','#1b2430','#ffffff','#8a93a6'];
function panel(title,s,rows,change,save){
  if(window.__panel2)return window.__panel2(title,s,rows,change,save,PAL);
  return modal(title,b=>{
    const upd=()=>{save&&save();change&&change()};
    rows.forEach(r=>{
      if(r.h){b.append(h('div',{class:'lbl',style:'margin-top:14px;font-weight:800'},r.h));return}
      const lab=h('div',{class:'lbl'},r.label);
      if(r.t==='seg'){const row=h('div',{class:'row'});r.opts.forEach(([v,l])=>{const p=h('button',{class:'pill'+(s[r.k]===v?' sel':''),onclick:()=>{s[r.k]=v;$$('button',row).forEach(x=>x.classList.remove('sel'));p.classList.add('sel');upd()}},l);row.append(p)});b.append(lab,row)}
      else if(r.t==='color'){const row=h('div',{class:'row'});(r.colors||PAL).forEach(c=>{const d=h('button',{'aria-label':c,style:`width:38px;height:38px;border-radius:50%;background:${c};border:3px solid ${s[r.k]===c?'#6d5efc':'#d8dce8'}`,onclick:()=>{s[r.k]=c;$$('button',row).forEach(x=>x.style.borderColor='#d8dce8');d.style.borderColor='#6d5efc';upd()}});row.append(d)});b.append(lab,row)}
      else if(r.t==='range'){const v=h('span',{style:'min-width:56px;text-align:right;font-weight:700'},(r.fmt?r.fmt(s[r.k]):s[r.k]));b.append(lab,h('div',{class:'row',style:'align-items:center'},h('input',{type:'range',min:r.min,max:r.max,step:r.step||1,value:s[r.k],style:'flex:1;min-width:200px',oninput:e=>{s[r.k]=+e.target.value;v.textContent=r.fmt?r.fmt(s[r.k]):s[r.k];upd()}}),v))}
      else if(r.t==='sw'){b.append(chk(s[r.k],v=>{s[r.k]=v;upd()},r.label))}
      else if(r.t==='text'){b.append(lab,h('input',{class:'inp',dir:'auto',placeholder:r.ph||'',value:s[r.k]||'',style:'width:100%',onchange:e=>{s[r.k]=e.target.value;upd()}}))}
      else if(r.t==='sel'){b.append(lab,h('select',{class:'inp',onchange:e=>{s[r.k]=e.target.value;upd()}},...r.opts.map(([v,l])=>h('option',{value:v,selected:s[r.k]===v},l))))}
      else if(r.t==='note'){b.append(h('div',{style:'font-size:14px;color:#778;margin:8px 0'},r.label))}
      else if(r.t==='el'){b.append(r.el)}
    })})}
function applyAlpha(id,el){const u=get(id+'.ui',{a:100});el.style.setProperty('--wa',(u.a??100)/100);el.classList.add('w2t')}
function generic(id,inst){const u=get(id+'.ui',{a:100});panel(M.NAMES[id]+' settings',u,[{t:'range',k:'a',label:'Transparency',min:20,max:100,step:5,fmt:v=>(100-v)+'%'}],()=>applyAlpha(id,inst.el),()=>put(id+'.ui',u))}
window.__kit={panel,applyAlpha,generic,PAL};
const reopen=(id,fn)=>{Widgets.close(id);const sv=Store.get('w.'+id,null);if(sv){delete sv.w;delete sv.h;Store.set('w.'+id,sv)}fn()};
function alphaRow(id){const u=get(id+'.ui',{a:100});const v=h('span',{style:'min-width:56px;text-align:right;font-weight:700'},(100-u.a)+'%');return h('div',{},h('div',{class:'lbl'},'Transparency'),h('div',{class:'row',style:'align-items:center'},h('input',{type:'range',min:20,max:100,step:5,value:u.a,style:'flex:1;min-width:200px',oninput:e=>{u.a=+e.target.value;v.textContent=(100-u.a)+'%';put(id+'.ui',u);const o=Widgets.open[id];if(o)applyAlpha(id,o.el)}}),v))}
const uiRow=id=>{const u=get(id+'.ui',{a:100});return {u,row:{t:'range',k:'a',label:'Transparency',min:20,max:100,step:5,fmt:v=>(100-v)+'%'},save:()=>put(id+'.ui',u)}};

/* ---------- 1. Traffic light: red, orange, yellow, green ---------- */
const TLN=['Red','Yellow','Green'],TLD={r:'#ef5b5b',y:'#f6cf4a',g:'#4fcf7e'};
const SOFT={r:['#ef5b5b','#e5484d','#ff7a7a'],y:['#f6cf4a','#f5c518','#ffe27a'],g:['#4fcf7e','#46c26e','#7be0a0']};
function traffic(){
  const def={on:-1,orient:'v',size:100,labels:['','',''],c:{...TLD},glow:true,showLabels:false};
  let s=Object.assign({},def,get('traffic',{}));s.c=Object.assign({},TLD,s.c);
  const sv=()=>put('traffic',s);
  const vert=s.orient==='v',D=Math.round(92*s.size/100),pad_=Math.round(18*s.size/100);
  const W=vert?D+pad_*2+(s.showLabels?150:0)+24:(D+16)*3+pad_*2+24,Hh=vert?(D+14)*3+pad_*2+70:D+pad_*2+(s.showLabels?44:0)+70;
  mk('traffic',{w:Math.max(W,240),h:Hh,light:false,settings:()=>{
    const u=get('traffic.ui',{a:100});
    panel('Traffic light',s,[
      {t:'seg',k:'orient',label:'Orientation',opts:[['v','Vertical'],['h','Horizontal']]},
      {t:'range',k:'size',label:'Size',min:60,max:160,step:10,fmt:v=>v+'%'},
      {t:'sw',k:'glow',label:'Glow on the active light'},
      {t:'sw',k:'showLabels',label:'Show labels'},
      {h:'Labels'},...[0,1,2].map(i=>({t:'el',el:h('input',{class:'inp',dir:'auto',placeholder:TLN[i],value:s.labels[i]||'',style:'width:100%;margin:3px 0',onchange:e=>{s.labels[i]=e.target.value;sv();reopen('traffic',traffic)}})})),
      {h:'Colors'},...['r','y','g'].map((k,i)=>({t:'color',k:'c_'+k,label:TLN[i],colors:SOFT[k]})),
      {t:'el',el:alphaRow('traffic')}
    ],()=>reopen('traffic',traffic),sv);
  }},(b,inst)=>{
        const lights=['r','y','g'];
    b.style.cssText+=`;display:flex;flex-direction:${vert?'column':'row'};align-items:center;justify-content:center;gap:14px;padding:${pad_}px;direction:ltr;background:linear-gradient(160deg,#2b3140,#1b2030);border-radius:26px;margin:6px`;
    const draw=()=>{b.innerHTML='';lights.forEach((k,i)=>{const col=s['c_'+k]||s.c[k];const on=s.on===i;
      const d=h('button',{'aria-label':TLN[i],style:`width:${D}px;height:${D}px;border-radius:50%;border:0;position:relative;cursor:pointer;transition:all .25s;background:${on?`radial-gradient(circle at 35% 30%,#fff9 0,${col} 40%,${col} 100%)`:'radial-gradient(circle at 35% 30%,#4a5164,#2f3546)'};box-shadow:${on&&s.glow?`0 0 ${D*.5}px ${col}aa,0 0 ${D*.2}px ${col}`:'inset 0 3px 8px #0006'};${on?'transform:scale(1.04)':'opacity:.9'}`,onclick:()=>{s.on=on?-1:i;sv();draw()}});
      const wrap=h('div',{style:'display:flex;align-items:center;gap:12px'},d);
      if(s.showLabels){wrap.append(h('div',{dir:'auto',style:`font-size:${Math.round(22*s.size/100)}px;font-weight:700;color:${on?col:'#aab'};min-width:90px`},s.labels[i]||TLN[i]))}
      b.append(wrap)})};
    draw();
  });
  // fix panel color keys to persist in s.c via flat c_ keys: already stored in s and saved with sv
}

/* ---------- 2. Sound level ---------- */
function sound(){
  const def={sens:50,max:70,style:'dial',warn:false,dev:'',floor:0};let s=Object.assign({},def,get('sound',{}));const sv=()=>put('sound',s);
  const open=async()=>{let devs=[];try{devs=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='audioinput')}catch(e){}
    panel('Sound level',s,[
      {t:'seg',k:'style',label:'Look',opts:[['dial','Dial'],['bars','Bars'],['face','Face']]},
      {t:'range',k:'sens',label:'Sensitivity',min:10,max:100,step:5,fmt:v=>v+'%'},
      {t:'range',k:'max',label:'Too loud above',min:20,max:95,step:5,fmt:v=>v+'%'},
      {t:'sw',k:'warn',label:'Play a soft chime when too loud'},
      devs.length>1?{t:'sel',k:'dev',label:'Microphone',opts:[['','Default'],...devs.map((d,i)=>[d.deviceId,d.label||'Microphone '+(i+1)])]}:{t:'note',label:'Microphone choice appears here when more than one is available (after permission is given).'},
      {t:'el',el:h('div',{},h('div',{class:'lbl'},'Calibrate'),h('div',{style:'font-size:14px;color:#778;margin-bottom:6px'},'Ask for quiet, then tap. It learns the normal background hum of your room.'),btn('Calibrate (3 seconds)',()=>{calib=true;toast('Stay quiet for 3 seconds')}))},
      {t:'note',label:'Sound is measured on this device only. Nothing is recorded, saved or sent anywhere.'},
      {t:'el',el:alphaRow('sound')}
    ],()=>{if(s.dev!==curDev){reopen('sound',sound)}else paintStatic()},sv)};
  const btn=(t,f)=>h('button',{class:'pill sel',onclick:f},t);
  let calib=false,curDev=s.dev,stream,ctx,an,raf,sm=0,warnAt=0,overSince=0;
  mk('sound',{w:400,settings:open},(b,inst)=>{
    const stage=h('div',{style:'min-height:210px;display:flex;align-items:center;justify-content:center;flex-direction:column'});
    const msg=h('div',{style:'text-align:center;font-size:17px;color:#667;min-height:24px;margin-top:6px'});
    b.append(stage,msg);b.style.padding='6px 12px 14px';
    const stop=()=>{cancelAnimationFrame(raf);try{stream&&stream.getTracks().forEach(t=>t.stop())}catch(e){}try{ctx&&ctx.close()}catch(e){}stream=ctx=null};inst.cleanup=stop;
    let draw;
    const build=()=>{stage.innerHTML='';
      if(s.style==='dial'){stage.innerHTML=`<svg viewBox="0 0 220 130" style="width:300px"><defs><linearGradient id="sg" x1="0" x2="1"><stop offset="0" stop-color="#46c26e"/><stop offset=".6" stop-color="#f5c518"/><stop offset="1" stop-color="#e5484d"/></linearGradient></defs><path d="M20 110 A90 90 0 0 1 200 110" fill="none" stroke="#e8eaf2" stroke-width="20" stroke-linecap="round"/><path id="arc" d="M20 110 A90 90 0 0 1 200 110" fill="none" stroke="url(#sg)" stroke-width="20" stroke-linecap="round" stroke-dasharray="283" stroke-dashoffset="283"/><g id="nd" style="transform-origin:110px 110px"><line x1="110" y1="110" x2="110" y2="36" stroke="#223" stroke-width="5" stroke-linecap="round"/><circle cx="110" cy="110" r="9" fill="#223"/></g><line id="thr" x1="110" y1="110" x2="110" y2="14" stroke="#6d5efc" stroke-width="3" stroke-dasharray="4 4" style="transform-origin:110px 110px"/></svg><div id="em" style="font-size:54px;line-height:1">🙂</div>`;
        const a=stage.querySelector('#arc'),n=stage.querySelector('#nd'),t=stage.querySelector('#thr'),em=stage.querySelector('#em');
        t.style.transform=`rotate(${s.max/100*180-90}deg)`;draw=v=>{a.style.strokeDashoffset=283*(1-v/100);n.style.transform=`rotate(${v/100*180-90}deg)`;em.textContent=v>s.max?'😠':v>s.max*.7?'😐':'🙂'}}
      else if(s.style==='bars'){const row=h('div',{style:'display:flex;gap:6px;align-items:flex-end;height:170px'});const N=14,segs=[];for(let i=0;i<N;i++){const e=h('div',{style:`width:18px;height:${40+i*9}px;border-radius:8px;background:#e8eaf2;transition:background .1s`});segs.push(e);row.append(e)}stage.append(row);
        draw=v=>{segs.forEach((e,i)=>{const on=(i+1)/N*100<=v+4;const col=(i+1)/N*100>s.max?'#e5484d':(i+1)/N*100>s.max*.7?'#f5c518':'#46c26e';e.style.background=on?col:'#e8eaf2'})}}
      else{const f=h('div',{style:'font-size:120px;line-height:1.1;transition:transform .15s'},'🙂'),bar=h('div',{style:'width:300px;height:22px;border-radius:11px;background:#e8eaf2;overflow:hidden;margin-top:10px'}),fill=h('div',{style:'height:100%;width:0;border-radius:11px;transition:width .1s,background .2s'});bar.append(fill);stage.append(f,bar);
        draw=v=>{const over=v>s.max,mid=v>s.max*.7;f.textContent=over?'😠':mid?'😐':'🙂';f.style.transform=`scale(${1+v/400})`;fill.style.width=v+'%';fill.style.background=over?'#e5484d':mid?'#f5c518':'#46c26e'}}
      draw(0)};
    window.paintStatic=()=>{build()};build();
    const begin=async()=>{msg.textContent='';
      if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){msg.textContent='This browser cannot use a microphone here.';return}
      try{stream=await navigator.mediaDevices.getUserMedia({audio:s.dev?{deviceId:{exact:s.dev}}:true});
        ctx=new(window.AudioContext||window.webkitAudioContext)();an=ctx.createAnalyser();an.fftSize=1024;ctx.createMediaStreamSource(stream).connect(an);const buf=new Uint8Array(an.fftSize);let cal0=0,calN=0,calEnd=0;
        const loop=()=>{an.getByteTimeDomainData(buf);let q=0;for(const x of buf){const d=(x-128)/128;q+=d*d}const rms=Math.sqrt(q/buf.length);
          if(calib){calib=false;calEnd=Date.now()+3000;cal0=0;calN=0}
          if(calEnd){cal0+=rms;calN++;if(Date.now()>calEnd){s.floor=cal0/calN;sv();calEnd=0;toast('Calibrated')}}
          const gain=4+s.sens*.8;let v=Math.min(100,Math.max(0,(rms-(s.floor||0))*gain*100/3));sm=v>sm?sm*.5+v*.5:sm*.92+v*.08;
          draw(sm);const over=sm>s.max;if(over){overSince=overSince||Date.now();if(s.warn&&Date.now()-overSince>1200&&Date.now()-warnAt>5000){warnAt=Date.now();try{Audio_.unlock();Audio_.play('chime',.5,1)}catch(e){}}}else overSince=0;
          raf=requestAnimationFrame(loop)};loop()}
      catch(e){const n=e&&e.name;msg.innerHTML='';msg.append(n==='NotAllowedError'?'The microphone is blocked. Allow it for this site in the browser, then ':'No microphone found, or it is in use. ',h('button',{class:'pill',onclick:()=>{stop();begin()}},'Try again'))}};
    begin()})}

/* ---------- 3. Work symbols ---------- */
const face=(x,y,r,mouth,col)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/><circle cx="${x-r*.35}" cy="${y-r*.15}" r="${r*.09}" fill="#223"/><circle cx="${x+r*.35}" cy="${y-r*.15}" r="${r*.09}" fill="#223"/>${mouth}`;
const sm_=(x,y,r)=>`<path d="M${x-r*.3} ${y+r*.38} Q${x} ${y+r*.6} ${x+r*.3} ${y+r*.38}" stroke="#223" stroke-width="${r*.08}" fill="none" stroke-linecap="round"/>`;
const flat=(x,y,r)=>`<line x1="${x-r*.22}" y1="${y+r*.42}" x2="${x+r*.22}" y2="${y+r*.42}" stroke="#223" stroke-width="${r*.08}" stroke-linecap="round"/>`;
const talk=(x,y,r)=>`<ellipse cx="${x}" cy="${y+r*.45}" rx="${r*.14}" ry="${r*.1}" fill="#223"/>`;
const SYM={
 silent:c=>`<svg viewBox="0 0 120 120">${face(60,64,40,flat(60,64,40),c)}<rect x="55" y="62" width="10" height="32" rx="5" fill="#fff" stroke="#223" stroke-width="3"/></svg>`,
 whisper:c=>`<svg viewBox="0 0 120 120">${face(50,62,36,talk(50,62,36),c)}<path d="M86 52q12 6 0 20M96 46q18 12 0 32" stroke="#223" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
 partner:c=>`<svg viewBox="0 0 120 120">${face(36,64,28,sm_(36,64,28),c)}${face(84,64,28,sm_(84,64,28),c)}<path d="M52 96q8 8 16 0" stroke="#223" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
 group:c=>`<svg viewBox="0 0 120 120">${face(36,38,22,sm_(36,38,22),c)}${face(84,38,22,sm_(84,38,22),c)}${face(36,84,22,sm_(36,84,22),c)}${face(84,84,22,sm_(84,84,22),c)}</svg>`};
const WS_LANG={en:['Silent work','Whisper','Partner talk','Group talk'],he:['עבודה בשקט','לוחשים','מדברים עם חבר','עבודה בקבוצה'],yi:['שטיל אַרבעטן','לחשענען','מיט אַ חבר','אין גרופּע']};
function worksym(){
  const keys=['silent','whisper','partner','group'],cols=['#9ad0ff','#c7b8ff','#ffd08a','#9be3b1'];
  let s=Object.assign({on:0,lang:'en',view:'all',labels:[],cols:[...cols],showLabels:true},get('worksym',{}));const sv=()=>put('worksym',s);
  const lab=i=>s.labels[i]||WS_LANG[s.lang][i];
  mk('worksym',{w:s.view==='all'?700:360,settings:()=>panel('Work symbols',s,[
    {t:'seg',k:'view',label:'Show',opts:[['all','All four'],['one','Only the chosen one (big)']]},
    {t:'seg',k:'lang',label:'Language of the labels',opts:[['en','English'],['he','עברית'],['yi','יידיש']]},
    {t:'sw',k:'showLabels',label:'Show labels'},
    {h:'Custom label (leave empty for the default)'},...[0,1,2,3].map(i=>({t:'el',el:h('input',{class:'inp',dir:'auto',placeholder:WS_LANG[s.lang][i],value:s.labels[i]||'',style:'width:100%;margin:3px 0',onchange:e=>{s.labels[i]=e.target.value;sv();reopen('worksym',worksym)}})})),
    {h:'Colors'},...[0,1,2,3].map(i=>({t:'color',k:'col'+i,label:lab(i),colors:['#9ad0ff','#c7b8ff','#ffd08a','#9be3b1','#ffb3c1','#f6cf4a']})),{t:'el',el:alphaRow('worksym')}
  ],()=>reopen('worksym',worksym),()=>{s.cols=[0,1,2,3].map(i=>s['col'+i]||s.cols[i]);sv()})},(b)=>{
    [0,1,2,3].forEach(i=>{if(s['col'+i])s.cols[i]=s['col'+i]});
    b.style.cssText+=';display:flex;flex-wrap:wrap;gap:14px;justify-content:center;padding:12px;direction:ltr';
    const draw=()=>{b.innerHTML='';keys.forEach((k,i)=>{if(s.view==='one'&&s.on!==i)return;const on=s.on===i;const big=s.view==='one';
      b.append(h('button',{style:`width:${big?300:148}px;padding:10px 6px 12px;border-radius:24px;border:4px solid ${on?s.cols[i]:'transparent'};background:${on?s.cols[i]+'33':'#f4f5fa'};display:flex;flex-direction:column;align-items:center;gap:6px;transition:all .2s;transform:${on?'scale(1.04)':'none'};opacity:${s.view==='all'&&!on?.75:1}`,onclick:()=>{if(s.view==='one'){s.on=(s.on+1)%4}else s.on=i;sv();draw()},html:`<div style="width:${big?240:110}px;height:${big?240:110}px">${SYM[k](s.cols[i])}</div>`},s.showLabels?h('div',{dir:'auto',style:`font-size:${big?30:19}px;font-weight:800;color:#223`},lab(i)):null))})};draw()})}

/* ---------- 4. Text ---------- */
const FONTS=[['sans','Clean','system-ui,-apple-system,Segoe UI,Arial,sans-serif'],['serif','Book','Georgia,"Times New Roman",serif'],['round','Friendly','ui-rounded,"Comic Sans MS","Chalkboard SE",sans-serif'],['he','Hebrew','"Frank Ruhl Libre","David","Times New Roman",serif'],['mono','Typewriter','"Courier New",monospace']];
function text(){
  let s=Object.assign({t:'',font:'sans',size:44,color:'#1b2430',bg:'#ffffff',a:100,al:'start',b:0,i:0,u:0,dir:'auto'},get('text',{}));const sv=()=>put('text',s);
  const ff=()=>FONTS.find(f=>f[0]===s.font)[2];
  const rgba=()=>{const n=parseInt(s.bg.slice(1),16);return `rgba(${n>>16},${n>>8&255},${n&255},${s.a/100})`};
  const spec=[
    {t:'seg',k:'font',label:'Font',opts:FONTS.map(f=>[f[0],f[1]])},
    {t:'range',k:'size',label:'Text size',min:16,max:140,step:2,fmt:v=>v+' px'},
    {t:'color',k:'color',label:'Text color'},
    {t:'seg',k:'al',label:'Alignment',opts:[['start','Start'],['center','Center'],['end','End']]},
    {t:'seg',k:'dir',label:'Direction',opts:[['auto','Automatic'],['rtl','Right to left'],['ltr','Left to right']]},
    {t:'color',k:'bg',label:'Background color'},
    {t:'range',k:'a',label:'Background transparency',min:0,max:100,step:5,fmt:v=>(100-v)+'%'},
    {t:'sw',k:'b',label:'Bold'},{t:'sw',k:'i',label:'Italic'},{t:'sw',k:'u',label:'Underline'}];
  mk('text',{w:520,h:280,settings:()=>panel('Text',s,spec,()=>paint(),sv)},(b,inst)=>{
    inst.el.classList.remove('light');inst.el.style.setProperty('background','transparent','important');inst.el.style.setProperty('box-shadow','none');
    const tb=h('div',{class:'row',style:'display:none;gap:6px;margin:0 0 6px;flex-wrap:wrap;background:#fff;border-radius:14px;padding:6px;box-shadow:0 2px 10px #0002'});
    const ed=h('div',{contenteditable:'true',style:'outline:none;white-space:pre-wrap;min-height:120px;padding:14px 18px;border-radius:20px;word-break:break-word',oninput:()=>{s.t=ed.innerText;sv()}});
    const mkb=(l,f,st)=>h('button',{class:'pill',style:'background:#eef0f7;color:#1b2430;min-width:44px;'+(st||''),onmousedown:e=>e.preventDefault(),onpointerdown:e=>e.preventDefault(),onclick:()=>{f();sv();paint()}},l);
    tb.append(mkb('B',()=>s.b=s.b?0:1,'font-weight:900'),mkb('I',()=>s.i=s.i?0:1,'font-style:italic'),mkb('U',()=>s.u=s.u?0:1,'text-decoration:underline'),mkb('A−',()=>s.size=Math.max(16,s.size-6)),mkb('A+',()=>s.size=Math.min(140,s.size+6)),mkb('⇤',()=>s.al='start'),mkb('↔',()=>s.al='center'),mkb('⇥',()=>s.al='end'),
      ...['#1b2430','#e5484d','#2f7de1','#2e9e5b','#ffffff'].map(c=>h('button',{style:`width:30px;height:30px;border-radius:50%;background:${c};border:2px solid #ccd`,onmousedown:e=>e.preventDefault(),onpointerdown:e=>e.preventDefault(),onclick:()=>{s.color=c;sv();paint()}})),
      h('button',{class:'pill sel',style:'color:#fff',onclick:()=>{ed.blur();tb.style.display='none'}},'Done'));
    const paint=()=>{ed.style.cssText=`outline:none;white-space:pre-wrap;min-height:120px;padding:14px 18px;border-radius:20px;word-break:break-word;font-family:${ff()};font-size:${s.size}px;color:${s.color};background:${rgba()};text-align:${s.al};font-weight:${s.b?800:500};font-style:${s.i?'italic':'normal'};text-decoration:${s.u?'underline':'none'};line-height:1.25;${ed===document.activeElement?'box-shadow:0 0 0 3px #6d5efc55':''}`;ed.dir=s.dir};
    ed.innerText=s.t||'';ed.dataset.ph='Tap to type';ed.addEventListener('focus',()=>{tb.style.display='flex';paint()});ed.addEventListener('blur',()=>setTimeout(()=>{if(!tb.contains(document.activeElement)){tb.style.display='none';paint()}},150));
    b.append(tb,ed);b.style.padding='0';paint();if(!s.t)setTimeout(()=>ed.focus(),150)})}

M.FN.traffic=traffic;M.FN.sound=sound;M.FN.worksym=worksym;M.FN.text=text;
})();
