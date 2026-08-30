/* 第三阶段 UX 第一批验证（node）— UX-1 ~ UX-6
   用法: node tests/verify_ux.test.js [ux1|ux2|ux3|ux4|ux5|ux6|all]
   含运行时渲染（vm）+ 源码断言。 */
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const BASE = path.join(__dirname, '..');
const RUN = (process.argv[2] || 'all').split(',');
let passed = 0, failed = 0, skipped = 0;
function ok(c, l) { if (c) { passed++; console.log('  PASS  ' + l); } else { failed++; console.log('  FAIL  ' + l); } }
function section(s) { console.log('\n== ' + s + ' =='); }
function runSection(name, fn) { if (RUN.indexOf('all') >= 0 || RUN.indexOf(name) >= 0) { fn(); } else { skipped++; } }
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
    visibilityState: 'visible', hidden: false, readyState: opts.readyState || 'complete',
    title: opts.title || '', documentElement: { setAttribute() {} },
    getElementById: () => null, querySelectorAll: () => [], querySelector: () => null,
    createElement: () => elProto, body: { appendChild() {} },
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
function loadUI(ls, opts) {
  const cards = {
    lrnStreakCard: { innerHTML: '', style: {}, querySelector: () => null, querySelectorAll: () => [] },
    lrnContinueCard: { innerHTML: '', style: {} },
    lrnLessonHeader: { innerHTML: '' },
    lrnStepIndicator: null, lrnStepContent: null, lrnStepActions: null,
    lrnReviewCard: { innerHTML: '', style: {} },
    lrnReviewList: { innerHTML: '' },
    'lrn-review-all-btn': { style: {} },
    'lrn-review-title': { textContent: '' },
    lrnPhaseHeader: { innerHTML: '' }, lrnLessonList: { innerHTML: '' },
    lrnPhaseGrid: { innerHTML: '' }, lrnStatsCards: { innerHTML: '' }, lrnStatsHeatmap: { innerHTML: '' },
    lrnAchStats: { innerHTML: '' }, lrnAchGrid: { innerHTML: '' },
    lrnFavoritesContainer: { innerHTML: '' }, lrnReviewFullList: { innerHTML: '' },
    lrnContinueTitle: {}, lrnContinueSub: {}, lrnAppTip: {}, toastContainer: { appendChild() {} },
  };
  const doc = makeDoc();
  doc.getElementById = id => (id in cards ? cards[id] : null);
  const sandbox = {
    window: makeWin(), document: doc, localStorage: ls,
    setInterval: () => 0, clearInterval: () => {},
    setTimeout, clearTimeout, Date, Math, JSON, Promise, Object, Array, String, Number, Boolean,
    parseInt, parseFloat, isNaN, console,
    fetch: () => Promise.resolve(),
    speechSynthesis: { getVoices: () => [], addEventListener() {} },
    navigator: { vibrate: () => {} },
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(BASE, 'js', 'chinese-learn.js'), 'utf8'), sandbox);
  vm.runInContext(fs.readFileSync(path.join(BASE, 'js', 'chinese-ui.js'), 'utf8'), sandbox);
  if (opts && opts.quiz) vm.runInContext(fs.readFileSync(path.join(BASE, 'js', 'chinese-quiz.js'), 'utf8'), sandbox);
  return { ctx: sandbox, cards };
}
function injectLessons(ctx) {
  // LESSONS_DATA 在 chinese-learn.js 中是词法全局（let），vm 内函数读不到沙箱属性，
  // 必须在 context 内部赋值（vm.runInContext）才能让 getLessonById/applyPhaseAssignments 生效。
  const raw = JSON.parse(fs.readFileSync(path.join(BASE, 'data', 'lessons.json'), 'utf8'));
  const flat = [];
  raw.forEach(p => { (p.lessons || []).forEach(l => flat.push(l)); });
  vm.runInContext('LESSONS_DATA=' + JSON.stringify(flat) + '; applyPhaseAssignments();', ctx);
}
function setLang(ctx, l) { ctx.lang = l; ctx.window.lang = l; }

// ========== UX-1 ==========
runSection('ux1', () => {
  section('UX-1 新用户首页欢迎状态');
  // A: 完全新用户（无任何进度）→ 欢迎语
  {
    const a = loadUI(makeLS()); setLang(a.ctx, 'sr');
    a.ctx.fillStreakCard(a.ctx.getTotalProgress());
    ok(a.cards.lrnStreakCard.innerHTML.includes('Dobrodošla! Počnimo od prve lekcije'), 'U1-A 完全新用户 → 显示欢迎语（sr）');
    ok(!a.cards.lrnStreakCard.innerHTML.includes('dana zaredom'), 'U1-A 新用户 → 不再显示 "0 days streak" 状态');
    ok(!a.cards.lrnStreakCard.innerHTML.includes('lrn-progress-ring'), 'U1-A 新用户 → 不再显示 0% 进度环');
  }
  // B: 已有用户但 streak=0（不能误当新用户）
  {
    const seedB = { 'chinese-progress-default': JSON.stringify({ completedLessons: { '1': { completedAt: '2026-08-29T10:00:00', score: 80, timeSpent: 60 } }, studyStreak: { current: 0, longest: 3, lastDate: '2026-08-29' }, totalPoints: 150 }) };
    const b = loadUI(makeLS(seedB)); setLang(b.ctx, 'sr');
    b.ctx.fillStreakCard(b.ctx.getTotalProgress());
    ok(b.cards.lrnStreakCard.innerHTML.includes('dana zaredom'), 'U1-B 已有用户 streak=0 → 正常显示 streak 卡（不误当新用户）');
    ok(!b.cards.lrnStreakCard.innerHTML.includes('Dobrodošla'), 'U1-B 已有用户 streak=0 → 不显示欢迎语');
  }
  // C: 已学过课程（streak=3）→ 正常 streak
  {
    const seedC = { 'chinese-progress-default': JSON.stringify({ completedLessons: { '1': { completedAt: '2026-08-29T10:00:00', score: 80, timeSpent: 60 } }, studyStreak: { current: 3, longest: 5, lastDate: '2026-08-30' }, totalPoints: 150 }) };
    const c = loadUI(makeLS(seedC)); setLang(c.ctx, 'sr');
    c.ctx.fillStreakCard(c.ctx.getTotalProgress());
    ok(c.cards.lrnStreakCard.innerHTML.includes('>3<') && c.cards.lrnStreakCard.innerHTML.includes('dana zaredom'), 'U1-C 已学过 → streak=3 正常显示');
  }
  // D: 刷新状态保持（同一存储重建 → 渲染一致）
  {
    const lsD = makeLS();
    const d1 = loadUI(lsD); setLang(d1.ctx, 'sr'); d1.ctx.fillStreakCard(d1.ctx.getTotalProgress());
    const d2 = loadUI(lsD); setLang(d2.ctx, 'sr'); d2.ctx.fillStreakCard(d2.ctx.getTotalProgress());
    ok(d1.cards.lrnStreakCard.innerHTML === d2.cards.lrnStreakCard.innerHTML, 'U1-D 刷新（同一存储）→ 状态保持一致');
  }
  // E: 语言切换文案跟随（sr→en→zh 实时）
  {
    const e = loadUI(makeLS());
    setLang(e.ctx, 'sr'); e.ctx.fillStreakCard(e.ctx.getTotalProgress());
    ok(e.cards.lrnStreakCard.innerHTML.includes('Dobrodošla! Počnimo od prve lekcije'), 'U1-E sr 欢迎语');
    setLang(e.ctx, 'en'); e.ctx.fillStreakCard(e.ctx.getTotalProgress());
    ok(e.cards.lrnStreakCard.innerHTML.includes("Welcome! Let's start with your first lesson"), 'U1-E en 欢迎语');
    setLang(e.ctx, 'zh-CN'); e.ctx.fillStreakCard(e.ctx.getTotalProgress());
    ok(e.cards.lrnStreakCard.innerHTML.includes('欢迎！从第一课开始吧'), 'U1-E zh 欢迎语');
  }
});

// ========== UX-2 ==========
runSection('ux2', () => {
  section('UX-2 测验未通过温柔反馈');
  const src = fs.readFileSync(path.join(BASE, 'js', 'chinese-quiz.js'), 'utf8');
  ok(src.includes('Nisi prošla — ali svaka vežba te približava cilju! Pokušaj ponovo 💪'), 'U2 sr 温柔反馈（阴性单数 ti）');
  ok(src.includes('没通过 — 但每一次练习都让你更接近目标！再试一次 💪'), 'U2 zh 温柔反馈');
  ok(src.includes('Not quite — but every try brings you closer! Try again 💪'), 'U2 en 温柔反馈');
  ok(!src.includes('Niste prošli (potrebno 60%)'), 'U2 旧 sr 敬称文案已移除');
  ok(src.includes('lrn-quiz-retry-btn'), 'U2 重试按钮保留');
  ok(src.includes('lrn-practice-feedback wrong'), 'U2 失败反馈样式类保留');
});

