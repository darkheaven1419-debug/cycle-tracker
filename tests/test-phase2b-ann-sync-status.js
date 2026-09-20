/**
 * Phase 2B.5 — the anniversary sync status panel is a read-only diagnostic.
 *
 * Why this exists: the conflict flag (shared-ann-conflict) could previously only
 * be seen by opening devtools and reading localStorage, which meant neither the
 * code nor Barry/Anđela could answer "is there a real conflict on the live
 * devices". js/module-settings.js now renders it in Settings.
 *
 * The panel is loaded in a vm with a fake DOM, exactly as
 * tests/test-phase2b-settings.js does, so the real functions run.
 *
 * The load-bearing assertion is not any single status letter — it is the one at
 * the very bottom: across EVERY scenario in this file, the module must not have
 * written a single storage key. A diagnostic that "helpfully" resolved a conflict
 * by adopting one side would pass every status check here and fail that one.
 * That is the failure mode §2.3 forbids, and it is why `writes` is global.
 *
 * Run: node tests/test-phase2b-ann-sync-status.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'js', 'module-settings.js');
const SRC = fs.readFileSync(FILE, 'utf8');

// Synthetic credential. Guards nothing; its only job is to be searched for.
const SECRET = 'test-app-key-annsync-000000000000000000';
const SECRET_PREFIX = SECRET.slice(0, 4);

const MET = '2026-03-19';
const LOVE = '2026-05-07';
// A different met, used only to create a *date difference* with no flag.
const MET_OTHER = '2026-04-01';

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

/* Every setItem / removeItem the module performs, across the whole suite. */
const writes = [];
/* Every fetch it issues, across the whole suite. */
const fetches = [];

function makeEl(id) {
  return {
    id, value: '', textContent: '', placeholder: '', disabled: false,
    innerHTML: '', className: '', open: false,
    style: {}, attrs: {},
    setAttribute(k, v) { this.attrs[k] = v; },
    getAttribute(k) { return this.attrs[k]; },
  };
}

/**
 * Loads module-settings.js with a fresh DOM and storage.
 * opts.withGetAnnDates === false omits app.js's accessor, to exercise the
 * ANN_DEFAULT_* fallback. opts.withDefaults === false removes those too.
 */
function load(seed, opts) {
  opts = opts || {};
  const els = new Map();
  const store = new Map(Object.entries(seed || {}));
  const logs = [];

  const document = {
    getElementById(id) {
      if (!els.has(id)) els.set(id, makeEl(id));
      return els.get(id);
    },
  };

  const sandbox = {
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => { writes.push('set ' + k); store.set(k, String(v)); },
      removeItem: (k) => { writes.push('remove ' + k); store.delete(k); },
    },
    document,
    window: {},
    console: {
      log: (m) => logs.push('log ' + m),
      warn: (m) => logs.push('warn ' + m),
      error: (m) => logs.push('error ' + m),
    },
    fetch: (url) => {
      fetches.push(String(url));
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    },
    toast: () => {},
    confirm: () => true,
    setTimeout: () => 0,
    clearTimeout: () => {},
    state: { settings: { cycleLength: 28, periodLength: 7 } },
    lang: opts.lang || 'sr',
    theme: 'light',
  };

  // app.js owns the defaults; its two consts are reachable by bare name in a
  // classic script, which is how js/sync.js reads them too.
  if (opts.withDefaults !== false) {
    sandbox.ANN_DEFAULT_MET = MET;
    sandbox.ANN_DEFAULT_LOVE = LOVE;
  }
  if (opts.withGetAnnDates !== false) {
    sandbox.getAnnDates = () => ({
      met: sandbox.localStorage.getItem('cycle-ann-met') || sandbox.ANN_DEFAULT_MET,
      love: sandbox.localStorage.getItem('cycle-ann-love') || sandbox.ANN_DEFAULT_LOVE,
    });
  }

  const ctx = vm.createContext(sandbox);
  vm.runInContext(SRC, ctx, { filename: 'module-settings.js' });

  return {
    els, store, logs, sandbox,
    W: sandbox.window,
    /** Render into the fake DOM and return the three surfaces. */
    render() {
      sandbox.window.renderAnnSyncStatus();
      return {
        panel: els.get('annSyncPanel'),
        name: els.get('annSyncName'),
        pill: els.get('annSyncPill'),
        body: els.get('annSyncBody'),
        html: els.get('annSyncBody') ? els.get('annSyncBody').innerHTML : '',
      };
    },
    diag: () => sandbox.window.annSyncDiagnostics(),
    emitted: () => logs.join('\n'),
  };
}

