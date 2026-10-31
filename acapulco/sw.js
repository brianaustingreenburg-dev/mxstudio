const CACHE="mx-acapulco-v3";
const CORE=["/","/index.html","/logo.png","/icon-192.png","/icon-512.png","/manifest.json","/la-bahia/","/la-bahia/index.html","/hotel-caleta/","/hotel-caleta/index.html"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);if(u.hostname.includes("whatsapp"))return;
  if(r.mode==="navigate"){ // fresh when online, saved copy when offline (ignores ?mesa= / ?hab=)
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(u.origin+u.pathname,c));return res})
      .catch(()=>caches.match(u.origin+u.pathname).then(m=>m||caches.match(u.pathname.endsWith("/")?u.pathname+"index.html":u.pathname)).then(m=>m||caches.match("/index.html"))));return;}
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok||res.type==="opaque"){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c))}return res}).catch(()=>hit)));
});
