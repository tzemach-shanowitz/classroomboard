// Generates static screenshots of the live ClassroomBoard app (demo data, fictional names) and a no-JS review page.
const p=require('/tmp/qr/node_modules/puppeteer-core');const fs=require('fs');
const sl=ms=>new Promise(r=>setTimeout(r,ms));
const BASE=process.env.BASE||'https://classroomboard.web.app';
const OUT=process.env.OUT||'/tmp/fb/public-cb/review';
fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT+'/img',{recursive:true});
const shots=[];let n=0;
const VPS=[{id:'desktop',label:'Desktop 1600x900',w:1600,h:900,mobile:false},{id:'mobile',label:'Phone 390x844',w:390,h:844,mobile:true}];
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50);
(async()=>{
const sw=await (await fetch(BASE+'/app/sw.js')).text();const ver=(/classroom-(v\d+)/.exec(sw)||[])[1]||'unknown';
const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],headless:'new'});
for(const vp of VPS){
 const pg=await b.newPage();await pg.setViewport({width:vp.w,height:vp.h,isMobile:vp.mobile,hasTouch:vp.mobile});
 const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(BASE+'/app/?demo=home',{waitUntil:'domcontentloaded'});await sl(2500);
 const snap=async(group,title)=>{await sl(350);await pg.evaluate(()=>{const t=document.querySelector('#toast');if(t)t.classList.remove('show')});await sl(250);const f=`${vp.id}-${String(++n).padStart(3,'0')}-${slug(title)}.jpg`;await pg.screenshot({path:OUT+'/img/'+f,type:'jpeg',quality:90});shots.push({vp:vp.id,group,title,f})};
 const ev=(f,...a)=>pg.evaluate(f,...a);
 const clean=()=>ev(()=>{document.querySelectorAll('.s2scrim,#modal-root .scrim').forEach(x=>x.remove());try{resetScreen()}catch(e){}});
 const openS=async()=>{if(!await pg.$('.s2'))await ev(()=>window.__openSettings2())};
 const goCat=async c=>{await openS();await ev(c=>document.querySelector('.s2cat[data-c='+c+']').click(),c);await sl(200)};
 await snap('Main screen','Main classroom screen');
 await ev(()=>toolbarShow(true));await snap('Main screen','Toolbar open');
 // settings
 const cats=['general','appearance','classroom','toolbar','widgets','materials','account','privacy','advanced'];
 await clean();await openS();await snap('Settings','Settings home'+(vp.mobile?' (category list)':''));
 for(const c of cats){
  await goCat(c);await snap('Settings: categories','Category '+c);
  const labels=await ev(()=>[...document.querySelectorAll('.s2pg .s2row.nav .s2l b')].map(e=>e.textContent));
  for(const l of labels){
   await goCat(c);
   const ok=await ev(l=>{const r=[...document.querySelectorAll('.s2pg .s2row.nav')].find(x=>x.querySelector('.s2l b').textContent===l);if(r){r.click();return 1}},l);await sl(300);
   if(!ok)continue;
   if(await pg.$('.s2')){await snap('Settings: submenus',c+' > '+l);
     const l2=await ev(()=>[...document.querySelectorAll('.s2pg .s2row.nav .s2l b')].map(e=>e.textContent));
     for(const m of l2.slice(0,6)){const o2=await ev(m=>{const r=[...document.querySelectorAll('.s2pg .s2row.nav')].find(x=>x.querySelector('.s2l b').textContent===m);if(r){r.click();return 1}},m);await sl(300);
       if(o2){if(await pg.$('.s2'))await snap('Settings: submenus',c+' > '+l+' > '+m);else await snap('Editors and popups',c+' > '+l+' > '+m);}
       await clean();await goCat(c);await ev(l=>{[...document.querySelectorAll('.s2pg .s2row.nav')].find(x=>x.querySelector('.s2l b').textContent===l).click()},l);await sl(250)}
   }else{await snap('Editors and popups',c+' > '+l+' (opens outside settings)');await clean()}
  }
 }
 await clean();
 // widgets and their settings
 const WID=[['Timer','openTimer'],['Schedule','openSchedule'],['Supplies','openSupplies'],['Name picker','openPicker'],['Spin the wheel','openWheel'],['Behavior and stars','openBehavior'],['Mincha audio','openAudio']];
 for(const [nm,fn] of WID){await clean();await ev(fn=>window[fn](),fn).catch(()=>{});await sl(500);await snap('Widgets',nm);
  const g=await ev(()=>{const b=[...document.querySelectorAll('.widget .wbtn')].find(x=>(x.title||x.getAttribute('aria-label'))==='Settings');if(b){b.click();return 1}});
  if(g){await sl(400);await snap('Widget settings',nm+' settings')}}
 const ids=await ev(()=>Object.keys(__more.NAMES).map(i=>[i,__more.NAMES[i]]));
 for(const [id,nm] of ids){await clean();await ev(id=>__more.FN[id](),id).catch(()=>{});await sl(600);await snap('Widgets',nm);
  const g=await ev(()=>{const b=[...document.querySelectorAll('.widget .wbtn')].find(x=>(x.title||x.getAttribute('aria-label'))==='Settings');if(b){b.click();return 1}});
  if(g){await sl(400);await snap('Widget settings',nm+' settings')}}
 await clean();
 for(const [nm,fn] of [['Saved links popup','openLinks("library")'],['Schedule editor','scheduleEditor&&openSchedule()']]){await ev(fn=>{try{(0,eval)(fn)}catch(e){}},fn);await sl(500);await snap('Editors and popups',nm);await clean()}
 await ev(()=>window.sure&&sure('Delete this example item? This cannot be undone.',()=>{}));await sl(300);await snap('Editors and popups','Confirmation dialog');await clean();
 // appearance variants
 const variants=[['Dark theme',{theme:'dark'}],['Large size, purple accent',{theme:'light',size:'lg',accent:'#7d5cff'}],['Toolbar left with labels',{size:'std',accent:'',labels:true,pos:'left'}],['Toolbar right with labels',{pos:'right'}],['Hebrew (right to left)',{lang:'he',pos:'bottom',labels:false}],['Yiddish (right to left)',{lang:'yi'}]];
 for(const [nm,v] of variants){await ev(v=>{const u=__sc.cfg.ui;for(const k in v)if(k!=='pos')u[k]=v[k];if(v.pos)__sc.cfg.toolbar.pos=v.pos;__sc.saveCfg&&__sc.saveCfg();__applyUi();toolbarShow(true)},v);await sl(400);await snap('Appearance options',nm+' - main screen');
  await openS();await ev(()=>document.querySelector('.s2cat[data-c=appearance]').click());await snap('Appearance options',nm+' - settings');await clean()}
 console.log(vp.id,'errors',errs.slice(0,3));await pg.close();
}
await b.close();
const date=new Date().toLocaleString('en-US',{timeZone:'America/New_York',dateStyle:'full',timeStyle:'short'})+' (New York time)';
const groups=[...new Set(shots.map(s=>s.group))];
let html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ClassroomBoard visual review</title>
<style>body{font:16px/1.5 -apple-system,Segoe UI,Arial,sans-serif;max-width:1100px;margin:0 auto;padding:24px;color:#1d1d1f;background:#f5f5f7}h1{margin:0 0 4px}h2{margin-top:40px;border-bottom:1px solid #ddd;padding-bottom:6px}h3{margin:24px 0 4px;font-size:17px}figure{margin:0 0 8px}img{max-width:100%;height:auto;border:1px solid #d1d1d6;border-radius:8px;background:#fff}.m img{max-width:390px}code,.u{font-size:13px;color:#555;word-break:break-all}.meta{color:#555}</style></head><body>
<h1>ClassroomBoard visual review</h1>
<p class="meta"><b>Build version:</b> ${ver}<br><b>Screenshots generated:</b> ${date}<br><b>Source:</b> the live app at ${BASE}/app/ in demo mode (fictional student names only). ${shots.length} screenshots. No JavaScript is needed to view this page.</p>
<p class="meta">Each heading is followed by the image and its direct URL. Desktop is 1600x900, phone is 390x844 (device pixel ratio 1, JPEG quality 90). The settings window supports Light, Dark and System themes, accent colors, three interface sizes, toolbar on bottom, left or right, tool labels, and English, Hebrew or Yiddish.</p>
<h2>Contents</h2><ul>${groups.map(g=>`<li><a href="#${slug(g)}">${g}</a></li>`).join('')}</ul>`;
for(const vpx of VPS){html+=`<h2 id="${vpx.id}">${vpx.label}</h2>`;
 for(const g of groups){const ss=shots.filter(s=>s.group===g&&s.vp===vpx.id);if(!ss.length)continue;html+=`<h3 id="${slug(g)}${vpx.id==='mobile'?'-m':''}">${g} (${vpx.id})</h3>`;
  for(const s of ss){const url=`${BASE}/review/img/${s.f}`;html+=`<figure class="${vpx.id==='mobile'?'m':''}"><figcaption><b>${s.title}</b></figcaption><a href="img/${s.f}"><img src="img/${s.f}" alt="${vpx.id}: ${s.title}" loading="lazy"></a><div class="u">${url}</div></figure>`}}}
html+='</body></html>';
fs.writeFileSync(OUT+'/index.html',html);fs.writeFileSync(OUT+'/manifest.json',JSON.stringify({version:ver,generated:date,count:shots.length,shots},null,1));
console.log('done',ver,shots.length);
})();
