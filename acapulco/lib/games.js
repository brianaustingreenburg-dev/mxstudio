// MX Studio ✝ — Juegos en familia: trivia de Acapulco en grupo (cada quien en su teléfono), memoria y colorear.
// Free in every restaurant app. Group trivia connects phones peer-to-peer (needs internet); memory & coloring work offline.
(function(){
const C=()=>window.MXG||{};const L=()=>(C().lang&&C().lang())==="en"?"en":"es";
const T={es:{title:"🎮 Juegos en familia",sub:"Mientras llega la comida",triv:"❓ Trivia de Acapulco en familia",trivS:"Cada quien en su teléfono · comparte por WhatsApp",mem:"🧠 Memoria",memS:"Para niños · encuentra las parejas",col:"🎨 Colorear",colS:"Para niños · dibuja con el dedo",solo:"Jugar solo",close:"Cerrar",back:"← Juegos",name:"Tu nombre",create:"🎉 Crear sala",join:"Entrar a la sala",code:"Código de sala",share:"📲 Invitar por WhatsApp",lobby:"Jugadores en la sala",start:"▶️ Empezar",waitHost:"Esperando a que empiece…",waitNext:"Esperando la siguiente pregunta…",q:"Pregunta",of:"de",right:"¡Correcto!",wrong:"Era:",time:"¡Tiempo!",scores:"Puntos",next:"Siguiente →",end:"🏆 ¡Ganador!",again:"Jugar otra vez",moves:"Movimientos",win:"¡Ganaste! 🎉",clear:"Borrar",conn:"Conectando…",fail:"No se pudo conectar. Revisa que todos tengan internet (el WiFi del restaurante funciona mejor) o juega solo.",noroom:"No encontré esa sala. Revisa el código.",inv:"¡Juguemos trivia de Acapulco en *",inv2:"*! Entra aquí:",codeIs:"Código:",youare:"Tú",host:"anfitrión",need:"Escribe tu nombre"},
 en:{title:"🎮 Family games",sub:"While the food arrives",triv:"❓ Acapulco family trivia",trivS:"Everyone on their own phone · share on WhatsApp",mem:"🧠 Memory",memS:"For kids · find the pairs",col:"🎨 Coloring",colS:"For kids · draw with your finger",solo:"Play solo",close:"Close",back:"← Games",name:"Your name",create:"🎉 Create room",join:"Join the room",code:"Room code",share:"📲 Invite on WhatsApp",lobby:"Players in the room",start:"▶️ Start",waitHost:"Waiting for the game to start…",waitNext:"Waiting for the next question…",q:"Question",of:"of",right:"Correct!",wrong:"It was:",time:"Time's up!",scores:"Points",next:"Next →",end:"🏆 Winner!",again:"Play again",moves:"Moves",win:"You won! 🎉",clear:"Clear",conn:"Connecting…",fail:"Couldn't connect. Make sure everyone has internet (the restaurant WiFi works best) or play solo.",noroom:"Couldn't find that room. Check the code.",inv:"Let's play Acapulco trivia at *",inv2:"*! Join here:",codeIs:"Code:",youare:"You",host:"host",need:"Enter your name"}};
const Q=[
 {es:["¿Desde qué acantilado famoso saltan los clavadistas de Acapulco?",["La Quebrada","La Roqueta","Pie de la Cuesta","Puerto Marqués"]],en:["From which famous cliff do Acapulco's divers jump?",["La Quebrada","La Roqueta","Pie de la Cuesta","Puerto Marqués"]],a:0},
 {es:["¿En qué estado de México está Acapulco?",["Guerrero","Oaxaca","Jalisco","Michoacán"]],en:["Which Mexican state is Acapulco in?",["Guerrero","Oaxaca","Jalisco","Michoacán"]],a:0},
 {es:["¿Qué galeón llegaba a Acapulco desde Filipinas con sedas y especias?",["La Nao de China","El Titanic","La Santa María","El Perla Negra"]],en:["Which galleon sailed to Acapulco from the Philippines with silk and spices?",["The Manila Galleon (Nao de China)","The Titanic","The Santa María","The Black Pearl"]],a:0},
 {es:["¿Qué protegía el Fuerte de San Diego?",["El puerto, de los piratas","Una mina de oro","El aeropuerto","Un hotel"]],en:["What did Fort San Diego protect?",["The port, from pirates","A gold mine","The airport","A hotel"]],a:0},
 {es:["¿Cómo se llama la avenida principal frente a la bahía?",["Costera Miguel Alemán","Paseo de la Reforma","Avenida Juárez","Calle Madero"]],en:["What is the main avenue along the bay called?",["Costera Miguel Alemán","Paseo de la Reforma","Avenida Juárez","Calle Madero"]],a:0},
 {es:["¿A qué isla se llega en lancha desde Caleta?",["Isla La Roqueta","Isla Mujeres","Isla Cozumel","Isla Holbox"]],en:["Which island do you reach by boat from Caleta?",["La Roqueta Island","Isla Mujeres","Cozumel","Holbox"]],a:0},
 {es:["¿Qué día se come pozole en Guerrero, por tradición?",["Jueves","Lunes","Martes","Domingo"]],en:["Which day is pozole traditionally eaten in Guerrero?",["Thursday","Monday","Tuesday","Sunday"]],a:0},
 {es:["El pescado “a la talla” se cocina…",["A las brasas, untado con chile","Frito en aceite","Crudo con limón","Al vapor"]],en:["“Pescado a la talla” is cooked…",["Grilled over coals with chile paste","Deep-fried","Raw with lime","Steamed"]],a:0},
 {es:["¿Por qué es famosa Pie de la Cuesta?",["Sus atardeceres","Su nieve","Sus pirámides","Su metro"]],en:["What is Pie de la Cuesta famous for?",["Its sunsets","Its snow","Its pyramids","Its subway"]],a:0},
 {es:["¿Qué hay en lo alto de Las Brisas, con una cruz enorme?",["La Capilla de la Paz","Un faro","Un estadio","Un volcán"]],en:["What sits high above Las Brisas with a huge cross?",["The Chapel of Peace","A lighthouse","A stadium","A volcano"]],a:0},
 {es:["¿Qué presidente de EE.UU. pasó su luna de miel en Acapulco en 1953?",["John F. Kennedy","Abraham Lincoln","Barack Obama","George Washington"]],en:["Which U.S. president honeymooned in Acapulco in 1953?",["John F. Kennedy","Abraham Lincoln","Barack Obama","George Washington"]],a:0},
 {es:["¿Qué océano baña Acapulco?",["Océano Pacífico","Océano Atlántico","Mar Caribe","Océano Índico"]],en:["Which ocean is Acapulco on?",["Pacific Ocean","Atlantic Ocean","Caribbean Sea","Indian Ocean"]],a:0},
 {es:["¿Cómo se llama la laguna junto a Pie de la Cuesta?",["Laguna de Coyuca","Laguna de Bacalar","Lago de Chapala","Laguna de Términos"]],en:["What's the lagoon next to Pie de la Cuesta?",["Coyuca Lagoon","Bacalar Lagoon","Lake Chapala","Términos Lagoon"]],a:0},
 {es:["Una bebida típica de coco con piña y ron se llama…",["Piña colada","Horchata","Champurrado","Tepache"]],en:["A classic coconut, pineapple and rum drink is called…",["Piña colada","Horchata","Champurrado","Tepache"]],a:0},
 {es:["¿Cuántos lados tiene una estrella de mar común?",["5 brazos","3 brazos","8 brazos","10 brazos"]],en:["How many arms does a common starfish have?",["5 arms","3 arms","8 arms","10 arms"]],a:0}
];
const css=`.mxg{position:fixed;inset:0;z-index:90;background:rgba(10,6,4,.6);display:flex;align-items:flex-end;justify-content:center}.mxg .bx{background:var(--bg,#faf6f0);color:var(--ink,#1d1715);width:100%;max-width:560px;max-height:92vh;overflow:auto;border-radius:22px 22px 0 0;padding:18px 16px calc(18px + env(safe-area-inset-bottom));font-family:inherit}
.mxg h3{margin:0 0 2px;font-size:20px}.mxg .s{opacity:.7;font-size:14px;margin:0 0 12px}.mxg .op{all:unset;box-sizing:border-box;display:block;width:100%;cursor:pointer;background:var(--card,#fff);border:1px solid var(--line,#e8ddd0);border-radius:16px;padding:14px;margin:8px 0}.mxg .op b{display:block;font-size:16px}.mxg .op small{opacity:.7}
.mxg .bt{all:unset;box-sizing:border-box;display:block;width:100%;text-align:center;cursor:pointer;background:var(--c,#b5642f);color:#fff;border-radius:14px;padding:14px;font-weight:800;margin-top:10px}.mxg .bt.g{background:#25d366;color:#05301a}.mxg .bt.l{background:var(--card,#fff);color:inherit;border:1px solid var(--line,#e8ddd0)}
.mxg input{box-sizing:border-box;width:100%;padding:13px;border-radius:12px;border:1.5px solid var(--line,#e8ddd0);font:inherit;font-size:16px;margin-top:6px;background:#fff;color:#1d1715}.mxg .code{font-size:40px;font-weight:800;letter-spacing:8px;text-align:center;margin:6px 0;color:var(--c,#b5642f)}
.mxg .pl{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.mxg .pl span{background:var(--card,#fff);border:1px solid var(--line,#e8ddd0);border-radius:999px;padding:6px 10px;font-weight:700;font-size:14px}
.mxg .qq{font-size:19px;font-weight:800;margin:10px 0}.mxg .an{all:unset;box-sizing:border-box;display:block;width:100%;cursor:pointer;background:#fff;border:2px solid var(--line,#e8ddd0);border-radius:14px;padding:13px;margin:7px 0;font-weight:700}.mxg .an.ok{border-color:#25a35a;background:#e6f7ec}.mxg .an.no{border-color:#d9534f;background:#fbe9e8}.mxg .an.pk{border-color:var(--c,#b5642f)}
.mxg .bar{height:6px;background:#eadfd2;border-radius:9px;overflow:hidden}.mxg .bar i{display:block;height:100%;background:var(--c,#b5642f);transition:width .2s linear}
.mxg .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0}.mxg .cd{all:unset;aspect-ratio:1;cursor:pointer;border-radius:12px;background:var(--c,#b5642f);display:grid;place-items:center;font-size:30px;color:transparent}.mxg .cd.f{background:#fff;color:inherit;border:2px solid var(--line,#e8ddd0)}
.mxg canvas{width:100%;aspect-ratio:1;background:#fff;border-radius:14px;border:1px solid var(--line,#e8ddd0);touch-action:none;display:block}.mxg .pal{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.mxg .pal button{all:unset;width:34px;height:34px;border-radius:50%;cursor:pointer;border:3px solid #fff;box-shadow:0 0 0 1px #ccc}.mxg .pal button.on{box-shadow:0 0 0 3px var(--c,#b5642f)}
.mxg .sc{display:flex;justify-content:space-between;padding:8px 2px;border-bottom:1px solid var(--line,#e8ddd0);font-weight:700}.mxg .note{font-size:13px;opacity:.75;margin-top:8px}`;
let root=null,peer=null,conns=[],me={name:"",host:false},room=null,G=null,timer=null;
const esc=s=>String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const t=k=>T[L()][k];
function shell(html){if(!root){const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);root=document.createElement("div");root.className="mxg";root.addEventListener("click",e=>{if(e.target===root)close()});document.body.appendChild(root)}root.style.display="flex";root.innerHTML=`<div class="bx">${html}</div>`;return root.firstChild}
function close(){if(root)root.style.display="none";clearInterval(timer);try{peer&&peer.destroy()}catch(_){}peer=null;conns=[];G=null;room=null}
function home(){const b=shell(`<h3>${t("title")}</h3><p class="s">${t("sub")}</p>
 <button class="op" data-g="triv"><b>${t("triv")}</b><small>${t("trivS")}</small></button>
 <button class="op" data-g="mem"><b>${t("mem")}</b><small>${t("memS")}</small></button>
 <button class="op" data-g="col"><b>${t("col")}</b><small>${t("colS")}</small></button>
 <button class="bt l" data-x>${t("close")}</button>`);
 b.onclick=e=>{const g=e.target.closest("[data-g]");if(g){({triv:trivHome,mem:memory,col:coloring})[g.dataset.g]()}if(e.target.closest("[data-x]"))close()}}
// ---------- Memory (offline) ----------
function memory(){const E=["🌮","🥥","🦐","🍹","🌶️","🍍","🐠","🌴"].slice(0,6);let d=[...E,...E].sort(()=>Math.random()-.5),open=[],done=new Set(),mv=0,lock=false;
 const draw=()=>{const b=shell(`<h3>${t("mem")}</h3><p class="s">${t("moves")}: ${mv}${done.size===d.length?" · "+t("win"):""}</p><div class="grid">${d.map((x,i)=>`<button class="cd ${open.includes(i)||done.has(i)?"f":""}" data-i="${i}">${x}</button>`).join("")}</div>${done.size===d.length?`<button class="bt" data-r>${t("again")}</button>`:""}<button class="bt l" data-b>${t("back")}</button>`);
  b.onclick=e=>{if(e.target.closest("[data-b]"))return home();if(e.target.closest("[data-r]"))return memory();const c=e.target.closest("[data-i]");if(!c||lock)return;const i=+c.dataset.i;if(open.includes(i)||done.has(i))return;open.push(i);
   if(open.length===2){mv++;if(d[open[0]]===d[open[1]]){open.forEach(x=>done.add(x));open=[];draw()}else{lock=true;draw();setTimeout(()=>{open=[];lock=false;draw()},800)}}else draw()}};draw()}
// ---------- Coloring (offline) ----------
function coloring(){const b=shell(`<h3>${t("col")}</h3><p class="s">🌴🌞🌊</p><canvas width="600" height="600"></canvas><div class="pal">${["#e53935","#fb8c00","#fdd835","#43a047","#1e88e5","#8e24aa","#6d4c41","#111111","#ffffff"].map((c,i)=>`<button style="background:${c}" data-c="${c}" class="${i===4?"on":""}"></button>`).join("")}</div><button class="bt l" data-cl>${t("clear")}</button><button class="bt l" data-b>${t("back")}</button>`);
 const cv=b.querySelector("canvas"),x=cv.getContext("2d");let col="#1e88e5",dn=false,last=null;
 const outline=()=>{x.fillStyle="#fff";x.fillRect(0,0,600,600);x.strokeStyle="#222";x.lineWidth=5;x.lineCap="round";x.lineJoin="round";
  x.beginPath();x.arc(470,120,60,0,7);x.stroke();for(let k=0;k<8;k++){const a=k*Math.PI/4;x.beginPath();x.moveTo(470+Math.cos(a)*78,120+Math.sin(a)*78);x.lineTo(470+Math.cos(a)*105,120+Math.sin(a)*105);x.stroke()}
  x.beginPath();x.moveTo(170,520);x.quadraticCurveTo(190,380,230,260);x.moveTo(205,520);x.quadraticCurveTo(220,380,250,262);x.stroke();
  [[-1,-.2],[-.8,.4],[.9,.3],[1,-.3],[0,-1]].forEach(([dx,dy])=>{x.beginPath();x.moveTo(240,258);x.quadraticCurveTo(240+dx*70,258+dy*70-40,240+dx*120,258+dy*90+20);x.quadraticCurveTo(240+dx*60,258+dy*50,240,258);x.stroke()});
  x.beginPath();x.arc(225,280,14,0,7);x.arc(258,284,14,0,7);x.stroke();
  x.beginPath();x.moveTo(0,470);for(let i=0;i<=600;i+=50)x.quadraticCurveTo(i+25,440,i+50,470);x.stroke();x.beginPath();x.moveTo(0,530);for(let i=0;i<=600;i+=60)x.quadraticCurveTo(i+30,500,i+60,530);x.stroke();
  x.beginPath();x.ellipse(430,400,55,26,0,0,7);x.moveTo(485,400);x.lineTo(525,375);x.lineTo(525,425);x.closePath();x.stroke();x.beginPath();x.arc(405,394,5,0,7);x.stroke()};
 outline();const pt=e=>{const r=cv.getBoundingClientRect(),p=e.touches?e.touches[0]:e;return[(p.clientX-r.left)*600/r.width,(p.clientY-r.top)*600/r.height]};
 const st=e=>{dn=true;last=pt(e);e.preventDefault()},mvv=e=>{if(!dn)return;const p=pt(e);x.strokeStyle=col;x.lineWidth=16;x.beginPath();x.moveTo(...last);x.lineTo(...p);x.stroke();last=p;e.preventDefault()},en=()=>{dn=false};
 cv.addEventListener("pointerdown",st);cv.addEventListener("pointermove",mvv);addEventListener("pointerup",en);
 b.onclick=e=>{const c=e.target.closest("[data-c]");if(c){col=c.dataset.c;b.querySelectorAll(".pal button").forEach(z=>z.classList.toggle("on",z===c))}if(e.target.closest("[data-cl]"))outline();if(e.target.closest("[data-b]"))home()}}
// ---------- Trivia (solo or group) ----------
function pickQ(n){return Q.map((q,i)=>i).sort(()=>Math.random()-.5).slice(0,n).map(i=>{const q=Q[i],ord=[0,1,2,3].sort(()=>Math.random()-.5);return {i,ord,a:ord.indexOf(q.a)}})}
function qText(sel){const q=Q[sel.i][L()];return {q:q[0],o:sel.ord.map(k=>q[1][k])}}
function trivHome(join){let nm="";try{nm=localStorage.getItem("mxg-name")||""}catch(_){}
 const b=shell(`<h3>${t("triv")}</h3><p class="s">${t("trivS")}</p><label>${t("name")}</label><input id="gN" value="${esc(nm)}" maxlength="16" autocomplete="nickname">
 ${join?`<label style="display:block;margin-top:10px">${t("code")}</label><input id="gC" inputmode="numeric" value="${esc(join)}" maxlength="4"><button class="bt" data-j>${t("join")}</button>`:`<button class="bt" data-c>${t("create")}</button><button class="bt l" data-s>${t("solo")}</button><details style="margin-top:10px"><summary style="cursor:pointer;font-weight:700">${t("join")}</summary><input id="gC" inputmode="numeric" placeholder="1234" maxlength="4"><button class="bt l" data-j>${t("join")}</button></details>`}
 <p class="note" id="gMsg"></p><button class="bt l" data-b>${t("back")}</button>`);
 b.onclick=e=>{const name=(b.querySelector("#gN").value||"").trim().slice(0,16);
  if(e.target.closest("[data-b]"))return home();
  if(e.target.closest("[data-s]")){me={name:name||t("youare"),host:true};G={qs:pickQ(8),k:-1,scores:{[me.name]:0},solo:true};return nextQ()}
  if(!name&&(e.target.closest("[data-c]")||e.target.closest("[data-j]"))){b.querySelector("#gMsg").textContent=t("need");b.querySelector("#gN").focus();return}
  try{localStorage.setItem("mxg-name",name)}catch(_){}
  if(e.target.closest("[data-c]"))return create(name);
  if(e.target.closest("[data-j]"))return joinRoom(name,(b.querySelector("#gC").value||"").replace(/\D/g,""))}}
function loadPeer(){return window.Peer?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement("script");s.src=(C().lib||"../../lib/")+"peerjs.min.js";s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
const pid=c=>"mxstudio-aca-"+(C().slug||"app")+"-"+c;
async function create(name){shell(`<h3>${t("triv")}</h3><p class="s">${t("conn")}</p>`);
 try{await loadPeer()}catch(_){return failed()}
 const code=String(1000+Math.floor(Math.random()*9000));me={name,host:true};room=code;G={players:[name],qs:pickQ(8),k:-1,scores:{[name]:0},ans:{}};
 peer=new Peer(pid(code),C().peer||{});const to=setTimeout(failed,12000);
 peer.on("open",()=>{clearTimeout(to);lobby()});peer.on("error",e=>{if(e&&e.type==="unavailable-id"){try{peer.destroy()}catch(_){}return create(name)}clearTimeout(to);failed()});
 peer.on("connection",c=>{c.on("data",m=>hostMsg(c,m));c.on("close",()=>{conns=conns.filter(x=>x!==c);if(c._n){G.players=G.players.filter(p=>p!==c._n);bcast({t:"lobby",players:G.players});if(G.k<0)lobby()}})})}
function bcast(m){conns.forEach(c=>{try{c.send(m)}catch(_){}})}
function hostMsg(c,m){if(m.t==="join"){let n=String(m.name||"").slice(0,16)||"?";while(G.players.includes(n))n+="·";c._n=n;conns.push(c);G.players.push(n);G.scores[n]=G.scores[n]||0;c.send({t:"you",name:n});bcast({t:"lobby",players:G.players});if(G.k<0)lobby()}
 if(m.t==="ans"&&G.k===m.k&&c._n&&G.ans[c._n]===undefined){G.ans[c._n]=m.c;checkAll()}}
function lobby(){const link=(C().url||location.origin+location.pathname)+"?jugar="+room,msg=t("inv")+(C().name||"")+t("inv2")+" "+link+"\n"+t("codeIs")+" "+room;
 const b=shell(`<h3>${t("triv")}</h3><p class="s">${t("code")}</p><div class="code">${room}</div>
 <a class="bt g" style="text-decoration:none" target="_blank" href="https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}">${t("share")}</a>
 <p style="font-weight:800;margin:14px 0 0">${t("lobby")} (${G.players.length})</p><div class="pl">${G.players.map((p,i)=>`<span>${i?"":"⭐ "}${esc(p)}${i?"":" ("+t("host")+")"}</span>`).join("")}</div>
 <button class="bt" data-st>${t("start")}</button><button class="bt l" data-b>${t("close")}</button>`);
 b.onclick=e=>{if(e.target.closest("[data-st]")){nextQ()}if(e.target.closest("[data-b]"))close()}}
function failed(){const b=shell(`<h3>${t("triv")}</h3><p class="note" style="opacity:1">${t("fail")}</p><button class="bt" data-s>${t("solo")}</button><button class="bt l" data-b>${t("back")}</button>`);
 b.onclick=e=>{if(e.target.closest("[data-s]")){me={name:me.name||t("youare"),host:true};G={qs:pickQ(8),k:-1,scores:{[me.name]:0},solo:true};nextQ()}if(e.target.closest("[data-b]"))home()}}
const SECS=15;
function nextQ(){G.k++;G.ans={};clearInterval(timer);if(G.k>=G.qs.length)return finish();const sel=G.qs[G.k],ends=Date.now()+SECS*1000;G.ends=ends;
 if(!G.solo)bcast({t:"q",k:G.k,n:G.qs.length,sel:{i:sel.i,ord:sel.ord},ends:SECS});showQ(G.k,G.qs.length,sel,SECS);timer=setInterval(()=>{if(Date.now()>=G.ends){clearInterval(timer);reveal()}},250)}
function checkAll(){const need=G.solo?1:G.players.length;if(Object.keys(G.ans).length>=need){clearInterval(timer);reveal()}}
let myPick=null;
function showQ(k,n,sel,secs){myPick=null;const {q,o}=qText(sel),ends=Date.now()+secs*1000;
 const b=shell(`<p class="s">${t("q")} ${k+1} ${t("of")} ${n}</p><div class="bar"><i id="gT" style="width:100%"></i></div><div class="qq">${esc(q)}</div>${o.map((x,i)=>`<button class="an" data-a="${i}">${esc(x)}</button>`).join("")}<p class="note" id="gW"></p>`);
 const tick=setInterval(()=>{const el=b.querySelector("#gT");if(!el){clearInterval(tick);return}el.style.width=Math.max(0,(ends-Date.now())/(secs*10))+"%";if(Date.now()>ends)clearInterval(tick)},200);
 b.onclick=e=>{const a=e.target.closest("[data-a]");if(!a||myPick!==null)return;myPick=+a.dataset.a;a.classList.add("pk");b.querySelector("#gW").textContent="✓";
  if(me.host){G.ans[me.name]=myPick;checkAll()}else{try{conns[0].send({t:"ans",k,c:myPick})}catch(_){}}}}
function reveal(){const sel=G.qs[G.k];Object.entries(G.ans).forEach(([n,c])=>{if(c===sel.a)G.scores[n]=(G.scores[n]||0)+1});
 if(!G.solo)bcast({t:"res",k:G.k,a:sel.a,scores:G.scores});showRes(sel.a,G.scores,true)}
function showRes(a,scores,isHost){const b=root.firstChild;b.querySelectorAll("[data-a]").forEach(x=>{const i=+x.dataset.a;if(i===a)x.classList.add("ok");else if(i===myPick)x.classList.add("no")});
 const ok=myPick===a;const w=b.querySelector("#gW");w.style.opacity=1;w.innerHTML=`<b>${myPick===null?t("time"):ok?t("right"):t("wrong")+" "+esc(b.querySelectorAll("[data-a]")[a].textContent)}</b>`;
 const sc=Object.entries(scores).sort((x,y)=>y[1]-x[1]);b.insertAdjacentHTML("beforeend",`<p style="font-weight:800;margin:12px 0 0">${t("scores")}</p>${sc.map(([n,s])=>`<div class="sc"><span>${esc(n)}</span><span>${s}</span></div>`).join("")}${isHost?`<button class="bt" data-n>${t("next")}</button>`:`<p class="note">${t("waitNext")}</p>`}`);
 if(isHost)b.onclick=e=>{if(e.target.closest("[data-n]"))nextQ()}}
function finish(){if(!G.solo)bcast({t:"end",scores:G.scores});showEnd(G.scores,true)}
function showEnd(scores,isHost){const sc=Object.entries(scores).sort((x,y)=>y[1]-x[1]);
 const b=shell(`<h3>${t("end")}</h3><div class="code" style="font-size:28px;letter-spacing:0">🥇 ${esc(sc[0]?sc[0][0]:"")}</div>${sc.map(([n,s],i)=>`<div class="sc"><span>${["🥇","🥈","🥉"][i]||"•"} ${esc(n)}</span><span>${s}</span></div>`).join("")}
 ${isHost?`<button class="bt" data-again>${t("again")}</button>`:""}<button class="bt l" data-b>${t("close")}</button>`);
 b.onclick=e=>{if(e.target.closest("[data-again]")){G.qs=pickQ(8);G.k=-1;Object.keys(G.scores).forEach(k=>G.scores[k]=0);G.solo?nextQ():lobby()}if(e.target.closest("[data-b]"))close()}}
async function joinRoom(name,code){if(code.length!==4)return;shell(`<h3>${t("triv")}</h3><p class="s">${t("conn")}</p>`);
 try{await loadPeer()}catch(_){return failed()}
 me={name,host:false};room=code;peer=new Peer(C().peer||{});const to=setTimeout(failed,15000);
 peer.on("error",e=>{clearTimeout(to);if(e&&e.type==="peer-unavailable"){const b=shell(`<h3>${t("triv")}</h3><p class="note" style="opacity:1">${t("noroom")}</p><button class="bt l" data-b>${t("back")}</button>`);b.onclick=()=>trivHome(code)}else failed()});
 peer.on("open",()=>{const c=peer.connect(pid(code),{reliable:true});conns=[c];
  c.on("open",()=>{clearTimeout(to);c.send({t:"join",name})});
  c.on("data",m=>{if(m.t==="you")me.name=m.name;
   if(m.t==="lobby"){const b=shell(`<h3>${t("triv")}</h3><p class="s">${t("code")}: <b>${room}</b></p><p style="font-weight:800">${t("lobby")} (${m.players.length})</p><div class="pl">${m.players.map(p=>`<span>${esc(p)}${p===me.name?" ("+t("youare")+")":""}</span>`).join("")}</div><p class="note" style="opacity:1">⏳ ${t("waitHost")}</p><button class="bt l" data-b>${t("close")}</button>`);b.onclick=e=>{if(e.target.closest("[data-b]"))close()}}
   if(m.t==="q")showQ(m.k,m.n,m.sel,m.ends);
   if(m.t==="res"){showRes(m.a,m.scores,false)}
   if(m.t==="end")showEnd(m.scores,false)});
  c.on("close",()=>{})})}
window.MXGames={open:home,join:code=>trivHome(code),close};
})();
