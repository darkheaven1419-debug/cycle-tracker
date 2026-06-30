'use strict';

/* ================================================================
   CalendarModule — 日历核心引擎

   职责：
   - 协调所有子模块（state, renderer, interaction, animation, accessibility）
   - 提供 init / refresh / destroy 生命周期
   - 内部 EventBus 用于模块间通信
   - 作为 app.js 与日历子系统之间的唯一边界

   调用者：
   - app.js（行1747 applyAllUI, 行1834 renderCalendar 等将逐步迁移至此）
   - index.html（通过 <script> 加载后使用全局 CalendarModule）
   - 其他模块通过全局 renderCalendar/changeMonth 间接调用

   用户指令："我要完整版，开始吧"
   ================================================================ */

const CalendarModule = (function () {
  'use strict';

  // ── 内部状态 ──────────────────────────────────────────────────
  let _initialized = false;
  let _destroyed = false;

  // ── 渲染缓存（用于 Diff） ─────────────────────────────────────
  let _prevHashes = {};

  // ── EventBus ──────────────────────────────────────────────────
  const _events = {};

  function on(event, fn) {
    if (!_events[event]) _events[event] = [];
    _events[event].push(fn);
    return function () {
      _events[event] = (_events[event] || []).filter(function (f) { return f !== fn; });
    };
  }

  function emit(event, data) {
    var handlers = _events[event] || [];
    for (var i = 0; i < handlers.length; i++) {
      try { handlers[i](data); } catch (e) { /* silent */ }
    }
  }

  const EventBus = { on: on, emit: emit };

  // ── 生命周期 ──────────────────────────────────────────────────

  function init(opts) {
    if (_initialized) return;
    opts = opts || {};
    _destroyed = false;
    if (typeof CalendarAccessibility !== 'undefined' && CalendarAccessibility.init) CalendarAccessibility.init();
    _setupInteraction();
    _setupAnimationHooks();
    CalendarState.markInitialized();
    _initialized = true;
  }

  function _setupInteraction() {
    if (typeof CalendarInteraction === 'undefined') return;
    var gridEl = document.getElementById('daysGrid');
    if (gridEl) CalendarInteraction.setupInteraction(gridEl);
  }

  function _setupAnimationHooks() {
    if (typeof CalendarAnimations === 'undefined') return;
    on('afterRender', function (data) {
      if (!data || data.opts === 'progress' || data.opts === 'holidays') return;
      var gridEl = document.getElementById('daysGrid');
      if (gridEl && typeof CalendarAnimations.animateNewCells === 'function') CalendarAnimations.animateNewCells(gridEl);
    });
  }

  function refresh(opts) {
    if (_destroyed) return;
    opts = opts || 'all';
    var full = opts === 'all';

    var pred = typeof predict === 'function' ? predict() : null;
    var vm = CalendarState.get('viewMonth');
    var vy = CalendarState.get('viewYear');

    if (full || opts === 'all') {
      _renderFull(pred, vm, vy);
    } else if (opts === 'grid') {
      _renderGrid(pred, vm, vy);
    } else if (opts === 'progress') {
      _renderProgress(pred);
    } else if (opts === 'holidays') {
      _renderHolidaysOnly();
    }

    emit('afterRender', { opts: opts, month: vm, year: vy });
  }

  function destroy() {
    if (_destroyed) return;
    _destroyed = true;
    _prevHashes = {};
    _initialized = false;
  }

  // ── 渲染协调 ──────────────────────────────────────────────────

  function _renderFull(pred, vm, vy) {
    if (typeof renderCalendarRenderer === 'function') {
      renderCalendarRenderer({ pred: pred, viewMonth: vm, viewYear: vy });
    }
  }

  function _renderGrid(pred, vm, vy) {
    if (typeof renderCalendarGrid === 'function') {
      renderCalendarGrid({ pred: pred, viewMonth: vm, viewYear: vy });
    }
  }

  function _renderProgress(pred) {
    if (typeof updateProgressRenderer === 'function') {
      updateProgressRenderer(pred);
    }
  }

  function _renderHolidaysOnly() {
    if (typeof renderMonthHolidaySummary === 'function') renderMonthHolidaySummary();
    if (typeof renderUpcomingHoliday === 'function') renderUpcomingHoliday();
  }

  // ── 对外 API ──────────────────────────────────────────────────

  function changeMonth(delta) {
    var cur = CalendarState.get('viewMonth');
    var year = CalendarState.get('viewYear');
    var newMonth = cur + delta;
    var newYear = year;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    CalendarState.batch({ viewMonth: newMonth, viewYear: newYear });
  }

  function goToday() {
    var td = new Date();
    td.setHours(0, 0, 0, 0);
    CalendarState.batch({ viewMonth: td.getMonth(), viewYear: td.getFullYear() });
  }

  function openModal(date, pred) {
    CalendarState.set('selectedDate', new Date(date));
    if (typeof window.openModal === 'function') {
      window.openModal(date, pred || predict());
    }
  }

  function setHashes(hashes) { _prevHashes = hashes || {}; }
  function getHashes() { return _prevHashes; }

  return {
    init: init,
    refresh: refresh,
    destroy: destroy,
    changeMonth: changeMonth,
    goToday: goToday,
    openModal: openModal,
    on: on, emit: emit,
    EventBus: EventBus,
    setHashes: setHashes,
    getHashes: getHashes,
  };
})();

if (typeof window !== 'undefined') {
  window.CalendarModule = CalendarModule;
}
