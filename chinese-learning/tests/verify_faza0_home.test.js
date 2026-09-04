/* verify_faza0_home.test.js — 阶段4：Faza 0 首页接入 / 新用户首入 / skip / 老用户推荐 / 完成边界
   用法: node tests/verify_faza0_home.test.js
   架构：加载 chinese-learn + chinese-ui + tone-course 引擎 + faza0-home 模块（vm + 轻 DOM stub），
   与 verify_ux 同款 harness。renderFaza0Card() 由 renderChineseHome 在 fillPhasePath 之后调用（源码 seam 单独断言 F0-7）。
   关键约定（源码已验证）：
   - 正式 180 卡标记含 data-phase="N"（fillPhasePath 构建）；首页 #lrnPhaseGrid 每 render 被 fillPhasePath 重写。
   - 正式课程 DOM 可达入口 = window.continueLearning / renderPhaseLessons / renderLessonView（内部裸名调 switchLrnView，
     故 guard 包这三个入口，不包 switchLrnView）。
   - tone-course schema 已含 skipped/startedAt/completed（独立 key chinese-tone-course-*）。 */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const BASE = path.join(__dirname, '..');
let passed = 0, failed = 0;
function ok(c, l) { if (c) { passed++; console.log('  PASS  ' + l); } else { failed++; console.log('  FAIL  ' + l); } }
function section(s) { console.log('\n== ' + s + ' =='); }
const count = (s, sub) => s.split(sub).length - 1;

function makeLS(seed) {
  const m = new Map(Object.entries(seed || {}).map(([k, v]) => [k, String(v)]));
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: k => { m.delete(k); } };
}
const KEY = k => 'chinese-progress-' + k;            // 180
const TKEY = 'chinese-tone-course-default';          // Faza0 独立 key
const P180 = (o) => JSON.stringify(Object.assign({ version: 2, completedLessons: {}, currentLessonId: null, totalPoints: 0, totalTimeSpent: 0, studyStreak: { current: 0, longest: 0, lastDate: null } }, o));
const P0 = (o) => JSON.stringify(Object.assign({ version: 1, startedAt: null, updatedAt: null, completed: [], skipped: false, graduated: false, lastLesson: null, active: null, tone: {}, self: {} }, o));

