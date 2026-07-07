"use strict";

// === 魔法数字常量 ===
var TAP_DELAY_MS = 280;
var TOUCH_TIMEOUT_MS = 350;
var SAVE_DEBOUNCE_MS = 200;
var SYNC_DEBOUNCE_MS = 1500;
var SYNC_INTERVAL_MS = 120000;

window.CalState={year:2026,month:6,view:"month",weekOffset:0};
var APP_VERSION = (function () {
  var meta = document.querySelector('meta[name="version"]');
  return meta ? meta.content : '7.2.0';
})();

(function () {
  function _fmtDate(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }
  function _sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }
  function _addDays(date, n) {
    var r = new Date(date);
    r.setDate(r.getDate() + n);
    return r;
  }
  function _daysDiff(a, b) {
    return Math.round((b.getTime() - a.getTime()) / 86400000);
  }
  function _d0(date) {
    var r = new Date(date);
    r.setHours(0, 0, 0, 0);
    return r;
  }

  if (typeof togglePeriodRecord === 'function') {
    var _origToggle = togglePeriodRecord;
    window.togglePeriodRecord = function (startDate, endDate) {
      _origToggle(startDate, endDate);
    };
  }

  function _computeCyclePhase(date, periodEnd, nextPeriodStart) {
    var d = _d0(date);
    var pe = _d0(periodEnd);
    var ns = _d0(nextPeriodStart);
    var ovulation = _addDays(ns, -14);
    var fertileStart = _addDays(ovulation, -3);
    var fertileEnd = _addDays(ovulation, 2);
    if (d >= pe && d < fertileStart) return 'follicular';
    if (d >= fertileStart && d <= fertileEnd) {
      if (_sameDay(d, ovulation)) return 'ovulation';
      return 'fertile';
    }
    if (d > fertileEnd && d < ns) return 'luteal';
    return null;
  }

  function _fixedGetPhase(date, records, periodEnds, settings) {
    var d = _d0(date);
    var periodLen = (settings && settings.periodLength) || 7;
    var sorted = [];
    for (var si = 0; si < records.length; si++) {
      sorted.push(_d0(records[si]));
    }
    sorted.sort(function (a, b) { return a - b; });
    for (var i = 0; i < sorted.length; i++) {
      var start = _d0(sorted[i]);
      var endKey = _fmtDate(sorted[i]);
      var end;
      if (periodEnds && periodEnds[endKey]) {
        end = _d0(new Date(periodEnds[endKey] + 'T00:00:00'));
      } else {
        end = _addDays(start, periodLen - 1);
      }
      if (d >= start && d <= end) {
        return _sameDay(d, start) ? 'period-on' : 'period-mid';
      }
    }
    if (sorted.length === 0) return null;
    var cycles = [];
    for (var ci = 1; ci < sorted.length; ci++) {
      cycles.push(_daysDiff(sorted[ci - 1], sorted[ci]));
    }
    var recentCycles = cycles.slice(-3);
    var avgCycle = recentCycles.length > 0
      ? Math.round(recentCycles.reduce(function (a, b) { return a + b; }, 0) / recentCycles.length)
      : (settings && settings.cycleLength) || 28;
    var lastStart = sorted[sorted.length - 1];
    var lastEndKey = _fmtDate(lastStart);
    var lastEnd;
    if (periodEnds && periodEnds[lastEndKey]) {
      lastEnd = _d0(new Date(periodEnds[lastEndKey] + 'T00:00:00'));
    } else {
      lastEnd = _addDays(lastStart, periodLen - 1);
    }
    for (var j = 0; j < sorted.length - 1; j++) {
      var thisStart = sorted[j];
      var thisEndKey = _fmtDate(thisStart);
      var thisEnd;
      if (periodEnds && periodEnds[thisEndKey]) {
        thisEnd = _d0(new Date(periodEnds[thisEndKey] + 'T00:00:00'));
      } else {
        thisEnd = _addDays(thisStart, periodLen - 1);
      }
      var nextStart = sorted[j + 1];
      if (d > thisEnd && d < nextStart) {
        return _computeCyclePhase(d, thisEnd, nextStart);
      }
    }
    var predictedNextStart = _addDays(lastStart, avgCycle);
    var predictedNextEnd = _addDays(predictedNextStart, periodLen - 1);
    if (d >= predictedNextStart && d <= predictedNextEnd) {
      return _sameDay(d, predictedNextStart) ? 'period-pred-first' : 'period-pred';
    }
    if (d > lastEnd && d < predictedNextStart) {
      return _computeCyclePhase(d, lastEnd, predictedNextStart);
    }
    if (d > predictedNextEnd) {
      var next2Start = _addDays(predictedNextStart, avgCycle);
      var next2End = _addDays(next2Start, periodLen - 1);
      if (d >= next2Start && d <= next2End) {
        return _sameDay(d, next2Start) ? 'period-future-first' : 'period-future';
      }
      if (d < next2Start) {
        return _computeCyclePhase(d, predictedNextEnd, next2Start);
      }
      var next3Start = _addDays(next2Start, avgCycle);
      if (d < next3Start) {
        return _computeCyclePhase(d, next2End, next3Start);
      }
      return null;
    }
    return null;
  }

  var _origGetPhase = (typeof getPhase === 'function') ? getPhase : null;
  window.getPhase = function (date, pred) {
    try {
      var st = (typeof state !== 'undefined') ? state : null;
      if (st && st.records) {
        var result = _fixedGetPhase(date, st.records, st.periodEnds || {}, st.settings || {});
        if (result !== null) return result;
      }
    } catch (e) {}
    if (_origGetPhase) return _origGetPhase(date, pred);
    return null;
  };

  var _styleEl = document.createElement('style');
  _styleEl.textContent =
    'html { overflow-x: hidden !important; }' +
    'body { margin-right: 0 !important; overflow-x: hidden !important; width: 100vw !important; max-width: 100vw !important; }' +
    '.days { grid-template-columns: repeat(7, 1fr) !important; }' +
    '.week-num { display: none !important; }' +
    'nav.tabs-nav .tabs { display: flex !important; justify-content: space-around !important; width: 100% !important; gap: 0 !important; }' +
    'nav.tabs-nav .tabs .tab.active { color: var(--love) !important; }' +
    '.progress-fill { transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) !important; }' +
    '.day.in-month { animation: fixDayIn 0.35s ease-out both; }' +
    '@keyframes fixDayIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }' +
    '@keyframes modalSlideIn { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }' +
    '#modal:not(.hidden) .modal { animation: modalSlideIn 0.22s ease-out; }';
  document.head.appendChild(_styleEl);
  window.animateModalOut = null;

  // === 导航栏滑动指示器 ===
  (function () {
    var _tabs = document.querySelector('.tabs');
    var _indicator = document.getElementById('tabSlideIndicator');
    if (_tabs && !_indicator) {
      _indicator = document.createElement('div');
      _indicator.id = 'tabSlideIndicator';
      _indicator.style.cssText = 'position:absolute;bottom:0;left:0;height:3px;background:var(--love);border-radius:3px 3px 0 0;transition:transform .3s cubic-bezier(.22,1,.36,1),width .3s cubic-bezier(.22,1,.36,1);pointer-events:none;z-index:2';
      _tabs.style.position = 'relative';
      _tabs.appendChild(_indicator);
    }
    function _updateTabIndicator() {
      var _a = document.querySelector('.tab.active');
      var _t = document.querySelector('.tabs');
      var _i = document.getElementById('tabSlideIndicator');
      if (!_a || !_t || !_i) return;
      var _tr = _t.getBoundingClientRect();
      var _ar = _a.getBoundingClientRect();
      _i.style.transform = 'translateX(' + (_ar.left - _tr.left) + 'px)';
      _i.style.width = _ar.width + 'px';
    }
    _updateTabIndicator();
    var _tabMo = new MutationObserver(function () { _updateTabIndicator(); });
    document.querySelectorAll('.tab').forEach(function (t) { _tabMo.observe(t, { attributes: true, attributeFilter: ['class'] }); });
    var _tmRetry = 0;
    var _tmTimer = setInterval(function () {
      _tmRetry++;
      var _newTabs = document.querySelectorAll('.tab');
      if (_newTabs.length === 0) { clearInterval(_tmTimer); return; }
      _newTabs.forEach(function (t) { _tabMo.observe(t, { attributes: true, attributeFilter: ['class'] }); });
      if (_tmRetry > 30) clearInterval(_tmTimer);
    }, 200);
  })();

  // === 弹窗加速：防重入 + 先显示后填充 ===
  (function () {
    // 守卫 animateModalIn 防止重复播放
    window._amiBusy = false;
    var _origAMI = typeof animateModalIn === 'function' ? animateModalIn : null;
    if (_origAMI) {
      window.animateModalIn = function (el) {
        if (window._amiBusy) return;
        window._amiBusy = true;
        if (typeof HAS_GSAP !== 'undefined' && HAS_GSAP && typeof gsap !== 'undefined') {
          var m = el || document.getElementById('modal');
          if (m) {
            var c = m.querySelector('.modal');
            if (c) {
              try {
                gsap.killTweensOf(c);
                gsap.fromTo(c, { scale: .88, autoAlpha: 0, y: 15 }, { scale: 1, autoAlpha: 1, y: 0, duration: .2, ease: 'back.out(1.3)', clearProps: 'all' });
              } catch (e) {}
            }
          }
        }
        setTimeout(function () { window._amiBusy = false; }, 350);
      };
    }

    // 优化 openModal：先显示弹窗，再填充数据
    var _origOM2 = typeof openModal === 'function' ? openModal : null;
    if (_origOM2) {
      window.openModal = function (date, pred) {
        try {
          var _m = document.getElementById('modal');
          if (_m && _m.classList.contains('hidden')) {
            _m.classList.remove('hidden');
            if (typeof animateModalIn === 'function') animateModalIn();
          }
        } catch (e) {}
        _origOM2(date, pred);
      };
    }
  })();

  (function () {
    var _all = document.querySelectorAll('nav.tabs-nav');
    if (_all.length > 1) {
      for (var _ni = 1; _ni < _all.length; _ni++) _all[_ni].parentNode.removeChild(_all[_ni]);
    }
  })();

  function _fixNavigation() {
    var _cal = document.querySelector('.calendar') || document.querySelector('.days');
    var _nav = document.querySelector('nav.tabs-nav');
    if (!_cal || !_nav) return;
    var _all2 = document.querySelectorAll('nav.tabs-nav');
    if (_all2.length > 1) {
      for (var _ni2 = 1; _ni2 < _all2.length; _ni2++) _all2[_ni2].parentNode.removeChild(_all2[_ni2]);
    }
    var _rect = _cal.getBoundingClientRect();
    _nav.style.position = 'fixed';
    _nav.style.bottom = '0';
    _nav.style.left = _rect.left + 'px';
    _nav.style.width = _rect.width + 'px';
    _nav.style.maxWidth = 'none';
    _nav.style.margin = '0';
    _nav.style.transform = 'none';
  }
  _fixNavigation();

  var _diaryCache = null;
  var _diaryCacheTime = 0;

  function _patchRenderCalendar() {
    if (typeof renderCalendar !== 'function') return false;
    var _origRC = renderCalendar;
    window.renderCalendar = function () {
      var now = Date.now();
      if (!_diaryCache || (now - _diaryCacheTime) > 30000) {
        try {
          _diaryCache = JSON.parse(localStorage.getItem('shared-diary') || '{}');
          _diaryCacheTime = now;
        } catch (e) { _diaryCache = {}; }
      }
      if (!window.HOLIDAYS || !window.HOLIDAYS.length) {
        if (typeof loadHolidays === 'function') {
          var _args = arguments;
          var _self = this;
          loadHolidays().then(function () {
            _origRC.apply(_self, _args);
          }).catch(function () {
            window.HOLIDAYS = [];
            _origRC.apply(_self, _args);
          });
          return;
        }
      }
      _origRC.apply(this, arguments);
      var _cells = document.querySelectorAll('.day[aria-label]');
      _cells.forEach(function (c) {
        var _l = c.getAttribute('aria-label');
        if (!_l) return;
        c.classList.add('in-month');
      });
    };
    return true;
  }
  if (!_patchRenderCalendar()) {
    var _rcRetry = 0;
    var _rcTimer = setInterval(function () {
      _rcRetry++;
      if (_patchRenderCalendar() || _rcRetry > 50) clearInterval(_rcTimer);
    }, 100);
  }

  (function () {
    var _origPull = (typeof pullAllSharedData === 'function') ? pullAllSharedData : null;
    if (!_origPull) return;
    window.pullAllSharedData = function () {
      var p = _origPull.apply(this, arguments);
      if (p && typeof p.then === 'function') {
        return p.then(function (r) { _diaryCache = null; return r; });
      }
      _diaryCache = null;
      return p;
    };
  })();

  var _modal = document.getElementById('modal');
  if (_modal) {
    _modal.removeAttribute('onclick');
  }

  (function () {
    var EXT_KEYS = {
      sr: { modalMarkersTitle: '\u{1F4CC} Oznake', modalAddMarker: 'Dodaj oznaku', modalEndPeriod: 'Ozna\u{017E}i kraj ciklusa', modalPeriodOngoing: 'Ciklus u toku', modalEndNow: 'Zavr\u{0161}i ciklus' },
      'zh-CN': { modalMarkersTitle: '\u{1F4CC} \u{65E5}\u{5386}\u{6807}\u{8BB0}', modalAddMarker: '\u{6DFB}\u{52A0}\u{6807}\u{8BB0}', modalEndPeriod: '\u{6807}\u{8BB0}\u{7ECF}\u{671F}\u{7ED3}\u{675F}', modalPeriodOngoing: '\u{7ECF}\u{671F}\u{8FDB}\u{884C}\u{4E2D}', modalEndNow: '\u{7ED3}\u{675F}\u{5F53}\u{524D}\u{7ECF}\u{671F}' },
      en: { modalMarkersTitle: '\u{1F4CC} Markers', modalAddMarker: 'Add Marker', modalEndPeriod: 'Mark Period End', modalPeriodOngoing: 'Period Ongoing', modalEndNow: 'End Current Period' },
    };
    if (typeof I18N_EXT !== 'undefined') {
      for (var _lang in EXT_KEYS) {
        if (!I18N_EXT[_lang]) I18N_EXT[_lang] = {};
        for (var _key in EXT_KEYS[_lang]) {
          I18N_EXT[_lang][_key] = EXT_KEYS[_lang][_key];
        }
      }
    }
  })();

  (function () {
    var _methods = ['push', 'pop', 'splice', 'sort', 'shift', 'unshift'];
    function _patchRecordsArray() {
      if (typeof state === 'undefined' || !state.records) return;
      if (state.records._h2Patched) return;
      for (var _mi = 0; _mi < _methods.length; _mi++) {
        (function (methodName) {
          var orig = state.records[methodName];
          state.records[methodName] = function () {
            var result = orig.apply(this, arguments);
            setTimeout(function () {}, 0);
            return result;
          };
        })(_methods[_mi]);
      }
      state.records._h2Patched = true;
    }
    _patchRecordsArray();
    var _origSaveState = typeof saveState === 'function' ? saveState : null;
    if (_origSaveState) {
      window.saveState = function () {
        _origSaveState();
        if (!state.records || !state.records._h2Patched) {
          _patchRecordsArray();
        }
      };
    }
  })();

  var _origOpenModal = (typeof openModal === 'function') ? openModal : window.openModal;
  if (!_origOpenModal) {
    var _retryTimer = setInterval(function () {
      if (typeof openModal === 'function') {
        _origOpenModal = openModal;
        clearInterval(_retryTimer);
      }
    }, 100);
    setTimeout(function () { clearInterval(_retryTimer); }, 5000);
  }
  window.openModal = function (date, pred) {
    try {
      if (_origOpenModal) { _origOpenModal(date, pred); }
      else {
        if (typeof openModal === 'function') {
          openModal(date, pred);
          _origOpenModal = openModal;
        }
      }
    } catch (e) {}
  };

  (function () {
    var _origPickerOpen = window.openEmojiPickerForModal;
    window.openEmojiPickerForModal = function () {
      if (typeof _origPickerOpen === 'function') _origPickerOpen();
      setTimeout(function () {
        var _epTitle = document.getElementById('ep-title');
        if (!_epTitle) return;
        var _l = (typeof window.lang !== 'undefined') ? window.lang : 'sr';
        var _txt = _l === 'zh-CN' ? '\u{6DFB}\u{52A0}\u{6807}\u{8BB0}' : _l === 'en' ? 'Add Marker' : 'Dodaj oznaku';
        var _newTitle = '\u{1F4CC} ' + _txt;
        if (_epTitle.textContent !== _newTitle) { _epTitle.textContent = _newTitle; }
      }, 50);
    };
  })();

  (function () {
    var fixRunOnce = false;
    var _mo = new MutationObserver(function () {
      var _modalEl = document.getElementById('modal');
      var _pickerEl = document.getElementById('emojiPickerOverlay');
      if (_modalEl && _modalEl.classList.contains('hidden') && _pickerEl && !_pickerEl.classList.contains('hidden')) {
        _pickerEl.classList.add('hidden');
      }
      _fixNavigation();
      if (!_modalEl || _modalEl.classList.contains('hidden')) {
        fixRunOnce = false;
        return;
      }
      if (fixRunOnce) return;
      fixRunOnce = true;

      var _markersTitle = document.getElementById('modalMarkersTitle');
      var _addBtn = document.getElementById('modalAddMarkerBtn');
      if (_markersTitle) _markersTitle.style.display = 'none';
      if (_addBtn) {
        _addBtn.style.display = 'inline-flex';
        _addBtn.style.alignItems = 'center';
        _addBtn.style.gap = '4px';
        _addBtn.style.padding = '4px 10px';
        _addBtn.style.margin = '6px 0 0';
        _addBtn.style.fontSize = '.65rem';
        _addBtn.style.border = 'none';
        _addBtn.style.background = 'var(--rose-light)';
        _addBtn.style.color = 'var(--rose-dark)';
        _addBtn.style.borderRadius = '20px';
        _addBtn.style.cursor = 'pointer';
        var _mk = (typeof t === 'function') ? t('modalAddMarker') : '';
        if (_mk === 'modalAddMarker' || !_mk) {
          var _ml = (typeof window.lang !== 'undefined') ? window.lang : 'sr';
          _mk = _ml === 'zh-CN' ? '\u{6DFB}\u{52A0}\u{6807}\u{8BB0}' : _ml === 'en' ? 'Add Marker' : 'Dodaj oznaku';
        }
        _addBtn.innerHTML = '\u{2795} ' + _mk;
        _addBtn.removeAttribute('onclick');
        _addBtn.addEventListener('click', function () { if (typeof openEmojiPickerForModal === 'function') openEmojiPickerForModal(); });
      }
      var _oldMarkBtn = document.getElementById('modal-mark-btn');
      var _oldUnmarkBtn = document.getElementById('modal-unmark-btn');
      if (_oldMarkBtn) _oldMarkBtn.style.display = 'none';
      if (_oldUnmarkBtn) _oldUnmarkBtn.style.display = 'none';

      var _selDate = (typeof selectedDate !== 'undefined') ? selectedDate : null;
      function _isInClosedPeriod(d) {
        if (!state || !state.records || !state.periodEnds) return false;
        for (var _ri = 0; _ri < state.records.length; _ri++) {
          var _s = _d0(state.records[_ri]);
          var _ek = _fmtDate(state.records[_ri]);
          var _e = state.periodEnds[_ek] ? _d0(new Date(state.periodEnds[_ek] + 'T00:00:00')) : null;
          if (_e && d >= _s && d <= _e) return true;
        }
        return false;
      }
      function _getPeriodBtnText() {
        if (!_selDate) return null;
        var _d = _d0(_selDate);
        if (typeof state !== 'undefined' && state.records) {
          for (var _ri2 = 0; _ri2 < state.records.length; _ri2++) {
            if (_sameDay(state.records[_ri2], _d)) return '\u{274C} \u{79FB}\u{9664}\u{8BB0}\u{5F55}';
          }
        }
        var _os = (typeof getOpenPeriodStart === 'function') ? getOpenPeriodStart() : null;
        if (_os && _d0(_os) <= _d) return '\u{23F9}\u{FE0F} \u{7ED3}\u{675F}\u{672C}\u{6B21}\u{7ECF}\u{671F}';
        if (_isInClosedPeriod(_d)) return null;
        return '\u{1F534} \u{6807}\u{8BB0}\u{7ECF}\u{671F}\u{5F00}\u{59CB}';
      }
      var _phaseRow = document.querySelector('.modal .info-row');
      var _newBtn = document.getElementById('fix-period-btn');
      var _btnText = _getPeriodBtnText();
      if (_btnText === null && _newBtn) { _newBtn.style.display = 'none'; }
      else if (_btnText !== null) {
        if (!_newBtn) {
          _newBtn = document.createElement('button');
          _newBtn.id = 'fix-period-btn';
          _newBtn.style.display = 'block';
          _newBtn.style.width = '100%';
          _newBtn.style.padding = '12px 16px';
          _newBtn.style.margin = '10px 0 6px';
          _newBtn.style.border = 'none';
          _newBtn.style.borderRadius = '12px';
          _newBtn.style.fontSize = '.88rem';
          _newBtn.style.fontWeight = '700';
          _newBtn.style.cursor = 'pointer';
          _newBtn.style.color = '#fff';
          _newBtn.style.transition = 'opacity .2s';
          _newBtn.onmouseover = function () { this.style.opacity = '0.85'; };
          _newBtn.onmouseout = function () { this.style.opacity = '1'; };
          _newBtn.onclick = function () {
            fixRunOnce = false;
            if (typeof togglePeriodRecord === 'function') togglePeriodRecord();
          };
          if (_phaseRow && _phaseRow.parentNode) {
            _phaseRow.parentNode.insertBefore(_newBtn, _phaseRow.nextSibling);
          } else {
            var _closeBtn = document.getElementById('modal-close-btn');
            if (_closeBtn && _closeBtn.parentNode) {
              _closeBtn.parentNode.insertBefore(_newBtn, _closeBtn);
            }
          }
        } else { _newBtn.style.display = 'block'; }
        _newBtn.textContent = _btnText;
        if (_btnText.indexOf('\u{23F9}') >= 0) { _newBtn.style.background = '#E65100'; }
        else if (_btnText.indexOf('\u{274C}') >= 0) { _newBtn.style.background = 'var(--rose)'; }
        else { _newBtn.style.background = 'var(--love)'; }
      }
    });
    _mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
  })();

  window.animateDashboardCards = null;
  window.animateStatsPanel = null;

  (function () {
    var _H4_KEY = 'gh-token';
    var _H4_PREFIX = 'tk_';
    function _encode(t) { return _H4_PREFIX + btoa(t).split('').reverse().join(''); }
    function _decode(t) {
      if (!t || t.indexOf(_H4_PREFIX) !== 0) return t;
      try { return atob(t.slice(_H4_PREFIX.length).split('').reverse().join('')); } catch (e) { return ''; }
    }
    var _origGet = typeof getGitHubToken === 'function' ? getGitHubToken : null;
    window.getGitHubToken = function () {
      var raw = sessionStorage.getItem(_H4_KEY);
      if (raw && raw.indexOf(_H4_PREFIX) === 0) return _decode(raw);
      return raw || '';
    };
    var _origSave = typeof saveGitHubToken === 'function' ? saveGitHubToken : null;
    window.saveGitHubToken = function () {
      var t = document.getElementById('set-gh-token').value.trim();
      if (!t) { sessionStorage.removeItem(_H4_KEY); _origSave(); return; }
      sessionStorage.setItem(_H4_KEY, _encode(t));
      _origSave();
    };
    var _origClear = typeof clearGitHubToken === 'function' ? clearGitHubToken : null;
    window.clearGitHubToken = function () {
      sessionStorage.removeItem(_H4_KEY);
      if (_origClear) _origClear();
    };
    try {
      var _url = new URL(window.location.href);
      if (_url.searchParams.has('token') || _url.searchParams.has('gh-token')) {
        _url.searchParams.delete('token');
        _url.searchParams.delete('gh-token');
        window.history.replaceState({}, '', _url.toString());
      }
    } catch (e) {}
  })();

  (function () {
    var _origRD = typeof renderDashboard === 'function' ? renderDashboard : null;
    if (!_origRD) return;
    window.renderDashboard = function () {
      _origRD.apply(this, arguments);
      var _ql = document.querySelector('.dash-links');
      if (!_ql) return;
      if (document.getElementById('fix-quick-mark')) return;
      var _hasOpen = typeof getOpenPeriodStart === 'function' ? !!getOpenPeriodStart() : false;
      var _btn = document.createElement('button');
      _btn.id = 'fix-quick-mark';
      _btn.className = 'dash-link-btn';
      _btn.textContent = _hasOpen ? '\u{23F9}\u{FE0F} \u{7ECF}\u{671F}\u{8D70}\u{4E86}' : '\u{1F9F8} \u{7ECF}\u{671F}\u{6765}\u{4E86}';
      _btn.onclick = function () { if (typeof togglePeriodRecord === 'function') togglePeriodRecord(); };
      _ql.appendChild(_btn);
    };
  })();

  (function () {
    var _origSP = typeof renderStatsPanel === 'function' ? renderStatsPanel : null;
    if (!_origSP) return;
    window.renderStatsPanel = function () {
      _origSP.apply(this, arguments);
      var _subs = document.querySelectorAll('.stats-mini-card .mini-sub');
      _subs.forEach(function (el) {
        var txt = el.textContent || '';
        if (txt.indexOf('\u{03C3}=') >= 0) {
          var val = parseFloat(txt.replace('\u{03C3}=', ''));
          var label = val <= 3 ? '\u{89C4}\u{5F8B}' : val <= 6 ? '\u{8F83}\u{89C4}\u{5F8B}' : '\u{4E0D}\u{89C4}\u{5F8B}';
          el.textContent = label;
        }
      });
    };
  })();

  (function () {
    var _origOM = typeof openModal === 'function' ? openModal : null;
    if (!_origOM) return;
    window.openModal = function (date, pred) {
      _origOM(date, pred);
      setTimeout(function () {
        if (document.getElementById('fix-modal-diary-btn')) return;
        var _cb = document.getElementById('modal-close-btn');
        if (!_cb || !_cb.parentNode) return;
        var _btn = document.createElement('button');
        _btn.id = 'fix-modal-diary-btn';
        _btn.className = 'btn btn-ghost mt-6';
        _btn.style.cssText = 'margin-bottom:0;margin-top:6px;width:100%';
        _btn.textContent = '\u{1F4DD} \u{67E5}\u{770B}\u{5F53}\u{6708}\u{65E5}\u{8BB0}';
        _btn.onclick = function () {
          if (typeof closeModal === 'function') closeModal();
          if (typeof switchToTab === 'function') switchToTab('diary');
        };
        _cb.parentNode.insertBefore(_btn, _cb);
      }, 100);
    };
  })();

  (function () {
    var _origRD2 = typeof renderDashboard === 'function' ? renderDashboard : null;
    if (!_origRD2) return;
    var _origRender = window.renderDashboard;
    window.renderDashboard = function () {
      _origRender.apply(this, arguments);
      setTimeout(function () {
        var _cards = document.querySelectorAll('.dash-card');
        _cards.forEach(function (c) {});
      }, 50);
    };
  })();

  (function () {
    var _origSS = typeof saveSettings === 'function' ? saveSettings : null;
    if (!_origSS) return;
    window.saveSettings = function () {
      _origSS.apply(this, arguments);
      var _btn = document.getElementById('save-settings-btn');
      if (!_btn) return;
      _btn.style.transition = 'background 0.3s';
      _btn.style.background = 'var(--sage)';
      setTimeout(function () { _btn.style.background = ''; }, 1000);
    };
  })();

  (function () {
    var _o = typeof renderStatsPanel === 'function' ? renderStatsPanel : null;
    if (!_o) return;
    var _orig = window.renderStatsPanel;
    window.renderStatsPanel = function () {
      _orig.apply(this, arguments);
      if (!state || state.records.length < 2) {
        var _el = document.getElementById('chartCycleEmpty');
        if (_el) _el.textContent = '\u{6807}\u{8BB0} 2 \u{6B21}\u{7ECF}\u{671F}\u{540E}\u{663E}\u{793A}\u{8D8B}\u{52BF}\u{56FE}';
      }
    };
  })();

  (function () {
    var _o = typeof openModal === 'function' ? openModal : null;
    if (!_o) return;
    var _orig = window.openModal;
    window.openModal = function (d, p) {
      _orig(d, p);
      setTimeout(function () {
        ['holiday-row', 'solar-row'].forEach(function (id) {
          var _row = document.getElementById('modal-' + id);
          if (!_row || _row._fixPatched) return;
          _row._fixPatched = true;
          _row.style.cursor = 'pointer';
          _row.onclick = function (e) {
            if (e.target.tagName === 'SPAN' || e.target.tagName === 'A') return;
            var _toggle = _row.querySelector('.knowledge-toggle, .holiday-name, [onclick*="toggle"]');
            if (_toggle && _toggle.onclick) _toggle.onclick();
          };
        });
      }, 100);
    };
  })();

  (function () {
    function _fixPeriodEnds() {
      if (typeof state === 'undefined' || !state.periodEnds || !state.records) return;
      var _records = state.records.slice().sort(function (a, b) { return a - b; });
      var _changed = false;
      for (var i = 0; i < _records.length; i++) {
        var _startKey = _fmtDate(_records[i]);
        var _endVal = state.periodEnds[_startKey];
        if (!_endVal) continue;
        if (i < _records.length - 1) {
          var _nextStart = _records[i + 1];
          var _maxEnd = new Date(_nextStart);
          _maxEnd.setDate(_maxEnd.getDate() - 1);
          var _maxEndKey = _fmtDate(_maxEnd);
          if (_endVal > _maxEndKey) { state.periodEnds[_startKey] = _maxEndKey; _changed = true; }
        }
        var _endDate = new Date(_endVal + 'T00:00:00');
        var _startDate = new Date(_startKey + 'T00:00:00');
        var _len = Math.round((_endDate - _startDate) / 86400000) + 1;
        if (_len > 14) {
          var _newEnd = new Date(_startDate);
          _newEnd.setDate(_newEnd.getDate() + 13);
          state.periodEnds[_startKey] = _fmtDate(_newEnd);
          _changed = true;
        }
      }
      if (_changed) {
        if (typeof saveState === 'function') saveState();
        if (typeof renderCalendar === 'function') renderCalendar();
      }
    }
    _fixPeriodEnds();
    var _origTPR = typeof togglePeriodRecord === 'function' ? togglePeriodRecord : null;
    if (_origTPR) {
      window.togglePeriodRecord = function (s, e) {
        _origTPR(s, e);
        _fixPeriodEnds();
      };
    }
  })();

  (function () {
    var _ta = document.getElementById('diaryTextarea');
    var _cc = document.getElementById('diaryCharCount');
    if (_ta && _cc) {
      _ta.addEventListener('input', function () { _cc.textContent = _ta.value.length + '/500'; });
    }
  })();

  (function () {
    var _tips = ['\u{1F33F} \u{4ECA}\u{5929}\u{4E5F}\u{8981}\u{5F00}\u{5FC3}\u{54E6}', '\u{2728} \u{4F60}\u{5F88}\u{68D2}', '\u{1F31F} \u{5FAE}\u{7B11}\u{5410}\u{8F6F}', '\u{1F4AA} \u{52A0}\u{6CB9}\u{FF01}', '\u{1F33C} \u{4F11}\u{606F}\u{4E00}\u{4E0B}\u{5427}', '\u{2615} \u{559D}\u{676F}\u{8336}'];
    var _o = typeof renderCalendar === 'function' ? renderCalendar : null;
    if (!_o) return;
    var _orig = window.renderCalendar;
    window.renderCalendar = function () {
      _orig.apply(this, arguments);
      setTimeout(function () {
        var _cells = document.querySelectorAll('.day[aria-label]');
        _cells.forEach(function (c) {
          if (c._fixTip) return;
          if (!c.classList.contains('other-month') && c.classList.length <= 3 && !c.querySelector('.holiday-icon')) {
            if (Math.random() < 0.08) {
              var _tip = document.createElement('span');
              _tip.style.cssText = 'position:absolute;bottom:1px;left:50%;transform:translateX(-50%);font-size:.38rem;opacity:.4;pointer-events:none;white-space:nowrap';
              _tip.textContent = _tips[Math.floor(Math.random() * _tips.length)];
              c.appendChild(_tip);
              c._fixTip = true;
            }
          }
        });
      }, 200);
    };
  })();

  (function () {
    var _origRender = typeof CalendarRenderer !== 'undefined' ? CalendarRenderer.render : null;
    if (!_origRender) return;
    CalendarRenderer.render = function (grid, cells, opts) {
      var _shadow = document.createElement('div');
      _shadow.style.display = 'none';
      document.body.appendChild(_shadow);
      _origRender(_shadow, cells, opts);
      ['role', 'aria-label'].forEach(function (a) {
        var v = _shadow.getAttribute(a);
        if (v) grid.setAttribute(a, v);
      });
      grid.className = _shadow.className;
      grid.replaceChildren.apply(grid, _shadow.childNodes);
      document.body.removeChild(_shadow);
    };
  })();

  // === 双人心情记录系统 (Dual-User Mood System) ===
  (function () {
    function _migrateMoods() {
      if (typeof state === 'undefined' || !state.moods) return;
      var changed = false;
      var dates = Object.keys(state.moods);
      for (var i = 0; i < dates.length; i++) {
        var entry = state.moods[dates[i]];
        if (entry && entry.mood && typeof entry.mood === 'string' && !entry.andjela && !entry.barry) {
          state.moods[dates[i]] = { andjela: { mood: entry.mood, time: entry.time || Date.now() } };
          changed = true;
        }
      }
      if (changed && typeof saveState === 'function') saveState();
    }
    _migrateMoods();

    function _getDayEntry(dateStr) {
      if (typeof state === 'undefined' || !state.moods || !state.moods[dateStr]) return {};
      var entry = state.moods[dateStr];
      if (entry && entry.mood && typeof entry.mood === 'string' && !entry.andjela && !entry.barry) {
        state.moods[dateStr] = { andjela: { mood: entry.mood, time: entry.time || Date.now() } };
        if (typeof saveState === 'function') saveState();
        return state.moods[dateStr];
      }
      return entry || {};
    }

    function _getUserMood(dateStr, user) {
      if (!user) user = (typeof activeProfile !== 'undefined') ? activeProfile : 'andjela';
      var entry = _getDayEntry(dateStr);
      return (entry[user] && entry[user].mood) ? entry[user].mood : null;
    }

    function _setUserMood(dateStr, moodKey, user) {
      if (typeof state === 'undefined' || !state.moods) return;
      if (!user) user = (typeof activeProfile !== 'undefined') ? activeProfile : 'andjela';
      if (!state.moods[dateStr]) state.moods[dateStr] = {};
      _getDayEntry(dateStr);

      if (state.moods[dateStr][user] && state.moods[dateStr][user].mood === moodKey) {
        delete state.moods[dateStr][user];
        if (Object.keys(state.moods[dateStr]).length === 0) delete state.moods[dateStr];
        if (typeof saveState === 'function') saveState();
        if (typeof renderMoodSection === 'function') renderMoodSection();
        if (typeof renderGarden === 'function') renderGarden();
        return;
      }

      state.moods[dateStr][user] = { mood: moodKey, time: Date.now() };
      if (typeof saveState === 'function') saveState();
      if (typeof renderMoodSection === 'function') renderMoodSection();
      if (typeof renderGarden === 'function') renderGarden();

      var lang = window.lang || 'sr';
      var names = lang === 'zh-CN' ? ['开心', '被爱', '烦躁', '疲惫', '难过', '兴奋', '焦虑', '还行']
        : lang === 'en' ? ['Happy', 'Loved', 'Frustrated', 'Tired', 'Sad', 'Excited', 'Anxious', 'Meh']
        : ['Srećna', 'Voljena', 'Frustrirana', 'Umorna', 'Tužna', 'Uzbuđena', 'Anksiozna', 'Meh'];
      var moodIdx = (typeof MOOD_KEYS !== 'undefined') ? MOOD_KEYS.indexOf(moodKey) : -1;
      var moodName = (moodIdx >= 0 && names[moodIdx]) ? names[moodIdx] : moodKey;
      if (typeof toast === 'function') toast((user === 'barry' ? 'Barry' : 'Anđela') + ': ' + moodName + ' ✓');
    }

    var _origGetMood = (typeof getMood === 'function') ? getMood : null;
    window.getMood = function (dateStr, user) {
      if (!user) user = (typeof activeProfile !== 'undefined') ? activeProfile : 'andjela';
      return _getUserMood(dateStr, user);
    };

    window.setMood = function (dateStr, moodKey, user) {
      if (!user) user = (typeof activeProfile !== 'undefined') ? activeProfile : 'andjela';
      _setUserMood(dateStr, moodKey, user);
    };

    var _origRenderMood = (typeof renderMoodSection === 'function') ? renderMoodSection : null;
    window.renderMoodSection = function () {
      var today = (typeof fmtDate === 'function') ? fmtDate(new Date()) : new Date().toISOString().slice(0, 10);

      var titleEl = document.getElementById('mood-title');
      if (titleEl) {
        var _l = window.lang || 'sr';
        titleEl.textContent = _l === 'zh-CN' ? '😊 今日心情' : _l === 'en' ? '😊 Today\'s Mood' : '😊 Raspoloženje';
      }

      var labelEl = document.getElementById('mood-today-label');
      if (labelEl) labelEl.textContent = (typeof t === 'function') ? t('moodToday') : '';

      var picker = document.getElementById('moodPicker');
      if (!picker) return;

      var _l = window.lang || 'sr';
      var dayEntry = _getDayEntry(today);
      var moodKeys = (typeof MOOD_KEYS !== 'undefined') ? MOOD_KEYS
        : ['happy','loved','frustrated','tired','sad','excited','anxious','meh'];
      var moodEmojis = (typeof MOOD_EMOJIS !== 'undefined') ? MOOD_EMOJIS
        : ['😊','🥰','😤','😴','😢','🤩','😰','😐'];

      var moodNames;
      if (typeof t === 'function') {
        var _mn = t('moodNames');
        moodNames = Array.isArray(_mn) && _mn.length === moodKeys.length ? _mn : null;
      }
      if (!moodNames) {
        moodNames = _l === 'zh-CN' ? ['开心','被爱','烦躁','疲惫','难过','兴奋','焦虑','还行']
          : _l === 'en' ? ['Happy','Loved','Frustrated','Tired','Sad','Excited','Anxious','Meh']
          : ['Srećna','Voljena','Frustrirana','Umorna','Tužna','Uzbuđena','Anksiozna','Meh'];
      }

      var users = ['barry','andjela'];
      var html = '';
      for (var ui = 0; ui < users.length; ui++) {
        var user = users[ui];
        var userMood = (dayEntry[user] && dayEntry[user].mood) ? dayEntry[user].mood : null;

        html += '<div class="mood-dual-row" style="display:flex;align-items:center;gap:5px;margin-bottom:5px;padding:3px 0">';
        html += '<span class="mood-user-badge" style="font-size:.62rem;font-weight:700;min-width:64px;white-space:nowrap;color:var(--text-muted);text-align:right;flex-shrink:0">'
          + (user === 'barry' ? '👦 Barry' : '👧 Anđela') + '</span>';

        for (var mi = 0; mi < moodEmojis.length; mi++) {
          var isPicked = userMood === moodKeys[mi];
          html += '<span class="mood-emoji' + (isPicked ? ' picked' : '') + '"'
            + ' data-user="' + user + '" data-mood="' + moodKeys[mi] + '"'
            + ' title="' + (moodNames[mi] || moodKeys[mi]) + '"'
            + ' style="font-size:1.15rem;cursor:pointer;padding:3px;border-radius:50%;line-height:1.2;'
            + (isPicked ? 'background:var(--rose-light);box-shadow:0 0 0 2px var(--love);' : '')
            + '">' + moodEmojis[mi] + '</span>';
        }
        html += '</div>';
      }

      picker.innerHTML = html;

      var emojiEls = picker.querySelectorAll('.mood-emoji');
      for (var ei = 0; ei < emojiEls.length; ei++) {
        (function (el) {
          el.onclick = function () {
            _setUserMood(today, this.getAttribute('data-mood'), this.getAttribute('data-user'));
          };
        })(emojiEls[ei]);
      }

      var streakEl = document.getElementById('streakDisplay');
      if (streakEl) streakEl.style.display = 'none';

      var histLabel = document.getElementById('mood-history-label');
      if (histLabel) histLabel.textContent = (typeof t === 'function') ? t('moodHistoryLabel') : '';

      _renderDualHistory();
    };

    function _renderDualHistory() {
      var histEl = document.getElementById('moodHistory');
      if (!histEl) return;

      var html = '<div class="dual-mood-track" style="display:flex;gap:4px;justify-content:center;padding:6px 0 2px">';

      for (var di = 6; di >= 0; di--) {
        var d = new Date();
        d.setDate(d.getDate() - di);
        var dateKey = (typeof fmtDate === 'function') ? fmtDate(d) : d.toISOString().slice(0, 10);
        var entry = _getDayEntry(dateKey);
        var bMood = (entry.barry && entry.barry.mood) ? true : false;
        var aMood = (entry.andjela && entry.andjela.mood) ? true : false;

        html += '<div class="mood-day-col" style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1;min-width:16px;max-width:30px">';
        html += '<span style="font-size:.42rem;color:var(--text-muted);opacity:.5;line-height:1">' + d.getDate() + '/' + (d.getMonth()+1) + '</span>';
        html += '<div style="width:14px;height:14px;border-radius:50%;background:' + (bMood ? 'var(--love)' : 'var(--border)') + ';opacity:' + (bMood ? '1' : '.2') + ';transform:' + (bMood ? 'scale(1.1)' : 'scale(.85)') + ';transition:all .3s ease;box-shadow:0 0 0 1px var(--border)"></div>';
        html += '<div style="width:14px;height:14px;border-radius:50%;background:' + (aMood ? 'var(--accent)' : 'var(--border)') + ';opacity:' + (aMood ? '1' : '.2') + ';transform:' + (aMood ? 'scale(1.1)' : 'scale(.85)') + ';transition:all .3s ease;box-shadow:0 0 0 1px var(--border)"></div>';
        html += '</div>';
      }

      html += '</div>';
      html += '<div style="display:flex;justify-content:center;gap:12px;font-size:.48rem;color:var(--text-muted);margin-top:1px;padding-bottom:3px">'
        + '<span><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--love);margin-right:3px;vertical-align:middle"></span>Barry</span>'
        + '<span><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--accent);margin-right:3px;vertical-align:middle"></span>Anđela</span></div>';

      histEl.innerHTML = html;
    }

    if (typeof calculateStreak === 'function') {
      var _origCS = calculateStreak;
      window.calculateStreak = function (user) {
        if (!user) user = (typeof activeProfile !== 'undefined') ? activeProfile : 'andjela';
        if (typeof state === 'undefined' || !state.moods) return 0;
        var streak = 0;
        var d = new Date();
        while (true) {
          var key = (typeof fmtDate === 'function') ? fmtDate(d) : d.toISOString().slice(0, 10);
          var entry = _getDayEntry(key);
          if (!entry[user] || !entry[user].mood) break;
          streak++;
          d.setDate(d.getDate() - 1);
        }
        return streak;
      };
    }
  })();

  // === 双人共享 Todo List ===
  (function () {
    var TODO_REPO = 'darkheaven1419-debug/cycle-tracker';
    var TODO_FILE = 'shared-todolist.json';

    if (typeof state !== 'undefined') {
      try { state.todoList = JSON.parse(localStorage.getItem('shared-todolist') || '[]'); if (!Array.isArray(state.todoList)) state.todoList = []; }
      catch (e) { state.todoList = []; }
    }

    function _tl(key) {
      var l = window.lang || 'sr';
      var m = {
        title:        {'zh-CN':'📋 我们的清单','en':'📋 Our Todo List','sr':'📋 Naša lista'},
        ph:           {'zh-CN':'想一起做什么？','en':'What do we want to do together?','sr':'Šta želimo da radimo zajedno?'},
        add:          {'zh-CN':'添加','en':'Add','sr':'Dodaj'},
        all:          {'zh-CN':'全部','en':'All','sr':'Sve'},
        active:       {'zh-CN':'⏳ 未完成','en':'⏳ Active','sr':'⏳ Aktivno'},
        done:         {'zh-CN':'✅ 已完成','en':'✅ Done','sr':'✅ Završeno'},
        empty:        {'zh-CN':'还没有事项 ✨','en':'No items yet ✨','sr':'Još nema stavki ✨'},
        noMatch:      {'zh-CN':'没有匹配的事项','en':'No matching items','sr':'Nema odgovarajućih'},
        doneBy:       {'zh-CN':'已完成','en':'Done by','sr':'Završio/la'},
      };
      return (m[key] && m[key][l]) || m[key]['zh-CN'] || '';
    }

    function _uid(u) { return u === 'barry' ? '👦 Barry' : '👧 Anđela'; }
    function _esc(s) { var d = document.createElement('div'); d.appendChild(document.createTextNode(s||'')); return d.innerHTML; }
    function _gid() { return Date.now().toString(36) + Math.random().toString(36).substr(2,4); }
    function _td(d) { if (!d) d = new Date(); return typeof d==='string' ? d.slice(0,10) : d.getFullYear()+'-'+(d.getMonth()+1).toString().padStart(2,'0')+'-'+d.getDate().toString().padStart(2,'0'); }

    function _save() {
      localStorage.setItem('shared-todolist', JSON.stringify(state.todoList||[]));
      if (typeof saveState === 'function') saveState();
    }

    function _addTodo(text) {
      if (!text||!text.trim()) return;
      if (!state.todoList) state.todoList=[];
      state.todoList.push({ id:_gid(), text:text.trim(), author:(typeof activeProfile!=='undefined'?activeProfile:'andjela'), createdAt:_td(new Date()), completed:false, completedBy:null, completedAt:null });
      _save(); _render(); _pushTodo();
    }

    function _toggleTodo(id) {
      for (var i=0;i<state.todoList.length;i++) {
        if (state.todoList[i].id===id) {
          var t=state.todoList[i];
          if (t.completed) { t.completed=false; t.completedBy=null; t.completedAt=null; }
          else { t.completed=true; t.completedBy=(typeof activeProfile!=='undefined'?activeProfile:'andjela'); t.completedAt=_td(new Date()); }
          _save(); _render(); _pushTodo();
          return;
        }
      }
    }

    function _deleteTodo(id) { state.todoList=(state.todoList||[]).filter(function(t){return t.id!==id;}); _save(); _render(); _pushTodo(); }

    function _pushTodo() {
      var token = typeof getGitHubToken === 'function' ? getGitHubToken() : '';
      if (!token) return;
      var content = btoa(unescape(encodeURIComponent(JSON.stringify(state.todoList||[],null,2))));
      fetch('https://api.github.com/repos/'+TODO_REPO+'/contents/'+TODO_FILE, { headers:{'Authorization':'token '+token} })
        .then(function(r){return r.ok?r.json():{sha:null};})
        .then(function(d){return fetch('https://api.github.com/repos/'+TODO_REPO+'/contents/'+TODO_FILE,{method:'PUT',headers:{'Authorization':'token '+token,'Content-Type':'application/json'},body:JSON.stringify({message:'🔄 Sync todo list',content:content,sha:d.sha||null})});})
        .catch(function(){});
    }

    function _pullTodo() {
      var token = typeof getGitHubToken === 'function' ? getGitHubToken() : '';
      if (!token) return;
      fetch('https://api.github.com/repos/'+TODO_REPO+'/contents/'+TODO_FILE, { headers:{'Authorization':'token '+token} })
        .then(function(r){return r.ok?r.json():null;})
        .then(function(d){
          if (!d) return;
          var content = JSON.parse(decodeURIComponent(escape(atob(d.content))));
          if (!Array.isArray(content)) return;
          var idMap={}; (state.todoList||[]).forEach(function(t){idMap[t.id]=t;});
          content.forEach(function(t){if(!idMap[t.id])idMap[t.id]=t;});
          state.todoList=Object.keys(idMap).map(function(k){return idMap[k];});
          localStorage.setItem('shared-todolist',JSON.stringify(state.todoList));
          _render();
        })
        .catch(function(){});
    }

    (function(){var _ts=document.createElement('style');_ts.textContent='@keyframes todoItemIn{from{opacity:0;transform:translateY(10px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}.todo-item{animation:todoItemIn .35s cubic-bezier(.22,1,.36,1) both}.todo-check{cursor:pointer;font-size:1rem;flex-shrink:0;margin-top:2px;width:22px;text-align:center;transition:transform .2s cubic-bezier(.22,1,.36,1)}.todo-check:hover{transform:scale(1.2)}.todo-check:active{transform:scale(.9)}.todo-del{cursor:pointer;font-size:.65rem;opacity:.35;flex-shrink:0;padding:2px 4px;transition:opacity .2s,transform .2s}.todo-del:hover{opacity:.8;transform:scale(1.15)}.todo-del:active{transform:scale(.9)}';document.head.appendChild(_ts);})();

    (function(){var _ms=document.createElement('style');_ms.textContent='@keyframes moodPop{0%{transform:scale(1) rotate(0deg)}40%{transform:scale(1.4) rotate(-10deg)}70%{transform:scale(1.25) rotate(5deg)}100%{transform:scale(1.3) rotate(0deg)}}.mood-emoji{transition:transform .25s cubic-bezier(.22,1,.36,1),opacity .2s,background .2s,box-shadow .2s}.mood-emoji:not(.picked){opacity:.78}.mood-emoji:not(.picked):hover{transform:scale(1.18)!important;opacity:1!important}.mood-emoji:not(.picked):active{transform:scale(.9)!important}.mood-emoji.picked{animation:moodPop .4s cubic-bezier(.22,1,.36,1) both;background:var(--rose-light);box-shadow:0 0 0 2px var(--love)}';document.head.appendChild(_ms);})();
    (function(){var _dc=document.createElement('style');_dc.textContent='@keyframes dashCardIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}#todoListCard{animation:dashCardIn .45s cubic-bezier(.22,1,.36,1) both}';document.head.appendChild(_dc);})();
    (function(){var _ep=document.createElement('style');_ep.textContent='@keyframes emptyPulse{0%,100%{opacity:.65}50%{opacity:1}}.chart-empty{animation:emptyPulse 2.8s ease-in-out infinite}';document.head.appendChild(_ep);})();
    (function(){var _dc2=document.createElement('style');_dc2.textContent='#panel-diary .mt-10>.flex.gap-6.mt-8{display:none!important}';document.head.appendChild(_dc2);})();
    (function(){var _ch=document.createElement('style');_ch.textContent='.day{transition:transform .22s cubic-bezier(.22,1,.36,1),box-shadow .25s ease,border-color .22s ease,background .22s ease!important}.day:hover:not(.other-month):not(.period-on):not(.ovulation):not(.fertile){transform:scale(1.1)!important;box-shadow:0 6px 20px rgba(196,90,107,.13)!important;border-color:rgba(196,90,107,.18)!important}';document.head.appendChild(_ch);})();
    window._todoFilter = window._todoFilter || 'active';

    function _render() {
      var container = document.getElementById('todoListContainer');
      if (!container) return;

      var filter = window._todoFilter || 'active';
      var items = state.todoList || [];
      var sorted = items.slice().sort(function(a,b){return (b.createdAt||'').localeCompare(a.createdAt||'');});
      var filtered = sorted;
      if (filter==='active') filtered=sorted.filter(function(t){return !t.completed;});
      else if (filter==='done') filtered=sorted.filter(function(t){return t.completed;});

      if (!filtered.length) {
        container.innerHTML = '<div style="text-align:center;padding:16px;font-size:.72rem;color:var(--text-muted);animation:emptyPulse 2.8s ease-in-out infinite">'+(items.length?_tl('noMatch'):_tl('empty'))+'</div>';
        return;
      }

      var html = '';
      for (var i=0;i<filtered.length;i++) {
        var t=filtered[i];
        var _delay=i*0.05;
        html += '<div class="todo-item" style="display:flex;align-items:flex-start;gap:6px;padding:8px 4px;border-bottom:1px solid var(--border);animation-delay:'+_delay+'s">';
        html += '<span style="cursor:pointer;font-size:1rem;flex-shrink:0;margin-top:2px;width:22px;text-align:center" class="todo-check" onclick="window._toggleTodo(\''+t.id+'\')">'+(t.completed?'✅':'☐')+'</span>';
        html += '<div style="flex:1;min-width:0">';
        html += '<div class="todo-text" style="font-size:.78rem;line-height:1.3;'+(t.completed?'text-decoration:line-through;color:var(--text-muted)':'color:var(--text)')+'">'+_esc(t.text)+'</div>';
        html += '<div style="font-size:.48rem;color:var(--text-muted);margin-top:2px;display:flex;gap:4px;flex-wrap:wrap;align-items:center">';
        html += '<span>'+_uid(t.author)+'</span><span>·</span><span>'+(t.createdAt||'')+'</span>';
        if (t.completed&&t.completedBy) html += '<span>·</span><span style="color:var(--sage)">'+_tl('doneBy')+' '+_uid(t.completedBy)+' '+(t.completedAt||'')+'</span>';
        html += '</div></div>';
        html += '<span style="cursor:pointer;font-size:.65rem;opacity:.35;flex-shrink:0;padding:2px 4px" class="todo-del" onclick="window._deleteTodo(\''+t.id+'\')">✕</span>';
        html += '</div>';
      }
      container.innerHTML = html;
    }

    function _setFilter(f) {
      window._todoFilter=f;
      var btns=document.querySelectorAll('#todoFilterBar button');
      for (var i=0;i<btns.length;i++){btns[i].style.background=btns[i].dataset.filter===f?'var(--love)':'var(--card)';btns[i].style.fontWeight=btns[i].dataset.filter===f?'700':'400';}
      _render();
    }

    function _createCard() {
      if (document.getElementById('todoListCard')) return;
      var dash=document.getElementById('panel-dashboard');
      if (!dash) return;
      var f=window._todoFilter||'active';
      var card=document.createElement('div'); card.id='todoListCard'; card.className='card'; card.style.marginTop='10px';
      card.innerHTML = '<h3>'+_tl('title')+'</h3>'
        +'<div style="display:flex;gap:6px;margin-bottom:10px">'
        +'<input id="todoInput" type="text" placeholder="'+_tl('ph')+'" style="flex:1;padding:8px 10px;border-radius:10px;border:1px solid var(--border);font-size:.78rem;font-family:var(--font);background:var(--card);color:var(--text)">'
        +'<button onclick="window._addTodo()" style="padding:8px 14px;border-radius:10px;border:none;background:var(--love);color:#fff;font-size:.72rem;font-weight:600;cursor:pointer;white-space:nowrap">'+_tl('add')+'</button></div>'
        +'<div id="todoFilterBar" style="display:flex;gap:6px;margin-bottom:8px">'
        +'<button data-filter="all" onclick="window._setTodoFilter(\'all\')" style="padding:3px 10px;border-radius:12px;border:1px solid var(--border);background:'+(f==='all'?'var(--love)':'var(--card)')+';color:var(--text);font-size:.6rem;cursor:pointer;font-weight:'+(f==='all'?'700':'400')+'">'+_tl('all')+'</button>'
        +'<button data-filter="active" onclick="window._setTodoFilter(\'active\')" style="padding:3px 10px;border-radius:12px;border:1px solid var(--border);background:'+(f==='active'?'var(--love)':'var(--card)')+';color:var(--text);font-size:.6rem;cursor:pointer;font-weight:'+(f==='active'?'700':'400')+'">'+_tl('active')+'</button>'
        +'<button data-filter="done" onclick="window._setTodoFilter(\'done\')" style="padding:3px 10px;border-radius:12px;border:1px solid var(--border);background:'+(f==='done'?'var(--love)':'var(--card)')+';color:var(--text);font-size:.6rem;cursor:pointer;font-weight:'+(f==='done'?'700':'400')+'">'+_tl('done')+'</button></div>'
        +'<div id="todoListContainer"></div>';
      var qc=dash.querySelector('.dash-card.dash-quote');
      if (qc&&qc.parentNode) qc.parentNode.insertBefore(card,qc.nextSibling); else dash.appendChild(card);
      var inp=document.getElementById('todoInput');
      if (inp) inp.addEventListener('keydown',function(e){if(e.key==='Enter'&&typeof _addTodo==='function')_addTodo(inp.value);});
      _render();
    }

    if (typeof renderDashboard==='function') {
      var _origTd=renderDashboard;
      window.renderDashboard=function(){_origTd.apply(this,arguments);setTimeout(_createCard,50);};
    }

    if (typeof getGitHubToken==='function') {
      _pullTodo();
      setInterval(function(){if(getGitHubToken())_pullTodo();},120000);
    }

    window._addTodo=function(){var inp=document.getElementById('todoInput');_addTodo(inp?inp.value:'');};
    window._toggleTodo=_toggleTodo;
    window._deleteTodo=_deleteTodo;
    window._setTodoFilter=_setFilter;

    setTimeout(function(){if(!document.getElementById('todoListCard'))_createCard();},1000);
  })();

/* ════════════════════════════════════════════════════════════ */
/* ★ 日记模块修复：语言切换 + 新功能（v7.2.1）                  */
/* ════════════════════════════════════════════════════════════ */
(function(){
console.log('[日记] 修复模块启动');
console.log('[日记] 情书卡片布局已添加');

// ── 周期数据恢复：从 shared-cycle-data 合并到 state ──
(function(){
  if (typeof state === 'undefined') return;
  try {
    var sd = JSON.parse(localStorage.getItem('shared-cycle-data') || 'null');
    var profileKey = 'cycle-data-v6-' + (typeof activeProfile !== 'undefined' ? activeProfile : 'andjela');
    var pkData = JSON.parse(localStorage.getItem(profileKey) || 'null');

    // 统计各来源的记录数
    var stateCount = state.records ? state.records.length : 0;
    var sdCount = sd && sd.records ? sd.records.length : 0;
    var pkCount = pkData && pkData.records ? pkData.records.length : 0;

    // 找到记录最多的来源
    var best = null;
    var bestCount = stateCount;
    if (sdCount > bestCount) { best = sd; bestCount = sdCount; }
    if (pkCount > bestCount) { best = pkData; bestCount = pkCount; }

    if (best && best.records && bestCount > stateCount) {
      state.records = best.records.map(function(r){return new Date(r);});
      state.periodEnds = best.periodEnds || {};
      state.symptoms = best.symptoms || {};
      state.settings = best.settings || state.settings || {};
      // 同步回 profile-specific key
      try {
        var toSave = JSON.parse(JSON.stringify(state));
        toSave.records = toSave.records.map(function(r){return typeof r==='string'?r:r.getFullYear()+'-'+String(r.getMonth()+1).padStart(2,'0')+'-'+String(r.getDate()).padStart(2,'0');});
        localStorage.setItem(profileKey, JSON.stringify(toSave));
      } catch(e) {}
      if (typeof saveState === 'function') saveState();
      if (typeof renderCalendar === 'function') renderCalendar();
      console.log('[数据恢复] 从 ' + (sdCount > stateCount ? 'shared-cycle-data' : 'profileKey') + ' 恢复了 ' + (bestCount - stateCount) + ' 条记录');
    } else {
      console.log('[数据恢复] state 已有 ' + stateCount + ' 条记录，无需恢复 (shared=' + sdCount + ', profile=' + pkCount + ')');
    }
  } catch(e) {
    console.warn('[数据恢复] 失败:', e.message);
  }
})();

// ── 注入 CSS（症状按钮隐藏 + 情书卡片 + 日期导航） ──
(function(){var _s=document.createElement('style');_s.textContent=
'body:not(.is-barry) #tab-symptoms{display:none!important}'+
'.diary-date-btn{transition:all .2s cubic-bezier(.22,1,.36,1)!important}'+
'.diary-date-btn:hover{transform:translateY(-2px)!important;box-shadow:0 3px 10px rgba(196,90,107,.15)!important}'+
'.diary-date-btn.current{box-shadow:0 2px 8px rgba(196,90,107,.2)!important}'+
'.letter-paper-card{background:#fdf5e6!important;border:1px solid #e8d5b7!important;border-radius:12px!important;padding:18px 20px!important;box-shadow:0 2px 12px rgba(0,0,0,.06)!important;position:relative!important;margin-bottom:14px!important}'+
'.letter-paper-card::before{content:"";position:absolute;inset:0;border-radius:12px;pointer-events:none;background:repeating-linear-gradient(0deg,transparent,transparent 27px,#e8d5b7 27px,#e8d5b7 28px)!important;opacity:.35!important}'+
'[data-theme="dark"] .letter-paper-card{background:#2d2318!important;border-color:#4a3825!important}'+
'[data-theme="dark"] .letter-paper-card::before{background:repeating-linear-gradient(0deg,transparent,transparent 27px,#4a3825 27px,#4a3825 28px)!important;opacity:.2!important}'+
'.letter-paper-card .lpc-header{display:flex!important;justify-content:space-between!important;align-items:center!important;margin-bottom:10px!important;position:relative!important;z-index:1!important}'+
'.letter-paper-card .lpc-date{font-size:.72rem!important;color:#8a7a6a!important;font-weight:600!important}'+
'[data-theme="dark"] .letter-paper-card .lpc-date{color:#a09080!important}'+
'.letter-paper-card .lpc-body{font-size:.85rem!important;line-height:28px!important;color:#3d3225!important;min-height:84px!important;white-space:pre-wrap!important;word-wrap:break-word!important;position:relative!important;z-index:1!important;padding:0 2px!important}'+
'[data-theme="dark"] .letter-paper-card .lpc-body{color:#d0c0b0!important}'+
'.letter-paper-card .lpc-footer{display:flex!important;justify-content:space-between!important;align-items:flex-end!important;margin-top:12px!important;padding-top:8px!important;border-top:1px dashed #d4bfa0!important;position:relative!important;z-index:1!important}'+
'[data-theme="dark"] .letter-paper-card .lpc-footer{border-color:#4a3825!important}'+
'.letter-paper-card .lpc-sig{font-size:.7rem!important;color:#8a7a6a!important;font-style:italic!important;text-align:right!important}'+
'.lpc-textarea{width:100%!important;padding:12px!important;border:1px solid #d4bfa0!important;border-radius:10px!important;font-size:.82rem!important;font-family:var(--font)!important;background:#fff8f0!important;color:#3d3225!important;line-height:28px!important;resize:vertical!important;box-sizing:border-box!important;min-height:90px!important;position:relative!important;z-index:1!important}'+
'[data-theme="dark"] .lpc-textarea{background:#1a1410!important;color:#d0c0b0!important;border-color:#4a3825!important}'+
'@media(max-width:600px){.lpc-row{flex-direction:column!important}}'+
'.lpc-row{display:flex!important;gap:14px!important;margin-bottom:14px!important}'+
'.lpc-row>*{flex:1!important;min-width:0!important}';
document.head.appendChild(_s);})();

// ── 症状按钮：三重保障 ──
(function(){
function _fixSymTab(){
  var isB = typeof activeProfile !== 'undefined' && activeProfile === 'barry';
  document.body.classList.toggle('is-barry', isB);
  var st = document.getElementById('tab-symptoms');
  if (st) st.style.display = isB ? '' : 'none';
}
// 1. 劫持 switchProfile
var _sp = window.switchProfile;
if (typeof _sp === 'function') {
  window.switchProfile = function(p) {
    _sp(p);
    setTimeout(_fixSymTab, 10);
  };
}
// 2. 劫持 updateProfileUI（初始化时也会调用）
var _up = window.updateProfileUI;
if (typeof _up === 'function') {
  window.updateProfileUI = function() {
    _up.apply(this, arguments);
    _fixSymTab();
  };
}
// 3. MutationObserver 监控 tab-symptoms 的 DOM 变化
var _symMo = new MutationObserver(function(){_fixSymTab();});
_symMo.observe(document.body, { childList: true, subtree: true });
// 4. 初始执行 + 延迟重试
_fixSymTab();
setTimeout(_fixSymTab, 500);
setTimeout(_fixSymTab, 1500);
console.log('[安全] 症状按钮三重保障已激活');
})();

// ── 进度条修复 ──
(function(){
// 覆写 animateProgressBar：使用 width 而非 transform
window.animateProgressBar = function(el, pct) {
  if (!el) return;
  pct = Math.min(100, Math.max(0, pct));
  el.style.width = pct + '%';
  el.style.transition = 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
  if (pct > 0 && pct < 2) el.style.minWidth = '2px';
  else el.style.minWidth = '';
};

function _fixProgressBar() {
  var fillEl = document.getElementById('pg-fill');
  var numEl = document.getElementById('pg-num');
  var subEl = document.getElementById('pg-sub');
  var badgeEl = document.getElementById('pg-badge');
  if (!fillEl) return;
  if (typeof state === 'undefined' || typeof predict !== 'function') return;

  try {
    var pred = predict();
    var td = typeof today === 'function' ? today() : new Date();
    var hasRecords = state.records && state.records.length > 0;

    if (!hasRecords) {
      fillEl.style.width = '0%';
      fillEl.style.background = 'var(--border, #ddd)';
      if (numEl) numEl.textContent = '--';
      if (subEl) subEl.textContent = '';
      if (badgeEl) { badgeEl.textContent = ''; badgeEl.className = 'phase-badge'; }
      console.log('[进度条] 无数据，宽度=0%');
      return;
    }

    var phase = typeof getPhase === 'function' ? getPhase(td, pred) : null;
    var pct = 0, color = 'var(--border, #ddd)', label = '';

    if (phase === 'period-on' || phase === 'period-mid') {
      var cur = state.records.find(function(r) {
        var s = typeof d0 === 'function' ? d0(r) : r;
        var e = typeof getPeriodEndDate === 'function' ? (getPeriodEndDate(r) || typeof addDays === 'function' ? addDays(s, (pred.periodLen || 7) - 1) : new Date(s.getTime() + 6*86400000)) : new Date(s.getTime() + 6*86400000);
        return td >= s && td <= e;
      });
      if (cur) {
        var dayNum = typeof daysDiff === 'function' ? daysDiff(typeof d0 === 'function' ? d0(cur) : cur, td) + 1 : 1;
        var actualLen = pred.periodLen || 7;
        pct = (dayNum / actualLen) * 15;
        if (pct > 15) pct = 15;
        color = 'var(--love, #c45a6b)';
        label = typeof t === 'function' ? t('phaseBadges').period : '';
      }
    } else if (pred.isOverdue) {
      pct = 100;
      color = '#E65100';
      label = typeof t === 'function' ? t('phaseBadges').late : '';
    } else {
      var totalLen = pred.nextStart && pred.lastStart ? Math.round((pred.nextStart - pred.lastStart) / 86400000) : (pred.cycleLen || 28);
      var elapsed = pred.lastStart ? Math.round((td - pred.lastStart) / 86400000) : 0;
      pct = Math.min(100, Math.max(0, (elapsed / totalLen) * 100));
      if (phase === 'luteal' || phase === 'fertile') { color = 'var(--lavender, #b8a0c8)'; label = ''; }
      else if (phase === 'follicular') { color = 'var(--sage, #5e8b7a)'; label = ''; }
      else if (phase === 'ovulation') { color = 'var(--teal, #80a590)'; label = ''; }
      else { color = 'var(--love, #c45a6b)'; }
    }

    fillEl.style.width = pct + '%';
    fillEl.style.background = color;
    fillEl.style.transition = 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
    if (badgeEl) badgeEl.style.background = color;

    console.log('[进度条] 宽度=' + Math.round(pct) + '% 颜色=' + color + ' 阶段=' + (phase || 'none'));
  } catch(e) {
    console.warn('[进度条] 计算失败:', e.message);
  }
}

// 触发时机
// 1. 劫持 renderCalendar
var _rc = window.renderCalendar;
if (typeof _rc === 'function') {
  window.renderCalendar = function() {
    _rc.apply(this, arguments);
    setTimeout(_fixProgressBar, 200);
  };
}
// 2. 劫持 applyAllUI（语言切换）
var _aa = window.applyAllUI;
if (typeof _aa === 'function') {
  window.applyAllUI = function(w) {
    _aa(w);
    setTimeout(_fixProgressBar, 200);
  };
}
// 3. 劫持 togglePeriodRecord（标记经期）
var _tp = window.togglePeriodRecord;
if (typeof _tp === 'function') {
  window.togglePeriodRecord = function(s, e) {
    _tp(s, e);
    setTimeout(_fixProgressBar, 300);
  };
}
// 4. 初始执行
setTimeout(_fixProgressBar, 500);
setTimeout(_fixProgressBar, 1500);
setTimeout(_fixProgressBar, 3000);

console.log('[进度条] 修复已加载');
})();

// ── 统计面板：图表渲染修复 ──
(function(){
var _origRC = window._renderCharts;
if (typeof _origRC === 'function') {
  window._renderCharts = function(pred, td, clen) {
    // 先调用原始函数
    _origRC(pred, td, clen);

    // 修复周期趋势图：pred.cycles.length >= 2 条件过严，改为 >= 1
    try {
      var tc = document.getElementById('chartCycleTrend');
      var te = document.getElementById('chartCycleEmpty');
      if (!tc) return;

      // 如果原始函数隐藏了图表但实际有数据
      var hasData = state && state.records && state.records.length >= 2;
      var chartHidden = te && te.style.display !== 'none';

      if (hasData && chartHidden && typeof ChartRenderer !== 'undefined') {
        // 计算周期长度
        var sorted = state.records.slice().sort(function(a,b){return new Date(a) - new Date(b);});
        var diffs = [];
        for (var i = 1; i < sorted.length; i++) {
          diffs.push(Math.round((new Date(sorted[i]) - new Date(sorted[i-1])) / 86400000));
        }
        if (diffs.length > 0) {
          var lbs = [];
          var L = window.lang || 'sr';
          for (var j = 0; j < diffs.length; j++) {
            lbs.push(L === 'zh-CN' ? '周期' + (j+1) : 'C' + (j+1));
          }
          var avg = diffs.length > 1 ? Math.round(diffs.reduce(function(s,v){return s+v;},0) / diffs.length) : diffs[0];
          // 隐藏空提示，显示图表
          if (te) { te.style.display = 'none'; }
          if (tc.parentElement) tc.parentElement.style.display = '';
          // 绘制图表
          ChartRenderer.drawLineChart(tc, diffs, lbs, {
            width: 500, height: 200, avgLine: avg,
            avgLabel: L === 'zh-CN' ? '均值' : L === 'en' ? 'Avg' : 'Prosek',
            emptyText: ''
          });
          // 添加说明文字
          var note = document.getElementById('chartCycleNote');
          if (!note) {
            note = document.createElement('div');
            note.id = 'chartCycleNote';
            note.style.cssText = 'text-align:center;font-size:.7rem;color:var(--text-muted);margin-top:6px';
            tc.closest('.chart-card').appendChild(note);
          }
          if (diffs.length === 1) {
            note.textContent = L === 'zh-CN' ? '当前仅有 2 次记录，趋势将随更多记录逐渐清晰'
              : L === 'en' ? 'Only 2 records, trend will become clearer'
              : 'Samo 2 zapisa, trend će postati jasniji';
          } else { note.textContent = ''; }
          console.log('[统计] 图表修复：已显示 ' + diffs.length + ' 个数据点');
        }
      }
    } catch(e) {
      console.warn('[统计] 图表修复异常:', e.message);
    }
  };
  console.log('[统计] 图表渲染修复已加载');
} else {
  console.log('[统计] _renderCharts 未定义，稍后重试');
  var _chartRetry = 0;
  var _chartTimer = setInterval(function() {
    _chartRetry++;
    if (typeof window._renderCharts === 'function') {
      clearInterval(_chartTimer);
      var _oc2 = window._renderCharts;
      window._renderCharts = function(pred, td, clen) {
        _oc2(pred, td, clen);
        // ...same fix as above...
        try {
          var tc2 = document.getElementById('chartCycleTrend');
          var te2 = document.getElementById('chartCycleEmpty');
          if (!tc2) return;
          var hasData2 = state && state.records && state.records.length >= 2;
          var chartHidden2 = te2 && te2.style.display !== 'none';
          if (hasData2 && chartHidden2 && typeof ChartRenderer !== 'undefined') {
            var sorted2 = state.records.slice().sort(function(a,b){return new Date(a)-new Date(b);});
            var diffs2 = [];
            for (var i2 = 1; i2 < sorted2.length; i2++) {
              diffs2.push(Math.round((new Date(sorted2[i2])-new Date(sorted2[i2-1]))/86400000));
            }
            if (diffs2.length > 0) {
              var lbs2 = [], L2 = window.lang||'sr';
              for (var j2 = 0; j2 < diffs2.length; j2++) lbs2.push(L2==='zh-CN'?'周期'+(j2+1):'C'+(j2+1));
              var avg2 = diffs2.length>1 ? Math.round(diffs2.reduce(function(s,v){return s+v;},0)/diffs2.length) : diffs2[0];
              if (te2) te2.style.display = 'none';
              if (tc2.parentElement) tc2.parentElement.style.display = '';
              ChartRenderer.drawLineChart(tc2, diffs2, lbs2, {width:500,height:200,avgLine:avg2,avgLabel:L2==='zh-CN'?'均值':L2==='en'?'Avg':'Prosek',emptyText:''});
              console.log('[统计] 图表修复(延迟): ' + diffs2.length + ' 数据点');
            }
          }
        } catch(e) { console.warn('[统计] 图表修复异常:', e.message); }
      };
      console.log('[统计] 图表渲染修复已加载(延迟)');
    }
    if (_chartRetry > 100) clearInterval(_chartTimer);
  }, 100);
}
})();

// ── 三语硬编码映射表 ──
var DD = {
  'zh-CN': {
    partnerTitle: '\u{1F338} Anđela 的信',
    barryTitle: '\u{1F466} Barry 的信',
    save: '保存',
    saved: '\u{2705} \u{5DF2}\u{4FDD}\u{5B58}',
    allEntries: '\u{1F4DC} \u{5168}\u{90E8}\u{65E5}\u{8BB0}',
    mailbox: '\u{1F4EE} \u{4FE1}\u{7BB1}',
    export: '\u{1F4E4} \u{5206}\u{4EAB}',
    import: '\u{1F4E5} \u{5BFC}\u{5165}',
    edit: '\u{270F}\u{FE0F} \u{7F16}\u{8F91}',
    diaryPlaceholder: '\u{5199}\u{5427}\u{FF0C}\u{4EB2}\u{7231}\u{7684}... \u{270D}\u{FE0F}',
    lockText: '\u{1F512} \u{5199}\u{5B8C}\u{81EA}\u{5DF1}\u{7684}\u{65E5}\u{8BB0}\u{624D}\u{80FD}\u{67E5}\u{770B}\u{4ED6}/\u{5979}\u{7684}\u{54E6} \u{1F48C}',
    navPrev: '\u{25C2} \u{4E0A}\u{4E00}\u{5468}',
    navNext: '\u{4E0B}\u{4E00}\u{5468} \u{25B8}',
    calTitle: '\u{65E5}\u{5386}',
    writeDatePrefix: '\u{1F48C} ',
    translateBtn: '\u{1F310} \u{7FFB}\u{8BD1}',
    chineseLearn: '\u{1F4DA} \u{5B66}\u{4E2D}\u{6587}',
  },
  sr: {
    partnerTitle: '\u{1F338} An\u{0111}elino pismo',
    barryTitle: '\u{1F466} Barryjevo pismo',
    save: 'Sa\u{010D}uvaj',
    saved: '\u{2705} Sa\u{010D}uvano',
    allEntries: '\u{1F4DC} Svi unosi',
    mailbox: '\u{1F4EE} Po\u{0161}tansko sandu\u{010D}e',
    export: '\u{1F4E4} Podeli',
    import: '\u{1F4E5} Uvezi',
    edit: '\u{270F}\u{FE0F} Uredi',
    diaryPlaceholder: 'Pi\u{0161}i, du\u{0161}o moja... \u{270D}\u{FE0F}',
    lockText: '\u{1F512} Napi\u{0161}i svoje pismo da otklju\u{010D}a\u{0161} partnerovo \u{1F48C}',
    navPrev: '\u{25C2} Prethodna nedelja',
    navNext: 'Slede\u{0107}a nedelja \u{25B8}',
    calTitle: 'Kalendar',
    writeDatePrefix: '\u{1F48C} ',
    translateBtn: '\u{1F310} Prevedi',
    chineseLearn: '\u{1F4DA} Kineski',
  },
  en: {
    partnerTitle: '\u{1F338} An\u{0111}ela\'s Letter',
    barryTitle: '\u{1F466} Barry\'s Letter',
    save: 'Save',
    saved: '\u{2705} Saved',
    allEntries: '\u{1F4DC} All Entries',
    mailbox: '\u{1F4EE} Mailbox',
    export: '\u{1F4E4} Share',
    import: '\u{1F4E5} Import',
    edit: '\u{270F}\u{FE0F} Edit',
    diaryPlaceholder: 'Write, my dear... \u{270D}\u{FE0F}',
    lockText: '\u{1F512} Write your diary first to unlock your partner\'s \u{1F48C}',
    navPrev: '\u{25C2} Previous Week',
    navNext: 'Next Week \u{25B8}',
    calTitle: 'Calendar',
    writeDatePrefix: '\u{1F48C} ',
    translateBtn: '\u{1F310} Translate',
    chineseLearn: '\u{1F4DA} Learn Chinese',
  }
};
function _dd(key) {
  var L = window.lang || 'sr';
  var m = DD[L] || DD.sr;
  return m[key] || DD['zh-CN'][key] || key;
}

// ── 更新所有日记元素的文本 ──
function _updateDiaryLang() {
  var map = {
    'letter-partner-title': _dd('partnerTitle'),
    'diary-timeline-title': _dd('allEntries'),
    'mailbox-title': _dd('mailbox'),
    'diary-save-text': _dd('save'),
    'letter-saved-text': _dd('saved'),
    'letter-lock-text': _dd('lockText'),
    'sd-export': _dd('export'),
    'sd-import': _dd('import'),
    'modalDiaryEditText': _dd('edit'),
  };
  for (var id in map) {
    var el = document.getElementById(id);
    if (el) el.textContent = map[id];
  }
  // Diary textarea placeholder
  var ta = document.getElementById('diaryTextarea');
  if (ta) ta.placeholder = _dd('diaryPlaceholder');
  // Partner title with correct name
  var pt = document.getElementById('letter-partner-title');
  if (pt) {
    var isBarry = (typeof activeProfile !== 'undefined' && activeProfile === 'barry');
    pt.textContent = isBarry ? _dd('partnerTitle') : _dd('barryTitle');
  }
  // Translation button
  var tb = document.getElementById('letterTranslateBtn');
  if (tb) tb.textContent = _dd('translateBtn');
  // Date strip arrows
  var arrows = document.querySelectorAll('.date-strip-arrow');
  if (arrows.length >= 2) {
    arrows[0].setAttribute('aria-label', _dd('navPrev'));
    arrows[1].setAttribute('aria-label', _dd('navNext'));
  }
  // Calendar button title
  var calBtn = document.querySelector('.diary-cal-btn');
  if (calBtn) calBtn.title = _dd('calTitle');
  // 渲染日期导航条（_updateDiaryLang 在日记面板激活时必调）
  _renderDiaryDateStrip(_diaryViewDate);
  // 应用情书卡片布局
  _applyLetterPaperLayout();
  console.log('[日记] 语言更新: ' + (window.lang || 'sr'));
}

// ── 情书卡片布局：改造日记卡片为信纸风格 ──
function _applyLetterPaperLayout() {
  var panel = document.getElementById('panel-diary');
  if (!panel) return;
  var wc = document.getElementById('diaryWriteCard');
  var pc = document.getElementById('letterPartnerCard');
  if (!wc && !pc) return;

  // Apply letter-paper-card class
  if (wc) wc.classList.add('letter-paper-card');
  if (pc) pc.classList.add('letter-paper-card');

  // Wrap in lpc-row if not already wrapped
  if (wc && pc && wc.parentNode === panel && pc.parentNode === panel) {
    var existingRow = wc.previousElementSibling;
    if (!existingRow || !existingRow.classList.contains('lpc-row')) {
      var row = document.createElement('div');
      row.className = 'lpc-row';
      panel.insertBefore(row, wc);
      row.appendChild(wc);
      row.appendChild(pc);
    }
  }

  // Add footer with signature info to write card
  if (wc && !wc.querySelector('.lpc-footer')) {
    var sigDiv = document.createElement('div');
    sigDiv.className = 'lpc-footer';
    var L = window.lang || 'sr';
    var today = new Date();
    var dateStr = today.getDate() + '.' + (today.getMonth() + 1) + '.' + today.getFullYear();
    sigDiv.innerHTML = '<span class="lpc-date">\u{1F48C} ' + dateStr + '</span><span class="lpc-sig">...</span>';
    wc.appendChild(sigDiv);
  }
  // 填充签名内容（图片或回退文字）
  setTimeout(_renderOwnSignature, 100);
}

// ── 在写信卡片右下角显示签名 ──
function _renderOwnSignature() {
  var sig = document.querySelector('#diaryWriteCard .lpc-sig');
  if (!sig) return;
  var user = (typeof activeProfile !== 'undefined') ? activeProfile : 'andjela';
  var sigData = localStorage.getItem(user + '-signature');
  if (sigData) {
    sig.innerHTML = '<img src="' + sigData + '" style="max-height:50px;max-width:150px;opacity:.8;border-radius:4px;vertical-align:middle" alt="signature">';
  } else {
    var userName = user === 'barry' ? 'Barry' : 'Anđela';
    sig.textContent = '—— ' + userName + ' \u{270D}\u{FE0F}';
  }
  // 更新日期显示为当前查看的日期
  var dateEl = document.querySelector('#diaryWriteCard .lpc-date');
  if (dateEl && _diaryViewDate) {
    var parts = _diaryViewDate.split('-');
    if (parts.length === 3) {
      dateEl.textContent = '\u{1F48C} ' + parseInt(parts[2], 10) + '.' + parseInt(parts[1], 10) + '.';
    }
  }
}

// ── saveDiaryEntry: 保存日记 ──
window.saveDiaryEntry = function() {
  var ta = document.getElementById('diaryTextarea');
  if (!ta) { if (typeof toast === 'function') toast('Diary not ready'); return; }
  var text = ta.value.trim();
  if (!text) { if (typeof toast === 'function') toast('\u{1F4DD} ' + (window.lang === 'zh-CN' ? '\u{5199}\u{70B9}\u{4EC0}\u{4E48}\u{5427}' : window.lang === 'en' ? 'Write something' : 'Napi\u{0161}i ne\u{0161}to')); return; }

  try {
    // Get current diary date
    var dateEl = document.getElementById('diaryWriteDate');
    var dateKey = null;
    if (dateEl && dateEl.textContent) {
      // Parse date from display text (format: "📅 2026-07-07")
      var dateMatch = dateEl.textContent.match(/\d{4}-\d{2}-\d{2}/);
      if (dateMatch) dateKey = dateMatch[0];
    }
    if (!dateKey) {
      var d = new Date();
      dateKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    // Get mood from diaryMoodRow if available
    var mood = '';
    var moodRow = document.getElementById('diaryMoodRow');
    if (moodRow) {
      var selected = moodRow.querySelector('.mood-emoji.picked, .selected');
      if (selected) mood = selected.getAttribute('data-mood') || '';
    }

    // Save to shared-diary in localStorage
    var sd = {};
    try { sd = JSON.parse(localStorage.getItem('shared-diary') || '{}'); } catch(e) {}
    if (!sd[dateKey]) sd[dateKey] = {};
    var user = (typeof activeProfile !== 'undefined') ? activeProfile : 'andjela';
    if (!sd[dateKey][user]) sd[dateKey][user] = {};
    sd[dateKey][user].text = text;
    sd[dateKey][user].mood = mood;
    sd[dateKey][user].time = Date.now();
    localStorage.setItem('shared-diary', JSON.stringify(sd));

    // Update saved badge
    var badge = document.getElementById('letterSavedBadge');
    if (badge) badge.style.display = '';
    var savedText = document.getElementById('letter-saved-text');
    if (savedText) savedText.textContent = _dd('saved');

    // Sync to GitHub
    if (typeof pushAllSharedData === 'function') {
      pushAllSharedData();
    }

    // Update partner letter (unlock if was locked)
    _updatePartnerLetter(dateKey);
    // 更新自己的签名显示
    _renderOwnSignature();

    if (typeof toast === 'function') toast(_dd('saved'));
    console.log('[日记] 已保存: ' + dateKey);
  } catch(e) {
    console.error('[日记] 保存失败:', e);
    if (typeof toast === 'function') toast('Error: ' + e.message);
  }
};

// ── _updatePartnerLetter: 更新伴侣信件显示（含双向写作锁） ──
function _updatePartnerLetter(dateKey) {
  if (!dateKey) {
    var d = new Date();
    dateKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  try {
    var sd = JSON.parse(localStorage.getItem('shared-diary') || '{}');
    var user = (typeof activeProfile !== 'undefined') ? activeProfile : 'andjela';
    var partner = user === 'barry' ? 'andjela' : 'barry';
    var myEntry = sd[dateKey] && sd[dateKey][user] ? sd[dateKey][user] : null;
    var partnerEntry = sd[dateKey] && sd[dateKey][partner] ? sd[dateKey][partner] : null;

    var lockedEl = document.getElementById('letterLocked');
    var contentEl = document.getElementById('letterPartnerContent');
    var transBtn = document.getElementById('letterTranslateBtn');

    if (!myEntry) {
      // 自己没写 → 锁定（不管对方是否已写）
      if (lockedEl) lockedEl.style.display = '';
      if (contentEl) contentEl.style.display = 'none';
      if (transBtn) transBtn.style.display = 'none';
      var lt = document.getElementById('letter-lock-text');
      if (lt) lt.textContent = _dd('lockText');
    } else if (!partnerEntry) {
      // 自己写了但对方没写 → 显示等待提示
      if (lockedEl) lockedEl.style.display = '';
      if (contentEl) contentEl.style.display = 'none';
      if (transBtn) transBtn.style.display = 'none';
      var lt2 = document.getElementById('letter-lock-text');
      if (lt2) lt2.textContent = '\u{1F4ED} ' + (window.lang === 'zh-CN' ? 'Ta还没有写，稍后再来看看 \u{1F48C}'
        : window.lang === 'en' ? 'Your partner hasn\'t written yet, check back later \u{1F48C}'
        : 'Tvoj partner još nije pisao, proveri kasnije \u{1F48C}');
    } else {
      // 双方都写了 → 显示对方内容
      if (lockedEl) lockedEl.style.display = 'none';
      if (contentEl) {
        contentEl.style.display = '';
        contentEl.innerHTML = '<div style="padding:12px;font-size:.85rem;line-height:1.8;white-space:pre-wrap;word-wrap:break-word">' + escHtml(partnerEntry.text || '') + '</div>';
      }
      if (transBtn) transBtn.style.display = '';
    }
  } catch(e) {
    console.warn('[日记] 更新伴侣显示失败:', e.message);
  }
}
window._updatePartnerLetter = _updatePartnerLetter;

// ── translatePartnerLetter ──
window.translatePartnerLetter = function() {
  var contentEl = document.getElementById('letterPartnerContent');
  if (!contentEl) return;
  var currentText = contentEl.textContent || '';
  if (!currentText) return;

  // Simple toggle between original and "translated" (for now just flip the flag)
  // In future: integrate with libre/Google translate API
  var isTranslated = contentEl.dataset.translated === 'true';
  if (isTranslated) {
    contentEl.dataset.translated = 'false';
    // Restore original - reload from localStorage
    var d = new Date();
    var dateKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    _updatePartnerLetter(dateKey);
    var tb = document.getElementById('letterTranslateBtn');
    if (tb) tb.textContent = _dd('translateBtn');
  } else {
    // Show translated version (flag only - real translation requires API)
    contentEl.dataset.translated = 'true';
    contentEl.innerHTML = '<div style="padding:12px;font-size:.82rem;line-height:1.8;color:var(--text-muted);font-style:italic">\u{1F310} ' + _dd('translateBtn') + ':<br><br>' + escHtml(currentText) + '</div>';
    var tb2 = document.getElementById('letterTranslateBtn');
    if (tb2) tb2.textContent = window.lang === 'zh-CN' ? '\u{1F310} \u{539F}\u{6587}' : '\u{1F310} Original';
  }
};

// ── 简单的 HTML 转义 ──
function escHtml(s) {
  if (!s) return '';
  var d = document.createElement('div');
  d.appendChild(document.createTextNode(s));
  return d.innerHTML;
}

// ── 挂载到全局 ──
window._updateDiaryLang = _updateDiaryLang;

// ── 拦截语言切换 ──
var _origApply2 = window.applyAllUI;
if (typeof _origApply2 === 'function') {
  window.applyAllUI = function(w) {
    _origApply2(w);
    setTimeout(_updateDiaryLang, 50);
  };
}

// ── 日记当前查看日期（全局） ──
var _diaryViewDate = null; // YYYY-MM-DD, null = today

// ── 解析 YYYY-MM-DD 格式的日期 ──
function _parseDateKey(s) {
  if (!s) return new Date();
  var parts = s.split('-');
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
}
function _formatDateKey(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
window._formatDateKey = _formatDateKey;

// ── 渲染日记日期导航条（7天按钮） ──
function _renderDiaryDateStrip(centerDate) {
  var container = document.getElementById('diaryDateStrip');
  if (!container) return;
  var cd = centerDate ? _parseDateKey(centerDate) : new Date();
  var cdKey = _formatDateKey(cd);
  var L = window.lang || 'sr';

  // Read diary data to mark dates with entries
  var sd = {};
  try { sd = JSON.parse(localStorage.getItem('shared-diary') || '{}'); } catch(e) {}
  var user = (typeof activeProfile !== 'undefined') ? activeProfile : 'andjela';

  var html = '';
  for (var i = -3; i <= 3; i++) {
    var d = new Date(cd);
    d.setDate(d.getDate() + i);
    var dk = _formatDateKey(d);
    var isCurrent = dk === cdKey;
    var isToday = _formatDateKey(new Date()) === dk;
    var hasEntry = sd[dk] && (sd[dk][user] || sd[dk][user === 'barry' ? 'andjela' : 'barry']);

    html += '<div class="diary-date-btn' + (isCurrent ? ' current' : '') + '" data-date="' + dk + '" onclick="window._onDateBtnClick(\'' + dk + '\')" style="display:flex;flex-direction:column;align-items:center;padding:4px 6px;border-radius:10px;cursor:pointer;transition:all .2s;min-width:38px;background:' + (isCurrent ? 'var(--rose-light,#f0d0d0)' : 'transparent') + ';border:1px solid ' + (isCurrent ? 'var(--love,#c45a6b)' : 'var(--border,#e0d0c8)') + ';font-weight:' + (isToday ? '700' : '400') + '">';
    html += '<span style="font-size:.58rem;color:' + (isCurrent ? 'var(--love,#c45a6b)' : 'var(--text-muted,#8a7a78)') + ';line-height:1.3">' + (d.getMonth() + 1) + '/' + d.getDate() + '</span>';
    html += '<span style="font-size:.45rem;color:' + (isCurrent ? 'var(--love,#c45a6b)' : 'var(--text-muted,#8a7a78)') + ';opacity:.6;line-height:1">' + (L === 'zh-CN' ? ['日','一','二','三','四','五','六'][d.getDay()] : L === 'en' ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()] : ['Ned','Pon','Uto','Sre','Čet','Pet','Sub'][d.getDay()]) + '</span>';
    if (hasEntry) html += '<span style="font-size:.4rem;color:var(--love,#c45a6b);line-height:1">●</span>';
    else html += '<span style="font-size:.4rem;line-height:1;opacity:0">●</span>';
    html += '</div>';
  }
  container.innerHTML = html;
}

// ── 日期按钮点击处理 ──
window._onDateBtnClick = function(dateKey) {
  _setDiaryDate(dateKey);
  _updatePartnerLetter(dateKey);
  _renderOwnSignature();
  // Load entry for that date
  try {
    var sd = JSON.parse(localStorage.getItem('shared-diary') || '{}');
    var u = (typeof activeProfile !== 'undefined') ? activeProfile : 'andjela';
    var entry = sd[dateKey] && sd[dateKey][u] ? sd[dateKey][u] : null;
    var ta = document.getElementById('diaryTextarea');
    if (ta) {
      if (entry && entry.text) {
        ta.value = entry.text;
        var badge = document.getElementById('letterSavedBadge');
        if (badge) badge.style.display = '';
      } else {
        ta.value = '';
        var badge2 = document.getElementById('letterSavedBadge');
        if (badge2) badge2.style.display = 'none';
      }
    }
    var cc = document.getElementById('diaryCharCount');
    if (cc) { var ta2 = document.getElementById('diaryTextarea'); cc.textContent = (ta2 ? ta2.value.length : 0) + '/500'; }
  } catch(e) {}
};

// ── 设置日记当前日期 ──
function _setDiaryDate(dateKey) {
  var dateEl = document.getElementById('diaryWriteDate');
  if (!dateEl) return;
  var d = dateKey ? _parseDateKey(dateKey) : new Date();
  if (!dateKey) dateKey = _formatDateKey(d);
  var L = window.lang || 'sr';
  var dayNames = L === 'zh-CN' ? ['\u{65E5}','\u{4E00}','\u{4E8C}','\u{4E09}','\u{56DB}','\u{4E94}','\u{516D}'] : L === 'en' ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] : ['Ned','Pon','Uto','Sre','\u{010C}et','Pet','Sub'];
  dateEl.textContent = '\u{1F48C} ' + dayNames[d.getDay()] + ' ' + dateKey;
  _diaryViewDate = dateKey;
  // 渲染日期导航条
  _renderDiaryDateStrip(dateKey);
}
window._setDiaryDate = _setDiaryDate;

// ── scrollDiaryStrip: 日期导航左右翻 ──
window.scrollDiaryStrip = function(direction) {
  if (direction !== -1 && direction !== 1) return;
  var currentKey = _diaryViewDate;
  if (!currentKey) {
    var d = new Date();
    currentKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  var d = _parseDateKey(currentKey);
  d.setDate(d.getDate() + (direction * 7)); // Move by week
  var newKey = _formatDateKey(d);

  _setDiaryDate(newKey);
  // Update partner letter for new date
  _updatePartnerLetter(newKey);
  _renderOwnSignature();
  // Check if user already has an entry for this date and load it
  try {
    var sd = JSON.parse(localStorage.getItem('shared-diary') || '{}');
    var user = (typeof activeProfile !== 'undefined') ? activeProfile : 'andjela';
    var userEntry = sd[newKey] && sd[newKey][user] ? sd[newKey][user] : null;
    var ta = document.getElementById('diaryTextarea');
    if (ta) {
      if (userEntry && userEntry.text) {
        ta.value = userEntry.text;
        // Show saved badge
        var badge = document.getElementById('letterSavedBadge');
        if (badge) badge.style.display = '';
      } else {
        ta.value = '';
        var badge2 = document.getElementById('letterSavedBadge');
        if (badge2) badge2.style.display = 'none';
      }
    }
  } catch(e) {}
  // Update char count
  var cc = document.getElementById('diaryCharCount');
  if (cc) {
    var ta2 = document.getElementById('diaryTextarea');
    cc.textContent = (ta2 ? ta2.value.length : 0) + '/500';
  }
  console.log('[日记] 翻页: ' + newKey + ' dir=' + direction);
};

// ── toggleDiaryCalendar: 日期选择器 ──
window.toggleDiaryCalendar = function() {
  var existing = document.getElementById('diaryCalPicker');
  if (existing) { existing.remove(); return; }

  var picker = document.createElement('div');
  picker.id = 'diaryCalPicker';
  picker.style.cssText = 'position:absolute;top:100%;right:0;z-index:100;background:var(--card,#fff);border:1px solid var(--border);border-radius:12px;padding:8px;box-shadow:0 4px 20px rgba(0,0,0,.12);width:240px;max-height:300px;overflow-y:auto';

  // Date grid: show 30 days back to 7 days forward
  var html = '<div style="font-size:.65rem;font-weight:700;text-align:center;margin-bottom:6px;color:var(--text-muted)">📅 ' + (window.lang === 'zh-CN' ? '选择日期' : window.lang === 'en' ? 'Pick a date' : 'Izaberi datum') + '</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center">';

  // Day headers
  var L = window.lang || 'sr';
  var dayHeaders = L === 'zh-CN' ? ['\u{65E5}','\u{4E00}','\u{4E8C}','\u{4E09}','\u{56DB}','\u{4E94}','\u{516D}'] : L === 'en' ? ['Su','Mo','Tu','We','Th','Fr','Sa'] : ['Ne','Po','Ut','Sr','\u{010C}e','Pe','Su'];
  for (var hi = 0; hi < 7; hi++) {
    html += '<span style="font-size:.5rem;color:var(--text-muted);padding:2px 0">' + dayHeaders[hi] + '</span>';
  }

  var today = new Date();
  today.setHours(0,0,0,0);
  for (var i = 30; i >= -7; i--) {
    var d = new Date(today);
    d.setDate(d.getDate() - i);
    var dk = _formatDateKey(d);
    var isToday = d.getTime() === today.getTime();
    var isCurrent = dk === _diaryViewDate;
    html += '<div onclick="var d=this.dataset.date;document.getElementById(\'diaryCalPicker\').remove();window.scrollDiaryStrip(0);_diaryViewDate=d;_setDiaryDate(d);_updatePartnerLetter(d);try{var sd=JSON.parse(localStorage.getItem(\'shared-diary\')||\'{}\');var u=(typeof activeProfile!==\'undefined\')?activeProfile:\'andjela\';var e=sd[d]&&sd[d][u]?sd[d][u]:null;var ta=document.getElementById(\'diaryTextarea\');if(ta){if(e&&e.text){ta.value=e.text;document.getElementById(\'letterSavedBadge\').style.display=\'\'}else{ta.value=\'\';document.getElementById(\'letterSavedBadge\').style.display=\'none\'}}var cc=document.getElementById(\'diaryCharCount\');if(cc){var ta2=document.getElementById(\'diaryTextarea\');cc.textContent=(ta2?ta2.value.length:0)+\'/500\'}}catch(e){}" data-date="' + dk + '" style="cursor:pointer;padding:4px 2px;border-radius:6px;font-size:.62rem;background:' + (isCurrent ? 'var(--love)' : isToday ? 'var(--rose-light)' : 'transparent') + ';color:' + (isCurrent ? '#fff' : 'var(--text)') + ';font-weight:' + (isToday ? '700' : '400') + '">' + d.getDate() + '</div>';
  }
  html += '</div>';
  picker.innerHTML = html;

  // Position relative to calendar button
  var calBtn = document.querySelector('.diary-cal-btn');
  if (calBtn && calBtn.parentNode) {
    calBtn.parentNode.style.position = 'relative';
    calBtn.parentNode.appendChild(picker);
  } else {
    document.getElementById('panel-diary').appendChild(picker);
  }
};

console.log('[日记] 日期导航函数已添加');

// ── 拦截日记 Tab 激活 ──
var _origSD2 = window.initSharedDiaryTab;
window.initSharedDiaryTab = function() {
  if (typeof _origSD2 === 'function') _origSD2();
  _setDiaryDate();
  // 确保日期导航条渲染（首次打开 diary tab 时）
  var _sr = 0;
  var _st = setInterval(function() {
    _sr++;
    var c = document.getElementById('diaryDateStrip');
    if (c && c.innerHTML === '' && _diaryViewDate) {
      _renderDiaryDateStrip(_diaryViewDate);
    }
    if (_sr > 20 || (c && c.innerHTML !== '')) clearInterval(_st);
  }, 100);
  // Update partner letter display
  var d = new Date();
  var dk = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  _updatePartnerLetter(dk);
  _renderOwnSignature();
  // Hide saved badge on fresh load
  var badge = document.getElementById('letterSavedBadge');
  if (badge) badge.style.display = 'none';
  setTimeout(_updateDiaryLang, 300);
};

// ── MutationObserver 监听日记面板激活 ──
var _dp = document.getElementById('panel-diary');
if (_dp) {
  var _dpMo = new MutationObserver(function() {
    if (_dp.classList.contains('active')) {
      // 渲染日期导航条（确保每次切换到此 tab 都显示）
      if (!_diaryViewDate) {
        var _n = new Date();
        _diaryViewDate = _n.getFullYear() + '-' + String(_n.getMonth() + 1).padStart(2, '0') + '-' + String(_n.getDate()).padStart(2, '0');
      }
      _renderDiaryDateStrip(_diaryViewDate);
      setTimeout(_renderOwnSignature, 150);
      setTimeout(_updateDiaryLang, 200);
    }
  });
  _dpMo.observe(_dp, { attributes: true, attributeFilter: ['class'] });
}

// ── 启动后执行 ──
setTimeout(_updateDiaryLang, 1000);

console.log('[日记] 语言修复完成');
})();

// === 日记终极功能包：写作锁 + 翻译 + 签名 ===
(function(){
  console.log('[日记终极包] 已加载');

  // ── 1. 双向写作锁（增强版）─
  window._updatePartnerLetter = function(dateKey) {
    if (!dateKey) {
      var d = new Date();
      dateKey = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    }
    try {
      var sd = JSON.parse(localStorage.getItem('shared-diary') || '{}');
      var user = (typeof activeProfile !== 'undefined') ? activeProfile : 'barry';
      var partner = user === 'barry' ? 'andjela' : 'barry';
      var dayData = sd[dateKey] || {};
      var myEntry = dayData[user];
      var partnerEntry = dayData[partner];

      var contentEl = document.getElementById('letterPartnerContent');
      var lockedEl = document.getElementById('letterLocked');
      var transBtn = document.getElementById('letterTranslateBtn');

      if (!myEntry || !myEntry.text) {
        if (lockedEl) lockedEl.style.display = '';
        if (contentEl) contentEl.style.display = 'none';
        if (transBtn) transBtn.style.display = 'none';
      } else if (!partnerEntry || !partnerEntry.text) {
        if (lockedEl) lockedEl.style.display = 'none';
        if (contentEl) {
          contentEl.style.display = '';
          contentEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted)">📭 ' + (window.lang==='zh-CN'?'Ta还没有写，稍后再来看看 💌':window.lang==='en'?'Your partner hasn\'t written yet 💌':'Partner još nije pisao 💌') + '</div>';
        }
        if (transBtn) transBtn.style.display = 'none';
      } else {
        if (lockedEl) lockedEl.style.display = 'none';
        if (contentEl) {
          contentEl.style.display = '';
          var _html = '<div style="padding:12px;font-size:.85rem;line-height:1.8;white-space:pre-wrap">' + escHtml(partnerEntry.text) + '</div>';
          if (partnerEntry.mood) _html += '<div style="text-align:right;font-size:1.2rem;margin-top:8px">' + partnerEntry.mood + '</div>';
          // 显示当前用户的签名
          var _sigData = localStorage.getItem(user + '-signature');
          if (_sigData) {
            _html += '<div style="text-align:right;margin-top:12px"><img src="' + _sigData + '" style="max-height:50px;max-width:150px;opacity:.8;border-radius:4px" alt="signature"></div>';
          } else {
            var _sigName = user === 'barry' ? 'Barry' : 'Anđela';
            _html += '<div style="text-align:right;margin-top:12px;font-family:cursive,serif;font-style:italic;font-size:1.05rem;color:var(--text-muted,#8a7a78)">—— ' + _sigName + ' ✍️</div>';
          }
          contentEl.innerHTML = _html;
        }
        if (transBtn) transBtn.style.display = '';
      }
    } catch(e) {
      console.warn('[写作锁] 更新失败:', e.message);
    }
  };

  // ── 2. 翻译按钮 ──
  window.translatePartnerLetter = function() {
    var contentEl = document.getElementById('letterPartnerContent');
    var btn = document.getElementById('letterTranslateBtn');
    if (!contentEl || !btn) return;

    var originalText = contentEl.textContent || '';
    if (!originalText.trim()) return;

    if (contentEl.dataset.translated === 'true') {
      contentEl.dataset.translated = 'false';
      btn.textContent = window.lang==='zh-CN'?'🌐 翻译':window.lang==='en'?'🌐 Translate':'🌐 Prevedi';
      var d = new Date();
      var dk = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      window._updatePartnerLetter(dk);
    } else {
      btn.textContent = window.lang==='zh-CN'?'⏳ 翻译中...':window.lang==='en'?'⏳ Translating...':'⏳ Prevođenje...';
      var targetLang = (window.lang === 'zh-CN') ? 'zh-CN' : (window.lang === 'sr' ? 'sr' : 'en');
      var sourceLang = (targetLang === 'zh-CN') ? 'sr' : (targetLang === 'sr' ? 'zh-CN' : 'sr');
      var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + sourceLang + '&tl=' + targetLang + '&dt=t&q=' + encodeURIComponent(originalText);

      fetch(url)
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data && data[0]) {
            var translated = data[0].map(function(s) { return s[0]; }).join('');
            contentEl.innerHTML = '<div style="padding:12px;font-size:.85rem;line-height:1.8;white-space:pre-wrap">' + escHtml(translated) + '</div>';
            contentEl.dataset.translated = 'true';
            btn.textContent = window.lang==='zh-CN'?'📋 查看原文':window.lang==='en'?'📋 Original':'📋 Original';
          }
        })
        .catch(function(e) {
          console.warn('[翻译] 失败:', e.message);
          btn.textContent = window.lang==='zh-CN'?'🌐 翻译':window.lang==='en'?'🌐 Translate':'🌐 Prevedi';
        });
    }
  };

  // ── 3. 手写签名 ──
  window._openSignaturePad = function() {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.7);z-index:99999;display:flex;align-items:center;justify-content:center';
    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

    var pad = document.createElement('div');
    pad.style.cssText = 'background:#fdf5e6;border-radius:16px;padding:20px;width:90%;max-width:400px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.3)';

    var title = document.createElement('div');
    title.textContent = window.lang==='zh-CN'?'✍️ 手写签名':window.lang==='en'?'✍️ Signature':'✍️ Potpis';
    title.style.cssText = 'font-size:1rem;font-weight:700;margin-bottom:16px;color:#5a3e2b';
    pad.appendChild(title);

    var canvas = document.createElement('canvas');
    canvas.width = 350; canvas.height = 150;
    canvas.style.cssText = 'background:#fff;border:1px solid #e8d5c4;border-radius:8px;touch-action:none;width:100%';
    pad.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#2c1810'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    var drawing = false;

    canvas.onmousedown = function(e) { drawing = true; ctx.beginPath(); var r = canvas.getBoundingClientRect(); ctx.moveTo(e.clientX - r.left, e.clientY - r.top); e.preventDefault(); };
    canvas.ontouchstart = function(e) { drawing = true; ctx.beginPath(); var t = e.touches[0]; var r = canvas.getBoundingClientRect(); ctx.moveTo(t.clientX - r.left, t.clientY - r.top); e.preventDefault(); };
    canvas.onmousemove = function(e) { if(!drawing)return; var r=canvas.getBoundingClientRect(); ctx.lineTo(e.clientX-r.left, e.clientY-r.top); ctx.stroke(); e.preventDefault(); };
    canvas.ontouchmove = function(e) { if(!drawing)return; var t=e.touches[0]; var r=canvas.getBoundingClientRect(); ctx.lineTo(t.clientX-r.left,t.clientY-r.top); ctx.stroke(); e.preventDefault(); };
    canvas.onmouseup = function() { drawing = false; };
    canvas.ontouchend = function() { drawing = false; };

    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;margin-top:12px;justify-content:center';

    var clearBtn = document.createElement('button');
    clearBtn.textContent = window.lang==='zh-CN'?'清除':window.lang==='en'?'Clear':'Obriši';
    clearBtn.style.cssText = 'padding:8px 16px;border:1px solid #ccc;border-radius:8px;background:#fff;cursor:pointer;font-size:.8rem';
    clearBtn.onclick = function() { ctx.clearRect(0,0,canvas.width,canvas.height); };

    var saveBtn = document.createElement('button');
    saveBtn.textContent = '💾 ' + (window.lang==='zh-CN'?'保存':window.lang==='en'?'Save':'Sačuvaj');
    saveBtn.style.cssText = 'padding:8px 16px;border:none;border-radius:8px;background:var(--love,#c45a6b);color:#fff;cursor:pointer;font-size:.8rem;font-weight:600';
    saveBtn.onclick = function() {
      var dataUrl = canvas.toDataURL('image/png');
      var user2 = (typeof activeProfile!=='undefined')?activeProfile:'barry';
      localStorage.setItem(user2+'-signature', dataUrl);
      overlay.remove();
      // 即时更新写信卡片和伴侣信件的签名显示
      _renderOwnSignature();
      if (typeof _updatePartnerLetter==='function') {
        var _dk = document.querySelector('#diaryWriteCard .lpc-date');
        if (_dk) _dk.textContent = '\u{1F48C} ' + new Date().getDate() + '.' + (new Date().getMonth()+1) + '.' + new Date().getFullYear();
      }
      console.log('[签名] 已保存 (' + user2 + ')');
    };

    btnRow.appendChild(clearBtn); btnRow.appendChild(saveBtn);
    pad.appendChild(btnRow);
    overlay.appendChild(pad);
    document.body.appendChild(overlay);
  };

  console.log('[日记终极包] 写作锁+翻译+签名 已就绪');
})();

