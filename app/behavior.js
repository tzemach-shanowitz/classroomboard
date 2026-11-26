/* ===== Behavior & Rewards tool (loads after app.js) ===== */
(function(){
const BDEF={colors:['#6fcf97','#f6d365','#f5a35c','#ee6c6c'],shape:'dot',reward:'star',tiers:['#f7c600','#cfd6df','#e8a900'],spark:'nice',sound:false,font:'sans',fscale:100,nscale:100,iscale:100,gap:100,op:96,theme:'light',cols:'auto',autoReset:true,startFull:false};
const FONTS={sans:'"Segoe UI","Helvetica Neue",Arial,"Noto Sans Hebrew","Arial Hebrew",sans-serif',round:'"Trebuchet MS","Segoe UI",Arial,"Noto Sans Hebrew",sans-serif',serif:'Georgia,"Times New Roman","Noto Serif Hebrew",serif',hebrew:'"David","Noto Sans Hebrew","Arial Hebrew",Arial,sans-serif'};
const PATH={star:'M12 2.8l2.8 6 6.5.8-4.8 4.5 1.3 6.5L12 17.4 6.2 20.6l1.3-6.5L2.7 9.6l6.5-.8z',heart:'M12 20.5s-7.5-4.9-7.5-10.4A4.3 4.3 0 0112 7.6a4.3 4.3 0 017.5 2.5c0 5.5-7.5 10.4-7.5 10.4z',diamond:'M12 2.8l7.4 7.6L12 21.2 4.6 10.4z',medal:'M12 3a9 9 0 100 18 9 9 0 000-18z'};
let B=Object.assign({},BDEF,Store.get('beh.cfg',{}));
B.colors=(B.colors||BDEF.colors).slice();B.tiers=(B.tiers||BDEF.tiers).slice();
const saveB=()=>Store.set('beh.cfg',B);
const today=()=>dayKey();
let S=Store.get('beh.state',null);
if(!S||typeof S!=='object')S={day:today(),m:{},r:{},log:[]};
S.m=S.m||{};S.r=S.r||{};S.log=S.log||[];
const saveS=()=>{S.log=S.log.slice(-60);Store.set('beh.state',S)};
function dailyCheck(){if(B.autoReset&&S.day!==today()){S={day:today(),m:{},r:{},log:[]};saveS();return true}if(S.day!==today()){S.day=today();saveS()}return false}
const names=()=>{try{return activeList().students.filter(x=>!x.absent).map(x=>x.name)}catch(e){return[]}};
function mix(c,t,p){const n=parseInt(c.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255,m=(v)=>Math.round(v+(t-v)*p);return'#'+[m(r),m(g),m(b)].map(v=>v.toString(16).padStart(2,'0')).join('')}
const lighter=(c,p)=>mix(c,255,p),darker=(c,p)=>mix(c,0,p);
let uid=0;
function starSVG(tier,px,id,num){const T=num==null?'':`<text x="12" y="14.6" text-anchor="middle" font-size="${String(num).length>1?7:8.5}" font-weight="800" font-family="Arial,sans-serif" fill="${tier?'#3a2a00':'#8a93a1'}">${num}</text>`;const p=PATH[B.reward]||PATH.star;
  if(tier===0)return`<svg viewBox="0 0 24 24" width="${px}" height="${px}"><path d="${p}" fill="none" stroke="#b5bcc8" stroke-width="1.6" stroke-linejoin="round"/>${T}</svg>`;
  const c=(tier>=3&&(B.tiers[2]||"").toLowerCase()==='#e8a900')?'#ff6a3d':B.tiers[Math.min(tier,3)-1];const ring=tier>=3?`<circle cx="12" cy="12" r="11.2" fill="none" stroke="${c}" stroke-opacity=".55" stroke-width="1"/>`:'';[Math.min(tier,3)-1];const g='g'+id;
  const stops=tier===1?[lighter(c,.55),c,darker(c,.12)]:[lighter(c,.7),c,darker(c,.28),lighter(c,.45),darker(c,.1)];
  const st=tier===1?[0,.55,1]:[0,.3,.55,.78,1];
  return`<svg viewBox="0 0 24 24" width="${px}" height="${px}">${ring}<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1">${stops.map((s,i)=>`<stop offset="${st[i]}" stop-color="${s}"/>`).join('')}</linearGradient></defs><path d="${p}" fill="url(#${g})" stroke="${darker(c,.3)}" stroke-width=".7" stroke-linejoin="round"/><path d="M8.2 6.4c1-1.4 2.4-2.2 3.8-2.4" stroke="#fff" stroke-opacity=".75" stroke-width="1.3" stroke-linecap="round" fill="none"/>${T}</svg>`}
function dotSVG(l,px){const c=B.colors[l];const sh=B.shape;
  if(sh==='square')return`<svg viewBox="0 0 24 24" width="${px}" height="${px}"><rect x="3" y="3" width="18" height="18" rx="5" fill="${c}"/><rect x="3" y="3" width="18" height="9" rx="5" fill="#fff" fill-opacity=".22"/></svg>`;
  if(sh==='heart')return`<svg viewBox="0 0 24 24" width="${px}" height="${px}"><path d="${PATH.heart}" fill="${c}"/></svg>`;
  if(sh==='face'){const mouth=['M7.5 14c1.2 2.6 7.8 2.6 9 0','M8 15c2.5 1.3 5.5 1.3 8 0','M8 16h8','M7.8 17c1.4-2.6 7-2.6 8.4 0'][l];
    return`<svg viewBox="0 0 24 24" width="${px}" height="${px}"><circle cx="12" cy="12" r="10" fill="${c}"/><circle cx="8.8" cy="9.6" r="1.3" fill="#3b3b3b" fill-opacity=".8"/><circle cx="15.2" cy="9.6" r="1.3" fill="#3b3b3b" fill-opacity=".8"/><path d="${mouth}" stroke="#3b3b3b" stroke-opacity=".8" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`}
  return`<svg viewBox="0 0 24 24" width="${px}" height="${px}"><circle cx="12" cy="12" r="10" fill="${c}"/><ellipse cx="9.5" cy="8" rx="5" ry="3" fill="#fff" fill-opacity=".28"/></svg>`}
const tierOf=n=>n>=3?3:n;
function chime(t){if(!B.sound)return;try{Audio_.unlock();const c=Audio_.ctx;if(!c)return;const notes=t>=3?[659,784,1047]:t===2?[587,784]:[698];notes.forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=f;const s=c.currentTime+i*.11;g.gain.setValueAtTime(.0001,s);g.gain.exponentialRampToValueAtTime(.18,s+.02);g.gain.exponentialRampToValueAtTime(.0001,s+.5);o.connect(g).connect(c.destination);o.start(s);o.stop(s+.55)})}catch(e){}}
function sparkle(host,tier){if(B.spark==='off')return;const rect=host.getBoundingClientRect();const big=tier>=2;const n=B.spark==='fest'?(big?26:14):(big?16:8);
  const cols=tier>=3?['#ffe27a','#fff6c8','#f7b500','#fff']:tier===2?['#ffffff','#dfe5ec','#aab4c0','#c9d6ff']:['#ffe45c','#fff3a8','#ffd0f0','#fff'];
  for(let i=0;i<n;i++){const s=document.createElement('div');s.className='bsp';const a=Math.random()*6.283,d=(big?44:30)+Math.random()*(big?52:30);
    s.style.cssText=`left:${rect.left+rect.width/2}px;top:${rect.top+rect.height/2}px;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px;--c:${cols[i%cols.length]};--s:${(big?10:7)+Math.random()*7}px;animation-delay:${Math.random()*.12}s`;
    document.body.append(s);setTimeout(()=>s.remove(),1100)}
  if(big){const r=document.createElement('div');r.className='bring';r.style.cssText=`left:${rect.left+rect.width/2}px;top:${rect.top+rect.height/2}px;--c:${tier>=3?'#f7c600':'#c4ccd6'}`;document.body.append(r);setTimeout(()=>r.remove(),900)}}
function logPush(e){S.log.push(e)}
function setMark(n,v,quiet){const prev=S.m[n]||0;if(v===prev)return;logPush({k:'m',n,p:prev});S.m[n]=v;saveS()}
function addReward(n,d){const prev=S.r[n]||0;const nv=Math.max(0,prev+d);if(nv===prev)return;logPush({k:'r',n,p:prev});S.r[n]=nv;saveS()}
function undo(){const e=S.log.pop();if(!e){toast('Nothing to undo');return false}
  if(e.k==='m')S.m[e.n]=e.p;else if(e.k==='r')S.r[e.n]=e.p;else if(e.k==='all'){S.m=e.m;S.r=e.r}saveS();return true}
function resetWhat(what,who){const snap={k:'all',m:Object.assign({},S.m),r:Object.assign({},S.r)};
  if(who){logPush({k:'all',m:Object.assign({},S.m),r:Object.assign({},S.r)});if(what!=='r')delete S.m[who];if(what!=='m')delete S.r[who]}
  else{logPush(snap);if(what!=='r')S.m={};if(what!=='m')S.r={}}saveS()}

function openBehavior(){
  if(Widgets.open.behavior){Widgets.raise('behavior');return}
  dailyCheck();
  const L=names();const cols0=B.cols==='auto'?(L.length>24?3:L.length>12?2:1):+B.cols;
  const inst=Widgets.create('behavior',cfg.labels.behavior||'Behavior & Stars',{x:Math.max(10,innerWidth/2-(cols0*190)),y:60,w:Math.min(innerWidth-20,cols0*380+40),h:Math.max(320,innerHeight-130),settings:behSettings});
  inst.el.classList.add('beh');const body=inst.body;
  /* full screen button */
  let full=false,prevRect=null;
  const fsb=h('button',{class:'wbtn',title:'Full screen',html:svgI('full'),onclick:()=>toggleFull()});
  inst.bar.insertBefore(fsb,inst.bar.querySelector('.wbtn'));
  function toggleFull(on){const nf=on===undefined?!full:on;if(nf===full)return;full=nf;const e=inst.el;
    if(full){prevRect={l:e.style.left,t:e.style.top,w:e.style.width,h:e.style.height};e.classList.add('behfull');e.style.cssText+=';left:0!important;top:0!important;width:100vw!important;height:100vh!important'}
    else{e.classList.remove('behfull');e.style.removeProperty('left');e.style.removeProperty('top');e.style.removeProperty('width');e.style.removeProperty('height');if(prevRect){e.style.left=prevRect.l;e.style.top=prevRect.t;e.style.width=prevRect.w;e.style.height=prevRect.h}}
    setTimeout(()=>inst.paint(),60)}
  inst.toggleFull=toggleFull;
  const grid=h('div',{class:'bgrid'});
  const foot=h('div',{class:'bfoot'});
  body.append(grid,foot);
  body.style.cssText='display:flex;flex-direction:column;padding:4px 14px 12px;overflow:hidden;direction:rtl';
  function pop(anchor,name){document.querySelectorAll('.bpop').forEach(x=>x.remove());
    const r=anchor.getBoundingClientRect();
    const p=h('div',{class:'bpop glass',style:`left:${clamp(r.left,8,innerWidth-250)}px;top:${clamp(r.bottom+4,8,innerHeight-210)}px`},
      h('div',{class:'bpn',dir:'auto'},name),
      h('button',{class:'pill',onclick:()=>{setMark(name,Math.max(0,(S.m[name]||0)-1));p.remove();inst.paint()}},'− One mark'),
      h('button',{class:'pill',onclick:()=>{addReward(name,-1);p.remove();inst.paint()}},'− One star'),
      h('button',{class:'pill',onclick:()=>{resetWhat('both',name);p.remove();inst.paint()}},'Reset this student'));
    document.body.append(p);setTimeout(()=>{const away=e=>{if(!p.contains(e.target)){p.remove();document.removeEventListener('pointerdown',away,true)}};document.addEventListener('pointerdown',away,true)},50)}
  inst.paint=function(){
    if(!Widgets.open.behavior)return;
    const L=names();const n=L.length;
    const narrow=body.clientWidth<700;const cols=narrow?2:B.cols==='auto'?(n>24?3:n>12?2:1):+B.cols;
    const el=inst.el;const dark=B.theme==='dark';
    el.style.background=dark?`rgba(24,34,48,${B.op/100})`:`rgba(255,255,255,${B.op/100})`;el.style.color=dark?'#f2f5fa':'#1b2430';
    el.style.setProperty('--bfont',FONTS[B.font]||FONTS.sans);el.classList.toggle('bdark',dark);
    grid.innerHTML='';
    if(!n){grid.append(h('div',{class:'blbl'},'No students yet. Add them in Settings > Students.'));return}
    const availH=Math.max(100,body.clientHeight-foot.offsetHeight-14);const rows=Math.ceil(n/cols);
    const rowH=narrow?44:availH/rows;const gapK=B.gap/100;
    const rh=narrow?60:clamp(rowH,34,120);
    const ic=narrow?24:Math.round(clamp(rh*.78*B.iscale/100,26,96));const nf=narrow?Math.round(13*B.nscale/100):Math.round(clamp(rh*.46*B.nscale/100,14,60));const cf=Math.round(clamp(rh*.44*B.fscale/100,14,56));
    grid.style.cssText=`display:grid;grid-auto-flow:column;grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},${Math.max(narrow?40:34,Math.min(rowH*gapK,rowH*1.4))}px);column-gap:${narrow?8:cols>1?26:0}px;align-content:start;flex:1;min-height:0;overflow:${narrow?'auto':'hidden'}`;
    L.forEach(name=>{
      const m=S.m[name]||0,r=S.r[name]||0,t=tierOf(r);
      const nm=h('div',{class:'bname',dir:'auto',style:`font-size:${nf}px`,onclick:e=>pop(e.currentTarget,name)},name);
      const ind=h('button',{class:'bind',style:`width:${Math.max(narrow?32:48,ic+8)}px;height:${Math.max(narrow?32:48,ic+8)}px`,'aria-label':'Behavior mark',html:dotSVG(m,ic),onclick:e=>{if(m>=3){ind.classList.remove('shake');void ind.offsetWidth;ind.classList.add('shake');return}setMark(name,m+1);ind.classList.add('pop');inst.paint()}});
      const star=h('button',{class:'bstar t'+t,style:`width:${Math.max(narrow?32:48,ic+8)}px;height:${Math.max(narrow?32:48,ic+8)}px`,'aria-label':'Add reward',html:starSVG(t,ic,++uid,r),onclick:e=>{const was=tierOf(S.r[name]||0);addReward(name,1);const nt=tierOf(S.r[name]);
        sparkle(star,nt>was?nt:1);chime(nt>was?nt:1);inst.paint();
        if(nt>was){const s2=[...grid.querySelectorAll('.bstar')].find(x=>x.dataset.n===name);if(s2){s2.classList.add('levelup')}}else{const s2=[...grid.querySelectorAll('.bstar')].find(x=>x.dataset.n===name);if(s2)s2.classList.add('pop')}}});
      star.dataset.n=name;
      const cnt=h('div',{class:'bcnt',style:`font-size:${cf}px`},String(r));
      grid.append(h('div',{class:'brow'+(narrow?' bnar':'')},nm,ind,star))});
  };
  foot.append(
    h('button',{class:'bf',onclick:()=>{if(undo())inst.paint()},html:svgI('undo')+'<span>Undo</span>'}),
    h('button',{class:'bf',onclick:()=>resetMenu(inst),html:svgI('trash')+'<span>Reset</span>'}));
  new ResizeObserver(()=>{clearTimeout(inst.rt);inst.rt=setTimeout(()=>inst.paint(),80)}).observe(body);
  inst.paint();window.__behInst=inst;
  inst.iv=setInterval(()=>{if(dailyCheck())inst.paint()},60000);
  const oc=inst.onclose;inst.onclose=()=>{if(window.__behInst===inst)window.__behInst=null;clearInterval(inst.iv);document.querySelectorAll('.bpop').forEach(x=>x.remove())};
  if(B.startFull)toggleFull(true);
}
function resetMenu(inst){modal('Reset',(b,c)=>{const go=(w,t)=>{resetWhat(w);inst.paint();toast('Done. Undo brings it back.')};
  b.append(h('div',{class:'row',style:'flex-direction:column;align-items:stretch'},
    pill('Reset all behavior marks to green',()=>{c();go('m','Reset all behavior marks to green?')},'big'),
    pill('Reset all stars to zero',()=>{c();go('r','Reset all stars to zero?')},'big'),
    pill('Reset both',()=>{c();go('both','Reset marks and stars for everyone?')},'big danger'),
    h('div',{class:'lbl'},'To reset one student, tap their name.')))})}
function behSettingsOld(){modal('Behavior & Stars settings',(b,c)=>{
  const re=()=>{saveB();const i=Widgets.open.behavior;if(i)i.paint()};
  const sel=(v,opts,f)=>{const s=h('select',{class:'inp',onchange:e=>f(e.target.value)},...opts.map(([k,l])=>h('option',{value:k,selected:String(v)===k},l)));return s};
  const col=(v,f)=>h('input',{type:'color',value:v,style:'width:52px;height:44px;border:0;background:none;padding:0',oninput:e=>f(e.target.value)});
  const sec=t=>h('div',{class:'lbl',style:'margin-top:14px;font-weight:700;font-size:16px'},t);
  b.append(
   sec('Behavior colors'),
   h('div',{class:'row'},...['Great','One mark','Two marks','Three marks'].map((l,i)=>h('div',{style:'text-align:center'},col(B.colors[i],v=>{B.colors[i]=v;re()}),h('div',{class:'lbl'},l)))),
   field('Behavior indicator shape',sel(B.shape,[['dot','Round dot'],['square','Soft square'],['heart','Heart'],['face','Face']],v=>{B.shape=v;re()})),
   sec('Rewards'),
   field('Reward icon',sel(B.reward,[['star','Star'],['heart','Heart'],['diamond','Diamond'],['medal','Medal']],v=>{B.reward=v;re()})),
   h('div',{class:'row'},...['1 reward: yellow','2: silver','3 and more: gold'].map((l,i)=>h('div',{style:'text-align:center'},col(B.tiers[i],v=>{B.tiers[i]=v;re()}),h('div',{class:'lbl'},l)))),
   field('Sparkles',sel(B.spark,[['off','Off'],['nice','Subtle'],['fest','Festive']],v=>{B.spark=v;re()})),
   chk(B.sound,v=>{B.sound=v;saveB();if(v)chime(3)},'Reward sounds'),
   sec('Size and look'),
   field('Font',sel(B.font,[['sans','Clean'],['round','Friendly'],['serif','Classic'],['hebrew','Hebrew (David)']],v=>{B.font=v;re()})),
   field('Text size',range(B.fscale,v=>{B.fscale=v;re()},60,160,5)),
   field('Student name size',range(B.nscale,v=>{B.nscale=v;re()},60,160,5)),
   field('Icon size',range(B.iscale,v=>{B.iscale=v;re()},60,150,5)),
   field('Row spacing',range(B.gap,v=>{B.gap=v;re()},70,140,5)),
   field('Columns',sel(B.cols,[['auto','Automatic'],['1','1'],['2','2'],['3','3']],v=>{B.cols=v;re()})),
   field('Theme',sel(B.theme,[['light','Light'],['dark','Dark']],v=>{B.theme=v;re()})),
   field('Background transparency (left = see-through)',range(B.op,v=>{B.op=v;re()},20,100,2)),
   chk(B.startFull,v=>{B.startFull=v;saveB()},'Open in full screen'),
   h('div',{class:'row'},pill('Full screen now',()=>{c();const i=Widgets.open.behavior;if(i)i.toggleFull(true)}),pill('Reset size and position',()=>{Store.del('w.behavior');const i=Widgets.open.behavior;if(i){Widgets.close('behavior');openBehavior()}c()})),
   sec('Daily reset'),
   chk(B.autoReset,v=>{B.autoReset=v;saveB()},'Start every new day fresh (marks and stars go back to zero)'),
   h('div',{class:'lbl'},'Your class list and these settings are never deleted by a reset.'))},{foot:c=>[pill('Done',c,'big sel')]})}
window.openBehavior=openBehavior;
window.behSettings=function(){if(window.__openSettings2)window.__openSettings2('behavior');else behSettingsOld()};
window.__beh={get B(){return B},saveB,chime,repaint:()=>{saveB();const i=Widgets.open.behavior;if(i)i.paint()},fullNow:()=>{const i=Widgets.open.behavior;if(i)i.toggleFull(true)},resetPos:()=>{Store.del('w.behavior');const i=Widgets.open.behavior;if(i){Widgets.close('behavior');openBehavior()}},resetWhat:(w)=>{resetWhat(w);const i=Widgets.open.behavior;if(i)i.paint();toast('Done. Undo brings it back.')}};
window.addEventListener('sc-remote',e=>{const k=e.detail||[];if(k.includes('beh.state')){const n=Store.get('beh.state',null);if(n&&typeof n==='object'){S=n;S.m=S.m||{};S.r=S.r||{};S.log=S.log||[]}}
 if(k.includes('beh.cfg')){B=Object.assign({},BDEF,Store.get('beh.cfg',{}))}
 if(window.__behInst)window.__behInst.paint()});
if(new URLSearchParams(location.search).get('view')==='mark')setTimeout(()=>{try{openBehavior();window.__behInst&&window.__behInst.toggleFull(true)}catch(e){}},900);
})();
