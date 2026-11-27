/* Customize my board: one button, an edit mode over the live board. New users only. */
(function(){
if(window.__demo||window.__legacy)return;
cfg.ui=cfg.ui||{};cfg.room=cfg.room||{name:''};
const TOOLSET=['whiteboard','timer','picker','traffic','sound','text','schedule','supplies','library','presentations','wheel','behavior','anno','full','home','cast'];
const st=document.createElement('style');st.textContent=`
#custbtn{position:fixed;left:50%;top:auto;bottom:122px;transform:translateX(-50%);z-index:6;border:0;cursor:pointer;display:flex;gap:8px;align-items:center;font:600 15px -apple-system,Inter,system-ui,sans-serif;color:#fff;background:#6858f8;border-radius:24px;padding:11px 18px;box-shadow:0 8px 24px rgba(104,88,248,.45);transition:transform .15s,background .2s}
#custbtn:hover{transform:translateX(-50%) translateY(-1px)}
#custbtn svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
body.tbtop #custbtn{bottom:24px}
#custbtn{white-space:nowrap}
#custbtn.quiet{background:rgba(40,40,46,.5);box-shadow:none;font-weight:500;font-size:13px;padding:8px 14px;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
body.clk-tl #roomname{left:50%;transform:translateX(-50%)}
body.wbmode #custbtn,body.editing #custbtn,body.wbmode #roomname,body.signedin #custbtn,body.signedin.v-phone #custbtn{display:none!important}
#editpanel{position:fixed;right:16px;top:16px;bottom:16px;width:400px;max-width:calc(100vw - 32px);z-index:70;background:rgba(250,250,252,.96);color:#1c1c1e;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.4);-webkit-backdrop-filter:blur(30px);backdrop-filter:blur(30px);display:flex;flex-direction:column;padding:18px;gap:12px;font:14px/1.4 -apple-system,Inter,system-ui,sans-serif}
#editpanel h2{margin:0;font-size:21px}
#editpanel .eh{display:flex;justify-content:space-between;align-items:center}
#editpanel button{font:inherit;cursor:pointer}
#editpanel .etabs{display:flex;gap:3px;background:#ececf0;border-radius:11px;padding:3px}
#editpanel .etabs button{flex:1;border:0;background:none;border-radius:9px;padding:7px 2px;font-size:12.5px;font-weight:600;color:#555}
#editpanel .etabs button.on{background:#fff;color:#1c1c1e;box-shadow:0 1px 3px rgba(0,0,0,.15)}
#editpanel .ebody{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding-right:2px}
#editpanel h3{margin:6px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#777}
#editpanel .egrid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}
#editpanel .etool{border:1.5px solid #d6d6dc;background:#fff;border-radius:12px;height:72px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:11.5px;position:relative;color:#1c1c1e;padding:0 2px;text-align:center}
#editpanel .etool svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
#editpanel .etool.on{border-color:#6858f8;background:#f0eeff;color:#4b3fd1}
#editpanel .etool i{position:absolute;top:2px;right:6px;font-style:normal;font-weight:700;font-size:14px;color:#6858f8}
#editpanel .eph{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
#editpanel .eph button{height:70px;border-radius:12px;border:3px solid transparent;background-size:cover;background-position:center;padding:0}
#editpanel .eph button.on{border-color:#6858f8}
#editpanel .eopt{display:flex;gap:6px;flex-wrap:wrap}
#editpanel .eopt button{flex:1;min-width:70px;border:1.5px solid #d6d6dc;background:#fff;border-radius:11px;padding:9px 6px;font-size:13px;color:#1c1c1e}
#editpanel .eopt button.on{border-color:#6858f8;background:#f0eeff;font-weight:600}
#editpanel .erow{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #eee;gap:10px}
#editpanel .tog{width:46px;height:28px;border-radius:14px;border:0;background:#d6d6dc;position:relative;flex:none;padding:0}
#editpanel .tog:after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:left .15s;box-shadow:0 1px 3px rgba(0,0,0,.3)}
#editpanel .tog.on{background:#6858f8}#editpanel .tog.on:after{left:21px}
#editpanel input[type=range]{width:100%;accent-color:#6858f8}
#editpanel .esw{display:flex;gap:10px}#editpanel .esw button{width:34px;height:34px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1px #bbb;padding:0}#editpanel .esw button.on{box-shadow:0 0 0 3px #6858f8}
#editpanel .efoot{display:flex;gap:6px;align-items:center;border-top:1px solid #e5e5ea;padding-top:10px}
#editpanel .lk{border:0;background:none;color:#444;font-weight:600;padding:8px 6px}#editpanel .lk:disabled{opacity:.35}
#editpanel .pri{border:0;background:#6858f8;color:#fff;font-weight:600;border-radius:11px;padding:0 18px;height:40px}
#editpanel .sec{border:0;background:#ececf0;color:#1c1c1e;font-weight:600;border-radius:11px;padding:0 14px;height:38px;align-self:flex-start}
#editpanel small{color:#666}
body.editing #toolbar{left:calc((100vw - 432px)/2)}
body.editing #toolbar .tbi{touch-action:none;outline:2px dashed rgba(255,255,255,.7);outline-offset:-3px}
body.editing #toolbar .tbi.dragging{background:rgba(104,88,248,.6)}
body.editing #toolbar .tbi .ebadge{position:absolute;top:2px;right:2px;width:18px;height:18px;border-radius:50%;background:#fff;color:#c00;font:700 11px/18px system-ui;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.4);pointer-events:auto}
#editpanel{width:340px;border-radius:16px;padding:20px 20px 16px}
#editpanel .etool,#editpanel .eopt button{min-height:44px}
#editpanel .eopt button{min-height:44px}
#editpanel .saved{font-size:12px;font-weight:600;color:#2a8a4a;opacity:0;transition:opacity .2s}#editpanel .saved.on{opacity:1}
#editpanel .estrip{display:flex;flex-direction:column;gap:4px}
#editpanel .estrip .it{display:flex;align-items:center;gap:6px;background:#fff;border:1px solid #e0e0e6;border-radius:10px;padding:2px 4px 2px 10px;min-height:44px}
#editpanel .estrip .it svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
#editpanel .lk,#editpanel .pri{white-space:nowrap}
#editpanel .etabs button{font-size:12px;padding:6px 1px;line-height:1.15}
#editpanel .estrip .it span{flex:1;font-size:14px}
#editpanel .estrip .it button{border:0;background:#f2f2f6;border-radius:8px;width:44px;height:36px;font-size:16px;color:#333}
#editpanel .estrip .it button:disabled{opacity:.3}
#editpanel .chips{display:flex;gap:6px;flex-wrap:wrap}
#editpanel .chips button{border:1.5px solid #d6d6dc;background:#fff;border-radius:18px;padding:7px 13px;font-size:13px;min-height:36px}
#editpanel .chips button.on{border-color:#6858f8;background:#f0eeff;font-weight:600;color:#4b3fd1}
#editpanel button:focus-visible,#custbtn:focus-visible{outline:3px solid #1c1c1e;outline-offset:2px}
#editpanel .eph button{height:84px}
#editpanel .etool small{display:none}
body.editing #clock,body.editing #roomname{pointer-events:auto;cursor:pointer;outline:2px dashed rgba(255,255,255,.75);outline-offset:6px;border-radius:6px}
body.editing #clock.sel,body.editing #roomname.sel,body.editing #toolbar.sel{outline:3px solid #6858f8;outline-offset:6px}
body.editing #bg{cursor:pointer}
.widget:not(.light){background:rgba(20,34,46,var(--wop,.55))!important}
.widget.light{background:rgba(255,255,255,var(--wlop,1))!important}
body.editing .widget{outline:2px dashed rgba(255,255,255,.7);outline-offset:3px}body.editing .widget.sel{outline:3px solid #6858f8}
@media(min-width:701px){body.editing.clk-r #clock{transform:translateX(-372px)}body.editing #clock{z-index:71}}
#editpanel,#custbtn,body.editing #toolbar{transition:opacity .18s,transform .18s}
@media(prefers-reduced-motion:reduce){#editpanel *,#custbtn,#editpanel,body.editing #toolbar{transition:none!important;animation:none!important}}
body.v-phone #custbtn{display:flex;bottom:112px}
#editpanel.phone{position:fixed!important;inset:0!important;width:auto!important;height:auto!important;max-width:none!important;border-radius:0!important;padding:14px 16px 24px!important;background:#fbfbfd!important;overflow-y:auto;gap:14px;z-index:90;-webkit-backdrop-filter:none;backdrop-filter:none}
#editpanel.phone .ph-h{display:flex;align-items:center;justify-content:space-between;min-height:44px}
#editpanel.phone .ph-h b{font-size:20px}
#editpanel.phone .ph-h button{border:0;background:none;color:#6858f8;font-weight:600;font-size:17px;min-height:44px;padding:0 6px}
#editpanel.phone .ph-h button:disabled{opacity:.35}
#editpanel.phone .pv{position:relative;height:170px;border-radius:14px;background-size:cover;background-position:center;overflow:hidden;flex:none}
#editpanel.phone .pv .nm{position:absolute;left:10px;bottom:10px;background:rgba(30,30,34,.6);color:#fff;border-radius:16px;padding:6px 12px;font-size:14px}
#editpanel.phone .pv .ck{position:absolute;right:12px;top:8px;color:#fff;font:26px Georgia,serif;text-shadow:0 2px 10px rgba(0,0,0,.45)}
#editpanel.phone .pv .tbp{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);display:flex;gap:6px;background:rgba(255,255,255,.35);border-radius:12px;padding:5px 8px;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
#editpanel.phone .pv .tbp svg{width:16px;height:16px;fill:none;stroke:#fff;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
#editpanel.phone .pv.hasnm .tbp{left:auto;right:10px;transform:none}
#editpanel.phone h2{font-size:26px;margin:4px 0 0}
#editpanel.phone p{margin:0;color:#555;font-size:16px}
#editpanel.phone .pgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
#editpanel.phone .ptool{display:flex;flex-direction:column;align-items:flex-start;gap:12px;position:relative;border:1.5px solid #d9d9e0;background:#fff;border-radius:14px;padding:14px;min-height:84px;font-size:17px;color:#1c1c1e;text-align:left}
#editpanel.phone .ptool svg{width:24px;height:24px;fill:none;stroke:#6858f8;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
#editpanel.phone .ptool.on{border-color:#6858f8}
#editpanel.phone .ptool i{position:absolute;top:12px;right:12px;width:22px;height:22px;border-radius:50%;border:1.5px solid #9a9aa5;color:#9a9aa5;font-style:normal;font-size:15px;line-height:19px;text-align:center}
#editpanel.phone .ptool.on i{background:#6858f8;border-color:#6858f8;color:#fff}
#editpanel.phone>*{flex-shrink:0}
#editpanel.phone .pbg{min-height:72px;display:flex;gap:8px;overflow-x:auto;padding-bottom:4px}
#editpanel.phone .pbg button{flex:none;width:92px;height:64px;border-radius:12px;border:3px solid transparent;background-size:cover;background-position:center;padding:0}
#editpanel.phone .pbg button.on{border-color:#6858f8}
#editpanel.phone .bigpri{border:0;background:#6858f8;color:#fff;font-weight:600;font-size:18px;border-radius:14px;min-height:54px;width:100%}
#editpanel.phone .pgrp{background:#fff;border:1.5px solid #e0e0e6;border-radius:14px;padding:0 14px}
#editpanel.phone .pgrp summary{min-height:52px;display:flex;align-items:center;font-size:17px;font-weight:600;cursor:pointer}
#editpanel.phone .pgb{display:flex;flex-direction:column;gap:10px;padding:0 0 14px}
#editpanel.phone .pgb .eph{grid-template-columns:repeat(2,1fr)}
#editpanel.phone .more{border:0;background:#ececf0;border-radius:12px;min-height:46px;font-weight:600;font-size:15px}
@media(max-width:700px){#editpanel{width:auto;left:8px;right:8px;top:auto;bottom:8px;height:52vh;width:auto;max-width:none}body.editing #toolbar{left:50%;bottom:calc(52vh + 16px)}}`;
document.head.appendChild(st);
// entry button
const btn=document.createElement('button');btn.id='custbtn';btn.type='button';document.body.appendChild(btn);
const penSvg='<svg viewBox="0 0 24 24">'+(IC.settings||'')+'</svg>';
function btnSync(){btn.className=cfg.ui.custDone?'quiet':'';btn.innerHTML=penSvg+'<span>'+(cfg.ui.custDone?'Customize':'Customize my board')+'</span>'}
btnSync();btn.onclick=()=>enter();
window.openCustomize=()=>enter();
{if(!cfg.ui.fontMig){cfg.ui.fontMig=1;if(cfg.clock&&/Georgia/.test(cfg.clock.font||'')){cfg.clock.font='-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,system-ui,sans-serif';saveCfg();renderClock()}}}
{const t0=cfg.toolbar;if(!cfg.ui.castInit){cfg.ui.castInit=1;if(t0.hidden&&!t0.hidden.includes('cast'))t0.hidden.push('cast');saveCfg();renderToolbar()}}
function acctSync(){const C=window.Cloud;const on=C&&C.user!==undefined?!!C.user:!!localStorage.getItem('scmeta.uid');document.body.classList.toggle('signedin',on)}
acctSync();setInterval(acctSync,1000);
const rr=window.renderRoomName;window.renderRoomName=function(){rr&&rr();const n=(cfg.room.show===false)?'':cfg.room.name;const el=document.getElementById('roomname');if(el)el.textContent=n||'';document.body.classList.toggle('hasname',!!n)};renderRoomName();
// state
let openD=new Set(),bgCat='all',editing=false,stack=[],panel=null,tab='Toolbar',keep=null;
const snap=()=>{const b={...cfg.bg};delete b.custom;return JSON.stringify({toolbar:cfg.toolbar,bg:b,clock:cfg.clock,ui:cfg.ui,room:cfg.room})};
function restore(js){const o=JSON.parse(js);const custom=cfg.bg.custom;cfg.toolbar=o.toolbar;cfg.bg={...o.bg,custom};cfg.clock=o.clock;cfg.ui=o.ui;cfg.room=o.room;saveCfg();redraw()}
function wop(){const v=cfg.ui.wop==null?.55:cfg.ui.wop,r=document.documentElement.style;r.setProperty('--wop',v);r.setProperty('--wlop',cfg.ui.wop==null?1:Math.min(1,v+.1))}wop();
function redraw(){wop();renderToolbar();deco();renderBg();renderClock();window.renderRoomName();gearSync();view()}
let svT=null;function flash(){const e=panel&&panel.querySelector('.saved');if(!e)return;e.classList.add('on');clearTimeout(svT);svT=setTimeout(()=>e.classList.remove('on'),1400)}
function change(fn,keepPanel){stack.push(snap());if(stack.length>40)stack.shift();const bj=JSON.stringify({...cfg.bg,custom:0});fn();wop();saveCfg();renderToolbar();deco();if(JSON.stringify({...cfg.bg,custom:0})!==bj)renderBg();renderClock();window.renderRoomName();gearSync();if(!keepPanel)view();else syncFoot();flash()}
// toolbar editing decorations and drag
const _rt=window.renderToolbar;window.renderToolbar=function(){_rt();deco()};
if(innerWidth<=700&&cfg.toolbar&&cfg.toolbar.pos!=='bottom'){cfg.toolbar.pos='bottom';saveCfg();renderToolbar()}
function deco(){if(!editing)return;document.querySelectorAll('#toolbar .tbi').forEach(b=>{const id=b.dataset.id;if(id==='settings'||id==='more')return;if(b.querySelector('.ebadge'))return;const x=document.createElement('span');x.className='ebadge';x.textContent='✕';x.setAttribute('role','button');x.setAttribute('aria-label','Remove '+(TOOLS[id]||id));x.onpointerdown=e=>e.stopPropagation();x.onclick=e=>{e.stopPropagation();change(()=>{cfg.toolbar.hidden=[...new Set([...cfg.toolbar.hidden,id])]})};b.append(x)})}
const tb=document.getElementById('toolbar');
tb.addEventListener('click',e=>{if(editing&&!e.target.closest('.ebadge')){e.stopPropagation();e.preventDefault()}},true);
let drag=null;
tb.addEventListener('pointerdown',e=>{if(!editing)return;const b=e.target.closest('.tbi');if(!b||e.target.closest('.ebadge'))return;drag={id:b.dataset.id,x:e.clientX,y:e.clientY,on:false,b}});
addEventListener('pointermove',e=>{if(!drag)return;if(!drag.on&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6){drag.on=true;drag.b.classList.add('dragging')}});
addEventListener('pointerup',e=>{if(!drag)return;const d=drag;drag=null;d.b.classList.remove('dragging');if(!d.on)return;
 const bs=[...document.querySelectorAll('#toolbar .tbi')].filter(x=>x!==d.b);let tgt=null,after=false,best=1e9;
 bs.forEach(x=>{const r=x.getBoundingClientRect(),c=r.left+r.width/2,dd=Math.abs(e.clientX-c);if(dd<best){best=dd;tgt=x;after=e.clientX>c}});
 if(!tgt)return;const tid=tgt.dataset.id;
 change(()=>{const o=cfg.toolbar.order.filter(x=>x!==d.id);let i=o.indexOf(tid);if(i<0)i=o.length;o.splice(after?i+1:i,0,d.id);cfg.toolbar.order=o},false)});
// UI helpers
const el=(t,a,...k)=>{const e=document.createElement(t);for(const[x,v]of Object.entries(a||{})){if(x==='class')e.className=v;else if(v===undefined||v===null)continue;else if(x.startsWith('on'))e[x]=v;else if(x==='style')e.style.cssText=v;else e.setAttribute(x,v)}k.flat().forEach(c=>c!=null&&e.append(c));return e};
const H3=t=>el('h3',{},t);
const tog=(v,f,l,d)=>{const b=el('button',{class:'tog'+(v?' on':''),type:'button','aria-pressed':v?'true':'false','aria-label':l,onclick:()=>f(!v)});return el('div',{class:'erow'},el('div',{},el('div',{},l),d?el('small',{},d):null),b)};
const seg=(opts,cur,f)=>el('div',{class:'eopt'},opts.map(([v,n])=>el('button',{type:'button',class:cur===v?'on':'',onclick:()=>f(v)},n)));
const slider=(v,min,max,step,f)=>{const i=el('input',{type:'range',min,max,step,value:v});i.oninput=()=>f(+i.value,false);i.onchange=()=>f(+i.value,true);return i};
let sliding=false;
function sl(obj,key,min,max,step,after){return slider(obj[key],min,max,step,(val,commit)=>{if(!sliding){stack.push(snap());if(stack.length>40)stack.shift();sliding=true}obj[key]=val;saveCfg();after&&after();if(commit){sliding=false;syncFoot();flash()}})}
// tabs
const TABS=['Toolbar','Background','Clock & date','Home screen','Widgets'];
const tabs={
 'Toolbar':b=>{const t=cfg.toolbar;const vis=()=>t.order.filter(x=>TOOLSET.includes(x)&&!t.hidden.includes(x));
  b.append(H3('Your toolbar, left to right'));const strip=el('div',{class:'estrip'});const v=vis();
  v.forEach((id,i)=>strip.append(el('div',{class:'it'},Object.assign(el('span',{style:'flex:none;width:24px;height:24px;display:flex'}),{innerHTML:svgI(id)}),el('span',{},TOOLS[id]),
   el('button',{type:'button','aria-label':'Move '+TOOLS[id]+' left',disabled:i===0?'':undefined,onclick:()=>change(()=>{const o=t.order,a=o.indexOf(id),p=o.indexOf(v[i-1]);o.splice(a,1);o.splice(p,0,id)})},'◀'),
   el('button',{type:'button','aria-label':'Move '+TOOLS[id]+' right',disabled:i===v.length-1?'':undefined,onclick:()=>change(()=>{const o=t.order,a=o.indexOf(id);o.splice(a,1);const p=o.indexOf(v[i+1]);o.splice(p+1,0,id)})},'▶'))));
  if(!v.length)strip.append(el('small',{},'No tools yet. Add some below.'));
  b.append(strip);
  const CATS=[['Teach',['whiteboard','text','anno','presentations','library','supplies']],['Manage the class',['picker','traffic','behavior','wheel','schedule']],['Time and sound',['timer','sound']],['Screen',['cast','full','home']]];
  const NOTE={whiteboard:'Write and draw on a blank board',text:'Put words on the board',anno:'Write over any screen',presentations:'Show slides and videos',library:'Your saved files',supplies:'What students need today',picker:'Pick a student at random',traffic:'Quiet, working, loud',behavior:'Marks and stars',wheel:'Spin for a choice',schedule:'Today\'s lessons',timer:'Count down or up',sound:'Shows how loud the room is',full:'Go full screen',cast:'Show a computer screen on the board',home:'Back to the main board'};
  CATS.forEach(([cn,ids])=>{b.append(H3(cn));const g=el('div',{class:'egrid'});
  ids.forEach(id=>{const on=!t.hidden.includes(id)&&t.order.includes(id);g.append(el('button',{type:'button',title:NOTE[id]||'',class:'etool'+(on?' on':''),'aria-pressed':on?'true':'false','aria-label':TOOLS[id]+'. '+(NOTE[id]||'')+(on?'. On the toolbar':'. Not on the toolbar'),onclick:()=>change(()=>{if(on){t.hidden=[...new Set([...t.hidden,id])]}else{t.hidden=t.hidden.filter(x=>x!==id);t.order=t.order.filter(x=>x!==id);const i=t.order.indexOf('more');t.order.splice(i<0?t.order.length:i,0,id)}})},
   Object.assign(el('span',{}),{innerHTML:svgI(id)}).firstChild,TOOLS[id],el('i',{},on?'✓':'+')))});b.append(g)});
  b.append(el('small',{},'Drag icons on the toolbar, or use the arrows above. Tap ✕ on an icon to remove it.'));
  b.append(H3('Look'),tog(!!cfg.ui.labels,v=>change(()=>{cfg.ui.labels=v}),'Names under icons'),...(innerWidth<=700?[]:[H3('Position'),seg([['bottom','Bottom'],['top','Top']],t.pos,v=>change(()=>{t.pos=v}))]),H3('Icon size'),sl(t,'size',48,110,2,()=>renderToolbar()))},
 'Background':b=>{const bg=cfg.bg;
  const CAT=[['all','All'],['mountain','Mountains'],['forest','Forest'],['water','Water and mist'],['mine','My photos']];
  const match=(x,c)=>c==='all'||(c==='mine'?(bg.custom||[]).some(y=>y.id===x.id):c==='mountain'?/mountain|snow|alpine|hills/i.test(x.name):c==='forest'?/forest|pine|trail|autumn/i.test(x.name):/water|lake|mist|fog|reflect/i.test(x.name));
  b.append(el('div',{class:'chips',role:'group','aria-label':'Photo categories'},CAT.map(([k,n])=>el('button',{type:'button',class:bgCat===k?'on':'','aria-pressed':bgCat===k?'true':'false',onclick:()=>{bgCat=k;view()}},n))));
  const g=el('div',{class:'eph'});
  bgList().filter(x=>!/^s\d/.test(x.id)&&match(x,bgCat)).forEach(x=>g.append(el('button',{type:'button','aria-label':x.name,title:x.name,class:currentBg().id===x.id?'on':'',style:`background-image:url("${x.url}")`,onclick:()=>change(()=>{bg.manualId=x.id;bg.manualDay=dayKey();bg.auto=false;bg.lockedId=null})})));
  b.append(g,tog(!!bg.auto,v=>change(()=>{bg.auto=v;if(v){bg.manualId=null}}),'New view every day'),H3('Brightness'),sl(bg,'brightness',.4,1.4,.05,renderBg),H3('Softness'),sl(bg,'blur',0,20,1,renderBg));
  const up=el('input',{type:'file',accept:'image/*',style:'display:none',onchange:e=>readImg(e.target.files[0],1920,u=>change(()=>{const id=uid();bg.custom.push({id,name:'My photo',url:u});bg.manualId=id;bg.manualDay=dayKey();bg.auto=false}))});
  b.append(el('button',{class:'sec',type:'button',onclick:()=>up.click()},'Upload my own photo'),up)},
 'Clock & date':b=>{const k=cfg.clock;b.append(tog(k.visible,v=>change(()=>{k.visible=v}),'Show the clock'),H3('Size'),sl(k,'size',3,14,.2,renderClock),
  H3('Date'),seg([['std','Date'],['heb','Hebrew'],['both','Both'],['none','Off']],k.date||'std',v=>change(()=>{k.date=v})),
  H3('Position'),seg([['tl','Top left'],['tr','Top right'],['bl','Bottom left'],['br','Bottom right']],k.pos,v=>change(()=>{k.pos=v})),
  H3('Colour'),el('div',{class:'esw'},[['','#ffffff'],['#f4cf3d','#f4cf3d'],['#9fd7ff','#9fd7ff'],['#ffb3b3','#ffb3b3'],['#1c1c1e','#1c1c1e']].map(([v,c])=>el('button',{type:'button','aria-label':'Colour '+c,class:(k.color||'')===v?'on':'',style:'background:'+c,onclick:()=>change(()=>{k.color=v})}))),
  H3('Font'),seg([['Georgia, "Times New Roman", serif','Georgia'],['"Segoe UI Light","Segoe UI",sans-serif','Light'],['"Courier New",monospace','Mono']],k.font,v=>change(()=>{k.font=v})),
  tog(k.hour12,v=>change(()=>{k.hour12=v}),'12-hour time'))},
 'Home screen':b=>{const t=cfg.toolbar;b.append(el('small',{},'What shows on your board when you are teaching.'),tog(cfg.clock.visible,v=>change(()=>{cfg.clock.visible=v}),'Clock and date'),tog(cfg.room.show!==false,v=>change(()=>{cfg.room.show=v}),'Classroom name'),
  H3('Classroom name'),(()=>{const i=el('input',{type:'text',maxlength:'40',placeholder:'For example: Room 14',value:cfg.room.name||'',style:'height:42px;border-radius:11px;border:1.5px solid #c9c9d0;padding:0 12px;font:inherit;font-size:16px;width:100%;box-sizing:border-box'});i.onchange=()=>change(()=>{cfg.room.name=i.value.trim()},true);i.oninput=()=>{cfg.room.name=i.value.trim();window.renderRoomName()};return i})(),
  tog(!!t.pinned,v=>change(()=>{t.pinned=v;toolbarShow(true)}),'Toolbar always visible','Off: the toolbar hides after a few seconds and returns when you tap the screen edge.'))},
 'Widgets':b=>{b.append(el('small',{},'Tap a window on the board to select it. Drag its title to move it. Drag a corner to resize it. Windows stay where you put them.'),H3('Open a window to place it'),
  el('div',{class:'eopt'},[['Timer',()=>Widgets.open.timer?Widgets.close('timer'):openTimer()],['Name picker',()=>Widgets.open.picker?Widgets.close('picker'):openPicker()],['Schedule',()=>Widgets.open.schedule?Widgets.close('schedule'):openSchedule()]].map(([n,f])=>el('button',{type:'button',onclick:()=>{f();toolbarState()}},n))),
  H3('Window transparency'),el('small',{},'How see-through the timer, name picker and other windows are.'),sl(cfg.ui,'wop',.2,.95,.05,wop),H3('Reset'),el('button',{class:'sec',type:'button',onclick:e=>{const x=e.target;if(x.dataset.sure!=='1'){x.dataset.sure='1';x.textContent='Tap again to reset window positions';return}Store.keys('w.').forEach(k=>Store.del(k));x.dataset.sure='';x.textContent='Done. Windows open in their default places next time.'}},'Reset window positions'))}
};
let footEl=null;
function syncFoot(){if(panel&&panel.classList.contains('phone')){const u=panel.querySelector('.undo');if(u)u.disabled=!stack.length;return}if(!footEl)return;footEl.querySelector('.undo').disabled=!stack.length}
function pview(){const sc=panel.scrollTop;panel.innerHTML='';const t=cfg.toolbar,bg=cfg.bg;
 const on=id=>!t.hidden.includes(id)&&t.order.includes(id);
 const cb=currentBg();const pv=el('div',{class:'pv'+(cfg.room.name&&cfg.room.show!==false?' hasnm':''),style:`background-image:url("${cb.url}")`,role:'img','aria-label':'Live classroom preview'});
 if(cfg.room.name&&cfg.room.show!==false)pv.append(el('span',{class:'nm'},cfg.room.name));
 if(cfg.clock.visible)pv.append(el('span',{class:'ck'},timeStr(new Date())));
 const tp=el('div',{class:'tbp'});const updPv=()=>{tp.innerHTML='';t.order.filter(x=>TOOLSET.includes(x)&&on(x)).slice(0,6).forEach(id=>tp.append(Object.assign(el('span',{style:'display:flex'}),{innerHTML:svgI(id)}).firstChild))};updPv();pv.append(tp);
 panel.append(el('div',{class:'ph-h'},el('button',{type:'button',class:'undo',onclick:()=>{if(stack.length)restore(stack.pop())}},'↶ Undo'),el('b',{},'Customize'),el('span',{},el('span',{class:'saved',role:'status',style:'margin-right:8px'},'Saved'),el('button',{type:'button',onclick:()=>exit()},'Done'))),
  pv,el('h2',{},'Make it yours.'),el('p',{},'Choose the tools you love.'));
 const g=el('div',{class:'pgrid'});
 TOOLSET.forEach(id=>{const o=on(id);g.append(el('button',{type:'button',class:'ptool'+(o?' on':''),'aria-pressed':o?'true':'false','aria-label':TOOLS[id]+(o?'. On the toolbar':'. Not on the toolbar'),onclick:e=>{const was=on(id);change(()=>{if(was){t.hidden=[...new Set([...t.hidden,id])]}else{t.hidden=t.hidden.filter(x=>x!==id);t.order=t.order.filter(x=>x!==id);const i=t.order.indexOf('more');t.order.splice(i<0?t.order.length:i,0,id);openD.add('setup:'+id)}},true);const now=on(id),bt=e.currentTarget;bt.classList.toggle('on',now);bt.setAttribute('aria-pressed',now?'true':'false');bt.querySelector('i').textContent=now?'✓':'+';bt.setAttribute('aria-label',TOOLS[id]+(now?'. On the toolbar':'. Not on the toolbar'));updPv();buildSetup()},},Object.assign(el('span',{style:'display:flex'}),{innerHTML:svgI(id)}).firstChild,TOOLS[id],el('i',{},o?'✓':'+')))});
 panel.append(g);
 const SETUP={
  timer:bd=>{bd.append(el('small',{},'How long the timer starts at.'));const cur=Math.round(cfg.timer.def/60);const row=el('div',{class:'eopt'},[1,2,5,10,15,20].map(m=>el('button',{type:'button',class:cur===m?'on':'',onclick:()=>change(()=>{cfg.timer.def=m*60;if(typeof TimerW!=='undefined'&&!TimerW.running){TimerW.left=TimerW.total=cfg.timer.def}})},m+' min')));bd.append(row);
   const i=el('input',{type:'number',min:'1',max:'180',value:cur,'aria-label':'Minutes',style:INP});i.onchange=()=>{const m=Math.max(1,Math.min(180,+i.value||5));change(()=>{cfg.timer.def=m*60},true)};bd.append(el('div',{style:'display:flex;gap:8px;align-items:center'},i,el('span',{},'minutes')))},
  picker:bd=>{bd.append(el('small',{},'Type your students, one name per line. Stays on this device.'));const L=lists();const cur=L.find(l=>l.id===Store.get('activeList','main'))||L[0];const ta=el('textarea',{rows:'5',style:INP+';height:auto;padding:10px','aria-label':'Student names',dir:'auto'});ta.value=cur.students.map(x=>x.name).join('\n');
   ta.onchange=()=>{const names=ta.value.split('\n').map(x=>x.trim()).filter(Boolean);const L2=lists();const c2=L2.find(l=>l.id===Store.get('activeList','main'))||L2[0];const old=new Map(c2.students.map(x=>[x.name,x]));c2.students=names.map(n=>old.get(n)||{name:n});Store.set('studentLists',L2);flash()};bd.append(ta)},
  schedule:bd=>{bd.append(el('small',{},'When your school day starts and ends.'));const mk=(k,l)=>{const i=el('input',{type:'time',value:cfg.teach[k],'aria-label':l,style:INP});i.onchange=()=>change(()=>{cfg.teach[k]=i.value},true);return el('label',{style:'display:flex;flex-direction:column;gap:4px;flex:1;font-size:13px;color:#666'},l,i)};bd.append(el('div',{style:'display:flex;gap:10px'},mk('start','Starts'),mk('end','Ends')))},
  library:bd=>linkSetup(bd,'libLinks','Paste a Google Drive or website link to a folder or file.'),
  presentations:bd=>linkSetup(bd,'presLinks','Paste a link to a slideshow, video or folder.')};
 const INP='height:46px;border-radius:11px;border:1.5px solid #c9c9d0;padding:0 12px;font:inherit;font-size:16px;width:100%;box-sizing:border-box';
 function linkSetup(bd,key,hint){bd.append(el('small',{},hint));const Ls=Store.get(key,[]);
  Ls.forEach((x,i)=>bd.append(el('div',{class:'erow'},el('span',{dir:'auto',style:'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1'},x.title||x.url),el('button',{type:'button','aria-label':'Remove '+(x.title||x.url),style:'border:0;background:#f2f2f6;border-radius:8px;width:44px;height:40px;font-size:16px',onclick:()=>{const L2=Store.get(key,[]);L2.splice(i,1);Store.set(key,L2);flash();view()}},'✕'))));
  const ti=el('input',{type:'text',placeholder:'Name (optional)',style:INP,dir:'auto','aria-label':'Link name'}),ui=el('input',{type:'url',placeholder:'Paste link',style:INP,dir:'ltr','aria-label':'Link'});
  bd.append(ti,ui,el('button',{class:'sec',type:'button',onclick:()=>{let u=ui.value.trim();if(!u)return;if(!/^https?:\/\//i.test(u))u='https://'+u;const L2=Store.get(key,[]);L2.push({title:ti.value.trim(),url:u});Store.set(key,L2);flash();view()}},'Add link'))}
 const sbox=el('div',{style:'display:flex;flex-direction:column;gap:14px;flex:none'});panel.append(sbox);
 function buildSetup(){sbox.innerHTML='';const need=['timer','picker','schedule','library','presentations'].filter(id=>on(id));
 if(need.length){sbox.append(el('h2',{style:'font-size:20px;margin:4px 0 0'},'Set up your tools'),el('p',{style:'font-size:14px'},'Tap a tool to set it up now. You can change all of this later.'));
  need.forEach(id=>{const d=el('details',{class:'pgrp'});if(openD.has('setup:'+id))d.open=true;d.ontoggle=()=>{d.open?openD.add('setup:'+id):openD.delete('setup:'+id)};const bd=el('div',{class:'pgb'});SETUP[id](bd);d.append(el('summary',{},TOOLS[id]),bd);sbox.append(d)})}}
 buildSetup();
 panel.append(el('h2',{style:'font-size:20px'},'Background'));
 const bs=el('div',{class:'pbg'});bgList().filter(x=>!/^s\d/.test(x.id)).forEach(x=>bs.append(el('button',{type:'button','aria-label':x.name,class:cb.id===x.id?'on':'',style:`background-image:url("${x.url}")`,onclick:()=>change(()=>{bg.manualId=x.id;bg.manualDay=dayKey();bg.auto=false;bg.lockedId=null})})));
 panel.append(bs,tog(cfg.clock.visible,v=>change(()=>{cfg.clock.visible=v}),'Show the clock'),tog(cfg.room.show!==false,v=>change(()=>{cfg.room.show=v}),'Show the classroom name'),
  el('h2',{style:'font-size:20px'},'More settings'));
 const grp=(name,fn)=>{const d=el('details',{class:'pgrp'});if(openD.has(name))d.open=true;d.ontoggle=()=>{d.open?openD.add(name):openD.delete(name)};const sm=el('summary',{},name);const bd=el('div',{class:'pgb'});fn(bd);d.append(sm,bd);return d};
 panel.append(grp('Classroom name and toolbar',bd=>{tabs['Home screen'](bd)}),
  grp('Toolbar look',bd=>{bd.append(tog(!!cfg.ui.labels,v=>change(()=>{cfg.ui.labels=v}),'Names under icons'),H3('Icon size'),sl(t,'size',48,110,2,()=>renderToolbar()))}),
  grp('Background options',bd=>{tabs['Background'](bd)}),
  grp('Clock and date',bd=>{tabs['Clock & date'](bd)}),
  grp('Windows',bd=>{tabs['Widgets'](bd)}),
  el('button',{class:'bigpri',type:'button',onclick:()=>exit()},'Done customizing'));
 panel.scrollTop=sc;const u=panel.querySelector('.undo');if(u)u.disabled=!stack.length}
function view(){if(!panel)return;if(panel.classList.contains('phone'))return pview();const sc=panel.querySelector('.ebody');const top=sc?sc.scrollTop:0;panel.innerHTML='';
 panel.append(el('div',{class:'eh'},el('h2',{},'Make it yours'),el('span',{class:'saved',role:'status'},'Saved')),el('div',{class:'etabs',role:'tablist'},TABS.map(n=>el('button',{type:'button',role:'tab','aria-selected':n===tab?'true':'false',class:n===tab?'on':'',onclick:()=>{tab=n;view()}},n))));
 const body=el('div',{class:'ebody'});tabs[tab](body);panel.append(body);body.scrollTop=top;
 let sure=false;
 footEl=el('div',{class:'efoot'},el('button',{class:'lk undo',type:'button',onclick:()=>{if(stack.length)restore(stack.pop())}},'↶ Undo'),
  el('button',{class:'lk',type:'button',onclick:e=>{const x=e.target;if(!sure){sure=true;x.textContent='Tap again to confirm';setTimeout(()=>{sure=false;x.textContent='Restore defaults'},3500);return}change(()=>{cfg.toolbar=JSON.parse(JSON.stringify(DEF.toolbar));const c=cfg.bg.custom;cfg.bg={...JSON.parse(JSON.stringify(DEF.bg)),custom:c};cfg.clock=JSON.parse(JSON.stringify(DEF.clock));cfg.ui={...cfg.ui,labels:true}})}},'Restore defaults'),
  el('div',{style:'flex:1'}),el('button',{class:'pri',type:'button',onclick:()=>exit()},'Done'));
 panel.append(footEl);syncFoot()}
let keepT=null;
function pick(t){tab=t;view();['clock','roomname','toolbar'].forEach(i=>{const e=document.getElementById(i);e&&e.classList.remove('sel')});}
document.addEventListener('click',e=>{if(!editing||e.target.closest('#editpanel'))return;const wd=e.target.closest('.widget');if(wd&&!e.target.closest('button')){document.querySelectorAll('.widget.sel').forEach(x=>x.classList.remove('sel'));wd.classList.add('sel');pick('Widgets');wd.classList.add('sel');return}
 const c=e.target.closest('#clock'),r=e.target.closest('#roomname'),t=e.target.closest('#toolbar');
 if(c||r||t){pick(c?'Clock & date':r?'Home screen':'Toolbar');const x=c||r||t;x.classList.add('sel');return}
 if(e.target.id==='bg'||e.target.id==='bgdim'){pick('Background')}},false);
function enter(){if(editing)return;editing=true;Store.set('cust.setup',true);stack=[];tab='Toolbar';document.body.classList.add('editing');panel=el('div',{id:'editpanel',class:innerWidth<=700?'phone':'',role:'dialog','aria-label':'Make it yours'});document.body.appendChild(panel);
 toolbarShow(true);keepT=setInterval(()=>{const t=document.getElementById('toolbar');if(t&&t.dataset.off==='1')toolbarShow(true)},800);renderToolbar();view();document.addEventListener('keydown',esc)}
function esc(e){if(e.key==='Escape'&&!/INPUT|TEXTAREA/.test((e.target||{}).tagName||''))exit()}
function exit(){if(!editing)return;editing=false;Store.set('cust.setup',true);clearInterval(keepT);document.body.classList.remove('editing');document.querySelectorAll('.widget.sel').forEach(x=>x.classList.remove('sel'));['clock','roomname','toolbar'].forEach(i=>{const e=document.getElementById(i);e&&e.classList.remove('sel')});panel.remove();panel=null;footEl=null;document.removeEventListener('keydown',esc);
 const first=!cfg.ui.custDone&&stack.length>0;if(stack.length)cfg.ui.custDone=true;saveCfg();btnSync();renderToolbar();toolbarShow(!!cfg.toolbar.pinned);
 if(first)toast('Saved on this computer. Sign in any time to keep it on all your devices.');
 if(Widgets.open&&!cfg.toolbar.pinned){}}
window.__custEnter=enter;
setInterval(()=>{try{document.body.classList.toggle('tbtop',cfg.toolbar.pos==='top');document.body.classList.toggle('clk-r',cfg.clock.pos[1]==='r');document.body.classList.toggle('clk-tl',cfg.clock.pos==='tl'&&cfg.clock.show!==false)}catch(e){}},400);
})();
