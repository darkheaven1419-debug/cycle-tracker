/**
 * Phase 2F §二 — the three-month forecast, asserted against the real engine.
 *
 * The requirement is narrow and easy to get subtly wrong, so this suite pins
 * each half of it separately:
 *
 *   - the **cycle baseline** is the median of the last 3 *start-to-start* gaps
 *     (not the mean, not every record, and never end-to-start);
 *   - the **duration** is the median of the last 4 `end - start + 1`;
 *   - a forecast needs **4 complete** records (start AND end); with fewer, the
 *     engine says so instead of padding from `settings.cycleLength`;
 *   - the window is **3 calendar months from today**, not 90 days, and periods
 *     past it are not emitted at all;
 *   - `predict()` is a pure computation: it writes nothing back to `state`,
 *     touches no storage, and leaves the real history byte-identical.
 *
 * Unlike tests/test-core.js — which re-implements the algorithm inside the test
 * and would therefore stay green through an engine regression — this suite loads
 * the shipped js/cycle-core.js into a vm and calls the real `predict()`. That is
 * also why it can assert exact dates rather than re-deriving them.
 *
 * `today()` is not injectable, so the sandbox gets a frozen `Date` subclass whose
 * zero-argument construction returns a fixed day. Without it none of the window
 * assertions would be deterministic.
 *
 * Run: node tests/test-phase2f-forecast.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const SRC = read('js/cycle-core.js');

/* The host Date, kept under its own name so the helpers below cannot be confused
   with the frozen Date the sandbox sees. */
const HostDate = Date;
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

/** Fixed "today", so the 3-calendar-month horizon is deterministic. */
function frozenDate(fixed) {
  const Real = Date;
  return class FrozenDate extends Real {
    constructor(...a) { if (a.length === 0) super(fixed.getTime()); else super(...a); }
    static now() { return fixed.getTime(); }
  };
}

/** Build a start-date chain from a start day and a list of start-to-start gaps. */
function chain(startISO, gaps) {
  const out = [startISO];
  let t = HostDate.UTC(+startISO.slice(0, 4), +startISO.slice(5, 7) - 1, +startISO.slice(8, 10));
  for (const g of gaps) {
    t += g * 86400000;
    out.push(new HostDate(t).toISOString().slice(0, 10));
  }
  return out;
}

/**
 * Run one scenario against the shipped engine.
 * `duration` (days, inclusive of both ends) fills periodEnds for every start;
 * `ends` overrides individual keys; `dropEnds` leaves a period unfinished.
 */
function run(opts) {
  const fixed = opts.today || new HostDate(2026, 8, 23);
  const writes = [];
  const starts = opts.records || [];
  const ends = {};
  if (opts.duration !== undefined) {
    for (const s of starts) {
      const d = new HostDate(s + 'T00:00:00');
      d.setDate(d.getDate() + opts.duration - 1);
      ends[s] = iso(d);
    }
  }
  Object.assign(ends, opts.ends || {});
  for (const k of opts.dropEnds || []) delete ends[k];

  const D = frozenDate(fixed);
  const sandbox = {
    Date: D,
    Math, JSON, console,
    state: {
      /* Built with the frozen Date only so nothing can read the wall clock. */
      records: starts.map((s) => new D(s + 'T00:00:00')),
      periodEnds: ends,
      settings: Object.assign({ cycleLength: 28, periodLength: 7, manualOverride: false }, opts.settings || {}),
    },
    /* A spy, not a store: any attempt to persist shows up as a write. */
    localStorage: {
      getItem: () => null,
      setItem: (k, v) => writes.push([k, v]),
      removeItem: (k) => writes.push([k, null]),
    },
  };
  const ctx = vm.createContext(sandbox);
  vm.runInContext(
    SRC + '\n;globalThis.__api={predict,getPhase,addDays,fmtDate,today,_addCalMonths,PRED_FORECAST_MONTHS};',
    ctx, { filename: 'cycle-core.js' }
  );
  const api = sandbox.__api;
  const before = JSON.stringify(sandbox.state);
  const pred = api.predict();
  const after = JSON.stringify(sandbox.state);
  return { api, pred, before, after, writes, state: sandbox.state };
}

