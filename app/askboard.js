/* Ask the Board: say or type a change, see it on the live board. Stage 1: built-in interpreter
   (no outside service). It returns structured changes, they are validated, applied, and can be undone. */
(function(){
if(window.__demo||!window.__sc)return;
const S=window.__sc,cfg=S.cfg,Widgets=S.Widgets;
const $=q=>document.querySelector(q);
const st=document.createElement('style');st.textContent=`
#askp{position:fixed;left:50%;transform:translateX(-50%);z-index:70;width:min(600px,calc(100vw - 24px));background:rgba(250,250,252,.97);color:#1c1c1e;border-radius:22px;box-shadow:0 18px 50px rgba(0,0,0,.35);padding:14px 14px 12px;font:16px -apple-system,Inter,system-ui,sans-serif;direction:ltr;text-align:left;display:flex;flex-direction:column;gap:10px;-webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px)}
#askp .ar{display:flex;gap:8px;align-items:center}
#askp input,#askp textarea{flex:1;min-width:0;font:inherit;font-size:18px;padding:13px 14px;border:1.5px solid #d6d6dc;border-radius:14px;background:#fff;color:#1c1c1e;outline:none}
#askp input:focus,#askp textarea:focus{border-color:#6858f8}
#askp button{font:inherit;cursor:pointer;border:0;border-radius:14px;min-height:48px;padding:0 16px;font-weight:600;background:#ececf0;color:#1c1c1e}
#askp button.pri{background:#6858f8;color:#fff}
#askp button.mic{width:52px;padding:0;font-size:22px}
#askp button.mic.on{background:#e5484d;color:#fff;animation:askpulse 1s infinite}
@keyframes askpulse{50%{box-shadow:0 0 0 8px rgba(229,72,77,.25)}}
#askp .am{font-size:15px;line-height:1.4;color:#333;white-space:pre-line}
#askp .am ul{margin:4px 0 0;padding-left:20px}
#askp .am.bad{color:#8a4b00}
#askp .hint{font-size:13px;color:#888}
#askp .x{min-height:40px;width:40px;padding:0;background:none;font-size:20px;color:#666}
`;document.head.append(st);
const h=(t,a,...k)=>{const e=document.createElement(t);for(const x in a||{})x==='class'?e.className=a[x]:x.startsWith('on')?e[x]=a[x]:e.setAttribute(x,a[x]);k.flat().forEach(c=>c!=null&&e.append(c.nodeType?c:document.createTextNode(c)));return e};

/* ---------- vocabulary ---------- */
const TOOLWORDS={whiteboard:['whiteboard','white board','board page'],timer:['timer','countdown','clock timer'],picker:['name picker','picker','randomizer','random name','who is next','next student'],traffic:['traffic light','traffic'],sound:['sound level','sound meter','noise','sound'],text:['text box','text'],schedule:['schedule','daily schedule','agenda','calendar','timetable','day plan','lesson plan'],supplies:['supplies'],library:['library','pdfs','pdf','files'],presentations:['slides','slideshows','slideshow','presentations','presentation','slide'],wheel:['wheel','spinner','spin the wheel'],behavior:['behavior','stars','behaviour'],anno:['marker','pen','highlighter','write on screen','draw','annotate','annotation'],full:['full screen','fullscreen'],home:['home','reset'],cast:['screen share','cast','share screen'],more:['more'],ask:['ask the board','assistant'],audio:['audio','mincha']};
const WIDGETIDS=['timer','picker','traffic','sound','text','schedule','supplies','wheel','behavior','audio','cast'];
const names=[];for(const id in TOOLWORDS)TOOLWORDS[id].forEach(w=>names.push([w,id]));names.sort((a,b)=>b[0].length-a[0].length);
const findTools=t=>{const out=[];let s=' '+t+' ';const hits=[];for(const[w,id]of names){const re=new RegExp('(^|[^a-z])'+w.replace(/ /g,'\\s+')+'s?(?![a-z])','g');let m;while((m=re.exec(s))){hits.push([m.index,id,m.index+m[0].length]);}}
  hits.sort((a,b)=>a[0]-b[0]);const used=[];for(const x of hits){if(used.some(u=>x[0]<u[1]&&x[2]>u[0]))continue;used.push([x[0],x[2]]);if(!out.includes(x[1]))out.push(x[1])}return out};
const SIMPLE=['whiteboard','timer','picker','anno','settings','ask'];
const WHERE=[['top right','tr'],['top left','tl'],['bottom right','br'],['bottom left','bl'],['upper right','tr'],['upper left','tl'],['lower right','br'],['lower left','bl'],['top','t'],['bottom','b'],['left','l'],['right','r'],['center','c'],['middle','c'],['corner','tr']];
const whereOf=t=>{for(const[w,c]of WHERE)if(t.includes(w))return c;return null};
const factor=t=>/\b(much|way|a lot|huge|very)\b/.test(t)?1.5:/\b(a bit|a little|slightly|bit)\b/.test(t)?1.15:1.3;


/* settings that are not toolbar/widget layout: language, theme, date, time format, labels, size */
const LANGS=[['yiddish','yi'],['yidish','yi'],['יידיש','yi'],['אידיש','yi'],['hebrew','he'],['ivrit','he'],['עברית','he'],['english','en'],['אנגלית','en']];
const langOf=t=>{for(const[w,l]of LANGS)if(t.includes(w))return l;return null};
const COLORS={blue:'#0a84ff',purple:'#7d5cff',violet:'#7d5cff',green:'#1fa35b',orange:'#ff8a1f',pink:'#e5487f',red:'#e5487f',gray:'#6e6e73',grey:'#6e6e73'};
function settingsClause(c,res){const T=c,ch=res.changes;
  const lang=langOf(T);
  if(lang&&/\b(language|switch|change|set|use|speak|translate|make|turn|show|in)\b|עברית|יידיש|אנגלית/.test(T)&&!/\bdate\b/.test(T)){
    const stu=/\b(student|students|kids|children|class|classroom|pupils|wording|headings|messages)\b/.test(T);
    const both=/\b(everything|all of it|whole|entire|board)\b/.test(T);
    if(stu||both)ch.push({op:'content_lang',lang});
    if(!stu||both)ch.push({op:'ui_lang',lang});
    return true}
  if(/\blanguage\b/.test(T)){res.notes.push('Which language? Say "switch to Hebrew", "Yiddish" or "English".');return true}
  if(/\b(dark mode|night mode|dark theme|dark screen)\b|\b(use|switch to|make it|turn on) dark\b/.test(T)&&!/background|wallpaper/.test(T)){ch.push({op:'ui_theme',v:'dark'});return true}
  if(/\b(light mode|day mode|light theme|bright mode)\b|\b(use|switch to) light\b/.test(T)&&!/background|wallpaper/.test(T)){ch.push({op:'ui_theme',v:'light'});return true}
  if(/\b(auto|automatic|system) (mode|theme)\b|\bmatch (my|the) (device|system)\b/.test(T)){ch.push({op:'ui_theme',v:'system'});return true}
  if(/\b(accent|button|highlight|theme) colou?r\b|\bcolou?r (of )?(the )?(buttons?|accent)\b/.test(T)||/\bmake (the )?(buttons?|accent) /.test(T)){for(const k in COLORS)if(T.includes(k)){ch.push({op:'ui_accent',v:COLORS[k]});return true}res.notes.push('Colors I can use: blue, purple, green, orange, pink or gray.');return true}
  if(/\b(menus?|settings|interface|everything|screen|buttons?|text|ui)\b.*\b(bigger|larger|huge|easier to (see|read|tap))\b|\bsmart ?board\b.*\b(bigger|larger)\b|\bmake (everything|it all) (bigger|larger)\b/.test(T)&&!/toolbar|bottom bar|\bbar\b/.test(T)&&!findTools(T).filter(x=>x!=='settings'&&x!=='text').length){ch.push({op:'ui_size',v:'lg'});return true}
  if(/\b(menus?|settings|interface|everything)\b.*\b(smaller|tiny|compact)\b|\bmake (everything|it all) smaller\b/.test(T)){ch.push({op:'ui_size',v:'sm'});return true}
  if(/\b(standard|normal|default|regular) (size|sizes)\b|\bsize back to normal\b/.test(T)&&!/timer|clock/.test(T)){ch.push({op:'ui_size',v:'std'});return true}
  if(/\b(tool |toolbar |button |icon )?labels?\b|\bnames under\b|\bwords under\b/.test(T)&&/\b(show|add|turn on|display|with|need|want|see)\b|\b(hide|remove|turn off|without|no)\b/.test(T)){ch.push({op:'ui_labels',on:!/\b(hide|remove|turn off|without|no|don.?t)\b/.test(T)});return true}
  // date line on the clock
  if(/\b(dates?|hebrew date|jewish date|english date|gregorian|secular date|day of the week)\b/.test(T)&&!/\bschedule\b/.test(T)){
    let v=null;
    if(/\b(hide|remove|turn off|no|without|get rid of|dont show|do not show)\b/.test(T)&&!/\b(only|just)\b/.test(T))v='none';
    else if(/\b(both|two dates|hebrew and english|english and hebrew)\b/.test(T))v='both';
    else if(/\b(english|regular|normal|gregorian|secular|civil|standard|regular)\b/.test(T))v='std';
    else if(/\b(hebrew|jewish)\b/.test(T))v='heb';
    else if(/\b(show|turn on|bring back|add|display|put back)\b/.test(T))v=(cfg.clock.date&&cfg.clock.date!=='none')?cfg.clock.date:'std';
    if(v){ch.push({op:'clock_date',v});if(/\b(show|turn on|bring back|add|display|put back|only|just)\b/.test(T)&&!cfg.clock.visible)ch.push({op:'clock_vis',on:true});return true}
    res.notes.push('For the date I can show the Hebrew date, the English date, both, or hide it.');return true}
  if(/\b(24 ?-?(hour|hr)|military time|24h)\b/.test(T)){ch.push({op:'clock_h12',on:false});return true}
  if(/\b(12 ?-?(hour|hr)|12h|regular time|normal time)\b/.test(T)&&!/\bam\b/.test(T)){ch.push({op:'clock_h12',on:true});return true}
  if(/\b(am ?\/? ?pm|a\.m\.|am and pm)\b/.test(T)){ch.push({op:'clock_ampm',on:!/\b(hide|remove|turn off|no|without|dont|don.?t)\b/.test(T)});return true}
  if(/\b(seconds)\b/.test(T)&&/\bclock\b/.test(T)){res.notes.push('The clock shows hours and minutes. Seconds are not available yet.');return true}
  return false}

/* ---------- interpreter: text -> structured changes ---------- */
let lastTarget=null;
function interpret(raw){
  const text=raw.toLowerCase().replace(/[“”"']/g,'').replace(/\s+/g,' ').trim();
  const res={changes:[],notes:[],unsupported:[],answer:null,apply:null};
  if(!text)return res;
  if(/^(undo|undo that|undo what i just changed|go back|revert)\b/.test(text)){res.changes.push({op:'undo'});return res}
  if(/\b(simpler|simple|less cluttered|too many buttons|clean(er)?)\b/.test(text)&&/(\?|how|can you|what)/.test(text)&&!/^(make|put|hide)/.test(text)){
    res.answer='A simpler board shows only the tools you use most. I can keep Whiteboard, Timer, Name picker and Marker on the bar, hide the rest, and keep Settings and Ask the Board. Nothing is deleted. You can bring any tool back.';
    res.apply=[{op:'tb_only',ids:SIMPLE}];return res}
  if(/^(make|put|set|can you make|please make|i want|i need)\b.*\b(board|screen|it)\b.*\b(simpler|simple|cleaner|less cluttered|easier)\b/.test(text)&&!/\bhow\b/.test(text)){res.changes.push({op:'tb_only',ids:SIMPLE});return res}
  if(/\b(make me|build me|create (me )?a|i wish|can you build|new tool|a game|spelling|quiz|bingo)\b/.test(text)&&!/\b(make (it|this|the|my) )/.test(text)){
    res.unsupported.push({text:raw,why:'a new tool'});return res}
  const clauses=text.split(/\s*(?:,|;|\.|\bthen\b|\band also\b|\band then\b|\bplus\b|\band\b(?= (?:make|put|hide|show|move|use|turn|set|bring))|\band\b(?= (?:the|my) [a-z ]{2,20}? (?:bigger|smaller|larger)\b))\s*/).filter(Boolean);
  // "put my A, B and C on the bottom bar" style lists can be broken by the comma split, so handle them first
  const list=text.match(/(?:put|keep|show|have|use)\s+(?:only\s+)?(?:my\s+)?(.+?)\s+(?:on|in)\s+(?:the\s+)?(?:bottom\s+|top\s+)?(?:bar|toolbar)/);
  let handledList=false;
  if(list){const ids=findTools(list[1]);if(ids.length){res.changes.push({op:'tb_order',ids});handledList=true;if(/\b(hide|remove) (all )?(the )?(other|rest|everything else)/.test(text)||/\bonly\b/.test(text))res.changes.push({op:'tb_only',ids:ids.concat(['settings','ask'])});}}
  for(const c of clauses){
    if(handledList&&/\b(put|keep|show|have|use)\b/.test(c)&&!/\b(clock|background|timer|picker|wheel|bigger|smaller|move)\b/.test(c.replace(list[1],'')))continue;
    const tools=findTools(c);let tgt=tools[0]||null;
    if(/\b(it|this|that)\b/.test(c)&&!tgt)tgt=lastTarget;
    if(tgt&&!/\b(other|rest)\b/.test(c))lastTarget=tgt;
    let done=settingsClause(c,res);
    if(done){}else if(/\b(other|rest|everything else)\b/.test(c)&&/\b(hide|remove)\b/.test(c)){if(!handledList)res.notes.push('Say which tools to keep, for example "keep the timer and slides, hide the rest".');done=true}
    else if(tools.length&&/\b(only|just)\b/.test(c)&&/\b(show|keep|have|want|need|see|use)\b/.test(c)&&!/\bbar\b.*\b(top|bottom|left|right)\b.*\bmove\b/.test(c)){res.changes.push({op:'tb_only',ids:tools.concat(['settings','ask'])});done=true}
    else if(/\bhide (the )?(toolbar|bar)\b|\bhide .*until i need/.test(c)){res.changes.push({op:'tb_hide_now'});res.changes.push({op:'tb_autohide',on:true});done=true}
    else if(/\b(keep|pin) (the )?(toolbar|bar)\b.*\b(visible|open|showing)|\bpin (the )?(toolbar|bar)/.test(c)){res.changes.push({op:'tb_autohide',on:false});done=true}
    else if(/\btoolbar|\bbottom bar\b|\bbuttons?\b/.test(c)&&/\b(bigger|larger|smaller)\b/.test(c)&&!tools.length){res.changes.push({op:'tb_size',f:/smaller/.test(c)?1/factor(c):factor(c)});done=true}
    else if(/\btoolbar|\bbar\b/.test(c)&&whereOf(c)&&/\b(top|bottom|left|right)\b/.test(c)&&/\b(move|put|place|at)\b/.test(c)&&!tools.length){const w=whereOf(c);if(['t','b','l','r'].includes(w)){res.changes.push({op:'tb_pos',pos:{t:'top',b:'bottom',l:'left',r:'right'}[w]});done=true}}
    else if(/\bclock\b/.test(c)&&!/timer|countdown/.test(c)){
      if(/\b(hide|remove|turn off)\b/.test(c))res.changes.push({op:'clock_vis',on:false});
      else if(/\b(show|bring back|turn on|put back)\b/.test(c)&&!whereOf(c))res.changes.push({op:'clock_vis',on:true});
      else if(/\b(bigger|larger|increase)\b/.test(c))res.changes.push({op:'clock_size',f:factor(c)});
      else if(/\b(smaller|tiny|decrease|less)\b/.test(c))res.changes.push({op:'clock_size',f:1/factor(c)});
      else if(whereOf(c)&&['tr','tl','br','bl'].includes(whereOf(c)))res.changes.push({op:'clock_pos',pos:whereOf(c)});
      else res.notes.push('I did not catch what to do with the clock. Try "make the clock smaller".');
      done=true}
    else if(/\b(background|wallpaper|backdrop|picture)\b|\bcalm\b|\bdarker\b|\bbrighter\b|\bblur\b/.test(c)&&!tools.length){
      if(/\bcalm|quiet|soft|relax|peaceful/.test(c))res.changes.push({op:'bg',dim:.32,blur:3,brightness:.95});
      else if(/\bdark/.test(c))res.changes.push({op:'bg',dim:.45});
      else if(/\bbright|light/.test(c))res.changes.push({op:'bg',dim:0,brightness:1.05});
      else if(/\bblur/.test(c))res.changes.push({op:'bg',blur:/no|remove|less|sharp/.test(c)?0:6});
      else if(/\bplain|simple|solid/.test(c))res.changes.push({op:'bg',dim:.4,blur:10});
      else res.notes.push('I can make the background calmer, darker, brighter or blurrier.');
      done=true}
    else if(tgt&&/\b(bigger|larger|enlarge|increase|zoom in)\b/.test(c)&&WIDGETIDS.includes(tgt)){res.changes.push({op:'w_size',id:tgt,f:factor(c)});done=true}
    else if(tgt&&/\b(smaller|shrink|decrease|zoom out|reduce)\b/.test(c)&&WIDGETIDS.includes(tgt)){res.changes.push({op:'w_size',id:tgt,f:1/factor(c)});done=true}
    if(!done&&tgt&&WIDGETIDS.includes(tgt)&&/\b(move|put|place|shift|slide)\b/.test(c)&&(whereOf(c)||/cover|block|in the way|out of the way/.test(c))){res.changes.push({op:'w_move',id:tgt,where:whereOf(c)||'tr'});done=true}
    if(!done&&/\bmove|out of the way|doesnt cover|does not cover|covering|in the way/.test(c)&&(tgt||lastTarget)&&WIDGETIDS.includes(tgt||lastTarget)){res.changes.push({op:'w_move',id:tgt||lastTarget,where:whereOf(c)||'tr'});done=true}
    if(!done&&/\b(hide|remove|take away|get rid of|turn off)\b|\b(turn|switch) .* off\b/.test(c)&&tools.length){tools.forEach(id=>res.changes.push({op:'tb_hide',id}));done=true}
    else if(!done&&/\b(put back|bring back|show|add|unhide|turn on|restore)\b|\b(turn|switch) .* on\b/.test(c)&&tools.length&&!list){tools.forEach(id=>res.changes.push({op:'tb_show',id}));done=true}
    else if(!done&&/\b(first|to the front|at the start|left of)\b/.test(c)&&tools.length){res.changes.push({op:'tb_first',id:tools[0]});done=true}
    else if(!done&&/\b(last|at the end|to the end)\b/.test(c)&&tools.length){res.changes.push({op:'tb_last',id:tools[0]});done=true}
    if(!done&&!(handledList&&tools.length)){if(c.length>2&&!/^(please|ok|okay|and|also|hi|hey)$/.test(c))res.unsupported.push({text:c,why:'unclear'})}
  }
  return res}

/* ---------- validate + apply ---------- */
const ok=(id)=>typeof id==='string'&&S.TOOLS[id];
function validate(ch){const out=[];for(const c of ch){
  switch(c.op){
   case 'undo':case 'tb_hide_now':out.push(c);break;
   case 'tb_show':case 'tb_hide':case 'tb_first':case 'tb_last':if(ok(c.id))out.push(c);break;
   case 'tb_only':case 'tb_order':{const ids=(c.ids||[]).filter(ok);if(ids.length)out.push({op:c.op,ids});break}
   case 'tb_pos':if(['top','bottom','left','right'].includes(c.pos))out.push(c);break;
   case 'tb_size':out.push({op:c.op,f:Math.min(1.6,Math.max(.6,+c.f||1))});break;
   case 'tb_autohide':out.push({op:c.op,on:!!c.on});break;
   case 'w_size':if(WIDGETIDS.includes(c.id))out.push({op:c.op,id:c.id,f:Math.min(2,Math.max(.5,+c.f||1))});break;
   case 'w_move':if(WIDGETIDS.includes(c.id))out.push(c);break;
   case 'clock_size':out.push({op:c.op,f:Math.min(2,Math.max(.4,+c.f||1))});break;
   case 'ui_lang':case 'content_lang':if(['en','he','yi'].includes(c.lang))out.push(c);break;
   case 'ui_theme':if(['light','dark','system'].includes(c.v))out.push(c);break;
   case 'ui_accent':if(/^#[0-9a-f]{6}$/i.test(c.v))out.push(c);break;
   case 'ui_size':if(['sm','std','lg'].includes(c.v))out.push(c);break;
   case 'ui_labels':case 'clock_h12':case 'clock_ampm':out.push({op:c.op,on:!!c.on});break;
   case 'clock_date':if(['heb','std','both','none'].includes(c.v))out.push(c);break;
   case 'clock_vis':out.push({op:c.op,on:!!c.on});break;
   case 'clock_pos':if(['tr','tl','br','bl'].includes(c.pos))out.push(c);break;
   case 'bg':{const o={op:'bg'};['dim','blur','brightness'].forEach(k=>{if(typeof c[k]==='number')o[k]=Math.min(k==='blur'?20:k==='dim'?.8:1.3,Math.max(0,c[k]))});out.push(o);break}
  }}return out}
const snap=()=>{const wd={};for(const id in Widgets.open){const i=Widgets.open[id];wd[id]={x:i.w.x,y:i.w.y,w:i.w.w,h:i.w.h}}return{cfg:JSON.stringify(cfg),wd}};
const history=[];
function restore(sn){const c=JSON.parse(sn.cfg);for(const k of Object.keys(cfg))if(!(k in c))delete cfg[k];Object.assign(cfg,c);
  for(const id in sn.wd){const i=Widgets.open[id];if(!i)continue;Object.assign(i.w,sn.wd[id]);place(i)}
  if(window.__applyUi)window.__applyUi();S.renderToolbar();S.renderClock();S.renderBg()}
function place(i){const w=i.w,el=i.el;if(w.x!=null)el.style.left=w.x+'px';if(w.y!=null)el.style.top=w.y+'px';if(w.w)el.style.width=w.w+'px';if(w.h)el.style.height=w.h+'px'}
const tbH=()=>(cfg.toolbar.size||72)+40;
function moveWidget(id,where){const i=Widgets.open[id];if(!i)return false;const el=i.el,W=innerWidth,H=innerHeight,w=el.offsetWidth,hh=el.offsetHeight,m=20;const top=(cfg.toolbar.pos==='top')?tbH():m,bot=H-hh-((cfg.toolbar.pos==='bottom')?tbH():m);
  let x=i.w.x,y=i.w.y;const L=m,R=W-w-m,C=(W-w)/2,T=Math.max(top,m),B=Math.max(bot,T);
  const map={tr:[R,T],tl:[L,T],br:[R,B],bl:[L,B],t:[C,T],b:[C,B],l:[L,(T+B)/2],r:[R,(T+B)/2],c:[C,(T+B)/2]};const p=map[where];if(!p)return false;x=p[0];y=p[1];
  i.w.x=Math.round(x);i.w.y=Math.round(y);place(i);return true}
function applyOne(c,msgs){const t=cfg.toolbar;
  switch(c.op){
   case 'tb_hide':if(c.id==='settings'&&!t.hidden.includes('ask')&&false)break;if(!t.hidden.includes(c.id))t.hidden.push(c.id);msgs.push('Hid '+S.TOOLS[c.id]);break;
   case 'tb_show':t.hidden=t.hidden.filter(x=>x!==c.id);if(!t.order.includes(c.id))t.order.push(c.id);msgs.push('Showing '+S.TOOLS[c.id]);break;
   case 'tb_first':t.order=[c.id].concat(t.order.filter(x=>x!==c.id));t.hidden=t.hidden.filter(x=>x!==c.id);msgs.push(S.TOOLS[c.id]+' is first');break;
   case 'tb_last':t.order=t.order.filter(x=>x!==c.id).concat(c.id);t.hidden=t.hidden.filter(x=>x!==c.id);msgs.push(S.TOOLS[c.id]+' is last');break;
   case 'tb_order':{const rest=t.order.filter(x=>!c.ids.includes(x));t.order=c.ids.concat(rest);t.hidden=t.hidden.filter(x=>!c.ids.includes(x));msgs.push('Bar order: '+c.ids.map(x=>S.TOOLS[x]).join(', '));break}
   case 'tb_only':{const keep=new Set(c.ids.concat(['settings','ask']));t.hidden=t.order.filter(x=>!keep.has(x));msgs.push('Bar now shows '+t.order.filter(x=>keep.has(x)).map(x=>S.TOOLS[x]).join(', '));break}
   case 'tb_pos':t.pos=c.pos;msgs.push('Toolbar at the '+c.pos);break;
   case 'tb_size':t.size=Math.round(Math.min(120,Math.max(48,t.size*c.f)));msgs.push(c.f>1?'Bigger toolbar buttons':'Smaller toolbar buttons');break;
   case 'tb_autohide':t.pinned=!c.on;msgs.push(c.on?'Toolbar hides when idle':'Toolbar stays visible');break;
   case 'tb_hide_now':S.toolbarShow(false);msgs.push('Toolbar hidden. Tap the thin bar at the edge to bring it back.');break;
   case 'w_size':{const i=Widgets.open[c.id];if(!i){msgs.push('The '+S.TOOLS[c.id].toLowerCase()+' is not open, so I left it alone. Open it, then ask again.');break}
     const el=i.el;const w=Math.round(Math.min(innerWidth-20,Math.max(180,el.offsetWidth*c.f))),hh=Math.round(Math.min(innerHeight-20,Math.max(90,el.offsetHeight*c.f)));i.w.w=w;i.w.h=hh;place(i);msgs.push((c.f>1?'Bigger ':'Smaller ')+S.TOOLS[c.id].toLowerCase());break}
   case 'w_move':{const i=Widgets.open[c.id];if(!i){msgs.push('The '+S.TOOLS[c.id].toLowerCase()+' is not open, so I did not move it.');break}moveWidget(c.id,c.where);msgs.push('Moved the '+S.TOOLS[c.id].toLowerCase());break}
   case 'clock_size':cfg.clock.size=Math.round(Math.min(14,Math.max(1.5,cfg.clock.size*c.f))*10)/10;msgs.push(c.f>1?'Bigger clock':'Smaller clock');break;
   case 'ui_lang':case 'ui_theme':case 'ui_accent':case 'ui_size':case 'ui_labels':{const u=cfg.ui;const k={ui_lang:'lang',ui_theme:'theme',ui_accent:'accent',ui_size:'size'}[c.op];
     if(c.op==='ui_labels')u.labels=c.on;else u[k]=c.lang||c.v;if(window.__applyUi)window.__applyUi();S.renderToolbar();
     msgs.push(c.op==='ui_lang'?'Settings and toolbar language: '+({en:'English',he:'Hebrew',yi:'Yiddish'})[c.lang]:c.op==='ui_theme'?'Theme: '+c.v:c.op==='ui_accent'?'Button color changed':c.op==='ui_size'?'Interface size: '+({sm:'small',std:'standard',lg:'large'})[c.v]:c.on?'Tool labels shown':'Tool labels hidden');break}
   case 'content_lang':if(window.__setContentLang){window.__setContentLang(c.lang);msgs.push('Classroom wording for students: '+({en:'English',he:'Hebrew',yi:'Yiddish'})[c.lang])}else msgs.push('Classroom wording could not be changed here.');break;
   case 'clock_date':cfg.clock.date=c.v;msgs.push(c.v==='none'?'Date hidden':'Date shows '+({heb:'the Hebrew date',std:'the English date',both:'both dates'})[c.v]);break;
   case 'clock_h12':cfg.clock.hour12=c.on;msgs.push(c.on?'12-hour time':'24-hour time');break;
   case 'clock_ampm':cfg.clock.showAmPm=c.on;msgs.push(c.on?'AM/PM shown':'AM/PM hidden');break;
   case 'clock_vis':cfg.clock.visible=c.on;msgs.push(c.on?'Clock shown':'Clock hidden');break;
   case 'clock_pos':cfg.clock.pos=c.pos;msgs.push('Clock moved');break;
   case 'bg':['dim','blur','brightness'].forEach(k=>{if(c[k]!=null)cfg.bg[k]=c[k]});msgs.push('Background updated');break;
  }}
function apply(changes){const msgs=[];const sn=snap();for(const c of changes)applyOne(c,msgs);history.push(sn);if(history.length>20)history.shift();dirty=true;
  S.renderToolbar();S.renderClock();S.renderBg();return msgs}
let dirty=false,saved=false;

/* ---------- panel ---------- */
let panel=null,rec=null,draft=null,pendingEdit=null;
function layout(){if(!panel)return;const t=cfg.toolbar;panel.style.top=panel.style.bottom='auto';if(t.pos==='top')panel.style.top=(tbH()+10)+'px';else panel.style.bottom=(t.pos==='bottom'?tbH()+14:20)+'px'}
function close(){if(rec){try{rec.stop()}catch(e){}rec=null}if(panel){panel.remove();panel=null}}
function open(){if(panel){close();return}
  const input=h('textarea',{rows:'1',placeholder:'What would you like to change?','aria-label':'What would you like to change?',enterkeyhint:'go',autocomplete:'off',spellcheck:'false',style:'resize:none;max-height:140px'});
  const grow=()=>{input.style.height='auto';input.style.height=Math.min(140,input.scrollHeight)+'px'};input.addEventListener('input',grow);
  const msg=h('div',{class:'am'});
  const actions=h('div',{class:'ar',style:'flex-wrap:wrap'});
  const mic=h('button',{class:'mic','aria-label':'Tap to speak',title:'Tap to speak'},'🎤');
  const go=h('button',{class:'pri',onclick:()=>run()},'Go');
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  let pend=null,reqPending=null;
  const MT=window.MyTools;
  const setMsg=(lines,bad)=>{msg.className='am'+(bad?' bad':'');msg.innerHTML='';if(typeof lines==='string')msg.textContent=lines;else{const u=h('ul',{});lines.forEach(l=>u.append(h('li',{},l)));msg.append(u)}};
  const showActions=()=>{actions.innerHTML='';
    if(history.length)actions.append(h('button',{onclick:()=>{const sn=history.pop();restore(sn);dirty=history.length>0;setMsg('Undone.');showActions()}},'Undo'));
    if(dirty)actions.append(h('button',{class:'pri',onclick:()=>{S.saveCfg();for(const id in Widgets.open)Widgets.save&&Widgets.save(id);saved=true;dirty=false;setMsg('Saved as your default for future classes.');showActions()}},'Save as my default'));
    actions.append(h('button',{onclick:close},'Close'))};
  const toolActions=(extra)=>{actions.innerHTML='';
    actions.append(h('button',{class:'pri',onclick:()=>{const d=draft;draft=null;setMsg('Using it now. It stays on the board until you close it. It is not saved.');showActions()}},'Use now'),
      h('button',{onclick:()=>{const sv=MT.saveTool(draft);draft=sv;setMsg('Saved to My Tools. Find it in Library > My Tools.');actions.innerHTML='';actions.append(h('button',{class:'pri',onclick:()=>{MT.setPinned(sv,true);setMsg('Pinned to the toolbar.');draft=null;showActions()}},'Pin to toolbar'),h('button',{onclick:()=>{draft=null;showActions()}},'Not now'),h('button',{onclick:close},'Close'))}},'Save to My Tools'),
      h('button',{onclick:()=>{if(draft){MT.closeTool(draft);draft=null}setMsg('Preview closed.');showActions()}},'Discard'))};
  const askRequest=(text)=>{reqPending=text;input.value='';grow();input.placeholder='Why would this help? (optional)';setMsg('I can\u2019t build that one yet. Tell me why you would want it and I will send it to the developer.',false);actions.innerHTML='';
    actions.append(h('button',{class:'pri',onclick:()=>sendReq()},'Send request'),h('button',{onclick:()=>{reqPending=null;input.placeholder='What would you like to change?';setMsg('');showActions()}},'Cancel'))};
  async function sendReq(){const t=reqPending;if(!t)return;const why=input.value.trim();reqPending=null;input.value='';input.placeholder='What would you like to change?';grow();
    let r='saved';try{r=await MT.request(t,why)}catch(e){}
    setMsg(r==='sent'?'Sent to the developer. Thank you.':'Saved. It will be sent to the developer once you are signed in (Settings > Account).');showActions()}
  function run(){const q=input.value.trim();if(!q)return;if(rec){try{rec.stop()}catch(e){}}
    if(reqPending){sendReq();return}
    if(MT){
      if(draft){const notes=MT.refine(q,draft);if(notes){MT.openTool(draft);setMsg(notes);toolActions();input.value='';grow();return}}
      const b=MT.parseBuild(q);
      if(b&&b.unsupported){askRequest(q);return}
      if(b){draft=b;MT.openTool(draft);const n=b.items.length;setMsg(['Here is a preview on the board: '+b.name+', '+b.secs+' seconds per word'+(n?', '+n+' words.':', no words yet.'),n?'Say what to change, for example "make the words bigger" or "30 seconds instead". Then Use now or Save to My Tools.':'Paste your words into this box as "new list: ..." or tap the gear on the tool.']);toolActions();input.value='';grow();return}
      const ol=q.toLowerCase().match(/^(?:open|start|run|show|launch)\s+(?:my\s+)?(.+)$/);
      if(/^(open |show )?(my tools|saved tools|my tool list)$/i.test(q.trim())&&window.driveFolders){close();driveFolders('library');return}
      if(ol){const f=MT.find(ol[1].replace(/^tool\s+/,''));if(f){MT.openTool(f);setMsg('Opened '+f.name);showActions();input.value='';return}}
    }
    const r=interpret(q);
    if(r.unsupported.length&&r.unsupported[0].why==='a new tool'&&!r.changes.length){askRequest(q);return}
    if(r.answer){setMsg(r.answer);actions.innerHTML='';actions.append(h('button',{class:'pri',onclick:()=>{const m=apply(validate(r.apply));setMsg(m);showActions()}},'Apply this'),h('button',{onclick:()=>{setMsg('');showActions()}},'Not now'));return}
    const ch=validate(r.changes);
    if(ch.length===1&&ch[0].op==='undo'){const sn=history.pop();if(sn){restore(sn);dirty=history.length>0;setMsg('Undone.')}else setMsg('Nothing to undo yet.');showActions();return}
    let lines=[];if(ch.length)lines=apply(ch.filter(c=>c.op!=='undo'));
    lines=lines.concat(r.notes);
    if(r.unsupported.length){const first=r.unsupported[0];
      lines.push('I did not understand: \u201C'+first.text+'\u201D.');}
    if(!lines.length)lines.push('I did not understand that. Try "make the timer bigger" or "hide the wheel".');
    setMsg(lines,!ch.length&&!!r.unsupported.length);showActions();
    if(r.unsupported.length)actions.insertBefore(h('button',{onclick:()=>askRequest(q)},'Request this feature'),actions.firstChild);
    if(ch.length)input.value=''}
  input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();run()}else if(e.key==='Escape')close();e.stopPropagation()});
  input.addEventListener('keyup',e=>e.stopPropagation());
  if(SR){mic.onclick=()=>{if(rec){try{rec.stop()}catch(e){}return}
      try{rec=new SR();rec.lang=(navigator.language||'en-US');rec.interimResults=true;rec.continuous=false;
        rec.onstart=()=>{mic.classList.add('on');setMsg('Listening\u2026 tap the microphone again to stop. You can fix the words before pressing Go.')};
        rec.onresult=e=>{let s='';for(const r of e.results)s+=r[0].transcript;input.value=s;};
        rec.onerror=e=>{mic.classList.remove('on');rec=null;setMsg(e.error==='not-allowed'||e.error==='service-not-allowed'?'The microphone is blocked. Allow it for this site in the browser settings, or type instead.':'I could not hear that. Try again or type.',true)};
        rec.onend=()=>{mic.classList.remove('on');rec=null;if(input.value&&!msg.textContent.startsWith('The mic'))setMsg('Check the words, change them if needed, then press Go.')};
        rec.start()}catch(e){rec=null;setMsg('The microphone could not start. You can type instead.',true)}}}
  else{mic.disabled=true;mic.style.opacity=.4;mic.title='This browser has no speech input. Type instead.'}
  panel=h('div',{id:'askp',role:'dialog','aria-label':'Ask the Board'},h('div',{class:'ar'},input,mic,go,h('button',{class:'x',onclick:close,'aria-label':'Close'},'\u2715')),msg,actions);
  document.body.append(panel);layout();showActions();
  if(pendingEdit&&MT){draft=Object.assign({},pendingEdit);pendingEdit=null;MT.openTool(draft);setMsg(['Editing '+draft.name+'.','Say what to change, for example "make the words bigger" or "new list: ...", then Save to My Tools.']);toolActions();input.focus&&0}
  else setMsg(history.length?'':'Try: "make the timer bigger", "hide the wheel", "put my slides first", or "make the board simpler".');
  setTimeout(()=>{try{input.focus()}catch(e){}},50)}
function requestFeature(text){const L=S.Store.get('askInbox',[]);L.push({text,at:new Date().toISOString(),status:'new'});S.Store.set('askInbox',L)}
/* AI backend: OFF until a server and key exist. Limit is read from the server later so a pro tier can raise it; no payments here. */
const AI={enabled:false,endpoint:'',dailyLimit:20};
window.AskBoard={AI,editTool:s=>{pendingEdit=s;if(panel)close();open()},toggle:open,open,close,interpret,validate};
})();
