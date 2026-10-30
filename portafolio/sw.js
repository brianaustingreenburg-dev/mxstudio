const C="mx-portafolio-v1";
const FILES=["./","index.html","manifest.webmanifest","mansion.jpg","kailua.jpg","kailua-logo.png","icon-180.png","icon-192.png","icon-512.png",
"fonts/archivo.woff2","fonts/inst-400.woff2","fonts/inst-600.woff2","fonts/mono.woff2","fonts/kaushan.woff2","fonts/slab.woff2"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp));return res}).catch(()=>caches.match("index.html"))))});