// ========== UX-3 ==========
runSection('ux3', () => {
  section('UX-3 课程开始学习预告');
  const src = fs.readFileSync(path.join(BASE, 'js', 'chinese-ui.js'), 'utf8');
  ok(src.includes('function _lessonPreviewHtml('), 'U3 源码含 _lessonPreviewHtml 函数');
  ok(src.includes('Danas ćeš naučiti'), 'U3 sr 预告标签');
  ok(src.includes("You'll learn today"), 'U3 en 预告标签');
  ok(src.includes('今天你会学到'), 'U3 zh 预告标签');
  // 独立函数
  const ui = loadUI(makeLS()); setLang(ui.ctx, 'sr');
  const h = ui.ctx._lessonPreviewHtml({ words: [{ zh: '你好' }, { zh: '你' }, { zh: '好' }], grammar: { zh: 'SVO', sr: 'SVO red reči', en: 'SVO' }, topic: { zh: '你好！', sr: 'Zdravo!', en: 'Hello!' } });
  ok(h.includes('Danas ćeš naučiti'), 'U3 运行时 → 预告含标题（sr）');
  ok(h.includes('你好 · 你 · 好'), 'U3 运行时 → 预告含核心词预览');
  ok(h.includes('SVO red reči'), 'U3 运行时 → 预告含语法点');
  ok(h.includes('Zdravo!'), 'U3 运行时 → 预告含对话主题');
  // 集成：renderLessonView(5) header 含预告
  injectLessons(ui.ctx);
  ui.ctx.renderLessonView(5);
  ok(ui.cards.lrnLessonHeader.innerHTML.includes('Danas ćeš naučiti'), 'U3 集成 → 课程详情页顶部显示预告');
});

// ========== UX-4 ==========
runSection('ux4', () => {
  section('UX-4 课程内进度定位');
  const src = fs.readFileSync(path.join(BASE, 'js', 'chinese-ui.js'), 'utf8');
  ok(src.includes('Lekcija "+e+" · Faza "+r'), 'U4 sr 位置感 "Lekcija N · Faza M"');
  ok(src.includes('第"+e+"课 · 阶段"+r'), 'U4 zh 位置感');
  ok(src.includes('Lesson "+e+" · Phase "+r'), 'U4 en 位置感');
  ok(src.includes('Math.round(100*(e-30*(r-1))/30)'), 'U4 阶段内进度条计算');
  ok(src.includes('/30</span>'), 'U4 进度文字 "N/30"');
  const ui = loadUI(makeLS()); injectLessons(ui.ctx); setLang(ui.ctx, 'sr');
  ui.ctx.renderLessonView(5);
  ok(ui.cards.lrnLessonHeader.innerHTML.includes('Lekcija 5 · Faza 1'), 'U4 运行时 → L5 显示 "Lekcija 5 · Faza 1"');
  ok(ui.cards.lrnLessonHeader.innerHTML.includes('5/30'), 'U4 运行时 → L5 进度 "5/30"');
  ui.ctx.renderLessonView(31);
  ok(ui.cards.lrnLessonHeader.innerHTML.includes('Lekcija 31 · Faza 2'), 'U4 运行时 → L31 显示 "Faza 2"');
  ok(ui.cards.lrnLessonHeader.innerHTML.includes('1/30'), 'U4 运行时 → L31 进度 "1/30"');
});

// ========== UX-5 ==========
runSection('ux5', () => {
  section('UX-9A 无到期复习纯状态（去 CTA，continue 回归唯一"继续下一课"入口）');
  const src = fs.readFileSync(path.join(BASE, 'js', 'chinese-ui.js'), 'utf8');
  ok(src.includes('"Danas nema ponavljanja"'), 'U5 sr 空复习纯状态');
  ok(src.includes('"今天没有到期的复习"'), 'U5 zh 空复习纯状态');
  ok(src.includes('"No reviews due today"'), 'U5 en 空复习纯状态');
  ok(!src.includes('Danas nema ponavljanja — ali nova lekcija te čeka! 📚'), 'U5 旧重复 CTA 文案已移除');
  ok(!src.includes('onclick="continueLearning()" style="cursor:pointer"'), 'U5 空态源码不再含可点样式');
  const ui = loadUI(makeLS()); setLang(ui.ctx, 'sr');
  ui.ctx.fillReviewReminders([]);
  ok(ui.cards.lrnReviewCard.style.display === '', 'U5 无到期复习 → 卡片显示（状态告知）');
  ok(ui.cards.lrnReviewList.innerHTML.includes('Danas nema ponavljanja'), 'U5 运行时 → 纯状态文案（sr）');
  ok(!ui.cards.lrnReviewList.innerHTML.includes('continueLearning()'), 'U5 空态不可点击（不再引导继续学习）');
  ok(!ui.cards.lrnReviewList.innerHTML.includes('cursor:pointer'), 'U5 空态无指针手型');
});

// ========== UX-6 ==========
runSection('ux6', () => {
  section('UX-6 每日目标临门一脚');
  const src = fs.readFileSync(path.join(BASE, 'js', 'chinese-ui.js'), 'utf8');
  ok(src.includes('Još samo jedna lekcija!'), 'U6 sr 临门一脚文案');
  ok(src.includes('只差一节课！'), 'U6 zh 临门一脚文案');
  ok(src.includes('Just one more lesson!'), 'U6 en 临门一脚文案');
  ok(src.includes('s.goal-s.completed===1'), 'U6 条件：仅差 1 课时触发');
  const ui = loadUI(makeLS()); setLang(ui.ctx, 'sr');
  const today = ui.ctx.fmtDateLocal(new Date());
  const mk = n => JSON.stringify({ completedLessons: {}, studyStreak: { current: 0, longest: 0 }, totalPoints: 100, dailyStats: { [today]: { lessonsCompleted: n } } });
  ui.ctx.localStorage.setItem('chinese-progress-default', mk(2));
  ui.ctx.loadProgress();
  ui.ctx.fillStreakCard(ui.ctx.getTotalProgress());
  ok(ui.cards.lrnStreakCard.innerHTML.includes('Još samo jedna lekcija'), 'U6 差 1 课（2/3）→ 显示临门一脚（sr）');
  ui.ctx.localStorage.setItem('chinese-progress-default', mk(3));
  ui.ctx.loadProgress();
  ui.ctx.fillStreakCard(ui.ctx.getTotalProgress());
  ok(!ui.cards.lrnStreakCard.innerHTML.includes('Još samo jedna lekcija'), 'U6 已达标（3/3）→ 不再催促');
  ui.ctx.localStorage.setItem('chinese-progress-default', mk(0));
  ui.ctx.loadProgress();
  ui.ctx.fillStreakCard(ui.ctx.getTotalProgress());
  ok(!ui.cards.lrnStreakCard.innerHTML.includes('Još samo jedna lekcija'), 'U6 未开始（0/3）→ 不显示临门一脚');
});

