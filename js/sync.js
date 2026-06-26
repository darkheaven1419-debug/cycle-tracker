/**
 * SyncModule — Cross-device sync via GitHub API (shared-state.json)
 *
 * Extracted from app.js lines 329-3917 for modularity.
 * Full backward compatibility maintained — global functions still exist.
 *
 * Dependencies (must be available in global scope):
 *   getGitHubToken()    — returns GitHub token from sessionStorage
 *   localStorage        — browser storage
 *   fetch               — native fetch API
 *   state               — global app state object
 *   toast(msg)          — toast notification function
 *   lang                — current language string ('sr' | 'zh-CN' | 'en')
 *   activeProfile       — 'andjela' | 'barry'
 *   renderHug, renderGratitude, renderSong, renderCheckin, renderKnowMe
 *   renderBarrySymptomView, renderCalendar, renderTips, renderSharedDiary
 *   renderDateStrip
 *   saveSharedDiaryData — original diary save function
 *   SD_KEY              — localStorage key for shared diary
 */
const SyncModule = (function () {
  // ====================================================================
  // Constants
  // ====================================================================
  const GITHUB_REPO = 'darkheaven1419-debug/cycle-tracker';
  const GITHUB_SHARED_FILE = 'shared-state.json';
  const SYNC_INTERVAL_MS = 120000; // Pull every 2 minutes
  const MAX_RETRIES = 3;

  // ====================================================================
  // Internal: helpers
  // ====================================================================

  /** Safely parse JSON from localStorage, returning fallback on failure. */
  function _safeGet(key, fallback) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  // ====================================================================
  // collectSharedState() — read all shared keys from localStorage
  // ====================================================================

  /**
   * Collects all cross-device state from localStorage into a single object
   * for upload to GitHub.
   * @returns {Object}
   */
  function collectSharedState() {
    let cycleData = _safeGet('shared-cycle-data', null);
    // Fall back to Anđela's local profile data if shared key is empty
    if (!cycleData || !cycleData.records) {
      cycleData = _safeGet('cycle-data-v6-andjela', null);
    }
    return {
      diary: _safeGet('shared-diary', {}),
      cycleInfo: cycleData,
      symptoms: _safeGet('shared-symptoms', null),
      gratitude: _safeGet('shared-gratitude', []),
      hug: _safeGet('shared-hug', null),
      songs: {
        barry: _safeGet('shared-song-barry', null),
        andjela: _safeGet('shared-song-andjela', null),
      },
      sleep: _safeGet('barry-sleep', null),
      checkins: {
        barry: _safeGet('shared-checkin-barry', {}),
        andjela: _safeGet('shared-checkin-andjela', {}),
      },
      learningProgress: _safeGet('shared-learning-progress', {}),
      learningComments: _safeGet('shared-learning-comments', []),
      learningPoints: _safeGet('shared-learning-points', {}),
      voiceData: _safeGet('shared-voice-data', {}),
      sunCounter: _safeGet('shared-sun-counter', {}),
      knowme: _safeGet('shared-knowme', {}),
      updated: Date.now(),
    };
  }

  // ====================================================================
  // applySharedState(data) — write all shared keys to localStorage
  // ====================================================================

  /**
   * Applies a remote shared-state object to local localStorage.
   * Only writes fields that are present (truthy) on the incoming object.
   * @param {Object|null} shared
   */
  function applySharedState(shared) {
    if (!shared) return;

    if (shared.diary) {
      localStorage.setItem('shared-diary', JSON.stringify(shared.diary));
    }
    if (shared.cycleInfo) {
      localStorage.setItem('shared-cycle-data', JSON.stringify(shared.cycleInfo));
      // Backward compat: also update Anđela's profile key
      if (shared.cycleInfo.records && shared.cycleInfo.records.length > 0) {
        localStorage.setItem('cycle-data-v6-andjela', JSON.stringify(shared.cycleInfo));
      }
      // Apply to live state so calendar reflects synced data immediately
      if (shared.cycleInfo.records) {
        state.records = shared.cycleInfo.records.map(function (r) {
          return new Date(r);
        });
        state.periodEnds = shared.cycleInfo.periodEnds || {};
        state.symptoms = shared.cycleInfo.symptoms || {};
        state.settings = shared.cycleInfo.settings || { cycleLength: 28, periodLength: 7 };
      }
    }
    if (shared.symptoms) {
      localStorage.setItem('shared-symptoms', JSON.stringify(shared.symptoms));
    }
    if (shared.gratitude) {
      localStorage.setItem('shared-gratitude', JSON.stringify(shared.gratitude));
    }
    if (shared.hug) {
      localStorage.setItem('shared-hug', JSON.stringify(shared.hug));
    }
    if (shared.sleep) {
      localStorage.setItem('barry-sleep', JSON.stringify(shared.sleep));
    }
    if (shared.songs) {
      if (shared.songs.barry) {
        localStorage.setItem('shared-song-barry', JSON.stringify(shared.songs.barry));
      }
      if (shared.songs.andjela) {
        localStorage.setItem('shared-song-andjela', JSON.stringify(shared.songs.andjela));
      }
    }
    if (shared.checkins) {
      if (shared.checkins.barry) {
        localStorage.setItem('shared-checkin-barry', JSON.stringify(shared.checkins.barry));
      }
      if (shared.checkins.andjela) {
        localStorage.setItem('shared-checkin-andjela', JSON.stringify(shared.checkins.andjela));
      }
    }
    if (shared.learningProgress) {
      localStorage.setItem('shared-learning-progress', JSON.stringify(shared.learningProgress));
    }
    if (shared.learningComments) {
      localStorage.setItem('shared-learning-comments', JSON.stringify(shared.learningComments));
    }
    if (shared.learningPoints) {
      localStorage.setItem('shared-learning-points', JSON.stringify(shared.learningPoints));
    }
    if (shared.voiceData) {
      localStorage.setItem('shared-voice-data', JSON.stringify(shared.voiceData));
    }
    if (shared.sunCounter) {
      localStorage.setItem('shared-sun-counter', JSON.stringify(shared.sunCounter));
    }
    if (shared.knowme) {
      localStorage.setItem('shared-knowme', JSON.stringify(shared.knowme));
    }
  }

  // ====================================================================
  // pushAllSharedData() — PUT to GitHub with retry
  // ====================================================================

  /**
   * Pushes collected shared state to GitHub.
   * Retries on network error or SHA conflict (409/422).
   * On conflict, pulls latest remote data first, then retries.
   * @param {number} [retryCount=0]
   */
  async function pushAllSharedData(retryCount) {
    retryCount = retryCount || 0;
    const token = getGitHubToken();
    if (!token) return;

    const sharedState = collectSharedState();
    const headers = {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
    let sha = null;

    // Fetch current SHA
    try {
      const resp = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_SHARED_FILE, { headers: headers, cache: 'no-store' });
      if (resp.ok) {
        const d = await resp.json();
        sha = d.sha;
      }
    } catch (e) {
      if (retryCount < MAX_RETRIES) {
        setTimeout(function () {
          pushAllSharedData(retryCount + 1);
        }, 2000);
      }
      return;
    }

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(sharedState, null, 2))));
    const body = { message: '🔄 Sync shared state', content: content };
    if (sha) body.sha = sha;

    try {
      const putResp = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_SHARED_FILE, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(body),
      });
      if (putResp.ok) {
        localStorage.setItem('shared-last-sync', Date.now());
      } else if (putResp.status === 409 || putResp.status === 422) {
        // SHA conflict — pull latest, merge, retry
        if (typeof DEBUG !== 'undefined' && DEBUG) console.warn('[Sync] 409 Conflict — pulling latest and merging');
        await pullAllSharedData();
        if (retryCount < MAX_RETRIES) {
          setTimeout(function () {
            pushAllSharedData(retryCount + 1);
          }, 1500);
        } else {
          if (typeof DEBUG !== 'undefined' && DEBUG) console.error('[Sync] Failed after ' + MAX_RETRIES + ' retries — giving up');
          if (typeof toast === 'function') {
            toast(lang === 'sr' ? '⚠️ Sinhronizacija nije uspela — pokušaj ponovo' : '⚠️ 同步失败，请稍后重试');
          }
        }
      } else {
        if (typeof DEBUG !== 'undefined' && DEBUG) console.error('[Sync] Unexpected response:', putResp.status, putResp.statusText);
      }
    } catch (e) {
      if (retryCount < MAX_RETRIES) {
        setTimeout(function () {
          pushAllSharedData(retryCount + 1);
        }, 2000);
      } else {
        if (typeof DEBUG !== 'undefined' && DEBUG) console.error('[Sync] Network error after retries:', e.message);
      }
    }
  }

  // ====================================================================
  // pullAllSharedData() — GET from GitHub, apply if newer
  // ====================================================================

  /**
   * Pulls the latest shared state from GitHub and applies it locally.
   * Only applies if remote `updated` timestamp is newer than last local sync.
   * Refreshes all shared UI panels after successful pull.
   */
  async function pullAllSharedData() {
    const token = getGitHubToken();
    if (!token) return;

    const headers = {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github.v3+json',
    };

    try {
      const resp = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_SHARED_FILE, { headers: headers, cache: 'no-store' });
      if (!resp.ok) return;

      const data = await resp.json();
      const content = JSON.parse(decodeURIComponent(escape(atob(data.content))));

      // Only apply if remote data is newer than our last sync timestamp
      const lastSync = parseInt(localStorage.getItem('shared-last-sync') || '0');
      if (content.updated && content.updated <= lastSync) return;

      invalidateSDCache(); // Force diary reload on next read
      applySharedState(content);
      localStorage.setItem('shared-last-sync', Date.now());

      // Refresh all shared UI panels
      renderHug();
      renderGratitude();
      renderSong();
      renderCheckin();
      renderKnowMe();
      if (activeProfile === 'barry') {
        renderBarrySymptomView();
        renderCalendar(); // Sync Anđela's calendar to Barry's view
        renderTips(); // Refresh tips based on synced cycle phase
      }
      renderSharedDiary(); // Always refresh diary data
      renderDateStrip(); // Refresh date strip dots
      updateSyncStatusBadge();
    } catch (e) {
      updateSyncStatusBadge(); // Network error — will retry on next interval
    }
  }

  // ====================================================================
  // updateSyncStatusBadge() — show sync status in Settings/Diary panel
  // ====================================================================

  /**
   * Updates the #syncStatusBadge element (if present) with the current
   * sync status: not configured, synced (with relative time), or waiting.
   */
  function updateSyncStatusBadge() {
    const hasToken = !!getGitHubToken();
    const lastSync = localStorage.getItem('shared-last-sync');
    const badge = document.getElementById('syncStatusBadge');
    if (!badge) return;

    if (!hasToken) {
      badge.textContent = '⚪ ' + (lang === 'sr' ? 'Nije podešeno' : lang === 'en' ? 'Not configured' : '未设置');
      badge.style.color = 'var(--text-muted)';
      return;
    }

    if (lastSync) {
      const sec = Math.floor((Date.now() - parseInt(lastSync)) / 1000);
      let ago;
      if (sec < 30) {
        ago = lang === 'sr' ? 'upravo' : lang === 'en' ? 'just now' : '刚刚';
      } else if (sec < 120) {
        ago = lang === 'sr' ? 'pre 1 min' : lang === 'en' ? '1 min ago' : '1分钟前';
      } else if (sec < 3600) {
        ago = (lang === 'sr' ? 'pre ' : '') + Math.floor(sec / 60) + (lang === 'sr' ? ' min' : lang === 'en' ? ' min ago' : '分钟前');
      } else {
        ago = (lang === 'sr' ? 'pre ' : '') + Math.floor(sec / 3600) + (lang === 'sr' ? ' h' : lang === 'en' ? ' h ago' : '小时前');
      }
      badge.textContent = '🟢 ' + (lang === 'sr' ? 'Sinhronizovano ' : 'Synced ') + ago;
      badge.style.color = 'var(--sage)';
    } else {
      badge.textContent = '🟡 ' + (lang === 'sr' ? 'Čeka se sinhronizacija...' : lang === 'en' ? 'Waiting for sync...' : '等待同步...');
      badge.style.color = 'var(--gold)';
    }
  }

  // ====================================================================
  // init() — wire up sync hooks, start pull interval
  // ====================================================================

  /**
   * Initializes the sync module:
   * 1. Monkey-patches saveSharedDiaryData to auto-push after save
   * 2. Starts periodic pull interval
   * 3. Calls updateBadge on startup
   */
  function init() {
    // Monkey-patch saveSharedDiaryData auto-push
    const _origSaveSharedDiaryData = window.saveSharedDiaryData;
    window.saveSharedDiaryData = function (d) {
      _origSaveSharedDiaryData(d);
      pushAllSharedData();
    };

    // Periodic pull from GitHub every 2 minutes
    setInterval(function () {
      if (getGitHubToken()) pullAllSharedData();
    }, SYNC_INTERVAL_MS);

    // Initial badge update
    updateSyncStatusBadge();
  }

  // ====================================================================
  // Public API
  // ====================================================================

  return {
    init: init,
    push: pushAllSharedData,
    pull: pullAllSharedData,
    collect: collectSharedState,
    apply: applySharedState,
    updateBadge: updateSyncStatusBadge,
  };
})();

/* ================================================================
   Global alias — for app.js inline calls
   ================================================================ */
const updateSyncStatusBadge = SyncModule.updateBadge;
