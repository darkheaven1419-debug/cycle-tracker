"use strict";

/* ================================================================
   render-calendar.js — 日历视图渲染器

   接收 CalendarCell[] 数组 → 构建完整 DOM 日历网格。
   - 不做任何阶段判断（阶段由 CycleEngine 提供）
   - 调用全局数据模块填充节日、农历、记号等辅助信息
   - 保持与现有交互完全一致（点击、双击、触摸、键盘）
   ================================================================ */

var CalendarRenderer = (function () {

  /* ================================================================
     症状图标常量（与 app.js MOOD_EMOJIS 保持一致）
     ================================================================ */
  var SYMPTOM_EMOJIS = {
    cramps: '\u{1F623}', mood: '\u{1F60A}', flow: '\u{1F4A7}',
    headache: '\u{1F915}', fatigue: '\u{1F634}', cravings: '\u{1F36B}',
  };

  /* ================================================================
     日期格渲染
     ================================================================ */

  /**
   * 构建一个日期格 DOM 元素
   * @param {Object} cell   - CalendarCell（来自 CycleEngine）
   * @param {Object} opts   - 渲染选项
   * @param {Object} opts.pred       - predict() 结果
   * @param {string} opts.activeProfile - 当前用户
   * @param {string} opts.lang       - 当前语言
   * @param {Object} opts.sharedDiaryIdx - { dateKey: true } 日记索引
   * @param {Object} opts.sharedDiaryData - 完整日记数据
   * @param {Object} opts.symptoms   - state.symptoms
   * @returns {HTMLElement}
   */
  function buildDayCell(cell, opts) {
    var d = cell.date;
    var key = cell.dateKey;
    var isInMonth = cell.isCurrentMonth;
    var el = document.createElement('div');
    el.className = 'day';

    /* ---- 基础样式 ---- */
    if (!isInMonth) el.classList.add('other-month');
    if (cell.isToday) {
      el.classList.add('today');
      el.setAttribute('aria-current', 'date');
    }

    /* ---- 阶段类 ---- */
    if (cell.phase) {
      el.classList.add(cell.phase);
    }
    if (cell.periodStart && cell.phase === 'period-on') {
      el.classList.add('recorded');
    }

    /* ---- 纪念日 / 生日 / 特别日期 ---- */
    var annType = typeof isAnniversary === 'function' ? isAnniversary(d) : 0;
    if (annType > 0) el.classList.add('anniversary');

    if (typeof getBirthday === 'function' && getBirthday(d)) {
      el.classList.add('birthday');
    }

    if (typeof getSpecialDate === 'function') {
      var special = getSpecialDate(d);
      if (special) {
        var spIcon = document.createElement('span');
        spIcon.className = 'special-date-icon';
        spIcon.textContent = special.icon;
        spIcon.title = opts.activeProfile === 'barry' ? special.title_zh : special.title_sr;
        el.appendChild(spIcon);
        if (special.type === 'firstmeet') el.classList.add('first-meet');
        if (special.type === 'monthly') el.classList.add('monthly-anni');
      }
    }

    /* ---- 键盘导航 ---- */
    if (isInMonth) {
      el.setAttribute('tabindex', '0');
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      });
    }

    /* ---- 日期数字 ---- */
    var daySpan = document.createElement('span');
    daySpan.className = 'day-num';
    daySpan.textContent = cell.dayNumber;
    el.appendChild(daySpan);

    /* ---- 周期第几天 ---- */
    if (cell.cycleDay !== null && isInMonth && !cell.phase) {
      var cdSpan = document.createElement('span');
      cdSpan.className = 'day-cycle-num';
      cdSpan.textContent = String(cell.cycleDay);
      el.appendChild(cdSpan);
    }

    /* ---- 农历 ---- */
    if (isInMonth && typeof Lunar !== 'undefined' && typeof getLunarCellText === 'function') {
      var lunarDayName = getLunarCellText(d);
      if (lunarDayName) {
        var cls = typeof getLunarCellClass === 'function' ? getLunarCellClass(d) : '';
        var lunarSpan = document.createElement('span');
        lunarSpan.className = 'lunar-date ' + cls;
        lunarSpan.textContent = lunarDayName;
        el.appendChild(lunarSpan);
      }
    }

    /* ---- ARIA ---- */
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', key);

    /* ---- 症状图标 ---- */
    var symptoms = (opts.symptoms && opts.symptoms[key]) || null;
    if (symptoms && !cell.phase) {
      var hasSymp = false;
      for (var sk in symptoms) {
        if (sk !== 'notes' && symptoms[sk] > 0) { hasSymp = true; break; }
      }
      if (hasSymp) {
        var miniDiv = document.createElement('div');
        miniDiv.className = 'day-symptoms';
        ['cramps', 'mood', 'flow', 'headache', 'fatigue', 'cravings'].forEach(function (sym) {
          if (symptoms[sym] && symptoms[sym] > 0) {
            var symEl = document.createElement('span');
            symEl.className = 'day-sym-icon';
            symEl.textContent = SYMPTOM_EMOJIS[sym] || sym;
            symEl.title = sym;
            miniDiv.appendChild(symEl);
          }
        });
        if (miniDiv.children.length > 0) el.appendChild(miniDiv);
      }
    }

    /* ---- 日记标记 ---- */
    var sdIdx = opts.sharedDiaryIdx || {};
    var sdData = opts.sharedDiaryData || {};
    if (sdIdx[key]) {
      var sdEntry = sdData[key] || {};
      var hasA = !!sdEntry.andjela;
      var hasB = !!sdEntry.barry;
      var diaryTooltip = '';
      if (hasA && hasB) {
        diaryTooltip = '\u{1F495} Oboje';
        var dotBoth = document.createElement('span');
        dotBoth.className = 'mini-dot gold';
        dotBoth.style.cssText = 'position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:5px;height:5px;border-radius:50%;background:var(--gold)';
        dotBoth.title = diaryTooltip;
        el.appendChild(dotBoth);
      } else if (hasA) {
        diaryTooltip = '\u{1F338} Anđela';
        var dotA = document.createElement('span');
        dotA.className = 'mini-dot';
        dotA.style.cssText = 'position:absolute;bottom:8px;left:calc(50% - 4px);width:4px;height:4px;border-radius:50%;background:#c45a6b;opacity:.7';
        dotA.title = diaryTooltip;
        el.appendChild(dotA);
      } else if (hasB) {
        diaryTooltip = '\u{1F466} Barry';
        var dotB = document.createElement('span');
        dotB.className = 'mini-dot';
        dotB.style.cssText = 'position:absolute;bottom:8px;left:calc(50% + 4px);width:4px;height:4px;border-radius:50%;background:#4A90D9;opacity:.7';
        dotB.title = diaryTooltip;
        el.appendChild(dotB);
      }
      if (isInMonth && diaryTooltip) {
        var previewText = '';
        try {
          var entryA = sdEntry.andjela;
          var entryB = sdEntry.barry;
          if (hasA && entryA) previewText += '\u{1F338} ' + (entryA.text || entryA.happy || '').substring(0, 40);
          if (hasB && entryB) previewText += (previewText ? ' | ' : '') + '\u{1F466} ' + (entryB.text || entryB.happy || '').substring(0, 40);
        } catch (e) { /* ignore */ }
        if (previewText) el.setAttribute('data-diary', previewText);
      }
    }

    /* ---- 日历记号（表情标记） ---- */
    if (typeof getCalendarSummary === 'function' && isInMonth) {
      var calSummary = getCalendarSummary(key);
      var hasMarkers = calSummary.andjela.length > 0 || calSummary.barry.length > 0;
      if (hasMarkers) {
        var markerRow = document.createElement('div');
        markerRow.className = 'day-marker-row';
        var allMarkers = calSummary.barry.concat(calSummary.andjela);
        for (var mi = 0; mi < Math.min(allMarkers.length, 3); mi++) {
          var mSpan = document.createElement('span');
          mSpan.className = 'cal-marker-emoji';
          mSpan.textContent = allMarkers[mi].emoji;
          mSpan.title = (allMarkers[mi].author === 'andjela' ? '\u{1F338} Anđela' : '\u{1F466} Barry') + ': ' + (allMarkers[mi].note || '');
          markerRow.appendChild(mSpan);
        }
        el.appendChild(markerRow);
      }
    }

    /* ---- 纪念日爱心 ---- */
    if (annType === 2 && !cell.phase) {
      var dotGold = document.createElement('span');
      dotGold.className = 'mini-dot gold';
      el.appendChild(dotGold);
    }

    /* ---- 节气 ---- */
    if (typeof getSolarTerm === 'function') {
      var solarTerm = getSolarTerm(key);
      if (solarTerm && isInMonth) {
        var stName = solarTerm.name[opts.lang] || (opts.lang ? solarTerm.name[opts.lang.split('-')[0]] : null) || solarTerm.name['sr'] || solarTerm.name['zh-CN'] || '';
        var stLabel = document.createElement('span');
        stLabel.className = 'solar-term-label';
        stLabel.textContent = stName;
        stLabel.title = stName;
        el.appendChild(stLabel);
        el.classList.add('solar-term-day');
        if (!solarTerm.story && typeof ensureSolarTermData === 'function') {
          ensureSolarTermData();
        }
      }
    }

    /* ---- 节日图标 ---- */
    if (typeof getHoliday === 'function') {
      var holidays = getHoliday(key);
      holidays.forEach(function (h) {
        var icon = document.createElement('span');
        icon.className = 'holiday-icon holiday-' + h.country;
        icon.textContent = h.icon || (h.country === 'cn' ? '\u{1F389}' : '\u{1F1F7}\u{1F1F8}');
        icon.title = h.name[opts.lang] || (opts.lang ? h.name[opts.lang.split('-')[0]] : null) || h.name['sr'] || h.name['zh-CN'] || '';
        el.appendChild(icon);
      });
    }

    /* ---- 双击检测 & 弹窗 ---- */
    if (isInMonth) {
      (function () {
        var tapTimer = null;
        el.addEventListener('click', function (e) {
          if (tapTimer) {
            clearTimeout(tapTimer);
            tapTimer = null;
            if (typeof togglePeriodRecord === 'function') togglePeriodRecord(d);
            el.classList.add('celebrate');
            setTimeout(function () { el.classList.remove('celebrate'); }, 500);
            e.preventDefault();
          } else {
            tapTimer = setTimeout(function () {
              tapTimer = null;
              if (typeof openModal === 'function') openModal(d, opts.pred);
            }, 280);
          }
        });

        var touchCount = 0;
        var touchTimer = null;
        el.addEventListener('touchend', function (e) {
          touchCount++;
          if (touchCount === 1) {
            touchTimer = setTimeout(function () { touchCount = 0; }, 350);
          } else if (touchCount === 2) {
            clearTimeout(touchTimer);
            touchCount = 0;
            if (tapTimer) {
              clearTimeout(tapTimer);
              tapTimer = null;
            }
            if (typeof togglePeriodRecord === 'function') togglePeriodRecord(d);
            e.preventDefault();
          }
        });
      })();
    }

    return el;
  }

  /* ================================================================
     主渲染入口
     ================================================================ */

  /**
   * 渲染日历网格
   *
   * @param {HTMLElement} grid          - daysGrid DOM 元素
   * @param {Object[]}    cells         - CalendarCell[]（来自 CycleEngine）
   * @param {Object}      opts          - 选项
   * @param {boolean}     opts.isWeekView    - 是否周视图
   * @param {number}      opts.CalState.month     - 当前视图月
   * @param {number}      opts.CalState.year      - 当前视图年
   * @param {Object}      opts.pred          - predict() 结果
   * @param {string}      opts.activeProfile - 当前用户
   * @param {string}      opts.lang          - 当前语言
   * @param {Object}      [opts.symptoms]    - state.symptoms（可选）
   * @returns {void}
   */
  function render(grid, cells, opts) {
    if (!grid || !cells) return;
    opts = opts || {};
    var isWeekView = !!opts.isWeekView;
    var lang = opts.lang || 'sr';
    var activeProfile = opts.activeProfile || 'andjela';
    var pred = opts.pred || { futurePeriods: [] };

    /* ---- 预测图例 ---- */
    var plEl = document.getElementById('predLegend');
    if (plEl) {
      var futureCount = pred.futurePeriods ? pred.futurePeriods.length : 0;
      if (futureCount > 0 && !isWeekView) {
        plEl.style.display = '';
        if (typeof t === 'function') plEl.textContent = t('calendarPredLegend');
      } else {
        plEl.style.display = 'none';
      }
    }

    /* ---- 日记索引 ---- */
    var sharedDiaryData = {};
    var sharedDiaryIdx = {};
    try {
      var raw = localStorage.getItem('shared-diary');
      if (raw) {
        sharedDiaryData = JSON.parse(raw);
        Object.keys(sharedDiaryData).forEach(function (k) {
          if (sharedDiaryData[k] && (sharedDiaryData[k].barry || sharedDiaryData[k].andjela)) {
            sharedDiaryIdx[k] = true;
          }
        });
      }
    } catch (e) { /* ignore */ }

    /* ---- 症状数据 ---- */
    var symptoms = opts.symptoms || {};

    /* ---- 网格属性 ---- */
    grid.setAttribute('role', 'grid');
    if (typeof t === 'function') {
      grid.setAttribute('aria-label', t('calendarGridLabel') || 'Calendar');
    }
    grid.classList.toggle('week-view', isWeekView);

    /* ---- 构建 DOM 片段 ---- */
    var frag = document.createDocumentFragment();

    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];

      /* 周数格（月视图，每行第一个格子之前） */
      if (!isWeekView && i % 7 === 0 && i < cells.length) {
        var wkCell = document.createElement('div');
        wkCell.className = 'week-num';
        var wkDate = cell.date;
        var jan1 = new Date(wkDate.getFullYear(), 0, 1);
        var wkNum = Math.ceil(((wkDate - jan1) / 86400000 + jan1.getDay() + 1) / 7);
        wkCell.textContent = wkNum;
        wkCell.setAttribute('aria-hidden', 'true');
        frag.appendChild(wkCell);
      }

      /* 日期格 */
      var dayEl = buildDayCell(cell, {
        pred: pred,
        activeProfile: activeProfile,
        lang: lang,
        sharedDiaryIdx: sharedDiaryIdx,
        sharedDiaryData: sharedDiaryData,
        symptoms: symptoms,
      });

      frag.appendChild(dayEl);
    }

    grid.innerHTML = '';
    grid.appendChild(frag);
  }

  /* ================================================================
     公开 API
     ================================================================ */
  return {
    /** 主渲染入口 */
    render: render,
  };
})();
