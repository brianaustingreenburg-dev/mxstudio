"use strict";
/* Shared by the phone app and the store-computer screen. */
const CATS = {
  es:{botanas:"Botanas",bebidas:"Bebidas",panaderia:"Pan",lacteos:"Lácteos",despensa:"Despensa",hogar:"Hogar",frescos:"Frescos"},
  en:{botanas:"Snacks",bebidas:"Drinks",panaderia:"Bread",lacteos:"Dairy",despensa:"Pantry",hogar:"Home",frescos:"Fresh"}
};
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money = n => "$" + (Number(n)||0).toLocaleString("es-MX",{minimumFractionDigits:2, maximumFractionDigits:2});
const money0 = n => "$" + Math.round(Number(n)||0).toLocaleString("es-MX");
const initials = n => String(n||"").replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9 ]/g,"").split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase() || "•";
const TODAY = (() => { const d=new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); })();
const daysTo = d => d ? Math.round((new Date(d+"T00:00:00") - TODAY)/86400000) : null;
function ago(iso, lang){ if (!iso) return lang==="es"?"nunca":"never"; const m=Math.round((Date.now()-new Date(iso))/60000);
  if (m<1) return lang==="es"?"ahora":"just now"; const u = m<60 ? m+" min" : m<1440 ? Math.round(m/60)+" h" : Math.round(m/1440)+" d"; return lang==="es" ? "hace "+u : u+" ago"; }
const level = p => { const q=p.qty||0; return q===0 ? "out" : q < (p.min||0) ? "low" : "ok"; };
const catOf = (p, lang) => CATS[lang][p.cat] || p.dept || p.cat || "";
let toastTimer; function toast(m){ const el=$("#toast"); if (!el) return; el.textContent=m; el.hidden=false; clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.hidden=true, 2800); }
function lsGet(k, d){ try{ const v=localStorage.getItem(k); return v==null?d:JSON.parse(v); }catch(e){ return d; } }
function lsSet(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,8); }

/* talk to the store computer */
const API = {
  pin: lsGet("pdc_pin", ""),
  async get(path){ const r = await fetch(path, {cache:"no-store", headers: API.pin?{"x-pin":API.pin}:{}}); if (!r.ok) throw Object.assign(new Error("http"),{status:r.status}); return r.json(); },
  async post(path, body){ const r = await fetch(path, {method:"POST", headers:{"Content-Type":"application/json", ...(API.pin?{"x-pin":API.pin}:{})}, body:JSON.stringify(body||{})});
    let j=null; try{ j=await r.json(); }catch(e){} if (!r.ok) throw Object.assign(new Error((j&&j.error)||"http"),{status:r.status, body:j}); return j; }
};
function live(onChange, onStatus){
  let es=null, lastV=0, retry=null;
  const open=()=>{ try{ es && es.close(); }catch(e){}
    es = new EventSource("/api/events");
    es.onmessage = e => { onStatus(true); try{ const v=JSON.parse(e.data).version; if (v!==lastV){ lastV=v; onChange(); } }catch(_){} };
    es.onerror = () => { onStatus(false); try{ es.close(); }catch(_){} clearTimeout(retry); retry=setTimeout(open, 4000); };
  };
  open();
  document.addEventListener("visibilitychange", ()=>{ if (!document.hidden){ open(); onChange(); } });
  return { reopen: open };
}

