import qrcode
BASE="https://go.myjefetech.app/acapulco"
def qr_svg(url,fill):
    q=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,border=0);q.add_data(url);q.make(fit=True)
    m=q.get_matrix();n=len(m)
    r=''.join(f'<rect x="{x}" y="{y}" width="1.02" height="1.02"/>' for y,row in enumerate(m) for x,v in enumerate(row) if v)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {n} {n}" shape-rendering="crispEdges"><g fill="{fill}">{r}</g></svg>'
F="node_modules/@fontsource/montserrat/files"
fonts=''.join(f'@font-face{{font-family:M;font-weight:{w};src:url({F}/montserrat-latin-{w}-normal.woff2)}}' for w in (500,600,700,800))
base=f"""<!doctype html><html><head><meta charset="utf-8"><style>{fonts}
@page{{size:4.25in 6.25in;margin:0}}*{{margin:0;padding:0;box-sizing:border-box}}body{{font-family:M,sans-serif}}
.c{{width:4.25in;height:6.25in;position:relative;overflow:hidden;page-break-after:always}}
.s{{position:absolute;inset:.32in;display:flex;flex-direction:column;align-items:center;justify-content:space-between;text-align:center}}
.qr{{background:#fff;border-radius:.16in;padding:.14in}}.qr svg{{width:2.15in;height:2.15in;display:block}}
.foot{{font-weight:700;font-size:6pt;letter-spacing:.16em;opacity:.55}}
"""
tables=''
for n in range(1,11):
    url=f"{BASE}/la-bahia/?mesa={n}"
    tables+=f"""<section class="c" style="background:#faf6f0;color:#1b1412"><div class="s">
 <div><div style="width:.55in;height:.55in;border-radius:.14in;background:#b5642f;color:#fff;display:grid;place-items:center;font-weight:800;font-size:15pt;margin:0 auto .08in">LB</div>
 <div style="font-weight:800;font-size:15pt">Mariscos La Bahía</div></div>
 <div><div style="font-weight:800;font-size:40pt;line-height:1;color:#b5642f">Mesa {n}</div><div style="font-weight:700;font-size:13pt;color:#7b6a62;letter-spacing:.08em">Table {n}</div></div>
 <div class="qr" style="border:.05in solid #b5642f">{qr_svg(url,'#1b1412')}</div>
 <div><div style="font-weight:800;font-size:11pt">Escanea: menú y llamar al mesero</div>
 <div style="font-weight:600;font-size:9.5pt;color:#7b6a62;margin-top:.03in">Scan: menu &amp; call your waiter</div>
 <div style="font-weight:600;font-size:8pt;color:#b5642f;margin-top:.08in">Funciona sin internet · Works offline</div></div>
 <div class="foot">EJEMPLO · SAMPLE · MX STUDIO ✝</div>
</div></section>"""
open('tables.html','w').write(base+"</style></head><body>"+tables+"</body></html>")
rooms=''
for n in [101,102,103,104,105,201,202,203,204,205]:
    url=f"{BASE}/hotel-caleta/?hab={n}"
    rooms+=f"""<section class="c" style="background:linear-gradient(170deg,#0f2a36,#1f5e7a 75%,#2f7f8f);color:#fff"><div class="s">
 <div style="font-weight:800;font-size:11pt;letter-spacing:.3em;color:#cfe6ee">HOTEL CALETA</div>
 <div><div style="font-weight:700;font-size:10pt;letter-spacing:.2em;color:#e0a43a">HABITACIÓN · ROOM</div><div style="font-weight:800;font-size:44pt;line-height:1.05">{n}</div></div>
 <div class="qr" style="border:.05in solid #e0a43a">{qr_svg(url,'#0f2a36')}</div>
 <div><div style="font-weight:800;font-size:10.5pt">Servicio a cuarto · WiFi · Toallas · Recepción</div>
 <div style="font-weight:600;font-size:9pt;color:#cfe6ee;margin-top:.03in">Room service · WiFi · Towels · Front desk</div>
 <div style="font-weight:700;font-size:8.5pt;color:#e0a43a;margin-top:.08in">Escanea con tu cámara · Scan with your camera</div></div>
 <div class="foot">EJEMPLO · SAMPLE · MX STUDIO ✝</div>
</div></section>"""
open('rooms.html','w').write(base+"</style></head><body>"+rooms+"</body></html>")
