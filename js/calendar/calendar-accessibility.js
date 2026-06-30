'use strict';

/* ================================================================
   CalendarAccessibility — 无障碍增强层

   职责：
   - WAI-ARIA Grid 角色管理
   - aria-live 公告系统
   - 非视觉阶段指示器
   - 键盘焦点管理

   调用者：
   - calendar-main.js（新文件）— 主引擎 init 时调用
   - calendar-renderer.js（新文件）— 渲染时设置 ARIA
   - calendar-interaction.js（新文件）— 键盘导航

   现有文件验证：无重复（Glob pattern 无匹配）
   数据文件：本文件不读写任何数据文件，纯 DOM ARIA 管理
   用户指令："我要完整版，开始吧"
   ================================================================ */

const CalendarAccessibility = (function () {
  'use strict';

  // ── 公告容器 ──────────────────────────────────────────────────
  let _announceEl = null;

  /**
   * 初始化公告容器（在 DOM 中创建 aria-live 区域）
   */
  function init() {
    if (document.getElementById('cal-announce')) return;
    const el = document.createElement('div');
    el.id = 'cal-announce';
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    el.className = 'sr-only';
    el.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
    document.body.appendChild(el);
    _announceEl = el;
  }

  /**
   * 公告消息
   * @param {string} msg
   */
  function announce(msg) {
    if (!_announceEl) init();
    if (!_announceEl) return;
    _announceEl.textContent = '';
    requestAnimationFrame(function () {
      _announceEl.textContent = msg;
    });
  }

  // ── ARIA 属性管理 ────────────────────────────────────────────

  /**
   * 为日历网格设置 ARIA 角色
   * @param {HTMLElement} gridEl - .days 容器
   */
  function setGridRoles(gridEl) {
    if (!gridEl) return;
    gridEl.setAttribute('role', 'grid');
    gridEl.setAttribute('aria-label', _getGridLabel());

    const dayCells = gridEl.querySelectorAll('.day:not(.other-month)');
    dayCells.forEach(function (cell) {
      if (!cell.hasAttribute('role') || cell.getAttribute('role') !== 'gridcell') {
        cell.setAttribute('role', 'gridcell');
      }
    });
  }

  /**
   * 为单个日期 cell 设置完整 ARIA 标签
   * @param {HTMLElement} cell
   * @param {object} info
   */
  function setCellLabel(cell, info) {
    if (!cell || !info) return;
    const parts = [];
    const d = info.date;

    parts.push(d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日');

    let weekdays = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    parts.push(weekdays[d.getDay()]);

    if (info.lunarInfo) {
      parts.push('农历' + (info.lunarInfo.monthName || '') + (info.lunarInfo.dayName || ''));
    }

    if (info.phase) {
      let labels = {
        'period-on': '经期第一天',
        'period-mid': '经期',
        'period-pred-first': '预计经期第一天',
        'period-pred': '预计经期',
        'period-future-first': '未来经期第一天',
        'period-future': '未来经期',
        ovulation: '排卵日',
        fertile: '易孕期',
        luteal: '黄体期',
        follicular: '卵泡期',
      };
      if (labels[info.phase]) parts.push(labels[info.phase]);
    }

    if (info.cycleDay) parts.push('周期第' + info.cycleDay + '天');
    if (info.holidayNames && info.holidayNames.length > 0) parts.push('节日：' + info.holidayNames.join('、'));
    if (info.solarTermName) parts.push('节气：' + info.solarTermName);
    if (info.isToday) parts.push('今天');
    if (info.isSelected) parts.push('已选中');

    cell.setAttribute('aria-label', parts.join('，'));
    cell.setAttribute('aria-selected', info.isSelected ? 'true' : 'false');

    if (info.isToday) {
      cell.setAttribute('aria-current', 'date');
    } else {
      cell.removeAttribute('aria-current');
    }
  }

  // ── 焦点管理 ──────────────────────────────────────────────────

  /**
   * 在日历网格中移动焦点
   */
  function moveFocus(direction, currentDate) {
    if (!currentDate) return null;
    const d = new Date(currentDate);
    switch (direction) {
      case 'left':
        d.setDate(d.getDate() - 1);
        break;
      case 'right':
        d.setDate(d.getDate() + 1);
        break;
      case 'up':
        d.setDate(d.getDate() - 7);
        break;
      case 'down':
        d.setDate(d.getDate() + 7);
        break;
      default:
        return null;
    }
    let key = fmtDate(d);
    let cell = document.querySelector('.day[data-date="' + key + '"]');
    if (cell && !cell.classList.contains('other-month')) {
      cell.focus();
      return d;
    }
    return currentDate;
  }

  /**
   * 聚焦到特定日期
   */
  function focusDate(date) {
    let key = fmtDate(date);
    let cell = document.querySelector('.day[data-date="' + key + '"]');
    if (cell && !cell.classList.contains('other-month')) {
      cell.focus();
      cell.setAttribute('tabindex', '0');
      return true;
    }
    return false;
  }

  // ── 内部工具 ──────────────────────────────────────────────────

  function _getGridLabel() {
    let y = CalendarState.get('viewYear');
    let m = CalendarState.get('viewMonth');
    return y + '年' + (m + 1) + '月' + '日历';
  }

  // ── 导出 ──────────────────────────────────────────────────────
  return {
    init: init,
    announce: announce,
    setGridRoles: setGridRoles,
    setCellLabel: setCellLabel,
    moveFocus: moveFocus,
    focusDate: focusDate,
  };
})();

/* 全局别名 */
if (typeof window !== 'undefined') {
  window.CalendarAccessibility = CalendarAccessibility;
}
