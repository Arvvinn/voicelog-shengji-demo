# 公开演示发布记录

日期：2026-09-27

- GitHub 源码：<https://github.com/Arvvinn/voicelog-shengji-demo>，公开仓库，`main` 分支。
- Netlify 正式站点：<https://voicelog-shengji-arvvinn.netlify.app/>，站点 ID `82d588de-434f-4ecb-8b18-14e20d106ec8`。
- 首次生产部署 ID：`6ab8c5bec0ec03116a9fde34`。从 `demo/` 发布，包括 `index.html` 与离线单页入口。
- 站点访问权限：Production 为 Public；Deploy Preview 为 Private。项目的 “Powered by Netlify badge” 已在项目设置中关闭。该设置立即生效，无需重新部署。
- 无登录浏览器访问 `/` 和 `/VoiceLog_声迹_交互Demo.html`，均返回 HTTP 200；首页正文长度 853,647 字节。桌面 1440 × 900 和手机 390 × 844 的公开页面已实际打开并截图。桌面截图右下角无 Netlify 标识。
- 截图：`screenshots/deploy/public-desktop.png`、`screenshots/deploy/public-mobile.png`。

站点使用 Netlify 固定项目子域名，未设置临时别名或过期时间。当前部署由 CLI 发布；GitHub 仓库保存完整源码与生成后的首页，后续改动需要重新构建并发布。

## 2026-09-27 重新部署

- 应用户确认，将左右双面板和一键演示版本推送到 GitHub：提交 `af267bc78d01d6bf96730203c6df27278dec7a67`。
- 使用 `netlify deploy --prod --dir demo --no-build` 更新同一正式站点。生产部署 ID：`6ab8e5169c6ca394006de8be`。本机已经由 `src/build_demo.py` 构建，因此跳过 CLI 的额外构建。
- 公开首页与具名 HTML 入口均返回 HTTP 200；下载内容与本机 `demo/index.html` 字节完全一致，SHA-256 为 `454862a1399f4d2f1976c652324edce5a0f7d0a8814abd5fa312bf1387997d64`。
- 真实 Chromium 打开正式域名：桌面有 15 个可点击直达入口，人物交汇直达正确；一键演示可启动并退出。390 px 手机仅显示应用。两种视口均无水平溢出，浏览器无页面异常。桌面公开截图右下角无 Netlify 标识。
- 截图：`screenshots/deploy/redeploy-desktop.png`、`screenshots/deploy/redeploy-tour.png`、`screenshots/deploy/redeploy-mobile.png`。
