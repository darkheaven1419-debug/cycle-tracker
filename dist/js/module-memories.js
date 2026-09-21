/* Phase 1C — Memories / Our Story (the 回忆 tab).

   Why a new file: js/module-dashboard.js is at 805 lines, past the 800-line
   ceiling this repo holds itself to, so the couple-space surfaces split by
   surface rather than by adding a 806th line.

   Where it renders. 回忆 maps to #panel-diary — there is no #panel-memories and
   there never was. The approved Phase 1C layout puts the story above the daily
   writing loop, so this module injects one host element as #panel-diary's first
   child and closes its own block with a "Moj dnevnik / 我的日记" heading.
   Everything the diary already owned — date strip, write card, partner letter —
   is untouched below that heading; the panel's markup is not edited at all.

   Phase 2B.8 added one row at the top of that host: a "写一篇日记" button that
   scrolls down to the existing write card. It exists because the story grows —
   #memRoot is the panel's first child, so the editor sinks as the couple writes
   (measured at 320x800: +415px with 0 entries, +6822px with 100). Diary is where
   you actively keep something from today; Memories is where you look back at what
   is already there. This row restores the signpost to the first one and does not
   make it an annex of the second. Nothing was deleted, duplicated or moved, the
   button writes no state, and it scrolls only after a real tap.

   §三 forbids a second data model, so every memory here is DERIVED at render
   time from keys that already exist, and this module writes nothing: no new
   storage key, no flag, no copy of any entry. That is also why there is no
   "Save to Memories" button (§七): Gratitude, Daily Question and Know Me already
   reach the timeline on their own, so a button could only store a second
   reference to content that is already there — the exact dual-source state §七
   rules out. Nothing to flag, nothing to duplicate.

   Timestamps are only used where they are real. Diary dates off its YYYY-MM-DD
   key, never off its `time` field (absent in 13 of 81 live slots, and
   mergeDiary never compares time anyway). Song is {title, note} with no time at
   all, so it is shown undated instead of being given a date it never had.
   Cycle check-ins and symptoms are excluded by §二 and are not read here.
*/
(function () {
  'use strict';

  var PANEL_ID = 'panel-diary';
  var TIMELINE_CAP = 80;          // DOM ceiling for a multi-year history
  var FEATURED_MIN_AGE = 7;       // days — "a while ago", never this week
  var FEATURED_MAX_AGE = 400;     // days — beyond this it is an archive, not a nudge
  var CLIP_FEATURED = 220;
  var CLIP_ROW = 160;
  /* How many days back a timeline row says "N 天前" instead of its day number.
     A week is where "how long ago" stops locating the memory better than
     "which day" does — past it the month header is the more useful anchor, and
     the row keeps the two-digit day it always had. Only the three tiers the
     module already carried for the Featured card are used, so this added no
     new wording in any locale. */
  var REL_DAYS = 7;

  var MEM_I18N = {
    sr: {
      title: 'Naše uspomene',
      featured: 'Mali podsetnik na nas',
      myDiary: 'Moj dnevnik',
      /* Phase 2B.8 — 去写日记那条入口。措辞刻意朴素：不文学化，也不让系统
         替情侣说话（「今天想留下什么？」那种句子是在替他们提问）。它只说明
         这里能做什么。三个语种都放在 MEM_I18N 里，没有第二套 i18n 机制。 */
      writeCta: 'Napiši dnevnik',
      emptyTitle: 'Ovde još nema mnogo priča.',
      emptyText: 'Polako ćemo je ispunjavati. ❤️',
      kDiary: 'Dnevnik', kGrat: 'Zahvalnost', kDQ: 'Pitanje dana',
      kKM: 'Ono što znam o tebi', kMile: 'Prekretnica',
      song: 'Naša pesma',
      fromStory: 'Iz naše priče',
      /* Phase 2B.6 — 故事开头那一条。§2.6 fixes met → upoznavanje and
         love → zaljubljenost, so those two words are the only ones used. */
      anchorGap: 'Od upoznavanja do zaljubljenosti prošlo je {n} dana',
      today: 'danas', yesterday: 'juče',
      daysAgo: 'pre {n} dana', weeksAgo: 'pre {n} nedelje',
      monthsAgo: 'pre {n} meseca', yearsAgo: 'pre {n} godine',
      more: 'i još {n}'
    },
    'zh-CN': {
      title: '我们的回忆',
      featured: '来自我们的故事',
      myDiary: '我的日记',
      writeCta: '写一篇日记',
      emptyTitle: '这里还没有很多故事。',
      emptyText: '我们会慢慢把它填满。 ❤️',
      kDiary: '日记', kGrat: '感恩', kDQ: '今日一问',
      kKM: '我了解的你', kMile: '里程碑',
      song: '我们的歌',
      fromStory: '来自我们的故事',
      anchorGap: '从相识到相恋，我们走了 {n} 天',
      today: '今天', yesterday: '昨天',
      daysAgo: '{n} 天前', weeksAgo: '{n} 周前',
      monthsAgo: '{n} 个月前', yearsAgo: '{n} 年前',
      more: '还有 {n} 条'
    },
    en: {
      title: 'Our Memories',
      featured: 'A little memory from us',
      myDiary: 'My diary',
      writeCta: 'Write a diary entry',
      emptyTitle: "There aren't many stories here yet.",
      emptyText: "We'll fill it up slowly. ❤️",
      kDiary: 'Diary', kGrat: 'Gratitude', kDQ: 'Daily Question',
      kKM: 'What I know about you', kMile: 'Milestone',
      song: 'Our Song',
      fromStory: 'From Our Story',
      anchorGap: 'From meeting to falling in love — {n} days',
      today: 'today', yesterday: 'yesterday',
      daysAgo: '{n} days ago', weeksAgo: '{n} weeks ago',
      monthsAgo: '{n} months ago', yearsAgo: '{n} years ago',
      more: 'and {n} more'
    }
  };

  /* Same three-step resolution as dl()/v2() in module-dashboard.js: exact
     locale, then base language, then Serbian — and the key name as the last
     resort so a missing string is visible instead of silent. */
  function mem(key) {
    var L = (typeof lang !== 'undefined' && lang) ? lang : 'sr';
    var p = MEM_I18N[L] || MEM_I18N[L.split('-')[0]] || MEM_I18N.sr;
    return p[key] || MEM_I18N.sr[key] || key;
  }

  var KIND = {
    diary: { e: '\u{1F4D6}', k: 'kDiary' },
    grat: { e: '\u{1F48C}', k: 'kGrat' },
    dq: { e: '\u{1F4AD}', k: 'kDQ' },
    km: { e: '\u{1F49B}', k: 'kKM' },
    milestone: { e: '\u{2728}', k: 'kMile' }
  };

  // ── small helpers ────────────────────────────────────────────────────────

  function _j(key, fb) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fb; }
    catch (e) { return fb; }
  }
  function _esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function _clip(s, n) {
    var t = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
    return t.length > n ? t.slice(0, n - 1) + '\u{2026}' : t;
  }
  function _me() {
    return (typeof activeProfile !== 'undefined' && activeProfile) ? activeProfile : 'andjela';
  }
  function _name(p) { return p === 'barry' ? 'Barry' : 'An\u{0111}ela'; }
  function _pad(n) { return (n < 10 ? '0' : '') + n; }
  function _dayKey(d) { return d.getFullYear() + '-' + _pad(d.getMonth() + 1) + '-' + _pad(d.getDate()); }
  function _mmdd(d) { return d.getFullYear() + '.' + _pad(d.getMonth() + 1); }
  /* The story's two dates are the only place a full YYYY.MM.DD appears; the
     timeline's month headers stay at YYYY.MM. */
  function _ymd(d) { return _mmdd(d) + '.' + _pad(d.getDate()); }

  /* Local-midnight parse. new Date('2026-03-19') is UTC midnight, which lands on
     the previous local day west of Greenwich and shifts every day count by one —
     the same class of bug tests/test-day-counter-labels.js exists to pin. */
  function _parseDay(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s == null ? '' : s));
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    d.setHours(0, 0, 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }
  function _atMidnight(t) { var d = new Date(t); d.setHours(0, 0, 0, 0); return d; }
  function _midnight() { return _atMidnight(Date.now()); }
  function _daysSince(d) { return Math.round((_midnight().getTime() - d.getTime()) / 864e5); }

  /* The central table owns this vocabulary. §十 is explicit that the milestone
     wording must stay 相识 X 天 / 相恋 X 天 — the strings that were previously
     ambiguous — so they are read from t() and never re-authored here. */
  function _t(key, fb) {
    try {
      if (typeof t === 'function') {
        var v = t(key);
        if (typeof v === 'string' && v && v !== key) return v;
      }
    } catch (e) {}
    return fb;
  }

  /* The timeline's own "how long ago". Calendar days, not elapsed hours: a
     memory written at 23:00 yesterday is 昨天, not 今天. _ago's elapsed-hours
     form is right for the Featured card — nothing there replaces a calendar
     date — but a row's label stands where a date used to be, so it has to agree
     with the month and day it sits under. A future-dated row (clock skew, or an
     entry typed with the wrong date) returns null and keeps its day number
     rather than printing a negative span. */
  function _relDay(ts, now) {
    var d = Math.round((_atMidnight(now).getTime() - _atMidnight(ts).getTime()) / 864e5);
    if (d === 0) return mem('today');
    if (d === 1) return mem('yesterday');
    if (d > 1 && d < REL_DAYS) return mem('daysAgo').replace('{n}', String(d));
    return null;
  }

  function _ago(ts) {
    var d = Math.floor((Date.now() - ts) / 864e5);
    if (d <= 0) return mem('today');
    if (d === 1) return mem('yesterday');
    if (d < 14) return mem('daysAgo').replace('{n}', String(d));
    if (d < 60) return mem('weeksAgo').replace('{n}', String(Math.round(d / 7)));
    if (d < 730) return mem('monthsAgo').replace('{n}', String(Math.round(d / 30)));
    return mem('yearsAgo').replace('{n}', String(Math.floor(d / 365)));
  }

  // ── the memory sources ───────────────────────────────────────────────────

  /* Three field generations coexist in live diary data: `text` (current), the
     `happy`+`uncomf` pair, and `thanks`+`wish`. `uncomf` is deliberately not
     shown — it is how she felt physically, which §二 keeps out of the story. */
  function _diaryText(rec) {
    var parts = [];
    if (rec.text) parts.push(String(rec.text));
    ['happy', 'thanks', 'wish'].forEach(function (f) { if (rec[f]) parts.push(String(rec[f])); });
    if (!parts.length && rec.mood) parts.push(String(rec.mood));
    return parts.join(' \u{00B7} ').trim();
  }

  function _diaryItems() {
    var out = [], sd = _j('shared-diary', {});
    if (!sd || typeof sd !== 'object') return out;
    Object.keys(sd).forEach(function (k) {
      var day = _parseDay(k);
      if (!day) return;
      var slot = sd[k] || {};
      ['barry', 'andjela'].forEach(function (who) {
        var rec = slot[who];
        if (!rec || typeof rec !== 'object') return;
        var text = _diaryText(rec);
        if (!text) return;
        out.push({ id: 'diary:' + k + ':' + who, kind: 'diary', ts: day.getTime(), from: who, text: text });
      });
    });
    return out;
  }

  /* Index is part of the id because these arrays are append-only and sorted
     ascending by time before they are capped, so a given entry keeps its slot
     on both devices. */
  function _gratItems() {
    var out = [];
    var list = _j('shared-gratitude', []);
    if (!Array.isArray(list)) return out;
    list.forEach(function (g, i) {
      if (!g || !g.text || typeof g.time !== 'number') return;
      out.push({ id: 'grat:' + g.time + ':' + (g.from || '?') + ':' + i, kind: 'grat', ts: g.time, from: g.from, text: String(g.text) });
    });
    return out;
  }

  function _dqItems() {
    var out = [];
    var list = _j('shared-daily-q', []);
    if (!Array.isArray(list)) return out;
    list.forEach(function (e, i) {
      if (!e || !e.answer || typeof e.time !== 'number') return;
      out.push({ id: 'dq:' + e.time + ':' + (e.from || '?') + ':' + i, kind: 'dq', ts: e.time, from: e.from, text: String(e.answer) });
    });
    return out;
  }

  function _kmItems() {
    var out = [], km = _j('shared-knowme', {});
    if (!km || typeof km !== 'object') return out;
    Object.keys(km).forEach(function (k) {
      var slot = km[k] || {};
      var day = _parseDay(k);
      ['barry', 'andjela'].forEach(function (who) {
        var rec = slot[who];
        if (!rec || !rec.answer) return;
        var ts = typeof rec.time === 'number' ? rec.time : (day ? day.getTime() : null);
        if (ts === null) return;
        out.push({ id: 'km:' + k + ':' + who, kind: 'km', ts: ts, from: who, text: String(rec.answer) });
      });
    });
    return out;
  }

  /* §十: the original dates are read, never written. localStorage is the source
     of truth because these are device-local keys that never enter the shared
     state; the weather.js globals are only a fallback for the default case. */
  function _annDate(key, fallback) {
    var raw = null;
    try { raw = localStorage.getItem(key); } catch (e) {}
    if (!raw) {
      try {
        if (key === 'cycle-ann-met' && typeof annDateMet !== 'undefined') raw = annDateMet;
        else if (key === 'cycle-ann-love' && typeof annDateLove !== 'undefined') raw = annDateLove;
      } catch (e2) {}
    }
    return _parseDay(raw) || _parseDay(fallback);
  }

  function _milestones(now) {
    var out = [];
    var met = _annDate('cycle-ann-met', '2026-03-19');
    var love = _annDate('cycle-ann-love', '2026-05-07');
    if (met && met.getTime() <= now) {
      out.push({ id: 'mile:met', kind: 'milestone', ts: met.getTime(), from: null,
        text: _t('loveCounterMet', '\u{76F8}\u{8BC6} {n} \u{5929}').replace('{n}', String(_daysSince(met))) });
    }
    if (love && love.getTime() <= now) {
      out.push({ id: 'mile:love', kind: 'milestone', ts: love.getTime(), from: null,
        text: _t('loveCounterTogether', '\u{76F8}\u{604B} {n} \u{5929}').replace('{n}', String(_daysSince(love))) });
    }
    return out;
  }

  /** Everything that goes on the timeline, newest first. Nothing is stored. */
  function _items(now) {
    var all = _diaryItems().concat(_gratItems(), _dqItems(), _kmItems(), _milestones(now));
    all.sort(function (a, b) { return b.ts - a.ts || (a.id < b.id ? 1 : -1); });
    return all;
  }

  // ── featured memory (§五) ────────────────────────────────────────────────

  function _hash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }

  /* Deterministic by construction: the pick is a function of the calendar date
     and the item ids alone, so both people independently land on the same
     memory without any synced random state (§五), and nothing has to be stored.
     The pool is sorted first, so it does not matter that the two devices may
     hold their entries in different orders.

     "No two days running" is derived the same way rather than remembered:
     yesterday's pick is recomputed with the identical function, and on a
     collision today steps one forward. Still date-only, still stateless. */
  function _featured(items, now) {
    var pool = items.filter(function (it) {
      var age = (now - it.ts) / 864e5;
      return it.kind !== 'milestone' && age >= FEATURED_MIN_AGE && age <= FEATURED_MAX_AGE;
    }).sort(function (a, b) { return a.ts - b.ts || (a.id < b.id ? -1 : 1); });
    if (!pool.length) return null;

    var today = _dayKey(_midnight());
    var yest = _dayKey(new Date(_midnight().getTime() - 864e5));
    var i = _hash(today) % pool.length;
    if (pool.length > 1 && _hash(yest) % pool.length === i) i = (i + 1) % pool.length;
    return pool[i];
  }

  // ── rendering ────────────────────────────────────────────────────────────

  /* Same markup and same classes as the Home/Together header, so the identity
     block keeps one shape across the three surfaces without duplicating CSS. */
  function _headHtml() {
    return '<div class="dch-row">' +
      '<span class="dch-avatar" aria-hidden="true">\u{1F466}</span>' +
      '<span class="dch-names">Barry<span class="dch-x">\u{00D7}</span>An\u{0111}ela</span>' +
      '<span class="dch-avatar" aria-hidden="true">\u{1F338}</span>' +
      '</div>' +
      '<div class="mem-sub">' + _esc(mem('title')) + '</div>';
  }

  /* Phase 2B.6 — 故事的开头。
     The timeline reads newest-first, so the two milestones that ARE the
     beginning sit at its very bottom: the page opened on one random old moment
     and only reached 「相识 X 天」 after a full scroll. This strip states where
     the story starts, at the top, so everything below it reads as "since then".

     It is the only place on this page that carries the two actual dates — the
     milestone rows carry day counts, not days. The labels come from the central
     table's annMetLabel / annLoveLabel, the same strings index.html and the
     Settings panel already render, so §2.6's approved vocabulary (相识 / 相恋)
     is reused rather than re-authored; the escapes are only the last-resort
     fallback _t()'s contract asks for.

     Shown only once 相识 is really in the past — the same condition
     _milestones() uses. Before that there is nothing to be continuous from and
     a negative span would be a lie, so this strip and the milestone rows can
     never disagree about whether the story has begun. */
  function _anchorHtml(now) {
    var met = _annDate('cycle-ann-met', '2026-03-19');
    if (!met || met.getTime() > now) return '';
    var love = _annDate('cycle-ann-love', '2026-05-07');
    if (love && love.getTime() > now) love = null;

    function cell(label, d) {
      return '<span class="mem-anchor-date">' +
        '<span class="mem-anchor-label">' + _esc(label) + '</span>' +
        '<span class="mem-anchor-day">' + _esc(_ymd(d)) + '</span></span>';
    }

    var dates = cell(_t('annMetLabel', '\u{2728} \u{521D}\u{6B21}\u{76F8}\u{8BC6}'), met);
    var line = '';
    if (love) {
      dates += '<span class="mem-anchor-sep" aria-hidden="true">\u{00B7}</span>' +
        cell(_t('annLoveLabel', '\u{2665} \u{76F8}\u{604B}\u{7684}\u{65E5}\u{5B50}'), love);
      var gap = Math.round((love.getTime() - met.getTime()) / 864e5);
      if (gap > 0) {
        line = '<p class="mem-anchor-line">' +
          _esc(mem('anchorGap').replace('{n}', String(gap))) + '</p>';
      }
    }
    return '<div class="mem-anchor" id="memAnchor">' +
      '<div class="mem-anchor-dates">' + dates + '</div>' + line + '</div>';
  }

  /* Phase 2B.8 — 去写日记的入口。
     Diary 本身什么都没少：日期条、写卡、对方的信都在下面原位，功能也完好
     （已端到端实测：输入 → 保存 → shared-diary 落盘 → Worker PUT）。缺的不是
     功能，是距离。#memRoot 是 #panel-diary 的第一个子元素，故事越长它越高，
     写卡就离页顶越远 —— 实测 320×800：0 条时写卡在 +415px（第一屏内），100 条
     时 +6822px（8.5 屏）。两人越是认真写，那个入口就越是自己沉下去。

     它是 <button> 而不是 <a>：没有新路由、没有新状态、没有新数据，只是把一个
     已经存在的编辑器重新指出来。位置在「故事的开头」之后、精选卡之前 —— 先说
     故事从哪里开始，再说你也可以往下写。没有故事时 _anchorHtml 返回空串，它
     自然上移，不留空档。 */
  function _writeCtaHtml() {
    return '<button type="button" class="mem-write-cta" id="memWriteCta">' +
      '<span class="mem-write-cta-ico" aria-hidden="true">\u{270D}\u{FE0F}</span>' +
      '<span class="mem-write-cta-text">' + _esc(mem('writeCta')) + '</span>' +
      '<span class="mem-write-cta-more" aria-hidden="true">\u{203A}</span>' +
      '</button>';
  }

  /* 只有用户真的点了才滚动。不 focus、不改 tabindex、不写任何 storage：
     本模块对 #panel-diary 的承诺是「不编辑面板自身的标记」（见文件头），
     给 #diaryWriteCard 加属性就会破坏它，所以这里只做滚动这一件事。

     app.js 里「切换 Tab 不动滚动位置」是既定产品决策，那条规则约束的是自动
     行为；用户点这一下不属于它，也没有绕过它 —— 本模块没有新增任何 scroll
     状态，没有记录、没有恢复、没有定时器。

     block:'center' 而不是 'start'：写卡上方还有日期条，居中之后日期条也一起
     落在视野里，用户可以顺手换日期再写。prefers-reduced-motion 下走 'auto'，
     与 css/v2.css 那个 reduced-motion 块同一个判据。 */
  function _goToDiary() {
    var t = document.getElementById('diaryWriteCard') || document.getElementById(PANEL_ID);
    if (!t || typeof t.scrollIntoView !== 'function') return;
    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    try {
      t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    } catch (e2) {
      /* 不认 options 对象的实现：退回无参形式，等价于 behavior:'auto'。 */
      t.scrollIntoView();
    }
  }

  function _featuredHtml(it) {
    if (!it) return '';
    var meta = KIND[it.kind] || KIND.diary;
    var who = it.from ? ' \u{00B7} ' + _esc(_name(it.from)) : '';
    return '<section class="card mem-feat" id="memFeatured">' +
      '<div class="mem-feat-kicker">\u{2726} ' + _esc(mem('featured')) + '</div>' +
      '<div class="mem-feat-kind">' + meta.e + ' ' + _esc(mem(meta.k)) + who + '</div>' +
      '<p class="mem-feat-text">' + _esc(_clip(it.text, CLIP_FEATURED)) + '</p>' +
      '<div class="mem-feat-ago">' + _esc(_ago(it.ts)) + '</div>' +
      '</section>';
  }

  /* The day cell is the relative label while one applies, and the two-digit day
     otherwise — so a row older than the window is exactly what it was before. */
  function _rowHtml(it, now) {
    var meta = KIND[it.kind] || KIND.diary;
    var day = new Date(it.ts);
    var when = _relDay(it.ts, now);
    var who = it.from ? '<span class="mem-row-who">' + _esc(_name(it.from)) + '</span>' : '';
    return '<article class="mem-row">' +
      '<span class="mem-row-ico" aria-hidden="true">' + meta.e + '</span>' +
      '<div class="mem-row-body">' +
        '<div class="mem-row-meta"><span class="mem-row-kind">' + _esc(mem(meta.k)) + '</span>' +
          who + '<span class="mem-row-day">' + _esc(when || _pad(day.getDate())) + '</span></div>' +
        '<p class="mem-row-text">' + _esc(_clip(it.text, CLIP_ROW)) + '</p>' +
      '</div></article>';
  }

  /* Months are the only grouping, in the shape of the phase's own example:
     2026.09 ──── then its rows. The rule is a decorative span rather than a
     border, so it can stay a hairline at every width without a media query. */
  function _timelineHtml(items, now) {
    if (!items.length) return '';
    var groups = [], cur = null;
    items.forEach(function (it) {
      var m = _mmdd(new Date(it.ts));
      if (!cur || cur.m !== m) { cur = { m: m, list: [] }; groups.push(cur); }
      cur.list.push(it);
    });

    var html = '<div class="mem-timeline" id="memTimeline">', budget = TIMELINE_CAP, shown = 0;
    for (var g = 0; g < groups.length && budget > 0; g++) {
      var take = Math.min(groups[g].list.length, budget), rows = '';
      for (var k = 0; k < take; k++) rows += _rowHtml(groups[g].list[k], now);
      html += '<div class="mem-month">' +
        '<div class="mem-month-head"><span class="mem-month-label">' + _esc(groups[g].m) + '</span>' +
        '<span class="mem-month-rule" aria-hidden="true"></span></div>' + rows + '</div>';
      budget -= take; shown += take;
    }
    html += '</div>';
    if (items.length > shown) {
      html += '<div class="mem-more">' + _esc(mem('more').replace('{n}', String(items.length - shown))) + '</div>';
    }
    return html;
  }

  /* Song carries no date at all, so it is not placed on a dated timeline — it
     gets its own undated card, one line per person, which is also the honest
     shape of the data. §九 asks for the title, not a player. */
  function _songHtml() {
    var rows = ['barry', 'andjela'].map(function (who) {
      var s = _j('shared-song-' + who, null);
      if (!s || !s.title) return '';
      return '<div class="mem-song-row"><span class="mem-song-who">' + _esc(_name(who)) + '</span>' +
        '<span class="mem-song-title">' + _esc(_clip(s.title, 80)) + '</span></div>';
    }).join('');
    if (!rows) return '';
    return '<section class="card mem-song" id="memSong">' +
      '<div class="mem-song-kicker">\u{1F3B5} ' + _esc(mem('song')) + '</div>' + rows + '</section>';
  }

  /* §十一: the first run must not report a database as empty. */
  function _emptyHtml() {
    return '<section class="card mem-empty" id="memEmpty">' +
      '<div class="mem-empty-ico" aria-hidden="true">\u{2728}</div>' +
      '<p class="mem-empty-title">' + _esc(mem('emptyTitle')) + '</p>' +
      '<p class="mem-empty-text">' + _esc(mem('emptyText')) + '</p>' +
      '</section>';
  }

  function _render() {
    var panel = document.getElementById(PANEL_ID);
    if (!panel) return false;
    var host = document.getElementById('memRoot');
    if (!host) {
      host = document.createElement('div');
      host.id = 'memRoot';
      host.className = 'mem-root';
      /* First child of the panel, so the story leads and the daily writing loop
         follows it — the layout approved for Phase 1C. The heading that closes
         this block is what separates the two (§八). */
      panel.insertBefore(host, panel.firstChild);
    }
    var now = Date.now();
    var all = _items(now);
    /* The pick is rendered once, at the top of the page. Filtering it out of
       the timeline by id is what makes that true, and it is a no-op whenever
       the pick is older than the 80-row budget — a capped timeline never
       contained it. The pool is never filtered: _featured still chooses from
       the full list, so which memory gets picked cannot depend on this.
       The gate below stays on `all`, not on `rest`: a story whose only memory
       is the pick is still a story, and must not show the empty card under a
       rendered memory. */
    var feat = _featured(all, now);
    var rest = feat ? all.filter(function (it) { return it.id !== feat.id; }) : all;
    host.innerHTML = _headHtml() +
      _anchorHtml(now) +
      _writeCtaHtml() +
      _featuredHtml(feat) +
      (all.length ? _timelineHtml(rest, now) + _songHtml() : _emptyHtml()) +
      '<h2 class="mem-diary-head">\u{270D}\u{FE0F} ' + _esc(mem('myDiary')) + '</h2>';
    /* 监听器在每次渲染后现绑，而不是内联 onclick：innerHTML 每次都换掉这棵
       子树，旧节点连着旧监听器一起被丢弃，所以它不可能叠加，也不需要任何
       「已绑过」的标记。写卡的 id 属于 index.html，本模块从不创建它。 */
    var cta = document.getElementById('memWriteCta');
    if (cta) cta.addEventListener('click', _goToDiary);
    return true;
  }

  /* Phase 2B.6 — 回流。 The featured pick is deliberately never from this week
     (FEATURED_MIN_AGE, §五), which meant the Home line stayed hidden for a
     brand-new story and — the real defect — kept showing a months-old memory
     while something written yesterday sat one tap away. So when nothing is old
     enough to be featured yet, the line falls back to the newest memory instead
     of disappearing: it then always points at the most recent thing they wrote.
     Milestones are excluded from the fallback on purpose — the header already
     carries those day counts, and this line exists to resurface a memory. */
  function _homeItem(items, now) {
    var f = _featured(items, now);
    if (f) return f;
    var rest = items.filter(function (it) { return it.kind !== 'milestone'; });
    return rest.length ? rest[0] : null;
  }

  /* §六: a single line on Home, not a second Memories page. It reuses the same
     deterministic pick, and it is a button so the whole target is hittable and
     keyboard-reachable. No badge, no unread count, no notification. */
  function _renderHome() {
    var card = document.getElementById('dash-links-card');
    if (!card) return false;
    var el = document.getElementById('dash-story-line');
    if (!el) {
      el = document.createElement('button');
      el.id = 'dash-story-line';
      el.type = 'button';
      el.className = 'dash-story-line';
      el.addEventListener('click', function () {
        if (typeof window.switchToTab === 'function') window.switchToTab('diary');
      });
      card.appendChild(el);
    }
    var now = Date.now();
    var it = _homeItem(_items(now), now);
    if (!it) { el.hidden = true; return true; }
    var meta = KIND[it.kind] || KIND.diary;
    el.hidden = false;
    /* Phase 2B.6 — 去处。 The line was already a button but read as a plain row
       of text, so nothing said it leads anywhere. This is the same › the
       dashboard's "Njen ciklus" header uses, which is already this app's word
       for "there is more behind this". Decorative — the button's own text is
       its accessible name. Still ONE row, so the clearance M43 measures at 320
       is untouched. */
    el.innerHTML = '<span class="dsl-kicker">\u{2726} ' + _esc(mem('fromStory')) + '</span>' +
      '<span class="dsl-text">' + meta.e + ' ' + _esc(_clip(it.text, 64)) + '</span>' +
      '<span class="dsl-ago">' + _esc(_ago(it.ts)) + '</span>' +
      '<span class="dsl-more" aria-hidden="true">\u{203A}</span>';
  }

  // ── wiring ───────────────────────────────────────────────────────────────

  /* Wrapping rather than editing app.js: the diary tab already has a wrapped
     entry point (js/fix-diary.js wraps initSharedDiaryTab the same way), so this
     adds no new call site. The delayed second pass lands after the pull that
     fix-diary.js starts on activation, so the timeline reflects freshly pulled
     entries without this module issuing a second Worker request of its own. */
  var _prevDiary = window.initSharedDiaryTab;
  window.initSharedDiaryTab = function () {
    if (typeof _prevDiary === 'function') _prevDiary.apply(this, arguments);
    _render();
    setTimeout(_render, 1200);
  };

  var _prevApply = window.applyAllUI;
  window.applyAllUI = function () {
    var r = typeof _prevApply === 'function' ? _prevApply.apply(this, arguments) : undefined;
    _render();
    _renderHome();
    return r;
  };

  /* renderDashboard rebuilds #dash-links-card's contents, which takes the story
     line with it, so the line is re-appended after every dashboard render.
     _renderHome looks the node up before creating it, so this stays idempotent
     and cannot stack duplicates. */
  var _prevDash = window.renderDashboard;
  if (typeof _prevDash === 'function') {
    window.renderDashboard = function () {
      var r = _prevDash.apply(this, arguments);
      _renderHome();
      return r;
    };
  }
  var _prevInit = window.initDashboard;
  if (typeof _prevInit === 'function') {
    window.initDashboard = function () {
      var r = _prevInit.apply(this, arguments);
      _renderHome();
      return r;
    };
  }

  function _boot() {
    var overlay = document.getElementById('loginOverlay');
    if (overlay && !overlay.classList.contains('hidden')) return;
    _render();
    _renderHome();
  }
  /* Every script in index.html is deferred, so the fix-*.js decorators that run
     after this file are installed by the time DOMContentLoaded fires. */
  if (document.readyState === 'complete') setTimeout(_boot, 0);
  else document.addEventListener('DOMContentLoaded', _boot, { once: true });

  window.renderMemories = _render;
  window.__memories = { items: _items, featured: _featured, ago: _ago, parseDay: _parseDay, hash: _hash };
})();