const REMOTE_SAME = JSON.stringify({ met: MET, love: LOVE });

(async () => {
  // ── S1. the default-date path ─────────────────────────────────────────────
  {
    const h = load({ 'shared-ann-remote': REMOTE_SAME });
    const d = h.diag();
    check('S1 with no local override the panel reports the real dates, not blanks',
      d.localMet === MET && d.localLove === LOVE, `met=${d.localMet} love=${d.localLove}`);
    const r = h.render();
    check('S1b and both of them are on screen',
      r.html.indexOf(MET) !== -1 && r.html.indexOf(LOVE) !== -1,
      `met=${r.html.indexOf(MET) !== -1} love=${r.html.indexOf(LOVE) !== -1}`);
  }

  // ── S1c. the defaults are still found without app.js's accessor ───────────
  {
    const h = load({}, { withGetAnnDates: false });
    const d = h.diag();
    check('S1c the ANN_DEFAULT_* fallback resolves the same two dates',
      d.localMet === MET && d.localLove === LOVE, `met=${d.localMet} love=${d.localLove}`);
  }

  // ── S1d. no defaults reachable at all: says so, does not invent a date ────
  {
    const h = load({}, { withGetAnnDates: false, withDefaults: false });
    const d = h.diag();
    const r = h.render();
    check('S1d with neither source available it reports unread rather than a date',
      d.localMet === null && d.localLove === null && r.html.indexOf('nije pročitano') !== -1,
      `met=${d.localMet} love=${d.localLove}`);
  }

  // ── S2. no conflict ───────────────────────────────────────────────────────
  {
    const h = load({ 'shared-ann-remote': REMOTE_SAME });
    const d = h.diag();
    const r = h.render();
    check('S2 with no flags it concludes A (no conflict found)',
      d.status === 'A' && r.pill.className.indexOf('ann-sync-pill-a') !== -1,
      `status=${d.status} class=${r.pill.className}`);
    check('S2b a normal reading does not force the panel open',
      r.panel.open !== true && r.panel.attrs['data-ann-status'] === 'A',
      `open=${r.panel.open} attr=${r.panel.attrs['data-ann-status']}`);
  }

  // ── S2c. remote readable but empty is A, not D ────────────────────────────
  {
    const h = load({ 'shared-ann-remote': JSON.stringify('none') });
    const d = h.diag();
    const r = h.render();
    check('S2c a confirmed-empty server is A and reads "none", not "unread"',
      d.remote === 'none' && d.status === 'A' && r.html.indexOf('nema') !== -1,
      `remote=${JSON.stringify(d.remote)} status=${d.status}`);
  }

  // ── S3. a conflict ────────────────────────────────────────────────────────
  {
    const conflict = { reason: 'pending-vs-remote', local: { met: MET, love: LOVE }, remote: { met: MET_OTHER, love: LOVE } };
    const h = load({
      'shared-ann-conflict': JSON.stringify(conflict),
      'shared-ann-remote': JSON.stringify(conflict.remote),
    });
    const d = h.diag();
    const r = h.render();
    check('S3 a conflict flag yields B (needs confirmation)',
      d.status === 'B' && r.pill.className.indexOf('ann-sync-pill-b') !== -1,
      `status=${d.status} class=${r.pill.className}`);
    check('S3b B is the only status that opens the panel by itself',
      r.panel.open === true, `open=${r.panel.open}`);
    check('S3c the conflict chip is marked, and says yes',
      r.html.indexOf('ann-sync-chip-alert') !== -1 && /Oznaka sukoba: <b>da<\/b>/.test(r.html),
      'chip alert + da');
  }

  // ── S3d. THE read-only guarantee, on the exact scenario that tempts a fix ──
  //
  // local and remote disagree AND a conflict is on record. The one thing the
  // panel must not do is decide. Asserted on storage, not on wording: the flag
  // is still there, and no canonical was written to break the tie.
  {
    const conflict = { reason: 'pending-vs-remote', local: { met: MET, love: LOVE }, remote: { met: MET_OTHER, love: LOVE } };
    const seed = {
      'shared-ann-conflict': JSON.stringify(conflict),
      'shared-ann-remote': JSON.stringify(conflict.remote),
    };
    const h = load(seed);
    const before = JSON.stringify([...h.store.entries()].sort());
    h.render();
    h.render();
    const after = JSON.stringify([...h.store.entries()].sort());
    check('S3d rendering a conflict twice leaves storage byte-identical',
      before === after, before === after ? 'unchanged' : `before=${before} after=${after}`);
    check('S3e the conflict flag survives — the panel never clears it',
      h.store.get('shared-ann-conflict') === JSON.stringify(conflict),
      `present=${h.store.has('shared-ann-conflict')}`);
    check('S3f no canonical is written to break the tie',
      !h.store.has('shared-anniversaries') && !h.store.has('cycle-ann-met') && !h.store.has('cycle-ann-love'),
      `canon=${h.store.has('shared-anniversaries')} met=${h.store.has('cycle-ann-met')}`);
  }

  // ── S4. pending ───────────────────────────────────────────────────────────
  {
    const h = load({ 'shared-ann-pending': '1', 'shared-ann-remote': REMOTE_SAME });
    const d = h.diag();
    const r = h.render();
    check('S4 an unsent local edit yields C',
      d.status === 'C' && r.pill.className.indexOf('ann-sync-pill-c') !== -1,
      `status=${d.status}`);
    check('S4b and the pending flag is left exactly as it was',
      h.store.get('shared-ann-pending') === '1', `pending=${h.store.get('shared-ann-pending')}`);
    check('S4c C does not force the panel open — only a real conflict does',
      r.panel.open !== true, `open=${r.panel.open}`);
  }

  // ── S4d. priority: an unsent edit outranks an unreadable server ───────────
  {
    const h = load({ 'shared-ann-pending': '1' });
    const d = h.diag();
    check('S4d pending + unreadable server reports C, the actionable state',
      d.status === 'C' && d.remote === null, `status=${d.status} remote=${JSON.stringify(d.remote)}`);
  }

  // ── S4e. priority: a conflict outranks pending ────────────────────────────
  {
    const h = load({
      'shared-ann-pending': '1',
      'shared-ann-conflict': JSON.stringify({ reason: 'divergent-first-init', local: { met: MET }, remote: { met: MET_OTHER } }),
    });
    check('S4e a conflict outranks pending and unreadable', h.diag().status === 'B', `status=${h.diag().status}`);
  }

  // ── S5. remote unavailable ────────────────────────────────────────────────
  {
    const h = load({});
    const d = h.diag();
    const r = h.render();
    check('S5 never having read the server yields D',
      d.status === 'D' && d.remote === null && r.pill.className.indexOf('ann-sync-pill-d') !== -1,
      `status=${d.status} remote=${JSON.stringify(d.remote)}`);
    check('S5b D says the server value was not read, without asserting it is empty',
      r.html.indexOf('nije pročitano') !== -1, 'unread wording');
  }

  // ── S6. a date difference alone is NOT a conflict ─────────────────────────
  //
  // This is the rule §2.3 turns on. local canonical and the last observed remote
  // differ, and no flag is on record. The system must not conclude anything from
  // that — reporting B here would be the panel picking a side by implication.
  {
    const h = load({
      'shared-anniversaries': JSON.stringify({ met: MET_OTHER, love: LOVE }),
      'shared-ann-remote': REMOTE_SAME,
    });
    const d = h.diag();
    const r = h.render();
    check('S6 two different dates with no flag is still A, never B',
      d.status === 'A', `status=${d.status}`);
    check('S6b and no conflict chip is raised on the strength of the difference',
      r.html.indexOf('ann-sync-chip-alert') === -1, 'no alert chip');
    check('S6c both values are still shown, so a human can see the difference',
      r.html.indexOf(MET_OTHER) !== -1 && r.html.indexOf(MET) !== -1,
      `local=${r.html.indexOf(MET_OTHER) !== -1} remote=${r.html.indexOf(MET) !== -1}`);
  }

  // ── S7. credentials and network ───────────────────────────────────────────
  {
    const h = load({ 'ct-app-key': SECRET, 'shared-ann-remote': REMOTE_SAME });
    const before = fetches.length;
    const r = h.render();
    h.diag();
    const all = h.emitted() + r.html + r.pill.textContent + r.name.textContent;
    check('S7 the App Secret never reaches the panel, a log or a toast',
      all.indexOf(SECRET) === -1 && all.indexOf(SECRET_PREFIX) === -1,
      `secret=${all.indexOf(SECRET) !== -1} prefix=${all.indexOf(SECRET_PREFIX) !== -1}`);
    check('S7b the panel issues no request of its own',
      fetches.length === before, `fetches=${fetches.length - before}`);
  }

  // ── S8. all four conclusions are translated ───────────────────────────────
  {
    const seen = {};
    [['sr', {}], ['zh-CN', {}], ['en', {}]].forEach(([lg]) => {
      const h = load({ 'shared-ann-remote': REMOTE_SAME }, { lang: lg });
      h.render();
      seen[lg] = h.els.get('annSyncName').textContent + '|' + h.els.get('annSyncPill').textContent;
    });
    check('S8 the panel is translated, not hardcoded Serbian',
      seen.sr.indexOf('Sinhronizacija') === 0 && seen['zh-CN'].indexOf('纪念日') === 0 && seen.en.indexOf('Anniversary') === 0,
      Object.keys(seen).map((k) => k + '=' + seen[k]).join(' '));
  }

  // ── S9. the wiring: opening Settings is enough ───────────────────────────
  //
  // app.js calls loadSettingsUI() on tab activation, so the panel must be
  // refreshed from there — otherwise the user would need a manual refresh step,
  // which is the devtools chore this phase exists to remove.
  {
    const h = load({ 'shared-ann-remote': REMOTE_SAME });
    h.W.loadSettingsUI();
    check('S9 loadSettingsUI() renders the panel (Settings open is the refresh)',
      h.els.get('annSyncBody').innerHTML.length > 0 &&
      h.els.get('annSyncName').textContent.length > 0,
      `bodyLen=${h.els.get('annSyncBody').innerHTML.length}`);
  }

  // ── S10. diagnostics is a pure snapshot ───────────────────────────────────
  {
    const h = load({ 'shared-ann-remote': REMOTE_SAME, 'shared-ann-pending': '1' });
    check('S10 annSyncDiagnostics() is pure — two calls agree',
      JSON.stringify(h.diag()) === JSON.stringify(h.diag()), 'stable');
  }

  // ── S11. static guards ────────────────────────────────────────────────────
  {
    const start = SRC.indexOf('// ── Phase 2B.5');
    const end = SRC.indexOf('window.renderAnnSyncStatus = renderAnnSyncStatus;');
    const region = (start !== -1 && end > start) ? SRC.slice(start, end) : '';
    check('S11 the diagnostic region was located', region.length > 500, `len=${region.length}`);
    check('S11b it contains no write to storage at all',
      !/setItem|removeItem/.test(region),
      `setItem=${/setItem/.test(region)} removeItem=${/removeItem/.test(region)}`);
    check('S11c it issues no fetch and reads no credential key',
      !/fetch\s*\(/.test(region) && !/ct-app-key|gh-token|Authorization|Bearer/.test(region),
      'no fetch, no credential');
    /* §2.6 vocabulary: the statuses are about sync state, never about earned
       progress. */
    check('S11d no scoring vocabulary entered the panel',
      !/\b(score|level|streak|rank|points|badge)\b/i.test(region), 'no scoring vocabulary');
    check('S11e the resolution side of the protocol is not reachable from here',
      !/resolveAnniversaries|setAnniversaryCanonical/.test(region),
      'no resolve / setCanonical');
  }

  // ── The one that matters most ─────────────────────────────────────────────
  //
  // Every scenario above ran with the same instrumentation. If the panel (or
  // anything it calls) had written a key — clearing the flag, adopting a side,
  // normalising a date — it would show up here, however green the rest looked.
  check('S12 across every scenario the module never wrote a single storage key',
    writes.length === 0, writes.length ? writes.join(', ') : 'writes=0');

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
