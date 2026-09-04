/* Faza 0 声调课程（tone-course-ui）阶段3 专项验证（node，DOM/voice 桩，不连真实浏览器）
 * 覆盖（对应用户阶段3要求）：
 *   U1 G1 教学：四声四卡 + 曲线渲染 + 每卡单独播放/可重播 + 无评分 + 无失败状态
 *   U2 G2 顺序 Teach→Listen→Mimic→Check + listen 自动播/重听/换词 + mimic 自报与 next 门
 *   U3 G2 Check 二元判分：只答「是否 T1」、参照不污染 mastery、温和 Result、中段完成推进到 G3
 *   U4 语言切换 sr→zh→en 保留 lesson/step/题目/作答状态；刷新后经 active 续学
 *   U5 无中文 voice → 明确三语视觉模式提示、隐藏播放钮、不假装已播放；Check 视觉降级可继续
 *   U6 移动端静态结构：卡片 frame/scroll 防横向溢出、触控目标 ≥44px、max-width 380 媒体查询
 *   U7 G4 一比四 whichTone：双选项(1/4)、逐题认号、真识别入账、全程不产生 2/3
 *   U8 G6 两步 check：isTone(3) 先单独练 → whichTone[2,3,4] 再混，跨步 acc 累积、一次 Result
 *   U9 G7 毕业四选一：8 题覆盖 mā/má/mǎ/mà、完成关闭 DOM + graduated、toneCourseReview 复习重开
 *   U10 zh-CN 归一：window.lang='zh-CN' → 渲染中文（旧逻辑会错误回退到 sr/en）
 * 用法: node tests/verify_tone_course_ui.test.js
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

/* ---------- DOM / LS 桩（镜像 verify_tone_course.test.js）---------- */
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

/* ---------- 上下文装载：tone-course 引擎 + tone-course-ui，注入真实课程数据 ----------
 * voice:true → 提供 zh-CN voice（听得到）；缺省 false → 无中文 voice（视觉降级） */
function loadCourseUiCtx(opts) {
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
  if (opts.voice) {
    const ss = {
      spoken: [], cancel() {}, getVoices: () => [{ lang: 'zh-CN', name: 'Ting-Tong' }],
      speak(u) { this.spoken.push({ text: u.text, lang: u.lang, rate: u.rate }); }, addEventListener() {},
    };
    function Utt(t) { this.text = t; this.lang = ''; this.rate = 1; this.volume = 1; this.voice = null; }
    sandbox.speechSynthesis = ss; win.speechSynthesis = ss;
    sandbox.SpeechSynthesisUtterance = Utt; win.SpeechSynthesisUtterance = Utt;
  }
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(BASE, 'js', 'tone-course.js'), 'utf8'), sandbox);
  vm.runInContext(fs.readFileSync(path.join(BASE, 'js', 'tone-course-ui.js'), 'utf8'), sandbox);
  const course = JSON.parse(fs.readFileSync(path.join(BASE, 'data', 'tone-course.json'), 'utf8'));
  vm.runInContext('window.tcSetData(' + JSON.stringify(course) + ');', sandbox);
  const lang = opts.lang || 'sr';
  sandbox.lang = lang; win.lang = lang;
  return { ctx: sandbox, doc, ls, win };
}
const setLang = (c, l) => { c.ctx.lang = l; c.ctx.window.lang = l; };
const st = c => c.ctx.window.toneCourseGetState();
const html = c => (c.doc._byId['tcc-host'] || { innerHTML: '' }).innerHTML;
const spk = c => (c.ctx.window.speechSynthesis ? c.ctx.window.speechSynthesis.spoken : []);
const prog = c => { const r = c.ls.getItem('chinese-tone-course-default'); return r ? JSON.parse(r) : null; };
const TONE_KEY = 'chinese-tone-course-default';
const W = c => c.ctx.window;

