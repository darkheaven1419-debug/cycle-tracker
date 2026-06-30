'use strict';

/* ================================================================
   SharedCalendarModule — Cross-user calendar markers
   ================================================================
   Manages emoji/note markers that BOTH Anđela and Barry can add
   to any calendar date. Markers are stored per-date and synced
   via GitHub through sync.js.

   Storage key: 'shared-calendar-markers'
   Structure:
     { [dateKey]: [{ id, author, emoji, type, note, time }] }

   Dependencies (global scope):
     - activeProfile      — 'andjela' | 'barry'
     - safeParse()         — from js/ui-core.js
     - localStorage        — browser storage
     - toast()             — notification function
   ================================================================ */

const SharedCalendarModule = (function () {
  'use strict';

  // ── Constants ──────────────────────────────────────────────────
  const STORAGE_KEY = 'shared-calendar-markers';

  // Available quick emoji markers (shown in emoji picker)
  const QUICK_EMOJIS = [
    { emoji: '💕', label_sr: 'Ljubav', label_zh: '爱', label_en: 'Love' },
    { emoji: '🌸', label_sr: 'Cvet', label_zh: '花', label_en: 'Flower' },
    { emoji: '🌙', label_sr: 'Noć', label_zh: '夜晚', label_en: 'Night' },
    { emoji: '☀️', label_sr: 'Srećan dan', label_zh: '好天气', label_en: 'Nice day' },
    { emoji: '🍵', label_sr: 'Čaj', label_zh: '喝茶', label_en: 'Tea' },
    { emoji: '🎵', label_sr: 'Muzika', label_zh: '音乐', label_en: 'Music' },
    { emoji: '📖', label_sr: 'Čitanje', label_zh: '阅读', label_en: 'Reading' },
    { emoji: '💪', label_sr: 'Vežba', label_zh: '运动', label_en: 'Workout' },
    { emoji: '😊', label_sr: 'Sreća', label_zh: '开心', label_en: 'Happy' },
    { emoji: '😢', label_sr: 'Tužno', label_zh: '难过', label_en: 'Sad' },
    { emoji: '🤗', label_sr: 'Zagrljaj', label_zh: '拥抱', label_en: 'Hug' },
    { emoji: '🎂', label_sr: 'Proslava', label_zh: '庆祝', label_en: 'Celebration' },
    { emoji: '✈️', label_sr: 'Putovanje', label_zh: '旅行', label_en: 'Travel' },
    { emoji: '🏠', label_sr: 'Kod kuće', label_zh: '在家', label_en: 'At home' },
    { emoji: '💼', label_sr: 'Posao', label_zh: '工作', label_en: 'Work' },
    { emoji: '🎮', label_sr: 'Igrice', label_zh: '游戏', label_en: 'Gaming' },
    { emoji: '🍜', label_sr: 'Hrana', label_zh: '美食', label_en: 'Food' },
    { emoji: '🥰', label_sr: 'Zaljubljeno', label_zh: '甜蜜', label_en: 'In love' },
  ];

  // ── Internal: load/save helpers ───────────────────────────────
  function _load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function _save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      /* storage full — silently ignore */
    }
  }

  // ── Public API ────────────────────────────────────────────────

  /**
   * Get all markers for a specific date.
   * @param {string} dateKey - 'YYYY-MM-DD'
   * @returns {Array}
   */
  function getMarkers(dateKey) {
    const all = _load();
    return all[dateKey] || [];
  }

  /**
   * Add a marker to a date.
   * @param {string} dateKey
   * @param {object} opts
   * @param {string} opts.emoji - emoji character
   * @param {string} [opts.type='custom'] - marker type
   * @param {string} [opts.note=''] - optional text note
   * @returns {object|null} the created marker
   */
  function addMarker(dateKey, opts) {
    opts = opts || {};
    if (!dateKey || !opts.emoji) return null;
    const all = _load();
    if (!all[dateKey]) all[dateKey] = [];
    const marker = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
      author: typeof activeProfile !== 'undefined' ? activeProfile : 'unknown',
      emoji: opts.emoji,
      type: opts.type || 'custom',
      note: opts.note || '',
      time: Date.now(),
    };
    all[dateKey].push(marker);
    _save(all);
    return marker;
  }

  /**
   * Remove a marker by ID. Only the original author can remove it.
   * @param {string} markerId
   * @returns {boolean} true if removed
   */
  function removeMarker(markerId) {
    if (!markerId) return false;
    const all = _load();
    for (const dateKey in all) {
      if (!all.hasOwnProperty(dateKey)) continue;
      const markers = all[dateKey];
      for (let i = 0; i < markers.length; i++) {
        if (markers[i].id === markerId && markers[i].author === activeProfile) {
          markers.splice(i, 1);
          if (markers.length === 0) delete all[dateKey];
          _save(all);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get ALL markers across all dates.
   * @returns {object} dateKey -> markers array
   */
  function getAllMarkers() {
    return _load();
  }

  /**
   * Get a summary for a date: who has markers, who has diary entries.
   * @param {string} dateKey
   * @returns {{ andjela: Array, barry: Array, andjelaDiary: boolean, barryDiary: boolean }}
   */
  function getSummary(dateKey) {
    const markers = getMarkers(dateKey);
    const summary = {
      andjela: [],
      barry: [],
      andjelaDiary: false,
      barryDiary: false,
    };
    for (let i = 0; i < markers.length; i++) {
      const m = markers[i];
      if (m.author === 'andjela') summary.andjela.push(m);
      else summary.barry.push(m);
    }
    // Check diary entries from shared-diary
    try {
      const sd = JSON.parse(localStorage.getItem('shared-diary')) || {};
      if (sd[dateKey]) {
        if (sd[dateKey].andjela) summary.andjelaDiary = true;
        if (sd[dateKey].barry) summary.barryDiary = true;
      }
    } catch (e) {
      /* non-critical */
    }
    return summary;
  }

  /**
   * Check if a date has ANY markers or diary from either user.
   */
  function hasAnyActivity(dateKey) {
    const markers = getMarkers(dateKey);
    if (markers.length > 0) return true;
    try {
      const sd = JSON.parse(localStorage.getItem('shared-diary')) || {};
      if (sd[dateKey] && (sd[dateKey].barry || sd[dateKey].andjela)) return true;
    } catch (e) {
      /* ignore */
    }
    return false;
  }

  /**
   * Clear all markers (for reset/testing).
   */
  function clearAll() {
    _save({});
  }

  /**
   * Bulk set markers from sync data.
   */
  function bulkSet(data) {
    if (data && typeof data === 'object') {
      _save(data);
    }
  }

  /**
   * Get the list of quick-emoji definitions.
   * @returns {Array}
   */
  function getQuickEmojis() {
    return QUICK_EMOJIS;
  }

  // ── Public interface ──────────────────────────────────────────
  return {
    getMarkers: getMarkers,
    addMarker: addMarker,
    removeMarker: removeMarker,
    getAllMarkers: getAllMarkers,
    getSummary: getSummary,
    hasAnyActivity: hasAnyActivity,
    clearAll: clearAll,
    bulkSet: bulkSet,
    getQuickEmojis: getQuickEmojis,
  };
})();

/* Global aliases for inline use */
const getCalendarMarkers = SharedCalendarModule.getMarkers;
const addCalendarMarker = SharedCalendarModule.addMarker;
const removeCalendarMarker = SharedCalendarModule.removeMarker;
const getCalendarSummary = SharedCalendarModule.getSummary;
