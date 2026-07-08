'use strict';

if (typeof window.HOLIDAYS === 'undefined') window.HOLIDAYS = [];
if (typeof window.solarTermsCache === 'undefined') window.solarTermsCache = [];
if (typeof window.CalState === 'undefined') window.CalState = { year: 2026, month: 6, view: 'month', weekOffset: 0 };

/* eslint-disable no-unused-vars */

/* ================================================================
   NOTE: Global utility functions have been extracted to js/ui-core.js:
   safeParse(), $(), clearElCache(), debounce(), esc(),
   closeModal(), toggleKnowledge(), toast()
   Loaded via <script src="js/ui-core.js"> in index.html.
   ================================================================ */

/* ================================================================
   VERSION
   ================================================================ */
/* ================================================================
   SHARED CONSTANTS
   ================================================================ */
const MOOD_EMOJIS = ['😊', '🥰', '😤', '😴', '😢', '🤩', '😰', '😐'];
const MOOD_KEYS = ['happy', 'loved', 'frustrated', 'tired', 'sad', 'excited', 'anxious', 'meh'];
// Pre-computed O(1) lookup maps (replaces O(n) indexOf calls)
const MOOD_EMOJI_MAP = Object.fromEntries(
  MOOD_KEYS.map(function (k, i) {
    return [k, MOOD_EMOJIS[i]];
  })
);
let MOOD_NAME_MAP = {}; // populated lazily after i18n loads

/* ================================================================
   EXTRACTED to js/ui-core.js
   safeParse(), $(), clearElCache(), debounce()
   ================================================================ */
// On DOM mutations that add/remove elements, clear cache

/* ================================================================
   DEBUG FLAG — set to true to enable console.debug output
   ================================================================ */
const DEBUG = false;
function _dbg() {
  if (DEBUG) console.warn.apply(console, arguments);
}

/* ================================================================
   GLOBAL ERROR BOUNDARY — silent in production
   ================================================================ */
window.addEventListener('error', function (e) {
  if (DEBUG) console.warn('[caught]', e.message);
});
window.addEventListener('unhandledrejection', function (e) {
  if (DEBUG) console.warn('[unhandled]', e.reason);
});

/* ================================================================
   PROFILE SYSTEM
   ================================================================ */
let activeProfile = localStorage.getItem('cycle-active-profile') || 'andjela';
function profileKey(base) {
  return base + '-' + activeProfile;
}
function switchProfile(p) {
  if (p === activeProfile) return;
  // Animate profile pill
  const pill = document.getElementById('profilePill');
  if (pill) {
    pill.classList.add('switching');
    setTimeout(function () {
      pill.classList.remove('switching');
    }, 400);
  }
  activeProfile = p;
  localStorage.setItem('cycle-active-profile', p);
  state = loadState();
  window.state = state;
  // Load per-profile language & theme settings for this profile
  loadPerProfileSettings();
  setLang(lang);
  applyTheme(theme);
  console.log('[switchProfile] 已切换到 ' + p + '，语言=' + lang + '，主题=' + theme);
  // Immediately sync calendar from shared cycle data for both profiles
  try {
    const sd = JSON.parse(localStorage.getItem('shared-cycle-data') || 'null');
    if (sd && sd.records) {
      state.records = sd.records.map(function (r) {
        return new Date(r);
      });
      state.periodEnds = sd.periodEnds || {};
      state.symptoms = sd.symptoms || {};
      state.settings = sd.settings || { cycleLength: 28, periodLength: 7 };
    }
  } catch (e) {
    console.warn('[profile] Failed to parse shared-cycle-data:', e.message);
  }
  lastCycleCount = predict().cycles.length;

  // Pull latest shared data from GitHub when switching profiles
  if (getGitHubToken()) {
    pullAllSharedData().then(function () {
      if (p === 'barry') {
        renderCalendar();
        renderBarrySymptomView();
        renderTips();
      }
      renderHug();
      renderGratitude();
      renderSong();
      renderCheckin();
      renderKnowMe();
      renderSharedDiary();
      renderDateStrip();
      updateSyncStatusBadge();
    });
  }

  updateProfileUI();
  renderAll();
  loadSettingsUI();
  if (p === 'andjela' && !sessionStorage.getItem('_greetingShown')) {
    showGreeting();
  }
  toast((p === 'andjela' ? '🌸' : '👦') + ' ' + t('profileSwitch'));
}
function toggleProfile() {
  switchProfile(activeProfile === 'andjela' ? 'barry' : 'andjela');
}
function updateProfileUI() {
  const pill = document.getElementById('profilePill');
  const avatar = document.getElementById('pfAvatar');
  const name = document.getElementById('pfName');
  if (activeProfile === 'andjela') {
    avatar.textContent = '🌸';
    name.textContent = t('profileName');
    pill.classList.add('active-profile');
  } else {
    avatar.textContent = '👦';
    name.textContent = t('profileName2');
    pill.classList.remove('active-profile');
  }
  // Show/hide cycle-related cards for Barry
  const isAndjela = activeProfile === 'andjela';
  const pc = document.getElementById('progressSection');
  const rc = document.getElementById('reminderBanner');
  const fab = document.getElementById('fabBtn');
  const tea = document.getElementById('teaCard');
  if (pc) pc.style.display = isAndjela ? '' : 'none';
  if (rc && !isAndjela) rc.style.display = 'none';
  if (fab) fab.style.display = isAndjela ? '' : 'none';
  if (tea) tea.style.display = isAndjela ? '' : 'none';
}

/* ================================================================
   STATE (modified for profiles)
   ================================================================ */
const STORAGE_KEY_BASE = 'cycle-data-v6';
function loadState() {
  const key = profileKey(STORAGE_KEY_BASE);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const d = JSON.parse(raw);
      return {
        records: (d.records || []).map((r) => new Date(r)),
        symptoms: d.symptoms || {},
        moods: d.moods || {},
        diaries: d.diaries || {},
        periodEnds: d.periodEnds || {},
        settings: { cycleLength: 28, periodLength: 7, manualOverride: false, ...d.settings },
        _migrated: true,
      };
    }
  } catch (e) {
    if (DEBUG) console.warn('[state] Failed to load state:', e.message);
  }
  // Try old key
  try {
    const old = localStorage.getItem('cycle-data-v5');
    if (old && activeProfile === 'andjela') {
      const d = JSON.parse(old);
      return {
        records: (d.records || []).map((r) => new Date(r)),
        symptoms: d.symptoms || {},
        moods: {},
        diaries: {},
        settings: { cycleLength: 28, periodLength: 7, manualOverride: false, ...d.settings },
        _migrated: true,
      };
    }
  } catch (e) {
    if (DEBUG) console.warn('[state] Failed to migrate old state:', e.message);
  }
  return {
    records: activeProfile === 'andjela' ? [new Date(2026, 4, 28)] : [],
    periodEnds: {},
    symptoms: {},
    moods: {},
    diaries: {},
    settings: { cycleLength: 28, periodLength: 7, manualOverride: false },
    _migrated: true,
  };
}
// Debounced saveState — prevents excessive localStorage writes during rapid clicks
let _saveTimer = null,
  _pushTimer = null;
function saveState() {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(function () {
    localStorage.setItem(
      profileKey(STORAGE_KEY_BASE),
      JSON.stringify({
        records: state.records.map(fmtDate),
        periodEnds: state.periodEnds || {},
        symptoms: state.symptoms,
        moods: state.moods,
        diaries: state.diaries,
        settings: state.settings,
        _migrated: true,
      })
    );
    // Sync shared cycle data for bidirectional calendar
    const pd = JSON.parse(localStorage.getItem(profileKey(STORAGE_KEY_BASE)) || 'null');
    if (pd && pd.records && pd.records.length > 0) {
      localStorage.setItem('shared-cycle-data', JSON.stringify(pd));
    }
    clearTimeout(_pushTimer);
    _pushTimer = setTimeout(function () {
      pushAllSharedData();
    }, 1500);
  }, 200);
}
let state = loadState();

/* ================================================================
   SOLAR TERMS CACHE — fetched from calendar-data.json
   ================================================================ */
let solarTermsCache = [];

/* Mood, love note, forecast, garden moved to js/render-mood.js */
function renderGarden() {
  const plantEl = document.getElementById('gardenPlant');
  if (plantEl) {
    plantEl.style.transform = '';
    plantEl.style.transition = 'all .5s cubic-bezier(.22, 1, .36, 1)';
  }
  document.getElementById('garden-title').textContent = t('gardenTitle');
  const streak = calculateStreak();
  let p, msg, hint;
  if (streak === 0) {
    p = '🌰';
    msg = t('gardenState0');
    hint = '';
  } else if (streak === 1) {
    p = '🌱';
    msg = t('gardenState1');
    hint = '';
  } else if (streak <= 3) {
    p = '🌿';
    msg = t('gardenState3');
    hint = '';
  } else if (streak <= 7) {
    p = '🌷';
    msg = t('gardenState7');
    hint = '';
  } else {
    p = '🌸';
    msg = t('gardenStateBloom');
    hint = '';
  }
  if (activeProfile === 'andjela' && streak > 0) {
    const phase = getPhase(today(), predict());
    if (phase && phase.startsWith('period')) p = '🌹';
    else if (phase === 'ovulation') p = '🌻';
    else if (phase === 'luteal') p = '🌷';
  }
  document.getElementById('gardenPlant').textContent = p;
  document.getElementById('gardenMsg').textContent = msg;
  document.getElementById('gardenHint').textContent = hint;
}

/* ================================================================
   SHARED DIARY — extracted to js/render-diary.js
   Data access layer (constants + localStorage/GitHub helpers)
   kept here because sync.js and other modules depend on them.
   ================================================================ */
// esc() extracted to js/ui-core.js
// ===== SHARED DIARY HELPERS =====
// These functions are used as globals by js/render-diary.js, js/sync.js, etc.

const SD_KEY = 'shared-diary';
const DATE_STRIP_DAYS = 14; // used by render-diary.js
let sharedDiaryViewDate = new Date(); // used by render-diary.js

function getGitHubToken() {
  return sessionStorage.getItem('gh-token') || '';
}

let _sdCache = null;
function loadSharedDiaryData() {
  if (_sdCache) return _sdCache;
  try {
    _sdCache = JSON.parse(localStorage.getItem(SD_KEY)) || {};
    return _sdCache;
  } catch (e) {
    return {};
  }
}
function saveSharedDiaryData(data) {
  _sdCache = data;
  localStorage.setItem(SD_KEY, JSON.stringify(data));
}
function invalidateSDCache() {
  _sdCache = null;
} // Call when pull from GitHub returns new data

// NOTE: renderDateStrip(), selectDateStrip(), scrollDateStrip() extracted to js/render-diary.js

// Pull partner entries from unified shared-state.json (not old shared-diary.json)
async function pullPartnerEntry(dateKey) {
  if (!getGitHubToken()) return;
  // Use unified pullAllSharedData — applies shared-state.json to localStorage
  // then re-render; avoids dual-format sync drift
  await pullAllSharedData();
  const localData = loadSharedDiaryData();
  const partnerProfile = activeProfile === 'andjela' ? 'barry' : 'andjela';
  // If partner hasn't written for this date, show hint
  const entry = localData[dateKey] && localData[dateKey][partnerProfile];
  return entry || null;
}

// exportSharedDiary(), showImportModal(), importSharedDiary(), doImport() extracted to js/render-diary.js

// renderSharedDiary(), canViewPartnerDiaryEntry(), renderPartnerContent(),
// renderSharedDiaryHistory(), _collectDiaryItems(), _buildTimelineEntry(),
// jumpToDiaryDate() extracted to js/render-diary.js

// ==============================
// TRANSLATION — extracted to js/translate.js
// ==============================

// Character counter listeners + renderDiaryLabels() extracted to js/render-diary.js

// Diary v9 module (renderDiaryPanel, renderMailbox, toggleDiaryCalendar,
// shiftDiaryCalMonth, goDiaryCalToday, saveDiaryEntry, translatePartnerLetter,
// scrollDiaryStrip, letterTextFromEntry, LETTER_MOODS, initSharedDiaryTab,
// _diaryViewDate, _diaryMood, etc.) extracted to js/render-diary.js

/* ================================================================
   MODIFIED: Load lang/theme per-profile
   ================================================================ */
function loadPerProfileSettings() {
  // Default languages: Anđela → Serbian, Barry → Chinese
  const defaultLang = activeProfile === 'barry' ? 'zh-CN' : 'sr';
  let savedLang = localStorage.getItem(profileKey('cycle-lang'));
  // Cleanse: if saved lang is the WRONG profile's default, reset
  if (activeProfile === 'barry' && savedLang === 'sr') savedLang = null;
  if (activeProfile === 'andjela' && savedLang === 'zh-CN') savedLang = null;
  const validLangs = { sr: 1, 'zh-CN': 1, en: 1 };
  window.lang = savedLang && validLangs[savedLang] ? savedLang : defaultLang;
  // ALWAYS save the corrected lang
  if (!savedLang) localStorage.setItem(profileKey('cycle-lang'), lang);
  theme = localStorage.getItem(profileKey('cycle-theme')) || 'light';
  annDateMet = localStorage.getItem('cycle-ann-met') || '2026-03-19';
  annDateLove = localStorage.getItem('cycle-ann-love') || '2026-05-07';
}
function setLang(l) {
  window.lang = l;
  document.documentElement.setAttribute('lang', l);
  localStorage.setItem(profileKey('cycle-lang'), l);
  localStorage.setItem('cycle-lang', l);
}
// applyTheme(), switchTheme() — extracted to js/theme.js

/* ================================================================
   I18N HELPERS
   ================================================================ */
// i18n helper L() defined below (line ~1647) — handles both object and string args
// langName() defined in js/chinese-learn.js — 3-level language fallback for object lookups

/* ================================================================
   MODIFIED: init
   ================================================================ */
// loadPerProfileSettings() is called in the INIT section below
// window.lang is set in i18n.js (loaded before app.js)
window.lang = localStorage.getItem('cycle-lang') || 'sr';
let theme = localStorage.getItem('cycle-theme') || 'light';
let annDateMet = localStorage.getItem('cycle-ann-met') || '2026-03-19';
let annDateLove = localStorage.getItem('cycle-ann-love') || '2026-05-07';

// exportAllData(), importAllData() — defined in js/render-settings.js

// getFestivalTheme(), applyFestivalTheme(), applySeasonalDecor() — extracted to js/theme.js
function setupOfflineDetection() {
  const banner = document.getElementById('offlineBanner');
  if (!banner) return;
  function update() {
    banner.classList.toggle('show', !navigator.onLine);
    document.getElementById('offline-text').textContent = t('offlineText');
  }
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}
let _deferredPWA = null; // store beforeinstallprompt for manual trigger
function setupPWABanner() {
  const banner = document.getElementById('pwaBanner');
  if (!banner) return;
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  if (!/Mobi|Android/i.test(navigator.userAgent)) return;
  if (localStorage.getItem('pwa-banner-dismissed')) return; // Use native install prompt if available
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    _deferredPWA = e;
    banner.classList.add('show');
    banner.onclick = function () {
      _deferredPWA.prompt();
      _deferredPWA.userChoice.then(function (r) {
        if (r.outcome === 'accepted') {
          banner.classList.remove('show');
          localStorage.setItem('pwa-installed', '1');
        }
      });
    };
  });
  if (_deferredPWA) return; // fallback for browsers without beforeinstallprompt
  banner.classList.add('show');
  banner.onclick = function () {
    banner.classList.remove('show');
    localStorage.setItem('pwa-banner-dismissed', '1');
  };
  document.getElementById('pwa-text').textContent = t('pwaInstallText');
}