(async () => {

  /* ============ U1 G1 教学：四声卡片、可播可重播、无评分、无失败 ============ */
  section('U1: G1 教学步骤（voice on）');
  {
    const c = loadCourseUiCtx({ voice: true });
    W(c).toneCourseStartLesson('G1');
    ok(st(c).open && st(c).lessonId === 'G1' && st(c).stepIdx === 0, '打开 G1 → 第 0 步（explain）');
    let h = html(c);
    ok(h.includes('Šta je ton'), '标题 sr：Šta je ton');
    ok(h.includes('To su tonovi.'), 'explain 正文 sr 展示');
    ok(h.indexOf('tcc-result') < 0, 'G1 无结果卡（非考试）');
    W(c).toneCourseNext(); // → cards
    ok(st(c).stepIdx === 1, '下一步 = 卡片步');
    h = html(c);
    ok(count(h, '<div class="tcc-card-t">') === 4, '四张声调卡（1/2/3/4）');
    for (const g of ['ā', 'á', 'ǎ', 'à']) ok(h.includes(g), '卡片含调号 ' + g);
    ok(count(h, 'role="img" aria-label="ton ') === 4, '四卡各带 SVG 曲线');
    ok(count(h, 'onclick="toneCoursePlayCard(') === 4, '每卡可单独播放');
    W(c).toneCoursePlayCard(0);
    ok(spk(c).length === 1 && spk(c)[0].text === '妈', '点卡片1 → 播放 妈');
    W(c).toneCoursePlayCard(0);
    ok(spk(c).length === 2 && spk(c)[1].text === '妈', '同一卡再点 → 重播（可重听）');
    ok((prog(c) || { completed: [] }).completed.length === 0, 'G1 途中未完成（无评分教学）');
    W(c).toneCourseNext(); // 末步 → Result
    const s = st(c);
    ok(s.result && s.result.passed === true, 'G1 无失败路径：走完即温和完成');
    h = html(c);
    ok(h.includes('tcc-result') && h.includes('Čula si sva četiri tona'), '概念课 Result（sr）');
    ok(prog(c).completed.indexOf('G1') >= 0, '完成 G1 已记录');
  }

  /* ============ U2 G2 顺序 Teach→Listen→Mimic→Check + 播/重听/自报 ============ */
  section('U2: G2 流程顺序与各步（voice on）');
  {
    const c = loadCourseUiCtx({ voice: true });
    W(c).toneCourseStartLesson('G2');
    let s = st(c);
    ok(s.lessonId === 'G2' && s.stepIdx === 0, 'G2 从 teach 开始');
    let h = html(c);
    ok(h.includes('>mā<'), 'teach 展示标准音 mā（大）');
    ok(h.includes('Prvi ton — visok i ravan'), 'teach 标题/目标 sr');
    ok(h.includes('onclick="toneCoursePlaySample()"'), 'teach 有「先听标准读法」');
    W(c).toneCoursePlaySample();
    ok(spk(c)[spk(c).length - 1].text === '妈', '标准读法 → 播放 妈');
    W(c).toneCourseNext(); // → listen
    s = st(c);
    ok(s.stepIdx === 1, '第 2 步 = listen');
    h = html(c);
    ok(count(h, '<button class="tcc-chip') === 4, 'listen 四词条（妈三书八）');
    ok(h.includes('Pusti ponovo'), 'listen 有明显「🔁 再听一次」（sr）');
    await sleep(330); // autoplay focus
    const spoke = spk(c);
    ok(spoke.length >= 1 && spoke[spoke.length - 1].text === '妈', '进入 listen 自动播当前词 妈');
    W(c).toneCourseFocusWord(2);
    W(c).toneCoursePlayWord();
    ok(spk(c)[spk(c).length - 1].text === '八', '换词后重听 → 八');
    W(c).toneCourseNext(); // → mimic
    s = st(c);
    ok(s.stepIdx === 2 && s.mimicDone === false, '第 3 步 = mimic（未自报）');
    h = html(c);
    ok(h.includes('Zvuči slično') && h.includes('Ne baš'), '自报两钮（像/不太像）');
    ok(h.includes('disabled'), '自报前「继续」禁用（先给反馈）');
    W(c).toneCourseMimic(true);
    ok(st(c).mimicDone === true, '自报「像」后 mimicDone');
    h = html(c);
    ok(h.includes('Zabeleženo') && h.indexOf('disabled') < 0, '自报回执出现、next 解禁');
    const p = prog(c);
    ok(p.self && p.self['1'] && p.self['1'].length === 1 && p.self['1'][0].like === true, '自报存证 self[1]（仅自报）');
    ok((p.tone && p.tone['1']) === undefined, '自报不计入 mastery（无自动朗读判分）');
    W(c).toneCourseNext(); // → check
    ok(st(c).stepIdx === 3, '第 4 步 = check');
  }

  /* ============ U3 G2 Check 二元判分 + mastery 隔离 + 温和 Result ============ */
  section('U3: G2 Check（voice on, 原序回合）');
  {
    const c = loadCourseUiCtx({ voice: true });
    // 预完成 G1 → 本次完成 G2（7 课课程序列中段）→ ResultAction 应推进到 G3，非关闭
    W(c).tcSaveProgress(W(c).tcCompleteLesson(W(c).tcLoadProgress(), 'G1', '2026-09-05'));
    W(c).toneCourseSetKeepOrder(true);
    W(c).toneCourseStartLesson('G2');
    W(c).toneCourseNext(); W(c).toneCourseNext(); W(c).toneCourseMimic(true); W(c).toneCourseNext();
    let h = html(c);
    ok(h.includes('Je li ovo prvi ton (visok i ravan)?'), '提问 sr：是否第一声（二元）');
    ok(count(h, 'class="tcc-ans') === 2, '两答案钮（是/不是），非 1/2/3/4 四选一');
    ok(h.indexOf('mā') < 0, '音频模式题面不泄带调拼音（不提示答案）');
    ok(h.includes('onclick="toneCoursePlayCheck()"'), '题干可重听');
    // q0 = 妈(T1) 答「是」
    W(c).toneCourseAnswer(true);
    let s = st(c);
    ok(s.right === 1 && s.total === 1 && s.lastRight === true, 'q0 是 T1 答「是」→ 对');
    h = html(c);
    ok(h.includes('Tačno!'), '即时反馈 对');
    let p = prog(c);
    ok(p.tone['1'] && p.tone['1'].r.join(',') === '1', '目标声计入 mastery tone1.r=[1]');
    // q1 = 骂(T4) 答「不是」→ 对；但非目标 → 不产生 tone4
    W(c).toneCourseCheckNext(); W(c).toneCourseAnswer(false);
    s = st(c);
    ok(s.qIdx === 1 && s.right === 2 && s.total === 2, 'q1 非 T1 答「不是」→ 对（无需知道是几声）');
    p = prog(c);
    ok(p.tone['1'].r.join(',') === '1' && p.tone['4'] === undefined, '干扰项不污染其它声 mastery');
    // q2 = 三(T1) 答「是」；q3 = 马(T3) 答「不是」
    W(c).toneCourseCheckNext(); W(c).toneCourseAnswer(true);
    W(c).toneCourseCheckNext(); W(c).toneCourseAnswer(false);
    s = st(c);
    ok(s.right === 4 && s.total === 4, '回合 4/4');
    p = prog(c);
    ok(p.tone['1'].r.join(',') === '1,1', '仅目标声累积（妈/三两次 T1 命中；骂/马为干扰不入账）');
    W(c).toneCourseCheckNext();
    s = st(c);
    ok(s.result && s.result.passed === true && s.result.right === 4, '通过（≥75%）进入 Result');
    h = html(c);
    ok(h.includes('Sada znaš prvi ton'), 'Result 明示：现在认识第一声（sr）');
    ok(h.includes('4 / 4'), '分数展示 4/4');
    ok(prog(c).completed.indexOf('G2') >= 0, '完成 G2');
    W(c).toneCourseResultAction();
    const s2 = st(c);
    ok(s2.open === true && s2.lessonId === 'G3' && s2.stepIdx === 0, '完成 G2（7 课中段）→ 推进到 G3，课程继续（未全完成不关闭）');
  }
  {
    // 未通过也温和：答全错 → passed=false，但完成记录 + 无责备文案
    const c = loadCourseUiCtx({ voice: true });
    W(c).toneCourseSetKeepOrder(true);
    W(c).toneCourseStartLesson('G2');
    W(c).toneCourseNext(); W(c).toneCourseNext(); W(c).toneCourseMimic(true); W(c).toneCourseNext();
    W(c).toneCourseAnswer(false); // 妈(T1)「不是」错
    W(c).toneCourseCheckNext(); W(c).toneCourseAnswer(true);  // 骂(T4)「是」错
    W(c).toneCourseCheckNext(); W(c).toneCourseAnswer(false); // 三(T1)「不是」错
    W(c).toneCourseCheckNext(); W(c).toneCourseAnswer(true);  // 马(T3)「是」错
    W(c).toneCourseCheckNext();
    const s = st(c);
    ok(s.result && s.result.passed === false && s.result.right === 0, '0/4 → 未通过（仍温和，无失败态）');
    const h = html(c);
    ok(h.includes('0 / 4') && h.includes('bez žurbe') && h.indexOf('greška') < 0, 'Result 温和文案（不责备）');
    ok(prog(c).completed.indexOf('G2') >= 0, '未通过也完成记录（不困住用户，可再练）');
    ok(h.includes('Vežbaj ponovo'), '提供「再练一次」');
  }

  /* ============ U4 语言切换保留状态 + 刷新续学 ============ */
  section('U4: 语言切换保 lesson/step/题态 + 刷新续学');
  {
    const c = loadCourseUiCtx({ voice: true });
    W(c).toneCourseSetKeepOrder(true);
    W(c).toneCourseStartLesson('G2');
    W(c).toneCourseNext(); W(c).toneCourseNext(); W(c).toneCourseMimic(true); W(c).toneCourseNext();
    W(c).toneCourseAnswer(true); W(c).toneCourseCheckNext(); // 停在 qIdx=1
    // sr → zh
    setLang(c, 'zh');
    W(c).toneCourseOnLangSwitch();
    let s = st(c);
    ok(s.lessonId === 'G2' && s.stepIdx === 3 && s.qIdx === 1 && s.right === 1, '切 zh：lesson/step/题/作答都保留');
    let h = html(c);
    ok(h.includes('这是第一声（高平）吗？'), '切 zh 后提问为中文');
    // zh → en
    setLang(c, 'en');
    W(c).toneCourseOnLangSwitch();
    s = st(c);
    ok(s.qIdx === 1 && s.stepIdx === 3, '切 en 后仍停在第 2 题');
    h = html(c);
    ok(h.includes('Is this Tone 1 (high &amp; level)?'), '切 en 后提问为英文（& 经转义）');
    // 「刷新」：全新上下文 + 继承 localStorage → 续学原位置
    const saved = c.ls.getItem(TONE_KEY);
    const c2 = loadCourseUiCtx({ voice: true, seed: { [TONE_KEY]: saved } });
    W(c2).toneCourseSetKeepOrder(true);
    W(c2).toneCourseStart();
    s = st(c2);
    ok(s.open && s.lessonId === 'G2' && s.stepIdx === 3 && s.qIdx === 1, '刷新后从 G2 check 第 2 题续学');
    h = html(c2);
    ok(h.includes('骂') && h.includes('To je bio prvi ton') === false, '续学题面 = q1（骂）；非已答卡');
    // 中途非 check 也续学（G1 cards 处）
    const c3 = loadCourseUiCtx({ voice: true });
    W(c3).toneCourseStartLesson('G1');
    W(c3).toneCourseNext();
    const saved3 = c3.ls.getItem(TONE_KEY);
    const c4 = loadCourseUiCtx({ voice: true, seed: { [TONE_KEY]: saved3 } });
    W(c4).toneCourseStart();
    ok(st(c4).lessonId === 'G1' && st(c4).stepIdx === 1, '刷新后 G1 从卡片步续学');
  }

  /* ============ U5 无中文 voice → 三语视觉模式提示、不假装播放 ============ */
  section('U5: 视觉降级（voice off）三语提示 + 不假装播放 + 可继续');
  {
    // sr
    let c = loadCourseUiCtx({});
    W(c).toneCourseStartLesson('G1');
    let h = html(c);
    ok(st(c).voiceOk === false, '无 voice → voiceOk=false（降级模式）');
    ok(h.includes('ne može da reprodukuje kineski zvuk'), 'sr 视觉模式提示可见');
    W(c).toneCourseNext(); // cards
    h = html(c);
    ok(h.indexOf('toneCoursePlayCard') < 0, '降级：卡片不放「假装能播」的按钮（静态展示）');
    ok(h.includes('mā') && h.includes('mà'), '降级：卡片仍展示词语/拼音供视觉学习');
    // 点「播放」句柄不应产生任何 spoken，也不报错（不模拟已播放）
    W(c).toneCoursePlaySample();
    W(c).toneCoursePlayWord();
    ok(spk(c).length === 0, '无 voice 下调用播放句柄：零假播放记录');
    // zh / en 提示
    c = loadCourseUiCtx({ lang: 'zh' });
    W(c).toneCourseStartLesson('G1');
    ok(html(c).includes('这台设备不能播放中文声音'), 'zh 视觉模式提示可见');
    c = loadCourseUiCtx({ lang: 'en' });
    W(c).toneCourseStartLesson('G1');
    ok(html(c).includes('Chinese audio'), 'en 视觉模式提示可见');
    // Check 视觉降级仍可完成：题面显示拼音供视觉作答
    const c5 = loadCourseUiCtx({});
    W(c5).toneCourseSetKeepOrder(true);
    W(c5).toneCourseStartLesson('G2');
    W(c5).toneCourseNext(); W(c5).toneCourseNext(); W(c5).toneCourseMimic(true); W(c5).toneCourseNext();
    h = html(c5);
    ok(h.includes('mā'), '降级 Check：题面露拼音（视觉作答）');
    ok(h.includes('Je li ovo prvi ton') && count(h, 'class="tcc-ans') === 2, '降级 Check：提问与两答案钮仍在');
    W(c5).toneCourseAnswer(true);
    ok(st(c5).right === 1, '降级 Check 可正常判分（课程不因无声音而停）');
  }

  /* ============ U6 移动端静态结构 / 触控尺寸 / 无横向溢出容器 ============ */
  section('U6: 移动端结构与触控尺寸（DOM/CSS 静态）');
  {
    const c = loadCourseUiCtx({ voice: true });
    W(c).toneCourseStartLesson('G1');
    const h = html(c);
    ok(h.includes('tcc-frame') && h.includes('tcc-scroll'), '卡片 = frame(head+scroll) 结构，正文区自滚');
    const style = c.doc._byId['tcc-style'].innerHTML;
    ok(style.includes('min-height:52px') && style.includes('min-height:54px'), '主/答案按钮触控高 ≥52/54px');
    ok(style.includes('min-height:44px'), '词条 chip 触控高 ≥44px');
    ok(style.includes('min-height:38px') && style.includes('width:38px'), '关闭钮 ≥38px（>44px 直径可点）');
    ok(style.includes('width:min(560px,100%)') && style.includes('overflow-y:auto'), '宽度限流 + 滚动防横向溢出');
    ok(style.includes('@media(max-width:380px)') && style.includes('@media(max-height:600px)'), '窄屏/矮屏媒体查询存在');
    ok(style.indexOf('#tcc-host .tcc-card{') < 0, '无旧单卡结构（frame 包裹）');
  }

  /* ============ U7 G4 whichTone：双选项、逐题认号、真识别入账、无 2/3 ============ */
  section('U7: G4 一比四 whichTone（voice on, 原序回合）');
  {
    const c = loadCourseUiCtx({ voice: true });
    let p = W(c).tcLoadProgress();
    ['G1', 'G2', 'G3'].forEach(id => { p = W(c).tcCompleteLesson(p, id, '2026-09-05'); });
    W(c).tcSaveProgress(p);
    W(c).toneCourseSetKeepOrder(true);
    W(c).toneCourseStartLesson('G4');
    ok(st(c).lessonId === 'G4' && st(c).stepIdx === 0, 'G4 从卡片步开始（一比四）');
    let h = html(c);
    ok(count(h, '<div class="tcc-card-t">') === 2, 'G4 只对比两张卡（1 高平 mā / 4 下降 mà），不是 4-way');
    W(c).toneCourseNext(); // → check
    ok(st(c).stepIdx === 1, 'G4 第 2 步 = check');
    h = html(c);
    ok(h.includes('Koji je ovo ton?') && h.indexOf('toneCourseAnswer(true)') < 0, 'G4 提问 = 第几声（选项按号作答，非是/否）');
    ok(count(h, 'class="tcc-opt"') === 2, 'G4 whichTone 双选项（1 与 4），无 2/3 负担');
    const items = W(c).tcRoundItems('G4', true);
    for (let i = 0; i < items.length; i++) {
      W(c).toneCourseAnswer(items[i].tone); // 认对号
      if (i < items.length - 1) W(c).toneCourseCheckNext();
    }
    let s = st(c);
    ok(s.total === 8 && s.right === 8, 'G4 逐题认号 8/8 全对');
    W(c).toneCourseCheckNext(); // 末题 → 结算 Result
    s = st(c);
    ok(s.result && s.result.passed === true && s.result.right === 8 && s.result.total === 8, 'G4 一次通过（8/8 ≥75%）');
    h = html(c);
    ok(h.includes('Sada razlikuješ prvi i četvrti ton'), 'G4 Result 用 G4 now（一比四）');
    const p2 = prog(c);
    const t1 = (p2.tone['1'] || {}).r || [], t4 = (p2.tone['4'] || {}).r || [];
    ok(t1.length === 4 && t1.every(x => x === 1) && t4.length === 4 && t4.every(x => x === 1),
      'whichTone 每答都是真识别：1 声 4 次、4 声 4 次入账');
    ok(!p2.tone['2'] && !p2.tone['3'], 'G4 全程不产生 2/3 声记录（axis=[1,4]，零 2/3 负担）');
    ok(p2.completed.indexOf('G4') >= 0, '完成 G4 已记录');
  }

  /* ============ U8 G6 两步 check：isTone(3) 先单独 → whichTone[2,3,4]，跨步 acc 累积 ============ */
  section('U8: G6 多 check 步累积（voice on, 原序回合）');
  {
    const c = loadCourseUiCtx({ voice: true });
    let p = W(c).tcLoadProgress();
    ['G1', 'G2', 'G3', 'G4', 'G5'].forEach(id => { p = W(c).tcCompleteLesson(p, id, '2026-09-05'); });
    W(c).tcSaveProgress(p);
    W(c).toneCourseSetKeepOrder(true);
    W(c).toneCourseStartLesson('G6');
    W(c).toneCourseNext(); W(c).toneCourseNext(); W(c).toneCourseMimic(true); W(c).toneCourseNext(); // → check1
    let s = st(c);
    ok(s.lessonId === 'G6' && s.stepIdx === 3, 'G6 进入第一段 check(isTone)');
    let h = html(c);
    ok(h.includes('Je li ovo treći ton (nizak i savijen)?') && count(h, 'class="tcc-ans') === 2, 'G6 第一段 = 是否第三声（二元，先单独练）');
    const ck1 = W(c).tcRoundItems('G6', true, 3);
    for (let i = 0; i < ck1.length; i++) {
      W(c).toneCourseAnswer(ck1[i].tone === 3); // 第三声 → 是；2/4 → 不是
      if (i < ck1.length - 1) W(c).toneCourseCheckNext();
    }
    W(c).toneCourseCheckNext(); // 末题 → 跨步到第二段（保留 acc，未完成）
    s = st(c);
    ok(s.stepIdx === 4 && s.qIdx === 0, 'check1 结束 → 跨步到 check2（whichTone[2,3,4]），qIdx 归零');
    ok(s.acc.right === 6 && s.acc.total === 6 && s.result === null, '跨步保留 acc 6/6、不提前结算（G6 未完成）');
    let p2 = prog(c);
    ok(p2.completed.indexOf('G6') < 0, 'G6 中途未误标完成');
    ok(p2.tone['3'] && p2.tone['3'].r.length === 3 && p2.tone['3'].r.every(x => x === 1) && !p2.tone['2'] && !p2.tone['4'],
      '第一段 isTone：仅 3 声目标入账 3 次，2/4 干扰不产生记录');
    h = html(c);
    ok(h.includes('Brzo prepoznavanje') && count(h, 'class="tcc-opt"') === 3, 'G6 第二段 = whichTone 三选项（2/3/4）短混合');
    const ck2 = W(c).tcRoundItems('G6', true, 4);
    for (let i = 0; i < ck2.length; i++) {
      W(c).toneCourseAnswer(ck2[i].tone);
      if (i < ck2.length - 1) W(c).toneCourseCheckNext();
    }
    W(c).toneCourseCheckNext(); // 末题 → 无后续 check → 以 acc 结算
    s = st(c);
    ok(s.result && s.result.passed === true && s.result.right === 12 && s.result.total === 12, 'G6 两段合计 12/12 一次通过（acc 不丢）');
    ok(prog(c).completed.indexOf('G6') >= 0, '完成 G6');
  }

  /* ============ U9 G7 毕业总辨认 + 完成关闭 + 复习重开 ============ */
  section('U9: G7 毕业四选一（voice on, 原序回合）');
  {
    const c = loadCourseUiCtx({ voice: true });
    let p = W(c).tcLoadProgress();
    ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'].forEach(id => { p = W(c).tcCompleteLesson(p, id, '2026-09-05'); });
    W(c).tcSaveProgress(p);
    W(c).toneCourseSetKeepOrder(true);
    W(c).toneCourseStartLesson('G7');
    ok(st(c).lessonId === 'G7' && st(c).stepIdx === 0, 'G7 从 ma 四声卡开始');
    let h = html(c);
    ok(count(h, '<div class="tcc-card-t">') === 4, 'G7 四张卡（mā/má/mǎ/mà）');
    W(c).toneCourseNext(); // → check
    h = html(c);
    ok(h.includes('Završno prepoznavanje') && count(h, 'class="tcc-opt"') === 4, 'G7 check = whichTone 四选项（1/2/3/4）');
    const items = W(c).tcRoundItems('G7', true);
    for (let i = 0; i < items.length; i++) {
      W(c).toneCourseAnswer(items[i].tone);
      if (i < items.length - 1) W(c).toneCourseCheckNext();
    }
    W(c).toneCourseCheckNext(); // 末题 → 结算（全完成 → 毕业）
    let s = st(c);
    ok(s.result && s.result.passed === true && s.result.right === 8 && s.result.total === 8, 'G7 8/8 一次通过');
    const pG = prog(c);
    ok(pG.graduated === true, 'G7 完成 → graduated=true（Faza0 毕业标记）');
    ok(['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'].every(id => pG.completed.indexOf(id) >= 0), 'G1–G7 全部完成');
    h = html(c);
    ok(h.indexOf('Bravo — sada razvrstavaš') >= 0, 'G7 Result 用 G7 now（毕业文案）');
    ok(h.indexOf('finish') >= 0 || h.indexOf('Završi') >= 0, '全完成 → 主按钮为「完成」');
    W(c).toneCourseResultAction();
    ok(st(c).open === false && !c.doc._byId['tcc-host'], '毕业完成 → 关闭并清 DOM（无下一课可推进）');
    // 复习入口：毕业卡「复习声调」→ toneCourseReview 重新打开最后一课 G7
    W(c).toneCourseReview();
    ok(st(c).open === true && st(c).lessonId === 'G7' && st(c).stepIdx === 0, 'toneCourseReview 打开最后一课 G7');
  }

  /* ============ U10 zh-CN 语言归一：zh-CN → 中文渲染，不回退 sr/en ============ */
  section('U10: zh-CN（站点语言 token）归一为 zh');
  {
    const c = loadCourseUiCtx({ voice: true, lang: 'zh-CN' });
    W(c).toneCourseSetKeepOrder(true);
    W(c).toneCourseStartLesson('G2');
    let h = html(c);
    ok(h.includes('第一声 · 高平'), 'zh-CN：G2 标题渲染中文');
    ok(!h.includes('Prvi ton — visok i ravan') && !h.includes('Tone 1 — high'), 'zh-CN 不再回退 sr/en');
    W(c).toneCourseNext(); W(c).toneCourseNext(); W(c).toneCourseMimic(true); W(c).toneCourseNext();
    h = html(c);
    ok(h.includes('这是第一声（高平）吗？') && !h.includes('Is this Tone 1'), 'zh-CN：check 提问为中文，不回退英文');
    // G4 whichTone 中文选项渲染
    const c2 = loadCourseUiCtx({ voice: true, lang: 'zh-CN' });
    let p = W(c2).tcLoadProgress();
    ['G1', 'G2', 'G3'].forEach(id => { p = W(c2).tcCompleteLesson(p, id, '2026-09-05'); });
    W(c2).tcSaveProgress(p);
    W(c2).toneCourseSetKeepOrder(true);
    W(c2).toneCourseStartLesson('G4');
    W(c2).toneCourseNext();
    h = html(c2);
    ok(h.includes('这是第几声？') && count(h, 'class="tcc-opt"') === 2, 'zh-CN：G4 whichTone 中文提问 + 双选项');
    ok(h.indexOf('Koji je ovo ton?') < 0 && h.indexOf('Which tone is this?') < 0, 'zh-CN：无 sr/en 泄漏');
  }

  console.log('\n结果: ' + passed + ' 通过, ' + failed + ' 失败');
  process.exit(failed ? 1 : 0);
})();
