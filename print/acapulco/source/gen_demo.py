import json,html
R=json.load(open('/tmp/claude-0/rutas.json'))
SEA={'Buzos Costera','El Amigo Miguel','Don Camarón','La Casa del Mar','Celeste Beach House','Mary de Revolcadero','Mariscos El Sirenito','Paititi del Mar','Zabesu Barra Vieja','Cira La Morena 1','Mariscos Catamarán','Restaurant El Tío Markos','ALTAMAR restaurante y jardín','Tres Marías Restaurante','La Choza de la Freed'}
COL={'mar':['#0f6e8c','#b5642f','#1d7a6a','#c2502f','#0b5d7a','#a0522d','#127a8a','#9c3d2b'],'res':['#b03a48','#c48a1a','#7a3b1d','#2d6a4f','#8f2d56'],'cafe':['#6b3e22','#8a5a35','#4e342e','#a0673a','#5d4037','#7b4a2a'],'bar':['#4a2a6a','#1d1715','#6a1b4d','#2b2d6a']}
def I(es,en,pr,img,des='',den=''):return {"name":{"es":es,"en":en},"desc":{"es":des,"en":den},"price":pr,"img":"img/"+img+".jpg" if img else ""}
MENUS={
 'mar':{"cover":"img/cover-mariscos.jpg","tag":{"es":"Mariscos frescos en Acapulco","en":"Fresh seafood in Acapulco"},"delivery":True,"menu":[
  {"cat":{"es":"Ceviches y cocteles","en":"Ceviches & cocktails"},"items":[I("Ceviche de pescado","Fish ceviche","180","m-ceviche","Limón, cebolla morada, cilantro y aguacate","Lime, red onion, cilantro and avocado"),I("Aguachile verde","Green shrimp aguachile","220","m-aguachile","Camarón, pepino, chile serrano","Shrimp, cucumber, serrano chili"),I("Coctel de camarón","Shrimp cocktail","190","m-coctel","Con aguacate y galletas saladas","With avocado and crackers")]},
  {"cat":{"es":"Del mar","en":"From the sea"},"items":[I("Pescado a la talla","Pescado a la talla","420","m-talla","Rojo y verde, para 2 · tortillas y salsas","Red & green, for 2 · tortillas and salsas"),I("Camarones al mojo de ajo","Garlic butter shrimp","260","m-camarones","Con arroz y ensalada","With rice and salad"),I("Tacos de pescado","Fish tacos","150","m-tacos","Tres tacos estilo Baja","Three Baja-style tacos")]},
  {"cat":{"es":"Bebidas","en":"Drinks"},"items":[I("Agua de coco","Coconut water","70","m-coco","Natural, recién abierto","Fresh, just opened"),I("Limonada con hierbabuena","Mint limeade","55","m-limonada"),I("Margarita","Margarita","120","b-margarita","Limón o mango","Lime or mango")]}]},
 'res':{"cover":"img/cover-restaurante.jpg","tag":{"es":"Cocina mexicana con sabor de Acapulco","en":"Mexican food with Acapulco flavor"},"delivery":True,"menu":[
  {"cat":{"es":"Para empezar","en":"Starters"},"items":[I("Guacamole en molcajete","Molcajete guacamole","140","r-guacamole","Con totopos recién hechos","With fresh tortilla chips")]},
  {"cat":{"es":"Platos fuertes","en":"Main dishes"},"items":[I("Pozole verde guerrerense","Guerrero green pozole","160","r-pozole","Jueves de pozole todo el día","Pozole Thursday all day"),I("Tacos al pastor","Tacos al pastor","120","r-pastor","Cuatro tacos con piña","Four tacos with pineapple"),I("Enchiladas de mole","Mole enchiladas","175","r-enchiladas","Con arroz y frijoles","With rice and beans"),I("Chile relleno","Chile relleno","165","r-chilerelleno","Poblano capeado con queso","Battered poblano with cheese")]},
  {"cat":{"es":"Postres y bebidas","en":"Desserts & drinks"},"items":[I("Flan napolitano","Mexican flan","70","r-flan"),I("Margarita","Margarita","120","b-margarita"),I("Limonada con hierbabuena","Mint limeade","55","m-limonada")]}]},
 'cafe':{"cover":"img/cover-cafe.jpg","tag":{"es":"Café, pan dulce y desayunos","en":"Coffee, pastries and breakfast"},"delivery":False,"menu":[
  {"cat":{"es":"Café","en":"Coffee"},"items":[I("Capuchino","Cappuccino","60","c-latte","Con arte latte","With latte art"),I("Café de olla","Café de olla","45","c-olla","Canela y piloncillo","Cinnamon and piloncillo"),I("Frappé de caramelo","Caramel frappé","75","c-frappe")]},
  {"cat":{"es":"Desayunos","en":"Breakfast"},"items":[I("Chilaquiles verdes con huevo","Green chilaquiles with egg","135","c-chilaquiles","Con frijoles, crema y queso","With beans, cream and cheese")]},
  {"cat":{"es":"Panadería y postres","en":"Bakery & desserts"},"items":[I("Conchas y pan dulce","Conchas & pan dulce","35","c-conchas","Recién horneado","Freshly baked"),I("Flan napolitano","Mexican flan","70","r-flan")]}]},
 'bar':{"cover":"img/cover-bar.jpg","tag":{"es":"Coctelería y noches en Acapulco","en":"Cocktails and nights in Acapulco"},"delivery":False,"carry":False,"menu":[
  {"cat":{"es":"Cocteles","en":"Cocktails"},"items":[I("Margarita de mango con chamoy","Mango chamoy margarita","160","b-mango"),I("Margarita clásica","Classic margarita","140","b-margarita"),I("Michelada con camarón","Shrimp michelada","150","b-michelada"),I("Mezcal · 3 copitas","Mezcal · 3 tasting cups","260","b-mezcal","Con naranja y sal de gusano","With orange and worm salt")]},
  {"cat":{"es":"Botanas","en":"Snacks"},"items":[I("Nachos supremos","Loaded nachos","180","b-nachos"),I("Guacamole en molcajete","Molcajete guacamole","140","r-guacamole")]}]}}
