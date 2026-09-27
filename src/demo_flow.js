/* One source of truth for the optional, local presentation. All steps use the live UI. */
const VOICELOG_DEMO = {
  speeds: [1, 1.35, 1.75, 2.25],
  defaultSpeed: 1.35,
  idleMs: 12000,
  chapters: [
    { id:'day', name:'我的一天', short:'时间线', summary:'先看一天的真实节奏，再展开一段记录。', steps:[
      { title:'从一天开始', copy:'声迹先把记录按真实时段收成一条时间线。每段都能展开，空白时间也如实保留。', action:{kind:'home'}, target:'.date-row', hold:2900 },
      { title:'展开上午', copy:'同一时段里的事情按发生顺序展开，不把上午压成一张摘要卡。', action:{kind:'block',id:'b-am'}, target:'[data-block="b-am"] .block-head', hold:2450 },
      { title:'打开这件事', copy:'从时间线进入完整记录，继续查看原话、人物和本次结果。', action:{kind:'episode',id:'e02'}, target:'.event-summary', hold:2600 }
    ]},
    { id:'people', name:'人物交汇', short:'人物', summary:'时间线仍是主体；上下滑动，人物随时间靠近。', steps:[
      { title:'切到人物交汇', copy:'按真实起止时间绘制交流区间；同一个人的重叠片段先合并。', action:{kind:'people'}, target:'.people-chart-card', hold:3000 },
      { title:'沿时间往下看', copy:'这根时间线可以上下滑动；移动到 09:50，看看此刻谁在交流。', action:{kind:'people-time',minute:590}, target:'.people-chart-card', hold:2550 },
      { title:'短交流也能找到', copy:'下方列表给短区间一个可靠入口，触碰色块也能打开当次交汇。', action:{kind:'scroll',selector:'.people-association-list'}, target:'.people-association-list', hold:2450 }
    ]},
    { id:'understand', name:'交流理解', short:'理解', summary:'每次交流分开理解，候选解释由人选择。', steps:[
      { title:'打开这次交流', copy:'人物身份保持稳定；理解只针对当次交流，不给人贴永久标签。', action:{kind:'person',id:'lin'}, target:'.encounter-hero', hold:2550 },
      { title:'先看他说了什么', copy:'上方保留当次原话，下方展示多种可能的解释。', action:{kind:'scroll',selector:'.analysis-quote-card'}, target:'.analysis-quote-card', hold:2650 },
      { title:'候选由你判断', copy:'解释卡附有引用。选择或否定都由用户决定，演示不会替你做选择。', action:{kind:'scroll',selector:'.candidate-card'}, target:'.candidate-card', hold:2600 }
    ]},
    { id:'source', name:'原话与来源', short:'原话', summary:'从分析打开原话，再回到完整记录。', steps:[
      { title:'查看来源原话', copy:'每条引用都能定位到对应的记录和原话版本。', action:{kind:'ref',id:'r-e08-1'}, target:'#overlays .transcript-line.selected', hold:2750 },
      { title:'返回交流', copy:'关闭来源后，仍回到刚才的交流理解位置。', action:{kind:'close-sheet'}, target:'.person-tabs', hold:2200 },
      { title:'打开原话页', copy:'完整转写逐句呈现；音频若未绑定，会如实标明。', action:{kind:'person-tab',tab:'原话'}, target:'.transcript-line', hold:2700 }
    ]},
    { id:'graph', name:'关联记忆', short:'关联', summary:'真实关系连成图；拖动节点会带动相邻节点。', steps:[
      { title:'进入关联记忆', copy:'人物、事件、要点、安排和来源由真实资料关系连接。', action:{kind:'graph'}, target:'#full-graph-canvas', hold:3350 },
      { title:'聚焦一个节点', copy:'点选节点后，右侧能继续查看相邻关系与对应资料。', action:{kind:'graph-select',id:'project'}, target:'#graph-inspector', hold:2850 },
      { title:'关系可以探索', copy:'图谱支持拖动、缩放和节点列表；拖动时相邻节点会一起响应。', action:{kind:'graph-select',id:'decision'}, target:'#full-graph-canvas', hold:2850 }
    ]},
    { id:'chat', name:'有据对话', short:'对话', summary:'提问有范围，回答附可点开的来源。', steps:[
      { title:'限定本次资料', copy:'对话顶部明确显示资料范围，不会悄悄跨出当前范围。', action:{kind:'chat'}, target:'.chat-head', hold:2350 },
      { title:'用原话回答', copy:'这条示例回答由本机资料生成，并附上能打开的引用。', action:{kind:'chat-answer',question:'今天的方向怎么改了？'}, target:'.bubble.assistant', hold:3200 }
    ]},
    { id:'calendar', name:'日历与提醒', short:'日历', summary:'草稿先核对，确认后才会成为本机安排。', steps:[
      { title:'安排仍是草稿', copy:'日历把待确认、本机已存和待补全分开；跨日事项也能找到。', action:{kind:'calendar'}, target:'.calendar-filters', hold:2700 },
      { title:'只看待确认', copy:'明确时间的安排先作为草稿出现，来源可随时核对。', action:{kind:'calendar-filter',filter:'pending'}, target:'.plan-card', hold:2700 },
      { title:'确认前再核对', copy:'确认面板再次展示时间、地点和来源。演示不会替你按下保存。', action:{kind:'calendar-preview',id:'a-sync'}, target:'#overlays .card.soft', hold:2850 }
    ]},
    { id:'device', name:'录音豆与场景', short:'采集', summary:'采集入口在前，场景把记录归纳起来。', steps:[
      { title:'录音豆在前', copy:'首页第一屏保留 Work 3200 状态与记录入口。', action:{kind:'home'}, target:'.device-record-row', hold:2400 },
      { title:'设备状态可见', copy:'设备页区分示例状态与真实采集，不会假装已经录到音频。', action:{kind:'device'}, target:'#content', hold:2450 },
      { title:'按场景回看', copy:'项目、协作、访谈和学习能从同一批记录进入。', action:{kind:'scenes'}, target:'.scene-list-card', hold:2550 }
    ]},
    { id:'recap', name:'回看与偏好', short:'复盘', summary:'把有来源的变化留下，再交给明天。', steps:[
      { title:'看今天的变化', copy:'复盘把决定、交流和待完成的事连起来，每一处仍可追溯。', action:{kind:'recap'}, target:'.card.lime', hold:2750 },
      { title:'最后仍由你掌控', copy:'演示到这里结束。你可以继续手动探索，或从左侧入口再播一遍。', action:{kind:'home'}, target:'.recap-link', hold:3100 }
    ]}
  ]
};
