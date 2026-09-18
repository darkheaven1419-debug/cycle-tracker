"use strict";

(function () {
  console.log('[module-dashboard] 已加载');

  // Keyed by language, not by identity.
  // This was previously {barry: <Chinese>, andjela: <Serbian>} — the two keys
  // were just the Chinese and Serbian columns of the same 12 labels, with no
  // per-person text. That conflated "who is signed in" with "what language",
  // so an English user silently got Serbian. Keying by language matches the
  // rest of the app (see js/i18n.js: sr / 'zh-CN' / en).
  var DASH_I18N = {
    sr: {
      dashTitle: '\u{1F3E0} Po\u{010D}etna',
      welcomeBack: 'Dobrodo\u{0161}la,',
      todayCulture: 'Dana\u{0161}nje kulturno znanje',
      goDiary: '\u{1F4DD} Dnevnik',
      goCalendar: '\u{1F4C5} Kalendar',
      connectQ: '\u{1F4AD} Pitanje dana',
      /* Phase 1B.5：图标现在是内联 SVG（见 _refreshIcon），这里只留纯文本 ——
         这个键只用作 aria-label，读屏软件不该再念一遍 emoji 的名字。 */
      refreshQ: 'Drugo pitanje',
      todayPhase: 'Trenutna faza',
      todayMoodDash: 'Raspolo\u{017E}enje',
      todayStreak: 'Niz dana',
      todayCycles: 'Ukupno ciklusa',
      avgAbbr: 'Prosek'
    },
    'zh-CN': {
      dashTitle: '\u{1F3E0} \u{4E3B}\u{9875}',
      welcomeBack: '\u{65E9}\u{4E0A}\u{597D}\u{FF0C}',
      todayCulture: '\u{4ECA}\u{65E5}\u{6587}\u{5316}\u{77E5}\u{8BC6}',
      goDiary: '\u{1F4DD} \u{5199}\u{65E5}\u{8BB0}',
      goCalendar: '\u{1F4C5} \u{67E5}\u{770B}\u{65E5}\u{5386}',
      connectQ: '\u{1F4AD} \u{4ECA}\u{5929}\u{7684}\u{5BF9}\u{8BDD}',
      refreshQ: '\u{6362}\u{4E00}\u{4E2A}\u{95EE}\u{9898}',
      todayPhase: '\u{4ECA}\u{65E5}\u{9636}\u{6BB5}',
      todayMoodDash: '\u{4ECA}\u{65E5}\u{5FC3}\u{60C5}',
      todayStreak: '\u{8FDE}\u{7EED}\u{6253}\u{5361}',
      todayCycles: '\u{5468}\u{671F}\u{603B}\u{6570}',
      avgAbbr: '\u{5E73}\u{5747}'
    },
    en: {
      dashTitle: '\u{1F3E0} Home',
      welcomeBack: 'Good morning,',
      todayCulture: "Today's culture note",
      goDiary: '\u{1F4DD} Diary',
      goCalendar: '\u{1F4C5} Calendar',
      connectQ: "\u{1F4AD} Today's question",
      refreshQ: 'Another question',
      todayPhase: 'Current phase',
      todayMoodDash: 'Mood',
      todayStreak: 'Day streak',
      todayCycles: 'Total cycles',
      avgAbbr: 'Avg'
    }
  };

  var DAILY_QS = {
    sr: [
      'Koja je tvoja najlep\u{0161}a uspomena iz detinjstva?',
      'Šta bi voleo/la da naučiš o zemlji svog partnera?',
      'Kad smo najbli\u{017E}e iako smo 7.000 km daleko?',
      'Šta ti najviše nedostaje kad nismo zajedno?',
      'Kako zami\u{0161}lja\u{0161} na\u{0161} prvi zagrljaj?',
      'Koju tradiciju želiš da podeliš sa svojim partnerom?',
      '\u{0160}ta ćemo raditi kad se prvi put sretnemo?'
    ],
    'zh-CN': [
      '\u{4F60}\u{7AE5}\u{5E74}\u{6700}\u{7F8E}\u{597D}\u{7684}\u{56DE}\u{5FC6}\u{662F}\u{4EC0}\u{4E48}\u{FF1F}',
      '你想了解对方国家的什么？',
      '\u{4EC0}\u{4E48}\u{65F6}\u{5019}\u{4F60}\u{89C9}\u{5F97}\u{6211}\u{4EEC}\u{6700}\u{8FD1}\u{FF1F}',
      '我们不在一起的时候，你最想念什么？',
      '\u{4F60}\u{89C9}\u{5F97}\u{6211}\u{4EEC}\u{7684}\u{7B2C}\u{4E00}\u{6B21}\u{62E5}\u{62B1}\u{4F1A}\u{662F}\u{4EC0}\u{4E48}\u{6837}\u{7684}\u{FF1F}',
      '你想和对方分享什么传统？',
      '我们第一次见面时想做什么？'
    ],
    en: [
      'What is your most beautiful childhood memory?',
      "What do you want to learn about your partner's country?",
      'When do you feel closest despite the distance?',
      'What do you miss most when we are apart?',
      'How do you imagine our first hug?',
      'What tradition do you want to share with your partner?',
      'What will we do when we finally meet?'
    ]
  };

  /* ── Today card ─────────────────────────────────────────────────────────
     "Is there anything of hers to look at today?"

     A since-last-visit window over data that ALREADY carries a timestamp.
     Deliberately not an unread counter: no badge, no red dot, nothing to
     clear — seeing it is consuming it. Sources without a trustworthy
     timestamp (weekly check-ins, the sun counter) are left out rather than
     guessed at. */
  var LAST_OPEN_KEY = 'cycle-last-open-';

  /* Partner gender drives the Serbian phrasing, so key it explicitly. */
  var TODAY_I18N = {
    sr: {
      f: '\u{1F48C} Ima ne\u{0161}to od nje',
      m: '\u{1F48C} Ima ne\u{0161}to od njega',
      empty: 'Za sada ni\u{0161}ta novo',
      emptyHint: 'Ostavi poruku u Dnevniku \u{2014} pojavi\u{0107}e se ovde.',
      more: 'jo\u{0161}',
      justNow: 'upravo', min: 'pre {n} min', hour: 'pre {n} h',
      yesterday: 'ju\u{010D}e', days: 'pre {n} dana',
      mood: 'raspolo\u{017E}enje', hug: 'zagrljaj', diary: 'dnevnik',
      sleep: 'san', voice: 'snimak', todo: 'zadatak',
      grat: 'zahvalnost', song: 'pesma', knowme: 'odgovor',
      /* §9：两个人是对称的，所以提示语按「对方是谁」分男女两种说法，
         不写成「回应她」——那会让 Barry 变成唯一的查看者。 */
      askF: 'Mo\u{017E}e\u{0161} da joj odgovori\u{0161}',
      askM: 'Mo\u{017E}e\u{0161} da mu odgovori\u{0161}'
    },
    en: {
      f: '\u{1F48C} Something from her',
      m: '\u{1F48C} Something from him',
      empty: 'Nothing new yet',
      emptyHint: 'Leave a note in the Diary \u{2014} it will show up here.',
      more: 'more',
      justNow: 'just now', min: '{n}m ago', hour: '{n}h ago',
      yesterday: 'yesterday', days: '{n}d ago',
      mood: 'mood', hug: 'a hug', diary: 'diary',
      sleep: 'sleep', voice: 'voice note', todo: 'to-do',
      grat: 'a thank-you', song: 'a song', knowme: 'an answer',
      askF: 'You can reply to her',
      askM: 'You can reply to him'
    },
    'zh-CN': {
      f: '\u{1F48C} \u{6709}\u{5979}\u{7684}\u{4E1C}\u{897F}',
      m: '\u{1F48C} \u{6709}\u{4ED6}\u{7684}\u{4E1C}\u{897F}',
      empty: '\u{8FD8}\u{6CA1}\u{6709}\u{65B0}\u{7684}',
      emptyHint: '\u{53BB}\u{65E5}\u{8BB0}\u{91CC}\u{7559}\u{4E00}\u{53E5}\u{8BDD}\u{FF0C}\u{5C31}\u{4F1A}\u{51FA}\u{73B0}\u{5728}\u{8FD9}\u{91CC}\u{3002}',
      more: '\u{6761}',
      justNow: '\u{521A}\u{521A}', min: '{n}\u{5206}\u{949F}\u{524D}', hour: '{n}\u{5C0F}\u{65F6}\u{524D}',
      yesterday: '\u{6628}\u{5929}', days: '{n}\u{5929}\u{524D}',
      mood: '\u{5FC3}\u{60C5}', hug: '\u{62E5}\u{62B1}', diary: '\u{65E5}\u{8BB0}',
      sleep: '\u{7761}\u{7720}', voice: '\u{5F55}\u{97F3}', todo: '\u{5F85}\u{529E}',
      grat: '\u{611F}\u{6069}', song: '\u{70B9}\u{6B4C}', knowme: '\u{56DE}\u{7B54}',
      askF: '\u{4F60}\u{53EF}\u{4EE5}\u{56DE}\u{5E94}\u{5979}',
      askM: '\u{4F60}\u{53EF}\u{4EE5}\u{56DE}\u{5E94}\u{4ED6}'
    }
  };

  /* ── V2 copy ────────────────────────────────────────────────────────────
     Phase 1 copy lives in its own table rather than in DASH_I18N. DASH_I18N is
     pinned at exactly 12 keys by tests/test-i18n-lang-keys.js, and it belongs
     to the cycle stat cells; the couple-space copy is a different surface with
     a different lifetime. Same resolution rule as dl(): exact locale, then base
     language, then Serbian — so `zh-CN` still resolves against a bare `zh`. */
  var V2_I18N = {
    sr: {
      herCycle: '\u{1F338} Njen ciklus',
      goTogether: '\u{1F49E} Zajedno',
      qOfDay: '\u{1F4AD} Pitanje dana',
      qAnswer: 'Odgovori \u{2192}',
      homeQuote: 'Od Pekinga do Vojvodine \u{2014} 7.000 km, jedno srce.',
      togetherLead: 'Na\u{0161} prostor — ovde ostavljamo jedno drugom.',
      daysSinceMet: '{n} dana od susreta',
      qYours: 'Tvoj odgovor',
      qPlaceholder: 'Napi\u{0161}i odgovor\u{2026}',
      qSend: 'Po\u{0161}alji',
      qUpdate: 'Sa\u{010D}uvaj izmenu',
      qSaved: '\u{2713} Sa\u{010D}uvano',
      qWaiting: 'jo\u{0161} nije odgovorio/la',
      qBoth: '\u{2728} Oboje ste odgovorili'
    },
    'zh-CN': {
      herCycle: '\u{1F338} \u{5979}\u{7684}\u{5468}\u{671F}',
      goTogether: '\u{1F49E} \u{4E00}\u{8D77}',
      qOfDay: '\u{1F4AD} \u{4ECA}\u{65E5}\u{4E00}\u{95EE}',
      qAnswer: '\u{53BB}\u{56DE}\u{7B54} \u{2192}',
      homeQuote: '\u{4ECE}\u{5317}\u{4EAC}\u{5230}\u{4F0F}\u{4F0A}\u{4F0F}\u{4E01}\u{90A3} \u{2014} 7000 \u{516C}\u{91CC}\u{FF0C}\u{4E00}\u{9897}\u{5FC3}\u{3002}',
      togetherLead: '\u{6211}\u{4EEC}\u{7684}\u{7A7A}\u{95F4} \u{2014}\u{2014} \u{5728}\u{8FD9}\u{91CC}\u{7ED9}\u{5F7C}\u{6B64}\u{7559}\u{4E0B}\u{4E1C}\u{897F}\u{3002}',
      daysSinceMet: '\u{76F8}\u{8BC6} {n} \u{5929}',
      qYours: '\u{4F60}\u{7684}\u{56DE}\u{7B54}',
      qPlaceholder: '\u{5199}\u{4E0B}\u{4F60}\u{7684}\u{56DE}\u{7B54}\u{2026}',
      qSend: '\u{53D1}\u{9001}',
      qUpdate: '\u{66F4}\u{65B0}\u{56DE}\u{7B54}',
      qSaved: '\u{2713} \u{5DF2}\u{4FDD}\u{5B58}',
      qWaiting: '\u{8FD8}\u{6CA1}\u{6709}\u{56DE}\u{7B54}',
      qBoth: '\u{2728} \u{4F60}\u{4EEC}\u{90FD}\u{56DE}\u{7B54}\u{4E86}'
    },
    en: {
      herCycle: '\u{1F338} Her cycle',
      goTogether: '\u{1F49E} Together',
      qOfDay: "\u{1F4AD} Today's question",
      qAnswer: 'Answer \u{2192}',
      homeQuote: 'Beijing to Vojvodina \u{2014} 7,000 km, one heart.',
      togetherLead: 'Our space \u{2014} where we leave things for each other.',
      daysSinceMet: '{n} days since we met',
      qYours: 'Your answer',
      qPlaceholder: 'Write your answer\u{2026}',
      qSend: 'Send',
      qUpdate: 'Update answer',
      qSaved: '\u{2713} Saved',
      qWaiting: "hasn't answered yet",
      qBoth: '\u{2728} You both answered'
    }
  };

  function v2(key) {
    var L = (typeof lang !== 'undefined' && lang) ? lang : 'sr';
    var p = V2_I18N[L] || V2_I18N[L.split('-')[0]] || V2_I18N.sr;
    return p[key] || V2_I18N.sr[key] || key;
  }

  /** Who this space belongs to — the same block heads Home and Together. */
  function _coupleHeadHtml() {
    return '<div class="dch-row">' +
      '<span class="dch-avatar" aria-hidden="true">\u{1F466}</span>' +
      '<span class="dch-names">Barry<span class="dch-x">\u{00D7}</span>An\u{0111}ela</span>' +
      '<span class="dch-avatar" aria-hidden="true">\u{1F338}</span>' +
      '</div>';
  }

  var _todayWindow = 0;

  function _todayCtx() {
    var me = (typeof activeProfile !== 'undefined' && activeProfile) ? activeProfile : 'andjela';
    var lk = (typeof lang !== 'undefined' && TODAY_I18N[lang]) ? lang : 'sr';
    return { me: me, partner: me === 'barry' ? 'andjela' : 'barry', S: TODAY_I18N[lk] };
  }

  function _readJSON(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (e) { return fallback; }
  }

  /** Window start, fixed for the whole session so a mid-session pull still counts as new. */
  function _initTodayWindow() {
    if (_todayWindow) return _todayWindow;
    var prev = parseInt(localStorage.getItem(LAST_OPEN_KEY + _todayCtx().me) || '0', 10);
    var t0 = new Date();
    t0.setHours(0, 0, 0, 0);
    _todayWindow = prev > 0 ? prev : t0.getTime();
    try { localStorage.setItem(LAST_OPEN_KEY + _todayCtx().me, String(Date.now())); } catch (e) {}
    return _todayWindow;
  }

  /** Advance the marker on the way out, so what was seen is not replayed next open. */
  function _markTodaySeen() {
    if (typeof activeProfile === 'undefined' || !activeProfile) return;
    try { localStorage.setItem(LAST_OPEN_KEY + activeProfile, String(Date.now())); } catch (e) {}
  }

  function _relTime(ts, S) {
    var mins = Math.floor(Math.max(0, Date.now() - ts) / 60000);
    if (mins < 1) return S.justNow;
    if (mins < 60) return S.min.replace('{n}', mins);
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return S.hour.replace('{n}', hrs);
    var days = Math.floor(hrs / 24);
    return days === 1 ? S.yesterday : S.days.replace('{n}', days);
  }

  /** Day-granularity keys (YYYY-MM-DD) -> local noon, so they sort sanely. */
  function _dayNoon(dstr) {
    if (!dstr || typeof dstr !== 'string') return 0;
    var t = new Date(dstr.slice(0, 10) + 'T12:00:00').getTime();
    return isNaN(t) ? 0 : t;
  }

  function _collectTodayEvents(since) {
    var partner = _todayCtx().partner;
    var out = [];
    function add(t, emoji, label, text, tab) {
      if (!t || t <= since) return;
      out.push({ t: t, e: emoji, l: label, x: text || '', tab: tab });
    }

    /* 目标页是 'together'，不是 'stats'：Phase 1A 把这四张卡从 Cycle 面板搬到了
       Together 面板，点进去却跳到 stats 就成了死链（卡片早不在那里了）。 */
    var grat = _readJSON('shared-gratitude', []);
    if (Array.isArray(grat)) grat.forEach(function (g) {
      if (g && g.from === partner) add(g.time, '\u{1F48C}', 'grat', g.text, 'together');
    });

    /* 对方的 emoji 回应 —— §3 的「反向也必须成立」：我回应的那条她会看到，
       她回应的这条我也要看到。Echo 之前不在这份名单里，所以她的回应永远
       不会出现在提示里。 */
    var echo = _readJSON('shared-gratitude-echo', []);
    if (Array.isArray(echo)) echo.forEach(function (x) {
      if (x && x.from === partner && x.time) add(x.time, x.emoji || '\u{1F49E}', 'grat', '', 'together');
    });

    /* 对方今天对每日一问的回答 —— 也是「她给我留了东西」的一种。 */
    var dq = _readJSON('shared-daily-q', []);
    if (Array.isArray(dq)) dq.forEach(function (x) {
      if (x && x.from === partner && x.time) add(x.time, '\u{1F4AD}', 'knowme', x.answer, 'together');
    });

    var song = _readJSON('shared-song-' + partner, null);
    if (song && song.time) add(song.time, '\u{1F3B6}', 'song', song.title, 'together');

    var km = _readJSON('shared-knowme', {});
    Object.keys(km || {}).forEach(function (d) {
      var e = km[d] && km[d][partner];
      if (e && e.time) add(e.time, '\u{1F4AD}', 'knowme', e.answer, 'together');
    });

    /* Moods are read straight from localStorage: sync.apply() never writes
       window.state.moods, so a pulled mood would otherwise look stale here. */
    var ce = _readJSON('shared-cycle-data', null) || _readJSON('cycle-data-v6-andjela', null);
    var moods = ce && ce.moods;
    Object.keys(moods || {}).forEach(function (d) {
      var e = moods[d] && moods[d][partner];
      if (!e || !e.time) return;
      var emo = (typeof e.mood === 'string' && /^[^\x00-\x7F]+$/.test(e.mood)) ? e.mood : '\u{1F497}';
      add(e.time, emo, 'mood', '', 'stats');
    });

    var hug = _readJSON('shared-hug', null);
    if (hug && hug.from === partner) add(hug.time, '\u{1F917}', 'hug', '', 'together');

    if (partner === 'barry') {
      var sl = _readJSON('barry-sleep', null);
      if (sl && typeof sl.time === 'number') add(sl.time, '\u{1F319}', 'sleep', '', 'stats');
    }

    var vd = _readJSON('shared-voice-data', {});
    Object.keys(vd || {}).forEach(function (k) {
      var e = vd[k];
      if (e && e.author === partner && e.time) add(e.time, '\u{1F399}', 'voice', '', 'stats');
    });

    var diary = _readJSON('shared-diary', {});
    Object.keys(diary || {}).forEach(function (d) {
      var e = diary[d] && diary[d][partner];
      if (!e) return;
      add(_dayNoon(d), '\u{1F4D6}', 'diary', e.happy || e.uncomf || '', 'diary');
    });

    var todo = _readJSON('shared-todolist', []);
    if (Array.isArray(todo)) todo.forEach(function (t) {
      if (!t) return;
      if (t.completed && t.completedBy === partner && t.completedAt) {
        add(_dayNoon(t.completedAt), '\u{2705}', 'todo', t.text, 'dashboard');
      } else if (!t.completed && t.author === partner && t.createdAt) {
        add(_dayNoon(t.createdAt), '\u{1F4CB}', 'todo', t.text, 'dashboard');
      }
    });

    out.sort(function (a, b) { return b.t - a.t; });
    return out;
  }

  /* The homepage can be built two ways: by _initSkeleton(), or by the static
     markup already in index.html (whichever path runs first wins). The Today
     container is therefore created on demand instead of only inside the
     skeleton, so the card shows up either way. */
  function _ensureTodayHost(panel) {
    var host = document.getElementById('dash-today');
    if (host && host.parentNode === panel) return host;
    host = document.createElement('div');
    host.id = 'dash-today';
    panel.insertBefore(host, panel.firstChild);
    return host;
  }

  function _renderTodayCard() {
    var host = document.getElementById('dash-today');
    if (!host) return;
    var ctx = _todayCtx();
    var S = ctx.S;
    var items = _collectTodayEvents(_initTodayWindow());
    var wrap = function (accent, inner) {
      return '<div class="card dash-card" style="border-left:3px solid ' + accent + '">' + inner + '</div>';
    };

    if (!items.length) {
      host.innerHTML = wrap('var(--border)',
        '<div style="font-size:.72rem;font-weight:700;color:var(--text-muted)">' + esc(S.empty) + '</div>' +
        '<div style="font-size:.64rem;color:var(--text-muted);margin-top:4px;line-height:1.5">' + esc(S.emptyHint) + '</div>');
      return;
    }

    var rows = items.slice(0, 4).map(function (it) {
      var body = it.x ? String(it.x).slice(0, 90) : (S[it.l] || '');
      return '<div onclick="switchToTab(\'' + it.tab + '\')" ' +
        'style="display:flex;align-items:flex-start;gap:8px;padding:7px 0;cursor:pointer;border-top:1px solid var(--border)">' +
        '<span style="font-size:.95rem;flex-shrink:0;line-height:1.3">' + it.e + '</span>' +
        '<span style="flex:1;min-width:0;font-size:.72rem;color:var(--text);line-height:1.4;word-break:break-word">' + esc(body) + '</span>' +
        '<span style="font-size:.56rem;color:var(--text-muted);flex-shrink:0;white-space:nowrap;margin-top:2px">' + esc(_relTime(it.t, S)) + '</span>' +
        '</div>';
    }).join('');

    var more = items.length > 4
      ? '<div style="font-size:.6rem;color:var(--text-muted);padding-top:6px">+ ' + (items.length - 4) + ' ' + esc(S.more) + '</div>'
      : '';

    host.innerHTML = wrap('var(--love)',
      '<div style="font-size:.74rem;font-weight:700;color:var(--love);margin-bottom:2px">' +
      esc(ctx.partner === 'barry' ? S.m : S.f) + '</div>' + rows + more);
  }

  window.addEventListener('pagehide', _markTodaySeen);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) _markTodaySeen();
  });

  var _initialized = false;

  function dl(key) {
    // Was: var profile = lang startsWith 'zh' ? 'barry' : 'andjela' — which sent
    // every non-Chinese language, English included, to the Serbian column.
    // Now: resolve by language, with the same 'sr' fallback the rest of the app
    // uses. Unknown/absent lang degrades to Serbian rather than to a key name.
    var L = (typeof lang !== 'undefined' && lang) ? lang : 'sr';
    var p = DASH_I18N[L] || DASH_I18N[L.split('-')[0]] || DASH_I18N.sr;
    return p[key] || DASH_I18N.sr[key] || key;
  }

  function getDailyQuestion() {
    var qs = DAILY_QS[lang] || DAILY_QS.sr;
    /* 用「epoch 天数」而不是「几号」。getDate() 是本地时区量：北京与塞尔维亚相差
       6~7 小时，每天有一段时间两人处在不同的本地日期，会拿到不同的题；而且它按
       月内日期取模，1/8/15/22/29 号会重复同一题，跨月还会跳。epoch 天是绝对量，
       同一时刻两人的下标必然相同——这是 §4「两个人每天回答同一道题」的前提。
       三个数组等长（各 7 条）且第 i 条语义一致，缺一不可。 */
    return qs[Math.floor(Date.now() / 864e5) % qs.length];
  }
  window.getDailyQuestion = getDailyQuestion;

  function switchToTab(tabId) {
    var btn = document.querySelector('.tab[data-panel="' + tabId + '"]');
    if (btn) btn.click();
    if (history.replaceState) history.replaceState(null, '', '#' + tabId);
  }
  window.switchToTab = switchToTab;

  function initDashboard() {
    // Route through the global: js/fix-all.js and js/fix-stats.js decorate
    // window.renderDashboard (quick-mark button, todo card). A bare local call
    // would resolve to this module's own renderDashboard and skip them.
    function _render() { (window.renderDashboard || renderDashboard)(); }
    // Phase 2B：这是 Pull 门禁，凭据是 App Secret（Push 用的 GitHub PAT 与此无关）
    if (typeof getAppSecret === 'function' && getAppSecret()) {
      if (typeof pullAllSharedData === 'function') pullAllSharedData().then(_render);
    } else { _render(); }
  }
  window.initDashboard = initDashboard;

  /* The greeting sits under the couple header, which already names both people,
     so it no longer repeats the signed-in user's name — it addresses the pair.
     Written with textContent rather than innerHTML: nothing here is markup. */
  function _updateWelcome(panel) {
    var el = document.getElementById('dash-welcome');
    if (!el) return;
    var _h = new Date().getHours();
    var _l = (typeof lang !== 'undefined') ? lang : 'sr';
    var _greet, _icon;
    if (_h >= 5 && _h < 12) {
      _greet = _l === 'sr' ? 'Dobro jutro' : _l === 'en' ? 'Good morning' : '\u{65E9}\u{4E0A}\u{597D}';
      _icon = '\u{2600}\u{FE0F}';
    } else if (_h >= 12 && _h < 18) {
      _greet = _l === 'sr' ? 'Dobar dan' : _l === 'en' ? 'Good afternoon' : '\u{4E0B}\u{5348}\u{597D}';
      _icon = '\u{1F324}\u{FE0F}';
    } else {
      _greet = _l === 'sr' ? 'Dobro ve\u{010D}e' : _l === 'en' ? 'Good evening' : '\u{665A}\u{4E0A}\u{597D}';
      _icon = '\u{1F319}';
    }
    var _ann = typeof annDateMet !== 'undefined' ? annDateMet : '2026-03-19';
    var _days = Math.round((Date.now() - new Date(_ann).getTime()) / 86400000);
    el.textContent = _greet + ' ' + _icon + ' \u{00B7} ' + v2('daysSinceMet').replace('{n}', _days);
  }

  /* Labels are written on every render rather than baked into the skeleton,
     because switchLanguage() re-runs applyAllUI without rebuilding the panel —
     a baked label would keep the previous language until a reload. */
  function _updateV2Labels() {
    var set = function (id, txt) { var e = document.getElementById(id); if (e) e.textContent = txt; };
    set('dash-q-title', v2('qOfDay'));
    set('dash-q-cta', v2('qAnswer'));
    set('dash-quote-text', v2('homeQuote'));
    set('dash-her-cycle-title', v2('herCycle'));
    set('dash-link-diary', dl('goDiary'));
    set('dash-link-together', v2('goTogether'));
  }

  function _updateStatsCards(panel) {
    var predDash = typeof predict === 'function' ? predict() : { cycles: [], avgCycle: '--', nextStart: null, ovulation: null, fertileStart: null, fertileEnd: null, confidence: 'low', futurePeriods: [] };
    var tdDash = typeof today === 'function' ? today() : new Date();
    var phaseDash = typeof getPhase === 'function' ? getPhase(tdDash, predDash) : null;
    var pe = { 'period-on': '\u{1F9F8}', 'period-mid': '\u{1F9F8}', ovulation: '\u{1F95A}', fertile: '\u{1F331}', luteal: '\u{1F319}', follicular: '\u{1F33F}' };
    var phLabel = (typeof t === 'function' && t('phaseBadges')) ? t('phaseBadges')[phaseDash] || '--' : '--';
    var tm = typeof getMood === 'function' ? getMood(fmtDate(tdDash)) : null;
    var strk = typeof calculateStreak === 'function' ? calculateStreak() : 0;
    var sc = state ? state.records.length : 0;
    var avgD = predDash.avgCycle || '--';
    var el = document.getElementById('dash-stats-cards');
    if (!el) return;
    el.innerHTML =
      '<div style="text-align:center"><div style="font-size:1.4rem">' + (pe[phaseDash] || '\u{1F4CA}') + '</div><div style="font-size:.65rem;font-weight:700;color:var(--text)">' + dl('todayPhase') + '</div><div style="font-size:.58rem;color:var(--text-muted)">' + phLabel + '</div></div>' +
      '<div style="text-align:center"><div style="font-size:1.4rem">' + (tm || '\u{1F324}\u{FE0F}') + '</div><div style="font-size:.65rem;font-weight:700;color:var(--text)">' + dl('todayMoodDash') + '</div><div style="font-size:.58rem;color:var(--text-muted)">' + (tm || '--') + '</div></div>' +
      '<div style="text-align:center"><div style="font-size:1.4rem">\u{1F525}</div><div style="font-size:.65rem;font-weight:700;color:var(--text)">' + dl('todayStreak') + '</div><div style="font-size:.58rem;color:var(--text-muted)">' + strk + ' ' + (lang === 'sr' ? 'dana' : lang === 'en' ? 'days' : '\u{5929}') + '</div></div>' +
      '<div style="text-align:center"><div style="font-size:1.4rem">\u{1F4CA}</div><div style="font-size:.65rem;font-weight:700;color:var(--text)">' + dl('todayCycles') + '</div><div style="font-size:.58rem;color:var(--text-muted)">' + sc + ' / ' + dl('avgAbbr') + ' ' + avgD + 'd</div></div>';
  }

  function _updateConnectCard(panel) {
    var el = document.getElementById('dash-connect');
    if (!el) return;
    var q = getDailyQuestion();
    var cq = el.querySelector('#dailyConnectQ');
    if (cq) cq.textContent = q;
  }

  /* V2 Home order — the couple's identity, then what she left for him, then the
     cycle. Ordering is enforced by explicit `order:` rules in calendar.css, not
     by DOM position, but the DOM is built in the same sequence so that the tab
     order a screen reader reads matches what is on screen.
     `#todoListCard` is injected by js/fix-stats.js next to `.dash-quote`, so
     that anchor card must stay a direct child of this panel. */
  function _initSkeleton(panel) {
    panel.innerHTML =
      '<div class="dash-couple-head" id="dash-couple-head">' + _coupleHeadHtml() +
        '<div class="dch-greet" id="dash-welcome"></div></div>' +
      '<div id="dash-today"></div>' +
      '<div class="card dash-card" id="dash-connect">' +
        '<div class="dhc-head"><span class="dhc-title" id="dash-q-title"></span>' +
        '<button class="dhc-more" onclick="switchToTab(\'together\')" aria-label="' + esc(v2('qAnswer')) + '">\u{203A}</button></div>' +
        '<div class="dash-q-text" id="dailyConnectQ"></div>' +
        '<button class="dash-link-btn dash-q-cta" id="dash-q-cta" onclick="switchToTab(\'together\')"></button>' +
      '</div>' +
      '<div class="card dash-card dash-quote"><div class="fs-base text-love" style="font-style:italic" id="dash-quote-text"></div></div>' +
      '<div class="dash-her-cycle" id="dash-her-cycle">' +
        '<div class="dhc-head"><span class="dhc-title" id="dash-her-cycle-title"></span>' +
        '<button class="dhc-more" onclick="switchToTab(\'stats\')" aria-label="' + esc(v2('herCycle')) + '">\u{203A}</button></div>' +
        '<div id="dash-stats-cards" class="dhc-grid"></div>' +
      '</div>' +
      '<div class="card dash-card" id="dash-links-card"><div class="dash-links">' +
        '<button class="dash-link-btn" id="dash-link-diary" onclick="switchToTab(\'diary\')"></button>' +
        '<button class="dash-link-btn" id="dash-link-together" onclick="switchToTab(\'together\')"></button>' +
      '</div></div>';
    _initialized = true;
  }

  /* `animate === false` is passed by the sync pull, so a 60s background refresh
     does not replay the entrance animation the user already watched. */
  function renderDashboard(animate) {
    var panel = document.getElementById('panel-dashboard');
    if (!panel) return;
    if (!_initialized) _initSkeleton(panel);
    _ensureTodayHost(panel);
    _updateV2Labels();
    _updateWelcome(panel);
    _renderTodayCard();
    _updateStatsCards(panel);
    _updateConnectCard(panel);
    if (animate !== false && typeof animateDashboardCards === 'function') animateDashboardCards();
  }
  window.renderDashboard = renderDashboard;

  /* ── Together ───────────────────────────────────────────────────────────
     Phase 1A moves the six interaction cards here from the Cycle panel, which
     is where they had ended up: Hug, Gratitude (+ Echo reactions), Song,
     Know Me, weekly Check-in and the relationship tip. Their markup, ids,
     renderers and storage keys are unchanged — this is a relocation, not a
     rewrite, so no data or sync behaviour is affected.

     Refreshing them on entry matters for one of the six in particular:
     renderKnowMe() is missing from applyAllUI's `connection` group, so nothing
     else would repaint the Know Me card after a sync pull landed while the user
     was on another tab. */
  /* ── Daily Question：两个人一起回答同一道题 ─────────────────────────────
     §4。不是题库、不是问卷：谁回答了、回答了什么，两边都看得见；两个人都答
     完给一个轻的完成态。没有分数、没有排名、没有连续签到。

     数据的身份是 qKey = 「epoch 天数 : 题库下标」，由 getDailyQuestion 用同一个
     算法算出来，所以它与语言和时区都无关 —— 两人在同一时刻必然拿到同一个值。
     存储键 shared-daily-q，条目 {qKey, from, answer, time}，append-only；在
     sync.js 里按 (qKey|from) 取并集，每人对每道题只保留一条，改答案就是覆盖
     自己那条，对方那条不受影响。（这正是它不能用 shared-knowme 那种整体替换
     语义的原因：整体替换会把对方刚写的回答抹掉。） */
  var DQ_KEY = 'shared-daily-q';

  function _dqCurrent() {
    var day = Math.floor(Date.now() / 864e5);
    var n = (DAILY_QS.sr && DAILY_QS.sr.length) || 1;
    return { day: day, qKey: day + ':' + (day % n) };
  }

  function _dqEntries(qKey) {
    var out = {};
    var list = _readJSON(DQ_KEY, []);
    if (Array.isArray(list)) list.forEach(function (e) {
      if (e && e.qKey === qKey && e.from) out[String(e.from)] = e;
    });
    return out;
  }

  function _nameOf(p) { return p === 'barry' ? 'Barry' : 'An\u{0111}ela'; }

  /** 写自己的回答。同一道题重复提交只替换自己那条，对方那条原样不动。 */
  function answerDailyQ(text) {
    var t = String(text == null ? '' : text).trim();
    if (!t || t.length > 280) return;
    var cur = _dqCurrent();
    var me = _todayCtx().me;
    var list = _readJSON(DQ_KEY, []);
    if (!Array.isArray(list)) list = [];
    var rec = { qKey: cur.qKey, from: me, answer: t, time: Date.now() };
    var i = -1;
    list.forEach(function (e, n) {
      if (e && e.qKey === cur.qKey && String(e.from) === me) i = n;
    });
    if (i >= 0) list[i] = rec; else list.push(rec);
    try { localStorage.setItem(DQ_KEY, JSON.stringify(list)); } catch (e) {}
    _renderDailyQ();
    if (typeof pushAllSharedData === 'function') pushAllSharedData();
  }
  window.answerDailyQ = answerDailyQ;

  function _renderDailyQ() {
    var host = document.getElementById('togetherDailyQ');
    if (!host) return;
    var ctx = _todayCtx();
    var both = _dqEntries(_dqCurrent().qKey);
    var mine = both[ctx.me] || null;
    var theirs = both[ctx.partner] || null;

    /* 一行 = 一个人。✅ 已答（附答案），⏳ 未答。两边对称，Barry 不是查看者。 */
    function line(p, rec) {
      var ok = !!rec;
      return '<div class="dq-line' + (ok ? ' dq-done' : '') + '">' +
        '<span class="dq-who">' + esc(_nameOf(p)) + '</span>' +
        '<span class="dq-mark" aria-hidden="true">' + (ok ? '\u{2705}' : '\u{23F3}') + '</span>' +
        '<span class="dq-ans">' + esc(ok ? rec.answer : v2('qWaiting')) + '</span>' +
        '</div>';
    }

    host.innerHTML =
      '<div class="dq-q" id="togetherDailyQText"></div>' +
      '<textarea class="dq-input" id="dqInput" rows="2" maxlength="280" ' +
        'placeholder="' + esc(v2('qPlaceholder')) + '" aria-label="' + esc(v2('qYours')) + '">' +
        esc(mine ? mine.answer : '') + '</textarea>' +
      '<div class="dq-actions">' +
        '<button class="dq-send" onclick="answerDailyQ(document.getElementById(\'dqInput\').value)">' +
          esc(mine ? v2('qUpdate') : v2('qSend')) + '</button>' +
        (mine ? '<span class="dq-saved">' + esc(v2('qSaved')) + '</span>' : '') +
      '</div>' +
      (mine && theirs ? '<div class="dq-both">' + esc(v2('qBoth')) + '</div>' : '') +
      line(ctx.me, mine) + line(ctx.partner, theirs);

    var qt = document.getElementById('togetherDailyQText');
    if (qt) qt.textContent = getDailyQuestion();
  }
  window.renderDailyQ = _renderDailyQ;

  /* §3（Phase 1B.5）：原来这里是 🔄 这个 emoji。它在 Windows / Android 上会落到
     系统字体，画出来是饱和的蓝色，跟 Midnight Couple 的 --text-muted 完全不搭，
     而且颜色由系统决定、CSS 管不到。改成内联 SVG 就跟着 currentColor 走。
     路径用的是 Feather 的 rotate-cw（MIT），跟项目里 .tb-icon 那套是同一个来源
     —— 不引图标库，不加依赖，只是把同一段 path 搬过来。 */
  function _refreshIcon() {
    return '<svg class="dhc-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M23 4v6h-6"/>' +
      '<path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>' +
      '</svg>';
  }

  /* ── §3 "New from your partner" ─────────────────────────────────────────
     不是未读系统。复用 Home 上已经在用的「自上次打开以来的窗口」
     （LAST_OPEN_KEY + 自己的 profile，见 _initTodayWindow）：窗口之内对方留
     下的东西就显示，看见即消费。两个人的窗口各存各的、不同步，所以不存在
     会产生同步冲突的全局 unread 字段。两处共用同一份 _collectTodayEvents，
     §3 要求的对称性因此是结构性的，而不是两处各写一遍。 */
  /* §1（Phase 1B.5）：「她留了东西」是一句话，「你可以回应她」才是一个动作。
     只把东西列出来，Barry 仍然要滑到下面那张感恩卡才有按钮可按（实测 y≈1375，
     而这张卡在 320px 下 top≈223）。所以把回应行接在最新一条可回应的便签下面。

     刻意不新建任何东西：渲染的还是同一条 shared-gratitude 记录，点下去走的还是
     reactGratitude()，身份仍由 gratEchoRow 按 (note.from, note.time) 判定 ——
     没有第二份状态、没有新的同步字段、也没有 unread 计数。 */
  function _replyTarget(partner, since) {
    var grat = _readJSON('shared-gratitude', []);
    if (!Array.isArray(grat)) return null;
    var best = null;
    grat.forEach(function (g) {
      if (!g || g.from !== partner) return;
      /* gratEchoRow 对没有可用时间戳的条目返回空串（无法与回应一一对应），
         所以这里也用同一条件筛，免得选中一条渲染不出按钮的便签。 */
      if (typeof g.time !== 'number' || !isFinite(g.time)) return;
      if (g.time <= since) return;
      if (!best || g.time > best.time) best = g;
    });
    return best;
  }

  /** 我在这条便签上回应过没有 —— 查的是 gratEchoRow 用的同一个 key。 */
  function _iEchoed(note) {
    var me = _todayCtx().me;
    var list = (typeof gratEchoList === 'function') ? gratEchoList() : [];
    return list.some(function (x) {
      return x && String(x.noteFrom) === String(note.from) &&
        x.noteTime === note.time && String(x.from) === me;
    });
  }

  function _renderTogetherNew() {
    var host = document.getElementById('together-new');
    if (!host) return;
    var ctx = _todayCtx();
    var S = ctx.S;
    var since = _initTodayWindow();
    var items = _collectTodayEvents(since);
    if (!items.length) { host.hidden = true; host.innerHTML = ''; return; }
    host.hidden = false;

    var target = (typeof gratEchoRow === 'function') ? _replyTarget(ctx.partner, since) : null;
    var echoed = target ? _iEchoed(target) : false;

    /* 回应块是 <div class="tnew-row"> 的兄弟节点，不是子节点：行本身带
       onclick="switchToTab()"，按钮嵌进去的话点击会冒泡到行上，刚点出来的
       反馈会被跳转 + 重渲染吃掉。 */
    function replyBlock() {
      return (echoed ? '' : '<div class="tnew-ask">' +
          esc(ctx.partner === 'barry' ? S.askM : S.askF) + ' \u{2193}</div>') +
        '<div class="tnew-react">' + gratEchoRow(target) + '</div>';
    }

    var placed = false;
    /* 列表按时间倒序，只展示三条。对方最新的那条便签可能被更新的 echo /
       一问 / 日记挤出这三条之外 —— 那种情况下回应块接在最后一行后面，
       因为「可以回应」这件事不该因为多了三条别的动态就消失。 */
    var rows = items.slice(0, 3).map(function (it) {
      var row = '<div class="tnew-row" onclick="switchToTab(\'' + it.tab + '\')">' +
        '<span class="tnew-e">' + it.e + '</span>' +
        '<span class="tnew-x">' + esc(it.x ? String(it.x).slice(0, 90) : (S[it.l] || '')) + '</span>' +
        '<span class="tnew-t">' + esc(_relTime(it.t, S)) + '</span>' +
        '</div>';
      /* 💌 只有感恩便签在用，所以「这一行就是那条便签」可以只看 emoji + 时间。 */
      if (!target || placed || it.e !== '\u{1F48C}' || it.t !== target.time) return row;
      placed = true;
      return row + replyBlock();
    }).join('');

    if (target && !placed) rows += replyBlock();

    host.innerHTML = '<div class="tnew-head">' + esc(ctx.partner === 'barry' ? S.m : S.f) + '</div>' + rows;
  }
  window.renderTogetherNew = _renderTogetherNew;

  var _togetherBuilt = false;

  /* Together 第一屏：§8 要求 Barry 一进来就看到「有一件事是他可以为她做的」，
     所以「对方的新动态」和「今天的问题 + 回答框」在最前面，六张静态卡片跟在
     后面（它们的 markup / id / 渲染器 / 存储键一律没动）。 */
  function renderTogether() {
    var host = document.getElementById('together-body');
    if (!host) return;
    if (!_togetherBuilt) {
      host.innerHTML =
        '<div class="dash-couple-head" id="together-head">' + _coupleHeadHtml() +
          '<div class="dch-greet">' + esc(v2('togetherLead')) + '</div></div>' +
        '<div class="card dash-card" id="together-new" hidden></div>' +
        '<div class="card" id="together-daily">' +
          '<div class="dhc-head"><span class="dhc-title">' + esc(v2('qOfDay')) + '</span>' +
          '<button class="dhc-more dhc-more-ico" onclick="renderDailyQ()" aria-label="' + esc(dl('refreshQ')) + '">' + _refreshIcon() + '</button></div>' +
          '<div id="togetherDailyQ"></div>' +
        '</div>';
      _togetherBuilt = true;
    }
    _renderDailyQ();
    _renderTogetherNew();
    ['renderHug', 'renderGratitude', 'renderSong', 'renderCheckin', 'renderKnowMe', 'renderRelTips'].forEach(function (fn) {
      if (typeof window[fn] === 'function') { try { window[fn](); } catch (e) {} }
    });
  }
  window.renderTogether = renderTogether;

  /* bootApp() is invoked from app.js's own tail, while the parser is still
     inside app.js — it aborts a line before its initDashboard() call, on
     loadSettingsUI() from js/module-settings.js, which is parsed even later. So
     on a fresh load the dashboard is never built and the homepage keeps
     index.html's static markup. Build it once every script has run instead.
     Idempotent via this module's own _initialized flag. Do NOT go back to
     probing for #dash-today: the V2 homepage in index.html now ships a static
     #dash-today (plus #dash-couple-head / #dash-stats-cards / #dash-links-card)
     as first-paint placeholder content, so that probe now matches before
     initDashboard() has ever run and boot exits without building anything —
     leaving the raw static markup on screen and, because the boot sync pull
     hangs off this same path, no Worker pull either. _initialized is set by
     _initSkeleton() and is the direct signal the probe was standing in for.
     Skipped while the login screen is shown, so the since-last-visit window is
     not started by a logged-out visitor. */
  function _bootDashboard() {
    if (_initialized) return;
    var overlay = document.getElementById('loginOverlay');
    if (overlay && !overlay.classList.contains('hidden')) return;
    initDashboard();
  }
  /* Every script in index.html is deferred, so when this file executes the
     document is already 'interactive' but DOMContentLoaded has not fired yet —
     and the fix-*.js decorators are installed by scripts that run after this
     one. Waiting for DOMContentLoaded (which fires once the whole deferred batch
     is done) is what keeps them in the chain. */
  if (document.readyState === 'complete') {
    setTimeout(_bootDashboard, 0);
  } else {
    document.addEventListener('DOMContentLoaded', _bootDashboard, { once: true });
  }
})();
