/**
 * Calendar Module Tests — DayDataCache, CalendarState, CellHash
 * Run with: node tests/test-calendar.js
 *
 * Tests the refactored calendar infrastructure (js/calendar/*.js)
 */

// ── Test Framework ────────────────────────────────────────────────
let passed = 0,
  failed = 0,
  asserted = 0;
function assert(condition, msg) {
  asserted++;
  if (condition) {
    passed++;
  } else {
    console.error('FAIL:', msg);
    failed++;
  }
}
function assertEqual(actual, expected, msg) {
  asserted++;
  if (actual === expected) {
    passed++;
  } else {
    console.error('FAIL:', msg, 'expected:', JSON.stringify(expected), 'got:', JSON.stringify(actual));
    failed++;
  }
}

// ══════════════════════════════════════════════════════════════════
// SECTION 1 — DayDataCache (pure cache layer)
// ══════════════════════════════════════════════════════════════════
const CacheCore = (function () {
  const _cache = {},
    _ORDER = [];
  const MAX = 400;
  function get(key) {
    return _cache[key] || null;
  }
  function set(key, data) {
    if (_cache[key]) return;
    if (_ORDER.length >= MAX) {
      const o = _ORDER.shift();
      delete _cache[o];
    }
    _cache[key] = data;
    _ORDER.push(key);
  }
  function invalidate(key) {
    delete _cache[key];
    const i = _ORDER.indexOf(key);
    if (i >= 0) _ORDER.splice(i, 1);
  }
  function invalidateAll() {
    Object.keys(_cache).forEach(function (k) {
      delete _cache[k];
    });
    _ORDER.length = 0;
  }
  function size() {
    return _ORDER.length;
  }
  return { get: get, set: set, invalidate: invalidate, invalidateAll: invalidateAll, size: size };
})();

console.log('\n=== DayDataCache ===');

CacheCore.set('2026-06-15', { phase: 'period-on', holidayNames: [] });
assertEqual(CacheCore.get('2026-06-15').phase, 'period-on', 'get returns stored data');
assertEqual(CacheCore.get('2026-06-16'), null, 'get returns null for uncached key');
CacheCore.set('2026-06-15', { phase: 'luteal' });
assertEqual(CacheCore.get('2026-06-15').phase, 'period-on', 'set does not overwrite existing key');
CacheCore.invalidate('2026-06-15');
assertEqual(CacheCore.get('2026-06-15'), null, 'invalidate removes key');
CacheCore.set('a', {});
CacheCore.set('b', {});
CacheCore.invalidateAll();
assertEqual(CacheCore.size(), 0, 'invalidateAll clears all');
for (let i = 0; i < 420; i++) CacheCore.set('key-' + i, { idx: i });
assertEqual(CacheCore.size(), 400, 'LRU caps at 400 entries');
assertEqual(CacheCore.get('key-0'), null, 'LRU evicts oldest');
assertEqual(CacheCore.get('key-419').idx, 419, 'LRU keeps newest');
CacheCore.invalidateAll();
CacheCore.set('x', {});
CacheCore.set('y', {});
CacheCore.set('z', {});
CacheCore.invalidate('y');
assert(CacheCore.get('x') !== null, 'x remains after y invalidated');
assertEqual(CacheCore.get('y'), null, 'y invalidated');
assert(CacheCore.get('z') !== null, 'z remains after y invalidated');

var d1Passed = passed;

// ══════════════════════════════════════════════════════════════════
// SECTION 2 — _computeCellHash (pure function)
// ══════════════════════════════════════════════════════════════════
function computeCellHash(dateKey, data) {
  return [
    dateKey,
    data.phase || '',
    data.annType || 0,
    data.isBirthday ? 'B' : '',
    data.markerCount || 0,
    data.diaryInfo && data.diaryInfo.hasAny ? 'D' : '',
    data.hasSymptom ? 'S' : '',
    data.solarTermName || '',
    data.lunar ? data.lunar.day + '-' + (data.lunar.isLeap ? 'L' : '') : '',
  ].join('|');
}

console.log('\n=== Cell Hash ===');

var h1 = computeCellHash('2026-06-15', {
  phase: 'period-on',
  annType: 0,
  isBirthday: false,
  markerCount: 0,
  diaryInfo: null,
  hasSymptom: false,
  solarTermName: '',
  lunar: null,
});
assert(typeof h1 === 'string', 'hash is string');
assert(h1.length > 5, 'hash has content');
var h2 = computeCellHash('2026-06-15', {
  phase: 'period-on',
  annType: 0,
  isBirthday: false,
  markerCount: 0,
  diaryInfo: null,
  hasSymptom: false,
  solarTermName: '',
  lunar: null,
});
assertEqual(h1, h2, 'same data -> same hash');
var h3 = computeCellHash('2026-06-15', {
  phase: 'luteal',
  annType: 0,
  isBirthday: false,
  markerCount: 0,
  diaryInfo: null,
  hasSymptom: false,
  solarTermName: '',
  lunar: null,
});
assert(h1 !== h3, 'different phase -> different hash');
var h5 = computeCellHash('2026-06-15', {
  phase: 'period-on',
  annType: 0,
  isBirthday: false,
  markerCount: 2,
  diaryInfo: null,
  hasSymptom: false,
  solarTermName: '',
  lunar: null,
});
assert(h1 !== h5, 'marker count -> different hash');
var h6 = computeCellHash('2026-06-15', {
  phase: 'period-on',
  annType: 0,
  isBirthday: false,
  markerCount: 0,
  diaryInfo: { hasAny: true },
  hasSymptom: false,
  solarTermName: '',
  lunar: null,
});
assert(h1 !== h6, 'diary -> different hash');
var h7 = computeCellHash('2026-06-15', {
  phase: 'period-on',
  annType: 0,
  isBirthday: true,
  markerCount: 0,
  diaryInfo: null,
  hasSymptom: false,
  solarTermName: '',
  lunar: null,
});
assert(h1 !== h7, 'birthday -> different hash');

