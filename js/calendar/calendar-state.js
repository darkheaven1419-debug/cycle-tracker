'use strict';

/* ================================================================
   CalendarState — 日历视图状态管理

   职责：
   - 管理 viewMonth, viewYear, selectedDate, knowledgeOpen
   - 提供 get/set/subscribe 接口
   - 状态变更自动通知订阅者

   用法：
     CalendarState.get('viewMonth')          // → 当前月（0-11）
     CalendarState.set('viewMonth', 5)       // → 设置 + 通知订阅者
     CalendarState.subscribe('viewMonth', fn) // → 订阅变更

   调用者（将逐步迁移）：
     - calendar-main.js（新文件）— 核心引擎
     - calendar-renderer.js（新文件）— 渲染引擎
     - calendar-interaction.js（新文件）— 交互层
     - app.js（行1834, 3272, 3350等）— 替换当前 viewMonth/viewYear 全局变量
     - index.html — 通过 <script> 加载

   现有文件验证：无重复（Glob pattern 无匹配）
   数据文件：本文件不读写任何数据文件，纯内存状态管理
   用户指令："我要完整版，开始吧"
   ================================================================ */

const CalendarState = (function () {
  'use strict';

  // ── 内部状态 ──────────────────────────────────────────────────
  const _state = {
    viewMonth: new Date().getMonth(),
    viewYear: new Date().getFullYear(),
    selectedDate: null,
    knowledgeOpen: false,
    initialized: false,
  };

  // ── 订阅者 ────────────────────────────────────────────────────
  // Map<key, Set<callback>>
  const _listeners = new Map();

  // ── 通知 ──────────────────────────────────────────────────────
  function _notify(key, newVal, oldVal) {
    const set = _listeners.get(key);
    if (!set) return;
    set.forEach(function (fn) {
      try {
        fn(newVal, oldVal);
      } catch (e) {
        if (typeof DEBUG !== 'undefined' && DEBUG) {
          console.warn('[CalendarState] listener error:', e.message);
        }
      }
    });
  }

  // ── 公共 API ──────────────────────────────────────────────────

  /**
   * 获取状态值
   * @param {string} key
   * @returns {*}
   */
  function get(key) {
    return _state[key];
  }

  /**
   * 获取全部状态（快照）
   * @returns {object}
   */
  function getAll() {
    return {
      viewMonth: _state.viewMonth,
      viewYear: _state.viewYear,
      selectedDate: _state.selectedDate,
      knowledgeOpen: _state.knowledgeOpen,
      initialized: _state.initialized,
    };
  }

  /**
   * 设置状态值
   * @param {string} key
   * @param {*} val
   * @param {boolean} [silent=false] — 设为 true 时不触发通知
   */
  function set(key, val, silent) {
    if (key in _state) {
      const old = _state[key];
      if (old === val) return;
      _state[key] = val;
      if (!silent) _notify(key, val, old);
    }
  }

  /**
   * 批量设置（只触发一次通知）
   * @param {object} updates - { key: val, ... }
   * @param {boolean} [silent=false]
   */
  function batch(updates, silent) {
    const keys = Object.keys(updates);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k in _state) {
        _state[k] = updates[k];
      }
    }
    if (!silent) {
      for (let j = 0; j < keys.length; j++) {
        _notify(keys[j], _state[keys[j]], undefined);
      }
    }
  }

  /**
   * 订阅状态变更
   * @param {string} key
   * @param {function} fn - (newVal, oldVal) => {}
   * @returns {function} unsubscribe
   */
  function subscribe(key, fn) {
    if (!_listeners.has(key)) {
      _listeners.set(key, new Set());
    }
    _listeners.get(key).add(fn);
    return function unsubscribe() {
      let set = _listeners.get(key);
      if (set) set.delete(fn);
    };
  }

  /**
   * 订阅任意状态变更
   * @param {function} fn - (key, newVal, oldVal) => {}
   * @returns {function} unsubscribe
   */
  function subscribeAny(fn) {
    const wrapper = function (key) {
      return function (newVal, oldVal) {
        fn(key, newVal, oldVal);
      };
    };
    const unsubs = [];
    Object.keys(_state).forEach(function (k) {
      unsubs.push(subscribe(k, wrapper(k)));
    });
    return function unsubscribeAll() {
      unsubs.forEach(function (u) { u(); });
    };
  }

  /**
   * 标记已初始化
   */
  function markInitialized() {
    _state.initialized = true;
  }

  // ── 导出 ──────────────────────────────────────────────────────
  return {
    get: get,
    getAll: getAll,
    set: set,
    batch: batch,
    subscribe: subscribe,
    subscribeAny: subscribeAny,
    markInitialized: markInitialized,
  };
})();

/* 全局别名（兼容 app.js 现有代码） */
if (typeof window !== 'undefined') {
  window.CalendarState = CalendarState;
}