// ========== UX-7 ==========
runSection('ux7', () => {
  section('UX-7 新用户欢迎卡 CTA');
  // A: 新用户 → 欢迎卡含 CTA 文案 + 连接到 continueLearning（复用入口，不新建）
  {
    const a = loadUI(makeLS()); setLang(a.ctx, 'sr');
    a.ctx.fillStreakCard(a.ctx.getTotalProgress());
    ok(a.cards.lrnStreakCard.innerHTML.includes('Započni prvu lekciju'), 'U7-A 新用户 → CTA 文案（sr）');
    ok(a.cards.lrnStreakCard.innerHTML.includes('onclick="continueLearning()"'), 'U7-A CTA 复用 continueLearning（不新建课程入口）');
  }
  // B: 老用户 streak=0 → 不显示 CTA
  {
    const seedB = { 'chinese-progress-default': JSON.stringify({ completedLessons: { '1': { completedAt: '2026-08-29T10:00:00', score: 80, timeSpent: 60 } }, studyStreak: { current: 0, longest: 3, lastDate: '2026-08-29' }, totalPoints: 150 }) };
    const b = loadUI(makeLS(seedB)); setLang(b.ctx, 'sr');
    b.ctx.fillStreakCard(b.ctx.getTotalProgress());
    ok(!b.cards.lrnStreakCard.innerHTML.includes('Započni prvu lekciju'), 'U7-B 已有用户（streak=0）→ 不显示新用户 CTA');
  }
  // C: 刷新保持
  {
    const lsC = makeLS();
    const c1 = loadUI(lsC); setLang(c1.ctx, 'sr'); c1.ctx.fillStreakCard(c1.ctx.getTotalProgress());
    const c2 = loadUI(lsC); setLang(c2.ctx, 'sr'); c2.ctx.fillStreakCard(c2.ctx.getTotalProgress());
    ok(c1.cards.lrnStreakCard.innerHTML === c2.cards.lrnStreakCard.innerHTML, 'U7-C 刷新（同一存储）→ 新用户 CTA 状态一致');
  }
  // D: 三语切换 sr→en→zh→sr
  {
    const d = loadUI(makeLS());
    setLang(d.ctx, 'sr'); d.ctx.fillStreakCard(d.ctx.getTotalProgress());
    ok(d.cards.lrnStreakCard.innerHTML.includes('Započni prvu lekciju'), 'U7-D sr CTA');
    setLang(d.ctx, 'en'); d.ctx.fillStreakCard(d.ctx.getTotalProgress());
    ok(d.cards.lrnStreakCard.innerHTML.includes('Start your first lesson'), 'U7-D en CTA');
    setLang(d.ctx, 'zh-CN'); d.ctx.fillStreakCard(d.ctx.getTotalProgress());
    ok(d.cards.lrnStreakCard.innerHTML.includes('开始第一课'), 'U7-D zh CTA');
    setLang(d.ctx, 'sr'); d.ctx.fillStreakCard(d.ctx.getTotalProgress());
    ok(d.cards.lrnStreakCard.innerHTML.includes('Započni prvu lekciju'), 'U7-D 切回 sr CTA');
  }
  // E: 点击行为 → 进入第一课（集成）
  {
    const e = loadUI(makeLS()); injectLessons(e.ctx); setLang(e.ctx, 'sr');
    ok(e.ctx.getFirstIncompleteLesson() === 1, 'U7-E 新用户 → 第一未完成课 = 第 1 课（CTA 点击目标）');
  }
});

// ========== UX-9B ==========
runSection('ux9b', () => {
  section('UX-9B 有到期复习 → 复习卡动态上移（continue 前，主入口；continue 保留为次入口）');
  const src9 = fs.readFileSync(path.join(BASE, 'js', 'chinese-ui.js'), 'utf8');
  ok(src9.includes('parentNode.insertBefore(n,g)'), 'U9B 源码含动态上移 insertBefore');
  // mock：预置 continue 在父容器（模拟 DOM 初始顺序），insertBefore 记录新顺序
  function attachParent(ui) {
    const parent = { children: [], insertBefore(child, ref) { const i = this.children.indexOf(ref); if (i >= 0) this.children.splice(i, 0, child); else this.children.push(child); } };
    parent.children.push(ui.cards.lrnContinueCard);
    ui.cards.lrnReviewCard.parentNode = parent;
    ui.cards.lrnContinueCard.parentNode = parent;
    return parent;
  }
  const rv = (id, urgency, days) => ({ lessonId: id, topic: 'L' + id, urgency: urgency, daysUntilDue: days, icon: '📖' });
  function assertReviewBeforeContinue(parent, ui, label) {
    const ri = parent.children.indexOf(ui.cards.lrnReviewCard);
    const ci = parent.children.indexOf(ui.cards.lrnContinueCard);
    ok(ri >= 0 && ci >= 0 && ri === ci - 1, label + ' → review 紧邻 continue 之前（ri=' + ri + ', ci=' + ci + '）');
  }
  // S1 有 urgent → review 在 continue 前
  {
    const ui = loadUI(makeLS()); setLang(ui.ctx, 'sr'); const parent = attachParent(ui);
    ui.ctx.fillReviewReminders([rv(12, 'urgent', -1)]);
    assertReviewBeforeContinue(parent, ui, 'U9B-S1 urgent');
  }
  // S2 有 soon → review 在 continue 前
  {
    const ui = loadUI(makeLS()); setLang(ui.ctx, 'sr'); const parent = attachParent(ui);
    ui.ctx.fillReviewReminders([rv(5, 'soon', 2)]);
    assertReviewBeforeContinue(parent, ui, 'U9B-S2 soon');
  }
  // S3 urgent+soon → review 只出现一次且在 continue 前
  {
    const ui = loadUI(makeLS()); setLang(ui.ctx, 'sr'); const parent = attachParent(ui);
    ui.ctx.fillReviewReminders([rv(12, 'urgent', -1), rv(5, 'soon', 2)]);
    const cnt = parent.children.filter(c => c === ui.cards.lrnReviewCard).length;
    ok(cnt === 1, 'U9B-S3 urgent+soon → review 只出现一次');
    assertReviewBeforeContinue(parent, ui, 'U9B-S3');
  }
  // S4 无 urgent/soon（空）→ 不触发上移，走空态
  {
    const ui = loadUI(makeLS()); setLang(ui.ctx, 'sr'); const parent = attachParent(ui);
    ui.ctx.fillReviewReminders([]);
    ok(parent.children.length === 1 && parent.children[0] === ui.cards.lrnContinueCard, 'U9B-S4 无到期 → 不触发上移（仅 continue 在列）');
    ok(ui.cards.lrnReviewList.innerHTML.includes('Danas nema ponavljanja'), 'U9B-S4 空态文案');
  }
  // S5 只有 ok → 走空态，不触发复习优先
  {
    const ui = loadUI(makeLS()); setLang(ui.ctx, 'sr'); const parent = attachParent(ui);
    ui.ctx.fillReviewReminders([rv(40, 'ok', 5)]);
    ok(parent.children.length === 1 && parent.children[0] === ui.cards.lrnContinueCard, 'U9B-S5 ok-only → 不触发复习优先');
    ok(ui.cards.lrnReviewList.innerHTML.includes('Danas nema ponavljanja'), 'U9B-S5 ok-only → 空态文案');
  }
  // S6 有复习时 continue 仍存在且可点击（次入口，不删除）
  {
    const ui = loadUI(makeLS({ 'chinese-progress-default': JSON.stringify({ completedLessons: { '1': { completedAt: '2026-08-29T10:00:00', score: 80, timeSpent: 60 } }, studyStreak: { current: 2, longest: 3, lastDate: '2026-08-29' }, totalPoints: 150, currentLessonId: 5, reviews: {} }) }));
    injectLessons(ui.ctx); setLang(ui.ctx, 'sr');
    attachParent(ui);
    ui.cards.lrnContinueCard.querySelector = () => null;
    ui.cards.lrnContinueCard.setAttribute = function (k, v) { this._a = this._a || {}; this._a[k] = v; };
    ui.ctx.fillContinueCard(ui.ctx.getProgress());
    ok(ui.cards.lrnContinueCard.style.display === 'flex', 'U9B-S6 有下一课 → continue 卡显示');
    ok(ui.cards.lrnContinueCard._a && String(ui.cards.lrnContinueCard._a.onclick).includes('renderLessonView'), 'U9B-S6 continue 可点击（renderLessonView）');
  }
  // S7 语言切换不影响排序
  {
    const ui = loadUI(makeLS());
    let parent = attachParent(ui); setLang(ui.ctx, 'en');
    ui.ctx.fillReviewReminders([rv(12, 'urgent', -1)]);
    assertReviewBeforeContinue(parent, ui, 'U9B-S7 en');
    parent = attachParent(ui); setLang(ui.ctx, 'zh');
    ui.ctx.fillReviewReminders([rv(12, 'urgent', -1)]);
    assertReviewBeforeContinue(parent, ui, 'U9B-S7 zh');
  }
  // S8 复习项 onclick 仍指向 renderLessonView（课程上下文正常）
  {
    const src8 = fs.readFileSync(path.join(BASE, 'js', 'chinese-ui.js'), 'utf8');
    ok(src8.includes('onclick="renderLessonView('), 'U9B-S8 复习项点击仍进对应课程');
  }
});

// ========== UX-9C ==========
const doneN180 = (n) => { const d = {}; for (let i = 1; i <= n; i++) d[String(i)] = { completedAt: '2026-08-29T10:00:00', score: 80, timeSpent: 60 }; return d; };
const done180All = () => doneN180(180);
const baseProg = (extra) => Object.assign({ currentLessonId: null, totalPoints: 14400, totalTimeSpent: 23100, studyStreak: { current: 8, longest: 14, lastDate: '2026-08-29' }, reviews: {} }, extra || {});
const lsProg = (extra) => makeLS({ 'chinese-progress-default': JSON.stringify(baseProg(extra)) });
const ls180 = () => lsProg({ completedLessons: done180All() });
const rvC = (id, urgency, days) => ({ lessonId: id, topic: 'L' + id, urgency: urgency, daysUntilDue: days, icon: '📖' });

