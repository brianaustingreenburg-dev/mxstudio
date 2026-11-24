#!/bin/bash
# Regenerates the WhatsApp leads page, updates the count, bumps the SW cache, commits and pushes to main.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"; REPO="$(cd "$HERE/../.." && pwd)"
python3 "$HERE/gen_wa.py" >/dev/null
cd "$REPO"
N=$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).filter(r=>r.kind==="new").length)' "$HERE/leads.json")
sed -i -E "s/📲 WhatsApp · [0-9]+ negocios con demo/📲 WhatsApp · $N negocios con demo/" acapulco/rutas/index.html
V=$(grep -oP 'const CACHE="mx-acapulco-v\K[0-9]+' acapulco/sw.js); V2=$((V+1))
sed -i "s/const CACHE=\"mx-acapulco-v$V\"/const CACHE=\"mx-acapulco-v$V2\"/" acapulco/sw.js
node --check acapulco/sw.js
git add -A acapulco tools/rutas-leads
git commit -qm "WhatsApp leads: $N businesses nationwide" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -q origin main
echo "published $N (sw v$V2)"
