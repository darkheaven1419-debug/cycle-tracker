'use strict';

/* ================================================================
   CalendarInteraction — 日历交互层（事件委托）

   职责：
   - 用 3 个网格级监听器替换 168 个 cell 级监听器
   - 轻触/双击/长按检测
   - 滑动手势（左右翻月）
   - 快捷日期信息浮窗
   - WAI-ARIA 键盘导航

   调用者：
   - calendar-main.js（新文件）— init/refresh 时调用 setupInteraction

   数据文件：本文件不读写任何数据文件
   用户指令："我要完整版，开始吧"
   ================================================================ */

const CalendarInteraction = (function () {
  'use strict';

  // ── 内部状态 ──────────────────────────────────────────────────
  let _gridEl = null;
  let _boundClick = null;
  let _boundTouchEnd = null;
  let _boundTouchStart = null;
  let _boundKeyDown = null;

  // 轻触/双击检测
  const _lastTap = new WeakMap(); // WeakMap<cell, timestamp>
  let _tapTimer = null;
  let _tapCell = null;

  // 长按检测
  let _longPressTimer = null;
  let _longPressCell = null;

  // 滑动手势
  let _touchStartX = 0;
  let _touchStartY = 0;
  let _touchStartTime = 0;
  const SWIPE_THRESHOLD = 60;
  const SWIPE_MAX_Y_OFFSET = 40;

  // 快捷浮窗
  let _tooltipEl = null;
  let _tooltipTimer = null;
  let _tooltipHideTimer = null;

  // ── 公共 API ──────────────────────────────────────────────────

  /**
   * 为网格元素绑定交互监听器
   * @param {HTMLElement} gridEl - #daysGrid 元素
   */
  function setupInteraction(gridEl) {
    if (!gridEl) return;
    destroyInteraction();
    _gridEl = gridEl;

    _boundClick = _onClick.bind(null);
    _boundTouchEnd = _onTouchEnd.bind(null);
    _boundTouchStart = _onTouchStart.bind(null);
    _boundKeyDown = _onKeyDown.bind(null);

    gridEl.addEventListener('click', _boundClick);
    gridEl.addEventListener('touchend', _boundTouchEnd, { passive: true });
    gridEl.addEventListener('touchstart', _boundTouchStart, { passive: true });
    document.addEventListener('keydown', _boundKeyDown);
  }

  /**
   * 移除所有监听器，清理状态
   */
  function destroyInteraction() {
    if (_gridEl) {
      if (_boundClick) _gridEl.removeEventListener('click', _boundClick);
      if (_boundTouchEnd) _gridEl.removeEventListener('touchend', _boundTouchEnd);
      if (_boundTouchStart) _gridEl.removeEventListener('touchstart', _boundTouchStart);
    }
    if (_boundKeyDown) document.removeEventListener('keydown', _boundKeyDown);
    _clearTimers();
    _clearLongPress();
    hideQuickDateInfo();
    _gridEl = null;
    _boundClick = null;
    _boundTouchEnd = null;
    _boundKeyDown = null;
  }

  /**
   * 显示快捷日期信息浮窗
   * @param {string} dateKey - 'YYYY-MM-DD'
   * @param {HTMLElement} cell - 目标 .day 元素
   */
  function showQuickDateInfo(dateKey, cell) {
    if (!dateKey || !cell) return;
    hideQuickDateInfo();

    let d = new Date(dateKey + 'T00:00:00');
    let pred = typeof predict === 'function' ? predict() : null;
    let data = typeof DayDataCache !== 'undefined' && DayDataCache.compute ? DayDataCache.compute(dateKey, d, pred) : null;

    let el = document.createElement('div');
    el.className = 'quick-date-info';
    el.setAttribute('role', 'tooltip');
    el.style.cssText = [
      'position:fixed',
      'background:var(--surface, #fff)',
      'border:1px solid var(--border, rgba(0,0,0,0.08))',
      'border-radius:12px',
      'padding:8px 14px',
      'font-size:.75rem',
      'line-height:1.5',
      'box-shadow:0 4px 20px rgba(0,0,0,0.12)',
      'z-index:9999',
      'pointer-events:none',
      'opacity:0',
      'transition:opacity 180ms ease',
      'max-width:220px',
    ].join(';');

    let parts = [];
    let weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    let month = d.getMonth() + 1;
    parts.push(d.getFullYear() + '/' + month + '/' + d.getDate() + ' 周' + weekdays[d.getDay()]);

    if (data) {
      if (data.phase) {
        let phaseLabels = {
          'period-on': '经期第1天',
          'period-mid': '经期',
          'period-pred-first': '预计经期',
          'period-pred': '预计经期',
          'period-future-first': '未来经期',
          'period-future': '未来经期',
          ovulation: '排卵日',
          fertile: '易孕期',
          luteal: '黄体期',
          follicular: '卵泡期',
        };
        parts.push('· ' + (phaseLabels[data.phase] || data.phase));
      }
      if (data.cycleDay) parts.push('· 周期第' + data.cycleDay + '天');
      if (data.solarTermName) parts.push('· ' + data.solarTermName);
      if (data.holidayNames && data.holidayNames.length > 0) {
        parts.push('· ' + data.holidayNames.slice(0, 2).join(' '));
      }
      if (data.isBirthday) parts.push('· 生日快乐');
      if (data.annType > 0) parts.push('· 纪念日');
      if (data.lunar) {
        parts.push('· 农历' + (data.lunar.monthName || '') + (data.lunar.dayName || ''));
      }
    }

    el.textContent = parts.join(' ');
    document.body.appendChild(el);

    // 定位到 cell 附近
    requestAnimationFrame(function () {
      let rect = cell.getBoundingClientRect();
      let tipRect = el.getBoundingClientRect();
      let top = rect.top - tipRect.height - 8;
      let left = rect.left + (rect.width - tipRect.width) / 2;
      if (top < 4) top = rect.bottom + 8;
      if (left < 4) left = 4;
      if (left + tipRect.width > window.innerWidth - 4) {
        left = window.innerWidth - tipRect.width - 4;
      }
      el.style.top = Math.round(top) + 'px';
      el.style.left = Math.round(left) + 'px';
      el.style.opacity = '1';
    });

    _tooltipEl = el;

    // 3 秒后自动隐藏
    _tooltipHideTimer = setTimeout(function () {
      hideQuickDateInfo();
    }, 3000);

    // 点击其他地方隐藏
    document.addEventListener('click', _onDocClickForTooltip);
  }

  /**
   * 隐藏快捷日期信息浮窗
   */
  function hideQuickDateInfo() {
    if (_tooltipEl) {
      _tooltipEl.style.opacity = '0';
      setTimeout(function () {
        if (_tooltipEl && _tooltipEl.parentNode) {
          _tooltipEl.parentNode.removeChild(_tooltipEl);
        }
        _tooltipEl = null;
      }, 180);
    }
    if (_tooltipHideTimer) {
      clearTimeout(_tooltipHideTimer);
      _tooltipHideTimer = null;
    }
    document.removeEventListener('click', _onDocClickForTooltip);
  }

  // ── 点击处理器 ────────────────────────────────────────────────

  function _onClick(e) {
    let cell = e.target.closest('.day');
    if (!cell) return;
    let dateKey = cell.getAttribute('data-date');
    if (!dateKey) return;
    let isOther = cell.classList.contains('other-month');

    // 双击检测
    let now = Date.now();
    let last = _lastTap.get(cell) || 0;
    _lastTap.set(cell, now);

    if (now - last < 350 && now - last > 0) {
      // 双击：切换经期标记
      _handleDoubleTap(dateKey, cell);
      return;
    }

    // 清除之前的单击计时器
    if (_tapTimer && _tapCell === cell) {
      clearTimeout(_tapTimer);
      _tapTimer = null;
      _tapCell = null;
    }

    // 如果是 other-month，直接切换月份
    if (isOther) {
      _navigateToOtherMonth(cell, dateKey);
      return;
    }

    // 单击计时器（200ms 后触发）
    _tapTimer = setTimeout(function () {
      _tapTimer = null;
      _tapCell = null;
      _handleSingleTap(dateKey, cell);
    }, 200);
    _tapCell = cell;
  }

  // ── 触摸处理器 ────────────────────────────────────────────────

  function _onTouchStart(e) {
    _touchStartX = e.touches[0].clientX;
    _touchStartY = e.touches[0].clientY;
    _touchStartTime = Date.now();

    // 长按检测
    let cell = e.target.closest('.day');
    if (cell && !cell.classList.contains('other-month')) {
      _longPressCell = cell;
      _longPressTimer = setTimeout(function () {
        if (_longPressCell) {
          let key = _longPressCell.getAttribute('data-date');
          if (key) {
            _clearTapState();
            _handleLongPress(key, _longPressCell);
          }
        }
        _longPressCell = null;
        _longPressTimer = null;
      }, 500);
    }
  }

  function _onTouchEnd(e) {
    let dx = e.changedTouches[0].clientX - _touchStartX;
    let dy = e.changedTouches[0].clientY - _touchStartY;

    // 取消长按
    _clearLongPress();

    // 滑动手势检测（横向、距离足够、垂直偏移小）
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_MAX_Y_OFFSET) {
      let direction = dx > 0 ? 'right' : 'left';
      // 滑动时才发射 swipe 事件，不做其他操作（由订阅者处理）
      if (typeof CalendarModule !== 'undefined' && CalendarModule.emit) {
        CalendarModule.emit('swipe', { direction: direction });
      }
      // 也调用 changeMonth 以确保非 GSAP 场景仍有效
      if (typeof CalendarModule !== 'undefined' && CalendarModule.changeMonth) {
        CalendarModule.changeMonth(direction === 'left' ? 1 : -1);
        if (typeof CalendarModule.refresh === 'function') {
          CalendarModule.refresh('all');
        }
      }
      e.preventDefault();
      return;
    }

    // 如果触摸时间很短（<100ms），模拟 click（辅助移动端快速双击）
    let elapsed = Date.now() - _touchStartTime;
    if (elapsed < 100) {
      let cell = e.target.closest('.day');
      if (cell) {
        // touchend 的 click 模拟会自然触发 _onClick
      }
    }
  }

  // ── 键盘导航 ──────────────────────────────────────────────────

  function _onKeyDown(e) {
    if (!_gridEl) return;
    // 仅在焦点在网格内时处理
    let active = document.activeElement;
    if (!active || !_gridEl.contains(active)) return;
    let cell = active.closest('.day');
    if (!cell) return;

    let key = e.key;
    let handled = false;
    let dateKey = cell.getAttribute('data-date');
    if (!dateKey) return;
    let d = new Date(dateKey + 'T00:00:00');

    switch (key) {
      case 'ArrowLeft':
        d.setDate(d.getDate() - 1);
        handled = true;
        break;
      case 'ArrowRight':
        d.setDate(d.getDate() + 1);
        handled = true;
        break;
      case 'ArrowUp':
        d.setDate(d.getDate() - 7);
        handled = true;
        break;
      case 'ArrowDown':
        d.setDate(d.getDate() + 7);
        handled = true;
        break;
      case 'PageUp':
        CalendarModule.changeMonth(-1);
        CalendarModule.refresh('all');
        handled = true;
        break;
      case 'PageDown':
        CalendarModule.changeMonth(1);
        CalendarModule.refresh('all');
        handled = true;
        break;
      case 'Home':
        if (e.ctrlKey || e.metaKey) {
          // Ctrl+Home: 今天
          CalendarModule.goToday();
          CalendarModule.refresh('all');
        } else {
          // Home: 当月第一天
          _focusFirstDay();
        }
        handled = true;
        break;
      case 'End':
        _focusLastDay();
        handled = true;
        break;
      case 'Enter':
      case ' ':
        if (dateKey && !cell.classList.contains('other-month')) {
          _handleSingleTap(dateKey, cell);
        }
        handled = true;
        break;
      default:
        break;
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }

    // 箭头键：聚焦并发射事件
    if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown') {
      let newKey = fmtDate(d);
      let newCell = _gridEl.querySelector('.day[data-date="' + newKey + '"]');
      if (newCell && !newCell.classList.contains('other-month')) {
        newCell.focus();
        if (typeof CalendarModule !== 'undefined' && CalendarModule.emit) {
          CalendarModule.emit('keyboardNavigate', { dateKey: newKey });
        }
      }
    }
  }

  // ── 手势处理 ──────────────────────────────────────────────────

  function _handleSingleTap(dateKey, cell) {
    if (!dateKey || !cell) return;
    let d = new Date(dateKey + 'T00:00:00');
    let pred = typeof predict === 'function' ? predict() : null;

    // 高亮日期
    _clearSelection();
    cell.classList.add('selected');

    // 更新状态
    if (typeof CalendarState !== 'undefined') {
      CalendarState.set('selectedDate', d);
    }

    // 显示快捷浮窗
    showQuickDateInfo(dateKey, cell);

    // 发射事件
    if (typeof CalendarModule !== 'undefined' && CalendarModule.emit) {
      CalendarModule.emit('dayClick', { dateKey: dateKey, date: d, cell: cell });
    }
  }

  function _handleDoubleTap(dateKey, cell) {
    _clearTapState();
    _clearSelection();
    cell.classList.add('selected');

    let idx = state.records.findIndex(function (r) {
      return sameDay(r, new Date(dateKey + 'T00:00:00'));
    });

    if (idx >= 0) {
      state.records.splice(idx, 1);
      if (typeof toast === 'function') toast('🚫 ' + (typeof t === 'function' ? t('toast.unmarked') : '已取消'));
    } else {
      state.records.push(new Date(dateKey + 'T00:00:00'));
      state.records.sort(function (a, b) {
        return a - b;
      });
      cell.classList.add('celebrate');
      setTimeout(function () {
        cell.classList.remove('celebrate');
      }, 500);
      if (typeof toast === 'function') toast('🩸 ' + (typeof t === 'function' ? t('toast.marked') : '已标记'));
      if (typeof checkCycleCelebration === 'function') checkCycleCelebration();
    }

    saveState();
    if (typeof CalendarModule !== 'undefined' && CalendarModule.refresh) {
      CalendarModule.refresh('grid');
    }
    if (typeof updateFab === 'function') updateFab();

    // 发射事件
    if (typeof CalendarModule !== 'undefined' && CalendarModule.emit) {
      CalendarModule.emit('dayDoubleClick', { dateKey: dateKey, date: new Date(dateKey + 'T00:00:00') });
    }
  }

  function _handleLongPress(dateKey, cell) {
    // 长按 500ms+ 打开 Modal
    let d = new Date(dateKey + 'T00:00:00');
    let pred = typeof predict === 'function' ? predict() : null;
    _clearSelection();
    cell.classList.add('selected');

    if (typeof CalendarModule !== 'undefined' && CalendarModule.openModal) {
      CalendarModule.openModal(d, pred);
    } else if (typeof window.openModal === 'function') {
      window.openModal(d, pred);
    }
  }

  // ── 其他月份导航 ──────────────────────────────────────────────

  function _navigateToOtherMonth(cell, dateKey) {
    let d = new Date(dateKey + 'T00:00:00');
    let targetMonth = d.getMonth();
    let targetYear = d.getFullYear();

    if (typeof CalendarState !== 'undefined') {
      CalendarState.batch({ viewMonth: targetMonth, viewYear: targetYear });
    }
    if (typeof CalendarModule !== 'undefined' && CalendarModule.refresh) {
      CalendarModule.refresh('all');
    }
  }

  // ── 焦点工具 ──────────────────────────────────────────────────

  function _focusFirstDay() {
    if (!_gridEl) return;
    let first = _gridEl.querySelector('.day:not(.other-month)');
    if (first) first.focus();
  }

  function _focusLastDay() {
    if (!_gridEl) return;
    let days = _gridEl.querySelectorAll('.day:not(.other-month)');
    if (days.length > 0) days[days.length - 1].focus();
  }

  // ── 选择清理 ──────────────────────────────────────────────────

  function _clearSelection() {
    if (!_gridEl) return;
    let sel = _gridEl.querySelector('.day.selected');
    if (sel) sel.classList.remove('selected');
  }

  function _clearTapState() {
    if (_tapTimer) {
      clearTimeout(_tapTimer);
      _tapTimer = null;
    }
    _tapCell = null;
  }

  function _clearLongPress() {
    if (_longPressTimer) {
      clearTimeout(_longPressTimer);
      _longPressTimer = null;
    }
    _longPressCell = null;
  }

  function _clearTimers() {
    _clearTapState();
    _clearLongPress();
  }

  // ── 文档级点击隐藏浮窗 ────────────────────────────────────────

  function _onDocClickForTooltip(e) {
    if (_tooltipEl && !_tooltipEl.contains(e.target)) {
      hideQuickDateInfo();
    }
  }

  // ── 导出 ──────────────────────────────────────────────────────
  return {
    setupInteraction: setupInteraction,
    destroyInteraction: destroyInteraction,
    showQuickDateInfo: showQuickDateInfo,
    hideQuickDateInfo: hideQuickDateInfo,
  };
})();

/* 全局别名 */
if (typeof window !== 'undefined') {
  window.CalendarInteraction = CalendarInteraction;
}
