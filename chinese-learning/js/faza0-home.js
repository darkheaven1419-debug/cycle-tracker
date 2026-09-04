/* faza0-home.js — Faza 0 · Glasovi i tonovi 首页接入（阶段4）
   =========================================================================
   职责（只做这些，不越界）：
   1. renderFaza0Card()：把 "Faza0 hero + 状态卡" prepend 到 #lrnPhaseGrid
      （#lrnPhaseGrid 每次 render 被 chinese-ui fillPhasePath 重写为 6 张正式
       phase 卡 → 本模块在其后追加，用 <!--F0B-->/<!--F0E--> 包裹，保证幂等）。
      正式 180 卡循环本身一行未动。
   2. 状态机（基于真实进度，绝不伪造 mastery）：
        brandNew     = 无 180 进度 && 无 Faza0 startedAt/completed
        卡状态        = done(切片 G1–G7 全完成) / progress(已开始未完) / notstarted
       Faza0 完成只写 tone 独立 key（chinese-tone-course-*），绝不动
       chinese-progress-default / completedLessons / currentLessonId / streak。
   3. skip：新用户在正式课程入口首次被触发时 guard 自动记录 skipped=true
      （同一 tone key），此后首页不再弹 hero，但 Faza0 卡仍在。
   4. 不声明任何未实现能力：本文件写死 F0_SLICE=['G1','G2','G3','G4','G5','G6','G7']
      （data/tone-course.json 全 7 课已实现）；done 文案如实引导进入正式课程，
      绝不说 "四个声调已掌握"（复习钮另行说明）。
   依赖（均已先行加载）：chinese-learn(裸 getProgress)、chinese-ui、tone-course
   (window.tcLoadProgress/tcSaveProgress/tcProgressKey)、tone-course-ui
   (window.toneCourseStart/toneCourseStartLesson)。语言经 _()-式 f0T() 三语，
   sr 默认。 */

/* 当前已实现的声调切片 —— data/tone-course.json 含 G1–G7 全 7 课。
   切完成（G7 毕业）才算 Faza0 done。 */
var F0_SLICE = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'];

/* ---------- 三语文案（sr 默认；沿用站内 _() 的 (zh,sr,en) 约定） ---------- */
function f0Lang() { try { if (typeof window !== 'undefined' && window.lang) return window.lang; } catch (e) {} return 'sr'; }
function f0T(zh, sr, en) { var l = f0Lang(); return l === 'zh-CN' ? zh : (l === 'en' ? en : sr); }
var F0_L = {
  name:        { 'zh-CN': '语音与声调', sr: 'Glasovi i tonovi', en: 'Sounds & Tones' },
  heroTitle:   { 'zh-CN': '中文第一步：先学声调', sr: 'Prvi korak: glasovi i tonovi', en: 'First step: sounds & tones' },
  heroSub:     { 'zh-CN': '四声是拼音的根基，用约 20 分钟先打好基础', sr: 'Četiri tona su temelj pinyin-a — za ~20 minuta do čvršće osnove', en: 'Four tones are the foundation of pinyin — ~20 minutes well spent' },
  primary:     { 'zh-CN': '开始声调基础', sr: 'Započni osnove tonova', en: 'Start tone basics' },
  secondary:   { 'zh-CN': '直接开始正式课程', sr: 'Idi direktno na zvanični kurs', en: 'Go straight to the main course' },
  badge:       { 'zh-CN': '推荐', sr: 'Preporuka', en: 'Recommended' },
  notStarted:  { 'zh-CN': '未开始', sr: 'Još nije početo', en: 'Not started' },
  inProgress:  { 'zh-CN': '进行中', sr: 'U toku', en: 'In progress' },
  stDone:      { 'zh-CN': '已完成', sr: 'Završeno', en: 'Done' },
  newDesc:     { 'zh-CN': '正式课程前的热身 —— 先认识四声', sr: 'Kratak uvod pre zvaničnog kursa — četiri tona, korak po korak', en: 'A short warm-up before the main course' },
  recomm:      { 'zh-CN': '补齐声调基础 · 约 20 分钟 · 从最基础的四声开始', sr: 'Osnove tonova · ~20 min · počni od osnovnih tonova', en: 'Tone basics · ~20 min · start from the four tones' },
  reassure:    { 'zh-CN': '补充练习 — 不影响正式课程进度', sr: 'Dodatna vežba — ne dira napredak u zvaničnom kursu', en: 'Extra practice — does not touch your main-course progress' },
  startCta:    { 'zh-CN': '开始练习', sr: 'Vežbaj glasove', en: 'Practice sounds' },
  resumeCta:   { 'zh-CN': '继续练习', sr: 'Nastavi vežbu', en: 'Keep practicing' },
  doneTitle:   { 'zh-CN': '你已经完成声调基础训练，现在可以进入正式中文课程。', sr: 'Završila si osnovnu obuku tonova — sada možeš da kreneš na zvanični kurs.', en: 'You’ve finished the tone basics — now you can start the main course.' },
  doneCta:     { 'zh-CN': '进入正式课程', sr: 'Nastavi zvanični kurs', en: 'Back to the main course' },
  doneNote:    { 'zh-CN': '正式课程里会继续用到这些声调 —— 想复习就随时回来。', sr: 'Tonovi će se nastaviti u zvaničnom kursu — vrati se kad god poželiš da ih ponoviš.', en: 'Tones keep showing up in the main course — come back and review anytime.' },
  reviewCta:   { 'zh-CN': '🔁 复习声调', sr: 'Ponovi tonove', en: 'Review the tones' }
};
function f0c(k) { var m = F0_L[k] || F0_L.name; var l = f0Lang(); return m[l] || m.sr || m['zh-CN'] || ''; }

