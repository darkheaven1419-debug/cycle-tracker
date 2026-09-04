/* V1.1 声调练习（Tone Drill）专项验证（node）
 * 覆盖 18 项 MVP 要求：toneOf 纯函数 / 题池四声覆盖与去重 / 已学优先 + 补池 /
 * 视觉降级（无 voice）/ 音频自动播放 / 对错反馈 / 答错自动重播 / 看答案 / 结果卡 /
 * 语言切换保留状态 / 关闭清理 / 入口按钮三语 / bootstrap hook / 不写进度与 localStorage。
 * 用法: node tests/verify_tone.test.js
 */
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const BASE = path.join(__dirname, '..');
let passed = 0, failed = 0;
function ok(c, l) { if (c) { passed++; console.log('  PASS  ' + l); } else { failed++; console.log('  FAIL  ' + l); } }
function section(s) { console.log('\n== ' + s + ' =='); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
const count = (s, sub) => s.split(sub).length - 1;

/* ---------- DOM 桩：可捕获 body/head 追加节点、按 id 复用、innerHTML 可读 ---------- */
function makeLS(seed) {
  const m = new Map(Object.entries(seed || {}).map(([k, v]) => [k, String(v)]));
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: k => { m.delete(k); },
    _dump: () => Object.fromEntries(m),
  };
}
function makeDoc2() {
  const byId = {};
  function makeEl(tag) {
    return {
      tagName: tag, style: {}, parentNode: null, children: [], _html: '',
      set innerHTML(v) { this._html = String(v); },
      get innerHTML() { return this._html; },
      appendChild(c) { c.parentNode = this; this.children.push(c); },
      removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); if (c.id) delete byId[c.id]; c.parentNode = null; },
      remove() { if (this.parentNode) this.parentNode.removeChild(this); },
      querySelectorAll: () => [], setAttribute() {}, addEventListener() {},
    };
  }
  const body = makeEl('body'); const head = makeEl('head');
  const doc = {
    readyState: 'complete', documentElement: { setAttribute() {} }, title: '', hidden: false,
    getElementById: id => byId[id] || null,
    createElement: tag => makeEl(tag),
    body, head,
    addEventListener() {}, removeEventListener() {}, querySelectorAll: () => [],
    _byId: byId,
  };
  return doc;
}
function reg(el, byId) { if (el.id) byId[el.id] = el; }

/* ---------- 上下文装载：chinese-learn（真实 180 课）+ chinese-tone ---------- */
function loadToneCtx(opts) {
  opts = opts || {};
  const ls = makeLS(opts.seed);
  const doc = makeDoc2();
  const origAppendB = doc.body.appendChild, origAppendH = doc.head.appendChild;
  doc.body.appendChild = function (el) { origAppendB.call(this, el); reg(el, doc._byId); };
  doc.head.appendChild = function (el) { origAppendH.call(this, el); reg(el, doc._byId); };
  const win = { addEventListener() {}, removeEventListener() {}, _L: {} };
  const sandbox = {
    window: win, document: doc, localStorage: ls,
    setTimeout, clearTimeout, setInterval: () => 0, clearInterval: () => {},
    Date, Math, JSON, Promise, Object, Array, String, Number, Boolean,
    parseInt, parseFloat, isNaN, console,
    navigator: { vibrate: () => {} }, fetch: () => Promise.resolve(),
  };
  if (opts.audio) {
    const ss = {
      spoken: [], cancel() {}, getVoices: () => [{ lang: 'zh-CN', name: 'Ting-Tong' }],
      speak(u) { this.spoken.push({ text: u.text, lang: u.lang, rate: u.rate }); }, addEventListener() {},
    };
    sandbox.speechSynthesis = ss; win.speechSynthesis = ss;
    sandbox.SpeechSynthesisUtterance = function (t) { this.text = t; this.lang = ''; this.rate = 1; this.volume = 1; this.voice = null; };
    win._ensureChineseVoice = () => Promise.resolve(true);
  } else {
    win._ensureChineseVoice = () => Promise.resolve(false); // 显式无 voice → 降级
  }
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(BASE, 'js', 'chinese-learn.js'), 'utf8'), sandbox);
  vm.runInContext(fs.readFileSync(path.join(BASE, 'js', 'chinese-tone.js'), 'utf8'), sandbox);
  // LESSONS_DATA 在 chinese-learn.js 中是词法全局，须在 context 内赋值
  const raw = JSON.parse(fs.readFileSync(path.join(BASE, 'data', 'lessons.json'), 'utf8'));
  const flat = [];
  raw.forEach(p => { (p.lessons || []).forEach(l => flat.push(l)); });
  vm.runInContext('LESSONS_DATA=' + JSON.stringify(flat) + '; applyPhaseAssignments();', sandbox);
  sandbox.lang = opts.lang || 'sr'; sandbox.window.lang = sandbox.lang;
  return { ctx: sandbox, doc, ls, win };
}
function setLang(c, l) { c.ctx.lang = l; c.ctx.window.lang = l; }
function ovl(c) { const h = c.doc._byId['lrn-tone-overlay']; return h ? h.innerHTML : ''; }
const DIR_SR = { 1: '1 · visok', 2: '2 · uzlazni', 3: '3 · silaz.-uzlaz.', 4: '4 · silazni' };

