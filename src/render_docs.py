from pathlib import Path
import re,html,subprocess,json,base64
import mistune
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]; md=mistune.create_markdown(escape=False,plugins=['table'])
font='Noto Sans CJK SC'

def wrap(s,limit=10):
 # Only visual line breaks; preserve the source Mermaid's labels.
 s=s.replace('<br/>','\n').replace('<br>','\n');parts=[]
 for line in s.split('\n'):
  if len(line)>limit:parts.extend([line[i:i+limit] for i in range(0,len(line),limit)])
  else:parts.append(line)
 return '\\n'.join(parts)

def diagram(src,stem):
 nodes={};edges=[];state=src.lstrip().startswith('stateDiagram');direction='LR' if 'flowchart LR' in src else 'TB'
 if state:
  for line in src.splitlines()[1:]:
   line=line.strip()
   m=re.match(r'(.+?)\s*-->\s*([^:]+?)(?:\s*:\s*(.*))?$',line)
   if not m:continue
   a,b,label=m.groups();a=a.strip();b=b.strip();a='起点' if a=='[*]' else a;b='终点' if b=='[*]' else b
   for name in [a,b]:
    if name not in nodes:nodes[name]={'label':'' if name in ('起点','终点') else name,'shape':'circle' if name in ('起点','终点') else 'box'}
   edges.append((a,b,label or '',False))
 else:
  definition=re.compile(r'([A-Za-z_]\w*)(\[|\{)"([^"]+)"(?:\]|\})')
  for line in src.splitlines()[1:]:
   def replace(m):
    name,shape,label=m.groups();nodes[name]={'label':label,'shape':'diamond' if shape=='{' else 'box'};return name
   clean=definition.sub(replace,line.strip())
   m=re.search(r'([A-Za-z_]\w*)\s*-->\s*(?:\|([^|]+)\|\s*)?([A-Za-z_]\w*)',clean)
   if m:
    a,l,b=m.groups();edges.append((a,b,l or '',False));continue
   m=re.search(r'([A-Za-z_]\w*)\s*-\.\s*"([^"]+)"\s*\.->\s*([A-Za-z_]\w*)',clean)
   if m:a,l,b=m.groups();edges.append((a,b,l,True))
 for a,b,_,_ in edges:
  nodes.setdefault(a,{'label':a,'shape':'box'});nodes.setdefault(b,{'label':b,'shape':'box'})
 ids={n:'n'+str(i) for i,n in enumerate(nodes)}
 dot=['digraph G {',f'graph [rankdir={direction}, bgcolor="transparent", pad="0.2", nodesep="0.27", ranksep="0.38", splines=polyline];',f'node [shape=box,style="rounded,filled",fillcolor="#EFF3E7",color="#CFDCC1",penwidth=1,fontname="{font}",fontsize=12,fontcolor="#203A2C",margin="0.14,0.11"];',f'edge [color="#8FA782",arrowsize=.55,penwidth=1.1,fontname="{font}",fontsize=9,fontcolor="#6A7F5F"];']
 for i,(name,n) in enumerate(nodes.items()):
  label=wrap(n['label'],10).replace('"','\\"')
  fill='#BDDF58' if i==0 else '#EFF3E7'
  dot.append(f'{ids[name]} [label="{label}",shape={n["shape"]},fillcolor="{fill}"];')
 for a,b,l,dash in edges:dot.append(f'{ids[a]} -> {ids[b]} [label="{l}",style={"dashed" if dash else "solid"}];')
 dot.append('}')
 path=R/'diagrams'/stem;path.with_suffix('.mmd').write_text(src);path.with_suffix('.dot').write_text('\n'.join(dot))
 for ext in ['svg','png']:
  subprocess.run(['dot',f'-T{ext}']+(['-Gdpi=180'] if ext=='png' else [])+[str(path.with_suffix('.dot')),'-o',str(path.with_suffix('.'+ext))],check=True,stdout=subprocess.DEVNULL)
 svg=path.with_suffix('.svg').read_text();svg=svg[svg.index('<svg'):]
 return svg,{'name':stem,'nodes':len(nodes),'edges':len(edges),'mermaid_kind':'stateDiagram' if state else 'flowchart','renderer':'Graphviz，同一节点及边拓扑；Mermaid源码另存'}

