# Plan: Cycle Tracker Comprehensive Upgrade

**Complexity**: Large (multi-phase, multi-agent orchestration)

## Summary
全面升级 cycle-tracker PWA，包括代码架构重构、性能优化、安全审计、无障碍优化、测试覆盖、PWA 增强、文档完善。使用 ECC 全 Agent & Skill 多阶段并行执行。

## Architecture Analysis (from code-explorer)

app.js 当前状态：
- **4,070 行** 单一文件，**~200 个全局函数**
- 已部分模块化：`js/cycle-core.js`、`js/chart-renderer.js`、`js/i18n.js`
- 待提取模块：Weather、Auth/Login、Holiday Data、Social、Sync Engine、Barry、Stats、Culture
- 双日记 UI 并存（旧 shared-diary + 新 Diary v9）
- 使用 Monkey-patching 实现功能覆盖
- 混合 `var`/`let`/`const` 编码风格

## Phases

### Phase 1: Audit & Analysis（并行审计）
| Agent | Scope |
|-------|-------|
| security-reviewer | XSS, localStorage, GitHub Token, input sanitization |
| code-reviewer | 全局污染、重复代码、错误处理 |
| performance-optimizer | CSS 体积、JS 执行、渲染性能 |
| Accessibility | WCAG 审计（ARIA、键盘导航、对比度） |
| refactor-cleaner | 死代码和冗余分析 |

### Phase 2: Code Architecture（模块化提取）
| Module | Lines | New File | Priority |
|--------|-------|----------|----------|
| Auth/Login | 1296-1388, 4005-4050 | `js/auth.js` | HIGH |
| Weather | 2057-2125 | `js/weather.js` | HIGH |
| Holiday/Solar/Birthday | 1788-1993 | `js/holiday-data.js` | HIGH |
| Sync Engine | 3836-4001 | `js/sync.js` | HIGH |
| Social Modules | 3331-3652 | `js/social.js` | MEDIUM |
| Barry's Analysis | 3276-3829 | `js/barry.js` | MEDIUM |
| Culture Cards | 3026-3115 | `js/culture-cards.js` | LOW |
| Stats/Dashboard | 1461-1663 | `js/stats-panel.js` | LOW |

### Phase 3: Quality & Performance
- ESLint config + code standardization
- CSS optimization（minify、remove duplicates）
- Console.log 替换为统一日志
- 添加 proper error boundaries

### Phase 4: Testing & PWA
- 扩展单元测试（test-core.js）
- 添加 E2E 测试骨架
- 改进 SW 缓存策略
- 添加后台同步能力

### Phase 5: Documentation & Git
- 更新 CLAUDE.md
- 添加 CONTRIBUTING.md
- 添加 LICENSE（MIT）
- 最终提交推送

## Risks
| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| 模块提取破坏功能 | MEDIUM | 逐模块提取+测试验证 |
| 200+ 全局函数耦合 | HIGH | 使用 IIFE/namespace 隔离 |
| 双日记 UI 冲突 | MEDIUM | 保留旧 UI 兼容 |
| Monkey-patching 依赖 | MEDIUM | 提取时解耦依赖 |
| GitHub 网络不可达 | LOW | 本地提交，可稍后推送 |
