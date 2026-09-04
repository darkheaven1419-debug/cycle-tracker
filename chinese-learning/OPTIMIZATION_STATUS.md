# OPTIMIZATION_STATUS — 当前进度

> 新会话用几十秒读完即可理解「现在做到哪里」。
> 长期原则见 `PROJECT_CONTEXT.md`，路线图见 `OPTIMIZATION_ROADMAP.md`。
> 每完成一个阶段后更新本文件。

## Current Phase: V1.0 Real User Observation（2026-08-31）

- V1.0（commit `5651d9d`）已上线 GitHub Pages，Anđela 已获得链接并开始使用。
- 产品开发暂停，等待真实用户反馈。
- 反馈记录见 `USER_FEEDBACK.md`（只记录真实反馈，不写猜测）。

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

## 当前任务

- **V1.0 真实用户观察阶段**：V1.0 已上线（`5651d9d`），Anđela 已获得链接。
- **产品开发已暂停**，等待真实用户反馈（用户指令：先暂停继续开发，进入 V1.0 真人使用观察阶段，不要修改任何产品代码）。
- 反馈收集后按 `USER_FEEDBACK.md` 规范记录；未收到真实反馈前不填充、不猜测。

## 下一任务（等真实反馈，勿预先决定）

1. **V1.1 = Based on real user feedback**（具体内容由真实反馈决定，见 `OPTIMIZATION_ROADMAP.md` 版本路线；不预先决定做什么）

## 已知问题（已记录，未擅自处理）

- 塞尔维亚语对话曾阳性变格/带斜杠模板 → **已在 UX-8B 修复**（历史遗留，勿回退）。
- L5 `Zauzet?` 记录为性别中性，用户定保持。
- quiz / listen 干扰词表不一致（Dobro vs Ćao）→ 题库设计，用户要求暂不改。
- 首屏 <1s 静态语言闪现 → 性能架构级，用户要求暂不处理。
- `<html lang>` 暂不单独处理。
- 复习概念两套术语（Pregled/ponavljanje、Favoriti/Sačuvane reči）待定。
- 热力图 title「2 lekcija」数词变格（不在圈定范围，已报告）。
- L59/L81 等 L41+ 碎片式对话句 → 将来 L41-L180 自然化一并处理（UX-8C 范围外）。

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
