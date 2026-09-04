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
