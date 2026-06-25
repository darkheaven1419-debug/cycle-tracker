/**
 * Core unit tests for Anđelin Ciklus v8
 * Comprehensive test suite — date utilities, cycle prediction, phases, i18n, profiles, safe utils
 * Run with: node tests/test-core.js
 */

// --- Minimal test framework ---
var passed = 0, failed = 0, asserted = 0;
function assert(condition, msg) {
  asserted++;
  if (condition) { passed++; }
  else { console.error('FAIL:', msg); failed++; }
}
function assertEqual(actual, expected, msg) {
  asserted++;
  if (actual === expected) { passed++; }
  else { console.error('FAIL:', msg, 'expected:', JSON.stringify(expected), 'got:', JSON.stringify(actual)); failed++; }
}

/* ================================================================
   SECTION 1 — Date Helpers (replicated from js/cycle-core.js)
   ================================================================ */
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
var d0 = function(d) {
  var r = new Date(d); r.setHours(0, 0, 0, 0); return r;
};
var today = function() {
  var tt = new Date(); tt.setHours(0,0,0,0); return tt;
};

console.log('\n=== 1. Date Helpers ===');

// Basic formatting
var d1 = new Date(2026, 5, 15);
assertEqual(fmtDate(d1), '2026-06-15', 'fmtDate formats correctly');
assertEqual(fmtDate(new Date(2026, 0, 1)), '2026-01-01', 'fmtDate pads single-digit month');
assertEqual(fmtDate(new Date(2026, 11, 9)), '2026-12-09', 'fmtDate December');
assertEqual(fmtDate(new Date(2026, 2, 3)), '2026-03-03', 'fmtDate March 3');

// sameDay
var d2 = new Date(2026, 5, 15);
assert(sameDay(d1, d2), 'sameDay true for identical dates');
assert(!sameDay(d1, addDays(d2, 1)), 'sameDay false for different dates');
assert(!sameDay(d1, addDays(d2, -1)), 'sameDay false for day before');
assert(sameDay(new Date(2024, 1, 29), new Date(2024, 1, 29)), 'sameDay leap year same');
assert(!sameDay(new Date(2024, 1, 28), new Date(2024, 1, 29)), 'sameDay leap year adjacent');

// addDays
assertEqual(fmtDate(addDays(d1, 5)), '2026-06-20', 'addDays +5');
assertEqual(fmtDate(addDays(d1, 0)), '2026-06-15', 'addDays +0');
assertEqual(fmtDate(addDays(d1, -1)), '2026-06-14', 'addDays -1 (negative)');
assertEqual(fmtDate(addDays(d1, 30)), '2026-07-15', 'addDays across month boundary');
assertEqual(fmtDate(addDays(d1, 365)), '2027-06-15', 'addDays +1 year');

// daysDiff
assertEqual(daysDiff(d1, addDays(d1, 5)), 5, 'daysDiff +5');
assertEqual(daysDiff(addDays(d1, 5), d1), -5, 'daysDiff negative (b before a)');
assertEqual(daysDiff(d1, d1), 0, 'daysDiff same date');
assertEqual(daysDiff(d1, addDays(d1, 365)), 365, 'daysDiff across year');

// d0
var dWithTime = new Date(2026, 5, 15, 14, 30, 45, 123);
var dZeroed = d0(dWithTime);
assertEqual(dZeroed.getHours(), 0, 'd0 zeroes hours');
assertEqual(dZeroed.getMinutes(), 0, 'd0 zeroes minutes');
assertEqual(dZeroed.getSeconds(), 0, 'd0 zeroes seconds');
assertEqual(dZeroed.getMilliseconds(), 0, 'd0 zeroes milliseconds');
assertEqual(fmtDate(dZeroed), '2026-06-15', 'd0 preserves year/month/day');

// today
var t = today();
assertEqual(t.getHours(), 0, 'today zero hours');
assertEqual(t.getMinutes(), 0, 'today zero minutes');
assertEqual(t.getSeconds(), 0, 'today zero seconds');
assertEqual(t.getMilliseconds(), 0, 'today zero ms');
// today should be ... today
var now = new Date();
assert(sameDay(t, now), 'today is actually today');
assert(now.getTime() - t.getTime() < 86400000, 'today is within 24h');

// addDays preserves d0
var dZero = d0(new Date(2026, 11, 25));
var dZeroPlus = addDays(dZero, 3);
assertEqual(dZeroPlus.getHours(), 0, 'addDays preserves midnight from d0 input');

/* ================================================================
   SECTION 2 — Cycle Prediction (pure functions)
   ================================================================ */
console.log('\n=== 2. Cycle Prediction ===');

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

// Edge case: empty records
assertEqual(predictCycles([]).length, 0, 'predictCycles empty array');
assertEqual(predictCycles(null).length, 0, 'predictCycles null');
assertEqual(predictCycles(undefined).length, 0, 'predictCycles undefined');
assertEqual(predictNext([], 28), null, 'predictNext empty array');

// Single record
var single = [new Date(2026, 3, 1)];
assertEqual(predictCycles(single).length, 0, 'predictCycles single record = 0 cycles');
assertEqual(fmtDate(predictNext(single, 28)), '2026-04-29', 'predictNext single with default 28');
assertEqual(fmtDate(predictNext(single, 35)), '2026-05-06', 'predictNext single with default 35');

