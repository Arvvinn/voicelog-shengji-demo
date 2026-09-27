"""Targeted motion, graph interaction, text bounds and stress checks on the offline UI."""
import asyncio,json,hashlib,io
from pathlib import Path
from playwright.async_api import async_playwright
from PIL import Image
from browser_support import ROOT as R, REPORT_DIR, SCREENSHOT_DIR, DemoHost, launch_options, ensure_output_dirs
HTML=(R/'demo/VoiceLog_声迹_交互Demo.html').read_text(encoding='utf-8');checks=[];errors=[]
async def main():
 ensure_output_dirs();host=DemoHost();host.start()
 async with async_playwright() as p:
  b=await p.chromium.launch(**launch_options())
  page=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
  page.on('pageerror',lambda e:errors.append(str(e)))
  await page.add_init_script("localStorage.setItem('voicelog-v11','legacy-demo-data-must-stay-untouched')")
  await page.goto(host.url,wait_until='load');await page.wait_for_timeout(150)
  async def e(s):return await page.evaluate(s)
  async def d(a,data={}):await page.evaluate('([a,d])=>VoiceLogTest.dispatch(a,d)',[a,data]);await page.wait_for_timeout(50)
  async def check(name,fn):
   try:
    value=await fn();assert value is not False;checks.append({'name':name,'passed':True,'detail':value});print('PASS',name,flush=True)
   except Exception as ex:checks.append({'name':name,'passed':False,'error':str(ex)});print('FAIL',name,str(ex),flush=True)
  async def body_overflow():return await e('document.documentElement.scrollWidth<=innerWidth+1')
  # Check natural-size text against its nearest bounded component. Ellipsis/clamp/virtual-world clipping are intentional.
  audit_js=r'''(()=>{const failures=[];const roots=document.querySelectorAll('.scene-block,.candidate-card,.card,.rowlink,.person-head,.enc-card,.pill,.fullbtn,.sheet');for(const root of roots){const rr=root.getBoundingClientRect();if(!rr.width||!rr.height||root.closest('[aria-hidden="true"]'))continue;if(root.closest('.person-lane.inactive'))continue;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let t;while(t=walker.nextNode()){if(!t.textContent.trim())continue;const el=t.parentElement,cs=getComputedStyle(el);if(cs.display==='none'||!el.getClientRects().length||el.closest('details:not([open])'))continue;let crop=false;for(let n=el;n&&n!==root.parentElement;n=n.parentElement){const s=getComputedStyle(n);if(s.textOverflow==='ellipsis'||(+s.webkitLineClamp>0)){crop=true;break}}if(crop)continue;const range=document.createRange();range.selectNodeContents(t);for(const tr of range.getClientRects()){if(tr.width&&tr.height&&(tr.left<rr.left-2||tr.right>rr.right+2||tr.top<rr.top-2||tr.bottom>rr.bottom+2)){failures.push({root:root.className,text:t.textContent.trim().slice(0,35),delta:[+(tr.left-rr.left).toFixed(1),+(tr.right-rr.right).toFixed(1),+(tr.bottom-rr.bottom).toFixed(1)]});break}}}}return failures.slice(0,20)})()'''
  async def audit():
   bad=await e(audit_js);assert not bad,json.dumps(bad,ensure_ascii=False);return {'clipped_text':len(bad)}
  for w,h in [(320,740),(390,844),(430,932)]:
   await page.set_viewport_size({'width':w,'height':h})
   for action,arg,label in [('nav',{'route':'home'},'home'),('toggle-block',{'id':'b-pm'},'afternoon'),('block-detail',{'id':'b-pm'},'block'),('person',{'id':'judge'},'judge'),('episode',{'id':'e15'},'record'),('recap',{},'recap'),('nav',{'route':'calendar'},'calendar'),('nav',{'route':'scenes'},'scenes'),('nav',{'route':'me'},'me'),('nav',{'route':'mood'},'mood')]:
    await d(action,arg)
    if label=='judge':await page.locator('.insufficient-card > summary').click()
    await check(f'{w}px {label} bounded text',audit);await check(f'{w}px {label} document width',body_overflow)
   await d('nav',{'route':'home'});await d('home-mode',{'mode':'people'});await e('VoiceLogTest.people.seek(1020)');await page.wait_for_timeout(350);await check(f'{w}px people card text bounds',audit)
  await page.set_viewport_size({'width':390,'height':844});await d('nav',{'route':'home'});await d('home-mode',{'mode':'people'});await e('VoiceLogTest.people.seek(570)');await page.wait_for_timeout(350)
  async def css_motion():return await e('parseFloat(getComputedStyle(document.querySelector("[data-person-head=guest]")).transitionDuration)>0')
  await check('people lane uses nonzero transform transition',css_motion)
  x0=await e('document.querySelector("[data-person-head=guest]").getBoundingClientRect().x')
  await e('VoiceLogTest.people.seek(650)');await page.wait_for_timeout(90)
  xmid=await e('document.querySelector("[data-person-head=guest]").getBoundingClientRect().x');await page.wait_for_timeout(300)
  x1=await e('document.querySelector("[data-person-head=guest]").getBoundingClientRect().x')
  async def moved():
   assert abs(x0-x1)>50 and abs(xmid-x0)>1 and abs(xmid-x1)>1, str((x0,xmid,x1));return {'start':x0,'middle':xmid,'end':x1}
  await check('people reorder passes through intermediate positions',moved)
  await e('VoiceLogTest.people.seek(650)');await page.wait_for_timeout(60);await e('VoiceLogTest.people.seek(600)');await page.wait_for_timeout(60);await e('VoiceLogTest.people.seek(650)');await page.wait_for_timeout(350)
  async def retarget():return await e('VoiceLogTest.people.order.indexOf("judge")>0&&new Set(VoiceLogTest.people.order).size===VoiceLogTest.people.order.length')
  await check('rapid time reversal settles without duplicate identities',retarget)
  # A real browser frame sequence, not generated graphics.
  frames=[]
  for target in [570,650,640]:
   await e(f'VoiceLogTest.people.seek({target})')
   for _ in range(7):
    await page.wait_for_timeout(55);frames.append(Image.open(io.BytesIO(await page.screenshot())).convert('RGB'))
  frames[0].save(SCREENSHOT_DIR/'people-motion.gif',save_all=True,append_images=frames[1:],duration=100,loop=0,optimize=True)
  await d('open-full-graph',{'scope':'all'});await page.wait_for_timeout(350)
  async def graph_hover():
   target=await e('VoiceLogTest.graph.cy.nodes().filter(n=>n.id()!==VoiceLogTest.graph.selected).filter(n=>{const p=n.renderedPosition();return p.x>30&&p.x<340&&p.y>110&&p.y<450})[0].id()')
   loc=await e(f'(()=>{{const n=VoiceLogTest.graph.cy.getElementById("{target}").renderedPosition(),r=document.querySelector("#full-graph-canvas").getBoundingClientRect();return {{x:r.x+n.x,y:r.y+n.y}}}})()')
   await page.mouse.move(loc['x'],loc['y']);await page.wait_for_timeout(170);return await e('VoiceLogTest.graph.cy.elements(".dim").length>0&&VoiceLogTest.graph.cy.nodes(".focal").length===1')
  await check('pointer hover highlights one neighborhood',graph_hover)
  async def graph_zoom():
   z=await e('VoiceLogTest.graph.cy.zoom()');await page.mouse.move(250,450);await page.mouse.wheel(0,-240);await page.wait_for_timeout(220);zz=await e('VoiceLogTest.graph.cy.zoom()');assert zz>z;return {'before':z,'after':zz}
  await check('mouse wheel changes graph zoom',graph_zoom)
  async def graph_filter():
   await d('graph-kind',{'kind':'person'});await page.wait_for_timeout(400);return await e('VoiceLogTest.graph.selected===null||VoiceLogTest.graph.cy.getElementById(VoiceLogTest.graph.selected).length>0')
  await check('filter removing selected node clears invalid focus',graph_filter)
  await d('graph-kind',{'kind':'all'});await d('graph-select',{'id':'decision'});await page.wait_for_timeout(300);await d('graph-expand',{'id':'decision'});await d('graph-fit');await d('graph-focus');await page.wait_for_timeout(700)
  await check('interrupted graph camera/expansion stays finite',lambda:e('Number.isFinite(VoiceLogTest.graph.cy.pan().x)&&Number.isFinite(VoiceLogTest.graph.cy.zoom())'))
  desktop=await b.new_page(viewport={'width':1440,'height':960},device_scale_factor=1)
  desktop.on('pageerror',lambda ex:errors.append(str(ex)))
  await desktop.goto(host.url,wait_until='load');await desktop.evaluate('VoiceLogTest.dispatch("open-full-graph",{scope:"all"})');await desktop.wait_for_timeout(450)
  await desktop.evaluate('VoiceLogTest.dispatch("graph-fit",{})');await desktop.wait_for_timeout(350)
  before=await desktop.evaluate('Object.fromEntries(VoiceLogTest.graph.cy.nodes().map(n=>[n.id(),{...n.position()}]))')
  position=await desktop.evaluate('(()=>{let n=VoiceLogTest.graph.cy.getElementById("decision"),r=document.querySelector("#full-graph-canvas").getBoundingClientRect(),p=n.renderedPosition();return {x:r.x+p.x,y:r.y+p.y}})()')
  await desktop.mouse.move(position['x'],position['y']);await desktop.mouse.down()
  graph_frames=[]
  for dx,dy in [(0,0),(14,-8),(29,-17),(45,-27),(61,-31),(72,-38),(80,-41)]:
   await desktop.mouse.move(position['x']+dx,position['y']+dy,steps=3);await desktop.wait_for_timeout(65)
   graph_frames.append(Image.open(io.BytesIO(await desktop.screenshot())).convert('RGB'))
  after=await desktop.evaluate('Object.fromEntries(VoiceLogTest.graph.cy.nodes().map(n=>[n.id(),{...n.position()}]))')
  async def linked_motion():
   moved=[key for key in before if key!='decision' and ((after[key]['x']-before[key]['x'])**2+(after[key]['y']-before[key]['y'])**2)**.5>1]
   assert len(moved)>len(before)/2, len(moved)
   return {'moving_followers':len(moved),'visible_nodes':len(before)}
  await check('desktop graph drag moves the surrounding cluster',linked_motion)
  await desktop.mouse.up()
  for _ in range(4):
   await desktop.wait_for_timeout(75);graph_frames.append(Image.open(io.BytesIO(await desktop.screenshot())).convert('RGB'))
  graph_frames[0].save(SCREENSHOT_DIR/'graph-linked-motion.gif',save_all=True,append_images=graph_frames[1:],duration=95,loop=0,optimize=True)
  await desktop.close()
  await page.emulate_media(reduced_motion='reduce');await d('close-full-graph');await d('home-mode',{'mode':'people'});await check('reduced motion CSS removes lane animation',lambda:e('parseFloat(getComputedStyle(document.querySelector("[data-person-head=judge]")).transitionDuration)<=0.01'))
  await d('nav',{'route':'home'});await d('open-full-graph',{'scope':'all'});await page.keyboard.press('+');await page.keyboard.press('ArrowRight');await page.keyboard.press('0');await page.wait_for_timeout(100);await check('graph keyboard navigation stays usable',lambda:e('VoiceLogTest.graph.cy.zoom()>0'))
  # text and graph query regression after source/decision change
  await d('close-full-graph');await d('ask-person',{'person':'judge'});await page.evaluate("VoiceLogTest.state.scope={kind:'person',id:'judge'}");await page.evaluate("sendQuestion('评审关心什么？')");await page.wait_for_function('!VoiceLogTest.state.questionBusy')
  await check('reviewer query uses reviewer citations, not Xiaolin',lambda:e('JSON.stringify(VoiceLogTest.store.messages.at(-1)).includes("r-e15-1")&&!JSON.stringify(VoiceLogTest.store.messages.at(-1)).includes("r-e08-1")'))
  await check('all targeted interactions have no runtime error',lambda:async_bool(not errors))
  browser_version=b.version;await b.close()
 host.close()
 report={'browser_version':browser_version,'passed':sum(x['passed'] for x in checks),'failed':sum(not x['passed'] for x in checks),'checks':checks,'errors':errors,'limitations':'Chromium viewport simulation; no physical touchscreen / Safari / live models. Intentional ellipsis and virtual graph/lane clipping excluded from text audit.','html_sha256':hashlib.sha256(HTML.encode()).hexdigest()};(REPORT_DIR/'motion_layout_checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print('QA',report['passed'],report['failed'],errors)
async def async_bool(x):return x
asyncio.run(main())
