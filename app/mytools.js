/* My Tools: small teacher-made tools built from a template (word reveal / flashcards).
   Built by Ask the Board, saved in the Library under "My Tools", can be pinned to the toolbar.
   A tool is only plain settings (name, words, seconds). Nothing else about the class is stored in it. */
(function(){
const S=window.__sc;if(!S)return;
const {Store,Widgets,cfg}=S;
const h=(t,a,...k)=>{const e=document.createElement(t);for(const x in a||{})x==='class'?e.className=a[x]:x==='style'?e.style.cssText=a[x]:x.startsWith('on')?e[x]=a[x]:e.setAttribute(x,a[x]);k.flat().forEach(c=>c!=null&&e.append(c.nodeType?c:document.createTextNode(c)));return e};
const st=document.createElement('style');st.textContent=`
.mtw{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:6px 8px 10px;min-height:230px;text-align:center}
.mtw .mt-n{font-size:15px;opacity:.7}
.mtw .mt-big{font-weight:700;line-height:1.15;word-break:break-word;max-width:100%}
.mtw .mt-cd{font-size:84px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1}
.mtw .mt-bar{height:8px;border-radius:4px;background:rgba(255,255,255,.2);width:80%;overflow:hidden}
.mtw .mt-bar i{display:block;height:100%;background:#7fd1ff;width:100%}
.mtw .mt-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.mtw button{font:inherit;font-weight:600;font-size:18px;min-height:48px;padding:0 20px;border-radius:14px;border:0;background:rgba(255,255,255,.2);color:#fff;cursor:pointer}
.mtw button.go{background:#6858f8}
.mtw textarea,.mtw input{font:inherit;font-size:18px;padding:10px;border-radius:12px;border:0;width:100%;box-sizing:border-box;color:#111}
.mtw textarea{min-height:130px}
.mtw label{font-size:14px;opacity:.8;align-self:flex-start}
.mtsec .mtrow{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0;padding:8px 10px;border-radius:12px;background:rgba(127,127,127,.12)}
.mtsec .mtrow b{flex:1;min-width:120px}
`;document.head.append(st);

/* ---------- storage ---------- */
const KEY='myTools';
const all=()=>Store.get(KEY,[]);
const save=L=>Store.set(KEY,L);
const uid=()=>Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-3);
const tid=s=>'mt_'+s.id;
function register(){for(const s of all())S.TOOLS[tid(s)]=s.name||'My tool'}
register();

/* ---------- parsing ---------- */
const splitList=t=>t.split(/\n|,|;|،|\u05C3/).map(x=>x.trim()).filter(Boolean);
function parseItems(t){return splitList(t).map(x=>{const m=x.split(/\s*(?:=|→|->|=>)\s*/);return m.length>1?{q:m[0],a:m.slice(1).join(' = ')}:{a:x}}).slice(0,200)}
function listFrom(raw){
  let m=raw.match(/(?:new list|different list|replace (?:the )?(?:list|words)|the (?:list|words) (?:are|is)|words|list|vocabulary|vocab)\s*(?:are|is)?\s*[:\-]\s*([\s\S]+)$/i);
  if(m)return parseItems(m[1]);
  m=raw.match(/\b(?:with|using|use|words?|list)\s+(?:the\s+)?(?:words?\s+)?([^\n]*(?:,|\n)[\s\S]*)$/i);
  if(m)return parseItems(m[1]);
  if(/\n/.test(raw.trim())){const ls=raw.trim().split('\n');if(ls.length>=3){const first=ls[0];const body=ls.slice(1).join('\n');if(/[a-z]{3}/i.test(first)&&first.split(/\s+/).length>3)return parseItems(body)}}
  return null}
const secsFrom=t=>{let m=t.match(/(\d+(?:\.\d+)?)\s*(?:seconds?|secs?|s)\b/i);if(m)return Math.round(+m[1]);m=t.match(/(\d+)\s*(?:minutes?|mins?)\b/i);if(m)return +m[1]*60;return null};
function wantsBuild(t){return /\b(make me|build me|create (?:me )?an?|i (?:wish|want|need) (?:a|an)|can you (?:build|make|create)|build an?|make an?|new tool)\b/i.test(t)||/\b(spelling (?:game|test|quiz)|word game|flash ?cards?|vocab(?:ulary)? (?:game|quiz|test)|dictation|quiz game)\b/i.test(t)}
function parseBuild(raw){
  if(!wantsBuild(raw))return null;
  const t=raw.toLowerCase();
  if(!/\b(spell|spelling|word|words|vocab|vocabulary|dictation|flash ?cards?|quiz|reveal|memor|terms?|definitions?|practice list)\b/.test(t))return {unsupported:true};
  const items=listFrom(raw)||[];
  const flash=/flash ?cards?|definitions?|terms?|quiz/.test(t)&&!/spell/.test(t);
  const secs=secsFrom(raw);
  const s={id:uid(),type:'wordreveal',name:flash?'Flashcards':/spell/.test(t)?'Spelling game':'Word game',items,secs:secs||(flash?10:20),size:1,shuffle:/shuffle|random order|mixed up/.test(t),showFirst:flash||/show the word|see the word/.test(t)&&!/(don.?t|not|hide) show/.test(t),autoNext:0,created:Date.now()};
  const nm=raw.match(/\b(?:call it|named|name it)\s+["“]?([^"”,.\n]{2,40})/i);if(nm)s.name=nm[1].trim();
  return s}