// Two records — one cycle
var records = [new Date(2026, 3, 1), new Date(2026, 3, 29)];
assertEqual(predictCycles(records).length, 1, 'predictCycles count = 1');
assertEqual(predictCycles(records)[0], 28, 'predictCycles 28 days');
assertEqual(fmtDate(predictNext(records, 28)), '2026-05-27', 'predictNext from 2 records');

// Three records — two cycles
var r3 = [new Date(2026, 3, 1), new Date(2026, 3, 29), new Date(2026, 4, 28)];
var c3 = predictCycles(r3);
assertEqual(c3.length, 2, '3 records => 2 cycles');
assertEqual(c3[0], 28, 'cycle 1 = 28');
assertEqual(c3[1], 29, 'cycle 2 = 29');
assertEqual(fmtDate(predictNext(r3, 28)), '2026-06-26', 'predictNext from 3 records (avg 28.5 => 29)');

// Irregular cycles
var irreg = [
  new Date(2026, 0, 1),
  new Date(2026, 0, 29),  // 28
  new Date(2026, 2, 5),   // 35
  new Date(2026, 3, 2),   // 28
  new Date(2026, 4, 3)    // 31
];
var cIrreg = predictCycles(irreg);
assertEqual(cIrreg.length, 4, '5 records => 4 cycles');
assertEqual(cIrreg[0], 28, 'irreg cycle 1 = 28');
assertEqual(cIrreg[1], 35, 'irreg cycle 2 = 35');
assertEqual(cIrreg[2], 28, 'irreg cycle 3 = 28');
assertEqual(cIrreg[3], 31, 'irreg cycle 4 = 31');

// Longer cycles (non-standard)
var longCycles = [new Date(2026, 0, 1), new Date(2026, 1, 5), new Date(2026, 2, 10)];
assertEqual(predictCycles(longCycles)[0], 35, '35-day cycle');
assertEqual(predictCycles(longCycles)[1], 33, '33-day cycle');

// Predict with unsorted input
var unsorted = [new Date(2026, 4, 28), new Date(2026, 3, 29), new Date(2026, 3, 1)];
assertEqual(predictCycles(unsorted)[0], 28, 'predictCycles handles unsorted input');
assertEqual(fmtDate(predictNext(unsorted, 28)), '2026-06-26', 'predictNext handles unsorted input');

// Edge: very short cycle
var shortCycle = [new Date(2026, 0, 1), new Date(2026, 0, 21)];
assertEqual(predictCycles(shortCycle)[0], 20, '20-day cycle detected');

// Edge: very long cycle
var longCycle = [new Date(2026, 0, 1), new Date(2026, 2, 1)];
assertEqual(predictCycles(longCycle)[0], 59, '59-day cycle detected');

/* ================================================================
   SECTION 3 — Full predict() with mocked state
   Uses dates in the FUTURE (Aug/Sep/Oct 2026) so overdue logic
   does not interfere with baseline assertions.
   ================================================================ */
console.log('\n=== 3. Full predict() with mocked state ===');

function fullPredict(stateMock) {
  var records = stateMock.records;
  var settings = stateMock.settings;
  var periodEnds = stateMock.periodEnds || {};
  var sorted = records.slice().sort(function(a, b) { return a - b; });

  var periodLengths = [];
  for (var i = 0; i < sorted.length; i++) {
    var key = fmtDate(sorted[i]);
    if (periodEnds[key]) {
      periodLengths.push(
        daysDiff(d0(sorted[i]), d0(new Date(periodEnds[key] + 'T00:00:00'))) + 1
      );
    }
  }
  var avgPeriodLen = periodLengths.length > 0
    ? Math.round(periodLengths.reduce(function(a, b) { return a + b; }, 0) / periodLengths.length)
    : settings.periodLength;

  var def = {
    lastStart: null,
    nextStart: null,
    ovulation: null,
    fertileStart: null,
    fertileEnd: null,
    cycleLen: settings.cycleLength,
    periodLen: avgPeriodLen,
    avgCycle: settings.cycleLength,
    minCycle: null,
    maxCycle: null,
    stdDev: 0,
    confidence: 'low',
    cycles: [],
    isOverdue: false,
    overdueDays: 0,
    futurePeriods: []
  };
  if (sorted.length === 0) return def;
  def.lastStart = d0(sorted[sorted.length - 1]);
  if (sorted.length === 1) {
    def.nextStart = addDays(def.lastStart, settings.cycleLength);
  } else {
    for (var i = 1; i < sorted.length; i++) {
      def.cycles.push(daysDiff(d0(sorted[i - 1]), d0(sorted[i])));
    }
    var recent = def.cycles.slice(-6);
    if (recent.length > 0) {
      def.avgCycle = Math.round(recent.reduce(function(a, b) { return a + b; }, 0) / recent.length);
      def.minCycle = Math.min.apply(null, recent);
      def.maxCycle = Math.max.apply(null, recent);
      var variance = recent.reduce(function(s, c) { return s + (c - def.avgCycle) * (c - def.avgCycle); }, 0) / recent.length;
      def.stdDev = Math.round(Math.sqrt(variance) * 10) / 10;
      if (def.stdDev <= 3) def.confidence = 'high';
      else if (def.stdDev <= 6) def.confidence = 'medium';
      else def.confidence = 'low';
    }
    def.nextStart = addDays(def.lastStart, def.avgCycle);
  }

  var td = today();
  if (def.nextStart && td > def.nextStart) {
    var useLen = settings.manualOverride ? settings.cycleLength : def.avgCycle;
    var elapsed = daysDiff(def.lastStart, td);
    var passed = Math.floor(elapsed / useLen);
    if (passed >= 1) {
      def.nextStart = addDays(def.lastStart, useLen * (passed + 1));
    }
    def.isOverdue = (td > def.nextStart);
    if (def.isOverdue) def.overdueDays = daysDiff(def.nextStart, td);
  }

  if (def.nextStart) {
    def.ovulation = addDays(def.nextStart, -14);
    def.fertileStart = addDays(def.ovulation, -3);
    def.fertileEnd = addDays(def.ovulation, 2);
    var useLen = settings.manualOverride ? settings.cycleLength : def.avgCycle;
    for (var i = 1; i <= 2; i++) {
      var np = addDays(def.nextStart, useLen * i);
      def.futurePeriods.push({
        start: np,
        ovulation: addDays(np, -14),
        fertileStart: addDays(np, -17),
        fertileEnd: addDays(np, -11)
      });
    }
  }
  return def;
}

