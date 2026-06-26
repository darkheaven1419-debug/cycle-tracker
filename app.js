'use strict';

/* ================================================================
   NOTE: Global utility functions have been extracted to js/ui-core.js:
   safeParse(), $(), clearElCache(), debounce(), esc(),
   closeModal(), toggleKnowledge(), toast()
   Loaded via <script src="js/ui-core.js"> in index.html.
   ================================================================ */

/* ================================================================
   VERSION
   ================================================================ */
const APP_VERSION = 'v7.1';

/* ================================================================
   SHARED CONSTANTS
   ================================================================ */
const SYMPTOM_TYPES = ['cramps', 'mood', 'flow', 'headache', 'fatigue', 'cravings'];
const SYMPTOM_EMOJIS = { cramps: '🔴', mood: '😤', flow: '💧', headache: '🤕', fatigue: '😴', cravings: '🍫' };
const MOOD_EMOJIS = ['😊', '🥰', '😤', '😴', '😢', '🤩', '😰', '😐'];
const MOOD_KEYS = ['happy', 'loved', 'frustrated', 'tired', 'sad', 'excited', 'anxious', 'meh'];

/* ================================================================
   EXTRACTED to js/ui-core.js
   safeParse(), $(), clearElCache(), debounce()
   ================================================================ */
// Safe localStorage.getItem — returns default on failure
function safeGetItem(key, defaultVal) {
  try {
    const v = localStorage.getItem(key);
    return v != null ? v : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}
// Safe localStorage.setItem
function safeSetItem(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch (e) {
    /* Storage full or disabled */
  }
}
// Safe localStorage.removeItem
function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    /* Storage error, non-critical */
  }
}
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
  const cyc = document.getElementById('cycleCounterCard');
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
    console.warn('[state] Failed to load state:', e.message);
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
    console.warn('[state] Failed to migrate old state:', e.message);
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
function saveStateNow() {
  clearTimeout(_saveTimer);
  clearTimeout(_pushTimer);
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
  pushAllSharedData();
}
let state = loadState();

/* ================================================================
   MOOD & STREAK
   ================================================================ */
/* Mood, love note, forecast, garden moved to js/render-mood.js */
function renderGarden() {
  const plantEl = document.getElementById('gardenPlant');
  if (plantEl) {
    plantEl.style.transform = '';
    plantEl.style.transition = 'all .5s cubic-bezier(.34,1.56,.64,1)';
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
const SD_KEY = 'shared-diary';
const GITHUB_REPO = 'darkheaven1419-debug/cycle-tracker';
const GITHUB_FILE = 'shared-diary.json';
const sharedDiaryViewDate = new Date();
const DATE_STRIP_DAYS = 14; // show 14 days in date strip

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

// Fetch shared diary from GitHub
async function fetchSharedDiaryFromGitHub() {
  const token = getGitHubToken();
  const headers = { Accept: 'application/vnd.github.v3+json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  try {
    const resp = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_FILE, { headers: headers, cache: 'no-store' });
    if (!resp.ok) return null;
    const data = await resp.json();
    const content = decodeURIComponent(escape(atob(data.content)));
    return { data: JSON.parse(content), sha: data.sha };
  } catch (e) {
    return null;
  }
}

// Push shared diary to GitHub
async function pushSharedDiaryToGitHub(diaryData) {
  const token = getGitHubToken();
  if (!token) return false;
  const headers = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' };
  let sha = null;
  try {
    const resp = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_FILE, { headers: headers, cache: 'no-store' });
    if (resp.ok) {
      const d = await resp.json();
      sha = d.sha;
    }
  } catch (e) {
    console.warn('[sync] Failed to fetch GitHub SHA:', e.message);
  }
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(diaryData, null, 2))));
  const body = { message: '💌 Update shared diary', content: content };
  if (sha) body.sha = sha;
  try {
    const putResp = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_FILE, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(body),
    });
    return putResp.ok;
  } catch (e) {
    return false;
  }
}

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
// TRANSLATION
// ==============================
// Translation cache — Map with LRU eviction (max 500 entries)
const _transCache = new Map();
const _TRANS_CACHE_MAX = 500;
function _transCacheSet(key, val) {
  if (_transCache.size >= _TRANS_CACHE_MAX) {
    const firstKey = _transCache.keys().next().value;
    _transCache.delete(firstKey);
  }
  _transCache.set(key, val);
}

async function translateText(text, from, to) {
  if (!text || from === to || text.length < 2) return text;
  const cacheKey = from + '|' + to + '|' + text;
  if (_transCache.has(cacheKey)) return _transCache.get(cacheKey);

  let result = null;

  // 1) Google Translate (newer endpoint, best quality for zh↔sr)
  try {
    const r1 = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + from + '&tl=' + to + '&dt=t&q=' + encodeURIComponent(text));
    const d1 = await r1.json();
    if (d1 && d1[0]) {
      const t = d1[0]
        .map(function (s) {
          return s[0];
        })
        .join('');
      if (t && t !== text) result = t;
    }
  } catch (e) {
    console.warn('[translate] Google API failed:', e.message);
  }

  // 2) MyMemory (free, no key needed, good fallback)
  if (!result) {
    try {
      const pair = from + '|' + to;
      const r2 = await fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=' + pair);
      const d2 = await r2.json();
      if (d2.responseData && d2.responseData.translatedText && d2.responseData.translatedText !== text) {
        result = d2.responseData.translatedText;
      }
    } catch (e) {
      console.warn('[translate] MyMemory failed:', e.message);
    }
  }

  // 3) LibreTranslate (public instance, free/open-source, good for European langs)
  if (!result) {
    try {
      const r3 = await fetch('https://translate.argosopentech.com/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, source: from, target: to, format: 'text' }),
      });
      const d3 = await r3.json();
      if (d3.translatedText && d3.translatedText !== text) result = d3.translatedText;
    } catch (e) {
      console.warn('[translate] LibreTranslate failed:', e.message);
    }
  }

  if (result) {
    _transCacheSet(cacheKey, result);
    return result;
  }
  return null; // all translation APIs exhausted
}
async function translatePartnerEntries() {
  const btn = document.getElementById('translateBtnSm');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳';
  }
  const vl = (lang || 'sr') === 'zh-CN' ? 'zh-CN' : 'sr';
  const pl = activeProfile === 'barry' ? 'sr' : 'zh-CN';
  if (vl === pl) {
    if (btn) {
      btn.textContent = '🌐';
      btn.disabled = false;
    }
    return;
  }
  const els = document.querySelectorAll('[id^="sdp-"]');
  let ok = 0;
  for (let i = 0; i < els.length; i++) {
    const el = els[i];
    const orig = el.getAttribute('data-original');
    if (orig && orig.length > 2) {
      const result = await translateText(orig, pl, vl);
      if (result === null) {
        el.textContent = orig + ' [' + (lang === 'sr' ? 'prevod nije uspeo' : lang === 'en' ? 'translation failed' : '翻译失败') + ']';
        el.style.color = 'var(--text-muted)';
      } else if (result && result !== orig) {
        el.textContent = result;
        el.style.color = 'var(--teal)';
        el.style.fontWeight = '500';
        ok++;
      }
    }
  }
  if (btn) {
    if (ok > 0) {
      btn.textContent = '✅';
      btn.style.borderColor = 'var(--teal)';
      btn.style.color = 'var(--teal)';
    } else {
      btn.textContent = '⚠️';
      btn.style.borderColor = '#E53935';
      btn.style.color = '#E53935';
      btn.disabled = false;
      setTimeout(function () {
        if (btn) {
          btn.textContent = '🌐';
          btn.style.borderColor = '';
          btn.style.color = '';
          btn.disabled = false;
        }
      }, 3000);
    }
  }
}

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
  lang = savedLang && validLangs[savedLang] ? savedLang : defaultLang;
  // ALWAYS save the corrected lang
  if (!savedLang) localStorage.setItem(profileKey('cycle-lang'), lang);
  theme = localStorage.getItem(profileKey('cycle-theme')) || 'light';
  annDateMet = localStorage.getItem('cycle-ann-met') || '2026-03-19';
  annDateLove = localStorage.getItem('cycle-ann-love') || '2026-05-07';
}
function setLang(l) {
  lang = l;
  document.documentElement.setAttribute('lang', l);
  localStorage.setItem(profileKey('cycle-lang'), l);
  localStorage.setItem('cycle-lang', l);
}
function applyTheme(th) {
  theme = th;
  localStorage.setItem(profileKey('cycle-theme'), th);
  localStorage.setItem('cycle-theme', th);
  document.documentElement.setAttribute('data-theme', th);
  document.getElementById('themeBtn').textContent = th === 'dark' ? '☀️' : '🌙';
  const sel = document.getElementById('set-theme');
  if (sel) sel.value = th;
}
// switchLanguage defined below after STATE vars
function switchTheme(th) {
  applyTheme(th);
}