/* refine an open draft. returns list of notes, mutates spec */
function refine(raw,s){
  const t=raw.toLowerCase().replace(/[“”"']/g,'').trim();const notes=[];let hit=false;
  const L=listFrom(raw);
  if(/\b(add)\b/.test(t)&&/[:]/.test(raw)){const m=raw.match(/\badd\b[^:]*:\s*([\s\S]+)$/i);if(m){const it=parseItems(m[1]);s.items=s.items.concat(it);notes.push('Added '+it.length+(it.length===1?' word':' words'));hit=true}}
  else if(L&&L.length&&/\b(new|different|replace|list|words)\b/.test(t)){s.items=L;notes.push('New list: '+L.length+(L.length===1?' word':' words'));hit=true}
  const sc=secsFrom(raw);
  if(sc&&!/\b(add|list|words)\s*:/.test(t)){s.secs=Math.max(3,Math.min(600,sc));notes.push(s.secs+' seconds');hit=true}
  if(/\b(bigger|larger|enlarge|increase)\b/.test(t)&&/\b(word|words|text|letters|font|writing|it)\b/.test(t)){s.size=Math.min(3,+(s.size*1.3).toFixed(2));notes.push('Bigger words');hit=true}
  else if(/\b(smaller|reduce|decrease)\b/.test(t)&&/\b(word|words|text|letters|font|writing|it)\b/.test(t)){s.size=Math.max(.5,+(s.size/1.3).toFixed(2));notes.push('Smaller words');hit=true}
  if(/\b(shuffle|random order|mix them|mixed up|randomi[sz]e)\b/.test(t)&&!/\b(dont|do not|no|stop|without)\b/.test(t)){s.shuffle=true;notes.push('Random order');hit=true}
  else if(/\b(in order|dont shuffle|do not shuffle|no shuffle|same order|stop shuffling)\b/.test(t)){s.shuffle=false;notes.push('In list order');hit=true}
  if(/\b(show|see|display)\b.*\b(word|it)\b.*\b(while|during|first|at the start|before)\b|\blet them see\b/.test(t)){s.showFirst=true;notes.push('The word shows while the time runs');hit=true}
  else if(/\b(hide|dont show|do not show|keep)\b.*\b(word|it)\b.*\b(hidden|until|secret|then|while|during)\b|\bhide the word\b|\breveal (it )?(at the end|after)\b/.test(t)){s.showFirst=false;notes.push('The word is hidden until the reveal');hit=true}
  let m=t.match(/\b(?:auto(?:matically)?[ -]?(?:next|advance|move on)|(?:next|move on)(?: word)? automatically)(?: after (\d+))?/);
  if(m){s.autoNext=+m[1]||5;notes.push('Next word starts automatically '+s.autoNext+' seconds after the reveal');hit=true}
  else if(/\b(no auto|stop auto|manual|dont (?:go|move) (?:on )?automatically)\b/.test(t)){s.autoNext=0;notes.push('Next word waits for a tap');hit=true}
  m=raw.match(/\b(?:call it|rename (?:it )?(?:to)?|name it)\s+["“]?([^"”,.\n]{2,40})/i);if(m){s.name=m[1].trim();notes.push('Named '+s.name);hit=true}
  return hit?notes:null}

/* ---------- the widget ---------- */
const live={};
function beep(){try{if(cfg.timer&&cfg.timer.mute)return;const A=S.Audio_;A.unlock();const c=A.ctx;if(!c)return;const o=c.createOscillator(),g=c.createGain();o.frequency.value=880;g.gain.setValueAtTime(.18,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.5);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+.55)}catch(e){}}
function openTool(spec,opt){opt=opt||{};const id=tid(spec);
  if(live[id]){live[id].set(spec);Widgets.raise(id);return}
  let cur=spec,idx=0,phase='idle',endAt=0,iv=null,order=[],editing=false,revAt=0;
  const mk=()=>{order=cur.items.map((_,i)=>i);if(cur.shuffle)for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}};mk();
  const inst=Widgets.create(id,cur.name||'My tool',{x:Math.max(20,innerWidth/2-290),y:100,w:580,settings:()=>{editing=!editing;draw()},onclose:()=>{clearInterval(iv);delete live[id]}});
  inst.el.querySelector('.wt').textContent=cur.name||'My tool';
  const body=inst.body;body.style.direction='ltr';
  const item=()=>cur.items[order[idx]];
  const stop=()=>{clearInterval(iv);iv=null};
  const startRun=()=>{stop();phase='run';endAt=Date.now()+cur.secs*1000;iv=setInterval(tick,200);draw()};
  const reveal=()=>{stop();phase='reveal';beep();if(cur.autoNext>0&&idx<order.length-1){revAt=Date.now()+cur.autoNext*1000;iv=setInterval(tick,200)}draw()};
  const next=()=>{if(idx<order.length-1){idx++;startRun()}else{stop();phase='done';draw()}};
  function tick(){if(phase==='run'){if(Date.now()>=endAt)reveal();else paintCd()}else if(phase==='reveal'&&revAt&&Date.now()>=revAt){revAt=0;next()}}
  let cdEl=null,barEl=null;
  const paintCd=()=>{if(!cdEl)return;const left=Math.max(0,endAt-Date.now());cdEl.textContent=Math.ceil(left/1000);if(barEl)barEl.firstChild.style.width=(left/(cur.secs*1000)*100)+'%'};
  function draw(){body.innerHTML='';cdEl=barEl=null;const w=h('div',{class:'mtw'});const fs=Math.round(64*(cur.size||1));
    if(editing){const ta=h('textarea',{dir:'auto','aria-label':'Words, one per line'});ta.value=cur.items.map(x=>x.q?x.q+' = '+x.a:x.a).join('\n');
      const sec=h('input',{type:'number',min:'3',max:'600',value:String(cur.secs)});
      w.append(h('label',{},'Words, one per line (use "question = answer" for flashcards)'),ta,h('label',{},'Seconds per word'),sec,
        h('div',{class:'mt-row'},h('button',{class:'go',onclick:()=>{cur.items=parseItems(ta.value.replace(/\n/g,','));cur.secs=Math.max(3,Math.min(600,+sec.value||cur.secs));editing=false;idx=0;phase='idle';stop();mk();commit();draw()}},'Save'),h('button',{onclick:()=>{editing=false;draw()}},'Cancel')));body.append(w);return}
    if(!cur.items.length){w.append(h('div',{class:'mt-big',style:'font-size:30px'},'No words yet'),h('div',{class:'mt-n'},'Tap the gear to add words, or tell Ask the Board "new list: ..."'),h('button',{class:'go',onclick:()=>{editing=true;draw()}},'Add words'));body.append(w);return}
    const it=item();w.append(h('div',{class:'mt-n'},phase==='done'?'Finished':'Word '+(idx+1)+' of '+order.length));
    if(phase==='idle'){w.append(h('div',{class:'mt-big',style:'font-size:'+Math.round(fs*.7)+'px'},'Ready'),h('div',{class:'mt-row'},h('button',{class:'go',onclick:startRun},'Start')))}
    else if(phase==='run'){cdEl=h('div',{class:'mt-cd'},String(cur.secs));barEl=h('div',{class:'mt-bar'},h('i',{}));w.append(cdEl,barEl);
      w.append(h('div',{class:'mt-big',dir:'auto',style:'font-size:'+fs+'px'},cur.showFirst?(it.q||it.a):(it.q||'Write the word')),h('div',{class:'mt-row'},h('button',{onclick:reveal},'Reveal now')));paintCd()}
    else if(phase==='reveal'){w.append(h('div',{class:'mt-big',dir:'auto',style:'font-size:'+fs+'px;color:#9be7a8'},it.a),h('div',{class:'mt-row'},idx<order.length-1?h('button',{class:'go',onclick:()=>{revAt=0;next()}},'Next word'):h('button',{class:'go',onclick:next},'Finish')))}
    else{w.append(h('div',{class:'mt-big',style:'font-size:'+fs+'px'},'All done'),h('div',{class:'mt-row'},h('button',{class:'go',onclick:()=>{mk();idx=0;phase='idle';draw()}},'Start again')))}
    body.append(w)}
  const commit=()=>{if(opt.onChange)opt.onChange(cur);const L=all();const i=L.findIndex(x=>x.id===cur.id);if(i>=0){L[i]=Object.assign({},cur);save(L)}};
  live[id]={set(s){const was=item();cur=s;inst.el.querySelector('.wt').textContent=cur.name||'My tool';const cnt=order.length;mk();if(idx>=order.length)idx=Math.max(0,order.length-1);if(phase==='run')endAt=Math.min(endAt,Date.now()+cur.secs*1000);draw()}};
  draw()}
