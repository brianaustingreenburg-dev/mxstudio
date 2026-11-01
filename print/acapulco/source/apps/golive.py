# Usage: python3 golive.py <demo-id> <slug> <whatsapp10> "<wifi name>" "<wifi pass>"
import sys,json,os,shutil,re
sys.path.insert(0,'/home/claude/routes');from fill import fill,manifest
pid,slug,wa,wn,wp=sys.argv[1:6]
A='/home/claude/mxstudio/acapulco/'
d=json.load(open('/home/claude/routes/apps.json'))[pid]
wa=re.sub(r'\D','',wa);wa=wa if wa.startswith('52') else '52'+wa
out=A+f'c/{slug}/';os.makedirs(out+'img',exist_ok=True)
for f in os.listdir(A+f'demo/img/{pid}'):shutil.copy(A+f'demo/img/{pid}/{f}',out+'img/'+f)
s=json.dumps(d).replace(f'img/{pid}/','img/');d=json.loads(s)
d.update(slug=slug,whatsapp=wa,phone=wa,wifi={"name":wn,"pass":wp},demo=False);d.pop('back',None)
open(out+'index.html','w').write(fill(open(A+'app/plantilla.html').read(),d))
open(out+'manifest.json','w').write(manifest(d))
print('ready:',out)