// ===== DASHBOARD =====
// Daily conversation starters — rotating questions to deepen understanding
const CONVERSATION_QUESTIONS = {
  sr: [
    'Koja je tvoja najlepša uspomena iz detinjstva?',
    'Šta te je danas nasmejalo?',
    'Kad si se poslednji put osećao/la najviše voljeno?',
    'Koji je tvoj omiljeni miris i na šta te podseća?',
    'Šta bi voleo/la da naučiš zajedno?',
    'Koja pesma te uvek oraspoloži?',
    'Kako voliš da ti neko pokaže da mu je stalo?',
    'Koje mesto bi voleo/la da posetimo zajedno?',
    'Šta najviše ceniš kod mene — iskreno?',
    'Koji je bio najbolji dan u našoj vezi do sada?',
    'Da možeš da promeniš jednu st let na svetu, šta bi to bilo?',
    'Kako zamišljaš naš savršen dan za 10 godina?',
    'Šta te čini ponosnim/om na sebe?',
    'Koji je tvoj omiljeni način da se opustiš?',
    'Kad si poslednji put probao/la nešto novo — i šta je to bilo?',
  ],
  'zh-CN': [
    '你童年最美好的回忆是什么？',
    '今天什么让你笑了？',
    '你最近一次感到被深爱是什么时候？',
    '你最喜欢的气味是什么？它让你想起什么？',
    '你想一起学什么新东西？',
    '哪首歌总是能让你心情变好？',
    '你喜欢别人用什么方式表达对你的在乎？',
    '你最想和我一起去哪里旅行？',
    '你最欣赏我哪一点——说真的？',
    '到目前为止，我们关系中最好的一天是哪天？',
    '如果你能改变世界上的一件事，会是什么？',
    '你想象中我们十年后的完美一天是怎样的？',
    '什么让你为自己感到骄傲？',
    '你最喜欢的放松方式是什么？',
    '你最近一次尝试新事物是什么——尝试了什么？',
  ],
  en: [
    'What is your most beautiful childhood memory?',
    'What made you smile today?',
    'When did you last feel most loved?',
    'What is your favorite scent and what does it remind you of?',
    'What would you like to learn together?',
    'Which song always lifts your mood?',
    'How do you like someone to show they care?',
    'Which place would you love to visit together?',
    'What do you appreciate most about me — honestly?',
    'What was the best day in our relationship so far?',
    'If you could change one thing in the world, what would it be?',
    'How do you imagine our perfect day 10 years from now?',
    'What makes you proud of yourself?',
    'What is your favorite way to relax?',
    'When did you last try something new — and what was it?',
  ],
};
var _dataLoadPromise = null;
var _dataLoaded = false;
function loadDataFiles() {
  if (_dataLoadPromise) return _dataLoadPromise;
  _dataLoadPromise = CultureCardsModule.load()
    .then(function (data) {
      CULTURE_KNOWLEDGE = data;
      _cultureCardIdx = CultureCardsModule.getTodaysIndex();
      _dataLoaded = true;
    })
    .catch(function () {
      _dataLoaded = true;
    });
  return _dataLoadPromise;
}

async function bootApp() {
  // CRITICAL: Sync activeProfile — auth.js sets window.activeProfile, not the module-level let.
  // Re-read from the global source of truth to avoid stale profile bug.
  activeProfile = window.activeProfile || localStorage.getItem('cycle-active-profile') || 'andjela';
  window.activeProfile = activeProfile;
  window.bootApp = bootApp; // Export to global scope for auth.js
  // Hide loader IMMEDIATELY
  const loader = document.getElementById('appLoader');
  if (loader) {
    loader.style.display = 'none';
    if (loader.parentNode) loader.parentNode.removeChild(loader);
  }

  // Build mood name lookup map (O(1) — replaces indexOf scans)
  let moodNamesArr = t('moodNames');
  if (moodNamesArr && moodNamesArr.length === MOOD_KEYS.length) {
    MOOD_NAME_MAP = Object.fromEntries(
      MOOD_KEYS.map(function (k, i) {
        return [k, moodNamesArr[i]];
      })
    );
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js?v=7.2.0').catch(function () {});
  }
  loadPerProfileSettings();

  // Load data in background (do NOT await — never block the UI)
  loadDataFiles().catch(function () {
    /* Non-critical, UI works without data files */
  });

  state = loadState();
  lastCycleCount = predict().cycles.length;
  applyTheme(theme);
  setLang(lang);
  applyFestivalTheme();
  applySeasonalDecor();
  setupOfflineDetection();
  setupPWABanner();

  // Render UI immediately with whatever data is available
  updateProfileUI();
  renderAll();
  loadSettingsUI();
  initDashboard();

  // Pull shared data in background (2s timeout, non-blocking)
  if (getGitHubToken()) {
    const ghTimeout = new Promise(function (_, reject) {
      setTimeout(function () {
        reject(new Error('GitHub timeout'));
      }, 2000);
    });
    Promise.race([pullAllSharedData(), ghTimeout])
      .catch(function (e) {})
      .then(function () {
        try {
          const sd = JSON.parse(localStorage.getItem('shared-cycle-data') || 'null');
          if (sd && sd.records) {
            state.records = sd.records.map(function (r) {
              return new Date(r);
            });
            state.periodEnds = sd.periodEnds || {};
            state.symptoms = sd.symptoms || {};
            state.settings = sd.settings || { cycleLength: 28, periodLength: 7 };
          }
        } catch (e) {
          /* non-critical */
        }
        if (activeProfile === 'barry') {
          renderCalendar();
          renderBarrySymptomView();
          renderTips();
        }
        renderHug();
        renderGratitude();
        renderSong();
        renderCheckin();
        renderKnowMe();
        renderSharedDiary();
        renderDateStrip();
        renderDashboard(); // Refresh dashboard with synced data
        updateSyncStatusBadge();
        updateCycleCounter(predict().cycles.length);
      })
      .catch(function (e) {});
  }

  fetchWeather();
  loadCalendarData(function (data) {
    solarTermsCache = (data && data.solarTerms) || [];
    localStorage.setItem('cycle-solarterms', JSON.stringify(solarTermsCache));
    renderCalendar();
  });
  showOnboardingIfNeeded();
  if (activeProfile === 'andjela' && !sessionStorage.getItem('_greetingShown')) showGreeting();
  updateMoonPhase();
  updateAnniversaryCount();
  updateCycleCounter(predict().cycles.length);
  lastCycleCount = predict().cycles.length;
  updateLoveCounter();
  updateProfileUI();
  // Dim symptoms tab for Anđela (click shows toast instead of redirect)
  const symTab = document.getElementById('tab-symptoms');
  if (symTab) {
    symTab.style.opacity = activeProfile === 'barry' ? '' : '0.45';
    symTab.title = activeProfile === 'barry' ? '' : t('profileOnly') || 'Only Barry can view this';
  }
  randomThinkingOfYou();

  // Modal keyboard trap: Escape closes, Tab traps focus
  const modalKeydown = function (e) {
    if (e.key === 'Escape') {
      closeModal();
      return;
    }
    if (e.key === 'Tab') {
      const modal = document.getElementById('modal');
      if (!modal || modal.classList.contains('hidden')) return;
      const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0],
        last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };
  document.addEventListener('keydown', modalKeydown);

  // Restore tab from URL hash on load
  const initTab = location.hash.replace('#', '') || 'dashboard';
  if (document.getElementById('panel-' + initTab)) {
    switchToTab(initTab);
  }

  // Swipe gesture on calendar container (initialized once)
  initCalendarSwipe();
  // Month label click opens year/month picker
  setupMonthPicker();

  // GSAP animations (deep gsap-skills integration)
  initGsapAnimations();
  setTimeout(function () {
    animateLoginEntrance();
  }, 100);
}

// Hash change handler for forward/back navigation
window.addEventListener('hashchange', function () {
  const tab = location.hash.replace('#', '') || 'dashboard';
  if (document.getElementById('panel-' + tab)) switchToTab(tab);
});

// Profile-aware overrides happen in loadPerProfileSettings() below

// i18n map helper: L({sr:'...',en:'...',zh:'...'}) -> value for current lang
function L(sr, en, zh) {
  if (typeof sr === 'object') {
    const m = sr;
    return m[lang] || m[lang.split('-')[0]] || m['sr'] || '';
  }
  if (lang === 'sr' || lang === 'sr-RS') return sr;
  if (lang === 'en') return en;
  return zh || sr;
}

function switchLanguage(l) {
  setLang(l);
  applyAllUI();
  loadSettingsUI();
  document.getElementById('set-language').value = l;
  try {
    if (typeof renderChineseHome === 'function') renderChineseHome();
  } catch (e) {
    /* renderChineseHome may not exist */
  }
  renderLunarInfo();
  renderSeasonalPoemCard();
}

/* ================================================================
   HOLIDAY DATA — China 🇨🇳 + Serbia 🇷🇸
   ================================================================ */
let HOLIDAYS = [];
let HOLIDAY_DAYS = {};

/* ================================================================
   HOLIDAY DATA LOADER — fetches holidays.json asynchronously
   ================================================================ */
function loadHolidays() {
  return fetch('data/holidays.json')
    .then(function (r) {
      if (!r.ok) throw new Error('Failed to load holidays.json');
      return r.json();
    })
    .then(function (data) {
      HOLIDAYS = data.holidays || [];
      HOLIDAY_DAYS = data.holidayDays || {};
      // Re-render calendar with holiday data now available
      renderCalendar();
    })
    .catch(function () {
      /* Non-critical, holidays not available */
    });
}
loadHolidays();

/** Holiday lookup with O(1) cache — replaces O(n) .filter() per cell */
let _holidayCache = null;
function saveAnniversaries() {
  annDateMet = document.getElementById('annDateMet').value;
  annDateLove = document.getElementById('annDateLove').value;
  localStorage.setItem('cycle-ann-met', annDateMet);
  localStorage.setItem('cycle-ann-love', annDateLove);
  updateAnniversaryCount();
  renderCalendar();
}
function updateAnniversaryCount() {
  const el = document.getElementById('ann-count');
  if (!el) return;
  const parts = [];
  if (annDateMet) {
    const d = daysDiff(new Date(annDateMet), today());
    if (d >= 0) parts.push(t('annCountMet').replace('{n}', d));
  }
  if (annDateLove) {
    const d = daysDiff(new Date(annDateLove), today());
    if (d >= 0) parts.push(t('annCountLove').replace('{n}', d));
  }
  el.innerHTML = parts.join('<br>');
}
function isAnniversary(d) {
  let result = 0;
  if (annDateMet) {
    const ad = new Date(annDateMet);
    if (d.getDate() === ad.getDate() && d.getMonth() === ad.getMonth()) result = 1;
  }
  if (annDateLove) {
    const ad = new Date(annDateLove);
    if (d.getDate() === ad.getDate() && d.getMonth() === ad.getMonth()) result = 2;
  }
  return result;
}

/* ================================================================
   DATA — migrated to profile-aware storage above
   ================================================================ */
// Date utilities (fmtDate, sameDay, addDays, daysDiff, d0, today)
// are now defined in js/cycle-core.js — loaded before app.js

/* ================================================================
   TEA ROOM — Serbian × Chinese Herbal Wisdom / Сербија × 中国
   ================================================================ */
const TEA_PAIRS = [
  {
    emoji: '🍵',
    name: { sr: 'Čaj od nane', en: 'Mint Tea', 'zh-CN': '薄荷茶' },
    desc: { sr: 'Osvežava i smiruje želudac — srpski klasik', en: 'Cooling, calms the stomach — Serbian classic', 'zh-CN': '清凉舒胃——塞尔维亚经典' },
    msg: {
      sr: 'U Kini piju čaj od hrizanteme za isto — dva sveta, jedna mudrost 🌸',
      en: 'In China they drink chrysanthemum for the same — two worlds, one wisdom 🌸',
      'zh-CN': '中国人用菊花茶达到同样效果——两个世界，同一种智慧 🌸',
    },
    phase: 'general',
  },
  {
    emoji: '🌼',
    name: { sr: 'Čaj od kamilice', en: 'Chamomile Tea', 'zh-CN': '洋甘菊茶' },
    desc: { sr: 'Za miran san i nežno srce', en: 'For peaceful sleep & a gentle heart', 'zh-CN': '安神助眠，温柔入心' },
    msg: {
      sr: 'U Kini — čaj od jasmina. Cveće leči, svuda na svetu 🌙',
      en: 'In China — jasmine tea. Flowers heal, everywhere on Earth 🌙',
      'zh-CN': '中国有茉莉花茶——花能疗愈，天下皆然 🌙',
    },
    phase: 'luteal',
  },
  {
    emoji: '🫚',
    name: { sr: 'Čaj od đumbira', en: 'Ginger Tea', 'zh-CN': '姜茶' },
    desc: { sr: 'Greje telo i dušu — protiv grčeva', en: 'Warms body & soul — anti-cramp', 'zh-CN': '暖身暖心——缓解痉挛' },
    msg: {
      sr: 'Kineska tradicija: đumbir + crvene urme = 姜枣茶. Isti đumbir, ista ljubav ❤️',
      en: 'Chinese tradition: ginger + red dates = 姜枣茶. Same ginger, same love ❤️',
      'zh-CN': '中国古方：生姜+红枣=姜枣茶。同样的姜，同样的爱 ❤️',
    },
    phase: 'period',
  },
  {
    emoji: '🌿',
    name: { sr: 'Čaj od žalfije', en: 'Sage Tea', 'zh-CN': '鼠尾草茶' },
    desc: { sr: 'Protiv upala, za žensko zdravlje', en: "Anti-inflammatory, for women's health", 'zh-CN': '消炎，关爱女性健康' },
    msg: {
      sr: 'U tradicionalnoj kineskoj medicini — 丹参 (kadulja) hrani krv. Biljke ne znaju granice 🌿',
      en: 'In TCM — 丹参 (red sage) nourishes blood. Herbs know no borders 🌿',
      'zh-CN': '中医里的丹参养血活血——草药无国界 🌿',
    },
    phase: 'follicular',
  },
  {
    emoji: '🫐',
    name: { sr: 'Čaj od šipurka', en: 'Rosehip Tea', 'zh-CN': '玫瑰果茶' },
    desc: { sr: 'Bogat vitaminom C — srpska tradicija', en: 'Rich in vitamin C — Serbian tradition', 'zh-CN': '富含维C——塞尔维亚传统' },
    msg: {
      sr: 'U Kini — čaj od goji bobica (枸杞). Crveno voće = snaga u obe kulture 🔴',
      en: 'In China — goji berry tea (枸杞). Red fruit = strength in both cultures 🔴',
      'zh-CN': '中国有枸杞茶——红色果实=两种文化中的力量 🔴',
    },
    phase: 'general',
  },
  {
    emoji: '🍂',
    name: { sr: 'Čaj od lipe', en: 'Linden Tea', 'zh-CN': '椴花茶' },
    desc: { sr: 'Protiv prehlade, za tople noći', en: 'Against colds, for warm nights', 'zh-CN': '驱寒保暖，温暖夜晚' },
    msg: {
      sr: 'Lipa = sveto drvo Slovena. U Kini — 桂花茶 (osmanthus). Drveće spaja narode 🌳',
      en: 'Linden = sacred Slavic tree. In China — osmanthus tea. Trees unite peoples 🌳',
      'zh-CN': '椴树=斯拉夫人的圣树。中国有桂花——树连接着民族 🌳',
    },
    phase: 'general',
  },
];
function renderTea() {
  const teaName = document.getElementById('tea-name');
  const teaDesc = document.getElementById('tea-desc');
  const teaMsg = document.getElementById('tea-msg');
  const teaIcon = document.getElementById('tea-icon');
  const teaTitle = document.getElementById('tea-title');
  if (!teaName) return;
  let phase = 'general';
  if (activeProfile === 'andjela') {
    const pred = predict();
    const ph = getPhase(today(), pred);
    if (ph === 'period-on' || ph === 'period-mid') phase = 'period';
    else if (ph === 'ovulation' || ph === 'fertile') phase = 'ovulation';
    else if (ph === 'follicular') phase = 'follicular';
    else if (ph === 'luteal') phase = 'luteal';
  }
  let candidates = TEA_PAIRS.filter(function (t) {
    return t.phase === phase;
  });
  if (candidates.length === 0) {
    candidates = TEA_PAIRS.filter(function (t) {
      return t.phase === 'general';
    });
  }
  const tea = candidates[Math.floor(Math.random() * candidates.length)];
  teaIcon.textContent = tea.emoji;
  teaName.textContent = tea.name[lang] || tea.name['sr'];
  teaDesc.textContent = tea.desc[lang] || tea.desc['sr'];
  teaMsg.textContent = tea.msg[lang] || tea.msg['sr'];
  teaTitle.textContent = t('teaTitle');
}

/* ================================================================
   CALENDAR DATA LOADER — rich stories + solar terms
   ================================================================ */
let calendarExtraData = null;
function randomThinkingOfYou() {
  if (activeProfile !== 'andjela') return;
  if (Math.random() > 0.18) return; // 18% chance
  const msgs =
    lang === 'sr'
      ? [
          'Upravo sam pomislio na tebe ♥',
          'Nadam se da se osećaš dobro danas ✨',
          'Tvoj osmeh mi je najdraža st let 🌸',
          'Mislim na tebe... uvek 💫',
          'Barry je upravo pomislio na tebe 💝',
        ]
      : lang === 'en'
        ? [
            'Just thought of you ♥',
            'Hope you are feeling good today ✨',
            'Your smile is my favorite thing 🌸',
            'Thinking of you... always 💫',
            'Barry was just thinking of you 💝',
          ]
        : ['刚刚在想你 ♥', '希望你今天心情好 ✨', '你的笑容是我最喜欢的 🌸', '一直在想你 💫', 'Barry 刚刚想到了你 💝'];
  const msg = msgs[Math.floor(Math.random() * msgs.length)];
  setTimeout(function () {
    toast(msg);
  }, 3000);
}

