/* Zero Beginner Tone Curriculum（Faza 0，独立 tone-course 模块）阶段1/2 专项验证（node）
 * 覆盖：课程数据 schema 合法性 / G1–G7 课程序列与调号映射（复用 chinese-tone toneOf）/
 * 检查回合（check）题干生成（isTone 二元 + whichTone 轴 + 多 check 步）/ 顺序解锁与完成 /
 * tones 声调注册表 / mastery 三态（听辨，按 1/2/3/4 声分别维护）/
 * 进度 key 隔离（chinese-tone-course-<profile>，绝不写 chinese-progress-*）/ skip 与新老用户路由决策。
 * 引擎纯函数 + 数据；不含 UI / 首页挂钩 / 朗读评分（朗读仅自报存证、不判分）。
 * 用法: node tests/verify_tone_course.test.js
 */
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const BASE = path.join(__dirname, '..');
let passed = 0, failed = 0;
function ok(c, l) { if (c) { passed++; console.log('  PASS  ' + l); } else { failed++; console.log('  FAIL  ' + l); } }
function section(s) { console.log('\n== ' + s + ' =='); }

/* ---------- DOM / LS 桩（镜像 verify_tone.test.js）---------- */
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

/* ---------- 上下文装载：chinese-tone（toneOf）+ tone-course 引擎，注入真实课程数据 ---------- */
function loadCourseCtx(opts) {
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
  win._ensureChineseVoice = () => Promise.resolve(false);
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(BASE, 'js', 'chinese-tone.js'), 'utf8'), sandbox);
  vm.runInContext(fs.readFileSync(path.join(BASE, 'js', 'tone-course.js'), 'utf8'), sandbox);
  const course = JSON.parse(fs.readFileSync(path.join(BASE, 'data', 'tone-course.json'), 'utf8'));
  vm.runInContext('window.tcSetData(' + JSON.stringify(course) + ');', sandbox);
  return { ctx: sandbox, doc, ls, win };
}
const tc = (c, fn) => c.ctx.window[fn];

/* 可用的 step kind 与三语 key 白名单 */
const KINDS = ['explain', 'cards', 'teach', 'listen', 'mimic', 'check'];
const LANGS = ['zh', 'sr', 'en'];

