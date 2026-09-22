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
   featured pick, the timeline and the song; diary entries reached that timeline
   only as at most DIARY_REF_CAP clickable references (§七), never as the diary
   itself, so a couple's diary could no longer stretch the page without limit.
   (Phase 2E then removed the timeline and the song card outright — below.)
   📖 日记 shows the date strip, the write card and the partner's letter exactly
   where they already were: the two modes are one panel carrying a class, so
   nothing is moved and no second editor exists. 2B.9's borrow machinery is
   deleted — it served a premise ("expand in place, never change page") that no
   longer holds, and its one real hazard, the write card being destroyed by
   #memRoot's innerHTML, goes away with it. Not moving anything is also what
   keeps js/fix-diary.js's .lpc-row guard true; see the mode block below.

   Phase 2E stops 我们的故事 from being a history browser at all. A month-grouped
   timeline mixing diary, gratitude, know-me and milestones into one long list
   tested as "what is this module even for" — the shape said *database*, not
   *memory*. So the timeline, its diary reference rows and the song card are all
   deleted from the display layer, and what is left is one 「✦ 今天想起」 card
   showing a single real entry, plus 「再看看一个」 to step through that day's
   order and 「📖 看全部日记」 to hand the reader to 📖 日记 — which is where
   browsing a history actually belongs. Diary keeps every capability it had;
   Memories stops duplicating it. Nothing is stored and no data is touched: this
   module still only ever calls getItem. See the featured block below.

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
  var FEATURED_MIN_AGE = 7;       // days — "a while ago", never this week
  var FEATURED_MAX_AGE = 400;     // days — beyond this it is an archive, not a nudge
  var CLIP_FEATURED = 220;
  /* Phase 2E §三 — 长度门槛，不是语义门槛。一条只写「我爱你」的日记仍然是真的、
     仍然完整地留在 📖 日记 里，但它单独成卡时没有上下文，看起来像渲染失败。所以
     门槛只管「能不能单独当主角」这一件事：短于此的条目不进候选池，不删除、不影响
     日记模式、不影响任何历史数据。

     刻意不做关键词过滤：三个语种的关键词表不可能穷尽，而且那是在替他们判断哪句
     感情算数。数字是唯一不需要翻译、也不会腐烂的门槛。 */
  var DIARY_MIN_LEN = 12;
  /* 今天不能重复的天数。原来只和昨天比，池子小的时候（感恩上限 20 条、日记稀疏期）
     会出现「隔两天又见同一条」——「今天想起」一旦可预测就不再是想起。 */
  var FEATURED_LOOKBACK = 7;
  /* §三 — 候选池只有这三种。daily-q 的 answer 本身不带问题文本，单独展示是断片；
     milestone / anniversary 是日期不是瞬间，只留在纪念日锚点里。 */
  var FEATURED_KINDS = ['diary', 'grat', 'km'];

  var MEM_I18N = {
    sr: {
      title: 'Naše uspomene',
      /* Phase 2E §五 — 卡片上只需要这三个词：kicker、翻下一条、以及交给 📖 日记
         的那条出口。2C 的 openRef / song / more / myDiary 随它们唯一的使用者
         （_rowHtml / _songHtml / _timelineHtml / 收尾标题）一起删除。 */
      featuredToday: 'Danas se setih',
      another: 'Pogledaj još jednu',
      allDiary: 'Svi dnevni unosi',
      /* Phase 2B.8 — 去写日记那条入口。措辞刻意朴素：不文学化，也不让系统
         替情侣说话（「今天想留下什么？」那种句子是在替他们提问）。它只说明
         这里能做什么。三个语种都放在 MEM_I18N 里，没有第二套 i18n 机制。 */
      writeCta: 'Napiši dnevnik',
      /* Phase 2C — 二级切换的两个名字。右半边直接复用 kDiary：模式名和条目标签
         在所有三个语种里本来就是同一个词，所以不再写第二份，也就不会哪天分叉。 */
      modeStory: 'Naša priča',
      emptyTitle: 'Ovde još nema mnogo priča.',
      emptyText: 'Polako ćemo je ispunjavati. ❤️',
      kDiary: 'Dnevnik', kGrat: 'Zahvalnost', kDQ: 'Pitanje dana',
      kKM: 'Ono što znam o tebi', kMile: 'Prekretnica',
      fromStory: 'Iz naše priče',
      /* Phase 2B.6 — 故事开头那一条。§2.6 fixes met → upoznavanje and
         love → zaljubljenost, so those two words are the only ones used. */
      anchorGap: 'Od upoznavanja do zaljubljenosti prošlo je {n} dana',
      today: 'danas', yesterday: 'juče',
      daysAgo: 'pre {n} dana', weeksAgo: 'pre {n} nedelje',
      monthsAgo: 'pre {n} meseca', yearsAgo: 'pre {n} godine'
    },
    'zh-CN': {
      title: '我们的回忆',
      featuredToday: '今天想起',
      another: '再看看一个',
      allDiary: '看全部日记',
      writeCta: '写一篇日记',
      modeStory: '我们的故事',
      emptyTitle: '这里还没有很多故事。',
      emptyText: '我们会慢慢把它填满。 ❤️',
      kDiary: '日记', kGrat: '感恩', kDQ: '今日一问',
      kKM: '我了解的你', kMile: '里程碑',
      fromStory: '来自我们的故事',
      anchorGap: '从相识到相恋，我们走了 {n} 天',
      today: '今天', yesterday: '昨天',
      daysAgo: '{n} 天前', weeksAgo: '{n} 周前',
      monthsAgo: '{n} 个月前', yearsAgo: '{n} 年前'
    },
    en: {
      title: 'Our Memories',
      featuredToday: 'Today I remember',
      another: 'Show me another',
      allDiary: 'See all diary entries',
      writeCta: 'Write a diary entry',
      modeStory: 'Our Story',
      emptyTitle: "There aren't many stories here yet.",
      emptyText: "We'll fill it up slowly. ❤️",
      kDiary: 'Diary', kGrat: 'Gratitude', kDQ: 'Daily Question',
      kKM: 'What I know about you', kMile: 'Milestone',
      fromStory: 'From Our Story',
      anchorGap: 'From meeting to falling in love — {n} days',
      today: 'today', yesterday: 'yesterday',
      daysAgo: '{n} days ago', weeksAgo: '{n} weeks ago',
      monthsAgo: '{n} months ago', yearsAgo: '{n} years ago'
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

  /* §三 — 一条内容能不能单独当「今天想起」的主角。这是候选池的唯一入口，
     _featured 和 _homeItem 都走它，所以「什么算候选」只有一处定义。 */
  function _isFeaturable(it) {
    if (FEATURED_KINDS.indexOf(it.kind) === -1) return false;
    /* 长度门槛只作用于日记。感恩和「我了解的你」本来就短，给它们也设一条会把
       整个源排除掉 —— 而那两个正是最不容易重复的源。 */
    if (it.kind === 'diary' && String(it.text).length < DIARY_MIN_LEN) return false;
    return true;
  }

  /* The candidates for one day, in a stable order: oldest first, ties broken by
     id. Sorting is what makes the pick order-independent — the two devices may
     hold the same entries in different orders, and an index is only meaningful
     against a fixed sequence. */
  function _featuredPool(items, now) {
    return items.filter(function (it) {
      if (!_isFeaturable(it)) return false;
      var age = (now - it.ts) / 864e5;
      return age >= FEATURED_MIN_AGE && age <= FEATURED_MAX_AGE;
    }).sort(function (a, b) { return a.ts - b.ts || (a.id < b.id ? -1 : 1); });
  }

  function _keyAgo(now, d) { return _dayKey(_atMidnight(now - d * 864e5)); }

  /* 某一天「自然」指到的下标。纯函数：只有日历日期和池子参与，所以两个人各自
     算出来的结果必然相同，没有任何需要同步的随机状态（§五）。 */
  function _baseIndex(pool, now) { return _hash(_dayKey(_atMidnight(now))) % pool.length; }

  /* 今天该看第几条。三道约束，全部由日期推出，没有一条需要存储：

       1. 自然下标 = hash(今天) % n
       2. 最近 FEATURED_LOOKBACK 天各自算过的自然下标，今天一律避开
       3. 若昨天那一类就是自然下标指到的那一类，优先跳到别的类

     2 是 2C「只和昨天比」的扩展。原来池子一小（感恩上限 20 条、日记稀疏期）就会
     出现「隔两天又见同一条」，而「今天想起」一旦可预测就不再是想起。3 是同一形状
     的守卫：日记条数天然压过另外两个源，没有它，卡片会连着好几天都是日记。

     避不开时（池子比 FEATURED_LOOKBACK 还小）回落到自然下标 —— 宁可重复，也不能
     返回空：一张空卡片比一条重复的旧内容更糟。 */
  function _dailyIndex(pool, now) {
    var n = pool.length;
    var start = _baseIndex(pool, now);
    if (n === 1) return 0;

    var forbid = [];
    for (var d = 1; d <= FEATURED_LOOKBACK; d++) forbid.push(_hash(_keyAgo(now, d)) % n);

    /* 昨天「以为」自己看到的那一类。之所以是近似而非精确：精确值要递归重算昨天
       那一整条链路，深度是 7 的幂。这里只需要一个启发式 —— 类别多样性是「尽量」，
       不是必须成立的约束，近似足够，而且永远不会算错到返回空。 */
    var yKind = pool[_hash(_keyAgo(now, 1)) % n].kind;

    var firstFree = -1;
    for (var s = 0; s < n; s++) {
      var i = (start + s) % n;
      if (forbid.indexOf(i) !== -1) continue;
      if (firstFree === -1) firstFree = i;
      if (pool[i].kind !== yKind) return i;
    }
    return firstFree !== -1 ? firstFree : start;
  }

  /* 某一天的确定性排列。同一个池子 + 同一天 = 同一个顺序，两台设备一致 —— 这也是
     「再看看一个」不需要任何同步状态的原因。线性探测解决碰撞；每一步都还能找到
     一个空槽，所以放满 n 个位置必然终止。 */
  function _order(pool, dayKey) {
    var n = pool.length, used = {}, out = [];
    for (var k = 0; k < n; k++) {
      var i = _hash(dayKey + ':' + k) % n;
      while (used[i]) i = (i + 1) % n;
      used[i] = 1; out.push(i);
    }
    return out;
  }

  /* 当天默认看到的那一条。 */
  function _featured(items, now) {
    now = now || Date.now();
    var pool = _featuredPool(items, now);
    return pool.length ? pool[_dailyIndex(pool, now)] : null;
  }

  /* 「再看看一个」走的顺序：以当天默认那一条开头，再沿当天的排列往下走。因为
     _order 是一个真排列，转完一圈之前不会重复 —— 这正是不用 Math.random() 的
     原因：随机会立刻撞回上一条，而那恰恰是要防的事。

     游标只在内存里。刷新 = 新会话 = 回到当天默认那一条；日期翻篇时排列整个重排，
     所以游标必须跟着归零，否则它会指向一条已经被排到别处的内容。 */
  var _cursor = 0, _cursorDay = null;

  /* 当天固定的走查顺序，返回的是**条目**而不是下标。

     这个区分是真的踩过的坑：_order() 排的是下标，第一版直接把它的结果当条目交出去，
     于是 _featuredHtml() 收到一个数字 —— `it.kind` 是 undefined（回落到 diary），
     `it.ts` 是 undefined（日期行渲染成「NaN 年前」），`it.text` 是 undefined（正文
     空）。更糟的是下标 0 是假值，轮到它时 _featuredHtml 的 `if (!it) return ''` 直接
     返回空串：卡片整个消失，连「再看看一个」按钮都不在，点不动也刷不出来。

     所以顺序在这里就落到条目上，调用方拿到的永远是可以直接渲染的东西。 */
  function _sequence(pool, now) {
    var dayKey = _dayKey(_atMidnight(now));
    if (_cursorDay !== dayKey) { _cursorDay = dayKey; _cursor = 0; }
    if (!pool.length) return [];
    var perm = _order(pool, dayKey);
    var at = perm.indexOf(_dailyIndex(pool, now));
    return perm.slice(at).concat(perm.slice(0, at)).map(function (i) { return pool[i]; });
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

  /* Phase 2E — 整页唯一的主角。§五 要的元素：kicker「✦ 今天想起」、类别 + 谁 +
     多久以前、真实内容本身，以及两个出口。

     卡片上的每一个字都来自 shared-* 里真实存在的内容：不改写、不总结、不补句，也
     不替他们说话。_clip 只在过长时截断，截断处是省略号 —— 它删字，但不加字。

     「再看看一个」只在池子里真的还有第二条时才出现。只有一条时它是个按下去没有
     反应的按钮 —— 那是假的 affordance，比没有更糟。 */
  function _featuredHtml(it, canAdvance) {
    if (!it) return '';
    var meta = KIND[it.kind] || KIND.diary;
    var who = it.from ? ' \u{00B7} ' + _esc(_name(it.from)) : '';
    var more = canAdvance
      ? '<button type="button" class="mem-feat-more">' + _esc(mem('another')) +
        '<span class="mem-feat-arrow" aria-hidden="true">\u{203A}</span></button>'
      : '';
    return '<section class="card mem-feat" id="memFeatured">' +
      '<div class="mem-feat-kicker">\u{2726} ' + _esc(mem('featuredToday')) + '</div>' +
      '<div class="mem-feat-kind">' + meta.e + ' ' + _esc(mem(meta.k)) + who +
        ' \u{00B7} ' + _esc(_ago(it.ts)) + '</div>' +
      '<p class="mem-feat-text">' + _esc(_clip(it.text, CLIP_FEATURED)) + '</p>' +
      '<div class="mem-feat-acts">' + more +
        '<button type="button" class="mem-feat-all">\u{1F4D6} ' + _esc(mem('allDiary')) +
        '<span class="mem-feat-arrow" aria-hidden="true">\u{2192}</span></button>' +
      '</div>' +
      '</section>';
  }

  /* 只重建那一张卡，不是整棵 #memRoot：点「再看看一个」时重渲染整页会让锚点和
     CTA 一起闪一下，而它们一个像素都没变。两个按钮走 #memRoot 上的事件委托，所以
     换掉 innerHTML 不会连监听器一起丢掉（和 2C 的 .mem-row-ref 同一条路）。 */
  function _renderFeatured() {
    var box = document.getElementById('memFeaturedBox');
    if (!box) return;
    var now = Date.now();
    var pool = _featuredPool(_items(now), now);
    var seq = _sequence(pool, now);
    box.innerHTML = _featuredHtml(seq.length ? seq[_cursor % seq.length] : null, seq.length > 1);
  }

  /* Phase 2E — _rowHtml 与 _timelineHtml 在这里，已删除。

     Timeline 把 Diary、Gratitude、Know Me、Milestone 按月混成一条长列表，实测
     反馈是「我不知道这个模块有什么用」—— 它长得像数据库，而不像回忆。§一 要求
     彻底取消这一层展示，所以月分组头、日记引用行（.mem-row-ref）、以及「还有 N 条」
     的收尾一起走，连同只服务它们的 CLIP_ROW / CLIP_REF / TIMELINE_CAP /
     DIARY_REF_CAP / REL_DAYS / _relDay()。

     删掉的是**展示层**：_items() 仍然读到全部真实条目，📖 日记 仍然通过日期条和
     月历到达任何一个存在过的日期。本模块从头到尾只有 getItem，没有任何写入路径，
     所以这一步不可能碰到数据。2C 那句「日记引用上限不会影响日记模式」的边界，现在
     由「一条引用都不显示」直接保证。

     原来这里还有 _songHtml。「我们的歌」已经有自己的可编辑卡片（social.js /
     render-love.js 的 renderSong + saveMySong）和首页读点（module-dashboard.js），
     这里是第三份只读拷贝，还渲染在整条时间轴之后 —— 三份里最没有价值的一份。歌曲
     数据和歌曲功能一个都没动。 */

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
      /* 事件委托绑在 #memRoot 上，只绑一次：这个节点活得比任何一次重建都久，而
         重建出来的按钮是新的。写在创建处而不是每次渲染后，是因为这里恰好是
         「这个节点是新造的」唯一为真的地方，不需要额外的「已绑过」标记。
         写卡和日期条不在 #memRoot 里，它们的监听器由 fix-diary.js 自己持有。

         Phase 2E — 卡片上的两个按钮也走这条路。这正是「再看看一个」能只换
         #memFeaturedBox 的 innerHTML、而不必重绑任何监听器的原因。 */
      host.addEventListener('click', function (e) {
        if (!e.target || !e.target.closest) return;
        /* 往前走一格。_sequence 是当天的真排列，所以走完一圈之前不会重复。 */
        if (e.target.closest('.mem-feat-more')) { _cursor++; _renderFeatured(); return; }
        /* 全部日记交给 📖 日记 —— 浏览历史是那一半的职责，回忆不再复制它。走
           _setMode 而不是 _openDiary：这一条是「去看」，不是「去写今天」。 */
        if (e.target.closest('.mem-feat-all')) _setMode('diary');
      });
    }
    /* Phase 2C — 重建的仍然只有这一棵子树。日记的写卡、日期条、对方的信都在
       #memRoot 之外，一次也没有被搬动过（两个模式靠面板上的 mode class 显隐），
       所以这次 innerHTML 碰不到它们：textarea 里还没保存的字、编辑器身上挂着的
       事件，全都活着。这正是 2B.9 需要 _parkDiaryNodes 去救、现在不必再救的那件事。 */
    var now = Date.now();
    var all = _items(now);
    /* Phase 2E — 这一屏现在只有四块：身份头、纪念日锚点、写日记入口，和一张
       「今天想起」。长时间轴、歌曲卡、以及 2C 那个收尾标题都删了（见上）。

       空态只在真的什么都没有时出现。有内容但都还太新（没到 FEATURED_MIN_AGE）
       时，锚点和 CTA 就是这一页的全部 —— 不摆一张「这里还没有很多故事」的卡片，
       去否认他们刚刚写下的东西。 */
    host.innerHTML = _headHtml() +
      _anchorHtml(now) +
      _writeCtaHtml() +
      '<div id="memFeaturedBox"></div>' +
      (all.length ? '' : _emptyHtml());
    /* 卡片单独填：它要能被「再看看一个」局部重建，而不牵动上面那三块。 */
    _renderFeatured();
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
     Phase 2E — the fallback now reuses _isFeaturable, so this line and the
     「今天想起」 card agree on what counts at all; before, each carried its own
     filter. Milestones and daily questions are out either way, which is right:
     the header already carries the day counts, and a question answer without
     its question is a fragment. */
  function _homeItem(items, now) {
    var f = _featured(items, now);
    if (f) return f;
    var rest = items.filter(_isFeaturable);
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
    /* Phase 2E — 测试用的把手。候选池、当天排列、日下标都是纯函数，游标是纯内存
       状态，两者都只有这里读得到。2C 的 capDiaryRefs / refCap 随时间轴一起删除。 */
    pool: _featuredPool, featurable: _isFeaturable, sequence: _sequence,
    dailyIndex: _dailyIndex, kinds: FEATURED_KINDS,
    minDiaryLen: DIARY_MIN_LEN, lookback: FEATURED_LOOKBACK,
    cursor: function () { return _cursor; },
    resetCursor: function () { _cursor = 0; },
    setMode: _setMode, openDiary: _openDiary, mode: function () { return _mode; },
    /* 「第一次进日记模式才落点」这条规矩只有这个标记读得到，所以它也得出来。 */
    entered: function () { return _diaryEntered; }
  };
})();
