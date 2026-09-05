# OPTIMIZATION_STATUS — 当前进度

> 新会话用几十秒读完即可理解「现在做到哪里」。
> 长期原则见 `PROJECT_CONTEXT.md`，路线图见 `OPTIMIZATION_ROADMAP.md`。
> 每完成一个阶段后更新本文件。

## Current Phase: V1.2 / Faza 0 零基础声调课程 G1–G7 — 已实现并验收（2026-09-05）

- **交付物**：`feat: complete zero beginner tone course`（提交后在此回填 hash）。
- **实现（仅 tone-course 模块，设计见下方「设计锁定核心记录」）**：新增 `data/tone-course.json`（G1–G7 + tones 注册表）+ `js/tone-course.js`（纯函数引擎）+ `js/tone-course-ui.js`（overlay UI）+ `js/faza0-home.js`（首页 Faza 0 门面 / 新用户首入主 CTA / 老用户推荐卡 / 毕业卡）。既有文件只动 3 处：`chinese-ui.js` 加 1 个 54 字节 F0 渲染钩子、`index.html` 挂 3 个脚本、`bootstrap.js` 加语言切换保态钩子。**未改 `lessons.json` / 180 引擎 / phase-day-id / `chinese-progress-default`**；进度隔离在 `chinese-tone-course-<profile>`；从不调用 `markLessonComplete`。G8/G9/G10 未构建。
- **验收结论（全绿）**：教学认知走查确认 7 条不变量（「教什么→就练什么」，G4/G6/G7 whichTone 只考已教音）；三语 sr/en/zh-CN 全页扫描（zh-CN locale 已归一 zh，G1–G7 UI 真支持中文）；真实 Chromium 320/360/390 全旅程回归 **182/182 ALL_PASS**；3 个仓库单测 **296/296**。验收中发现并修复 **2 个真实产品 bug**（见「已修复的真实产品 bug」节）。
- **下一步：Real User Validation** —— 把 Faza 0 G1–G7 交给 Anđela 真机验证（清单见下），再按反馈决定 G8/G9/G10。

### V1.1 / Zero Beginner Tone Curriculum — 设计锁定核心记录（2026-09-04）

**三个产品决策（已圈定，正式方向）**
1. **新用户**：真正的新用户首次进入 → 主 CTA 指向 **Faza 0 声调入门**；提供次要「直接进入正式课程」入口（可跳过）。**一旦已开始 180 课，绝不强制重走 Faza 0**。Anđela 当前已有正式课程进度 → 属老用户：**不锁正式课程**，首页给 Faza 0 **推荐卡**。
2. **Faza1 L6「四声」**：**维持现状——不删除、不重排、不改课号**。定位改为「Faza 0 学完后的正式课程复习 / 再确认」。**不改 `lessons.json` / L1–L6 内容 / 180 课程结构**；等真实用户验证 Faza 0 后，再考虑 L6 是否进一步降级为复习页。
3. **首页门面**：采用 **Faza 0 / 第 0 个阶段视觉门面**——视觉上位于现有 6 个 Faza 之前，用户理解为「学习中文的第一步」；**工程上仍是独立模块**：不进 180 lesson engine、不占用正式课号、不修改现有 phase/day/id 计算逻辑。

**架构硬结论（为什么必须独立成模块，不进 lessons.json）**
- 180 引擎对「正好 1–180 课 / 每 phase 恰 30 课 / 从 L1 顺序解锁」硬编码极深（`TOTAL_LESSONS=180`、`LESSONS_PER_PHASE=30`、`applyPhaseAssignments`、`isLessonUnlocked`、`markLessonComplete` 推进 `currentLessonId=id+1≤180`、`renderPhaseLessons` 按 `30*(p-1)+1..30*p` 推导课表、`getFirstIncompleteLesson` 扫 1..180）→ **任何把零基础课程塞进 `lessons.json`（哪怕作为第 0 phase 包）都会使课号 / 阶段边界 / 老用户进度全部错位**。
- 正确形态 = **路径最前一张「Faza 0」门面卡 + 隔离模块**：独立课程数据（拟 `data/tone-course.json`）+ 独立引擎（拟 `js/tone-course.js`，复用 `chinese-tone.js` 的 `toneOf` / 语音探测 / 无 voice 视觉降级 / 模态外壳）+ **独立进度 key `chinese-tone-course-<profile>`** + 首页 Faza0 卡 & 新用户首入路由（只薄改 `chinese-ui.js` 两处 + 新增 script 引用）。
- **绝不让零基础课程调用 `markLessonComplete` / 写 `chinese-progress-default`**（会污染 streak / daily / points / reviews / 180 百分比 / 成就口径）；零基础完成 ≠ 180 课完成，不计入 `countLearnedWords`。
- Faza1 前段（L1–L6）本就是拼音 + 四声序列（L6 = 四声/轻声，用 妈麻马骂）→ Faza 0 定位为**声调能力地基**，毕业技能 = ma 四声能力，让 Faza1 L6 成为复习 / 交接而非新内容。

