/**
 * Lunar Calendar Engine — pure JavaScript, no dependencies
 * Gregorian ↔ Chinese Lunar calendar conversion (1900–2100)
 * Includes: 天干地支, 生肖, 农历日期格式化
 */

var Lunar = (function() {
  // ── Lunar year data (1900–2100) ──────────────────────────────
  // Encoding: high nibble(4bits) = leap month (0=none, 1-12=which month)
  // Low 12-16 bits: each bit = 1 month, 0=29days, 1=30days (left to right, month 1-12/13)
  var LUNAR_INFO = [
    0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
    0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
    0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
    0x06566,0x0d4a0,0x0ea50,0x16a95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
    0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
    0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
    0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
    0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
    0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
    0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,
    0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
    0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
    0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
    0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
    0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
    0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,
    0x092e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
    0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
    0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
    0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a4d0,0x0d150,0x0f252,
    0x0d520
  ];

  var GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  var ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var SHENGXIAO = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
  var LUNAR_MONTHS = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];

  var LUNAR_DAYS = [
    '', '初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
    '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
    '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'
  ];

  // ── Internal helpers ────────────────────────────────────────

  function leapMonth(y) {
    return LUNAR_INFO[y - 1900] & 0xf;
  }

  function monthDays(y, m) {
    var info = LUNAR_INFO[y - 1900];
    return (info & (0x10000 >> m)) ? 30 : 29;
  }

  function yearDays(y) {
    var info = LUNAR_INFO[y - 1900];
    var sum = 348; // 12 * 29
    for (var i = 0x8000; i > 0x8; i >>= 1) {
      if (info & i) sum += 1;
    }
    // Add leap month
    var leap = leapMonth(y);
    if (leap) sum += ((info & 0x10000) ? 30 : 29);
    return sum;
  }

  // ── Public API ──────────────────────────────────────────────

  /**
   * Convert Gregorian date to Chinese lunar date
   * @param {Date} date
   * @returns {{ year:number, month:number, day:number, isLeap:boolean,
   *             monthName:string, dayName:string, yearName:string,
   *             shengXiao:string, tianGanDiZhi:string }}
   */
  function toLunar(date) {
    // Base: 1900-01-31 = Chinese New Year 1900 (Lunar 1900-01-01)
    var baseDate = new Date(1900, 0, 31);
    var offset = Math.floor((date - baseDate) / 86400000);
    if (offset < 0) return null;

    // Find lunar year
    var lunarYear;
    for (lunarYear = 1900; lunarYear <= 2100; lunarYear++) {
      var yDays = yearDays(lunarYear);
      if (offset < yDays) break;
      offset -= yDays;
    }
    if (lunarYear > 2100) return null;

    // Find lunar month
    var leap = leapMonth(lunarYear);
    var lunarMonth = 1, isLeap = false;
    for (; lunarMonth <= 12; lunarMonth++) {
      var mDays = monthDays(lunarYear, lunarMonth);
      if (offset < mDays) break;
      offset -= mDays;
      // Check leap month
      if (leap === lunarMonth) {
        mDays = (LUNAR_INFO[lunarYear - 1900] & 0x10000) ? 30 : 29;
        if (offset < mDays) { isLeap = true; break; }
        offset -= mDays;
      }
    }

    var lunarDay = offset + 1;
    var tgdIdx = (lunarYear - 4) % 60;
    if (tgdIdx < 0) tgdIdx += 60;
    var tianGanDiZhi = GAN[tgdIdx % 10] + ZHI[tgdIdx % 12];
    var shengXiao = SHENGXIAO[tgdIdx % 12];
    var monthName = (isLeap ? '闰' : '') + LUNAR_MONTHS[lunarMonth - 1] + '月';

    return {
      year: lunarYear, month: lunarMonth, day: lunarDay,
      isLeap: isLeap, monthName: monthName, dayName: LUNAR_DAYS[lunarDay],
      yearName: tianGanDiZhi + '年', tianGanDiZhi: tianGanDiZhi, shengXiao: shengXiao
    };
  }

  function getShengXiao(year) {
    var idx = (year - 4) % 12; if (idx < 0) idx += 12;
    return SHENGXIAO[idx];
  }

  function getTianGanDiZhi(year) {
    var idx = (year - 4) % 60; if (idx < 0) idx += 60;
    return GAN[idx % 10] + ZHI[idx % 12];
  }

  function getLunarMonthDay(date) {
    var lunar = toLunar(date);
    return lunar ? lunar.monthName + lunar.dayName : '';
  }

  function getLunarDayName(date) {
    var lunar = toLunar(date);
    return lunar ? LUNAR_DAYS[lunar.day] : '';
  }

  /** Check if date is Chinese New Year (正月初一) */
  function isLunarNewYear(date) {
    var lunar = toLunar(date);
    return lunar && lunar.month === 1 && lunar.day === 1 && !lunar.isLeap;
  }

  /** Check if date is the 15th of a lunar month (full moon) */
  function isFullMoon(date) {
    var lunar = toLunar(date);
    return lunar && lunar.day === 15;
  }

  /** Get lunar year info for display */
  function getYearInfo(date) {
    var lunar = toLunar(date);
    if (!lunar) return null;
    return {
      yearName: lunar.yearName,
      shengXiao: lunar.shengXiao,
      tianGanDiZhi: lunar.tianGanDiZhi
    };
  }

  return {
    toLunar: toLunar,
    getShengXiao: getShengXiao,
    getTianGanDiZhi: getTianGanDiZhi,
    getLunarMonthDay: getLunarMonthDay,
    getLunarDayName: getLunarDayName,
    isLunarNewYear: isLunarNewYear,
    isFullMoon: isFullMoon,
    getYearInfo: getYearInfo,
    SHENGXIAO: SHENGXIAO,
    GAN: GAN,
    ZHI: ZHI
  };
})();