// ---- C1 完成状态数据与渲染 ----
runSection('ux9c1', () => {
  section('UX-9C-1 完成状态数据与渲染（180/180 且无 urgent/soon → 完成卡，数据来自现有字段）');
  const src = fs.readFileSync(path.join(BASE, 'js', 'chinese-ui.js'), 'utf8');
  ok(src.includes('function fmtDuration('), 'C1-S0 源码含 fmtDuration 纯函数');
  ok(src.includes('done>=180'), 'C1-S0 源码含 180/180 完成判定');
  // C1-1 完成卡渲染与数据
  {
    const ui = loadUI(ls180()); injectLessons(ui.ctx); setLang(ui.ctx, 'sr');
    ui.ctx.fillReviewReminders([]);
    const h = ui.cards.lrnReviewList.innerHTML;
    ok(h.includes('Završila si ceo put učenja kineskog'), 'C1-1 sr 完成卡标题');
    ok(h.includes('180/180'), 'C1-1 显示 180/180');
    ok(h.includes('6 h 25 min'), 'C1-1 学习时间来自 totalTimeSpent=23100（6h25m）');
    ok(h.includes('najviše 14 dana'), 'C1-1 最长连续来自 studyStreak.longest=14');
    ok(ui.cards['lrn-review-title'].textContent === 'Čestitamo!', 'C1-1 完成卡标题区文案');
    ok(h.includes('lrn-completion'), 'C1-1 复用 lrn-completion 卡片壳');
  }
  // C1-2 词数来自 countLearnedWords()（实时派生，学习过≠掌握）
  {
    const ui = loadUI(ls180()); injectLessons(ui.ctx); setLang(ui.ctx, 'sr');
    const wc = ui.ctx.countLearnedWords(ui.ctx.getProgress());
    ui.ctx.fillReviewReminders([]);
    ok(ui.cards.lrnReviewList.innerHTML.includes('Naučila si ' + wc + ' reči'), 'C1-2 词数=countLearnedWords 实时值（' + wc + '）');
  }
  // C1-3 完成卡无死引导 / 无下一课 CTA
  {
    const ui = loadUI(ls180()); injectLessons(ui.ctx); setLang(ui.ctx, 'sr');
    ui.ctx.fillReviewReminders([]);
    const h = ui.cards.lrnReviewList.innerHTML;
    ok(!h.includes('onclick'), 'C1-3 完成卡无 onclick（无死引导）');
    ok(!h.includes('nova lekcija') && !h.includes('Nastavi') && !h.includes('Započni'), 'C1-3 完成卡无下一课 CTA');
  }
  // C1-4 全完成 + 无到期 → continue 卡隐藏（getFirstIncompleteLesson=null）
  {
    const ui = loadUI(ls180()); injectLessons(ui.ctx); setLang(ui.ctx, 'sr');
    ui.ctx.fillContinueCard(ui.ctx.getProgress());
    ok(ui.cards.lrnContinueCard.style.display === 'none', 'C1-4 全完成 → continue 卡隐藏');
  }
  // C1-5 179/180（差一课）→ 不触发完成庆祝，仍普通空态
  {
    const ui = loadUI(lsProg({ completedLessons: doneN180(179) })); injectLessons(ui.ctx); setLang(ui.ctx, 'sr');
    ui.ctx.fillReviewReminders([]);
    const h = ui.cards.lrnReviewList.innerHTML;
    ok(!h.includes('Završila si ceo put'), 'C1-5 179/180 不触发完成庆祝');
    ok(h.includes('Danas nema ponavljanja'), 'C1-5 179/180 仍普通空态文案');
  }
  // C1-6 180/180 + ok-only → 仍完成庆祝（ok 非到期复习，不阻碍）
  {
    const ui = loadUI(ls180()); injectLessons(ui.ctx); setLang(ui.ctx, 'sr');
    ui.ctx.fillReviewReminders([rvC(40, 'ok', 5)]);
    ok(ui.cards.lrnReviewList.innerHTML.includes('Završila si ceo put'), 'C1-6 180/180+ok-only → 完成庆祝');
  }
  // C1-7 普通用户（59/180）行为不变
  {
    const ui = loadUI(lsProg({ completedLessons: doneN180(59) })); injectLessons(ui.ctx); setLang(ui.ctx, 'sr');
    ui.ctx.fillReviewReminders([]);
    ok(ui.cards.lrnReviewList.innerHTML.includes('Danas nema ponavljanja'), 'C1-7 普通用户空态文案保持');
    ok(!ui.cards.lrnReviewList.innerHTML.includes('Završila si ceo put'), 'C1-7 普通用户不显示完成庆祝');
  }
});

// ---- C2 三语与时间格式 ----
runSection('ux9c2', () => {
  section('UX-9C-2 三语文案与 fmtDuration 时间格式');
  // C2-1 三语切换（真实值 sr / en / zh-CN）
  {
    const ui = loadUI(ls180()); injectLessons(ui.ctx);
    setLang(ui.ctx, 'sr'); ui.ctx.fillReviewReminders([]);
    ok(ui.cards.lrnReviewList.innerHTML.includes('Čestitamo! Završila si ceo put'), 'C2-1 sr 完成卡标题');
    setLang(ui.ctx, 'en'); ui.ctx.fillReviewReminders([]);
    ok(ui.cards.lrnReviewList.innerHTML.includes("Congratulations! You've completed the whole learning path"), 'C2-1 en 完成卡标题');
    ok(ui.cards.lrnReviewList.innerHTML.includes('6 h 25 min learning time'), 'C2-1 en 时间（h/min）');
    setLang(ui.ctx, 'zh-CN'); ui.ctx.fillReviewReminders([]);
    ok(ui.cards.lrnReviewList.innerHTML.includes('恭喜你！你完成了整个学习路径'), 'C2-1 zh 完成卡标题');
    ok(ui.cards.lrnReviewList.innerHTML.includes('6 小时 25 分钟'), 'C2-1 zh 时间（小时/分钟）');
    setLang(ui.ctx, 'sr'); ui.ctx.fillReviewReminders([]);
    ok(ui.cards.lrnReviewList.innerHTML.includes('Završila si ceo put'), 'C2-1 切回 sr 仍正确');
  }
  // C2-2 fmtDuration 纯函数边界
  {
    const ui = loadUI(ls180()); injectLessons(ui.ctx);
    const f = (t, l) => ui.ctx.fmtDuration(t, l);
    ok(f(0, 'zh-CN') === '1 分钟', 'C2-2 fmtDuration(0s,zh)=1 分钟');
    ok(f(59, 'zh-CN') === '1 分钟', 'C2-2 fmtDuration(59s,zh)=1 分钟');
    ok(f(60, 'zh-CN') === '1 分钟', 'C2-2 fmtDuration(60s,zh)=1 分钟（不出现 0h 1m）');
    ok(f(3540, 'zh-CN') === '59 分钟', 'C2-2 fmtDuration(59min,zh)=59 分钟');
    ok(f(3600, 'zh-CN') === '1 小时', 'C2-2 fmtDuration(60min,zh)=1 小时');
    ok(f(5700, 'zh-CN') === '1 小时 35 分钟', 'C2-2 fmtDuration(1h35m,zh)=1 小时 35 分钟');
    ok(f(23100, 'zh-CN') === '6 小时 25 分钟', 'C2-2 fmtDuration(6h25m,zh)=6 小时 25 分钟');
    ok(f(0, 'sr') === '1 min', 'C2-2 fmtDuration(0s,sr)=1 min');
    ok(f(3540, 'en') === '59 min', 'C2-2 fmtDuration(59min,en)=59 min');
    ok(f(3600, 'en') === '1 h', 'C2-2 fmtDuration(60min,en)=1 h');
    ok(f(23100, 'sr') === '6 h 25 min', 'C2-2 fmtDuration(6h25m,sr)=6 h 25 min');
    ok(f(23100, 'en') === '6 h 25 min', 'C2-2 fmtDuration(6h25m,en)=6 h 25 min');
    ok(f(23100, 'zh') === '6 小时 25 分钟', 'C2-2 fmtDuration 兼容 setLang(zh) 短形式');
  }
});

