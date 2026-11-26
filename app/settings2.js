'use strict';
/* ClassroomBoard Settings: sidebar window, Apple-style rows, search, subpages. Original code.
   Reads and writes the same stored settings as before (cfg), so nothing needs migrating. */
(function(){
const CSS=`
.s2scrim{position:fixed;inset:0;z-index:70;background:rgba(10,16,26,.45);backdrop-filter:blur(6px);display:grid;place-items:center;direction:ltr;touch-action:none}
.s2{--ac:var(--uiac,#0a84ff);zoom:var(--z,1);--bd:#e3e6ec;--tx:#1d1d1f;--mu:#6e6e73;width:min(1000px,calc(96vw / var(--z,1)));height:min(calc(84vh / var(--z,1)),780px);background:#f5f5f7;color:var(--tx);border-radius:18px;box-shadow:0 30px 90px rgba(0,0,0,.35);display:flex;flex-direction:column;overflow:hidden;font:15px/1.4 -apple-system,"Segoe UI","Helvetica Neue",Arial,"Noto Sans Hebrew",sans-serif;text-align:left}
.s2 *{box-sizing:border-box}
.s2hd{display:flex;align-items:center;gap:12px;padding:14px 20px;background:#fff;border-bottom:1px solid var(--bd);flex:none}
.s2hd h1{font-size:22px;font-weight:600;margin:0;flex:1;letter-spacing:-.01em}
.s2saved{font-size:13px;color:var(--mu);opacity:0;transition:opacity .25s}.s2saved.on{opacity:1}
.s2x.sm{width:34px;height:34px;flex:none}
.s2x{width:40px;height:40px;border-radius:50%;border:0;background:#ececf0;color:#555;display:grid;place-items:center;cursor:pointer}
.s2x:hover{background:#e0e0e6}
.s2body{flex:1;display:flex;min-height:0}
.s2side{width:230px;flex:none;background:#efeff2;border-right:1px solid var(--bd);padding:12px;overflow:auto;touch-action:pan-y}
.s2srch{position:relative;margin-bottom:10px}
.s2srch input{width:100%;height:38px;border-radius:10px;border:0;background:#e1e1e6;padding:0 12px 0 34px;font:inherit;color:var(--tx);outline:none}
.s2srch input:focus{box-shadow:0 0 0 2px var(--ac) inset;background:#fff}
.s2srch svg{position:absolute;left:10px;top:10px;color:#8a8a90}
.s2cat{display:flex;align-items:center;gap:10px;width:100%;min-height:44px;border:0;background:transparent;border-radius:10px;padding:0 12px;font:inherit;font-weight:500;color:var(--tx);cursor:pointer;text-align:left}
.s2cat svg{flex:none;color:#5f5f66}
.s2cat.on{background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.08)}.s2cat.on svg{color:var(--ac)}
.s2cat:hover:not(.on){background:#e5e5ea}
.s2main{flex:1;min-width:0;display:flex;flex-direction:column}
.s2ph{display:flex;align-items:center;gap:8px;padding:16px 28px 6px;flex:none;min-height:56px}
.s2ph h2{font-size:21px;font-weight:600;margin:0;letter-spacing:-.01em}
.s2back{display:inline-flex;align-items:center;gap:2px;border:0;background:none;color:var(--ac);font:inherit;font-size:16px;cursor:pointer;padding:6px 8px 6px 0;min-height:40px}
.s2pg{flex:1;overflow:auto;padding:8px 28px 28px;touch-action:pan-y;-webkit-overflow-scrolling:touch}
.s2grp{margin:14px 0 6px}
.s2gt{font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--mu);margin:0 0 6px 14px;font-weight:500}
.s2card{background:#fff;border-radius:12px;border:1px solid var(--bd);overflow:hidden}
.s2row{display:flex;align-items:center;gap:14px;min-height:54px;padding:8px 16px;border-top:1px solid #eeeef1}
.s2row:first-child{border-top:0}
.s2row.nav{cursor:pointer}.s2row.nav:hover{background:#fafafc}.s2row:focus-visible{outline:2px solid var(--ac);outline-offset:-2px}
.s2l{flex:1;min-width:0}.s2l b{font-weight:400;font-size:16px;display:block}.s2l small{display:block;color:var(--mu);font-size:13px;margin-top:1px}
.s2r{display:flex;align-items:center;gap:8px;color:var(--mu);flex:none;max-width:60%}
.s2chev{color:#b4b4ba}
.s2sw{width:52px;height:32px;border-radius:16px;border:0;background:#d6d6db;position:relative;cursor:pointer;transition:background .2s;padding:0;flex:none}
.s2sw i{position:absolute;left:2px;top:2px;width:28px;height:28px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .2s}
.s2sw.on{background:#34c759}.s2sw.on i{transform:translateX(20px)}
.s2 input[type=range]{width:200px;accent-color:var(--ac);height:32px}
.s2seg{display:inline-flex;background:#e8e8ed;border-radius:9px;padding:2px}
.s2seg button{border:0;background:transparent;font:inherit;font-size:14px;padding:0 14px;height:32px;border-radius:7px;cursor:pointer;color:var(--tx)}
.s2seg button.on{background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.18);font-weight:500}
.s2 select,.s2 .s2in{height:36px;border-radius:8px;border:1px solid #d1d1d6;background:#fff;font:inherit;font-size:15px;padding:0 10px;color:var(--tx);max-width:100%}
.s2btn{height:36px;padding:0 16px;border-radius:9px;border:0;background:#ececf0;font:inherit;font-size:15px;color:var(--ac);cursor:pointer;font-weight:500}
.s2btn.pri{background:var(--ac);color:var(--accfg,#fff)}.s2btn.dg{color:#d70015}
.s2btn:hover{filter:brightness(.96)}
.s2prev{width:92px;height:56px;border-radius:8px;background-size:cover;background-position:center;border:1px solid var(--bd)}
.s2sws{display:flex;gap:8px}.s2sws button{width:28px;height:28px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #c9c9cf;cursor:pointer}.s2sws button.on{box-shadow:0 0 0 2px var(--ac)}
.s2note{color:var(--mu);font-size:13px;margin:8px 14px}
.s2gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.s2gal .t{position:relative;aspect-ratio:5/3;border-radius:10px;background-size:cover;background-position:center;cursor:pointer;border:3px solid transparent}
.s2gal .t.on{border-color:var(--ac)}.s2gal .t b{position:absolute;right:6px;top:4px;color:#ffd24d;font-size:22px;text-shadow:0 1px 3px #000;cursor:pointer;font-weight:400}
.s2res{padding:8px}.s2res .s2row{border-radius:10px;border:0}
.s2leg .card{background:transparent;padding:4px 14px;font-weight:400;border:0}
.s2leg .lbl{color:var(--mu);font-size:13px;margin:8px 4px}
.s2leg label.row,.s2leg .row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:8px 0;font-size:16px}
.s2leg .item{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid var(--bd);border-radius:10px;padding:6px 12px;margin:6px 0}
.s2leg .item .grow{flex:1}
.s2leg .inp{height:38px;border:1px solid #d1d1d6;border-radius:8px;padding:0 10px;font:inherit;font-size:15px;background:#fff;color:var(--tx)}
.s2leg .pill{height:38px;font-size:15px;padding:0 14px;border-radius:9px;border:0;background:#e8e8ed;color:var(--ac);cursor:pointer;font-weight:500;display:inline-flex;align-items:center}
.s2leg .pill.sel,.s2leg .pill.big.sel{background:var(--ac);color:#fff}
.s2leg .pill.danger{color:#d70015}
.s2leg .pill.big{height:40px}
.s2leg .tabs{display:none}.s2leg .card{background:#fff;border:1px solid var(--bd);border-radius:12px;padding:12px 16px;font-weight:400;margin:8px 0;line-height:1.5}
.s2leg .field,.s2leg .fld{margin:10px 4px}
.s2leg input[type=range]{width:100%}
.s2leg input[type=checkbox]{width:24px;height:24px}
.s2leg .wbtn.sm{width:38px;height:38px;border-radius:9px;background:#ececf0;border:0;color:#333;cursor:pointer}
.s2leg details{margin:10px 4px}
@media(max-width:760px){
 .s2{width:calc(100vw / var(--z,1));height:calc(100dvh / var(--z,1));border-radius:0}
 .s2side{width:100%;border:0}
 .s2body.sub .s2side{display:none}.s2body:not(.sub) .s2main{display:none}
 .s2pg{padding:8px 14px 24px}.s2ph{padding:12px 14px 4px}
 .s2 input[type=range]{width:140px}
}
@media(min-width:761px){.s2back.mob{display:none}}

/* ---- dark theme ---- */
html[data-theme=dark] .s2{--bd:#3a3a3e;--tx:#f5f5f7;--mu:#a1a1a8;background:#1c1c1e;color-scheme:dark;box-shadow:0 30px 90px rgba(0,0,0,.6)}
html[data-theme=dark] .s2hd{background:#2a2a2d}html[data-theme=dark] .s2x{background:#3a3a3e;color:#ddd}html[data-theme=dark] .s2x:hover{background:#48484d}
html[data-theme=dark] .s2side{background:#232326}html[data-theme=dark] .s2srch input{background:#3a3a3e}html[data-theme=dark] .s2srch input:focus{background:#1c1c1e}
html[data-theme=dark] .s2cat svg{color:#a1a1a8}html[data-theme=dark] .s2cat.on{background:#3a3a3e;box-shadow:none}html[data-theme=dark] .s2cat:hover:not(.on){background:#2e2e32}
html[data-theme=dark] .s2card{background:#2a2a2d}html[data-theme=dark] .s2row{border-top-color:#3a3a3e}html[data-theme=dark] .s2row.nav:hover{background:#333337}
html[data-theme=dark] .s2sw{background:#58585d}html[data-theme=dark] .s2sw.on{background:#30d158}
html[data-theme=dark] .s2seg{background:#3a3a3e}html[data-theme=dark] .s2seg button.on{background:#636368;color:#fff;box-shadow:none}
html[data-theme=dark] .s2 select,html[data-theme=dark] .s2 .s2in,html[data-theme=dark] .s2leg .inp{background:#3a3a3e;border-color:#505055;color:#f5f5f7}
html[data-theme=dark] .s2btn,html[data-theme=dark] .s2leg .pill,html[data-theme=dark] .s2leg .wbtn.sm{background:#3a3a3e;color:var(--ac)}html[data-theme=dark] .s2btn.pri{background:var(--ac);color:var(--accfg,#fff)}
html[data-theme=dark] .s2leg .item,html[data-theme=dark] .s2leg .card{background:#2a2a2d;border-color:#3a3a3e}
html[data-theme=dark] .s2sws button{border-color:#2a2a2d;box-shadow:0 0 0 1px #58585d}html[data-theme=dark] .s2sws button.on{box-shadow:0 0 0 2px var(--ac)}
html[data-theme=dark] .s2chev{color:#6a6a70}
.s2leg .pill.sel,.s2leg .pill.big.sel{color:var(--accfg,#fff)}
.s2sws input[type=color]{width:28px;height:28px;border:0;padding:0;border-radius:50%;background:none;cursor:pointer}
.s2sws .cust{background:conic-gradient(#f55,#fd5,#5d5,#5df,#55f,#f5f,#f55)!important}
.s2cols{display:flex;gap:12px}.s2colw{display:flex;flex-direction:column;align-items:center;gap:2px}.s2colw small{font-size:11px;color:var(--mu)}
.s2col{width:40px;height:30px;border:1px solid var(--bd);border-radius:8px;padding:0;background:none;cursor:pointer}
.s2dlg{position:fixed;inset:0;z-index:95;background:rgba(10,16,26,.4);backdrop-filter:blur(4px);display:grid;place-items:center;animation:s2f .15s;touch-action:none}
@keyframes s2f{from{opacity:0}}
.s2dlg>div{--ac:var(--uiac,#0a84ff);width:min(340px,90vw);background:#fff;color:#1d1d1f;border-radius:16px;padding:22px 20px 16px;box-shadow:0 24px 70px rgba(0,0,0,.4);font:15px/1.4 -apple-system,"Segoe UI","Helvetica Neue",Arial,"Noto Sans Hebrew",sans-serif;text-align:center;animation:s2p .18s}
@keyframes s2p{from{transform:scale(.94)}}
.s2dlg h3{margin:0 0 14px;font-size:17px;font-weight:600;unicode-bidi:plaintext}
.s2dlg input{width:100%;height:42px;border-radius:10px;border:1px solid #d1d1d6;padding:0 12px;font:inherit;font-size:16px;margin-bottom:14px;background:#fff;color:#1d1d1f;unicode-bidi:plaintext}
.s2dlg input:focus{outline:2px solid var(--ac)}
.s2dlg .bt{display:flex;gap:8px}.s2dlg button{flex:1;height:44px;border-radius:11px;border:0;background:#ececf0;color:var(--ac);font:inherit;font-size:16px;font-weight:500;cursor:pointer}
.s2dlg button.pri{background:var(--ac);color:var(--accfg,#fff)}.s2dlg button.dg{background:#d70015;color:#fff}
html[data-theme=dark] .s2dlg>div{background:#2a2a2d;color:#f5f5f7}html[data-theme=dark] .s2dlg button{background:#3a3a3e}html[data-theme=dark] .s2dlg input{background:#3a3a3e;border-color:#505055;color:#f5f5f7}
.s2scrim.sh{z-index:85}.s2.s2sheet{width:min(480px,calc(94vw / var(--z,1)));height:auto;max-height:calc(86vh / var(--z,1))}
.s2ft{padding:10px 20px 14px;background:var(--bd0,transparent);border-top:1px solid var(--bd);display:flex;justify-content:flex-end;flex:none}
.s2sheet .s2seg{flex-wrap:wrap;justify-content:flex-end}.s2sheet .s2seg button{padding:0 10px}
.s2sheet .s2pg{padding:6px 20px 14px}.s2sheet .s2r{max-width:62%}
.s2sheet .s2leg .lbl,.s2sheet .s2leg .row{margin:6px 8px}
@media(max-width:760px){.s2.s2sheet{width:calc(100vw / var(--z,1));height:auto;max-height:calc(92dvh / var(--z,1));border-radius:18px 18px 0 0;align-self:end}.s2scrim.sh{align-items:end}}
.s2qr{display:flex;justify-content:center;margin:14px 0}.s2qr img{width:200px;height:200px;background:#fff;border-radius:12px;padding:8px;border:1px solid var(--bd)}
.s2undo{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:99;display:flex;align-items:center;gap:16px;background:rgba(30,30,34,.94);color:#fff;border-radius:14px;padding:8px 8px 8px 18px;font:15px -apple-system,'Segoe UI',Arial,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,.35);animation:s2p .18s}
.s2undo button{border:0;background:rgba(255,255,255,.16);color:#7cc4ff;border-radius:10px;height:38px;padding:0 16px;font:inherit;font-weight:600;cursor:pointer}
/* ---- right to left ---- */
.s2 input,.s2 textarea{unicode-bidi:plaintext}
.s2[dir=rtl] .s2l b,.s2[dir=rtl] .s2l small,.s2[dir=rtl] .s2note{unicode-bidi:plaintext}
.s2 .s2r span{unicode-bidi:plaintext}
.s2[dir=rtl]{text-align:right}
.s2[dir=rtl] .s2side{border-right:0;border-left:1px solid var(--bd)}
.s2[dir=rtl] .s2chev svg,.s2[dir=rtl] .s2back svg{transform:scaleX(-1)}
.s2[dir=rtl] .s2back{padding:6px 0 6px 8px}
.s2[dir=rtl] .s2gt{margin:0 14px 6px 0}
.s2[dir=rtl] .s2srch input{padding:0 34px 0 12px}.s2[dir=rtl] .s2srch svg{left:auto!important;right:10px}
.s2[dir=rtl] .s2sw i{left:auto;right:2px}.s2[dir=rtl] .s2sw.on i{transform:translateX(-20px)}
.s2[dir=rtl] input[type=range]{direction:ltr}
/* ---- theme for the old popups ---- */
.pill.sel{color:var(--accfg,#052033)}
html[data-theme=light] .modal{background:rgba(250,250,252,.97);color:#1d1d1f}
html[data-theme=light] .modal .mhead{border-color:#e3e6ec}html[data-theme=light] .modal .mfoot{border-color:#e3e6ec}
html[data-theme=light] .modal .card{background:#fff;border-color:#e3e6ec}html[data-theme=light] .modal .item{border-color:#eee}
html[data-theme=light] .modal .inp{background:#fff;border:1px solid #d1d1d6;color:#1d1d1f}html[data-theme=light] .modal .inp::placeholder{color:#8a8a90!important}
html[data-theme=light] .modal .pill{background:#ececf0;border-color:transparent;color:#1d1d1f}html[data-theme=light] .modal .pill.sel{background:var(--acc);color:var(--accfg,#052033)}
html[data-theme=light] .modal .wbtn{color:#333}html[data-theme=light] .modal .wbtn:active{background:#e5e5ea}
`;
const st=document.createElement('style');st.textContent=CSS;document.head.append(st);
const ic=d=>`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const IC={
 general:ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
 appearance:ic('<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 15l5-4 4 3 3-2 6 4"/>'),
 classroom:ic('<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><path d="M16 6.5a3 3 0 010 5M18 14c2 .8 3 2.800 3 6"/>'),
 toolbar:ic('<rect x="3" y="14" width="18" height="6" rx="3"/><path d="M8 17h.01M12 17h.01M16 17h.01"/>'),
 widgets:ic('<rect x="4" y="4" width="7" height="7" rx="1.500"/><rect x="13" y="4" width="7" height="7" rx="1.500"/><rect x="4" y="13" width="7" height="7" rx="1.500"/><rect x="13" y="13" width="7" height="7" rx="1.500"/>'),
 materials:ic('<path d="M4 5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2z"/><path d="M14 3v6h6"/>'),
 account:ic('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.600-7 8-7s8 3 8 7"/>'),
 privacy:ic('<path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z"/>'),
 advanced:ic('<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>'),
 search:ic('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),
 chev:ic('<path d="M9 6l6 6-6 6"/>'),back:ic('<path d="M15 6l-6 6 6 6"/>'),x:ic('<path d="M6 6l12 12M18 6L6 18"/>')
};
const ico=s=>h('span',{html:s,style:'display:inline-flex'});
/* ---------- reusable components ---------- */
let flashT;const flash=()=>{const e=document.querySelector('.s2saved');if(!e)return;e.textContent=window.__t?window.__t('Saved'):'Saved';e.classList.add('on');clearTimeout(flashT);flashT=setTimeout(()=>e.classList.remove('on'),1200)};
const sv=(f)=>(v)=>{f(v);flash()};
const Switch=(v,f)=>{const b=h('button',{class:'s2sw'+(v?' on':''),role:'switch','aria-checked':String(!!v),onclick:()=>{v=!v;b.classList.toggle('on',v);b.setAttribute('aria-checked',String(v));sv(f)(v)}},h('i'));return b};
const Slider=(v,min,max,step,f)=>h('input',{type:'range',min,max,step,value:v,'aria-label':'value',oninput:e=>sv(f)(+e.target.value)});
const Seg=(opts,cur,f)=>{const w=h('div',{class:'s2seg',role:'group'});opts.forEach(([k,l])=>{const b=h('button',{class:k===cur?'on':'',onclick:()=>{[...w.children].forEach(c=>c.classList.remove('on'));b.classList.add('on');sv(f)(k)}},l);w.append(b)});return w};
const Select=(opts,cur,f)=>h('select',{onchange:e=>sv(f)(e.target.value)},...opts.map(([k,l])=>h('option',{value:k,selected:k===cur},l)));
const Text=(v,f,o={})=>h('input',{class:'s2in',value:v||'',dir:o.dir||'auto',style:o.style||'width:200px',placeholder:o.ph||'',onchange:e=>sv(f)(e.target.value)});
const Num=(v,f,o={})=>h('input',{class:'s2in',type:'number',min:o.min,max:o.max,step:o.step||1,value:v,style:'width:'+(o.w||90)+'px',onchange:e=>sv(f)(+e.target.value)});
const Btn=(t,f,k='')=>h('button',{class:'s2btn '+k,onclick:f},t);
const Swatches=(cols,cur,f)=>{const w=h('div',{class:'s2sws'});cols.forEach(c=>w.append(h('button',{class:c===cur?'on':'',style:'background:'+c,'aria-label':c,onclick:()=>{[...w.children].forEach(x=>x.classList.remove('on'));w.querySelector(`[aria-label="${c}"]`).classList.add('on');sv(f)(c)}})));return w};
const Row=(label,ctrl,o={})=>{const r=h('div',{class:'s2row'+(o.go?' nav':''),'data-k':o.k||''},h('div',{class:'s2l'},h('b',{},label),o.desc?h('small',{},o.desc):null),h('div',{class:'s2r'},o.val!=null?h('span',{},o.val):null,ctrl||null,o.go?h('span',{class:'s2chev',html:IC.chev}):null));
  if(o.go){r.tabIndex=0;r.setAttribute('role','button');r.onclick=o.go;r.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();o.go()}}}return r};
const Nav=(label,go,o={})=>Row(label,null,{...o,go});
const Group=(title,...rows)=>h('div',{class:'s2grp'},title?h('div',{class:'s2gt'},title):null,h('div',{class:'s2card'},rows.filter(Boolean)));
const Note=t=>h('div',{class:'s2note'},t);
/* ---------- state ---------- */
let ST=null,ST_edit=null,mode2='in';let schedDate=dayKey(),pendAdd=false;
const DIRECT={behavior:'classroom',schedule:'classroom'};
function openSettings2(tab,sub){
  document.querySelectorAll('.s2scrim').forEach(x=>x.remove());
  const scrim=h('div',{class:'s2scrim'}),win=h('div',{class:'s2',role:'dialog','aria-modal':'true','aria-label':'Settings'});scrim.append(win);
  const side=h('div',{class:'s2side'}),main=h('div',{class:'s2main'}),body=h('div',{class:'s2body'},side,main);
  const closeB=h('button',{class:'s2x','aria-label':'Close settings',html:IC.x});
  const close=()=>{scrim.remove();removeEventListener('keydown',kd,true)};closeB.onclick=close;
  const kd=e=>{if(e.key==='Escape'){e.stopPropagation();if(ST.stack.length)pop();else close()}};addEventListener('keydown',kd,true);
  scrim.addEventListener('pointerdown',e=>{if(e.target===scrim)close()});
  win.append(h('div',{class:'s2hd'},h('h1',{},'Settings'),h('span',{class:'s2saved'}),closeB),body);
  document.body.append(scrim);
  const map={clock:'general',bg:'appearance',toolbar:'toolbar',behavior:'classroom',schedule:'classroom',students:'classroom',labels:'general',timer:'widgets',supplies:'classroom',links:'materials',share:'account',data:'privacy',input:'advanced',account:'account'};
  ST={cat:map[tab]||(CATS.find(c=>c.id===tab)?tab:'general'),stack:[],mobileList:innerWidth<=760&&!tab};
  const q=h('input',{type:'search','aria-label':'Search settings',placeholder:'Search'});
  const resBox=h('div',{class:'s2res',style:'display:none'});
  side.append(h('div',{class:'s2srch',html:IC.search.replace('<svg','<svg style="position:absolute;left:10px;top:9px;color:#8a8a90"')},q));
  const catBtns=CATS.map(c=>{const b=h('button',{class:'s2cat','data-c':c.id,onclick:()=>{ST.cat=c.id;ST.stack=[];ST.mobileList=false;render()}},ico(IC[c.icon]),c.name);side.append(b);return b});
  function pop(){ if(ST.stack.length){ST.stack.pop();render()}else if(innerWidth<=760){ST.mobileList=true;render()} }
  function push(title,fn){ST.stack.push({title,fn});render()}
  function render(){
    catBtns.forEach(b=>b.classList.toggle('on',b.dataset.c===ST.cat&&!ST.mobileList));
    body.classList.toggle('sub',!ST.mobileList);
    const c=CATS.find(x=>x.id===ST.cat),top=ST.stack[ST.stack.length-1];
    const pg=h('div',{class:'s2pg'}),re=()=>{const sc=pg.scrollTop;render();document.querySelector('.s2pg').scrollTop=sc};
    const ctx={push,pop,re,close,go:(cat,sub)=>{ST.cat=cat;ST.stack=[];ST.mobileList=false;render();if(sub)SUBS[sub]&&push(SUBS[sub].title,SUBS[sub].fn)}};
    main.innerHTML='';
    const hd=h('div',{class:'s2ph'});
    if(top)hd.append(h('button',{class:'s2back',onclick:pop},ico(IC.back),ST.stack.length>1?ST.stack[ST.stack.length-2].title:c.name));
    else hd.append(h('button',{class:'s2back mob',onclick:pop},ico(IC.back),'Settings'));
    hd.append(h('h2',{},top?top.title:c.name));main.append(hd,pg);
    if(top)top.fn(pg,ctx);else c.render(pg,ctx);
    if(ST.leg)pg.classList.add('s2leg');
    xl(side);xl(main);
  }
  q.addEventListener('input',()=>{
    const t=q.value.trim().toLowerCase();
    if(!t){resBox.remove();render();return}
    const hits=INDEX.filter(e=>(e.n+' '+e.k).toLowerCase().includes(t));
    main.innerHTML='';const pg=h('div',{class:'s2pg'});body.classList.add('sub');
    main.append(h('div',{class:'s2ph'},h('h2',{},'Search')),pg);
    setTimeout(()=>xl(main),0);
    if(!hits.length)pg.append(Note('Nothing matches "'+q.value+'".'));
    else pg.append(Group(null,...hits.map(e=>Row(e.n,null,{val:CATS.find(c=>c.id===e.c).name,go:()=>{q.value='';ST.cat=e.c;ST.stack=[];ST.mobileList=false;render();if(e.s)push(SUBS[e.s].title,SUBS[e.s].fn);setTimeout(()=>{const r=[...document.querySelectorAll('.s2row')].find(x=>x.dataset.k===e.r);if(r){r.scrollIntoView({block:'center'});r.style.background='#e8f2ff';setTimeout(()=>r.style.background='',1600)}},60)}}))))});
  win.dir=cfg.ui.lang==='en'?'ltr':'rtl';
  if(sub&&SUBS[sub])ST.stack.push({title:SUBS[sub].title,fn:SUBS[sub].fn});
  render();
  if(tab==='behavior')push(SUBS.behavior.title,SUBS.behavior.fn);else if(tab==='schedule')push(SUBS.sched.title,SUBS.sched.fn);
  return{close};
}
/* ---------- legacy editors embedded in the new shell ---------- */
function legacy(name){return(pg,ctx)=>{ST.leg=true;const P=h('div');pg.append(P);try{S[name](P,ctx.re,ctx.close)}catch(e){P.append(Note('This section could not load: '+e.message))}}}
const _leg=fn=>(pg,ctx)=>{fn(pg,ctx);};
/* ---------- pages ---------- */
const pos4=[['tl','Top left'],['tr','Top right'],['bl','Bottom left'],['br','Bottom right']];
const FONTS=[['Georgia, "Times New Roman", serif','Georgia'],['"Times New Roman",serif','Times'],['"Segoe UI Light","Segoe UI",sans-serif','Segoe Light'],['"Courier New",monospace','Mono']];
const SUBS={
 clockAdv:{title:'Clock appearance',fn:(pg,ctx)=>{const k=cfg.clock,l=cfg.loc;const u=()=>{saveCfg();renderClock()};
  pg.append(Group(null,Row('Transparency',Slider(k.opacity,.2,1,.05,v=>{k.opacity=v;u()})),Row('Color',h('div',{style:'display:flex;gap:10px;align-items:center'},h('input',{type:'color',value:k.color||'#ffffff',oninput:e=>sv(()=>{k.color=e.target.value;u()})()}),Btn('Automatic',()=>{k.color='';u();flash()}))),Row('Font',Select(FONTS,k.font,v=>{k.font=v;u()}))),
  Group('Hebrew date location',Row('Place name',Text(l.name,v=>{l.name=v;saveCfg()},{ph:'Name'}),{desc:'The Hebrew date changes at local sunset.'}),Row('Latitude',Num(l.lat,v=>{l.lat=v;u()},{step:.0001,w:120})),Row('Longitude',Num(l.lon,v=>{l.lon=v;u()},{step:.0001,w:120})),Row('Time zone',Text(l.tz,v=>{l.tz=v;u()},{ph:'America/New_York',dir:'ltr'}))),
  Group(null,Row('Reset clock appearance',Btn('Reset',()=>{Object.assign(k,{size:DEF.clock.size,color:'',opacity:1,font:DEF.clock.font,pos:'tr'});u();flash();ctx.re()},'dg'))))}},
 gallery:{title:'Choose background',fn:(pg,ctx)=>{const b=cfg.bg;const g=h('div',{class:'s2gal'});
  bgList().forEach(x=>g.append(h('div',{class:'t'+(currentBg().id===x.id?' on':''),style:`background-image:url("${x.url}")`,title:x.name,role:'button',tabIndex:0,onclick:()=>{b.manualId=x.id;b.manualDay=dayKey();saveCfg();renderBg();flash();ctx.pop()}},h('b',{onclick:e=>{e.stopPropagation();b.favs=b.favs.includes(x.id)?b.favs.filter(i=>i!==x.id):[...b.favs,x.id];saveCfg();flash();ctx.re()},'aria-label':'Favorite'},b.favs.includes(x.id)?'★':'☆'))));
  pg.append(Note('Tap a picture to use it. The star marks a favorite for daily rotation.'),g,
   Group('Add your own',Row('Upload a photo',h('label',{class:'s2btn'},'Choose file',h('input',{type:'file',accept:'image/*',style:'display:none',onchange:e=>readImg(e.target.files[0],1920,u=>{const id=uid();b.custom.push({id,name:'Upload',url:u});b.manualId=id;b.manualDay=dayKey();saveCfg();renderBg();flash();ctx.pop()})}))),
    (()=>{const i=h('input',{class:'s2in',placeholder:'Image web address',dir:'ltr',style:'width:220px'});return Row('From a web address',h('div',{style:'display:flex;gap:8px'},i,Btn('Add',()=>{const u=i.value.trim();if(u){b.custom.push({id:uid(),name:'URL',url:u});saveCfg();flash();ctx.re()}})))})(),
    b.custom.length?Row('Remove custom backgrounds',Btn('Remove',()=>sure('Remove all custom backgrounds?',()=>{b.custom=[];b.manualId=null;b.lockedId=null;saveCfg();renderBg();ctx.re()}),'dg')):null))}},
 tools:{title:'Customize tools',fn:(pg,ctx)=>{const t=cfg.toolbar;
  pg.append(Note('Choose which tools show and in what order.'),Group(null,...t.order.map((id,i)=>Row(TOOLS[id]||id,h('div',{style:'display:flex;gap:6px;align-items:center'},
   h('button',{class:'s2btn','aria-label':'Move up',html:IC.back.replace('<svg','<svg style="transform:rotate(90deg)"'),onclick:()=>{if(i>0){[t.order[i-1],t.order[i]]=[t.order[i],t.order[i-1]];saveCfg();renderToolbar();flash();ctx.re()}}}),
   h('button',{class:'s2btn','aria-label':'Move down',html:IC.back.replace('<svg','<svg style="transform:rotate(-90deg)"'),onclick:()=>{if(i<t.order.length-1){[t.order[i+1],t.order[i]]=[t.order[i],t.order[i+1]];saveCfg();renderToolbar();flash();ctx.re()}}}),
   Switch(!t.hidden.includes(id),v=>{t.hidden=v?t.hidden.filter(x=>x!==id):[...t.hidden,id];saveCfg();renderToolbar()}))))))}},
 headings:{title:'Headings and messages',fn:(pg)=>{const L=cfg.labels;const nm={supplies:'Supplies heading',schedule:'Schedule heading',picker:'Name picker heading',timer:'Timer heading',done:'Timer finished message'};
  pg.append(Group(null,...Object.keys(L).map(k=>Row(nm[k]||k,Text(L[k],v=>{L[k]=v;saveCfg()},{style:'width:260px'})))),Group(null,Row('Restore standard wording',Btn('Restore',()=>sure('Replace all of these with the standard wording for the classroom language?',()=>{resetWording();location.reload()}),'dg'),{desc:'Uses the Classroom wording language from General.'})),Note('Student-facing text. Hebrew and Yiddish are supported.'))}},
 behavior:{title:'Behavior and stars',fn:(pg,ctx)=>{const A=window.__beh;if(!A){pg.append(Note('Behavior is not available.'));return}const B=A.B,re=()=>A.repaint();
  const Col=(v,f)=>h('input',{type:'color',value:v,class:'s2col',onchange:e=>sv(f)(e.target.value)});
  const lab=(t,c)=>h('div',{class:'s2colw'},c,h('small',{},t));
  pg.append(
   Group('Behavior marks',Row('Colors',h('div',{class:'s2cols'},...['Great','One mark','Two marks','Three marks'].map((l,i)=>lab(l,Col(B.colors[i],v=>{B.colors[i]=v;re()})))),{desc:'Green, yellow, orange, red. Red stays until you reset it.'}),
    Row('Shape',Select([['dot','Round dot'],['square','Soft square'],['heart','Heart'],['face','Face']],B.shape,v=>{B.shape=v;re()}))),
   Group('Rewards',Row('Reward icon',Select([['star','Star'],['heart','Heart'],['diamond','Diamond'],['medal','Medal']],B.reward,v=>{B.reward=v;re()})),
    Row('Colors by amount',h('div',{class:'s2cols'},...['1','2','3+'].map((l,i)=>lab(l,Col(B.tiers[i],v=>{B.tiers[i]=v;re()}))))),
    Row('Sparkles',Seg([['off','Off'],['nice','Subtle'],['fest','Festive']],B.spark,v=>{B.spark=v;re()})),
    Row('Reward sounds',Switch(B.sound,v=>{B.sound=v;A.saveB();if(v)A.chime(3)}))),
   Group('Look',Row('Font',Select([['sans','Clean'],['round','Friendly'],['serif','Classic'],['hebrew','Hebrew (David)']],B.font,v=>{B.font=v;re()})),
    Row('Text size',Slider(B.fscale,60,160,5,v=>{B.fscale=v;re()})),Row('Student name size',Slider(B.nscale,60,160,5,v=>{B.nscale=v;re()})),
    Row('Icon size',Slider(B.iscale,60,150,5,v=>{B.iscale=v;re()})),Row('Row spacing',Slider(B.gap,70,140,5,v=>{B.gap=v;re()})),
    Row('Columns',Select([['auto','Automatic'],['1','1'],['2','2'],['3','3']],String(B.cols),v=>{B.cols=v;re()})),
    Row('Theme',Seg([['light','Light'],['dark','Dark']],B.theme,v=>{B.theme=v;re()})),
    Row('Transparency',Slider(B.op,20,100,2,v=>{B.op=v;re()}),{desc:'Left is see-through.'})),
   Group('Window',Row('Open in full screen',Switch(B.startFull,v=>{B.startFull=v;A.saveB()})),
    Row('Full screen now',Btn('Open',()=>{ctx.close();A.fullNow()})),Row('Reset size and position',Btn('Reset',()=>{ctx.close();A.resetPos()}))),
   Group('Daily reset',Row('Start every new day fresh',Switch(B.autoReset,v=>{B.autoReset=v;A.saveB()}),{desc:'Marks and stars go back to zero. Your class list and settings are never deleted.'}),
    Row('Reset marks',Btn('Reset',()=>sure('Reset all behavior marks to green?',()=>A.resetWhat('m')),'dg')),
    Row('Reset stars',Btn('Reset',()=>sure('Reset all stars to zero?',()=>A.resetWhat('r')),'dg')),
    Row('Reset both',Btn('Reset',()=>sure('Reset marks and stars for everyone?',()=>A.resetWhat('both')),'dg'),{desc:'Undo on the widget brings it back.'})),
   Note('To reset one student, tap their name on the widget.'))}},
 sched:{title:'Daily schedule',fn:(pg,ctx)=>{const date=schedDate;let sc=Store.get(SK(date),null)||{items:[]};if(pendAdd){const last=sc.items[sc.items.length-1];sc.items.push({t:last?last.t:cfg.teach.start,n:''});pendAdd=false}
  const repaint=()=>{const w=Widgets.open.schedule;if(w&&w.paint&&w.date===date)w.paint()};
  const save=()=>{const items=sc.items.filter(i=>i.n.trim()).map(i=>({t:i.t,n:i.n})).sort((a,b)=>toMin(a.t)-toMin(b.t));Store.set(SK(date),{items});repaint()};
  const rows=sc.items.map((it,i)=>{const r=h('div',{class:'s2row'},h('input',{class:'s2in',type:'time',value:it.t,'aria-label':'Time',onchange:e=>{it.t=e.target.value;save();sc.items.sort((a,b)=>toMin(a.t)-toMin(b.t));flash();ctx.re()}}),
    h('input',{class:'s2in',value:it.n,dir:'auto',placeholder:'Activity','aria-label':'Activity',style:'flex:1;min-width:0',onchange:e=>{it.n=e.target.value;save();flash()}}),
    h('button',{class:'s2x sm','aria-label':'Remove',onclick:()=>{const [gone]=sc.items.splice(i,1);save();flash();ctx.re();undoBar('Activity removed',()=>{const c=Store.get(SK(date),{items:[]});c.items.push(gone);c.items.sort((a,b)=>toMin(a.t)-toMin(b.t));Store.set(SK(date),c);repaint();if(document.querySelector('.s2pg'))ctx.re()})},html:IC.x}));return r});
  pg.append(Group(null,Row('Date',h('input',{class:'s2in',type:'date',value:date,onchange:e=>{if(e.target.value){schedDate=e.target.value;ctx.re()}}}),{k:'scheddate'}),
    Row('Show on screen',Btn('Open',()=>{if(!Store.get(SK(date),null))save();ctx.close();Widgets.close('schedule');openSchedule(date)}))),
   Group('Activities',...(rows.length?rows:[Row('No activities yet',null,{desc:'Add one below, or start from an example day or a template.'})]),
    Row('Add activity',Btn('Add',()=>{pendAdd=true;ctx.re();setTimeout(()=>{const ins=document.querySelectorAll('.s2pg input[placeholder]');ins[ins.length-1]&&ins[ins.length-1].focus()},60)}),{k:'addact'})),
   Group('Start from',Row('Example day',Btn('Insert',()=>{const old=sc.items.map(x=>({...x}));sc.items=EXAMPLE.map(([t,n])=>({t,n}));save();ctx.re();if(old.length)undoBar('Example day inserted',()=>{Store.set(SK(date),{items:old});repaint();if(document.querySelector('.s2pg'))ctx.re()})})),
    Nav('Templates',()=>ctx.push(SUBS.schedTmpl.title,SUBS.schedTmpl.fn),{k:'templates'}),
    Nav('Copy from another day',()=>ctx.push(SUBS.schedDup.title,SUBS.schedDup.fn),{k:'copyday'}),),
   Group(null,Row('Save as template',Btn('Save',()=>ask('Template name','',n=>{if(n){save();const T=tmplList();T.push({name:n,items:sc.items.filter(i=>i.n.trim()).map(x=>({...x}))});Store.set('schedTemplates',T);toast('Template saved')}}))),
    Row('Delete this day',Btn('Delete',()=>{const old=Store.get(SK(date),null);Store.del(SK(date));Widgets.close('schedule');ctx.re();undoBar('Schedule deleted',()=>{if(old)Store.set(SK(date),old);if(document.querySelector('.s2pg'))ctx.re()})},'dg'))),
   Note('Each activity runs until the next one starts. End with a closing row such as סיום. Changes save automatically.'))}},
 schedTmpl:{title:'Templates',fn:(pg,ctx)=>{const T=tmplList();
  pg.append(Group(null,...(T.length?T.map((t,i)=>Row(t.name,h('div',{style:'display:flex;gap:8px'},Btn('Use',()=>{Store.set(SK(schedDate),{items:t.items.map(x=>({...x}))});ctx.pop()}),Btn('Delete',()=>{const [gone]=T.splice(i,1);Store.set('schedTemplates',T);ctx.re();undoBar('Template deleted',()=>{const T2=tmplList();T2.splice(i,0,gone);Store.set('schedTemplates',T2);if(document.querySelector('.s2pg'))ctx.re()})},'dg')))):[Row('No templates yet',null,{desc:'Open a schedule and choose Save as template.'})])))}},
 schedDup:{title:'Copy from another day',fn:(pg,ctx)=>{const d=schedDays().sort().reverse().filter(x=>x!==schedDate);
  pg.append(Group(null,...(d.length?d.slice(0,60).map(x=>Row(x,Btn('Copy here',()=>{Store.set(SK(schedDate),{items:Store.get(SK(x)).items.map(i=>({...i}))});ctx.pop()}))):[Row('No other saved days yet')])))}},
 schedDays:{title:'Saved days',fn:(pg,ctx)=>{const d=schedDays().sort().reverse();
  pg.append(Group(null,...(d.length?d.slice(0,90).map(x=>Row(x,null,{go:()=>{schedDate=x;ctx.pop()}})):[Row('No saved days yet')])))}},
 links:{title:'Saved links',fn:(pg,ctx)=>{
  pg.append(Group(null,Row('Simple buttons',Switch(Store.get('driveSimple',true),v=>Store.set('driveSimple',v)),{desc:'The PDF and Slideshow buttons open their Drive folder directly.'}),
   Nav('Library links',()=>ctx.push('Library links',(p,c)=>SUBS.linkList.fn(p,c,'library')),{k:'liblinks'}),Nav('Presentation links',()=>ctx.push('Presentation links',(p,c)=>SUBS.linkList.fn(p,c,'pres')),{k:'preslinks'})))}},
 linkList:{title:'Links',fn:(pg,ctx,kind)=>{const key=kind==='library'?'libLinks':'presLinks';const L=Store.get(key,[]);const put=()=>Store.set(key,L);
  const rows=L.map((x,i)=>Row(x.title||x.url,h('div',{style:'display:flex;gap:8px'},Btn('Edit',()=>{ST_edit=i;ctx.re()}),Btn('Remove',()=>{const [gone]=L.splice(i,1);put();ctx.re();undoBar('Link removed',()=>{L.splice(i,0,gone);put();if(document.querySelector('.s2pg'))ctx.re()})},'dg')),{desc:x.url}));
  const ed=typeof ST_edit==='number'&&L[ST_edit]?L[ST_edit]:null;
  const ti=h('input',{class:'s2in',placeholder:'Title',value:ed?ed.title||'':'',dir:'auto',style:'width:180px;flex:none'}),ui=h('input',{class:'s2in',placeholder:'Paste link',value:ed?ed.url:'',dir:'ltr',style:'flex:1;min-width:0'});
  const doSave=()=>{const u=ui.value.trim();if(!u)return;if(ed){ed.title=ti.value.trim();ed.url=u}else L.push({title:ti.value.trim(),url:u});put();flash();ST_edit=null;ctx.re()};
  pg.append(Group(null,...(rows.length?rows:[Row('No links yet',null,{desc:'Paste a Google Drive, Slides or web link below.'})])),
   Group(ed?'Edit link':'Add a link',h('div',{class:'s2row'},ti,ui,Btn(ed?'Save':'Add',doSave,'pri'))))}},
 links_:{title:'x',fn:()=>{}},
 account:{title:'Account and sync',fn:(pg,ctx)=>{const C=window.Cloud;pg.dataset.acc='1';
  if(!C){pg.append(Note('Online features are still loading. If this stays, check the internet connection and reload.'));return}
  const u=C.user;const aer=e=>typeof aerr==='function'?aerr(e):(e&&e.message)||'Something went wrong';
  if(!u){const em=h('input',{class:'s2in',type:'email',placeholder:'Email',dir:'ltr',autocomplete:'email',style:'width:240px'}),pw=h('input',{class:'s2in',type:'password',placeholder:'Password (6+ characters)',dir:'ltr',autocomplete:mode2==='up'?'new-password':'current-password',style:'width:240px'});
   const msg=h('div',{class:'s2note',style:'color:#d70015;min-height:1.2em'});
   const run=async f=>{msg.style.color='#d70015';msg.textContent='';try{await f();setTimeout(ctx.re,500)}catch(e){msg.textContent=aer(e)}};
   const go=()=>run(()=>mode2==='up'?C.emailSignUp(em.value.trim(),pw.value):C.emailSignIn(em.value.trim(),pw.value));pw.onkeydown=e=>{if(e.key==='Enter')go()};
   pg.append(Group(null,Row('Continue with Google',Btn('Continue',()=>run(()=>C.signIn(false)),'pri'),{desc:'Saves your setup online and lets you use it on any device. Until then it stays only in this browser.'})),
    Group('Or use an email',Row('Email',em),Row('Password',pw),
     Row(mode2==='up'?'Create account':'Sign in',Btn(mode2==='up'?'Create':'Sign in',go,'pri')),
     Row(mode2==='up'?'I already have an account':'New here?',Btn(mode2==='up'?'Sign in instead':'Create account',()=>{mode2=mode2==='up'?'in':'up';ctx.re()})),
     mode2==='in'?Row('Forgot password?',Btn('Email me a link',async()=>{const e=em.value.trim();if(!e){msg.textContent='Type your email above first.';return}try{await C.resetPassword(e);msg.style.color='#1e8e3e';msg.textContent='If that email has an account, a reset link was sent.'}catch(x){msg.textContent=aer(x)}})):null),msg);
   return}
  const stTxt={'signed-out':'Not signed in','syncing':'Saving…','ok':'Saved online','warn':'Saved online, with a warning','error':'Problem saving online'}[C.status]||C.status;
  pg.append(Group(null,Row('Signed in as',null,{val:u.email||u.displayName}),Row('Status',null,{val:stTxt+(C.lastSync?' · '+new Date(C.lastSync).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}):''),desc:C.msg||''}),Row('Save now',Btn('Save now',async()=>{await C.flush();toast('Saved');ctx.re()}))),
   (C.guestBackupInfo&&C.guestBackupInfo().count)?Group('Guest setup',Row('From before you signed in',h('div',{style:'display:flex;gap:8px'},Btn('Restore',()=>sure('Bring back your guest settings? They will replace the same settings in your account. Class lists are added, not replaced.',()=>{const n=C.restoreGuest();toast('Restored');ctx.re()})),Btn('Dismiss',()=>{C.discardGuestBackup();ctx.re()})),{desc:'Your account\'s classroom was kept as it was. Your guest version is saved on this device so nothing is lost.'})):null,
   Group('Google Drive',Row(C.hasDrive()?'Connected':'Not connected',Btn(C.hasDrive()?'Reconnect':'Connect',async()=>{try{await C.driveToken(true);toast('Google Drive connected');ctx.re()}catch(e){toast('Could not connect: '+(e.code||e.message))}}),{desc:'Optional. Read only: ClassroomBoard can look at your files and can never change or delete them. Lasts about an hour.'})),
   Group(null,Row('Sign out',Btn('Sign out',async()=>{await C.signOut();ctx.re()}),{desc:'Your data stays saved online.'})),
   Group('Danger zone',Row('Sign out and clear this device',Btn('Clear',()=>sure('Sign out and remove all saved data from this device? Your account keeps it online.',async()=>{await C.signOut(true)}),'dg')),
    Row('Delete my account and data',Btn('Delete…',()=>deleteAcct(C),'dg'),{desc:'Asks you to confirm.'})));
  if(!window.__s2accSub){window.__s2accSub=1;C.onChange(()=>{const P=document.querySelector('.s2pg[data-acc]');if(P&&P.isConnected&&!P.contains(document.activeElement)){clearTimeout(window.__s2accT);window.__s2accT=setTimeout(()=>window.__s2accRe&&window.__s2accRe(),120)}})}
  window.__s2accRe=ctx.re}},
 share:{title:'Share ClassroomBoard',fn:(pg,ctx)=>{const url='https://classroomboard.web.app';
  const cp=(t,m)=>{try{navigator.clipboard.writeText(t);toast(m||'Copied')}catch(e){toast(t)}};
  pg.append(Group(null,Row('Link',null,{val:'classroomboard.web.app'}),Row('Copy link',Btn('Copy',()=>cp(url,'Link copied'),'pri')),navigator.share?Row('Share',Btn('Share…',()=>navigator.share({title:'ClassroomBoard',url}).catch(()=>{}))):null),
   h('div',{class:'s2qr'},h('img',{src:'qr.svg',alt:'QR code for classroomboard.web.app'})),
   Note('Open the link on a computer, phone or SMART Board. Sign in once, and your setup follows you.'),
   Group('Handy pages',Row('Board view',Btn('Copy',()=>cp(url+'/app/?view=board'))),Row('Phone setup',Btn('Copy',()=>cp(url+'/app/?view=phone'))),Row('Phone marking',Btn('Copy',()=>cp(url+'/app/?view=mark')))))}},
 timer:{title:'Timer',fn:(pg,ctx)=>{const t=cfg.timer,u=()=>saveCfg(),paint=()=>{Widgets.open.timer&&Widgets.open.timer.paint&&Widgets.open.timer.paint()};
  pg.append(Group('Default',Row('Default time',h('div',{style:'display:flex;gap:6px;align-items:center'},Num(Math.floor(t.def/60),v=>{t.def=v*60+t.def%60;u()},{min:0,max:99,w:64}),'min',Num(t.def%60,v=>{t.def=Math.floor(t.def/60)*60+clamp(v,0,59);u()},{min:0,max:59,w:64}),'sec'),{k:'timerdef',desc:'Used by new timers.'}),
    Row('Quick presets',Text(t.presets.join(', '),v=>{t.presets=v.split(',').map(x=>+x.trim()).filter(x=>x>0);u()},{dir:'ltr',style:'width:170px'}),{desc:'Minutes, separated by commas.'})),
   Group('Ending sound',Row('Sound',h('div',{style:'display:flex;gap:8px'},Select([['bell','Bell'],['chime','Chime'],['beep','Beep']],t.sound,v=>{t.sound=v;u()}),Btn('Preview',()=>Audio_.play(t.sound,t.volume,1.5,false))),{k:'timersound'}),
    Row('Volume',Slider(t.volume,0,1,.05,v=>{t.volume=v;u()})),Row('Mute',Switch(t.mute,v=>{t.mute=v;u()}))),
   Group(null,Nav('Appearance',()=>ctx.push('Timer appearance',SUBS.timerApp.fn),{val:'Color theme'}),Nav('Advanced',()=>ctx.push('Timer advanced',SUBS.timerAdv.fn),{val:'Repeat, red warning, tab title'})),
   Note('Start, pause and reset stay on the timer itself.'))}},
 timerApp:{title:'Timer appearance',fn:(pg,ctx)=>{const t=cfg.timer;
  pg.append(Group(null,Row('Color theme',Swatches(THEMES.map(x=>x[0]==='glass'?'#8aa0b4':x[0]),THEMES[t.theme]?(THEMES[t.theme][0]==='glass'?'#8aa0b4':THEMES[t.theme][0]):'',c=>{t.theme=THEMES.findIndex(x=>(x[0]==='glass'?'#8aa0b4':x[0])===c);saveCfg();if(Widgets.open.timer){Widgets.close('timer');openTimer()}})),Row('Completion animation',Switch(t.anim,v=>{t.anim=v;saveCfg()}))))}},
 timerAdv:{title:'Timer advanced',fn:(pg,ctx)=>{const t=cfg.timer,u=()=>saveCfg();
  pg.append(Group('When time is up',Row('Alarm length',h('div',{style:'display:flex;gap:6px;align-items:center'},Num(t.alarmSecs,v=>{t.alarmSecs=v;u()},{min:1,max:60,w:64}),'seconds')),Row('Keep sounding until dismissed',Switch(t.repeat,v=>{t.repeat=v;u()})),Row('Repeat the timer',h('div',{style:'display:flex;gap:6px;align-items:center'},Num(t.repeatN,v=>{t.repeatN=Math.max(0,v);u()},{min:0,max:20,w:64}),'times')),Row('Reset when completed',Switch(t.autoReset,v=>{t.autoReset=v;u()}))),
   Group('Display',Row('Show time in browser tab',Switch(t.tab,v=>{t.tab=v;u()})),Row('Red warning near the end',Switch(t.red,v=>{t.red=v;u();ctx.re()})),
    t.red?Row('Warn when',Seg([['pct','Percent left'],['sec','Seconds left']],t.redMode==='sec'?'sec':'pct',v=>{t.redMode=v;u();ctx.re()})):null,
    t.red?Row(t.redMode==='sec'?'Seconds left':'Percent left',Num(t.redMode==='sec'?t.redSec:t.redPct,v=>{if(t.redMode==='sec')t.redSec=v;else t.redPct=v;u()},{min:1,max:t.redMode==='sec'?600:90,w:80})):null))}},
 picker:{title:'Name picker',fn:(pg,ctx)=>{const p=cfg.picker,u=()=>saveCfg();const L=lists();
  pg.append(Group(null,Row('No repeats until everyone is picked',Switch(p.noRepeat,v=>{p.noRepeat=v;u()}),{k:'norepeat'}),Row('Sound',Switch(p.sound,v=>{p.sound=v;u()})),Row('Name size',Slider(p.size||84,40,140,2,v=>{p.size=v;u()}))),
   Group('Students',Nav('Class lists and students',()=>ctx.push(SUBS.students.title,SUBS.students.fn),{val:L.reduce((a,l)=>a+l.students.length,0)+' names'})),
   Note('Pick and Reset stay on the widget itself. Switch a student off in the list to skip them today.'))}},
 supplies:{title:'Supplies',fn:(pg,ctx)=>{const day=SUBS._supDay=SUBS._supDay??new Date().getDay();
  pg.append(Group(null,Row('Heading',Text(cfg.labels.supplies,v=>{cfg.labels.supplies=v;saveCfg()},{style:'width:240px'}),{desc:'Shown to students.'})),
   Group('Books to bring',Row('Day',Select(SUP_DAYS.map((n,i)=>[String(i),n]),String(day),v=>{SUBS._supDay=+v;ctx.re()})),
    ...SUP_P.map((pn,p)=>{const ta=h('textarea',{class:'s2in',dir:'auto',rows:3,style:'width:100%;height:auto;padding:8px 10px;margin-top:6px',placeholder:'One book per line'});ta.value=supList(day)[p].join('\n');
     ta.onchange=()=>sv(()=>{const S2=Store.get('supDays2',{});const cur=supList(day).map(x=>[...x]);cur[p]=ta.value.split('\n').map(x=>x.trim()).filter(Boolean);S2[day]=cur;Store.set('supDays2',S2);if(Widgets.open.supplies)showSupplies()})();
     const r=Row(pn,null,{});r.style.flexWrap='wrap';r.append(h('div',{style:'width:100%'},ta));return r})),
   Note('The supplies widget switches by itself at each break.'))}},
 students:{title:'Class lists and students',fn:(pg,ctx)=>{const L=lists(),cur=L.find(l=>l.id===Store.get('activeList','main'))||L[0],save=()=>{Store.set('studentLists',L);flash()};
  const trash=IC.x.replace('width="20" height="20"','width="16" height="16"');
  pg.append(Group('Class list',
   Row('Active list',Select(L.map(l=>[l.id,l.name+' ('+l.students.length+')']),cur.id,v=>{Store.set('activeList',v);ctx.re()})),
   Row('New list',Btn('Add list',()=>ask('List name','',n=>{if(n){const id=uid();L.push({id,name:n,students:[]});Store.set('studentLists',L);Store.set('activeList',id);ctx.re()}}))),
   Row('Rename this list',Btn('Rename',()=>ask('List name',cur.name,n=>{if(n){cur.name=n;save();ctx.re()}})))));
  const add=h('input',{class:'s2in',dir:'auto',placeholder:'New name',style:'width:220px'});
  const addIt=()=>{const n=add.value.trim();if(!n)return;cur.students.push({name:n,absent:false});save();ctx.re();setTimeout(()=>{const a=document.querySelector('.s2pg .s2in[placeholder="New name"]');a&&a.focus()},50)};add.onkeydown=e=>{if(e.key==='Enter')addIt()};
  pg.append(Group('Students ('+cur.students.length+')',
   Row('Add a student',h('div',{style:'display:flex;gap:8px'},add,Btn('Add',addIt))),
   Row('Paste many names',null,{go:()=>pickerSettings(),desc:'Opens the paste tool.'}),
   ...cur.students.map((s,i)=>Row(h('input',{class:'s2in',dir:'auto',value:s.name,'aria-label':'Student name',style:'width:100%;border:0;background:transparent;font-size:16px;padding:0;height:34px',onchange:e=>{const v=e.target.value.trim();if(v){s.name=v;save()}else{cur.students.splice(i,1);save();ctx.re()}}}),h('div',{style:'display:flex;gap:12px;align-items:center'},Switch(!s.absent,v=>{s.absent=!v;save()}),h('button',{class:'s2btn dg','aria-label':'Remove '+s.name,html:trash,onclick:()=>{cur.students.splice(i,1);save();ctx.re()},style:'padding:0 10px'})),{}))));
  pg.append(Note('Switch off = absent today. Changes save automatically.'))}},
 input:{title:'Pen and touch',fn:(pg,ctx)=>{const ic=()=>Store.get('inputCfg',{compat:true});
  pg.append(Group(null,Row('Compatibility mode',Switch(ic().compat!==false,v=>Store.set('inputCfg',{...ic(),compat:v})),{k:'compat',desc:'Accepts finger, marker, pen and mouse. The eraser end of a pen erases. Extra touches while writing are ignored.'}),
   Row('Pen and touch test',Btn('Open',()=>{ctx.close();setTimeout(()=>window.__openInputDiag&&window.__openInputDiag(),60)}))),
   Note('Open the test on the SMART Board. It shows what the board sends to the browser. Nothing is saved or sent.'))}},
 data:{title:'Backup and restore',fn:(pg,ctx)=>{
  pg.append(Group(null,Row('Download a backup',Btn('Download',()=>{const a=h('a',{download:'classroom-backup-'+dayKey()+'.json',href:'data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(Store.exportAll()))});document.body.append(a);a.click();a.remove()}),{desc:'A copy of all settings, lists, schedules and writing.'}),
   Row('Restore from a backup',h('label',{class:'s2btn'},'Choose file',h('input',{type:'file',accept:'.json',style:'display:none',onchange:e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{Store.importAll(JSON.parse(t));toast('Restored. Reloading…');setTimeout(()=>location.reload(),800)}).catch(()=>toast('Not a valid backup'))}}))),
   Row('Storage used',null,{val:Math.round(JSON.stringify(Store.exportAll()).length/1024)+' KB'})),
   Group('Screen',Row('Reset the screen',Btn('Reset',()=>{ctx.close();resetScreen()},'dg'),{desc:'Closes open widgets. Saved data is kept.'})),
   Note('Everything is saved in this browser. When you are signed in it is also saved online.'))}}
};

/* ---------- interface options: theme, accent, size, language, labels ---------- */
cfg.ui=Object.assign({theme:'system',accent:'',size:'std',lang:'en',labels:false},cfg.ui||{});
const ACCS=['#0a84ff','#7d5cff','#1fa35b','#ff8a1f','#e5487f','#6e6e73'];
const SIZES={sm:.88,std:1,lg:1.22};
const lum=c=>{const m=/^#([0-9a-f]{6})$/i.exec(c||'');if(!m)return 0;const n=parseInt(m[1],16),f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(n>>16)+.7152*f((n>>8)&255)+.0722*f(n&255)};
const mq=window.matchMedia?matchMedia('(prefers-color-scheme: dark)'):null;
function applyUi(){const u=cfg.ui,r=document.documentElement;
  const dark=u.theme==='dark'||(u.theme==='system'&&mq&&mq.matches);r.dataset.theme=dark?'dark':'light';
  if(u.accent){r.style.setProperty('--uiac',u.accent);r.style.setProperty('--acc',u.accent);r.style.setProperty('--accfg',lum(u.accent)>.45?'#10202c':'#fff')}
  else{r.style.removeProperty('--uiac');r.style.removeProperty('--acc');r.style.removeProperty('--accfg')}
  const z=SIZES[u.size]||1;window.__uis=z;r.style.setProperty('--z',z);
  r.lang=u.lang==='yi'?'yi':u.lang==='he'?'he':'en';window.__lang=u.lang;
  try{renderToolbar()}catch(e){}
  const w=document.querySelector('.s2');if(w){w.dir=u.lang==='en'?'ltr':'rtl';xl(w)}}
if(mq&&mq.addEventListener)mq.addEventListener('change',()=>{if(cfg.ui.theme==='system')applyUi()});
const D=()=>(window.__DICT||{})[cfg.ui.lang]||null;
window.__t=s=>{const d=D();return d&&d[s]||s};
function xl(root){const d=D();if(!d)return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const ns=[];while(w.nextNode())ns.push(w.currentNode);
  const he=cfg.ui.lang==='he';ns.forEach(n=>{const t=n.nodeValue.trim();if(t&&d[t])n.nodeValue=n.nodeValue.replace(t,d[t]);else{let m=/^(\d+) shown$/.exec(t);if(m)n.nodeValue=m[1]+(he?' מוצגים':' ווייַזן זיך');else if(m=/^(\d+) names$/.exec(t))n.nodeValue=m[1]+(he?' שמות':' נעמען')}});
  root.querySelectorAll('[placeholder],[aria-label],[title]').forEach(e=>['placeholder','aria-label','title'].forEach(a=>{const v=e.getAttribute(a);if(v&&d[v])e.setAttribute(a,d[v])}))}
window.__xl=xl;
const uiSet=(k,v)=>{cfg.ui[k]=v;saveCfg();applyUi()};
const uiRows={
 lang:(ctx)=>Row('Language',Seg([['en','English'],['he','עברית'],['yi','יידיש']],cfg.ui.lang,v=>{uiSet('lang',v);ctx.re()}),{k:'lang',desc:'Settings and toolbar. Student-facing wording is under Headings and messages.'}),
 theme:()=>Row('Theme',Seg([['light','Light'],['dark','Dark'],['system','System']],cfg.ui.theme,v=>uiSet('theme',v)),{k:'theme'}),
 accent:(ctx)=>{const w=Swatches(ACCS,cfg.ui.accent||ACCS[0],v=>{uiSet('accent',v===ACCS[0]?'':v)});
  const ci=h('input',{type:'color',value:cfg.ui.accent||ACCS[0],'aria-label':'Custom color',onchange:e=>{sv(v=>uiSet('accent',v))(e.target.value);ctx.re()}});
  const cb=h('button',{class:'cust',style:'padding:0;overflow:hidden;width:28px;height:28px;border-radius:50%;border:2px solid transparent;position:relative'},ci);ci.style.cssText='position:absolute;inset:-6px;width:40px;height:40px;opacity:0;cursor:pointer';
  w.append(cb);return Row('Accent color',w,{k:'accent'})},
 size:()=>Row('Interface size',Seg([['sm','Small'],['std','Standard'],['lg','Large']],cfg.ui.size,v=>uiSet('size',v)),{k:'uisize',desc:'Larger is easier to use on a SMART Board.'}),
 labels:()=>Row('Show tool labels',Switch(cfg.ui.labels,v=>uiSet('labels',v)),{k:'toollabels',desc:'Names under the toolbar icons.'})
};

/* ---------- classroom (student-facing) language, separate from the interface language ---------- */
const PRES={
 en:{supplies:'What we need today',schedule:'Schedule',picker:"Who's next?",timer:'Timer',done:"Time's up!"},
 he:{supplies:'מה צריך להביא?',schedule:'סדר היום',picker:'מי הבא בתור?',timer:'טיימר',done:'הזמן נגמר!'},
 yi:{supplies:'וואס דארף מען האבן?',schedule:'סדר היום',picker:'ווער איז דער נעקסטער?',timer:'טיימער',done:'די צייט איז אויס!'}};
const OLDYI={timer:'טײַמער'};
cfg.ui.content=cfg.ui.content||(typeof LEGACY!=='undefined'&&LEGACY?'yi':'en');
const isPreset=(k,v,lang)=>v===PRES[lang][k]||(lang==='yi'&&OLDYI[k]===v);
function setContentLang(lang){const prev=cfg.ui.content;const L=cfg.labels;
  for(const k of Object.keys(PRES[lang])){if(!(k in L))continue;
    // only replace wording that is still the standard wording of the previous language; custom wording is kept
    if(isPreset(k,L[k],prev)||['en','he','yi'].some(g=>isPreset(k,L[k],g)&&g!==lang&&g===prev))L[k]=PRES[lang][k]}
  cfg.ui.content=lang;saveCfg()}
const resetWording=()=>{const lang=cfg.ui.content;for(const k of Object.keys(PRES[lang]))if(k in cfg.labels)cfg.labels[k]=PRES[lang][k];saveCfg()};

/* ---------- confirm and ask dialogs in the same style ---------- */
function dlg(title,{input,def,ok,okClass,cancel},cb){const sc=h('div',{class:'s2dlg',role:'alertdialog','aria-modal':'true'});
  const close=()=>{sc.remove();removeEventListener('keydown',kd,true)};const kd=e=>{if(e.key==='Escape'){e.stopPropagation();close()}if(e.key==='Enter'&&input){e.stopPropagation();go()}};
  const i=input?h('input',{value:def||'',dir:'auto','aria-label':title}):null;const go=()=>{close();cb(i?i.value:true)};
  const d=h('div',{},h('h3',{},window.__t?window.__t(title):title),i,h('div',{class:'bt'},h('button',{onclick:close},window.__t?window.__t(cancel||'Cancel'):(cancel||'Cancel')),h('button',{class:okClass||'pri',onclick:go},window.__t?window.__t(ok):ok)));
  sc.append(d);sc.addEventListener('pointerdown',e=>{if(e.target===sc)close()});if(cfg.ui.lang!=='en')d.dir='rtl';document.body.append(sc);addEventListener('keydown',kd,true);setTimeout(()=>{(i||d.querySelector('.pri,.dg')).focus();i&&i.select()},40)}
window.sure=(title,cb)=>dlg(title,{ok:'Yes',okClass:'dg'},()=>cb());
window.ask=(title,def,cb)=>dlg(title,{input:1,def,ok:'OK'},v=>cb(v));

/* ---------- widget settings sheet: same look as Settings, used by every widget gear ---------- */
window.__panel2=function(title,s,rows,change,save,PAL){
  document.querySelectorAll('.s2scrim.sh').forEach(x=>x.remove());
  const sc=h('div',{class:'s2scrim sh'}),win=h('div',{class:'s2 s2sheet',role:'dialog','aria-modal':'true','aria-label':title});sc.append(win);
  const close=()=>{sc.remove();removeEventListener('keydown',kd,true)};const kd=e=>{if(e.key==='Escape'){e.stopPropagation();close()}};addEventListener('keydown',kd,true);
  sc.addEventListener('pointerdown',e=>{if(e.target===sc)close()});
  const xb=h('button',{class:'s2x','aria-label':'Close',html:IC.x,onclick:close});
  const pg=h('div',{class:'s2pg'});win.append(h('div',{class:'s2hd'},h('h1',{},title),h('span',{class:'s2saved'}),xb),pg);
  const upd=()=>{save&&save();change&&change();flash()};const set=(k,v)=>{s[k]=v;upd()};
  let grp=[],gt=null;const flush=()=>{if(grp.length)pg.append(Group(gt,...grp));grp=[];};
  rows.forEach(r=>{
    if(r.h){flush();gt=r.h;return}
    if(r.t==='seg')grp.push(Row(r.label,Seg(r.opts,s[r.k],v=>set(r.k,v))));
    else if(r.t==='color'){const w=h('div',{class:'s2sws',style:'flex-wrap:wrap;justify-content:flex-end;max-width:300px'});(r.colors||PAL||[]).forEach(c=>w.append(h('button',{class:c===s[r.k]?'on':'','aria-label':c,style:'background:'+c,onclick:()=>{[...w.children].forEach(x=>x.classList.remove('on'));w.querySelector('[aria-label="'+c+'"]').classList.add('on');set(r.k,c)}})));grp.push(Row(r.label,w))}
    else if(r.t==='range'){const v=h('span',{style:'min-width:44px;text-align:right;font-variant-numeric:tabular-nums'},r.fmt?r.fmt(s[r.k]):s[r.k]);grp.push(Row(r.label,h('div',{style:'display:flex;gap:10px;align-items:center'},Slider(s[r.k],r.min,r.max,r.step||1,x=>{v.textContent=r.fmt?r.fmt(x):x;set(r.k,x)}),v)))}
    else if(r.t==='sw')grp.push(Row(r.label,Switch(!!s[r.k],v=>set(r.k,v))));
    else if(r.t==='text')grp.push(Row(r.label,Text(s[r.k],v=>set(r.k,v),{ph:r.ph,style:'width:220px'})));
    else if(r.t==='sel')grp.push(Row(r.label,Select(r.opts,s[r.k],v=>set(r.k,v))));
    else if(r.t==='note'){flush();gt=null;pg.append(Note(r.label))}
    else if(r.t==='el'){flush();gt=null;const c=h('div',{class:'s2leg s2card',style:'padding:6px 4px'},r.el);pg.append(h('div',{class:'s2grp'},c))}
  });flush();
  win.append(h('div',{class:'s2ft'},h('button',{class:'s2btn pri',onclick:close},window.__t?window.__t('Done'):'Done')));
  win.dir=cfg.ui.lang==='en'?'ltr':'rtl';document.body.append(sc);xl(win);setTimeout(()=>xb.focus(),30);return{close,body:pg}};

/* ---------- undo bar: ordinary removals happen at once and can be undone ---------- */
let undoT;function undoBar(msg,undo,label){document.querySelectorAll('.s2undo').forEach(x=>x.remove());clearTimeout(undoT);
  const t=window.__t||(x=>x);const b=h('div',{class:'s2undo',role:'status'},h('span',{},t(msg)),h('button',{onclick:()=>{b.remove();undo()}},t(label||'Undo')));
  if(cfg.ui.lang!=='en')b.dir='rtl';document.body.append(b);undoT=setTimeout(()=>b.remove(),label?15000:7000)}
window.__undoBar=undoBar;
const hasS=n=>typeof S!=='undefined'&&S[n];
const CATS=[
 {id:'general',name:'General',icon:'general',render:(pg,ctx)=>{const k=cfg.clock,u=()=>{saveCfg();renderClock()};
  pg.append(
   Group('Language',uiRows.lang(ctx),Row('Classroom wording',Seg([['en','English'],['he','עברית'],['yi','יידיש']],cfg.ui.content,v=>{setContentLang(v);ctx.re()}),{k:'contentlang',desc:'Standard wording on student screens. Your own edits are kept.'})),
   Group('Clock',Row('Show clock',Switch(k.visible,v=>{k.visible=v;u()}),{k:'clock'}),
    Row('Time format',Seg([['12','12-hour'],['24','24-hour']],k.hour12?'12':'24',v=>{k.hour12=v==='12';u();ctx.re()}),{k:'timefmt'}),
    Row('Date under the clock',Select([['std','Today\'s date'],['heb','Hebrew date'],['both','Both'],['none','Hide']],k.date||'heb',v=>{k.date=v;u()})),
    k.hour12?Row('Show AM/PM',Switch(k.showAmPm,v=>{k.showAmPm=v;u()})):null,
    Row('Size',Slider(k.size,3,14,.2,v=>{k.size=v;u()}),{k:'clocksize'}),
    Row('Position',Select(pos4,k.pos,v=>{k.pos=v;u()}),{k:'clockpos'}),
    Nav('Advanced appearance',()=>ctx.push(SUBS.clockAdv.title,SUBS.clockAdv.fn),{k:'hebrewloc',val:'Font, color, Hebrew date location'})),
   Group('Schedule',Row('Show 12-hour times',Switch(cfg.schedFmt.h12,v=>{cfg.schedFmt.h12=v;saveCfg()}),{k:'schedfmt'}),
    Row('School day starts',h('input',{class:'s2in',type:'time',value:cfg.teach.start,onchange:e=>sv(()=>{cfg.teach.start=e.target.value;saveCfg()})()})),
    Row('School day ends',h('input',{class:'s2in',type:'time',value:cfg.teach.end,onchange:e=>sv(()=>{cfg.teach.end=e.target.value;saveCfg()})()}))),
   Group('Text',Nav('Headings and messages',()=>ctx.push(SUBS.headings.title,SUBS.headings.fn),{k:'labels',val:'Student-facing wording'})))}},
 {id:'appearance',name:'Appearance',icon:'appearance',render:(pg,ctx)=>{const b=cfg.bg,cur=currentBg(),u=()=>{saveCfg();renderBg()};
  pg.append(Group('Interface',uiRows.theme(),uiRows.accent(ctx),uiRows.size()),Group('Background',Row('Current background',h('div',{class:'s2prev',style:`background-image:url("${cur.url}")`}),{k:'bg',go:()=>ctx.push(SUBS.gallery.title,SUBS.gallery.fn)}),
    Row('Change every day',Switch(b.auto,v=>{b.auto=v;u();ctx.re()}),{k:'daily'}),
    b.auto?Row('Use favorites only',Switch(!!b.favOnly,v=>{b.favOnly=v;u()}),{desc:'Star favorites in the gallery.'}):null,
    Row('Lock current background',Switch(!!b.lockedId,v=>{b.lockedId=v?currentBg().id:null;u()}),{desc:'Keeps this picture until unlocked.'})),
   Group('Adjust',Row('Brightness',Slider(b.brightness,.4,1.4,.05,v=>{b.brightness=v;u()}),{k:'bright'}),Row('Blur',Slider(b.blur,0,20,1,v=>{b.blur=v;u()})),Row('Dimming',Slider(b.dim,0,.8,.02,v=>{b.dim=v;u()}))))}},
 {id:'classroom',name:'Classroom',icon:'classroom',render:(pg,ctx)=>{
  pg.append(Group('People',Nav('Class lists and students',()=>ctx.push(SUBS.students.title,SUBS.students.fn),{k:'students',val:lists().reduce((a,l)=>a+l.students.length,0)+' names'})),
   Group('Daily setup',Nav('Daily schedule',()=>{schedDate=dayKey();ctx.push(SUBS.sched.title,SUBS.sched.fn)},{k:'schedule',desc:'Edit today or any other day.'}),
    Nav('Supplies',()=>ctx.push(SUBS.supplies.title,SUBS.supplies.fn),{k:'supplies'}),
    Nav('Name picker',()=>ctx.push(SUBS.picker.title,SUBS.picker.fn),{k:'picker'}),
    Nav('Behavior and stars',()=>ctx.push(SUBS.behavior.title,SUBS.behavior.fn),{k:'behavior'})))}},
 {id:'toolbar',name:'Toolbar',icon:'toolbar',render:(pg,ctx)=>{const t=cfg.toolbar,u=()=>{saveCfg();renderToolbar()};
  pg.append(Group(null,Nav('Customize tools',()=>ctx.push(SUBS.tools.title,SUBS.tools.fn),{k:'tools',val:t.order.length-t.hidden.length+' shown'}),
    Row('Position',Seg([['bottom','Bottom'],['left','Left'],['right','Right']].concat(t.pos==='top'?[['top','Top']]:[]),t.pos,v=>{t.pos=v;u();toolbarShow(true)}),{k:'toolpos'}),
    uiRows.labels(),
    Row('Button size',Slider(t.size,48,110,2,v=>{t.size=v;u()}),{k:'toolsize'}),
    Row('Transparency',Slider(t.opacity,.05,.7,.01,v=>{t.opacity=v;u()}))),
   Group('Hiding',Row('Always visible',Switch(t.pinned,v=>{t.pinned=v;saveCfg();toolbarShow(true);ctx.re()}),{k:'pin',desc:'Never hides on its own.'}),
    t.pinned?null:Row('Hide after',h('div',{style:'display:flex;gap:8px;align-items:center'},Num(t.hideSecs,v=>{t.hideSecs=v;saveCfg()},{min:2,max:60,w:70}),'seconds'))))}},
 {id:'widgets',name:'Widgets',icon:'widgets',render:(pg,ctx)=>{
  const items=[['Timer','timer',()=>ctx.push(SUBS.timer.title,SUBS.timer.fn)],['Name picker','picker',()=>ctx.push(SUBS.picker.title,SUBS.picker.fn)],['Supplies','supplies',()=>ctx.push(SUBS.supplies.title,SUBS.supplies.fn)]];
  items.push(['Behavior and stars','behavior',()=>ctx.push(SUBS.behavior.title,SUBS.behavior.fn)]);
  pg.append(Group('Classroom tools',...items.map(([n,k,f])=>Nav(n,f,{k:'w-'+k}))));
  const M=window.__more;if(M)pg.append(Group('More tools',...Object.keys(M.NAMES).map(id=>Nav(M.NAMES[id],()=>{ctx.close();try{M.FN[id]()}catch(e){}},{k:'w-'+id,val:'Open, then tap its gear'}))),Note('Each widget has its own gear on its title bar for its settings.'))}},
 {id:'materials',name:'Teaching materials',icon:'materials',render:(pg,ctx)=>{
  pg.append(Group(null,Nav('Saved links and folders',()=>ctx.push(SUBS.links.title,SUBS.links.fn),{k:'links',desc:'Library, presentations and Google Drive folders.'}),
    Nav('Google Drive connection',()=>ctx.go('account'),{k:'drive',val:'Account'})),
   Note('Whiteboard and pen options are under Advanced, Pen and touch.'))}},
 {id:'account',name:'Account',icon:'account',render:(pg,ctx)=>{
  pg.append(Group(null,Nav('Account and sync',()=>ctx.push(SUBS.account.title,SUBS.account.fn),{k:'account',desc:'Sign in, sign out, Google Drive, sync status.'}),Nav('Share ClassroomBoard',()=>ctx.push(SUBS.share.title,SUBS.share.fn),{k:'share'})))}},
 {id:'privacy',name:'Privacy & data',icon:'privacy',render:(pg,ctx)=>{
  pg.append(Group(null,Nav('Backup, restore and reset',()=>ctx.push(SUBS.data.title,SUBS.data.fn),{k:'backup',desc:'Download or restore a copy of everything.'})),
   Group('Sensitive access',Row('Microphone',null,{val:'Asked only when a widget opens',desc:'Sound level only. Nothing is recorded or sent.'}),Row('Camera',null,{val:'Asked only when Webcam opens',desc:'Stopped when the widget closes.'})),
   Note('Student names stay in your account. Demo and guest screens use made-up names.'))}},
 {id:'advanced',name:'Advanced',icon:'advanced',render:(pg,ctx)=>{
  pg.append(Group('SMART Board',Nav('Pen and touch',()=>ctx.push(SUBS.input.title,SUBS.input.fn),{k:'input',desc:'Compatibility mode and input test.'}),
    Row('Input test',Btn('Open',()=>{ctx.close();setTimeout(()=>window.__openInputDiag&&window.__openInputDiag(),60)}),{k:'diag'})),
   Group('Reset',Row('Restore default settings',Btn('Restore',()=>sure('Restore all settings to defaults? Your students, schedules and files are kept.',()=>{Store.set('cfg',{});location.reload()}),'dg'),{desc:'Only appearance and option settings.'})))}}
];
const INDEX=[
 {n:'Classroom wording',k:'student language hebrew yiddish headings',c:'general',r:'contentlang'},{n:'Language',k:'english hebrew yiddish rtl right to left',c:'general',r:'lang'},{n:'Theme',k:'light dark system night mode',c:'appearance',r:'theme'},{n:'Accent color',k:'blue colour custom',c:'appearance',r:'accent'},{n:'Interface size',k:'large small bigger text smart board',c:'appearance',r:'uisize'},{n:'Tool labels',k:'names under icons toolbar text',c:'toolbar',r:'toollabels'},
 {n:'Show clock',k:'time hide',c:'general',r:'clock'},{n:'Time format',k:'12 24 hour am pm',c:'general',r:'timefmt'},{n:'Clock size and position',k:'big small corner',c:'general',r:'clocksize'},
 {n:'Hebrew date location',k:'sunset zone latitude hebrew calendar',c:'general',s:'clockAdv'},{n:'Clock font and color',k:'transparency',c:'general',s:'clockAdv'},
 {n:'Schedule time format',k:'12-hour schedule',c:'general',r:'schedfmt'},{n:'Headings and messages',k:'labels text heading timer finished yiddish hebrew wording',c:'general',s:'headings'},
 {n:'Background',k:'picture photo wallpaper gallery upload',c:'appearance',r:'bg'},{n:'Change background daily',k:'rotate favorite',c:'appearance',r:'daily'},{n:'Brightness, blur and dimming',k:'dark light',c:'appearance',r:'bright'},
 {n:'Students and class lists',k:'names present absent roster',c:'classroom',r:'students'},{n:'Daily schedule',k:'lessons activities template times edit',c:'classroom',r:'schedule'},{n:'Supplies',k:'books materials',c:'classroom',r:'supplies'},{n:'Name picker',k:'random choose',c:'classroom',r:'picker'},{n:'Behavior and stars',k:'rewards marks',c:'classroom',r:'behavior'},
 {n:'Behavior and stars',k:'marks colors rewards star sparkle reset daily',c:'classroom',r:'behavior'},{n:'Customize tools',k:'order visible toolbar buttons reorder',c:'toolbar',s:'tools'},{n:'Toolbar position and size',k:'bottom top',c:'toolbar',r:'toolpos'},{n:'Hide toolbar automatically',k:'pin auto hide',c:'toolbar',r:'pin'},
 {n:'Timer settings',k:'sound alarm minutes countdown',c:'widgets',r:'w-timer'},{n:'Sound level',k:'noise microphone meter',c:'widgets',r:'w-sound'},{n:'Traffic light',k:'red green yellow',c:'widgets',r:'w-traffic'},{n:'Calendar',k:'hebrew holidays',c:'widgets',r:'w-calendar'},
 {n:'Saved links and folders',k:'library presentations drive',c:'materials',r:'links'},{n:'Google Drive',k:'connect folder',c:'materials',r:'drive'},
 {n:'Account and sync',k:'sign in out google email cloud',c:'account',r:'account'},{n:'Share ClassroomBoard',k:'link qr phone',c:'account',r:'share'},
 {n:'Backup and restore',k:'export download delete data',c:'privacy',r:'backup'},{n:'Microphone and camera',k:'permissions privacy',c:'privacy'},
 {n:'SMART Board pen and touch',k:'marker finger compatibility eraser',c:'advanced',r:'input'},{n:'Input test',k:'diagnostic pointer touch pen',c:'advanced',r:'diag'},{n:'Restore default settings',k:'reset',c:'advanced'}
];
applyUi();window.__applyUi=applyUi;
window.scheduleEditor=d=>{schedDate=d||dayKey();openSettings2('schedule')};window.scheduleMenu=window.scheduleEditor;window.pickDup=window.pickTmpl=window.scheduleArchive=window.scheduleEditor;
window.openSettings=openSettings2;
if(window.__sc)window.__sc.openSettings=openSettings2;

addEventListener('load',()=>setTimeout(()=>{try{const C=window.Cloud;if(!C||!C.user||!C.guestBackupInfo)return;if(C.guestBackupInfo().count&&!sessionStorage.getItem('scGbNote')){sessionStorage.setItem('scGbNote','1');undoBar('Signed in. Your account\'s classroom was kept, and your guest setup is saved.',()=>openSettings2('account'),'Review')}}catch(e){}},5000));
window.__openSettings2=openSettings2;window.__addStudents=()=>openSettings2('classroom','students');
})();
