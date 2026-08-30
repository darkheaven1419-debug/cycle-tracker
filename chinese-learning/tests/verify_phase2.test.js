/* 阶段2验证脚本（node）— 默认语言 / 三语映射 / 静态 UI 三语
   Step 1: 默认语言 sr（仅新用户）+ 塞尔维亚语文案修复 */
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const BASE = path.join(__dirname, '..');
let passed = 0, failed = 0;
function ok(c, l) { if (c) { passed++; console.log('  PASS  ' + l); } else { failed++; console.log('  FAIL  ' + l); } }
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
function makeDoc() {
  const L = {};
  return {
    visibilityState: 'visible', hidden: false, readyState: 'loading',
    documentElement: null, getElementById: () => null,
    querySelectorAll: () => [], querySelector: () => null,
    createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {}, setAttribute: () => {} }),
    body: { appendChild: () => {} },
    addEventListener: (t, fn) => { (L[t] = L[t] || []).push(fn); },
    removeEventListener: () => {}, _L: L,
  };
}
function makeWin() { return { addEventListener: () => {}, _L: {} }; }

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

// ---------- Step 1: 默认语言 ----------
section('Step1-A: 默认语言（新用户 sr / 已选择保留 / 不覆盖旧数据）');
{
  const s = load('bootstrap.js', { ls: makeLS(), doc: makeDoc(), win: makeWin() });
  ok(s.window.lang === 'sr', '清空语言 localStorage → 首次进入默认 sr');
}
{
  const s = load('bootstrap.js', { ls: makeLS({ 'lrn-lang': 'en' }), doc: makeDoc(), win: makeWin() });
  ok(s.window.lang === 'en', '已选 English → 刷新/重开保留 en');
}
{
  const s = load('bootstrap.js', { ls: makeLS({ 'lrn-lang': 'zh-CN' }), doc: makeDoc(), win: makeWin() });
  ok(s.window.lang === 'zh-CN', '已选 Chinese → 刷新/重开保留 zh-CN');
}
{
  const s = load('bootstrap.js', { ls: makeLS({ 'lrn-lang': 'sr' }), doc: makeDoc(), win: makeWin() });
  ok(s.window.lang === 'sr', '已选 Serbian → 刷新/重开保留 sr');
}
{
  const ls = makeLS({ 'lrn-lang': 'zh-CN', 'chinese-progress-default': '{"version":2,"totalPoints":123}' });
  load('bootstrap.js', { ls, doc: makeDoc(), win: makeWin() });
  ok(ls.getItem('lrn-lang') === 'zh-CN', '加载过程不覆盖已选语言 lrn-lang');
  ok(ls.getItem('chinese-progress-default') === '{"version":2,"totalPoints":123}', '旧进度数据不被覆盖');
}
{
  const ls = makeLS();
  const win = makeWin();
  win.switchLrnView = () => {};
  win.getLrnUIState = () => ({ view: 'home', phaseId: null, lessonId: null, tab: 'vocab' });
  const s = load('bootstrap.js', { ls, doc: makeDoc(), win });
  s.window.setLrnLang('en');
  ok(ls.getItem('lrn-lang') === 'en', '手动切换 English → 持久化 lrn-lang=en');
}

// ---------- Step 1: 塞尔维亚语文案 ----------
section('Step1-B: 塞尔维亚语文案修复');
{
  const ui = fs.readFileSync(path.join(BASE, 'js', 'chinese-ui.js'), 'utf8');
  ok(!ui.includes('najlepša st let'), '旧错字 "st let" 已移除');
  ok(ui.includes('najlepša stvar'), '已修正为 "najlepša stvar"');
  const src = fs.readFileSync(path.join(BASE, 'js', 'bootstrap.js'), 'utf8');
  ok(src.includes("DEFAULT_LANG = 'sr'"), 'bootstrap 默认语言已改为 sr');
}

