import urllib.parse,json,html,os,re,shutil,unicodedata
from PIL import Image
R=json.load(open('/tmp/claude-0/rutas.json'))
A='/home/claude/mxstudio/acapulco/'
COL={'mar':['#0f6e8c','#b5642f','#1d7a6a','#c2502f','#0b5d7a','#a0522d','#127a8a','#9c3d2b'],'res':['#b03a48','#c48a1a','#7a3b1d','#2d6a4f','#8f2d56'],'cafe':['#6b3e22','#8a5a35','#4e342e','#a0673a','#5d4037','#7b4a2a']}
def norm(s):return unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower().strip()
stops=[s for r in R['routes'] for s in r['stops']]
assert len(stops)==26
shutil.rmtree(A+'demo/img',ignore_errors=True)
B={};cnt={'mar':0,'res':0,'cafe':0};report=[];imgs=[]
for n,s in enumerate(stops,1):
    m=json.load(open(f'/home/claude/routes/menus/{n}.json'))
    assert norm(m['name'])[:6]==norm(s['n'])[:6],(n,m['name'],s['n'])
    k=m['kind'] if m['kind'] in COL else 'res'
    pid=s['id'][-8:];col=COL[k][cnt[k]%len(COL[k])];cnt[k]+=1
    d=A+f'demo/img/{pid}/';os.makedirs(d,exist_ok=True)
    for f,w in [('cover',1000),('s1',640),('s2',640),('s3',640),('s4',640)]:
        im=Image.open(f'/home/claude/routes/photos/{n}/{f}.jpg').convert('RGB')
        if im.width>w:im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)
        im.save(d+f+'.jpg',quality=76,optimize=True,progressive=True);imgs.append(f'demo/img/{pid}/{f}.jpg')
    sig=[norm(x) for x in m['signature']];used=set()
    menu=[];buffet=False
    for c in m['menu']:
        its=[]
        for it in c['items']:
            nm=norm(it['name']['es']);img=''
            for i,sg in enumerate(sig):
                if i not in used and (sg==nm or sg in nm or nm in sg):
                    img=f'img/{pid}/s{i+1}.jpg';used.add(i);break
            pr=str(it.get('price','')).strip()
            desc=dict(it.get('desc') or {'es':'','en':''})
            if pr in ('0','0.0'):
                pr='';buffet=True
                desc={'es':(desc.get('es','')+' · Incluido en el buffet').strip(' ·'),'en':(desc.get('en','')+' · Included in buffet').strip(' ·')}
            its.append({"name":it['name'],"desc":desc,"price":pr,"img":img})
        menu.append({"cat":c['cat'],"items":its})
    # signature items first so the "most popular" rail shows them
    missing=[m['signature'][i] for i in range(len(sig)) if i not in used]
    nm_clean=re.sub(r'[^A-Za-z0-9]','',norm(s['n']).title().replace(' ',''))[:18]
    B[pid]={"slug":"demo-"+pid,"name":s['n'],"tagline":m['tagline'],"color":col,"logo":"","cover":f"img/{pid}/cover.jpg",
      "whatsapp":"527441930502","phone":"527441930502","address":s['a'].replace('…',''),"map":"https://www.google.com/maps/search/?api=1&query="+urllib.parse.quote(s['n']+' Acapulco')+"&query_place_id="+s['id'],
      "hours":m.get('hours') or {"es":"","en":""},"reservations":True,"carryout":True,"waiter":True,"delivery":k!='cafe',
      "wifi":{"name":"WiFi "+s["n"][:22],"pass":"ejemplo2026"},
      "menu":menu,"demo":True,"back":"../rutas/"}
    report.append((n,s['n'],m['source'],len(used),missing))
json.dump(B,open('/home/claude/routes/apps.json','w'),ensure_ascii=False,indent=1)
js=json.dumps(B,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
expr="(function(){const X=%s;const q=new URLSearchParams(location.search);return X[q.get('id')]||X[Object.keys(X)[0]]})()"%js
t=open(A+'app/plantilla.html').read()
out=t.replace('/*__DATA__*/null',expr)
for a,b in {'__TITLE__':'Demo · MX Studio','__DESC__':'App demo por MX Studio','__COLOR__':'#000000','__ICON__':'../icon-192.png','__SHORT__':'Demo MX'}.items():
    out=out.replace(a,html.escape(b,quote=True))
assert out.count('"../../sw.js"')==1;out=out.replace('"../../sw.js"','"../sw.js"')
out=out.replace('<meta name="theme-color"','<meta name="robots" content="noindex,nofollow">\n<meta name="theme-color"')
out=out.replace('Demo creada por MX Studio ✝ · Menú y fotos de ejemplo','Demo creada por MX Studio ✝ · Vista previa de tu app').replace('Demo by MX Studio ✝ · Sample menu and photos','Demo by MX Studio ✝ · Preview of your app')
open(A+'demo/index.html','w').write(out)
json.dump(imgs,open('/tmp/claude-0/demo-imgs.json','w'))
for r in report:print(r)
print(len(out)//1024,'KB html', sum(os.path.getsize(A+i) for i in imgs)//1024,'KB imgs')
