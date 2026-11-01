import json,glob,re,copy,os
R=json.load(open('rutas-full.json'))
real={json.load(open(f'menus/{n}.json'))['name']:json.load(open(f'menus/{n}.json'))['source']=='real' for n in range(1,27)}
NEW={json.load(open(f))['place_id']:json.load(open(f)) for f in glob.glob('new/*.json')}
NEW2={json.load(open(f))['place_id']:json.load(open(f)) for f in glob.glob('new2/*.json') if os.path.exists('/home/claude/mxstudio/acapulco/c/'+json.load(open(f))['slug']+'/index.html')}
NEW.update(NEW2)
CO=json.load(open('coords.json'))
for pid,d in NEW.items():CO[pid]=[d['lat'],d['lng']]
def ok(s):return NEW[s['id']]['source']=='real' if s['id'] in NEW else real.get(s['n'],False)
allst=[s for r in R['routes'] for s in r['stops']]
ready=[s for s in allst if ok(s)];pend_routes=[]
def mkstop(d):return {"id":d['place_id'],"t":"C" if d['kind']=='cafe' else "R","n":d['name'],"a":d['address'][:60],"p":"Menú real con precios · app lista","p_en":"Real menu & prices · app ready","demo":d['place_id'][-8:]}
have={s['id'] for s in allst}
ready+=[mkstop(d) for pid,d in NEW2.items() if pid not in have]
for r in R['routes']:
    rr=copy.deepcopy(r);rr['stops']=[s for s in r['stops'] if not ok(s)]
    if rr['stops']:pend_routes.append(rr)
# regroup ready by area
A0=[s for s in ready if CO[s['id']][1]<-99.866]
A=[s for s in A0 if CO[s['id']][1]<-99.8855];A2=[s for s in A0 if CO[s['id']][1]>=-99.8855]
B=[s for s in ready if CO[s['id']][1]>=-99.866 and CO[s['id']][0]>16.81]
C=[s for s in ready if CO[s['id']][0]<=16.81]
A.sort(key=lambda s:CO[s['id']][1]);A2.sort(key=lambda s:CO[s['id']][1]);B.sort(key=lambda s:-CO[s['id']][0]);B1=[s for s in B if CO[s['id']][0]>=16.843];B2=[s for s in B if CO[s['id']][0]<16.843];B1.sort(key=lambda s:CO[s['id']][1]);C.sort(key=lambda s:-CO[s['id']][1])
C=sorted(C,key=lambda s:CO[s['id']][1])
assert len(A)+len(A2)+len(B1)+len(B2)+len(C)==len(ready)
br="Teléfono con Rutas y Precios abiertos · tarjetas 5×7";br_en="Phone with Rutas & Precios open · 5×7 cards"
RR={"types":R['types'],"routes":[
 {"num":1,"title":"Caleta → Centro → Hornos","title_en":"Caleta → Downtown → Hornos","span":"Caleta · Zócalo · Hornos","span_en":"Caleta · Zócalo · Hornos","desc":"Acapulco tradicional. Estaciona en el Centro y camina las primeras.","desc_en":"Old Acapulco. Park downtown and walk the first ones.","bring":br,"bring_en":br_en,"stops":A},
 {"num":2,"title":"Magallanes → Condesa","title_en":"Magallanes → Condesa","span":"Costera centro","span_en":"Central Costera","desc":"La Costera desde Magallanes hasta la Condesa. Todo cerca.","desc_en":"The Costera from Magallanes to Condesa. All close together.","bring":br,"bring_en":br_en,"stops":A2},
 {"num":3,"title":"Costa Azul","title_en":"Costa Azul","span":"Costera y calles de Costa Azul","span_en":"Costera & Costa Azul streets","desc":"Costa Azul: muchos restaurantes juntos en la Costera y calles de atrás. Se puede caminar.","desc_en":"Costa Azul: many restaurants close together on the Costera and side streets. Walkable.","bring":br,"bring_en":br_en,"stops":B1},
 {"num":4,"title":"Icacos → Las Brisas","title_en":"Icacos → Las Brisas","span":"Zona Dorada y Escénica","span_en":"Golden Zone & Scenic road","desc":"Restaurantes finos de Icacos y con vista en Las Brisas. Mejor de 4 a 6 pm.","desc_en":"Upscale places in Icacos and the view restaurants in Las Brisas. Best 4–6 pm.","bring":br,"bring_en":br_en,"stops":B2},
 {"num":5,"title":"Diamante → Barra Vieja","title_en":"Diamante → Barra Vieja","span":"Puerto Marqués · Bulevar de las Naciones · Barra Vieja","span_en":"Puerto Marqués · Blvd. de las Naciones · Barra Vieja","desc":"Puerto Marqués, Punta Diamante y el Bulevar, y al final Barra Vieja. Necesitas coche; ve en la mañana.","desc_en":"Puerto Marqués, Punta Diamante and the Boulevard, ending at Barra Vieja. You need a car; go in the morning.","bring":br,"bring_en":br_en,"stops":C}]}
