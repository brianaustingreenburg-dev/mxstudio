// MX Studio ✝ Acapulco — offline copy of the main page and both demos
const CACHE="mx-acapulco-v16";
const SCOPE=self.registration.scope; // e.g. https://go.myjefetech.app/acapulco/
const CORE=["","index.html","logo.png","icon-192.png","icon-512.png","manifest.json","la-bahia/","la-bahia/index.html","hotel-caleta/","hotel-caleta/index.html","rutas/","rutas/index.html","rutas/manifest.json","precios/","precios/index.html","precios/manifest.json","crear/","crear/index.html","crear/manifest.json","app/plantilla.html","demo/","demo/index.html","demo/manifest.json","demo/img/b-margarita.jpg","demo/img/c-chilaquiles.jpg","demo/img/c-conchas.jpg","demo/img/c-frappe.jpg","demo/img/c-latte.jpg","demo/img/c-olla.jpg","demo/img/cover-cafe.jpg","demo/img/cover-mariscos.jpg","demo/img/cover-restaurante.jpg","demo/img/m-aguachile.jpg","demo/img/m-camarones.jpg","demo/img/m-ceviche.jpg","demo/img/m-coco.jpg","demo/img/m-coctel.jpg","demo/img/m-limonada.jpg","demo/img/m-tacos.jpg","demo/img/m-talla.jpg","demo/img/r-chilerelleno.jpg","demo/img/r-enchiladas.jpg","demo/img/r-flan.jpg","demo/img/r-guacamole.jpg","demo/img/r-pastor.jpg","demo/img/r-pozole.jpg"].map(p=>new URL(p,SCOPE).href);
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
