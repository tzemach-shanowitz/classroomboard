import json,zipfile,csv,re,os
R='/tmp/fb/public-cb/review';os.chdir(R)
m=json.load(open('manifest.json'));v=m['version']
slug=lambda s:re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
zn=f'classroomboard-review-{v}.zip'
z=zipfile.ZipFile(zn,'w',zipfile.ZIP_STORED)
for s in m['shots']:z.write('img/'+s['f'],f"{s['vp']}/{slug(s['group'])}/{s['f']}")
z.write('manifest.json','manifest.json');z.close()
t=open('/downloads/classroom/i18n.js').read();d=json.loads(t[t.index('=')+1:t.rindex(';')])
with open('translations.csv','w',newline='',encoding='utf-8-sig') as f:
    w=csv.writer(f);w.writerow(['English','Hebrew (draft)','Yiddish (draft)','Your correction (optional)'])
    for k in d['he']:w.writerow([k,d['he'][k],d['yi'].get(k,''),''])
i=open('index.html').read()
i=i.replace('<h2>Contents</h2>',f'<p><a href="{zn}">Download all screenshots (ZIP, by device and category)</a> | <a href="manifest.json">manifest.json</a> | <a href="translations.csv">Hebrew and Yiddish wording (CSV)</a></p><h2>Contents</h2>',1)
open('index.html','w').write(i)
