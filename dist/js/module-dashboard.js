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
    if (typeof getGitHubToken === 'function' && getGitHubToken()) {
      if (typeof pullAllSharedData === 'function') pullAllSharedData().then(function () { renderDashboard(); });
    } else { renderDashboard(); }
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
      '<div class="dash-welcome" id="dash-welcome">' + dl('welcomeBack') + '<strong></strong></div>' +
      '<div class="card dash-card" style="text-align:center"><div id="dash-stats-cards" style="display:flex;justify-content:space-around;align-items:center;flex-wrap:wrap;gap:8px"></div></div>' +
      '<div class="card dash-card" id="dash-connect" style="border-left:3px solid var(--teal)"><h4>' + dl('connectQ') + '</h4><div style="font-size:.82rem;color:var(--text);line-height:1.6;font-style:italic;margin-bottom:8px" id="dailyConnectQ"></div><button class="dash-link-btn" onclick="document.getElementById(\'dailyConnectQ\').textContent=getDailyQuestion();" style="font-size:.62rem;padding:4px 12px">' + dl('refreshQ') + '</button></div>' +
      '<div class="card dash-card"><div class="dash-links"><button class="dash-link-btn" onclick="switchToTab(\'diary\')">' + dl('goDiary') + '</button><button class="dash-link-btn" onclick="goToday();switchToTab(\'stats\')">' + dl('goCalendar') + '</button></div></div>';
    _initialized = true;
  }

  function renderDashboard() {
    var panel = document.getElementById('panel-dashboard');
    if (!panel) return;
    if (!_initialized) _initSkeleton(panel);
    _updateWelcome(panel);
    _updateStatsCards(panel);
    _updateConnectCard(panel);
    if (typeof animateDashboardCards === 'function') animateDashboardCards();
  }
  window.renderDashboard = renderDashboard;
})();
