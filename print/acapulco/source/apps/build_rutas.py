import json,re,glob,os
R=json.load(open('/tmp/claude-0/rutas.json'))
NEW={json.load(open(f))['slug']:json.load(open(f)) for f in glob.glob('/home/claude/routes/new/*.json')}
built={s for s in NEW if os.path.exists(f'/home/claude/mxstudio/acapulco/c/{s}/index.html')}
ROUTES=[
 (4,"Caleta → Centro → Hornos","Caleta → Downtown → Hornos","Caleta · Zócalo · Hornos","Caleta · Zócalo · Hornos",
  "Acapulco tradicional: Caleta, el Centro y Hornos. Estaciona en el Zócalo y camina las primeras paradas.","Old Acapulco: Caleta, downtown and Hornos. Park at the Zócalo and walk the first stops.",
  ["la-cabana-de-caleta","meson-de-los-angeles","meztizza-restaurante","mi-piaci","la-fogata-acapulco","el-anzuelo","bonsai-sushi-hornos","el-nono","la-buena-onda-seafood"]),
 (5,"Papagayo → Magallanes → Condesa","Papagayo → Magallanes → Condesa","Costera centro","Central Costera",
  "La Costera desde el Parque Papagayo hasta la Condesa. Todo cerca, se puede caminar parte.","The Costera from Papagayo Park to Condesa. All close together; walk part of it.",
  ["bocana-beach-papagayo","restaurante-la-union-papagayo","la-casa-del-marisco-magallanes","el-zorrito","la-barra-520","forza-italia-ristorante","el-cabrito-acapulco","che-pibe","la-casa-de-tere"]),
 (6,"Costa Azul → Icacos → Las Brisas","Costa Azul → Icacos → Las Brisas","Zona Dorada y Escénica","Golden Zone & Scenic road",
  "Los restaurantes más finos: Costa Azul, Icacos y los de vista en Las Brisas y la Escénica. Mejor de 4 a 6 pm.","The most upscale places: Costa Azul, Icacos and the view restaurants in Las Brisas and the Scenic road. Best 4–6 pm.",
  ["suntory-acapulco","questa-pasta","mariscos-pipos-costa-azul","becco-al-mare","praya-acapulco","tonys-bistro-acapulco","muna-acapulco","amalfi-acapulco","zibu-acapulco"]),
 (7,"Diamante norte","North Diamante","Puerto Marqués → Bulevar de las Naciones","Puerto Marqués → Blvd. de las Naciones",
  "Puerto Marqués y la primera parte del Bulevar de las Naciones. Necesitas coche.","Puerto Marqués and the first part of Blvd. de las Naciones. You need a car.",
  ["peninsula-restaurantes","la-casa-de-la-pasta-diamante","la-trainera-la-joya","la-fondita-acapulco-colosio","mariscos-el-plebe-alegre","la-granja-diamante","celeiro-brazza-churrasqueria","la-finca-acapulco-diamante"]),
 (8,"Diamante sur → Bonfil","South Diamante → Bonfil","Bulevar de las Naciones → Playa Bonfil","Blvd. de las Naciones → Bonfil beach",
  "El final del Bulevar y Playa Bonfil, cerca del aeropuerto. Necesitas coche.","The end of the Boulevard and Bonfil beach, near the airport. You need a car.",
  ["rinos-casa-napoli","la-jaiba-locca-diamante","restaurante-7-leguas-diamante","shu-acapulco","elcano-diamante-club-de-playa","compadre-noilo-bonfil","las-gaviotas-2-bonfil"]),
 (9,"Barra Vieja","Barra Vieja","Laguna de Tres Palos → Barra Vieja","Tres Palos lagoon → Barra Vieja",
  "Enramadas de pescado a la talla en Barra Vieja, unos 25 min pasando el aeropuerto. Ve en la mañana.","Pescado a la talla beach spots in Barra Vieja, about 25 min past the airport. Go in the morning.",
  ["alejo-laguna","mocambo-barra-vieja","las-palmerass-barra-vieja","gloria-del-mar-barra-vieja","tomasa-pescado-a-la-talla","juan-y-eva-barra-vieja"]),
]
EXTRA3=["la-cabanita-pie-de-la-cuesta","dos-vistas-tortugario"]
def stop(s):
    d=NEW[s];real=d['source']=='real'
    return {"id":d['place_id'],"t":"C" if d['kind']=='cafe' else "R","n":d['name'],"a":d['address'][:60],
            "p":"Menú real con precios · app lista" if real else "App bilingüe con menú, WiFi y QR","p_en":"Real menu & prices · app ready" if real else "Bilingual app with menu, WiFi & QR","demo":d['place_id'][-8:]}
R['routes']=[r for r in R['routes'] if r['num']<=3]
for r in R['routes']:
    if r['num']==3:
        r['stops']=[x for x in r['stops'] if x['id'] not in {NEW[s]['place_id'] for s in EXTRA3}]+[stop(s) for s in EXTRA3 if s in built]
for num,ti,ti_en,sp,sp_en,de,de_en,slugs in ROUTES:
    R['routes'].append({"num":num,"title":ti,"title_en":ti_en,"span":sp,"span_en":sp_en,"desc":de,"desc_en":de_en,"bring":"Teléfono con Rutas y Precios abiertos · tarjetas 5×7","bring_en":"Phone with Rutas & Precios open · 5×7 cards","stops":[stop(s) for s in slugs if s in built]})
allslugs=[s for r in ROUTES for s in r[7]]+EXTRA3
assert len(set(allslugs))==len(NEW),(len(set(allslugs)),len(NEW),set(NEW)-set(allslugs))
json.dump(R,open('/home/claude/routes/rutas-full.json','w'),ensure_ascii=False)
t=open('/home/claude/routes/rutas-template.html').read()
def upd(name,add):
    global t
    m=re.search(r'const '+name+r'=(\{.*?\});',t);cur=json.loads(m.group(1));cur.update(add)
    t=t[:m.start(1)]+json.dumps(cur,ensure_ascii=False)+t[m.end(1):]
upd('APPS',{NEW[s]['place_id'][-8:]:s for s in built})
upd('READY',{NEW[s]['place_id'][-8:]:NEW[s]['source']=='real' for s in built})
upd('CO',{NEW[s]['place_id']:[NEW[s]['lat'],NEW[s]['lng']] for s in built})
out=t.replace('__DATA__',json.dumps(R,ensure_ascii=False),1)
open('/home/claude/mxstudio/acapulco/rutas/index.html','w').write(out)
print('routes',len(R['routes']),'stops',sum(len(r['stops']) for r in R['routes']),'new built',len(built))
