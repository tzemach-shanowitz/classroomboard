'use strict';
/* ===== Stage 3: Poll, Stickers, Image, Video, Web page, Link, Webcam ===== */
(function(){
const M=window.__more,K=window.__kit;if(!M||!K)return;const {mk,get,put}=M,{panel}=K;
const reopen=(id,fn)=>{Widgets.close(id);const sv=Store.get('w.'+id,null);if(sv){delete sv.w;delete sv.h;Store.set('w.'+id,sv)}fn()};
const bt=(t,f,c='',st='')=>h('button',{class:'pill '+c,style:st,onclick:f},t);
const alphaRow=id=>{const u=get(id+'.ui',{a:100});const v=h('span',{style:'min-width:56px;text-align:right;font-weight:700'},(100-u.a)+'%');return h('div',{},h('div',{class:'lbl'},'Transparency'),h('div',{class:'row',style:'align-items:center'},h('input',{type:'range',min:20,max:100,step:5,value:u.a,style:'flex:1;min-width:200px',oninput:e=>{u.a=+e.target.value;v.textContent=(100-u.a)+'%';put(id+'.ui',u);const o=Widgets.open[id];if(o)K.applyAlpha(id,o.el)}}),v))};
const ACC=['#6d5efc','#2f7de1','#2e9e5b','#f08a24','#e5484d','#e56bb0','#1b2430'];
function fsBtn(inst){let on=false,keep;return h('button',{class:'wbtn',title:'Full screen',style:'font-size:20px',onclick:()=>{const el=inst.el;if(!on){keep=el.getAttribute('style');el.style.cssText+=';left:0!important;top:0!important;width:100vw!important;height:100vh!important;border-radius:0;z-index:50';on=true}else{el.setAttribute('style',keep);on=false}}},'⛶')}
const addFs=inst=>inst.bar.insertBefore(fsBtn(inst),inst.bar.children[1]);
const driveId=u=>{const m=u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/);return m&&m[1]};
const norm=u=>{u=(u||'').trim();return u&&!/^https?:|^data:|^blob:/i.test(u)?'https://'+u:u};

/* ---------- Poll (teacher enters votes by tapping) ---------- */
function poll(){
  let s=Object.assign({q:'',o:[{n:'A',v:0},{n:'B',v:0},{n:'C',v:0}],chart:'bars',color:'#6d5efc'},get('poll',{}));const sv=()=>put('poll',s);
  mk('poll',{w:560,settings:()=>panel('Poll',s,[{t:'seg',k:'chart',label:'Results look',opts:[['bars','Bars'],['pie','Pie']]},{t:'color',k:'color',label:'Bar color',colors:ACC},{t:'note',label:'Votes are added by you, by tapping +. Letting students vote from their own devices needs an online voting page, which is not built.'},{t:'el',el:alphaRow('poll')}],()=>reopen('poll',poll),sv)},(b)=>{
    const area=h('div'),PAL=['#6d5efc','#2f7de1','#2e9e5b','#f08a24','#e5484d','#e56bb0'];
    const draw=()=>{area.innerHTML='';const tot=s.o.reduce((a,c)=>a+c.v,0);
      if(s.chart==='pie'){let a0=-Math.PI/2;const R=70;const paths=s.o.map((o,i)=>{if(!tot||!o.v)return '';const a1=a0+o.v/tot*2*Math.PI;const big=a1-a0>Math.PI?1:0;const d=o.v===tot?`<circle cx="80" cy="80" r="${R}" fill="${PAL[i%6]}"/>`:`<path d="M80 80 L${80+R*Math.cos(a0)} ${80+R*Math.sin(a0)} A${R} ${R} 0 ${big} 1 ${80+R*Math.cos(a1)} ${80+R*Math.sin(a1)}Z" fill="${PAL[i%6]}"/>`;a0=a1;return d}).join('');
        area.append(h('div',{style:'text-align:center',html:`<svg viewBox="0 0 160 160" width="180">${tot?paths:'<circle cx="80" cy="80" r="70" fill="#e8eaf2"/>'}</svg>`}))}
      s.o.forEach((o,i)=>{const col=s.chart==='pie'?PAL[i%6]:s.color;area.append(h('div',{style:'margin:8px 0'},h('div',{class:'row',style:'align-items:center;flex-wrap:nowrap'},h('input',{class:'inp',dir:'auto',value:o.n,style:'flex:1;font-size:22px;min-width:80px',onchange:e=>{o.n=e.target.value;sv()}}),h('b',{style:'font-size:32px;min-width:48px;text-align:center'},String(o.v)),h('span',{style:'min-width:46px;color:#778'},tot?Math.round(o.v/tot*100)+'%':''),bt('＋',()=>{o.v++;sv();draw()},'sel','font-size:22px;background:'+col),bt('−',()=>{o.v=Math.max(0,o.v-1);sv();draw()})),s.chart==='bars'?h('div',{style:'height:18px;border-radius:9px;background:#e8eaf2;overflow:hidden'},h('div',{style:`height:100%;width:${tot?o.v/tot*100:0}%;background:${col};border-radius:9px;transition:width .35s`})):null))})};
    b.append(h('input',{class:'inp',dir:'auto',placeholder:'Type your question',value:s.q,style:'width:100%;font-size:26px;font-weight:800;border:0;border-bottom:2px solid #e3e6ee;border-radius:0',onchange:e=>{s.q=e.target.value;sv()}}),area,h('div',{class:'row'},bt('＋ Answer',()=>{if(s.o.length<8){s.o.push({n:String.fromCharCode(65+s.o.length),v:0});sv();draw()}}),bt('Remove last',()=>{if(s.o.length>2){s.o.pop();sv();draw()}}),bt('Reset votes',()=>{s.o.forEach(o=>o.v=0);sv();draw()})));draw()})}

/* ---------- Stickers ---------- */
const svgS=(inner,vb='0 0 100 100')=>`<svg viewBox="${vb}" width="100%" height="100%">${inner}</svg>`;
const STK={
 'Stars':[['⭐'],['🌟'],['✨'],['💫'],['🏅'],['🥇'],['🏆']],
 'Marks':[[svgS('<circle cx="50" cy="50" r="44" fill="#2e9e5b"/><path d="M28 52l16 16 30-34" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),1],[svgS('<circle cx="50" cy="50" r="44" fill="#e5484d"/><path d="M32 32l36 36M68 32L32 68" stroke="#fff" stroke-width="12" stroke-linecap="round"/>'),1],[svgS('<circle cx="50" cy="50" r="44" fill="#f5c518"/><text x="50" y="68" text-anchor="middle" font-size="60" font-weight="900" font-family="system-ui" fill="#fff">!</text>'),1],[svgS('<circle cx="50" cy="50" r="44" fill="#2f7de1"/><text x="50" y="68" text-anchor="middle" font-size="60" font-weight="900" font-family="system-ui" fill="#fff">?</text>'),1]],
 'Arrows':[[svgS('<path d="M10 50h70M55 24l28 26-28 26" stroke="#e5484d" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),1],[svgS('<path d="M50 90V20M24 45l26-28 26 28" stroke="#2f7de1" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),1],[svgS('<path d="M20 20q50 0 50 50M48 56l22 22 18-24" stroke="#6d5efc" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),1],[svgS('<path d="M90 50H20M45 24L17 50l28 26" stroke="#2e9e5b" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),1]],
 'Smiles':[['😀'],['😊'],['🤩'],['😎'],['🤔'],['😴'],['🙌'],['🤫']],
 'Encourage':[['👍'],['👏'],['💪'],['🎉'],['❤️'],['🌈'],['🔥'],['💯'],['🙂']],
 'Learning':[['📚'],['✏️'],['📏'],['🔬'],['🌍'],['🧮'],['🎨'],['🎵'],['💡'],['⏰']],
 'Jewish':[['📖'],['🕎'],['🍎'],['🍯'],['🕯️'],['🌳'],['🍷'],['🎺'],['🐑'],['✡️']]};
let stLayer;
function layer(){if(!stLayer||!document.body.contains(stLayer)){stLayer=h('div',{id:'stickerlayer',style:'position:fixed;inset:0;pointer-events:none;z-index:6'});document.body.append(stLayer);stLayer._items=(get('stickers2',[])||[]);stLayer._items.forEach(addEl)}return stLayer}
let selEl=null,ctl;
const saveSt=()=>put('stickers2',stLayer._items.map(({c,x,y,s,r,svg})=>({c,x,y,s,r,svg})));
function select(it){selEl=it;[...stLayer.children].forEach(e=>{if(e.dataset.sticker)e.style.outline=e._it===it?'3px dashed #6d5efc':'none'});if(ctl)ctl.remove();ctl=null;if(!it)return;
  ctl=h('div',{style:`position:absolute;left:${it.x}px;top:${Math.max(4,it.y-52)}px;pointer-events:auto;background:#fff;border-radius:14px;padding:4px;display:flex;gap:4px;box-shadow:0 4px 16px #0003;z-index:7`},
    ...[['−',()=>{it.s=Math.max(30,it.s*0.85)}],['+',()=>{it.s=Math.min(500,it.s*1.18)}],['⟲',()=>{it.r-=15}],['⟳',()=>{it.r+=15}],['🗑',()=>{stLayer._items=stLayer._items.filter(x=>x!==it);it.el.remove();select(null);saveSt();return 1}],['✓',()=>{select(null);return 1}]].map(([l,f])=>h('button',{class:'pill',style:'min-width:44px;font-size:20px;background:#eef0f7;color:#1b2430',onclick:()=>{const stop=f();if(!stop){paintEl(it);saveSt();select(it)}}},l)));stLayer.append(ctl)}
function paintEl(it){const e=it.el;e.style.left=it.x+'px';e.style.top=it.y+'px';e.style.width=e.style.height=it.s+'px';e.style.fontSize=it.s*.8+'px';e.style.transform=`rotate(${it.r}deg)`}
function addEl(it){const e=h('div',{style:'position:absolute;pointer-events:auto;touch-action:none;cursor:grab;user-select:none;line-height:1;display:flex;align-items:center;justify-content:center;border-radius:10px'});e.dataset.sticker=1;e._it=it;it.el=e;
  if(it.svg)e.innerHTML=it.c;else e.textContent=it.c;paintEl(it);
  e.addEventListener('pointerdown',ev=>{ev.stopPropagation();e.setPointerCapture(ev.pointerId);const dx=ev.clientX-it.x,dy=ev.clientY-it.y;let moved=false;select(it);
    e.onpointermove=m=>{moved=true;it.x=m.clientX-dx;it.y=m.clientY-dy;paintEl(it);if(ctl){ctl.style.left=it.x+'px';ctl.style.top=Math.max(4,it.y-52)+'px'}};e.onpointerup=()=>{e.onpointermove=null;if(moved)saveSt()}});
  stLayer.append(e)}
function stickers(){
  layer();
  mk('stickers',{w:480,h:430,settings:null},(b,inst)=>{
    const cats=Object.keys(STK);let cur=get('stickers.cat',{c:cats[0]});const grid=h('div',{style:'display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:10px;max-height:230px;overflow:auto'});const tabs=h('div',{class:'row',style:'justify-content:center;gap:6px'});
    const draw=()=>{tabs.innerHTML='';cats.forEach(c=>tabs.append(h('button',{class:'pill'+(cur.c===c?' sel':''),style:'font-size:15px',onclick:()=>{cur.c=c;put('stickers.cat',cur);draw()}},c)));grid.innerHTML='';
      STK[cur.c].forEach(([c,isSvg])=>grid.append(h('button',{style:'width:72px;height:72px;border-radius:16px;border:2px solid #e3e6ee;background:#fff;font-size:42px;padding:8px;display:flex;align-items:center;justify-content:center',onclick:()=>{const it={c,svg:!!isSvg,x:innerWidth/2-60+Math.random()*100-50,y:innerHeight/2-60+Math.random()*100-50,s:120,r:0};stLayer._items.push(it);addEl(it);select(it);saveSt()},html:isSvg?c:null},isSvg?null:c)))};
    b.append(tabs,grid,h('div',{style:'text-align:center;font-size:14px;color:#889;margin-top:8px'},'Tap a sticker to place it. Drag to move. Tap one on the screen to resize, rotate or delete it.'),h('div',{class:'row',style:'justify-content:center'},bt('Clear all stickers',()=>{stLayer._items.forEach(i=>i.el.remove());stLayer._items=[];select(null);saveSt()})));draw()})}

/* ---------- Image ---------- */
function image(){
  let s=Object.assign({url:'',fit:'contain',rot:0,data:''},get('image',{}));const sv=()=>{try{put('image',s)}catch(e){}};let sess='';
  mk('image',{w:560,h:460,settings:()=>panel('Image',s,[{t:'seg',k:'fit',label:'Picture fits',opts:[['contain','Whole picture'],['cover','Fill the box']]},{t:'seg',k:'rot',label:'Rotate',opts:[[0,'0°'],[90,'90°'],[180,'180°'],[270,'270°']]},{t:'el',el:alphaRow('image')}],()=>{paint()},sv)},(b,inst)=>{
    b.style.cssText+=';display:flex;flex-direction:column;height:calc(100% - 4px)';const box=h('div',{style:'flex:1;min-height:120px;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:12px;background:#f4f5fa'});
    const src=()=>sess||s.data||(driveId(s.url||'')?'https://drive.google.com/thumbnail?id='+driveId(s.url)+'&sz=w2400':s.url);
    window.__paintImg=paint;function paint(){box.innerHTML='';const u=src();if(!u){box.append(h('div',{style:'color:#889;text-align:center;padding:20px;font-size:18px'},'Choose a picture, paste one (Ctrl+V), or enter a web address.'));return}
      const im=h('img',{src:u,style:`max-width:100%;max-height:100%;width:100%;height:100%;object-fit:${s.fit};transform:rotate(${s.rot}deg);${s.rot%180?'width:'+box.clientHeight+'px;height:'+box.clientWidth+'px;max-width:none;max-height:none;':''}`,onerror:()=>{box.innerHTML='';box.append(h('div',{style:'color:#c33;padding:16px;text-align:center'},'This picture would not load. For Google Drive, the file must be shared as "anyone with the link".'))}});box.append(im)}
    const setFile=f=>{if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,1600/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);const d=c.toDataURL('image/jpeg',.85);sess=d;s.url='';s.data=d.length<600000?d:'';sv();paint()};im.src=r.result};r.readAsDataURL(f)};
    const inp=h('input',{type:'file',accept:'image/*',style:'display:none',onchange:e=>setFile(e.target.files[0])});
    const onPaste=e=>{const f=[...(e.clipboardData?.files||[])].find(x=>x.type.startsWith('image/'));if(f){e.preventDefault();setFile(f)}};document.addEventListener('paste',onPaste);inst.cleanup=()=>document.removeEventListener('paste',onPaste);
    const url=h('input',{class:'inp',dir:'ltr',placeholder:'Image web address or Google Drive link',style:'flex:1;min-width:120px',value:s.url,onchange:e=>{s.url=norm(e.target.value);s.data='';sess='';sv();paint()}});
    b.append(box,h('div',{class:'row',style:'margin-top:8px;flex-wrap:nowrap;align-items:center'},bt('🖼️ Upload',()=>inp.click(),'sel'),url,bt('⟳',()=>{s.rot=(s.rot+90)%360;sv();paint()},'','min-width:44px')),inp,h('div',{style:'font-size:13px;color:#889'},'To write on the picture, use the pen button on the toolbar (the writing sits on top of the screen).'));addFs(inst);setTimeout(paint,50)})}

/* ---------- Video ---------- */
const ytId=u=>{const m=(u||'').match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);return m&&m[1]};
function video(){
  let s=Object.assign({url:''},get('video',{}));const sv=()=>put('video',s);
  mk('video',{w:680,h:470,settings:()=>panel('Video',s,[{t:'note',label:'Paste a YouTube link, a Google Drive video link, or a direct video file address (.mp4 / .webm). You can also upload a video from this device (it plays for this session only). Videos whose owners block embedding will not play inside the page.'},{t:'el',el:alphaRow('video')}],()=>{},sv)},(b,inst)=>{
    b.style.cssText+=';display:flex;flex-direction:column;height:calc(100% - 4px)';const box=h('div',{style:'flex:1;border-radius:12px;overflow:hidden;background:#000;min-height:120px'});let objUrl;
    const show=u=>{box.innerHTML='';if(!u){box.append(h('div',{style:'color:#aab;text-align:center;padding:40px;font-size:18px'},'Paste a video link or upload a video.'));return}
      const y=ytId(u),d=driveId(u);let el;
      if(y)el=h('iframe',{src:'https://www.youtube-nocookie.com/embed/'+y+'?rel=0',allow:'autoplay; fullscreen; picture-in-picture',allowfullscreen:'',style:'width:100%;height:100%;border:0'});
      else if(d)el=h('iframe',{src:'https://drive.google.com/file/d/'+d+'/preview',allow:'autoplay; fullscreen',allowfullscreen:'',style:'width:100%;height:100%;border:0'});
      else el=h('video',{src:u,controls:'',playsinline:'',style:'width:100%;height:100%;background:#000',onerror:()=>{box.innerHTML='';box.append(h('div',{style:'color:#f99;padding:20px;text-align:center'},'That video would not play. Check the link, or use a YouTube link.'))}});box.append(el)};
    const file=h('input',{type:'file',accept:'video/*',style:'display:none',onchange:e=>{const f=e.target.files[0];if(!f)return;if(objUrl)URL.revokeObjectURL(objUrl);objUrl=URL.createObjectURL(f);show(objUrl)}});
    const url=h('input',{class:'inp',dir:'ltr',placeholder:'YouTube, Drive or video link',value:s.url,style:'flex:1;min-width:120px',onchange:e=>{s.url=norm(e.target.value);sv();show(s.url)}});
    inst.cleanup=()=>{if(objUrl)URL.revokeObjectURL(objUrl)};
    b.append(box,h('div',{class:'row',style:'margin-top:8px;flex-wrap:nowrap'},bt('🎬 Upload',()=>file.click(),'sel'),url),file);addFs(inst);show(s.url)})}