/* ---------- 只读真实进度（绝不写 180） ---------- */
function f0Has180() {
  try {
    if (typeof getProgress !== 'function') return false;
    var p = getProgress();
    if (!p) return false;
    return !!(p.currentLessonId) || !!(p.completedLessons && Object.keys(p.completedLessons).length > 0);
  } catch (e) { return false; }
}
function f0ToneKey() { try { if (typeof window.tcProgressKey === 'function') return window.tcProgressKey(); } catch (e) {} return 'chinese-tone-course-default'; }
function f0Read() {
  try {
    if (typeof window.tcLoadProgress === 'function') { var p = window.tcLoadProgress(); if (p) return p; }
  } catch (e) {}
  try {
    var raw = localStorage.getItem(f0ToneKey());
    if (raw) { var q = JSON.parse(raw); if (q && typeof q === 'object') return q; }
  } catch (e) {}
  return { version: 1, startedAt: null, updatedAt: null, completed: [], skipped: false, graduated: false, lastLesson: null, active: null, tone: {}, self: {} };
}
function f0Write(p) {
  try { if (typeof window.tcSaveProgress === 'function') { window.tcSaveProgress(p); return; } } catch (e) {}
  try { localStorage.setItem(f0ToneKey(), JSON.stringify(p)); } catch (e) {}
}
function f0Started(p) { return !!(p && (p.startedAt || (Array.isArray(p.completed) && p.completed.length > 0))); }
function f0SliceDone(p) {
  if (!p || !Array.isArray(p.completed)) return false;
  for (var i = 0; i < F0_SLICE.length; i++) { if (p.completed.indexOf(F0_SLICE[i]) < 0) return false; }
  return true;
}

/* ---------- 对外状态（供卡/测试/未来模块判断） ---------- */
function faza0Status() {
  var p = f0Read();
  var started = f0Started(p);
  var done = f0SliceDone(p);
  var has180 = f0Has180();
  var brandNew = !has180 && !started;
  var state = done ? 'done' : (started ? 'progress' : 'notstarted');
  return { state: state, started: started, done: done, skipped: !!(p && p.skipped), has180: has180, brandNew: brandNew, completed: ((p && p.completed) || []).slice(), slice: F0_SLICE.slice() };
}

/* ---------- skip（独立 key；brand-new 首次进正式课程时自动记录） ---------- */
function faza0Skip() {
  var p = f0Read();
  if (!p || typeof p !== 'object') p = { completed: [] };
  if (p.skipped === true) return;
  p.skipped = true;
  f0Write(p);
}
function f0SkipIfNew() {
  var s = faza0Status();
  if (s.brandNew && !s.skipped) faza0Skip();
}

/* ---------- 正式课程入口 guard（DOM onclick 全部经 window.*，包这 3 个即可覆盖
            continue-card / phase 卡 / lesson 点击三条路径；不包 switchLrnView：
            chinese-ui 内部以裸函数名调用它，包 window 版本拦截不到内部调用） ---------- */
