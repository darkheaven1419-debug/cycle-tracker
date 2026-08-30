/* 阶段3验证脚本（node）— Step 4 静态文案专项
   修复项：1. 浏览器 title 三语动态化  2. bootstrap 加载失败三语
           3. 24 lekcija→24 lekcije     4. 复习术语 sr 统一（超期/今天到期/剩余）
           5. 热力图星期缩写 C→Č
   另含：JSON 合法性 + 资源引用存在性（用户第 7/8 项测试要求） */
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
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: k => { m.delete(k); },
  };
}
function makeDoc(opts) {
  opts = opts || {};
  const L = {};
  const texts = [];
  const elProto = {
    style: {}, classList: { add() {}, remove() {} },
    appendChild() {}, setAttribute() {},
    set textContent(v) { texts.push(String(v)); },
    get textContent() { return texts.length ? texts[texts.length - 1] : ''; },
  };
  return {
    visibilityState: 'visible', hidden: false, readyState: opts.readyState || 'loading',
    title: opts.title || '',
    documentElement: { setAttribute() {} },
    getElementById: () => null,
    querySelectorAll: () => [], querySelector: () => null,
    createElement: () => elProto,
    body: { appendChild() {} },
    addEventListener: (t, fn) => { (L[t] = L[t] || []).push(fn); },
    removeEventListener() {}, _L: L, _texts: texts,
  };
}
function makeWin(extra) {
  return Object.assign({
    addEventListener() {}, _L: {},
    switchLrnView: () => {},
    getLrnUIState: () => ({ view: 'home', phaseId: null, lessonId: null, tab: 'vocab' }),
  }, extra || {});
}
function load(file, { ls, doc, win } = {}) {
  const code = fs.readFileSync(path.join(BASE, 'js', file), 'utf8');
  const sandbox = {
    window: win || makeWin(),
    document: doc || makeDoc(),
    localStorage: ls || makeLS(),
    setInterval: () => 0, clearInterval: () => {},
    setTimeout, clearTimeout,
    Date, Math, JSON, Promise, Object, Array, String, Number, Boolean,
    parseInt, parseFloat, isNaN, console,
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: file });
  return sandbox;
}

// ---------- A: 浏览器 title 三语动态化（运行时） ----------
section('A: bootstrap 运行时 title 随语言切换');
{
  const doc = makeDoc({ readyState: 'complete' });
  const renderCalls = [];
  const win = makeWin({
    getLrnUIState: () => ({ view: 'lesson', phaseId: null, lessonId: 5, tab: 'quiz' }),
    renderLessonView: (id, tab) => renderCalls.push([id, tab]),
  });
  load('bootstrap.js', { ls: makeLS(), doc, win });
  ok(doc.title === 'Učenje kineskog · Kineski', '默认 sr → title = "Učenje kineskog · Kineski"（HTML 初始一致）');
  win.setLrnLang('en');
  ok(doc.title === 'Chinese Learning · Chinese', '切 en → title = "Chinese Learning · Chinese"');
  win.setLrnLang('zh-CN');
  ok(doc.title === '中文学习 · Chinese', '切 zh → title = "中文学习 · Chinese"');
  win.setLrnLang('sr');
  ok(doc.title === 'Učenje kineskog · Kineski', '切回 sr → title 变回塞尔维亚语');
  ok(renderCalls.length >= 1 && renderCalls[0][0] === 5 && renderCalls[0][1] === 'quiz', '切换语言后当前 lesson(5)/tab(quiz) 上下文保留并重渲染（不丢视图）');
  const ls2 = makeLS({ 'lrn-lang': 'en' });
  const doc2 = makeDoc({ readyState: 'complete' });
  load('bootstrap.js', { ls: ls2, doc: doc2, win: makeWin() });
  ok(doc2.title === 'Chinese Learning · Chinese', '刷新（lrn-lang=en）→ title 与当前语言一致');
}

