import json,re
F="/home/claude/card/node_modules/@fontsource/montserrat/files"
fonts=''.join(f'@font-face{{font-family:M;font-weight:{w};src:url({F}/montserrat-latin-{w}-normal.woff2)}}' for w in (500,600,700,800))
src=json.load(open('/root/.claude/projects/-home-claude/c3674f07-f153-54a4-8117-6511291d40f0/tool-results/mcp-widgets-places_search-1793483878416.txt'))['places']
P={p['place_id']:p for p in src}
PROMO='''<div class="promo"><div class="h">−20% instalación hasta 15 dic · Año 1: soporte GRATIS</div><div class="s">20% off setup until Dec 15 · Year 1: support FREE (7-day support, unlimited updates, hosting) · Plan fee starts year 2 · MXN + IVA</div><div class="plist">'''
def street(pid):
    a=P[pid]['address'].split(', ')
    a=[x for x in a if not re.search(r'Acapulco de Ju|Gro\.|Mexico|^\d{5}',x)]
    s=', '.join(a[:2]);s=re.sub(r'\s+',' ',s)
    return s[:52]+('…' if len(s)>52 else '')
PLANS={
 'qr':('Menú QR','QR menu','$4,900','$3,900','+ $490/mes desde año 2'),
 'app':('App Restaurante / Café','Restaurant / Café app','$14,900','$11,900','+ $990/mes desde año 2'),
 'pro':('Pro con inventario','Pro with inventory','$24,900','$19,900','+ $1,490/mes desde año 2'),
 'club':('App Club + inventario','Club app + inventory','$24,900','$19,900','+ $1,490/mes desde año 2'),
 'hotel':('Hotel / Resort','Hotel / Resort','desde $99,000','desde $79,000','+ $49,000/año desde año 2')}
DEF={'R':'app','C':'app','H':'hotel','S':'hotel','X':'club'}
OVR={'Terraza Buffet':'pro','Kassandra Beach House':'app','Antigua Acapulco':'app'}
def price(t,name):
    k=OVR.get(name,DEF[t]);es,en,reg,now,mo=PLANS[k]
    out=f'<div class="free">Año 1 gratis · Year 1 free</div><div class="price"><span class="pl">{es}</span> <s>{reg}</s> <b>{now}</b> <span class="mo">{mo}</span></div>'
    if t in 'RC' and k!='qr':
        q=PLANS['qr'];out+=f'<div class="alt">Básico / Basic: {q[0]} {q[3]} · año 1 gratis</div>'
    return out