// ---- C3 复习优先 + 首页最终状态 ----
runSection('ux9c3', () => {
  section('UX-9C-3 复习优先：180/180 但有 urgent/soon → 复习列表优先，完成卡不抢');
  function attachParentC(ui) {
    const parent = { children: [], insertBefore(child, ref) { const i = this.children.indexOf(ref); if (i >= 0) this.children.splice(i, 0, child); else this.children.push(child); } };
    parent.children.push(ui.cards.lrnContinueCard);
    ui.cards.lrnReviewCard.parentNode = parent;
    ui.cards.lrnContinueCard.parentNode = parent;
    return parent;
  }
  // C3-1 180/180 + urgent → 复习优先
  {
    const ui = loadUI(ls180()); injectLessons(ui.ctx); setLang(ui.ctx, 'sr');
    const parent = attachParentC(ui);
    ui.ctx.fillReviewReminders([rvC(12, 'urgent', -1)]);
    const h = ui.cards.lrnReviewList.innerHTML;
    ok(h.includes('onclick="renderLessonView('), 'C3-1 urgent 复习项可点');
    ok(!h.includes('Završila si ceo put'), 'C3-1 有 urgent → 完成庆祝不出现（复习优先）');
    const ri = parent.children.indexOf(ui.cards.lrnReviewCard), ci = parent.children.indexOf(ui.cards.lrnContinueCard);
    ok(ri >= 0 && ci >= 0 && ri === ci - 1, 'C3-1 复习卡仍上移到 continue 前（ri=' + ri + ',ci=' + ci + '）');
  }
  // C3-2 180/180 + soon → 同样复习优先
  {
    const ui = loadUI(ls180()); injectLessons(ui.ctx); setLang(ui.ctx, 'sr');
    ui.ctx.fillReviewReminders([rvC(5, 'soon', 2)]);
    ok(ui.cards.lrnReviewList.innerHTML.includes('Preostalo'), 'C3-2 soon 复习项渲染（Preostalo X dana）');
    ok(!ui.cards.lrnReviewList.innerHTML.includes('Završila si ceo put'), 'C3-2 有 soon → 完成庆祝不出现');
  }
  // C3-3 首页最终状态：完成卡在复习卡区域 + continue 隐藏
  {
    const ui = loadUI(ls180()); injectLessons(ui.ctx); setLang(ui.ctx, 'sr');
    ui.ctx.fillReviewReminders([]);
    ui.ctx.fillContinueCard(ui.ctx.getProgress());
    ok(ui.cards.lrnReviewList.innerHTML.includes('Završila si ceo put'), 'C3-3 完成卡是复习卡区域内容');
    ok(ui.cards.lrnContinueCard.style.display === 'none', 'C3-3 continue 隐藏 = 全完成首页最终态');
  }
});

// ========== UX-9NEW ==========
runSection('ux9new', () => {
  section('UX-9 Step4 新用户 continue 卡隐藏（复用 UX-1 判定语义，只改 continue 显示）');
  const srcN = fs.readFileSync(path.join(BASE, 'js', 'chinese-ui.js'), 'utf8');
  ok(srcN.includes('!tp.completedLessons&&!tp.totalPoints'), 'SN 源码含新用户判定（与 fillStreakCard 逐字符一致）');
  function prepContinue(cards) {
    cards.lrnContinueCard.querySelector = () => null;
    cards.lrnContinueCard.setAttribute = function (k, v) { this._a = this._a || {}; this._a[k] = v; };
  }
  const seedL1 = { 'chinese-progress-default': JSON.stringify({ completedLessons: { '1': { completedAt: '2026-08-29T10:00:00', score: 80, timeSpent: 60 } }, studyStreak: { current: 0, longest: 3, lastDate: '2026-08-29' }, totalPoints: 150 }) };
  // S1 真新用户：欢迎 CTA 存在 + continue 卡隐藏
  {
    const ui = loadUI(makeLS()); injectLessons(ui.ctx); setLang(ui.ctx, 'sr'); prepContinue(ui.cards);
    ui.ctx.fillStreakCard(ui.ctx.getTotalProgress());
    ui.ctx.fillContinueCard(ui.ctx.getProgress());
    ok(ui.cards.lrnStreakCard.innerHTML.includes('Dobrodošla'), 'S1 欢迎卡存在（sr）');
    ok(ui.cards.lrnStreakCard.innerHTML.includes('Započni prvu lekciju'), 'S1 欢迎卡唯一主 CTA = Započni prvu lekciju');
    ok(ui.cards.lrnContinueCard.style.display === 'none', 'S1 新用户 → continue 卡隐藏');
  }
  // S2 已学过 1 课 → continue 存在 + 欢迎卡不再出现
  {
    const ui = loadUI(makeLS(seedL1)); injectLessons(ui.ctx); setLang(ui.ctx, 'sr'); prepContinue(ui.cards);
    ui.ctx.fillStreakCard(ui.ctx.getTotalProgress());
    ui.ctx.fillContinueCard(ui.ctx.getProgress());
    ok(ui.cards.lrnContinueCard.style.display === 'flex', 'S2 已学 1 课 → continue 卡显示');
    ok(!ui.cards.lrnStreakCard.innerHTML.includes('Dobrodošla'), 'S2 老用户 → 欢迎卡不再出现');
  }
  // S3 streak=0 但有学习记录 → 老用户处理 → continue 存在
  {
    const ui = loadUI(makeLS(seedL1)); injectLessons(ui.ctx); setLang(ui.ctx, 'sr'); prepContinue(ui.cards);
    const p = ui.ctx.getProgress();
    ok(p.studyStreak.current === 0, 'S3 前置：streak=0');
    ui.ctx.fillContinueCard(p);
    ok(ui.cards.lrnContinueCard.style.display === 'flex', 'S3 streak=0 但学过 → continue 卡存在（不误当新用户）');
  }
  // S4 刷新 → 新用户状态保持
  {
    const ls = makeLS();
    const a = loadUI(ls); injectLessons(a.ctx); setLang(a.ctx, 'sr'); prepContinue(a.cards);
    a.ctx.fillContinueCard(a.ctx.getProgress());
    const b = loadUI(ls); injectLessons(b.ctx); setLang(b.ctx, 'sr'); prepContinue(b.cards);
    b.ctx.fillContinueCard(b.ctx.getProgress());
    ok(a.cards.lrnContinueCard.style.display === b.cards.lrnContinueCard.style.display, 'S4 刷新 → continue 状态保持一致（均隐藏）');
    const w1 = a.ctx.getTotalProgress(), w2 = b.ctx.getTotalProgress();
    ok(w1.completedLessons === w2.completedLessons && w1.totalPoints === w2.totalPoints, 'S4 刷新 → 新用户判定数据一致');
  }
  // S5 语言切换 sr→en→zh→sr → 欢迎 CTA 切换 + continue 状态不变
  {
    const ui = loadUI(makeLS()); injectLessons(ui.ctx); prepContinue(ui.cards);
    setLang(ui.ctx, 'sr'); ui.ctx.fillStreakCard(ui.ctx.getTotalProgress());
    ok(ui.cards.lrnStreakCard.innerHTML.includes('Započni prvu lekciju'), 'S5 sr 欢迎 CTA');
    setLang(ui.ctx, 'en'); ui.ctx.fillStreakCard(ui.ctx.getTotalProgress());
    ok(ui.cards.lrnStreakCard.innerHTML.includes('Start your first lesson'), 'S5 en 欢迎 CTA');
    setLang(ui.ctx, 'zh-CN'); ui.ctx.fillStreakCard(ui.ctx.getTotalProgress());
    ok(ui.cards.lrnStreakCard.innerHTML.includes('开始第一课'), 'S5 zh 欢迎 CTA');
    setLang(ui.ctx, 'sr'); ui.ctx.fillStreakCard(ui.ctx.getTotalProgress());
    ok(ui.cards.lrnStreakCard.innerHTML.includes('Započni prvu lekciju'), 'S5 切回 sr 欢迎 CTA');
    ui.ctx.fillContinueCard(ui.ctx.getProgress());
    ok(ui.cards.lrnContinueCard.style.display === 'none', 'S5 语言切换 → continue 卡状态不变（隐藏）');
  }
  // S6 点击欢迎 CTA → Lesson 1
  {
    const ui = loadUI(makeLS()); injectLessons(ui.ctx); setLang(ui.ctx, 'sr');
    ui.ctx.fillStreakCard(ui.ctx.getTotalProgress());
    ok(ui.cards.lrnStreakCard.innerHTML.includes('onclick="continueLearning()"'), 'S6 欢迎卡 CTA onclick=continueLearning()');
    const calls = [];
    ui.ctx.renderLessonView = (id) => calls.push(id);
    ui.ctx.continueLearning();
    ok(calls.length === 1 && calls[0] === 1, 'S6 新用户 continueLearning → Lesson 1（renderLessonView(1)）');
  }
});