**课程设计要点（G1–G10，方向已锁定）**
- **修订梯度**：概念 → 逐调建锚（T1 高平 / T4 下降 先，T2 上升 次之，T3 先降后升 最难最后）→ 两两对比（先远后近：1/4 → 2/4 → 2/3 → 3/4）→ ma 四声混辨 → 换音节听辨（泛化）→ 看记号读出 → 声调入真词。**每调内部 =「听锚 → 画曲线/手势 → 跟读模仿 → 立即小辨」微循环**；两两对比与该调同日出现，不等到最后才混辨。
- **音节策略（已实测数据）**：全语料 1142 词、152 个单字可辨调词（分布 37/22/38/55，第 2 声单字最少），**四声齐全的同音节只有 `ma` 一个**（妈麻马骂）→ ma = 黄金参照；对比优先「同音节对」（妈/骂、麻/骂、麻/马、马/骂、十/是…）；泛化用 Faza1 常见单字；**避用 `一/不`**（连读变调）。
- **TTS 硬约束**：浏览器 zh-CN voice 只能念**真实汉字**、不能念裸拼音 → 界面大字带调拼音（mā）+ 小字汉字（妈）；辨调答案用声调符号 / 数字 1–4 / 四色曲线 / sr 方向词表达。
- **mastery 判定（三态 + 分层）**：按 **声调 × 听辨/朗读** 分存 **掌握 / 巩固中 / 尚未掌握** 三态；听辨可自动判分，朗读无麦克风时靠**自报比对**（不机器评分、不伪造数据）；弱调加权补题 + 每会话出现上限；不逼成考试机器（单课 ≤8 题、通过线 75–80%、失败沿用温柔文案）。数字为建议初值，真机验证后按体感微调。
- **G1–G7 = 第一实现切片（Unit A 全量）**：G1 声调是什么 / G2 T1 高平 / G3 T4 下降 / G4 一比四 / G5 T2 上升（+2/4 对比）/ G6 T3 先降后升（+2/3·3/4 对比）/ G7 ma 四声混辨。**G8 换音节听辨 / G9 看记号读出 / G10 声调入真词（Unit B/C）暂不实现**——先 G1–G7 闭环 → 真机 → 再决定。

## 已完成（全部验证通过）