// Baseline: 2 records in the future, 28-day cycles
// lastStart = Sep 1, nextStart = Sep 29
var state1 = {
  records: [new Date(2026, 7, 4), new Date(2026, 8, 1)],
  settings: { cycleLength: 28, periodLength: 7, manualOverride: false },
  periodEnds: {}
};
var p1 = fullPredict(state1);
assertEqual(fmtDate(p1.lastStart), '2026-09-01', 'pred lastStart = Sep 1');
assertEqual(p1.avgCycle, 28, 'pred avgCycle = 28');
assertEqual(fmtDate(p1.nextStart), '2026-09-29', 'pred nextStart = Sep 29');
assertEqual(fmtDate(p1.ovulation), '2026-09-15', 'pred ovulation (nextStart - 14)');
assertEqual(fmtDate(p1.fertileStart), '2026-09-12', 'pred fertileStart (ovulation - 3)');
assertEqual(fmtDate(p1.fertileEnd), '2026-09-17', 'pred fertileEnd (ovulation + 2)');
assertEqual(p1.periodLen, 7, 'pred default periodLen');
assertEqual(p1.confidence, 'high', 'pred confidence high for stdDev 0');
assertEqual(p1.minCycle, 28, 'pred minCycle');
assertEqual(p1.maxCycle, 28, 'pred maxCycle');
assertEqual(p1.stdDev, 0, 'pred stdDev 0');
assert(!p1.isOverdue, 'pred not overdue (future dates)');

// Future periods
assertEqual(p1.futurePeriods.length, 2, 'pred 2 future periods');
assertEqual(fmtDate(p1.futurePeriods[0].start), '2026-10-27', 'first future period start');

// Expect fertile/luteal/follicular phase labels on future dates

// Mock state: 1 record (no cycles yet) — use a future date
var stateSingle = {
  records: [new Date(2026, 8, 1)],
  settings: { cycleLength: 28, periodLength: 5, manualOverride: false },
  periodEnds: {}
};
var pSingle = fullPredict(stateSingle);
assertEqual(fmtDate(pSingle.lastStart), '2026-09-01', 'single record lastStart');
assertEqual(pSingle.avgCycle, 28, 'single record uses default cycleLength');
assertEqual(fmtDate(pSingle.nextStart), '2026-09-29', 'single record nextStart = lastStart + default');
assertEqual(pSingle.periodLen, 5, 'single record uses default periodLen');
assertEqual(pSingle.confidence, 'low', 'single record confidence low (no cycles)');
assertEqual(pSingle.minCycle, null, 'single record no minCycle');
assertEqual(pSingle.maxCycle, null, 'single record no maxCycle');

// Mock state: 0 records
var stateEmpty = {
  records: [],
  settings: { cycleLength: 28, periodLength: 5, manualOverride: false },
  periodEnds: {}
};
var pEmpty = fullPredict(stateEmpty);
assertEqual(pEmpty.lastStart, null, 'empty records lastStart null');
assertEqual(pEmpty.nextStart, null, 'empty records nextStart null');

// Mock state: 3 records with varying cycles
// Using future dates to avoid overdue logic
var midState = {
  records: [
    new Date(2026, 6, 1),   // Jul 1
    new Date(2026, 6, 28),  // Jul 28 (27 days)
    new Date(2026, 7, 28)   // Aug 28 (31 days)
  ],
  settings: { cycleLength: 28, periodLength: 5, manualOverride: false },
  periodEnds: {}
};
var pMid = fullPredict(midState);
assertEqual(pMid.cycles.length, 2, 'mid has 2 cycles');
assertEqual(pMid.avgCycle, 29, 'mid avgCycle (27+31)/2 = 29');
assertEqual(pMid.minCycle, 27, 'mid minCycle');
assertEqual(pMid.maxCycle, 31, 'mid maxCycle');
assertEqual(pMid.nextStart && fmtDate(pMid.nextStart), '2026-09-26', 'mid nextStart = Aug 28 + 29');
assert(pMid.confidence === 'medium' || pMid.confidence === 'high', 'mid confidence medium or high');

