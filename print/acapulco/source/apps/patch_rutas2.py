import sys
ES='sendT:"✅ ¡Publicado!",sendS:"Su app se actualiza en 1–2 minutos. Mándale su link al dueño:",sendB:"📲 Enviar al dueño por WhatsApp",copyL:"📋 Copiar link",sendNoWa:"Escribe el WhatsApp del dueño arriba para mandárselo.",'
EN='sendT:"✅ Published!",sendS:"Their app updates in 1–2 minutes. Send the owner their link:",sendB:"📲 Send to the owner on WhatsApp",copyL:"📋 Copy link",sendNoWa:"Add the owner\'s WhatsApp above to send it.",'
def patch(h):
    for a,b in [('appB:"📱 Abrir su app",',ES+'appB:"📱 Abrir su app",'),('appB:"📱 Open their app",',EN+'appB:"📱 Open their app",')]:
        assert h.count(a)==1;h=h.replace(a,b)
    a='let actSlug=null;';assert h.count(a)==1;h=h.replace(a,'let actSlug=null,actName="";')
    a='async function openAct(slug,name){const t=L();actSlug=slug;';assert h.count(a)==1;h=h.replace(a,'async function openAct(slug,name){const t=L();actSlug=slug;actName=name;')
    a='  toast(t.aOk);$("sheet").classList.remove("on");'
    assert h.count(a)==1
    h=h.replace(a,'''  toast(t.aOk);const url="https://go.myjefetech.app/acapulco/c/"+actSlug+"/";
  const msg=`¡Hola! Tu app de *${actName}* ya está lista ✅\\n${url}\\n\\nÁbrela y agrégala a tu pantalla de inicio (Compartir → Agregar a inicio).\\nTu tarjeta 5×7 para imprimir: ${url}tarjeta-5x7.pdf\\n\\nHi! Your *${actName}* app is ready ✅ Open the link and add it to your home screen.\\n\\n— MX Studio ✝ · +52 744 193 0502`;
  $("sheetBox").innerHTML=`<h3 class="ah">${t.sendT}</h3><div class="an">${esc(actName)}</div><p class="as">${t.sendS}</p>
   <div class="ai" style="font-size:.85em;word-break:break-all">${esc(url)}</div>
   ${cfg.whatsapp?`<a class="share" style="display:block;text-decoration:none;margin-top:12px;background:#25d366;color:#063117" target="_blank" href="https://api.whatsapp.com/send?phone=${cfg.whatsapp}&text=${encodeURIComponent(msg)}">${t.sendB}</a>`:`<p class="as">${t.sendNoWa}</p>`}
   <button class="close" id="copyL" data-u="${url}">${t.copyL}</button>
   <a class="close" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="../c/${actSlug}/">${t.aSee} →</a>
   <button class="close" id="closeSheet">${t.close}</button>`;''')
    a='$("sheet").onclick=e=>{if(e.target.id==="aPub"){publishAct();return}'
    assert h.count(a)==1
    h=h.replace(a,'$("sheet").onclick=e=>{if(e.target.id==="aPub"){publishAct();return}if(e.target.id==="copyL"){const u=e.target.dataset.u;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>toast(L().copied)).catch(()=>toast(u));return}')
    return h
for f in sys.argv[1:]:
    h=open(f).read();open(f,'w').write(patch(h));print('patched',f)
