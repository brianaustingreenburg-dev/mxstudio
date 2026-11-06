// Mis Apps: works offline after the first visit.
const C="misapps-v1";
const FILES=["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "img/axolotl.jpg", "img/dashboard.jpg", "img/escaner.png", "img/family.jpg", "img/heli.jpg", "img/hotel.jpg", "img/inventario.jpg", "img/jefetech.jpg", "img/kailua.jpg", "img/mansion.jpg", "img/mxstudio.jpg", "img/ricos.jpg", "img/ritz.jpg", "img/ritzpanel.jpg", "img/tres.jpg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(FILES.map(f=>c.add(new Request(f,{cache:"reload"})).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith("misapps-")&&x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);if(u.origin!==location.origin||!u.pathname.startsWith(new URL(self.registration.scope).pathname))return;
 const save=res=>{if(res&&res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r.mode==="navigate"?"./":r,cp))}return res};
 if(r.mode==="navigate"){e.respondWith(Promise.race([fetch(r).then(save),new Promise((_,no)=>setTimeout(no,3000))]).catch(()=>caches.match("./")));return}
 e.respondWith(caches.match(r,{ignoreSearch:true}).then(h=>h||fetch(r).then(save)))});
