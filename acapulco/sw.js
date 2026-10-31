// MX Studio ✝ Acapulco — offline copy of the main page and both demos
const CACHE="mx-acapulco-v11";
const SCOPE=self.registration.scope; // e.g. https://go.myjefetech.app/acapulco/
const CORE=["","index.html","logo.png","icon-192.png","icon-512.png","manifest.json","la-bahia/","la-bahia/index.html","hotel-caleta/","hotel-caleta/index.html","rutas/","rutas/index.html","rutas/manifest.json","precios/","precios/index.html","precios/manifest.json","crear/","crear/index.html","crear/manifest.json","app/plantilla.html"].map(p=>new URL(p,SCOPE).href);
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n.startsWith("mx-acapulco")&&n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);if(u.hostname.includes("whatsapp")||u.hostname==="api.github.com")return;
  if(r.mode==="navigate"){ // fresh when online; saved copy offline (works for any ?mesa= or ?hab=)
    const key=u.origin+u.pathname;
    e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(key,c))}return res})
      .catch(()=>caches.match(key).then(m=>m||caches.match(key.endsWith("/")?key+"index.html":key+"/")).then(m=>m||caches.match(SCOPE))));return;}
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok||res.type==="opaque"){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c))}return res}).catch(()=>hit)));
});
