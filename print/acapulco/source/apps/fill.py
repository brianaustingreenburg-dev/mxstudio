import json,sys,html
def fill(tpl,d):
    title=d['name']; desc=(d.get('tagline') or {}).get('es','') or d['name']
    icon=d.get('logo') or '../../icon-192.png'
    js=json.dumps(d,ensure_ascii=False).replace('<','\\u003c')
    out=tpl.replace('/*__DATA__*/null',js)
    for k,v in {'__TITLE__':title,'__DESC__':desc,'__COLOR__':d.get('color','#b5642f'),'__ICON__':icon,'__SHORT__':title[:14]}.items():
        out=out.replace(k,html.escape(v,quote=True))
    return out
def manifest(d):
    icon=d.get('logo') or '../../icon-192.png'
    return json.dumps({"name":d['name'],"short_name":d['name'][:14],"start_url":"./","scope":"./","display":"standalone","background_color":"#faf6f0","theme_color":d.get('color','#b5642f'),"icons":[{"src":icon,"sizes":"192x192","type":"image/png"},{"src":icon,"sizes":"512x512","type":"image/png"}]},ensure_ascii=False)
