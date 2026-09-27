/* Optional in-app walkthrough. It never writes application data. */
(() => {
  const chapters=VOICELOG_DEMO.chapters;
  const steps=chapters.flatMap((chapter,chapterIndex)=>chapter.steps.map((step,localIndex)=>({...step,chapter,chapterIndex,localIndex})));
  const firstIndex=id=>steps.findIndex(step=>step.chapter.id===id);
  const state={active:false,manual:false,locked:false,exiting:false,recovering:false,automation:false,playing:false,ended:false,step:0,timer:null,token:0,speed:VOICELOG_DEMO.defaultSpeed,autoResume:true};
  const phone=document.querySelector('#phone');
  let board=null,headerBar=null,focusRing=null,idleTimer=null,lastHumanSignal=0;

  function clearTimers(){clearTimeout(idleTimer);idleTimer=null}
  function invalidate(){state.token++;clearTimers();clearFocus()}
  function updateUrl(enabled){const url=new URL(location.href);if(enabled)url.searchParams.set('demo','1');else{url.searchParams.delete('demo');url.searchParams.delete('kiosk')}history.replaceState(null,'',url)}
  function clearFocus(){if(focusRing)focusRing.hidden=true}
  function shell(){
    if(board)return;
    document.body.classList.add('demo-presentation');
    headerBar=document.createElement('header');headerBar.className='demo-topbar';
    headerBar.innerHTML=`<div class="demo-wordmark"><span class="demo-mark">∿</span><strong>VoiceLog <small>声迹</small></strong><span class="demo-top-label">交互演示</span></div><div class="demo-top-actions"><span class="demo-offline">离线示例 · 全程可接手</span><button type="button" data-demo-action="fullscreen">全屏观看</button><button type="button" data-demo-action="close">退出演示</button></div>`;
    document.body.prepend(headerBar);
    board=document.createElement('aside');board.id='demo-board';board.setAttribute('aria-label','一键演示讲解面板');
    document.querySelector('.stage').append(board);
    focusRing=document.createElement('div');focusRing.className='demo-focus';focusRing.hidden=true;phone.append(focusRing);
    renderBoard();
  }
  function renderBoard(){
    if(!board)return;
    const current=steps[Math.min(state.step,steps.length-1)],index=current?.chapterIndex??0;
    const progress=state.ended?100:Math.round(100*state.step/steps.length);
    const label=state.manual?'手动体验中':state.playing?'正在演示':state.ended?'演示结束':'已暂停';
    const main=state.ended?'再播一遍':state.manual?'继续演示':state.playing?'暂停演示':'开始演示';
    board.innerHTML=`<div class="demo-board-top"><span class="demo-eyebrow">声迹 · 一键演示</span><span class="demo-count">${String(index+1).padStart(2,'0')} / ${String(chapters.length).padStart(2,'0')}</span><span class="demo-status ${state.playing?'playing':''}"><i></i>${label}</span></div><div class="demo-story"><span class="demo-chapter-no">CHAPTER ${String(index+1).padStart(2,'0')}</span><h2>${esc(state.ended?'演示已完成':current?.title||'从这一天开始')}</h2><p>${esc(state.ended?'点击左侧任意功能继续体验，或再播一遍完整路径。':current?.copy||'沿时间线，走到人物、原话、关联与安排。')}</p></div><div class="demo-route"><span>演示路线</span><strong>${chapters.map((c,i)=>i===index?`<em>${esc(c.name)}</em>`:esc(c.name)).join('<b> / </b>')}</strong></div><div class="demo-progress" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100" aria-label="演示进度"><i style="width:${progress}%"></i></div><div class="demo-controls"><button type="button" class="demo-secondary" data-demo-action="previous" aria-label="上一步">←</button><button type="button" class="demo-primary" data-demo-action="toggle">${state.playing?'Ⅱ':'▶'}　${main}</button><button type="button" class="demo-secondary" data-demo-action="next" aria-label="下一步">→</button><button type="button" class="demo-speed" data-demo-action="speed" aria-label="切换演示速度">${state.speed}×</button></div><div class="demo-chapter-head"><span>快速跳到</span><span>点击章节直达</span></div><div class="demo-chapters">${chapters.map((c,i)=>`<button type="button" data-demo-action="chapter" data-chapter="${c.id}" class="${i===index?'active':''}" aria-pressed="${i===index}"><small>${String(i+1).padStart(2,'0')}</small>${esc(c.short)}</button>`).join('')}</div><div class="demo-board-foot"><span>${state.manual?'正在手动体验，停下 12 秒后继续当前讲解。':'可以随时触碰手机，自由体验当前功能。'}</span><button type="button" data-demo-action="auto-resume" aria-pressed="${state.autoResume}">${state.autoResume?'自动续播 开':'自动续播 关'}</button></div>`;
  }
  function open({play=false}={}){
    if(!state.active){state.active=true;state.ended=false;state.manual=false;state.playing=false;state.step=0;shell();updateUrl(true)}
    if(play)run(state.step);else renderBoard();
  }
  function close(){
    if(!state.active)return;
    state.exiting=true;invalidate();state.active=false;state.manual=false;state.playing=false;state.ended=false;
    if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
    board?.remove();headerBar?.remove();focusRing?.remove();board=headerBar=focusRing=null;
    document.body.classList.remove('demo-presentation');updateUrl(false);state.exiting=false;
  }
  function pause(manual=false){
    if(!state.active)return;
    invalidate();state.playing=false;state.manual=manual;renderBoard();if(manual)scheduleIdle();
  }
  function scheduleIdle(){
    clearTimeout(idleTimer);
    if(!state.autoResume||!state.manual)return;
    const token=state.token;
    idleTimer=setTimeout(()=>{if(!state.active||!state.manual||state.token!==token)return;state.recovering=true;run(state.step);state.recovering=false},VOICELOG_DEMO.idleMs);
  }
  function wait(ms,token){return new Promise(resolve=>{state.timer=setTimeout(()=>{state.timer=null;resolve(state.token===token)},ms)})}
  function ensureVisible(selector){
    if(!selector)return null;
    const element=phone.querySelector(selector);if(!element)return null;
    const rect=element.getBoundingClientRect(),pr=phone.getBoundingClientRect();
    if(rect.bottom>pr.bottom-100||rect.top<pr.top+83)element.scrollIntoView({block:'center',behavior:'smooth'});
    return element;
  }
  function focus(selector){
    const element=ensureVisible(selector);if(!element||!focusRing)return;
    const token=state.token;
    requestAnimationFrame(()=>setTimeout(()=>{
      if(!state.active||token!==state.token||!element.isConnected||!focusRing)return;
      const pr=phone.getBoundingClientRect(),r=element.getBoundingClientRect(),pad=5;
      const left=Math.max(5,r.left-pr.left-pad),top=Math.max(5,r.top-pr.top-pad);
      const right=Math.min(pr.width-5,r.right-pr.left+pad),bottom=Math.min(pr.height-5,r.bottom-pr.top+pad);
      if(right<=left||bottom<=top){clearFocus();return}
      Object.assign(focusRing.style,{left:left+'px',top:top+'px',width:(right-left)+'px',height:(bottom-top)+'px'});
      focusRing.hidden=false;
    },340));
  }
  function act(action){
    const a=action||{},kind=a.kind;
    state.automation=true;
    try{
      if(kind==='home'){leaveOverlays();S.date=DATA.dates[0];S.homeMode='time';S.groupFilter='全部';S.expandedBlock='b-am';dispatch('nav',{route:'home'})}
      else if(kind==='block'){leaveOverlays();S.route='home';S.homeMode='time';S.expandedBlock=a.id;render()}
      else if(kind==='episode')dispatch('episode',{id:a.id});
      else if(kind==='people'){leaveOverlays();S.date=DATA.dates[0];S.peopleWindow={startMinute:540,endMinute:660};S.focus=590;dispatch('desktop-people')}
      else if(kind==='people-time'){peopleViewController?.selectWindow(540);peopleViewController?.seek(a.minute)}
      else if(kind==='person')dispatch('person',{id:a.id});
      else if(kind==='person-tab')dispatch('person-tab',{tab:a.tab});
      else if(kind==='ref')dispatch('ref',{id:a.id});
      else if(kind==='close-sheet')closeSheet(true);
      else if(kind==='graph'){leaveOverlays();dispatch('open-full-graph',{scope:'all'})}
      else if(kind==='graph-select')getActiveGraph()?.select(a.id,true);
      else if(kind==='chat'){leaveOverlays();dispatch('nav',{route:'chat'});S.scope={kind:'date',id:DATA.dates[0]};render()}
      else if(kind==='chat-answer'){
        const result=answer(a.question,{kind:'date',id:DATA.dates[0]}),thread=document.querySelector('#chat-thread');
        if(thread){thread.innerHTML=`<article class="bubble user">${esc(a.question)}</article><article class="bubble assistant"><div class="author"><span class="tag">声迹</span><span>示例回答</span></div>${esc(result.text)}${result.refs.length?`<div class="citations">${result.refs.map((r,i)=>ref(r,two(i+1))).join('')}</div>`:''}</article>`;thread.scrollTop=thread.scrollHeight}
      }
      else if(kind==='calendar'){leaveOverlays();S.calendarDate=DATA.dates[1];S.calendarFilter='all';dispatch('calendar')}
      else if(kind==='calendar-filter')dispatch('calendar-filter',{filter:a.filter});
      else if(kind==='calendar-preview')dispatch('save-action',{id:a.id});
      else if(kind==='device'){leaveOverlays();dispatch('device')}
      else if(kind==='scenes'){leaveOverlays();dispatch('nav',{route:'scenes'})}
      else if(kind==='recap'){leaveOverlays();dispatch('recap')}
      else if(kind==='scroll')ensureVisible(a.selector);
      else throw new Error('未知演示动作: '+kind);
    } finally {state.automation=false}
  }
  async function run(start=state.step){
    if(!state.active)return;
    invalidate();const token=state.token;
    state.playing=true;state.manual=false;state.ended=false;
    for(let i=Math.max(0,Math.min(start,steps.length-1));i<steps.length;i++){
      if(token!==state.token||!state.active)return;
      state.step=i;const step=steps[i];renderBoard();
      try{act(step.action)}catch(error){console.error('演示步骤未完成',step,error);pause();toast('这一步暂时无法打开，可以手动继续。');return}
      focus(step.target);
      if(!await wait(Math.max(850,Math.round((step.hold||2300)/state.speed)),token))return;
    }
    if(token!==state.token||!state.active)return;
    state.playing=false;state.ended=true;clearFocus();renderBoard();
  }
  function jump(index,play=true){
    if(!state.active)open();
    invalidate();state.step=Math.max(0,Math.min(index,steps.length-1));state.manual=false;state.ended=false;
    if(play)run(state.step);else renderBoard();
  }
  function handleControl(button){
    const action=button.dataset.demoAction;
    if(action==='open'){open({play:true});return}
    if(action==='close'){close();return}
    if(action==='fullscreen'){if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else document.documentElement.requestFullscreen?.().catch(()=>toast('浏览器未允许全屏，可以继续在当前窗口观看。'));return}
    if(action==='toggle'){if(state.playing)pause();else if(state.ended)jump(0);else run(state.step);return}
    if(action==='previous'){jump(state.step-1);return}
    if(action==='next'){jump(state.step+1);return}
    if(action==='chapter'){jump(firstIndex(button.dataset.chapter));return}
    if(action==='speed'){const i=VOICELOG_DEMO.speeds.indexOf(state.speed);state.speed=VOICELOG_DEMO.speeds[(i+1)%VOICELOG_DEMO.speeds.length];renderBoard();return}
    if(action==='auto-resume'){state.autoResume=!state.autoResume;renderBoard();if(state.manual)scheduleIdle()}
  }
  document.addEventListener('click',event=>{const button=event.target.closest('[data-demo-action]');if(!button)return;event.preventDefault();event.stopImmediatePropagation();handleControl(button)},true);
  for(const type of ['pointerdown','touchstart','wheel','focusin','input','keydown'])document.addEventListener(type,event=>{
    if(!state.active||state.automation||!event.isTrusted||!phone.contains(event.target)||event.target.closest('[data-demo-action]'))return;
    if(type==='focusin'||type==='input'){if(performance.now()-lastHumanSignal>700)return}
    else lastHumanSignal=performance.now();
    if(state.manual){scheduleIdle();return}
    if(state.playing)pause(true);
  },{capture:true,passive:true});
  if(new URLSearchParams(location.search).get('demo')==='1'||new URLSearchParams(location.search).get('kiosk')==='1')open();
  window.VoiceLogDemo={get state(){return {...state}},get steps(){return steps},open,close,run,pause,jump};
})();
