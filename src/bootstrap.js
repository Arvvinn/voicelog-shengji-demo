/* Single delegate; input handlers attach to their own stable element. */
function getActiveGraph(){return fullGraphView||graphView}
function openRelated(scope,selected){S.graphScope=scope;openFullGraph(scope,selected);updateDesktopGuideActive()}
function leaveOverlays(){S.graphResume=null;if(S.graphFull)closeFullGraph();if(S.sheet)closeSheet(true)}
function selectedContext(){return S.route==='block'?{kind:'block',id:S.blockId}:currentGraphScope()}
function renderDesktopGuide(){
 const host=document.querySelector('.desktop-note');if(!host)return;
 const entries=[
  ['01','时间线','按真实时段回看这一天','desktop-timeline',''],
  ['02','人物交汇','上下滑动时间线，看谁在场','desktop-people',''],
  ['03','交流理解','候选解释与回应草稿','person','data-id="lin"'],
  ['04','原话与来源','核对出处并回到记录','ref','data-id="r-e02-2"'],
  ['05','日历与提醒','草稿确认、保存和导出','calendar',''],
  ['06','场景归纳','从一天进入具体场景','nav','data-route="scenes"'],
  ['07','关联记忆','拖动节点，追踪真实关系','open-full-graph','data-scope="all"'],
  ['08','有据对话','限定范围，回答附来源','nav','data-route="chat"'],
  ['09','录音豆','采集入口与设备状态','device',''],
  ['10','外观与玻璃','调节悬浮导航的质感','appearance',''],
  ['11','一天复盘','把今天留给明天','recap',''],
  ['12','真实区间计算','看重叠交流如何合并','learning',''],
  ['13','心情历程','区分感受与交流线索','mood',''],
  ['14','夜间声音','查看夜间预览的边界','sleep',''],
  ['15','记录与隐私','采集、保存与撤销','privacy','']
 ];
 const tile=([index,title,desc,act,attrs])=>`<button type="button" class="desktop-guide-item desktop-guide-tile" data-guide-index="${index}" data-act="${act}" ${attrs} aria-label="${title}：${desc}"><small>${index}</small><strong>${title}</strong><span aria-hidden="true">↗</span></button>`;
 const row=([index,title,desc,act,attrs])=>`<button type="button" class="desktop-guide-item desktop-guide-row" data-guide-index="${index}" data-act="${act}" ${attrs}><span class="desktop-guide-index">${index}</span><span class="desktop-guide-copy"><strong>${title}</strong><small>${desc}</small></span><span class="desktop-guide-arrow" aria-hidden="true">↗</span></button>`;
 host.innerHTML=`<div class="desktop-guide-topline"><span>声迹 · 功能直达</span><span>15 项入口</span></div><div class="desktop-guide-story"><span>EXPLORE 01—15</span><h2>从一天，看到下一步</h2><p>点击右侧功能，左边的应用会直接打开对应页面；也可以跟着演示走一遍。</p></div><button type="button" class="desktop-guide-product" data-act="device" aria-label="查看 Work 3200 录音豆"><img src="${PRODUCT}" alt="soundcore Work 3200 录音豆"><span class="desktop-guide-product-copy"><strong>Work 3200</strong><small>录音豆 · 采集入口在第一屏</small></span><span aria-hidden="true">↗</span></button><button type="button" class="desktop-demo-entry" data-demo-action="open"><span class="desktop-demo-play">▶</span><span><strong>一键演示</strong><small>约 50 秒 · 自动走过核心路径</small></span><span aria-hidden="true">→</span></button><nav class="desktop-guide-nav" aria-label="评委功能直达"><div class="desktop-guide-section"><strong>演示主线</strong><span>点击功能直达</span></div><div class="desktop-guide-grid">${entries.slice(0,9).map(tile).join('')}</div><div class="desktop-guide-section desktop-guide-section-more"><strong>继续探索</strong><span>10—15</span></div><div class="desktop-guide-list">${entries.slice(9).map(row).join('')}</div></nav><div class="desktop-guide-foot">离线示例 · 点击入口在左侧查看</div>`;
}
renderDesktopGuide();
function updateDesktopGuideActive(){
 const active=S.graphFull?'07':S.route==='home'?(S.homeMode==='people'?'02':'01'):{person:'03',calendar:'05',scenes:'06',relations:'07',chat:'08',device:'09',appearance:'10',recap:'11',learning:'12',mood:'13',sleep:'14',privacy:'15'}[S.route];
 document.querySelectorAll('.desktop-guide-item').forEach(el=>{const on=el.dataset.guideIndex===active;el.classList.toggle('active',on);el.setAttribute('aria-current',on?'page':'false')});
}
function animateBlock(id){const content=$('#content'),old=document.querySelector(`[data-block="${id}"]`),oldY=old?.getBoundingClientRect().top;S.expandedBlock=S.expandedBlock===id?null:id;const scroll=content.scrollTop;render();const next=document.querySelector(`[data-block="${id}"]`);if(next&&oldY!=null)content.scrollTop=scroll+next.getBoundingClientRect().top-oldY;const bd=next?.querySelector('.block-body');if(bd&&!reduced())bd.animate([{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'translateY(0)'}],{duration:200,easing:'cubic-bezier(.23,1,.32,1)'})}
function copyText(text){if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(text).then(()=>toast('已复制，未发送。')).catch(()=>fallback());return fallback();function fallback(){const t=document.createElement('textarea');t.value=text;t.style.cssText='position:fixed;left:-9999px';document.body.append(t);t.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}t.remove();toast(ok?'已复制，未发送。':'可以选中并复制草稿文字。')}}
function startRecording(){if(S.record==='idle'){if(!S.connected){openSheet('record');toast('设备状态待核实，先连接录音豆。');return}S.record='recording';S.recordSeconds=0;S.recordMarks=[];S.recordNote='';clearInterval(S.recordTimer);S.recordTimer=setInterval(()=>{if(S.record==='recording'){S.recordSeconds++;let el=$('#record-clock');if(el)el.textContent=clock(S.recordSeconds)}},1000)}openSheet('record');header()}
function stopRecording(){if(!['recording','paused'].includes(S.record))return;S.recordNote=$('#record-note')?.value||S.recordNote||'';clearInterval(S.recordTimer);S.record='syncing';renderSheet();setTimeout(()=>{S.record='idle';const id='manual-'+Date.now(),date=S.date==='all'?DATA.dates[0]:S.date;let n=DATA.episodes.filter(e=>e.id.startsWith('manual-')&&e.date===date).length;let start=1265+n*2,end=start+1;let e={id,date,start:`${date}T${minuteText(start)}:00+08:00`,end:`${date}T${minuteText(end)}:00+08:00`,kind:'reflection',domain:'生活',projectId:'voicelog-day',title:'随手记',shortTitle:'随手记',summary:S.recordNote.trim()||'记录控制体验',participants:[],segments:[],items:S.recordNote.trim()?[S.recordNote.trim()]:[],source:'manual_note',status:'ready',revision:1,sound:{status:'not_collected',label:'未采集音频',events:[]},public:true};DATA.episodes.push(e);let block=DATA.blocks.find(x=>x.id==='b-notes-'+date);if(!block){block={id:'b-notes-'+date,date,start:minuteText(start),end:minuteText(end),scene:'生活',title:'晚间 · 随手记',label:'本人笔记',summary:'刚刚留下的内容',tone:'cream',events:[]};DATA.blocks.push(block)}block.end=minuteText(end);block.events.push(id);persist();closeSheet(true);S.route='home';S.homeMode='time';S.expandedBlock=block.id;render();requestAnimationFrame(()=>document.querySelector(`[data-block="${block.id}"]`)?.scrollIntoView({block:'center',behavior:reduced()?'auto':'smooth'}));toast('本人笔记已保存。演示操作未生成音频。')},450)}
function graphNavigate(action,id){const g=getActiveGraph(),n=g?.g.nodes.find(n=>n.id===id);let scope=n?.episodeId?{kind:'episode',id:n.episodeId}:n?.blockId?{kind:'block',id:n.blockId}:n?.personId?{kind:'person',id:n.personId}:clone(g?.scope||S.graphScope);leaveOverlays();if(action==='chat'){navigate('chat',{scope});return}if(action==='episode')navigate('episode',{selectedEpisode:id,recordTab:'记录'});else if(action==='person')navigate('person',{person:id});}
function dispatch(act,d={}){
 switch(act){
 case 'tour-open':window.VoiceLogDemo?.open({play:true});return;
 case 'desktop-timeline':leaveOverlays();S.route='home';S.homeMode='time';S.stack=[];render();$('#content').scrollTop=0;return;
 case 'nav':leaveOverlays();S.stack=[];S.route=d.route;S.tab='总览';if(d.route==='chat')S.scope=S.date==='all'?{kind:'all'}:{kind:'date',id:S.date};render();$('#content').scrollTop=0;return;
 case 'back':return back();case 'close-sheet':return closeSheet();
 case 'date':if(S.sheet?.kind==='date-picker')closeSheet(true);S.date=d.date;S.peopleDate=d.date==='all'?DATA.dates[0]:d.date;S.expandedBlock=d.date===DATA.dates[1]?'b-day2':'b-am';S.peopleOrder=[];render();$('#content').scrollTop=0;return;
 case 'date-picker':return openSheet('date-picker');
 case 'home-mode':S.scrollMemory[S.homeMode]=$('#content').scrollTop;S.homeMode=d.mode;render();$('#content').scrollTop=S.scrollMemory[d.mode]||0;return;
 case 'toggle-block':return animateBlock(d.id);
 case 'group-filter':S.groupFilter=d.filter;render();return;
 case 'block-detail':return navigate('block',{blockId:d.id});
 case 'ask-block':return navigate('chat',{scope:{kind:'block',id:d.id}});
 case 'episode':leaveOverlays();return navigate('episode',{selectedEpisode:d.id,recordTab:'记录',highlight:null});
 case 'person':leaveOverlays();S.analysisId=null;S.personTab='理解';return navigate('person',{person:d.id});
 case 'mood':return navigate('mood');
 case 'appearance':return navigate('appearance');
 case 'relations':return navigate('relations',{graphScope:S.date==='all'?{kind:'all'}:{kind:'date',id:S.date},table:false});
 case 'desktop-people':leaveOverlays();S.route='home';S.homeMode='people';S.stack=[];render();return;
 case 'people-stable':S.peopleStable=!S.peopleStable;render();return;
 case 'people-window-menu':return openSheet('people-window');
 case 'people-window-step':return peopleViewController?.stepWindow(+d.step);
 case 'people-window-set':{const start=+d.start;closeSheet(true);peopleViewController?.selectWindow(start);return}
 case 'all-people':return openSheet('all-people');
 case 'people-pin':S.peoplePin=S.peoplePin===d.id?null:d.id;closeSheet(true);if(S.route==='home'&&S.homeMode==='people'){peopleViewController?.update(S.focus,true);render()}else{S.route='home';S.homeMode='people';render()}return;
 case 'people-unpin':S.peoplePin=null;closeSheet(true);render();return;
 case 'encounter':return openSheet('encounter',d);
 case 'encounter-record':leaveOverlays();return navigate('episode',{selectedEpisode:d.id,recordTab:'记录'});
 case 'encounter-person':leaveOverlays();return navigate('person',{person:d.id});
 case 'analysis-episode':{let a=DATA.interpretations.find(a=>a.episodeId===d.id);if(a){S.personTab='理解';return navigate('person',{person:a.personId,analysisId:a.id})}return navigate('chat',{scope:{kind:'episode',id:d.id}})}
 case 'analysis-select':{const a=DATA.interpretations.find(a=>a.id===d.id);if(!a)return;S.analysisId=a.id;S.personTab='理解';render();$('#content').scrollTop=0;return}
 case 'person-graph':return openRelated({kind:'person',id:S.person},'p-'+S.person);
 case 'open-full-graph':return openRelated(d.scopeJson?JSON.parse(d.scopeJson):d.scope==='all'?{kind:'all'}:selectedContext(),d.id);
 case 'close-full-graph':return closeFullGraph();
 case 'chat-graph':return openRelated(clone(S.scope));
 case 'graph-view':S.table=d.table==='1';render();return;
 case 'graph-table-node':return openRelated(clone(S.graphScope),d.id);
 case 'graph-select':{const g=getActiveGraph();if(!g)return;if(g.kind!=='all'){g.kind='all';g.renderData(false);document.querySelectorAll('[data-act="graph-kind"]').forEach(el=>el.classList.toggle('active',el.dataset.kind==='all'))}g.select(d.id,true);const result=$('#graph-search-results');if(result)result.innerHTML='';return}
 case 'graph-expand':return getActiveGraph()?.expand(d.id);
 case 'graph-clear':return getActiveGraph()?.clear();
 case 'graph-focus':return getActiveGraph()?.focus();
 case 'graph-fit':return getActiveGraph()?.fit();
 case 'graph-zoom':return getActiveGraph()?.zoomBy(+d.factor);
 case 'graph-sources':return getActiveGraph()?.toggleSources();
 case 'graph-kind':document.querySelectorAll('[data-act="graph-kind"]').forEach(el=>el.classList.toggle('active',el.dataset.kind===d.kind));return getActiveGraph()?.filter(d.kind);
 case 'graph-access-list':return openSheet('graph-list',{scope:clone(getActiveGraph()?.scope||S.graphScope)});
 case 'list-graph-node':{if(S.graphResume)S.graphResume.selected=d.id;closeSheet(true);if(!S.graphFull)openRelated(clone(S.graphScope),d.id);else fullGraphView.select(d.id,true);return}
 case 'graph-ask':return graphNavigate('chat',d.id);
 case 'graph-record':return graphNavigate('episode',d.id);
 case 'graph-person':return graphNavigate('person',d.id);
 case 'ref':return openSheet('ref',{id:d.id});
 case 'source-record':leaveOverlays();navigate('episode',{selectedEpisode:d.id,recordTab:'记录',highlight:d.segment});requestAnimationFrame(()=>document.querySelector(`[data-segment="${d.segment}"]`)?.scrollIntoView({block:'center',behavior:reduced()?'auto':'smooth'}));return;
 case 'correct':return openSheet('correct',{id:d.id,segment:d.segment});
 case 'history':return openSheet('history',{id:d.id,segment:d.segment});
 case 'confirm-correction':{let text=$('#correction-text')?.value||'';try{C.correctSegment(DATA,d.id,d.segment,text);persist();closeSheet();if(!S.sheet)render();toast('已保存新版本，相关整理待更新。')}catch(e){toast(e.message)}return}
 case 'restore-transcript':{const seg=episode(d.id)?.segments.find(s=>s.id===d.segment),h=seg?.history?.find(h=>h.revision===+d.revision);if(h){C.correctSegment(DATA,d.id,d.segment,h.text);persist();renderSheet();toast('已保存为新版本，历史仍保留。')}return}
 case 'bind-audio':return bindAudio(d.id);
 case 'photo':return addPhoto(d.id);
 case 'remove-photo':store.photos=(store.photos||[]).filter(p=>p.id!==d.id);persist();render();return;
 case 'sound-detail':return navigate('episode',{selectedEpisode:d.id,recordTab:'声音'});
 case 'sound-source':return openSheet('sound-source',{id:d.id,start:+d.start,end:+d.end});
 case 'delete-record':return openSheet('delete-record',{id:d.id});
 case 'confirm-delete-record':{let e=episode(d.id);if(e)e.deleted=true;for(const a of DATA.actions){if(DATA.refs.find(r=>r.id===a.sourceRef)?.recordingId===d.id){if(a.status==='saved_demo')a.changeSuggested=true;else if(a.kind!=='wish')a.status='stale'}}persist();leaveOverlays();S.route='home';render();toast('本机记录已删除。');return}
 case 'refresh-analysis':toast('已保留修订。此离线版未连接重新分析服务。');return;
 case 'dream-note':return openSheet('dream-note',{id:'e11'});
 case 'note':return openSheet('note',{id:d.id});
 case 'save-note':{let t=$('#note-text').value.trim();if(!t){toast('写一点想留下的内容。');return}store.notes.push({id:'note-'+Date.now(),episodeId:d.id,text:t});persist();closeSheet(true);render();toast('本人笔记已保存。');return}
 case 'select-candidate':store.candidateChoices??={};store.candidateChoices[d.analysis]=store.candidateChoices[d.analysis]===d.id?null:d.id;if(store.candidateChoices[d.analysis])store.rejectedCandidates=(store.rejectedCandidates||[]).filter(x=>x!==d.analysis+':'+d.id);persist();render();return;
 case 'reject-candidate':{let k=d.analysis+':'+d.id;store.rejectedCandidates??=[];if(store.rejectedCandidates.includes(k))store.rejectedCandidates=store.rejectedCandidates.filter(x=>x!==k);else store.rejectedCandidates.push(k);if(store.candidateChoices?.[d.analysis]===d.id)store.candidateChoices[d.analysis]=null;persist();render();return}
 case 'candidate-reply':return openSheet('reply',{analysis:d.analysis,candidate:d.id});
 case 'copy-reply':case 'copy-person-reply':return copyText($('#person-reply-text')?.value||$('#reply-text')?.value||'');
 case 'save-reply':case 'save-person-reply':{const input=$('#person-reply-text')||$('#reply-text'),text=input?.value.trim()||'',key=d.replyKey||input?.dataset.replyKey||'';if(!text)return toast('草稿为空');if(key){store.replyDrafts??={};store.replyDrafts[key]=text}store.notes.push({id:'reply-'+Date.now(),episodeId:d.episode||analysisForPerson(S.person)?.episodeId||'',personId:d.person||S.person,text,kind:'reply_draft'});persist();if(S.sheet)closeSheet(true);else render();toast('已留下待回复草稿。');return}
 case 'person-tab':S.personTab=d.tab;render();$('#content').scrollTop=0;return;
 case 'mood-new':return openSheet('mood-edit');
 case 'mood-edit':return openSheet('mood-edit',{id:d.id});
 case 'mood-dismiss':store.dismissedMoods??=[];store.dismissedMoods.push(d.id);persist();render();toast('已移除这条候选。');return;
 case 'save-mood':{const label=$('#mood-label').value.trim(),note=$('#mood-note').value.trim(),time=$('#mood-time').value;if(!label||!time)return toast('补充一句感受和时间。');if(d.id){store.moodEdits??={};store.moodEdits[d.id]={label,note};const m=DATA.moods.find(m=>m.id===d.id);if(m)m.time=time}else DATA.moods.push({id:'m-'+Date.now(),date:S.date==='all'?DATA.dates[0]:S.date,time,label,note,basis:'user_report'});DATA.moods.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));persist();closeSheet(true);render();return}
 case 'record':return startRecording();
 case 'pause-record':if(S.record==='recording')S.record='paused';else if(S.record==='paused')S.record='recording';rememberSheetInputs();renderSheet();header();return;
 case 'mark-record':if(S.record==='recording'){S.recordMarks??=[];S.recordMarks.push(S.recordSeconds);const m=$('#record-marks');if(m)m.textContent=`${S.recordMarks.length} 个重点 · ${clock(S.recordSeconds)}`;toast('重点已标记（演示）')}return;
 case 'stop-record':return stopRecording();
 case 'voice-pause':S.voice=S.voice==='paused'?'listening':'paused';return renderSheet();
 case 'voice-sample':S.voice='replying';renderSheet();clearTimeout(voiceTimer);voiceTimer=setTimeout(()=>{closeSheet(true);if(S.route!=='chat')navigate('chat');sendQuestion('明天有什么安排？')},700);return;
 case 'voice-interrupt':clearTimeout(voiceTimer);closeSheet(true);$('#chat-input')?.focus();return;
 case 'set-scope':S.scope={kind:d.kind,id:d.id};closeSheet(true);render();return;
 case 'calendar-day':S.calendarDay=+d.day;render();return;
 case 'calendar-date':S.calendarDate=d.date;S.calendarMonthOpen=false;store.calendarDate=d.date;persist();render();$('#content').scrollTop=0;return;
 case 'calendar-month-toggle':S.calendarMonthOpen=!S.calendarMonthOpen;render();return;
 case 'calendar-month-step':{const old=dateAtNoon(S.calendarDate||DATA.dates[1]),day=old.getDate();old.setDate(1);old.setMonth(old.getMonth()+(+d.step));const last=new Date(old.getFullYear(),old.getMonth()+1,0).getDate();old.setDate(Math.min(day,last));S.calendarDate=isoDate(old);S.calendarMonthOpen=false;store.calendarDate=S.calendarDate;persist();render();$('#content').scrollTop=0;return}
 case 'calendar-filter':S.calendarFilter=d.filter;render();$('#content').scrollTop=0;return;
 case 'calendar-more':return openSheet('calendar-more');
 case 'ics-select':return openSheet('ics-select');
 case 'action-history':return openSheet('action-history');
 case 'save-action':return openSheet('action-confirm',{id:d.id});
 case 'confirm-action':{const a=DATA.actions.find(a=>a.id===d.id),r=C.resolveRef(DATA,a.sourceRef);const v=C.saveAction(a,store.policy,{explicitConfirm:true,sourceStale:!r.ok||r.stale,conflict:C.conflicts(DATA,a).length>0},store.receipts);if(v.allowed){persist();closeSheet(true);render();toast('已存入本机日历。')}else toast(v.reason);return}
 case 'confirm-policy':{let until=$('#policy-until').value;if(!until)return toast('选择规则有效期。');store.policy={enabled:$('#policy-enable').checked,selfOnly:true,allowEvents:true,until:until+'T23:59:59+08:00'};let count=0;if(store.policy.enabled)for(const a of DATA.actions){let r=C.resolveRef(DATA,a.sourceRef);if(C.saveAction(a,store.policy,{sourceStale:!r.ok||r.stale,conflict:C.conflicts(DATA,a).length>0},store.receipts).allowed)count++}persist();closeSheet(true);render();toast(store.policy.enabled?`已开启；${count} 项安排存入本机日历。`:'自动规则已关闭。');return}
 case 'update-action':{const a=DATA.actions.find(a=>a.id===d.id),title=$('#act-title').value.trim(),date=$('#act-date').value,time=$('#act-time').value,duration=+$('#act-duration').value;if(!title||!date||!duration||duration<5||duration>1440)return toast('请核对标题、日期和时长。');a.title=title;a.date=date;a.time=time||null;a.duration=duration;a.status=time?'draft':'needs_details';a.contentRevision=(a.contentRevision||1)+1;a.userEdited=true;a.changeSuggested=false;let rr=C.resolveRef(DATA,a.sourceRef);if(rr.ok&&rr.stale){let nr={...clone(rr.ref),id:rr.ref.id+'-v'+rr.segment.revision,transcriptRevision:rr.segment.revision,text:rr.segment.text};if(!DATA.refs.some(r=>r.id===nr.id))DATA.refs.push(nr);a.sourceRef=nr.id}persist();closeSheet(true);render();toast('草稿已更新。');return}
 case 'ics':{const a=DATA.actions.find(a=>a.id===d.id);if(a.status!=='saved_demo')return toast('先确认这项安排。');download('VoiceLog_'+a.id+'.ics',C.icsEvent(a),'text/calendar;charset=utf-8');toast('已导出 ICS；在系统日历中导入即可。');return}
 case 'wish':store.savedWish=true;persist();toast('愿望已留在便签里。');return;
 case 'memory':return openSheet('memory');
 case 'save-memory':store.preference=$('#memory-text').value.trim();persist();closeSheet(true);render();toast('偏好已更新。');return;
 case 'learning-answer':S.learningFeedback=d.answer==='correct'?'对，两个区间首尾相接，合并后是 22 分钟。':'可以拖到第 12 分钟看一看：A 结束时 B 刚开始。';render();return;
 case 'ablation':S.ablation=d.mode;closeSheet(true);S.route='home';S.homeMode='time';render();return;
 case 'confirm-reset':S.graphResume=null;audios.forEach(a=>URL.revokeObjectURL(a.url));audios.clear();return legacyDispatch(act,d);
 default:return legacyDispatch(act,d);
 }
}
function addPhoto(id){const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.onchange=()=>{const f=inp.files[0];if(!f)return;if(f.size>4*1024*1024)return toast('请选择 4 MB 以内的图片。');const r=new FileReader();r.onload=()=>{store.photos??=[];store.photos.push({id:'photo-'+Date.now(),episodeId:id,name:f.name,url:r.result});persist();render();toast('照片已保存在本机。')};r.readAsDataURL(f)};inp.click()}
function wireLocalInputs(){
 const f=$('#chat-form');if(f){f.onsubmit=e=>{e.preventDefault();sendQuestion($('#chat-input').value)};f.onpointerdown=e=>{if(e.target.closest('button'))e.preventDefault()}};
 const inp=$('#chat-input');if(inp){const key=JSON.stringify(S.scope);inp.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();sendQuestion(inp.value)}};inp.oninput=()=>{inp.style.height='auto';inp.style.height=Math.min(inp.scrollHeight,120)+'px';store.chatDrafts??={};store.chatDrafts[key]=inp.value};inp.onfocus=()=>{S.inputFocusHeight=window.visualViewport?.height||innerHeight};inp.onblur=()=>{document.body.classList.remove('kbd-open');if(store.chatDrafts?.[key])persist()}}
 const reply=$('#person-reply-text')||$('#reply-text');if(reply)reply.oninput=()=>{const key=reply.dataset.replyKey;if(!key)return;store.replyDrafts??={};store.replyDrafts[key]=reply.value;clearTimeout(S.replyPersistTimer);S.replyPersistTimer=setTimeout(persist,180)};
 const glassRange=$('#glass-range');if(glassRange){glassRange.oninput=e=>applyGlassLevel(+e.target.value);glassRange.onchange=()=>persist()}
 const learn=$('#interval-range');if(learn)learn.oninput=e=>{S.intervalShift=+e.target.value;const h=$('#content'),y=h.scrollTop;h.innerHTML=learningPage();h.scrollTop=y;wireLocalInputs();$('#interval-range')?.focus({preventScroll:true})};
 const si=$('#search-input');if(si)si.oninput=e=>{S.search=e.target.value;const pos=si.selectionStart;$('#content').innerHTML=searchPage();wireLocalInputs();const input=$('#search-input');input.focus({preventScroll:true});try{input.setSelectionRange(pos,pos)}catch(_){}};
 const audio=$('#content #bound-audio');if(audio){playingAudio=audio;if(S.highlight){const e=episode(S.selectedEpisode),seg=e?.segments.find(s=>s.id===S.highlight);if(seg){const seek=()=>{if(seg.start_ms/1000<audio.duration)audio.currentTime=seg.start_ms/1000};audio.addEventListener('loadedmetadata',seek,{once:true})}}}
}
document.addEventListener('click',e=>{const btn=e.target.closest('[data-act]');if(btn&&!btn.disabled){e.preventDefault();dispatch(btn.dataset.act,{...btn.dataset});return}if(e.target.matches('[data-mask]'))closeSheet()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(S.sheet){e.preventDefault();closeSheet()}else if(S.graphFull){e.preventDefault();closeFullGraph()}}if(e.key==='Tab'&&(S.sheet||S.graphFull)){const root=S.sheet?$('#overlays .sheet'):$('#graph-overlay');const nodes=[...root.querySelectorAll('button,input,textarea,select,[tabindex="0"]')].filter(el=>!el.disabled&&!el.hidden&&el.getClientRects().length);if(nodes.length){const first=nodes[0],last=nodes.at(-1),active=document.activeElement;if(active===root){e.preventDefault();(e.shiftKey?last:first).focus()}else if(e.shiftKey&&active===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&active===last){e.preventDefault();first.focus()}}}});
// Swipe changes only the overview mode, never steals a graph or input gesture.
let swipeStart=null;$('#content').addEventListener('touchstart',e=>{if(S.route==='home'&&!e.target.closest('button,input,textarea,[data-graph-preview],.enc-card'))swipeStart={x:e.touches[0].clientX,y:e.touches[0].clientY};else swipeStart=null},{passive:true});$('#content').addEventListener('touchend',e=>{if(!swipeStart)return;const dx=e.changedTouches[0].clientX-swipeStart.x,dy=e.changedTouches[0].clientY-swipeStart.y;swipeStart=null;if(Math.abs(dx)>95&&Math.abs(dy)<55){dispatch('home-mode',{mode:S.homeMode==='time'?'people':'time'})}},{passive:true});
window.visualViewport?.addEventListener('resize',()=>{const focused=document.activeElement?.id==='chat-input';document.body.classList.toggle('kbd-open',focused&&(window.visualViewport.height<(S.inputFocusHeight||innerHeight)-100))});
window.addEventListener('beforeunload',()=>{audios.forEach(a=>URL.revokeObjectURL(a.url));persist()});
render();
initLiquidGlass();
// Read-only/debug adapters used by reproducible local test scripts, no network calls.
window.VoiceLogTest={get data(){return DATA},get state(){return S},get store(){return store},dispatch,render,core:C,get graph(){return getActiveGraph()},get people(){return peopleViewController},scopeLabel};