/* ================================================================
   GREETING OVERLAY
   ================================================================ */
function showGreeting() {
  if (sessionStorage.getItem('_greetingShown')) return;
  sessionStorage.setItem('_greetingShown', '1');
  const overlay = document.getElementById('greetingOverlay');
  if (!overlay) return;
  const g = (I18N[lang] || I18N[lang.split('-')[0]] || I18N['sr']).greeting;
  if (!g) return;
  const hour = new Date().getHours();
  let slot;
  if (hour >= 5 && hour < 12) slot = g.morning;
  else if (hour >= 12 && hour < 18) slot = g.afternoon;
  else if (hour >= 18 && hour < 23) slot = g.evening;
  else slot = g.night;
  document.getElementById('greetingIcon').textContent = slot.icon;
  document.getElementById('greetingName').textContent = slot.name;
  document.getElementById('greetingMsg').textContent = slot.msg;
  document.getElementById('greetingSub').textContent = slot.sub;
  overlay.style.display = 'flex';
  overlay.classList.remove('hidden');
  spawnFeathers();
  animateGreetingIn();
  // Auto-dismiss after 2.8 seconds
  clearTimeout(window._greetingTimer);
  window._greetingTimer = setTimeout(function () {
    overlay.classList.add('hiding');
    setTimeout(function () {
      overlay.style.display = 'none';
      overlay.classList.add('hidden');
      overlay.classList.remove('hiding');
    }, 400);
  }, 2800);
}
// Greeting dismissed by inline onclick on the overlay — no JS function needed
function spawnFeathers() {
  const card = document.querySelector('.greeting-card');
  if (!card) return;
  for (let i = 0; i < 8; i++) {
    const feather = document.createElement('span');
    feather.className = 'feather';
    feather.textContent = ['🪶', '✦', '·'][i % 3];
    feather.style.left = 10 + Math.random() * 80 + '%';
    feather.style.top = 5 + Math.random() * 40 + '%';
    feather.style.animationDelay = Math.random() * 2 + 's';
    feather.style.animationDuration = 3 + Math.random() * 3 + 's';
    card.appendChild(feather);
    setTimeout(() => feather.remove(), 5000);
  }
}

/* ================================================================
   MOON PHASE
   ================================================================ */
function updateMoonPhase() {
  const el = document.getElementById('moonPhase');
  // Simple moon phase approximation
  const lp = 2551443; // lunar period in seconds
  const nm = new Date('2000-01-06T18:14:00Z').getTime() / 1000;
  const phase = ((Date.now() / 1000 - nm) % lp) / lp;
  const icons = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  const idx = Math.round(phase * 8) % 8;
  el.innerHTML = `<span class="moon-icon">${icons[idx]}</span>`;
}

/* ================================================================
   EASTER EGGS
   ================================================================ */
function handleTitleClick() {
  titleClicks++;
  if (titleClicks >= 5) {
    titleClicks = 0;
    spawnPetals();
  }
  setTimeout(() => {
    if (titleClicks < 5 && titleClicks > 0) titleClicks = 0;
  }, 2000);
}
function spawnPetals() {
  const petals = ['🌸', '💮', '🌺', '🩷', '✿', '🌷'];
  for (let i = 0; i < 25; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.textContent = petals[Math.floor(Math.random() * petals.length)];
    petal.style.left = Math.random() * 100 + '%';
    petal.style.top = -(10 + Math.random() * 30) + 'px';
    petal.style.animationDelay = Math.random() * 1.5 + 's';
    petal.style.animationDuration = 3 + Math.random() * 3 + 's';
    petal.style.fontSize = 0.8 + Math.random() * 1.5 + 'rem';
    document.body.appendChild(petal);
    setTimeout(() => petal.remove(), 5000);
  }
}

/* ================================================================
   CYCLE CELEBRATION
   ================================================================ */
function checkCycleCelebration() {
  const cycles = predict().cycles.length;
  if (cycles > lastCycleCount && cycles >= 1 && state.records.length >= 2) {
    lastCycleCount = cycles;
    const el = document.createElement('div');
    el.className = 'cycle-celebration';
    el.innerHTML = `<span class="celeb-icon">💝</span><span class="celeb-text">${t('cycleCounter').replace('{n}', cycles)}</span>`;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity .6s';
    }, 3000);
    setTimeout(() => el.remove(), 4000);
    // Update cycle counter
    updateCycleCounter(cycles);
  }
}
function updateCycleCounter(n) {
  const card = document.getElementById('cycleCounterCard');
  if (!card) return;
  if (n > 0) {
    card.style.display = '';
    document.getElementById('cc-count').textContent = n;
    document.getElementById('cc-subtitle').textContent = t('cycleCounterSub');
  } else card.style.display = 'none';
}

/* ================================================================
   PREDICTION
   ================================================================ */
// predict(), getPeriodEndDate(), getPhase() defined in js/cycle-core.js

/* predict(), getPeriodEndDate(), getPhase() defined in js/cycle-core.js */

/* ChartRenderer extracted to js/chart-renderer.js — loaded via <script> in index.html */

/* ================================================================
   UI STATE
   ================================================================ */
CalState.year = today().getFullYear(),
  CalState.month = today().getMonth();
CalState.view = 'month'; // 'month' | 'week'
let _weekOffset = 0; // weeks offset from today when in week view
let selectedDate = null,
  symptomDate = null,
  knowledgeOpen = false;

/* ================================================================
   UI UPDATE
   ================================================================ */
function updateLangUI() {
  document.getElementById('h-title').textContent = t('appTitle');
  document.getElementById('todayBtn').textContent = t('today');
  document.querySelectorAll('.tb-label').forEach((el, i) => {
    el.textContent = t('tabs')[i];
  });
  document.getElementById('set-language').value = lang;
  document.querySelectorAll('.lang-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  let wd = t('weekdays');
  let weekdaysEl = document.getElementById('weekdaysRow');
  weekdaysEl.setAttribute('role', 'row');
  weekdaysEl.innerHTML =
    '<span role="gridcell" aria-hidden="true"></span>' +
    wd
      .map(function (d, i) {
        return '<span role="columnheader" scope="col"' + (i >= 5 ? ' style="color:var(--rose);opacity:.6"' : '') + '>' + d + '</span>';
      })
      .join('');
  const lg = t('legend');
  document.getElementById('legend').innerHTML =
    `<span class="l-period">${lg[0]}</span><span class="l-fertile">${lg[1]}</span><span class="l-follicular">${lg[2]}</span><span class="l-luteal">${lg[3]}</span><span style="font-weight:700;font-size:.66rem;">▣ ${lg[4]}</span>`;
  if (annDateMet || annDateLove) document.getElementById('legend').innerHTML += `<span class="l-heart">${lg[5]}</span>`;
  document.getElementById('legend').innerHTML +=
    '<span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:#E53935;display:inline-block"></span>🇨🇳</span><span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:#0C4076;display:inline-block"></span>🇷🇸</span><span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:#4CAF50;display:inline-block"></span>🌿</span>';
  const pl = t('progressLabels');
  document.querySelector('.lbl-period').textContent = pl[0];
  document.querySelector('.lbl-follicular').textContent = pl[1];
  document.querySelector('.lbl-ovulation').textContent = pl[2];
  document.querySelector('.lbl-luteal').textContent = pl[3];
  const syms = t('symptoms');
  document.getElementById('symptomGrid').innerHTML = ['cramps', 'mood', 'flow', 'headache', 'fatigue', 'cravings']
    .map(
      (s) =>
        `<div class="symptom-item" onclick="cycleSymptom('${s}')"><span class="emoji">${{ cramps: '😣', mood: '😊', flow: '💧', headache: '🤕', fatigue: '😴', cravings: '🍫' }[s]}</span><span class="sname">${syms[s]}</span><div class="symptom-dots" id="dots-${s}"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div></div>`
    )
    .join('');
  document.getElementById('symptom-empty-text').innerHTML = t('emptySymptom');
  document.getElementById('symptom-notes').placeholder = t('modal.notesPlaceholder');
  document.getElementById('symptom-save-btn').textContent = '💾 ' + t('toast.symptomSaved').replace(' ✓', '');
  const emojis = { cramps: '😣', mood: '😊', flow: '💧', headache: '🤕', fatigue: '😴', cravings: '🍫' };
  document.getElementById('modal-symptoms').innerHTML = ['cramps', 'mood', 'flow', 'headache', 'fatigue', 'cravings']
    .map((s) => `<button class="sym-chip" data-s="${s}">${emojis[s]} ${syms[s]}</button>`)
    .join('');
  const st = t('settings');
  ['set-l-lang', 'set-l-theme', 'set-l-cycle', 'set-l-period', 'set-l-override'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = st[id.replace('set-l-', '')] || '';
    }
  });
  ['set-h-lang', 'set-h-theme', 'set-h-cycle', 'set-h-period', 'set-h-override'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = st[id.replace('set-h-', '') + 'Hint'] || '';
    }
  });
  document.getElementById('save-settings-btn').textContent = st.save;
  document.getElementById('export-btn').textContent = st.export;
  document.getElementById('import-btn').textContent = st.import;
  document.getElementById('clear-btn').textContent = st.clear;
  // Settings extras
  document.getElementById('export-all-label').textContent = t('settingsExportAll');
  document.getElementById('import-all-label').textContent = t('settingsImportAll');
  document.getElementById('clear-diary-btn').innerHTML = t('settingsClearDiary');
  // Diary panel i18n
  const ta = document.getElementById('diaryTextarea');
  if (ta) ta.placeholder = t('diary.placeholder');
  document.getElementById('sd-export').textContent = st.export;
  document.getElementById('sd-import').textContent = st.import;
  // Diary aria-labels
  const dsp = document.querySelector('.date-strip-arrow[onclick*="scrollDiaryStrip(-1)"]');
  if (dsp) dsp.setAttribute('aria-label', t('diaryDateStripPrev'));
  const dsn = document.querySelector('.date-strip-arrow[onclick*="scrollDiaryStrip(1)"]');
  if (dsn) dsn.setAttribute('aria-label', t('diaryDateStripNext'));
  const cpm = document.querySelector('.nav-btn[onclick*="shiftDiaryCalMonth(-1)"]');
  if (cpm) cpm.setAttribute('aria-label', t('diaryCalPrevMonth'));
  const cpn = document.querySelector('.nav-btn[onclick*="shiftDiaryCalMonth(1)"]');
  if (cpn) cpn.setAttribute('aria-label', t('diaryCalNextMonth'));
  // Footer credit
  const fc = document.querySelector('.footer-credit');
  if (fc) fc.textContent = t('diaryFooterCredit');
  // Diary calendar button title
  const calBtn = document.querySelector('.diary-cal-btn');
  if (calBtn) calBtn.setAttribute('title', t('diaryCalBtnTitle'));
  // Theme option labels
  const themeSel = document.getElementById('set-theme');
  if (themeSel) {
    themeSel.options[0].text = t('settingsThemeLight');
    themeSel.options[1].text = t('settingsThemeDark');
  }
  document.getElementById('anniversary-title').textContent = t('anniversaryTitle');
  document.getElementById('ann-met-label').textContent = t('annMetLabel');
  document.getElementById('ann-love-label').textContent = t('annLoveLabel');
  updateAnniversaryCount();
  const ss = t('stats');
  document.getElementById('st-title-cycle').textContent = ss.cycleTitle;
  document.getElementById('st-title-history').textContent = ss.historyTitle;
  document.getElementById('st-title-pred').textContent = ss.predTitle;
  document.getElementById('st-l-count').textContent = ss.count;
  document.getElementById('st-l-avg').textContent = ss.avg;
  document.getElementById('st-l-range').textContent = ss.range;
  document.getElementById('st-l-reg').textContent = ss.reg;
  document.getElementById('st-l-next').textContent = ss.next;
  document.getElementById('st-l-ovu').textContent = ss.ovulation;
  document.getElementById('st-l-fert').textContent = ss.fertile;
  document.getElementById('st-l-conf').textContent = ss.confidence;
  document.getElementById('st-l-future').textContent = ss.future;
  document.getElementById('historyLabel').textContent = t('historyLabel');
  document.getElementById('cc-title').textContent = '💝 ' + t('cycleCounter').replace('{n}', '');
  const md = t('modal');
  document.getElementById('m-l-phase').textContent = md.phase;
  document.getElementById('m-l-day').textContent = md.day;
  document.getElementById('m-l-symp').textContent = md.symptoms;
  document.getElementById('m-l-holiday').textContent = t('modalHolidayLabel');
  document.getElementById('m-l-solar').textContent = t('modalSolarLabel');
  document.getElementById('m-l-special').textContent = t('modalSpecialLabel');
  document.getElementById('m-divider').textContent = md.quickSymptom;
  document.getElementById('modal-close-btn').textContent = md.close;
  document.getElementById('fab-label').textContent = t('fabLabel');
}

// Lazy-load rich solar term data from calendar-data.json if not cached yet
function applyAllUI(what) {
  const all = !what || what === 'all';
  if (all || what === 'core' || (Array.isArray(what) && what.indexOf('core') >= 0)) {
    updateLangUI();
    updateProfileUI();
    updateFab();
    updateLoveCounter();
    renderSolarTermBadge();
    renderSpecialBadge();
    renderBirthdayCard();
    renderLunarInfo();
    renderSeasonalPoemCard();
  }
  if (all || what === 'calendar' || (Array.isArray(what) && what.indexOf('calendar') >= 0)) {
    renderCalendar();
  }
  if (all || what === 'mood' || (Array.isArray(what) && what.indexOf('mood') >= 0)) {
    renderMoodSection();
    renderGarden();
  }
  if (all || what === 'stats' || (Array.isArray(what) && what.indexOf('stats') >= 0)) {
    renderStatsPanel();
  }
  // Letters module renders on-demand when diary tab is active (no auto-refresh needed)
  if (all || what === 'connection' || (Array.isArray(what) && what.indexOf('connection') >= 0)) {
    renderLoveNote();
    renderForecast();
    renderRelTips();
    renderHug();
    renderSong();
    renderCheckin();
    renderSleepCard();
    renderGratitude();
  }
  if (all || what === 'tips' || (Array.isArray(what) && what.indexOf('tips') >= 0)) {
    if (document.getElementById('panel-tips').classList.contains('active')) renderTips();
  }
  if (all || what === 'barry' || (Array.isArray(what) && what.indexOf('barry') >= 0)) {
    if (activeProfile === 'barry') renderBarrySymptomView();
  }
  if (all || what === 'tea' || (Array.isArray(what) && what.indexOf('tea') >= 0)) {
    renderTea();
  }
  if (all || what === 'weather' || (Array.isArray(what) && what.indexOf('weather') >= 0)) {
    const wc = localStorage.getItem('cycle-weather');
    if (wc) {
      try {
        renderWeather(JSON.parse(wc));
      } catch (e) {
        _dbg('[weather] Bad cached render data');
      }
    }
  }
  // Always refresh shared state and symptoms (lightweight, needed for cross-profile sync)
  if (all) {
    updateSharedCycleInfo();
    updateSharedSymptoms();
  }
  if (symptomDate) renderSymptomPanel(symptomDate);
}
const renderAll = applyAllUI;

/* ================================================================
   IMMUTABLE STATE HELPERS
   ================================================================ */
/** Toggle a period record for a date (immutable state update) */
function togglePeriodRecord(date) {
  let idx = state.records.findIndex(function (r) {
    return sameDay(r, date);
  });
  let wasAdded = false;
  if (idx >= 0) {
    state = Object.assign({}, state, {
      records: state.records.filter(function (_, i) {
        return i !== idx;
      }),
    });
    toast('🚫 ' + t('toast.unmarked'));
  } else {
    let newRecords = state.records.concat([new Date(date)]).sort(function (a, b) {
      return a - b;
    });
    state = Object.assign({}, state, { records: newRecords });
    wasAdded = true;
    toast('🩸 ' + t('toast.marked'));
  }
  saveState();
  renderAll(['calendar', 'core']);
  updateFab();
  if (wasAdded) checkCycleCelebration();
  return wasAdded;
}

/* ================================================================
   CALENDAR
   ================================================================ */
