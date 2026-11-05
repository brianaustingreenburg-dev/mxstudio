// Ritz Acapulco guest app: saves itself (photos included) so it works offline.
const C="ritz-v2";
const FILES=["./","panel/","fonts/cormorant-garamond-latin-500-italic.woff2","fonts/cormorant-garamond-latin-500-normal.woff2","fonts/cormorant-garamond-latin-600-italic.woff2","fonts/cormorant-garamond-latin-600-normal.woff2","fonts/inter-latin-400-normal.woff2","fonts/inter-latin-500-normal.woff2","fonts/inter-latin-600-normal.woff2","fonts/inter-latin-700-normal.woff2","icons/favicon-32.png","icons/icon-180.png","icons/icon-192.png","icons/icon-512.png","img/beach.jpg","img/dining.jpg","img/hero.jpg","img/pool.jpg","img/show.jpg","index.html","manifest.webmanifest","panel/index.html"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith("ritz-")&&x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);if(u.origin!==location.origin)return;
 const save=res=>{if(res&&res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res};
 if(r.mode==="navigate"&&u.searchParams.has("fresh")){e.respondWith(fetch(r).then(save).catch(()=>caches.match(r,{ignoreSearch:true})));return}
 if(r.mode==="navigate"){const net=fetch(r).then(save);e.waitUntil(net.catch(()=>{}));
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit?Promise.race([net.then(x=>x.ok?x:hit),new Promise(ok=>setTimeout(()=>ok(hit),3000))]).catch(()=>hit):net));return}
 e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(save)))});

// Refresh button: download everything again (newest version) and keep it saved.
self.addEventListener("message",e=>{if(e.data!=="refresh")return;const src=e.source;e.waitUntil(caches.open(C).then(c=>Promise.all(FILES.map(f=>fetch(f,{cache:"reload"}).then(res=>res.ok?c.put(f,res):null).catch(()=>null)))).then(()=>{if(src)src.postMessage("refreshed")}))});
