import sys
G='''<div id="guion" class="wrap" style="display:none">
<div class="gh"><h2>🎤 Guion · Pitch</h2><p>Menos de 2 minutos · Under 2 minutes. Deja que el dueño agarre tu teléfono · Let the owner hold your phone.</p></div>
<div class="gs"><div class="gn">1</div><div><h3>Entra · Walk in <small>10 s</small></h3><p class="es">"Buenas tardes, ¿está el dueño o el encargado? Soy Brian, de MX Studio. Le hice algo a su restaurante, ¿me regala 2 minutos?"</p><p class="en">Good afternoon, is the owner or manager here? I'm Brian from MX Studio. I made something for your restaurant, can I have 2 minutes?</p></div></div>
<div class="gs"><div class="gn">2</div><div><h3>Su app · Their app <small>30 s</small></h3><p class="do">Vender hoy → su restaurante → <b>📱 Abrir su app</b> → dale el teléfono · hand them the phone</p><p class="es">"Esta es la app de [nombre], ya hecha: su menú con fotos, en español e inglés, botón de WiFi, cómo llegar y llamar."</p><p class="en">This is [name]'s app, already done: your menu with photos, in Spanish and English, WiFi button, directions and call.</p><p class="do">Toca <b>EN</b> para que vean el inglés · Tap EN to show English (turistas · tourists)</p></div></div>
<div class="gs"><div class="gn">3</div><div><h3>Cómo se usa · How customers use it <small>30 s</small></h3><p class="do">Toca <b>+</b> en 2 platillos → <b>👀 Mostrar al mesero</b></p><p class="es">"El cliente escanea el QR en la mesa, ve el menú, arma su pedido y se lo enseña al mesero. Si quiere, también pedidos para llevar y reservas por su WhatsApp."</p><p class="en">The customer scans the QR at the table, sees the menu, builds the order and shows it to the waiter. Optional: carry-out and reservations on your WhatsApp.</p></div></div>
<div class="gs"><div class="gn">4</div><div><h3>Precio · Price <small>15 s</small></h3><p class="do">Pestaña <b>💲 Precios</b> · Prices tab</p><p class="es">"Son $2,000 de instalación y $1,000 al año de soporte, con cambios ilimitados. Sin contrato. Si cancela, le devuelvo los meses que no usó."</p><p class="en">$2,000 setup and $1,000 a year for support, unlimited changes. No contract. If you cancel, I refund the unused months.</p></div></div>
<div class="gs"><div class="gn">5</div><div><h3>Cierra · Close <small>30 s</small></h3><p class="es">"Si le gusta, la activamos ahorita: me da su WhatsApp y la clave del WiFi, y en un minuto ya es suya, con su tarjeta para imprimir."</p><p class="en">If you like it, we activate it now: your WhatsApp and WiFi password, and in a minute it's yours, with your card to print.</p><p class="do"><b>⚙️ Activar</b> → que escanee el QR de tu pantalla · they scan the QR on your screen → <b>📲 Enviar al dueño</b> → <b>💲 Comprar ahora</b> para cobrar · to get paid</p></div></div>
<div class="gh"><h2>Objeciones · Pushback</h2></div>
<div class="go"><b>"Ya tengo menú" · I already have a menu</b><p class="es">"Este se actualiza al momento, sin reimprimir, y en inglés para los turistas."</p><p class="en">This updates instantly, no reprinting, and in English for tourists.</p></div>
<div class="go"><b>"Está caro" · It's expensive</b><p class="es">"Son menos de $85 al mes, menos que un platillo."</p><p class="en">Less than $85 a month, less than one dish.</p></div>
<div class="go"><b>"Los precios están mal" · The prices are wrong</b><p class="es">"Los cambio ahorita, aquí mismo." → <b>✏️ Editar menú</b></p><p class="en">I'll change them right now, right here.</p></div>
<div class="go"><b>"Lo pienso" · I'll think about it</b><p class="es">"Claro. Le dejo su tarjeta con el QR para que la vea en su teléfono." → <b>🖨️ Tarjeta 5×7</b></p><p class="en">Of course. I'll leave you the card with the QR so you can see it on your phone.</p></div>
<div class="gh"><h2>Consejos · Tips</h2><p>🕒 De 3:30 a 6 pm (después de la comida, antes de la cena) · 3:30–6 pm.<br>🗺️ Empieza por la Ruta 1 (Costa Azul) · Start with Route 1.<br>📱 Que el dueño sostenga tu teléfono: se vende solo · Let the owner hold your phone: it sells itself.</p></div>
</div>'''
CSS='#guion{padding-bottom:40px}.gh{margin:16px 0 6px}.gh h2{margin:0 0 4px;font-size:1.25em}.gh p{opacity:.8;font-size:.88em;line-height:1.5;margin:0}.gs{display:flex;gap:12px;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:16px;padding:12px;margin:10px 0}.gn{flex:none;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;font-weight:900;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#1a0f0a}.gs h3{margin:2px 0 6px;font-size:1em}.gs h3 small{opacity:.6;font-weight:700;margin-left:6px}.gs p,.go p{margin:5px 0;line-height:1.45}.es{font-weight:700}.en{opacity:.72;font-style:italic;font-size:.92em}.do{font-size:.85em;color:var(--gold)}.go{background:rgba(224,160,58,.08);border:1px solid rgba(224,160,58,.3);border-radius:14px;padding:10px 12px;margin:8px 0}\n'
def patch(h):
    a='<button data-m="$" data-t="mPr"></button></div>'
    assert h.count(a)==1;h=h.replace(a,'<button data-m="$" data-t="mPr"></button><button data-m="g" data-t="mG"></button></div>')
    a='<main class="wrap" id="main"></main>';assert h.count(a)==1;h=h.replace(a,a+'\n'+G)
    h=h.replace('es:{mR:"🗺️ Vender hoy",mP:"⚠️ Por confirmar",mPr:"💲 Precios",','es:{mR:"🗺️ Vender hoy",mP:"⚠️ Por confirmar",mPr:"💲 Precios",mG:"🎤 Guion",')
    h=h.replace('en:{mR:"🗺️ Sell today",mP:"⚠️ To confirm",mPr:"💲 Prices",','en:{mR:"🗺️ Sell today",mP:"⚠️ To confirm",mPr:"💲 Prices",mG:"🎤 Pitch",')
    a='function applyMode(){const m=st.mode||"r",P=m==="$";'
    assert h.count(a)==1
    h=h.replace(a,'function applyMode(){const m=st.mode||"r",P=m==="$"||m==="g",Gm=m==="g";')
    a='$("pwrap").style.display=P?"block":"none";'
    assert h.count(a)==1;h=h.replace(a,'$("pwrap").style.display=(P&&!Gm)?"block":"none";$("guion").style.display=Gm?"block":"none";')
    a='if(P){const f=$("pframe");'
    assert h.count(a)==1;h=h.replace(a,'if(P&&!Gm){const f=$("pframe");')
    h=h.replace('if(st.mode!=="$"&&was!==st.mode)st.route=1;save();applyMode();if(st.mode!=="$"){render();scrollTo({top:0})}','if(st.mode!=="$"&&st.mode!=="g"&&was!==st.mode)st.route=1;save();applyMode();scrollTo({top:0});if(st.mode!=="$"&&st.mode!=="g")render()')
    h=h.replace('if(qm==="p"||qm==="$"||qm==="r")st.mode=qm','if(qm==="p"||qm==="$"||qm==="r"||qm==="g")st.mode=qm')
    h=h.replace('.modes{display:grid;grid-template-columns:1fr 1fr 1fr;','.modes{display:grid;grid-template-columns:1fr 1fr;')
    h=h.replace('.modes{',CSS+'.modes{',1)
    return h
for f in sys.argv[1:]:
    h=open(f).read();assert 'id="guion"' not in h;open(f,'w').write(patch(h));print('patched',f)