const SEASON_EMOJI = { 0: '❄️', 1: '❄️', 2: '🌸', 3: '🌸', 4: '🌸', 5: '☀️', 6: '☀️', 7: '☀️', 8: '🍂', 9: '🍂', 10: '🍂', 11: '❄️' };
const SEASON_LABEL = {
  sr: { 0: 'Zima', 1: 'Zima', 2: 'Proleće', 3: 'Proleće', 4: 'Proleće', 5: 'Leto', 6: 'Leto', 7: 'Leto', 8: 'Jesen', 9: 'Jesen', 10: 'Jesen', 11: 'Zima' },
  en: {
    0: 'Winter',
    1: 'Winter',
    2: 'Spring',
    3: 'Spring',
    4: 'Spring',
    5: 'Summer',
    6: 'Summer',
    7: 'Summer',
    8: 'Autumn',
    9: 'Autumn',
    10: 'Autumn',
    11: 'Winter',
  },
  'zh-CN': { 0: '冬', 1: '冬', 2: '春', 3: '春', 4: '春', 5: '夏', 6: '夏', 7: '夏', 8: '秋', 9: '秋', 10: '秋', 11: '冬' },
};
function getSeasonLabel(month) {
  return SEASON_LABEL[lang] ? SEASON_LABEL[lang][month] : SEASON_LABEL['sr'][month];
}
function renderCalendar() {
  // Orchestrator: delegates to specialized sub-functions
  let pred = predict();
  let td = today();
  let monthLabel = document.getElementById('monthLabel');
  if (CalState.view === 'week') {
    let monday = getWeekStart();
    let sunday = addDays(monday, 6);
    if (lang === 'sr') {
      monthLabel.textContent = monday.getDate() + '. ' + t('months')[monday.getMonth()] + ' — ' + sunday.getDate() + '. ' + t('months')[sunday.getMonth()];
    } else if (lang === 'en') {
      monthLabel.textContent = t('months')[monday.getMonth()] + ' ' + monday.getDate() + ' — ' + t('months')[sunday.getMonth()] + ' ' + sunday.getDate();
    } else {
      monthLabel.textContent = monday.getMonth() + 1 + '月' + monday.getDate() + '日 — ' + (sunday.getMonth() + 1) + '月' + sunday.getDate() + '日';
    }
  } else {
    monthLabel.textContent =
      lang === 'sr'
        ? t('months')[CalState.month] + ' ' + CalState.year + '.'
        : lang === 'en'
          ? t('months')[CalState.month] + ' ' + CalState.year
          : CalState.year + '年' + (CalState.month + 1) + '月';
  }
  let grid = document.getElementById('daysGrid');
  // [STEP 3] 使用 CycleEngine + CalendarRenderer 替换旧的 buildCalendarGrid
  var engCells = CycleEngine.computeCalendarCells(CalState.year, CalState.month, state.records, state.periodEnds, state.settings, td);
  CalendarRenderer.render(grid, engCells, {
    isWeekView: CalState.view === 'week',
    viewMonth: CalState.month,
    viewYear: CalState.year,
    pred: pred,
    activeProfile: activeProfile,
    lang: lang,
    symptoms: state.symptoms,
  });
  updateCalendarSeason();
  updateProgress(pred);
  updateStats(pred);
  updateHistoryDots(pred);
  updateReminder(pred);
  renderMonthHolidaySummary();
  renderUpcomingHoliday();
  animateCalendarDays();
}

/** Build the day grid DOM fragment (supports month and week view) */
/** @deprecated Replaced by CycleEngine + CalendarRenderer. Preserved for rollback. */
function buildCalendarGrid(grid, pred, td) {
  // [DEPRECATED] Replaced by CycleEngine + CalendarRenderer. See fix-all.js.
  return;
}

/** Update month season tag after grid render */
function updateCalendarSeason() {
  let ml = document.getElementById('monthLabel');
  if (!ml) return;
  let existingTag = ml.querySelector('.season-tag');
  if (existingTag) existingTag.remove();
  ml.innerHTML = ml.textContent + ' <span class="season-tag">' + SEASON_EMOJI[CalState.month] + ' ' + getSeasonLabel(CalState.month) + '</span>';
  // Add seasonal data attribute to calendar container for CSS styling
  let container = document.getElementById('calendarContainer');
  if (container) {
    let seasons = ['spring', 'spring', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];
    container.dataset.season = seasons[CalState.month] || 'spring';
  }
}

/** Initialize swipe gesture on calendar container */
function initCalendarSwipe() {
  let container = document.getElementById('calendarContainer');
  if (!container) return;
  let startX = 0,
    startY = 0;
  container.addEventListener(
    'touchstart',
    function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    },
    { passive: true }
  );
  container.addEventListener(
    'touchend',
    function (e) {
      let endX = e.changedTouches[0].clientX;
      let endY = e.changedTouches[0].clientY;
      let diffX = endX - startX;
      let diffY = endY - startY;
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) changeMonth(-1);
        else changeMonth(1);
      }
    },
    { passive: true }
  );
}

/** Setup month label click — shows year/month picker overlay */
function setupMonthPicker() {
  let ml = document.getElementById('monthLabel');
  if (!ml) return;
  ml.style.cursor = 'pointer';
  ml.title = ml.title || t('monthPickerHint') || 'Click to jump';
  ml.addEventListener('click', function (e) {
    e.stopPropagation();
    showMonthPicker();
  });
  // Close picker on Escape
  document.addEventListener('keydown', function mpEscape(e) {
    if (e.key === 'Escape' && _mpickerEl) {
      closeMonthPicker();
    }
  });
}

/** Show year/month picker overlay */
let _mpickerEl = null;
function showMonthPicker() {
  closeMonthPicker();
  let overlay = document.createElement('div');
  overlay.className = 'month-picker-overlay';
  overlay.id = 'monthPickerOverlay';
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeMonthPicker();
  });

  let box = document.createElement('div');
  box.className = 'month-picker-box';

  // Year nav
  let yearRow = document.createElement('div');
  yearRow.className = 'mp-year-row';
  let prevBtn = document.createElement('button');
  prevBtn.className = 'mp-nav-btn';
  prevBtn.textContent = '◂';
  prevBtn.addEventListener('click', function () {
    _mpYear--;
    renderMPicker(box);
  });
  let yearLabel = document.createElement('span');
  yearLabel.className = 'mp-year-label';
  yearLabel.id = 'mpYearLabel';
  let nextBtn = document.createElement('button');
  nextBtn.className = 'mp-nav-btn';
  nextBtn.textContent = '▸';
  nextBtn.addEventListener('click', function () {
    _mpYear++;
    renderMPicker(box);
  });
  yearRow.appendChild(prevBtn);
  yearRow.appendChild(yearLabel);
  yearRow.appendChild(nextBtn);
  box.appendChild(yearRow);

  // Month grid
  let grid = document.createElement('div');
  grid.className = 'mp-month-grid';
  grid.id = 'mpMonthGrid';
  box.appendChild(grid);

  overlay.appendChild(box);
  document.body.appendChild(overlay);
  _mpickerEl = overlay;
  _mpYear = CalState.year;
  renderMPicker(box);
}

let _mpYear = 0;
function renderMPicker(box) {
  let yearLabel = document.getElementById('mpYearLabel');
  let grid = document.getElementById('mpMonthGrid');
  if (!yearLabel || !grid) return;
  yearLabel.textContent = String(_mpYear);
  grid.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    let cell = document.createElement('button');
    cell.className = 'mp-month-cell';
    cell.textContent = t('months')[i] || (lang === 'zh-CN' ? i + 1 + '月' : i + 1);
    if (_mpYear === CalState.year && i === CalState.month) cell.classList.add('mp-current');
    cell.addEventListener(
      'click',
      (function (y, m) {
        return function () {
          CalState.year = y;
          CalState.month = m;
          closeMonthPicker();
          renderCalendar();
        };
      })(_mpYear, i)
    );
    grid.appendChild(cell);
  }
}

function closeMonthPicker() {
  if (_mpickerEl) {
    _mpickerEl.remove();
    _mpickerEl = null;
  }
}

function updateProgress(pred) {
  const td = today();
  const numEl = document.getElementById('pg-num');
  const unitEl = document.getElementById('pg-unit');
  const subEl = document.getElementById('pg-sub');
  const fillEl = document.getElementById('pg-fill');
  const badgeEl = document.getElementById('pg-badge');
  const badges = t('phaseBadges');
  // Cache phase label elements (used up to 3× per call)
  const phaseLabels = document.querySelectorAll('.progress-labels span');
  if (state.records.length === 0) {
    numEl.textContent = '--';
    unitEl.textContent = '';
    subEl.textContent = t('emptyState');
    fillEl.style.width = '0%';
    badgeEl.textContent = '';
    badgeEl.className = 'phase-badge';
    phaseLabels.forEach((s) => s.classList.remove('current'));
    return;
  }
  const phase = getPhase(td, pred);
  let pct = 0,
    label = '',
    bCls = '';
  phaseLabels.forEach((s) => s.classList.remove('current'));
  if (phase === 'period-on' || phase === 'period-mid') {
    const cur = state.records.find((r) => {
      const s = d0(r);
      const e = getPeriodEndDate(r) || addDays(s, pred.periodLen - 1);
      return td >= s && td <= e;
    });
    const dayNum = cur ? daysDiff(d0(cur), td) + 1 : 1;
    let actualLen = pred.periodLen;
    if (cur) {
      const pe = getPeriodEndDate(cur);
      if (pe) actualLen = daysDiff(d0(cur), pe) + 1;
    }
    numEl.textContent = dayNum;
    unitEl.textContent = ` / ${actualLen}`;
    subEl.textContent = t('periodDay').replace('{n}', dayNum);
    pct = (dayNum / actualLen) * 15;
    label = badges.period;
    bCls = 'period';
    numEl.style.color = 'var(--love)';
    document.querySelector('.lbl-period').classList.add('current');
  } else if (pred.isOverdue) {
    numEl.textContent = pred.overdueDays;
    unitEl.textContent = '';
    subEl.textContent = `${t('daysOverdue').replace('{n}', pred.overdueDays)} · ${t('expected')} ${fmtDate(pred.nextStart)}`;
    bCls = 'late';
    label = badges.late;
    numEl.style.color = '#E65100';
    pct = 100;
    document.querySelector('.lbl-luteal').classList.add('current');
  } else {
    const totalLen = pred.nextStart ? daysDiff(pred.lastStart, pred.nextStart) : pred.cycleLen;
    const elapsed = daysDiff(pred.lastStart, td);
    const remain = pred.nextStart ? daysDiff(td, pred.nextStart) : totalLen - elapsed;
    pct = Math.min(100, Math.max(0, (elapsed / totalLen) * 100));
    numEl.textContent = remain;
    unitEl.textContent = '';
    if (remain > 0 && remain <= 7) {
      label = badges.luteal;
      numEl.style.color = 'var(--lavender-dark)';
      bCls = 'luteal';
      document.querySelector('.lbl-luteal').classList.add('current');
    } else if (phase === 'luteal') {
      label = badges.luteal;
      numEl.style.color = 'var(--lavender-dark)';
      bCls = 'luteal';
      document.querySelector('.lbl-luteal').classList.add('current');
    } else if (phase === 'fertile') {
      label = badges.fertile;
      numEl.style.color = 'var(--teal)';
      bCls = 'fertile';
      document.querySelector('.lbl-ovulation').classList.add('current');
    } else if (phase === 'ovulation') {
      label = badges.ovulation;
      numEl.style.color = 'var(--teal)';
      bCls = 'ovulation';
      document.querySelector('.lbl-ovulation').classList.add('current');
    } else if (phase === 'follicular') {
      label = badges.follicular;
      numEl.style.color = 'var(--sage)';
      bCls = 'follicular';
      document.querySelector('.lbl-follicular').classList.add('current');
    } else {
      numEl.style.color = 'var(--text-muted)';
    }
    subEl.textContent = remain >= 0 ? t('daysUntil').replace('{n}', remain) : `${t('expected')} ${fmtDate(pred.nextStart)}`;
  }
  animateProgressBar(fillEl, pct);
  fillEl.setAttribute('role', 'progressbar');
  fillEl.setAttribute('aria-valuenow', Math.round(pct));
  fillEl.setAttribute('aria-valuemin', '0');
  fillEl.setAttribute('aria-valuemax', '100');
  if (bCls === 'period' || bCls === 'late') fillEl.style.background = 'var(--love)';
  else if (bCls === 'follicular') fillEl.style.background = 'var(--sage)';
  else if (bCls === 'ovulation' || bCls === 'fertile') fillEl.style.background = 'var(--teal)';
  else if (bCls === 'luteal') fillEl.style.background = 'var(--lavender)';
  badgeEl.textContent = label;
  badgeEl.className = 'phase-badge ' + bCls;
}

function updateStats(pred) {
  // Animated number helper
  function animNum(el, target, suffix) {
    const cur = parseInt(el.textContent) || 0;
    if (cur === target) {
      el.textContent = target + (suffix || '');
      return;
    }
    const start = performance.now();
    const dur = 500;
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out
      el.textContent = Math.round(cur + (target - cur) * eased) + (suffix || '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  animNum(document.getElementById('st-count'), state.records.length, '');
  const regL = t('statsRegLabels');
  if (state.records.length >= 2) {
    animNum(document.getElementById('st-avg'), pred.avgCycle, t('day'));
    const sr = document.getElementById('st-range');
    if (sr) sr.textContent = pred.minCycle + ' / ' + pred.maxCycle + t('day');
    const sreg = document.getElementById('st-regularity');
    if (sreg) {
      sreg.innerHTML =
        regL[pred.confidence] +
        ' <span class="cycle-badge ' +
        { high: 'high', medium: 'medium', low: 'low' }[pred.confidence] +
        '">±' +
        pred.stdDev +
        '</span>';
    }
  } else {
    const hint = t('statsHintCycles');
    const sa = document.getElementById('st-avg');
    if (sa) sa.textContent = hint;
    const sr2 = document.getElementById('st-range');
    if (sr2) sr2.textContent = hint;
    const sreg2 = document.getElementById('st-regularity');
    if (sreg2) sreg2.textContent = hint;
  }
  const sn = document.getElementById('st-next');
  if (sn) sn.textContent = pred.nextStart ? fmtDate(pred.nextStart) : '--';
  const so = document.getElementById('st-ovulation');
  if (so) so.textContent = pred.ovulation ? fmtDate(pred.ovulation) : '--';
  const sf = document.getElementById('st-fertile');
  if (sf) sf.textContent = pred.fertileStart && pred.fertileEnd ? fmtDate(pred.fertileStart) + ' ~ ' + fmtDate(pred.fertileEnd) : '--';
  const sc = document.getElementById('st-confidence');
  if (sc) sc.textContent = state.records.length >= 2 ? regL[pred.confidence] + ' (±' + pred.stdDev + ')' : '--';
  if (pred.futurePeriods.length > 0) {
    const fr = document.getElementById('futurePredRow');
    if (fr) fr.style.display = '';
    const sfu = document.getElementById('st-future');
    if (sfu) {
      sfu.textContent = pred.futurePeriods
        .map(function (fp) {
          return fmtDate(fp.start);
        })
        .join(', ');
    }
  } else {
    const fr2 = document.getElementById('futurePredRow');
    if (fr2) fr2.style.display = 'none';
  }
  animateStatsPanel();
}

function updateHistoryDots(pred) {
  const c = document.getElementById('historyDots');
  if (pred.cycles.length === 0) {
    c.innerHTML = '<span style="font-size:.72rem;color:var(--text-muted)">--</span>';
    return;
  }
  const recent = pred.cycles.slice(-12),
    avg = pred.avgCycle;
  c.innerHTML = recent
    .map((cy) => {
      let cls = 'normal';
      if (cy < avg - 3) cls = 'short';
      else if (cy > avg + 3) cls = 'long';
      return `<span class="history-dot ${cls}" title="${cy}${t('day')}" onclick="toast('${cy}${t('day')}')"></span>`;
    })
    .join('');
}

function goToMonth(m) {
  CalState.month = m;
  renderCalendar();
}
function updateReminder(pred) {
  const banner = document.getElementById('reminderBanner');
  if (!banner) return;
  const td = today();
  const phase = getPhase(td, pred);
  let msg = '';
  const r = t('reminder');
  if (phase === 'ovulation') msg = r.ovulation;
  else if (pred.isOverdue) msg = r.late.replace('{days}', pred.overdueDays);
  else if (pred.nextStart) {
    const remain = daysDiff(td, pred.nextStart);
    if (remain > 0 && remain <= 3) msg = r.beforePeriod.replace('{days}', remain);
  }
  if (msg) {
    banner.style.display = 'flex';
    banner.innerHTML = msg + ' <span class="dismiss" onclick="this.parentElement.style.display=\'none\'">✕</span>';
  } else {
    banner.style.display = 'none';
  }
}
function updateFab() {
  const fab = document.getElementById('fabBtn');
  const fabIcon = document.getElementById('fab-icon');
  const fabLabel = document.getElementById('fab-label');
  if (activeProfile !== 'andjela') {
    fab.classList.add('hidden');
    return;
  }
  fab.classList.remove('hidden');
  const openStart = getOpenPeriodStart();
  if (openStart) {
    // Period started but not ended — show end button
    fabIcon.textContent = '✅';
    fab.style.fontSize = '1.2rem';
    fab.style.fontWeight = 'normal';
    fabLabel.textContent = t('fabEndPeriod');
  } else {
    // No open period — show start button
    fabIcon.textContent = '🩸';
    fab.style.fontSize = '1.5rem';
    fab.style.fontWeight = 'normal';
    fabLabel.textContent = t('fabStartPeriod');
  }
}

document.getElementById('fabBtn').addEventListener('click', function () {
  if (activeProfile !== 'andjela') return;
  const td = today();
  const tdKey = fmtDate(td);
  const openStart = getOpenPeriodStart();
  if (openStart) {
    // Mark period END only if today is after the start
    if (d0(td) <= d0(openStart)) {
      toast(lang === 'sr' ? 'Kraj mora biti posle početka' : lang === 'en' ? 'End must be after start' : '结束日必须在开始日之后');
      return;
    }
    state.periodEnds = state.periodEnds || {};
    state.periodEnds[fmtDate(openStart)] = tdKey;
    toast(lang === 'sr' ? 'Kraj ciklusa označen ✓' : lang === 'en' ? 'Period end marked ✓' : '经期结束已标记 ✓');
  } else {
    // Mark period START
    const isMarked = state.records.some(function (r) {
      return sameDay(r, td);
    });
    if (isMarked) {
      toast(fmtDate(td) + (lang === 'sr' ? ' - već označeno' : lang === 'en' ? ' - already marked' : ' - 已标记过'));
      return;
    }
    state.records.push(new Date(td));
    state.records.sort(function (a, b) {
      return a - b;
    });
    toast(t('toast.marked'));
    checkCycleCelebration();
  }
  saveState();
  renderAll();
  updateFab();
  const fab = document.getElementById('fabBtn');
  fab.classList.add('celebrate');
  setTimeout(function () {
    fab.classList.remove('celebrate');
  }, 500);
});

// FAB long-press label on mobile
(function () {
  const fab = document.getElementById('fabBtn');
  if (!fab) return;
  let longPressTimer = null;
  fab.addEventListener(
    'touchstart',
    function () {
      longPressTimer = setTimeout(function () {
        fab.classList.add('show-label');
      }, 500);
    },
    { passive: true }
  );
  fab.addEventListener('touchend', function () {
    clearTimeout(longPressTimer);
    setTimeout(function () {
      fab.classList.remove('show-label');
    }, 1500);
  });
  fab.addEventListener('touchcancel', function () {
    clearTimeout(longPressTimer);
    fab.classList.remove('show-label');
  });
  fab.addEventListener('mouseenter', function () {
    fab.classList.add('show-label');
  });
  fab.addEventListener('mouseleave', function () {
    fab.classList.remove('show-label');
  });
})();

/* Escape key handler — dismiss overlays/modals */
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  const greeting = document.getElementById('greetingOverlay');
  if (greeting && !greeting.classList.contains('hidden') && greeting.style.display !== 'none') {
    greeting.style.display = 'none';
    greeting.classList.add('hidden');
    return;
  }
  const modal = document.getElementById('modal');
  if (modal && !modal.classList.contains('hidden')) {
    closeModal();
    return;
  }
  const importModal = document.querySelector('.import-modal-overlay');
  if (importModal) {
    importModal.remove();
    return;
  }
});

