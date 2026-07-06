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
})();