function makeDoc() {
  const elProto = { style: {}, classList: { add() {}, remove() {} }, appendChild() {}, insertBefore() {}, setAttribute() {},
    set textContent(v) { this._t = String(v); }, get textContent() { return this._t || ''; } };
  return {
    visibilityState: 'visible', hidden: false, readyState: 'complete', title: '',
    documentElement: { setAttribute() {} },
    getElementById: () => null, querySelectorAll: () => [], querySelector: () => null,
    createElement: () => Object.assign({}, elProto), body: { appendChild() {} }, head: { appendChild() {} },
    addEventListener() {}, removeEventListener() {}, _L: {},
  };
}
// 与 verify_ux 相同的 LESSONS_DATA 注入（fillPhasePath/getPhaseProgress 需要）
function injectLessons(ctx) {
  const raw = JSON.parse(fs.readFileSync(path.join(BASE, 'data', 'lessons.json'), 'utf8'));
  const flat = [];
  raw.forEach(p => { (p.lessons || []).forEach(l => flat.push(l)); });
  vm.runInContext('LESSONS_DATA=' + JSON.stringify(flat) + '; applyPhaseAssignments();', ctx);
}
function load(seedOrLs) {
  const ls = (seedOrLs && typeof seedOrLs.getItem === 'function') ? seedOrLs : makeLS(seedOrLs);
  const cards = {
    lrnStreakCard: { innerHTML: '', style: {}, parentNode: { insertBefore() {} } },
    lrnContinueCard: { innerHTML: '', style: {}, querySelector: () => ({ textContent: '' }), querySelectorAll: () => [] },
    'lrn-phase-title': { _t: '', set textContent(v) { this._t = String(v); }, get textContent() { return this._t; } },
    lrnPhaseGrid: { innerHTML: '' },
    lrnReviewCard: { innerHTML: '', style: {} }, lrnReviewList: { innerHTML: '' },
    'lrn-review-all-btn': { style: {} }, 'lrn-review-title': { _t: '', textContent: '' },
  };
  const doc = makeDoc();
  doc.getElementById = id => (id in cards ? cards[id] : null);
  const calls = { continueLearning: 0, renderLessonView: 0, renderPhaseLessons: 0 };
  const win = {
    addEventListener() {}, _L: {},
    getLrnUIState: () => ({ view: 'home', phaseId: null, lessonId: null, tab: 'vocab' }),
    // 真实 DOM onclick 可达的三个正式课程入口（被 faza0-home guard 包裹）
    continueLearning() { calls.continueLearning++; },
    renderLessonView() { calls.renderLessonView++; },
    renderPhaseLessons() { calls.renderPhaseLessons++; },
    renderChineseHome() {}, switchLrnView() {},
  };
  const sandbox = {
    window: win, document: doc, localStorage: ls, lang: 'sr',
    setInterval: () => 0, clearInterval: () => {}, setTimeout, clearTimeout, Date, Math, JSON, Promise,
    Object, Array, String, Number, Boolean, parseInt, parseFloat, isNaN, console,
    fetch: () => Promise.resolve(), navigator: { vibrate() {} }, speechSynthesis: { getVoices: () => [], addEventListener() {} },
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(BASE, 'js', 'chinese-learn.js'), 'utf8'), sandbox);
  vm.runInContext(fs.readFileSync(path.join(BASE, 'js', 'chinese-ui.js'), 'utf8'), sandbox);
  injectLessons(sandbox);
  vm.runInContext(fs.readFileSync(path.join(BASE, 'js', 'tone-course.js'), 'utf8'), sandbox);
  const toneData = JSON.parse(fs.readFileSync(path.join(BASE, 'data', 'tone-course.json'), 'utf8'));
  vm.runInContext('window.tcSetData(' + JSON.stringify(toneData) + ');', sandbox);
  // 关键：chinese-ui.js 加载时会用真实实现覆盖这三个 window.* 入口。
  // 必须在所有真实模块加载完成后重新赋回 counting stub —— 这样 bootFaza 的 guard
  // 包住的是 stub（calls 可靠递增、无 180/DOM 副作用），与真实浏览器里 DOM onclick
  // 命中 guard 包住的真实函数的语义一致（guard 前置 f0SkipIfNew 是断言主体）。
  win.continueLearning = function () { calls.continueLearning++; };
  win.renderLessonView = function () { calls.renderLessonView++; };
  win.renderPhaseLessons = function () { calls.renderPhaseLessons++; };
  return { ctx: sandbox, cards, ls, calls };
}
function bootFaza(c) { vm.runInContext(fs.readFileSync(path.join(BASE, 'js', 'faza0-home.js'), 'utf8'), c.ctx); }
function renderHome(c) { c.ctx.fillPhasePath(); c.ctx.renderFaza0Card(); }
function grid(c) { return c.cards.lrnPhaseGrid.innerHTML; }
function setLang(c, l) { c.ctx.lang = l; c.ctx.window.lang = l; }

const IMPL = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'];