| 编号 | 内容 | 测试 |
|---|---|---|
| 阶段1 P1-1~P1-4 | 语言切换路由 / 真实计时 / 错别字 / wordsLearned 成就 | Phase1 25/25 |
| 阶段2 P2-1~P2-2 | culture 三语 / dialog 三语（180 课 100% zh/sr/en）| Phase2 61/61 |
| 阶段3 P3-1 | 静态文本三语（title/加载失败/阶段解锁/复习术语/热力图星期）| Phase3 42/42 |
| UX-1~UX-6 | 新用户欢迎 / 失败温柔反馈 / 课程预告 / 课程内进度定位 / 无复习轻提示 / 每日目标临门一脚 | UX |
| UX-7 | 新用户欢迎卡 CTA | UX |
| UX-8 审查 | Serbian 对话只读审查（73 必修 + 6 建议 + 18 暂缓）| 只读报告 |
| UX-8B / 8C-B | Serbian Dialog 逐句修复（74 处/47 课）+ L1-L40 自然化（18 句/12 课）| 专项 |
| UX-9 审查 | 首页学习优先级只读审查 | 只读报告 |
| UX-9A/B/C + Step4 + 收官 | 复习空态去 CTA / 复习卡上移 / 全完成庆祝卡 / 新用户 continue 隐藏 | UX 144+ |
| UX-10 审查 | 第一次使用 10 分钟体验审查（🔴1 🟠3 🟡3 🟢10）| 只读报告 |
| **UX-10A** | **Faza1 测验「写汉字」→「选汉字」（pick-zh；Faza2-6 保持输入）** | **UX-10A 39/39** |
| **UX-10B** | **测验通过后「返回首页」次入口（下一课主 CTA + 返回首页次按钮；三语；移动端友好；零 CSS 改动）** | **UX-10B 35/35** |
| **UX-10D D1** | **新用户首页隐藏 Continue 卡（学习后显示；三语；320/360/390 无溢出）** | **D1 flow15** |
| **UX-10D D2** | **Quiz 完成态保持（重测不重算成就 / 失败→重试→成功 / 切语言与 tab 与刷新保持完成态 / 题型兼容）** | **D2c flow16b** |
| **UX-10D D3** | **底部导航 5 项（三语；320/360/390 无溢出；sticky 不被破坏）** | **D3 18/18** |
| **UX-10D D4** | **移动端触控目标（欢迎 CTA 40px / 语言按钮 33px / 返回按钮 33px / Quiz 选项 44px / Continue 46px / Review 热区）** | **D4 17/17** |
| **UX-10D D5** | **视觉对比度（欢迎标题/🎯/completion180/✅徽章 sage→sage-dark；欢迎 CTA + 完成按钮 sage→玫瑰渐变；6 处修复，保持风格）** | **D5 31/31** |
| **V1.0** | **正式部署上线（commit `5651d9d`，19 文件）；线上 10/10 文件 hash = 本地；真实浏览器 smoke 验收通过（首用/第一课/quiz/完成/返回首页/移动端 320-390/三语/首页循环）；页面错误 0** | **已上线** |
| **V1.1** | **声调训练 MVP（方案 B：8 题听音辨调）；toneOf 纯函数 / 单字词题池（含 reserve 补池）/ 8 题状态机 / 视觉降级；不改课程结构、不写进度、不动首页导航** | **87/87** |
| **V1.2** | **Faza 0 零基础声调课程 G1–G7 实现 + 验收：新增 `tone-course.json`（G1 概念 / G2 T1 / G3 T4 / G4 一比四 / G5 T2 / G6 T3 / G7 ma 四声 4-way）+ `tone-course.js`（纯函数、whichTone/multi-check/graduated）+ `tone-course-ui.js`（overlay、三语归一 zh-CN→zh、mimic 自报）+ `faza0-home.js`（F0 门面 / 新用户首入 / 老用户推荐卡 / 毕业卡）；进度隔离 `chinese-tone-course-<profile>`；不碰 lessons.json/180 引擎/progress-default；不改 G1/G2；G8/G9/G10 未构建** | **journey7 182/182 · 单测 296/296** |
| **V1.3** | **Vocabulary Contextualization Audit — Phase A（2026-09-05）：只读全量词汇语境化审计 1142 词（A/B/C 分类 · 真错误/过度简化区分 · 字→词→句 · P0–P3 · Top 风险表 · schema 建议），审计结论 = Panic 多为过度简化误报，仅约 10 处真实问题 → 定点修复 11 处高价值翻译：咸 `Sleno`→`Slano`（L32）/ 喂 py `wéi`→`wèi`（L41）/ 想 sr→`nedostajati (misliti na)`（L94，与想念口径一致）/ 会 sr→`umeti (znati)`（L12，与练习 Umeti 对齐）/ L68 可是·却 sr 撞串拆开（`ali (razgovorni)` / `međutim (ipak; književno)`）/ L87 好运·幸福 sr 撞串拆开（`sreća (u igri)` / `sreća (životna)`）/ 岁→`Godina (starosti)`（L13）/ 酒→`vino / alkoholno piće`（L129）/ 倍→`put(a) / puta više`（L57）；仅改 `data/lessons.json` + 新增 `tests/verify_vocab_phasea.test.js`；**不改 schema / 课程结构 / 180 引擎 / 首页** | **单测 794/794 · Chromium 109/109** |