const mean = (a) => Math.round(a.reduce((x, y) => x + y, 0) / a.length);

/* 4 complete records, 29-day gaps, 5-day periods, today = 2026-09-23. */
const F1 = {
  records: ['2026-06-01', '2026-06-30', '2026-07-29', '2026-08-27'],
  duration: 5,
  today: new HostDate(2026, 8, 23),
};

(async () => {
  /* ── F1 ① four complete records produce a real forecast ───────────────── */
  {
    const { pred, api } = run(F1);
    const f = pred.forecast;
    check('F1 four complete records flip the forecast on',
      f.reliable === true && f.reason === 'ok' && pred.completeCount === 4,
      `reliable=${f.reliable} reason=${f.reason} complete=${pred.completeCount}`);
    check('F1b baseline is the median start-to-start gap (29), duration the median end-start+1 (5)',
      pred.medianCycle === 29 && pred.medianPeriodLen === 5,
      `medianCycle=${pred.medianCycle} medianPeriodLen=${pred.medianPeriodLen}`);
    check('F1c the forecast lists 4 periods and every date is exact',
      JSON.stringify(f.periods.map((p) => [api.fmtDate(p.start), api.fmtDate(p.end)])) ===
      JSON.stringify([['2026-09-25', '2026-09-29'], ['2026-10-24', '2026-10-28'],
                      ['2026-11-22', '2026-11-26'], ['2026-12-21', '2026-12-25']]),
      f.periods.map((p) => api.fmtDate(p.start) + '–' + api.fmtDate(p.end)).join(' | '));
  }

  /* ── F2 ② the baseline uses the last 3 start-to-start gaps ────────────── */
  {
    /* Gaps oldest→newest: 45, 45, 10, 30, 50.
       Median of the LAST 3 = 30; median of all five = 40; mean of all five = 36.
       Only the 30 can come from "the last 3". */
    const starts = chain('2026-01-05', [45, 45, 10, 30, 50]);
    const { pred } = run({ records: starts, duration: 5, today: new HostDate(2026, 6, 10) });
    check('F2 the baseline is the median of the last 3 gaps, not all five and not the mean',
      pred.medianCycle === 30 && pred.medianCycle !== 40 && pred.medianCycle !== mean([45, 45, 10, 30, 50]),
      `medianCycle=${pred.medianCycle} allFiveMedian=40 allFiveMean=${mean([45, 45, 10, 30, 50])}`);
    check('F2b and it reports the sample count it used (capped at 3) against the gaps available (5)',
      pred.cycleSamples === 3 && pred.forecast.cycles === 5,
      `cycleSamples=${pred.cycleSamples} availableGaps=${pred.forecast.cycles}`);
  }

  /* ── F3 ③ duration uses the last 4 end-start+1 ────────────────────────── */
  {
    /* Six complete records. Durations oldest→newest 12,12,12,12,3,3.
       Median of the LAST 4 = median(12,12,3,3) = 8; median of all six = 12. */
    const starts = ['2026-01-05', '2026-02-04', '2026-03-06', '2026-04-05', '2026-05-05', '2026-06-04'];
    const durs = [12, 12, 12, 12, 3, 3];
    const ends = {};
    starts.forEach((s, i) => {
      const d = new HostDate(s + 'T00:00:00');
      d.setDate(d.getDate() + durs[i] - 1);
      ends[s] = iso(d);
    });
    const { pred } = run({ records: starts, ends, today: new HostDate(2026, 6, 10) });
    check('F3 duration is the median of the last 4 records, not of all six',
      pred.medianPeriodLen === 8 && pred.medianPeriodLen !== 12,
      `medianPeriodLen=${pred.medianPeriodLen} allSixMedian=12`);
    check('F3b and it reports the duration sample count (capped at 4) against the records available (6)',
      pred.durationSamples === 4 && pred.completeCount === 6,
      `durationSamples=${pred.durationSamples} completeCount=${pred.completeCount}`);
  }

  /* ── F4 ④ median, not mean ────────────────────────────────────────────── */
  {
    const starts = chain('2026-05-01', [28, 30, 60]);
    const { pred } = run({ records: starts, duration: 5, today: new HostDate(2026, 7, 10) });
    check('F4 one outlier long gap moves the mean but not the median',
      pred.medianCycle === 30 && pred.medianCycle !== mean([28, 30, 60]),
      `median=${pred.medianCycle} mean=${mean([28, 30, 60])}`);
  }

  /* ── F5 ⑤ the window is 3 CALENDAR months, not 90 days ────────────────── */
  {
    const { pred, api } = run(F1);
    const t = new HostDate(2026, 8, 23);
    const cal = api.fmtDate(api._addCalMonths(t, 3));
    const ninety = api.fmtDate(api.addDays(t, 90));
    check('F5 three calendar months from 2026-09-23 is 2026-12-23, while 90 days is 2026-12-22',
      cal === '2026-12-23' && ninety === '2026-12-22' && cal !== ninety,
      `calendarMonths=${cal} ninetyDays=${ninety}`);
    check('F5b the engine horizon is the calendar-month one',
      api.fmtDate(pred.forecast.horizonEnd) === '2026-12-23',
      `horizonEnd=${api.fmtDate(pred.forecast.horizonEnd)}`);
    check('F5c month-end is clamped, so 1/31 + 1 month is 2/28 and not 3/03',
      api.fmtDate(api._addCalMonths(new HostDate(2026, 0, 31), 1)) === '2026-02-28',
      api.fmtDate(api._addCalMonths(new HostDate(2026, 0, 31), 1)));
    check('F5d the window width is the single constant PRED_FORECAST_MONTHS = 3',
      api.PRED_FORECAST_MONTHS === 3, String(api.PRED_FORECAST_MONTHS));
  }

  /* ── F6 ⑥ anything past the window is not emitted at all ──────────────── */
  {
    const { pred, api } = run(F1);
    const hor = pred.forecast.horizonEnd;
    const starts = pred.forecast.periods.map((p) => p.start);
    const beyond = starts.filter((s) => s > hor);
    const afterLast = api.addDays(starts[starts.length - 1], pred.medianCycle);
    check('F6 no forecast period starts outside [today, horizon]',
      beyond.length === 0 && starts.every((s) => s >= api.today()),
      `periods=${starts.length} beyond=${beyond.length}`);
    check('F6b and the next period would fall outside it, so the list really stops at the window',
      afterLast > hor, `next would be ${api.fmtDate(afterLast)} > horizon ${api.fmtDate(hor)}`);
  }

  /* ── F7 ⑦ fewer than 4 complete records: no forecast, no padding ──────── */
  {
    const three = run({ records: ['2026-06-01', '2026-06-30', '2026-07-29'], duration: 5, today: new HostDate(2026, 8, 23) });
    check('F7 three complete records do not produce a forecast',
      three.pred.forecast.reliable === false && three.pred.forecast.reason === 'need-complete' &&
      three.pred.forecast.periods.length === 0 && three.pred.futurePeriods.length === 0,
      `reliable=${three.pred.forecast.reliable} reason=${three.pred.forecast.reason} periods=${three.pred.forecast.periods.length}`);

    const none = run({ records: [], today: new HostDate(2026, 8, 23) });
    check('F7b zero records: no forecast, and the period length falls back to settings',
      none.pred.forecast.reliable === false && none.pred.forecast.periods.length === 0 &&
      none.pred.medianPeriodLen === 7,
      `reliable=${none.pred.forecast.reliable} medianPeriodLen=${none.pred.medianPeriodLen}`);

    const openOne = run({
      records: ['2026-06-01', '2026-06-30', '2026-07-29', '2026-08-27'],
      duration: 5, dropEnds: ['2026-08-27'], today: new HostDate(2026, 8, 23),
    });
    check('F7c an unfinished period does not count toward the four',
      openOne.pred.completeCount === 3 && openOne.pred.forecast.reliable === false,
      `completeCount=${openOne.pred.completeCount} reliable=${openOne.pred.forecast.reliable}`);

    const two = run({ records: ['2026-06-01', '2026-06-30'], duration: 5, today: new HostDate(2026, 8, 23) });
    check('F7d with two records the baseline is the real gap, never the 28-day default',
      two.pred.medianCycle === 29 && two.pred.medianCycle !== 28,
      `medianCycle=${two.pred.medianCycle}`);
  }

  /* ── F8 ⑧ start-to-end is never mistaken for a cycle ─────────────────── */
  {
    const { pred } = run(F1);
    /* The wrong reading — next start minus the previous end — would be 25. */
    const wrong = Math.round((pred.nextStart - new HostDate('2026-08-31T00:00:00')) / 86400000);
    check('F8 the cycle baseline is start-to-start (29), not end-to-start',
      pred.medianCycle === 29 && pred.medianCycle !== wrong,
      `medianCycle=${pred.medianCycle} endToStartWouldBe=${wrong}`);
    check('F8b duration stays a separate axis from the cycle length',
      pred.medianPeriodLen === 5 && pred.medianPeriodLen !== pred.medianCycle,
      `periodLen=${pred.medianPeriodLen} cycle=${pred.medianCycle}`);
    check('F8c the 28-day settings default is not the baseline while the data is sufficient',
      pred.medianCycle !== 28, `medianCycle=${pred.medianCycle}`);
  }

  /* ── F9 ⑧ + ⑨ predict() is pure: no writes, history byte-identical ───── */
  {
    const { pred, before, after, writes, state } = run(F1);
    check('F9 the recorded history is byte-identical after predict()',
      before === after, before === after ? 'unchanged' : 'state mutated');
    check('F9b predict() touches no storage at all',
      writes.length === 0, `writes=${writes.length}`);
    check('F9c no forecast field is grafted onto state',
      !('forecast' in state) && !('futurePeriods' in state) && !('nextStart' in state),
      Object.keys(state).join(','));
    check('F9d periodEnds keys are exactly the ones that went in',
      JSON.stringify(Object.keys(state.periodEnds).sort()) ===
      JSON.stringify(['2026-06-01', '2026-06-30', '2026-07-29', '2026-08-27']),
      Object.keys(state.periodEnds).join(','));
    check('F9e the emitted period dates are derived, not references into history',
      pred.forecast.periods.every((p) => p.start instanceof Date && p.end instanceof Date &&
        !state.records.some((r) => r.getTime() === p.start.getTime())),
      `${pred.forecast.periods.length} periods`);
  }

  /* ── F10 manualOverride replaces only the spacing ─────────────────────── */
  {
    const { pred } = run(Object.assign({}, F1, { settings: { manualOverride: true, cycleLength: 30 } }));
    const gaps = [];
    for (let i = 1; i < pred.futurePeriods.length; i++) {
      gaps.push(Math.round((pred.futurePeriods[i].start - pred.futurePeriods[i - 1].start) / 86400000));
    }
    check('F10 manualOverride spaces the periods by the user-set length, not the median',
      gaps.length >= 2 && gaps.every((g) => g === 30),
      `gaps=${gaps.join(',')} dataMedianStill=${pred.medianCycle}`);
  }

  /* ── F11 thin data must not regress nextStart / ovulation / fertile ───── */
  {
    const { pred, api } = run({ records: ['2026-06-01', '2026-06-30'], duration: 5, today: new HostDate(2026, 8, 23) });
    check('F11 nextStart still exists when the forecast does (it is "next period", not a forecast)',
      pred.nextStart !== null && api.fmtDate(pred.nextStart) === '2026-09-25',
      `nextStart=${api.fmtDate(pred.nextStart)}`);
    check('F11b ovulation and the fertile window stay ungated',
      pred.ovulation !== null && pred.fertileStart !== null && pred.fertileEnd !== null,
      `ov=${api.fmtDate(pred.ovulation)}`);
    const g = run(F1);
    /* 2026-10-25 sits in the SECOND forecast period (10-24..10-28), i.e. past
       nextStart, which is what makes it 'period-future' rather than
       'period-pred'. 2027-01-17 is past the horizon and must be unmarked. */
    check('F11c getPhase() covers the forecast days and leaves post-horizon dates unmarked',
      g.api.getPhase(new HostDate(2026, 9, 25), g.pred) === 'period-future' &&
      g.api.getPhase(new HostDate(2027, 0, 17), g.pred) === null,
      `2026-10-25=${g.api.getPhase(new HostDate(2026, 9, 25), g.pred)} 2027-01-17=${g.api.getPhase(new HostDate(2027, 0, 17), g.pred)}`);
  }

  /* ── F12 the display layer matches the engine's shape ────────────────── */
  {
    const panel = read('js/fix-panel.js');
    const css = read('css/calendar.css');
    const html = read('index.html');

    check('F12 the stats panel has a container for the three-month block',
      /id="predForecast3mo"/.test(html) && /getElementById\('predForecast3mo'\)/.test(panel),
      'anchor present in both index.html and fix-panel.js');
    check('F12b the panel reads forecast.reliable and forecast.periods',
      /pred\.forecast \|\|/.test(panel) && /f\.reliable/.test(panel) && /f\.periods/.test(panel),
      'reads the engine shape');
    check('F12c an empty futurePeriods list renders -- instead of a blank cell',
      /pred\.futurePeriods\.length > 0[\s\S]{0,240}else \{ setEl\('predChipFuture', '--'\)/.test(panel),
      'empty branch present');
    check('F12d the guidance copy exists in all three languages',
      ['再记录几次，预测会更有参考价值', 'Log a few more periods', 'Zabele'].every((s) => panel.indexOf(s) !== -1) &&
      panel.indexOf("'zh-CN'") !== -1 && panel.indexOf("'en'") !== -1 && panel.indexOf("'sr'") !== -1,
      'zh-CN / en / sr present');
    check('F12e the heading copy exists in all three languages',
      panel.indexOf('接下来三个月') !== -1 && panel.indexOf('Next three months') !== -1 &&
      panel.indexOf('Slede') !== -1,
      'three headings present');
    /* Only the .pred3mo* rule bodies — a fixed-length slice would run on into
       .timeline-header / .timeline-row and report their declarations as ours. */
    const rules = css.match(/\.pred3mo[^{]*\{[^}]*\}/g) || [];
    const block = rules.join('\n');
    check('F12f the block is fluid: no fixed pixel width, so 320/768/1440 all fit',
      rules.length >= 5 && !/(?:^|[^-])width\s*:\s*\d+px/m.test(block),
      `${rules.length} .pred3mo rules, no fixed pixel width`);
    check('F12g the block is theme-safe: every colour is a token, no literal hex',
      rules.length >= 5 && !/#[0-9a-fA-F]{3,6}\b/.test(block) && /var\(--/.test(block),
      `${rules.length} .pred3mo rules, token colours only`);
    check('F12h [hidden] is guarded, so the empty container cannot leave a gap in the card',
      /\.pred3mo\[hidden\]\s*\{[^}]*display\s*:\s*none/.test(css),
      'hidden guard present');
  }

  /* ── F13 ⑬ the window is anchored on TODAY, not on the last period ───── */
  {
    /* Last start 2026-05-25, today 2026-09-23: months apart. Anchoring the
       window on that stale start would end it 2026-08-25 — already in the past,
       emitting nothing. Anchored on today it runs to 2026-12-23. */
    const early = run({
      records: ['2026-03-02', '2026-03-30', '2026-04-27', '2026-05-25'],
      duration: 5, today: new HostDate(2026, 8, 23),
    });
    const f = early.pred.forecast;
    const todayISO = early.api.fmtDate(early.api.today());
    const starts = f.periods.map((p) => p.start);
    const fromLastStart = early.api._addCalMonths(early.pred.lastStart, 3);

    check('F13 horizonStart is today and horizonEnd is today + 3 calendar months',
      early.api.fmtDate(f.horizonStart) === '2026-09-23' &&
      early.api.fmtDate(f.horizonEnd) === '2026-12-23',
      `${early.api.fmtDate(f.horizonStart)} -> ${early.api.fmtDate(f.horizonEnd)}`);

    check('F13b a stale last period does not end the window early',
      early.api.fmtDate(fromLastStart) === '2026-08-25' && f.horizonEnd > fromLastStart &&
      starts.some((s) => s > fromLastStart),
      `lastStart+3mo=${early.api.fmtDate(fromLastStart)} horizonEnd=${early.api.fmtDate(f.horizonEnd)} periods=${starts.length}`);

    check('F13c every emitted period starts on or after today',
      starts.length > 0 && starts.every((s) => early.api.fmtDate(s) >= todayISO),
      `${starts.length} periods, first=${early.api.fmtDate(starts[0])}`);

    /* The data really is stale, so the lower bound had work to do: one cycle
       from the last start lands in the past and must not be emitted. */
    const naive = early.api.addDays(early.pred.lastStart, early.pred.medianCycle);
    check('F13d the unrolled first candidate was in the past, so the bound genuinely filtered',
      early.api.fmtDate(naive) < todayISO,
      `lastStart+medianCycle=${early.api.fmtDate(naive)} < today=${todayISO}`);
  }

  /* ── F14 ⑭ the far bound is inclusive ────────────────────────────────── */
  {
    /* 30-day spacing from 2026-09-24 lands exactly on 2026-12-23, which IS
       today + 3 calendar months. It has to be shown: the rule is
       `start <= horizonEnd`, not `<`. */
    const edge = run({
      records: ['2026-05-27', '2026-06-26', '2026-07-26', '2026-08-25'],
      duration: 5, today: new HostDate(2026, 8, 23),
    });
    const f = edge.pred.forecast;
    const starts = f.periods.map((p) => p.start);
    const last = starts[starts.length - 1];
    const next = edge.api.addDays(last, edge.pred.medianCycle);
    const onBoundary = starts.filter((s) => s.getTime() === f.horizonEnd.getTime());

    check('F14 a period starting exactly on horizonEnd is shown',
      edge.api.fmtDate(f.horizonEnd) === '2026-12-23' && edge.api.fmtDate(last) === '2026-12-23' &&
      onBoundary.length === 1,
      `last=${edge.api.fmtDate(last)} horizonEnd=${edge.api.fmtDate(f.horizonEnd)} onBoundary=${onBoundary.length}`);

    check('F14b nothing past horizonEnd is shown, and one more step really would be past it',
      starts.every((s) => s <= f.horizonEnd) && next > f.horizonEnd,
      `next would be ${edge.api.fmtDate(next)} > horizonEnd ${edge.api.fmtDate(f.horizonEnd)}`);

    check('F14c the far bound is inclusive (<=), not exclusive (<)',
      starts.length === 4 && edge.api.fmtDate(starts[0]) === '2026-09-24',
      `${starts.length} periods: ${starts.map((s) => edge.api.fmtDate(s)).join(', ')}`);
  }

  /* ── F15 ⑮ shifting the window is still a pure computation ───────────── */
  {
    const stale = run({
      records: ['2026-03-02', '2026-03-30', '2026-04-27', '2026-05-25'],
      duration: 5, today: new HostDate(2026, 8, 23),
    });

    check('F15 the real history is byte-identical after predicting a stale-data window',
      stale.before === stale.after, stale.before === stale.after ? 'unchanged' : 'state mutated');
    check('F15b predicting writes nothing to storage',
      stale.writes.length === 0, `writes=${stale.writes.length}`);
    check('F15c horizonStart/horizonEnd live on the returned forecast, never on state',
      !('forecast' in stale.state) && !('horizonStart' in stale.state) && !('horizonEnd' in stale.state) &&
      stale.pred.forecast.horizonStart instanceof Date &&
      stale.pred.forecast.horizonEnd instanceof Date,
      Object.keys(stale.state).join(','));
    check('F15d the emitted dates are derived, not references into the history',
      stale.pred.forecast.periods.length > 0 &&
      stale.pred.forecast.periods.every((p) =>
        !stale.state.records.some((r) => r.getTime() === p.start.getTime())),
      `${stale.pred.forecast.periods.length} periods`);
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