// =====================================================================
section('F0-1 新用户首入（主 CTA → Faza 0，次要 → 正式课程）');
{
  const c = load({}); setLang(c, 'sr'); bootFaza(c);
  renderHome(c);
  const g = grid(c);
  ok(count(g, '<!--F0B-->') === 1 && count(g, '<!--F0E-->') === 1, 'F0-1 只注入一组 Faza0 块（marker 单组）');
  ok(g.indexOf('Prvi korak: glasovi i tonovi') >= 0, 'F0-1 新用户 hero 主标题 = 先学声调（sr）');
  ok(g.indexOf('Započni osnove tonova') >= 0, 'F0-1 主 CTA → Faza0（sr）');
  ok(g.indexOf('Idi direktno na zvanični kurs') >= 0, 'F0-1 次要 CTA → 正式课程（sr）');
  ok(g.indexOf('Glasovi i tonovi') >= 0, 'F0-1 网格内 Faza0 卡名 = Glasovi i tonovi');
  ok(g.indexOf('Još nije početo') >= 0, 'F0-1 卡状态 = 未开始（sr）');
  const iHero = g.indexOf('lrn-f0-hero'), iCard = g.indexOf('lrn-f0-card'), iP1 = g.indexOf('data-phase="1"');
  ok(iHero >= 0 && iHero < iCard && iCard < iP1, 'F0-1 视觉顺序：hero → Faza0 卡 → Faza1（不插进 180 卡流）');
  renderHome(c);
  ok(count(grid(c), 'lrn-f0-card') === 1, 'F0-1 二次 render 不重复插入（fillPhasePath 先重置网格）');
  ok(c.ctx.faza0Status().skipped === false, 'F0-1 渲染首页本身不写 skip');
}
// 三语文案
{
  const c = load({}); setLang(c, 'zh-CN'); bootFaza(c); renderHome(c);
  ok(grid(c).indexOf('中文第一步：先学声调') >= 0 && grid(c).indexOf('语音与声调') >= 0, 'F0-1 hero/卡 zh 文案');
  const c2 = load({}); setLang(c2, 'en'); bootFaza(c2); renderHome(c2);
  ok(grid(c2).indexOf('First step: sounds &amp; tones') >= 0 && grid(c2).indexOf('Sounds &amp; Tones') >= 0, 'F0-1 hero/卡 en 文案');
}

section('F0-2 新用户 skip（不写 180；不重复弹；可回补）');
{
  const c = load({}); setLang(c, 'sr'); bootFaza(c); renderHome(c);
  ok(grid(c).indexOf('Započni osnove tonova') >= 0, 'F0-2a skip 前显示 hero');
  c.ctx.faza0Skip();
  const saved = JSON.parse(c.ls.getItem(TKEY));
  ok(saved && saved.skipped === true, 'F0-2 skip 写入 Faza0 独立 progress（tone key）');
  ok(c.ls.getItem(KEY('default')) === null, 'F0-2 绝未写入 chinese-progress-default');
  renderHome(c);
  ok(grid(c).indexOf('Započni osnove tonova') < 0, 'F0-2 已 skip → hero 不再弹出');
  ok(grid(c).indexOf('Glasovi i tonovi') >= 0, 'F0-2 skip 后 Faza0 卡仍在（随时可回补）');
}
// 自动 skip：brand-new 首次经任一正式入口进入 → 记录 skip（guard 三个 DOM 入口）
{
  const c = load({}); setLang(c, 'sr'); bootFaza(c);
  ok(!c.ctx.faza0Status().skipped, 'F0-2b 初始未 skip');
  c.ctx.window.renderLessonView(5);
  ok(c.ctx.faza0Status().skipped === true, 'F0-2b 经 renderLessonView 进正式课程 → 自动 skip');
  const c1 = load({}); setLang(c1, 'sr'); bootFaza(c1);
  c1.ctx.window.renderPhaseLessons(1);
  ok(c1.ctx.faza0Status().skipped === true, 'F0-2b 经 renderPhaseLessons 进正式课程 → 自动 skip');
  const c2 = load({}); setLang(c2, 'sr'); bootFaza(c2);
  renderHome(c2);
  ok(c2.ctx.faza0Status().skipped === false, 'F0-2b 仅渲染首页 → 不误 skip');
  const c3 = load({}); setLang(c3, 'sr'); bootFaza(c3);
  c3.ctx.window.continueLearning();
  ok(c3.ctx.faza0Status().skipped === true && c3.calls.continueLearning === 1, 'F0-2b 经 continue-card(continueLearning) → 自动 skip 且落正式');
}
// skip 后 goFormal 不重复弹、正常进正式
{
  const c = load({}); setLang(c, 'sr'); bootFaza(c);
  c.ctx.faza0Skip();
  c.ctx.faza0GoFormal();
  ok(c.calls.continueLearning === 1, 'F0-2c goFormal → 正式 continueLearning（→Faza1 L1）');
  ok(c.ctx.faza0Status().skipped === true, 'F0-2c skip 状态保持');
  renderHome(c);
  ok(grid(c).indexOf('lrn-f0-hero') < 0, 'F0-2c goFormal 后首页不再弹 hero');
}

