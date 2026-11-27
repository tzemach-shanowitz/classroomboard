import config from './config.local.json';
import {initializeApp} from 'firebase/app';
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,sendEmailVerification,sendPasswordResetEmail,deleteUser,reauthenticateWithPopup,reauthenticateWithCredential,EmailAuthProvider} from 'firebase/auth';
import {initializeFirestore,persistentLocalCache,persistentMultipleTabManager,collection,doc,setDoc,onSnapshot,getDocs,deleteDoc} from 'firebase/firestore';

const firebaseConfig=config.firebase;
const app=initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=initializeFirestore(app,{localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})});
const SC=()=>window.__sc;
const TK='scmeta.t',DK='scmeta.drive';
const metaT=()=>{try{return JSON.parse(localStorage.getItem(TK)||'{}')}catch(e){return{}}};
const saveMeta=m=>{try{localStorage.setItem(TK,JSON.stringify(m))}catch(e){}};
const enc=k=>encodeURIComponent(k).replace(/\./g,'%2E');
const MAX=900000;

const C={user:null,status:'signed-out',msg:'',pending:new Set(),lastSync:0,listeners:new Set(),applying:false,unsub:null,timer:null,initial:true};
const emit=()=>[...C.listeners].forEach(f=>{try{f(C)}catch(e){}});
const setS=(s,m)=>{C.status=s;C.msg=m||'';emit()};

function install(){
  if(window.__demo)return;
  const Store=SC().Store;
  Store.dirty=(k,v)=>{
    if(C.applying)return;
    const m=metaT();m[k]=Date.now();saveMeta(m);
    C.pending.add(k);schedule();
  };
}
function schedule(){clearTimeout(C.timer);C.timer=setTimeout(flush,500)}
async function flush(){
  if(!C.user)return;
  const Store=SC().Store,m=metaT();
  const keys=[...C.pending];
  for(const k of keys){
    const raw=localStorage.getItem(Store.p+k);
    if(raw!=null&&raw.length>MAX){C.pending.delete(k);setS('warn','"'+k+'" is too big to sync ('+Math.round(raw.length/1024)+' KB)');continue}
    try{
      await setDoc(doc(db,'users',C.user.uid,'kv',enc(k)),{k,v:raw,t:m[k]||Date.now()});
      C.pending.delete(k);
    }catch(e){setS('error','Sync problem: '+(e.code||e.message));return}
  }
  C.lastSync=Date.now();
  if(C.status!=='warn')setS('ok','');else emit();
}
function wipeLocal(keepUid){
  const del=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('sc.')||k===TK||k===DK||(!keepUid&&k==='scmeta.uid'))del.push(k)}
  del.forEach(k=>localStorage.removeItem(k));C.pending.clear();
}
function mergeGuest(snap){
  // guest work becomes part of the account; existing cloud data wins on conflicts, guest-only data is added
  const Store=SC().Store,m=metaT();
  snap.docs.forEach(d=>{const x=d.data(),lk=Store.p+x.k,loc=localStorage.getItem(lk);if(loc==null)return;
    if(x.k==='studentLists'){
      try{const r=JSON.parse(x.v||'[]'),l=JSON.parse(loc),have=new Set();r.forEach(a=>(a.students||[]).forEach(s=>have.add(s.name)));
        const add=l.map(a=>({...a,students:(a.students||[]).filter(s=>!have.has(s.name))})).filter(a=>a.students.length);
        if(add.length){add.forEach((a,i)=>r.push({id:'guest-'+Date.now()+i,name:add.length>1&&a.name?a.name:'Guest list',students:a.students}));
          localStorage.setItem(lk,JSON.stringify(r));m[x.k]=Date.now()+1000;return}
      }catch(e){}
    }
    try{const gb=JSON.parse(localStorage.getItem('scmeta.guestBackup')||'{}');gb[x.k]=loc;localStorage.setItem('scmeta.guestBackup',JSON.stringify(gb));localStorage.setItem('scmeta.guestBackupAt',String(Date.now()))}catch(e){}
    localStorage.removeItem(lk);delete m[x.k];
  });
  saveMeta(m);
}
C.guestBackupInfo=()=>{try{const gb=JSON.parse(localStorage.getItem('scmeta.guestBackup')||'{}');return{count:Object.keys(gb).length,at:+(localStorage.getItem('scmeta.guestBackupAt')||0)}}catch(e){return{count:0,at:0}}};
C.restoreGuest=()=>{const Store=SC().Store;const gb=JSON.parse(localStorage.getItem('scmeta.guestBackup')||'{}');let n=0;
  for(const k of Object.keys(gb)){if(k==='studentLists'){try{const cur=Store.get('studentLists',[]),add=JSON.parse(gb[k]);const have=new Set();cur.forEach(a=>(a.students||[]).forEach(x=>have.add(x.name)));add.forEach((a,i)=>{const st=(a.students||[]).filter(x=>!have.has(x.name));if(st.length)cur.push({id:'guest-'+Date.now()+i,name:'Guest list',students:st})});Store.set(k,cur);n++}catch(e){}continue}
    try{Store.set(k,JSON.parse(gb[k]));n++}catch(e){}}
  localStorage.removeItem('scmeta.guestBackup');localStorage.removeItem('scmeta.guestBackupAt');return n};
