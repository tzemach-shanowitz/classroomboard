import {initializeApp} from 'firebase/app';
import {getFirestore,doc,getDoc,setDoc,updateDoc,deleteDoc,onSnapshot,collection,getDocs} from 'firebase/firestore';
import {getAuth,onAuthStateChanged} from 'firebase/auth';
import QRCode from 'qrcode';
const firebaseConfig=__CFG__;
const app=initializeApp(firebaseConfig);const db=getFirestore(app);const auth=getAuth(app);
const cs=c=>doc(db,'cast',c),rs=t=>doc(db,'rs',t);
const bd=(u,b)=>doc(db,'users',u,'remote',b);
window.RemSig={
 uid(ms){return new Promise(res=>{let done=false;const f=u=>{if(done)return;done=true;res(u?u.uid:null)};const un=onAuthStateChanged(auth,u=>{f(u);un()});setTimeout(()=>f(auth.currentUser),ms||4000)})},
 acctPublish(u,b,o){return setDoc(bd(u,b),o)},
 acctBeat(u,b){return updateDoc(bd(u,b),{ts:Date.now()}).catch(()=>{})},
 acctWatch(u,b,cb){return onSnapshot(bd(u,b),s=>cb(s.exists()?s.data():null))},
 acctAnswer(u,b,answer,pn,oid){return updateDoc(bd(u,b),{answer,pn,aoid:oid})},
 acctDel(u,b){return deleteDoc(bd(u,b)).catch(()=>{})},
 async acctList(u){const q=await getDocs(collection(db,'users',u,'remote'));return q.docs.map(d=>({id:d.id,...d.data()}))},
 async acctRead(u,b){const s=await getDoc(bd(u,b));return s.exists()?s.data():null},
 async create(offer){for(let i=0;i<8;i++){const a=new Uint32Array(1);crypto.getRandomValues(a);const code=String(a[0]%1000000).padStart(6,'0');
   try{await setDoc(cs(code),{offer,exp:Date.now()+10*60*1000,v:2});return code}catch(e){if(i==7)throw e}}},
 async read(code){const s=await getDoc(cs(code));if(!s.exists())return null;const d=s.data();if(d.exp<Date.now())return null;return d},
 answer(code,answer,name){return updateDoc(cs(code),{answer,name})},
 watch(code,cb){return onSnapshot(cs(code),s=>cb(s.exists()?s.data():null))},
 end(code){return deleteDoc(cs(code)).catch(()=>{})},
 rsWatch(rt,cb){return onSnapshot(rs(rt),s=>cb(s.exists()?s.data():null))},
 async rsOffer(rt,po){await deleteDoc(rs(rt)).catch(()=>{});await setDoc(rs(rt),{po,exp:Date.now()+5*60*1000})},
 rsAnswer(rt,a){return updateDoc(rs(rt),{a})},
 rsDel(rt){return deleteDoc(rs(rt)).catch(()=>{})},
 qr(t){return QRCode.toDataURL(t,{margin:1,width:300})}
};