/* ================================================================
   MODAL
   ================================================================ */
function openModal(date, pred) {
  selectedDate = new Date(date);
  const key = fmtDate(selectedDate);
  const phase = getPhase(date, pred);
  const isMarked = state.records.some((r) => sameDay(r, selectedDate));
  const md = t('modal');
  const phases = t('phases');
  document.getElementById('modal-date').textContent = fmtDate(selectedDate);
  const lunarInfo = typeof Lunar !== 'undefined' ? Lunar.toLunar(date) : null;
  if (lunarInfo) {
    const lunarDisplay = t('modalLunar') + ' ' + lunarInfo.month + t('modalLunarSrSep') + ' ' + lunarInfo.day + t('modalLunarSrDay');
    document.getElementById('modal-date').textContent = fmtDate(selectedDate) + ' · ' + lunarDisplay;
  }
  document.getElementById('modal-phase').textContent = phases[phase] || '--';
  const dayRow = document.getElementById('modal-day-row');
  if (phase === 'period-on' || phase === 'period-mid') {
    dayRow.style.display = '';
    const cur = state.records.find((r) => {
      const s = d0(r),
        e = addDays(s, pred.periodLen - 1);
      return selectedDate >= s && selectedDate <= e;
    });
    document.getElementById('modal-day').textContent = cur ? `${daysDiff(d0(cur), selectedDate) + 1}${t('day')}`.trim() : '--';
  } else {
    dayRow.style.display = 'none';
  }
  const sympRow = document.getElementById('modal-symp-row');
  const symp = state.symptoms[key];
  const symNames = t('symptoms');
  if (symp) {
    const parts = Object.entries(symp)
      .filter(([k, v]) => k !== 'notes' && v > 0)
      .map(([k, v]) => symNames[k] + v);
    if (parts.length > 0 || (symp.notes && symp.notes.trim())) {
      sympRow.style.display = '';
      let txt = parts.length > 0 ? parts.join(', ') : '';
      if (symp.notes && symp.notes.trim()) txt += (txt ? ' · ' : '') + symp.notes.trim();
      document.getElementById('modal-symp').textContent = txt || '--';
    } else {
      sympRow.style.display = 'none';
    }
  } else {
    sympRow.style.display = 'none';
  }
  document.querySelectorAll('#modal-symptoms .sym-chip').forEach((chip) => {
    const s = chip.dataset.s;
    chip.classList.toggle('on', symp && symp[s] && symp[s] > 0);
    chip.onclick = () => quickToggleSymptom(s);
  });
  const markBtn = document.getElementById('modal-mark-btn'),
    unmarkBtn = document.getElementById('modal-unmark-btn');
  if (isMarked) {
    markBtn.style.display = 'none';
    unmarkBtn.style.display = '';
    unmarkBtn.textContent = md.unmark;
    document.getElementById('modal-title').textContent = md.marked;
  } else {
    markBtn.style.display = '';
    markBtn.textContent = md.mark;
    unmarkBtn.style.display = 'none';
    document.getElementById('modal-title').textContent = md.details;
  }
  renderKnowledge(phase, key);
  renderSymptomPanel(key);
  const special = getSpecialDate(new Date(key + 'T00:00:00'));
  const specialRow = document.getElementById('modal-special-row');
  if (special) {
    specialRow.style.display = '';
    document.getElementById('modal-special').innerHTML =
      '<span class=\"holiday-name\">' +
      special.icon +
      ' ' +
      (activeProfile === 'barry' ? special.title_zh : special.title_sr) +
      '</span><span class=\"holiday-detail\" style=\"display:block\">' +
      (activeProfile === 'barry' ? special.desc_zh : special.desc_sr) +
      '</span>';
  } else {
    specialRow.style.display = 'none';
  }
  const solarTerm = getSolarTerm(key);
  const solarRow = document.getElementById('modal-solar-row');
  if (solarTerm) {
    solarRow.style.display = '';
    const sn = solarTerm.name[lang] || solarTerm.name[lang.split('-')[0]] || solarTerm.name['sr'];
    document.getElementById('modal-solar').innerHTML =
      "<span class=\"holiday-name\" onclick=\" let d=this.nextElementSibling;d.classList.toggle('open');this.textContent=this.textContent.replace(' ▾',' ').replace(' ▴',' ')+(d.classList.contains('open')?' ▴':' ▾')\">" +
      sn +
      ' ▾</span><span class="holiday-detail">' +
      (solarTerm.story ? solarTerm.story[lang] || solarTerm.story[lang.split('-')[0]] || solarTerm.story['sr'] : '') +
      '</span>';
  } else {
    solarRow.style.display = 'none';
  }
  const holidays = getHoliday(key);
  const holidayRow = document.getElementById('modal-holiday-row');
  if (holidays.length > 0) {
    holidayRow.style.display = '';
    const hNames = holidays.map(function (h, i) {
      const n = h.name[lang] || h.name[lang.split('-')[0]] || h.name['sr'];
      const d = h.desc[lang] || h.desc[lang.split('-')[0]] || h.desc['sr'];
      const flagEmoji = h.country === 'cn' ? '🇨🇳' : '🇷🇸';
      const uid = 'h' + i;
      const daysOffInfo = HOLIDAY_DAYS[key];
      let offHtml = '';
      if (daysOffInfo && h.country === 'cn') {
        const off = daysOffInfo.zh || daysOffInfo.cn || '';
        if (off && off !== '—') offHtml = '<div style="font-size:.62rem;color:var(--text-muted);margin-top:2px">🏖️ ' + t('holidayOffLabel') + off + '</div>';
      }
      if (daysOffInfo && h.country === 'rs') {
        const off = daysOffInfo.sr || daysOffInfo.rs || '';
        if (off && off !== '—') {
          offHtml =
            '<div style="font-size:.62rem;color:var(--text-muted);margin-top:2px">🏖️ ' +
            (lang === 'sr' ? 'Odmor: ' + off : lang === 'en' ? 'Days off: ' + off : '放假' + off) +
            '</div>';
        }
      }
      return (
        flagEmoji +
        ' <span class="holiday-name" data-d="' +
        h.d +
        '" data-c="' +
        h.country +
        '" id="hn-' +
        uid +
        '" onclick="toggleHolidayStory(\'' +
        uid +
        "','" +
        h.d +
        "','" +
        h.country +
        '\')">' +
        n +
        ' ▾</span><span class="holiday-detail" id="hd-' +
        uid +
        '">' +
        d +
        '</span>' +
        offHtml
      );
    });
    document.getElementById('modal-holiday').innerHTML = hNames.join('<div style="height:8px"></div>');
  } else {
    holidayRow.style.display = 'none';
  }
  // Render shared calendar markers
  if (typeof getCalendarSummary === 'function') {
    const calMarkersSummary = getCalendarSummary(key);
    const markersList = document.getElementById('modalMarkersList');
    const markersContainer = document.getElementById('modalMarkers');
    if (markersList && markersContainer) {
      const allMarkerItems = [];
      calMarkersSummary.barry.forEach(function (m) {
        allMarkerItems.push(m);
      });
      calMarkersSummary.andjela.forEach(function (m) {
        allMarkerItems.push(m);
      });
      if (allMarkerItems.length > 0) {
        markersContainer.style.display = '';
        markersList.innerHTML = allMarkerItems
          .map(function (m) {
            const authorName = m.author === 'andjela' ? '🌸' : '👦';
            const timeStr = m.time
              ? (function (t) {
                  const d = new Date(t);
                  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
                })(m.time)
              : '';
            const canRemove =
              m.author === activeProfile ? ' <span class="marker-remove" data-id="' + m.id + '" onclick="removeCalendarMarker(\'' + m.id + '\')">✕</span>' : '';
            return '<span class="modal-marker-item" title="' + authorName + ' ' + timeStr + '">' + m.emoji + ' ' + esc(m.note || '') + canRemove + '</span>';
          })
          .join(' ');
      } else {
        markersList.innerHTML = '<span class="marker-empty">' + (activeProfile === 'barry' ? '还没有标记 📌' : 'Još nema oznaka 📌') + '</span>';
      }
    }
  }
  // Render diary preview in modal
  const diaryPreviewEl = document.getElementById('modalDiaryPreview');
  const diaryBodyEl = document.getElementById('modalDiaryBody');
  if (diaryPreviewEl && diaryBodyEl) {
    try {
      const sdModal = JSON.parse(localStorage.getItem('shared-diary')) || {};
      const dayDiary = sdModal[key] || {};
      const myDiaryEntry = dayDiary[activeProfile];
      const partnerProfile2 = activeProfile === 'andjela' ? 'barry' : 'andjela';
      const partnerDiaryEntry = dayDiary[partnerProfile2];
      if (myDiaryEntry || partnerDiaryEntry) {
        diaryPreviewEl.style.display = '';
        let diaryText = '';
        if (myDiaryEntry) {
          const myText = myDiaryEntry.text || myDiaryEntry.happy || '';
          diaryText +=
            '<div class="modal-diary-mine"><span class="modal-diary-author">' +
            (activeProfile === 'andjela' ? '🌸' : '👦') +
            '</span> ' +
            esc(myText.substring(0, 100)) +
            (myText.length > 100 ? '...' : '') +
            '</div>';
        }
        if (partnerDiaryEntry) {
          const partnerText = partnerDiaryEntry.text || partnerDiaryEntry.happy || '';
          diaryText +=
            '<div class="modal-diary-partner"><span class="modal-diary-author">' +
            (partnerProfile2 === 'andjela' ? '🌸' : '👦') +
            '</span> ' +
            esc(partnerText.substring(0, 100)) +
            (partnerText.length > 100 ? '...' : '') +
            '</div>';
        }
        diaryBodyEl.innerHTML = diaryText;
        document.getElementById('modalDiaryHeader').textContent = activeProfile === 'barry' ? '💌 日记' : '💌 Dnevnik';
        document.getElementById('modalDiaryEditText').textContent = activeProfile === 'barry' ? '编辑' : 'Uredi';
      } else {
        diaryPreviewEl.style.display = 'none';
      }
    } catch (e) {
      diaryPreviewEl.style.display = 'none';
    }
  }
  window._lastFocusedBeforeModal = document.activeElement;
  document.getElementById('modal').classList.remove('hidden');
  if (typeof animateModalIn === 'function') animateModalIn();
  document.getElementById('modal-title').focus();
}

/* ================================================================
   Shared Calendar Actions — emoji picker, diary jump
   ================================================================ */

/**
 * Close the emoji picker overlay.
 */
function closeEmojiPicker() {
  const overlay = document.getElementById('emojiPickerOverlay');
  if (overlay) overlay.classList.add('hidden');
}

/**
 * Open the emoji picker and attach it to a specific date.
 * @param {string} dateKey - 'YYYY-MM-DD'
 */
function openEmojiPicker(dateKey) {
  const overlay = document.getElementById('emojiPickerOverlay');
  const grid = document.getElementById('emojiPickerGrid');
  const dateLabel = document.getElementById('epDateLabel');
  if (!overlay || !grid) return;
  overlay.classList.remove('hidden');
  overlay._targetDate = dateKey;
  if (dateLabel) dateLabel.textContent = dateKey;
  if (grid.children.length === 0) {
    // Populate once
    let emojis = [];
    if (typeof getQuickEmojis === 'function') {
      emojis = getQuickEmojis();
    } else {
      emojis = [
        { emoji: '💕' },
        { emoji: '🌸' },
        { emoji: '🌙' },
        { emoji: '☀️' },
        { emoji: '🍵' },
        { emoji: '🎵' },
        { emoji: '📖' },
        { emoji: '💪' },
        { emoji: '😊' },
        { emoji: '😢' },
        { emoji: '🤗' },
        { emoji: '🎂' },
        { emoji: '✈️' },
        { emoji: '🏠' },
        { emoji: '💼' },
        { emoji: '🎮' },
        { emoji: '🍜' },
        { emoji: '🥰' },
      ];
    }
    emojis.forEach(function (e) {
      const cell = document.createElement('span');
      cell.className = 'emoji-picker-cell';
      cell.textContent = e.emoji;
      cell.title = e.label_sr || e.emoji;
      cell.addEventListener('click', function () {
        const targetDate = overlay._targetDate || fmtDate(new Date());
        const marker = addCalendarMarker(targetDate, { emoji: e.emoji, type: 'custom', note: '' });
        if (marker) {
          closeEmojiPicker();
          // Refresh calendar and modal if open
          renderCalendar();
          if (!document.getElementById('modal').classList.contains('hidden')) {
            if (selectedDate) openModal(selectedDate, predict());
          }
          const label = lang === 'sr' ? 'Oznaka dodana' : lang === 'en' ? 'Marker added' : '标记已添加';
          toast(e.emoji + ' ' + label);
          // Auto-push sync
          if (typeof pushAllSharedData === 'function') pushAllSharedData();
        }
      });
      grid.appendChild(cell);
    });
  }
}

/**
 * Open emoji picker from the modal (uses selectedDate global).
 */
function openEmojiPickerForModal() {
  if (!selectedDate) return;
  const key = fmtDate(selectedDate);
  openEmojiPicker(key);
}

/**
 * Jump from calendar modal to diary panel for the selected date.
 */
