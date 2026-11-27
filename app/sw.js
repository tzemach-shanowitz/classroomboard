const C='classroom-v155';
const FILES=['./','index.html','style.css','app.js','manifest.webmanifest','icon.svg','drive-ui.js','behavior.js','prizes.js','cloud.js','remote.js','toolpick.js','backup.js','demo.js','widgets2.js','widgets3.js','widgets4.js','widgets5.js','inputdiag.js','settings2.js','welcome.js','customize.js','i18n.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('classroom-')&&x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin||e.request.url.includes('/__/'))return;e.respondWith(fetch(e.request).then(r=>{const cl=r.clone();caches.open(C).then(c=>c.put(e.request,cl)).catch(()=>{});return r}).catch(()=>caches.match(e.request)))});