B=[];cnt={'mar':0,'res':0,'cafe':0,'bar':0}
for r in R['routes']:
    for s in r['stops']:
        t=s['t']
        if t in 'HS':continue
        k='cafe' if t=='C' else 'bar' if t=='X' else ('mar' if s['n'] in SEA else 'res')
        col=COL[k][cnt[k]%len(COL[k])];cnt[k]+=1
        B.append({"id":s['id'][-8:],"n":s['n'],"k":k,"c":col,"a":s['a'],"r":r['num']})
js=json.dumps({"B":B,"M":MENUS},ensure_ascii=False).replace('<','\\u003c')
expr="""(function(){const X=%s;const q=new URLSearchParams(location.search);const b=X.B.find(x=>x.id===q.get("id"))||X.B[0];const m=X.M[b.k];
 return {slug:"demo-"+b.id,name:b.n,tagline:m.tag,color:b.c,logo:"",cover:m.cover,whatsapp:"527441930502",phone:"527441930502",address:b.a,map:"",hours:{es:"",en:""},
 reservations:true,carryout:m.carry!==false,delivery:!!m.delivery,menu:m.menu,demo:true,back:"../rutas/"}})()"""%js
t=open('/home/claude/mxstudio/acapulco/app/plantilla.html').read()
out=t.replace('/*__DATA__*/null',expr)
for k,v in {'__TITLE__':'Demo · MX Studio','__DESC__':'App demo por MX Studio','__COLOR__':'#000000','__ICON__':'../icon-192.png','__SHORT__':'Demo MX'}.items():
    out=out.replace(k,html.escape(v,quote=True))
assert out.count('"../../sw.js"')==1;out=out.replace('"../../sw.js"','"../sw.js"')
out=out.replace('<meta name="theme-color"','<meta name="robots" content="noindex,nofollow">\n<meta name="theme-color"')
open('/home/claude/mxstudio/acapulco/demo/index.html','w').write(out)
open('/home/claude/mxstudio/acapulco/demo/manifest.json','w').write('{"name":"Demo · MX Studio","short_name":"Demo MX","start_url":"./","scope":"./","display":"standalone","background_color":"#faf6f0","theme_color":"#000000","icons":[{"src":"../icon-192.png","sizes":"192x192","type":"image/png"},{"src":"../icon-512.png","sizes":"512x512","type":"image/png"}]}')
json.dump({b['n']:b['id'] for b in B},open('/tmp/claude-0/demo-ids.json','w'),ensure_ascii=False)
from collections import Counter;print(len(B),'demos',Counter(b['k'] for b in B))
