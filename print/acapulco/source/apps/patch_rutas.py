import json,sys
live=json.load(open('/home/claude/routes/live-index.json'))
APPS={x['id']:x['slug'] for x in live}
ES='appB:"📱 Abrir su app",actB:"⚙️ Activar",cardB:"🖨️ Tarjeta 5×7",actT:"Activar app",actS:"Escribe los datos del dueño y toca Publicar. La app se actualiza en 1–2 minutos.",aWa:"WhatsApp del negocio (10 dígitos) — llegan pedidos y reservas",aWn:"WiFi: nombre exacto",aWp:"WiFi: contraseña exacta",aOw:"Lista para el mesero",aOc:"Para llevar por WhatsApp",aOr:"Reservar por WhatsApp",aPub:"Publicar",aKey:"Tu llave de GitHub (solo una vez, se guarda en este teléfono)",aKeyH:"Es la misma llave del builder. Si no la tienes, créala en github.com → Settings → Developer settings → Fine-grained tokens, solo repo mxstudio, permiso Contents: Read and write.",aNeedWa:"Para pedidos o reservas por WhatsApp falta el número",aOk:"✓ Publicado · listo en 1–2 min",aErr:"No se pudo publicar: ",aOff:"Necesitas internet para publicar",aLoad:"Cargando…",aSee:"Ver app",'
EN='appB:"📱 Open their app",actB:"⚙️ Activate",cardB:"🖨️ 5×7 card",actT:"Activate app",actS:"Enter the owner\'s details and tap Publish. The app updates in 1–2 minutes.",aWa:"Business WhatsApp (10 digits) — orders and reservations arrive here",aWn:"WiFi: exact name",aWp:"WiFi: exact password",aOw:"List for the waiter",aOc:"Carry-out by WhatsApp",aOr:"Reserve by WhatsApp",aPub:"Publish",aKey:"Your GitHub key (one time, saved on this phone)",aKeyH:"Same key as the builder. If you don\'t have one: github.com → Settings → Developer settings → Fine-grained tokens, only the mxstudio repo, Contents: Read and write.",aNeedWa:"WhatsApp orders or reservations need the number",aOk:"✓ Published · live in 1–2 min",aErr:"Couldn\'t publish: ",aOff:"You need internet to publish",aLoad:"Loading…",aSee:"Open app",'
JS='''
const APPS=%s;const GH={o:"brianaustingreenburg-dev",r:"mxstudio",b:"main"};
let actSlug=null;
async function openAct(slug,name){const t=L();actSlug=slug;let c={};
 $("sheetBox").innerHTML=`<p style="text-align:center">${t.aLoad}</p>`;$("sheet").classList.add("on");
 try{const r=await fetch("../c/"+slug+"/config.json?t="+Date.now(),{cache:"no-store"});if(r.ok)c=await r.json()}catch(_){}
 let key="";try{key=localStorage.getItem("crear-gh")||""}catch(_){}
 const w=c.wifi||{},ck=(id,k,l,def)=>`<label class="aopt"><input type="checkbox" id="${id}" ${(c[k]??def)?"checked":""}><span>${l}</span></label>`;
 $("sheetBox").innerHTML=`<h3 class="ah">⚙️ ${t.actT}</h3><div class="an">${esc(name)}</div><p class="as">${t.actS}</p>
  <label class="al">${t.aWa}</label><input class="ai" id="aW" type="tel" value="${esc(String(c.whatsapp||"").replace(/^52/,""))}" placeholder="744 123 4567">
  <label class="al">${t.aWn}</label><input class="ai" id="aN" value="${esc(w.name||"")}" placeholder="Infinitum_A1B2">
  <label class="al">${t.aWp}</label><input class="ai" id="aP" value="${esc(w.pass||"")}">
  <div class="aops">${ck("ow","waiter",t.aOw,true)}${ck("oc","carryout",t.aOc,false)}${ck("or","reservations",t.aOr,false)}</div>
  ${key?"":`<label class="al">${t.aKey}</label><input class="ai" id="aK" type="password" autocomplete="off"><p class="as" style="font-size:.78em">${t.aKeyH}</p>`}
  <button class="share" id="aPub" style="margin-top:12px">${t.aPub}</button>
  <a class="close" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="../c/${slug}/">${t.aSee} →</a>
  <button class="close" id="closeSheet">${t.close}</button>`;
}
async function publishAct(){const t=L();if(!navigator.onLine){toast(t.aOff);return}
 const kI=$("aK");if(kI&&kI.value.trim()){try{localStorage.setItem("crear-gh",kI.value.trim())}catch(_){}}
 let key="";try{key=localStorage.getItem("crear-gh")||""}catch(_){}if(!key){kI&&kI.focus();return}
 const wa=($("aW").value||"").replace(/\\D/g,""),cfg={whatsapp:wa?(wa.length===10?"52"+wa:wa):"",wifi:$("aN").value.trim()?{name:$("aN").value.trim(),pass:$("aP").value}:null,waiter:$("ow").checked,carryout:$("oc").checked,reservations:$("or").checked,updated:new Date().toISOString()};
 if((cfg.carryout||cfg.reservations)&&wa.length<10){toast(t.aNeedWa);$("aW").focus();return}
 const btn=$("aPub");btn.disabled=true;btn.textContent="…";
 const path="acapulco/c/"+actSlug+"/config.json",api=`https://api.github.com/repos/${GH.o}/${GH.r}/contents/${path}`,h={Authorization:"Bearer "+key,Accept:"application/vnd.github+json"};
 try{let sha;const g=await fetch(api+"?ref="+GH.b,{headers:h,cache:"no-store"});if(g.ok)sha=(await g.json()).sha;else if(g.status===401||g.status===403)throw new Error("llave / key "+g.status);
  const body=JSON.stringify({message:"Activar "+actSlug+" ✝️",branch:GH.b,content:btoa(unescape(encodeURIComponent(JSON.stringify(cfg,null,1)))),...(sha?{sha}:{})});
  const p=await fetch(api,{method:"PUT",headers:h,body});if(!p.ok){const j=await p.json().catch(()=>({}));if(p.status===401)try{localStorage.removeItem("crear-gh")}catch(_){};throw new Error(p.status+" "+(j.message||""))}
  toast(t.aOk);$("sheet").classList.remove("on");
 }catch(err){btn.disabled=false;btn.textContent=t.aPub;toast(t.aErr+err.message)}
}
'''%json.dumps(APPS)
CSS='.ah{margin:0 0 2px}.an{font-weight:800;color:var(--gold)}.as{font-size:.85em;opacity:.8;margin:6px 0 4px}.al{display:block;font-weight:700;font-size:.82em;margin:10px 0 4px;opacity:.85}.ai{width:100%;box-sizing:border-box;padding:12px;border-radius:12px;border:1.5px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:inherit;font:inherit;font-size:16px}.aops{margin-top:10px}.aopt{display:flex;gap:10px;align-items:center;padding:8px 0;font-weight:700}.aopt input{width:22px;height:22px;accent-color:#d9a35f}\n.appBtns{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.appBtns a,.appBtns button{all:unset;box-sizing:border-box;text-align:center;padding:12px 6px;border-radius:12px;font-weight:800;font-size:.85em;cursor:pointer;background:rgba(255,255,255,.08);border:1.5px solid rgba(217,163,95,.45)}\n'
def patch(h):
    old='   ${s.demo?`<a class="demoBtn" href="../demo/?id=${s.demo}">${t.demoB}</a>`:""}'
    assert h.count(old)==1
    new='   ${APPS[s.demo]?`<a class="demoBtn" href="../c/${APPS[s.demo]}/">${t.appB}</a><div class="appBtns"><button data-act="${APPS[s.demo]}" data-nm="${esc(s.n)}">${t.actB}</button><a href="../c/${APPS[s.demo]}/tarjeta-5x7.pdf" target="_blank">${t.cardB}</a></div>`:(s.demo?`<a class="demoBtn" href="../demo/?id=${s.demo}">${t.demoB}</a>`:"")}'
    h=h.replace(old,new)
    for a,b in [('demoB:"✨ Ver su app demo",','demoB:"✨ Ver su app demo",'+ES),('demoB:"✨ Show their demo app",','demoB:"✨ Show their demo app",'+EN)]:
        assert h.count(a)==1,a;h=h.replace(a,b)
    a='function showPrices(){';assert h.count(a)==1;h=h.replace(a,JS+a)
    a='$("sheet").onclick=e=>{if(e.target.id==="sheet"||e.target.id==="closeSheet")$("sheet").classList.remove("on")};'
    assert h.count(a)==1;h=h.replace(a,'$("sheet").onclick=e=>{if(e.target.id==="aPub"){publishAct();return}if(e.target.id==="sheet"||e.target.id==="closeSheet")$("sheet").classList.remove("on")};')
    a=' const go=e.target.closest("[data-go]");';assert h.count(a)==1
    h=h.replace(a,' const ac=e.target.closest("[data-act]");if(ac){openAct(ac.dataset.act,ac.dataset.nm);return}\n'+a)
    a='.demoBtn{';assert h.count(a)==1;h=h.replace(a,CSS+a)
    return h
for f in sys.argv[1:]:
    h=open(f).read();assert 'openAct' not in h,f;open(f,'w').write(patch(h));print('patched',f)
