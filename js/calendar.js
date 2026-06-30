'use strict';

/* ================================================================
   calendar.js — Calendar Module Entry Point (v2 refactored)

   职责：
   - 作为 js/calendar/ 子模块的对外统一入口
   - 提供向后兼容的全局函数
   - 初始化 CalendarModule

   调用者：
   - app.js（行1747 renderAll, 行1834 renderCalendar, 行3272 changeMonth 等）
   - weather.js, sync.js, social.js 等
   - index.html（通过 <script> 加载）
   ================================================================ */

(function () {
  'use strict';

  // ── 自动初始化 CalendarModule ─────────────────────────────────
  function _safeInit() {
    if (typeof CalendarModule !== 'undefined' && CalendarModule.init) {
      try { CalendarModule.init(); } catch (e) { /* silent */ }
    }
  }

  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(_safeInit, { timeout: 2000 });
  } else if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(_safeInit, 500);
  } else {
    document.addEventListener('DOMContentLoaded', _safeInit);
  }

  // ── 向后兼容 API ─────────────────────────────────────────────
  if (typeof window.renderCalendar === 'undefined') {
    window.renderCalendar = function () {
      if (typeof CalendarModule !== 'undefined' && CalendarModule.refresh) {
        CalendarModule.refresh('all');
      }
    };
  }

  if (typeof window.changeMonth === 'undefined') {
    window.changeMonth = function (delta) {
      if (typeof CalendarModule !== 'undefined' && CalendarModule.changeMonth) {
        CalendarModule.changeMonth(delta);
      } else {
        viewMonth += delta;
        if (viewMonth < 0) { viewMonth = 11; viewYear--; }
        if (viewMonth > 11) { viewMonth = 0; viewYear++; }
        if (typeof renderCalendar === 'function') renderCalendar();
      }
    };
  }

  if (typeof window.goToday === 'undefined') {
    window.goToday = function () {
      if (typeof CalendarModule !== 'undefined' && CalendarModule.goToday) {
        CalendarModule.goToday();
      } else {
        viewYear = today().getFullYear();
        viewMonth = today().getMonth();
        if (typeof renderCalendar === 'function') renderCalendar();
      }
    };
  }

  if (typeof window.DayDataCache === 'undefined' && typeof DayDataCache !== 'undefined') {
    window.DayDataCache = DayDataCache;
  }
})();