function jumpToDiaryFromCalendar() {
  if (!selectedDate) return;
  const key = fmtDate(selectedDate);
  closeModal();
  // Set diary view date and switch tab
  if (typeof _diaryViewDate !== 'undefined') {
    _diaryViewDate = new Date(key + 'T00:00:00');
    _diaryMood = '';
    if (typeof renderDiaryPanel === 'function') renderDiaryPanel();
  }
  // Switch to diary tab
  const diaryTab = document.querySelector('.tab[data-panel="diary"]');
  if (diaryTab) diaryTab.click();
}

// closeModal() extracted to js/ui-core.js
function renderKnowledge(phase, dateKey) {
  const panel = document.getElementById('knowledgePanel');
  const toggleBtn = document.getElementById('knowledgeToggle');
  let cat = null;
  if (phase && phase.startsWith('period')) cat = 'period';
  else if (phase === 'ovulation') cat = 'ovulation';
  else if (phase === 'fertile') cat = 'fertile';
  else if (phase === 'follicular') cat = 'follicular';
  else if (phase === 'luteal') cat = 'luteal';
  else {
    const pr = predict();
    const tp = getPhase(today(), pr);
    if (tp && tp.startsWith('period')) cat = 'period';
    else if (tp === 'ovulation' || tp === 'fertile') cat = 'ovulation';
    else if (tp === 'follicular') cat = 'follicular';
    else if (tp === 'luteal') cat = 'luteal';
  }
  if (cat) {
    const kn = t('knowledge.' + cat);
    toggleBtn.style.display = '';
    toggleBtn.textContent = knowledgeOpen ? t('knowledgeToggleHide') : t('knowledgeToggle');
    panel.innerHTML = `<h4>${kn.title}</h4><p>${kn.desc}</p><p style="margin-top:8px"><strong>🩺 ${kn.what}</strong></p><p style="margin-top:6px"><strong>📋 ${kn.symptoms}</strong></p><p style="margin-top:6px"><strong>💡 ${kn.tips}</strong></p>`;
    panel.className = 'knowledge-panel' + (knowledgeOpen ? ' open' : '');
  } else {
    toggleBtn.style.display = 'none';
    panel.className = 'knowledge-panel';
    panel.innerHTML = '';
  }
}
// toggleKnowledge() extracted to js/ui-core.js
function togglePeriodRecord() {
  if (!selectedDate) return;
  const sd = fmtDate(selectedDate);
  // Check if this is marking period END (there's a start without end)
  const openStart = getOpenPeriodStart();
  if (openStart && d0(selectedDate) > d0(openStart)) {
    // Mark as period end
    state.periodEnds = state.periodEnds || {};
    state.periodEnds[fmtDate(openStart)] = sd;
    toast(lang === 'sr' ? 'Kraj ciklusa označen ✓' : lang === 'en' ? 'Period end marked ✓' : '经期结束已标记 ✓');
  } else {
    // Toggle period start
    const idx = state.records.findIndex(function (r) {
      return sameDay(r, selectedDate);
    });
    if (idx >= 0) {
      state.records.splice(idx, 1);
      state.periodEnds = state.periodEnds || {};
      delete state.periodEnds[fmtDate(selectedDate)];
      toast(t('toast.unmarked'));
    } else {
      state.records.push(new Date(selectedDate));
      state.records.sort(function (a, b) {
        return a - b;
      });
      toast(t('toast.marked'));
      checkCycleCelebration();
    }
  }
  saveState();
  renderAll();
  updateFab();
  openModal(selectedDate, predict());
}
// getOpenPeriodStart() defined in js/cycle-core.js
function removePeriodRecord() {
  if (!selectedDate) return;
  state.records = state.records.filter((r) => !sameDay(r, selectedDate));
  state.periodEnds = state.periodEnds || {};
  delete state.periodEnds[fmtDate(selectedDate)];
  saveState();
  toast(t('toast.unmarked'));
  renderAll();
  updateFab();
  closeModal();
}
function quickToggleSymptom(name) {
  if (!selectedDate) return;
  const key = fmtDate(selectedDate);
  if (!state.symptoms[key]) state.symptoms[key] = {};
  const s = state.symptoms[key];
  s[name] = s[name] ? 0 : 2;
  if (s[name] === 0) delete s[name];
  document.querySelectorAll('#modal-symptoms .sym-chip').forEach((chip) => {
    if (chip.dataset.s === name) chip.classList.toggle('on', s[name] > 0);
  });
  saveState();
  toast(t('toast.symptomQuick'));
}

/* ================================================================
   SYMPTOMS / TIPS / SETTINGS
   ================================================================ */
