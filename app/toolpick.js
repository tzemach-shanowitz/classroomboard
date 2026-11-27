/* Choose your tools: one simple tile screen for what shows on the toolbar. Works for every account. */
(function(){
if(window.__demo)return;
const st=document.createElement('style');st.textContent=`
#tpk{position:fixed;inset:0;z-index:120;background:rgba(10,14,22,.5);display:flex;align-items:center;justify-content:center;font-family:-apple-system,Inter,system-ui,sans-serif;direction:ltr}
#tpk .card{background:#fafafc;color:#1c1c1e;width:min(560px,94vw);max-height:92vh;border-radius:22px;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.35);overflow:hidden}
#tpk header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 6px}
#tpk h2{margin:0;font-size:22px;font-weight:700}
#tpk .done{border:0;background:none;color:#6858f8;font:700 18px inherit;font-family:inherit;min-height:44px;padding:0 6px;cursor:pointer}
#tpk .acct{margin:4px 20px 10px;padding:10px 12px;border-radius:12px;background:#fff;border:1px solid #e0e0e6;display:flex;align-items:center;gap:10px;font-size:15px;color:#333}#tpk .acct i{flex:none;width:10px;height:10px;border-radius:50%;background:#b0b0b8}#tpk .acct[data-k=ok] i{background:#2fb344}#tpk .acct[data-k=wait] i{background:#f0a500}#tpk .acct[data-k=bad] i{background:#d63a3a}#tpk .acct span{flex:1;min-width:0}#tpk .acct button{border:0;background:#6858f8;color:#fff;border-radius:10px;min-height:40px;padding:0 14px;font:600 15px inherit;font-family:inherit;cursor:pointer}
#tpk p{margin:0;padding:0 20px 10px;font-size:16px;color:#555}
#tpk .body{overflow:auto;padding:4px 16px 18px}
#tpk .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
@media(min-width:620px){#tpk .grid{grid-template-columns:repeat(3,1fr)}}
#tpk .t{border:1.5px solid #d6d6dc;background:#fff;border-radius:16px;min-height:84px;display:flex;flex-direction:column;justify-content:flex-end;gap:8px;padding:12px;font:500 16px inherit;font-family:inherit;color:#1c1c1e;position:relative;text-align:left;cursor:pointer}
#tpk .t svg{width:26px;height:26px;fill:none;stroke:#6858f8;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
#tpk .t i{position:absolute;top:10px;right:10px;width:26px;height:26px;border-radius:50%;border:1.5px solid #b9b9c0;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:16px;color:#8a8a92}
#tpk .more{display:flex;flex-direction:column;gap:10px;margin-top:14px}#tpk .adv{border:1.5px solid #d6d6dc;background:#fff;border-radius:14px;min-height:52px;font:600 17px inherit;font-family:inherit;color:#1c1c1e;cursor:pointer}#tpk .dseg{display:flex;align-items:center;gap:6px;background:#fff;border:1.5px solid #d6d6dc;border-radius:14px;padding:6px 6px 6px 14px;font-size:17px}#tpk .dseg span{flex:1;font-weight:500}#tpk .dseg button{border:0;background:#f0f0f4;border-radius:10px;min-height:44px;padding:0 10px;font:500 15px inherit;font-family:inherit;color:#1c1c1e;cursor:pointer}#tpk .dseg button.on{background:#6858f8;color:#fff}#tpk .adv.pri{background:#6858f8;border-color:#6858f8;color:#fff}
#tpk .tw{position:relative;display:flex}#tpk .tw .t{width:100%}#tpk .hg .t span{padding-right:38px}#tpk .g{position:absolute;right:6px;bottom:6px;width:44px;height:44px;border:0;background:none;border-radius:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#7a7a84}#tpk .g svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}#tpk .g:hover{background:#f0eeff;color:#6858f8}
#tpk .t.on{border-color:#6858f8}
#tpk .t.on i{background:#6858f8;border-color:#6858f8;color:#fff}
`;document.head.append(st);
const GEAR={whiteboard:['advanced','input'],anno:['advanced','input'],timer:['widgets','timer'],picker:['classroom','picker'],wheel:['classroom','students'],behavior:['classroom','behavior'],schedule:['classroom','sched'],supplies:['classroom','supplies'],library:['materials','links'],presentations:['materials','links'],traffic:['widgets'],sound:['widgets'],text:['widgets']};
const IDS=()=>{const all=Object.keys(TOOLS).filter(id=>id!=='settings'&&id!=='audio'||(id==='audio'&&window.__legacy));const o=cfg.toolbar.order;return [...o.filter(x=>all.includes(x)),...all.filter(x=>!o.includes(x))]};
function open(simple){
 if(document.getElementById('tpk'))return;
 const t=cfg.toolbar;const o=document.createElement('div');o.id='tpk';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Choose your tools');
 const card=document.createElement('div');card.className='card';
 card.innerHTML='<header><h2>'+(simple?'Settings':'Choose your tools')+'</h2><button class="done" type="button">Done</button></header><p>Choose the tools you use. Tap one to show or hide it on the toolbar.</p><div class="body"><div class="grid"></div><div class="more"></div></div>';
 const grid=card.querySelector('.grid');
 const draw=()=>{grid.innerHTML='';IDS().forEach(id=>{const on=t.order.includes(id)&&!t.hidden.includes(id);
  const b=document.createElement('button');b.type='button';b.className='t'+(on?' on':'');b.setAttribute('aria-pressed',on?'true':'false');b.setAttribute('aria-label',TOOLS[id]+(on?'. On the toolbar':'. Not on the toolbar'));
  b.innerHTML=svgI(id)+'<span></span><i>'+(on?'\u2713':'+')+'</i>';b.querySelector('span').textContent=window.__t?window.__t(TOOLS[id]):TOOLS[id];
  b.onclick=()=>{if(on){t.hidden=[...new Set([...(t.hidden||[]),id])]}else{t.hidden=(t.hidden||[]).filter(x=>x!==id);if(!t.order.includes(id)){const i=t.order.indexOf('more');t.order.splice(i<0?t.order.length:i,0,id)}}
   saveCfg();renderToolbar();try{toolbarShow(true)}catch(e){}draw()};
  const w=document.createElement('div');w.className='tw';w.append(b);
  if(simple&&GEAR[id]){w.classList.add('hg');const g=document.createElement('button');g.type='button';g.className='g';const nm=TOOLS[id];g.setAttribute('aria-label',nm+' settings');g.title=nm+' settings';
   g.innerHTML='<svg viewBox="0 0 24 24">'+(IC.settings||'')+'</svg>';g.onclick=e=>{e.stopPropagation();close();setTimeout(()=>window.__openAdvanced&&window.__openAdvanced(GEAR[id][0],GEAR[id][1]),60)};w.append(g)}
  grid.append(w)})};
 draw();
 if(simple){const ac=document.createElement('div');ac.className='acct';card.insertBefore(ac,card.querySelector('p'));const C=window.Cloud;
  const paint=()=>{if(!C||!ac.isConnected){return}ac.innerHTML='';const dot=document.createElement('i');const t=document.createElement('span');let kind='off';
   if(!C.user){t.textContent='Not signed in. This board is saved on this device only.';const b=document.createElement('button');b.type='button';b.textContent='Sign in';b.onclick=()=>{C.signIn().catch(e=>{t.textContent='Sign-in did not finish: '+((e&&(e.code||e.message))||'unknown')})};ac.append(dot,t,b)}
   else{const em=C.user.email||'your account';if(C.status==='ok'){kind='ok';t.textContent='Signed in as '+em+'. Synced'+(C.lastSync?' at '+new Date(C.lastSync).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}):'')+'.'}else if(C.status==='syncing'){kind='wait';t.textContent='Signed in as '+em+'. Syncing\u2026'}else{kind='bad';t.textContent='Signed in as '+em+'. Not synced: '+(C.msg||C.status)}ac.append(dot,t)}
   ac.dataset.k=kind};paint();const off=C&&C.onChange?C.onChange(paint):null;const iv=setInterval(paint,2000);ac._stop=()=>{clearInterval(iv);off&&off()};setTimeout(paint,0);
  const m=card.querySelector('.more');m.parentNode.insertBefore(m,card.querySelector('.grid'));m.style.margin='0 0 14px';const lab=document.createElement('button');lab.type='button';lab.className='adv';lab.textContent='Names under icons: '+(cfg.ui&&cfg.ui.labels?'On':'Off');lab.onclick=()=>{cfg.ui.labels=!cfg.ui.labels;saveCfg();renderToolbar();lab.textContent='Names under icons: '+(cfg.ui.labels?'On':'Off')};const dl=document.createElement('div');dl.className='dseg';dl.setAttribute('role','group');dl.setAttribute('aria-label','Date under the clock');const dt=document.createElement('span');dt.textContent='Date';dl.append(dt);
 const dbs=[['std','Date'],['heb','Hebrew'],['both','Both'],['none','Off']].map(([v,n])=>{const b=document.createElement('button');b.type='button';b.textContent=n;b.onclick=()=>{cfg.clock.date=v;saveCfg();try{renderClock()}catch(e){}mark()};dl.append(b);return [v,b]});
 const mark=()=>dbs.forEach(([v,b])=>{const on=(cfg.clock.date||'std')===v;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false')});mark();m.append(dl);
 const adv=document.createElement('button');adv.type='button';adv.className='adv pri';adv.textContent='Advanced settings';adv.onclick=()=>{close();setTimeout(()=>window.__openAdvanced&&window.__openAdvanced(),60)};m.append(lab,adv)}
 const close=()=>{try{const a=card.querySelector('.acct');a&&a._stop&&a._stop()}catch(e){}o.remove();document.removeEventListener('keydown',kd)};const kd=e=>{if(e.key==='Escape')close()};
 document.addEventListener('keydown',kd);card.querySelector('.done').onclick=close;o.onclick=e=>{if(e.target===o)close()};
 o.append(card);document.body.append(o);card.querySelector('.done').focus();
}
window.openToolPicker=()=>open(false);
addEventListener('load',()=>{const full=window.openSettings;if(typeof full!=='function')return;window.__openAdvanced=(...a)=>full(...a);
window.openSettings=function(tab,sub){if(tab===undefined&&!document.querySelector('.s2'))return open(true);return full.call(this,tab,sub)}});
})();