(async () => {

  /* ============ D1 数据 schema 合法性（直接读文件） ============ */
  section('D1: tone-course.json schema');
  {
    const raw = JSON.parse(fs.readFileSync(path.join(BASE, 'data', 'tone-course.json'), 'utf8'));
    ok(raw.schemaVersion === 1 && raw.id === 'faza0-tones', 'schemaVersion=1 & 顶层 id=faza0-tones');
    ok(raw.meta && raw.meta.name && raw.meta.name.sr && raw.meta.name.zh && raw.meta.name.en, 'meta.name 三语齐全');
    ok(Array.isArray(raw.lessons) && raw.lessons.length === 7, 'lessons = 7（G1–G7）');
    const ids = raw.lessons.map(l => l.id);
    ok(['G1','G2','G3','G4','G5','G6','G7'].every(id => ids.indexOf(id) >= 0), '含 G1–G7');
    ok(new Set(ids).size === ids.length, 'lesson id 唯一');
    const orders = raw.lessons.map(l => l.order).sort((a, b) => a - b);
    ok(orders.every((o, i) => o === i + 1), 'order 从 1 连续递增（供顺序解锁）');
    let kindsGood = true, triGood = true, stepsGood = true;
    raw.lessons.forEach(l => {
      if (!l.title || !l.title.sr || !l.title.zh || !l.title.en) triGood = false;
      if (!l.objective || !l.objective.sr) triGood = false;
      if (!Array.isArray(l.steps) || l.steps.length === 0) stepsGood = false;
      (l.steps || []).forEach(s => {
        if (KINDS.indexOf(s.kind) < 0) kindsGood = false;
        if (!s.id) stepsGood = false;
        if (s.title && !(s.title.sr && s.title.zh && s.title.en)) triGood = false;
      });
    });
    ok(kindsGood, '所有 step.kind 在 {explain,cards,teach,listen,mimic,check} 内');
    ok(triGood, '每课 title/objective 与 step.title 三语齐全');
    ok(stepsGood, '每课 steps 非空且每步有唯一 id');
    const g1 = raw.lessons.find(l => l.id === 'G1');
    ok(g1.kind === 'concept' && g1.noScore === true, 'G1 为概念课且 noScore=true（不评分不记忆）');
    ok(g1.toneFocus.length === 4, 'G1 覆盖全部四声');
    const g2 = raw.lessons.find(l => l.id === 'G2');
    ok(g2.kind === 'anchor', 'G2 为建锚课');
    ok(g2.steps.map(s => s.kind).join(',') === 'teach,listen,mimic,check', 'G2 流程 = Teach→Listen→Mimic→Check');
    ok(g2.toneFocus.length === 1 && g2.toneFocus[0] === 1, 'G2 只练第一声');
    // G3–G7：课程结构（教什么→练什么；不越权提前进入 4-way）
    const g3 = raw.lessons.find(l => l.id === 'G3');
    const g4 = raw.lessons.find(l => l.id === 'G4');
    const g5 = raw.lessons.find(l => l.id === 'G5');
    const g6 = raw.lessons.find(l => l.id === 'G6');
    const g7 = raw.lessons.find(l => l.id === 'G7');
    ok(g3.kind === 'anchor' && g3.toneFocus.join(',') === '4', 'G3 第四声建锚课（toneFocus=[4]，只练 4）');
    ok(g3.steps.map(s => s.kind).join(',') === 'teach,listen,mimic,check', 'G3 流程 = Teach→Listen→Mimic→Check（四声建锚）');
    const ck3 = g3.steps[g3.steps.length - 1];
    ok(ck3.checkKind === 'isTone' && ck3.tones.join(',') === '4' && ck3.round === 6, 'G3 check = isTone[4] round6（与 T1 对照，不进入 4-way）');
    ok(g4.kind === 'compare' && g4.toneFocus.join(',') === '1,4', 'G4 一比四对比课（toneFocus=[1,4]，只练 1/4）');
    ok(g4.steps.map(s => s.kind).join(',') === 'cards,check', 'G4 流程 = Cards→Check');
    const ck4 = g4.steps[g4.steps.length - 1];
    ok(ck4.checkKind === 'whichTone' && ck4.tones.join(',') === '1,4' && ck4.round === 8, 'G4 check = whichTone 轴 [1,4] round8');
    ok(g5.kind === 'anchor' && g5.toneFocus.join(',') === '2', 'G5 第二声建锚课（toneFocus=[2]）');
    ok(g5.steps.map(s => s.kind).join(',') === 'teach,listen,mimic,check', 'G5 流程 = Teach→Listen→Mimic→Check（第二声建锚）');
    const ck5 = g5.steps[g5.steps.length - 1];
    ok(ck5.checkKind === 'isTone' && ck5.tones.join(',') === '2', 'G5 check = isTone[2]（二元，不要求命名 1/4）');
    ok(g6.kind === 'anchor' && g6.toneFocus.join(',') === '3', 'G6 第三声建锚课（toneFocus=[3]）');
    const ck6 = g6.steps.filter(s => s.kind === 'check');
    ok(ck6.length === 2 && ck6[0].checkKind === 'isTone' && ck6[0].tones.join(',') === '3' && ck6[1].checkKind === 'whichTone' && ck6[1].tones.join(',') === '2,3,4',
      'G6 两步 check：先 isTone(3) 单独练，再 whichTone 轴 [2,3,4]（短混合，收尾才混）');
    ok(g7.kind === 'review' && g7.toneFocus.join(',') === '1,2,3,4', 'G7 总复习课（1/2/3/4）');
    const ck7 = g7.steps[g7.steps.length - 1];
    ok(ck7.checkKind === 'whichTone' && ck7.tones.join(',') === '1,2,3,4' && ck7.round === 8, 'G7 check = whichTone 轴 [1,2,3,4] round8（ma 四声）');
    // 新课程达标文案 now（G2 无 now → 回退 legacy）
    ok(['G3','G4','G5','G6','G7'].every(id => { const l = raw.lessons.find(x => x.id === id); return l.now && l.now.zh && l.now.sr && l.now.en; }),
      'G3–G7 均有 now 三语达标文案');
    ok(!raw.lessons.find(x => x.id === 'G2').now, 'G2 无 now（沿用 legacy nowT1 回退文案，字节级兼容）');
  }

  /* ============ D2 课程数据 → 调号映射一致（复用 chinese-tone toneOf/unmark） ============ */
  section('D2: 数据项调号与 toneOf 一致 / 记号在拼音内');
  {
    const c = loadCourseCtx({});
    const toneOf = c.ctx.window.toneOf, unmark = c.ctx.window.unmarkTone;
    const DIAC = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/;
    // 汇总「可辨调词条」：check/listen/mimic 词条自带头 tone；teach 带 s.sample(tone)；cards 的 tone 在卡片上、sample 只给词
    const words = [];
    const data = tc(c, 'tcGetData')();
    data.lessons.forEach(l => (l.steps || []).forEach(s => {
      (s.items || []).forEach(it => words.push(it));
      if (s.sample && s.sample.py) words.push(s.sample);
      (s.cards || []).forEach(card => words.push({ py: card.sample.py, tone: card.tone }));
    }));
    let mapOk = true, unOk = true;
    words.forEach(it => {
      if (!it || !it.py || typeof it.tone !== 'number') { mapOk = false; console.log('    词条缺 tone 或 py: ' + JSON.stringify(it)); return; }
      if (!(it.tone >= 1 && it.tone <= 4)) mapOk = false;
      if (toneOf(it.py) !== it.tone) { mapOk = false; console.log('    toneOf(' + it.py + ')=' + toneOf(it.py) + ' 数据 tone=' + it.tone); }
      const plain = unmark(it.py);
      if (!plain.length || DIAC.test(plain)) { unOk = false; console.log('    unmark(' + it.py + ')=' + plain + ' 非纯拼音'); }
    });
    ok(mapOk, '所有词条 py 的 toneOf 与显式 tone(1-4) 一致');
    ok(unOk, 'unmark 去调号后为纯拼音、无残留记号（记号按韵母变化：mā/shū/sān…）');
    ok(tc(c, 'tcLessonIds')().join(',') === 'G1,G2,G3,G4,G5,G6,G7', 'tcLessonIds 按 order 排序');
  }

  /* ============ D3 check 回合元数据与题干生成 ============ */
  section('D3: 检查回合（check）纯函数');
  {
    const c = loadCourseCtx({});
    ok(tc(c, 'tcCheckMeta')('G1') === null, 'G1 无评分 check（noScore 课无 check）');
    const m2 = tc(c, 'tcCheckMeta')('G2');
    ok(m2 && m2.round === 4 && m2.threshold === 75 && m2.tones.join(',') === '1', 'G2 check round=4 threshold=75 目标声 tones=[1]');
    ok(m2.checkKind === 'isTone', 'G2 check 为二元 isTone（是否第一声），非 1/2/3/4 四选一');
    const keep = tc(c, 'tcRoundItems')('G2', true);
    ok(Array.isArray(keep) && keep.length === m2.round, 'tcRoundItems(G2) 返回 4 题');
    ok(keep.some(it => it.tone === 1) && keep.some(it => it.tone !== 1), 'G2 回合含「是 T1」与「非 T1」参照（ma 家族，G1 已听过）');
    ok(keep.every(it => it.tone === 1 || it.tone === 3 || it.tone === 4), '参照只用已听过内容，无其它新增负担');
    // 二元判分：right =（确为目标声）===（答「是」）
    ok(tc(c, 'tcCheckRight')(m2, { tone: 1 }, true) === true, '是 T1 答「是」→ 对');
    ok(tc(c, 'tcCheckRight')(m2, { tone: 1 }, false) === false, '是 T1 答「不是」→ 错');
    ok(tc(c, 'tcCheckRight')(m2, { tone: 4 }, false) === true, '非 T1 答「不是」→ 对（无需知道它是几声）');
    ok(tc(c, 'tcCheckRight')(m2, { tone: 3 }, true) === false, '非 T1 答「是」→ 错');
    const defP = tc(c, 'tcDefaultProgress')();
    const recNo = tc(c, 'tcRecordCheckAnswer')(defP, m2, { tone: 4 }, false, '2026-09-04');
    ok(recNo.right === true, '非 T1 参照判对');
    ok(tc(c, 'tcToneStats')(recNo.prog, 4).n === 0, '参照不产生 4 声 mastery（只当参照、非识别）');
    const recYes = tc(c, 'tcRecordCheckAnswer')(defP, m2, { tone: 1 }, true, '2026-09-04');
    ok(recYes.right === true && tc(c, 'tcToneStats')(recYes.prog, 1).n === 1, '目标声答对 → 计入 1 声 mastery');
    ok(tc(c, 'tcRoundItems')('G1', true).length === 0, 'G1 无题可出（无评分课）');
    const shuffled = tc(c, 'tcRoundItems')('G2', false);
    ok(shuffled.length === keep.length, '洗牌版长度一致');
    ok(shuffled.every(it => keep.some(k => k.py === it.py && k.tone === it.tone)), '洗牌仅重排、不换题');
    const before = JSON.stringify(keep);
    tc(c, 'tcRoundItems')('G2', true);
    ok(JSON.stringify(tc(c, 'tcRoundItems')('G2', true)) === before, '生成回合不修改课程数据（纯函数，无副作用）');
  }

  /* ============ D4 进度默认 / 顺序解锁 / 完成（不可变） ============ */
  section('D4: 进度默认、顺序解锁、完成推进');
  {
    const c = loadCourseCtx({});
    const def = tc(c, 'tcDefaultProgress')();
    ok(Array.isArray(def.completed) && def.completed.length === 0, '默认无已完成课');
    ok(def.skipped === false && def.graduated === false, '默认未跳过、未毕业');
    ok(tc(c, 'tcUnlock')(def, 'G1') === true, 'G1 初始解锁');
    ok(tc(c, 'tcUnlock')(def, 'G2') === false, 'G2 需先完成 G1');
    ok(tc(c, 'tcNextLesson')(def) === 'G1', '下一步 = G1');
    ok(tc(c, 'tcAllDone')(def) === false, '默认未完成全部');
    const afterG1 = tc(c, 'tcCompleteLesson')(def, 'G1', '2026-09-04');
    ok(afterG1 !== def && def.completed.length === 0, 'tcCompleteLesson 返回新对象、不修改入参（不可变）');
    ok(afterG1.completed.join(',') === 'G1', '完成 G1 后 completed=[G1]');
    ok(tc(c, 'tcIsComplete')(afterG1, 'G1') && !tc(c, 'tcIsComplete')(afterG1, 'G2'), 'G1 完成、G2 未完成');
    ok(tc(c, 'tcUnlock')(afterG1, 'G2') === true && tc(c, 'tcNextLesson')(afterG1) === 'G2', 'G1 完成 → G2 解锁、下一步=G2');
    const again = tc(c, 'tcCompleteLesson')(afterG1, 'G1', '2026-09-04');
    ok(again.completed.length === 1, '重复完成同一课幂等（不重复记录）');
    const fin = tc(c, 'tcCompleteLesson')(afterG1, 'G2', '2026-09-04');
    ok(tc(c, 'tcAllDone')(fin) === false && fin.graduated === false && tc(c, 'tcNextLesson')(fin) === 'G3', 'G1+G2 完成 → 未完、未毕业，下一步=G3（推进到新课程）');
    let all = fin;
    tc(c, 'tcLessonIds')().slice(2).forEach(id => { all = tc(c, 'tcCompleteLesson')(all, id, '2026-09-04'); });
    ok(tc(c, 'tcAllDone')(all) === true && tc(c, 'tcNextLesson')(all) === null, '全 7 课完成 → AllDone、无下一步');
    ok(all.graduated === true && all.completed.length === 7, '最后一课完成 → graduated=true，completed 恰好 7 课');
  }

  /* ============ D5 日期格式 ============ */
  section('D5: 时间戳为本地 YYYY-MM-DD');
  {
    const c = loadCourseCtx({});
    const today = tc(c, 'tcToday')();
    ok(/^\d{4}-\d{2}-\d{2}$/.test(today), 'tcToday 返回 YYYY-MM-DD（' + today + '）');
    const prog = tc(c, 'tcApplyAnswer')(tc(c, 'tcDefaultProgress')(), 1, true, today);
    ok(prog.updatedAt === today, 'updatedAt 用同日日期');
    ok(prog.completed.length === 0 && !prog.skipped, '记录答案不误标完成/跳过');
  }

  /* ============ D6 mastery 三态：按声分别维护（听辨） ============ */
  section('D6: mastery 三态（none/consolidating/mastered）');
  {
    const c = loadCourseCtx({});
    const def = tc(c, 'tcDefaultProgress')();
    ok(tc(c, 'tcToneStats')(def, 1).state === 'none', '无记录 → 尚未掌握(none)');
    // 同日 8 对 → mastered（8 题 ≥6 且高正确，如 G7 单轮达标）
    let p = def;
    for (let i = 0; i < 8; i++) p = tc(c, 'tcApplyAnswer')(p, 1, true, '2026-09-04');
    ok(tc(c, 'tcToneStats')(p, 1).state === 'mastered', '单日 8/8 对 → mastered');
    ok(tc(c, 'tcToneStats')(p, 1).acc === 1 && tc(c, 'tcToneStats')(p, 1).days === 1, 'stats 暴露 acc/days');
    // 不同学习日累积 4/4 对 → mastered
    p = def;
    p = tc(c, 'tcApplyAnswer')(p, 4, true, '2026-09-01');
    p = tc(c, 'tcApplyAnswer')(p, 4, true, '2026-09-01');
    p = tc(c, 'tcApplyAnswer')(p, 4, true, '2026-09-02');
    p = tc(c, 'tcApplyAnswer')(p, 4, true, '2026-09-02');
    ok(tc(c, 'tcToneStats')(p, 4).state === 'mastered', '两学习日 4/4 对 → mastered');
    // 多数答错 → none
    p = def;
    p = tc(c, 'tcApplyAnswer')(p, 2, false, '2026-09-04');
    p = tc(c, 'tcApplyAnswer')(p, 2, false, '2026-09-04');
    p = tc(c, 'tcApplyAnswer')(p, 2, false, '2026-09-04');
    p = tc(c, 'tcApplyAnswer')(p, 2, true, '2026-09-04');
    ok(tc(c, 'tcToneStats')(p, 2).state === 'none', '多数答错 → none');
    // 单次答对 → consolidating（刚开始形成）
    p = tc(c, 'tcApplyAnswer')(def, 3, true, '2026-09-04');
    ok(tc(c, 'tcToneStats')(p, 3).state === 'consolidating', '一次答对 → 巩固中(consolidating)');
    // 声别隔离
    ok(tc(c, 'tcToneStats')(p, 1).state === 'none' && tc(c, 'tcToneStats')(p, 4).state === 'none',
      '1 声记录不污染 3/4 声（按声分别维护）');
  }

  /* ============ D7 朗读自报存证、不判分 ============ */
  section('D7: 朗读 mimic 自报只存证、不进入 mastery 自动判分');
  {
    const c = loadCourseCtx({});
    let p = tc(c, 'tcDefaultProgress')();
    p = tc(c, 'tcRecordMimic')(p, 1, true, '2026-09-04');
    ok(p.self && p.self['1'] && p.self['1'].length === 1 && p.self['1'][0].like === true, '自报记录已存证');
    ok(tc(c, 'tcToneStats')(p, 1).n === 0 && tc(c, 'tcToneStats')(p, 1).state === 'none', '朗读自报不自动判 mastery（无麦克风不做机器评分）');
  }

  /* ============ D8 进度 key 隔离 ============ */
  section('D8: 进度写入独立 key chinese-tone-course-<profile>，绝不碰 chinese-progress-*');
  {
    const c = loadCourseCtx({});
    ok(tc(c, 'tcProgressKey')() === 'chinese-tone-course-default', '进度 key = chinese-tone-course-default');
    ok(c.ls.getItem('chinese-tone-course-default') === null, '初始未写入');
    ok(c.ls.getItem('chinese-progress-default') === null, '主课程 key 未被触碰');
    let p = tc(c, 'tcDefaultProgress')();
    p = tc(c, 'tcCompleteLesson')(p, 'G1', '2026-09-04');
    tc(c, 'tcSaveProgress')(p);
    ok(c.ls.getItem('chinese-tone-course-default') !== null, 'tone 进度已写入独立 key');
    ok(c.ls.getItem('chinese-progress-default') === null, '写 tone 进度不创建/修改 chinese-progress-default');
    const reloaded = tc(c, 'tcLoadProgress')();
    ok(reloaded.completed.join(',') === 'G1', '重新读取与写入一致');
  }

  /* ============ D9 路由决策：新老用户 / skip / 完成 ============ */
  section('D9: 首入路由决策（tcDecision）');
  {
    // 全新用户（无 180 进度、未跳过、未完成）→ 指向 Faza0
    const fresh = loadCourseCtx({});
    ok(tc(fresh, 'tcHasStarted180')() === false, '全新用户未开始 180 课');
    ok(tc(fresh, 'tcDecision')() === 'course', '全新用户 → 指向 Faza0 课程(course)');
    // 老用户（已有 180 进度）→ 绝不锁定：返回正式课程(main)
    const mainSeed = { 'chinese-progress-default': JSON.stringify({ completedLessons: { '1': {} }, totalPoints: 12 }) };
    const old = loadCourseCtx({ seed: mainSeed });
    ok(tc(old, 'tcHasStarted180')() === true, '检测到 180 课进度');
    ok(tc(old, 'tcDecision')() === 'main', '老用户 → 正式课程(main)，绝不强制回 Faza0');
    // 新用户主动跳过 → main
    const sk = loadCourseCtx({});
    let sp = tc(sk, 'tcDefaultProgress')();
    sp = tc(sk, 'tcSetSkipped')(sp, true);
    tc(sk, 'tcSaveProgress')(sp);
    ok(tc(sk, 'tcDecision')() === 'main', '跳过 Faza0 后 → 正式课程(main)，不再反复拦截');
    // 完成全部 G 课 → main（毕业去向正式课程）
    const dn = loadCourseCtx({});
    let dp = tc(dn, 'tcDefaultProgress')();
    tc(dn, 'tcLessonIds')().forEach(id => { dp = tc(dn, 'tcCompleteLesson')(dp, id, '2026-09-04'); });
    tc(dn, 'tcSaveProgress')(dp);
    ok(tc(dn, 'tcAllDone')(dp) === true && dp.graduated === true, '全部 7 课完成且已毕业');
    ok(tc(dn, 'tcDecision')() === 'main', '毕业/完成后 → 正式课程(main)');
    // 新用户中途退出（只完成 G1）→ 仍回 Faza0 续学
    const mid = loadCourseCtx({});
    let mp = tc(mid, 'tcDefaultProgress')();
    mp = tc(mid, 'tcCompleteLesson')(mp, 'G1', '2026-09-04');
    tc(mid, 'tcSaveProgress')(mp);
    ok(tc(mid, 'tcDecision')() === 'course' && tc(mid, 'tcNextLesson')(mp) === 'G2', '中途退出 → 回 Faza0 续学 G2');
  }

  /* ============ D10 声调注册表 / whichTone 元信息 / 多 check 步 / 毕业标记 ============ */
  section('D10: tones 注册表 / whichTone / 多 check 步 / graduated');
  {
    const c = loadCourseCtx({});
    const GLYPHS = { 1: 'ā', 2: 'á', 3: 'ǎ', 4: 'à' };
    const ORD_ZH = { 1: '第一声', 2: '第二声', 3: '第三声', 4: '第四声' };
    const ORD_SR = { 1: 'prvi ton', 2: 'drugi ton', 3: 'treći ton', 4: 'četvrti ton' };
    [1, 2, 3, 4].forEach(tn => {
      const m = tc(c, 'tcToneMeta')(tn);
      ok(m && m.tone === tn && m.glyph === GLYPHS[tn], 'tcToneMeta(' + tn + ') glyph = ' + GLYPHS[tn]);
      ok(m && m.dir.zh && m.dir.sr && m.dir.en && m.ord.zh === ORD_ZH[tn] && m.ord.sr === ORD_SR[tn] && m.ord.en === 'Tone ' + tn,
        '注册表 ' + tn + ' 声 dir/ord 三语齐全');
    });
    ok(tc(c, 'tcToneMeta')(3).dir.zh === '低而弯' && tc(c, 'tcToneMeta')(3).dir.en === 'low & curved', '第三声 dir = 低而弯（不教“先降后升”绝对式）');
    ok(tc(c, 'tcToneMeta')(4).dir.zh === '快速下降', '第四声 dir = 快速下降');
    ok(tc(c, 'tcToneMeta')(0) === null && tc(c, 'tcToneMeta')(5) === null, '越界声 → null');
    const reg = tc(c, 'tcGetData')().tones;
    ok(Array.isArray(reg) && reg.length === 4 && new Set(reg.map(x => x.tone)).size === 4, '数据 tones 注册表 4 条唯一');
    // whichTone 元信息（缺省 = 首个评分 check；数值 stepIdx = 恰好该步）
    ok(tc(c, 'tcCheckMeta')('G4').checkKind === 'whichTone' && tc(c, 'tcCheckMeta')('G4').tones.join(',') === '1,4' && tc(c, 'tcCheckMeta')('G4').round === 8,
      'tcCheckMeta(G4) = whichTone[1,4] round8');
    ok(tc(c, 'tcCheckMeta')('G3').checkKind === 'isTone' && tc(c, 'tcCheckMeta')('G3').tones.join(',') === '4' && tc(c, 'tcCheckMeta')('G3').round === 6,
      'G3 check isTone[4] round=6（第四声建锚，不进入 4-way）');
    ok(tc(c, 'tcCheckMeta')('G5').checkKind === 'isTone' && tc(c, 'tcCheckMeta')('G5').tones.join(',') === '2', 'G5 check isTone[2]（二元）');
    const g6 = tc(c, 'tcLesson')('G6');
    const ck6b = g6.steps.findIndex(s => s.kind === 'check' && s.checkKind === 'whichTone');
    ok(ck6b > 0 && tc(c, 'tcCheckMeta')('G6', ck6b).checkKind === 'whichTone' && tc(c, 'tcCheckMeta')('G6', ck6b).tones.join(',') === '2,3,4',
      'tcCheckMeta(G6, stepIdx) 定位第二步 check = whichTone[2,3,4]');
    ok(tc(c, 'tcCheckMeta')('G6').checkKind === 'isTone', 'tcCheckMeta(G6) 缺省 = 第一 check(isTone) 向后兼容');
    const nonCk = g6.steps.findIndex(s => s.kind !== 'check');
    ok(tc(c, 'tcCheckMeta')('G6', nonCk) === null, 'stepIdx 指向非 check 步 → null');
    ok(tc(c, 'tcRoundItems')('G4', true).length === 8 && tc(c, 'tcRoundItems')('G4', true).every(it => it.tone === 1 || it.tone === 4),
      'G4 回合 8 题且只在 1/4（无“需命名 2/3”的负担）');
    ok(tc(c, 'tcRoundItems')('G6', true, ck6b).length === 6 && tc(c, 'tcRoundItems')('G6', true, ck6b).every(it => [2, 3, 4].indexOf(it.tone) >= 0),
      'G6 第二 check 题 tone ∈ 轴 [2,3,4]');
    const g7 = tc(c, 'tcLesson')('G7');
    const g7items = tc(c, 'tcRoundItems')('G7', true);
    ok(g7items.length === 8 && new Set(g7items.map(i => i.tone)).size === 4, 'G7 总辨认 8 题覆盖 1/2/3/4');
    ok(tc(c, 'tcCheckMeta')('G7').tones.join(',') === '1,2,3,4', 'G7 收尾 = ma 四选一');
    // graduated：G1+G2 完成不置位；全 7 课完成置位
    let p = tc(c, 'tcDefaultProgress')();
    p = tc(c, 'tcCompleteLesson')(p, 'G1', '2026-09-04');
    p = tc(c, 'tcCompleteLesson')(p, 'G2', '2026-09-04');
    ok(p.graduated === false && tc(c, 'tcAllDone')(p) === false, 'G1+G2 完成未毕业（G3–G7 未完成）');
    tc(c, 'tcLessonIds')().slice(2).forEach(id => { p = tc(c, 'tcCompleteLesson')(p, id, '2026-09-04'); });
    ok(tc(c, 'tcAllDone')(p) === true && p.graduated === true, '全 7 课完成 → graduated=true');
    // whichTone 作答即识别记录（tcApplyAnswer，每答都是真识别）
    let qp = tc(c, 'tcDefaultProgress')();
    qp = tc(c, 'tcApplyAnswer')(qp, 4, true, '2026-09-04');
    ok(tc(c, 'tcToneStats')(qp, 4).n === 1, 'whichTone 答对 4 → 计入 4 声 mastery');
  }

  /* ============ D11 数据不变量：每道 check 题的词都“先听后辨”（教什么→练什么） ============ */
  section('D11: check 题词条均先前置听过');
  {
    const raw = JSON.parse(fs.readFileSync(path.join(BASE, 'data', 'tone-course.json'), 'utf8'));
    const grab = (s, out) => {
      if (!s) return out;
      if (s.zh) out.add(s.zh);                                   // mimic item 直接 {zh,py,tone}
      if (s.sample && s.sample.zh) out.add(s.sample.zh);         // teach sample
      (s.items || []).forEach(it => { if (it && it.zh) out.add(it.zh); });
      (s.cards || []).forEach(cd => { if (cd && cd.sample && cd.sample.zh) out.add(cd.sample.zh); });
      return out;
    };
    let heard = new Set(), bad = 0, firstBad = null;
    raw.lessons.forEach(l => {
      const inLesson = new Set(heard);
      (l.steps || []).forEach(s => {
        if (s && s.kind === 'check') {
          (s.items || []).forEach(it => {
            if (!inLesson.has(it.zh)) { bad++; if (!firstBad) firstBad = l.id + '#' + s.id + ' → ' + it.zh + '(' + it.py + ')'; }
          });
        }
        grab(s, inLesson); // 校验后才把该步词计入“已听过”（同课后续 check / 后续课可复用）
      });
      heard = inLesson;
    });
    ok(bad === 0, bad ? ('存在未前置听过的 check 词: ' + firstBad + '（共 ' + bad + ' 处）') : '每道 check 题的词都在更早步骤/更早课里先听过');
  }

  /* ============ D12 轴合法不变量：whichTone 轴只含“已命名声 ∪ 本课目标声” ============ */
  section('D12: whichTone 轴无“未教就考”');
  {
    const raw = JSON.parse(fs.readFileSync(path.join(BASE, 'data', 'tone-course.json'), 'utf8'));
    const named = new Set(); // 非概念课正式建锚/命名过的声
    let bad = 0, firstBad = null;
    raw.lessons.forEach(l => {
      const selfNamed = l.kind !== 'concept' ? (l.toneFocus || []) : [];
      (l.steps || []).forEach(s => {
        if (s && s.kind === 'check' && s.checkKind === 'whichTone') {
          const allowed = new Set(named);
          selfNamed.forEach(tn => allowed.add(tn));
          (s.tones || []).forEach(tn => { if (!allowed.has(tn)) { bad++; if (!firstBad) firstBad = l.id + '#' + s.id + ' 轴含未命名声 ' + tn; } });
        }
      });
      if (l.kind !== 'concept') (l.toneFocus || []).forEach(tn => named.add(tn));
    });
    ok(bad === 0, bad ? firstBad : '所有 whichTone 轴只含已命名声（axis 不要求未教知识）');
  }

  console.log('\n结果: ' + passed + ' 通过, ' + failed + ' 失败');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('运行时错误:', e); process.exit(1); });