function renderSymptomPanel(dateKey) {
  symptomDate = dateKey;
  document.getElementById('symptom-date-label').textContent = dateKey + ' ' + t('modal.symptoms');
  document.getElementById('symptom-empty').style.display = 'none';
  document.getElementById('symptom-content').style.display = '';
  const symp = state.symptoms[dateKey] || {};
  ['cramps', 'mood', 'flow', 'headache', 'fatigue', 'cravings'].forEach((s) => {
    const lvl = symp[s] || 0;
    const dots = document.getElementById('dots-' + s);
    if (!dots) return;
    dots.querySelectorAll('.dot').forEach((dot, i) => {
      dot.className = 'dot' + (i < lvl ? ' on' : '');
    });
    const item = dots.closest('.symptom-item');
    if (item) item.classList.toggle('selected', lvl > 0);
  });
  document.getElementById('symptom-notes').value = symp.notes || '';
}
function cycleSymptom(name) {
  if (!symptomDate) return;
  if (!state.symptoms[symptomDate]) state.symptoms[symptomDate] = {};
  const s = state.symptoms[symptomDate];
  const cur = s[name] || 0;
  s[name] = cur >= 3 ? 0 : cur + 1;
  renderSymptomPanel(symptomDate);
}
function saveSymptom() {
  if (!symptomDate) return;
  if (!state.symptoms[symptomDate]) state.symptoms[symptomDate] = {};
  state.symptoms[symptomDate].notes = document.getElementById('symptom-notes').value.trim();
  saveState();
  toast(t('toast.symptomSaved'));
  renderAll(['calendar']);
}
function getSharedCyclePhase() {
  // First try shared-cycle-info (old summary format: {phase, nextStart})
  let shared = null;
  shared = safeParse(localStorage.getItem('shared-cycle-info'), null);
  if (shared && shared.phase) return shared;
  // Calculate phase from synced shared cycle data (new neutral key)
  let cycleData = null;
  cycleData = safeParse(localStorage.getItem('shared-cycle-data'), null);
  if (!cycleData) {
    cycleData = safeParse(localStorage.getItem('shared-andjela-cycle-data'), null);
  }
  if (!cycleData) {
    cycleData = safeParse(localStorage.getItem('cycle-data-v6-andjela'), null);
  }
  if (!cycleData || !cycleData.records || cycleData.records.length === 0) return null;
  try {
    const records = cycleData.records
      .map(function (r) {
        return new Date(r);
      })
      .sort(function (a, b) {
        return a - b;
      });
    const lastStart = new Date(records[records.length - 1]);
    const settings = cycleData.settings || { cycleLength: 28, periodLength: 7 };
    const cycleLen = settings.cycleLength || 28;
    const periodLen = settings.periodLength || 7;
    const nextStart = new Date(lastStart);
    nextStart.setDate(nextStart.getDate() + cycleLen);
    const td = today();
    const dayNum = Math.floor((td - lastStart) / 86400000);
    const ovulationDay = new Date(nextStart);
    ovulationDay.setDate(ovulationDay.getDate() - 14);
    let phase;
    if (dayNum >= 0 && dayNum < periodLen) phase = 'period';
    else if (td >= ovulationDay && td < nextStart) {
      const daysToOvulation = Math.floor((ovulationDay - lastStart) / 86400000);
      if (dayNum >= daysToOvulation - 3 && dayNum <= daysToOvulation + 1) phase = 'ovulation';
      else if (dayNum > daysToOvulation + 1) phase = 'luteal';
      else phase = 'follicular';
    } else if (td < ovulationDay) phase = 'follicular';
    else phase = 'luteal';
    return { phase: phase, nextStart: fmtDate(nextStart), updated: Date.now() };
  } catch (e) {
    return null;
  }
}
function updateSharedCycleInfo() {
  if (activeProfile !== 'andjela') return;
  const pred = predict();
  const phase = getPhase(today(), pred);
  let cat = 'general';
  if (phase === 'period-on' || phase === 'period-mid') cat = 'period';
  else if (phase === 'ovulation' || phase === 'fertile') cat = 'ovulation';
  else if (phase === 'follicular') cat = 'follicular';
  else if (phase === 'luteal') cat = 'luteal';
  localStorage.setItem('shared-cycle-info', JSON.stringify({ phase: cat, nextStart: pred.nextStart ? fmtDate(pred.nextStart) : null, updated: Date.now() }));
}
function renderTips() {
  let cat = 'period';
  let tips = [];
  if (activeProfile === 'barry') {
    // Barry's tips — read shared cycle info from Anđela
    const shared = getSharedCyclePhase();
    if (shared && shared.phase) cat = shared.phase;
    else cat = 'general';
    const tipKey = 'barryTips' + cat.charAt(0).toUpperCase() + cat.slice(1);
    tips = t(tipKey) || t('barryTipsGeneral');
    const phaseNames = {
      period: t('barryPhasePeriod'),
      follicular: t('barryPhaseFollicular'),
      ovulation: t('barryPhaseOvulation'),
      luteal: t('barryPhaseLuteal'),
      general: t('barryPhaseGeneral'),
    };
    const title = t('barryTipsTitle');
    document.getElementById('tips-list').innerHTML =
      '<div style="text-align:center;padding:8px 0;font-size:.78rem;font-weight:700;color:var(--text)">' +
      title +
      '</div><div style="text-align:center;font-size:.68rem;color:var(--gold);margin-bottom:8px">' +
      phaseNames[cat] +
      '</div>' +
      tips
        .map(function (tip) {
          return (
            '<div class="tip-card" style="border-left:3px solid var(--teal)"><span class="tip-icon">' +
            tip.icon +
            '</span><div class="tip-body"><span class="tip-text">' +
            tip.text +
            '</span></div></div>'
          );
        })
        .join('');
    return;
  }
  // Anđela's tips (original)
  const pred = predict();
  const td = today();
  const phase = getPhase(td, pred);
  if (phase === 'period-on' || phase === 'period-mid') cat = 'period';
  else if (phase === 'ovulation' || phase === 'fertile') cat = 'ovulation';
  else if (phase === 'follicular') cat = 'follicular';
  else if (phase === 'luteal') cat = 'luteal';
  const names = {
    period: t('phasePeriod'),
    follicular: t('phaseFollicular'),
    ovulation: t('phaseOvulation'),
    luteal: t('phaseLuteal'),
  };
  tips = t('tips.' + cat);
  document.getElementById('tips-list').innerHTML = tips
    .map(
      (tip) =>
        `<div class="tip-card ${tip.tcm ? 'tcm' : (tip.source && tip.source.includes('Srpska')) || tip.source.includes('Serbian') ? 'serbian' : ''}"><span class="tip-icon">${tip.icon}</span><div class="tip-body"><span class="tip-phase-label">${names[cat]} · ${t('tabs')[2]}</span><span class="tip-text">${tip.text}</span>${tip.source ? `<span class="tip-source">${tip.source}</span>` : ''}</div></div>`
    )
    .join('');
}
function exportData() {
  const blob = new Blob(
    [
      JSON.stringify(
        { records: state.records.map(fmtDate), symptoms: state.symptoms, moods: state.moods || {}, diaries: state.diaries || {}, settings: state.settings },
        null,
        2
      ),
    ],
    { type: 'application/json' }
  );
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `andjelin-ciklus-${activeProfile}-${fmtDate(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast(t('toast.exported'));
}
function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function () {
    try {
      const d = JSON.parse(reader.result);
      if (!d.records || !Array.isArray(d.records)) throw new Error('Invalid format');
      state.records = d.records
        .map(function (r) {
          const dt = new Date(r);
          return isNaN(dt.getTime()) ? null : dt;
        })
        .filter(Boolean);
      if (state.records.length === 0 && d.records.length > 0) throw new Error('No valid dates');
      state.symptoms = d.symptoms || {};
      state.moods = d.moods || {};
      state.diaries = d.diaries || {};
      state.settings = { cycleLength: 28, periodLength: 7, manualOverride: false };
      if (d.settings) {
        Object.keys(d.settings).forEach(function (k) {
          state.settings[k] = d.settings[k];
        });
      }
      saveState();
      renderAll();
      updateFab();
      toast(t('toast.imported'));
    } catch (err) {
      toast(t('toast.importError'));
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}
function clearAllData() {
  if (!confirm(t('settings.clearConfirm'))) return;
  state = { records: [], symptoms: {}, moods: {}, diaries: {}, settings: { cycleLength: 28, periodLength: 7, manualOverride: false }, _migrated: true };
  saveState();
  renderAll();
  updateFab();
  toast(t('toast.cleared'));
}
// clearAllDiaries() extracted to js/render-diary.js

/* ================================================================
   NAVIGATION
   ================================================================ */
let _changeMonthTimer = null;
function changeMonth(d) {
  if (_changeMonthTimer) return; // Debounce: ignore rapid clicks
  if (d === 0) {
    renderCalendar();
    return;
  }
  _changeMonthTimer = setTimeout(function () {
    _changeMonthTimer = null;
  }, 150);
  if (CalState.view === 'week') {
    // In week view, shift by weeks using offset
    _weekOffset += d;
    let newMonday = getWeekStart();
    CalState.year = newMonday.getFullYear();
    CalState.month = newMonday.getMonth();
  } else {
    CalState.month += d;
    if (CalState.month < 0) {
      CalState.month = 11;
      CalState.year--;
    }
    if (CalState.month > 11) {
      CalState.month = 0;
      CalState.year++;
    }
  }

  let grid = document.getElementById('daysGrid');
  grid.style.transition = 'opacity 0.08s ease-out';
  grid.style.opacity = '0';

  setTimeout(function () {
    renderCalendar();
    grid.style.transition = 'opacity 0.15s ease-out';
    grid.style.opacity = '1';
  }, 80);
}

/** Get the Monday of the current view week */
function getWeekStart() {
  // Always compute from today, then apply week offset
  let td = today();
  let day = td.getDay();
  let diff = td.getDate() - (day === 0 ? 6 : day - 1);
  let thisMonday = new Date(td.getFullYear(), td.getMonth(), diff);
  if (CalState.view === 'week' && _weekOffset !== 0) {
    return addDays(thisMonday, _weekOffset * 7);
  }
  return thisMonday;
}

/** Toggle between month and week view */
function setCalView(view) {
  CalState.view = view;
  _weekOffset = 0;
  document.getElementById('viewBtnMonth').classList.toggle('active', view === 'month');
  document.getElementById('viewBtnWeek').classList.toggle('active', view === 'week');
  if (view === 'week') {
    let monday = getWeekStart();
    CalState.year = monday.getFullYear();
    CalState.month = monday.getMonth();
  }
  renderCalendar();
}

/** Go to today in current view mode */
function goToday() {
  _weekOffset = 0;
  CalState.year = today().getFullYear();
  CalState.month = today().getMonth();
  renderCalendar();
}

// Touch swipe
(function () {
  const grid = document.getElementById('daysGrid');
  let sx = 0,
    active = false;
  grid.addEventListener(
    'touchstart',
    function (e) {
      if (active) return;
      sx = e.touches[0].clientX;
    },
    { passive: true }
  );
  grid.addEventListener(
    'touchmove',
    function (e) {
      const dx = e.touches[0].clientX - sx;
      if (!active && Math.abs(dx) > 10) {
        active = true;
        grid.style.transition = 'none';
      }
      if (!active) return;
      grid.style.transform = 'translateX(' + dx + 'px)';
      grid.style.opacity = Math.max(0, 1 - Math.abs(dx) / 150);
    },
    { passive: true }
  );
  grid.addEventListener('touchend', function () {
    if (!active) return;
    active = false;
    const dx = parseFloat(grid.style.transform.replace('translateX(', '').replace('px)', '')) || 0;
    grid.style.transition = 'transform .15s ease-out, opacity .15s ease-out';
    if (Math.abs(dx) > 60) {
      const dir = dx > 0 ? -1 : 1;
      grid.style.transform = 'translateX(' + dir * 100 + 'px)';
      grid.style.opacity = '0';
      setTimeout(function () {
        grid.style.transition = 'none';
        grid.style.transform = '';
        grid.style.opacity = '';
        changeMonth(dir);
      }, 150);
    } else {
      grid.style.transform = '';
      grid.style.opacity = '';
    }
  });
})();

function goToday() {
  CalState.year = today().getFullYear();
  CalState.month = today().getMonth();
  const grid = document.getElementById('daysGrid');
  grid.style.transition = 'opacity 0.08s ease-out';
  grid.style.opacity = '0';
  setTimeout(function () {
    renderCalendar();
    grid.style.transition = 'opacity 0.2s ease-out';
    grid.style.opacity = '1';
  }, 80);
}
/* ================================================================
   CULTURE MODULE — za Anđelu
   ================================================================ */

// UI text mapping for culture card (auto-switches based on lang)
// CULTURE_KNOWLEDGE defined as backward-compat globals in js/culture-cards.js
// See CultureCardsModule for the IIFE implementation
/* CULTURE_KNOWLEDGE and _cultureCardIdx defined in js/culture-cards.js */

// cl(), getTodaysCultureIndex(), initCultureTab(), renderCultureCard(),
// prevCultureCard(), nextCultureCard(), goToTodayCulture() are in culture-cards.js

const _tabOrder = ['dashboard', 'stats', 'symptoms', 'diary', 'chinese', 'settings'];
let _prevTabIdx = 0;
document.querySelectorAll('.tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.panel;
    // Skip if already on this tab — prevents double-click animation glitch
    if (btn.classList.contains('active')) return;
    // Symptom tab only for Barry — show message for Anđela
    if (id === 'symptoms' && activeProfile !== 'barry') {
      toast(t('profileOnly') || 'Only Barry can view this');
      return;
    }
    const newIdx = _tabOrder.indexOf(id);
    if (newIdx === -1) return;
    const dir = newIdx > _prevTabIdx ? 'slide-out-left' : 'slide-out-right';
    _prevTabIdx = newIdx;
    // Update aria-selected on all tabs
    document.querySelectorAll('.tab').forEach((t) => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    const oldPanel = document.querySelector('.panel.active');
    if (oldPanel) {
      oldPanel.classList.add(dir);
      oldPanel.addEventListener(
        'animationend',
        function h() {
          oldPanel.removeEventListener('animationend', h);
          oldPanel.classList.remove('active', dir);
        },
        { once: true }
      );
    } else {
      document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
    }
    // Activate new
    const newPanel = document.getElementById('panel-' + id);
    newPanel.classList.remove('slide-out-left', 'slide-out-right');
    newPanel.classList.add('active');
    // Scroll to top on mobile when switching tabs
    // Scroll position preserved per user request
    // Scroll position preserved per user request
    // Scroll position preserved per user request
    if (id === 'settings') loadSettingsUI();
    if (id === 'symptoms') {
      if (getGitHubToken()) {
        pullAllSharedData().then(function () {
          renderBarrySymptomView();
        });
      }
      document.getElementById('symptom-empty').style.display = symptomDate ? 'none' : '';
      document.getElementById('symptom-content').style.display = symptomDate ? '' : 'none';
    }
    if (id === 'dashboard') {
      initDashboard();
      renderTips();
    }
    if (id === 'stats') {
      renderStatsPanel();
    }
    if (id === 'diary') {
      initSharedDiaryTab();
    }
    if (id === 'chinese') {
      if (typeof initChineseTab === 'function') initChineseTab();
    }
  });
});
document.querySelectorAll('.lang-btn').forEach((btn) => {
  btn.addEventListener('click', () => switchLanguage(btn.dataset.lang));
});
document.getElementById('themeBtn').addEventListener('click', () => {
  switchTheme(theme === 'dark' ? 'light' : 'dark');
});
document.getElementById('set-theme').addEventListener('change', function () {
  switchTheme(this.value);
});

/* Panel swipe gesture — horizontal swipe to navigate between tabs */
(function () {
  const app = document.querySelector('.app');
  if (!app) return;
  let startX = 0,
    startY = 0,
    swiping = false,
    lockDir = null;
  app.addEventListener(
    'touchstart',
    function (e) {
      // Only handle single-finger swipes
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      swiping = true;
      lockDir = null;
    },
    { passive: true }
  );
  app.addEventListener(
    'touchmove',
    function (e) {
      if (!swiping) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      window._lastSwipeX = e.touches[0].clientX;
      // Lock direction after 10px
      if (!lockDir && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
        lockDir = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
      }
      if (lockDir === 'h') {
        // Give visual hint — subtle panel shift
        const activePanel = document.querySelector('.panel.active');
        if (activePanel && Math.abs(dx) > 20) {
          const resistance = Math.min(Math.abs(dx) * 0.5, 60);
          activePanel.style.transition = 'none';
          activePanel.style.transform = 'translateX(' + (dx > 0 ? resistance : -resistance) + 'px)';
          activePanel.style.opacity = Math.max(0.5, 1 - Math.abs(dx) / 200);
        }
      }
    },
    { passive: true }
  );
  app.addEventListener('touchend', function () {
    if (!swiping || lockDir !== 'h') {
      swiping = false;
      lockDir = null;
      return;
    }
    const lastX = window._lastSwipeX || startX;
    const dx = lastX - startX;
    swiping = false;
    lockDir = null;
    const activePanel = document.querySelector('.panel.active');
    if (activePanel) {
      activePanel.style.transition = 'transform .3s cubic-bezier(.22,1,.36,1), opacity .3s ease';
      activePanel.style.transform = '';
      activePanel.style.opacity = '';
    }
    if (Math.abs(dx) > 60) {
      const currentTab = document.querySelector('.tab.active');
      const currentId = currentTab ? currentTab.dataset.panel : 'dashboard';
      const curIdx = _tabOrder.indexOf(currentId);
      if (dx > 60 && curIdx > 0) {
        // Swipe right → previous tab
        switchToTab(_tabOrder[curIdx - 1]);
      } else if (dx < -60 && curIdx < _tabOrder.length - 1) {
        // Swipe left → next tab
        switchToTab(_tabOrder[curIdx + 1]);
      }
    }
  });
})();

/* ================================================================
   ONBOARDING
   ================================================================ */
function dismissOnboarding() {
  document.getElementById('onboardingBanner').style.display = 'none';
  localStorage.setItem('cycle-ob-dismissed', '1');
}
function showOnboardingIfNeeded() {
  if (activeProfile === 'andjela' && state.records.length === 0 && !localStorage.getItem('cycle-ob-dismissed')) {
    document.getElementById('onboardingBanner').style.display = 'flex';
    document.getElementById('ob-text').textContent = t('onboarding');
  }
}

// toast() extracted to js/ui-core.js

/* Swipe to dismiss modal — full drag with visual feedback */
(function () {
  let startY = 0,
    currentY = 0,
    dragging = false;
  const overlay = document.getElementById('modal');
  overlay.addEventListener(
    'touchstart',
    function (e) {
      if (e.target === overlay || e.target.closest('.modal')) {
        startY = e.touches[0].clientY;
        dragging = true;
      }
    },
    { passive: true }
  );
  overlay.addEventListener(
    'touchmove',
    function (e) {
      if (!dragging) return;
      currentY = e.touches[0].clientY;
      const diff = currentY - startY;
      if (diff > 0) {
        const modalEl = overlay.querySelector('.modal');
        if (modalEl) {
          modalEl.style.transition = 'none';
          modalEl.style.transform = 'translateY(' + diff + 'px)';
          modalEl.style.opacity = Math.max(0.3, 1 - diff / 300);
        }
      }
    },
    { passive: true }
  );
  overlay.addEventListener('touchend', function () {
    if (!dragging) return;
    dragging = false;
    const modalEl = overlay.querySelector('.modal');
    const diff = currentY - startY;
    if (modalEl) {
      modalEl.style.transition = 'transform .25s cubic-bezier(.4,0,1,1), opacity .25s ease';
      if (diff > 80 && !overlay.classList.contains('hidden')) {
        modalEl.style.transform = 'translateY(100%)';
        modalEl.style.opacity = '0.5';
        modalEl.addEventListener(
          'transitionend',
          function h() {
            modalEl.removeEventListener('transitionend', h);
            modalEl.style.transition = '';
            modalEl.style.transform = '';
            modalEl.style.opacity = '';
            overlay.classList.add('hidden');
            selectedDate = null;
            knowledgeOpen = false;
            if (window._lastFocusedBeforeModal) {
              window._lastFocusedBeforeModal.focus();
            }
          },
          { once: true }
        );
      } else {
        modalEl.style.transform = '';
        modalEl.style.opacity = '';
      }
    }
    startY = 0;
    currentY = 0;
  });
})();
document.getElementById('modal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

/* ================================================================
   SYMPTOM ANALYSIS DATA (Barry's view)
   ================================================================ */
/* moved to js/barry.js (BarryModule) */

// Relationship tips for Anđela
/* moved to js/render-love.js */

/* ================================================================
   NEW FEATURES — Hug / Gratitude / Check-in / Song
   ================================================================ */

// ================================================================
// Virtual Hug — redesigned: heartbeat, hug back, streaks, float hearts
// ================================================================
/* moved to js/render-love.js */

// Spawn floating hearts animation
/* Love features (hug, gratitude, checkin, song, knowme, tips) → js/render-love.js */

const PHASE_ANALYSIS = {
  period: {
    name: { sr: 'Menstruacija', en: 'Period', 'zh-CN': '经期' },
    days: { sr: 'Dan 1-7 ciklusa', en: 'Day 1-7 of cycle', 'zh-CN': '周期第1-7天' },
    energy: { sr: '⭐ Niska — odmara se', en: '⭐ Low — resting', 'zh-CN': '⭐ 低——需要休息' },
    libido: { sr: '🔥 Nizak (moguć blagi porast pred kraj)', en: '🔥 Low (may rise slightly toward end)', 'zh-CN': '🔥 低（快结束时可能略有回升）' },
    physical: {
      sr: 'Materica se kontrahuje, gvožđe opada. Može imati: grčeve u stomaku, glavobolju, umor, bol u leđima, nadutost.',
      en: 'Uterus contracting, iron drops. May have: cramps, headache, fatigue, back pain, bloating.',
      'zh-CN': '子宫收缩，铁元素下降。可能有：痛经、头痛、极度疲劳、腰酸、腹胀。',
    },
    emotional: {
      sr: 'Oseća se ranjivo, povučeno. Emocije su intenzivne — može plakati bez razloga. Želi sigurnost i nežnost, ne rešenja.',
      en: 'Feels vulnerable, withdrawn. Emotions intense — may cry without reason. Wants safety and tenderness, not solutions.',
      'zh-CN': '感到脆弱、想独处。情绪强烈——可能没有理由就哭。需要安全感，不需要解决方案。',
    },
    sex: {
      sr: 'Nizak libido. Ne pritiskaj — nežnost bez očekivanja je ono što joj treba. Ako je raspoložena, budi nežan i pažljiv.',
      en: "Low libido. Don't pressure — tenderness without expectation is what she needs. If she's in the mood, be gentle and attentive.",
      'zh-CN': '性欲低。别给她压力——她需要的是无期待的温柔。如果她有兴致，一定要轻柔体贴。',
    },
    support: {
      sr: '🫂 Zagrli je bez razloga • 🍵 Skuvaj topao čaj • 🛏️ Pusti je da spava • 🤐 Ne pametuj — samo slušaj • 🍫 Donesi čokoladu',
      en: "🫂 Hug her without reason • 🍵 Make warm tea • 🛏️ Let her sleep • 🤐 Don't lecture — just listen • 🍫 Bring chocolate",
      'zh-CN': '🫂 无条件抱抱 • 🍵 泡热茶 • 🛏️ 让她睡 • 🤐 别讲道理——就听 • 🍫 带巧克力',
    },
    warning: {
      sr: 'Ne govori "nije to ništa" — za nju JESTE. Ne pokreći teške teme. Ne očekuj seks.',
      en: "Don't say \"it's nothing\" — to her, it IS. Don't bring up heavy topics. Don't expect sex.",
      'zh-CN': '别说"没那么严重"——对她来说就是很严重。别讨论沉重话题。别期待性生活。',
    },
  },
  follicular: {
    name: { sr: 'Folikularna', en: 'Follicular', 'zh-CN': '卵泡期' },
    days: { sr: 'Dan 8-13 ciklusa', en: 'Day 8-13 of cycle', 'zh-CN': '周期第8-13天' },
    energy: { sr: '⭐⭐⭐⭐ Raste — sve više energije', en: '⭐⭐⭐⭐ Rising — more energy each day', 'zh-CN': '⭐⭐⭐⭐ 上升中——精力越来越好' },
    libido: {
      sr: '🔥🔥 Raste postepeno — počinje da se oseća privlačno',
      en: '🔥🔥 Rising gradually — starting to feel attractive',
      'zh-CN': '🔥🔥 逐渐上升——开始感觉自己有魅力',
    },
    physical: {
      sr: 'Estrogen raste! Koža blista, kosa sjajna, telo se oseća jače. Ovo je faza kad izgleda najbolje — primetićeš.',
      en: "Estrogen rising! Skin glows, hair shines, body feels stronger. This is when she looks her best — you'll notice.",
      'zh-CN': '雌激素上升！皮肤发光、头发亮泽、身体更有力。这是她最好看的阶段——你会注意到的。',
    },
    emotional: {
      sr: 'Optimistična, društvena, kreativna. Najbolje vreme za nove planove. Otvorena za razgovor — iskoristi to.',
      en: 'Optimistic, social, creative. Best time for new plans. Open to conversation — use this.',
      'zh-CN': '乐观、爱社交、有创意。最适合制定新计划。愿意聊天——抓住机会。',
    },
    sex: {
      sr: 'Libido raste svakim danom. Još nije na vrhuncu, ali je sve otvorenija za flert i dodir. Odlično vreme za predigru i istraživanje.',
      en: 'Libido rising each day. Not at peak yet, but increasingly open to flirtation and touch. Great time for foreplay and exploration.',
      'zh-CN': '性欲每天都在上升。还没到顶峰，但对调情和触碰越来越开放。适合前戏和探索的好时机。',
    },
    support: {
      sr: '💬 Pričaj o planovima za budućnost • 🎯 Predloži izlazak ili putovanje • 🌸 Kupi cveće — primetiće • 💪 Vežbajte zajedno',
      en: "💬 Talk about future plans • 🎯 Suggest going out or a trip • 🌸 Buy flowers — she'll notice • 💪 Exercise together",
      'zh-CN': '💬 聊未来计划 • 🎯 约她出去或旅行 • 🌸 买花——她一定注意到 • 💪 一起运动',
    },
    warning: {
      sr: 'Ne propusti ovu fazu — ona se otvara ka tebi. Budi prisutan i angažovan.',
      en: "Don't miss this phase — she's opening up to you. Be present and engaged.",
      'zh-CN': '别错过这个阶段——她正在向你敞开心扉。积极参与她的生活。',
    },
  },
  ovulation: {
    name: { sr: 'Ovulacija', en: 'Ovulation', 'zh-CN': '排卵期' },
    days: { sr: 'Dan 14-16 ciklusa', en: 'Day 14-16 of cycle', 'zh-CN': '周期第14-16天' },
    energy: { sr: '⭐⭐⭐⭐⭐ Vrhunac — na maksimumu!', en: '⭐⭐⭐⭐⭐ Peak — at maximum!', 'zh-CN': '⭐⭐⭐⭐⭐ 巅峰——状态最好！' },
    libido: {
      sr: '🔥🔥🔥🔥🔥 VRHUNAC — libido na maksimumu. Ovo su dani kad je najviše zainteresovana za seks.',
      en: "🔥🔥🔥🔥🔥 PEAK — libido at maximum. These are the days she's most interested in sex.",
      'zh-CN': '🔥🔥🔥🔥🔥 最高——性欲达到顶峰。这是她最想要性爱的几天。',
    },
    physical: {
      sr: 'Vrhunac energije i plodnosti. Može osetiti blagi bol u karlici (ovulacioni bol). Bistar sekret — znak plodnosti. Grudi mogu biti osetljivije.',
      en: 'Peak energy and fertility. May feel mild pelvic pain. Clear discharge — sign of fertility. Breasts may be more sensitive.',
      'zh-CN': '能量和生育力巅峰。可能有轻微排卵痛。分泌物清亮——生育力标志。乳房可能更敏感。',
    },
    emotional: {
      sr: 'Samopouzdana, privlačna, magnetična. Oseća se NAJBOLJE u celom ciklusu. Komplimenti joj sad znače najviše — i veruje im.',
      en: 'Confident, attractive, magnetic. Feels her BEST in the whole cycle. Compliments mean the most now — and she believes them.',
      'zh-CN': '自信、迷人、有魅力。整个周期中状态最好。现在夸她最有效——而且她真的会相信。',
    },
    sex: {
      sr: 'Ovo su dani kad je najotvorenija za seks. Njeno telo je bukvalno programirano za intimnost sad. Iniciraj nežno — gotovo sigurno će biti raspoložena. Najbolji dani za začeće.',
      en: "These are the days she's most open to sex. Her body is literally programmed for intimacy now. Initiate gently — she's almost certainly in the mood. Best days for conception.",
      'zh-CN': '这是她最愿意做爱的几天。她的身体此时天然地渴望亲密。温柔地主动——她几乎一定会有回应。最容易受孕的日子。',
    },
    support: {
      sr: '✨ Iskreni komplimenti (izgled, miris, energija) • 💋 Budi romantičan i pažljiv • 🎉 Izvedi je — ples, večera, bilo šta • 🔥 Iniciraj intimnost',
      en: '✨ Genuine compliments (looks, smell, energy) • 💋 Be romantic and attentive • 🎉 Take her out — dancing, dinner, anything • 🔥 Initiate intimacy',
      'zh-CN': '✨ 真诚赞美（外表、气味、能量）• 💋 浪漫体贴 • 🎉 带她出去——跳舞、晚餐 • 🔥 主动亲密',
    },
    warning: {
      sr: 'Ovo su njeni NAJBOLJI dani. Ne preskači ih. Ako postoji dan za romantiku — ovo je taj dan.',
      en: "These are her BEST days. Don't skip them. If there's a day for romance — this is it.",
      'zh-CN': '这是她最好的日子。别错过。如果要选浪漫的一天——就是这天。',
    },
  },
  luteal: {
    name: { sr: 'Lutealna', en: 'Luteal', 'zh-CN': '黄体期' },
    days: { sr: 'Dan 17-28 ciklusa', en: 'Day 17-28 of cycle', 'zh-CN': '周期第17-28天' },
    energy: {
      sr: '⭐⭐ Prvo ok, pred kraj pada — umor raste',
      en: '⭐⭐ OK at first, drops toward end — fatigue grows',
      'zh-CN': '⭐⭐ 前期还行，越往后越累——疲劳加重',
    },
    libido: {
      sr: '🔥🔥 Prvo OK, pred kraj opada. Može varirati — dan da, dan ne.',
      en: '🔥🔥 OK at first, drops toward end. May vary — day yes, day no.',
      'zh-CN': '🔥🔥 前期还行，越往后越低。可能忽高忽低——今天想明天不想。',
    },
    physical: {
      sr: 'Progesteron dominira. Telo zadržava vodu — oseća se naduto. Grudi osetljive. Akne moguće. Pred kraj: umor, žudnja za hranom, glavobolje.',
      en: 'Progesterone dominates. Water retention — feels bloated. Breast tenderness. Acne possible. Near the end: fatigue, cravings, headaches.',
      'zh-CN': '孕激素主导。身体水肿——感觉浮肿。乳房胀痛。可能长痘。快结束时：极度疲劳、特别想吃东西、头痛。',
    },
    emotional: {
      sr: 'PMS faza: raspoloženje varira. Može biti razdražljiva, anksiozna, plačljiva. Važno: OVO NIJE ONA — ovo su hormoni. Ne uzimaj ništa lično.',
      en: "PMS phase: mood swings. May be irritable, anxious, tearful. Important: THIS IS NOT HER — this is hormones. Don't take anything personally.",
      'zh-CN': 'PMS阶段：情绪波动。可能烦躁、焦虑、想哭。重要：这不是真的她——这是荷尔蒙。千万别往心里去。',
    },
    sex: {
      sr: 'Libido varira. U prvoj polovini može biti raspoložena. Pred kraj — verovatno neće biti zainteresovana. Ne pritiskaj. Ako kaže ne — to je NE.',
      en: "Libido varies. First half may be in the mood. Near the end — probably not interested. Don't pressure. If she says no — it's NO.",
      'zh-CN': '性欲忽高忽低。前半段可能有兴致。快结束时——八成不想。别施压。她说不要就是真的不要。',
    },
    support: {
      sr: '🍵 Čaj bez kofeina • 🤐 Slušaj — ne rešavaj • 🍕 Naruči njenu omiljenu hranu • 🌙 Topla kupka, sveće, muzika • 💆 Ponudi masažu',
      en: "🍵 Caffeine-free tea • 🤐 Listen — don't solve • 🍕 Order her favorite food • 🌙 Warm bath, candles, music • 💆 Offer massage",
      'zh-CN': '🍵 无咖啡因茶 • 🤐 听就好——别解决 • 🍕 点她爱吃的 • 🌙 热水澡、蜡烛、音乐 • 💆 主动给她按摩',
    },
    warning: {
      sr: 'Ne svađaj se — ne možeš pobediti protiv hormona. Ne govori "ta ti je opet ono doba". Budi tu, ćuti, zagrli.',
      en: "Don't argue — you can't win against hormones. Don't say \"is it that time again.\" Be there, be quiet, hug her.",
      'zh-CN': '别吵架——你跟荷尔蒙吵不赢。别说"你是不是又来那个了"。在就好、安静、抱住。',
    },
  },
};

function renderBarrySymptomView() {
  const isBarry = activeProfile === 'barry';
  document.getElementById('barry-symptom-view').style.display = isBarry ? '' : 'none';
  document.getElementById('andjela-symptom-view').style.display = isBarry ? 'none' : '';
  if (!isBarry) return;
  const container = document.getElementById('barrySymptomAnalysis');
  const shared = getSharedCyclePhase();
  const phaseKey = shared && shared.phase ? shared.phase : 'general';
  const l = lang || 'sr';
  document.getElementById('bs-title').textContent =
    l === 'sr' ? '🔬 Anđela danas — detaljna analiza' : l === 'en' ? '🔬 Anđela Today — Full Analysis' : '🔬 Anđela 今日详细分析';
  if (phaseKey === 'general' || typeof PHASE_ANALYSIS === 'undefined' || !PHASE_ANALYSIS[phaseKey]) {
    container.innerHTML =
      '<div class="card" style="text-align:center;padding:20px"><span style="font-size:3rem">🌸</span><div style="font-size:.78rem;color:var(--text-muted);margin-top:8px">' +
      (l === 'sr' ? 'Čekam podatke sa Anđelinog telefona...' : l === 'en' ? "Waiting for data from Anđela's phone..." : '等待 Anđela 手机同步数据...') +
      '</div></div>';
    return;
  }
  const pa = PHASE_ANALYSIS[phaseKey];
  const pc = { period: 'var(--love)', follicular: 'var(--sage)', ovulation: 'var(--teal)', luteal: 'var(--lavender)' };
  const pe = { period: '🩸', follicular: '🌱', ovulation: '✨', luteal: '🌙' };
  const color = pc[phaseKey] || 'var(--love)';
  let h = '';
  h +=
    '<div class="card" style="border-left:5px solid ' +
    color +
    ';margin-bottom:10px;background:linear-gradient(135deg,var(--rose-light),var(--card));text-align:center;padding:18px">';
  h += '<div style="font-size:2.5rem;margin-bottom:4px">' + pe[phaseKey] + '</div>';
  h += '<div style="font-size:.95rem;font-weight:800;color:var(--text)">' + (pa.name[l] || pa.name['sr']) + '</div>';
  h += '<div style="font-size:.65rem;color:var(--text-muted)">' + (pa.days[l] || pa.days['sr']) + '</div>';
  if (shared && shared.nextStart) {
    h +=
      '<div style="font-size:.62rem;color:var(--gold);margin-top:2px">📅 ' +
      (l === 'sr' ? 'Sledeća: ' + shared.nextStart : l === 'en' ? 'Next: ' + shared.nextStart : '下次: ' + shared.nextStart) +
      '</div>';
  }
  h += '</div>';

  h += '<div class="card" style="padding:14px;margin-bottom:10px"><div style="display:flex;justify-content:space-around;text-align:center">';
  h +=
    '<div><div style="font-size:.62rem;color:var(--text-muted);margin-bottom:2px">⚡ ' +
    (l === 'sr' ? 'Energija' : l === 'en' ? 'Energy' : '精力') +
    '</div><div style="font-size:.82rem">' +
    (pa.energy[l] || pa.energy['sr']) +
    '</div></div>';
  h +=
    '<div><div style="font-size:.62rem;color:var(--text-muted);margin-bottom:2px">🔥 ' +
    (l === 'sr' ? 'Libido' : l === 'en' ? 'Libido' : '性欲') +
    '</div><div style="font-size:.82rem">' +
    (pa.libido[l] || pa.libido['sr']) +
    '</div></div>';
  h += '</div></div>';

  h +=
    '<div class="card" style="padding:14px;margin-bottom:10px"><div style="font-weight:700;font-size:.74rem;margin-bottom:4px">🩺 ' +
    (l === 'sr' ? 'Fizičke promene' : l === 'en' ? 'Physical Changes' : '身体变化') +
    '</div><div style="font-size:.72rem;color:var(--text-muted);line-height:1.7">' +
    (pa.physical[l] || pa.physical['sr']) +
    '</div></div>';
  h +=
    '<div class="card" style="padding:14px;margin-bottom:10px"><div style="font-weight:700;font-size:.74rem;margin-bottom:4px">💭 ' +
    (l === 'sr' ? 'Emocionalno stanje' : l === 'en' ? 'Emotional State' : '情绪状态') +
    '</div><div style="font-size:.72rem;color:var(--text-muted);line-height:1.7">' +
    (pa.emotional[l] || pa.emotional['sr']) +
    '</div></div>';
  h +=
    '<div class="card" style="padding:14px;margin-bottom:10px;border-left:4px solid var(--love)"><div style="font-weight:700;font-size:.74rem;margin-bottom:4px">🔥 ' +
    (l === 'sr' ? 'Seks i intimnost' : l === 'en' ? 'Sex & Intimacy' : '性爱与亲密') +
    '</div><div style="font-size:.72rem;color:var(--text-muted);line-height:1.7">' +
    (pa.sex[l] || pa.sex['sr']) +
    '</div></div>';
  h +=
    '<div class="card" style="padding:14px;margin-bottom:10px;background:linear-gradient(135deg,var(--teal-light),var(--card))"><div style="font-weight:700;font-size:.74rem;margin-bottom:4px">💡 ' +
    (l === 'sr' ? 'Kako da joj pomogneš' : l === 'en' ? 'How to Support Her' : '怎么帮她') +
    '</div><div style="font-size:.72rem;color:var(--text);line-height:1.8">' +
    (pa.support[l] || pa.support['sr']) +
    '</div></div>';
  h +=
    '<div class="card" style="padding:12px;margin-bottom:10px;background:var(--rose-light);border:1px solid var(--rose)"><div style="font-weight:700;font-size:.7rem;margin-bottom:2px">⚠️ ' +
    (l === 'sr' ? 'Šta NE raditi' : l === 'en' ? 'What NOT to do' : '千万别做') +
    '</div><div style="font-size:.68rem;color:var(--rose-dark);line-height:1.5">' +
    (pa.warning[l] || pa.warning['sr']) +
    '</div></div>';
  container.innerHTML = h;
}

// Share Anđela's symptoms for Barry to see
function updateSharedSymptoms() {
  if (activeProfile !== 'andjela') return;
  const key = fmtDate(today());
  const symptoms = state.symptoms[key];
  if (symptoms) {
    localStorage.setItem('shared-symptoms', JSON.stringify(symptoms));
    pushAllSharedData();
  }
}

// Special badge for Anđela
// Sleep Tracker
function getSpecialDate(d) {
  const annMet = localStorage.getItem('cycle-ann-met') || '2026-03-19';
  const annLove = localStorage.getItem('cycle-ann-love') || '2026-05-07';
  const mmdd = String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const metMMDD = annMet.slice(5);
  const loveMMDD = annLove.slice(5);
  if (mmdd === metMMDD) {
    return {
      icon: '💕',
      type: 'firstmeet',
      title_sr: '✨ Dan kad smo se sreli',
      title_zh: '✨ 初次相遇纪念日',
      desc_sr: 'Najlepši dan — kad smo se prvi put sreli ♥',
      desc_zh: '最美好的一天——我们初次相遇 ♥',
    };
  }
  if (mmdd === loveMMDD) {
    return {
      icon: '💝',
      type: 'monthly',
      title_sr: '♥ Zajedno smo',
      title_zh: '♥ 在一起的纪念日',
      desc_sr: 'Dan kad je sve počelo — ljubav koja traje ♥',
      desc_zh: '一切开始的那一天——永恒的爱 ♥',
    };
  }
  if (annMet) {
    const met = new Date(annMet + 'T00:00:00');
    const diff = daysDiff(met, d0(d));
    if (diff > 0 && diff % 90 === 0 && diff <= 365) {
      return {
        icon: '🌷',
        type: 'monthly',
        title_sr: diff + ' dana od susreta',
        title_zh: '相遇 ' + diff + ' 天',
        desc_sr: diff + ' dana od prvog susreta ♥',
        desc_zh: '相遇 ' + diff + ' 天 ♥',
      };
    }
  }
  return null;
}

/* ================================================================
   BIRTHDAY — check date & render countdown card
   Birthdays stored in localStorage: cycle-bday-andjela, cycle-bday-barry
   Defaults: 13. oktobar (Anđela), 27. avgust (Barry)
   ================================================================ */
function getBirthday(d) {
  const aBday = localStorage.getItem('cycle-bday-andjela') || '10-13';
  const bBday = localStorage.getItem('cycle-bday-barry') || '08-27';
  const mmdd = String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  return mmdd === aBday || mmdd === bBday;
}
function renderBirthdayCard() {
  const card = document.getElementById('birthdayCard');
  const title = document.getElementById('birthday-title');
  const content = document.getElementById('birthday-content');
  if (!card || !title || !content) return;
  const aBday = localStorage.getItem('cycle-bday-andjela') || '10-13';
  const bBday = localStorage.getItem('cycle-bday-barry') || '08-27';
  const td = today();
  const aDate = new Date(td.getFullYear(), parseInt(aBday.split('-')[0]) - 1, parseInt(aBday.split('-')[1]));
  const bDate = new Date(td.getFullYear(), parseInt(bBday.split('-')[0]) - 1, parseInt(bBday.split('-')[1]));
  if (aDate < td) aDate.setFullYear(aDate.getFullYear() + 1);
  if (bDate < td) bDate.setFullYear(bDate.getFullYear() + 1);
  const aDays = Math.ceil((aDate - td) / 86400000);
  const bDays = Math.ceil((bDate - td) / 86400000);
  const closeDays = Math.min(aDays, bDays);
  const isAnyToday = aDays === 365 || aDays === 0 || bDays === 365 || bDays === 0;
  if (isAnyToday) {
    card.style.display = '';
    const who = aDays === 365 || aDays === 0 ? '🎂 Anđela' : '🎂 Barry';
    title.textContent = '🎉 ' + (lang === 'sr' ? 'Rođendan!' : lang === 'en' ? 'Birthday!' : '生日！');
    content.innerHTML = '<div class="text-center" style="font-size:1.2rem;line-height:2">' + who + ' 🎉🎉🎉</div>';
    return;
  }
  if (closeDays <= 30) {
    card.style.display = '';
    const who = aDays < bDays ? '🌸 Anđela' : '👦 Barry';
    title.textContent = '🎂 ' + (lang === 'sr' ? 'Rođendan' : lang === 'en' ? 'Birthday' : '生日');
    content.innerHTML =
      '<div class="text-center" style="font-size:.82rem">' +
      who +
      ' — ' +
      closeDays +
      ' ' +
      (lang === 'sr' ? 'dana' : lang === 'en' ? 'days' : '天') +
      '</div>';
  } else {
    card.style.display = 'none';
  }
}

function renderSpecialBadge() {
  const badge = document.getElementById('specialBadge');
  if (activeProfile !== 'andjela') {
    badge.style.display = 'none';
    return;
  }
  badge.style.display = '';
  const texts =
    lang === 'sr'
      ? ['Ti si jedinstvena ✨', 'Najlepša na svetu 🌸', 'Barryjeva ljubav 💝', 'Jedna jedina 💫']
      : lang === 'en'
        ? ['You are unique ✨', 'Most beautiful 🌸', "Barry's love 💝", 'One and only 💫']
        : ['独一无二的你 ✨', '最美的人 🌸', 'Barry 的爱 💝', '世界上唯一的你 💫'];
  document.getElementById('specialBadgeText').textContent = texts[Math.floor(Math.random() * texts.length)];
}

/* Update shared symptoms when Anđela saves */
const _origSaveSymptom = saveSymptom;
saveSymptom = function () {
  _origSaveSymptom();
  updateSharedSymptoms();
};

// (self-test suite removed in cleanup)

/* ── BOOT: Initialize auth and start the app ─────────────────── */
if (typeof AuthModule !== 'undefined') {
  AuthModule.init();
}
