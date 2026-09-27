from pathlib import Path
import base64
R=Path(__file__).resolve().parents[1]
product='data:image/webp;base64,'+base64.b64encode((R/'assets/soundcore_work_reference.webp').read_bytes()).decode()
parts=['app.js','glass.js','views.js','people.js','graph.js','overlays.js','bootstrap.js']
app='const PRODUCT='+repr(product)+';\n'+'\n'.join((R/'src'/p).read_text(encoding='utf-8') for p in parts)
t=(R/'src/index.template.html').read_text(encoding='utf-8')
for key,value in {'__CSS__':(R/'src/style.css').read_text(encoding='utf-8')+'\n'+(R/'src/style-refresh.css').read_text(encoding='utf-8'),'__VENDOR__':(R/'vendor/cytoscape-3.33.1.js').read_text(encoding='utf-8'),'__CORE__':(R/'src/core.js').read_text(encoding='utf-8'),'__DATA__':(R/'data/fixture.json').read_text(encoding='utf-8').replace('</','<\\/'),'__APP__':app,'__PRODUCT__':product}.items():t=t.replace(key,value)
assert '__VENDOR__' not in t
(R/'demo/VoiceLog_声迹_交互Demo.html').write_text(t,encoding='utf-8')
(R/'demo/index.html').write_text(t,encoding='utf-8')
(R/'src/assembled.js').write_text(app,encoding='utf-8')
print('Built',len(t.encode()),'bytes')
