import sys,os
from PIL import Image
T='/root/.claude/projects/-home-claude/c3674f07-f153-54a4-8117-6511291d40f0/tool-results/'
n=sys.argv[1];names=['cover','s1','s2','s3','s4']
os.makedirs(f'/home/claude/routes/photos/{n}',exist_ok=True)
for nm,suf in zip(names,sys.argv[2:]):
    f=[x for x in os.listdir(T) if x.endswith(suf+'.jpg')];assert len(f)==1,(suf,f)
    im=Image.open(T+f[0]).convert('RGB');w=1280 if nm=='cover' else 800
    if im.width>w: im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)
    im.save(f'/home/claude/routes/photos/{n}/{nm}.jpg',quality=80,optimize=True,progressive=True)
print(n,'ok',sum(os.path.getsize(f'/home/claude/routes/photos/{n}/{x}.jpg') for x in names)//1024,'KB')