(function () {
  if (typeof window === 'undefined') return;
  var names = ['continueLearning', 'renderLessonView', 'renderPhaseLessons'];
  for (var i = 0; i < names.length; i++) {
    (function (nm) {
      var orig = window[nm];
      if (typeof orig !== 'function') return;
      window[nm] = function () {
        f0SkipIfNew();
        return orig.apply(this, arguments);
      };
    })(names[i]);
  }
})();

/* ---------- 动作 ---------- */
function faza0OpenTone() {
  // 进入现有 tone-course UI（续点 active 或开下一未完成课 → brand-new 即 G1）
  if (typeof window.toneCourseStart === 'function') return window.toneCourseStart();
  if (typeof window.toneCourseStartLesson === 'function') return window.toneCourseStartLesson(F0_SLICE[0]);
}
function faza0GoFormal() {
  // hero 次要 CTA / 完成态主 CTA → 正式课程（新用户经 continueLearning → 第 1 课）
  if (typeof window.continueLearning === 'function') window.continueLearning();
}
function faza0Review() {
  // 完成态复习 CTA → tone-course-ui 打开最后一课（G7 ma 四声总辨认）
  if (typeof window.toneCourseReview === 'function') window.toneCourseReview();
}

/* ---------- HTML 片段 ---------- */
function f0Esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function f0SolidBtn() { return 'box-sizing:border-box;min-height:44px;border:0;border-radius:12px;background:#a4372c;color:#ffffff;font-size:.8rem;font-weight:700;font-family:inherit;cursor:pointer;padding:10px 14px;'; }
function f0GhostBtn() { return 'box-sizing:border-box;min-height:44px;border:1px solid #d9b8ab;background:transparent;color:#a4372c;border-radius:12px;font-size:.8rem;font-weight:600;font-family:inherit;cursor:pointer;padding:10px 14px;'; }
function f0Chip(label) {
  return '<span style="display:inline-block;font-size:.6rem;font-weight:800;letter-spacing:.02em;color:#a4372c;background:rgba(164,55,44,.10);border-radius:999px;padding:2px 8px;white-space:nowrap">' + f0Esc(label) + '</span>';
}
function f0Bar(pct) {
  return '<div style="height:5px;border-radius:99px;background:rgba(164,55,44,.12);width:100%;overflow:hidden"><div style="height:100%;width:' + pct + '%;background:#a4372c;border-radius:99px"></div></div>';
}
function f0NameRow(extraBefore, name, chip) {
  return '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;width:100%">'
    + (extraBefore || '')
    + '<span style="font-size:.8rem;font-weight:800;color:#6b4a41">' + f0Esc(name) + '</span>'
    + '<span style="margin-left:auto"></span>'
    + (chip || '')
    + '</div>';
}

