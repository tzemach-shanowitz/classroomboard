/* Saved versions: automatic snapshots of a signed-in user's settings. They ride the same private account sync. */
(function(){
if(window.__demo)return;
const PRE='bak.',KEEP=7,MAX=600000;
const list=()=>Store.keys(PRE).sort().reverse();
function snap(force){
 try{const C=window.Cloud;if(!C||!C.user)return;
  const ks=list();const last=ks[0]?Store.get(ks[0],null):null;
  if(!force&&last&&Date.now()-last.t<6*3600e3)return;
  const d={};let size=0;
  Store.keys('').filter(k=>!k.startsWith(PRE)&&!k.startsWith('rem.')).forEach(k=>{const v=localStorage.getItem(Store.p+k);if(v!=null&&v.length<150000&&size+v.length<MAX){d[k]=v;size+=v.length}});
  const same=last&&JSON.stringify(last.d)===JSON.stringify(d);if(same&&!force)return;
  const id=PRE+new Date().toISOString().slice(0,19).replace(/[-:T]/g,'');
  Store.set(id,{t:Date.now(),d});
  list().slice(KEEP).forEach(k=>Store.del(k));
 }catch(e){}
}
window.__snapSettings=snap;
window.__savedVersions={list:()=>list().map(k=>({k,t:Store.get(k,{}).t,n:Object.keys(Store.get(k,{}).d||{}).length})),
 restore(k){const o=Store.get(k,null);if(!o)return 0;snap(true);let n=0;for(const[x,v]of Object.entries(o.d)){try{Store.set(x,JSON.parse(v));n++}catch(e){}}return n}};
addEventListener('load',()=>setTimeout(snap,12000));

/* Automatic match: a device signed in to an account that holds the original board's settings adopts them, with no setting to tap. */
addEventListener('load',()=>{const C=window.Cloud;if(!C||!C.onChange||window.__legacy)return;let ran=false;
 const go=async c=>{if(ran||!c.user||c.status!=='ok'||!C.inspect||sessionStorage.getItem('autoMatch'))return;ran=true;sessionStorage.setItem('autoMatch','1');
  try{const r=await C.inspect();if(r&&!r.err&&r.n&&(r.hasMarker||r.loc==='Brooklyn, NY'||r.date==='heb')){window.__snapSettings&&window.__snapSettings(true);const a=await C.pullAll();if(a&&a.applied){localStorage.setItem('scmeta.adopted','1');Store.set('mig.roster1',true);location.reload()}}}catch(e){}};
 C.onChange(go);[6000,15000].forEach(t=>setTimeout(()=>go(C),t))});
})();