/* ================================================================
   APP CONSTANTS — named values for maintainability
   ================================================================ */
const DEBOUNCE_SAVE_MS = 200; // localStorage save debounce
const DEBOUNCE_PUSH_MS = 1500; // GitHub push debounce
const SYNC_INTERVAL_MS = 120000; // Cross-device pull interval (2 min)
const MAX_SHARED_RETRY = 3; // GitHub sync retry attempts
const MAX_DIARY_CHARS = 200; // Shared diary field character limit

/* ================================================================
   I18N HELPERS
   ================================================================ */
// i18n helper L() defined below (line ~1647) — handles both object and string args
// langName() defined in js/chinese-learn.js — 3-level language fallback for object lookups

/* ================================================================
   MODIFIED: init
   ================================================================ */
// loadPerProfileSettings() is called in the INIT section below
let lang = localStorage.getItem('cycle-lang') || 'sr';
let theme = localStorage.getItem('cycle-theme') || 'light';
let annDateMet = localStorage.getItem('cycle-ann-met') || '2026-03-19';
let annDateLove = localStorage.getItem('cycle-ann-love') || '2026-05-07';

// ===== DATA BACKUP & RESTORE =====
function exportAllData() {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    exportedBy: activeProfile,
    diary: JSON.parse(localStorage.getItem('shared-diary') || '{}'),
    learningProgress: JSON.parse(localStorage.getItem('shared-learning-progress') || '{}'),
    learningComments: JSON.parse(localStorage.getItem('shared-learning-comments') || '[]'),
    learningPoints: JSON.parse(localStorage.getItem('shared-learning-points') || '{}'),
    voiceData: JSON.parse(localStorage.getItem('shared-voice-data') || '{}'),
    sunCounter: JSON.parse(localStorage.getItem('shared-sun-counter') || '{}'),
    settings: {
      activeProfile: activeProfile,
      lang: lang,
      theme: theme,
    },
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'anđelin-ciklus-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('📦 ' + L('Podaci izvezeni!', 'Data exported!', '数据已导出！'));
}