/* ---------- 状态卡（一直渲染：notstarted/progress/done 三态） ---------- */
function f0Card() {
  var s = faza0Status();
  var name = f0c('name');
  var inner = '', cardClick;
  if (s.state === 'done') {
    // 完成 G1–G7 —— 如实引导进入正式课程（§11 措辞）；绝不说“四声已掌握”。
    // 复习钮仅当 tone-course-ui 已加载（window.toneCourseReview）才渲染，防悬空 onclick。
    inner = f0NameRow('', name, f0Chip(f0c('stDone')))
      + '<div style="font-size:.76rem;font-weight:700;color:#a4372c;line-height:1.35">' + f0Esc(f0c('doneTitle')) + '</div>'
      + '<div style="font-size:.66rem;color:#9a7b70;line-height:1.4">' + f0Esc(f0c('doneNote')) + '</div>'
      + '<button onclick="event.stopPropagation();faza0GoFormal()" style="' + f0SolidBtn() + 'width:100%">' + f0Esc(f0c('doneCta')) + '</button>'
      + (typeof window.toneCourseReview === 'function'
          ? '<button onclick="event.stopPropagation();faza0Review()" style="' + f0GhostBtn() + 'width:100%">' + f0Esc(f0c('reviewCta')) + '</button>'
          : '');
    cardClick = 'faza0GoFormal()';
  } else if (s.state === 'progress') {
    var doneN = s.completed.length;
    var pct = Math.round((doneN / F0_SLICE.length) * 100);
    inner = f0NameRow('', name, f0Chip(f0c('inProgress')))
      + '<div style="display:flex;justify-content:space-between;align-items:center;width:100%">'
      + '<span style="font-size:.68rem;color:#6b4a41">' + doneN + '/' + F0_SLICE.length + '</span>'
      + '<span style="font-size:.68rem;color:#9a7b70">' + pct + '%</span>'
      + '</div>'
      + f0Bar(pct)
      + '<button onclick="event.stopPropagation();faza0OpenTone()" style="' + f0SolidBtn() + 'width:100%">' + f0Esc(f0c('resumeCta')) + '</button>';
    cardClick = 'faza0OpenTone()';
  } else {
    var badge = s.has180 ? '<span style="display:inline-block;font-size:.6rem;font-weight:800;color:#fff;background:#a4372c;border-radius:999px;padding:2px 8px;white-space:nowrap">' + f0Esc(f0c('badge')) + '</span>' : '';
    var desc = s.has180 ? f0c('recomm') : f0c('newDesc');
    inner = f0NameRow(badge, name, f0Chip(f0c('notStarted')))
      + '<div style="font-size:.68rem;color:#8a6a5f;line-height:1.45">' + f0Esc(desc) + '</div>'
      + (s.has180 ? '<div style="font-size:.63rem;color:#9a7b70;line-height:1.4">' + f0Esc(f0c('reassure')) + '</div>' : '')
      + '<button onclick="event.stopPropagation();faza0OpenTone()" style="' + f0SolidBtn() + 'width:100%">' + f0Esc(f0c('startCta')) + '</button>';
    cardClick = 'faza0OpenTone()';
  }
  return '<div class="lrn-f0-card" data-f0-state="' + s.state + '" onclick="' + cardClick + '" style="box-sizing:border-box;border-radius:18px;padding:13px 14px;background:#fffaf6;border:1px solid #f0dcd2;display:flex;flex-direction:column;gap:7px;align-items:flex-start;cursor:pointer;position:relative;overflow:hidden">' + inner + '</div>';
}

/* ---------- hero（仅 brand-new && 未 skip：主 CTA → Faza0，次 CTA → 正式） ---------- */
function f0Hero() {
  var s = faza0Status();
  if (!s.brandNew || s.skipped) return '';
  return '<div class="lrn-f0-hero" style="grid-column:1/-1;box-sizing:border-box;border-radius:18px;padding:15px 15px 13px;background:linear-gradient(135deg,#fff3ec 0%,#ffe9df 100%);border:1px solid #f4d9cc;display:flex;flex-direction:column;gap:9px">'
    + '<div style="font-size:.92rem;font-weight:800;color:#a4372c;line-height:1.3">' + f0Esc(f0c('heroTitle')) + '</div>'
    + '<div style="font-size:.72rem;color:#8a6a5f;line-height:1.5">' + f0Esc(f0c('heroSub')) + '</div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:8px">'
    + '<button onclick="faza0OpenTone()" style="' + f0SolidBtn() + 'flex:1 1 auto;min-width:150px;width:auto">' + f0Esc(f0c('primary')) + '</button>'
    + '<button onclick="faza0GoFormal()" style="' + f0GhostBtn() + 'flex:1 1 auto;min-width:150px;width:auto">' + f0Esc(f0c('secondary')) + '</button>'
    + '</div></div>';
}

/* ---------- 主入口：renderChineseHome 在 fillPhasePath 之后调用 ---------- */
function renderFaza0Card() {
  var grid = typeof document !== 'undefined' ? document.getElementById('lrnPhaseGrid') : null;
  if (!grid) return;
  // #lrnPhaseGrid 每次被 fillPhasePath 重写，故正常只出现一次；此守卫防重复注入
  if (grid.innerHTML.indexOf('<!--F0B-->') >= 0) return;
  grid.innerHTML = '<!--F0B-->' + f0Hero() + f0Card() + '<!--F0E-->' + grid.innerHTML;
}

/* ---------- window 导出（DOM onclick / 语言切换 / 测试） ---------- */
window.renderFaza0Card = renderFaza0Card;
window.faza0Status = faza0Status;
window.faza0Skip = faza0Skip;
window.faza0GoFormal = faza0GoFormal;
window.faza0OpenTone = faza0OpenTone;
window.faza0Review = faza0Review;
window.faza0Slice = F0_SLICE;