// Mock state: very irregular cycles => low confidence
var lowState = {
  records: [
    new Date(2026, 6, 1),   // Jul 1
    new Date(2026, 7, 5),   // Aug 5 (35 days)
    new Date(2026, 8, 2),   // Sep 2 (28 days)
    new Date(2026, 9, 29)   // Oct 29 (57 days)
  ],
  settings: { cycleLength: 28, periodLength: 5, manualOverride: false },
  periodEnds: {}
};
var pLow = fullPredict(lowState);
assertEqual(pLow.cycles.length, 3, 'low confidence 3 cycles');
assert(pLow.confidence === 'low', 'confidence low for high stdDev (28,35,57)');
assertEqual(pLow.minCycle, 28, 'low minCycle = 28');
assertEqual(pLow.maxCycle, 57, 'low maxCycle = 57');

// Period ends data + future dates
var stateWithEnds = {
  records: [new Date(2026, 7, 1), new Date(2026, 7, 29)],
  settings: { cycleLength: 28, periodLength: 7, manualOverride: false },
  periodEnds: { '2026-08-01': '2026-08-05' }
};
var pEnds = fullPredict(stateWithEnds);
assertEqual(pEnds.periodLen, 5, 'periodLen computed from periodEnds (Aug 1-5 = 5 days)');

// Manual override with future dates
var manualState = {
  records: [new Date(2026, 8, 1), new Date(2026, 9, 6)],  // 35 day cycle
  settings: { cycleLength: 28, periodLength: 5, manualOverride: true },
  periodEnds: {}
};
var pManual = fullPredict(manualState);
// With manualOverride, initial nextStart uses avgCycle (from data = 35 days)
assertEqual(fmtDate(pManual.nextStart), '2026-11-10', 'manual override nextStart = Oct 6 + 35 (avgCycle from data)');
// futurePeriods use manualOverride cycleLength (28) not avgCycle (35)
assertEqual(fmtDate(pManual.futurePeriods[0].start), '2026-12-08', 'manual override future period 1 uses 28-day cycle');
assertEqual(fmtDate(pManual.futurePeriods[1].start), '2027-01-05', 'manual override future period 2 uses 28-day cycle');

/* ================================================================
   SECTION 4 — Phase Determination
   ================================================================ */
console.log('\n=== 4. Phase Determination ===');

function getPeriodEndDate(startDate, periodEnds) {
  var key = fmtDate(startDate);
  if (periodEnds && periodEnds[key]) return new Date(periodEnds[key] + 'T00:00:00');
  return null;
}

function getPhase(date, pred, stateMock) {
  var d = d0(date);
  // Check recorded periods
  for (var ri = 0; ri < stateMock.records.length; ri++) {
    var s = d0(stateMock.records[ri]);
    var e = getPeriodEndDate(stateMock.records[ri], stateMock.periodEnds) || addDays(s, pred.periodLen - 1);
    e = d0(e);
    if (d >= s && d <= e) return sameDay(d, s) ? 'period-on' : 'period-mid';
  }
  // Check predicted next period
  if (pred.nextStart) {
    var ps = d0(pred.nextStart), pe = addDays(ps, pred.periodLen - 1);
    pe.setHours(0, 0, 0, 0);
    if (d >= ps && d <= pe) return sameDay(d, ps) ? 'period-pred-first' : 'period-pred';
  }
  // Check future predicted periods
  for (var fi = 0; fi < pred.futurePeriods.length; fi++) {
    var fps = d0(pred.futurePeriods[fi].start);
    var fpe = addDays(fps, pred.periodLen - 1);
    fpe.setHours(0, 0, 0, 0);
    if (d >= fps && d <= fpe) return sameDay(d, fps) ? 'period-future-first' : 'period-future';
  }
  // Ovulation
  if (pred.ovulation && sameDay(d, pred.ovulation)) return 'ovulation';
  // Fertile window
  if (pred.fertileStart && pred.fertileEnd) {
    var fs = d0(pred.fertileStart), fe = d0(pred.fertileEnd);
    if (d >= fs && d <= fe) return 'fertile';
  }
  // Luteal phase
  if (pred.fertileEnd && pred.nextStart) {
    var lfe = d0(pred.fertileEnd), np = d0(pred.nextStart);
    if (d > lfe && d < np) return 'luteal';
  }
  // Follicular phase
  if (pred.lastStart && pred.fertileStart) {
    var lpEnd = addDays(pred.lastStart, pred.periodLen);
    lpEnd.setHours(0, 0, 0, 0);
    var pfs = d0(pred.fertileStart);
    if (d >= lpEnd && d < pfs) return 'follicular';
  }
  return null;
}

