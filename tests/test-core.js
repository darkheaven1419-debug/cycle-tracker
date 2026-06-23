/**
 * Core unit tests for Anđelin Ciklus v8
 * Run with: node tests/test-core.js
 */

// --- Minimal test framework ---
var passed = 0, failed = 0;
function assert(condition, msg) {
  if (condition) { passed++; }
  else { console.error('FAIL:', msg); failed++; }
}
function assertEqual(actual, expected, msg) {
  if (actual === expected) { passed++; }
  else { console.error('FAIL:', msg, 'expected:', expected, 'got:', actual); failed++; }
}

// --- Date helpers (replicated for isolated testing) ---
var fmtDate = function(d) {
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
};
var sameDay = function(a, b) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
};
var addDays = function(d, n) {
  var r = new Date(d); r.setDate(r.getDate()+n); return r;
};
var daysDiff = function(a, b) {
  return Math.round((b.getTime()-a.getTime())/86400000);
};
var today = function() {
  var tt = new Date(); tt.setHours(0,0,0,0); return tt;
};

console.log('\n=== Date Helpers ===');
var d1 = new Date(2026, 5, 15);
assertEqual(fmtDate(d1), '2026-06-15', 'fmtDate');
var d2 = new Date(2026, 5, 15);
assert(sameDay(d1, d2), 'sameDay true');
assert(!sameDay(d1, addDays(d2, 1)), 'sameDay false');
assertEqual(fmtDate(addDays(d1, 5)), '2026-06-20', 'addDays');
assertEqual(daysDiff(d1, addDays(d1, 5)), 5, 'daysDiff');
var t = today();
assertEqual(t.getHours(), 0, 'today zero hours');

console.log('\n=== Prediction Algorithm ===');
function predictCycles(records) {
  if (!records || records.length === 0) return [];
  var sorted = records.slice().sort(function(a, b) { return a - b; });
  var cycles = [];
  for (var i = 1; i < sorted.length; i++) {
    cycles.push(Math.round((sorted[i] - sorted[i-1]) / 86400000));
  }
  return cycles;
}
function predictNext(records, cycleLength) {
  if (records.length === 0) return null;
  var sorted = records.slice().sort(function(a, b) { return a - b; });
  var last = sorted[sorted.length - 1];
  var cycles = predictCycles(records);
  var avgCycle = cycles.length > 0
    ? Math.round(cycles.reduce(function(a, b) { return a + b; }, 0) / cycles.length)
    : cycleLength;
  return addDays(last, avgCycle);
}

var records = [new Date(2026, 3, 1), new Date(2026, 3, 29)];
assertEqual(predictCycles(records).length, 1, 'predictCycles count');
assertEqual(predictCycles(records)[0], 28, 'predictCycles 28 days');
assertEqual(fmtDate(predictNext(records, 28)), '2026-05-27', 'predictNext');

var r3 = [new Date(2026, 3, 1), new Date(2026, 3, 29), new Date(2026, 4, 28)];
var c3 = predictCycles(r3);
assertEqual(c3.length, 2, '3 records → 2 cycles');
assertEqual(c3[0], 28, 'cycle 1 = 28');
assertEqual(c3[1], 29, 'cycle 2 = 29');

console.log('\n=== i18n ===');
function langName(obj, lang) {
  return obj[lang] || obj[lang.split('-')[0]] || obj['sr'] || '';
}
var tObj = { 'sr': 'Здраво', 'zh-CN': '你好', 'en': 'Hello' };
assertEqual(langName(tObj, 'sr'), 'Здраво', 'langName sr');
assertEqual(langName(tObj, 'zh-CN'), '你好', 'langName zh');
assertEqual(langName(tObj, 'en'), 'Hello', 'langName en');
assertEqual(langName(tObj, 'fr'), 'Здраво', 'langName fallback');

console.log('\n=== Profile System ===');
function profileKey(base, profile) { return base + '-' + profile; }
assertEqual(profileKey('cycle-data', 'andjela'), 'cycle-data-andjela', 'profileKey andjela');
assertEqual(profileKey('cycle-data', 'barry'), 'cycle-data-barry', 'profileKey barry');

console.log('\n========================================');
console.log('RESULTS: ' + passed + ' passed, ' + failed + ' failed');
console.log('========================================');
if (failed > 0) process.exit(1);