/* ---------- Embed a web page ---------- */
const BLOCK=/(^|\.)(google\.com|facebook\.com|instagram\.com|twitter\.com|x\.com|linkedin\.com|amazon\.com|netflix\.com|github\.com|paypal\.com|whatsapp\.com|zoom\.us)$/i;
function embed(){
  let s=Object.assign({url:''},get('embed',{}));const sv=()=>put('embed',s);
  mk('embed',{w:800,h:560,settings:()=>panel('Web page',s,[{t:'note',label:'Many sites do not allow being shown inside another page. When that happens you get an "Open in a new tab" button instead of a blank box.'},{t:'el',el:alphaRow('embed')}],()=>{},sv)},(b,inst)=>{
    b.style.cssText+=';display:flex;flex-direction:column;height:calc(100% - 4px)';const box=h('div',{style:'flex:1;border-radius:12px;overflow:hidden;background:#fff;border:1px solid #e3e6ee;position:relative;min-height:120px'});
    const load=()=>{box.innerHTML='';let u=norm(s.url);if(!u){box.append(h('div',{style:'color:#889;text-align:center;padding:40px;font-size:18px'},'Enter a web address above.'));return}
      const y=ytId(u);if(y)u='https://www.youtube-nocookie.com/embed/'+y;
      let host='';try{host=new URL(u).hostname}catch(e){box.append(h('div',{style:'color:#c33;padding:20px'},'That is not a valid web address.'));return}
      const alt=why=>{box.innerHTML='';box.append(h('div',{style:'padding:30px;text-align:center'},h('div',{style:'font-size:20px;margin-bottom:12px'},why),h('a',{href:norm(s.url),target:'_blank',rel:'noopener',class:'pill sel',style:'text-decoration:none;display:inline-block;font-size:20px;padding:12px 24px'},'Open in a new tab')))};
      if(BLOCK.test(host)&&!y){alt(host+' does not allow being shown inside another page.');return}
      const f=h('iframe',{src:u,allow:'fullscreen',style:'width:100%;height:100%;border:0',referrerpolicy:'no-referrer'});box.append(f,h('div',{style:'position:absolute;right:8px;bottom:8px'},h('a',{href:norm(s.url),target:'_blank',rel:'noopener',style:'font-size:13px;background:#fffd;border-radius:10px;padding:4px 10px;color:#334;text-decoration:none;box-shadow:0 1px 6px #0003'},'Blank? Open in a new tab ↗')))};
    const url=h('input',{class:'inp',dir:'ltr',placeholder:'Web address',value:s.url,style:'flex:1;min-width:120px',onchange:e=>{s.url=e.target.value.trim();sv();load()}});
    b.append(h('div',{class:'row',style:'flex-wrap:nowrap;margin-bottom:8px'},url,bt('Go',()=>{s.url=url.value.trim();sv();load()},'sel'),bt('⟳',load,'','min-width:44px')),box);addFs(inst);load()})}

