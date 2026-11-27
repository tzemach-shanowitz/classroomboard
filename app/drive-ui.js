'use strict';
/* ===== Account, Google Drive library, PDF viewer (loads after app.js) ===== */
const MIME_FOLDER='application/vnd.google-apps.folder';
const isGApp=m=>m&&m.startsWith('application/vnd.google-apps');
const kindOf=f=>{const m=f.mimeType;if(m===MIME_FOLDER)return'folder';if(m==='application/pdf')return'pdf';if(m==='application/vnd.google-apps.presentation'||/presentation|powerpoint/.test(m))return'slides';if(m==='application/vnd.google-apps.document'||/wordprocessing|msword/.test(m))return'doc';if(m.startsWith('image/'))return'image';if(m==='application/vnd.google-apps.shortcut')return'shortcut';return'other'};
const ICON={folder:'📁',pdf:'📄',slides:'🎞️',doc:'📝',image:'🖼️',other:'📎',shortcut:'🔗'};
const cloudReady=()=>!!window.Cloud;

function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('load '+src));document.head.append(s)})}
async function pdfLib(){if(!window.pdfjsLib){await loadScript('vendor/pdf.min.js')}window.pdfjsLib.GlobalWorkerOptions.workerSrc='vendor/pdf.worker.min.js';return window.pdfjsLib}

/* ---- account / sync tab ---- */
S.account=function(P,re){
  const C=window.Cloud;
  if(!C){P.append(h('div',{class:'card'},'Cloud features are still loading. If this stays, check the internet connection and reload.'));return}
  const u=C.user;
  const stTxt={'signed-out':'Not signed in','syncing':'Syncing…','ok':'Saved online','warn':'Saved online (with a warning)','error':'Sync problem'}[C.status]||C.status;
  P.append(h('div',{class:'card'},u?('Signed in as '+(u.email||u.displayName)+'. Your settings, schedules, supplies, student lists and whiteboards are saved online and load on any computer where you sign in.'):'Sign in with Google to save everything online and to browse your Google Drive. Until then everything is saved only in this browser.'),
    h('div',{class:'lbl'},'Status: '+stTxt+(C.msg?' · '+C.msg:'')+(C.lastSync?' · last sync '+new Date(C.lastSync).toLocaleTimeString():'')));
  if(!u)authUI(P,()=>setTimeout(re,600));
  else P.append(h('div',{class:'row'},
    pill('Sync now',async()=>{await C.flush();toast('Synced');re()},'big'),
    pill(C.hasDrive()?'Google Drive: connected':'Connect Google Drive',async()=>{try{await C.driveToken(true);toast('Drive connected');re()}catch(e){toast('Could not connect: '+(e.code||e.message))}},'big'),
    pill('Sign out',()=>sure('Sign out? Your data stays saved online.',async()=>{await C.signOut();re()}),'big danger')),
    h('div',{class:'row'},pill('Sign out and clear this device',()=>sure('Sign out and remove all saved data from this device? Your account keeps it online.',async()=>{await C.signOut(true)}),'big'),pill('Delete my account and data…',()=>deleteAcct(C),'big danger')));
  P.append(h('div',{class:'lbl'},'Connecting Google Drive is optional. Drive access is read-only. The app can look at your files and can never change or delete them. Drive access lasts about an hour; if it stops, tap "Connect Google Drive" again.'));
  window.__accRe=re;window.__accP=P;if(!window.__accSub){window.__accSub=1;C.onChange(()=>{const P2=window.__accP;if(P2&&P2.isConnected&&!document.querySelector('.modal input:focus')){clearTimeout(window.__accT);window.__accT=setTimeout(()=>window.__accRe&&window.__accRe(),80)}})}
};


/* ---- Drive card shown at the top of Library / Presentations ---- */
function driveCard(close,kind){
  const w=h('div',{class:'card'});
  const C=window.Cloud;
  if(!C||!C.user){w.append('Sign in with Google (Settings → Account & sync) to browse your Google Drive here. You can still save links below.',h('div',{class:'row'},pill('Open Account & sync',()=>{close();openSettings('account')},'sel')))}
  else w.append(h('div',{class:'row'},pill('📂 Browse my Google Drive',()=>{close();driveBrowser(kind==='pres'?'root':'root',kind)},'big sel')));
  return w}