## 最近一次全量回归（2026-08-31）

```
UX 全量（verify_ux.test.js all）   218/218 ✅
Phase1（verify_phase1.test.js）    25/25   ✅（T7 断言修正：55 课进度已含 lesson 1，重测不重算成就是产品正确行为；改用新课 56 触发真实成就检查）
Phase2（verify_phase2.test.js）    61/61   ✅
Phase3（verify_phase3.test.js）    42/42   ✅
D1 flow15 / D2c flow16b / D3 flow18 / D4 flow20 / D5 flow21   全过 ✅
D2 flow16 唯一偏差 D2-10b = 旧测试断言与产品设计不符（submitQuiz 成功后内嵌结果不显示 retake；retake 在重进 quiz 的完成态卡出现，D2-10c / D2-12 / flow16b③④⑤ 均验证通过）→ 产品行为正确，非回归
node --check 全部 js / JSON 全部有效 / 资源引用 10 无缺失 ✅
```

## 最近一次全量回归（2026-09-04，V1.1 封存前）

```
verify_tone（V1.1 新增）        87/87   ✅
verify_ux.test.js all          218/218 ✅
verify_ux11a                    24/24   ✅
Phase1 / Phase2 / Phase3        25/25 / 61/61 / 42/42  ✅
node --check 全部 js / JSON 全部有效  ✅
真实移动端 Chromium 检查（320/360/390）54/54  ✅（入口按钮顺序→打开 overlay→作答 Tačno!→结果卡 Kraj runde/8/8→再练一轮重置→EN 切语言保留会话→关闭移除；页面错误 0；headless 无 zh voice 自动走视觉降级路径）
```

## 最近一次全量回归（2026-09-05，Faza0 G1–G7 发布前）

```
仓库单测：verify_tone_course 116/116 · verify_tone_course_ui 115/115 · verify_faza0_home 65/65   = 296/296 ✅
真实 Chromium 全旅程（tcc_journey7，320/360/390）182/182 ALL_PASS ✅
  [A] 44/44 新用户 walking home→Faza0→G1…G7→graduation→正式 L1（含 refresh/mid-resume）
  [B] 7/7   [C] 6/6   [D] 7/7   [E] 16/16  —— 老用户推荐卡 / formal entry / skip / 进度隔离等
  [TTS] 12/12  语音（含 teach/listen/check replay + 无 voice 视觉降级路径）
  [L9] 90/90   三语 sr/en/zh-CN 语言切换保态 + 文案逐字
修复后复跑回归 = ALL_PASS（与上同一轮即修复后全绿；另有独立 close-probe：RESULT_A PASS / RESULT_B PASS）
node --check 全部 js / JSON 全部有效 ✅
```

## 最近一次全量回归（2026-09-05，Vocabulary Phase A 发布前）

```
仓库单测（10 文件）：verify_faza0_home 65 · phase1 25 · phase2 61 · phase3 42 · verify_tone 87 · verify_tone_course 116 · verify_tone_course_ui 115 · verify_ux 218 · verify_ux11a 24 · verify_vocab_phasea 41（新增）= 794/794 ✅
真实 Chromium 词汇验收（tcc_phasea_vocab，390px，9 门被改课 L12/13/32/41/57/68/87/94/129）：vocab/grammar/practice/culture/quiz/listen 全渲染 109/109 ✅
  L68 可是=`ali (razgovorni)` · 却=`međutim (ipak; književno)` —— 词表同屏互异 + quiz 真实作答 5/5 100%（0 新错）
  L87 好运=`sreća (u igri)` · 幸福=`sreća (životna)` —— 词表同屏互异 + quiz 真实作答 5/5 100%（0 新错）
  全部被改课 quiz 5 题 答案/选项 唯一无撞串；页面异常 0（唯一排除项 = headless 无手势 navigator.vibrate 拦截，harness 假阳性）
修复后复跑 = ALL PASS（与上同一轮即全绿）
```

## 已修复的真实产品 bug（2026-09-05 验收发现，非 harness 假阳性）

