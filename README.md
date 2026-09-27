# VoiceLog / 声迹 · 玻璃质感融合 UI Demo

本副本按已审定的融合方案完成，保留离线单HTML和原型数据模型。设计依据见 `../output/astra-ui-merge-plan-2026-09-27/`；实施结果、测试命令、哈希和边界见 `reports/ui-merge/ACCEPTANCE.md`。原始交付目录未修改，基线哈希记录见 `reports/MERGE_BASELINE.md`。

2026-09-27 的视觉重做沿用原型较克制的字号和信息密度。底部导航独立悬浮，边缘折射与高光由 `src/glass.js` 离线生成；“我的 → 外观与玻璃”可实时调节强度。人物交汇使用右侧触点带动横向时间线：按住时线条加粗，纵向拖动按真实分钟比例定位。时间线、人物解释、原话和日历的正文卡片保持实底，便于阅读。样式修改在 `src/style-refresh.css`，由 `src/build_demo.py` 与原有样式一起打包，不能只修改 `demo/` 内的生成 HTML。

围绕一天与多天的个人声音记录。重点：**场景时段内的多件事情、人物交汇、可探索且可回到原话的关系图**。

## 立即打开

公开演示地址：[voicelog-shengji-arvvinn.netlify.app](https://voicelog-shengji-arvvinn.netlify.app/)；源码与验收材料：[GitHub 仓库](https://github.com/Arvvinn/voicelog-shengji-demo)。这是 Netlify 正式站点地址，不是一次性预览链接。发布核验见 `reports/ui-merge/DEPLOYMENT.md`。

双击 `demo/VoiceLog_声迹_交互Demo.html`。这是一个自包含HTML，CSS、JavaScript、样例数据、图组件与实际产品图都在文件内，不依赖网络CDN、API Key或模型服务。

如果系统的文件预览器不执行JavaScript，请用浏览器打开；或运行 `python3 serve.py`，再访问终端显示的本机地址。macOS可双击 `启动预览.command`，Windows可运行 `启动预览.bat`。启动器只绑定本机回环地址，不向公网开放。

### 建议先点这一条

**总览 → 人物交汇选择15:00—17:00 → 打开评审交流 → 交流理解 → 原话 → 完整记录并返回 → 日历确认 → ICS导出。**

进入关系图后可以拖动背景、拖动节点、缩放、搜索、筛选人物/要点、展开原话节点，以及打开来源再返回。手机底部检查器、桌面右侧检查器使用同一份数据。键盘 `+/-/0` 与方向键提供替代操作。

## 三项主要重构

1. **首页分块。** 上午09:15—12:00是一块，内部有主线讨论、体验访谈、技术答疑；下午13:00—17:45另成一块，包含六件事情。工作与生活保持全天顺序，休息和未记录区间不被塞成工作成果。
2. **人物交汇。** 纵向时间、头像轨道、按当前时段平滑靠近。可搜索所有人物并固定到左侧；固定排列和减少动态效果保留替代操作。统计先求区间并集。
3. **关系图。** 使用离线 Cytoscape.js 真实图组件，替换固定示意。拖动节点时，连接节点与周围节点会跟随移动，松手后稳定；还支持局部/完整图、邻域强调、缩放、展开、搜索、来源与返回状态。

## 已运行与未连接

| 实际运行 | 当前预置/模拟 |
|---|---|
| 分块、过滤、日期、人物排序与过渡 | 示例日期/人物/话语；不是实际比赛评审或获奖 |
| 节点和边操作、查询范围、来源定位 | ASR、声纹、Jev与其他模型未接入 |
| 转写版本、笔记、照片与删除 | 设备连接、计时、标记与同步为演示状态 |
| 本机音频导入、真实播放器和时间跳转 | 示例语音讨论不启用麦克风 |
| 日历草稿、确认、冲突、撤销、ICS文件 | 本机演示日历，不写入外部服务 |
| 学习区间演示的确定性计算 | 睡眠仅UI预览，没有健康模型和健康数值 |

样例不附现场原音频，播放器会显示“原声未绑定”。可以绑定自己的合法本机文件，文件只在当前会话使用，关闭页面后需要重新绑定。不要拿不相符的文件冒充示例原话。

转写修订、笔记、候选选择及日历样例尝试保存在当前浏览器本地存储。浏览器不允许时仍能临时使用，但关闭页面会丢失修改；“我的→记录与隐私”可以导出当前数据。项目没有云同步和生产级账号/权限实现。

## 目录

- `demo/`：单HTML。
- `src/`：核心数据工具、页面、人物轨道、图组件、浮层与构建脚本。
- `data/fixture.json`：16段经历、8个时段块、两天演示资料与显式引用。
- `vendor/`：Cytoscape.js 3.33.1及MIT许可证，离线打包。
- `docs/`：白皮书、参赛材料、交互规格、讲解与操作词，含可编辑Markdown。
- `diagrams/`：12张Mermaid源码及同拓扑DOT/SVG/PNG渲染。
- `screenshots/index.html`：实际浏览器截图与动效浏览；不包含AI生图。
- `reports/`：测试、消融、修复、覆盖及发布核验记录。
- `tests/`：可重跑的确定性与浏览器检查。
- `MANIFEST.sha256`：包内文件校验清单。

## 修改与构建

修改 `src/` 或 `data/fixture.json` 后运行：

```sh
python -X utf8 src/build_demo.py
node tests/data_tests.js
python -X utf8 tests/browser_test.py
python -X utf8 tests/motion_layout_test.py
```

浏览器检查在本机临时HTTP服务上运行，使用真实浏览器 localStorage；测试报告和截图只写入 `reports/ui-merge/` 与 `screenshots/ui-merge/`。运行需要Python Playwright和Chromium。默认使用Playwright安装的Chromium；如需指定系统浏览器，可设置 `PLAYWRIGHT_CHROMIUM_EXECUTABLE`。界面使用操作系统中文字体，已在验收中记录实际命中的字体；交付包不包含字体文件。

文档构建需要Python mistune、Playwright、Graphviz；可编辑Word还需要python-docx与Pandoc。`python3 src/render_docs.py` 生成离线HTML/PDF；`python3 src/build_submission_docx.py` 生成参赛材料Word。Mermaid源码单独保留，离线文档里的矢量图由同拓扑Graphviz渲染，不伪装为原生Mermaid运行截图。

## 检查与范围

详见 `reports/ui-merge/ACCEPTANCE.md`、`browser_checks.json`、`data_checks.json`、`motion_layout_checks.json` 和 `font_rendering.json`。没有在真实iOS、Android、Safari或实体录音豆上验收；ASR与外部日历也未连接。

旧v1.0保持不动。本包不混入旧版医嘱主线、旧截图或未实现的健康结果。
