# OPTIMIZATION_ROADMAP — 优化路线图

> Phase / UX 列表与状态。进度细节见 `OPTIMIZATION_STATUS.md`，长期原则见 `PROJECT_CONTEXT.md`。

## 版本路线

| 版本 | 内容 | 状态 |
|---|---|---|
| **V1.0** | 正式上线（commit `5651d9d`，2026-08-31），Anđela 开始真实使用 | ✅ 上线 |
| **V1.1（声调方向）** | ① **Tone Training MVP（方案 B：8 题听音辨调）** 已实现 → ② **Zero Beginner Tone Curriculum（Faza 0）Design Locked（2026-09-04）** | ① ✅ 已实现 · 🔍 降级为底层/巩固能力（Faza 0 上线后）② ✅ 已按锁定设计实现（V1.2） |
| **V1.1 → Implementation MVP：G1–G7** | Zero Beginner Tone Curriculum 第一实现切片（Unit A 全量）：G1 概念 / G2 T1 高平 / G3 T4 下降 / G4 一比四 / G5 T2 上升（+2/4）/ G6 T3 先降后升（+2/3·3/4）/ G7 ma 四声混辨。独立 `tone-course.json` + `tone-course.js` + 独立进度 key + 首页 Faza0 门面卡 + 新用户首入路由；**不碰 lessons.json / 180 引擎 / phase-day-id / progress-default**；G8/G9/G10 不做 | ✅ 已实现（V1.2，2026-09-05）· 🔍 待真机验证 |
| **G1–G7 之后** | G8 换音节听辨 / G9 看记号读出 / G10 声调入真词；Faza1 L6 是否降级为复习页 —— 由 **G1–G7 真机结果**决定 | 🔍 待 Faza 0 真机反馈 |
| **V1.2+** | Based on real user feedback（L3/L4 课程 / minimal-pair / 麦克风 / AI 评分等，内容由真机反馈决定）| 🔍 待反馈 |

> 反馈记录见 `USER_FEEDBACK.md`。真实用户痛点已升级为「**声调零基础**」判断 → V1.1 声调方向演进为 **Faza 0 零基础声调课程**，第一切片 **G1–G7 已实现并验收（V1.2，2026-09-05：journey7 182/182 · 单测 296/296 · 三语扫描 · 修复 2 个真实产品 bug）**。**下一步 = Faza 0 真机验证（Real User Validation）**；其后做什么由真机结果决定，不提前规划。

## 状态图例

✅ 已完成验证 | 🔍 已只读审查（未实现）| ❗ 待做（等用户圈定）| ⏸ 暂缓

## Phase 阶段

| Phase | 内容 | 状态 |
|---|---|---|
| 阶段1 | P1-1 语言切换路由 / P1-2 真实计时 / P1-3 错别字 / P1-4 wordsLearned 成就 | ✅ |
| 阶段2 | P2-1 culture 三语 / P2-2 dialog 三语（180 课）| ✅ |
| 阶段3 | P3-1 静态文本三语 | ✅ |

## UX 优化

| UX | 内容 | 状态 |
|---|---|---|
| UX-1~UX-6 | 第一轮 UX（欢迎/失败反馈/预告/进度/无复习/临门一脚）| ✅ |
| UX-7 | 新用户欢迎卡 CTA | ✅ |
| UX-8 | Serbian 对话只读审查 | ✅ 审查完成 |
| UX-8B / 8C-B | Serbian 逐句修复（74 处/47 课）+ L1-L40 自然化（18 句/12 课）| ✅ |
| UX-9 | 首页学习优先级只读审查 | ✅ 审查完成 |
| UX-9A/B/C + Step4 + 收官 | 复习空态/复习卡上移/全完成庆祝/新用户 continue 隐藏 | ✅ 收官 |
| UX-10 | 第一次使用 10 分钟体验只读审查 | ✅ 审查完成 |
| **UX-10A** | **Faza1 测验「写汉字」→「选汉字」** | ✅ |
| **UX-10B** | **测验通过后「返回首页」次入口（回首页按钮；下一课保持主 CTA）** | ✅ |

## 待做事项（等用户圈定，勿擅自实现）

1. UX-10 报告 P3：streak=0 且已学 ≥1 课 → 显示「Počni niz danas!」软化挫败（现有「0 dana」）
2. UX-10 报告 P4：预告卡安抚句 + 课程头去「Faza 1」体量焦虑
3. 主站入口（要做；但别破坏主站、不接回旧 js/chinese-*.js）

## 暂缓事项（⏸ 已定暂不做，除非用户改口）

