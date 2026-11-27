import {initializeApp} from 'firebase/app';
import {getFirestore,doc,getDoc,setDoc,updateDoc,deleteDoc,onSnapshot,serverTimestamp} from 'firebase/firestore';
import QRCode from 'qrcode';

const firebaseConfig={apiKey:'REDACTED',authDomain:'my-smart-classroom-fe1ad.firebaseapp.com',projectId:'my-smart-classroom-fe1ad',storageBucket:'my-smart-classroom-fe1ad.firebasestorage.app',messagingSenderId:'991068165334',appId:'1:991068165334:web:a54d4ae26c555624512577'};
const app=initializeApp(firebaseConfig);const db=getFirestore(app);
const ref=c=>doc(db,'cast',c);const fr=c=>doc(db,'cf',c);
window.CastSig={
 async create(offer){for(let i=0;i<6;i++){const a=new Uint32Array(1);crypto.getRandomValues(a);const code=String(a[0]%1000000).padStart(6,'0');
   try{await setDoc(ref(code),{offer,exp:Date.now()+10*60*1000,v:1});return code}catch(e){if(i==5)throw e}}},
 async read(code){const s=await getDoc(ref(code));if(!s.exists())return null;const d=s.data();if(d.exp<Date.now())return null;return d},
 answer(code,answer,name){return updateDoc(ref(code),{answer,name})},
 watch(code,cb){return onSnapshot(ref(code),s=>cb(s.exists()?s.data():null))},
 end(code){return deleteDoc(ref(code)).catch(()=>{})},
 fcreate(code){return setDoc(fr(code),{exp:Date.now()+45*60*1000,t:serverTimestamp()})},
 fwrite(code,f,w,h){return updateDoc(fr(code),{f,w,h,t:serverTimestamp()})},
 fwatch(code,cb){return onSnapshot(fr(code),s=>cb(s.exists()?s.data():null),()=>cb(null))},
 fend(code){return deleteDoc(fr(code)).catch(()=>{})},
 qr(text){return QRCode.toDataURL(text,{margin:1,width:300})}
};
