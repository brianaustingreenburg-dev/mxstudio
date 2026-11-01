# Usage: python3 save_new.py <slug> <cover_path> <s1_path> <s2_path> <s3_path> <s4_path>
import sys,os
from PIL import Image
slug=sys.argv[1];paths=sys.argv[2:7];assert len(paths)==5
d=f'/home/claude/routes/photos-new/{slug}';os.makedirs(d,exist_ok=True)
for nm,p in zip(['cover','s1','s2','s3','s4'],paths):
    im=Image.open(p).convert('RGB');w=1000 if nm=='cover' else 640
    if im.width>w:im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)
    im.save(f'{d}/{nm}.jpg',quality=76,optimize=True,progressive=True)
print(slug,'saved',sum(os.path.getsize(f'{d}/{n}.jpg') for n in ['cover','s1','s2','s3','s4'])//1024,'KB')