/* ---------- Link (shortcut tiles) ---------- */
function link(){
  let s=Object.assign({items:[],size:'m',open:'tab'},get('link',{}));const sv=()=>put('link',s);
  mk('link',{w:520,settings:()=>panel('Links',s,[{t:'seg',k:'size',label:'Button size',opts:[['s','Small'],['m','Medium'],['l','Large']]},{t:'seg',k:'open',label:'Opens',opts:[['tab','In a new tab'],['here','Inside ClassroomBoard (if the site allows)']]},{t:'el',el:alphaRow('link')}],()=>reopen('link',link),sv)},(b)=>{
    const E=['🔗','📚','🌐','🎬','📝','🧮','🎵','🎨','⭐','🏫'];const PX={s:84,m:112,l:150}[s.size];const grid=h('div',{style:'display:flex;flex-wrap:wrap;gap:12px;justify-content:center'});
    const edit=(it,i)=>modal(it?'Edit link':'New link',m=>{const d=it?{...it}:{n:'',u:'',e:'🔗',c:ACC[0]};
      m.append(h('div',{class:'lbl'},'Name'),h('input',{class:'inp',dir:'auto',value:d.n,style:'width:100%',oninput:e=>d.n=e.target.value}),h('div',{class:'lbl'},'Web address'),h('input',{class:'inp',dir:'ltr',value:d.u,style:'width:100%',placeholder:'example.com',oninput:e=>d.u=e.target.value}),h('div',{class:'lbl'},'Icon'),h('div',{class:'row'},...E.map(x=>h('button',{class:'pill',style:'font-size:26px',onclick:()=>{d.e=x;toast('Icon: '+x)}},x))),h('div',{class:'lbl'},'Color'),h('div',{class:'row'},...ACC.map(c=>h('button',{style:`width:38px;height:38px;border-radius:50%;background:${c};border:3px solid #d8dce8`,onclick:()=>{d.c=c;toast('Color chosen')}}))),
        h('div',{class:'row',style:'margin-top:12px'},bt('Save',()=>{if(!d.u.trim())return;d.u=norm(d.u);d.n=d.n||d.u.replace(/^https?:\/\/(www\.)?/,'').split('/')[0];if(it)s.items[i]=d;else s.items.push(d);sv();Widgets.close('link');link();document.querySelector('#modal-root .scrim')?.remove()},'sel'),it?bt('Delete',()=>{s.items.splice(i,1);sv();Widgets.close('link');link();document.querySelector('#modal-root .scrim')?.remove()}):null))});
    const draw=()=>{grid.innerHTML='';s.items.forEach((it,i)=>{const t=h('div',{style:`position:relative;width:${PX}px`},
      h('button',{style:`width:${PX}px;height:${PX}px;border-radius:24px;border:0;background:${it.c};color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;box-shadow:0 6px 16px ${it.c}55`,onclick:()=>{if(s.open==='here'){Widgets.close('embed');Store.set('w2.embed',{url:it.u});M.FN.embed()}else window.open(it.u,'_blank','noopener')}},h('div',{style:`font-size:${PX*.4}px;line-height:1`},it.e),h('div',{dir:'auto',style:`font-size:${Math.max(12,PX*.14)}px;font-weight:700;padding:0 6px;overflow:hidden;max-width:100%;white-space:nowrap;text-overflow:ellipsis`},it.n)),
      h('button',{'aria-label':'Edit',style:'position:absolute;top:-6px;right:-6px;width:30px;height:30px;border-radius:50%;border:0;background:#fff;box-shadow:0 1px 6px #0004;font-size:14px',onclick:()=>edit(it,i)},'✎'));grid.append(t)});
      grid.append(h('button',{style:`width:${PX}px;height:${PX}px;border-radius:24px;border:3px dashed #c7cbe0;background:#fafbff;color:#889;font-size:${PX*.35}px`,onclick:()=>edit(null)},'＋'))};
    b.append(grid);draw();if(!s.items.length)setTimeout(()=>edit(null),200)})}

