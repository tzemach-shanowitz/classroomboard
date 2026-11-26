import {initializeApp} from 'firebase/app';
import {getFirestore,doc,getDoc,setDoc,updateDoc,deleteDoc,onSnapshot} from 'firebase/firestore';
import QRCode from 'qrcode';

const firebaseConfig={apiKey:'REDACTED',authDomain:'my-smart-classroom-fe1ad.firebaseapp.com',projectId:'my-smart-classroom-fe1ad',storageBucket:'my-smart-classroom-fe1ad.firebasestorage.app',messagingSenderId:'REDACTED',appId:'REDACTED'};
const app=initializeApp(firebaseConfig);const db=getFirestore(app);
const ref=c=>doc(db,'cast',c);
window.CastSig={
 async create(offer){for(let i=0;i<6;i++){const a=new Uint32Array(1);crypto.getRandomValues(a);const code=String(a[0]%1000000).padStart(6,'0');
   try{await setDoc(ref(code),{offer,exp:Date.now()+10*60*1000,v:1});return code}catch(e){if(i==5)throw e}}},
 async read(code){const s=await getDoc(ref(code));if(!s.exists())return null;const d=s.data();if(d.exp<Date.now())return null;return d},
 answer(code,answer,name){return updateDoc(ref(code),{answer,name})},
 watch(code,cb){return onSnapshot(ref(code),s=>cb(s.exists()?s.data():null))},
 end(code){return deleteDoc(ref(code)).catch(()=>{})},
 qr(text){return QRCode.toDataURL(text,{margin:1,width:300})}
};
