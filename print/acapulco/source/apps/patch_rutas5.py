import sys,json,re
live=json.load(open('/home/claude/routes/live-index.json'))
READY={}
for x in live:
    READY[x['id']]=json.load(open(f"/home/claude/routes/menus/{x['n']}.json"))['source']=='real'
def patch(h):
    a='const APPS='
    assert h.count(a)==1;h=h.replace(a,'const READY=%s;\nconst APPS='%json.dumps(READY),1)
    a='    <div class="ad">${esc(s.a)}</div><div class="pi">→ ${esc(F(s,"p"))}</div></div></div>'
    assert h.count(a)==1
    h=h.replace(a,'    <div class="ad">${esc(s.a)}</div><div class="pi">→ ${esc(F(s,"p"))}</div>${s.demo in READY?(READY[s.demo]?`<div class="rdy ok">✅ Menú real · Ready to sell</div>`:`<div class="rdy no">⚠️ Menú por confirmar · Menu needs checking</div>`):""}</div></div>')
    a=' if(st.filter==="fu")list=list.filter(o=>(st.marks[o.s.id]||{}).f);'
    assert h.count(a)==1;h=h.replace(a,a+'\n if(st.filter==="rdy")list=list.filter(o=>READY[o.s.demo]);')
    a='    <button class="f" data-f="fu" data-t="fFu"></button>'
    assert h.count(a)==1;h=h.replace(a,a+'\n    <button class="f" data-f="rdy" data-t="fRdy"></button>')
    h=h.replace('es:{title:"Mis rutas",','es:{fRdy:"✅ Listas",title:"Mis rutas",',1).replace('en:{title:"My routes",','en:{fRdy:"✅ Ready",title:"My routes",',1)
    assert 'fRdy:"✅ Listas"' in h and 'fRdy:"✅ Ready"' in h
    a='.demoBtn{';h=h.replace(a,'.rdy{display:inline-block;margin-top:6px;padding:4px 9px;border-radius:999px;font-weight:800;font-size:.74em}.rdy.ok{background:rgba(37,211,102,.16);color:#7ee2a4}.rdy.no{background:rgba(224,160,58,.16);color:#f0c27a}.filters{flex-wrap:wrap}\n'+a,1)
    return h
for f in sys.argv[1:]:
    h=open(f).read();assert 'READY' not in h;open(f,'w').write(patch(h));print('patched',f)
