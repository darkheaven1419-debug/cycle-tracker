# USER_FEEDBACK — 真实用户反馈记录

> 记录 Anđela 实际使用网站后的真实反馈。
> **原则：不写猜测。只记录真实发生的反馈。**
> - 我们的推测 → 明确标记 `Hypothesis`
> - Anđela 的原话 → 明确标记 `User Quote`
>
> 长期原则见 `PROJECT_CONTEXT.md`，进度见 `OPTIMIZATION_STATUS.md`，路线图见 `OPTIMIZATION_ROADMAP.md`。

## 记录规范

### 文档原则

1. 只记录真实发生的反馈（Positive / Problems / Questions / Requests / Ideas）。
2. 推测必须明确标记 `Hypothesis`。
3. 原话用引号并标记 `User Quote`。
4. 未收到真实反馈前，不提前填充问题。

### 每个问题 / 请求的记录字段

| 字段 | 说明 |
|---|---|
| ID | 如 FB-001 |
| 日期 | 反馈日期 |
| 用户原话 | 有则用 `User Quote`，无则留空 |
| 页面 | 涉及的页面 / 视图 |
| 操作路径 | 用户如何到达该状态 |
| 实际发生 | 观察到的事实 |
| 用户预期 | 用户期望什么 |
| 严重程度 | P0 崩溃 / P1 严重 / P2 一般 / P3 轻微 |
| 是否可复现 | 是 / 否 / 未知 |
| 当前状态 | Open / In Progress / Resolved |

## 2026-08-31

**V1.0 正式上线，开始真实用户观察。**
- V1.0（commit `5651d9d`）已部署至 GitHub Pages，Anđela 已获得链接并开始使用。
- 产品开发已暂停；本文件等待真实反馈填充。
- 收到反馈后，按下方格式逐条记录。

### Positive Feedback

_（等待反馈）_

### Problems

_（等待反馈）_

### Questions

_（等待反馈）_

### Requests

_（等待反馈）_

### Hypotheses

_（等待反馈）_

### Decisions

_（等待反馈；记录基于真实反馈做出的产品决策）_

## 2026-09-04 — V1.1 声调训练 MVP 封存，进入真机验证

- 真实用户痛点（听不清 / 分不清中文声调）已转化为 **V1.1 声调训练 MVP**（方案 B：8 题听音辨调，仅用已学范围单字词，复用 zh-CN TTS）。
- 功能范围已封存；**下一步等待 Anđela 真机使用反馈**（验证清单见 `OPTIMIZATION_STATUS.md` 的 `V1.1-TONE-REAL-DEVICE`）。
- 真机反馈到达前：不填充具体问题、不写猜测（遵循本文件「只记录真实反馈」原则）；收到后按下方 FB-00N 格式逐条记录。

## 2026-09-04 — Zero Beginner Tone Curriculum 设计锁定（后续正式方向）

**设计前提（开发者对真实用户能力的判断，非 Anđela 原话 → 不标 `User Quote`）**
- 判断：Anđela 几乎无法稳定区分 / 产出第一、二、三、四声，属「**声调零基础**」——V1.1 的 8 题随机听音辨调对她偏难（超出当前能力）；声调需要**更早、更慢、可控变量**的专门路径，即 **Faza 0 零基础声调课程**。

**产品决策（已由用户圈定，作为 V1.1 后续实现正式方向）**
1. 新用户首次进入 → 主 CTA 指向 Faza 0 声调入门；次要入口可直接进入正式课程（可跳过）。一旦开始 180 课则不强制重走；Anđela 属老用户 → 只给 Faza 0 推荐卡，不锁正式课程。
2. Faza1 L6「四声」维持现状（不删/不改/不重排），定位 = Faza 0 完成后的复习 / 再确认；待 Faza 0 真机验证后再议是否降级为复习页。
3. 首页采用 Faza 0 / 第 0 阶段视觉门面（视觉位于 6 个 Faza 之前）；工程上为独立模块，不进 180 engine、不占课号。

**下一步实现边界**：Implementation MVP = **G1–G7**；G8/G9/G10 暂不实现，先真机验证闭环再决定。V1.1 随机 8 题保留为底层 / 巩固能力，后续逐步转向「课程内容驱动训练」。