// ---------- Step 2: P2-1 Culture 三语完整化 ----------
section('Step2-A: culture.json 内容完整性（30/30 三语，无缺失/空串/重复id）');
let CULTURE = null;
try {
  CULTURE = JSON.parse(fs.readFileSync(path.join(BASE, 'data', 'culture.json'), 'utf8'));
  ok(true, 'culture.json 为合法 JSON');
} catch (e) {
  ok(false, 'culture.json 为合法 JSON → 解析失败: ' + e.message);
}
if (CULTURE) {
  ok(Array.isArray(CULTURE) && CULTURE.length === 30, '共 30 条文化条目');
  const ids = CULTURE.map(c => c.id);
  ok(new Set(ids).size === ids.length, 'id 无重复');
  const missing = CULTURE.filter(c =>
    !c.id || !c.zh || !c.sr || !c.en || !c.icon ||
    !c.desc || typeof c.desc !== 'object' ||
    !c.desc.zh || !c.desc.sr || !c.desc.en);
  ok(missing.length === 0, '30 条均有 zh/sr/en 标题 + desc{zh,sr,en}（无缺失字段）');
  const blanks = CULTURE.filter(c =>
    !c.zh.trim() || !c.sr.trim() || !c.en.trim() ||
    !c.desc.zh.trim() || !c.desc.sr.trim() || !c.desc.en.trim());
  ok(blanks.length === 0, '标题与三语 desc 均非空白');
  ok(CULTURE.every(c => Array.isArray(c.tags) && c.tags.length > 0), 'tags 数组保留且非空（未破坏现有字段）');
  const orig = fs.readFileSync(path.join(BASE, 'data', 'culture.json'), 'utf8');
  ok(/Kineska Nova Godina/.test(orig) && /Najvažniji praznik u Kini/.test(orig), '塞尔维亚原文 desc.sr 保留未改写');
}

let cultureAsync = null; // Step2-B 动态卡异步断言链（汇总需等待其完成）
let LESSONS = null; // Step3-A 对话数据（汇总前完成断言）
section('Step2-B: 渲染语言实时切换（zh → sr → en → zh）');
{
  const ls = makeLS();
  const doc = makeDoc();
  const capture = { innerHTML: '' };
  doc.getElementById = id => (id === 'lrn-culture-card-dynamic' ? capture : null);
  const win = makeWin();
  win.lang = 'zh-CN';
  const s = load('chinese-ui.js', { ls, doc, win });
  // _ 注入（与 chinese-learn.js 的 _ 签名一致），供加载文案调用
  s._ = (zh, sr, en) => (win.lang === 'sr' ? sr : win.lang === 'en' ? en : zh);
  s.fetch = url => Promise.resolve({ ok: true, json: () => Promise.resolve(CULTURE) });
  const lesson = { culture: { zh: '嵌入·春节', sr: 'Embed·Nova Godina', en: 'Embed·Chinese New Year' } };
  const h1 = s.renderCultureTab(lesson);
  ok(h1.includes('嵌入·春节') && !h1.includes('Embed·'), 'zh 语言 → 嵌入文化卡显示中文');
  win.lang = 'sr'; s.lang = 'sr';
  ok(s.renderCultureTab(lesson).includes('Embed·Nova Godina'), 'sr 语言 → 嵌入文化卡显示塞尔维亚语');
  win.lang = 'en'; s.lang = 'en';
  ok(s.renderCultureTab(lesson).includes('Embed·Chinese New Year'), 'en 语言 → 嵌入文化卡显示英文');
  win.lang = 'zh-CN'; s.lang = 'zh-CN';
  ok(s.renderCultureTab(lesson).includes('嵌入·春节'), '切回 zh → 嵌入卡实时变回中文');
  // 动态卡（异步 50ms 加载 data/culture.json）
  // 说明：renderCultureTab 每次调用都会调度新的 50ms 定时器 → loadCultureData → fetch → 回填。
  // 语言切换后必须等下一次定时器回填完成再断言（轮询等待，消除竞态，确定性通过）。
  const c = CULTURE[1]; // (null||1)%30 → 第 2 条
  const waitFor = (pred, ms) => new Promise(res => {
    const t0 = Date.now();
    (function poll() {
      if (pred()) return res(true);
      if (Date.now() - t0 > ms) return res(false);
      setTimeout(poll, 25);
    })();
  });
  win.lang = 'zh-CN'; s.lang = 'zh-CN';
  s.renderCultureTab(lesson); // 预热：触发 50ms 定时器 + fetch → 缓存就绪
  cultureAsync = waitFor(() => capture.innerHTML.includes(c.zh) && capture.innerHTML.includes(c.desc.zh), 1500)
    .then(okZh => {
      ok(okZh, '动态文化卡已渲染（zh）');
      win.lang = 'sr'; s.lang = 'sr';
      s.renderCultureTab(lesson);
      return waitFor(() => capture.innerHTML.includes(c.sr) && capture.innerHTML.includes(c.desc.sr), 1500);
    })
    .then(okSr => {
      ok(okSr, 'sr → 动态卡标题+描述为塞尔维亚语');
      win.lang = 'zh-CN'; s.lang = 'zh-CN';
      s.renderCultureTab(lesson);
      return waitFor(() => capture.innerHTML.includes(c.zh) && capture.innerHTML.includes(c.desc.zh), 1500);
    })
    .then(okZh2 => ok(okZh2, '切回 zh → 动态卡实时变为中文'));
}