C.discardGuestBackup=()=>{localStorage.removeItem('scmeta.guestBackup');localStorage.removeItem('scmeta.guestBackupAt')};
function startSync(){
  if(C.unsub)C.unsub();
  const Store=SC().Store;
  let first=true;
  setS('syncing','Syncing…');
  C.unsub=onSnapshot(collection(db,'users',C.user.uid,'kv'),{includeMetadataChanges:true},snap=>{
    if(first&&snap.metadata.fromCache&&snap.empty)return;
    const force=first&&window.__legacy&&!localStorage.getItem('scmeta.legacyPushed')&&!localStorage.getItem('scmeta.adopted');
    if(first){const prev=localStorage.getItem('scmeta.uid');if(prev&&prev!==C.user.uid){wipeLocal(true)}else if(!prev&&!snap.empty&&!force){mergeGuest(snap)}localStorage.setItem('scmeta.uid',C.user.uid)}
    const m=metaT();let changed=0;const remote=new Set();const chKeys=[];
    if(force){
      // The original board's device saves its full board to the account first. What the account held is kept as a saved version.
      try{const d={};let n=0;snap.docs.forEach(q=>{const x=q.data();if(x.v!=null&&!String(x.k).startsWith('bak.')){d[x.k]=x.v;n+=x.v.length}});if(n&&n<600000)Store.set('bak.cloudbefore',{t:Date.now(),d})}catch(e){}
      Store.keys('').forEach(k=>{if(k==='bak.cloudbefore')return;m[k]=Date.now()+1000;C.pending.add(k)});
      try{localStorage.setItem('scmeta.legacyPushed','1')}catch(e){}
    }
    snap.docs.forEach(d=>{
      const x=d.data();remote.add(x.k);
      if(d.metadata.hasPendingWrites)return;
      const lt=m[x.k]||0;
      if(x.t>lt){
        C.applying=true;
        try{if(x.v==null)localStorage.removeItem(Store.p+x.k);else localStorage.setItem(Store.p+x.k,x.v)}catch(e){}
        C.applying=false;m[x.k]=x.t;changed++;chKeys.push(x.k);
      }else if(x.t<lt){C.pending.add(x.k)}
    });
    if(first){
      // local-only keys go up
      Store.keys('').forEach(k=>{if(!remote.has(k)){if(!m[k])m[k]=Date.now();C.pending.add(k)}});
    }
    saveMeta(m);
    if(C.pending.size)schedule();
    C.lastSync=Date.now();
    if(changed){
      if(first&&!sessionStorage.getItem('sc.reloaded')){sessionStorage.setItem('sc.reloaded','1');setS('ok','Loaded your saved setup');setTimeout(()=>location.reload(),400);return}
      if(!first){try{window.dispatchEvent(new CustomEvent('sc-remote',{detail:chKeys}))}catch(e){}}
      if(!chKeys.every(k=>k==='beh.state'||k==='beh.cfg'))SC().toast&&SC().toast('Settings updated from the cloud. Reload to see them.');
    }
    first=false;
    if(C.status==='syncing')setS('ok','');
  },err=>setS('error','Cloud error: '+(err.code||err.message)));
}