## 2026-09-05 — Faza 0 G1–G7 已实现并验收（开发者验证 · 非真实用户反馈）

- 按 2026-09-04 锁定设计完成 Implementation MVP：G1 概念 / G2 T1 / G3 T4 / G4 一比四 / G5 T2 / G6 T3（low-valley）/ G7 ma 四声；新增 `data/tone-course.json` / `js/tone-course.js` / `js/tone-course-ui.js` / `js/faza0-home.js`，进度隔离 `chinese-tone-course-<profile>`，不触碰 180 课进度 / `chinese-progress-default`。
- **本日无真实用户反馈**。以下全部为**开发者内部验证**（≠ Anđela 使用反馈）：
  - 教学认知走查：教什么→练什么 7 条不变量全满足（G4 只 T1/T4、G6 只 2/3/4、G7 才四声全上；无完整降升教条；mimic = 自报）
  - 三语 sr/en/zh-CN 全页扫描（含 F0 首页卡 / G1–G7 overlay / 毕业卡 / 正式入口）
  - 真实 Chromium 320/360/390 全旅程 **182/182 ALL_PASS**（walking home→Faza0→G1…G7→毕业→正式 L1；refresh/mid-resume、TTS/no-TTS、replay、skip、老用户推荐卡、formal entry、进度隔离）
  - 仓库单测 **296/296**；验收中发现并修复 **2 个真实产品 bug**（关闭 tone-course overlay 后首页 F0 卡不刷新、scored-fail 结果屏 warm 文案重复），修复后回归全绿
- **已进入 Real User Validation**：Faza 0 G1–G7 交付给 Anđela 真机验证（清单见 `OPTIMIZATION_STATUS.md` → `REAL DEVICE VALIDATION — FAZA0-G1-G7`）。
- **原则声明**：真机反馈到达前，下方 FB-00N 字段保持空白——不写猜测、不标 `User Quote`、不填充 `Actual / Expected`。

## 2026-09-05 — Vocabulary Contextualization Audit — Phase A 已定点修复（开发者验证 · 非真实用户反馈）

- 完成**只读全量词汇审计**（1142 词：A/B/C 分类 · 区分真实错误/过度简化/正常简化 · 字→词→句与课程上下文 · P0–P3 · Top 风险表 · schema 建议）。审计结论：大部分「字被当固定词翻译」Panic 是**过度简化误报**（正常教学简化），仅约 10 处真实问题。
- 按用户圈定边界执行 **Phase A 定点修复**：只改 `data/lessons.json`（11 处：L32 咸拼写 / L41 喂声调 / L94 想 / L12 会 / L68 可是·却 / L87 好运·幸福 / L13 岁 / L129 酒 / L57 倍）+ 新增 `tests/verify_vocab_phasea.test.js`；**不重构 schema、不加 usage note 字段、不改课程结构 / 180 引擎 / 首页**。
- **本日无真实用户反馈**。以下为**开发者内部验证**（≠ Anđela 使用反馈）：仓库单测 10 文件 **794/794**；真实 Chromium 9 门被改课全视图 **109/109**（L68 可是=`ali (razgovorni)`·却=`međutim (ipak; književno)`、L87 好运=`sreća (u igri)`·幸福=`sreća (životna)` 词表同屏互异，quiz 真实作答均 5/5 100%，同课 sr 撞串清零）。
- **边界内决策**：`点` L22 保持 `Sat`（usage note 需 schema 第 4 字段，Phase B 再议）；`幸福` 仅改 L87（L109/L143 保留小写 `sreća`，最小改动）。
- **原则声明**：真实用户（Anđela）反馈到达前，下方 FB-00N 字段保持空白——不写猜测、不标 `User Quote`。

## 问题 / 请求记录

> 格式模板。**无真实反馈前不填充。** 收到反馈后按此格式新增条目（FB-001、FB-002 …）。

```text
### FB-001
Status: Open
Priority: P1
Page: （如 Quiz / 首页 / 课程视图）
User Quote: "…"
Expected: …
Actual: …
Repro: （复现路径或"未知"）
Date: 2026-08-31
Notes: …
```