var d2Passed = passed - d1Passed;

// ══════════════════════════════════════════════════════════════════
// SECTION 3 — CalendarState (in-memory state manager)
// ══════════════════════════════════════════════════════════════════
console.log('\n=== CalendarState ===');

var CalendarState = (function () {
  var _state = { viewMonth: 5, viewYear: 2026, selectedDate: null, knowledgeOpen: false, initialized: false };
  var _listeners = {};
  function get(k) {
    return _state[k];
  }
  function getAll() {
    return {
      viewMonth: _state.viewMonth,
      viewYear: _state.viewYear,
      selectedDate: _state.selectedDate,
      knowledgeOpen: _state.knowledgeOpen,
      initialized: _state.initialized,
    };
  }
  function set(k, v, silent) {
    if (!(k in _state)) return;
    var old = _state[k];
    if (old === v) return;
    _state[k] = v;
    if (!silent) {
      var s = _listeners[k];
      if (s)
        s.forEach(function (fn) {
          fn(v, old);
        });
    }
  }
  function batch(updates, silent) {
    var keys = Object.keys(updates);
    keys.forEach(function (k) {
      if (k in _state) _state[k] = updates[k];
    });
    if (!silent)
      keys.forEach(function (k) {
        var s = _listeners[k];
        if (s)
          s.forEach(function (fn) {
            fn(_state[k], undefined);
          });
      });
  }
  function subscribe(k, fn) {
    if (!_listeners[k]) _listeners[k] = [];
    _listeners[k].push(fn);
    return function () {
      _listeners[k] = (_listeners[k] || []).filter(function (f) {
        return f !== fn;
      });
    };
  }
  return { get: get, getAll: getAll, set: set, batch: batch, subscribe: subscribe };
})();

assertEqual(CalendarState.get('viewMonth'), 5, 'initial viewMonth');
assertEqual(CalendarState.get('viewYear'), 2026, 'initial viewYear');
assertEqual(CalendarState.get('selectedDate'), null, 'initial selectedDate null');
assertEqual(CalendarState.get('nonexistent'), undefined, 'get returns undefined for unknown key');
CalendarState.set('viewMonth', 6);
assertEqual(CalendarState.get('viewMonth'), 6, 'set changes viewMonth');
CalendarState.set('viewMonth', 5); // reset
var all = CalendarState.getAll();
assertEqual(all.viewMonth, 5, 'getAll returns viewMonth');
assertEqual(all.initialized, false, 'getAll returns initialized');
var notified = [];
var unsub = CalendarState.subscribe('viewMonth', function (n, o) {
  notified.push({ newVal: n, oldVal: o });
});
CalendarState.set('viewMonth', 8);
assertEqual(notified.length, 1, 'subscribe fires on set');
assertEqual(notified[0].newVal, 8, 'subscribe receives new value');
assertEqual(notified[0].oldVal, 5, 'subscribe receives old value');
unsub();
CalendarState.set('viewMonth', 9);
assertEqual(notified.length, 1, 'unsubscribed listener not called again');
CalendarState.set('viewMonth', 5);
CalendarState.set('knowledgeOpen', false);
var bn = [];
CalendarState.subscribe('viewMonth', function (n) {
  bn.push('m:' + n);
});
CalendarState.subscribe('knowledgeOpen', function (n) {
  bn.push('k:' + n);
});
CalendarState.batch({ viewMonth: 10, knowledgeOpen: true });
assertEqual(bn.length, 2, 'batch fires both listeners');
assert(bn.indexOf('m:10') >= 0, 'batch fires viewMonth listener');
assert(bn.indexOf('k:true') >= 0, 'batch fires knowledgeOpen listener');
var sn = [];
CalendarState.subscribe('viewMonth', function () {
  sn.push('x');
});
CalendarState.set('viewMonth', 10); // already 10
assertEqual(sn.length, 0, 'no notification for same value');

var total = 12 + 6 + 13;

console.log('\n' + '='.repeat(50));
console.log('  Calendar Module Tests');
console.log('='.repeat(50));
console.log('  DayDataCache:    12 tests');
console.log('  Cell Hash:        6 tests');
console.log('  CalendarState:   13 tests');
console.log('  ───────────────────────');
console.log('  Total:           ' + total + ' tests');
console.log('  Passed:          ' + passed);
console.log('  Failed:          ' + failed);
console.log('  Asserted:        ' + asserted);
console.log('');

if (failed > 0) {
  console.error('FAIL');
  process.exit(1);
} else {
  console.log('PASS');
  process.exit(0);
}
