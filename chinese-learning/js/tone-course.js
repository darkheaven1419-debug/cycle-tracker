/* =========================================================================
 * tone-course.js — Zero Beginner Tone Curriculum（Faza 0）独立引擎（纯函数核心）
 * =========================================================================
 * 原则：本文件 =「课程数据读什么 / 进度怎么存 / 状态怎么算」的引擎与纯函数；
 *      训练组件（UI/状态机/音频）在 js/tone-course-ui.js 负责「怎么练」。
 * 硬边界：独立数据 data/tone-course.json + 独立进度 key chinese-tone-course-<profile>；
 *        绝不调用 markLessonComplete、绝不写 chinese-progress-*、不碰 180 engine。
 * 朗读（mimic）：无麦克风 → 仅记录自报（self），绝不据此自动判分 mastery。
 * 会话（active）：{lessonId,stepIdx,qIdx} 存于进度对象，供语言切换保留与刷新后续学。
 * 日期格式：YYYY-MM-DD（本地）。
 * ========================================================================= */
'use strict';

/* ------------------------- A. 课程数据访问 ------------------------- */
var TC_DATA = null; // 运行时缓存（浏览器 fetch 或测试注入）

function tcSetData(d) { TC_DATA = d; return d; }
function tcGetData() { return TC_DATA; }
function tcLoadData(cb) {
  if (TC_DATA) { if (cb) cb(TC_DATA); return; }
  if (typeof fetch === 'function') {
    fetch('data/tone-course.json')
      .then(function (r) { return r.json(); })
      .then(function (d) { tcSetData(d); if (cb) cb(d); })
      .catch(function () { if (cb) cb(null); });
  } else if (cb) cb(null);
}
function tcLessons() {
  var d = tcGetData();
  if (!d || !Array.isArray(d.lessons)) return [];
  var arr = d.lessons.slice();
  arr.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  return arr;
}
function tcLesson(id) {
  var ls = tcLessons();
  for (var i = 0; i < ls.length; i++) if (ls[i].id === id) return ls[i];
  return null;
}
function tcLessonIds() {
  return tcLessons().map(function (l) { return l.id; });
}
function _lessonIndex(id) {
  var ls = tcLessonIds();
  for (var i = 0; i < ls.length; i++) if (ls[i] === id) return i;
  return -1;
}
/* 从单个 check 步骤生成元信息副本 */
function _checkMetaOf(s) {
  return {
    id: s.id, kind: s.kind, checkKind: s.checkKind || 'whichTone', round: s.round,
    threshold: s.threshold, tones: (s.tones || []).slice(), title: s.title, intro: s.intro,
    question: s.question, allowRetry: s.allowRetry !== false
  };
}
/* 返回某课评分检查步的元信息（无 → null）：
 * stepIdx 缺省 = 第一个评分检查步（向后兼容）；给定数值 = 恰好该步（非 check 则 null）。 */
