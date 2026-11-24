#!/bin/bash
# usage: tools/rutas-leads/add.sh batch.txt BATCHNO
# batch.txt lines: Name|Type|Area, State|10-digit phone
# Type must be one of: Hotel Restaurante Tour Café Bar Spa Salón Boutique Tienda "Club de playa"
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
node -e '
const fs=require("fs");const f=process.argv[3];const rows=JSON.parse(fs.readFileSync(f,"utf8"));const b=+process.argv[2];
const fix=p=>{let d=(p||"").replace(/\D/g,"");if(d.length===13&&d.startsWith("521"))d="52"+d.slice(3);if(d.length===10)d="52"+d;return d};
const ok=new Set(["Hotel","Restaurante","Tour","Café","Bar","Spa","Salón","Boutique","Tienda","Club de playa"]);
const have=new Set(rows.map(r=>r.phone));let i=rows.length;let n=0,d=0,bad=[];
for(const l of fs.readFileSync(process.argv[1],"utf8").trim().split("\n")){if(!l.trim())continue;const [nm,type,area,p]=l.split("|").map(s=>(s||"").trim());const ph=fix(p);
if(ph.length!==12||!ok.has(type)||!nm||!area){bad.push(l);continue}if(have.has(ph)){d++;continue}have.add(ph);i++;n++;rows.push({kind:"new",n:nm,type,area,phone:ph,code:"R"+String(i).padStart(4,"0"),batch:b})}
fs.writeFileSync(f,JSON.stringify(rows,null,1));
console.log("added",n,"dups",d,"bad",bad.length,bad.join(" || ").slice(0,300),"TOTAL",rows.filter(r=>r.kind==="new").length)' "$1" "$2" "$HERE/leads.json"