STYLE='''*{box-sizing:border-box}html{background:#edf1e8}body{margin:0;color:#1d2f25;font-family:-apple-system,BlinkMacSystemFont,"Noto Sans CJK SC","Microsoft YaHei",sans-serif;font-size:14px;line-height:1.8}article{max-width:980px;margin:22px auto;background:#fff;border:1px solid #dbe4d1}section{padding:40px 52px;border-bottom:1px solid #e5ebdc}h1{font-size:42px;letter-spacing:-1.4px;font-weight:650;line-height:1.2;margin:20px 0 10px}h2{font-size:23px;color:#285e4e;line-height:1.4;margin:6px 0 20px;font-weight:600}h3{font-size:17px;margin:22px 0 10px;color:#243e31}h4{font-size:15px}p{margin:12px 0}table{border-collapse:collapse;width:100%;margin:17px 0;font-size:12px;line-height:1.7}th{text-align:left;background:#e8eedc;color:#274734;padding:10px 12px;font-weight:600}td{border-bottom:1px solid #e0e8d7;padding:9px 12px;vertical-align:top}tbody tr:nth-child(2n){background:#f8faf4}code{font-family:ui-monospace,monospace;font-size:11px;background:#f0f4e9;padding:2px 4px;border-radius:4px;overflow-wrap:anywhere}pre{padding:16px;background:#f3f6ed;overflow:auto;font-size:11px;line-height:1.6}pre code{background:none}a{color:#326bde;overflow-wrap:anywhere}ul,ol{padding-left:21px}li{margin:7px 0}.figure{margin:21px 0 12px;background:#fbfcf8;border:1px solid #e4eadb;border-radius:16px;padding:12px 16px}.figure svg{display:block;width:100%;height:auto;max-height:300px}.figcaption{font-size:10px;color:#7b8b70;margin:7px 0 0}details{font-size:11px;color:#718367;margin:5px 0 15px}summary{cursor:pointer}.toolbar{max-width:980px;margin:20px auto;font-size:12px;display:flex;align-items:center;gap:15px;color:#66785c}.toolbar button{padding:10px 15px;background:#285e4e;border:0;border-radius:10px;color:white;cursor:pointer}.brandbar{height:7px;background:linear-gradient(90deg,#BDDF58 0 33%,#285e4e 33% 66%,#19281f 66% 100%)}.doc-footer{font-size:10px;color:#8a977e;padding:18px 52px}.cover-product{width:125px;float:right;mix-blend-mode:multiply;margin:4px 0 16px 22px}blockquote{margin:15px 0;padding:12px 18px;border-left:3px solid #bddf58;background:#f2f6e9}@media(max-width:720px){article{margin:0}section{padding:26px 20px}h1{font-size:32px}table{font-size:11px}td,th{padding:7px 6px}.toolbar{margin:12px 16px}.figure{padding:8px}.figure svg{min-height:100px}}@media print{@page{size:A4;margin:13mm 14mm 15mm}html,body{background:white;font-size:10.4pt;line-height:1.65}article{border:0;margin:0;max-width:none}section{padding:3mm 0 0;border:0;break-after:page}section:last-child{break-after:auto}.toolbar,details,.doc-footer{display:none}h1,h2,h3,h4{break-after:avoid-page;page-break-after:avoid}h1{font-size:31pt}h2{font-size:18pt;margin-bottom:4mm}h3{font-size:12.4pt;margin:5mm 0 2mm}p{margin:3mm 0}table{font-size:9pt;margin:4mm 0;line-height:1.55}td,th{padding:2.2mm 2.5mm}tr{break-inside:avoid}.figure{margin:4mm 0;padding:2mm 3mm;break-inside:avoid;border-radius:3mm}.figure svg{max-height:65mm}ul,ol{padding-left:4.5mm}li{margin:2mm 0}.brandbar{height:2mm}.cover-product{width:28mm}.figcaption{font-size:7pt}}'''

