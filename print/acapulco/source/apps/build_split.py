import json,glob,re,copy
R=json.load(open('rutas-full.json'))
real={json.load(open(f'menus/{n}.json'))['name']:json.load(open(f'menus/{n}.json'))['source']=='real' for n in range(1,27)}
NEW={json.load(open(f))['place_id']:json.load(open(f)) for f in glob.glob('new/*.json')}
CO=json.load(open('coords.json'))
for pid,d in NEW.items():CO[pid]=[d['lat'],d['lng']]
def ok(s):return NEW[s['id']]['source']=='real' if s['id'] in NEW else real.get(s['n'],False)
allst=[s for r in R['routes'] for s in r['stops']]
ready=[s for s in allst if ok(s)];pend_routes=[]
for r in R['routes']:
    rr=copy.deepcopy(r);rr['stops']=[s for s in r['stops'] if not ok(s)]
    if rr['stops']:pend_routes.append(rr)
# regroup ready by area
A=[s for s in ready if CO[s['id']][1]<-99.866]
B=[s for s in ready if CO[s['id']][1]>=-99.866 and CO[s['id']][0]>16.81]
C=[s for s in ready if CO[s['id']][0]<=16.81]
A.sort(key=lambda s:CO[s['id']][1]);B.sort(key=lambda s:-CO[s['id']][0]);C.sort(key=lambda s:-CO[s['id']][1])
C=sorted(C,key=lambda s:CO[s['id']][1])
assert len(A)+len(B)+len(C)==len(ready)
br="Teléfono con Rutas y Precios abiertos · tarjetas 5×7";br_en="Phone with Rutas & Precios open · 5×7 cards"
RR={"types":R['types'],"routes":[
 {"num":1,"title":"Centro → Costera","title_en":"Downtown → Costera","span":"Caleta · Centro · Hornos · Magallanes · Condesa","span_en":"Caleta · Downtown · Hornos · Magallanes · Condesa","desc":"De Caleta y el Zócalo por toda la Costera hasta la Condesa. Estaciona en el Centro y camina las primeras.","desc_en":"From Caleta and the Zócalo along the Costera to Condesa. Park downtown and walk the first ones.","bring":br,"bring_en":br_en,"stops":A},
 {"num":2,"title":"Costa Azul → Las Brisas","title_en":"Costa Azul → Las Brisas","span":"Zona Dorada y Escénica","span_en":"Golden Zone & Scenic road","desc":"Restaurantes finos de Costa Azul, Icacos y con vista en Las Brisas. Mejor de 4 a 6 pm.","desc_en":"Upscale places in Costa Azul, Icacos and the view restaurants in Las Brisas. Best 4–6 pm.","bring":br,"bring_en":br_en,"stops":B},
 {"num":3,"title":"Diamante → Barra Vieja","title_en":"Diamante → Barra Vieja","span":"Puerto Marqués · Bulevar de las Naciones · Barra Vieja","span_en":"Puerto Marqués · Blvd. de las Naciones · Barra Vieja","desc":"Puerto Marqués, Punta Diamante y el Bulevar, y al final Barra Vieja. Necesitas coche; ve en la mañana.","desc_en":"Puerto Marqués, Punta Diamante and the Boulevard, ending at Barra Vieja. You need a car; go in the morning.","bring":br,"bring_en":br_en,"stops":C}]}
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
print('ready',len(ready),'routes',[len(A),len(B),len(C)],'| pending',sum(len(r['stops']) for r in pend_routes),'in',len(pend_routes),'routes')
for r in RR['routes']:print(r['num'],[s['n'] for s in r['stops']])