1. **关闭 tone-course overlay 后首页 F0 卡不刷新**（`tone-course-ui.js` `toneCourseClose`）：用户在首页从浮层学完 / 中途关闭后，下层首页「进行中 / 已完成 / 毕业卡」保持旧态直到整页刷新（新手完成 G1 关浮层仍显示 hero；学完 G7 关浮层卡停在 progress 死胡同）。修复：关闭时若下方 active 视图为 home → 调 `window.renderChineseHome()` 重建首页（F0 卡即时更新；复用 `fillPhasePath`→`renderFaza0Card` 幂等注入链）。验证：真实 Chromium close-probe A（brand-new 完成 G1→close→progress，hero 消失）/ B（G1–G6 种子→G7 毕业→resultAction→done 卡 + sr 毕业文案）双 PASS。
2. **scored-fail 结果屏 warm 文案重复**（`tone-course-ui.js` `_resHTML`）：无条件渲染的灰色 warm 行与 fail 分支上方的 warm 文案叠加出现两次。修复：灰色行条件改为 `lesson.kind==='concept' || res.passed`。

## 当前任务

- **Real User Validation：Faza 0 G1–G7 已实现并验收（2026-09-05），待 Anđela 真机使用**。真机验证清单见下节「REAL DEVICE VALIDATION — FAZA0-G1-G7」。
- G8（换音节听辨）/ G9（看记号读出）/ G10（声调入真词）**未构建**，等 G1–G7 真机反馈后再决定；Faza1 L6 是否降级为复习页同样等反馈。
- V1.1 随机 8 题听音辨调（`V1.1-TONE-REAL-DEVICE`，见下节）已**降级为底层 / 巩固能力入口**，作为历史验证记录保留；主验证入口转为 Faza 0 G1–G7。
- 反馈收集后按 `USER_FEEDBACK.md` 规范记录；未收到真实反馈前不填充、不猜测。

## REAL DEVICE VALIDATION — FAZA0-G1-G7（待真机验证 · 主入口）

> 待 Anđela 在真实手机 / 电脑浏览器走完 **Faza 0 声调入门（G1–G7）** 后逐项确认。以下全部为**开发者内部已自测通过的路径**（journey7 182/182），现需真实人体验证**人本可用性 / 教法学有效性**（听得出、看得懂、学得进）。

- [ ] **首入路径**：新用户首屏主 CTA「声调入门」能点开 G1；老用户（已开始 180 课）首页出现 Faza 0 **推荐卡**（可点开，不锁正式课程）
- [ ] **全流程走通**：G1 概念 → G2 T1 → G3 T4 → G4 一比四 → G5 T2 → G6 T3 → G7 ma 四声 → **毕业卡**（sr「Završila si osnovnu obuku tonova — sada možeš da kreneš na zvanični kurs.」/ zh「你已经完成声调基础训练」/ en）→ 返回首页 F0 卡变「已完成」
- [ ] **毕业后正式课程衔接**：从毕业卡点正式课程入口能正常进入 Faza1 L1；F0 完成**不影响** 180 课进度 / streak / 每日 / 成就口径（进度隔离）
- [ ] **语言**：全程 sr；中途切 en / 中文时文案即时切换且**课程内位置（第几课第几步）不丢**；刷新后仍在原处
- [ ] **TTS**：能听到真实中文朗读的大字调拼音（mā…）；无中文 voice 机型自动视觉降级（调号 + 四色曲线 + sr 方向词），不白屏；「🔁 再听一次」可反复重播
- [ ] **mimic 自报**：跟读后「😊 Zvuči slično / 🤔 Ne baš」可点，作为**自报**记录（不机器评分、不伪造数据）
- [ ] **认知 / 教学有效性（人本关键项）**：零基础者能否独立走完 7 课不卡壳——每题「先教→再练」是否自明；whichTone 的 1–4 数字 + 调号 + 四色选项能否准确表达她听到的音；**未正式教过的音从不被考**（G4 只 T1/T4、G6 只 2/3/4、G7 才四声全上）
- [ ] **难度 / 时长**：每课体感题量与时长是否合适（据此微调题量 / 通过线 / 语速）
- [ ] **窄屏 320/360/390**：卡片与按钮无溢出、无横向滚动、触控目标够大

## REAL DEVICE VALIDATION — V1.1-TONE-REAL-DEVICE（已降级为底层巩固入口，历史记录）