- 深色模式
- PWA
- words 英文补全（分批推进，每批先审查翻译质量）
- practice 死字段清理（暂时保留）
- L41-L180 对话自然化（UX-8C 范围外，将来一并处理；含 L59/L81 碎片句）
- L5 `Zauzet?`（用户定保持为性别中性）
- 首屏 <1s 静态语言闪现 / `<html lang>` / 热力图「2 lekcija」数词变格 / 复习两套术语统一
- V1.1 之后的课程/功能扩展（L3/L4、minimal-pair、麦克风/AI 评分）：等 V1.1-TONE-REAL-DEVICE 真机反馈再决定，暂不开发

## 决策记录（历史重要决策）

- 优化顺序：功能正确性 > 三语完整性 > 用户体验 > 代码清理。
- B2 计时：选真实计时方案（不伪造数据），2026-08 实施。
- P1-4 成就：用真实 wordsLearned（学习过的生词数）条件，不降条件。
- 深色模式 / PWA：暂不做。
- UX-10A：只影响 Faza1 的 fill-zh 槽位；Faza2-6 保留真输入题（学习难度渐进，不永久删「写汉字」能力）。
- UX-10B：回首页次入口复用 `.lrn-back-btn` 小按钮类（零 CSS 改动）+ `switchLrnView('home')`（不重载/不跳主站/不改 URL）；放下一课条件块之外（下一课未解锁也能回首页）；失败分支不渲染；仅通过分支出现 1 处。
- 流程约定：UX 类改动「先只读审查 → 出报告 → 等确认 → 再实现」。

### 2026-09-04 — Zero Beginner Tone Curriculum 决策记录（用户圈定，正式方向）

- **Faza 0 定位**：真实用户判断为「声调零基础」→ 四声 = 真正放在 180 课路径最前面的零基础入门课程（Faza 0），先于现有路径，作为声调能力地基。
- **架构形态**：零基础课程 = **独立模块**（独立 `tone-course.json` / `tone-course.js` / 独立进度 key `chinese-tone-course-<profile>`）；**不进 lessons.json / 180 engine**；不调用 `markLessonComplete`、不写 `chinese-progress-default`、不计入 `countLearnedWords`；首页以「Faza 0 / 第 0 阶段」视觉门面呈现（工程隔离、逻辑不耦合）。
- **新用户流程**：真正的新用户首入 → 主 CTA 指向 Faza 0；提供次要「直接进入正式课程」入口（可跳过）；**已开始 180 课者绝不强制重走 Faza 0**；有进度老用户（Anđela）只给首页 Faza 0 推荐卡、不锁正式课程。
- **Faza1 L6「四声」**：维持现状（不删/不改/不重排），定位 = Faza 0 完成后的复习 / 再确认；待 Faza 0 真机验证后再议是否降级为复习页。
- **实现切片策略**：G1–G7 为第一实现切片（Unit A 全量），先真机验证闭环再决定 G8/G9/G10；**G8/G9/G10 暂不实现**。
- **V1.1 Tone Training MVP 去向**：随机 8 题听音辨调**保留为底层 / 巩固能力，不删除**；后续逐步从「随机题」转向「课程内容驱动训练」。

### 2026-09-05 — Faza 0 G1–G7 实现 + 验收决策记录

- **实现范围 = G1–G7 全量（Unit A）**：G1 概念 / G2 T1 / G3 T4 / G4 一比四 / G5 T2 / G6 T3（low-valley，无完整降升教条，短混合只 2/3/4）/ G7 ma 四声 4-way。新增 `data/tone-course.json`、`js/tone-course.js`、`js/tone-course-ui.js`、`js/faza0-home.js`；既有文件仅 `chinese-ui.js`（+54B F0 渲染钩子）、`index.html`（+3 script）、`bootstrap.js`（+语言切换钩子）。**未改 G1/G2、lessons.json、180 引擎、phase-day-id、progress-default**；G8/G9/G10 **不构建**。
- **验收门禁 = 全绿后发布**：教学认知走查（教什么→就练什么，7 条不变量全满足）+ 三语 sr/en/zh-CN 全页扫描 + 真实 Chromium 320/360/390 全旅程 182/182 + 仓库单测 296/296。
- **验收修复（真实产品 bug，非 harness 假阳性）**：① `toneCourseClose` 关闭 overlay 后重建下层首页（home active 时调 `renderChineseHome`），杜绝 F0 卡 stale / 毕业死胡同；② `_resHTML` scored-fail warm 文案去重。
- **进度与数据红线（全程遵守）**：进度隔离 `chinese-tone-course-<profile>`；`mimic` = 自报（像/不像），不机器评分、不伪造掌握数据；从不对已开始 180 课的老用户强制重走 Faza 0。
