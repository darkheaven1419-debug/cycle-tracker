/* UX-11A 每日回访问候句
   验证：getVisitGreeting() 状态判断（A1-A12）+ fillDailyMotivation 选句优先不破坏 8 条激励 */
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

function makeLS(seed) {
  const m = new Map(Object.entries(seed || {}).map(([k, v]) => [k, String(v)]));
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: k => { m.delete(k); },
    _dump: () => Object.fromEntries(m),
  };
}
function makeWin() { const L = {}; return { addEventListener: (t, fn) => { (L[t] = L[t] || []).push(fn); }, _L: L }; }
function makeDoc() { const L = {}; return { visibilityState: 'visible', hidden: false, readyState: 'loading', documentElement: null, getElementById: () => null, querySelectorAll: () => [], addEventListener: (t, fn) => { (L[t] = L[t] || []).push(fn); }, removeEventListener: () => {}, _L: L }; }
// fillDailyMotivation 的 DOM mock：捕获插入的 innerHTML
function motivDoc() {
  const capt = { removed: false, inserted: null };
  const motivEl = { remove() { capt.removed = true; } };
  const streakEl = { parentNode: { insertBefore(el, ref) { capt.inserted = el; } }, nextSibling: null };
  return {
    capt,
    doc: {
      visibilityState: 'visible', hidden: false, readyState: 'loading', documentElement: null,
      getElementById: id => id === 'lrnStreakCard' ? streakEl : (id === 'lrnDailyMotivation' ? motivEl : null),
      querySelectorAll: () => [], addEventListener: () => {}, removeEventListener: () => {},
      createElement: () => ({ id: '', className: '', innerHTML: '' }),
    },
  };
}
// 与 fmtDateLocal 一致的本地日期串
function dateStr(offset) {
  const d = new Date(); d.setDate(d.getDate() + offset);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function seed(over) {
  return Object.assign({
    version: 2, completedLessons: {}, currentLessonId: null, totalPoints: 0, totalTimeSpent: 0,
    studyStreak: { current: 0, longest: 0, lastDate: null }, reviews: {}, achievements: {},
    dailyStats: {}, perfectScores: 0, quizResults: {}, dailyGoal: 3, favoriteWords: [],
  }, over);
}
function loadPair({ ls, doc } = {}) {
  const sandbox = {
    window: makeWin(), document: doc || makeDoc(), localStorage: ls || makeLS(),
    navigator: { userAgent: 'node', platform: 'node', maxTouchPoints: 0 },
    speechSynthesis: null, setInterval: () => 0, clearInterval: () => {},
    setTimeout, clearTimeout, Date, Math, JSON, Promise, Object, Array, String, Number, Boolean,
    parseInt, parseFloat, isNaN, console, activeProfile: 'default',
  };
  const ctx = vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(BASE, 'js', 'chinese-learn.js'), 'utf8'), ctx, { filename: 'chinese-learn.js' });
  vm.runInContext(fs.readFileSync(path.join(BASE, 'js', 'chinese-ui.js'), 'utf8'), ctx, { filename: 'chinese-ui.js' });
  sandbox.lang = 'sr'; // _() 检查的是 vm 全局 lang，非 window.lang
  return { win: sandbox.window, ctx };
}

// ---------- A1: 新用户 ----------
section('A1: 新用户（无任何学习记录）');
{
  const ls = makeLS({ 'chinese-progress-default': JSON.stringify(seed({})) });
  const { win } = loadPair({ ls });
  ok(win.getVisitGreeting() === null, '新用户 → 无状态句（回落随机激励）');
}

// ---------- A2/A3: 昨天学过、今天没学，连续还在 ----------
section('A2/A3: 昨天学过、今天没学，连续还在');
{
  const ls = makeLS({ 'chinese-progress-default': JSON.stringify(seed({
    completedLessons: { '1': {} },
    studyStreak: { current: 3, longest: 5, lastDate: dateStr(-1) },
  })) });
  const { win } = loadPair({ ls });
  const g = win.getVisitGreeting();
  ok(g && typeof g === 'object', '返回状态句对象');
  ok(g.sr.indexOf('Već 3 dana zaredom') >= 0, 'sr 邀请继续: Već 3 dana zaredom → ' + g.sr);
  ok(g.zh.indexOf('已连续 3 天') >= 0, 'zh 邀请继续: 已连续 3 天');
  ok(g.en.indexOf('3 days in a row') >= 0, 'en 邀请继续: 3 days in a row');
}

