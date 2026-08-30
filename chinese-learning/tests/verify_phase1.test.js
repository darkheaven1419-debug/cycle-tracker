/* 阶段1验证脚本（node）— 语法/计时逻辑/语言切换路由/成就条件 */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const BASE = path.join(__dirname, '..');
let passed = 0, failed = 0;
function ok(cond, msg) {
  if (cond) { passed++; console.log('  PASS  ' + msg); }
  else { failed++; console.log('  FAIL  ' + msg); }
}
function section(s) { console.log('\n== ' + s + ' =='); }

// ---------- 运行时桩 ----------
function makeLS(seed) {
  const m = new Map(Object.entries(seed || {}).map(([k, v]) => [k, String(v)]));
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: k => { m.delete(k); },
    _dump: () => Object.fromEntries(m),
  };
}
function makeDoc() {
  const L = {};
  return {
    visibilityState: 'visible',
    hidden: false,
    readyState: 'loading', // 延迟 bootstrap boot()，避免触发真实 init
    documentElement: null,
    getElementById: () => null,
    querySelectorAll: () => [],
    addEventListener: (t, fn) => { (L[t] = L[t] || []).push(fn); },
    removeEventListener: () => {},
    _L: L,
  };
}
function makeWin() {
  const L = {};
  return { addEventListener: (t, fn) => { (L[t] = L[t] || []).push(fn); }, _L: L };
}

let NOW = 0;
function patchNow() { Date.now = () => NOW; }

function load(file, { ls, doc, win, fetchImpl } = {}) {
  const code = fs.readFileSync(path.join(BASE, 'js', file), 'utf8');
  const sandbox = {
    window: win || makeWin(),
    document: doc || makeDoc(),
    localStorage: ls || makeLS(),
    setInterval: () => 0,
    clearInterval: () => {},
    setTimeout, clearTimeout,
    Date, Math, JSON, Promise, Object, Array, String, Number, Boolean,
    parseInt, parseFloat, isNaN, console,
  };
  if (fetchImpl) sandbox.fetch = fetchImpl;
  const ctx = vm.createContext(sandbox);
  vm.runInContext(code, ctx, { filename: file });
  return sandbox;
}

// 今日日期串（与 fmtDateLocal 一致）
function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// 触发已注册事件
function fire(listeners, type, extra) {
  (listeners[type] || []).forEach(fn => { fn(extra || {}); });
}

// ---------- 测试数据 ----------
const LESSON_FIXTURE = [
  { phase: 1, lessons: [
    { id: 1, topic: { zh: '你好', sr: 'Zdravo', en: 'Hello' }, words: [
      { zh: '我', py: 'wǒ', sr: 'ja' },
      { zh: '你', py: 'nǐ', sr: 'ti' },
    ] },
    { id: 2, topic: { zh: '谢谢', sr: 'Hvala', en: 'Thanks' }, words: [
      { zh: '我', py: 'wǒ', sr: 'ja' },
      { zh: '好', py: 'hǎo', sr: 'dobro' },
    ] },
  ]},
];
const ACH_FIXTURE = JSON.parse(fs.readFileSync(path.join(BASE, 'data', 'achievements.json'), 'utf8'));

// ---------- T1: P1-1 语言切换路由 ----------
section('T1: bootstrap setLrnLang 路由（P1-1）');
{
  const calls = { phase: null, lesson: null, view: null };
  const win = {
    addEventListener: () => {},
    getLrnUIState: () => ({ view: 'lesson', lessonId: 7, tab: 'quiz', phaseId: null }),
    renderPhaseLessons: id => { calls.phase = id; },
    renderLessonView: (id, tab) => { calls.lesson = [id, tab]; },
    switchLrnView: v => { calls.view = v; },
  };
  load('bootstrap.js', { win, ls: makeLS({ 'lrn-lang': 'zh-CN' }), doc: makeDoc() });
  win.setLrnLang('sr');
  ok(calls.lesson && calls.lesson[0] === 7 && calls.lesson[1] === 'quiz',
    'lesson 视图切换语言 → 调用 renderLessonView(7, quiz)，不跳回首页');

  win.getLrnUIState = () => ({ view: 'phase', phaseId: 3, lessonId: null, tab: 'vocab' });
  win.setLrnLang('en');
  ok(calls.phase === 3, 'phase 视图切换语言 → 调用 renderPhaseLessons(3)');

  win.getLrnUIState = () => ({ view: 'home', phaseId: null, lessonId: null, tab: 'vocab' });
  win.setLrnLang('zh-CN');
  ok(calls.view === 'home', 'home 视图切换语言 → 调用 switchLrnView(home)');

  const savedLang = makeLS();
  const win2 = { addEventListener: () => {}, getLrnUIState: () => ({ view: 'home' }), switchLrnView: () => {} };
  const b2 = load('bootstrap.js', { win: win2, ls: savedLang, doc: makeDoc() });
  b2.window.setLrnLang('sr');
  ok(savedLang.getItem('lrn-lang') === 'sr', '语言持久化到 localStorage.lrn-lang');
}

