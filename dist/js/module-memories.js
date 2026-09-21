/* Phase 1C — Memories / Our Story (the 回忆 tab).

   Why a new file: js/module-dashboard.js is at 805 lines, past the 800-line
   ceiling this repo holds itself to, so the couple-space surfaces split by
   surface rather than by adding a 806th line.

   Where it renders. 回忆 maps to #panel-diary — there is no #panel-memories and
   there never was. The approved Phase 1C layout puts the story above the daily
   writing loop, so this module injects its host elements at the top of
   #panel-diary and closes its own block with a "Moj dnevnik / 我的日记" heading.
   Everything the diary already owned — date strip, write card, partner letter —
   is untouched below that heading; the panel's markup is not edited at all.
   Phase 2C inserted one more element there (#memModeBar, immediately before
   #memRoot), so #memRoot is no longer the panel's first child.

   Phase 2B.8 added one row at the top of that host: a "写一篇日记" button that
   scrolls down to the existing write card. It exists because the story grows —
   #memRoot is the panel's first child, so the editor sinks as the couple writes
   (measured at 320x800: +415px with 0 entries, +6822px with 100). Diary is where
   you actively keep something from today; Memories is where you look back at what
   is already there. This row restores the signpost to the first one and does not
   make it an annex of the second.

   Phase 2B.9 keeps the row and changes what it does: instead of travelling down
   to the editor, the row BRINGS the editor up to itself. The three nodes the
   panel owns for writing — .diary-date-strip-wrap, #diaryFullCal and
   #diaryWriteCard — are moved (never copied) into a host inside #memRoot, then
   moved back before the next rebuild. One editor, one DOM, one data model; the
   two sentences Phase 2B.8 pinned still hold, and the third one now reads
   "nothing was duplicated, nothing was moved permanently, and nothing scrolls
   at all". Diary keeps its own copy of nothing.

   Phase 2C gives the panel two modes instead of one long page — 我们的故事 and
   📖 日记 — switched by a bar above #memRoot. The story keeps its header, the
   featured pick, the timeline and the song; diary entries reach that timeline
   only as at most DIARY_REF_CAP clickable references (§七), never as the diary
   itself, so a couple's diary can no longer stretch the page without limit.
   📖 日记 shows the date strip, the write card and the partner's letter exactly
   where they already were: the two modes are one panel carrying a class, so
   nothing is moved and no second editor exists. 2B.9's borrow machinery is
   deleted — it served a premise ("expand in place, never change page") that no
   longer holds, and its one real hazard, the write card being destroyed by
   #memRoot's innerHTML, goes away with it. Not moving anything is also what
   keeps js/fix-diary.js's .lpc-row guard true; see the mode block below.

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
  /* Phase 2C. 日记引用在时间轴上是一条路标，不是日记本身。六条足够说明「你俩一直
     在写」，又不至于让故事变回一份更难用的日期列表 —— 那正是它上一轮变成的样子。
     这个上限只管「我们的故事」里的引用条数：📖 日记 通过日期条和月历到达任何一个
     存在过的日期，所以这里少显示几条，不会让任何一篇变得够不着。见 _capDiaryRefs。 */
  var DIARY_REF_CAP = 6;
  var CLIP_REF = 90;
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
      /* Phase 2C — 二级切换的两个名字。右半边直接复用 kDiary：模式名和条目标签
         在所有三个语种里本来就是同一个词，所以不再写第二份，也就不会哪天分叉。 */
      modeStory: 'Naša priča',
      /* 一条日记引用被读屏念出来的句子 —— 这一行本身是 <button>。 */
      openRef: 'Otvori dnevnik za {d}',
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
      modeStory: '我们的故事',
      openRef: '打开 {d} 的日记',
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
      modeStory: 'Our Story',
      openRef: 'Open the diary for {d}',
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
     自然上移，不留空档。

     Phase 2C — 这一行不再是「就地展开」，而是「换到那一半去」。点击它把面板切到
     📖 日记，并定位到今天：编辑器本来就在那里，既不用滚动，也不用借还。入口仍然
     只有一条，编辑器仍然只有一份。

     2B.9 那套把三个节点借进 #memWriteHost、渲染前再还回去的机制整体删除。它服务
     的前提（不换页就地展开）已经不存在了，而它唯一真正危险的地方 —— 写卡还在
     #memRoot 里时撞上 innerHTML 被销毁，此后 getElementById('diaryWriteCard')
     恒为 null 且不报错 —— 也随之一起消失。（Phase 2C 之后日记节点一次也不搬：
     两个模式靠 CSS 显隐切换，见文件头。） */
  function _writeCtaHtml() {
    return '<button type="button" class="mem-write-cta" id="memWriteCta">' +
      '<span class="mem-write-cta-ico" aria-hidden="true">\u{270D}\u{FE0F}</span>' +
      '<span class="mem-write-cta-text">' + _esc(mem('writeCta')) + '</span>' +
      '<span class="mem-write-cta-more" aria-hidden="true">\u{203A}</span>' +
      '</button>';
  }

  /* Phase 2C — 两个模式，零次搬家。

     回忆（#panel-diary）现在有「我们的故事 | 📖 日记」二级切换。两个模式不是两块
     DOM，而是同一块面板的两种显隐：.mem-mode-story 隐藏日记那几块，
     .mem-mode-diary 隐藏 #memRoot。切换只改面板上的一个 class。

     为什么是显隐而不是把日记节点搬进一个容器：js/fix-diary.js 的
     _applyLetterPaperLayout 有一道守卫 —— wc.parentNode === panel &&
     pc.parentNode === panel —— 只有写卡和对方的信都还是面板的直接子节点时，它才会
     建那个 .lpc-row 信纸行。写卡一旦被搬进任何新容器，这道守卫就永远为假：信纸行
     再也不会生成，两张卡退化成上下堆叠，而且不报任何错。为一次搬家换一处永久静默
     的版式回归，不值得。原地不动还顺带干掉了 2B.9 唯一的真风险（写卡还在 #memRoot
     里时撞上 innerHTML 被销毁）。

     状态只在内存里：不写 storage、不加 body class、不动 URL、不记滚动位置。
     _mode 是唯一的来源，_applyMode 负责把它写进 DOM，所以两者不可能不一致。

     默认是故事模式。回忆本来就是「回看已经写下的东西」；去看日记是一次明确的动作
     （点 📖 日记，或点那行 CTA），不该是这一页打开时的既成事实。 */
  var _mode = 'story';

  /* 「第一次进 📖 日记 才决定落在哪一天」。之后再切回来，停在你上次待的那一天 ——
     正在写 9 月 18 日、切去故事看一眼、切回来却被弹回今天，是比没有默认落点更烦的事。 */
  var _diaryEntered = false;

  function _todayKey() { return _dayKey(new Date()); }

  /* 默认落点 = 最近一个真的有人写过的日期（见 fix-diary.js 的 _latestDiaryDate）。
     不是今天 —— 一篇日记都没写过的今天打开就是一片空白，而「她写了整整一年」这件事
     会被读成「这里什么都没有」。空日记本上这个函数回今天，那时「今天」本来就是
     唯一能去的一天，也仍然立刻能写。 */
  function _landDiary() {
    var dk = (typeof window._latestDiaryDate === 'function') ? window._latestDiaryDate() : _todayKey();
    if (typeof window._onDateBtnClick === 'function') window._onDateBtnClick(dk);
    else if (typeof window._setDiaryDate === 'function') window._setDiaryDate(dk);
  }

  /* 日期条和写卡都不是本模块的节点，所以这里只通过它们自己的全局函数说话。
     _onDateBtnClick 一处就够：它内部已经做了 _setDiaryDate + _updatePartnerLetter
     + _renderOwnSignature，并把当天的日记读回编辑器 —— 和用户亲手点日期条走的是
     同一条路，没有第二条实现。 */
  function _openDiary(dateKey) {
    /* 带日期进来（CTA 的「今天」、时间轴上的一条引用）＝ 去哪一天已经说定了，
       默认落点不该再插一脚。标记必须在 _setMode 之前立起来，因为 _setMode 会
       同步问它。 */
    if (dateKey) _diaryEntered = true;
    _setMode('diary');
    if (dateKey) {
      if (typeof window._onDateBtnClick === 'function') window._onDateBtnClick(dateKey);
      else if (typeof window._setDiaryDate === 'function') window._setDiaryDate(dateKey);
    }
    var ta = document.getElementById('diaryTextarea');
    if (ta) ta.focus();
  }

  function _setMode(mode) {
    var next = (mode === 'diary') ? 'diary' : 'story';
    var entering = (next === 'diary' && _mode !== 'diary');
    _mode = next;
    _applyMode();
    /* 只有从切换条进日记模式（而不是从 _openDiary 带着日期进来）才有「落点」这件事。 */
    if (entering && !_diaryEntered) { _diaryEntered = true; _landDiary(); }
  }

  function _applyMode() {
    var panel = document.getElementById(PANEL_ID);
    if (!panel) return;
    panel.classList.toggle('mem-mode-diary', _mode === 'diary');
    panel.classList.toggle('mem-mode-story', _mode === 'story');
    var s = document.getElementById('memModeStory'), d = document.getElementById('memModeDiary');
    if (s) { s.classList.toggle('is-active', _mode === 'story'); s.setAttribute('aria-selected', _mode === 'story' ? 'true' : 'false'); }
    if (d) { d.classList.toggle('is-active', _mode === 'diary'); d.setAttribute('aria-selected', _mode === 'diary' ? 'true' : 'false'); }
  }

  /* 二级切换本体。两个 <button role="tab">，挂在 #memRoot **之前**而不是里面 ——
     日记模式下隐藏的正是 #memRoot，挂在里面等于把自己也一起藏掉。

     标签走 textContent 而不是 innerHTML：这个节点的寿命比任何一次 _render() 都长，
     重建会连监听器一起丢掉；换个词只需要 textContent，语言切换时 _render 每次都会
     调 _syncModeBar。 */
  function _ensureModeBar(host) {
    var panel = document.getElementById(PANEL_ID);
    if (!panel || !host) return null;
    var bar = document.getElementById('memModeBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'memModeBar';
      bar.className = 'mem-mode-bar';
      bar.setAttribute('role', 'tablist');
      ['story', 'diary'].forEach(function (m) {
        var b = document.createElement('button');
        b.type = 'button';
        b.id = (m === 'story') ? 'memModeStory' : 'memModeDiary';
        b.className = 'mem-mode-btn';
        b.setAttribute('role', 'tab');
        b.addEventListener('click', function () { _setMode(m); });
        bar.appendChild(b);
      });
      panel.insertBefore(bar, host);
    }
    _syncModeBar();
    _applyMode();
    return bar;
  }

  function _syncModeBar() {
    var s = document.getElementById('memModeStory'), d = document.getElementById('memModeDiary');
    if (s) s.textContent = mem('modeStory');
    if (d) d.textContent = '\u{1F4D6} ' + mem('kDiary');
  }

  /* 时间轴上只保留最近 DIARY_REF_CAP 条日记引用。items 是新的在前，所以「最近」
     就是前六条 —— 不需要排序，也不需要记住任何东西。

     这一步只过滤**渲染**：_items() 和 _featured() 拿到的永远是完整列表，精选照旧
     可能选中一篇日记（§七 明确允许），选中的那篇也不会因为引用上限而消失。

     📖 日记 完全不经过这里：它通过日期条 / 月历 / ±7 天读取 shared-diary 的每一个
     日期。上限只减少「我们的故事」这一屏上显示几条路标，历史上任何一篇日记都仍然
     从日记模式可达 —— 这条边界就是那句「绝对不能限制、删除或影响 📖 日记 模式对
     完整历史 Diary 的访问」。 */
  function _capDiaryRefs(items) {
    var seen = 0;
    return items.filter(function (it) {
      if (it.kind !== 'diary') return true;
      seen++;
      return seen <= DIARY_REF_CAP;
    });
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
     otherwise — so a row older than the window is exactly what it was before.

     Phase 2C — 一条日记引用是一条路标（§七），所以它渲染成 <button> 而不是
     <article>：整行可点，键盘也到得了（<button> 自带 Enter / Space），点它就切到
     📖 日记 并落到那一天。其余四种条目仍然不可点 —— 它们没有「更完整的一处」可去，
     做成按钮只会是一个假的 affordance。

     data-date 直接取这一行的日期，和 id 里那个 key 同源（'diary:'+k+':'+who），
     所以行上标的日期和它指向的日期不可能对不上。

     文本比普通行短（CLIP_REF < CLIP_ROW）：这是引文，不是内容本身。读全文是点进去
     之后的事，也正是 §二 要的「Diary 的少量引用 / 精选」。 */
  function _rowHtml(it, now) {
    var meta = KIND[it.kind] || KIND.diary;
    var day = new Date(it.ts);
    var when = _relDay(it.ts, now);
    var who = it.from ? '<span class="mem-row-who">' + _esc(_name(it.from)) + '</span>' : '';
    var isRef = it.kind === 'diary';
    var body = '<span class="mem-row-ico" aria-hidden="true">' + meta.e + '</span>' +
      '<div class="mem-row-body">' +
        '<div class="mem-row-meta"><span class="mem-row-kind">' + _esc(mem(meta.k)) + '</span>' +
          who + '<span class="mem-row-day">' + _esc(when || _pad(day.getDate())) + '</span></div>' +
        '<p class="mem-row-text">' + _esc(_clip(it.text, isRef ? CLIP_REF : CLIP_ROW)) + '</p>' +
      '</div>';
    if (!isRef) return '<article class="mem-row">' + body + '</article>';
    var dk = _dayKey(day);
    return '<button type="button" class="mem-row mem-row-ref" data-date="' + _esc(dk) + '"' +
      ' aria-label="' + _esc(mem('openRef').replace('{d}', dk)) + '">' + body +
      '<span class="mem-row-go" aria-hidden="true">\u{203A}</span></button>';
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
         this block is what separates the two (§八). Phase 2C 之后它前面只有那一条
         二级切换，日记那几块仍然在它后面原位不动。 */
      panel.insertBefore(host, panel.firstChild);
      /* 事件委托绑在 #memRoot 上，只绑一次：这个节点活得比任何一次重建都久，
         而重建出来的 .mem-row-ref 是新的。写在创建处而不是每次渲染后，是因为
         这里恰好是「这个节点是新造的」唯一为真的地方，不需要额外的「已绑过」标记。
         写卡和日期条不在 #memRoot 里，它们的监听器由 fix-diary.js 自己持有。 */
      host.addEventListener('click', function (e) {
        var b = (e.target && e.target.closest) ? e.target.closest('.mem-row-ref') : null;
        if (b && b.getAttribute('data-date')) _openDiary(b.getAttribute('data-date'));
      });
    }
    /* Phase 2C — 重建的仍然只有这一棵子树。日记的写卡、日期条、对方的信都在
       #memRoot 之外，一次也没有被搬动过（两个模式靠面板上的 mode class 显隐），
       所以这次 innerHTML 碰不到它们：textarea 里还没保存的字、编辑器身上挂着的
       事件，全都活着。这正是 2B.9 需要 _parkDiaryNodes 去救、现在不必再救的那件事。 */
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
    /* 引用上限只压这一屏的渲染：_items() / _featured() 拿到的仍是完整列表，
       空态判据 all.length 和精选池都不受影响。见 _capDiaryRefs。 */
    var shown = _capDiaryRefs(rest);
    host.innerHTML = _headHtml() +
      _anchorHtml(now) +
      _writeCtaHtml() +
      _featuredHtml(feat) +
      (all.length ? _timelineHtml(shown, now) + _songHtml() : _emptyHtml()) +
      /* §八 那个收尾的标题。Phase 2C 之后它下面接的是日记那几块，而故事模式下
         那几块被 CSS 藏了 —— 悬一个「我的日记」标题指着不存在的东西，比没有标题
         更糟，所以它在故事模式下也被 CSS 压掉。
         它在 #memRoot 里面，而日记模式下 #memRoot 整体隐藏，因此它实际永远不会
         被看到。保留而不是删掉，是因为它标着「这一块讲的是什么」，将来若日记模式
         改成内联在故事下面，它就该回来；现在删它属于 2C 范围外的清理。 */
      '<h2 class="mem-diary-head">\u{270D}\u{FE0F} ' + _esc(mem('myDiary')) + '</h2>';
    /* 监听器在每次渲染后现绑，而不是内联 onclick：innerHTML 每次都换掉这一行，
       旧节点连着旧监听器一起被丢弃，所以它不可能叠加，也不需要任何「已绑过」的
       标记。（.mem-row-ref 不同 —— 它每次都是新节点，所以走绑在 #memRoot 上的委托。）

       Phase 2C — 这个按钮不再切换展开态，而是切到 📖 日记 并定位今天（§五）。
       定位走 _onDateBtnClick，和用户亲手点日期条是同一条路，没有第二份实现；
       写卡本来就在那边，所以「点一下就能写」现在由换页保证，而不是由借还 DOM 保证。 */
    var cta = document.getElementById('memWriteCta');
    if (cta) cta.addEventListener('click', function () { _openDiary(_todayKey()); });
    /* 二级切换放在最后：它要挂在 #memRoot 之前，而 #memRoot 到这一刻才确定存在。
       它顺带把当前模式和两个标签同步一遍（语言切换后 _render 会再跑一次）。 */
    _ensureModeBar(host);
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
  window.__memories = {
    items: _items, featured: _featured, ago: _ago, parseDay: _parseDay, hash: _hash,
    /* Phase 2C — 测试用的把手。引用上限是个纯函数，两种模式的状态也只有这里读得到。 */
    capDiaryRefs: _capDiaryRefs, refCap: DIARY_REF_CAP,
    setMode: _setMode, openDiary: _openDiary, mode: function () { return _mode; },
    /* 「第一次进日记模式才落点」这条规矩只有这个标记读得到，所以它也得出来。 */
    entered: function () { return _diaryEntered; }
  };
})();
