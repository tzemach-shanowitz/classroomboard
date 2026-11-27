/* ClassroomBoard Remote (board side). New accounts only.
   Pairing: 6-digit code + QR (same signaling as screen share), then the teacher taps Allow on the board.
   After that, taps travel phone -> board over a direct WebRTC data channel. Nothing is stored per tap. */
(function(){
const RB=location.hostname==='classroomboard.web.app'?'':'https://classroomboard.web.app';
if(window.__demo||window.__legacy)return;
const LS=localStorage;
const ICE={iceServers:[{urls:'stun:stun.l.google.com:19302'}]};
let R=null,ui=null,conn=null,lastJson='',lastSend=0,tick=null,msgText='',pairing=null;
let ap=[];try{ap=JSON.parse(LS.getItem('rem.ap')||'[]')}catch(e){}
const saveAp=()=>LS.setItem('rem.ap',JSON.stringify(ap));
const watchers={};
const el=(t,a={},...k)=>{const e=document.createElement(t);for(const x in a){if(x==='style')e.style.cssText=a[x];else if(x.startsWith('on'))e[x]=a[x];else e.setAttribute(x,a[x])}k.forEach(c=>c!=null&&e.append(c));return e};
const load=()=>window.RemSig?Promise.resolve(window.RemSig):new Promise((ok,no)=>{const s=document.createElement('script');s.src=RB+'/cast-lib/rem.js';s.onload=()=>ok(window.RemSig);s.onerror=()=>no(new Error('Could not load the remote'));document.head.appendChild(s)});
const boardName=()=>((document.getElementById('roomname')||{}).textContent||'').trim()||'ClassroomBoard';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const rnd=n=>{const a=new Uint8Array(n),A='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';crypto.getRandomValues(a);return Array.from(a,x=>A[x%A.length]).join('')};
async function gather(pc){if(pc.iceGatheringState==='complete')return;await new Promise(r=>{const f=()=>{if(pc.iceGatheringState==='complete'){pc.removeEventListener('icegatheringstatechange',f);r()}};pc.addEventListener('icegatheringstatechange',f);setTimeout(r,3500)})}

/* ---------- button + styles ---------- */
const css=el('style');css.textContent=`#rembtn{position:fixed;right:16px;bottom:24px;z-index:6;border:0;cursor:pointer;display:flex;gap:8px;align-items:center;font:600 15px -apple-system,Inter,system-ui,sans-serif;color:#222;background:rgba(255,255,255,.92);border-radius:24px;padding:11px 16px;box-shadow:0 6px 20px rgba(0,0,0,.25)}
#rembtn.on{background:#6858f8;color:#fff}#rembtn:not(.on){display:none!important}#rembtn svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
body.wbmode #rembtn,body.editing #rembtn{display:none!important}@media(max-width:700px){#rembtn{display:none}}
#remdlg{position:fixed;inset:0;z-index:99990;background:rgba(15,15,30,.55);display:flex;align-items:center;justify-content:center;font-family:-apple-system,Inter,system-ui,sans-serif}
#remdlg .c{background:#fff;color:#1d1d24;border-radius:24px;padding:28px 32px;width:min(460px,92vw);text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.4)}
#remdlg h2{margin:0 0 6px;font-size:26px}#remdlg p{margin:6px 0;color:#666;font-size:16px}
#remdlg .dg{font:700 56px ui-rounded,-apple-system,system-ui,sans-serif;letter-spacing:.12em;margin:8px 0;font-variant-numeric:tabular-nums}
#remdlg img{width:200px;height:200px;border-radius:12px;border:1px solid #eee}
#remdlg button,#remsheet button{font:600 16px -apple-system,Inter,system-ui,sans-serif;border:0;border-radius:14px;padding:12px 20px;margin:8px 4px 0;cursor:pointer;background:#ececf0;color:#222}
#remdlg button.p,#remsheet button.p{background:#6858f8;color:#fff}#remdlg button.r{background:#fde8e8;color:#b42318}
#remdlg .ok{display:inline-block;background:#e6f6ec;color:#17692f;border-radius:20px;padding:6px 14px;font-weight:600}
#remsheet{position:fixed;inset:0;z-index:99995;background:#f5f5f7;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:24px;text-align:center;font-family:-apple-system,Inter,system-ui,sans-serif;color:#1d1d24}
#remsheet h1{margin:0;font-size:26px}#remsheet p{margin:0 0 8px;color:#666}#remsheet button{width:min(340px,90vw);padding:18px;font-size:18px;margin:0}`;
document.head.appendChild(css);
const btn=el('button',{id:'rembtn',type:'button',onclick:()=>openPair()});document.body.appendChild(btn);
const ICON='<svg viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/></svg>';
function sync(){const on=conn&&conn.open;btn.className=on?'on':'';btn.innerHTML=ICON+'<span>'+(on?'Phone connected':'Connect phone')+'</span>'}
sync();window.openRemotePair=()=>openPair();
try{const M=window.__more;if(M&&!M.NEW.includes('remote')){M.NEW.push('remote');M.NAMES.remote='Phone remote';M.EMO.remote='📱';M.FN.remote=()=>openPair()}}catch(e){}

/* ---------- opening the site on a phone ---------- */
if(innerWidth<=700&&matchMedia('(pointer:coarse)').matches&&!sessionStorage.getItem('rem.choice')){
  const sh=el('div',{id:'remsheet'},el('h1',{},'ClassroomBoard'),el('p',{},'Use this phone as a remote for the board, or open the classroom here.'),
    el('button',{class:'p',onclick:()=>{location.href=RB+'/remote/'}},'Use as a remote'),
    el('button',{onclick:()=>{sessionStorage.setItem('rem.choice','1');sh.remove()}},'Open the classroom anyway'));
  document.body.appendChild(sh)}

/* ---------- dialog ---------- */
function closeUI(){if(ui){ui.remove();ui=null}}
function cancelPairing(){if(pairing){try{pairing.pc.close()}catch(e){}R&&R.end(pairing.code);if(pairing.un)pairing.un();pairing=null}}
async function openPair(){
  if(ui)return;
  ui=el('div',{id:'remdlg',onclick:e=>{if(e.target===ui)done()}});const card=el('div',{class:'c'});ui.append(card);document.body.appendChild(ui);ui._card=card;
  if(conn&&conn.open){drawConnected();return}
  card.append(el('p',{},'Getting a code...'));
  try{R=await load();await startPairing()}catch(e){card.innerHTML='';card.append(el('h2',{},'Could not connect'),el('p',{},String(e.message||e)),el('div',{},el('button',{onclick:done},'Close')))}}
function done(){cancelPairing();closeUI()}
function drawConnected(){const card=ui&&ui._card;if(!card)return;card.innerHTML='';
  card.append(el('h2',{},'Phone connected'),el('div',{class:'ok'},'Connected'),el('p',{},(conn&&conn.name)||'Phone'),el('p',{},'It controls this board only. You can close this window.'),
    el('div',{},el('button',{class:'r',onclick:disconnectAll},'Disconnect phone'),el('button',{class:'p',onclick:done},'Done')))}
async function startPairing(){
  const card=ui._card;const pc=new RTCPeerConnection(ICE);const dc=pc.createDataChannel('cmd');
  await pc.setLocalDescription(await pc.createOffer());await gather(pc);
  const code=await R.create(JSON.stringify(pc.localDescription));
  pairing={pc,code,dc};
  const url=(RB||location.origin)+'/remote/?c='+code;const qr=await R.qr(url);
  card.innerHTML='';
  card.append(el('h2',{},'Connect your phone'),el('p',{},'Scan with your phone camera, or open '+(RB?'classroomboard.web.app':location.host)+'/remote and type the code.'),(curUid()?el('p',{style:'color:#17692f;font-weight:600'},'Signed in on your phone too? Just open '+location.host+'/remote. No code needed.'):null),el('img',{src:qr,alt:'QR code to open the remote'}),el('div',{class:'dg'},code.slice(0,3)+' '+code.slice(3)),el('p',{id:'remst'},'Waiting for your phone...'),el('div',{},el('button',{onclick:done},'Cancel')));
  let asked=false;
  pairing.un=R.watch(code,d=>{
    if(!d||!d.answer||asked)return;asked=true;
    card.innerHTML='';
    card.append(el('h2',{},'Allow this phone?'),el('p',{},(d.name||'A phone')+' wants to control this board. Only allow it if it is yours.'),
      el('div',{},el('button',{class:'p',onclick:async()=>{
        try{await pc.setRemoteDescription(JSON.parse(d.answer));R.end(code);const rt=rnd(28);adopt(pc,dc,rt,d.name||'Phone',true);if(pairing&&pairing.un)pairing.un();pairing=null;card.innerHTML='';card.append(el('h2',{},'Connecting...'),el('p',{},'Keep this window open for a moment.'))}catch(e){card.innerHTML='';card.append(el('h2',{},'Could not connect'),el('p',{},'Try again with a new code.'),el('div',{},el('button',{onclick:done},'Close')))}}},'Allow'),
        el('button',{onclick:done},'Decline')))});
  setTimeout(()=>{if(pairing&&pairing.code===code&&ui&&!asked){done()}},9.5*60*1000)}
function disconnectAll(){ap.forEach(a=>{R&&R.rsDel(a.rt);if(watchers[a.rt]){watchers[a.rt]();delete watchers[a.rt]}});ap=[];saveAp();try{conn&&conn.open&&conn.dc.send(JSON.stringify({t:'bye'}))}catch(e){}setTimeout(dropConn,250);closeUI();sync()}

/* ---------- connection ---------- */
function dropConn(){if(conn){try{conn.pc.close()}catch(e){}conn.open=false;conn=null}clearInterval(tick);tick=null;sync()}
function adopt(pc,dc,rt,name,fresh){
  if(conn&&conn.pc!==pc){try{conn.pc.close()}catch(e){}}
  const c={pc,dc,rt,name,open:false,rx:Date.now(),ln:+LS.getItem('rem.ln.'+rt)||0};conn=c;
  const setup=ch=>{c.dc=ch;
    ch.onopen=()=>{c.open=true;c.rx=Date.now();if(fresh){ap.push({rt,name});saveAp();ch.send(JSON.stringify({t:'rt',rt,bn:boardName()}));if(ui&&ui._card)drawConnected();watch(rt)}
      sync();lastJson='';send(true);clearInterval(tick);tick=setInterval(()=>{send(false);if(Date.now()-c.rx>20000){dropConn()}},1000)};
    ch.onmessage=e=>{c.rx=Date.now();let m;try{m=JSON.parse(e.data)}catch(x){return}
      if(m.t==='c'){if(m.n<=c.ln)return;c.ln=m.n;LS.setItem('rem.ln.'+rt,m.n);run(m)}else if(m.t==='ping'){/* keepalive */}};
    ch.onclose=()=>{if(conn===c){dropConn()}}};
  if(dc)setup(dc);else pc.ondatachannel=e=>setup(e.channel);
  pc.onconnectionstatechange=()=>{if(['failed','closed','disconnected'].includes(pc.connectionState)&&conn===c){setTimeout(()=>{if(conn===c&&['failed','closed','disconnected'].includes(pc.connectionState))dropConn()},4000)}}}
async function watch(rt){
  if(watchers[rt])return;try{R=await load()}catch(e){return}
  watchers[rt]=R.rsWatch(rt,async d=>{
    if(!d||!d.po||d.a||d.exp<Date.now()||!ap.find(a=>a.rt===rt))return;
    try{const pc=new RTCPeerConnection(ICE);adopt(pc,null,rt,(ap.find(a=>a.rt===rt)||{}).name||'Phone',false);
      await pc.setRemoteDescription(JSON.parse(d.po));await pc.setLocalDescription(await pc.createAnswer());await gather(pc);await R.rsAnswer(rt,JSON.stringify(pc.localDescription))}catch(e){}})}
ap.forEach(a=>watch(a.rt));

/* ---------- state out (over the data channel only) ---------- */
const r3=x=>Math.round(x*1000)/1000;
function snapshot(){
  const ws=[];let top=null,tz=-1;
  for(const id in Widgets.open){const i=Widgets.open[id];const r=i.el.getBoundingClientRect();const z=+i.el.style.zIndex||0;const t=((i.el.querySelector('.wt')||{}).textContent||id).trim();
    ws.push({id,t,x:r3(r.x/innerWidth),y:r3(r.y/innerHeight),w:r3(r.width/innerWidth),h:r3(r.height/innerHeight)});if(z>=tz&&id!=='rcmsg'){tz=z;top=id}}
  const p=window.__rcPdf;const tm=Widgets.open.timer?{run:!!TimerW.running,left:TimerW.running?Math.max(0,Math.round((TimerW.end-Date.now())/1000)):Math.round(TimerW.left),total:TimerW.total,done:!!TimerW.done}:null;
  const pk=Widgets.open.picker?((Widgets.open.picker.el.querySelector('.picked-name')||{}).textContent||''):null;
  const tl=Widgets.open.traffic?(Store.get('w2.traffic',{on:-1}).on):null;
  return {tool:p?'present':(App.wb?'whiteboard':top),w:ws,tm,msg:Widgets.open.rcmsg?msgText:null,pdf:p?{n:p.n,t:p.total,name:p.name}:null,pk,tl,vw:innerWidth,vh:innerHeight,bn:boardName()}}
function send(force){
  if(!conn||!conn.open||conn.dc.readyState!=='open')return;
  const s=snapshot();const j=JSON.stringify(s);const now=Date.now();
  if(!force&&j===lastJson&&now-lastSend<4000)return;
  if(!force&&now-lastSend<300)return;
  lastJson=j;lastSend=now;try{conn.dc.send(JSON.stringify({t:'s',s,ln:conn.ln}))}catch(e){}}


/* ---------- same account: a signed-in board offers itself, a signed-in phone connects with no code ---------- */
let acct=null,beatAt=0;const bid=LS.getItem('rem.bid')||(()=>{const b=rnd(10);LS.setItem('rem.bid',b);return b})();
const curUid=()=>(window.Cloud&&Cloud.user&&Cloud.user.uid)||null;
async function acctStart(){
  const uid=curUid();if(!uid||acct||(conn&&conn.open))return;acct={uid,starting:true};
  try{R=await load();const pc=new RTCPeerConnection(ICE);const dc=pc.createDataChannel('cmd');
    await pc.setLocalDescription(await pc.createOffer());await gather(pc);
    if(!acct||acct.uid!==uid||curUid()!==uid){try{pc.close()}catch(e){}acct=null;return}
    const oid=rnd(8);await R.acctPublish(uid,bid,{offer:JSON.stringify(pc.localDescription),name:boardName(),ts:Date.now(),oid});beatAt=Date.now();
    const a={uid,pc,dc,oid};acct=a;
    a.un=R.acctWatch(uid,bid,async d=>{if(acct!==a||!d||!d.answer||d.aoid!==oid)return;acct=null;a.un&&a.un();
      try{await pc.setRemoteDescription(JSON.parse(d.answer));adopt(pc,dc,'acct',d.pn||'Phone',false);R.acctDel(uid,bid)}catch(e){try{pc.close()}catch(x){}}})
  }catch(e){acct=null}}
function acctStop(){const a=acct;acct=null;if(!a)return;try{a.un&&a.un()}catch(e){}try{a.pc&&a.pc.close()}catch(e){}if(R&&a.uid)R.acctDel(a.uid,bid)}
setInterval(()=>{const uid=curUid();if(uid&&acct&&acct.uid!==uid)acctStop();
  if(uid&&!acct&&!(conn&&conn.open))acctStart();
  else if(!uid&&acct)acctStop();
  else if(acct&&acct.oid&&Date.now()-beatAt>120000){beatAt=Date.now();R.acctBeat(acct.uid,bid)}},3000);

/* ---------- commands in ---------- */
const OPEN={timer:()=>openTimer(),picker:()=>openPicker(),traffic:()=>window.__more.FN.traffic()};
async function ensure(id){if(!Widgets.open[id]){OPEN[id]();await wait(200)}return Widgets.open[id]&&Widgets.open[id].el}
async function run(c){
  try{
    if(c.a==='home'){resetScreen(true);msgText=''}
    else if(c.a==='timer'){const e=await ensure('timer');if(e){
      if(c.op==='start'){if(!TimerW.running)e.querySelector('.tbtn.play').click()}
      else if(c.op==='pause'){if(TimerW.running)e.querySelector('.tbtn.play').click()}
      else if(c.op==='reset')e.querySelector('.tbtn.stop').click();
      else if(c.op==='preset'){const b=[...e.querySelectorAll('.tpre')].find(x=>x.textContent.trim()===c.min+'m');b&&b.click()}
      else if(c.op==='close')Widgets.close('timer')}}
    else if(c.a==='msg')msg(c);
    else if(c.a==='pdf'){const p=window.__rcPdf;if(p){c.d>0?p.next():p.prev()}}
    else if(c.a==='openpres'){if(!window.__rcPdf)driveFolders('pres')}
    else if(c.a==='picker'){const e=await ensure('picker');if(e){const b=e.querySelector('.tbtn.okb');b&&b.click()}}
    else if(c.a==='traffic'){const e=await ensure('traffic');if(e){const b=e.querySelector('[aria-label="'+['Red','Yellow','Green'][c.i]+'"]');b&&b.click()}}
    else if(c.a==='close'&&Widgets.open[c.id])Widgets.close(c.id);
    toolbarState();
  }catch(e){}
  send(true)}
function msg(c){
  if(c.op==='hide'){if(Widgets.open.rcmsg)Widgets.close('rcmsg');msgText='';return}
  msgText=String(c.text||'').slice(0,400);
  let i=Widgets.open.rcmsg;
  if(!i){const w=Math.round(Math.min(900,innerWidth*.6));i=Widgets.create('rcmsg','Message',{x:Math.round((innerWidth-w)/2),y:Math.round(innerHeight*.3),w,h:null});i.el.classList.add('light');i.body.style.direction='ltr';i.body.innerHTML='';i.body.append(el('div',{id:'rcmsgt',dir:'auto',style:'font:700 clamp(32px,5vw,72px)/1.25 -apple-system,Inter,system-ui,sans-serif;text-align:center;padding:18px 16px;white-space:pre-wrap;word-break:break-word;color:#1d1d24'}))}
  const t=i.body.querySelector('#rcmsgt');if(t)t.textContent=msgText}
})();