// ---------- B: bootstrap 加载失败三语 ----------
section('B: bootstrap 启动失败 toast 三语');
{
  const src = fs.readFileSync(path.join(BASE, 'js', 'bootstrap.js'), 'utf8');
  ok(src.includes("LOAD_FAIL['zh-CN']") && src.includes('Greška pri učitavanju') && src.includes('Failed to load'), 'LOAD_FAIL 含三语（加载失败/Greška pri učitavanju/Failed to load）');
  ok(src.includes('toast(LOAD_FAIL[window.lang]'), 'boot() 使用 LOAD_FAIL[window.lang]（不写死中文）');
  const doc = makeDoc({ readyState: 'complete' });
  const win = makeWin();
  delete win.initChineseTab;
  load('bootstrap.js', { ls: makeLS(), doc, win });
  ok(doc._texts.indexOf('Greška pri učitavanju') >= 0, 'sr 默认 → 启动失败 toast 显示塞尔维亚语');
}

// ---------- C: index.html title 初始值 ----------
section('C: index.html <title> 初始为 sr 默认');
{
  const html = fs.readFileSync(path.join(BASE, 'index.html'), 'utf8');
  ok(html.includes('<title>Učenje kineskog · Kineski</title>'), 'title 初始 = "Učenje kineskog · Kineski"（不再三语混合）');
  ok(!html.includes('中文学习 · Kineski · Chinese'), '旧三语混合 title 已移除');
}

// ---------- D: 24 lekcija → 24 lekcije ----------
section('D: 阶段解锁提示数词变格');
{
  const src = fs.readFileSync(path.join(BASE, 'js', 'chinese-learn.js'), 'utf8');
  ok(src.includes('lekcije faze '), 'sr 已改为 "lekcije faze"');
  ok(!src.includes('lekcija faze '), '旧 "lekcija faze" 已不存在');
}

// ---------- E: 复习术语 sr 统一 ----------
section('E: 复习卡/复习页 sr 术语统一（超期/今天到期/剩余）');
{
  const src = fs.readFileSync(path.join(BASE, 'js', 'chinese-ui.js'), 'utf8');
  ok(count(src, 'Zakašnjenje ') === 2, '超期 sr "Zakašnjenje" 全站 2 处（首页+复习页）一致');
  ok(count(src, 'Preostalo ') === 2, '剩余 sr "Preostalo" 全站 2 处一致');
  ok(count(src, 'Dospijeva danas') === 2, '今天到期 sr "Dospijeva danas" 全站 2 处一致');
  ok(!src.includes('"Kasni "'), '旧首页缩写 "Kasni " 已移除');
  ok(!src.includes('"Za "+e.daysUntilDue+" d"'), '旧首页缩写 "Za …d" 已移除');
  ok(!src.includes('"Danas","Due today"'), '旧首页 "Danas" 已移除');
  ok(count(src, '"超期 "+') === 2, 'zh "超期" 保留且 2 处一致');
  ok(count(src, '"今天到期"') === 2, 'zh "今天到期" 2 处一致');
  ok(count(src, '"还有 "+') === 2, 'zh "还有 X 天" 2 处一致');
  ok(src.includes('"d late"') && src.includes('" days left"'), 'en 首页紧凑缩写与复习页完整句均保留（不改现有自然表达）');
  ok(src.includes('"Due today"'), 'en "Due today" 保留');
}

// ---------- F: 热力图星期缩写 ----------
section('F: 热力图星期缩写 Četvrtak 修正');
{
  const src = fs.readFileSync(path.join(BASE, 'js', 'chinese-panels.js'), 'utf8');
  ok(src.includes('"P U S Č P S N"'), 'sr 星期缩写 = "P U S Č P S N"');
  ok(!src.includes('"P U S C P S N"'), '旧 "C" 写法已移除');
  ok(src.includes('"M T W T F S S"'), 'en 星期缩写保留正确');
  ok(src.includes('"一二三四五六日"'), 'zh 星期缩写保留正确');
}