// ---------- T2..T6: P1-2 计时逻辑 ----------
section('T2: 基础计时（可见+交互时段计入）');
{
  patchNow(); NOW = 1_000_000;
  const s = load('chinese-learn.js');
  const w = s.window, doc = s.document;
  w.startLessonTimer(1);
  NOW += 65_000;
  fire(doc._L, 'click');            // 交互 → lastAct 推进
  const elapsed = w.endLessonTimer(1);
  ok(elapsed === 65, '65s 活跃学习 → endLessonTimer 返回 65');
  w.recordLearningTime(elapsed);   // 离开课程路径：由调用方记账
  const p = JSON.parse(s.localStorage.getItem('chinese-progress-default'));
  ok(p.totalTimeSpent === 65 && p.dailyStats[todayStr()].timeSpent === 65,
    'totalTimeSpent=65，dailyStats[today].timeSpent=65');
}

section('T3: 长 idle 不计时');
{
  patchNow(); NOW = 2_000_000;
  const s = load('chinese-learn.js');
  s.window.startLessonTimer(2);
  NOW += 600_000;                    // 10 分钟无交互（>5min idle）
  const elapsed = s.window.endLessonTimer(2);
  ok(elapsed === 0, 'idle 10min 无交互 → 计时 0（不虚高）');
}

section('T4: 隐藏标签页时段不计时');
{
  patchNow(); NOW = 3_000_000;
  const s = load('chinese-learn.js');
  const doc = s.document, w = s.window;
  w.startLessonTimer(3);
  NOW += 30_000;
  fire(doc._L, 'click');                                 // 交互确认前段 30s
  doc.hidden = true; fire(doc._L, 'visibilitychange');   // 切走
  NOW += 60_000;
  doc.hidden = false; fire(doc._L, 'visibilitychange');  // 切回
  NOW += 20_000;
  fire(doc._L, 'click');                                 // 交互确认后段 20s
  const elapsed = w.endLessonTimer(3);
  ok(elapsed === 50, '可见30s+20s、隐藏60s → 只计 50s（隐藏段不计）');
}

section('T5: 切换课程先结算上一课');
{
  patchNow(); NOW = 4_000_000;
  const s = load('chinese-learn.js');
  const doc = s.document, w = s.window;
  w.startLessonTimer(4);
  NOW += 40_000;
  fire(doc._L, 'click');
  w.startLessonTimer(5);            // 切换到第5课 → 先结算第4课
  const p = JSON.parse(s.localStorage.getItem('chinese-progress-default'));
  ok(p.totalTimeSpent === 40, '切课先结算上一课 40s 计入');
  const elapsed = w.endLessonTimer(5);
  ok(elapsed === 0, '新课无学习 → 0');
}

section('T6: pagehide 保存 pending，刷新后消费（bfcache 安全）');
{
  // 第一段：产生 90s，触发 pagehide 保存
  patchNow(); NOW = 5_000_000;
  const s1 = load('chinese-learn.js');
  const doc1 = s1.document, w1 = s1.window;
  w1.startLessonTimer(6);
  NOW += 90_000;
  fire(doc1._L, 'click');
  fire(w1._L, 'pagehide');          // 离开页面
  const pending = JSON.parse(s1.localStorage.getItem('lrn-timer-pending'));
  ok(pending && pending.seconds === 90 && pending.lessonId === 6,
    'pagehide 写入 lrn-timer-pending seconds=90');
  ok(s1.localStorage.getItem('chinese-progress-default') === null,
    'pending 尚未计入进度（等下次加载消费）');

  // 第二段：模拟刷新后加载，消费 pending
  patchNow(); NOW = 5_001_000;
  const ls2 = makeLS({ 'lrn-timer-pending': JSON.stringify({ lessonId: 6, seconds: 90, date: todayStr() }) });
  const s2 = load('chinese-learn.js', { ls: ls2 });
  const p2 = JSON.parse(ls2.getItem('chinese-progress-default'));
  ok(p2.totalTimeSpent === 90, '刷新后消费 pending → totalTimeSpent=90');
  ok(ls2.getItem('lrn-timer-pending') === null, 'pending 键已清除');
}