const closeTool=s=>{const id=tid(s);if(Widgets.open[id])Widgets.close(id)};

/* ---------- save / pin / delete ---------- */
function saveTool(s){const L=all();const c=Object.assign({},s);const i=L.findIndex(x=>x.id===c.id);if(i>=0){c.pinned=L[i].pinned;L[i]=c}else L.push(c);save(L);register();return c}
function setPinned(s,on){const L=all();const i=L.findIndex(x=>x.id===s.id);if(i<0)return false;L[i].pinned=on;save(L);register();const t=cfg.toolbar,id=tid(s);
  if(on){if(!t.order.includes(id)){const k=t.order.indexOf('ask');t.order.splice(k<0?t.order.length:k,0,id)}t.hidden=(t.hidden||[]).filter(x=>x!==id)}
  else{t.order=t.order.filter(x=>x!==id);t.hidden=(t.hidden||[]).filter(x=>x!==id)}
  S.saveCfg();S.renderToolbar();return true}
function remove(s){closeTool(s);setPinned(s,false);save(all().filter(x=>x.id!==s.id));delete S.TOOLS[tid(s)]}
const find=name=>{const n=name.toLowerCase().trim();return all().find(x=>(x.name||'').toLowerCase()===n)||all().find(x=>n&&(x.name||'').toLowerCase().includes(n))};