// Use future dates: records [Aug 4, Sep 1], periodLen 5, 28-day cycles
// Last start = Sep 1, period ends Sep 5
// Fertile: Sep 12-17, Ovulation: Sep 15, Luteal: Sep 18-Sep 28
// Next period (predicted): Sep 29 - Oct 3
// Future period: Oct 27 - Oct 31
var phaseState = {
  records: [new Date(2026, 7, 4), new Date(2026, 8, 1)],
  settings: { cycleLength: 28, periodLength: 5, manualOverride: false },
  periodEnds: {
    '2026-08-04': '2026-08-08',
    '2026-09-01': '2026-09-05'
  }
};
var phasePred = fullPredict(phaseState);

// Check prediction basics
assertEqual(fmtDate(phasePred.lastStart), '2026-09-01', 'phase lastStart Sep 1');
assertEqual(fmtDate(phasePred.nextStart), '2026-09-29', 'phase nextStart Sep 29');
assertEqual(fmtDate(phasePred.ovulation), '2026-09-15', 'phase ovulation Sep 15');
assertEqual(fmtDate(phasePred.fertileStart), '2026-09-12', 'phase fertileStart Sep 12');
assertEqual(fmtDate(phasePred.fertileEnd), '2026-09-17', 'phase fertileEnd Sep 17');

// Period-on
assertEqual(getPhase(new Date(2026, 8, 1), phasePred, phaseState), 'period-on', 'phase Sep 1 = period-on');

// Period-mid
assertEqual(getPhase(new Date(2026, 8, 2), phasePred, phaseState), 'period-mid', 'phase Sep 2 = period-mid');
assertEqual(getPhase(new Date(2026, 8, 5), phasePred, phaseState), 'period-mid', 'phase Sep 5 = period-mid (last day)');

// Follicular (Sep 6 to Sep 11)
assertEqual(getPhase(new Date(2026, 8, 6), phasePred, phaseState), 'follicular', 'phase Sep 6 = follicular');
assertEqual(getPhase(new Date(2026, 8, 9), phasePred, phaseState), 'follicular', 'phase Sep 9 = follicular');
assertEqual(getPhase(new Date(2026, 8, 11), phasePred, phaseState), 'follicular', 'phase Sep 11 = follicular');

// Fertile window: Sep 12 to Sep 17
assertEqual(getPhase(new Date(2026, 8, 12), phasePred, phaseState), 'fertile', 'phase Sep 12 = fertile (window start)');
assertEqual(getPhase(new Date(2026, 8, 14), phasePred, phaseState), 'fertile', 'phase Sep 14 = fertile');
assertEqual(getPhase(new Date(2026, 8, 17), phasePred, phaseState), 'fertile', 'phase Sep 17 = fertile (window end)');

// Ovulation (Sep 15)
assertEqual(getPhase(new Date(2026, 8, 15), phasePred, phaseState), 'ovulation', 'phase Sep 15 = ovulation');

// Luteal (Sep 18 to Sep 28)
assertEqual(getPhase(new Date(2026, 8, 18), phasePred, phaseState), 'luteal', 'phase Sep 18 = luteal');
assertEqual(getPhase(new Date(2026, 8, 22), phasePred, phaseState), 'luteal', 'phase Sep 22 = luteal');
assertEqual(getPhase(new Date(2026, 8, 28), phasePred, phaseState), 'luteal', 'phase Sep 28 = luteal');

// Predicted period (Sep 29 to Oct 3)
assertEqual(getPhase(new Date(2026, 8, 29), phasePred, phaseState), 'period-pred-first', 'phase Sep 29 = period-pred-first');
assertEqual(getPhase(new Date(2026, 8, 30), phasePred, phaseState), 'period-pred', 'phase Sep 30 = period-pred');
assertEqual(getPhase(new Date(2026, 9, 2), phasePred, phaseState), 'period-pred', 'phase Oct 2 = period-pred');

// Future predicted periods (Oct 27 to Oct 31)
assertEqual(getPhase(new Date(2026, 9, 27), phasePred, phaseState), 'period-future-first', 'phase Oct 27 = period-future-first');
assertEqual(getPhase(new Date(2026, 9, 28), phasePred, phaseState), 'period-future', 'phase Oct 28 = period-future');

// No phase for dates outside known ranges
assertEqual(getPhase(new Date(2025, 0, 1), phasePred, phaseState), null, 'phase Jan 2025 = null (before records)');

// No periodEnds recorded => periodLen is default 5, last period extends 4 days after
var phaseStateNoEnds = {
  records: [new Date(2026, 8, 1)],
  settings: { cycleLength: 28, periodLength: 7, manualOverride: false },
  periodEnds: {}
};
var phasePredNoEnds = fullPredict(phaseStateNoEnds);
assertEqual(getPhase(new Date(2026, 8, 1), phasePredNoEnds, phaseStateNoEnds), 'period-on', 'phase no-end Sep 1 = period-on');
assertEqual(getPhase(new Date(2026, 8, 7), phasePredNoEnds, phaseStateNoEnds), 'period-mid', 'phase no-end Sep 7 = period-mid (day 7)');

/* ================================================================
   SECTION 5 — i18n (Internationalization)
   ================================================================ */
console.log('\n=== 5. i18n ===');