// ---------- A3b: 连续=1 单数变格 ----------
section('A3b: 连续=1（单数变格 dan/day）');
{
  const ls = makeLS({ 'chinese-progress-default': JSON.stringify(seed({
    completedLessons: { '1': {} },
    studyStreak: { current: 1, longest: 1, lastDate: dateStr(-1) },
  })) });
  const { win } = loadPair({ ls });
  const g = win.getVisitGreeting();
  ok(g.sr.indexOf('Već 1 dan zaredom') >= 0, 'sr 单数: 1 dan（非 dana）');
  ok(g.en.indexOf('1 day in a row') >= 0, 'en 单数: 1 day');
}

// ---------- A4: 连续已断 ----------
section('A4: 连续已断（昨天没学、更早学过）');
{
  const ls = makeLS({ 'chinese-progress-default': JSON.stringify(seed({
    completedLessons: { '1': {} },
    studyStreak: { current: 3, longest: 5, lastDate: dateStr(-3) },
  })) });
  const { win } = loadPair({ ls });
  const g = win.getVisitGreeting();
  ok(g && g.sr.indexOf('Nema problema') >= 0 && g.sr.indexOf('svaki dan je novi početak') >= 0, 'sr 重新开始: Nema problema — svaki dan je novi početak');
  ok(g.sr.indexOf('Već') < 0, 'sr 不含邀请句 Već');
  ok(g.zh.indexOf('没关系') >= 0 && g.zh.indexOf('重新出发') >= 0, 'zh 重新开始: 没关系…重新出发');
  ok(g.en.indexOf('No worries') >= 0 && g.en.indexOf('every day is a fresh start') >= 0, 'en 重新开始: No worries');
}

// ---------- A5: 今天已学 ----------
section('A5: 今天已学');
{
  const today = dateStr(0);
  const ls = makeLS({ 'chinese-progress-default': JSON.stringify(seed({
    completedLessons: { '1': {} },
    studyStreak: { current: 2, longest: 2, lastDate: today },
    dailyStats: { [today]: { lessonsCompleted: 1, timeSpent: 0, pointsEarned: 0 } },
  })) });
  const { win } = loadPair({ ls });
  ok(win.getVisitGreeting() === null, '今天已学 ≥1 课 → 无状态句（用随机激励）');
}

// ---------- A6: 今日目标已完成 ----------
section('A6: 今日目标已完成（不重复庆祝）');
{
  const today = dateStr(0);
  const ls = makeLS({ 'chinese-progress-default': JSON.stringify(seed({
    completedLessons: { '1': {} },
    studyStreak: { current: 2, longest: 2, lastDate: dateStr(-1) },
    dailyStats: { [today]: { lessonsCompleted: 3, timeSpent: 0, pointsEarned: 0 } },
  })) });
  const { win } = loadPair({ ls });
  ok(win.getVisitGreeting() === null, '今日 3/3 达成 → 无状态句（不重复庆祝）');
}

// ---------- A7/A8: 刷新与同日稳定 ----------
section('A7/A8: 刷新与同一天多次打开文案稳定（无随机）');
{
  const mk = () => JSON.stringify(seed({
    completedLessons: { '1': {} },
    studyStreak: { current: 3, longest: 5, lastDate: dateStr(-1) },
  }));
  const a = loadPair({ ls: makeLS({ 'chinese-progress-default': mk() }) }).win.getVisitGreeting();
  const b = loadPair({ ls: makeLS({ 'chinese-progress-default': mk() }) }).win.getVisitGreeting();
  ok(JSON.stringify(a) === JSON.stringify(b), '刷新（重载沙箱）后文案一致');
  const s = loadPair({ ls: makeLS({ 'chinese-progress-default': mk() }) }).win;
  let stable = true;
  for (let i = 0; i < 5; i++) if (JSON.stringify(s.getVisitGreeting()) !== JSON.stringify(a)) stable = false;
  ok(stable, '同一天连续 5 次调用文案稳定（无随机）');
}

