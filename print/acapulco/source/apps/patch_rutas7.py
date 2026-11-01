import sys
ES='cOk:"☁️ También guardado en línea: se actualiza aunque tengan la tarjeta vieja.",cNo:"Solo en su link y QR nuevos. Para actualizar tarjetas ya impresas, agrega tu llave de GitHub en ✏️ Editar menú.",cErr:"No se guardó en línea: ",'
EN='cOk:"☁️ Also saved online: updates even on cards already printed.",cNo:"Only in their new link and QR. To update cards already printed, add your GitHub key in ✏️ Edit menu.",cErr:"Not saved online: ",'
JS='''
async function pushCfg(slug,cfg){const t=L(),el=$("cfgSt");let key="";try{key=localStorage.getItem("crear-gh")||""}catch(_){}
 if(!key||!navigator.onLine){if(el)el.textContent=t.cNo;return}
 const body={whatsapp:cfg.w,wifi:cfg.n?{name:cfg.n,pass:cfg.p}:null,waiter:cfg.o.includes("m"),carryout:cfg.o.includes("c"),reservations:cfg.o.includes("r"),t:cfg.t};
 const api="https://api.github.com/repos/brianaustingreenburg-dev/mxstudio/contents/acapulco/c/"+slug+"/config.json",h={Authorization:"Bearer "+key,Accept:"application/vnd.github+json"};
 try{let sha;const g=await fetch(api+"?ref=main",{headers:h,cache:"no-store"});if(g.ok)sha=(await g.json()).sha;else if(g.status===401||g.status===403)throw new Error("llave / key "+g.status);
  const p=await fetch(api,{method:"PUT",headers:h,body:JSON.stringify({message:"Activar "+slug+" ✝️",branch:"main",sha,content:btoa(unescape(encodeURIComponent(JSON.stringify(body,null,1))))})});
  if(!p.ok)throw new Error(p.status);if(el)el.textContent=t.cOk}catch(err){if(el)el.textContent=t.cErr+err.message}}
'''
def patch(h):
    for a,b in [('appB:"📱 Abrir su app",',ES+'appB:"📱 Abrir su app",'),('appB:"📱 Open their app",',EN+'appB:"📱 Open their app",')]:
        assert h.count(a)==1;h=h.replace(a,b)
    a='const cfg={w,n:$("aN").value.trim(),p:$("aN").value.trim()?$("aP").value:"",o};'
    assert h.count(a)==1;h=h.replace(a,'const cfg={w,n:$("aN").value.trim(),p:$("aN").value.trim()?$("aP").value:"",o,t:Date.now()};')
    a='<p class="as">${t.sendS}</p>${qrSvg(url)}'
    assert h.count(a)==1;h=h.replace(a,'<p class="as">${t.sendS}</p>${qrSvg(url)}<p class="as" id="cfgSt" style="text-align:center">…</p>')
    a=' render();\n}'
    i=h.index('function publishAct(){');j=h.index(a,i)
    h=h[:j]+' render();pushCfg(actSlug,cfg);\n}'+h[j+len(a):]
    a='function showPrices(){';assert h.count(a)==1;h=h.replace(a,JS+a)
    return h
for f in sys.argv[1:]:
    h=open(f).read();assert 'pushCfg' not in h;open(f,'w').write(patch(h));print('patched',f)