// ========== UX-9AC（收官补丁：A 完成卡上移 / C 三语 emoji 统一）==========
runSection('ux9ac', () => {
  section('UX-9A 完成卡上移（紧跟 streak，路径网格不压首屏）+ UX-9C 三语 emoji 统一');
  function mockHome(ui) {
    // 与 index.html 一致的首页 DOM 兄弟顺序：streak → continue → phaseGrid → review
    const phaseGrid = {};
    ui.cards.lrnPhaseGrid = phaseGrid;
    const parent = { children: [], insertBefore(child, ref) { const i = this.children.indexOf(ref); if (i >= 0) this.children.splice(i, 0, child); else this.children.push(child); } };
    phaseGrid.parentNode = parent;
    ui.cards.lrnStreakCard.parentNode = parent;
    ui.cards.lrnContinueCard.parentNode = parent;
    ui.cards.lrnReviewCard.parentNode = parent;
    [ui.cards.lrnStreakCard, ui.cards.lrnContinueCard, phaseGrid, ui.cards.lrnReviewCard].forEach(c => parent.children.push(c));
    return parent;
  }
  // A-1 全完成 + 无 urgent/soon → 完成卡上移到路径网格之前
  {
    const ui = loadUI(ls180()); injectLessons(ui.ctx); setLang(ui.ctx, 'sr');
    const parent = mockHome(ui);
    ui.ctx.fillReviewReminders([]);
    const ri = parent.children.indexOf(ui.cards.lrnReviewCard), gi = parent.children.indexOf(ui.cards.lrnPhaseGrid);
    ok(ri >= 0 && gi >= 0 && ri === gi - 1, 'A-1 完成卡上移到路径网格前（ri=' + ri + ',gi=' + gi + '）');
    ok(ui.cards.lrnReviewList.innerHTML.includes('Završila si ceo put'), 'A-1 完成卡内容保留');
  }
  // A-2 179/180 → 不上移（普通空态，review 保持原位在 phaseGrid 后）
  {
    const ui = loadUI(lsProg({ completedLessons: doneN180(179) })); injectLessons(ui.ctx); setLang(ui.ctx, 'sr');
    const parent = mockHome(ui);
    ui.ctx.fillReviewReminders([]);
    const ri = parent.children.indexOf(ui.cards.lrnReviewCard), gi = parent.children.indexOf(ui.cards.lrnPhaseGrid);
    ok(ri >= 0 && gi >= 0 && ri > gi, 'A-2 179/180 → review 保持在路径网格后（不上移）');
  }
  // A-3 全完成 + urgent → 复习优先，完成卡不出现（A 的上移不与 UX-9B 冲突）
  {
    const ui = loadUI(ls180()); injectLessons(ui.ctx); setLang(ui.ctx, 'sr');
    const parent = mockHome(ui);
    parent.children.splice(0);
    parent.children.push(ui.cards.lrnContinueCard, ui.cards.lrnReviewCard, ui.cards.lrnPhaseGrid);
    ui.ctx.fillReviewReminders([rvC(12, 'urgent', -1)]);
    ok(ui.cards.lrnReviewList.innerHTML.includes('onclick="renderLessonView('), 'A-3 有 urgent → 复习列表渲染');
    ok(!ui.cards.lrnReviewList.innerHTML.includes('Završila si ceo put'), 'A-3 有 urgent → 完成卡不出现');
  }
  // C-1 三语完成卡数据行均无 🔥，标题统一含 🎉
  {
    const ui = loadUI(ls180()); injectLessons(ui.ctx);
    setLang(ui.ctx, 'sr'); ui.ctx.fillReviewReminders([]);
    ok(!ui.cards.lrnReviewList.innerHTML.includes('🔥'), 'C-1 sr 数据行无 🔥');
    ok(ui.cards.lrnReviewList.innerHTML.includes('🎉'), 'C-1 sr 标题含 🎉');
    setLang(ui.ctx, 'en'); ui.ctx.fillReviewReminders([]);
    ok(!ui.cards.lrnReviewList.innerHTML.includes('🔥'), 'C-1 en 无 🔥');
    ok(ui.cards.lrnReviewList.innerHTML.includes('🎉'), 'C-1 en 标题含 🎉');
    setLang(ui.ctx, 'zh-CN'); ui.ctx.fillReviewReminders([]);
    ok(!ui.cards.lrnReviewList.innerHTML.includes('🔥'), 'C-1 zh 无 🔥');
    ok(ui.cards.lrnReviewList.innerHTML.includes('🎉'), 'C-1 zh 标题含 🎉');
  }
});