section('F0-3 老用户（已有 180 进度）：不锁、不弹 hero、只推荐卡');
{
  const seed = { [KEY('default')]: P180({ completedLessons: { '1': { completedAt: '2026-09-01T10:00:00', score: 80, timeSpent: 60 } }, currentLessonId: 2, studyStreak: { current: 3, longest: 5, lastDate: '2026-09-04' } }) };
  const c = load(seed); setLang(c, 'sr'); bootFaza(c); renderHome(c);
  const g = grid(c);
  ok(g.indexOf('Započni osnove tonova') < 0, 'F0-3 老用户不弹新用户 hero');
  ok(g.indexOf('Glasovi i tonovi') >= 0, 'F0-3 Faza0 以推荐卡出现');
  ok(g.indexOf('Preporuka') >= 0, 'F0-3 推荐卡带 Preporuka 标（sr）');
  ok(g.indexOf('ne dira napredak u zvaničnom kursu') >= 0, 'F0-3 明示不影响正式课程进度');
  ok(g.indexOf('~20 min') >= 0, 'F0-3 显示预计时长 ~20 min');
  const after = JSON.parse(c.ls.getItem(KEY('default')));
  ok(Object.keys(after.completedLessons).length === 1 && after.currentLessonId === 2, 'F0-3 180 completedLessons/currentLessonId 未被改动');
  c.ctx.faza0OpenTone();
  ok(c.calls.continueLearning === 0, 'F0-3 推荐卡进入 Faza0（不触发正式跳转）');
}
// 老用户已完成过 Faza0 部分 → 推荐卡显示进行中
{
  const seed = { [KEY('default')]: P180({ completedLessons: { '1': { completedAt: '2026-09-01T10:00:00', score: 80, timeSpent: 60 } } }), [TKEY]: P0({ completed: ['G1'], startedAt: '2026-09-02T09:00:00' }) };
  const c = load(seed); setLang(c, 'sr'); bootFaza(c); renderHome(c);
  ok(grid(c).indexOf('U toku') >= 0, 'F0-3b Faza0 进行中（G1 已完）显示状态');
  ok(grid(c).indexOf('1/' + IMPL.length) >= 0, 'F0-3b 进度 1/' + IMPL.length);
}

section('F0-4 Faza0 进度与 180 隔离');
{
  const seed = { [TKEY]: P0({ completed: ['G1'], startedAt: '2026-09-02T09:00:00' }) };
  const c = load(seed); setLang(c, 'sr'); bootFaza(c); renderHome(c);
  const p180 = c.ctx.getProgress();
  ok(Object.keys(p180.completedLessons || {}).length === 0 && !p180.currentLessonId, 'F0-4 Faza0 完成不进入 180 completedLessons/currentLessonId');
  ok(c.ctx.getTotalProgress().percent === 0, 'F0-4 Faza0 不计入正式 180 完成百分比');
  ok(grid(c).indexOf('U toku') >= 0, 'F0-4 Faza0 卡照常显示进行中（独立进度可见）');
  const seed2 = { [TKEY]: P0({ completed: ['G1', 'G2'], startedAt: '2026-09-02T09:00:00' }) };
  const c2 = load(seed2); setLang(c2, 'sr'); bootFaza(c2); renderHome(c2);
  ok(grid(c2).indexOf('lrn-f0-hero') < 0, 'F0-4 已开始/完成 Faza0 → 不再弹首入 hero');
  const seed3 = { [KEY('default')]: P180({}) }; // 只有 180，无 tone
  const c3 = load(seed3); setLang(c3, 'sr'); bootFaza(c3); renderHome(c3);
  const after3 = JSON.parse(c3.ls.getItem(TKEY));
  ok(after3 === null || after3.skipped !== true, 'F0-4 老用户渲染/浏览 Faza0 卡不擅自写 skip/任何 tone 状态');
  // 全 7 课完成（阶段毕业）→ 依旧只写 tone key，绝不写 180
  const seed4 = { [KEY('default')]: P180({}), [TKEY]: P0({ completed: IMPL.slice(), startedAt: '2026-09-01T09:00:00' }) };
  const c4 = load(seed4); setLang(c4, 'sr'); bootFaza(c4); renderHome(c4);
  ok(grid(c4).indexOf('data-f0-state="done"') >= 0, 'F0-4 G1–G7 全完成 → Faza0 done 卡');
  const p180b = c4.ctx.getProgress();
  ok(Object.keys(p180b.completedLessons || {}).length === 0 && !p180b.currentLessonId, 'F0-4 阶段毕业仍不进入 180 completedLessons/currentLessonId');
  ok(c4.ctx.getTotalProgress().percent === 0, 'F0-4 阶段毕业不计入正式 180 完成百分比');
}

