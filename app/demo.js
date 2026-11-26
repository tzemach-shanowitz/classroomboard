/* Isolated demo mode for the landing page: ?demo=<tool>. Uses its own storage prefix, fictional data, and no cloud. */
(function(){const q=new URLSearchParams(location.search);if(!q.has('demo'))return;
const tool=q.get('demo')||'home';window.__demo=tool;
const P='scdemo.';Object.keys(localStorage).filter(k=>k.startsWith(P)).forEach(k=>localStorage.removeItem(k));
const S=(k,v)=>localStorage.setItem(P+k,JSON.stringify(v));
const names=['Avi','Bracha','Chaim','Dina','Eli','Faigy','Gavi','Hadassah','Itzy','Leah','Moshe','Nechama'];
const d=new Date(),key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
S('studentLists',[{id:'main',name:'Class',students:names.map(n=>({name:n,absent:false}))}]);S('activeList','main');
S('sched.'+key,{items:[{t:'09:00',n:'Morning circle'},{t:'09:30',n:'Reading'},{t:'10:15',n:'Recess'},{t:'10:30',n:'Math'},{t:'11:30',n:'Science'},{t:'12:15',n:'Lunch'},{t:'13:00',n:'Art'},{t:'14:00',n:'Pack up'}]});
const sup=[['Reading book','Pencil'],['Math notebook','Ruler','Calculator'],['Chumash']];const sd={};for(let i=0;i<7;i++)sd[i]=sup;S('supDays2',sd);
S('beh.state',{day:key,m:{Avi:0,Dina:1,Gavi:2,Moshe:3},r:{Avi:3,Bracha:1,Leah:2,Eli:4},log:[]});
S('cfg',{toolbar:{pinned:true},clock:{seconds:false}});
addEventListener('load',()=>setTimeout(()=>{try{const w=window.__sc||{};const m={timer:w.openTimer,schedule:w.openSchedule,supplies:w.openSupplies,picker:w.openPicker,behavior:window.openBehavior,wheel:window.openPrizeWheel,whiteboard:()=>w.enterWhiteboard&&w.enterWhiteboard(),settings:()=>w.openSettings&&w.openSettings('bg')};if(m[tool])m[tool]()}catch(e){}},1100));
})();
