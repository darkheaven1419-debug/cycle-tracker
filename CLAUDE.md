# Anđelin Ciklus 🌸

个人前端项目，纯 HTML/CSS/JS 单页应用 —— 经期追踪 + 中塞跨文化爱情日记。

## 技术栈
- 纯 HTML/CSS/JS（无框架）
- Google Fonts (Inter)
- CSS 自定义属性（Design Tokens）
- 支持亮色/暗色模式切换
- localStorage + GitHub API 跨设备同步

## 文件结构
```
index.html       ← HTML 结构 (~436 行, 含底部导航)
styles.css       ← 全部 CSS (~818 行, Design Tokens + 动画 + 组件 + 移动优化)
app.js           ← 全部 JS (~2389 行, i18n + 日历 + 日记 + API + SW注册)
calendar-data.js ← 节日/节气文化数据 (465 行)
manifest.json    ← PWA manifest (v5 新增)
sw.js            ← Service Worker 离线缓存 (v5 新增)
index.html.bak   ← 优化前备份
```

## 开发注意事项
- 修改 CSS 变量在 styles.css 的 `:root` 块内
- 主题切换通过 `data-theme` 属性控制
- 颜色体系：rose/love/lipa/gold/teal/sage/lavender 系列
- 三语 i18n：sr(塞尔维亚语) / zh-CN(中文) / en(英文)
- 双人账号：Anđela(PIN 1909) / Barry(PIN 0827)

## ECC 增强
- 写完代码自动用 code-reviewer 自查
- 复杂改动先规划再执行
- 每次修改后验证效果
