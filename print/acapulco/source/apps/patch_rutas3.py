import sys,re,json
live=json.load(open('/home/claude/routes/live-index.json'))
APPS={x['id']:x['slug'] for x in live}
JS='''
const APPS=%s;
let actSlug=null,actName="";
const actGet=s=>{try{return JSON.parse(localStorage.getItem("mx-act-"+s)||"null")}catch(_){return null}};
const b64u=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\\+/g,"-").replace(/\\//g,"_").replace(/=+$/,"");
const appUrl=s=>{const a=actGet(s);return "../c/"+s+"/"+(a&&a.a?"?a="+a.a:"")};
const cardUrl=s=>{const a=actGet(s);return "../tarjeta/?s="+s+(a&&a.a?"&a="+a.a:"")};
function qrSvg(t){const qr=qrcode(0,"M");qr.addData(t);qr.make();const n=qr.getModuleCount();let d="";for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(qr.isDark(r,c))d+=`M${c},${r}h1v1h-1z`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${n+4} ${n+4}" shape-rendering="crispEdges" style="width:230px;height:230px;display:block;margin:10px auto;background:#fff;border-radius:14px"><path d="${d}" fill="#000"/></svg>`}
function openAct(slug,name){const t=L();actSlug=slug;actName=name;const c=actGet(slug)||{},o=c.o||"m";
 const ck=(id,k,l)=>`<label class="aopt"><input type="checkbox" id="${id}" ${o.includes(k)?"checked":""}><span>${l}</span></label>`;
 $("sheetBox").innerHTML=`<h3 class="ah">⚙️ ${t.actT}</h3><div class="an">${esc(name)}</div><p class="as">${t.actS}</p>
  <label class="al">${t.aWa}</label><input class="ai" id="aW" type="tel" value="${esc(String(c.w||"").replace(/^52/,""))}" placeholder="744 123 4567">
  <label class="al">${t.aWn}</label><input class="ai" id="aN" value="${esc(c.n||"")}" placeholder="Infinitum_A1B2">
  <label class="al">${t.aWp}</label><input class="ai" id="aP" value="${esc(c.p||"")}">
  <div class="aops">${ck("ow","m",t.aOw)}${ck("oc","c",t.aOc)}${ck("or","r",t.aOr)}</div>
  <button class="share" id="aPub" style="margin-top:12px">${t.aPub}</button>
  <button class="close" id="closeSheet">${t.close}</button>`;
 $("sheet").classList.add("on");
}
function publishAct(){const t=L();const wa=($("aW").value||"").replace(/\\D/g,""),w=wa?(wa.length===10?"52"+wa:wa):"";
 const o=($("ow").checked?"m":"")+($("oc").checked?"c":"")+($("or").checked?"r":"");
 if(/[cr]/.test(o)&&wa.length<10){toast(t.aNeedWa);$("aW").focus();return}
 const cfg={w,n:$("aN").value.trim(),p:$("aN").value.trim()?$("aP").value:"",o};const a=b64u(cfg);
 try{localStorage.setItem("mx-act-"+actSlug,JSON.stringify(Object.assign({a},cfg)))}catch(_){}
 const url="https://go.myjefetech.app/acapulco/c/"+actSlug+"/?a="+a;
 const msg=`¡Hola! Tu app de *${actName}* ya está lista ✅\\n${url}\\n\\nÁbrela y agrégala a tu pantalla de inicio (Compartir → Agregar a inicio).\\nTu tarjeta 5×7 para imprimir: https://go.myjefetech.app/acapulco/tarjeta/?s=${actSlug}&a=${a}\\n\\nHi! Your *${actName}* app is ready ✅ Open the link and add it to your home screen.\\n\\n— MX Studio ✝ · +52 744 193 0502`;
 $("sheetBox").innerHTML=`<h3 class="ah">${t.sendT}</h3><div class="an">${esc(actName)}</div><p class="as">${t.sendS}</p>${qrSvg(url)}
  ${w?`<a class="share" style="display:block;text-decoration:none;margin-top:8px;background:#25d366;color:#063117" target="_blank" href="https://api.whatsapp.com/send?phone=${w}&text=${encodeURIComponent(msg)}">${t.sendB}</a>`:`<p class="as">${t.sendNoWa}</p>`}
  <a class="close" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="../tarjeta/?s=${actSlug}&a=${a}">${t.cardB}</a>
  <a class="close" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="../c/${actSlug}/?a=${a}">${t.aSee} →</a>
  <button class="close" id="copyL" data-u="${url}">${t.copyL}</button>
  <button class="close" id="closeSheet">${t.close}</button>`;
 render();
}
'''%json.dumps(APPS)
def patch(h):
    i=h.index('\nconst APPS=');j=h.index('function showPrices(){')
    h=h[:i]+JS+h[j:]
    # buttons use saved settings
    h=h.replace('href="../c/${APPS[s.demo]}/">${t.appB}</a>','href="${appUrl(APPS[s.demo])}">${t.appB}</a>')
    h=h.replace('<a href="../c/${APPS[s.demo]}/tarjeta-5x7.pdf" target="_blank">${t.cardB}</a>','<a href="${cardUrl(APPS[s.demo])}">${t.cardB}</a>')
    # texts
    h=h.replace('actS:"Escribe los datos del dueño y toca Publicar. La app se actualiza en 1–2 minutos."','actS:"Escribe los datos del dueño y toca Crear. Sale su link, su QR y su tarjeta al instante — sin internet, sin Git."')
    h=h.replace('actS:"Enter the owner\\\'s details and tap Publish. The app updates in 1–2 minutes."','actS:"Enter the owner\\\'s details and tap Create. Their link, QR and card are ready instantly — no internet, no Git."')
    h=h.replace('aPub:"Publicar"','aPub:"✅ Crear su app"').replace('aPub:"Publish"','aPub:"✅ Create their app"')
    h=h.replace('sendT:"✅ ¡Publicado!",sendS:"Su app se actualiza en 1–2 minutos. Mándale su link al dueño:"','sendT:"✅ ¡Su app está lista!",sendS:"Que el dueño escanee este QR, o mándale su link:"')
    h=h.replace('sendT:"✅ Published!",sendS:"Their app updates in 1–2 minutes. Send the owner their link:"','sendT:"✅ Their app is ready!",sendS:"Have the owner scan this QR, or send them their link:"')
    if '../lib/qrcode.js' not in h:
        k=h.index('<script>\nconst');h=h[:k]+'<script src="../lib/qrcode.js"></script>\n'+h[k:]
    assert 'api.github.com' not in h
    return h
for f in sys.argv[1:]:
    h=open(f).read();open(f,'w').write(patch(h));print('patched',f)