// ---------- T7/T8: P1-4 成就 ----------
section('T7: countLearnedWords + wordsLearned 条件（P1-4）');
{
  patchNow(); NOW = 6_000_000;
  const mkFetch = lessons => url => Promise.resolve({
    ok: true,
    json: () => Promise.resolve(url.indexOf('lessons') >= 0 ? lessons : ACH_FIXTURE),
  });
  // 小样本：3 个去重词 → words_50 不解锁
  const s = load('chinese-learn.js', { fetchImpl: mkFetch(LESSON_FIXTURE) });
  const w = s.window;
  w.loadLessonData(() => {});
  setTimeout(() => {
    const prog = { completedLessons: { '1': {}, '2': {} } };
    ok(w.countLearnedWords(prog) === 3, '已通过两课去重词数 = 3（我/你/好）');
    const r1 = w.markLessonComplete(1, 60, 0);
    ok(!r1.some(a => a && a.id === 'words_50'), '3 词 < 50 → words_50 不误解锁');
    // 大样本：55 课每课 1 个唯一词 → words_50 应解锁，words_100 不解锁
    const bigLessons = [];
    for (let i = 1; i <= 55; i++) bigLessons.push({
      id: i, topic: { zh: '主题' + i, sr: 'Tema' + i, en: 'Topic' + i },
      words: [{ zh: '词' + i, py: 'ci' + i, sr: 'rec' + i }],
    });
    const seedProg = {
      version: 2, completedLessons: {}, currentLessonId: null, totalPoints: 0, totalTimeSpent: 0,
      studyStreak: { current: 0, longest: 0, lastDate: null }, reviews: {}, achievements: {},
      dailyStats: {}, perfectScores: 0, quizResults: {}, dailyGoal: 3, favoriteWords: [],
    };
    const bigLS = makeLS({ 'chinese-progress-default': JSON.stringify(seedProg) });
    const s2 = load('chinese-learn.js', { ls: bigLS, fetchImpl: mkFetch([{ phase: 1, lessons: bigLessons }]) });
    const w2 = s2.window;
    w2.loadLessonData(() => {});
    setTimeout(() => {
      const prog2 = { completedLessons: {} };
      for (let i = 1; i <= 55; i++) prog2.completedLessons[String(i)] = {};
      ok(w2.countLearnedWords(prog2) === 55, '55 课 55 个唯一词 → countLearnedWords=55');
      const fullProg = JSON.parse(bigLS.getItem('chinese-progress-default'));
      fullProg.completedLessons = prog2.completedLessons;
      bigLS.setItem('chinese-progress-default', JSON.stringify(fullProg));
      const r2 = w2.markLessonComplete(56, 60, 0);  // 用新课 56 触发真实成就检查（55 课进度已含 lesson 1，重测不重算成就）
      ok(r2.some(a => a && a.id === 'words_50'), '55 词 ≥ 50 → words_50 解锁');
      ok(!r2.some(a => a && a.id === 'words_100'), '55 词 < 100 → words_100 不解锁');
    }, 20);
  }, 20);
}

section('T8: achievements.json 完整性（P1-3/P1-4）');
{
  const ach = JSON.parse(fs.readFileSync(path.join(BASE, 'data', 'achievements.json'), 'utf8'));
  ok(ach.length === 20, '成就总数仍为 20');
  ok(!ach.some(a => a.condition && a.condition.type === 'totalPoints'),
    '不再有任何成就使用 totalPoints 条件');
  const w50 = ach.find(a => a.id === 'words_50');
  ok(w50.condition.type === 'wordsLearned' && w50.condition.value === 50, 'words_50 → wordsLearned:50');
  ok(w50.description.zh === '学习50个词' && w50.description.sr === 'Naučite 50 riječi' && w50.description.en === 'Learn 50 words',
    'words_50 描述三语一致');
  const all = ach.find(a => a.id === 'all_complete');
  ok(all.description.zh === '完成全部180课', 'all_complete 错别字已修复（全逗→全部）');
  const t10 = ach.find(a => a.id === 'time_10h');
  ok(t10.condition.type === 'timeSpent' && t10.condition.value === 600, 'time_10h 保持 timeSpent:600');
}

setTimeout(() => {
  console.log('\n== 汇总 ==');
  console.log('通过 ' + passed + ' 项，失败 ' + failed + ' 项');
  process.exit(failed ? 1 : 0);
}, 150);