/* ---------- Webcam ---------- */
function webcam(){
  let s=Object.assign({dev:'',mirror:false,rot:0,zoom:1},get('webcam',{}));const sv=()=>put('webcam',s);let stream,vid;
  const apply=()=>{if(vid)vid.style.transform=`scale(${s.mirror?-1:1},1) rotate(${s.rot}deg) scale(${s.zoom})`};
  const open=async()=>{let devs=[];try{devs=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='videoinput')}catch(e){}
    panel('Webcam',s,[devs.length>1?{t:'sel',k:'dev',label:'Camera',opts:[['','Default'],...devs.map((d,i)=>[d.deviceId,d.label||'Camera '+(i+1)])]}:{t:'note',label:'Camera choice appears here when more than one camera is available.'},{t:'sw',k:'mirror',label:'Mirror the picture'},{t:'seg',k:'rot',label:'Rotate',opts:[[0,'0°'],[90,'90°'],[180,'180°'],[270,'270°']]},{t:'range',k:'zoom',label:'Zoom',min:1,max:4,step:.1,fmt:v=>v.toFixed(1)+'×'},{t:'note',label:'The camera picture stays on this device. Nothing is recorded or sent.'},{t:'el',el:alphaRow('webcam')}],()=>{if(s.dev!==curDev){reopen('webcam',webcam)}else apply()},sv)};
  let curDev=s.dev;
  mk('webcam',{w:560,h:440,settings:open},(b,inst)=>{
    b.style.cssText+=';display:flex;flex-direction:column;height:calc(100% - 4px)';const box=h('div',{style:'flex:1;border-radius:12px;overflow:hidden;background:#000;position:relative;min-height:120px'});vid=h('video',{autoplay:'',playsinline:'',muted:'',style:'width:100%;height:100%;object-fit:contain;transition:transform .2s'});const msg=h('div',{style:'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#cbd;text-align:center;padding:20px;font-size:18px'});box.append(vid,msg);
    const stop=()=>{try{stream&&stream.getTracks().forEach(t=>t.stop())}catch(e){}stream=null};inst.cleanup=stop;
    const start=async()=>{msg.textContent='Starting camera...';if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){msg.textContent='This browser cannot use a camera here.';return}
      try{stream=await navigator.mediaDevices.getUserMedia({video:s.dev?{deviceId:{exact:s.dev},width:{ideal:1920}}:{width:{ideal:1920}}});vid.srcObject=stream;msg.textContent='';goBtn.textContent='⏹ Stop camera';apply()}
      catch(e){msg.innerHTML='';msg.append(h('div',{},(e&&e.name==='NotAllowedError')?'The camera is blocked. Allow it for this site in the browser.':'No camera found, or it is in use.',h('div',{style:'margin-top:10px'},bt('Try again',start,'sel'))))}};
    const goBtn=bt('⏹ Stop camera',()=>{if(stream){stop();vid.srcObject=null;msg.textContent='Camera is off.';goBtn.textContent='▶ Start camera'}else start()},'sel');
    b.append(box,h('div',{class:'row',style:'justify-content:center;margin-top:8px'},goBtn,bt('Mirror',()=>{s.mirror=!s.mirror;sv();apply()}),bt('⟳ Rotate',()=>{s.rot=(s.rot+90)%360;sv();apply()}),bt('−',()=>{s.zoom=Math.max(1,+(s.zoom-.2).toFixed(1));sv();apply()}),bt('＋ Zoom',()=>{s.zoom=Math.min(4,+(s.zoom+.2).toFixed(1));sv();apply()})));addFs(inst);start()})}

Object.assign(M.FN,{poll,stickers,image,video,embed,link,webcam});
/* put saved stickers back on the screen at start */
addEventListener('load',()=>setTimeout(()=>{if(window.__demo)return;try{if((get('stickers2',[])||[]).length)layer()}catch(e){}},1500));
})();