T={'R':('Restaurante','Restaurant','#d98b5f'),'C':('Café','Café','#c9a26b'),'H':('Hotel','Hotel','#5fa3c9'),'X':('Club / Bar','Club / Bar','#b07cd9'),'S':('Resort','Resort','#5fc99a')}
R=[
 (1,"Costera / Zona Dorada","Hornos → Costa Azul","Restaurantes, cafés y hoteles juntos. La ruta más fácil para empezar.",
  "Tarjeta 5×7 · tarjeta de pedidos · demo Mesa 5",[
  ("ChIJ8evJ_wNYyoURIz6v-NiJBks","R","Buzos Costera","Demo Mesa + para llevar"),
  ("ChIJNQzHMrJZyoURBAEBxbTqFF0","C","Jumil Café y Cocina","Tarjeta de lealtad"),
  ("ChIJg2bQAQz4yoURaTXdYfMznSc","R","El Amigo Miguel","Llamar al mesero + menú bilingüe"),
  ("ChIJ9bdq2cJZyoUROql7HyHo9q0","R","Punto 55","Menú digital + reseñas"),
  ("ChIJGyBFq_FZyoUR7MF4w1_MDvw","C","Emilia Café","Lealtad + pedidos para llevar"),
  ("ChIJL9LcMERZyoURJ05rswgt_uo","R","Café al Mar","Menú bilingüe para turistas"),
  ("ChIJwVpUcP9ZyoUR6IrqA2KOq8I","R","Terraza Buffet","Escáner de inventario"),
  ("ChIJtVtTr9VZyoURq3ZNNNPUPd4","C","Narciso","Lealtad + promociones"),
  ("ChIJQ3My9VtZyoURz-ev_wnsUFM","H","Holiday Inn Acapulco Amarea","Pedir gerente general · demo Habitación"),
  ("ChIJoVnu1shZyoURlDJNcxglehg","H","El Tropicano Hotel","Tarjetas de habitación")]),
 (2,"Condesa y Escénica","Condesa → Las Brisas","Clubs, beach clubs y hoteles con vista. Ir en la tarde para encontrar al gerente.",
  "Tarjeta 5×7 · demo Habitación 214 · tarjetas de habitación",[
  ("ChIJBUM_9CZYyoURKXx7twWZVZc","X","Kassandra Beach House","Pedir desde el camastro"),
  ("ChIJjVPy3SxYyoURpodjVz_dd_4","X","Baby Lobster","Lista VIP + mesas"),
  ("ChIJH8pmGSZYyoURXdmiblARx4g","R","Antigua Acapulco","Menú digital + reseñas"),
  ("ChIJOUiqK8lZyoURuoG2BSbDq1I","X","Baby'O Acapulco","Escáner de licor (menos pérdidas)"),
  ("ChIJh1bn4rJZyoUR0n5Iewv9J8I","X","Ronin 22 Acapulco","QR de acceso + eventos"),
  ("ChIJD-Rfyy5YyoURmIzQMntfhPY","H","Park Royal Beach Acapulco","Servicio a cuarto + cargo a habitación"),
  ("ChIJK1Z_9KxZyoUROEfBjFDkHG0","H","Casa Tolteca","Guía digital del huésped"),
  ("ChIJo2dfcVJYyoURk98t8basMT4","H","Hotel Las Brisas Acapulco","Tarjetas de habitación")]),
 (3,"Diamante y Barra Vieja","Brisas del Marqués → Barra Vieja","Resorts grandes y mariscos de playa. En resorts, pedir cita con marketing o sistemas.",
  "Tarjeta 5×7 · tarjetas de habitación · tarjeta de pedidos",[
  ("ChIJ9xWDEf9YyoUROGmrQEJyET8","H","Hotel Encanto Acapulco","Guía digital del huésped"),
  ("ChIJ5w1uJ3FZyoURf-CFcpbDXFk","R","Don Camarón","Demo Mesa + para llevar"),
  ("ChIJ90RioRRZyoURuDzaTeeDAB4","R","La Casa del Mar","Menú bilingüe"),
  ("ChIJK64VFypZyoURCCmNC6TYDe4","R","Celeste Beach House","Reservas + menú de playa"),
  ("ChIJXzith0JZyoURHnbbVsCQkbE","R","Mary de Revolcadero","Pedidos por WhatsApp"),
  ("ChIJtXeAU_tbyoURy6L1mx-b7NI","S","Princess Mundo Imperial","Concierge app · pedir cita"),
  ("ChIJq33OiN5byoURK2j5pUK-bVI","R","Mariscos El Sirenito","Para llevar + reseñas"),
  ("ChIJE131tLFdyoUR7Gdhjip_m1U","S","Vidanta Acapulco","Cadena grande · pedir cita"),
  ("ChIJmXUMq-1byoURVctfJj-Ug_o","R","Paititi del Mar","Menú digital"),
  ("ChIJhQISnfRbyoURFwlJMY3GMzM","C","Café Acapulco Caféba","Lealtad"),
  ("ChIJse_lCA1CyoURquY__eQuxs8","R","Zabesu Barra Vieja","Dueño · tarjeta de pedidos"),
  ("ChIJiXL73f1ByoURoV7dE3m8bK4","R","Cira La Morena 1","Pedidos por WhatsApp")]),
 (4,"Centro, Caleta y Pie de la Cuesta","Caleta → Zócalo → Pie de la Cuesta","Hoteles clásicos, cafés del Zócalo y restaurantes de playa.",
  "Tarjeta 5×7 · demo Mesa 5 · tarjetas de habitación",[
  ("ChIJN_2WQt73yoURjFhj-a8KVPY","H","La Jolla Hotel","Guía del huésped + WiFi QR"),
  ("ChIJqQGa3In3yoURz_r0e4m4HMk","R","Mariscos Catamarán","Demo Mesa"),
  ("ChIJJ7aBRAj3yoUR-qOyeJCWbgY","H","Hotel Las Palmas Acapulco","Tarjetas de habitación"),
  ("ChIJwYDGQOX3yoURD274NMODhT0","H","Hotel Torre Eiffel","Guía del huésped"),
  ("ChIJMxLFXuX3yoURVdXG66gEd7M","H","Hotel Mirador Acapulco","Muchos turistas · bilingüe"),
  ("ChIJM6skj473yoURWOm66cxVA6Y","C","The Cauldron Wizard's Coffee","Lealtad + menú con fotos"),
  ("ChIJe_coruT3yoURaK1Jlg2pi-E","R","La Casa de los Abuelos","Menú digital"),
  ("ChIJRXoRjfz3yoUROrUuJ4Hteq8","C","Café Wadi","Lealtad + venta de café"),
  ("ChIJwQ-2gKH5yoURKK1zsIVGnis","R","Restaurant El Tío Markos","Para llevar + reseñas"),
  ("ChIJVTrolOH5yoUR5XxmuOGnk2A","R","ALTAMAR restaurante y jardín","Eventos + reservas"),
  ("ChIJYd4reRb5yoUR5lRJfpbSzOw","R","Tres Marías Restaurante","Ya tienes app tres-marias"),
  ("ChIJr_Sxzxv5yoURXWekKSUWH7I","R","La Choza de la Freed","Dueño · tarjeta de pedidos")])]
