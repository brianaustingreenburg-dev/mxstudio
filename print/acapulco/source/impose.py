# Puts the 5x7 card (5.25x7.25 with bleed) 2-up on letter and 4-up on tabloid, with cut marks
from pypdf import PdfReader, PdfWriter, PageObject, Transformation
from reportlab.pdfgen import canvas
import io
IN=72; CW,CH=5.25,7.25; B=0.125
src=PdfReader('MX-Studio-Card-5x7.pdf'); front,back=src.pages[0],src.pages[1]
def marks(W,H,cols,rows,x0,y0):
    buf=io.BytesIO(); c=canvas.Canvas(buf,pagesize=(W*IN,H*IN)); c.setLineWidth(0.4); c.setStrokeColorRGB(0,0,0)
    gx=x0+cols*CW; gy=y0+rows*CH
    xs=sorted({x0+i*CW+B for i in range(cols)}|{x0+(i+1)*CW-B for i in range(cols)})
    ys=sorted({y0+j*CH+B for j in range(rows)}|{y0+(j+1)*CH-B for j in range(rows)})
    for x in xs:
        c.line(x*IN,(gy+0.04)*IN,x*IN,min(H-0.02,gy+0.30)*IN); c.line(x*IN,max(0.02,y0-0.30)*IN,x*IN,(y0-0.04)*IN)
    for y in ys:
        c.line(max(0.02,x0-0.30)*IN,y*IN,(x0-0.04)*IN,y*IN); c.line((gx+0.04)*IN,y*IN,min(W-0.02,gx+0.30)*IN,y*IN)
    c.save(); buf.seek(0); return PdfReader(buf).pages[0]
def sheet(W,H,cols,rows,card,mk):
    p=PageObject.create_blank_page(width=W*IN,height=H*IN)
    x0=(W-cols*CW)/2; y0=(H-rows*CH)/2
    for i in range(cols):
        for j in range(rows):
            p.merge_transformed_page(card,Transformation().translate((x0+i*CW)*IN,(y0+j*CH)*IN))
    p.merge_page(mk); return p
for name,W,H,cols,rows in [('MX-Studio-Card-2-por-hoja-CARTA-Letter.pdf',11,8.5,2,1),('MX-Studio-Card-4-por-hoja-TABLOIDE-Tabloid.pdf',11,17,2,2)]:
    x0=(W-cols*CW)/2; y0=(H-rows*CH)/2
    w=PdfWriter()
    w.add_page(sheet(W,H,cols,rows,front,marks(W,H,cols,rows,x0,y0)))
    w.add_page(sheet(W,H,cols,rows,back,marks(W,H,cols,rows,x0,y0)))
    w.write(name); print(name,'margins x',x0,'y',y0)
