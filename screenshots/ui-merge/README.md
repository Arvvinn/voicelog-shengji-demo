# 融合 UI 浏览器截图

以下为玻璃质感视觉重做后，本机 Chromium 实际运行交互 Demo 的截图，不是整页生图。手机视口尺寸以 CSS 像素计，桌面图为 1440×960。完整截图集与自动化结果由 `tests/browser_test.py` 重新生成。

| 文件 | 状态 | 视口 |
| --- | --- | --- |
| [`01_home_nested.png`](01_home_nested.png) | 首页分块时间线 | 390×844 |
| [`home-bottom-390.png`](home-bottom-390.png) | 底部复盘入口完整露出，导航独立悬浮 | 390×844 |
| [`05_people_morning.png`](05_people_morning.png) | 固定头像和可上下滚动的全天人物轨道 | 390×844 |
| [`people-scroll-moved-390.png`](people-scroll-moved-390.png) | 纵向滑动后时间与人物状态更新 | 390×844 |
| [`06_people_afternoon.png`](06_people_afternoon.png) | 15:00—17:00，跨旧窗口的交流保持完整时长 | 390×844 |
| [`08_person_candidates.png`](08_person_candidates.png) | 人物交流理解与候选解释 | 390×844 |
| [`quote-source-390.png`](quote-source-390.png) | 引用原话与来源定位 | 390×844 |
| [`19_calendar.png`](19_calendar.png) | 草稿日历和分组 | 390×844 |
| [`calendar-confirm-390.png`](calendar-confirm-390.png) | 保存前确认面板 | 390×844 |
| [`scenes-centered-390.png`](scenes-centered-390.png) | 场景卡片图标居中 | 390×844 |
| [`me-device-first-390.png`](me-device-first-390.png) | 录音豆优先、外观设置后置、个人资料完整显示 | 390×844 |
| [`appearance-390.png`](appearance-390.png) | 可调玻璃强度与实时预览 | 390×844 |
| [`09_graph_focus.png`](09_graph_focus.png) | 手机画幅内可拖动缩放的关联图 | 390×844 |
| [`graph-linked-drag-390.png`](graph-linked-drag-390.png) | 拖动关系图节点时的连带位移 | 390×844 |
| [`graph-linked-motion.gif`](graph-linked-motion.gif) | 桌面关系图真实拖动帧 | 1440×960 |
| [`zoom-200-home.png`](zoom-200-home.png) | 放大重排首页 | 160 CSS px，DPR 2 |
| [`zoom-200-person.png`](zoom-200-person.png) | 放大重排人物理解页 | 160 CSS px，DPR 2 |
| [`zoom-200-quote.png`](zoom-200-quote.png) | 放大重排引用面板 | 160 CSS px，DPR 2 |
| [`zoom-200-calendar.png`](zoom-200-calendar.png) | 放大重排日历 | 160 CSS px，DPR 2 |
| [`29_desktop.png`](29_desktop.png) | 桌面首页和可滚动的十五项评委演示直达入口 | 1440×960 |
| [`30_graph_desktop.png`](30_graph_desktop.png) | 桌面点击后图谱仍在手机画幅内 | 1440×960 |
| [`graph-people-connected-desktop.png`](graph-people-connected-desktop.png) | 手机画幅中的人物筛选与真实参与关系 | 1440×960 |

各标准手机视口还包含人物页、原话面板及日历截图：`320_*`、`360_*`、`390_*`、`430_*`。动画检查见 [`people-motion.gif`](people-motion.gif)。