section('Step2-C: _cultureField 回退链（当前语言 → en → sr → zh，绝不出现 undefined/空串）');
{
  const s = load('chinese-ui.js', { ls: makeLS(), doc: makeDoc(), win: makeWin() });
  const f = s._cultureField;
  ok(typeof f === 'function', '_cultureField 已定义');
  const full = { zh: '中文', sr: 'Srpski', en: 'English' };
  s.window.lang = 'zh-CN'; ok(f(full) === '中文', 'zh → 取 zh');
  s.window.lang = 'sr';    ok(f(full) === 'Srpski', 'sr → 取 sr');
  s.window.lang = 'en';    ok(f(full) === 'English', 'en → 取 en');
  s.window.lang = 'en';    ok(f({ zh: '中文', sr: 'Srpski', en: '' }) === 'Srpski', 'en 缺失 → 回退 sr');
  s.window.lang = 'zh-CN'; ok(f({ zh: '中文', sr: '', en: '' }) === '中文', 'en/sr 均缺 → 回退 zh');
  s.window.lang = 'sr';    ok(f({ zh: '', sr: '', en: 'English' }) === 'English', 'sr/zh 均缺 → 回退 en');
  ok(f(null) === '' && f(undefined) === '' && f('str') === '' && f(42) === '', '非法输入 → 空串（非 undefined）');
}

// ---------- Step 3: P2-2 Dialog 三语完整化 ----------
section('Step3-A: lessons.json 对话数据完整性（180 课 100% zh/sr/en，无结构错误）');
try {
  LESSONS = JSON.parse(fs.readFileSync(path.join(BASE, 'data', 'lessons.json'), 'utf8'));
  ok(true, 'lessons.json 为合法 JSON');
} catch (e) {
  ok(false, 'lessons.json 为合法 JSON → 解析失败: ' + e.message);
}
if (LESSONS) {
  ok(Array.isArray(LESSONS) && LESSONS.length === 6, '共 6 个阶段');
  const lessons = LESSONS.flatMap(p => (p && p.lessons) || []);
  ok(lessons.length === 180, '共 180 课');
  ok(lessons.filter(l => !l.dialog || typeof l.dialog !== 'object').length === 0, '每课都有 dialog 对象');
  ok(lessons.filter(l => !l.dialog || !l.dialog.zh || !l.dialog.sr || !l.dialog.en).length === 0, 'dialog zh/sr/en 字段 100% 存在');
  ok(lessons.filter(l => !l.dialog.zh.trim() || !l.dialog.sr.trim() || !l.dialog.en.trim()).length === 0, 'zh/sr/en 均非空白');
  const mis = lessons.filter(l => {
    const z = l.dialog.zh.split('\n').filter(x => x.trim());
    const s = l.dialog.sr.split('\n').filter(x => x.trim());
    const e = l.dialog.en.split('\n').filter(x => x.trim());
    return z.length !== s.length || s.length !== e.length;
  });
  ok(mis.length === 0, 'zh/sr/en 行数两两一致（180 课全对齐）');
  const badPrefix = lessons.filter(l => ['zh', 'sr', 'en'].some(k => l.dialog[k].split('\n').filter(x => x.trim()).some(ln => !/^[AB]:/.test(ln))));
  ok(badPrefix.length === 0, '所有行均以半角 A:/B: 开头');
  ok(lessons.filter(l => ['zh', 'sr', 'en'].some(k => /undefined|null|\[object Object\]/.test(l.dialog[k]))).length === 0, '无 undefined/null/[object Object] 文本');
  const oneSpeaker = lessons.filter(l => {
    const z = l.dialog.zh.split('\n').filter(x => x.trim());
    return z.length < 2 || !z.some(x => x.startsWith('A:')) || !z.some(x => x.startsWith('B:'));
  });
  ok(oneSpeaker.length === 0, '每段对话 ≥2 行且同时含 A 与 B 说话人');
}

