"use strict";

(function () {
  console.log('[module-holidays] 已加载');

  window.HOLIDAYS = [];
  window.HOLIDAY_DAYS = {};
  window._holidayCache = null;
  window._origHolidayPush = null;
  window.calendarExtraData = null;
  window.solarTermsCache = [];

  function loadHolidays() {
    return fetch('data/holidays.json')
      .then(function (r) {
        if (!r.ok) throw new Error('Failed to load holidays.json');
        return r.json();
      })
      .then(function (data) {
        window.HOLIDAYS = data.holidays || [];
        window.HOLIDAY_DAYS = data.holidayDays || {};
        if (typeof renderCalendar === 'function') renderCalendar();
      })
      .catch(function () { /*console.warn('[holidays] 数据加载失败');*/ });
  }
  window.loadHolidays = loadHolidays;
  loadHolidays();

  function _buildHolidayCache() {
    window._holidayCache = {};
    for (var hi = 0; hi < window.HOLIDAYS.length; hi++) {
      var h = window.HOLIDAYS[hi];
      if (!window._holidayCache[h.d]) window._holidayCache[h.d] = [];
      window._holidayCache[h.d].push(h);
    }
  }
  window._buildHolidayCache = _buildHolidayCache;

  function getHoliday(dateKey) {
    if (!window._holidayCache) _buildHolidayCache();
    return window._holidayCache[dateKey] || [];
  }
  window.getHoliday = getHoliday;

  function _rebuildHolidayCache() { window._holidayCache = null; }
  window._rebuildHolidayCache = _rebuildHolidayCache;

  function renderUpcomingHoliday() {
    var el = document.getElementById('holidayCountdown');
    if (!el) return;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var limit = new Date(today); limit.setDate(limit.getDate() + 60);
    var upcoming = null;
    for (var i = 0; i < window.HOLIDAYS.length; i++) {
      var d = new Date(window.HOLIDAYS[i].d + 'T00:00:00');
      if (d >= today && d <= limit) {
        if (!upcoming || d < new Date(upcoming.d + 'T00:00:00')) upcoming = window.HOLIDAYS[i];
      }
    }
    if (upcoming) {
      var days = Math.ceil((new Date(upcoming.d + 'T00:00:00') - today) / 86400000);
      var name = upcoming.name[lang] || upcoming.name[lang && lang.split('-')[0]] || upcoming.name['sr'] || upcoming.name['en'] || '';
      var daysText = days === 0 ? t('holidayToday') : t('holidayDaysAway') + ' ' + days + ' ' + t('day');
      el.style.display = ''; el.textContent = '\u{1F38C} ' + name + ' \u{00B7} ' + daysText;
    } else { el.style.display = 'none'; }
  }
  window.renderUpcomingHoliday = renderUpcomingHoliday;

  function renderMonthHolidaySummary() {
    var el = document.getElementById('holidaySummary');
    if (!el) return;
    var m = (typeof CalState.month !== 'undefined') ? CalState.month : new Date().getMonth();
    var y = (typeof CalState.year !== 'undefined') ? CalState.year : new Date().getFullYear();
    var mh = [];
    for (var i = 0; i < window.HOLIDAYS.length; i++) {
      var d = new Date(window.HOLIDAYS[i].d + 'T00:00:00');
      if (d.getMonth() === m && d.getFullYear() === y) mh.push(window.HOLIDAYS[i]);
    }
    if (mh.length === 0) { el.style.display = 'none'; return; }
    el.style.display = '';
    el.innerHTML = mh.sort(function (a, b) { return new Date(a.d) - new Date(b.d); })
      .map(function (h) {
        return '<span>' + (h.country === 'cn' ? '\u{1F1E8}\u{1F1F3}' : '\u{1F1F7}\u{1F1F8}') + ' ' + h.icon + ' ' + (h.name[lang] || h.name[lang.split('-')[0]] || h.name['sr']) + ' ' + h.d.split('-')[2].replace(/^0/, '') + '</span>';
      }).join('');
  }
  window.renderMonthHolidaySummary = renderMonthHolidaySummary;

  function toggleHolidayStory(uid, date, country) {
    var detail = document.getElementById('hd-' + uid), nameEl = document.getElementById('hn-' + uid);
    if (!detail || !nameEl) return;
    if (detail.classList.contains('open')) {
      detail.classList.remove('open');
      nameEl.textContent = nameEl.textContent.replace(' \u{25B4}', ' \u{25BE}');
      return;
    }
    loadCalendarData(function (data) {
      var story = null;
      (data.holidays || []).forEach(function (h) {
        if (h.date === date && h.country === (country === 'cn' ? 'china' : 'serbia')) story = h.story;
      });
      if (story) {
        var txt = story[lang] || story[lang.split('-')[0]] || story['sr'];
        if (txt) detail.textContent = txt;
      }
      detail.classList.add('open');
      nameEl.textContent = nameEl.textContent.replace(' \u{25BE}', ' \u{25B4}');
    });
  }
  window.toggleHolidayStory = toggleHolidayStory;

  function loadCalendarData(cb) {
    if (window.calendarExtraData) {
      if (window.calendarExtraData.solarTerms) window.solarTermsCache = window.calendarExtraData.solarTerms;
      cb(window.calendarExtraData); return;
    }
    var cached = localStorage.getItem('cycle-caldata');
    if (cached) {
      try {
        window.calendarExtraData = JSON.parse(cached);
        if (window.calendarExtraData.solarTerms) window.solarTermsCache = window.calendarExtraData.solarTerms;
        cb(window.calendarExtraData); return;
      } catch (e) {}
    }
    fetch('calendar-data.json').then(function (r) { return r.json(); })
      .then(function (d) {
        window.calendarExtraData = d;
        if (d && d.solarTerms) window.solarTermsCache = d.solarTerms;
        localStorage.setItem('cycle-caldata', JSON.stringify(d));
        cb(d);
      }).catch(function () { /*console.warn('[holidays] 数据加载失败');*/ });
  }
  window.loadCalendarData = loadCalendarData;

  function ensureSolarTermData() {
    if (window.solarTermsCache && window.solarTermsCache.length > 0) return;
    var cached = localStorage.getItem('cycle-solarterms');
    if (cached) {
      try { window.solarTermsCache = JSON.parse(cached); if (window.solarTermsCache.length > 0) return; } catch (e) {}
    }
    fetch('calendar-data.json').then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.solarTerms) { window.solarTermsCache = d.solarTerms; localStorage.setItem('cycle-solarterms', JSON.stringify(window.solarTermsCache)); } })
      .catch(function () { /*console.warn('[holidays] 数据加载失败');*/ });
  }
  window.ensureSolarTermData = ensureSolarTermData;

  function getSolarTerm(dateKey) {
    if (!window.solarTermsCache || !window.solarTermsCache.length) return;
    for (var i = 0; i < window.solarTermsCache.length; i++) {
      if (window.solarTermsCache[i].date === dateKey) return window.solarTermsCache[i];
    }
  }
  window.getSolarTerm = getSolarTerm;

  function renderSolarTermBadge() {
    var badge = document.getElementById('solarTermBadge');
    if (!badge) return;
    var tk = fmtDate(today());
    var term = getSolarTerm(tk);
    if (term) {
      var n = term.name[lang] || term.name[lang.split('-')[0]] || term.name['sr'] || term.name['zh-CN'] || '';
      badge.textContent = '\u{1F33F} ' + n; badge.style.display = '';
    } else {
      var nearest = null, md = 30, td = today(), ts = window.solarTermsCache || [];
      ts.forEach(function (s) { var d = daysDiff(td, new Date(s.date + 'T00:00:00')); if (d >= 0 && d < md) { md = d; nearest = s; } });
      if (nearest && md <= 7) {
        var nn = nearest.name[lang] || nearest.name[lang.split('-')[0]] || nearest.name['sr'] || nearest.name['zh-CN'] || '';
        badge.textContent = '\u{1F33F} ' + nn + ' ' + t('solarTermBadge') + ' ' + md + ' ' + t('day'); badge.style.display = '';
      } else { badge.style.display = 'none'; }
    }
  }
  window.renderSolarTermBadge = renderSolarTermBadge;
})();
