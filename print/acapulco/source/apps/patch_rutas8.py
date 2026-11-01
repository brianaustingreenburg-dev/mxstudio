import sys
def patch(h):
    a='  <div class="tabs" id="tabs"></div>'
    assert h.count(a)==1
    h=h.replace(a,'  <div class="modes" id="modes"><button data-m="r" data-t="mR"></button><button data-m="p" data-t="mP"></button><button data-m="$" data-t="mPr"></button></div>\n'+a)
    a='<main class="wrap" id="main"></main>'
    assert h.count(a)==1
    h=h.replace(a,a+'\n<div id="pwrap" style="display:none;position:fixed;left:0;right:0;bottom:0;z-index:4;background:#000"><iframe id="pframe" title="Precios" style="border:0;width:100%;height:100%;display:block"></iframe><button id="pqr" style="all:unset;position:absolute;right:12px;bottom:calc(14px + env(safe-area-inset-bottom));background:#d9a35f;color:#1a0f0a;font:800 13px system-ui;padding:10px 14px;border-radius:999px;box-shadow:0 6px 18px rgba(0,0,0,.4);cursor:pointer" data-t="pQr"></button></div>')
    for a,b in [('es:{fRdy:"✅ Listas",','es:{mR:"🗺️ Vender hoy",mP:"⚠️ Por confirmar",mPr:"💲 Precios",pQr:"📲 QR para el dueño",fRdy:"✅ Listas",'),('en:{fRdy:"✅ Ready",','en:{mR:"🗺️ Sell today",mP:"⚠️ To confirm",mPr:"💲 Prices",pQr:"📲 QR for the owner",fRdy:"✅ Ready",')]:
        assert h.count(a)==1,a;h=h.replace(a,b)
    a='let st={route:1,filter:"all",fs:19,marks:{},lang:"es"};'
    assert h.count(a)==1
    h=h.replace(a,'let st={route:1,filter:"all",fs:19,marks:{},lang:"es",mode:"r"};\nconst PEND=__PEND__;\nconst RT=()=>st.mode==="p"?PEND.routes:DATA.routes;\nconst ALLR=()=>[...DATA.routes,...PEND.routes];')
    h=h.replace('$("tabs").innerHTML=DATA.routes.map(','$("tabs").innerHTML=RT().map(')
    h=h.replace('if(!DATA.routes.some(x=>x.num===st.route))st.route=1;','if(!RT().some(x=>x.num===st.route))st.route=1;')
    h=h.replace('const r=DATA.routes.find(x=>x.num===st.route)||DATA.routes[0];','const r=RT().find(x=>x.num===st.route)||RT()[0];')
    h=h.replace(' DATA.routes.forEach(r=>{const items=',' ALLR().forEach(r=>{const items=')
    h=h.replace('const s=DATA.routes.flatMap(r=>r.stops).find(x=>x.id===go.dataset.go);','const s=ALLR().flatMap(r=>r.stops).find(x=>x.id===go.dataset.go);')
    assert 'DATA.routes' not in h.replace('const RT=()=>st.mode==="p"?PEND.routes:DATA.routes;','').replace('const ALLR=()=>[...DATA.routes,...PEND.routes];',''),'left DATA.routes'
    # mode switching
    a='$("prices").onclick=showPrices;'
    assert h.count(a)==1
    h=h.replace(a,'''function applyMode(){const m=st.mode||"r",P=m==="$";$("modes").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.m===m));
 $("tabs").style.display=P?"none":"";$("filters").style.display=P?"none":"";$("main").style.display=P?"none":"";$("pwrap").style.display=P?"block":"none";
 if(P){const f=$("pframe");if(!f.src||f.src==="about:blank"||!f.src.includes("precios"))f.src="../precios/?embed=1";$("pwrap").style.top=document.querySelector(".top").offsetHeight+"px"}}
$("modes").onclick=e=>{const b=e.target.closest("[data-m]");if(!b)return;const was=st.mode;st.mode=b.dataset.m;if(st.mode!=="$"&&was!==st.mode)st.route=1;save();applyMode();if(st.mode!=="$"){render();scrollTo({top:0})}};
$("pqr").onclick=showPrices;
addEventListener("resize",()=>{if(st.mode==="$")$("pwrap").style.top=document.querySelector(".top").offsetHeight+"px"});
$("prices").onclick=()=>{st.mode="$";save();applyMode()};''')
    a='applyFs();applyLang();render();'
    assert h.count(a)==1
    h=h.replace(a,'try{const qm=new URLSearchParams(location.search).get("m");if(qm==="p"||qm==="$"||qm==="r")st.mode=qm}catch(_){}\napplyFs();applyLang();render();applyMode();')
    h=h.replace('.tabs{','.modes{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:10px}.modes button{all:unset;cursor:pointer;text-align:center;padding:10px 4px;border-radius:12px;font-weight:800;font-size:.8em;background:var(--s2);border:1px solid var(--line)}.modes button[aria-pressed=true]{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#1a0f0a}\n.tabs{',1)
    return h
for f in sys.argv[1:]:
    h=open(f).read();assert 'applyMode' not in h;open(f,'w').write(patch(h));print('patched',f)