C.onChange=f=>{C.listeners.add(f);return()=>C.listeners.delete(f)};
C.signIn=async(withDrive)=>{
  const p=new GoogleAuthProvider();
  if(withDrive||window.__legacy)p.addScope('https://www.googleapis.com/auth/drive.readonly');
  const em=(C.user&&C.user.email)||(auth.currentUser&&auth.currentUser.email)||localStorage.getItem('scmeta.email');
  p.setCustomParameters(em?{login_hint:em}:{prompt:'select_account'});
  const r=await signInWithPopup(auth,p);
  const cr=GoogleAuthProvider.credentialFromResult(r);
  if(r.user&&r.user.email)localStorage.setItem('scmeta.email',r.user.email);
  if(cr&&cr.accessToken)localStorage.setItem(DK,JSON.stringify({t:cr.accessToken,exp:Date.now()+50*60*1000}));
  return r.user;
};
C.signOut=async(clear)=>{if(C.unsub)C.unsub();C.unsub=null;localStorage.removeItem(DK);await signOut(auth);if(clear){wipeLocal(false);localStorage.removeItem('scmeta.email');setTimeout(()=>location.reload(),200)}};
C.emailSignUp=async(e,p)=>{const r=await createUserWithEmailAndPassword(auth,e,p);localStorage.setItem('scmeta.email',e);try{await sendEmailVerification(r.user)}catch(x){}return r.user};
C.emailSignIn=async(e,p)=>{const r=await signInWithEmailAndPassword(auth,e,p);localStorage.setItem('scmeta.email',e);return r.user};
C.resetPassword=e=>sendPasswordResetEmail(auth,e);
C.deleteAccount=async(pw)=>{
  const u=auth.currentUser;if(!u)throw new Error('Not signed in');
  const pid=(u.providerData[0]||{}).providerId;
  if(pid==='password'){if(!pw)throw Object.assign(new Error('Enter your password'),{code:'need-password'});await reauthenticateWithCredential(u,EmailAuthProvider.credential(u.email,pw))}
  else await reauthenticateWithPopup(u,new GoogleAuthProvider());
  if(C.unsub)C.unsub();C.unsub=null;
  const snap=await getDocs(collection(db,'users',u.uid,'kv'));
  for(const d of snap.docs)await deleteDoc(d.ref);
  await deleteUser(u);wipeLocal(false);localStorage.removeItem('scmeta.email');
  setTimeout(()=>location.reload(),300);
};
C.driveToken=async(interactive)=>{
  try{const o=JSON.parse(localStorage.getItem(DK)||'null');if(o&&o.exp>Date.now())return o.t}catch(e){}
  if(!interactive)return 'KEY';
  await C.signIn(true);
  const o=JSON.parse(localStorage.getItem(DK)||'null');return o&&o.t;
};
C.hasDrive=()=>{try{const o=JSON.parse(localStorage.getItem(DK)||'null');return !!(o&&o.exp>Date.now())}catch(e){return false}};
C.flush=flush;