// ---------- A9/A10/A11: 三语 ----------
section('A9/A10/A11: 三语文案完整且互不相同');
{
  const ls = makeLS({ 'chinese-progress-default': JSON.stringify(seed({
    completedLessons: { '1': {} },
    studyStreak: { current: 7, longest: 7, lastDate: dateStr(-1) },
  })) });
  const g = loadPair({ ls }).win.getVisitGreeting();
  ok(g.zh && g.sr && g.en, '邀请句三语字段均非空');
  ok(g.zh !== g.sr && g.sr !== g.en && g.zh !== g.en, '邀请句三语互不相同');
  const ls2 = makeLS({ 'chinese-progress-default': JSON.stringify(seed({
    completedLessons: { '1': {} },
    studyStreak: { current: 3, longest: 5, lastDate: dateStr(-3) },
  })) });
  const r = loadPair({ ls: ls2 }).win.getVisitGreeting();
  ok(r.zh && r.sr && r.en, '重新开始句三语字段均非空');
}

// ---------- A12: 不影响现有 8 条激励 ----------
section('A12: 不影响现有 8 条激励（新用户回落 8 条按日期取模）');
{
  const MOTIV_SR = [
    'Svaki dan po malo — kap koja buši kamen! 💧',
    'Učenje jezika je ključ za novi svet 🔑',
    'Ne plaši se sporosti, plaši se stajanja! 🏃',
    'Prelepa si kad pričaš kineski 💕',
    'Današnji trud je sutrašnja sloboda 🕊️',
    'Učiti i vežbati — nije li to radost? 📚',
    'Svaki kineski znak je slika 🎨',
    'Učiti kineski sa tobom je najlepša stvar 💑',
  ];
  const { doc, capt } = motivDoc();
  const ls = makeLS({ 'chinese-progress-default': JSON.stringify(seed({})) });
  const { ctx } = loadPair({ ls, doc });
  vm.runInContext('fillDailyMotivation()', ctx);
  ok(capt.inserted && capt.inserted.innerHTML.indexOf('lrn-daily-motivation-icon') >= 0, '渲染每日激励容器');
  ok(capt.inserted && capt.inserted.innerHTML.indexOf('💬') >= 0, '包含 💬 图标');
  const d = new Date();
  const idx = (1e4 * d.getFullYear() + 100 * (d.getMonth() + 1) + d.getDate()) % MOTIV_SR.length;
  ok(capt.inserted && capt.inserted.innerHTML.indexOf(MOTIV_SR[idx]) >= 0, '新用户回落 8 条激励（今日第 ' + (idx + 1) + ' 条）');
  const html = capt.inserted.innerHTML;
  ok(html.indexOf('Već') < 0 && html.indexOf('Nema problema') < 0 && html.indexOf('重新出发') < 0 && html.indexOf('No worries') < 0,
    '新用户渲染不含任何状态句文案');
}

// ---------- A12b: 今天已学也回落 8 条激励 ----------
section('A12b: 今天已学同样回落 8 条激励（不显示状态句）');
{
  const today = dateStr(0);
  const { doc, capt } = motivDoc();
  const ls = makeLS({ 'chinese-progress-default': JSON.stringify(seed({
    completedLessons: { '1': {} },
    studyStreak: { current: 2, longest: 2, lastDate: today },
    dailyStats: { [today]: { lessonsCompleted: 1, timeSpent: 0, pointsEarned: 0 } },
  })) });
  const { ctx } = loadPair({ ls, doc });
  vm.runInContext('fillDailyMotivation()', ctx);
  const html = capt.inserted.innerHTML;
  ok(html.indexOf('lrn-daily-motivation-icon') >= 0 && html.indexOf('💬') >= 0, '今天已学仍渲染 💬 激励');
  ok(html.indexOf('Već') < 0 && html.indexOf('Nova sedmica') < 0, '今天已学不显示状态句');
}

setTimeout(() => {
  console.log('\n== 汇总 ==');
  console.log('UX-11A 通过 ' + passed + ' 项，失败 ' + failed + ' 项');
  process.exit(failed ? 1 : 0);
}, 50);