section('F0-5 完成边界（G1–G7 全完成 = 阶段毕业；如实引导进正式课程，不伪称四声已掌握）');
{
  const seed = { [KEY('default')]: P180({ completedLessons: { '5': { completedAt: '2026-09-01T10:00:00', score: 90, timeSpent: 60 } } }), [TKEY]: P0({ completed: IMPL.slice(), startedAt: '2026-09-02T09:00:00', lastLesson: 'G7', graduated: true }) };
  const c = load(seed); setLang(c, 'sr'); bootFaza(c); renderHome(c);
  const g = grid(c);
  ok(g.indexOf('data-f0-state="done"') >= 0, 'F0-5 G1–G7 全完成 → 卡为 done');
  ok(g.indexOf('Završila si osnovnu obuku tonova') >= 0, 'F0-5 完成态标题 = §11「已完成声调基础，可进入正式课程」');
  ok(g.indexOf('Završeno') >= 0, 'F0-5 完成状态标签');
  ok(g.indexOf('Nastavi zvanični kurs') >= 0, 'F0-5 主 CTA = 进入正式课程');
  ok(g.indexOf('vrati se kad god poželiš da ih ponoviš') >= 0, 'F0-5 完成卡提示正式课程仍会用声调、可随时复习（非“结束”）');
  const noClaim = ['savladala si sva četiri tona', 'savladana sva četiri', 'sva četiri tona', 'mastered', 'mastery'];
  const bad = noClaim.filter(w => g.indexOf(w) >= 0);
  ok(bad.length === 0, 'F0-5 不出现四声已掌握/mastery 措辞' + (bad.length ? ' → ' + bad.join(',') : ''));
  ok(g.indexOf('G3–G7') < 0 && g.indexOf('uskoro') < 0 && g.indexOf('(G1–G2)') < 0, 'F0-5 无“未来还有 G3–G7/敬请期待”残留');
  ok(g.indexOf('Ponovi tonove') < 0 && g.indexOf('faza0Review()') < 0, 'F0-5 无 toneCourseReview → 复习钮不渲染（防悬空 onclick）');
  // 复习钮仅在 tone-course-ui 已加载（window.toneCourseReview 存在）时渲染
  c.ctx.window.toneCourseReview = function () { c.ctx._rev = (c.ctx._rev || 0) + 1; };
  renderHome(c);
  const g2 = grid(c);
  ok(g2.indexOf('Ponovi tonove') >= 0 && g2.indexOf('faza0Review()') >= 0, 'F0-5 有 toneCourseReview → 渲染复习钮');
  c.ctx.faza0Review();
  ok(c.ctx._rev === 1, 'F0-5 复习钮 → window.toneCourseReview（开 G7 ma 四声总辨认，不落正式课程）');
  c.ctx.faza0GoFormal();
  ok(c.calls.continueLearning === 1, 'F0-5 完成态主 CTA → 正式课程路径');
  const after = JSON.parse(c.ls.getItem(KEY('default')));
  ok(Object.keys(after.completedLessons).length === 1, 'F0-5 goFormal 不触碰 180 进度');
}
// 只完成一部分 → 不是“完成”，仍在进行中
{
  const seed = { [KEY('default')]: P180({ completedLessons: {} }), [TKEY]: P0({ completed: ['G1', 'G2', 'G3'], startedAt: '2026-09-02T09:00:00' }) };
  const c = load(seed); setLang(c, 'sr'); bootFaza(c); renderHome(c);
  const g = grid(c);
  ok(g.indexOf('data-f0-state="done"') < 0, 'F0-5b G1–G3（未完）≠ 阶段毕业');
  ok(g.indexOf('Završila si osnovnu obuku tonova') < 0, 'F0-5b 未完成不出现完成引导文案');
  ok(g.indexOf('U toku') >= 0, 'F0-5b 显示进行中');
  ok(g.indexOf('3/' + IMPL.length) >= 0, 'F0-5b 进度 3/' + IMPL.length);
}