> ⚠️ 此清单对应 V1.1 随机 8 题听音辨调（🎵 Vežbanje tonova）。Faza 0 G1–G7 上线后该入口**保留为底层 / 巩固能力**，主真机验证转为上节 `FAZA0-G1-G7`。以下条目是否继续逐项验证，随 Faza 0 反馈一并决定。

- [ ] **zh-CN TTS 播放**：手机浏览器能正常播放中文单字词的朗读；无中文 voice 的机型自动降级为视觉模式（不白屏）
- [ ] **「🔁 再听一次」**：按钮可用，能反复重播当前词
- [ ] **语速**：rate 0.6 慢速是否适合辨调（听不清可再降速；嫌拖沓可提速）
- [ ] **四声参照条可理解性**：顶部 `ā á ǎ à` + 1234 + sr 方向提示能否帮她听懂差别并作答
- [ ] **一轮 8 题时长**：是否过长/过短（过短→加到 10；过长→减到 6/5）
- [ ] **辨调能力提升感**：实际使用后是否觉得更能听出四声（结果卡正确率是否逐步提高）

## 下一任务（等 Faza 0 真机验证反馈，勿预先决定）

- **Faza 0 G1–G7 真机验证通过后**，再按真实反馈决定是否实现 G8（换音节听辨）/ G9（看记号读出）/ G10（声调入真词），以及 Faza1 L6 是否进一步降级为复习页。
- L3/L4 / minimal-pair / 麦克风 / AI 评分等一律等反馈，不预先开发（麦克风朗读自动判分为后续可选，G1–G7 MVP 无它也能闭环）。

## 已知问题（已记录，未擅自处理）

- 塞尔维亚语对话曾阳性变格/带斜杠模板 → **已在 UX-8B 修复**（历史遗留，勿回退）。
- L5 `Zauzet?` 记录为性别中性，用户定保持。
- quiz / listen 干扰词表不一致（Dobro vs Ćao）→ 题库设计，用户要求暂不改。
- 首屏 <1s 静态语言闪现 → 性能架构级，用户要求暂不处理。
- `<html lang>` 暂不单独处理。
- 复习概念两套术语（Pregled/ponavljanje、Favoriti/Sačuvane reči）待定。
- 热力图 title「2 lekcija」数词变格（不在圈定范围，已报告）。
- L59/L81 等 L41+ 碎片式对话句 → 将来 L41-L180 自然化一并处理（UX-8C 范围外）。
- Faza0 课程名 zh 轻微不一致：`tone-course.json` meta.name zh「声调入门」vs 首页 `F0_L.name` zh「语音与声调」（en 也不同）；sr 一致「Glasovi i tonovi」→ 已知、待真机反馈后再统一，避免后期 churn。
- 词汇审计 Phase A 边界内有意不改：`点` L22 sr 保持 `Sat`（追加 usage note 需词条第 4 字段 → schema 变更，属 Phase B）；`幸福` 仅改 L87，L109/L143 保留小写 `sreća`（最小改动原则）。

## 重要回归注意事项

- `LESSONS_DATA` 在 chinese-learn.js 是 **vm 词法全局**，测试注入必须用 `vm.runInContext('LESSONS_DATA=...;applyPhaseAssignments();')`，沙箱属性赋值无效。
- **phase 边界**：L1-L30=Faza1、L31-L60=Faza2（`applyPhaseAssignments` 用 0-based index `Math.floor(t/30)+1`）。UX-10A 的 pick-zh 判定跟随 `getLessonPhase`；若改阶段划分需重跑 UX-10A 的 A2/A3。
- 测试加载 chinese-quiz.js 需 `loadUI(ls, { quiz: true })`。
- 测试中的 `injectLessons` 会注入 phase；`submitQuiz` 运行时需 `navigator` mock（测试基建已内置）。
- 改 lessons.json 用对象级逐课定位 + count==1 替换（紧凑 JSON 往返字节一致），勿全文件字符串替换。

## 全量回归命令

```bash
node tests/verify_ux.test.js all
node tests/verify_phase1.test.js
node tests/verify_phase2.test.js
node tests/verify_phase3.test.js
# 另：node --check js/*.js；JSON 校验；资源引用检查
```