function importAllData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function (e) {
    const file = e.target.files[0];
    if (!file) return;
    if (
      !confirm(
        L(
          '⚠️ Ovo će PREBRISATI sve trenutne podatke. Nastaviti?',
          '⚠️ This will OVERWRITE all current data. Continue?',
          '⚠️ 此操作将覆盖所有当前数据，是否继续？'
        )
      )
    ) {
      return;
    }
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const backup = JSON.parse(ev.target.result);
        if (backup.diary) localStorage.setItem('shared-diary', JSON.stringify(backup.diary));
        if (backup.learningProgress) localStorage.setItem('shared-learning-progress', JSON.stringify(backup.learningProgress));
        if (backup.learningComments) localStorage.setItem('shared-learning-comments', JSON.stringify(backup.learningComments));
        if (backup.learningPoints) localStorage.setItem('shared-learning-points', JSON.stringify(backup.learningPoints));
        if (backup.voiceData) localStorage.setItem('shared-voice-data', JSON.stringify(backup.voiceData));
        if (backup.settings) {
          if (backup.settings.lang) {
            lang = backup.settings.lang;
            setLang(lang);
          }
          if (backup.settings.theme) {
            theme = backup.settings.theme;
            applyTheme(theme);
          }
        }
        pushAllSharedData();
        toast('✅ ' + L('Podaci vraćeni! Osvežavanje...', 'Data restored! Refreshing...', '数据已恢复！刷新中...'));
        setTimeout(function () {
          location.reload();
        }, 1500);
      } catch (e) {
        toast('❌ ' + L('Neispravan fajl', 'Invalid file', '无效文件'));
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ===== FESTIVAL THEME =====
function getFestivalTheme() {
  const t = new Date();
  const k = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  const L = {
    2025: { s: '2025-01-29', m: '2025-10-06' },
    2026: { s: '2026-02-17', m: '2026-09-25' },
    2027: { s: '2027-02-06', m: '2027-10-14' },
    2028: { s: '2028-01-26', m: '2028-10-03' },
    2029: { s: '2029-02-13', m: '2029-09-28' },
  };
  const ld = L[t.getFullYear()];
  if (ld) {
    const ss = new Date(ld.s + 'T00:00:00');
    const se = new Date(ss);
    se.setDate(se.getDate() + 3);
    if (t >= ss && t <= se) return 'festival-spring';
    if (k === ld.m) return 'festival-midautumn';
  }
  const mmdd = String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  if (mmdd === '01-07') return 'festival-orthodoxmas';
  if (mmdd === '01-27') return 'festival-sava';
  if (mmdd === '02-14') return 'festival-valentine';
  if (mmdd === '05-09') return 'festival-victory';
  const ORTHODOX_EASTER = { 2025: '2025-04-20', 2026: '2026-04-12', 2027: '2027-05-02', 2028: '2028-04-16', 2029: '2029-04-08' };
  const oe = ORTHODOX_EASTER[t.getFullYear()];
  if (oe && k === oe) return 'festival-easter';
  if (mmdd === '01-01') return 'festival-newyear';
  return '';
}
function applyFestivalTheme() {
  const cls = getFestivalTheme();
  document.body.classList.forEach(function (c) {
    if (c.startsWith('festival-')) document.body.classList.remove(c);
  });
  if (cls) document.body.classList.add(cls);
  const old = document.getElementById('festivalDecorations');
  if (old) old.remove();
  let icons = null,
    count = 0;
  if (cls === 'festival-spring') {
    icons = ['🏮', '🧧', '🎆', '🧨'];
    count = 12;
  } else if (cls === 'festival-midautumn') {
    icons = ['🌕', '🐰', '🥮', '🏮'];
    count = 10;
  } else if (cls === 'festival-valentine') {
    icons = ['💕', '💖', '💗', '🌸', '❤️'];
    count = 15;
  } else if (cls === 'festival-newyear') {
    icons = ['🎆', '✨', '🎉', '🌟'];
    count = 12;
  } else if (cls === 'festival-sava') {
    icons = ['📚', '✝️', '🇷🇸', '🕊️'];
    count = 8;
  } else if (cls === 'festival-orthodoxmas') {
    icons = ['❄️', '🎄', '✝️', '🕯️'];
    count = 8;
  } else if (cls === 'festival-easter') {
    icons = ['🥚', '🐇', '🌸', '🕊️'];
    count = 10;
  } else if (cls === 'festival-victory') {
    icons = ['🕊️', '🌺', '🎖️', '✨'];
    count = 8;
  }
  if (!icons) return;
  const c = document.createElement('div');
  c.className = 'festival-decorations';
  c.id = 'festivalDecorations';
  for (let i = 0; i < count; i++) {
    const d = document.createElement('span');
    d.className = 'festival-deco';
    d.textContent = icons[i % icons.length];
    d.style.left = 2 + Math.random() * 94 + '%';
    d.style.fontSize = 0.8 + Math.random() * 1.8 + 'rem';
    d.style.animationDelay = Math.random() * 6 + 's';
    d.style.animationDuration = 4 + Math.random() * 8 + 's';
    c.appendChild(d);
  }
  document.body.appendChild(c);
}

// ===== SEASONAL DECOR =====
function applySeasonalDecor() {
  const cls = getFestivalTheme();
  if (cls) return;
  const m = new Date().getMonth();
  let icons = null,
    count = 0;
  if (m >= 2 && m <= 4) {
    icons = ['🌸', '🌷', '💮', '🌿'];
    count = 8;
  } else if (m >= 5 && m <= 7) {
    icons = ['☀️', '🌻', '🍦', '🦋'];
    count = 6;
  } else if (m >= 8 && m <= 10) {
    icons = ['🍂', '🍁', '🎃', '🌾'];
    count = 8;
  } else {
    icons = ['❄️', '⛄', '🧣', '✨'];
    count = 6;
  }
  const old = document.getElementById('seasonalDecorations');
  if (old) old.remove();
  const c = document.createElement('div');
  c.className = 'seasonal-deco';
  c.id = 'seasonalDecorations';
  for (let i = 0; i < count; i++) {
    const d = document.createElement('span');
    d.textContent = icons[i % icons.length];
    d.style.left = 3 + Math.random() * 94 + '%';
    d.style.fontSize = 0.7 + Math.random() * 1.2 + 'rem';
    d.style.animationDelay = Math.random() * 8 + 's';
    c.appendChild(d);
  }
  document.body.appendChild(c);
}
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
const DASH_I18N = {
  barry: {
    dashTitle: '🏠 主页',
    welcomeBack: '欢迎回来，',
    todayCulture: '今日文化知识',
    goDiary: '📝 写日记',
    goLearn: '📚 中华文化',
    goCalendar: '📅 查看日历',
    connectQ: '💭 今天的对话',
    refreshQ: '🔄 换一个问题',
    todayPhase: '今日阶段',
    todayMoodDash: '今日心情',
    todayStreak: '连续打卡',
    todayCycles: '周期总数',
    avgAbbr: '平均',
  },
  andjela: {
    dashTitle: '🏠 Početna',
    welcomeBack: 'Dobrodošla nazad, ',
    todayCulture: 'Današnje kulturno znanje',
    goDiary: '📝 Dnevnik',
    goLearn: '📚 Kineska kultura',
    goCalendar: '📅 Kalendar',
    connectQ: '💭 Pitanje dana',
    refreshQ: '🔄 Drugo pitanje',
    todayPhase: 'Trenutna faza',
    todayMoodDash: 'Raspoloženje',
    todayStreak: 'Niz dana',
    todayCycles: 'Ukupno ciklusa',
    avgAbbr: 'Prosek',
  },
};
function dl(key) {
  const profile = (lang || '').indexOf('zh') === 0 ? 'barry' : 'andjela';
  const p = DASH_I18N[profile] || DASH_I18N.andjela;
  return p[key] || DASH_I18N.andjela[key] || key;
}
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
function getDailyQuestion() {
  const qs = CONVERSATION_QUESTIONS[lang] || CONVERSATION_QUESTIONS['sr'];
  const idx = new Date().getDate() % qs.length;
  return qs[idx];
}
function initDashboard() {
  if (getGitHubToken()) {
    pullAllSharedData().then(function () {
      renderDashboard();
    });
  } else {
    renderDashboard();
  }
}
function renderDashboard() {
  const panel = document.getElementById('panel-dashboard');
  if (!panel) return;
  const myName = activeProfile === 'andjela' ? '🌸 Anđela' : '👦 Barry';
  let h = '';
  h += '<div class=\"dash-welcome\">' + dl('welcomeBack') + '<strong>' + myName + '</strong></div>';
  // Today's overview strip
  const predDash = predict();
  const tdDash = today();
  const phaseDash = getPhase(tdDash, predDash);
  const pe = {};
  pe['period-on'] = '🩸';
  pe['period-mid'] = '🩸';
  pe['period-pred-first'] = '🔮';
  pe['period-pred'] = '🔮';
  pe['ovulation'] = '🥚';
  pe['fertile'] = '🌱';
  pe['luteal'] = '🌙';
  pe['follicular'] = '🌿';
  const phLabel = t('phaseBadges')[phaseDash] || '--';
  const tm = getMood(fmtDate(tdDash));
  const strk = calculateStreak();
  const sc = state.records.length;
  const avgD = predDash.avgCycle || '--';
  h +=
    '<div class=\"card dash-card\" style=\"text-align:center\"><div style=\"display:flex;justify-content:space-around;align-items:center;flex-wrap:wrap;gap:8px\">';
  h +=
    '<div style=\"text-align:center\"><div style=\"font-size:1.4rem\">' +
    (pe[phaseDash] || '📊') +
    '</div><div style=\"font-size:.65rem;font-weight:700;color:var(--text)\">' +
    dl('todayPhase') +
    '</div><div style=\"font-size:.58rem;color:var(--text-muted)\">' +
    phLabel +
    '</div></div>';
  h +=
    '<div style=\"text-align:center\"><div style=\"font-size:1.4rem\">' +
    (tm ? MOOD_EMOJIS[MOOD_KEYS.indexOf(tm)] : '🌤️') +
    '</div><div style=\"font-size:.65rem;font-weight:700;color:var(--text)\">' +
    dl('todayMoodDash') +
    '</div><div style=\"font-size:.58rem;color:var(--text-muted)\">' +
    (tm ? t('moodNames')[MOOD_KEYS.indexOf(tm)] : lang === 'sr' ? 'Nije uneto' : lang === 'en' ? 'Not set' : '未记录') +
    '</div></div>';
  h +=
    '<div style=\"text-align:center\"><div style=\"font-size:1.4rem\">🔥</div><div style=\"font-size:.65rem;font-weight:700;color:var(--text)\">' +
    dl('todayStreak') +
    '</div><div style=\"font-size:.58rem;color:var(--text-muted)\">' +
    strk +
    ' ' +
    (lang === 'sr' ? 'dana' : lang === 'en' ? 'days' : '天') +
    '</div></div>';
  h +=
    '<div style=\"text-align:center\"><div style=\"font-size:1.4rem\">📊</div><div style=\"font-size:.65rem;font-weight:700;color:var(--text)\">' +
    dl('todayCycles') +
    '</div><div style=\"font-size:.58rem;color:var(--text-muted)\">' +
    sc +
    ' / ' +
    dl('avgAbbr') +
    ' ' +
    avgD +
    'd</div></div>';
  h += '</div></div>';
  // Today's holiday highlight
  const todayKey = fmtDate(today());
  const todayHolidays = getHoliday(todayKey);
  if (todayHolidays.length > 0) {
    h +=
      '<div class=\"card dash-card\" style=\"background:linear-gradient(135deg,var(--rose-light),var(--dust));border:1px solid var(--gold)\"><h4>🎌 ' +
      (lang === 'sr' ? 'Današnji praznik' : lang === 'en' ? "Today's Holiday" : '今日节日') +
      '</h4>' +
      todayHolidays
        .map(function (h) {
          return (
            '<div style=\"font-size:.8rem;font-weight:700;color:var(--love)\">' +
            h.icon +
            ' ' +
            (h.name[lang] || h.name['sr']) +
            '</div><div style=\"font-size:.68rem;color:var(--text-muted);margin-top:4px\">' +
            (h.desc[lang] || h.desc['sr']) +
            '</div>'
          );
        })
        .join('<div style=\"height:4px\"></div>') +
      '</div>';
  }
  // Daily connection question
  h +=
    '<div class=\"card dash-card\" style=\"border-left:3px solid var(--teal)\"><h4>' +
    dl('connectQ') +
    '</h4><div style=\"font-size:.82rem;color:var(--text);line-height:1.6;font-style:italic;margin-bottom:8px\" id=\"dailyConnectQ\">' +
    getDailyQuestion() +
    '</div><button class=\"dash-link-btn\" onclick=\"document.getElementById(\'dailyConnectQ\').textContent=getDailyQuestion();\" style=\"font-size:.62rem;padding:4px 12px\">' +
    dl('refreshQ') +
    '</button></div>';
  // Culture card
  if (CULTURE_KNOWLEDGE && CULTURE_KNOWLEDGE.length > 0) {
    const tc = CULTURE_KNOWLEDGE[getTodaysCultureIndex()];
    if (tc) {
      const isZh = (lang || '').indexOf('zh') === 0;
      const isEn = (lang || '').indexOf('en') === 0;
      const tcTitle = isZh ? tc.zh : isEn && tc.en ? tc.en : tc.sr;
      const tcDesc = isZh ? (CULTURE_DESC_ZH && CULTURE_DESC_ZH[tc.id]) || tc.desc : isEn && tc.desc_en ? tc.desc_en : tc.desc_sr || tc.desc;
      h +=
        '<div class=\"card dash-card\"><h4>' +
        tc.icon +
        ' ' +
        dl('todayCulture') +
        '</h4><div style=\"font-size:.85rem;font-weight:700;color:var(--love);margin-bottom:4px\">' +
        tcTitle +
        '</div><div style=\"font-size:.65rem;color:var(--text-muted);line-height:1.5\">' +
        tcDesc.substring(0, 120) +
        '...</div></div>';
    }
  }
  // Quick links
  h +=
    '<div class=\"card dash-card\"><div class=\"dash-links\"><button class=\"dash-link-btn\" onclick=\"switchToTab(\'diary\')\">' +
    dl('goDiary') +
    '</button><button class=\"dash-link-btn\" onclick=\"switchToTab(\'chinese\')\">' +
    dl('goLearn') +
    '</button><button class=\"dash-link-btn\" onclick=\"goToday();switchToTab(\'stats\')\">' +
    dl('goCalendar') +
    '</button></div></div>';
  panel.innerHTML = h;
}
function switchToTab(tabId) {
  const btn = document.querySelector('.tab[data-panel=\"' + tabId + '\"]');
  if (btn) btn.click();
}

/* ================================================================
   STATS PANEL RENDERER — Canvas charts + summary cards
   ================================================================ */
function renderStatsPanel() {
  const panel = document.getElementById('panel-stats');
  if (!panel || !panel.classList.contains('active')) return;
  const pred = predict();
  const td = today();

  // --- Summary cards ---
  const grid = document.getElementById('statsSummaryGrid');
  if (grid) {
    const clen = state.records.length;
    const streak = calculateStreak();
    const phase = getPhase(td, pred);
    const pe2 = { 'period-on': '🩸', 'period-mid': '🩸', ovulation: '🥚', fertile: '🌱', luteal: '🌙', follicular: '🌿' };
    const phaseName = t('phaseBadges')[phase] || '--';
    const phIcon = pe2[phase] || '📊';
    const rl = t('statsRegLabels');
    const regLabel = clen >= 2 ? rl[pred.confidence] : '--';
    const rc = { high: 'var(--sage)', medium: 'var(--gold)', low: 'var(--rose)' };
    const regColor = rc[pred.confidence] || 'var(--text-muted)';
    grid.innerHTML =
      '<div class="stats-mini-card card-accent-rose"><span class="mini-icon">🩸</span><div class="mini-value">' +
      clen +
      '</div><div class="mini-label" id="smini-cycles">' +
      t('stats.count') +
      '</div></div>' +
      '<div class="stats-mini-card card-accent-sage"><span class="mini-icon">📏</span><div class="mini-value">' +
      (pred.avgCycle || '--') +
      '<span style="font-size:.65rem">d</span></div><div class="mini-label" id="smini-avg">' +
      t('stats.avg') +
      '</div><div class="mini-sub" id="smini-range">' +
      (clen >= 2 ? pred.minCycle + '–' + pred.maxCycle + 'd' : '--') +
      '</div></div>' +
      '<div class="stats-mini-card card-accent-teal"><span class="mini-icon">' +
      phIcon +
      '</span><div class="mini-value" style="font-size:.9rem;line-height:1.6">' +
      phaseName +
      '</div><div class="mini-label" id="smini-phase">' +
      (lang === 'sr' ? 'Trenutna faza' : lang === 'en' ? 'Current Phase' : '当前阶段') +
      '</div></div>' +
      '<div class="stats-mini-card card-accent-gold"><span class="mini-icon">🎯</span><div class="mini-value" style="color:' +
      regColor +
      '">' +
      regLabel +
      '</div><div class="mini-label" id="smini-reg">' +
      t('stats.reg') +
      '</div><div class="mini-sub">' +
      (clen >= 2 ? 'σ=' + pred.stdDev : '--') +
      '</div></div>';
  }

  // --- Cycle trend chart ---
  const trendCanvas = document.getElementById('chartCycleTrend');
  const trendEmpty = document.getElementById('chartCycleEmpty');
  document.getElementById('schart-cycle-title').textContent = t('statsTrendTitle');
  if (trendCanvas && pred.cycles && pred.cycles.length >= 2) {
    trendCanvas.parentElement.style.display = '';
    if (trendEmpty) trendEmpty.style.display = 'none';
    const recentCycles = pred.cycles.slice(-8);
    const labels = [];
    for (let ci = 0; ci < recentCycles.length; ci++) {
      labels.push('C' + (pred.cycles.length - recentCycles.length + ci + 1));
    }
    ChartRenderer.drawLineChart(trendCanvas, recentCycles, labels, {
      width: 500,
      height: 200,
      avgLine: pred.avgCycle,
      avgLabel: t('statsTrendAvg'),
      emptyText: t('statsTrendEmpty'),
    });
  } else if (trendCanvas) {
    trendCanvas.parentElement.style.display = 'none';
    if (trendEmpty) {
      trendEmpty.style.display = '';
      trendEmpty.textContent = t('statsTrendNeed');
    }
  }

  // --- Mood donut chart ---
  const moodCanvas = document.getElementById('chartMoodDonut');
  const moodEmpty = document.getElementById('chartMoodEmpty');
  const moodLegend = document.getElementById('chartMoodLegend');
  document.getElementById('schart-mood-title').textContent = t('statsMoodTitle');
  if (moodCanvas && state.moods) {
    const moodCounts = {};
    const moodKeysArr = Object.keys(state.moods);
    for (let mi = 0; mi < moodKeysArr.length; mi++) {
      const mk = state.moods[moodKeysArr[mi]].mood;
      moodCounts[mk] = (moodCounts[mk] || 0) + 1;
    }
    const segments = [];
    const moodColors = ['#c45a6b', '#d4bfb5', '#E57373', '#b8a0c8', '#5e8b7a', '#FFB74D', '#80a590', '#bdbdbd'];
    for (let mj = 0; mj < MOOD_KEYS.length; mj++) {
      if (moodCounts[MOOD_KEYS[mj]]) {
        segments.push({ label: t('moodNames')[mj], value: moodCounts[MOOD_KEYS[mj]], color: moodColors[mj] });
      }
    }
    if (segments.length > 0) {
      moodCanvas.parentElement.style.display = '';
      if (moodEmpty) moodEmpty.style.display = 'none';
      const legendData = ChartRenderer.drawDonutChart(moodCanvas, segments, {
        width: 260,
        height: 200,
        centerLabel: t('statsMoodCenter'),
        emptyText: t('statsMoodEmpty'),
      });
      if (moodLegend && legendData.length > 0) {
        moodLegend.innerHTML = legendData
          .map(function (ld) {
            return '<span><span class="legend-dot" style="background:' + ld.color + '"></span>' + ld.label + ' (' + ld.pct + '%)</span>';
          })
          .join('');
      }
    } else {
      moodCanvas.parentElement.style.display = 'none';
      if (moodEmpty) {
        moodEmpty.style.display = '';
        moodEmpty.textContent = t('statsMoodNoRecords');
      }
      if (moodLegend) moodLegend.innerHTML = '';
    }
  }

  // --- Symptom bar chart ---
  const symptomCanvas = document.getElementById('chartSymptomBar');
  const symptomEmpty = document.getElementById('chartSymptomEmpty');
  document.getElementById('schart-symptom-title').textContent = t('statsSympTitle');
  if (symptomCanvas && state.symptoms) {
    const sympKeysArr = Object.keys(state.symptoms);
    const sympFreq = { cramps: 0, mood: 0, flow: 0, headache: 0, fatigue: 0, cravings: 0 };
    const sympEmojis = { cramps: '😣', mood: '😊', flow: '💧', headache: '🤕', fatigue: '😴', cravings: '🍫' };
    for (let si2 = 0; si2 < sympKeysArr.length; si2++) {
      const sv = state.symptoms[sympKeysArr[si2]];
      for (const sk in sympFreq) {
        if (sv[sk] && sv[sk] > 0) sympFreq[sk]++;
      }
    }
    const sympNames = t('symptoms');
    const sympOrder = ['cramps', 'mood', 'flow', 'headache', 'fatigue', 'cravings'];
    const sympBarColors = ['#c45a6b', '#FFB74D', '#5e8b7a', '#b8a0c8', '#a0b0c0', '#d4bfb5'];
    const barData = [];
    for (let sn2 = 0; sn2 < sympOrder.length; sn2++) {
      const k = sympOrder[sn2];
      barData.push({ label: sympEmojis[k] + ' ' + sympNames[k], value: sympFreq[k], color: sympBarColors[sn2] });
    }
    barData.sort(function (a, b) {
      return b.value - a.value;
    });
    let hasSympData = false;
    for (let bj = 0; bj < barData.length; bj++) {
      if (barData[bj].value > 0) {
        hasSympData = true;
        break;
      }
    }
    if (hasSympData) {
      symptomCanvas.parentElement.style.display = '';
      if (symptomEmpty) symptomEmpty.style.display = 'none';
      ChartRenderer.drawBarChart(symptomCanvas, barData, {
        width: 460,
        height: 180,
        emptyText: t('statsSympEmpty'),
      });
    } else {
      symptomCanvas.parentElement.style.display = 'none';
      if (symptomEmpty) {
        symptomEmpty.style.display = '';
        symptomEmpty.textContent = t('statsSympNoRecords');
      }
    }
  }

  // --- Prediction highlight ---
  const clen2 = state.records.length;
  const ph2 = document.getElementById('predictionHighlight');
  if (ph2 && pred.nextStart) {
    ph2.style.display = '';
    const daysUntil = daysDiff(td, pred.nextStart);
    const rl2 = t('statsRegLabels');
    document.getElementById('predMainNext').textContent =
      daysUntil >= 0
        ? t('statsDaysUntil') + ' ' + daysUntil + ' ' + t('statsDaysUntilEnd')
        : t('statsDaysLate') + ' ' + Math.abs(daysUntil) + ' ' + t('statsDaysLateEnd');
    document.getElementById('predSubConf').textContent =
      clen2 >= 2 ? t('statsConfidence') + rl2[pred.confidence] + ' (±' + pred.stdDev + ')' : t('statsNeedCycles');
    document.getElementById('predChipOv').textContent = pred.ovulation ? fmtDate(pred.ovulation) : '--';
    document.getElementById('predChipOvLabel').textContent = t('statsOvLabel');
    document.getElementById('predChipFert').textContent =
      pred.fertileStart && pred.fertileEnd ? fmtDate(pred.fertileStart) + ' ~ ' + fmtDate(pred.fertileEnd) : '--';
    document.getElementById('predChipFertLabel').textContent = t('statsFertLabel');
    document.getElementById('predChipFuture').textContent =
      pred.futurePeriods.length > 0
        ? pred.futurePeriods
            .map(function (fp) {
              return fmtDate(fp.start);
            })
            .join(', ')
        : '--';
    document.getElementById('predChipFutureLabel').textContent = t('statsFutureLabel');
    document.getElementById('predChipReg').textContent = clen2 >= 2 ? rl2[pred.confidence] + ' ±' + pred.stdDev : '--';
    document.getElementById('predChipRegLabel').textContent = t('statsRegLabel');
  } else if (ph2) {
    ph2.style.display = 'none';
  }

  // --- Timeline ---
  const tlRow = document.getElementById('timelineRow');
  document.getElementById('schart-history-title').textContent = t('statsTimelineTitle');
  document.getElementById('tleg-short').textContent = t('statsTimelineShort');
  document.getElementById('tleg-normal').textContent = t('statsTimelineNormal');
  document.getElementById('tleg-long').textContent = t('statsTimelineLong');
  if (tlRow && pred.cycles.length > 0) {
    const recent = pred.cycles.slice(-12),
      avg = pred.avgCycle;
    tlRow.innerHTML = recent
      .map(function (cy) {
        let cls = 'normal';
        if (cy < avg - 3) cls = 'short';
        else if (cy > avg + 3) cls = 'long';
        return '<span class="timeline-dot ' + cls + '" title="' + cy + 'd" onclick="toast(\'' + cy + ' ' + t('day') + '\')"></span>';
      })
      .join('');
  }

  // --- Relationship section label ---
  const sectRel = document.getElementById('sect-relationship');
  if (sectRel) {
    sectRel.textContent = t('sectRelationship');
  }
}

// ===== DATA LOADER: fetch JSON files =====
let _dataLoaded = false;
let _dataLoadPromise = null;

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
  // Hide loader IMMEDIATELY
  const loader = document.getElementById('appLoader');
  if (loader) {
    loader.style.display = 'none';
    if (loader.parentNode) loader.parentNode.removeChild(loader);
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js?v=8').catch(function () {});
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
}

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

function t(key, fallback) {
  // Check I18N_EXT first (new features), then main I18N
  const keys = key.split('.');
  let val = I18N_EXT[lang] || I18N_EXT['sr'];
  let found = false;
  for (const k of keys) {
    if (val && val[k] !== undefined) {
      val = val[k];
      found = true;
    } else {
      found = false;
      break;
    }
  }
  if (found) return val;
  val = I18N[lang] || I18N['sr'];
  for (const k of keys) {
    if (val && val[k] !== undefined) val = val[k];
    else return fallback || key;
  }
  return val;
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

function getHoliday(dateKey) {
  return HOLIDAYS.filter(function (h) {
    return h.d === dateKey;
  });
}

// Holiday countdown: find next upcoming holiday within 60 days
function renderUpcomingHoliday() {
  const el = document.getElementById('holidayCountdown');
  if (!el) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limit = new Date(today);
  limit.setDate(limit.getDate() + 60);
  let upcoming = null;
  for (let i = 0; i < HOLIDAYS.length; i++) {
    const d = new Date(HOLIDAYS[i].d + 'T00:00:00');
    if (d >= today && d <= limit) {
      if (!upcoming || d < new Date(upcoming.d + 'T00:00:00')) upcoming = HOLIDAYS[i];
    }
  }
  if (upcoming) {
    const days = Math.ceil((new Date(upcoming.d + 'T00:00:00') - today) / 86400000);
    const name = upcoming.name[lang] || upcoming.name['sr'];
    const daysText = days === 0 ? t('holidayToday') : t('holidayDaysAway') + ' ' + days + ' ' + t('day');
    el.style.display = '';
    el.textContent = '🎌 ' + name + ' · ' + daysText;
  } else {
    el.style.display = 'none';
  }
}
// Month holiday summary: show all holidays in current view month
function renderMonthHolidaySummary() {
  const el = document.getElementById('holidaySummary');
  if (!el) return;
  const m = viewMonth;
  const y = viewYear;
  const monthHolidays = [];
  for (let i = 0; i < HOLIDAYS.length; i++) {
    const d = new Date(HOLIDAYS[i].d + 'T00:00:00');
    if (d.getMonth() === m && d.getFullYear() === y) monthHolidays.push(HOLIDAYS[i]);
  }
  if (monthHolidays.length === 0) {
    el.style.display = 'none';
    return;
  }
  el.style.display = '';
  const flag = function (c) {
    return c === 'cn' ? '🇨🇳' : '🇷🇸';
  };
  el.innerHTML = monthHolidays
    .sort(function (a, b) {
      return new Date(a.d + 'T00:00:00') - new Date(b.d + 'T00:00:00');
    })
    .map(function (h) {
      const day = h.d.split('-')[2].replace(/^0/, '');
      return '<span>' + flag(h.country) + ' ' + h.icon + ' ' + (h.name[lang] || h.name[lang.split('-')[0]] || h.name['sr']) + ' ' + day + '</span>';
    })
    .join('');
}

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
function loadCalendarData(cb) {
  if (calendarExtraData) {
    cb(calendarExtraData);
    return;
  }
  const cached = localStorage.getItem('cycle-caldata');
  if (cached) {
    try {
      calendarExtraData = JSON.parse(cached);
      cb(calendarExtraData);
      return;
    } catch (e) {
      _dbg('[caldata] Bad cache');
    }
  }
  fetch('calendar-data.json')
    .then(function (r) {
      return r.json();
    })
    .then(function (d) {
      calendarExtraData = d;
      localStorage.setItem('cycle-caldata', JSON.stringify(d));
      cb(d);
    })
    .catch(function () {});
}
function toggleHolidayStory(uid, date, country) {
  const detail = document.getElementById('hd-' + uid);
  const nameEl = document.getElementById('hn-' + uid);
  if (!detail || !nameEl) return;
  const isOpen = detail.classList.contains('open');
  if (isOpen) {
    detail.classList.remove('open');
    nameEl.textContent = nameEl.textContent.replace(' ▴', ' ▾');
    return;
  }
  loadCalendarData(function (data) {
    let story = null;
    (data.holidays || []).forEach(function (h) {
      if (h.date === date && h.country === (country === 'cn' ? 'china' : 'serbia')) story = h.story;
    });
    if (story) {
      const txt = story[lang] || story[lang.split('-')[0]] || story['sr'];
      if (txt) detail.textContent = txt;
    }
    detail.classList.add('open');
    nameEl.textContent = nameEl.textContent.replace(' ▾', ' ▴');
  });
}

/* ================================================================
   ROMANTIC TOUCHES
   ================================================================ */
/* moved to js/render-misc.js */
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
let viewYear = today().getFullYear(),
  viewMonth = today().getMonth();
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
  const wd = t('weekdays');
  document.getElementById('weekdaysRow').innerHTML =
    '<span></span>' +
    wd
      .map(function (d, i) {
        return '<span' + (i >= 5 ? ' style="color:var(--rose);opacity:.6"' : '') + '>' + d + '</span>';
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
  if (ta) ta.placeholder = t('diaryTextareaPlaceholder');
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
function ensureSolarTermData() {
  if (solarTermsCache && solarTermsCache.length > 0) return;
  const cached = localStorage.getItem('cycle-solarterms');
  if (cached) {
    try {
      solarTermsCache = JSON.parse(cached);
      if (solarTermsCache.length > 0) return;
    } catch (e) {
      _dbg('[solar] Bad cached data');
    }
  }
  // Load from calendar-data.json
  fetch('calendar-data.json')
    .then(function (r) {
      return r.json();
    })
    .then(function (d) {
      if (d && d.solarTerms) {
        solarTermsCache = d.solarTerms;
        localStorage.setItem('cycle-solarterms', JSON.stringify(solarTermsCache));
      }
    })
    .catch(function () {});
}

/** Look up a solar term by date key (YYYY-MM-DD). Reads from solarTermsCache. */
function getSolarTerm(dateKey) {
  if (!solarTermsCache || !solarTermsCache.length) return;
  for (let i = 0; i < solarTermsCache.length; i++) {
    if (solarTermsCache[i].date === dateKey) return solarTermsCache[i];
  }
}

function renderSolarTermBadge() {
  const badge = document.getElementById('solarTermBadge');
  if (!badge) return;
  const todayKey = fmtDate(today());
  const term = getSolarTerm(todayKey);
  if (term) {
    const termName = term.name[lang] || term.name[lang.split('-')[0]] || term.name['sr'] || term.name['zh-CN'] || '';
    badge.textContent = '🌿 ' + termName;
    badge.style.display = '';
  } else {
    // Only show upcoming (future) solar terms within 7 days, not past ones
    let nearest = null,
      minDist = 30;
    const td = today();
    const terms = solarTermsCache || [];
    terms.forEach(function (s) {
      const termDate = new Date(s.date + 'T00:00:00');
      const dist = daysDiff(td, termDate); // positive = future, negative = past
      if (dist >= 0 && dist < minDist) {
        minDist = dist;
        nearest = s;
      }
    });
    if (nearest && minDist <= 7) {
      const nearName = nearest.name[lang] || nearest.name[lang.split('-')[0]] || nearest.name['sr'] || nearest.name['zh-CN'] || '';
      badge.textContent = '🌿 ' + nearName + ' ' + t('solarTermBadge') + ' ' + minDist + ' ' + t('day');
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  }
}
// Conditional render system — accepts optional filter to skip unnecessary renders.
// Groups: 'core','calendar','mood','diary','connection','tips','barry','weather','tea'
// If called with no args or 'all', renders everything (backward compatible).
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
  const pred = predict();
  const td = today();
  document.getElementById('monthLabel').textContent =
    lang === 'sr' ? `${t('months')[viewMonth]} ${viewYear}.` : lang === 'en' ? `${t('months')[viewMonth]} ${viewYear}` : `${viewYear}年${viewMonth + 1}月`;
  const first = new Date(viewYear, viewMonth, 1);
  let dow = first.getDay();
  dow = dow === 0 ? 6 : dow - 1;
  const gridStart = addDays(first, -dow);
  const grid = document.getElementById('daysGrid');
  const frag = document.createDocumentFragment();
  const recordedStarts = new Set(state.records.map(fmtDate));
  const plEl = document.getElementById('predLegend');
  if (pred.futurePeriods.length > 0) {
    plEl.style.display = '';
    plEl.textContent = t('calendarPredLegend');
  } else plEl.style.display = 'none';
  // Build shared diary index for dot indicators
  const sharedDiaryIdx = {};
  const sd = safeParse(localStorage.getItem('shared-diary'), {});
  Object.keys(sd).forEach(function (k) {
    if (sd[k] && (sd[k].barry || sd[k].andjela)) sharedDiaryIdx[k] = true;
  });
  for (let i = 0; i < 42; i++) {
    // Insert week number at start of each row (every 7th position)
    const colPos = i + Math.floor(i / 7); // actual grid position including week columns
    if (i % 7 === 0) {
      const wkCell = document.createElement('div');
      wkCell.className = 'week-num';
      const wkDate = addDays(gridStart, i);
      // ISO week number approximation
      const jan1 = new Date(wkDate.getFullYear(), 0, 1);
      const wkNum = Math.ceil(((wkDate - jan1) / 86400000 + jan1.getDay() + 1) / 7);
      wkCell.textContent = wkNum;
      wkCell.setAttribute('aria-hidden', 'true');
      frag.appendChild(wkCell);
    }
    const d = addDays(gridStart, i);
    const inMonth = d.getMonth() === viewMonth;
    const isToday = sameDay(d, td);
    const phase = inMonth ? getPhase(d, pred) : null;
    const key = fmtDate(d);
    // Symptom check
    const symptoms = state.symptoms[key];
    const hasSymptom =
      symptoms &&
      Object.entries(symptoms).some(function (kv) {
        return kv[0] !== 'notes' && kv[1] > 0;
      });
    // Cycle day number for Anđela's active cycle
    let cycleDay = '';
    if (activeProfile === 'andjela' && pred.lastStart) {
      const cd = daysDiff(d0(pred.lastStart), d0(d));
      if (cd >= 0 && cd < pred.cycleLen) cycleDay = String(cd + 1);
    }
    const annType = isAnniversary(d);
    const el = document.createElement('div');
    el.className = 'day';
    if (!inMonth) el.classList.add('other-month');
    if (isToday) el.classList.add('today');
    if (isToday) el.setAttribute('aria-current', 'date');
    if (phase) el.classList.add(phase);
    if (phase === 'period-on' && recordedStarts.has(key)) el.classList.add('recorded');
    if (annType > 0) el.classList.add('anniversary');
    if (getBirthday(d)) el.classList.add('birthday');
    // Special date icon
    const special = getSpecialDate(d);
    if (special) {
      const spIcon = document.createElement('span');
      spIcon.className = 'special-date-icon';
      spIcon.textContent = special.icon;
      spIcon.title = activeProfile === 'barry' ? special.title_zh : special.title_sr;
      el.appendChild(spIcon);
      if (special.type === 'firstmeet') el.classList.add('first-meet');
      if (special.type === 'monthly') el.classList.add('monthly-anni');
    }
    if (inMonth) {
      el.setAttribute('tabindex', '0');
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      });
    }
    // Date number
    const daySpan = document.createElement('span');
    daySpan.className = 'day-num';
    daySpan.textContent = d.getDate();
    el.appendChild(daySpan);
    // Cycle day badge
    if (cycleDay && inMonth && !phase) {
      const cdSpan = document.createElement('span');
      cdSpan.className = 'day-cycle-num';
      cdSpan.textContent = cycleDay;
      el.appendChild(cdSpan);
    }
    // Lunar date label (Chinese calendar)
    if (inMonth && typeof Lunar !== 'undefined') {
      const lunarDayName = getLunarCellText(d);
      if (lunarDayName) {
        const lunarSpan = document.createElement('span');
        lunarSpan.className = 'lunar-date ' + getLunarCellClass(d);
        lunarSpan.textContent = lunarDayName;
        el.appendChild(lunarSpan);
      }
    }
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', fmtDate(d));
    // Symptom emoji icons on cell
    if (hasSymptom && !phase && symptoms) {
      const miniDiv = document.createElement('div');
      miniDiv.className = 'day-symptoms';
      ['cramps', 'mood', 'flow', 'headache', 'fatigue', 'cravings'].forEach(function (sym) {
        if (symptoms[sym] && symptoms[sym] > 0) {
          const symEl = document.createElement('span');
          symEl.className = 'day-sym-icon';
          symEl.textContent = { cramps: '😣', mood: '😊', flow: '💧', headache: '🤕', fatigue: '😴', cravings: '🍫' }[sym];
          symEl.title = sym;
          miniDiv.appendChild(symEl);
        }
      });
      if (miniDiv.children.length > 0) el.appendChild(miniDiv);
    }
    // Diary entry dot
    if (sharedDiaryIdx[key]) {
      const diaryDot = document.createElement('span');
      diaryDot.className = 'mini-dot gold';
      diaryDot.style.cssText = 'position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:5px;height:5px;border-radius:50%;background:var(--gold)';
      el.appendChild(diaryDot);
    }
    // Anniversary dot
    if (annType === 2 && !phase) {
      const dot = document.createElement('span');
      dot.className = 'mini-dot gold';
      el.appendChild(dot);
    }
    // Solar term label on calendar cell
    const solarTerm = getSolarTerm(key);
    if (solarTerm && inMonth) {
      const stName = solarTerm.name[lang] || solarTerm.name[lang.split('-')[0]] || solarTerm.name['sr'] || solarTerm.name['zh-CN'] || '';
      const stLabel = document.createElement('span');
      stLabel.className = 'solar-term-label';
      stLabel.textContent = stName;
      stLabel.title = stName; // hover shows full name for long solar terms
      el.appendChild(stLabel);
      el.classList.add('solar-term-day');
      // Single tap opens modal (same as other days) — modal shows solar term + holiday
      if (!solarTerm.story) {
        // Ensure rich data is loaded for the modal
        ensureSolarTermData();
      }
    }
    // Holiday emoji icons — show before solar term for proper layering
    const holidays = getHoliday(key);
    holidays.forEach(function (h) {
      const icon = document.createElement('span');
      icon.className = 'holiday-icon holiday-' + h.country;
      icon.textContent = h.icon || (h.country === 'cn' ? '🎉' : '🇷🇸');
      icon.title = h.name[lang] || h.name[lang.split('-')[0]] || h.name['sr'] || h.name['zh-CN'] || '';
      el.appendChild(icon);
    });
    // Double-tap detection using touch events for mobile responsiveness
    let tapTimer = null;
    if (inMonth) {
      el.addEventListener('click', function (e) {
        if (tapTimer) {
          // Double tap — quick toggle period
          clearTimeout(tapTimer);
          tapTimer = null;
          const idx = state.records.findIndex(function (r) {
            return sameDay(r, d);
          });
          if (idx >= 0) {
            state.records.splice(idx, 1);
            toast('🚫 ' + t('toast.unmarked'));
          } else {
            state.records.push(new Date(d));
            state.records.sort(function (a, b) {
              return a - b;
            });
            el.classList.add('celebrate');
            setTimeout(function () {
              el.classList.remove('celebrate');
            }, 500);
            toast('🩸 ' + t('toast.marked'));
            checkCycleCelebration();
          }
          saveState();
          renderAll(['calendar', 'core']);
          updateFab();
          e.preventDefault();
        } else {
          tapTimer = setTimeout(function () {
            tapTimer = null;
            openModal(d, pred);
          }, 280);
        }
      });
      // Also listen for touchend for faster double-tap on mobile
      let touchCount = 0,
        touchTimer = null;
      el.addEventListener('touchend', function (e) {
        touchCount++;
        if (touchCount === 1) {
          touchTimer = setTimeout(function () {
            touchCount = 0;
          }, 350);
        } else if (touchCount === 2) {
          clearTimeout(touchTimer);
          touchCount = 0;
          if (tapTimer) {
            clearTimeout(tapTimer);
            tapTimer = null;
          }
          const idx = state.records.findIndex(function (r) {
            return sameDay(r, d);
          });
          if (idx >= 0) {
            state.records.splice(idx, 1);
            toast('🚫 ' + t('toast.unmarked'));
          } else {
            state.records.push(new Date(d));
            state.records.sort(function (a, b) {
              return a - b;
            });
            el.classList.add('celebrate');
            setTimeout(function () {
              el.classList.remove('celebrate');
            }, 500);
            toast('🩸 ' + t('toast.marked'));
            checkCycleCelebration();
          }
          saveState();
          renderAll(['calendar', 'core']);
          updateFab();
          e.preventDefault();
        }
      });
    }
    frag.appendChild(el);
  }
  // Batch-replace grid content in single DOM operation
  grid.innerHTML = '';
  grid.appendChild(frag);
  // Month season subtitle
  const ml = document.getElementById('monthLabel');
  if (ml) {
    // Remove existing season tag and re-add with updated month
    const existingTag = ml.querySelector('.season-tag');
    if (existingTag) existingTag.remove();
    ml.innerHTML =
      ml.textContent + ' <span class="season-tag" style="font-size:.6rem;opacity:.5">' + SEASON_EMOJI[viewMonth] + ' ' + getSeasonLabel(viewMonth) + '</span>';
  }
  updateProgress(pred);
  updateStats(pred);
  updateHistoryDots(pred);
  updateReminder(pred);
  renderMonthHolidaySummary();
  renderUpcomingHoliday();
}

function updateProgress(pred) {
  const td = today();
  const numEl = document.getElementById('pg-num');
  const unitEl = document.getElementById('pg-unit');
  const subEl = document.getElementById('pg-sub');
  const fillEl = document.getElementById('pg-fill');
  const badgeEl = document.getElementById('pg-badge');
  const badges = t('phaseBadges');
  if (state.records.length === 0) {
    numEl.textContent = '--';
    unitEl.textContent = '';
    subEl.textContent = t('emptyState');
    fillEl.style.width = '0%';
    badgeEl.textContent = '';
    badgeEl.className = 'phase-badge';
    document.querySelectorAll('.progress-labels span').forEach((s) => s.classList.remove('current'));
    return;
  }
  const phase = getPhase(td, pred);
  let pct = 0,
    label = '',
    bCls = '';
  document.querySelectorAll('.progress-labels span').forEach((s) => s.classList.remove('current'));
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
  fillEl.style.width = pct + '%';
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
  viewMonth = m;
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
  window._lastFocusedBeforeModal = document.activeElement;
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('modal-title').focus();
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
function saveGitHubToken() {
  const t = document.getElementById('set-gh-token').value.trim();
  const warning = document.getElementById('tokenSecurityWarning');
  if (t) {
    sessionStorage.setItem('gh-token', t);
    toast('🔑 Token sačuvan ✓');
    if (warning) warning.style.display = '';
    pullAllSharedData().then(function () {
      updateSyncStatusBadge();
      renderAll();
    });
  } else {
    sessionStorage.removeItem('gh-token');
    if (warning) warning.style.display = 'none';
    updateSyncStatusBadge();
  }
}

async function testGitHubToken() {
  const btn = document.getElementById('testTokenBtn');
  if (!btn) return;
  const origText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '⏳ Testiranje...';
  const token = getGitHubToken();
  if (!token) {
    toast('🔑 ' + (lang === 'sr' ? 'Prvo unesi token' : lang === 'en' ? 'Enter a token first' : '请先输入 Token'));
    btn.textContent = origText;
    btn.disabled = false;
    return;
  }
  try {
    const resp = await fetch('https://api.github.com/user', {
      headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github.v3+json' },
    });
    if (resp.ok) {
      const user = await resp.json();
      toast(
        '✅ ' +
          (lang === 'sr' ? 'Token važi — ' + (user.login || '') : lang === 'en' ? 'Token valid — ' + (user.login || '') : 'Token 有效 — ' + (user.login || ''))
      );
      btn.textContent = '✅ Važi';
      setTimeout(function () {
        btn.textContent = origText;
        btn.disabled = false;
      }, 3000);
    } else if (resp.status === 401) {
      toast('❌ ' + (lang === 'sr' ? 'Token nevažeći — generiši novi' : lang === 'en' ? 'Token invalid — generate a new one' : 'Token 无效 — 请重新生成'));
      btn.textContent = '❌ Nevažeći';
      setTimeout(function () {
        btn.textContent = origText;
        btn.disabled = false;
      }, 3000);
    } else {
      toast('⚠️ ' + (lang === 'sr' ? 'Greška: ' + resp.status : lang === 'en' ? 'Error: ' + resp.status : '错误: ' + resp.status));
      btn.textContent = origText;
      btn.disabled = false;
    }
  } catch (e) {
    toast('⚠️ ' + (lang === 'sr' ? 'Mrežna greška' : lang === 'en' ? 'Network error' : '网络错误'));
    btn.textContent = origText;
    btn.disabled = false;
  }
}

function clearGitHubToken() {
  if (!getGitHubToken()) return;
  if (
    !confirm(
      lang === 'sr'
        ? 'Obrisati GitHub token? Sinhronizacija će prestati.'
        : lang === 'en'
          ? 'Clear GitHub token? Sync will stop.'
          : '清除 GitHub Token？同步将停止。'
    )
  ) {
    return;
  }
  sessionStorage.removeItem('gh-token');
  document.getElementById('set-gh-token').value = '';
  const warning = document.getElementById('tokenSecurityWarning');
  if (warning) warning.style.display = 'none';
  updateSyncStatusBadge();
  toast('🗑️ ' + (lang === 'sr' ? 'Token obrisan' : lang === 'en' ? 'Token cleared' : 'Token 已清除'));
}
function loadSettingsUI() {
  document.getElementById('set-cycle').value = state.settings.cycleLength;
  document.getElementById('set-period').value = state.settings.periodLength;
  document.getElementById('set-language').value = lang;
  document.getElementById('set-theme').value = theme;
  document.getElementById('annDateMet').value = annDateMet;
  document.getElementById('annDateLove').value = annDateLove;
  const hasToken = !!getGitHubToken();
  document.getElementById('set-gh-token').value = getGitHubToken();
  document.getElementById('github-token-label').textContent = '🔑 GitHub Token';
  document.getElementById('set-gh-token').placeholder = 'ghp_...';
  document.getElementById('set-gh-token').setAttribute('aria-label', 'GitHub Token');
  document.getElementById('set-h-token').textContent = hasToken ? t('settingsTokenHintEnabled') : t('settingsTokenHintDisabled');
  const warning = document.getElementById('tokenSecurityWarning');
  if (warning) warning.style.display = hasToken ? '' : 'none';
  updateAnniversaryCount();
  updateSyncStatusBadge();
}
function saveSettings() {
  state.settings.cycleLength = parseInt(document.getElementById('set-cycle').value) || 28;
  state.settings.periodLength = parseInt(document.getElementById('set-period').value) || 7;
  saveState();
  renderAll(['calendar', 'core']);
  toast(t('toast.saved'));
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
  _changeMonthTimer = setTimeout(function () {
    _changeMonthTimer = null;
  }, 150);
  viewMonth += d;
  if (viewMonth < 0) {
    viewMonth = 11;
    viewYear--;
  }
  if (viewMonth > 11) {
    viewMonth = 0;
    viewYear++;
  }

  const grid = document.getElementById('daysGrid');
  // Fade out old content
  grid.style.transition = 'opacity 0.08s ease-out';
  grid.style.opacity = '0';

  setTimeout(function () {
    // Render new month
    renderCalendar();
    // Fade in new content
    grid.style.transition = 'opacity 0.15s ease-out';
    grid.style.opacity = '1';
  }, 80);
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
    { passive: false }
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
  viewYear = today().getFullYear();
  viewMonth = today().getMonth();
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
    const app = document.querySelector('.app');
    if (app) app.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
function saveSleep() {
  const time = document.getElementById('sleepTime').value;
  if (!time) return;
  const entry = { time: time, date: fmtDate(new Date()), saved: Date.now() };
  localStorage.setItem('barry-sleep', JSON.stringify(entry));
  pushAllSharedData();
  renderSleepCard();
  toast('😴 ' + (lang === 'sr' ? 'Sačuvano!' : lang === 'en' ? 'Saved!' : '已保存！'));
}
function getBarrySleep() {
  return safeParse(localStorage.getItem('barry-sleep'), null);
}
function renderSleepCard() {
  const card = document.getElementById('sleepCard');
  card.style.display = '';
  document.getElementById('sleep-title').textContent = lang === 'sr' ? '😴 Spavanje' : lang === 'en' ? '😴 Sleep' : '😴 睡眠';
  if (activeProfile === 'barry') {
    document.getElementById('sleepBarryView').style.display = '';
    document.getElementById('sleepAngieView').style.display = 'none';
    document.getElementById('sleep-hint').textContent =
      lang === 'sr'
        ? 'Kad si legao sinoć? Angie vidi tvoje vreme spavanja 😴'
        : lang === 'en'
          ? 'What time did you sleep last night? Angie sees your sleep time 😴'
          : '昨晚几点睡的？Angie 会看到你的睡眠时间 😴';
    document.getElementById('sleep-save').textContent = lang === 'sr' ? 'Sačuvaj' : lang === 'en' ? 'Save' : '保存';
    const s = getBarrySleep();
    if (s) document.getElementById('sleepTime').value = s.time;
  } else {
    // Angie's view
    document.getElementById('sleepBarryView').style.display = 'none';
    document.getElementById('sleepAngieView').style.display = '';
    const s = getBarrySleep();
    if (!s) {
      document.getElementById('sleepAngieContent').innerHTML =
        '<div style="text-align:center;color:var(--text-muted);font-size:.72rem">' +
        (lang === 'sr'
          ? 'Barry još nije uneo vreme — podseti ga!'
          : lang === 'en'
            ? "Barry hasn't logged sleep yet — remind him!"
            : 'Barry 还没记录——提醒他！') +
        '</div>';
      return;
    }
    const timeParts = s.time.split(':');
    const hour = parseInt(timeParts[0]),
      min = parseInt(timeParts[1]);
    let lateMsg = '';
    if (hour >= 2 || (hour === 1 && min >= 30)) {
      lateMsg =
        lang === 'sr'
          ? '<div style="background:var(--rose-light);border-radius:12px;padding:12px;margin-top:8px;text-align:center"><span style="font-size:1.5rem">💔</span><div style="font-size:.76rem;color:var(--rose-dark);font-weight:700;line-height:1.6">Legao je u ' +
            s.time +
            '! To je PREKASNO!</div><div style="font-size:.68rem;color:var(--rose-dark);margin-top:4px;line-height:1.5">Srce mu pati kad spava manje od 6 sati. Dugoročno — rizik od srčanih bolesti raste za 48%. Treba mu 7-8 sati sna. Ti si jedina koja može da ga natera da legne ranije. Reci mu večeras — "Barry, molim te, idi u krevet pre pola 2. Za mene. 💗"</div></div>'
          : lang === 'en'
            ? '<div style="background:var(--rose-light);border-radius:12px;padding:12px;margin-top:8px;text-align:center"><span style="font-size:1.5rem">💔</span><div style="font-size:.76rem;color:var(--rose-dark);font-weight:700;line-height:1.6">He slept at ' +
              s.time +
              '! That\'s WAY too late!</div><div style="font-size:.68rem;color:var(--rose-dark);margin-top:4px;line-height:1.5">His heart suffers with less than 6 hours of sleep. Long-term heart disease risk increases 48%. He needs 7-8 hours. You\'re the only one who can make him sleep earlier. Tell him tonight — "Barry, please go to bed before 1:30 AM. For me. 💗"</div></div>'
            : '<div style="background:var(--rose-light);border-radius:12px;padding:12px;margin-top:8px;text-align:center"><span style="font-size:1.5rem">💔</span><div style="font-size:.76rem;color:var(--rose-dark);font-weight:700;line-height:1.6">他 ' +
              s.time +
              ' 才睡！太晚了！</div><div style="font-size:.68rem;color:var(--rose-dark);margin-top:4px;line-height:1.5">睡眠不足6小时，心脏长期受损，心脏病风险增加48%。他需要7-8小时睡眠。只有你能让他早点睡。今晚就告诉他——"Barry，为了我今晚1:30以前就睡觉！💗"</div></div>';
    }
    document.getElementById('sleepAngieContent').innerHTML =
      '<div style="text-align:center"><span style="font-size:2rem">😴</span><div style="font-size:.78rem;color:var(--text);margin-top:4px">' +
      (lang === 'sr' ? 'Sinoć je legao u' : lang === 'en' ? 'Last night he slept at' : '昨晚他') +
      ' <b>' +
      s.time +
      '</b></div><div style="font-size:.62rem;color:var(--text-muted)">' +
      s.date +
      '</div></div>' +
      lateMsg;
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