// ---------- I: 运行时渲染复习术语（sr→en→zh→sr，不刷新） ----------
section('I: 运行时渲染（复习术语实时切换）');
{
  const sandbox = {
    window: makeWin(), document: makeDoc(), localStorage: makeLS(),
    setInterval: () => 0, clearInterval: () => {},
    setTimeout, clearTimeout, Date, Math, JSON, Promise, Object, Array,
    String, Number, Boolean, parseInt, parseFloat, isNaN, console,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(BASE, 'js', 'chinese-learn.js'), 'utf8'), sandbox);
  vm.runInContext(fs.readFileSync(path.join(BASE, 'js', 'chinese-ui.js'), 'utf8'), sandbox);
  const ctx = sandbox;
  const item = { urgency: 'urgent', daysUntilDue: -3, lessonId: 1, topic: 'X' };
  ctx.lang = 'sr'; ctx.window.lang = 'sr';
  let h = ctx.renderReviewItemHtml(item);
  ok(h.includes('Zakašnjenje 3 dana') && !h.includes('Kasni'), 'sr 渲染 → 超期 = "Zakašnjenje 3 dana"（旧缩写消失）');
  item.daysUntilDue = 0;
  ok(ctx.renderReviewItemHtml(item).includes('Dospijeva danas'), 'sr 渲染 → 今天到期 = "Dospijeva danas"');
  item.daysUntilDue = 3;
  ok(ctx.renderReviewItemHtml(item).includes('Preostalo 3 dana'), 'sr 渲染 → 剩余 = "Preostalo 3 dana"');
  ctx.lang = 'en'; ctx.window.lang = 'en';
  item.daysUntilDue = -3;
  ok(ctx.renderReviewItemHtml(item).includes('3d late'), 'en 渲染 → 保留紧凑 "3d late"');
  ctx.lang = 'zh-CN'; ctx.window.lang = 'zh-CN';
  ok(ctx.renderReviewItemHtml(item).includes('超期 3 天'), 'zh 渲染 → "超期 3 天"');
  ctx.lang = 'sr'; ctx.window.lang = 'sr';
  ok(ctx.renderReviewItemHtml(item).includes('Zakašnjenje 3 dana'), '切回 sr → 术语实时变回');
}

// ---------- G: JSON 合法性 ----------
section('G: 数据文件 JSON 合法');
{
  let okL = true, okA = true, okC = true, msg = '';
  try { const L = JSON.parse(fs.readFileSync(path.join(BASE, 'data', 'lessons.json'), 'utf8')); okL = Array.isArray(L) && L.length === 6 && L.reduce((n, p) => n + (p.lessons || []).length, 0) === 180; } catch (e) { okL = false; msg = e.message; }
  try { const A = JSON.parse(fs.readFileSync(path.join(BASE, 'data', 'achievements.json'), 'utf8')); okA = Array.isArray(A); } catch (e) { okA = false; msg = e.message; }
  try { const C = JSON.parse(fs.readFileSync(path.join(BASE, 'data', 'culture.json'), 'utf8')); okC = Array.isArray(C) && C.length === 30; } catch (e) { okC = false; msg = e.message; }
  ok(okL, 'lessons.json 合法（6 阶段 180 课）');
  ok(okA, 'achievements.json 合法');
  ok(okC, 'culture.json 合法（30 条）' + (msg ? ' ' + msg : ''));
}

// ---------- H: 资源引用存在性 ----------
section('H: HTML 引用的资源全部存在');
{
  const html = fs.readFileSync(path.join(BASE, 'index.html'), 'utf8');
  const refs = [];
  const re = /(?:src|href)="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) { const u = m[1]; if (u.startsWith('data:') || u.startsWith('http')) continue; refs.push(u.replace(/^\//, '')); }
  const missing = refs.filter(r => !fs.existsSync(path.join(BASE, r)));
  ok(refs.length >= 7, '解析到 ' + refs.length + ' 个本地引用');
  ok(missing.length === 0, '所有本地引用存在（缺失: ' + (missing.join(', ') || '无') + '）');
  ['data/lessons.json', 'data/achievements.json', 'data/culture.json'].forEach(f => {
    ok(fs.existsSync(path.join(BASE, f)), f + ' 存在');
  });
}

console.log('\n== 汇总 ==');
console.log('通过 ' + passed + ' 项，失败 ' + failed + ' 项');
process.exit(failed ? 1 : 0);
