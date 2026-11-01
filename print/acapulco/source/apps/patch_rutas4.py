import sys,json
CO=json.load(open('/home/claude/routes/coords.json'))
ES='navT:"🗺️ Navegar esta ruta",navS:"Abre Google Maps en orden de visita (por tramos):",navP:"Paradas",mapT:"Mapa de la ruta",'
EN='navT:"🗺️ Navigate this route",navS:"Opens Google Maps in visiting order (in legs):",navP:"Stops",mapT:"Route map",'
JS='''
const CO=%s;
function routeMap(r){const pts=r.stops.map((s,i)=>({i:i+1,s,c:CO[s.id]})).filter(p=>p.c);if(pts.length<2)return "";
 const k=Math.cos(16.8*Math.PI/180),xs=pts.map(p=>p.c[1]*k),ys=pts.map(p=>-p.c[0]);
 const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),W=340,H=220,pad=22;
 const sc=Math.min((W-2*pad)/((x1-x0)||1e-6),(H-2*pad)/((y1-y0)||1e-6));
 const P=pts.map(p=>({...p,x:pad+(p.c[1]*k-x0)*sc+((W-2*pad)-(x1-x0)*sc)/2,y:pad+(-p.c[0]-y0)*sc+((H-2*pad)-(y1-y0)*sc)/2}));
 const line=P.map(p=>p.x.toFixed(1)+","+p.y.toFixed(1)).join(" ");
 return `<svg viewBox="0 0 ${W} ${H}" style="width:100%%;display:block;background:rgba(255,255,255,.04);border-radius:14px;margin-top:8px"><polyline points="${line}" fill="none" stroke="#d9a35f" stroke-width="2.5" stroke-dasharray="6 5" stroke-linecap="round"/>${P.map(p=>`<g><circle cx="${p.x}" cy="${p.y}" r="11" fill="${p.i===1?"#25d366":"#d98b5f"}" stroke="#120d0b" stroke-width="2"/><text x="${p.x}" y="${p.y+4}" text-anchor="middle" font-size="11" font-weight="800" fill="#120d0b">${p.i}</text></g>`).join("")}</svg>
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 10px;font-size:.78em;margin-top:6px;opacity:.85">${P.map(p=>`<span><b style="color:var(--gold)">${p.i}</b> ${esc(p.s.n)}</span>`).join("")}</div>`}
function navBlock(r){const t=L(),st=r.stops.filter(s=>CO[s.id]);if(!st.length)return "";const legs=[];let i=0;
 while(i<st.length){const end=Math.min(i+4,st.length),seg=st.slice(i,end),prev=i>0?st[i-1]:null,dest=seg[seg.length-1],way=seg.slice(0,-1);
  const ll=s=>CO[s.id][0]+","+CO[s.id][1];
  let u="https://www.google.com/maps/dir/?api=1&travelmode=driving&destination="+ll(dest)+"&destination_place_id="+dest.id;
  if(prev)u+="&origin="+ll(prev)+"&origin_place_id="+prev.id;
  if(way.length)u+="&waypoints="+encodeURIComponent(way.map(ll).join("|"))+"&waypoint_place_ids="+encodeURIComponent(way.map(s=>s.id).join("|"));
  legs.push(`<a class="leg" href="${u}" target="_blank" rel="noopener">${t.navP} ${i+1}–${end}</a>`);i=end;if(i===st.length-1&&st.length>1){}}
 return `<div class="navb"><b>${t.navT}</b><p>${t.navS}</p><div class="legs">${legs.join("")}</div><details><summary>${t.mapT}</summary>${routeMap(r)}</details></div>`}
'''%json.dumps(CO)
CSS='.navb{margin:12px 0;padding:12px 14px;border-radius:16px;background:rgba(217,163,95,.1);border:1.5px solid rgba(217,163,95,.35)}.navb p{font-size:.82em;opacity:.8;margin:3px 0 8px}.legs{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px}.leg{text-align:center;padding:11px 6px;border-radius:12px;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#1a0f0a;font-weight:800;text-decoration:none;font-size:.88em}.navb details{margin-top:10px}.navb summary{font-weight:800;cursor:pointer}\n'
def patch(h):
    for a,b in [('appB:"📱 Abrir su app",',ES+'appB:"📱 Abrir su app",'),('appB:"📱 Open their app",',EN+'appB:"📱 Open their app",')]:
        assert h.count(a)==1;h=h.replace(a,b)
    a='function showPrices(){';assert h.count(a)==1;h=h.replace(a,JS+a)
    a='<b>${t.bring}</b> ${esc(F(r,"bring"))}</div>'
    assert h.count(a)==1,'info';h=h.replace(a,a+'\n  ${navBlock(r)}')
    a='.demoBtn{';assert h.count(a)==1;h=h.replace(a,CSS+a)
    return h
for f in sys.argv[1:]:
    h=open(f).read();assert 'navBlock' not in h;open(f,'w').write(patch(h));print('patched',f)