// ========== UX-10A（Faza1 测验「写汉字」→「选汉字」；Faza2-6 保持 fill-zh）==========
runSection('ux10a', () => {
  section('UX-10A Faza1 测验 pick-zh：写汉字 → 选汉字（Faza2+ 保持 fill-zh，评分/重试不动）');
  const srcQ = fs.readFileSync(path.join(BASE, 'js', 'chinese-quiz.js'), 'utf8');
  const srcU = fs.readFileSync(path.join(BASE, 'js', 'chinese-ui.js'), 'utf8');
  // A0 实现形态
  ok(srcQ.includes('function pickZhOptions('), 'A0-1 源码含 pickZhOptions helper');
  ok(srcQ.includes('type:"pick-zh"'), 'A0-2 源码含 pick-zh 题型');
  ok(srcQ.includes('Izaberi kineski znak'), 'A0-3 sr 文案 = Izaberi kineski znak');
  ok(srcQ.includes('Choose the Chinese characters'), 'A0-4 en 文案 = Choose the Chinese characters');
  ok(srcQ.includes('选择汉字: '), 'A0-5 zh 文案 = 选择汉字');
  ok(srcQ.includes('type:"fill-zh"'), 'A0-6 Faza2+ fill-zh 分支仍保留');
  ok(srcU.includes('generateQuizQuestions(e.words, n)'), 'A0-7 renderQuizTab 传 lessonId 供 phase 判定');
  // A9 评分逻辑不动（60% 通过线）
  ok(srcQ.includes('s>=60'), 'A9 60% 通过线保留（源码 s>=60）');
  ok(srcQ.includes('s>=80') && srcQ.includes('s>=100'), 'A9 星级/perfect 判定保留');
  // A10 重试不动
  ok(srcQ.includes('lrn-quiz-retry-btn'), 'A10 失败重试按钮保留（源码）');
  ok(srcQ.includes("renderLessonView('+e+',\\'quiz\\')"), 'A10 重测入口保留（renderLessonView quiz）');

  const ui = loadUI(makeLS(), { quiz: true }); injectLessons(ui.ctx); setLang(ui.ctx, 'sr');
  const byId = id => ui.ctx.getLessonById(id);
  const gen = id => ui.ctx.generateQuizQuestions(byId(id).words, id);
  // A1: L1（Faza1）→ pick-zh，无 fill-zh
  {
    const qs = gen(1);
    const p = qs.find(q => q.type === 'pick-zh');
    ok(!!p, 'A1 L1 生成 pick-zh（选择汉字题，不再写汉字）');
    ok(!qs.some(q => q.type === 'fill-zh'), 'A1 L1 不再生成 fill-zh');
    ok(p && p.question.includes('Izaberi kineski znak'), 'A1 题面 sr 文案正确');
    ok(p && p.options && p.options.length >= 4, 'A1 pick-zh 带 ≥4 选项');
  }
  // A2: L30（Faza1 末课）→ 仍 pick-zh
  {
    const qs = gen(30);
    ok(qs.some(q => q.type === 'pick-zh'), 'A2 L30 仍 pick-zh（Faza1 全覆盖）');
    ok(!qs.some(q => q.type === 'fill-zh'), 'A2 L30 无 fill-zh');
  }
  // A3: L31（Faza2 首课）→ 恢复 fill-zh
  {
    const qs = gen(31);
    ok(qs.some(q => q.type === 'fill-zh'), 'A3 L31 恢复 fill-zh（Faza2 可输入汉字）');
    ok(!qs.some(q => q.type === 'pick-zh'), 'A3 L31 无 pick-zh');
  }
  // A4: Faza2-6 全课程原有题型不变（无 pick-zh，fill-zh 保留）
  {
    let hasFill = 0; const bad = [];
    for (let id = 31; id <= 180; id++) {
      const l = byId(id); if (!l || !l.words || l.words.length < 3) continue;
      const qs = gen(id);
      if (qs.some(q => q.type === 'pick-zh')) bad.push(id);
      if (qs.some(q => q.type === 'fill-zh')) hasFill++;
    }
    ok(bad.length === 0, 'A4 Faza2-6 无 pick-zh（' + (bad.length ? '违反 L' + bad.join(',L') : '全部原样') + '）');
    ok(hasFill >= 30, 'A4 Faza2-6 fill-zh 仍出现（' + hasFill + ' 课）');
  }
  // A5: pick-zh 选项质量（4 选项=答案+3 干扰，无重复，干扰项合理范围）
  {
    const p = gen(1).find(q => q.type === 'pick-zh');
    ok(p && p.options.length === 4, 'A5 选项 = 答案 + 3 干扰（长度 4）');
    ok(p && new Set(p.options).size === 4, 'A5 选项无重复');
    ok(p && p.options.indexOf(p.answer) >= 0, 'A5 选项含正确答案');
    // 合理范围 = Faza1（L1-L30）全部课程 zh ∪ 安全 fallback 词表
    const flat = [];
    JSON.parse(fs.readFileSync(path.join(BASE, 'data', 'lessons.json'), 'utf8')).forEach(x => (x.lessons || []).forEach(l => flat.push(l)));
    const legal = new Set();
    flat.forEach((l, i) => { if (Math.floor(i / 30) + 1 === 1) (l.words || []).forEach(w => w && w.zh && legal.add(w.zh)); });
    ['你好', '谢谢', '再见', '好的', '请问', '老师', '对不起', '不客气'].forEach(w => legal.add(w));
    const outside = p.options.filter(o => !legal.has(o));
    ok(outside.length === 0, 'A5 干扰项均来自合理范围（当前课/同 phase/fallback）' + (outside.length ? ' 越界: ' + outside.join(',') : ''));
  }
  // A8: 语言切换 sr→en→zh→sr，题型内容一致仅文案切换
  {
    const ref = gen(1).find(q => q.type === 'pick-zh');
    const key = q => q.answer + '|' + q.options.slice().sort().join('|');
    const k0 = key(ref);
    setLang(ui.ctx, 'en'); const en = gen(1).find(q => q.type === 'pick-zh');
    setLang(ui.ctx, 'zh-CN'); const zcn = gen(1).find(q => q.type === 'pick-zh');
    setLang(ui.ctx, 'sr');
    ok(!!en && !!zcn, 'A8 三语下均生成 pick-zh');
    ok(key(en) === k0 && key(zcn) === k0, 'A8 三语下答案+选项集合一致');
    ok(ref.question.includes('Izaberi kineski znak'), 'A8 sr 题面文案');
    ok(en.question.includes('Choose the Chinese characters'), 'A8 en 题面文案');
    ok(zcn.question.includes('选择汉字'), 'A8 zh 题面文案');
  }

  // —— A6/A7 运行时判分：构造 quiz DOM 模拟点击选择 → submitQuiz ——
  function makeQuizDoc(lessonId, questions) {
    const result = { innerHTML: '' };
    const qEls = questions.map(q => {
      const optEls = (q.options || []).map((text, i) => ({
        getAttribute: a => (a === 'data-opt-text' ? text : null),
        textContent: String.fromCharCode(65 + i) + '. ' + text,
        style: {}, disabled: false,
        classList: { add() {}, remove() {} },
      }));
      return {
        getAttribute: a => (a === 'data-answer' ? q.answer : a === 'data-type' ? (q.type || '') : null),
        querySelector: sel => (sel === '.chinese-quiz-option.selected'
          ? (q.selectedText != null ? optEls.find(o => o.getAttribute('data-opt-text') === q.selectedText) || null : null)
          : null),
        querySelectorAll: sel => (sel === '.chinese-quiz-option' ? optEls : []),
      };
    });
    const section = {
      querySelectorAll: sel => (sel === '.chinese-quiz-question' ? qEls : []),
      querySelector: sel => (sel === '.chinese-quiz-submit' ? { style: {} } : sel === '.chinese-quiz-result' ? result : null),
    };
    const doc = makeDoc();
    doc.querySelector = sel => (sel === '.chinese-quiz-section[data-lesson-id="' + lessonId + '"]' ? section : null);
    return { doc, result };
  }
  // A6: 全部选对（4/4=100%）→ 恭喜通过 + 下一课
  {
    const ui6 = loadUI(makeLS(), { quiz: true }); injectLessons(ui6.ctx); setLang(ui6.ctx, 'sr');
    const qs = [
      { answer: '你好', options: ['你好', '谢谢', '再见', '好的'], selectedText: '你好' },
      { answer: '谢谢', options: ['谢谢', '再见', '好的', '你好'], selectedText: '谢谢' },
      { answer: '再见', options: ['再见', '好的', '你好', '谢谢'], selectedText: '再见' },
      { answer: '好的', options: ['好的', '你好', '谢谢', '再见'], selectedText: '好的' },
    ];
    const { doc, result } = makeQuizDoc(1, qs);
    ui6.ctx.document = doc;
    ui6.ctx.submitQuiz(1);
    ok(result.innerHTML.includes('Čestitamo!'), 'A6 全对 → 恭喜通过');
    ok(result.innerHTML.includes('4/4'), 'A6 得分 4/4');
    ok(result.innerHTML.includes('Sledeća lekcija'), 'A6 通过 → 下一课按钮出现');
    ok(!result.innerHTML.includes('lrn-quiz-retry-btn'), 'A6 通过 → 不出现重试按钮');
  }
  // A7: 2/4（50% < 60%）→ 温柔失败反馈 + 重试
  {
    const ui7 = loadUI(makeLS(), { quiz: true }); injectLessons(ui7.ctx); setLang(ui7.ctx, 'sr');
    const qs = [
      { answer: '你好', options: ['你好', '谢谢', '再见', '好的'], selectedText: '你好' },
      { answer: '谢谢', options: ['谢谢', '再见', '好的', '你好'], selectedText: '再见' },
      { answer: '再见', options: ['再见', '好的', '你好', '谢谢'], selectedText: '好的' },
      { answer: '好的', options: ['好的', '你好', '谢谢', '再见'], selectedText: '好的' },
    ];
    const { doc, result } = makeQuizDoc(1, qs);
    ui7.ctx.document = doc;
    ui7.ctx.submitQuiz(1);
    ok(result.innerHTML.includes('Nisi prošla'), 'A7 50% → 温柔失败反馈（不指责）');
    ok(result.innerHTML.includes('2/4'), 'A7 得分 2/4');
    ok(result.innerHTML.includes('lrn-quiz-retry-btn'), 'A7 失败 → 重试按钮出现');
    ok(result.innerHTML.includes('Ponovi test'), 'A7 失败 → 重试文案 sr');
    ok(!result.innerHTML.includes('Sledeća lekcija'), 'A7 失败 → 不出现下一课按钮');
  }
});

