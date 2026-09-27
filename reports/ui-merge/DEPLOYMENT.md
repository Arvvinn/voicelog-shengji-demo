# 公开演示发布记录

日期：2026-09-27

- GitHub 源码：<https://github.com/Arvvinn/voicelog-shengji-demo>，公开仓库，`main` 分支。
- Netlify 正式站点：<https://voicelog-shengji-arvvinn.netlify.app/>，站点 ID `82d588de-434f-4ecb-8b18-14e20d106ec8`。
- 首次生产部署 ID：`6ab8c5bec0ec03116a9fde34`。从 `demo/` 发布，包括 `index.html` 与离线单页入口。
- 站点访问权限：Production 为 Public；Deploy Preview 为 Private。项目的 “Powered by Netlify badge” 已在项目设置中关闭。该设置立即生效，无需重新部署。
- 无登录浏览器访问 `/` 和 `/VoiceLog_声迹_交互Demo.html`，均返回 HTTP 200；首页正文长度 853,647 字节。桌面 1440 × 900 和手机 390 × 844 的公开页面已实际打开并截图。桌面截图右下角无 Netlify 标识。
- 截图：`screenshots/deploy/public-desktop.png`、`screenshots/deploy/public-mobile.png`。

站点使用 Netlify 固定项目子域名，未设置临时别名或过期时间。当前部署由 CLI 发布；GitHub 仓库保存完整源码与生成后的首页，后续改动需要重新构建并发布。
