# Anđelin Ciklus 🌸

个人前端项目，纯 HTML/CSS/JS 单页应用 —— 经期追踪 + 中塞跨文化爱情日记。

## 技术栈
- 纯 HTML/CSS/JS（无框架）
- Google Fonts (Inter)
- CSS 自定义属性（Design Tokens）
- 支持亮色/暗色模式切换
- localStorage + GitHub API 跨设备同步
- PWA (Service Worker + manifest)

## 文件结构 (v7)
```
index.html              ← HTML 结构 (~524 行)
styles.css              ← CSS (~920 行, Design Tokens + 动画 + 组件)
app.js                  ← JS (~3250 行, 主应用逻辑)
js/i18n.js              ← 三语翻译 + Love Notes
js/auth.js              ← 双人账号认证 & 登录系统
js/weather.js           ← 北京↔贝尔格莱德双城天气模块
js/sync.js              ← GitHub API 跨设备同步引擎
calendar-data.json      ← 节日/节气文化数据 (19节日 + 24节气)
manifest.json           ← PWA manifest
sw.js                   ← Service Worker 离线缓存
data/culture.json       ← 中国文化知识卡片
data/quotes.json        ← 名人名言
data/lessons.json       ← 中文学习课程
libs/html2canvas.min.js ← 截图导出
.eslintrc.json          ← ESLint 代码规范配置
.prettierrc             ← Prettier 格式化配置
LICENSE                 ← 开源许可证
CONTRIBUTING.md         ← 贡献指南
```

## 功能模块
- 🩸 经期追踪 / 🌍 双城天气（北京↔贝尔格莱德）
- 📅 50+ 节日（中国+塞尔维亚+国际）
- 🌿 24 节气（三语故事）/ 🍵 中塞茶文化
- 💌 共享日记（GitHub同步）/ 🤗 远程拥抱
- 💭 每日对话开场白（v6新增）
- 🌱 虚拟花园 / ☀️ 共同太阳计数器

## 开发注意事项
- 三语 i18n：sr / zh-CN / en
- 双人账号：Anđela(PIN 1909) / Barry(PIN 0827)
- 节日数据在 app.js HOLIDAYS 数组（36+ 条目）
- 版本号分散在各文件，更新时需同步

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