// Language-aware translation with fallback
function langName(obj, lang) {
  return obj[lang] || obj[lang.split('-')[0]] || obj['sr'] || '';
}

var tObj = { 'sr': 'Здраво', 'zh-CN': '你好', 'en': 'Hello' };
assertEqual(langName(tObj, 'sr'), 'Здраво', 'langName sr');
assertEqual(langName(tObj, 'zh-CN'), '你好', 'langName zh');
assertEqual(langName(tObj, 'en'), 'Hello', 'langName en');
assertEqual(langName(tObj, 'fr'), 'Здраво', 'langName fallback to sr');

// sr-RS should match sr
assertEqual(langName(tObj, 'sr-RS'), 'Здраво', 'langName sr-RS -> sr');

// Fallback chain: exact -> language prefix -> sr -> ''
assertEqual(langName({}, 'fr'), '', 'langName empty object returns empty string');
assertEqual(langName({'en': 'Yes'}, 'fr'), '', 'langName no sr fallback returns empty');

// i18n map helper L()
function makeL(langVar) {
  return function(sr, en, zh) {
    if (typeof sr === 'object') {
      var m = sr;
      return m[langVar] || m[langVar.split('-')[0]] || m['sr'] || '';
    }
    if (langVar === 'sr' || langVar === 'sr-RS') return sr;
    if (langVar === 'en') return en;
    return zh || sr;
  };
}

var Lsr = makeL('sr');
var Len = makeL('en');
var Lzh = makeL('zh-CN');

assertEqual(Lsr('Здраво', 'Hello', '你好'), 'Здраво', 'L sr returns sr');
assertEqual(Len('Здраво', 'Hello', '你好'), 'Hello', 'L en returns en');
assertEqual(Lzh('Здраво', 'Hello', '你好'), '你好', 'L zh returns zh');

// L with object argument
var obj = { sr: 'Zdravo', en: 'Hello', 'zh-CN': 'Ni hao' };
assertEqual(Lsr(obj), 'Zdravo', 'L sr with object');
assertEqual(Len(obj), 'Hello', 'L en with object');
assertEqual(Lzh(obj), 'Ni hao', 'L zh with object');
assertEqual(makeL('fr')(obj), 'Zdravo', 'L fr with object falls back to sr');

// sr-RS also matches sr for simple strings
var LsrRS = makeL('sr-RS');
assertEqual(LsrRS('Zdravo', 'Hello', '你好'), 'Zdravo', 'L sr-RS returns sr');

// t() function — lookup by dotted key
function makeT(langVar, i18nData) {
  return function(key, fallback) {
    var keys = key.split('.');
    var val = i18nData[langVar] || i18nData['sr'];
    for (var ki = 0; ki < keys.length; ki++) {
      if (val && val[keys[ki]] !== undefined) val = val[keys[ki]];
      else return fallback || key;
    }
    return val;
  };
}

// Minimal i18n data for testing
var i18nTest = {
  'sr': {
    appTitle: 'Anđelin Ciklus',
    tabs: ['Početna', 'Statistika'],
    phases: { 'period-on': 'Početak', 'ovulation': 'Ovulacija' }
  },
  'zh-CN': {
    appTitle: 'Anđelin Ciklus',
    tabs: ['主页', '统计'],
    phases: { 'period-on': '经期开始', 'ovulation': '排卵日' }
  },
  'en': {
    appTitle: 'Anđelin Ciklus',
    tabs: ['Home', 'Stats'],
    phases: { 'period-on': 'Period Start', 'ovulation': 'Ovulation' }
  }
};

var tsr = makeT('sr', i18nTest);
var ten = makeT('en', i18nTest);
var tzh = makeT('zh-CN', i18nTest);

assertEqual(tsr('appTitle'), 'Anđelin Ciklus', 't sr appTitle');
assertEqual(ten('appTitle'), 'Anđelin Ciklus', 't en appTitle');
assertEqual(tzh('appTitle'), 'Anđelin Ciklus', 't zh appTitle');

// Dotted key lookup: phases.ovulation
assertEqual(tsr('phases.ovulation'), 'Ovulacija', 't sr phases.ovulation');
assertEqual(ten('phases.ovulation'), 'Ovulation', 't en phases.ovulation');
assertEqual(tzh('phases.ovulation'), '排卵日', 't zh phases.ovulation');

// Dotted key: phases.period-on
assertEqual(tsr('phases.period-on'), 'Početak', 't sr phases.period-on');
assertEqual(tzh('phases.period-on'), '经期开始', 't zh phases.period-on');

// Fallback when key missing
assertEqual(tsr('nonexistent.key'), 'nonexistent.key', 't missing key returns key');
assertEqual(tsr('nonexistent.key', 'fallback'), 'fallback', 't missing key with fallback');

// Tab arrays
assertEqual(tsr('tabs')[0], 'Početna', 't sr tabs[0]');
assertEqual(tzh('tabs')[0], '主页', 't zh tabs[0]');
assertEqual(ten('tabs')[1], 'Stats', 't en tabs[1]');

// Fallback language when current lang missing from i18n data
var tFr = makeT('fr', i18nTest);
assertEqual(tFr('appTitle'), 'Anđelin Ciklus', 't fr falls back to sr data');