section('Step3-B: 对话渲染（中文正文 + 当前语言翻译行，实时切换）');
{
  const ls = makeLS();
  const doc = makeDoc();
  const win = makeWin();
  win.lang = 'zh-CN';
  const s = load('chinese-ui.js', { ls, doc, win });
  s._ = (zh, sr, en) => (win.lang === 'sr' ? sr : win.lang === 'en' ? en : zh);
  s.escapeHtml = x => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const dlg = { zh: 'A: 你好！\nB: 早上好！\nA: 谢谢！', sr: 'A: Zdravo!\nB: Dobro jutro!\nA: Hvala!', en: 'A: Hello!\nB: Good morning!\nA: Thanks!' };
  const lesson = { dialog: dlg };
  let h;
  win.lang = 'zh-CN';
  h = s.renderGrammarTab(lesson);
  ok(h.includes('情景对话') && h.includes('你好！'), 'zh → 对话标题与中文正文');
  ok(!h.includes('lrn-dialog-sr'), 'zh → 不显示翻译行（中文即学习内容）');
  win.lang = 'sr';
  h = s.renderGrammarTab(lesson);
  ok(h.includes('Zdravo!') && h.includes('lrn-dialog-sr'), 'sr → 显示塞尔维亚语翻译行');
  win.lang = 'en';
  h = s.renderGrammarTab(lesson);
  ok(h.includes('Hello!') && h.includes('lrn-dialog-sr'), 'en → 显示英语翻译行');
  win.lang = 'zh-CN';
  h = s.renderGrammarTab(lesson);
  ok(!h.includes('lrn-dialog-sr'), '切回 zh → 翻译行实时消失');
  win.lang = 'sr';
  h = s.renderGrammarTab(lesson);
  ok((h.match(/lrn-dialog-bubble/g) || []).length === 3, '气泡数 = 中文行数(3)');
  ok(h.includes('speaker-a') && h.includes('speaker-b'), 'A/B 说话人气泡类名正确');
  ok(h.includes('>你好！<') && !h.includes('>A: 你好'), '中文行剥离 "A: " 前缀');
  ok(h.includes('>Zdravo!<') && !h.includes('>A: Zdravo'), '塞尔维亚行剥离 "A: " 前缀');
  const evil = { dialog: { zh: 'A: <script>x</script>', sr: 'A: X', en: 'A: X' } };
  ok(s.renderGrammarTab(evil).includes('&lt;script&gt;'), 'escapeHtml 转义对话内容（XSS 防护）');
}

section('Step3-C: _dialogTransLines 回退链（当前语言 → en → sr → zh，不掩盖缺失）');
{
  const s = load('chinese-ui.js', { ls: makeLS(), doc: makeDoc(), win: makeWin() });
  const f = s._dialogTransLines;
  ok(typeof f === 'function', '_dialogTransLines 已定义');
  const full = { zh: 'A: 中文\nB: 中文', sr: 'A: Srpski\nB: Srpski', en: 'A: English\nB: English' };
  s.window.lang = 'zh-CN'; ok(f(full).length === 0, 'zh → 不返回翻译行');
  s.window.lang = 'zh';    ok(f(full).length === 0, 'zh 短码 → 不返回翻译行');
  s.window.lang = 'sr';    ok(f(full)[0] === 'A: Srpski', 'sr → 取 sr 翻译');
  s.window.lang = 'en';    ok(f(full)[0] === 'A: English', 'en → 取 en 翻译');
  s.window.lang = 'en';    ok(f({ zh: 'A: 中文', sr: 'A: Srpski', en: '' })[0] === 'A: Srpski', 'en 缺失 → 回退 sr');
  s.window.lang = 'sr';    ok(f({ zh: 'A: 中文', sr: '', en: '' })[0] === 'A: 中文', 'sr/en 均缺 → 回退 zh（测试报告记录 sr 缺失）');
  s.window.lang = 'sr';    ok(f({ zh: 'A: 中文', sr: '   ', en: 'A: English' })[0] === 'A: English', 'sr 空白 → 跳过取 en');
  ok(f(null).length === 0 && f(undefined).length === 0 && f('str').length === 0 && f(42).length === 0, '非法输入 → 空数组');
}

Promise.resolve(cultureAsync).then(() => {
  console.log('\n== 汇总 ==');
  console.log('通过 ' + passed + ' 项，失败 ' + failed + ' 项');
  process.exit(failed ? 1 : 0);
});
