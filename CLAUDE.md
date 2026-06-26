# Anđelin Ciklus 🌸

个人前端项目，纯 HTML/CSS/JS 单页应用 —— 经期追踪 + 中塞跨文化爱情日记。

## 技术栈
- 纯 HTML/CSS/JS（无框架）
- Google Fonts (Inter)
- CSS 自定义属性（Design Tokens）
- 支持亮色/暗色模式切换
- localStorage + GitHub API 跨设备同步
- PWA (Service Worker + manifest)

## 文件结构 (v7.2)
```
index.html              ← HTML 结构 (~524 行)
app.js                  ← JS (~5900 行, 主应用逻辑, v7.2)
styles.css              ← CSS 入口文件 (imports all css/*.css)
├── css/tokens.css      ← Design Tokens (亮色/暗色CSS变量)
├── css/base.css        ← 基础样式、重置、版式
├── css/components.css  ← 组件样式：按钮、弹窗、表单、卡片
├── css/calendar.css    ← 日历网格、进度条、月份导航
├── css/diary.css       ← 日记编辑器、时间线、订阅源
├── css/animations.css  ← 所有 @keyframes 动画
├── css/learning.css    ← 学习模块样式
└── css/responsive.css  ← 响应式断点适配
js/i18n.js              ← 三语翻译 + Love Notes
js/auth.js              ← 双人账号认证 & 登录系统
js/weather.js           ← 北京↔贝尔格莱德双城天气模块
js/social.js            ← 社交媒体模块 (Instagram/TikTok集成)
js/calendar.js          ← 日历渲染模块 (IIFE, 日历网格/进度/FAB/月份导航)
js/barry.js             ← Barry专属模块 (程序员礼物/文化档案)
js/culture-cards.js     ← 中国文化知识卡片模块 (IIFE)
js/sync.js              ← GitHub API 跨设备同步引擎
manifest.json           ← PWA manifest
sw.js                   ← Service Worker 离线缓存 (含Background Sync)
data/holidays.json      ← 50+ 节日数据 (中国+塞尔维亚+国际)
data/solar-terms.json   ← 24 节气三语数据
data/culture-knowledge.json ← 中国文化知识卡片数据 (30张，含en)
data/quotes.json        ← 名人名言
data/lessons.json       ← 中文学习课程
data/s-events.json      ← Solar term events
libs/html2canvas.min.js ← 截图导出
.eslintrc.json          ← ESLint 代码规范配置
.prettierrc             ← Prettier 格式化配置
package.json            ← 构建管道 (npm run build)
build.js                ← 构建脚本 (打包/校验/缩)
.github/workflows/test.yml   ← GitHub Actions CI 测试
.github/workflows/deploy.yml ← GitHub Actions 自动部署
LICENSE                 ← 开源许可证
CONTRIBUTING.md         ← 贡献指南
robots.txt              ← SEO
sitemap.xml             ← SEO
.htaccess               ← Apache 配置
browserconfig.xml       ← Windows PWA 配置
```

## 功能模块
- 🩸 经期追踪 / 🌍 双城天气（北京↔贝尔格莱德）
- 📅 50+ 节日（中国+塞尔维亚+国际）
- 🌿 24 节气（三语故事）/ 🍵 中塞茶文化
- 💌 共享日记（GitHub同步）/ 🤗 远程拥抱
- 💭 每日对话开场白（v6新增）
- 🌱 虚拟花园 / ☀️ 共同太阳计数器
- 📱 社交媒体集成 (Instagram/TikTok) (v7新增)
- 🎮 Barry专属模块 (程序员礼物+文化档案) (v7新增)

## 开发注意事项
- 三语 i18n：sr / zh-CN / en
- 双人账号：Anđela(PIN 1909) / Barry(PIN 0827)
- 节日数据在 data/holidays.json (50+ 条目)
- 版本号统一在 app.js 中 VERSION 常量
- 构建指令: `npm run build` (合并+校验+缩)
- CI: 每次 push 自动跑测试 + 部署 GitHub Pages

## v7.3 更新 (2026-06-26)
- 从 app.js 提取模块：js/translate.js, js/theme.js（app.js ~3700 行）
- 构建优化：terser JS 压缩（build.js）
- 清理全部 19 个生产环境 console.warn/error 语句（DEBUG 包装）
- 集中式事件委托系统 (data-action 替代 inline onclick)
- 更新 Service Worker 缓存新模块 (v24)
- 新增 terser devDependency

## v7.2 更新 (2026-06-25)
- 从 app.js 提取模块：js/calendar.js, js/social.js, js/barry.js, js/culture-cards.js
- 内联数据外移至 data/holidays.json, data/solar-terms.json, data/culture-knowledge.json
- CSS 拆分为 8 个模块文件在 css/ 目录
- 新增构建管道 (package.json + build.js)
- 新增 GitHub Actions CI (test.yml + deploy.yml)
- 扩展测试覆盖至日历/天气/文化/同步模块
- 增强 PWA: 注册 Background Sync API
- 新增 SEO 文件 (robots.txt, sitemap.xml, .htaccess, browserconfig.xml)
- app.js 从 ~3540 行精简至 ~5900 行（模块提取后结构更清晰，但核心逻辑仍保留在 app.js）

## v7 更新 (2026-06-25)
- 从单一大 app.js 拆分出模块：js/auth.js、js/weather.js、js/sync.js
- 新增 ESLint (.eslintrc.json) 和 Prettier (.prettierrc) 配置
- 新增开源 LICENSE 和 CONTRIBUTING.md
- 代码质量改进：函数 < 50 行，文件 < 800 行，嵌套 < 4 层
- 版本号同步：app.js 中 VERSION = "v7"

## v6 更新 (2026-06-22)
- 修复 CSS 重复 @keyframes shimmer、greeting-overlay display:flex
- 清理 console.error 残留、删除 calendar-data.js 死代码
- 新增 15+ 节日：Đurđevdan, 520情人节, 双十一, 圣诞/跨年, 2027春节/中秋等
- 新增每日对话开场白功能
- 仪表盘新增今日节日高亮
- 修复 openModal 重复变量声明