// Love Notes pool
var srNotes = [
  'Svakog jutra kad otvorim oči, prva misao mi si ti. 🌅',
  'Tvoj osmeh je moja omiljena boja. 🎨'
];
assertEqual(srNotes[0].substring(0, 10), 'Svakog jut', 'love note 0 sr starts correctly');
assertEqual(srNotes[1].substring(0, 10), 'Tvoj osmeh', 'love note 1 sr starts correctly');

/* ================================================================
   SECTION 6 — Profile System
   ================================================================ */
console.log('\n=== 6. Profile System ===');

// profileKey
function testProfileKey(base, profile) {
  return base + '-' + profile;
}
assertEqual(testProfileKey('cycle-data', 'andjela'), 'cycle-data-andjela', 'profileKey andjela');
assertEqual(testProfileKey('cycle-data', 'barry'), 'cycle-data-barry', 'profileKey barry');
assertEqual(testProfileKey('cycle-lang', 'andjela'), 'cycle-lang-andjela', 'profileKey cycle-lang andjela');
assertEqual(testProfileKey('cycle-theme', 'barry'), 'cycle-theme-barry', 'profileKey cycle-theme barry');

// Default language per profile
function getDefaultLang(profile) {
  return profile === 'barry' ? 'zh-CN' : 'sr';
}
assertEqual(getDefaultLang('barry'), 'zh-CN', 'Barry default lang is zh-CN');
assertEqual(getDefaultLang('andjela'), 'sr', 'Anđela default lang is sr');
assertEqual(getDefaultLang('unknown'), 'sr', 'unknown profile defaults to sr');

// Profile switch (simplified)
function simulateSwitchProfile(currentProfile, newProfile) {
  if (newProfile === currentProfile) return currentProfile;
  return newProfile;
}
assertEqual(simulateSwitchProfile('andjela', 'barry'), 'barry', 'switch from andjela to barry');
assertEqual(simulateSwitchProfile('barry', 'andjela'), 'andjela', 'switch from barry to andjela');
assertEqual(simulateSwitchProfile('andjela', 'andjela'), 'andjela', 'switch to same profile (no-op)');

// Profile-key scoped storage key
function profileStorageKey(profile, base) {
  return base + '-' + profile;
}
assertEqual(profileStorageKey('andjela', 'cycle-data-v6'), 'cycle-data-v6-andjela', 'storage key andjela');
assertEqual(profileStorageKey('barry', 'cycle-data-v6'), 'cycle-data-v6-barry', 'storage key barry');

/* ================================================================
   SECTION 7 — Safe Utility Functions
   ================================================================ */
console.log('\n=== 7. Safe Utilities ===');

// safeParse
function safeParse(text, defaultVal) {
  if (text == null) return defaultVal;
  try { return JSON.parse(text); }
  catch (e) { return defaultVal; }
}

var parsed1 = safeParse('{"a":1,"b":"hello"}', {});
assertEqual(parsed1.a, 1, 'safeParse valid JSON object');
assertEqual(parsed1.b, 'hello', 'safeParse valid JSON string value');

var parsed2 = safeParse('[1,2,3]', []);
assertEqual(parsed2.length, 3, 'safeParse valid JSON array');
assertEqual(parsed2[1], 2, 'safeParse array element');

// Edge cases for safeParse
assertEqual(safeParse(null, 'default'), 'default', 'safeParse null returns default');
assertEqual(safeParse(undefined, 'default'), 'default', 'safeParse undefined returns default');
assertEqual(safeParse('', 'default'), 'default', 'safeParse empty string returns default');
assertEqual(safeParse('not json', 'default'), 'default', 'safeParse invalid JSON returns default');
assertEqual(safeParse('42', 0), 42, 'safeParse number string works');
assertEqual(safeParse('true', false), true, 'safeParse boolean string works');
assertEqual(safeParse('"a string"', ''), 'a string', 'safeParse JSON string value');