// ── 签名按钮文字更新 ──
function _updateSigBtnText() {
  var sb = document.getElementById('diarySigBtn');
  if (!sb) return;
  sb.textContent = window.lang==='zh-CN'?'✍️ 设置签名':window.lang==='en'?'✍️ Set Signature':'✍️ Potpis';
}

// ── 注入签名按钮 ──
(function(){
  function _injectSignatureBtn() {
    var saveBtn = document.getElementById('diarySaveBtn');
    if (!saveBtn) return;
    if (document.getElementById('diarySigBtn')) return;

    var sigBtn = document.createElement('button');
    sigBtn.id = 'diarySigBtn';
    sigBtn.style.cssText = 'padding:6px 12px;border:1px dashed var(--border,#d4bfa0);border-radius:8px;background:transparent;cursor:pointer;font-size:.72rem;transition:all .2s;margin-left:6px;white-space:nowrap';
    sigBtn.onmouseover = function(){this.style.background='var(--rose-light,#f0d0d0)';};
    sigBtn.onmouseout = function(){this.style.background='transparent';};
    sigBtn.onclick = function(){if(typeof window._openSignaturePad==='function')window._openSignaturePad();};
    sigBtn.textContent = '✍️ ...';

    saveBtn.parentNode.insertBefore(sigBtn, saveBtn.nextSibling);
    // 延迟设置正确文字（等待 window.lang 就绪）
    setTimeout(_updateSigBtnText, 300);
  }

  _injectSignatureBtn();
  var _mo = new MutationObserver(function(){_injectSignatureBtn();});
  _mo.observe(document.body, {childList:true,subtree:true});
  // 语言切换时更新
  var _origApply3 = window.applyAllUI;
  if(typeof _origApply3==='function'){
    window.applyAllUI = function(w){
      _origApply3(w);
      setTimeout(_updateSigBtnText, 100);
    };
  }
  console.log('[签名按钮] 已就绪');
})();

})();