// ---- Drive ----
const API='https://www.googleapis.com/drive/v3/';
const DKEY=config.driveApiKey||'',SBF=config.sharedFolderIds||[];
async function dget(path,tok,asBlob){
  const kk=tok==='KEY';
  const r=kk?await fetch(API+path+(path.includes('?')?'&':'?')+'key='+DKEY):await fetch(API+path,{headers:{Authorization:'Bearer '+tok}});
  if(r.status===401||(kk&&(r.status===403||r.status===404))){if(!kk)localStorage.removeItem(DK);throw new Error('expired')}
  if(!r.ok)throw new Error('Drive error '+r.status);
  return asBlob?r.blob():r.json();
}
C.drive={
  async list(parent,tok,pageToken){
    let q;
    if(parent==='shared'&&tok==='KEY')return {files:[]};
    if(parent==='shared')q="sharedWithMe=true and trashed=false";
    else q="'"+parent+"' in parents and trashed=false";
    const f='nextPageToken,files(id,name,mimeType,modifiedTime,thumbnailLink,webViewLink,shortcutDetails)';
    return dget('files?pageSize=200&orderBy=folder,name&supportsAllDrives=true&includeItemsFromAllDrives=true&fields='+encodeURIComponent(f)+'&q='+encodeURIComponent(q)+(pageToken?'&pageToken='+pageToken:''),tok);
  },
  async search(text,tok){
    let q="name contains '"+text.replace(/['\\]/g,' ')+"' and trashed=false";
    if(tok==='KEY'&&!window.__legacy)return {files:[]};
    if(tok==='KEY')q+=' and ('+SBF.map(x=>"'"+x+"' in parents").join(' or ')+')';
    const f='files(id,name,mimeType,modifiedTime,thumbnailLink,webViewLink)';
    return dget('files?pageSize=50&orderBy=modifiedTime desc&supportsAllDrives=true&includeItemsFromAllDrives=true&fields='+encodeURIComponent(f)+'&q='+encodeURIComponent(q),tok);
  },
  async meta(id,tok){return dget('files/'+id+'?supportsAllDrives=true&fields=id,name,mimeType,modifiedTime,webViewLink',tok)},
  // returns an ArrayBuffer of the PDF (original or exported), cached offline
  async pdf(file,tok){
    const exp=file.mimeType.startsWith('application/vnd.google-apps');
    const key='https://sc-cache.local/pdf/'+file.id+'/'+(file.modifiedTime||'');
    const cache=await caches.open('sc-pdf');
    const hit=await cache.match(key);
    if(hit)return hit.arrayBuffer();
    if(!tok)throw new Error('offline');
    const blob=await dget('files/'+file.id+(exp?'/export?mimeType=application%2Fpdf':'?alt=media')+(exp?'':'&supportsAllDrives=true'),tok,true);
    try{await cache.put(key,new Response(blob,{headers:{'Content-Type':'application/pdf'}}))}catch(e){}
    return blob.arrayBuffer();
  }
};

onAuthStateChanged(auth,u=>{
  if(window.__demo)return;
  C.user=u;
  if(u){setS('syncing','Signing in…');startSync()}else{if(C.unsub)C.unsub();C.unsub=null;setS('signed-out','')}
});
C.inspect=async()=>{if(!C.user)return{err:'not-signed-in'};try{const snap=await getDocs(collection(db,'users',C.user.uid,'kv'));const items=snap.docs.map(d=>d.data());const g=k=>items.find(x=>x.k===k);let cfg={};try{cfg=JSON.parse((g('cfg')||{}).v||'{}')}catch(e){}return{email:C.user.email,n:items.length,latest:Math.max(0,...items.map(x=>x.t||0)),hasCfg:!!g('cfg'),hasMarker:!!g('mig.roster1'),date:cfg.clock&&cfg.clock.date,loc:cfg.loc&&cfg.loc.name,fromCache:snap.metadata.fromCache,items}}catch(e){return{err:e.code||e.message}}};
C.pullAll=async()=>{const r=await C.inspect();if(r.err||!r.n)return r;const St=SC().Store,m=metaT();C.applying=true;let a=0;for(const x of r.items){if(String(x.k).startsWith('bak.'))continue;try{if(x.v==null)localStorage.removeItem(St.p+x.k);else localStorage.setItem(St.p+x.k,x.v);m[x.k]=x.t||Date.now();a++}catch(e){}}C.applying=false;saveMeta(m);r.applied=a;return r};
C.sendFeatureRequest=async r=>{if(!C.user)throw new Error('signed-out');await setDoc(doc(collection(db,'featureRequests')),{text:String(r.text||'').slice(0,600),why:String(r.why||'').slice(0,600),uid:C.user.uid,t:Date.now()})};
window.Cloud=C;
if(window.__sc)install();else addEventListener('load',install);
document.dispatchEvent(new Event('cloud-ready'));