for i,r in enumerate(pend_routes,1):r['num']=i
PP={"types":R['types'],"routes":pend_routes}
t=open('rutas-template.html').read()
m=re.search(r'const CO=(\{.*?\});',t);t=t[:m.start(1)]+json.dumps(CO)+t[m.end(1):]
def upd(name,add):
    global t
    mm=re.search(r'const '+name+r'=(\{.*?\});',t);cur=json.loads(mm.group(1));cur.update(add);t=t[:mm.start(1)]+json.dumps(cur,ensure_ascii=False)+t[mm.end(1):]
upd('APPS',{d['place_id'][-8:]:d['slug'] for d in NEW.values()})
upd('READY',{d['place_id'][-8:]:d['source']=='real' for d in NEW.values()})
t=t.replace('const r=DATA.routes.find(x=>x.num===st.route);','const r=DATA.routes.find(x=>x.num===st.route)||DATA.routes[0];')
open('rutas-template.html','w').write(t)
main=t.replace('__DATA__',json.dumps(RR,ensure_ascii=False),1)
F='<div class="foot">${t.foot}</div>'
assert main.count(F)==1
main=main.replace(F,'<a class="share" style="display:block;text-decoration:none;text-align:center;margin-top:10px;background:rgba(224,160,58,.14);color:#f0c27a" href="../pendientes/">⚠️ Por confirmar · To confirm (%d) →</a>'%sum(len(r['stops']) for r in pend_routes)+F)
open('/home/claude/mxstudio/acapulco/rutas/index.html','w').write(main)
p=t.replace('__DATA__',json.dumps(PP,ensure_ascii=False),1)
p=p.replace(F,'<a class="share" style="display:block;text-decoration:none;text-align:center;margin-top:10px" href="../rutas/">← Rutas · Listas para vender (%d)</a>'%len(ready)+F)
p=p.replace('title:"Mis rutas"','title:"Por confirmar"').replace('title:"My routes"','title:"To confirm"').replace('<title>Rutas ✝ MX Studio</title>','<title>Por confirmar ✝ MX Studio</title>')
p=p.replace('content="Rutas"','content="Por confirmar"')
import re as _r
k=_r.search(r'const KEY="([^"]*)"',p);p=p.replace(k.group(0),'const KEY="'+k.group(1)+'-pend"',1)
p=p.replace('<link rel="manifest" href="manifest.json">','<link rel="manifest" href="manifest.json">',1)
open('/home/claude/mxstudio/acapulco/pendientes/index.html','w').write(p)
print('ready',len(ready),'routes',[len(A),len(A2),len(B1),len(B2),len(C)],'| pending',sum(len(r['stops']) for r in pend_routes),'in',len(pend_routes),'routes')
for r in RR['routes']:print(r['num'],[s['n'] for s in r['stops']])
