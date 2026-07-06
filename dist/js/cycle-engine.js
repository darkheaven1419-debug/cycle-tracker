"use strict";

/* ================================================================
   cycle-engine.js — 日历数据引擎（纯函数）

   输入原始经期记录 → 输出 CalendarCell[]（42 格数组）
   - 用户录入的经期起止日期优先于任何预测
   - 不含任何 DOM 操作
   - 渲染层不应当在此引擎之外做额外阶段判断
   - 预留 userA / userB 支持，当前 userB 返回 null
   ================================================================ */

var CycleEngine = (function () {

  /* ================================================================
     内建日期工具（纯函数，不依赖 cycle-core.js）
     ================================================================ */

  /** Date → "YYYY-MM-DD" */
  function fmtDate(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  /** 判断两个 Date 是否同一天 */
  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  /** Date + n 天（返回新对象） */
  function addDays(date, n) {
    var r = new Date(date);
    r.setDate(r.getDate() + n);
    return r;
  }

  /** 计算相差天数 */
  function daysDiff(a, b) {
    return Math.round((b.getTime() - a.getTime()) / 86400000);
  }

  /** Date → 归零到午夜（纯函数，返回新对象） */
  function d0(date) {
    var r = new Date(date);
    r.setHours(0, 0, 0, 0);
    return r;
  }

  /** 获取今天 00:00:00 */
  function today() {
    var t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }

  /* ================================================================
     核心阶段计算
     ================================================================ */

  /**
   * 获取一个经期记录的结束日期
   * @param {Date} periodStart - 周期开始日期
   * @param {Object} periodEnds - { 'YYYY-MM-DD': 'YYYY-MM-DD' }
   * @param {number} defaultPeriodLen - 默认经期长度
   * @returns {Date} 结束日期（经期最后一天）
   */
  function getPeriodEndDate(periodStart, periodEnds, defaultPeriodLen) {
    var key = fmtDate(periodStart);
    if (periodEnds && periodEnds[key]) {
      return d0(new Date(periodEnds[key] + 'T00:00:00'));
    }
    return addDays(d0(periodStart), defaultPeriodLen - 1);
  }

  /**
   * 在两个已知周期之间计算某天的非经期阶段
   * @param {Date} date - 待计算日期（已 d0）
   * @param {Date} periodEnd - 本次经期结束日（已 d0）
   * @param {Date} nextPeriodStart - 下次经期开始日（已 d0）
   * @returns {string|null} 'follicular' | 'ovulation' | 'fertile' | 'luteal' | null
   */
  function computeCyclePhase(date, periodEnd, nextPeriodStart) {
    var d = d0(date);

    var ovulation = addDays(nextPeriodStart, -14);
    var fertileStart = addDays(ovulation, -3);
    var fertileEnd = addDays(ovulation, 2);

    // 卵泡期
    if (d >= periodEnd && d < fertileStart) return 'follicular';

    // 受孕窗口（含排卵日）
    if (d >= fertileStart && d <= fertileEnd) {
      if (sameDay(d, ovulation)) return 'ovulation';
      return 'fertile';
    }

    // 黄体期
    if (d > fertileEnd && d < nextPeriodStart) return 'luteal';

    return null;
  }

  /**
   * 计算单日的阶段信息
   *
   * 优先级（从高到低）：
   *   1. 用户录入的经期区间（绝对优先）
   *   2. 两个录入周期之间的阶段（基于真实周期长度）
   *   3. 最后一个录入周期后的预测阶段
   *   4. 逾期后的阶段（持续预测，最多到第 3 周期）
   *
   * @param {Date} date - 待计算日期
   * @param {Date[]} sortedRecords - 经期开始日期（已排序、已 d0）
   * @param {Object} periodEnds - 结束日期映射
   * @param {Object} settings - { cycleLength, periodLength }
   * @returns {Object} phaseInfo
   */
  function computeDayPhase(date, sortedRecords, periodEnds, settings) {
    var d = d0(date);
    var periodLen = (settings && settings.periodLength) || 7;

    // ===== STEP 1: 检查是否在已录入的经期内 =====
    for (var i = 0; i < sortedRecords.length; i++) {
      var start = d0(sortedRecords[i]);
      var end = getPeriodEndDate(sortedRecords[i], periodEnds, periodLen);

      if (d >= start && d <= end) {
        var cycleDay = daysDiff(start, d) + 1;
        var isFirstDay = sameDay(d, start);
        return {
          phase: isFirstDay ? 'period-on' : 'period-mid',
          semanticPhase: 'period',
          predicted: false,
          cycleDay: cycleDay,
          isOverdue: false,
          futurePeriod: false,
        };
      }
    }

    // 无记录
    if (sortedRecords.length === 0) {
      return { phase: null, semanticPhase: null, predicted: false, cycleDay: null, isOverdue: false, futurePeriod: false };
    }

    // ===== STEP 2: 计算周期指标 =====
    var cycles = [];
    for (var j = 1; j < sortedRecords.length; j++) {
      cycles.push(daysDiff(d0(sortedRecords[j - 1]), d0(sortedRecords[j])));
    }

    var recentCycles = cycles.slice(-3);
    var avgCycle = recentCycles.length > 0
      ? Math.round(recentCycles.reduce(function (a, b) { return a + b; }, 0) / recentCycles.length)
      : (settings && settings.cycleLength) || 28;

    var lastStart = d0(sortedRecords[sortedRecords.length - 1]);
    var lastEnd = getPeriodEndDate(sortedRecords[sortedRecords.length - 1], periodEnds, periodLen);

    // ===== STEP 3: 检查是否在两个已录入周期之间 =====
    for (var k = 0; k < sortedRecords.length - 1; k++) {
      var thisStart = d0(sortedRecords[k]);
      var thisEnd = getPeriodEndDate(sortedRecords[k], periodEnds, periodLen);
      var nextStart = d0(sortedRecords[k + 1]);

      if (d > thisEnd && d < nextStart) {
        var phase = computeCyclePhase(d, thisEnd, nextStart);
        var cd = daysDiff(lastStart, d) + 1;
        return {
          phase: phase,
          semanticPhase: phase,
          predicted: false,
          cycleDay: cd,
          isOverdue: false,
          futurePeriod: false,
        };
      }
    }

    // ===== STEP 4: 日期在最后一个录入周期之后 =====
    var predictedNextStart = addDays(lastStart, avgCycle);
    var predictedNextEnd = addDays(predictedNextStart, periodLen - 1);

    // 4a: 在预测的下次经期内
    if (d >= predictedNextStart && d <= predictedNextEnd) {
      var cdPred = daysDiff(lastStart, d) + 1;
      var isPredFirst = sameDay(d, predictedNextStart);
      return {
        phase: isPredFirst ? 'period-pred-first' : 'period-pred',
        semanticPhase: 'period',
        predicted: true,
        cycleDay: cdPred,
        isOverdue: false,
        futurePeriod: false,
      };
    }

    // 4b: 在最后一个经期结束后、预测下次经期前
    if (d > lastEnd && d < predictedNextStart) {
      var phaseBetween = computeCyclePhase(d, lastEnd, predictedNextStart);
      var cdBetween = daysDiff(lastStart, d) + 1;
      return {
        phase: phaseBetween,
        semanticPhase: phaseBetween,
        predicted: true,
        cycleDay: cdBetween,
        isOverdue: false,
        futurePeriod: false,
      };
    }

    // ===== STEP 5: 日期在预测经期之后（逾期）=====
    if (d > predictedNextEnd) {
      var nextPeriod2Start = addDays(predictedNextStart, avgCycle);
      var nextPeriod2End = addDays(nextPeriod2Start, periodLen - 1);

      /* 第 2 个预测经期内 */
      if (d >= nextPeriod2Start && d <= nextPeriod2End) {
        var cdFut = daysDiff(lastStart, d) + 1;
        var isFutFirst = sameDay(d, nextPeriod2Start);
        return {
          phase: isFutFirst ? 'period-future-first' : 'period-future',
          semanticPhase: 'period',
          predicted: true,
          cycleDay: cdFut,
          isOverdue: true,
          futurePeriod: true,
        };
      }

      /* 第 2 个周期内的非经期阶段 */
      if (d < nextPeriod2Start) {
        var phaseFut = computeCyclePhase(d, predictedNextEnd, nextPeriod2Start);
        var cdFut2 = daysDiff(lastStart, d) + 1;
        return {
          phase: phaseFut,
          semanticPhase: phaseFut,
          predicted: true,
          cycleDay: cdFut2,
          isOverdue: true,
          futurePeriod: true,
        };
      }

      /* 第 3 个周期（限制预测范围） */
      var nextPeriod3Start = addDays(nextPeriod2Start, avgCycle);
      if (d < nextPeriod3Start) {
        var phaseFut3 = computeCyclePhase(d, nextPeriod2End, nextPeriod3Start);
        var cdFut3 = daysDiff(lastStart, d) + 1;
        return {
          phase: phaseFut3,
          semanticPhase: phaseFut3,
          predicted: true,
          cycleDay: cdFut3,
          isOverdue: true,
          futurePeriod: true,
        };
      }

      /* 超过第 3 个周期 */
      return { phase: null, semanticPhase: null, predicted: true, cycleDay: null, isOverdue: true, futurePeriod: true };
    }

    return { phase: null, semanticPhase: null, predicted: false, cycleDay: null, isOverdue: false, futurePeriod: false };
  }

  /* ================================================================
     42 格日历生产
     ================================================================ */

  /**
   * @typedef {Object} CalendarCell
   * @property {Date}     date           - 日期对象
   * @property {string}   dateKey        - "YYYY-MM-DD"
   * @property {number}   dayNumber      - 1-31
   * @property {boolean}  isCurrentMonth - 在当前视图月内
   * @property {boolean}  isToday        - 是否为今天
   * @property {string|null}  phase      - CSS 阶段类名
   * @property {string|null}  semanticPhase - 语义阶段
   * @property {boolean}  predicted      - 是否依赖预测数据
   * @property {number|null} cycleDay    - 当前周期第几天
   * @property {boolean}  isOverdue      - 预测经期已过期
   * @property {boolean}  futurePeriod   - 未来第 2+ 个预测周期
   * @property {boolean}  periodStart    - 此日是用户标记的经期开始
   * @property {boolean}  periodEnd      - 此日是用户标记的经期结束
   * @property {Object|null} userA       - 用户 A 数据（预留）
   * @property {Object|null} userB       - 用户 B 数据（预留，当前返回 null）
   * 以下由渲染层填充：
   * @property {Array}    holidays       - 节日
   * @property {Object|null} solarTerm   - 节气
   * @property {string|null} lunarDay    - 农历日
   * @property {Object|null} symptoms    - 症状
   * @property {Array}    markers        - 日历标记
   * @property {boolean}  hasDiary       - 有日记
   * @property {number}   anniversary    - 纪念日类型
   * @property {boolean}  birthday       - 生日
   * @property {Object|null} specialDate - 特别日期
   */

  /**
   * 生成 42 格日历数据（6 行 × 7 列）
   *
   * @param {number}   year        - 年份
   * @param {number}   month       - 月份（0-11）
   * @param {Date[]}   records     - 经期开始日期数组
   * @param {Object}   periodEnds  - 经期结束映射
   * @param {Object}   settings    - { cycleLength, periodLength }
   * @param {Date}     [todayDate] - 用于判断"今天"
   * @returns {CalendarCell[]} 长度 42
   */
  function computeCalendarCells(year, month, records, periodEnds, settings, todayDate) {
    var td = todayDate ? d0(todayDate) : today();
    var safeSettings = Object.assign({ cycleLength: 28, periodLength: 7 }, settings || {});

    // 排序并归一化记录
    var sortedRecords = [];
    for (var si = 0; si < records.length; si++) {
      sortedRecords.push(d0(records[si]));
    }
    sortedRecords.sort(function (a, b) { return a - b; });

    // 计算网格起始日期（前推到周一）
    var firstDay = new Date(year, month, 1);
    var dow = firstDay.getDay();
    dow = dow === 0 ? 6 : dow - 1; // Sun→6, Mon→0
    var gridStart = addDays(firstDay, -dow);

    // 建立记录集（O(1) 查询）
    var recordedStartSet = {};
    for (var rsi = 0; rsi < sortedRecords.length; rsi++) {
      recordedStartSet[fmtDate(sortedRecords[rsi])] = true;
    }

    // 经期结束集
    var periodEndSet = {};
    for (var pei = 0; pei < sortedRecords.length; pei++) {
      var peKey = fmtDate(sortedRecords[pei]);
      if (periodEnds && periodEnds[peKey]) {
        periodEndSet[periodEnds[peKey]] = true;
      }
    }

    // 计算平均周期长度（用于 cycleDay 判断）
    var avgCycleForDay = safeSettings.cycleLength;
    if (sortedRecords.length >= 2) {
      var cycArr = [];
      for (var ci = 1; ci < sortedRecords.length; ci++) {
        cycArr.push(daysDiff(sortedRecords[ci - 1], sortedRecords[ci]));
      }
      var recentC = cycArr.slice(-3);
      if (recentC.length > 0) {
        avgCycleForDay = Math.round(recentC.reduce(function (a, b) { return a + b; }, 0) / recentC.length);
      }
    }

    var cells = [];

    for (var i = 0; i < 42; i++) {
      var date = addDays(gridStart, i);
      var dateKey = fmtDate(date);
      var isCurrentMonth = (date.getMonth() === month && date.getFullYear() === year);
      var isTodayFlag = sameDay(date, td);

      // 阶段计算（仅当月格子计算，其他月份格子无阶段）
      var phaseInfo = isCurrentMonth
        ? computeDayPhase(date, sortedRecords, periodEnds, safeSettings)
        : { phase: null, semanticPhase: null, predicted: false, cycleDay: null, isOverdue: false, futurePeriod: false };

      // cycleDay 限制在当前周期内显示
      var displayCycleDay = null;
      if (phaseInfo.cycleDay !== null && sortedRecords.length > 0) {
        if (phaseInfo.cycleDay >= 1 && phaseInfo.cycleDay <= avgCycleForDay) {
          displayCycleDay = phaseInfo.cycleDay;
        }
      }

      var cell = {
        // 基础信息
        date: date,
        dateKey: dateKey,
        dayNumber: date.getDate(),
        isCurrentMonth: isCurrentMonth,
        isToday: isTodayFlag,

        // 阶段信息
        phase: phaseInfo.phase,
        semanticPhase: phaseInfo.semanticPhase,
        predicted: phaseInfo.predicted,
        cycleDay: displayCycleDay,
        isOverdue: phaseInfo.isOverdue,
        futurePeriod: phaseInfo.futurePeriod,

        // 经期标记
        periodStart: !!recordedStartSet[dateKey],
        periodEnd: !!periodEndSet[dateKey],

        // 预留双用户
        userA: null,
        userB: null,

        // 占位字段（渲染层填充）
        holidays: [],
        solarTerm: null,
        lunarDay: null,
        symptoms: null,
        markers: [],
        hasDiary: false,
        anniversary: 0,
        birthday: false,
        specialDate: null,
      };

      cells.push(cell);
    }

    return cells;
  }

  /* ================================================================
     公开 API
     ================================================================ */
  return {
    /** 主入口：生成 42 格日历数据 */
    computeCalendarCells: computeCalendarCells,

    /** 单日阶段计算（可用于查询指定日期的阶段） */
    computeDayPhase: computeDayPhase,

    /** 日期工具（方便其他模块共用） */
    fmtDate: fmtDate,
    sameDay: sameDay,
    addDays: addDays,
    daysDiff: daysDiff,
    d0: d0,
    today: today,
  };
})();
