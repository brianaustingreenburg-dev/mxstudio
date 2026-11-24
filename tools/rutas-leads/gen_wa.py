# Builds acapulco/rutas/whatsapp/index.html from leads.json (WhatsApp businesses by industry and state).
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))

rows = [r for r in json.load(open(os.path.join(HERE, "leads.json"), encoding="utf8")) if r["kind"] == "new"]

def industry(t):
    t = t.lower()
    if t.startswith("tour"): return "tour"
    if t.startswith("salón") or t.startswith("salon"): return "salon"
    if t.startswith("restaurante"): return "restaurante"
    return {"hotel": "hotel", "club de playa": "club-de-playa", "boutique": "boutique", "tienda": "tienda",
            "spa": "spa", "café": "cafe", "bar": "bar"}[t]

STATES = {"Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua","Ciudad de México","Coahuila","Colima","Durango","Guanajuato","Hidalgo","Jalisco","Estado de México","Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla","Querétaro","Quintana Roo","San Luis Potosí","Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas"}

def region(a):
    st = a.split(",")[-1].strip()
    if st in STATES: return st
    a = a.lower()
    for k, v in [("troncones", "Troncones · La Saladita"), ("saladita", "Troncones · La Saladita"), ("majahua", "Troncones · La Saladita"),
                 ("barra de potos", "Barra de Potosí · Petatlán"), ("petatl", "Barra de Potosí · Petatlán"), ("papanoa", "Papanoa · Técpan"),
                 ("ixtapa", "Zihuatanejo · Ixtapa"), ("zihua", "Zihuatanejo · Ixtapa"), ("la unión", "Troncones · La Saladita"),
                 ("taxco", "Taxco"), ("chilpancingo", "Chilpancingo"), ("iguala", "Iguala"),
                 ("pie de la cuesta", "Pie de la Cuesta · Coyuca"), ("coyuca", "Pie de la Cuesta · Coyuca"),
                 ("playa ventura", "Costa Chica"), ("copala", "Costa Chica"), ("marquelia", "Costa Chica")]:
        if k in a: return v
    return "Acapulco"

data = [dict(c=r["code"], n=re.sub(r"\s*\([^)]*\)", "", r["n"]).strip(), i=industry(r["type"]), a=r["area"], g=region(r["area"]), w=r["phone"]) for r in rows]