// ========== UX-10B（测验通过后「返回首页」次入口：下一课保持主 CTA + 返回首页次按钮）==========
runSection('ux10b', () => {
  section('UX-10B 测验通过后「返回首页」次入口：下一课主 CTA + 返回首页次按钮');
  const srcQ = fs.readFileSync(path.join(BASE, 'js', 'chinese-quiz.js'), 'utf8');
  const srcU = fs.readFileSync(path.join(BASE, 'js', 'chinese-ui.js'), 'utf8');
  const BSl = String.fromCharCode(92);
  // —— 源码断言 ——
  // B1 按钮存在
  ok(srcQ.includes('class="lrn-back-btn" onclick="switchLrnView'), 'B1 通过分支含返回首页按钮（lrn-back-btn → switchLrnView）');
  ok(count(srcQ, 'lrn-back-btn') === 1, 'B1 返回首页按钮仅出现 1 处（不重复）');
  // B2 三语文案（_() 参数序 zh/sr/en）
  ok(srcQ.includes('_("返回首页","Nazad na početnu","Back to home")'), 'B2 三语文案映射正确（zh/sr/en）');
  // B11 不创建新课程入口 / 不改 URL：返回按钮 onclick 仅 switchLrnView('home')
  const biB = srcQ.indexOf('class="lrn-back-btn"');
  const bSeg = srcQ.slice(srcQ.indexOf('text-align:center;margin-top:6px'), srcQ.indexOf('text-align:center;margin-top:6px') + 220);
  ok(biB >= 0 && bSeg.includes('switchLrnView') && !bSeg.includes('renderLessonView') && !bSeg.includes('continueLearning') && !bSeg.includes('location'), 'B11 返回按钮 onclick 仅 switchLrnView(home)——不新建课程入口/不改 URL');
  // B12 移动端：次按钮轻量、不占全宽、不抬高完成区；主 CTA 未破坏；顺序主→次
  ok(bSeg.includes('class="lrn-back-btn"') && !bSeg.includes('width:100%'), 'B12 返回按钮用 .lrn-back-btn（inline-block 小按钮，不占满宽度）');
  ok(bSeg.includes('style="margin-bottom:0"'), 'B12 返回按钮 margin-bottom:0（不抬高完成区）');
  ok(bSeg.includes('text-align:center') && bSeg.includes('margin-top:6px'), 'B12 返回按钮位于小间距居中容器');
  const nIdxB = srcQ.indexOf('class="btn btn-primary" onclick="renderLessonView(');
  ok(nIdxB >= 0 && srcQ.slice(nIdxB, nIdxB + 150).includes('width:100%'), 'B12 下一课主 CTA 仍 btn-primary 全宽（未被破坏）');
  ok(biB > nIdxB, 'B12 布局顺序 = 下一课（主）→ 返回首页（次）');
  // B3 点击回 home：onclick + switchLrnView 的 home 分支刷新首页
  ok(bSeg.includes(['switchLrnView(', BSl, "'home", BSl, "')"].join('')), 'B3 返回按钮 onclick 恰为 switchLrnView(\'home\')');
  const siB = srcU.indexOf('function switchLrnView');
  ok(siB >= 0 && srcU.slice(siB, siB + 900).includes('"home"===e?renderChineseHome()'), 'B3 点击回 home → switchLrnView 切 home 视图并刷新首页（renderChineseHome）');
  // B7 返回首页不改数据（switchLrnView 无写盘调用）
  ok(siB >= 0 && !srcU.slice(siB, siB + 900).includes('saveProgress') && !srcU.slice(siB, siB + 900).includes('setItem'), 'B7 返回首页（switchLrnView）不改 localStorage（数据不丢）');

  // —— 运行时断言 ——
  function makeQuizDocB(lessonId, questions) {
    const result = { innerHTML: '' };
    const qEls = questions.map(q => {
      const optEls = (q.options || []).map((text, i) => ({
        getAttribute: a => (a === 'data-opt-text' ? text : null),
        textContent: String.fromCharCode(65 + i) + '. ' + text,
        style: {}, disabled: false,
        classList: { add() {}, remove() {} },
      }));
      return {
        getAttribute: a => (a === 'data-answer' ? q.answer : a === 'data-type' ? (q.type || '') : null),
        querySelector: sel => (sel === '.chinese-quiz-option.selected'
          ? (q.selectedText != null ? optEls.find(o => o.getAttribute('data-opt-text') === q.selectedText) || null : null)
          : null),
        querySelectorAll: sel => (sel === '.chinese-quiz-option' ? optEls : []),
      };
    });
    const section = {
      querySelectorAll: sel => (sel === '.chinese-quiz-question' ? qEls : []),
      querySelector: sel => (sel === '.chinese-quiz-submit' ? { style: {} } : sel === '.chinese-quiz-result' ? result : null),
    };
    const doc = makeDoc();
    doc.querySelector = sel => (sel === '.chinese-quiz-section[data-lesson-id="' + lessonId + '"]' ? section : null);
    return { doc, result };
  }
  const allRight = [
    { answer: '你好', options: ['你好', '谢谢', '再见', '好的'], selectedText: '你好' },
    { answer: '谢谢', options: ['谢谢', '再见', '好的', '你好'], selectedText: '谢谢' },
    { answer: '再见', options: ['再见', '好的', '你好', '谢谢'], selectedText: '再见' },
    { answer: '好的', options: ['好的', '你好', '谢谢', '再见'], selectedText: '好的' },
  ];
  // B1/B4/B5/B6/B7/B8sr：新用户完成 L1 → 返回按钮 + 数据保存 + continue 指向 L2 + 欢迎 CTA 消失
  {
    const ui = loadUI(makeLS(), { quiz: true }); injectLessons(ui.ctx); setLang(ui.ctx, 'sr');
    const homeDoc = ui.ctx.document;
    const { doc, result } = makeQuizDocB(1, allRight);
    ui.ctx.document = doc;
    ui.ctx.submitQuiz(1);
    ok(result.innerHTML.includes('lrn-back-btn'), 'B1 完成卡含返回首页按钮（运行时）');
    ok(result.innerHTML.includes('switchLrnView'), 'B1 返回按钮 onclick 为 switchLrnView（运行时）');
    ok(result.innerHTML.includes('Nazad na početnu'), 'B8 sr 返回文案 = Nazad na početnu');
    const prog = JSON.parse(ui.ctx.localStorage.getItem('chinese-progress-default'));
    ok(prog && prog.completedLessons && prog.completedLessons['1'], 'B4 提交后进度已保存（completedLessons 含 L1）');
    ok(prog.currentLessonId === 2, 'B4 保存后 currentLessonId=2（下一未完成课，供 continue 指向）');
    ok(prog.totalPoints >= 100, 'B7 totalPoints 已累加');
    ok(prog.studyStreak && typeof prog.studyStreak.current === 'number', 'B7 streak 保留');
    ok(prog.completedLessons && Object.keys(prog.completedLessons).length >= 1, 'B7 completedLessons 保留');
    ui.ctx.document = homeDoc; // 恢复首页 document（fillContinueCard/fillStreakCard 需 getElementById 到首页卡片）
    ui.cards.lrnContinueCard.querySelector = () => null;
    ui.cards.lrnContinueCard.setAttribute = function (k, v) { this._a = this._a || {}; this._a[k] = v; };
    ui.ctx.fillContinueCard(ui.ctx.getProgress());
    ok(ui.cards.lrnContinueCard.style.display === 'flex', 'B5 回首页后 continue 卡显示');
    ok(ui.cards.lrnContinueCard._a && String(ui.cards.lrnContinueCard._a.onclick).includes('renderLessonView(2)'), 'B5 continue 指向下一未完成课 L2');
    ui.ctx.fillStreakCard(ui.ctx.getTotalProgress());
    ok(!ui.cards.lrnStreakCard.innerHTML.includes('continueLearning()'), 'B6 已学 L1 后欢迎卡 CTA（开始第一课）不再出现');
    ok(!ui.cards.lrnStreakCard.innerHTML.includes('Započni prvu lekciju'), 'B6 欢迎 CTA 文案不再出现（新用户首次体验不重复）');
  }
  // B6 对照：真新用户欢迎 CTA 仍在（UX-7 行为不变）
  {
    const un = loadUI(makeLS(), { quiz: true }); injectLessons(un.ctx); setLang(un.ctx, 'sr');
    un.ctx.fillStreakCard(un.ctx.getTotalProgress());
    ok(un.cards.lrnStreakCard.innerHTML.includes('continueLearning()'), 'B6 对照：真新用户欢迎 CTA 仍在（未被误删）');
  }
  // B8 语言切换 en/zh/sr 返回文案
  {
    const ui = loadUI(makeLS(), { quiz: true }); injectLessons(ui.ctx);
    const run = () => { const { doc, result } = makeQuizDocB(1, allRight); ui.ctx.document = doc; ui.ctx.submitQuiz(1); return result.innerHTML; };
    setLang(ui.ctx, 'en'); ok(run().includes('Back to home'), 'B8 en 返回文案 = Back to home');
    setLang(ui.ctx, 'zh-CN'); ok(run().includes('返回首页'), 'B8 zh 返回文案 = 返回首页');
    setLang(ui.ctx, 'sr'); ok(run().includes('Nazad na početnu'), 'B8 切回 sr 返回文案');
  }
  // B9 失败路径（50% < 60%）→ 无返回按钮，重试保留
  {
    const ui = loadUI(makeLS(), { quiz: true }); injectLessons(ui.ctx); setLang(ui.ctx, 'sr');
    const qs = [
      { answer: '你好', options: ['你好', '谢谢', '再见', '好的'], selectedText: '你好' },
      { answer: '谢谢', options: ['谢谢', '再见', '好的', '你好'], selectedText: '再见' },
      { answer: '再见', options: ['再见', '好的', '你好', '谢谢'], selectedText: '好的' },
      { answer: '好的', options: ['好的', '你好', '谢谢', '再见'], selectedText: '好的' },
    ];
    const { doc, result } = makeQuizDocB(1, qs);
    ui.ctx.document = doc;
    ui.ctx.submitQuiz(1);
    ok(!result.innerHTML.includes('lrn-back-btn'), 'B9 失败（50%）→ 不出现返回首页按钮');
    ok(!result.innerHTML.includes('switchLrnView'), 'B9 失败 → 无返回首页 onclick');
    ok(!result.innerHTML.includes('Nazad na početnu'), 'B9 失败 → 无返回文案');
    ok(result.innerHTML.includes('lrn-quiz-retry-btn'), 'B9 失败 → 重试按钮保留');
  }
  // B10 老用户正常：已学 L1，完成 L2 → 返回按钮仍在 + 下一课指向 L3
  {
    const ui = loadUI(lsProg({ completedLessons: doneN180(1) }), { quiz: true }); injectLessons(ui.ctx); setLang(ui.ctx, 'sr');
    const { doc, result } = makeQuizDocB(2, allRight);
    ui.ctx.document = doc;
    ui.ctx.submitQuiz(2);
    ok(result.innerHTML.includes('lrn-back-btn'), 'B10 老用户完成 L2 → 返回首页按钮仍在');
    ok(result.innerHTML.includes('switchLrnView'), 'B10 老用户返回按钮 onclick 存在');
    ok(result.innerHTML.includes('Sledeća lekcija') && result.innerHTML.includes('renderLessonView(3,'), 'B10 下一课主 CTA 指向 L3（继续学习路径正常）');
  }
});

console.log('\n== 汇总 ==');
console.log('通过 ' + passed + ' 项，失败 ' + failed + ' 项' + (skipped ? '（跳过 ' + skipped + ' 项）' : ''));
process.exit(failed ? 1 : 0);
