"use strict";

(function () {
  console.log('[module-dashboard] 已加载');

  var DASH_I18N = {
    barry: {
      dashTitle: '\u{1F3E0} \u{4E3B}\u{9875}',
      welcomeBack: '\u{65E9}\u{4E0A}\u{597D}\u{FF0C}',
      todayCulture: '\u{4ECA}\u{65E5}\u{6587}\u{5316}\u{77E5}\u{8BC6}',
      goDiary: '\u{1F4DD} \u{5199}\u{65E5}\u{8BB0}',
      goCalendar: '\u{1F4C5} \u{67E5}\u{770B}\u{65E5}\u{5386}',
      connectQ: '\u{1F4AD} \u{4ECA}\u{5929}\u{7684}\u{5BF9}\u{8BDD}',
      refreshQ: '\u{1F504} \u{6362}\u{4E00}\u{4E2A}\u{95EE}\u{9898}',
      todayPhase: '\u{4ECA}\u{65E5}\u{9636}\u{6BB5}',
      todayMoodDash: '\u{4ECA}\u{65E5}\u{5FC3}\u{60C5}',
      todayStreak: '\u{8FDE}\u{7EED}\u{6253}\u{5361}',
      todayCycles: '\u{5468}\u{671F}\u{603B}\u{6570}',
      avgAbbr: '\u{5E73}\u{5747}'
    },
    andjela: {
      dashTitle: '\u{1F3E0} Po\u{010D}etna',
      welcomeBack: 'Dobrodo\u{0161}la,',
      todayCulture: 'Dana\u{0161}nje kulturno znanje',
      goDiary: '\u{1F4DD} Dnevnik',
      goCalendar: '\u{1F4C5} Kalendar',
      connectQ: '\u{1F4AD} Pitanje dana',
      refreshQ: '\u{1F504} Drugo pitanje',
      todayPhase: 'Trenutna faza',
      todayMoodDash: 'Raspolo\u{017E}enje',
      todayStreak: 'Niz dana',
      todayCycles: 'Ukupno ciklusa',
      avgAbbr: 'Prosek'
    }
  };

  var DAILY_QS = {
    sr: [
      'Koja je tvoja najlep\u{0161}a uspomena iz detinjstva?',
      '\u{0160}ta bi voleo/la da nau\u{010D}i\u{0161} o Kini?',
      'Kad smo najbli\u{017E}e iako smo 7.000 km daleko?',
      '\u{0160}ta ti najvi\u{0161}e nedostaje kad nisam tu?',
      'Kako zami\u{0161}lja\u{0161} na\u{0161} prvi zagrljaj?',
      'Koji srpski obi\u{010D}aj želi\u{0161} da poka\u{017E}e\u{0161} Baraju?',
      '\u{0160}ta ćemo raditi kad se prvi put sretnemo?'
    ],
    'zh-CN': [
      '\u{4F60}\u{7AE5}\u{5E74}\u{6700}\u{7F8E}\u{597D}\u{7684}\u{56DE}\u{5FC6}\u{662F}\u{4EC0}\u{4E48}\u{FF1F}',
      '\u{4F60}\u{60F3}\u{4E86}\u{89E3}\u{5173}\u{4E8E}\u{585E}\u{5C14}\u{7EF4}\u{4E9A}\u{7684}\u{4EC0}\u{4E48}\u{FF1F}',
      '\u{4EC0}\u{4E48}\u{65F6}\u{5019}\u{4F60}\u{89C9}\u{5F97}\u{6211}\u{4EEC}\u{6700}\u{8FD1}\u{FF1F}',
      '\u{5982}\u{679C}\u{80FD}\u{77AC}\u{95F4}\u{98DE}\u{5230}Kikinda\u{FF0C}\u{4F60}\u{6700}\u{60F3}\u{548C}\u{5979}\u{505A}\u{4EC0}\u{4E48}\u{FF1F}',
      '\u{4F60}\u{89C9}\u{5F97}\u{6211}\u{4EEC}\u{7684}\u{7B2C}\u{4E00}\u{6B21}\u{62E5}\u{62B1}\u{4F1A}\u{662F}\u{4EC0}\u{4E48}\u{6837}\u{7684}\u{FF1F}',
      '\u{4E2D}\u{56FD}\u{6709}\u{4EC0}\u{4E48}\u{4F60}\u{60F3}\u{5E26}An\u{0111}ela\u{53BB}\u{770B}\u{7684}\u{FF1F}',
      '\u{60F3}\u{5411}An\u{0111}ela\u{5B66}\u{4EC0}\u{4E48}\u{585E}\u{5C14}\u{7EF4}\u{4E9A}\u{8BED}\u{FF1F}'
    ],
    en: [
      'What is your most beautiful childhood memory?',
      'What do you want to learn about Serbia/China?',
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
      grat: 'zahvalnost', song: 'pesma', knowme: 'odgovor'
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
      grat: 'a thank-you', song: 'a song', knowme: 'an answer'
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
      grat: '\u{611F}\u{6069}', song: '\u{70B9}\u{6B4C}', knowme: '\u{56DE}\u{7B54}'
    }
  };

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

    var grat = _readJSON('shared-gratitude', []);
    if (Array.isArray(grat)) grat.forEach(function (g) {
      if (g && g.from === partner) add(g.time, '\u{1F48C}', 'grat', g.text, 'stats');
    });

    var song = _readJSON('shared-song-' + partner, null);
    if (song && song.time) add(song.time, '\u{1F3B6}', 'song', song.title, 'stats');

    var km = _readJSON('shared-knowme', {});
    Object.keys(km || {}).forEach(function (d) {
      var e = km[d] && km[d][partner];
      if (e && e.time) add(e.time, '\u{1F4AD}', 'knowme', e.answer, 'stats');
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
    if (hug && hug.from === partner) add(hug.time, '\u{1F917}', 'hug', '', 'stats');

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
    var profile = (lang || '').indexOf('zh') === 0 ? 'barry' : 'andjela';
    var p = DASH_I18N[profile] || DASH_I18N.andjela;
    return p[key] || DASH_I18N.andjela[key] || key;
  }

  function getDailyQuestion() {
    var qs = DAILY_QS[lang] || DAILY_QS.sr;
    return qs[new Date().getDate() % qs.length];
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
    if (typeof getGitHubToken === 'function' && getGitHubToken()) {
      if (typeof pullAllSharedData === 'function') pullAllSharedData().then(_render);
    } else { _render(); }
  }
  window.initDashboard = initDashboard;

  function _updateWelcome(panel) {
    var myName = activeProfile === 'andjela' ? '\u{1F338} An\u{0111}ela' : '\u{1F466} Barry';
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
    el.innerHTML = _greet + ' ' + _icon + '\u{FF0C}' + '<strong>' + myName + '</strong> \u{00B7} ' + _days + ' ' + (_l === 'sr' ? 'dana' : _l === 'en' ? 'days' : '\u{5929}') + ' \u{2764}';
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

  function _initSkeleton(panel) {
    panel.innerHTML =
      '<div id="dash-today"></div>' +
      '<div class="dash-welcome" id="dash-welcome">' + dl('welcomeBack') + '<strong></strong></div>' +
      '<div class="card dash-card" style="text-align:center"><div id="dash-stats-cards" style="display:flex;justify-content:space-around;align-items:center;flex-wrap:wrap;gap:8px"></div></div>' +
      '<div class="card dash-card" id="dash-connect" style="border-left:3px solid var(--teal)"><h4>' + dl('connectQ') + '</h4><div style="font-size:.82rem;color:var(--text);line-height:1.6;font-style:italic;margin-bottom:8px" id="dailyConnectQ"></div><button class="dash-link-btn" onclick="document.getElementById(\'dailyConnectQ\').textContent=getDailyQuestion();" style="font-size:.62rem;padding:4px 12px">' + dl('refreshQ') + '</button></div>' +
      '<div class="card dash-card"><div class="dash-links"><button class="dash-link-btn" onclick="switchToTab(\'diary\')">' + dl('goDiary') + '</button><button class="dash-link-btn" onclick="goToday();switchToTab(\'stats\')">' + dl('goCalendar') + '</button></div></div>';
    _initialized = true;
  }

  /* `animate === false` is passed by the sync pull, so a 60s background refresh
     does not replay the entrance animation the user already watched. */
  function renderDashboard(animate) {
    var panel = document.getElementById('panel-dashboard');
    if (!panel) return;
    if (!_initialized) _initSkeleton(panel);
    _ensureTodayHost(panel);
    _updateWelcome(panel);
    _renderTodayCard();
    _updateStatsCards(panel);
    _updateConnectCard(panel);
    if (animate !== false && typeof animateDashboardCards === 'function') animateDashboardCards();
  }
  window.renderDashboard = renderDashboard;

  /* bootApp() is invoked from app.js's own tail, while the parser is still
     inside app.js — it aborts a line before its initDashboard() call, on
     loadSettingsUI() from js/module-settings.js, which is parsed even later. So
     on a fresh load the dashboard is never built and the homepage keeps
     index.html's static markup. Build it once every script has run instead.
     Idempotent: renderDashboard always creates #dash-today, so an existing one
     means the dashboard is already up. Skipped while the login screen is shown,
     so the since-last-visit window is not started by a logged-out visitor. */
  function _bootDashboard() {
    if (document.getElementById('dash-today')) return;
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
