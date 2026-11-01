import sys
ES='editB:"✏️ Editar menú",eT:"Editar menú",eS:"Cambia precios, nombres o platillos y toca Guardar. La app del restaurante se actualiza en 1–2 minutos.",eAdd:"+ Agregar platillo",eSave:"💾 Guardar",eOk:"✓ Guardado · en vivo en 1–2 min",eErr:"No se pudo guardar: ",eNew:"Nuevo platillo",eKey:"Tu llave de GitHub (solo la primera vez)",eKeyH:"1) Abre github.com/settings/personal-access-tokens/new · 2) Nombre: Rutas · 3) Repository access: Only select → mxstudio · 4) Permissions → Contents: Read and write · 5) Generate token y cópiala aquí. Si GitHub dice que ya tienes una, ábrela y toca Regenerate token.",ePh:"Precio",eDel:"¿Borrar este platillo?",'
EN='editB:"✏️ Edit menu",eT:"Edit menu",eS:"Change prices, names or dishes and tap Save. The restaurant\'s app updates in 1–2 minutes.",eAdd:"+ Add dish",eSave:"💾 Save",eOk:"✓ Saved · live in 1–2 min",eErr:"Couldn\'t save: ",eNew:"New dish",eKey:"Your GitHub key (first time only)",eKeyH:"1) Open github.com/settings/personal-access-tokens/new · 2) Name: Rutas · 3) Repository access: Only select → mxstudio · 4) Permissions → Contents: Read and write · 5) Generate token and paste it here. If GitHub says you already have one, open it and tap Regenerate token.",ePh:"Price",eDel:"Delete this dish?",'
JS='''
let EM=null,eSlug="",eName="";
async function openEdit(slug,name){const t=L();eSlug=slug;eName=name;$("sheetBox").innerHTML=`<p style="text-align:center">${t.aLoad}</p>`;$("sheet").classList.add("on");
 try{const r=await fetch("../c/"+slug+"/menu.json?t="+Date.now(),{cache:"no-store"});EM=await r.json()}catch(_){EM=null}
 if(!Array.isArray(EM)){$("sheetBox").innerHTML=`<p>${t.aOff}</p><button class="close" id="closeSheet">${t.close}</button>`;return}
 drawEdit()}
function drawEdit(){const t=L();let key="";try{key=localStorage.getItem("crear-gh")||""}catch(_){}
 $("sheetBox").innerHTML=`<h3 class="ah">✏️ ${t.eT}</h3><div class="an">${esc(eName)}</div><p class="as">${t.eS}</p>
 ${EM.map((c,ci)=>`<div class="ecat"><input class="ai ecn" data-c="${ci}" value="${esc(c.cat.es)}">
  ${c.items.map((it,ii)=>`<div class="eit"><div class="enm"><input class="ai" data-i="${ci}-${ii}" data-f="es" value="${esc(it.name.es)}"><input class="ai een" data-i="${ci}-${ii}" data-f="en" value="${esc(it.name.en)}"></div><input class="ai epr" data-i="${ci}-${ii}" data-f="price" inputmode="decimal" placeholder="${t.ePh}" value="${esc(it.price)}"><button class="edel" data-del="${ci}-${ii}">✕</button></div>`).join("")}
  <button class="close eadd" data-add="${ci}">${t.eAdd}</button></div>`).join("")}
 ${key?"":`<label class="al">${t.eKey}</label><input class="ai" id="eK" type="password" autocomplete="off"><p class="as" style="font-size:.78em">${t.eKeyH}</p>`}
 <button class="share" id="eSave" style="margin-top:12px">${t.eSave}</button><button class="close" id="closeSheet">${t.close}</button>`}
function editInput(e){const el=e.target;if(!EM)return;
 if(el.dataset.c!==undefined&&el.classList.contains("ecn")){EM[+el.dataset.c].cat.es=el.value;return}
 if(el.dataset.i){const [ci,ii]=el.dataset.i.split("-").map(Number),it=EM[ci].items[ii];
  if(el.dataset.f==="es")it.name.es=el.value;else if(el.dataset.f==="en")it.name.en=el.value;else if(el.dataset.f==="price")it.price=el.value.replace(/[^0-9.]/g,"")}}
async function saveEdit(){const t=L();if(!navigator.onLine){toast(t.aOff);return}
 const kI=$("eK");if(kI&&kI.value.trim()){try{localStorage.setItem("crear-gh",kI.value.trim())}catch(_){}}
 let key="";try{key=localStorage.getItem("crear-gh")||""}catch(_){}if(!key){kI&&kI.focus();return}
 const btn=$("eSave");btn.disabled=true;btn.textContent="…";
 const clean=EM.map(c=>({cat:c.cat,items:c.items.filter(it=>(it.name.es||"").trim()).map(it=>({name:{es:it.name.es.trim(),en:(it.name.en||it.name.es).trim()},desc:it.desc||{es:"",en:""},price:String(it.price||""),img:it.img||""}))})).filter(c=>c.items.length);
 const api="https://api.github.com/repos/brianaustingreenburg-dev/mxstudio/contents/acapulco/c/"+eSlug+"/menu.json",h={Authorization:"Bearer "+key,Accept:"application/vnd.github+json"};
 try{let sha;const g=await fetch(api+"?ref=main",{headers:h,cache:"no-store"});if(g.ok)sha=(await g.json()).sha;else if(g.status===401||g.status===403||g.status===404){if(g.status===401)try{localStorage.removeItem("crear-gh")}catch(_){};throw new Error(g.status===404?"llave sin acceso a mxstudio / key can't see mxstudio":"llave / key "+g.status)}
  const p=await fetch(api,{method:"PUT",headers:h,body:JSON.stringify({message:"Menú "+eSlug+" ✝️",branch:"main",sha,content:btoa(unescape(encodeURIComponent(JSON.stringify(clean))))})});
  if(!p.ok){const j=await p.json().catch(()=>({}));throw new Error(p.status+" "+(j.message||""))}
  toast(t.eOk);$("sheet").classList.remove("on")}catch(err){btn.disabled=false;btn.textContent=t.eSave;toast(t.eErr+err.message)}}
'''
CSS='.ecat{margin:12px 0;padding:10px;border-radius:14px;background:rgba(255,255,255,.04)}.ecn{font-weight:800;margin-bottom:6px}.eit{display:grid;grid-template-columns:1fr 78px 34px;gap:6px;align-items:start;margin:6px 0}.enm{display:grid;gap:4px}.een{font-size:13px!important;opacity:.8;padding:8px!important}.epr{text-align:right}.edel{all:unset;cursor:pointer;text-align:center;padding:12px 0;border-radius:10px;background:rgba(224,90,58,.18);color:#f3a08a;font-weight:800}.eadd{display:block;width:100%;margin-top:6px}\n'
def patch(h):
    for a,b in [('appB:"📱 Abrir su app",',ES+'appB:"📱 Abrir su app",'),('appB:"📱 Open their app",',EN+'appB:"📱 Open their app",')]:
        assert h.count(a)==1;h=h.replace(a,b)
    a='function showPrices(){';assert h.count(a)==1;h=h.replace(a,JS+a)
    a='<div class="appBtns"><button data-act="${APPS[s.demo]}" data-nm="${esc(s.n)}">${t.actB}</button>'
    assert h.count(a)==1;h=h.replace(a,'<div class="appBtns"><button data-act="${APPS[s.demo]}" data-nm="${esc(s.n)}">${t.actB}</button><button data-edit="${APPS[s.demo]}" data-nm="${esc(s.n)}">${t.editB}</button>')
    a=' const ac=e.target.closest("[data-act]");'
    assert h.count(a)==1;h=h.replace(a,' const ed=e.target.closest("[data-edit]");if(ed){openEdit(ed.dataset.edit,ed.dataset.nm);return}\n'+a)
    a='$("sheet").onclick=e=>{'
    assert h.count(a)==1;h=h.replace(a,'$("sheet").addEventListener("input",editInput);\n$("sheet").onclick=e=>{if(e.target.id==="eSave"){saveEdit();return}{const d=e.target.closest("[data-del]");if(d){if(confirm(L().eDel)){const [ci,ii]=d.dataset.del.split("-").map(Number);EM[ci].items.splice(ii,1);drawEdit()}return}const ad=e.target.closest("[data-add]");if(ad){EM[+ad.dataset.add].items.push({name:{es:L().eNew,en:"New dish"},desc:{es:"",en:""},price:"",img:""});drawEdit();return}}')
    h=h.replace('.appBtns{display:grid;grid-template-columns:1fr 1fr;','.appBtns{display:grid;grid-template-columns:1fr 1fr 1fr;')
    a='.demoBtn{';h=h.replace(a,CSS+a,1)
    return h
for f in sys.argv[1:]:
    h=open(f).read();assert 'openEdit' not in h;open(f,'w').write(patch(h));print('patched',f)
