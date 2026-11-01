// MX Studio ✝ Acapulco — offline support for Rutas, Precios and every restaurant app
const CACHE="mx-acapulco-v45";   // app shells (replaced on each update)
const APPC="mx-apps";            // restaurant apps + photos (kept across updates; filled by Rutas)
const SCOPE=self.registration.scope;
const CORE=["","index.html","logo.png","icon-192.png","icon-512.png","manifest.json","la-bahia/","la-bahia/index.html","hotel-caleta/","hotel-caleta/index.html","rutas/","rutas/index.html","rutas/manifest.json","precios/","precios/index.html","precios/manifest.json","crear/","crear/index.html","crear/manifest.json","app/plantilla.html","demo/","demo/index.html","demo/manifest.json","tarjeta/","tarjeta/index.html","lib/qrcode.js","lib/fonts/m500.woff2","lib/fonts/m700.woff2","lib/fonts/m800.woff2","pendientes/","pendientes/index.html","pendientes/manifest.json"].map(p=>new URL(p,SCOPE).href);
const store=u=>(u.pathname.includes("/c/")||u.pathname.includes("/demo/img/"))?APPC:CACHE;
const put=(u,key,res)=>{if(res&&res.ok){const c=res.clone();caches.open(store(u)).then(x=>x.put(key,c))}return res};
const OFF='<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:system-ui;background:#120d0b;color:#f6ece0;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:24px"><div><div style="font-size:42px">📶</div><h2>Sin internet · Offline</h2><p>Esta app todavía no está guardada en este teléfono.<br>Abre <b>Rutas</b> con internet y espera "✓ Todo listo sin internet".</p><p style="opacity:.7">This app isn&#39;t saved on this phone yet. Open Rutas online and wait for "✓ Todo listo".</p><p><a href="'+SCOPE+'rutas/" style="color:#d9a35f;font-weight:800">← Rutas</a></p></div>';
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n.startsWith("mx-acapulco")&&n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  const key=u.origin+u.pathname;
  if(u.pathname.endsWith("/config.json")||u.pathname.endsWith("/menu.json")){
    e.respondWith(fetch(r).then(res=>put(u,key,res)).catch(()=>caches.match(key)));return;}
  if(r.mode==="navigate"){
    const alt=key.endsWith("/")?key+"index.html":key+"/";
    if(u.searchParams.has("fresh")){e.respondWith(fetch(r).then(res=>put(u,key,res)).catch(()=>caches.match(key)));return;}
    const net=fetch(r).then(res=>put(u,key,res));
    e.respondWith(caches.match(key).then(m=>m||caches.match(alt)).then(hit=>{
      if(hit){e.waitUntil(net.catch(()=>{}));return hit}
      return Promise.race([net,new Promise((_,no)=>setTimeout(no,8000))]).catch(()=>u.pathname.includes("/c/")?new Response(OFF,{headers:{"Content-Type":"text/html; charset=utf-8"}}):caches.match(SCOPE))}));return;}
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>put(u,r,res)).catch(()=>hit)));
});