HTML = r"""<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>WhatsApp · MX Dashboard ✝</title><meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#120d0b"><meta name="apple-mobile-web-app-capable" content="yes">
<style>
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
:root{--bg:#120d0b;--s1:#1c1512;--s2:#271e1a;--line:rgba(232,196,140,.2);--gold:#e8c48c;--gold2:#d9a35f;--t:#f6ece0;--m:#b9aaa0;--g:#25d366;--r:#d9534f}
body{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,sans-serif;background:var(--bg);color:var(--t);font-size:16px;line-height:1.35;padding-bottom:40px}
button,input,select{font:inherit;color:inherit}a{color:inherit;text-decoration:none}
.top{position:sticky;top:0;z-index:5;background:rgba(18,13,11,.96);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);padding:calc(10px + env(safe-area-inset-top)) 14px 10px;border-bottom:1px solid var(--line)}
.row{display:flex;align-items:center;gap:10px;justify-content:space-between}
.back{font-weight:800;color:var(--gold);font-size:.9em}
h1{font-size:1.15em}.sub{color:var(--m);font-size:.8em}
.stats{display:flex;gap:6px;margin-top:8px;font-size:.78em;font-weight:800}.stats span{background:var(--s2);border:1px solid var(--line);border-radius:99px;padding:4px 9px}
input#q{width:100%;margin-top:8px;padding:11px 12px;border-radius:12px;border:1px solid var(--line);background:var(--s1)}
.chips{display:flex;gap:6px;overflow-x:auto;margin-top:8px;padding-bottom:2px}
.chips button{all:unset;cursor:pointer;white-space:nowrap;padding:7px 11px;border-radius:99px;background:var(--s2);border:1px solid var(--line);font-weight:800;font-size:.8em}
.chips button.on{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#1a0f0a;border-color:transparent}
select#reg{margin-top:8px;width:100%;padding:9px 10px;border-radius:12px;border:1px solid var(--line);background:var(--s1)}
.how{margin:12px 14px 0;padding:12px;border-radius:14px;background:var(--s1);border:1px dashed var(--line);font-size:.86em;color:var(--m)}
h2{margin:18px 14px 8px;font-size:1em;color:var(--gold)}
.c{margin:0 14px 8px;background:var(--s1);border:1px solid var(--line);border-radius:14px;padding:12px}
.c.sent{border-color:rgba(37,211,102,.55)}.c.rep{border-color:var(--gold)}.c.no{opacity:.5}
.c b{display:block;font-size:1em}.c small{display:block;color:var(--m);margin-top:2px}
.tg{display:inline-block;margin-top:6px;font-size:.72em;font-weight:800;padding:3px 8px;border-radius:99px;background:var(--s2)}
.bt{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:9px}
.bt a,.bt button{all:unset;box-sizing:border-box;cursor:pointer;text-align:center;padding:10px 4px;border-radius:10px;font-weight:800;font-size:.82em;background:var(--s2);border:1px solid var(--line)}
.bt .demo{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#1a0f0a;border:0}
.bt .pitch{background:var(--g);color:#05301a;border:0}
.mk{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:6px}
.mk button{all:unset;box-sizing:border-box;cursor:pointer;text-align:center;padding:8px 2px;border-radius:10px;font-weight:800;font-size:.74em;background:var(--s2);border:1px solid var(--line)}
.mk .on.s{background:var(--g);color:#05301a}.mk .on.r{background:var(--gold);color:#1a0f0a}.mk .on.x{background:var(--r);color:#fff}
.empty{margin:30px 14px;color:var(--m);text-align:center}
.more{display:block;margin:6px 14px 0;color:var(--gold);font-size:.82em;font-weight:800}
</style></head><body>
<div class="top">
 <div class="row"><a class="back" href="../">← MX Dashboard</a><span class="sub" id="cnt"></span></div>
 <h1>📲 WhatsApp · México</h1>
 <div class="stats"><span id="sS">✅ 0</span><span id="sR">💬 0</span><span id="sX">❌ 0</span></div>
 <input id="q" type="search" placeholder="Buscar negocio o zona…" autocomplete="off">
 <div class="chips" id="chips"></div>
 <select id="reg"></select>
</div>
<p class="how">Cada negocio tiene su <b>demo</b> con su nombre. Toca <b>📲 Pitch</b> para mandarle su demo por WhatsApp. Luego marca <b>✅ Enviado</b>, <b>💬 Respondió</b> o <b>❌ Sin WhatsApp</b> (se oculta). Tus marcas se guardan en este teléfono.</p>
<div id="list"></div>
<script>
const D=__DATA__;
const IND=[["restaurante","🍽️ Restaurantes"],["hotel","🏨 Hoteles"],["boutique","👗 Boutiques"],["spa","💆 Spas"],["bar","🍹 Bares"],["tour","🚤 Tours"],["cafe","☕ Cafés"],["salon","✂️ Salones"],["tienda","🛍️ Tiendas"],["club-de-playa","🏖️ Clubs de playa"]];
const LIVE="https://go.myjefetech.app/acapulco/demo/";
const K="mx-wa-marks";let M={};try{M=JSON.parse(localStorage.getItem(K)||"{}")}catch(_){}
const save=()=>{try{localStorage.setItem(K,JSON.stringify(M))}catch(_){}};
let F={i:"all",g:"all",q:"",hid:false};try{Object.assign(F,JSON.parse(localStorage.getItem(K+"-f")||"{}"));F.q=""}catch(_){}
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const norm=s=>s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
const qs=b=>b.i+"/?n="+encodeURIComponent(b.n)+"&a="+encodeURIComponent(b.a);const demo=b=>"../../demo/"+qs(b);const demoLive=b=>LIVE+qs(b);
const pitch=b=>"https://wa.me/"+b.w+"?text="+encodeURIComponent("Hola 👋 Soy Brian.\n\nYa construí la app de "+b.n+" — échele un vistazo:\n👉 "+demoLive(b)+"\n\n¿Qué le parece?");
function chips(){const c={all:D.filter(b=>M[b.c]!=="x").length};IND.forEach(([k])=>c[k]=D.filter(b=>b.i===k&&M[b.c]!=="x").length);
 $("chips").innerHTML=`<button data-i="all" class="${F.i==="all"?"on":""}">Todos ${c.all}</button>`+IND.map(([k,l])=>`<button data-i="${k}" class="${F.i===k?"on":""}">${l} ${c[k]}</button>`).join("");
 const regs=[...new Set(D.map(b=>b.g))].sort((a,b)=>a==="Acapulco"?-1:b==="Acapulco"?1:a.localeCompare(b));
 $("reg").innerHTML=`<option value="all">📍 Todo México</option>`+regs.map(r=>`<option ${F.g===r?"selected":""}>${esc(r)}</option>`).join("")}
function draw(){const q=norm(F.q.trim());
 let L=D.filter(b=>(F.i==="all"||b.i===F.i)&&(F.g==="all"||b.g===F.g)&&(!q||norm(b.n+" "+b.a+" "+b.g).includes(q)));
 const hidden=L.filter(b=>M[b.c]==="x").length;if(!F.hid)L=L.filter(b=>M[b.c]!=="x");
 const vals=Object.values(M);$("sS").textContent="✅ "+vals.filter(v=>v==="s").length;$("sR").textContent="💬 "+vals.filter(v=>v==="r").length;$("sX").textContent="❌ "+vals.filter(v=>v==="x").length;
 $("cnt").textContent=L.length+" de "+D.length;
 let h="";IND.forEach(([k,l])=>{const g=L.filter(b=>b.i===k);if(!g.length)return;h+=`<h2>${l} · ${g.length}</h2>`;
  g.forEach(b=>{const m=M[b.c]||"";h+=`<div class="c ${m==="s"?"sent":m==="r"?"rep":m==="x"?"no":""}"><b>${esc(b.n)}</b><small>${esc(b.a)}</small><span class="tg">${esc(b.g)} · +${b.w.slice(0,2)} ${b.w.slice(2,5)} ${b.w.slice(5,8)} ${b.w.slice(8)}</span>
   <div class="bt"><a class="demo" target="_blank" href="${demo(b)}">✨ Demo</a><a class="pitch" target="_blank" data-p="${b.c}" href="${pitch(b)}">📲 Pitch</a></div>
   <div class="mk"><button data-m="${b.c}|s" class="s ${m==="s"?"on":""}">✅ Enviado</button><button data-m="${b.c}|r" class="r ${m==="r"?"on":""}">💬 Respondió</button><button data-m="${b.c}|x" class="x ${m==="x"?"on":""}">❌ Sin WA</button></div></div>`})});
 $("list").innerHTML=(h||`<p class="empty">Nada por aquí.</p>`)+(hidden?`<a href="#" class="more" id="tog">${F.hid?"Ocultar":"Mostrar"} ${hidden} sin WhatsApp</a>`:"");
 try{localStorage.setItem(K+"-f",JSON.stringify({i:F.i,g:F.g,hid:F.hid}))}catch(_){}}
document.addEventListener("click",e=>{const c=e.target.closest("[data-i]");if(c){F.i=c.dataset.i;chips();draw();scrollTo({top:0});return}
 const m=e.target.closest("[data-m]");if(m){const[id,v]=m.dataset.m.split("|");M[id]=M[id]===v?"":v;if(!M[id])delete M[id];save();chips();draw();return}
 const p=e.target.closest("[data-p]");if(p&&!M[p.dataset.p]){M[p.dataset.p]="s";save();setTimeout(()=>{chips();draw()},400);return}
 if(e.target.id==="tog"){e.preventDefault();F.hid=!F.hid;draw()}});
$("q").addEventListener("input",e=>{F.q=e.target.value;draw()});
$("reg").addEventListener("change",e=>{F.g=e.target.value;draw()});
chips();draw();
</script></body></html>
"""
import os
os.makedirs(os.path.join(REPO, "acapulco/rutas/whatsapp"), exist_ok=True)
open(os.path.join(REPO, "acapulco/rutas/whatsapp/index.html"), "w", encoding="utf8").write(HTML.replace("__DATA__", json.dumps(data, ensure_ascii=False)))
from collections import Counter
print(len(data), Counter(d["i"] for d in data), Counter(d["g"] for d in data))