section('F0-6 refresh 恢复 / 语言切换保态');
{
  // 同一 backing 存储重建两个会话 = 刷新后同一数据源；两次渲染应逐字节一致
  const lsShared = makeLS({ [KEY('default')]: P180({ completedLessons: { '1': { completedAt: '2026-09-01T10:00:00', score: 80, timeSpent: 60 } } }) });
  const a = load(lsShared); setLang(a, 'sr'); bootFaza(a); renderHome(a);
  const b = load(lsShared); setLang(b, 'sr'); bootFaza(b); renderHome(b);
  ok(grid(a) === grid(b), 'F0-6 刷新（同一存储重建）→ 首页 Faza0 渲染一致');
  // 语言切换：只重渲染文案，状态(skip) 保持
  const c = load(lsShared); setLang(c, 'sr'); bootFaza(c); renderHome(c);
  c.ctx.faza0Skip();
  setLang(c, 'en'); renderHome(c);
  ok(grid(c).indexOf('Sounds &amp; Tones') >= 0, 'F0-6b 切 en → 卡名英文');
  ok(c.ctx.faza0Status().skipped === true, 'F0-6b 语言切换保 skip 状态');
}

section('F0-7 源码 seam：renderChineseHome 调 renderFaza0Card + index 引模块');
{
  const ui = fs.readFileSync(path.join(BASE, 'js', 'chinese-ui.js'), 'utf8');
  ok(ui.indexOf('typeof renderFaza0Card=="function"&&renderFaza0Card()') >= 0, 'F0-7 chinese-ui renderChineseHome 尾部 typeof-guard 调用 renderFaza0Card()');
  const ci = ui.indexOf('function renderChineseHome');
  const body = ui.slice(ci, ci + 430);
  ok(body.indexOf('fillPhasePath()') >= 0 && body.indexOf('renderFaza0Card') > body.indexOf('fillPhasePath()'), 'F0-7 调用顺序：fillPhasePath → renderFaza0Card');
  const mod = fs.readFileSync(path.join(BASE, 'js', 'faza0-home.js'), 'utf8');
  ok(mod.indexOf('window.renderFaza0Card = renderFaza0Card;') >= 0 && mod.indexOf('function renderFaza0Card') >= 0, 'F0-7 module 定义+导出 renderFaza0Card');
  ok(mod.indexOf('function faza0Status') >= 0 && mod.indexOf('function faza0Skip') >= 0, 'F0-7 module 定义 faza0Status/faza0Skip');
  const idx = fs.readFileSync(path.join(BASE, 'index.html'), 'utf8');
  const iMod = idx.indexOf('js/faza0-home.js'), iBoot = idx.indexOf('js/bootstrap.js');
  ok(iMod >= 0 && iBoot >= 0 && iMod < iBoot, 'F0-7 index 引入 faza0-home.js 且在 bootstrap 之前');
}

console.log('\nverify_faza0_home: ' + passed + ' 通过, ' + failed + ' 失败');
process.exit(failed ? 1 : 0);