/* ---- Drive browser ---- */
function driveBrowser(startId,kind,startName){
  const C=window.Cloud;const SIMPLE=Store.get('driveSimple',true)&&startId&&startId!=='root';const SB=window.__legacy?(window.__PERSONAL||{}).sharedFolder||'':'root';const stack=[{id:(startId&&startId!=='root')?startId:SB,name:(startId&&startId!=='root')?(startName||'Folder'):(window.__legacy?'Smart Board':'My Drive')}];
  modal('Google Drive',(b,close)=>{
    const body=h('div');b.append(body);
    const pin=(f)=>modal('Save "'+f.name+'" to',(bb,c2)=>bb.append(h('div',{class:'row'},pill('Teaching library',()=>{const L=Store.get('libLinks',[]);L.push({title:f.name,url:f.webViewLink||('https://drive.google.com/open?id='+f.id),driveId:f.id,mime:f.mimeType,mod:f.modifiedTime});Store.set('libLinks',L);c2();toast('Saved to library')},'big'),pill('Presentations',()=>{const L=Store.get('presLinks',[]);L.push({title:f.name,url:f.webViewLink||('https://drive.google.com/open?id='+f.id),driveId:f.id,mime:f.mimeType,mod:f.modifiedTime});Store.set('presLinks',L);c2();toast('Saved to presentations')},'big'),pill('Cancel',c2,'big'))));
    async function show(){
      body.innerHTML='';
      const cur=stack[stack.length-1];
      const crumbs=h('div',{class:'row',style:'flex-wrap:wrap'},...stack.map((s,i)=>pill((i?'› ':'')+s.name,()=>{stack.length=i+1;show()},i===stack.length-1?'sel':'')),...(C.hasDrive()?[pill('Shared with me',()=>{stack.length=1;stack.push({id:'shared',name:'Shared with me'});show()})]:[]));
      const si=h('input',{class:'inp',placeholder:'Search Drive by name',style:'flex:1',dir:'auto'});
      const doS=async()=>{const t=si.value.trim();if(!t)return;await load(()=>C.drive.search(t,tok),'Results for "'+t+'"')};
      si.addEventListener('keydown',e=>{if(e.key==='Enter')doS()});
      if(SIMPLE){if(stack.length>1)body.append(h('div',{class:'row'},pill('← Back',()=>{stack.pop();show()},'big')))}else body.append(crumbs,h('div',{class:'row'},si,pill('Search',doS)));
      const list=h('div',{class:'dgrid'});body.append(list);
      let tok=await C.driveToken(false);
      if(!tok){list.append(h('div',{class:'card'},'Google Drive needs to be connected (it expires after about an hour).'),h('div',{class:'row'},pill('Connect Google Drive',async()=>{try{await C.driveToken(true);show()}catch(e){toast('Could not connect: '+(e.code||e.message))}},'big sel')));return}
      await load(()=>C.drive.list(cur.id,tok),null);
      async function load(fn,title){
        list.innerHTML='';list.append(h('div',{class:'lbl'},'Loading…'));
        let r;try{r=await fn()}catch(e){list.innerHTML='';if(e.message==='expired'){list.append(h('div',{class:'card'},'Drive access expired.'),pill('Reconnect Google Drive',async()=>{try{await C.driveToken(true);show()}catch(x){toast('Could not connect')}},'big sel'))}else list.append(h('div',{class:'card'},navigator.onLine?('Could not load: '+e.message):'You are offline. Saved items in your library still open if you viewed them before.'));return}
        list.innerHTML='';if(title)list.append(h('div',{class:'lbl'},title));
        if(!title&&stack.length===1&&(kind==='pres'||kind==='library')){Store.get(kind==='pres'?'presLinks':'libLinks',[]).forEach(x=>list.append(h('div',{class:'dtile'},h('div',{class:'grow',dir:'auto',onclick:()=>{close();openLink(x)}},h('div',{class:'dic'},'▶️'),h('div',{class:'dtx'},h('div',{class:'dnm'},x.title||x.url),h('div',{class:'lbl'},'Link'))))))}
        const files=r.files||[];if(!files.length)list.append(h('div',{class:'lbl'},'Nothing here.'));
        files.forEach(f0=>{let f=f0;if(f.mimeType==='application/vnd.google-apps.shortcut'&&f.shortcutDetails){f={...f,id:f.shortcutDetails.targetId,mimeType:f.shortcutDetails.targetMimeType}}
          const k=kindOf(f);
          list.append(h('div',{class:'dtile'},h('div',{class:'grow',dir:'auto',onclick:()=>{if(k==='folder'){stack.push({id:f.id,name:f.name});show()}else{close();openDriveFile(f)}}},h('div',{class:'dic'},ICON[k],(k!=='folder'&&f0.thumbnailLink)?h('img',{src:f0.thumbnailLink.replace(/=s\d+$/,'=s160'),loading:'lazy',referrerpolicy:'no-referrer',alt:'',onload:function(){this.parentNode.classList.add('hasth')},onerror:function(){this.remove()}}):null),h('div',{class:'dtx'},h('div',{class:'dnm'},f.name),h('div',{class:'lbl'},k==='folder'?'Folder':new Date(f.modifiedTime).toLocaleDateString()))),...(SIMPLE?[]:[pill('📌',()=>pin(f))])))});
        if(r.nextPageToken)list.append(pill('More…',async()=>{const m=await C.drive.list(cur.id,tok,r.nextPageToken);m.files.forEach(()=>0);toast('Showing first 200 items. Use search to find others.')}))}
    }
    show();
  },{foot:c=>[pill('Close',c,'big sel')]});
}

