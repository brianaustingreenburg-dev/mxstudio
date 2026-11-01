import sys,json,os,shutil,re,glob,html as H
sys.path.insert(0,'/home/claude/routes');from fill import fill,manifest
import unicodedata
def norm(s):return unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower().strip()
A='/home/claude/mxstudio/acapulco/'
COL={'mar':['#0f6e8c','#b5642f','#1d7a6a','#c2502f','#0b5d7a','#a0522d','#127a8a','#9c3d2b'],'res':['#b03a48','#c48a1a','#7a3b1d','#2d6a4f','#8f2d56','#3d5a80','#6d597a'],'cafe':['#6b3e22','#8a5a35','#4e342e','#a0673a']}
tpl=open(A+'app/plantilla.html').read();cnt={'mar':0,'res':0,'cafe':0};built=[];missing=[]
for f in sorted(glob.glob('/home/claude/routes/new/*.json')):
    d=json.load(open(f));slug=d['slug'];ph=f'/home/claude/routes/photos-new/{slug}'
    if not all(os.path.exists(f'{ph}/{n}.jpg') for n in ['cover','s1','s2','s3','s4']):missing.append(slug);continue
    k=d['kind'] if d['kind'] in COL else 'res';col=COL[k][cnt[k]%len(COL[k])];cnt[k]+=1
    o=A+f'c/{slug}/';os.makedirs(o+'img',exist_ok=True)
    for n in ['cover','s1','s2','s3','s4']:shutil.copy(f'{ph}/{n}.jpg',o+f'img/{n}.jpg')
    sig=[norm(x) for x in d['signature']];used=set();menu=[]
    for c in d['menu']:
        its=[]
        for it in c['items']:
            nm=norm(it['name']['es']);img=''
            for i,sg in enumerate(sig):
                if i not in used and sg==nm:img=f'img/s{i+1}.jpg';used.add(i);break
            pr=str(it.get('price','')).strip()
            if pr in ('0','0.0'):pr=''
            its.append({"name":it['name'],"desc":it.get('desc') or {"es":"","en":""},"price":pr,"img":img})
        menu.append({"cat":c['cat'],"items":its})
    app={"slug":slug,"name":d['name'],"tagline":d['tagline'],"color":col,"logo":"","cover":"img/cover.jpg","whatsapp":"","phone":d.get('phone',''),
      "address":d['address'],"map":"https://www.google.com/maps/search/?api=1&query="+__import__('urllib.parse').parse.quote(d['name']+' Acapulco')+"&query_place_id="+d['place_id'],
      "hours":d['hours'],"reservations":False,"carryout":False,"waiter":True,"delivery":k!='cafe',"menu":menu,"demo":False}
    h=fill(tpl,app).replace('<meta property="og:image"',f'<meta property="og:url" content="https://go.myjefetech.app/acapulco/c/{slug}/">\n<meta property="og:image"',1)
    open(o+'index.html','w').write(h);open(o+'manifest.json','w').write(manifest(app))
    if not os.path.exists(o+'menu.json'):json.dump(app['menu'],open(o+'menu.json','w'),ensure_ascii=False)
    if not os.path.exists(o+'config.json'):json.dump({"whatsapp":"","wifi":None,"waiter":True,"carryout":False,"reservations":False},open(o+'config.json','w'))
    top=[it['name'] for c in menu for it in c['items'] if it['img']][:4]
    json.dump({"name":d['name'],"color":col,"tagline":d['tagline'],"address":d['address'],"phone":d.get('phone',''),"hours":d['hours'],"cover":"img/cover.jpg","top":top},open(o+'card.json','w'),ensure_ascii=False)
    built.append(slug)
    if len(used)<4:print('WARN',slug,'photos matched',len(used))
print('built',len(built),'missing photos',missing)