css=f"""{fonts}*{{margin:0;padding:0;box-sizing:border-box}}body{{font-family:M,sans-serif;background:#000;color:#f6ece0;width:390px}}
.wrap{{padding:22px 16px 26px}}
.top{{display:flex;align-items:center;gap:12px}}.top img{{width:54px;height:54px;filter:drop-shadow(0 0 10px rgba(224,112,58,.5))}}
.k{{font-weight:700;font-size:9.5px;letter-spacing:.24em;color:#e0703a}}
h1{{font-weight:800;font-size:23px;line-height:1.1;margin-top:3px}}h1 span{{color:#e8c48c}}
.sub{{color:#b9aaa0;font-size:11.5px;font-weight:600;margin-top:2px}}
.info{{margin:14px 0 10px;background:#0f0b0c;border:1px solid rgba(232,196,140,.22);border-radius:14px;padding:10px 12px;font-size:11.5px;line-height:1.45}}
.info b{{color:#e8c48c}}
.legend{{display:flex;justify-content:flex-end;gap:6px;font-size:8.5px;font-weight:800;letter-spacing:.06em;color:#b9aaa0;margin:4px 2px 6px}}
.legend span{{width:44px;text-align:center}}
.row{{display:flex;gap:9px;align-items:flex-start;background:#0f0b0c;border:1px solid rgba(232,196,140,.14);border-radius:14px;padding:10px 10px 9px;margin-bottom:7px}}
.n{{flex:0 0 26px;height:26px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:12px;color:#1a0f0a;background:linear-gradient(135deg,#e8c48c,#d9a35f)}}
.mid{{flex:1;min-width:0}}
.name{{font-weight:800;font-size:13.5px;line-height:1.15}}
.tag{{display:inline-block;font-weight:800;font-size:8.5px;letter-spacing:.06em;padding:2px 6px;border-radius:99px;color:#0b0b0b;margin:3px 4px 0 0;vertical-align:middle}}
.addr{{font-size:10px;color:#9d8f86;margin-top:3px}}
.pitch{{font-size:10.5px;font-weight:700;color:#e8c48c;margin-top:3px}}
.note{{margin-top:6px;border-bottom:1px dashed rgba(232,196,140,.28);height:14px;font-size:8.5px;color:#5f544e}}
.boxes{{display:flex;gap:6px;flex:0 0 auto;padding-top:2px}}
.box{{width:44px;height:30px;border:1.6px solid rgba(232,196,140,.55);border-radius:8px}}
.price{{margin-top:5px;font-size:10.5px;font-weight:700;line-height:1.35}}.price .pl{{color:#f6ece0}}.price s{{color:#7d7069;font-weight:600}}.price b{{color:#25d366;font-size:12px}}.price .mo{{color:#b9aaa0;font-weight:600}}
.free{{display:inline-block;white-space:nowrap;margin-top:5px;font-size:9px;font-weight:800;letter-spacing:.04em;padding:2px 7px;border-radius:99px;background:#25d366;color:#05301a}}
.alt{{font-size:9.5px;color:#9d8f86;font-weight:600;margin-top:1px}}
.promo{{margin:0 0 10px;border-radius:14px;padding:10px 12px;background:linear-gradient(135deg,#e8c48c,#d9a35f);color:#1a0f0a}}
.promo .h{{font-weight:800;font-size:13px}}.promo .s{{font-weight:700;font-size:10px;opacity:.85;margin-top:1px}}
.plist{{display:grid;grid-template-columns:auto 1fr;gap:3px 6px;margin-top:7px;font-size:9.6px;font-weight:700}}.plist>div:nth-child(odd){{white-space:nowrap}}.plist s{{opacity:.55;font-weight:600}}
.plist .r{{text-align:right}}.plist .y2{{font-weight:600;font-size:9px;opacity:.75}}
.foot{{text-align:center;color:#7d7069;font-size:9.5px;font-weight:600;margin-top:12px;line-height:1.5}}
.foot b{{color:#e8c48c}}"""
plist=''.join(f'<div>{v[0]}</div><div class="r"><s>{v[2]}</s> {v[3]}<br><span class="y2">{v[4].replace(" desde año 2","")} desde año 2</span></div>' for k,v in PLANS.items())
promo=PROMO+plist+'</div></div>'
for num,title,span,desc,bring,stops in R:
    rows=''
    for i,(pid,t,name,pitch) in enumerate(stops,1):
        es,en,col=T[t]
        rows+=f'<div class="row"><div class="n">{i}</div><div class="mid"><div class="name">{name}</div><span class="tag" style="background:{col}">{es.upper()}</span><div class="addr">{street(pid)}</div><div class="pitch">→ {pitch}</div>{price(t,name)}<div class="note">Notas / Notes</div></div><div class="boxes"><div class="box"></div><div class="box"></div><div class="box"></div></div></div>'
    html=f'''<!doctype html><html><head><meta charset="utf-8"><style>{css}</style></head><body><div class="wrap">
<div class="top"><img src="logo.png"><div><div class="k">MX STUDIO ✝ · RUTA {num} DE 4 · ROUTE {num}/4</div><h1>Ruta {num}<br><span>{title}</span></h1><div class="sub">{span} · {len(stops)} visitas / stops</div></div></div>
<div class="info">{desc}<br><b>Cuándo:</b> lun–jue, 3:30–6 pm · <b>Pide:</b> dueño o gerente<br><b>Lleva:</b> {bring}</div>
{promo}<div class="legend"><span>VISITÉ<br>VISITED</span><span>LE GUSTÓ<br>INTEREST</span><span>VOLVER<br>FOLLOW UP</span></div>
{rows}
<div class="foot">Marca con el editor de fotos (funciona sin internet) · Mark with your photo editor (works offline)<br><b>WhatsApp +52 744 193 0502</b> · go.myjefetech.app/acapulco</div>
</div></body></html>'''
    open(f'ruta{num}.html','w').write(html)
print('ok')