/* ---- open any Drive file ---- */
async function openDriveFile(f){
  const k=kindOf(f);const C=window.Cloud;
  if(k==='folder')return driveBrowser(f.id,'library',f.name||f.title);
  if(k==='pdf'||k==='slides'||k==='doc'){return openPdfViewer({id:f.id||f.driveId,name:f.name||f.title,mimeType:f.mimeType||f.mime,modifiedTime:f.modifiedTime||f.mod,webViewLink:f.webViewLink||f.url})}
  const url=f.webViewLink||f.url;
  if(url)openLink({title:f.name||f.title,url});else toast('This file type can only be opened in Google Drive')
}

/* ---- PDF viewer with saved handwriting per page ---- */
async function openPdfViewer(file){
  const C=window.Cloud;
  const wrap=h('div',{class:'pdfwrap',style:'position:fixed;inset:0;z-index:3;background:#222;display:flex;align-items:center;justify-content:center'});
  const cv=h('canvas',{style:'background:#fff;box-shadow:0 0 30px #000'});wrap.append(cv);
  const msg=h('div',{style:'position:absolute;color:#fff;font-size:26px;text-align:center'},'Loading '+file.name+'…');wrap.append(msg);
  let pdf=null,n=1,rendering=false,pend=null,total=0;
  const key=()=>'anno.pdf.'+file.id+'.'+n;
  const pg=h('span',{style:'padding:0 8px;min-width:80px;text-align:center;font-size:20px'},'');
  const goto=async(p)=>{if(!pdf)return;p=clamp(p,1,total);if(p===n&&cv.dataset.done)return;
    if(Ink.ctxKey)Ink.persist();
    n=p;Store.set('pdfpos.'+file.id,n);Ink.ctxKey=key();Ink.strokes=Store.get(key(),[]);Ink.redo=[];Ink.visible=true;Ink.redraw();
    await render()};
  async function render(){
    if(rendering){pend=true;return}rendering=true;
    try{const page=await pdf.getPage(n);const vw=innerWidth,vh=innerHeight;const v1=page.getViewport({scale:1});const s=Math.min(vw/v1.width,vh/v1.height);const dpr=devicePixelRatio||1;const v=page.getViewport({scale:s*dpr});
      cv.width=v.width;cv.height=v.height;cv.style.width=(v.width/dpr)+'px';cv.style.height=(v.height/dpr)+'px';
      await page.render({canvasContext:cv.getContext('2d'),viewport:v}).promise;cv.dataset.done='1';pg.textContent=n+' / '+total;
      // keep the writing layer matched to this page: strokes use screen coordinates
    }catch(e){toast('Could not draw page')}
    rendering=false;if(pend){pend=false;render()}}
  const bar=h('div',{class:'glass',style:'background:rgba(20,26,32,.88);color:#fff;position:fixed;left:16px;top:16px;z-index:4;padding:6px;display:flex;gap:6px;align-items:center;direction:ltr'},
    h('button',{class:'pill',onclick:()=>{Ink.persist();wrap.remove();document.removeEventListener('keydown',kd);removeEventListener('resize',rz);Ink.ctxKey=null;Ink.strokes=[];Ink.setMode('off');Ink.redraw()}},'← Back'),
    h('button',{class:'pill',onclick:()=>goto(n-1)},'◀'),pg,h('button',{class:'pill',onclick:()=>goto(n+1)},'▶'),
    h('button',{class:'pill',onclick:()=>Ink.setMode(Ink.mode==='write'?'view':'write')},'✍ Write'));
  wrap.append(bar);
  window.__rcPdf={next:()=>goto(n+1),prev:()=>goto(n-1),get n(){return n},get total(){return total},name:file.name};
  const kd=e=>{if(Ink.mode==='write'&&e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;if(e.key==='ArrowRight'||e.key==='PageDown')goto(n+1);if(e.key==='ArrowLeft'||e.key==='PageUp')goto(n-1)};
  const rz=()=>{clearTimeout(rz.t);rz.t=setTimeout(render,200)};
  document.addEventListener('keydown',kd);addEventListener('resize',rz);
  $('#app-main').append(wrap);liftBar(bar,wrap);document.body.classList.add('pdfmode');['clock','gear'].forEach(i=>{const e=document.getElementById(i);if(e)e.style.display='none'});
  {const obs=new MutationObserver(()=>{if(!wrap.isConnected){window.__rcPdf=null;document.body.classList.remove('pdfmode');['clock','gear'].forEach(i=>{const e=document.getElementById(i);if(e)e.style.display=''});obs.disconnect()}});obs.observe($('#app-main'),{childList:true})}
  try{
    const lib=await pdfLib();
    let tok=null;try{tok=await C.driveToken(false)}catch(e){}
    let buf;
    try{buf=await C.drive.pdf(file,tok)}catch(e){
      if(e.message==='expired'||(!tok&&navigator.onLine)){msg.innerHTML='';msg.append('Drive access expired. ',h('button',{class:'pill big sel',onclick:async()=>{try{await C.driveToken(true);wrap.remove();document.removeEventListener('keydown',kd);removeEventListener('resize',rz);openPdfViewer(file)}catch(x){toast('Could not connect')}}},'Reconnect Google Drive'));return}
      msg.textContent=navigator.onLine?('Could not open: '+e.message):'Offline, and this file was not opened on this computer before.';return}
    pdf=await lib.getDocument({data:buf,disableFontFace:true,useSystemFonts:false}).promise;total=pdf.numPages;msg.remove();
    const saved=Store.get('pdfpos.'+file.id,1);
    await goto(saved<=total?saved:1);
  }catch(e){msg.textContent='Could not open this file ('+e.message+')'}
}

/* saved links with a Drive id open natively */
(function(){const ol=openLink;openLink=function(x){if(x&&x.driveId)return openDriveFile({id:x.driveId,name:x.title,mimeType:x.mime||'',modifiedTime:x.mod,webViewLink:x.url});return ol(x)}})();

/* ---- sign-in / sign-up forms (used in Account tab and the welcome screen) ---- */
const AERR={'auth/invalid-email':'That email address does not look right.','auth/email-already-in-use':'That email already has an account. Use Sign in.','auth/weak-password':'Password needs at least 6 characters.','auth/invalid-credential':'Wrong email or password.','auth/wrong-password':'Wrong email or password.','auth/user-not-found':'No account with that email.','auth/too-many-requests':'Too many tries. Wait a minute and try again.','auth/popup-closed-by-user':'Sign-in window was closed.','auth/network-request-failed':'No internet connection.','auth/missing-password':'Enter a password.','auth/popup-blocked':'Your browser blocked the sign-in window. Allow pop-ups and try again.'};
const aerr=e=>AERR[e&&e.code]||('Something went wrong ('+((e&&(e.code||e.message))||'error')+')');
function authUI(P,done){
  const C=window.Cloud;let mode='in';
  const box=h('div',{class:'authbox'});P.append(box);
  const draw=()=>{box.innerHTML='';
    const msg=h('div',{class:'lbl',style:'min-height:1.4em;color:#c0392b'});
    const em=h('input',{class:'inp',type:'email',placeholder:'Email',dir:'ltr',autocomplete:'email',style:'width:100%'});
    const pw=h('input',{class:'inp',type:'password',placeholder:'Password (6+ characters)',dir:'ltr',autocomplete:mode==='up'?'new-password':'current-password',style:'width:100%'});
    const run=async f=>{msg.style.color='#c0392b';msg.textContent='';try{await f();done&&done()}catch(e){msg.textContent=aerr(e)}};
    box.append(h('div',{class:'row'},pill('Sign in with Google',()=>run(()=>C.signIn(false)),'big sel')),
      h('div',{class:'lbl'},'or use an email'),
      h('div',{class:'row',style:'flex-direction:column;align-items:stretch;gap:8px'},em,pw),
      h('div',{class:'row'},pill(mode==='up'?'Create account':'Sign in',()=>run(()=>mode==='up'?C.emailSignUp(em.value.trim(),pw.value):C.emailSignIn(em.value.trim(),pw.value)),'big'),
        pill(mode==='up'?'I already have an account':'New here? Create account',()=>{mode=mode==='up'?'in':'up';draw()})),
      mode==='in'?h('div',{class:'row'},pill('Forgot password?',async()=>{const e=em.value.trim();if(!e){msg.textContent='Type your email above first.';return}try{await C.resetPassword(e);msg.style.color='#1e8e3e';msg.textContent='If that email has an account, a reset link was sent.'}catch(x){msg.textContent=aerr(x)}})):'',
      msg);
    pw.onkeydown=e=>{if(e.key==='Enter')run(()=>mode==='up'?C.emailSignUp(em.value.trim(),pw.value):C.emailSignIn(em.value.trim(),pw.value))};
  };draw();
}
window.authUI=authUI;
function deleteAcct(C){
  const u=C.user;if(!u)return;
  modal('Delete my account',(b,c)=>{
    const pw=h('input',{class:'inp',type:'password',placeholder:'Your password',dir:'ltr',style:'width:100%'});const msg=h('div',{class:'lbl',style:'color:#c0392b'});
    const isPw=(u.providerData&&u.providerData[0]&&u.providerData[0].providerId)==='password';
    b.append(h('div',{class:'card'},'This permanently deletes your account and everything saved online: class lists, schedules, settings, marks. It cannot be undone. Your Google Drive files are not touched.'),isPw?pw:h('div',{class:'lbl'},'You will be asked to sign in with Google once more to confirm.'),
      h('div',{class:'row'},pill('Delete everything',async()=>{try{msg.textContent='Deleting…';await C.deleteAccount(pw.value)}catch(e){msg.textContent=e.code==='need-password'?'Enter your password to confirm.':aerr(e)}},'danger big'),pill('Cancel',c,'big')),msg)});
}
/* ---- Drive folders for people who do not use the Smart Board folder ---- */
function driveFolders(kind){const key='myFolders.'+kind;
  modal(kind==='library'?'Library':'Slideshows',(b,c)=>{const draw=()=>{b.innerHTML='';const L=Store.get(key,[]);const C=window.Cloud;
    if(window.MyTools&&kind==='library'){const mt=MyTools.section(c);if(mt)b.append(mt)}
    const g=h('div',{class:'libgrid'});L.forEach((x,i)=>g.append(h('div',{class:'libcard'},h('div',{onclick:()=>{c();driveBrowser(x.id,kind,x.name)}},h('div',{class:'ic'},'📁'),h('div',{dir:'auto',style:'font-size:20px;margin-top:6px'},x.name)),h('div',{class:'row',style:'justify-content:center'},pill('✕',()=>{L.splice(i,1);Store.set(key,L);draw()})))));
    b.append(L.length?g:h('div',{class:'card'},'Add a Google Drive folder to show it here. In Drive, share the folder as "Anyone with the link can view", then paste its link below.'));
    const inp=h('input',{class:'inp',placeholder:'Paste a Google Drive folder link',style:'flex:1',dir:'ltr'});
    b.append(h('div',{class:'lbl'},'Add a folder'),h('div',{class:'row'},inp,pill('Add',async()=>{const m=inp.value.match(/folders\/([\w-]+)/)||inp.value.match(/[?&]id=([\w-]+)/);if(!m){toast('That does not look like a Drive folder link');return}
      try{const tok=await C.driveToken(false);const meta=await C.drive.meta(m[1],tok);if(meta.mimeType!=='application/vnd.google-apps.folder'){toast('That link is not a folder');return}L.push({id:m[1],name:meta.name});Store.set(key,L);draw()}catch(e){toast('Could not open that folder. Is it shared as "Anyone with the link"?')}})));
    if(C&&C.user)b.append(h('div',{class:'row'},pill('Browse my whole Google Drive',async()=>{try{await C.driveToken(true);c();driveBrowser('root',kind,'My Drive')}catch(e){toast('Could not connect Drive')}},'big')));
    else b.append(h('div',{class:'lbl'},'Sign in with Google (Settings > Account) to browse your whole Drive.'))};draw()},{foot:c=>[pill('Done',c,'big sel')]})}
window.driveFolders=driveFolders;
/* ---- Share tab ---- */
S.share=function(P){const url='https://classroomboard.web.app';
  P.append(h('div',{class:'card',style:'text-align:center'},h('img',{src:'qr.svg',alt:'QR code',style:'width:220px;height:220px;background:#fff;border-radius:12px'}),h('div',{style:'font-size:20px;font-weight:600;margin-top:8px',dir:'ltr'},'classroomboard.web.app')),
    h('div',{class:'row'},pill('Copy link',()=>{try{navigator.clipboard.writeText(url);toast('Link copied')}catch(e){toast(url)}},'big'),navigator.share?pill('Share…',()=>navigator.share({title:'ClassroomBoard',url}).catch(()=>{}),'big'):''),
    h('div',{class:'lbl'},'How to use it'),
    h('div',{class:'card',style:'line-height:1.5'},'1. Open the link on your computer, phone or smart board.',h('br'),'2. Tap the gear, then Account, and make a free account (Google or email).',h('br'),'3. Add your students in Settings > Students. Tip: use first names or initials.',h('br'),'4. Your setup is saved to your account and works on any device you sign in on.'),
    h('div',{class:'lbl'},'Handy pages'),
    h('div',{class:'card',dir:'ltr',style:'line-height:1.7'},'Board: '+url+'/app/?view=board',h('br'),'Phone setup: '+url+'/app/?view=phone',h('br'),'Phone marking: '+url+'/app/?view=mark'))};
/* ---- first-run welcome (new people only) ---- */
(function(){const q=new URLSearchParams(location.search).get('view');
 const forced=new URLSearchParams(location.search).get('login');if(window.__demo)return;
 if(!forced)return; /* guests go straight to a clean classroom; the sign-in sheet only opens on the login route */
 setTimeout(()=>{if(window.Cloud&&window.Cloud.user)return;localStorage.setItem('scmeta.welcomed','1');
  modal('Welcome to ClassroomBoard',(b,c)=>{
   b.append(h('div',{class:'card',style:'line-height:1.5'},'Sign in to save your classroom and use it on any device. You can also keep going without an account.'),
    h('div',{class:'lbl'},'Tip: use first names or initials for your students. ',h('a',{href:'/privacy.html',target:'_blank',style:'color:#0a84ff'},'Privacy')));
   authUI(b,()=>c());
  },{foot:c=>[pill('Continue without an account',c,'big')]})},900)})();

/* ---- discreet guest note (signed-out, new users only, dismissible) ---- */
(function(){if(window.__demo||window.__legacy)return;
 addEventListener('load',()=>setTimeout(()=>{const C=window.Cloud;if(C&&C.user)return;if(sessionStorage.getItem('scGuestHide')||new URLSearchParams(location.search).get('view')==='board')return;
  const p=document.createElement('div');p.id='guestpill';p.innerHTML='<span>Guest · work is saved only in this browser.</span> <a href="#">Sign in to save</a> <b title="Hide">×</b>';
  document.body.append(p);p.querySelector('a').onclick=e=>{e.preventDefault();try{window.__sc.openSettings('account')}catch(x){}};
  p.querySelector('b').onclick=()=>{sessionStorage.setItem('scGuestHide','1');p.remove()};
  const iv=setInterval(()=>{if(window.Cloud&&window.Cloud.user){p.remove();clearInterval(iv)}},2000)},4000));
})();