(async () => {

  /* ============ T1 toneOf / unmarkTone 纯函数 ============ */
  section('T1: toneOf 声调解析（全标记集 + 轻声/null）');
  {
    const { ctx } = loadToneCtx({});
    const toneOf = ctx.window.toneOf, unmark = ctx.window.unmarkTone;
    const map = { mā: 1, má: 2, mǎ: 3, mà: 4, bēi: 1, chá: 2, hǎo: 3, dào: 4, wū: 1, nú: 2, gǔ: 3, bù: 4, xī: 1, qí: 2, lǐ: 3, jì: 4, gē: 1, shé: 2, hěn: 3, zhè: 4, lǜ: 4, lǘ: 2, qù: 4, nǚ: 3 };
    let allGood = true;
    for (const k in map) if (toneOf(k) !== map[k]) { allGood = false; console.log('    toneOf(' + k + ')=' + toneOf(k) + ' 期望 ' + map[k]); }
    ok(allGood, 'toneOf 全 24 标记（六韵母四声）→ 1/2/3/4');
    ok(toneOf('ma') === null && toneOf('me') === null && toneOf('le') === null && toneOf('de') === null, '轻声（无调号）→ null');
    ok(toneOf('') === null && toneOf(null) === null && toneOf(undefined) === null, '空/缺省 → null');
    ok(toneOf('huānyíng') === 2, '多音节取最后带调元音（huānyíng → í → 2）');
    ok(toneOf('wǒ') === 3 && toneOf('xièxie') === 4 && toneOf('xièxie') === 4, 'wǒ=3；xièxie 带调音节 è → 4（轻声尾不覆盖）');
    ok(unmark('mā') === 'ma' && unmark('nǚ') === 'nü' && unmark('lǜ') === 'lü', 'unmarkTone 去调号（ü 保留）');
  }

  /* ============ T2 buildToneQuestions：四声覆盖 / 去重 / 数量 / 已学优先 ============ */
  section('T2: buildToneQuestions 题池纯函数');
  {
    const { ctx } = loadToneCtx({});
    const build = ctx.window.buildToneQuestions;
    const mk = (zh, py) => ({ zh: zh, py: py, sr: 'x', tone: ctx.window.toneOf(py) });
    const P = ['妈mā', '花huā', '吃chī', '山shān', '书shū'];
    const Q = ['麻má', '来lái', '学xué', '人rén', '茶chá'];
    const R = ['马mǎ', '好hǎo', '老lǎo', '水shuǐ', '九jiǔ'];
    const S = ['骂mà', '大dà', '看kàn', '坐zuò', '四sì'];
    const all = P.concat(Q, R, S);
    const words = all.map(function (x, i) { const w = mk(x.slice(0, 1), x.slice(1)); w.fromReserve = i >= 16; return w; });
    const qs = build(words, { round: 8 });
    ok(qs.length === 8, '默认一轮 8 题（实际 ' + qs.length + '）');
    const tones = {}, seen = {};
    qs.forEach(x => { tones[x.tone] = (tones[x.tone] || 0) + 1; seen[x.zh] = (seen[x.zh] || 0) + 1; });
    ok(tones[1] >= 1 && tones[2] >= 1 && tones[3] >= 1 && tones[4] >= 1, '四声各 ≥1（实际 ' + JSON.stringify(tones) + '）');
    let dup = 0; for (const k in seen) if (seen[k] > 1) dup++;
    ok(dup === 0, '轮内无重复汉字');
    const res = qs.filter(x => x.fromReserve);
    ok(qs.length - res.length >= 6, '已学范围词优先（8 题中 ≥6 题主池，reserve=' + res.length + '）');
    const small = build(words.slice(0, 3), { round: 8 });
    ok(small.length === 3, '池不足 → 有多少出多少（' + small.length + '），不凑数');
  }

  /* ============ T3 toneWordInfo 判定 ============ */
  section('T3: toneWordInfo 单字单音节 + 带调过滤');
  {
    const { ctx } = loadToneCtx({});
    const ti = ctx.window.toneWordInfo;
    ok(ti({ zh: '妈', py: 'mā', sr: 'mama' }).tone === 1, '单字+单音节+带调 → 收录');
    ok(ti({ zh: '你好', py: 'nǐ hǎo', sr: 'zdravo' }) === null, '双字/拼音含空格 → 排除');
    ok(ti({ zh: '的', py: 'de', sr: 'od' }) === null, '轻声无调 → 排除');
    ok(ti({ zh: '爱', py: 'ài', sr: 'ljubav' }).tone === 4, '带调复韵母 ài → 4');
    ok(ti(null) === null && ti({ zh: '妈' }) === null, 'null/缺 py → 排除');
  }

  /* ============ T4 真实数据题池：已学优先 + 补池 + 四声全覆盖 ============ */
  section('T4: buildRound(lessonId) 真实 180 课数据');
  {
    const { ctx } = loadToneCtx({});
    const gPool = ctx.window.getToneQuestionPool, br = ctx.window.buildRound;
    const p1 = gPool(1);
    ok(p1.items.length >= 8 && p1.meta.primary >= 0, 'lesson 1：题池充足（primary=' + p1.meta.primary + ' reserve=' + p1.meta.reserve + '）');
    ok(p1.meta.reserve > p1.meta.primary, 'lesson 1：未学范围作补池（reserve>primary）');
    const p180 = gPool(180);
    ok(p180.meta.reserve === 0 && p180.meta.primary > 100, 'lesson 180：全部已学（reserve=0，primary=' + p180.meta.primary + '）');
    for (const lid of [1, 3, 30, 60]) {
      const qs = br(lid, 8);
      const tS = {};
      qs.forEach(x => { tS[x.tone] = (tS[x.tone] || 0) + 1; });
      const clean = qs.length === 8 && qs.every(x => x.zh.length === 1 && String(x.py).indexOf(' ') < 0 && ctx.window.toneOf(x.py) === x.tone);
      ok(clean && tS[1] >= 1 && tS[2] >= 1 && tS[3] >= 1 && tS[4] >= 1,
        'lesson ' + lid + ' → 8 题单字单音节带调、四声全覆盖（' + JSON.stringify(tS) + '）');
    }
  }

  /* ============ T5 视觉降级（无 voice）：打开 + 参照条 + 无播放 + 只露无调拼音 ============ */
  section('T5: openToneDrill 视觉降级（voice=false）');
  {
    const c = loadToneCtx({ seed: { 'chinese-progress-default': JSON.stringify({ completedLessons: { '1': { completedAt: '2026-08-29T10:00:00', score: 80, timeSpent: 60 } }, studyStreak: { current: 1, longest: 1, lastDate: '2026-08-29' } }) } });
    c.ctx.window.openToneDrill(1);
    await sleep(15);
    const st = c.ctx.window.toneGetState();
    ok(st.open && st.total === 8 && st.qi === 0, '8 题会话开始（open total=8）');
    ok(st.visualOnly === true && st.voice === false, '无 voice → visualOnly 降级模式');
    ok(!!c.doc._byId['lrn-tone-overlay'], 'overlay 注入 body');
    const html = ovl(c);
    ok(html.includes('Vežbanje tonova'), '标题 sr：Vežbanje tonova');
    ok(count(html, 'class="lrn-tone-opt"') === 4, '4 个声调选项按钮');
    ok(html.includes('<small>ā</small>1') && html.includes('<small>á</small>2') && html.includes('<small>ǎ</small>3') && html.includes('<small>à</small>4'), '选项 = 声调符号+编号 1-4');
    for (const t of [1, 2, 3, 4]) ok(html.includes(DIR_SR[t]), '参照条含 ' + DIR_SR[t] + '（符号+编号+sr 方向）');
    ok(html.includes('Koji je ovo ton?'), '提问 sr：Koji je ovo ton?');
    ok(html.includes('Audio nije dostupan'), '降级提示可见');
    ok(!html.includes('lrn-tone-replay'), '视觉模式无「再听一次」');
    const q0 = st.questions[0];
    const plain = c.ctx.window.unmarkTone(q0.py);
    ok(html.includes(q0.zh), '题面含汉字 ' + q0.zh);
    ok(html.indexOf('lrn-tone-pynote">' + plain) >= 0, '视觉题面只露去调拼音 ' + plain);
    ok(html.indexOf(q0.py) < 0, '题面不含带调拼音（不泄调）');
    ok(q0.sr !== undefined && q0.sr !== '', '题目携带 sr 释义');
    const keys = Object.keys(c.ls._dump()).filter(k => k.indexOf('chinese-progress') === 0);
    ok(keys.length === 1, '练习后未新增进度键（localStorage 键数 1=' + keys.length + '）');
  }

  /* ============ T6 答对 → correct + 完整反馈（汉字/拼音/数字/方向/sr） ============ */
  section('T6: 答对反馈');
  {
    const c = loadToneCtx({});
    c.ctx.window.openToneDrill(1); await sleep(15);
    const q = c.ctx.window.toneGetState().questions[0];
    c.ctx.window.toneChooseTone(q.tone);
    const st = c.ctx.window.toneGetState();
    ok(st.correct === 1 && st.answered === 1, '答对 → correct=1 answered=1');
    const html = ovl(c);
    ok(html.includes('Tačno!'), '正确反馈 Tačno!');
    ok(html.includes(q.zh) && html.includes(q.py) && html.includes(String(q.tone)), '反馈含汉字/' + q.py + '/数字 ' + q.tone);
    ok(html.includes(DIR_SR[q.tone].split(' · ')[1]), '反馈含第 ' + q.tone + ' 声方向（' + DIR_SR[q.tone] + '）');
    ok(html.includes(q.sr), '反馈含 sr 释义');
  }

  /* ============ T7 答错 → 明确正确答案 + 不计数 + 已作答锁定 ============ */
  section('T7: 答错反馈');
  {
    const c = loadToneCtx({});
    c.ctx.window.openToneDrill(1); await sleep(15);
    const q = c.ctx.window.toneGetState().questions[0];
    const wrong = [1, 2, 3, 4].find(t => t !== q.tone);
    c.ctx.window.toneChooseTone(wrong);
    const st = c.ctx.window.toneGetState();
    ok(st.correct === 0 && st.answered === 1, '答错 → correct 不变');
    const html = ovl(c);
    ok(html.includes('Nije tačno — to je ' + q.tone + '. ton'), '答错文案明确第 ' + q.tone + ' 声（sr）');
    ok(html.includes(q.py) && html.includes(String(q.tone)), '答错也显示正确带调拼音与数字');
    c.ctx.window.toneChooseTone(q.tone);
    ok(c.ctx.window.toneGetState().correct === 0, '已作答后重复点选无效（锁）');
  }

  /* ============ T8 推进 → 结果卡（数/百分比/鼓励/再练一轮/完成）+ 重开重置 ============ */
  section('T8: 推进到结果卡');
  {
    const c = loadToneCtx({});
    c.ctx.window.openToneDrill(1); await sleep(15);
    let guard = 0;
    while (!c.ctx.window.toneGetState().done && guard < 30) {
      const s = c.ctx.window.toneGetState();
      c.ctx.window.toneChooseTone(s.questions[s.qi].tone);
      c.ctx.window.toneNextQ();
      guard++;
    }
    const st = c.ctx.window.toneGetState();
    ok(st.done && st.answered === 8 && st.correct === 8, '8 题全对 → done（correct=8）');
    const html = ovl(c);
    ok(html.includes('Kraj runde'), '结果卡标题 sr：Kraj runde');
    ok(html.includes('8 / 8'), '正确数 8 / 8');
    ok(html.includes('100%'), '正确率 100%');
    ok(html.includes('Odlično!'), '高分鼓励语（Odlično!）');
    ok(html.includes('Još jedna runda'), '「再练一轮」按钮');
    ok(html.includes('Zatvori'), '「完成」按钮');
    c.ctx.window.restartToneDrill(); await sleep(15);
    const st2 = c.ctx.window.toneGetState();
    ok(st2.open && !st2.done && st2.total === 8 && st2.correct === 0 && st2.answered === 0, '再练一轮 → 全新 8 题重置');
  }

  /* ============ T9 看答案（不计数、可推进） ============ */
  section('T9: 看答案');
  {
    const c = loadToneCtx({});
    c.ctx.window.openToneDrill(1); await sleep(15);
    const q = c.ctx.window.toneGetState().questions[0];
    c.ctx.window.toneReveal();
    const st = c.ctx.window.toneGetState();
    ok(st.answered === 1 && st.correct === 0, '看答案 → answered 计入、correct 不计');
    const html = ovl(c);
    ok(html.includes('Odgovor:') && html.includes(q.py) && html.includes(String(q.tone)), '揭晓答案（Odgovor + 拼音 + 数字）');
    c.ctx.window.toneNextQ();
    ok(c.ctx.window.toneGetState().qi === 1, '揭晓后可推进下一题');
  }

  /* ============ T10 关闭清理 ============ */
  section('T10: 关闭');
  {
    const c = loadToneCtx({});
    c.ctx.window.openToneDrill(1); await sleep(15);
    c.ctx.window.toneChooseTone(c.ctx.window.toneGetState().questions[0].tone);
    c.ctx.window.closeToneDrill();
    ok(!c.ctx.window.toneGetState().open, '状态 open=false');
    ok(!c.doc._byId['lrn-tone-overlay'], 'overlay 已从 DOM 移除');
  }

  /* ============ T11 语言切换：保留会话/当前题/已答，仅刷新文案 ============ */
  section('T11: 语言切换保留状态 + 文案跟随');
  {
    const c = loadToneCtx({});
    c.ctx.window.openToneDrill(1); await sleep(15);
    const q0 = c.ctx.window.toneGetState().questions[0];
    c.ctx.window.toneChooseTone(q0.tone);
    const before = c.ctx.window.toneGetState();
    setLang(c, 'en'); c.ctx.window.toneOnLangSwitch();
    const en = c.ctx.window.toneGetState();
    ok(en.open && en.qi === before.qi && en.total === 8 && en.correct === 1 && en.answered === 1, 'en 切换 → 会话/当前题/答对数全保留');
    const htmlEn = ovl(c);
    ok(htmlEn.includes('Tone Drill') && htmlEn.includes('Which tone?'), 'en 文案跟随');
    ok(htmlEn.includes(q0.zh) && htmlEn.includes(q0.py), 'en 视图仍显示同一题 汉字+带调拼音');
    ok(htmlEn.includes('high level'), '参照条方向随语言切到英文');
    setLang(c, 'zh-CN'); c.ctx.window.toneOnLangSwitch();
    const zh = c.ctx.window.toneGetState();
    ok(zh.correct === 1 && zh.qi === before.qi, 'zh 再切 → 状态仍保留');
    ok(ovl(c).includes('声调练习') && ovl(c).includes('这是第几声？'), 'zh 文案跟随');
  }

  /* ============ T12 音频模式：voice=true → 自动播放（无降级、无注音泄露） ============ */
  section('T12: 音频模式自动播放');
  {
    const c = loadToneCtx({ audio: true });
    c.ctx.window.openToneDrill(1);
    await sleep(40); // 等 _ensureChineseVoice resolve
    const st = c.ctx.window.toneGetState();
    ok(st.voice === true && st.visualOnly === false, 'voice=true → 音频模式');
    const html = ovl(c);
    ok(!html.includes('Audio nije dostupan'), '音频模式无降级提示');
    ok(count(html, 'Poslušaj ponovo') === 1, '音频模式显示「再听一次」');
    ok(!html.includes('lrn-tone-pynote'), '音频题面无 pinyin 注音（纯听辨不泄调）');
    ok(c.ctx.speechSynthesis.spoken.length >= 1, '当前题自动播放（utterance ≥1）');
    const sp = c.ctx.speechSynthesis.spoken[0];
    ok(sp.lang === 'zh-CN' && sp.rate === 0.6, '播放参数 zh-CN / rate .6');
    ok(sp.text === st.questions[0].zh, '播放文本 = 当前题汉字');
  }

  /* ============ T13 答错 → 自动重播一次（音频）；再听一次手动重播 ============ */
  section('T13: 答错自动重播（音频）');
  {
    const c = loadToneCtx({ audio: true });
    c.ctx.window.openToneDrill(1);
    await sleep(40);
    const q = c.ctx.window.toneGetState().questions[0];
    const before = c.ctx.speechSynthesis.spoken.length;
    const wrong = [1, 2, 3, 4].find(t => t !== q.tone);
    c.ctx.window.toneChooseTone(wrong);
    ok(c.ctx.window.toneGetState().correct === 0, '答错不计 correct');
    await sleep(650);
    const after = c.ctx.speechSynthesis.spoken.length;
    ok(after === before + 1, '答错后自动重播一次（spoken ' + before + '→' + after + '）');
    ok(ovl(c).includes('Nije tačno — to je ' + q.tone + '. ton'), '答错文案明确正确声');
    c.ctx.window.toneReplay();
    await sleep(40);
    ok(c.ctx.speechSynthesis.spoken.length === after + 1, '「再听一次」→ 手动重播（spoken +1）');
  }

  /* ============ T14 入口（chinese-ui 压缩）+ bootstrap hook + 脚本序 + 不触完成/连击 ============ */
  section('T14: 源码集成锚点');
  {
    const ui = fs.readFileSync(path.join(BASE, 'js', 'chinese-ui.js'), 'utf8');
    ok(count(ui, 'openToneDrill(\'+n+\')') === 1, 'chinese-ui Practice 渲染声调按钮（唯一）');
    ok(ui.includes('声调练习') && ui.includes('Vežbanje tonova') && ui.includes('Tone Drill'), '按钮三语标签齐全');
    ok(ui.indexOf('Vežbanje tonova') > ui.indexOf('Vežba slušanja'), '声调按钮排在听力按钮之后');
    const boot = fs.readFileSync(path.join(BASE, 'js', 'bootstrap.js'), 'utf8');
    ok(boot.includes('window.toneOnLangSwitch'), 'bootstrap.setLrnLang 调用 toneOnLangSwitch hook');
    const html = fs.readFileSync(path.join(BASE, 'index.html'), 'utf8');
    ok(html.includes('js/chinese-tone.js'), 'index.html 加载 chinese-tone.js');
    ok(html.indexOf('chinese-tone.js') > html.indexOf('chinese-listen.js') && html.indexOf('bootstrap.js') > html.indexOf('chinese-tone.js'), '脚本序 listen → tone → bootstrap');
    const tone = fs.readFileSync(path.join(BASE, 'js', 'chinese-tone.js'), 'utf8');
    ok(!/(localStorage\.(set|get|remove)Item|completedLessons|markLessonComplete|studyStreak)/.test(tone), 'tone 不写 localStorage / 不算完成一课 / 不触碰连击');
  }

  console.log('\n---');
  console.log('verify_tone: ' + passed + '/' + (passed + failed) + ' 通过');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
