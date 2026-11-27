/* First visit: one optional, skippable card. New users only. */
(function(){
if(window.__demo||window.__legacy)return;
cfg.room=cfg.room||{name:''};
const nameEl=document.createElement('div');nameEl.id='roomname';document.body.appendChild(nameEl);
window.renderRoomName=()=>{nameEl.textContent=(cfg.room&&cfg.room.name)||''};renderRoomName();
const st=document.createElement('style');st.textContent=`
#roomname{position:fixed;top:var(--edge,22px);left:var(--edge,22px);z-index:5;pointer-events:none;color:var(--fg,#fff);font:600 clamp(18px,2.4vw,34px)/1.1 -apple-system,"SF Pro Display",Inter,system-ui,sans-serif;text-shadow:0 2px 18px rgba(0,0,0,.45);max-width:40vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#roomname:empty{display:none}
body.v-phone #roomname{display:none}
#welcome{position:fixed;inset:0;z-index:60;display:flex;align-items:flex-start;justify-content:center;padding-top:12vh;pointer-events:none}
#welcome .wc{pointer-events:auto;width:min(92vw,520px);background:rgba(250,250,252,.95);color:#1c1c1e;border-radius:20px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.35);-webkit-backdrop-filter:blur(30px);backdrop-filter:blur(30px);font:15px/1.4 -apple-system,Inter,system-ui,sans-serif}
#welcome h2{margin:0 0 6px;font-size:22px}#welcome p{margin:0 0 16px;color:#555}
#welcome .wb{display:flex;gap:10px;justify-content:flex-end;align-items:center;margin-top:18px}
#welcome button{font:inherit;font-weight:600;height:40px;padding:0 18px;border-radius:11px;border:0;background:#ececf0;color:#1c1c1e;cursor:pointer}
#welcome button.pri{background:var(--ac,#6858f8);color:#fff}
#welcome button.lk{background:none;color:#555;font-weight:500;padding:0 8px;margin-right:auto}
#welcome input{width:100%;box-sizing:border-box;height:44px;border-radius:11px;border:1.5px solid #c9c9d0;padding:0 12px;font:inherit;font-size:17px}
#welcome .ph{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
#welcome .ph button{height:64px;padding:0;background-size:cover;background-position:center;border:3px solid transparent;border-radius:12px}
#welcome .ph button.on{border-color:var(--ac,#6858f8)}
#welcome .ch{display:flex;flex-wrap:wrap;gap:8px}
#welcome .ch button{background:#fff;border:1.5px solid #c9c9d0;height:38px}
#welcome .ch button.on{background:var(--ac,#6858f8);border-color:var(--ac,#6858f8);color:#fff}
#welcome .dots{font-size:12px;color:#888;margin-bottom:8px}`;
document.head.appendChild(st);
if(Store.get('cust.setup',false))return;
const h2=(t,a,...k)=>{const e=document.createElement(t);for(const[x,v]of Object.entries(a||{}))x==='class'?e.className=v:x.startsWith('on')?e[x]=v:e.setAttribute(x,v);k.flat().forEach(c=>e.append(c));return e};
const PH=[['n3','Turquoise lake'],['n8','Mountain reflection'],['n9','Snowy mountains'],['n2','Misty golden morning'],['n1','Waterfall in autumn'],['n4','Foggy pines']];
const ACT=[['Keeping time',['timer']],['Calling on students',['picker']],['Quiet work',['sound','traffic']],['Explaining on the board',['whiteboard','text']],['Group work',['wheel']],['Daily routine',['schedule']]];
const picked=new Set();let step=0;
const root=h2('div',{id:'welcome',role:'dialog','aria-modal':'false','aria-label':'Make it yours'});document.body.appendChild(root);
function finish(msg){Store.set('welcome.done',true);saveCfg();root.remove();document.removeEventListener('keydown',esc);if(msg)toast(msg)}
function esc(e){if(e.key==='Escape')finish()}
document.addEventListener('keydown',esc);
function applyTools(){if(!picked.size)return;const ids=[];ACT.forEach(([n,t])=>{if(picked.has(n))t.forEach(x=>{if(!ids.includes(x))ids.push(x)})});
 const keep=[...ids,'more','settings'];const t=cfg.toolbar;const rest=t.order.filter(x=>!keep.includes(x));t.order=[...keep,...rest];t.hidden=rest.slice();renderToolbar();toolbarShow(true)}
function view(){root.innerHTML='';const c=h2('div',{class:'wc'});root.append(c);const dots=step>0?h2('div',{class:'dots'},'Step '+step+' of 3'):null;if(dots)c.append(dots);
 const foot=(next,nextLabel,back)=>{const b=h2('div',{class:'wb'});if(back)b.append(h2('button',{class:'lk',onclick:()=>{step--;view()}},'Back'));b.append(h2('button',{class:'lk',style:back?'margin-right:0':'',onclick:()=>{step++;view()}},'Skip'),h2('button',{class:'pri',onclick:next},nextLabel));c.append(b)};
 if(step===0){c.append(h2('h2',{},'This is your classroom.'),h2('p',{},'Everything works right now. Want to make it yours? It takes about a minute.'));
  const b=h2('div',{class:'wb'},h2('button',{onclick:()=>finish()},'Just start teaching'),h2('button',{class:'pri',onclick:()=>{finish();setTimeout(()=>{window.__custEnter&&window.__custEnter()},200)}},'Make it mine'));c.append(b)}
 else if(step===1){c.append(h2('h2',{},'What do your students call this room?'));const i=h2('input',{type:'text',maxlength:'40',placeholder:'For example: Room 14',value:cfg.room.name||'','aria-label':'Classroom name'});i.oninput=()=>{cfg.room.name=i.value.trim();renderRoomName()};i.onkeydown=e=>{if(e.key==='Enter'){step=2;view()}};c.append(i,h2('p',{style:'margin:8px 0 0;font-size:13px'},'Optional. Shown on your board, saved on this computer only.'));foot(()=>{step=2;view()},'Next',false);setTimeout(()=>i.focus(),50)}
 else if(step===2){c.append(h2('h2',{},'Pick the view from your window.'),h2('p',{},'Tap one and watch your board change.'));const g=h2('div',{class:'ph'});PH.forEach(([id,n])=>{const b=h2('button',{'aria-label':n,title:n,style:`background-image:url(bg/${id}.jpg)`,onclick:()=>{cfg.bg.manualId=id;cfg.bg.manualDay=dayKey();cfg.bg.auto=false;renderBg();g.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on')}});if(cfg.bg.manualId===id)b.classList.add('on');g.append(b)});c.append(g);foot(()=>{step=3;view()},'Next',true)}
 else{c.append(h2('h2',{},'What happens in your room most?'),h2('p',{},'We will put those tools within reach. You can change this any time in Settings.'));const g=h2('div',{class:'ch'});ACT.forEach(([n])=>{const b=h2('button',{'aria-pressed':picked.has(n)?'true':'false',onclick:()=>{picked.has(n)?picked.delete(n):picked.add(n);b.classList.toggle('on',picked.has(n));b.setAttribute('aria-pressed',picked.has(n));applyTools()}});b.textContent=n;if(picked.has(n))b.classList.add('on');g.append(b)});c.append(g);
  const b=h2('div',{class:'wb'},h2('button',{class:'lk',onclick:()=>{step=2;view()}},'Back'),h2('button',{class:'pri',onclick:()=>finish('Saved on this computer. Sign in any time to keep it on all your devices.')},'Done'));c.append(b)}}
setTimeout(()=>{finish();window.__custEnter&&window.__custEnter()},900);
})();
