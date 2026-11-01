# Usage: python3 activate.py setup.json
# setup.json: {"id","slug","whatsapp","wifi_name","wifi_pass","story_es","story_en","owner"}
import sys,json,os,shutil,re,asyncio,io,base64
sys.path.insert(0,'/home/claude/routes');from fill import fill,manifest
import qrcode,qrcode.image.svg
S=json.load(open(sys.argv[1]))
A='/home/claude/mxstudio/acapulco/';P='/home/claude/mxstudio/print/acapulco/clientes/'
pid,slug=S['id'],S['slug']
d=json.load(open('/home/claude/routes/apps.json'))[pid]
wa=re.sub(r'\D','',S['whatsapp']);wa=wa if wa.startswith('52') else '52'+wa
out=A+f'c/{slug}/';os.makedirs(out+'img',exist_ok=True)
for f in os.listdir(A+f'demo/img/{pid}'):shutil.copy(A+f'demo/img/{pid}/{f}',out+'img/'+f)
d=json.loads(json.dumps(d).replace(f'img/{pid}/','img/'))
d.update(slug=slug,whatsapp=wa,phone=wa,wifi={"name":S['wifi_name'],"pass":S.get('wifi_pass','')},demo=False,
         story={"es":S.get('story_es',''),"en":S.get('story_en','')})
d.pop('back',None)
for k in ('menu','hours','tagline','address'):
    if k in S:d[k]=S[k]
open(out+'index.html','w').write(fill(open(A+'app/plantilla.html').read(),d))
open(out+'manifest.json','w').write(manifest(d))
json.dump(d,open(out+'datos.json','w'),ensure_ascii=False,indent=1)
url=f'https://go.myjefetech.app/acapulco/c/{slug}/'
# ---- 5x7 card ----
os.makedirs(P+slug,exist_ok=True)
qr=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,border=0,box_size=10);qr.add_data(url);qr.make(fit=True)
svg=io.BytesIO();qr.make_image(image_factory=qrcode.image.svg.SvgPathImage).save(svg)
qsvg=svg.getvalue().decode();qsvg=qsvg[qsvg.index('<svg'):]
cover='data:image/jpeg;base64,'+base64.b64encode(open(out+'img/cover.jpg','rb').read()).decode()
F='/home/claude/card/node_modules/@fontsource/montserrat/files/montserrat-latin-%s-normal.woff2'
def e(s):return (s or '').replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
hrs=d.get('hours') or {}
html=open('/home/claude/routes/cardtpl/card.html').read()
for k,v in {'{{F5}}':F%'500','{{F7}}':F%'700','{{F8}}':F%'800','{{COLOR}}':d['color'],'{{NAME}}':e(d['name']),'{{QR}}':qsvg,'{{COVER}}':cover,
  '{{TAG_ES}}':e(d['tagline'].get('es','')),'{{TAG_EN}}':e(d['tagline'].get('en','')),'{{STORY_ES}}':e(S.get('story_es','')),'{{STORY_EN}}':e(S.get('story_en','')),
  '{{ADDR}}':e(d.get('address','')),'{{HRS}}':e(hrs.get('es','')),'{{HRS_EN}}':e(hrs.get('en','')),'{{URL}}':url.replace('https://','')}.items():
    html=html.replace(k,v)
open(P+slug+'/card.html','w').write(html)
from playwright.async_api import async_playwright
async def render():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':504,'height':696},device_scale_factor=300/96)
        await pg.goto('file://'+P+slug+'/card.html');await pg.wait_for_timeout(900)
        n=await pg.evaluate("document.querySelector('.story').scrollHeight>document.querySelector('.story').clientHeight+2")
        if n:print('WARNING: story too long for the card, shorten it')
        await pg.pdf(path=P+slug+'/Card-5x7.pdf',width='5.25in',height='7.25in',print_background=True)
        for i,nm in enumerate(['front','back']):await pg.locator('.side').nth(i).screenshot(path=P+slug+f'/Card-{nm}.png')
        await b.close()
asyncio.run(render())
os.remove(P+slug+'/card.html')
# 2 per letter sheet
from pypdf import PdfReader,PdfWriter,PageObject,Transformation
from reportlab.pdfgen import canvas
IN=72;CW,CH,B=5.25,7.25,0.125;W,H=11,8.5
src=PdfReader(P+slug+'/Card-5x7.pdf');x0=(W-2*CW)/2;y0=(H-CH)/2
buf=io.BytesIO();c=canvas.Canvas(buf,pagesize=(W*IN,H*IN));c.setLineWidth(.4)
for x in [x0+B,x0+CW-B,x0+CW+B,x0+2*CW-B]:
    c.line(x*IN,(y0+CH+.04)*IN,x*IN,(y0+CH+.3)*IN);c.line(x*IN,(y0-.3)*IN,x*IN,(y0-.04)*IN)
for y in [y0+B,y0+CH-B]:
    c.line((x0-.3)*IN,y*IN,(x0-.04)*IN,y*IN);c.line((x0+2*CW+.04)*IN,y*IN,(x0+2*CW+.3)*IN,y*IN)
c.save();buf.seek(0);mk=PdfReader(buf).pages[0]
w=PdfWriter()
for pg in src.pages[:2]:
    s=PageObject.create_blank_page(width=W*IN,height=H*IN)
    for i in range(2):s.merge_transformed_page(pg,Transformation().translate((x0+i*CW)*IN,y0*IN))
    s.merge_page(mk);w.add_page(s)
w.write(P+slug+'/Card-2-por-hoja-CARTA-Letter.pdf')
# scan-test the QR
import zxingcpp
from PIL import Image
r=zxingcpp.read_barcodes(Image.open(P+slug+'/Card-front.png'))
print('QR reads:',[x.text for x in r],'OK' if any(x.text==url for x in r) else 'FAIL')
print('app:',out);print('card:',P+slug)