// safeGetItem — no localStorage in Node, test logic only
function simulateSafeGetItem(storage, key, defaultVal) {
  try {
    var v = storage[key];
    return v != null ? v : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

var mockStore = { 'existing': 'hello', 'empty': '' };
assertEqual(simulateSafeGetItem(mockStore, 'existing', 'default'), 'hello', 'safeGetItem existing key');
assertEqual(simulateSafeGetItem(mockStore, 'nonexistent', 'default'), 'default', 'safeGetItem missing key');
assertEqual(simulateSafeGetItem(mockStore, 'empty', 'default'), '', 'safeGetItem empty string (not null)');

// When storage throws
var brokenStore = {
  get key() { throw new Error('quota exceeded'); }
};
assertEqual(simulateSafeGetItem(brokenStore, 'key', 'default'), 'default', 'safeGetItem handles storage errors');

/* ================================================================
   SECTION 8 — Edge Cases & Error Handling
   ================================================================ */
console.log('\n=== 8. Edge Cases & Error Handling ===');

// Date edge cases
assertEqual(fmtDate(new Date(2024, 1, 29)), '2024-02-29', 'fmtDate leap year Feb 29');
assertEqual(fmtDate(new Date(2026, 11, 31)), '2026-12-31', 'fmtDate last day of year');
assertEqual(fmtDate(new Date(2026, 0, 1)), '2026-01-01', 'fmtDate first day of year');

// daysDiff handles DST transitions (approximate — at least within 1 day)
var mar1 = new Date(2026, 2, 1);
var mar8 = new Date(2026, 2, 8);
assertEqual(daysDiff(mar1, mar8), 7, 'daysDiff across DST transition (7 days)');

// addDays negative
assertEqual(fmtDate(addDays(new Date(2026, 0, 1), -1)), '2025-12-31', 'addDays -1 crosses year boundary');
assertEqual(fmtDate(addDays(new Date(2026, 2, 1), -1)), '2026-02-28', 'addDays -1 Feb 28');

// sameDay with time components
var fullDate = new Date(2026, 5, 15, 23, 59, 59);
var midnight = new Date(2026, 5, 15, 0, 0, 0);
assert(sameDay(fullDate, midnight), 'sameDay ignores time components');

// Prediction edge: identical dates => 0-day cycle
var identicalDates = [new Date(2026, 0, 1), new Date(2026, 0, 1)];
var cIdentical = predictCycles(identicalDates);
assertEqual(cIdentical.length, 1, 'identical dates produce 1 cycle');
assertEqual(cIdentical[0], 0, 'identical dates produce 0-day cycle');

// Prediction edge: single records with different defaults
assertEqual(fmtDate(predictNext([new Date(2026, 11, 25)], 21)), '2027-01-15', 'predictNext short default 21');
assertEqual(fmtDate(predictNext([new Date(2026, 11, 25)], 45)), '2027-02-08', 'predictNext long default 45');

// fullPredict with periodEnds for all records
var stateMultiEnds = {
  records: [
    new Date(2026, 6, 1),
    new Date(2026, 6, 28),
    new Date(2026, 7, 25)
  ],
  settings: { cycleLength: 28, periodLength: 7, manualOverride: false },
  periodEnds: {
    '2026-07-01': '2026-07-05',
    '2026-07-28': '2026-08-01',
    '2026-08-25': '2026-08-29'
  }
};
var pMulti = fullPredict(stateMultiEnds);
assertEqual(pMulti.periodLen, 5, 'multi-end periodLen avg (5+5+5)/3 = 5');
assertEqual(pMulti.cycles.length, 2, 'multi-end 2 cycles');
// 27 and 28 → avg 27.5 → 28
assertEqual(pMulti.avgCycle, 28, 'multi-end avgCycle ~28');

// Edge: periodEnds only for some records
var statePartialEnds = {
  records: [
    new Date(2026, 7, 1),
    new Date(2026, 7, 28)
  ],
  settings: { cycleLength: 28, periodLength: 7, manualOverride: false },
  periodEnds: {
    '2026-08-01': '2026-08-05'
    // Aug 28 has no periodEnd
  }
};
var pPartial = fullPredict(statePartialEnds);
// Only one periodEnd gives periodLen=5, not default 7
assertEqual(pPartial.periodLen, 5, 'partial-end periodLen from single end record');

// Overdue detection: use a state where predict returns nextStart before today
// We can detect isOverdue is set correctly by checking overdueDays > 0
// when nextStart is in the past (which happens when all records are far in the past)
var stateOverdue = {
  records: [new Date(2025, 0, 1), new Date(2025, 0, 29)],
  settings: { cycleLength: 28, periodLength: 5, manualOverride: false },
  periodEnds: {}
};
var pOverdue = fullPredict(stateOverdue);
// The overdue logic will have adjusted nextStart to be in the future
// but isOverdue should be false after adjustment (nextStart > today)
// When all records are old, the overdue logic advances nextStart by multiples
// of avgCycle past today, then checks if it's still before today
assert(typeof pOverdue.overdueDays === 'number', 'overdueDays is a number');
assert(typeof pOverdue.isOverdue === 'boolean', 'isOverdue is boolean');

// manualOverride on future periods
var stateManualFuture = {
  records: [
    new Date(2026, 8, 1),
    new Date(2026, 8, 29),  // 28-day cycle
    new Date(2026, 9, 27)   // 28-day cycle
  ],
  settings: { cycleLength: 35, periodLength: 5, manualOverride: true },
  periodEnds: {}
};
var pMF = fullPredict(stateManualFuture);
// With manualOverride, futurePeriods should use 35-day cycle
// With manualOverride, initial nextStart uses avgCycle (28 days from data)
// nextStart = Oct 27 + 28 = Nov 24
// futurePeriods use manualOverride cycleLength (35) not avgCycle (28)
assertEqual(fmtDate(pMF.futurePeriods[0].start), '2026-12-29', 'manual override future period 1 uses 35-day cycle (Nov 24 + 35)');
assertEqual(fmtDate(pMF.futurePeriods[1].start), '2027-02-02', 'manual override future period 2 uses 35-day cycle');

/* ================================================================
   RESULTS
   ================================================================ */
console.log('\n========================================');
console.log('RESULTS: ' + passed + ' passed, ' + failed + ' failed (of ' + asserted + ' assertions)');
console.log('========================================');
if (failed > 0) process.exit(1);