function tcCheckMeta(lessonId, stepIdx) {
  var l = tcLesson(lessonId);
  if (!l || !Array.isArray(l.steps)) return null;
  if (typeof stepIdx === 'number') {
    var s0 = l.steps[stepIdx];
    return (s0 && s0.kind === 'check') ? _checkMetaOf(s0) : null;
  }
  for (var i = 0; i < l.steps.length; i++) {
    var s = l.steps[i];
    if (s && s.kind === 'check') return _checkMetaOf(s);
  }
  return null;
}
function _shuffle(arr) {
  var a = arr.slice(), i = a.length, j, t;
  while (i > 0) { j = Math.floor(Math.random() * i); i--; t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
/* 某课评分检查步的题干：keepOrder=true 返回原序副本（测试/低随机场景），否则洗牌。
 * stepIdx 缺省 = 第一个评分检查步（向后兼容）；给定数值 = 恰好该步（非 check 或空 → []）。 */
function tcRoundItems(lessonId, keepOrder, stepIdx) {
  var l = tcLesson(lessonId);
  if (!l || !Array.isArray(l.steps)) return [];
  function itemsOf(s) {
    return (s && s.kind === 'check' && Array.isArray(s.items) && s.items.length)
      ? (keepOrder ? s.items.slice() : _shuffle(s.items)) : null;
  }
  if (typeof stepIdx === 'number') {
    var r0 = itemsOf(l.steps[stepIdx]);
    return r0 || [];
  }
  for (var i = 0; i < l.steps.length; i++) {
    var r = itemsOf(l.steps[i]);
    if (r) return r;
  }
  return [];
}
/* 声调注册表查询：返回 {tone,glyph,dir{zh,sr,en},ord{zh,sr,en}} 副本（无 → null） */
function tcToneMeta(tone) {
  var d = tcGetData();
  if (!d || !Array.isArray(d.tones)) return null;
  for (var i = 0; i < d.tones.length; i++) {
    if (d.tones[i].tone === Number(tone)) return JSON.parse(JSON.stringify(d.tones[i]));
  }
  return null;
}

/* ------------------------- B. 进度：独立 key ------------------------- */
function _todayStr() {
  var d = new Date();
  var m = d.getMonth() + 1, day = d.getDate();
  return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
}
function tcToday() { return _todayStr(); }
function _profile() {
  try { if (typeof window !== 'undefined' && window.activeProfile) return window.activeProfile; } catch (e) {}
  return 'default';
}
function tcProgressKey() { return 'chinese-tone-course-' + _profile(); }
function tcDefaultProgress() {
  return { version: 1, startedAt: null, updatedAt: null, completed: [], skipped: false, graduated: false, lastLesson: null, active: null, tone: {}, self: {} };
}
function _ls() { try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch (e) { return null; } }
function tcLoadProgress() {
  var st = _ls();
  var out = tcDefaultProgress();
  if (!st) return out;
  try {
    var s = st.getItem(tcProgressKey());
    if (!s) return out;
    var p = JSON.parse(s);
    if (!p || typeof p !== 'object') return out;
    if (Array.isArray(p.completed)) out.completed = p.completed.slice();
    if (p.skipped === true) out.skipped = true;
    if (p.graduated === true) out.graduated = true;
    if (p.lastLesson) out.lastLesson = p.lastLesson;
    if (p.startedAt) out.startedAt = p.startedAt;
    if (p.updatedAt) out.updatedAt = p.updatedAt;
    if (p.active) out.active = p.active; // 会话续点 {lessonId,stepIdx,qIdx}
    if (p.tone && typeof p.tone === 'object') out.tone = p.tone;
    if (p.self && typeof p.self === 'object') out.self = p.self;
    return out;
  } catch (e) { return out; }
}
function tcSaveProgress(p) {
  var st = _ls();
  if (!st) return false;
  try { st.setItem(tcProgressKey(), JSON.stringify(p)); return true; } catch (e) { return false; }
}
/* 深拷贝（不可变写入的统一入口）：保留所有字段含 active/tone/self */
function _cloneProgress(p) {
  try { return JSON.parse(JSON.stringify(p || tcDefaultProgress())); }
  catch (e) { return tcDefaultProgress(); }
}

/* ------------------------- C. 完成 / 顺序解锁 ------------------------- */
function tcIsComplete(prog, id) {
  return !!(prog && Array.isArray(prog.completed) && prog.completed.indexOf(id) >= 0);
}
function tcUnlock(prog, id) {
  var i = _lessonIndex(id);
  if (i < 0) return false;
  if (i === 0) return true; // G1 恒解锁
  var prev = tcLessonIds()[i - 1];
  return tcIsComplete(prog, prev);
}
function tcAllDone(prog) {
  var ids = tcLessonIds();
  if (!ids.length) return false;
  for (var i = 0; i < ids.length; i++) if (!tcIsComplete(prog, ids[i])) return false;
  return true;
}
function tcNextLesson(prog) {
  var ids = tcLessonIds();
  for (var i = 0; i < ids.length; i++) if (!tcIsComplete(prog, ids[i])) return ids[i];
  return null;
}
/* 完成一课（不可变；幂等；完成即清除会话续点 active）。
 * 完成最后一课（全部 G 课完成）时置 graduated=true —— Faza0 独立毕业标记。 */
function tcCompleteLesson(prog, id, dateStr) {
  if (!prog) prog = tcDefaultProgress();
  if (tcIsComplete(prog, id)) return prog;
  var date = dateStr || _todayStr();
  var p = _cloneProgress(prog);
  p.startedAt = p.startedAt || date;
  p.updatedAt = date;
  p.completed = p.completed.concat([id]);
  p.lastLesson = id;
  p.active = null;
  if (tcAllDone(p)) p.graduated = true;
  return p;
}

/* ------------------------- D. 听辨 mastery（按 1/2/3/4 声分别维护） ------------------------- */
/* mastery 判定（听辨自动判分；三态）：
 *   无记录                                   → none（尚未掌握）
 *   acc≥0.75 且（≥2 不同学习日且 ≥4 样本 或 单批 ≥6 样本）→ mastered（掌握）
 *   acc<0.5                                  → none
 *   其余                                     → consolidating（巩固中） */
function _sum(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s; }
function tcToneStats(prog, tone) {
  var t = String(tone);
  var slot = (prog && prog.tone && prog.tone[t]) || { r: [], days: {} };
  var r = Array.isArray(slot.r) ? slot.r : [];
  var d = slot.days || {};
  var n = r.length, right = _sum(r);
  var acc = n ? right / n : 0;
  var daysN = 0; for (var k in d) if (Object.prototype.hasOwnProperty.call(d, k)) daysN++;
  var state = 'consolidating';
  if (n === 0) state = 'none';
  else if (acc >= 0.75 && ((daysN >= 2 && n >= 4) || n >= 6)) state = 'mastered';
  else if (acc < 0.5 || right === 0) state = 'none';
  return { tone: Number(t), n: n, right: right, acc: Math.round(acc * 100) / 100, days: daysN, state: state };
}
/* 内部：把一次该声听辨结果推入 tone[t].r 窗口（≤8）与该日天数 */
function _tonePush(p, tone, right, date) {
  var t = String(tone);
  if (!p.tone) p.tone = {};
  var prev = p.tone[t];
  var r = prev && Array.isArray(prev.r) ? prev.r.slice() : [];
  var days = {};
  if (prev && prev.days) for (var k in prev.days) if (Object.prototype.hasOwnProperty.call(prev.days, k)) days[k] = prev.days[k];
  r.push(right ? 1 : 0);
  if (r.length > 8) r = r.slice(r.length - 8);
  days[date] = (days[date] || 0) + 1;
  p.tone[t] = { r: r, days: days };
}
/* 记录一次听辨作答（不可变）。仅计入 tone[r] 与该日；不触碰 completed。 */
function tcApplyAnswer(prog, tone, right, dateStr) {
  var date = dateStr || _todayStr();
  var p = _cloneProgress(prog || tcDefaultProgress());
  p.startedAt = p.startedAt || date;
  p.updatedAt = date;
  _tonePush(p, tone, right, date);
  return p;
}
/* 朗读自报存证：记录但绝不进入 mastery 判分（无麦克风不冒充自动朗读评分） */
function tcRecordMimic(prog, tone, like, dateStr) {
  var date = dateStr || _todayStr();
  var p = _cloneProgress(prog || tcDefaultProgress());
  p.startedAt = p.startedAt || date;
  p.updatedAt = date;
  var t = String(tone);
  if (!p.self) p.self = {};
  p.self[t] = (Array.isArray(p.self[t]) ? p.self[t].slice() : []).concat([{ like: !!like, date: date }]);
  return p;
}
function tcSetSkipped(prog, flag) {
  var p = _cloneProgress(prog || tcDefaultProgress());
  p.skipped = !!flag;
  p.updatedAt = p.updatedAt || _todayStr();
  return p;
}
/* 会话续点读写（不可变写） */
function tcSetActive(prog, active) {
  var p = _cloneProgress(prog || tcDefaultProgress());
  p.active = active || null;
  p.updatedAt = _todayStr();
  return p;
}
function tcGetActive(prog) { return (prog && prog.active) ? prog.active : null; }

/* ------------------------- E. 检查回合判分（数据驱动 check 支持两种 checkKind） -------------------------
 * 'whichTone'：听音在 4 个调号/数字中选 → 交给 UI（答案轴 = 1..4）。
 * 'isTone'（二元，如 G2 建锚课）：只听「是目标声 not 不是目标声」，
 *   不要求识别其它声（不出现尚未教过的 2/3/4 声知识要求）。 */
function _itemIsTarget(meta, item) {
  return !!(meta && Array.isArray(meta.tones) && item && meta.tones.indexOf(item.tone) >= 0);
}
/* 二元判分：right =（该词确为目标声）===（用户答「是」） */
function tcCheckRight(meta, item, isYes) {
  return _itemIsTarget(meta, item) === !!isYes;
}
/* 记录二元 check 一题：返回 {right, prog}。
 * mastery 只在该词确为目标声时记录（isTone 里非目标声只是「排除参照」，
 * 答对不代表识别了那个非目标声 → 不污染其它声的 mastery）。 */
function tcRecordCheckAnswer(prog, meta, item, isYes, dateStr) {
  var right = tcCheckRight(meta, item, isYes);
  var p = _cloneProgress(prog || tcDefaultProgress());
  if (_itemIsTarget(meta, item)) {
    var date = dateStr || _todayStr();
    p.startedAt = p.startedAt || date;
    p.updatedAt = date;
    _tonePush(p, item.tone, right, date);
  }
  return { right: right, prog: p };
}

/* ------------------------- F. 首入路由决策 ------------------------- */
/* 主课程 180 是否已开始：读 chinese-progress-<profile>，completedLessons 有键或 totalPoints>0 即视为已开始。 */
function tcHasStarted180() {
  var st = _ls();
  if (!st) return false;
  try {
    var s = st.getItem('chinese-progress-' + _profile());
    if (!s) return false;
    var p = JSON.parse(s);
    if (!p || typeof p !== 'object') return false;
    var cl = 0; if (p.completedLessons && typeof p.completedLessons === 'object') { for (var k in p.completedLessons) if (Object.prototype.hasOwnProperty.call(p.completedLessons, k)) cl++; }
    var tp = p.totalPoints || 0;
    return cl > 0 || tp > 0;
  } catch (e) { return false; }
}
/* 决策：'course'（主 CTA 指向 Faza0）| 'main'（正式课程） */
function tcDecision() {
  var prog = tcLoadProgress();
  if (tcHasStarted180()) return 'main';
  if (prog.skipped) return 'main';
  if (tcAllDone(prog)) return 'main';
  return 'course';
}

/* ------------------------- 导出 ------------------------- */
window.tcSetData = tcSetData;
window.tcGetData = tcGetData;
window.tcLoadData = tcLoadData;
window.tcLessons = tcLessons;
window.tcLesson = tcLesson;
window.tcLessonIds = tcLessonIds;
window.tcCheckMeta = tcCheckMeta;
window.tcRoundItems = tcRoundItems;
window.tcToneMeta = tcToneMeta;
window.tcToday = tcToday;
window.tcProgressKey = tcProgressKey;
window.tcDefaultProgress = tcDefaultProgress;
window.tcLoadProgress = tcLoadProgress;
window.tcSaveProgress = tcSaveProgress;
window.tcIsComplete = tcIsComplete;
window.tcUnlock = tcUnlock;
window.tcAllDone = tcAllDone;
window.tcNextLesson = tcNextLesson;
window.tcCompleteLesson = tcCompleteLesson;
window.tcToneStats = tcToneStats;
window.tcApplyAnswer = tcApplyAnswer;
window.tcRecordMimic = tcRecordMimic;
window.tcSetSkipped = tcSetSkipped;
window.tcSetActive = tcSetActive;
window.tcGetActive = tcGetActive;
window.tcCheckRight = tcCheckRight;
window.tcRecordCheckAnswer = tcRecordCheckAnswer;
window.tcHasStarted180 = tcHasStarted180;
window.tcDecision = tcDecision;