/* ---------- Library section ---------- */
function section(closeLib){const L=all();if(!L.length)return null;
  const box=h('div',{class:'mtsec'},h('div',{class:'lbl'},'My Tools'));
  const draw=()=>{[...box.querySelectorAll('.mtrow')].forEach(x=>x.remove());all().forEach(s=>{
    const row=h('div',{class:'mtrow'},h('b',{dir:'auto'},s.name||'My tool'),
      h('button',{class:'dpill',onclick:()=>{closeLib&&closeLib();openTool(s)}},'Open'),
      h('button',{class:'dpill',onclick:()=>{closeLib&&closeLib();if(window.AskBoard)AskBoard.editTool(s)}},'Edit'),
      h('button',{class:'dpill',onclick:()=>{setPinned(s,!s.pinned);draw()}},s.pinned?'Unpin from toolbar':'Pin to toolbar'),
      h('button',{class:'dpill',onclick:()=>{if(confirm('Delete "'+(s.name||'this tool')+'"?')){remove(s);draw();if(!all().length)box.remove()}}},'Delete'));box.append(row)})};
  draw();return box}

/* ---------- developer inbox (feature requests) ---------- */
const INBOX='askInbox';
async function flush(){const C=window.Cloud;if(!C||!C.user||!C.sendFeatureRequest)return 0;const L=Store.get(INBOX,[]);let n=0;
  for(const r of L){if(r.sent)continue;try{await C.sendFeatureRequest(r);r.sent=true;n++}catch(e){break}}
  if(n)Store.set(INBOX,L);return n}
async function request(text,why){const L=Store.get(INBOX,[]);L.push({text:String(text).slice(0,600),why:String(why||'').slice(0,600),at:new Date().toISOString(),sent:false});Store.set(INBOX,L);
  const C=window.Cloud;if(!C||!C.user)return 'saved';const n=await flush();return n?'sent':'saved'}

if(all().some(x=>x.pinned))S.renderToolbar();setTimeout(()=>{try{flush()}catch(e){}},4000);
window.MyTools={parseBuild,refine,openTool,closeTool,open:id=>{const s=all().find(x=>x.id===id);if(s)openTool(s)},saveTool,setPinned,remove,section,find,all,request,flush,tid};
})();