def build(doc,explicit_pages=False):
 text=doc.read_text();infos=[];counter=0
 chunks=text.split('<!-- PAGE -->') if explicit_pages else [text]
 rendered=[]
 for chunk in chunks:
  def repl(m):
   nonlocal counter
   counter+=1;stem=doc.stem.split('_')[2]+'_'+str(counter).zfill(2)
   svg,info=diagram(m.group(1),stem);infos.append(info)
   return f'\n<div class="figure">{svg}<p class="figcaption">图 {counter} · 同一拓扑的离线矢量示意；可编辑 Mermaid 源随包提供。</p></div>\n<details><summary>展开 Mermaid 源码</summary><pre>{html.escape(m.group(1))}</pre></details>\n'
  # Mermaid replacement after markdown conversion using placeholders avoids SVG parsing surprises.
  figures=[]
  def stash(m):figures.append(repl(m));return f'\n\nMERMAIDPLACEHOLDER{len(figures)-1}\n\n'
  part=re.sub(r'```mermaid\s*\n(.*?)\n```',stash,chunk,flags=re.S)
  out=md(part)
  for i,f in enumerate(figures):out=out.replace(f'<p>MERMAIDPLACEHOLDER{i}</p>',f)
  rendered.append('<section>'+out+'</section>')
 title=text.splitlines()[0].lstrip('# ')
 product='data:image/webp;base64,'+base64.b64encode((R/'assets/soundcore_work_reference.webp').read_bytes()).decode()
 if '产品白皮书' in doc.name:rendered[0]=rendered[0].replace('<section>','<section><img class="cover-product" src="'+product+'" alt="用户提供的实际产品参考">',1)
 localstyle=STYLE
 if '参赛材料' in doc.name:localstyle+='@media print{body{font-size:9.5pt;line-height:1.55}h1{font-size:23pt}h2{font-size:15pt}h3{font-size:11.5pt;margin:3.2mm 0 1.8mm}h4{font-size:10.5pt;margin:3mm 0 1.5mm}p{margin:2.4mm 0}table{font-size:8.6pt}td,th{padding:1.5mm 2mm}.figure{margin:2.6mm 0}}'
 out=f'<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)}</title><style>{localstyle}</style><body><div class="toolbar"><b>VoiceLog / 声迹</b><span>v1.1 · 2026-09-26</span><button onclick="window.print()">打印 / 保存 PDF</button><span>图示可离线查看</span></div><article><div class="brandbar"></div>'+''.join(rendered)+'<div class="doc-footer">VoiceLog / 声迹 · 产品与交互基线 · 数据、模型及服务接入状态分别说明。</div></article></body></html>'
 htmlfile=doc.with_suffix('.html');htmlfile.write_text(out)
 return htmlfile,infos

if __name__=='__main__':
 infos=[]
 paths=[]
 for fname,pages in [('VoiceLog_声迹_产品白皮书_v1.1.md',True),('VoiceLog_声迹_参赛材料_v1.1.md',False),('VoiceLog_声迹_交互与状态规格_v1.1.md',False),('VoiceLog_声迹_比赛讲解与现场操作词_v1.1.md',False)]:
  path,i=build(R/'docs'/fname,pages);paths.append(path);infos+=i
 (R/'reports/diagram_build.json').write_text(json.dumps({'diagrams':infos,'count':len(infos)},ensure_ascii=False,indent=2))
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for path in paths:
   page=browser.new_page(viewport={'width':1000,'height':900});page.set_content(path.read_text(),wait_until='load');page.emulate_media(media='print');page.wait_for_timeout(100)
   page.pdf(path=str(path.with_suffix('.pdf')),format='A4',print_background=True,prefer_css_page_size=True,display_header_footer=True,header_template='<span></span>',footer_template='<div style="font-size:8px;color:#899580;width:100%;text-align:right;padding:0 45px;"><span>VoiceLog / 声迹　</span><span class="pageNumber"></span> / <span class="totalPages"></span></div>')
   print(path.name,len(page.content()));page.close()
  browser.close()
 print('diagrams',len(infos))