/* Eleventa Excel reading */
const norm = s => String(s??"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g," ").trim();
function colIndex(head){
  const H=head.map(norm), find=(...ts)=>H.findIndex(h=>ts.some(t=>t(h)));
  return { code: find(h=>h==="codigo"||h.startsWith("codigo")||h==="clave"||h==="sku"),
    name: find(h=>h.startsWith("descripcion")||h==="producto"||h==="nombre"),
    cost: find(h=>h.includes("costo")),
    price: find(h=>(h.includes("venta")&&h.includes("precio"))||h==="p venta"||h==="precio"),
    dept: find(h=>h.startsWith("departamento")||h==="depto"),
    qty: find(h=>h.includes("existencia")||h.includes("inventario")||h.startsWith("cantidad")),
    min: find(h=>h.includes("minimo")||h==="inv min") };
}
function deptToCat(d){ const n=norm(d); for (const [k,v] of Object.entries(CATS.es)) if (norm(v)===n||k===n) return k;
  if (/refresco|bebida|agua|jugo|cerveza/.test(n)) return "bebidas"; if (/botana|dulce|galleta|papas/.test(n)) return "botanas"; if (/pan|bimbo|marinela/.test(n)) return "panaderia";
  if (/lacteo|leche|queso|crema|yogur/.test(n)) return "lacteos"; if (/limpieza|hogar|jabon|detergente/.test(n)) return "hogar"; if (/fruta|verdura|huevo|tortilla|carne|fresco/.test(n)) return "frescos"; return "despensa"; }
function parseRows(aoa){
  let hi=-1, ix=null;
  for (let i=0;i<Math.min(aoa.length,20);i++){ const c=colIndex(aoa[i]||[]); if (c.code>-1 && c.name>-1){ hi=i; ix=c; break; } }
  if (hi<0) return null;
  const num=v=>{ const n=parseFloat(String(v??"").replace(/[$,\s]/g,"")); return isNaN(n)?null:n; };
  return aoa.slice(hi+1).filter(r=>r && String(r[ix.code]??"").trim() && String(r[ix.name]??"").trim()).map(r=>{
    const dept = ix.dept>-1?String(r[ix.dept]??"").trim():"";
    return { code:String(r[ix.code]).trim(), name:String(r[ix.name]).trim(), cost: ix.cost>-1?num(r[ix.cost]):null, price: ix.price>-1?num(r[ix.price]):null,
      dept, cat: deptToCat(dept), qty: ix.qty>-1?num(r[ix.qty]):null, min: ix.min>-1?num(r[ix.min]):null }; });
}
async function readExcel(file){
  const wb=XLSX.read(await file.arrayBuffer(), {type:"array"});
  for (const n of wb.SheetNames){ const rows=parseRows(XLSX.utils.sheet_to_json(wb.Sheets[n], {header:1, raw:false, defval:""})); if (rows && rows.length) return rows; }
  return null;
}

/* barcode from a photo */
async function decodeBarcode(file){
  const url=URL.createObjectURL(file);
  try{ const img=new Image(); img.src=url; await img.decode();
    if ("BarcodeDetector" in window){ try{ const r=await new BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e","code_128","code_39"]}).detect(img); if (r&&r[0]) return r[0].rawValue; }catch(e){} }
    if (window.ZXing){ for (const max of [1600,1000,700]){ try{ const sc=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)); const c=document.createElement("canvas"); c.width=Math.round(img.naturalWidth*sc); c.height=Math.round(img.naturalHeight*sc); c.getContext("2d").drawImage(img,0,0,c.width,c.height);
      const h=new Map(); h.set(ZXing.DecodeHintType.TRY_HARDER,true); const r=new ZXing.MultiFormatReader(); r.setHints(h); return r.decode(new ZXing.BinaryBitmap(new ZXing.HybridBinarizer(new ZXing.HTMLCanvasElementLuminanceSource(c)))).getText(); }catch(e){} } }
    return null; } finally { URL.revokeObjectURL(url); }
}

/* bilingual setup checklist (shared between phone and computer) */
function setupSteps(prog){
  const ele = (prog||"eleventa")==="eleventa";
  return [
   {id:"open", es:"Abre el programa de MX Studio en la computadora de la tienda", en:"Open the MX Studio program on the store computer",
    subEs:"Si Windows pregunta, permite el acceso en redes privadas.", subEn:"If Windows asks, allow access on private networks."},
   {id:"imp", es: ele?"En Eleventa: F3 Productos → Catálogo → Exportar":"En tu programa, exporta tus productos a Excel", en: ele?"In Eleventa: F3 Productos → Catálogo → Exportar":"In your program, export your products to Excel",
    subEs:"Luego, en la pantalla de la computadora: Importar de Eleventa. Se marca solo.", subEn:"Then, on the computer screen: Import from Eleventa. Checks itself.", auto:true},
   {id:"phones", es:"Escanea el código QR con cada teléfono", en:"Scan the QR code with each phone",
    subEs:"Funciona con Wi-Fi o con datos del teléfono.", subEn:"Works on Wi-Fi or the phone's data."},
   {id:"home", es:"Agrega la app a la pantalla de inicio", en:"Add the app to the home screen",
    subEs:"iPhone: Compartir → Agregar a inicio. Android: ⋮ → Agregar a pantalla principal.", subEn:"iPhone: Share → Add to Home Screen. Android: ⋮ → Add to Home screen."},
   {id:"count", es:"Cuenta con el teclado del teléfono", en:"Count with the phone keypad", subEs:"Toca un producto, pon la cantidad y guarda. Se marca solo.", subEn:"Tap a product, enter the quantity and save. Checks itself.", auto:true},
   {id:"test", es:"Prueba el tecleo con el Bloc de notas", en:"Test the typing with Notepad", subEs:"En la computadora: Probar con Bloc de notas. Se marca solo.", subEn:"On the computer: Test with Notepad. Checks itself.", auto:true},
   {id:"screen", es: ele?"Abre la pantalla de inventario de Eleventa":"Abre la pantalla de inventario de tu programa", en: ele?"Open Eleventa's inventory screen":"Open your program's inventory screen",
    subEs:"Donde escribes el código y la cantidad.", subEn:"Where you type the code and the quantity."},
   {id:"send", es: ele?"Toca Pasar a Eleventa y haz clic en Eleventa":"Toca Pasar al programa y haz clic en tu programa", en: ele?"Tap Send to Eleventa and click on Eleventa":"Tap Send to program and click on your program",
    subEs:"Tienes unos segundos para hacer clic en la pantalla de inventario. Se marca solo.", subEn:"You have a few seconds to click on the inventory screen. Checks itself.", auto:true},
   {id:"confirm", es: ele?"Confirma que Eleventa muestra las cantidades nuevas":"Confirma que tu programa muestra las cantidades nuevas", en: ele?"Confirm Eleventa shows the new quantities":"Confirm your program shows the new quantities"}
  ];
}
const CHECK_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
function checklistHTML(setup, lang){
  const steps=setupSteps(setup.prog), done=setup.done||{}, n=steps.filter(x=>done[x.id]).length, O=lang==="es"?"en":"es";
  const sub=x=>x[lang==="es"?"subEs":"subEn"], subAlt=x=>x[lang==="es"?"subEn":"subEs"];
  return `<div class="seg"><button data-act="prog" data-v="eleventa" aria-pressed="${(setup.prog||"eleventa")==="eleventa"}">Eleventa</button><button data-act="prog" data-v="other" aria-pressed="${setup.prog==="other"}">${lang==="es"?"Excel u otro · Excel or other":"Excel or other · Excel u otro"}</button></div>
   <div class="rowhead"><b>${n} ${lang==="es"?"de":"of"} ${steps.length}</b><span class="small muted">${n} ${lang==="es"?"of":"de"} ${steps.length}</span></div>
   <div class="prog" role="progressbar" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="${steps.length}"><i style="width:${Math.round(n/steps.length*100)}%"></i></div>
   ${n===steps.length?`<div class="alldone">${lang==="es"?"¡Listo! Todo conectado.":"All set! Everything is connected."}<br><span class="chk-alt" style="color:inherit">${lang==="es"?"All set! Everything is connected.":"¡Listo! Todo conectado."}</span></div>`:""}
   <div class="chk">${steps.map((x,i)=>`<div class="chk-row ${done[x.id]?"done":""}">
     <button class="chk-box" data-act="tick" data-v="${x.id}" aria-pressed="${!!done[x.id]}" aria-label="${esc(x[lang])}">${CHECK_SVG}</button>
     <div style="display:flex;flex-direction:column;gap:3px;min-width:0">
       <span class="chk-num">${lang==="es"?"Paso":"Step"} ${i+1}${x.auto?` · ${lang==="es"?"automático":"automatic"}`:""}</span>
       <span class="chk-main">${esc(x[lang])}</span><span class="chk-alt">${esc(x[O])}</span>
       ${sub(x)?`<span class="chk-sub">${esc(sub(x))}</span><span class="chk-alt">${esc(subAlt(x))}</span>`:""}
     </div></div>`).join("")}</div>
   <button class="btn ghost" data-act="untickAll" style="align-self:flex-start">${lang==="es"?"Empezar de nuevo · Start over":"Start over · Empezar de nuevo"}</button>`;
}
const EXTRA_CSS = `
.prog{height:10px;border-radius:6px;background:var(--sunk);overflow:hidden}
.prog i{display:block;height:100%;background:var(--ok);border-radius:6px;transition:width .3s}
.chk{display:flex;flex-direction:column}
.chk-row{display:grid;grid-template-columns:36px 1fr;gap:12px;padding:14px 0;border-top:1px solid var(--line);align-items:start}
.chk-row:first-child{border-top:0}
.chk-box{width:32px;height:32px;border-radius:10px;border:2px solid var(--line);background:var(--surface);display:grid;place-items:center;padding:0}
.chk-box svg{width:20px;height:20px;opacity:0}
.chk-row.done .chk-box{background:var(--ok);border-color:var(--ok);color:#fff}
.chk-row.done .chk-box svg{opacity:1}
.chk-row.done .chk-main{text-decoration:line-through;text-decoration-color:var(--muted);color:var(--muted)}
.chk-main{font-weight:700}
.chk-alt{font-size:.85rem;color:var(--muted);font-style:italic}
.chk-sub{font-size:.88rem;opacity:.85}
.chk-num{font-size:.72rem;font-weight:700;letter-spacing:.06em;color:var(--muted);text-transform:uppercase}
.alldone{background:var(--ok-soft);border-radius:var(--r);padding:14px;font-weight:700;color:var(--ok);text-align:center}
.filters{display:flex;gap:6px;flex-wrap:wrap}
.filters button{border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:6px 12px;font-weight:600;font-size:.85rem}
.filters button[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.who{font-size:.78rem;color:var(--muted)}
.dot-pend{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--gold);margin-right:4px;vertical-align:middle}
.kbd{font-family:var(--f-mono);font-size:.8rem;background:var(--sunk);border:1px solid var(--line);border-radius:6px;padding:1px 6px;white-space:nowrap}
.filebtn{position:relative;overflow:hidden}
.filebtn input{position:absolute;inset:0;opacity:0;cursor:pointer}
`;
(function(){ const st=document.createElement("style"); st.textContent=EXTRA_CSS; document.head.appendChild(st); })();
