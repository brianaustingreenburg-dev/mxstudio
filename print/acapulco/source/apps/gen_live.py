import sys,json,os,shutil,io,base64,asyncio,re
sys.path.insert(0,'/home/claude/routes');from fill import fill,manifest
import qrcode,qrcode.image.svg,zxingcpp
from PIL import Image
A='/home/claude/mxstudio/acapulco/'
apps=json.load(open('/home/claude/routes/apps.json'));live=json.load(open('/home/claude/routes/live.json'))
ids=json.load(open('/tmp/claude-0/demo-ids.json'))  # name -> id, in route order
names=list(ids.keys());tpl=open(A+'app/plantilla.html').read();ctpl=open('/home/claude/routes/cardtpl/card.html').read()
F='/home/claude/card/node_modules/@fontsource/montserrat/files/montserrat-latin-%s-normal.woff2'
def e(s):return (s or '').replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
out_index=[];jobs=[]
for n,name in enumerate(names,1):
    pid=ids[name];L=live[str(n)];slug=L['slug'];d=json.loads(json.dumps(apps[pid]).replace(f'img/{pid}/','img/'))
    o=A+f'c/{slug}/';os.makedirs(o+'img',exist_ok=True)
    for f in os.listdir(A+f'demo/img/{pid}'):shutil.copy(A+f'demo/img/{pid}/{f}',o+'img/'+f)
    d.update(slug=slug,demo=False,phone=L['phone'],whatsapp='',hours=L['hours'],address=L.get('address',d['address']),waiter=True,carryout=False,reservations=False)
    d.pop('wifi',None);d.pop('back',None)
    html=fill(tpl,d)
    html=html.replace('<meta property="og:image"',f'<meta property="og:url" content="https://go.myjefetech.app/acapulco/c/{slug}/">\n<meta property="og:image"',1)
    open(o+'index.html','w').write(html);open(o+'manifest.json','w').write(manifest(d))
    if not os.path.exists(o+'config.json'):
        json.dump({"whatsapp":"","wifi":None,"waiter":True,"carryout":False,"reservations":False},open(o+'config.json','w'))
    url=f'https://go.myjefetech.app/acapulco/c/{slug}/'
    q=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,border=0,box_size=10);q.add_data(url);q.make(fit=True)
    b=io.BytesIO();q.make_image(image_factory=qrcode.image.svg.SvgPathImage).save(b);qs=b.getvalue().decode();qs=qs[qs.index('<svg'):]
    # back: most popular dishes
    sig=[it for c in d['menu'] for it in c['items'] if it.get('img')][:4]
    back='<h3>Lo más pedido · Most popular</h3>'+''.join(f'<div class="hl"><span>{i+1}</span><div><b>{e(it["name"]["es"])}</b><i>{e(it["name"]["en"])}</i></div></div>' for i,it in enumerate(sig))
    cov='data:image/jpeg;base64,'+base64.b64encode(open(o+'img/cover.jpg','rb').read()).decode()
    ph=L['phone'];phs=f'<br><b>Tel:</b> {e(ph)}' if ph else ''
    c=ctpl
    for k,v in {'{{F5}}':F%'500','{{F7}}':F%'700','{{F8}}':F%'800','{{COLOR}}':d['color'],'{{NAME}}':e(d['name']),'{{QR}}':qs,'{{COVER}}':cov,'{{TAG_ES}}':e(d['tagline']['es']),'{{TAG_EN}}':e(d['tagline']['en']),
        '{{BACK}}':back,'{{ADDR}}':e(d['address']),'{{PHONE}}':phs,'{{HRS}}':e(L['hours']['es']),'{{HRS_EN}}':e(L['hours']['en']),'{{URL}}':url.replace('https://','')}.items():c=c.replace(k,v)
    open(f'/tmp/claude-0/card-{slug}.html','w').write(c);jobs.append((slug,url,o))
    out_index.append({"n":n,"name":name,"slug":slug,"id":pid,"url":url})
json.dump(out_index,open('/home/claude/routes/live-index.json','w'),ensure_ascii=False,indent=1)
from playwright.async_api import async_playwright
from pypdf import PdfReader,PdfWriter,PageObject,Transformation
from reportlab.pdfgen import canvas
async def render():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':504,'height':696},device_scale_factor=300/96)
        for slug,url,o in jobs:
            await pg.goto(f'file:///tmp/claude-0/card-{slug}.html');await pg.wait_for_timeout(500)
            await pg.pdf(path=o+'tarjeta-5x7.pdf',width='5.25in',height='7.25in',print_background=True)
            await pg.locator('.side').nth(0).screenshot(path=f'/tmp/claude-0/cf-{slug}.png')
            await pg.locator('.side').nth(1).screenshot(path=f'/tmp/claude-0/cb-{slug}.png')
        await b.close()
asyncio.run(render())
IN=72;CW,CH,B=5.25,7.25,0.125;W,H=11,8.5;x0=(W-2*CW)/2;y0=(H-CH)/2
buf=io.BytesIO();cv=canvas.Canvas(buf,pagesize=(W*IN,H*IN));cv.setLineWidth(.4)
for x in [x0+B,x0+CW-B,x0+CW+B,x0+2*CW-B]:cv.line(x*IN,(y0+CH+.04)*IN,x*IN,(y0+CH+.3)*IN);cv.line(x*IN,(y0-.3)*IN,x*IN,(y0-.04)*IN)
for y in [y0+B,y0+CH-B]:cv.line((x0-.3)*IN,y*IN,(x0-.04)*IN,y*IN);cv.line((x0+2*CW+.04)*IN,y*IN,(x0+2*CW+.3)*IN,y*IN)
cv.save();mkb=buf.getvalue()
bad=[]
for slug,url,o in jobs:
    src=PdfReader(o+'tarjeta-5x7.pdf');w=PdfWriter()
    for pg in src.pages[:2]:
        s=PageObject.create_blank_page(width=W*IN,height=H*IN)
        for i in range(2):s.merge_transformed_page(pg,Transformation().translate((x0+i*CW)*IN,y0*IN))
        s.merge_page(PdfReader(io.BytesIO(mkb)).pages[0]);w.add_page(s)
    w.write(o+'tarjeta-2-por-hoja-carta.pdf')
    r=[x.text for x in zxingcpp.read_barcodes(Image.open(f'/tmp/claude-0/cf-{slug}.png'))]
    if url not in r:bad.append((slug,r))
print('built',len(jobs),'QR failures',bad)
