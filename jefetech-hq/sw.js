// jefetech-hq: newest version when online, saved copy when offline.
const C="jthq-v6";
const FILES=["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "propuesta.html"];
const key=u=>{const x=new URL(u,self.registration.scope);let p=x.pathname;if(p.endsWith("/index.html"))p=p.slice(0,-10);return x.origin+p};
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(FILES.map(f=>fetch(new Request(f,{cache:"reload"})).then(r=>r.ok&&c.put(key(f),r)).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith("jthq-")&&x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);if(u.origin!==location.origin||!u.pathname.startsWith(new URL(self.registration.scope).pathname))return;
 const k=key(r.url),save=res=>{if(res&&res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(k,cp))}return res};
 if(r.mode==="navigate"){e.respondWith(Promise.race([fetch(r,{cache:"no-store"}).then(save),new Promise((_,no)=>setTimeout(no,7000))]).catch(()=>caches.match(k)));return}
 e.respondWith(caches.match(k).then(h=>h||fetch(r).then(save)))});
self.addEventListener("message",e=>{if(e.data!=="refresh")return;const src=e.source;e.waitUntil(caches.open(C).then(c=>Promise.all(FILES.map(f=>fetch(f,{cache:"reload"}).then(res=>res.ok?c.put(key(f),res):null).catch(()=>null)))).then(()=>{if(src)src.postMessage("refreshed")}))});
