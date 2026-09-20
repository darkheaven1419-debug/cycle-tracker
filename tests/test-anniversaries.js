/**
 * Phase 1.9 §2 —— the two anniversary dates are a shared, canonical fact.
 *
 * 相识 X 天 and 相恋 X 天 are statements about two real people. If the two
 * devices disagree about the dates, one of them is lying about a real
 * relationship, and nothing on screen reveals which. So the dates are treated
 * differently from every other synced value in this app:
 *
 *   - there is exactly ONE canonical copy, in shared state, and adoption is the
 *     only way it spreads;
 *   - "last writer wins" is forbidden, and so is any timestamp comparison — a
 *     clock is not evidence about when two people met;
 *   - when the evidence is genuinely ambiguous (a local value that is neither
 *     the shipped default nor an established canonical), the code STOPS and
 *     records the conflict instead of choosing for Barry or Anđela;
 *   - the only thing that may move an established canonical is a human editing
 *     the two date inputs in Settings, whose onchange is the single signal that
 *     "I am deliberately changing the shared anniversary";
 *   - an old shared state that predates the field must keep working untouched.
 *
 * The suite below drives js/sync.js in a vm with a scripted localStorage, so
 * each branch is forced deterministically rather than raced. app.js's default
 * constants are read out of the real file and injected, so the tests exercise
 * the shipped values rather than copies of them.
 *
 * Run: node tests/test-anniversaries.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SYNC_SRC = fs.readFileSync(path.join(ROOT, 'js/sync.js'), 'utf8');
const APP_SRC = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
const HTML_SRC = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// The shipped defaults, read from their single source of truth (app.js:69-70).
const MET_RE = /const ANN_DEFAULT_MET = '(\d{4}-\d{2}-\d{2})'/;
const LOVE_RE = /const ANN_DEFAULT_LOVE = '(\d{4}-\d{2}-\d{2})'/;
const REAL_MET = (MET_RE.exec(APP_SRC) || [])[1];
const REAL_LOVE = (LOVE_RE.exec(APP_SRC) || [])[1];

// Synthetic, non-default dates for the branches that must NOT pick a winner.
const LOCAL_MET = '2025-01-02';
const LOCAL_LOVE = '2025-03-04';
const PEER_MET = '2024-11-11';
const PEER_LOVE = '2024-12-12';
const SAVED_MET = '2025-06-07';
const SAVED_LOVE = '2025-08-09';

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

/** Comments carry Chinese prose that mentions 时间戳 / 时间 by way of explaining
 *  why they are NOT used, so the static scans below run on code only. Whole-line
 *  `//` comments are stripped rather than trailing ones because the file carries
 *  `//` inside URLs. */
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

/**
 * One vm "device". opts.noDefaults omits app.js's constants from the global
 * scope, which is the state of the world before app.js has executed (or when it
 * failed to) — the branch where sync.js must refuse to guess.
 */
function device(opts) {
  opts = opts || {};
  const store = new Map();
  const logs = [];
  let refreshed = 0;

  const sandbox = {
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => { store.set(k, String(v)); },
      removeItem: (k) => { store.delete(k); },
    },
    document: { getElementById: () => null, addEventListener: () => {}, removeEventListener: () => {} },
    window: {},
    console: {
      log: (m) => logs.push(String(m)),
      warn: (m) => logs.push('WARN ' + m),
      error: (m) => logs.push('ERR ' + m),
    },
    fetch: () => Promise.reject(new Error('no network in this suite')),
    getGitHubToken: () => '',
    btoa: globalThis.btoa, atob: globalThis.atob,
    escape: globalThis.escape, unescape: globalThis.unescape,
    setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {},
    // Recorded, not run: how many times adoption asked the UI to re-render.
    refreshAnnDates: () => { refreshed++; },
  };
  if (!opts.noDefaults) {
    sandbox.ANN_DEFAULT_MET = REAL_MET;
    sandbox.ANN_DEFAULT_LOVE = REAL_LOVE;
  }

  const ctx = vm.createContext(sandbox);
  vm.runInContext(SYNC_SRC + '\n;globalThis.__Sync = SyncModule;', ctx, { filename: 'sync.js' });

  return {
    S: vm.runInContext('__Sync', ctx),
    logs,
    /** Raw string as it sits in localStorage — for the two plain-string keys. */
    raw: (k) => store.get(k),
    /** Parsed JSON — for the object keys. */
    get: (k) => { const r = store.get(k); return r === undefined ? undefined : JSON.parse(r); },
    set: (k, v) => store.set(k, JSON.stringify(v)),
    put: (k, v) => store.set(k, String(v)),
    has: (k) => store.has(k),
    refreshed: () => refreshed,
  };
}

// ── §2.5 backward compatibility: an old shared state keeps working ──────────
{
  const d = device();
  const st = d.S.collect();
  check('A1 collect() carries an anniversaries key even before one exists, so a legacy peer can send one',
    'anniversaries' in st && st.anniversaries === null && Object.keys(st).length === 19,
    `keys=${Object.keys(st).length} value=${JSON.stringify(st.anniversaries)}`);
  check('A2 anniversaries is the last field before the sync clock, matching the reviewed contract',
    Object.keys(st).indexOf('anniversaries') === 17 && Object.keys(st)[18] === 'updated',
    `index=${Object.keys(st).indexOf('anniversaries')} tail=[${Object.keys(st).slice(16).join(',')}]`);

  const legacy = {
    gratitude: [{ from: 'barry', time: 1000, text: 'synthetic-legacy' }],
    diary: { '2026-01-01': { barry: { text: 'synthetic-legacy-day' } } },
    // note: no anniversaries field at all — this is a pre-Phase-1.9 blob
  };
  let threw = null;
  try { d.S.apply(legacy); } catch (e) { threw = e.message; }
  check('A3 a shared state with no anniversaries field applies without throwing and lands its other fields',
    threw === null && d.get('shared-gratitude').length === 1 &&
    !!d.get('shared-diary')['2026-01-01'],
    `threw=${threw || 'no'} gratitude=${d.get('shared-gratitude').length}`);
  check('A4 the missing field is read as "no canonical yet", never as a reason to clear the local dates',
    d.get('shared-anniversaries').met === REAL_MET && d.raw('cycle-ann-met') === REAL_MET,
    `canonical=${JSON.stringify(d.get('shared-anniversaries'))}`);

  const nd = device({ noDefaults: true });
  const r = nd.S.resolveAnniversaries(undefined);
  check('A5 with no default source available sync.js refuses to invent a canonical',
    r === undefined && !nd.has('shared-anniversaries') && nd.S.getAnnConflict() === null,
    `result=${JSON.stringify(r)} wrote=${nd.has('shared-anniversaries')}`);
}

// ── §2.3 情况 A: local value equals the shipped default, shared silent ─────
{
  const d = device();
  const r = d.S.resolveAnniversaries(undefined);
  check('B1 情况A identical local and default values initialise the canonical to the defaults',
    !!r && r.met === REAL_MET && r.love === REAL_LOVE &&
    d.get('shared-anniversaries').met === REAL_MET &&
    d.get('shared-anniversaries').love === REAL_LOVE,
    `canonical=${JSON.stringify(d.get('shared-anniversaries'))}`);
  check('B2 情况A also publishes the canonical into the two local dates so the UI reads one source',
    d.raw('cycle-ann-met') === REAL_MET && d.raw('cycle-ann-love') === REAL_LOVE && d.refreshed() === 1,
    `met=${d.raw('cycle-ann-met')} refreshed=${d.refreshed()}`);

  // Explicitly-written-but-equal is the same case: the user (or a fix script)
  // stored the defaults verbatim, which carries no private information.
  const e = device();
  e.put('cycle-ann-met', REAL_MET);
  e.put('cycle-ann-love', REAL_LOVE);
  const r2 = e.S.resolveAnniversaries(undefined);
  check('B3 情况A holds when the local keys are explicitly set to those same defaults',
    !!r2 && r2.met === REAL_MET && e.has('shared-anniversaries') && e.S.getAnnConflict() === null,
    `result=${JSON.stringify(r2)} conflict=${JSON.stringify(e.S.getAnnConflict())}`);
}

// ── §2.3 情况 B: local value customised, shared silent → STOP ─────────────
{
  const d = device();
  d.put('cycle-ann-met', LOCAL_MET);
  d.put('cycle-ann-love', LOCAL_LOVE);
  const r = d.S.resolveAnniversaries(undefined);
  check('C1 情况B a customised local value with a silent shared state is NOT initialised',
    r === undefined && !d.has('shared-anniversaries') && d.refreshed() === 0,
    `result=${JSON.stringify(r)} wrote=${d.has('shared-anniversaries')} refreshed=${d.refreshed()}`);
  const c = d.S.getAnnConflict();
  check('C2 情况B records the conflict with both sides, for a human to decide',
    !!c && c.reason === 'customized-local-no-remote' &&
    c.local.met === LOCAL_MET && c.local.love === LOCAL_LOVE && c.remote === null,
    `conflict=${JSON.stringify(c)}`);
  check('C3 情况B changes neither the local dates nor the canonical — neither person is chosen for',
    d.raw('cycle-ann-met') === LOCAL_MET && d.raw('cycle-ann-love') === LOCAL_LOVE,
    `met=${d.raw('cycle-ann-met')} love=${d.raw('cycle-ann-love')}`);
  check('C4 情况B is surfaced on the console rather than swallowed',
    d.logs.some((l) => l.indexOf('WARN') === 0 && l.indexOf('人工确认') !== -1),
    `warned=${d.logs.filter((l) => l.indexOf('WARN') === 0).length}`);
}

// ── §2.3 情况 C: a canonical exists → the canonical is authoritative ───────
{
  // An established canonical with no unpublished save outstanding — the state a
  // device is in on an ordinary pull after the migration. setAnniversaryCanonical
  // is deliberately NOT used here: it arms the pending flag, which by design
  // short-circuits this branch (that is F2).
  const d = device();
  d.set('shared-anniversaries', { met: SAVED_MET, love: SAVED_LOVE });
  d.put('cycle-ann-met', SAVED_MET);
  d.put('cycle-ann-love', SAVED_LOVE);
  const r = d.S.resolveAnniversaries({ met: PEER_MET, love: PEER_LOVE });
  check('D1 情况C an established canonical follows the peer value — the one path §2.4 permits',
    !!r && r.met === PEER_MET && r.love === PEER_LOVE &&
    d.get('shared-anniversaries').met === PEER_MET &&
    d.raw('cycle-ann-met') === PEER_MET && d.refreshed() === 1,
    `result=${JSON.stringify(r)} local=${d.raw('cycle-ann-met')}`);

  const same = device();
  same.S.resolveAnniversaries(undefined);
  const before = same.refreshed();
  const r2 = same.S.resolveAnniversaries({ met: REAL_MET, love: REAL_LOVE });
  check('D2 情况C an identical peer value is a no-op — no write, no re-render',
    r2.met === REAL_MET && same.refreshed() === before && same.S.getAnnConflict() === null,
    `refreshed ${before} -> ${same.refreshed()}`);

  const fresh = device();
  const r3 = fresh.S.resolveAnniversaries({ met: PEER_MET, love: PEER_LOVE });
  check('D3 情况C a device still on the defaults adopts an existing canonical losslessly',
    r3.met === PEER_MET && r3.love === PEER_LOVE &&
    fresh.raw('cycle-ann-met') === PEER_MET && fresh.raw('cycle-ann-love') === PEER_LOVE,
    `local=${fresh.raw('cycle-ann-met')}`);
}

// ── §2.3 情况 D: both sides initialise at once, with different values ──────
{
  const d = device();
  d.put('cycle-ann-met', LOCAL_MET);
  d.put('cycle-ann-love', LOCAL_LOVE);
  const r = d.S.resolveAnniversaries({ met: PEER_MET, love: PEER_LOVE });
  check('D4 情况D a divergent first initialisation is refused rather than silently overwritten',
    r === undefined && !d.has('shared-anniversaries') && d.refreshed() === 0,
    `result=${JSON.stringify(r)} wrote=${d.has('shared-anniversaries')}`);
  const c = d.S.getAnnConflict();
  check('D5 情况D records both candidate pairs so the human decision is possible',
    !!c && c.reason === 'divergent-first-init' &&
    c.local.met === LOCAL_MET && c.remote.met === PEER_MET,
    `conflict=${JSON.stringify(c)}`);
  check('D6 情况D leaves the local dates exactly as they were',
    d.raw('cycle-ann-met') === LOCAL_MET && d.raw('cycle-ann-love') === LOCAL_LOVE,
    `met=${d.raw('cycle-ann-met')}`);
}

// ── §2.4 canonical stability: only a human save may move it ───────────────
{
  const d = device();
  d.S.resolveAnniversaries(undefined);
  const before = d.raw('shared-anniversaries');
  d.S.apply(d.S.collect());
  check('E1 an ordinary push/apply round trip cannot move the canonical',
    d.raw('shared-anniversaries') === before && JSON.parse(before).met === REAL_MET,
    `before=${before} after=${d.raw('shared-anniversaries')}`);

  const code = strip(SYNC_SRC);
  const writes = (code.match(/localStorage\.setItem\(ANN_SHARED/g) || []).length;
  check('E2 the canonical has exactly two writers: adoption and the explicit user save',
    writes === 2, `setItem(ANN_SHARED) occurrences=${writes}`);

  const body = strip(SYNC_SRC.slice(
    SYNC_SRC.indexOf('function resolveAnniversaries'),
    SYNC_SRC.indexOf('// ── 收集全部本地状态 ──')));
  check('E3 the resolution rule contains no clock and no last-writer-wins comparison',
    !/Date\.now|new Date|updated|lastWrite|getTime/i.test(body),
    `bodyLen=${body.length} clockish=${(body.match(/Date\.now|new Date|updated|lastWrite|getTime/gi) || []).join(',') || 'none'}`);

  check('E4 the pending flag is cleared in exactly one place — the successful PUT',
    (strip(SYNC_SRC).match(/removeItem\(ANN_PENDING\)/g) || []).length === 1,
    `clears=${(strip(SYNC_SRC).match(/removeItem\(ANN_PENDING\)/g) || []).length}`);
}

// ── §2.4 the explicit modification path ──────────────────────────────────
{
  const d = device();
  d.S.resolveAnniversaries(undefined);
  const ok = d.S.setAnniversaryCanonical(SAVED_MET, SAVED_LOVE);
  check('F1 an explicit user save moves the canonical and arms the unpublished-change flag',
    ok === true && d.get('shared-anniversaries').met === SAVED_MET &&
    d.get('shared-anniversaries').love === SAVED_LOVE && d.raw('shared-ann-pending') === '1',
    `ok=${ok} canonical=${JSON.stringify(d.get('shared-anniversaries'))} pending=${d.raw('shared-ann-pending')}`);

  // The real race this flag exists for: the GET that precedes the PUT returns
  // the peer's not-yet-updated canonical. Without the flag the user's own save
  // would be rolled back by their own push.
  // setAnniversaryCanonical writes the canonical and the flag only; the local
  // cycle-ann-met / cycle-ann-love keys are written by app.js saveAnniversaries()
  // itself, so they are not asserted here.
  const r = d.S.resolveAnniversaries({ met: REAL_MET, love: REAL_LOVE });
  check('F2 while a user save is unpublished a stale canonical cannot roll it back',
    !!r && r.met === SAVED_MET && r.love === SAVED_LOVE &&
    d.get('shared-anniversaries').met === SAVED_MET &&
    d.get('shared-anniversaries').love === SAVED_LOVE,
    `result=${JSON.stringify(r)} canonical=${JSON.stringify(d.get('shared-anniversaries'))}`);

  const bad = device();
  check('F3 a malformed date is refused by the explicit save and nothing is written',
    bad.S.setAnniversaryCanonical('07/06/2025', SAVED_LOVE) === false &&
    bad.S.setAnniversaryCanonical(SAVED_MET, '') === false &&
    !bad.has('shared-anniversaries') && !bad.has('shared-ann-pending'),
    `wrote=${bad.has('shared-anniversaries')} pending=${bad.has('shared-ann-pending')}`);

  const weird = device();
  const r4 = weird.S.resolveAnniversaries({ met: '2025-1-1', love: 'nonsense' });
  check('F4 a malformed remote value counts as no canonical and is never adopted',
    !!r4 && r4.met === REAL_MET && weird.raw('cycle-ann-met') === REAL_MET,
    `result=${JSON.stringify(r4)}`);
}

// ── §四 case 8: both profiles read the same canonical values ──────────────
{
  const A = device();
  const B = device();
  A.S.resolveAnniversaries(undefined);
  B.S.resolveAnniversaries(undefined);
  // The app-level save sequence, as app.js saveAnniversaries() performs it:
  // write the two local dates, then move the canonical (app.js:889-893).
  A.put('cycle-ann-met', SAVED_MET);
  A.put('cycle-ann-love', SAVED_LOVE);
  A.S.setAnniversaryCanonical(SAVED_MET, SAVED_LOVE);

  const wire = A.S.collect().anniversaries;
  check('G1 the value the PUT carries is the canonical object, not a local read',
    !!wire && wire.met === SAVED_MET && wire.love === SAVED_LOVE,
    `wire=${JSON.stringify(wire)}`);

  const rB = B.S.resolveAnniversaries(wire);
  check('G2 the peer adopts that exact pair through the normal pull path',
    !!rB && rB.met === SAVED_MET && rB.love === SAVED_LOVE &&
    B.raw('cycle-ann-met') === SAVED_MET && B.raw('cycle-ann-love') === SAVED_LOVE,
    `peerLocal=${B.raw('cycle-ann-met')}`);

  check('G3 the two devices agree on all three keys, so the rendered counters cannot disagree',
    A.raw('cycle-ann-met') === B.raw('cycle-ann-met') &&
    A.raw('cycle-ann-love') === B.raw('cycle-ann-love') &&
    A.raw('shared-anniversaries') === B.raw('shared-anniversaries'),
    `canonicalA=${A.raw('shared-anniversaries')} canonicalB=${B.raw('shared-anniversaries')}`);
}

// ── §2.5 / §2.4 the contract is wired into the real files ────────────────
{
  check('H1 app.js and sync.js name the same two local keys — one source, no literal drift',
    /ANN_KEY_MET = 'cycle-ann-met'/.test(APP_SRC) && /ANN_KEY_LOVE = 'cycle-ann-love'/.test(APP_SRC) &&
    /ANN_LOCAL_MET = 'cycle-ann-met'/.test(SYNC_SRC) && /ANN_LOCAL_LOVE = 'cycle-ann-love'/.test(SYNC_SRC),
    'key names agree');

  check('H2 the shipped defaults in app.js are the values the Settings inputs ship with',
    REAL_MET === '2026-03-19' && REAL_LOVE === '2026-05-07' &&
    new RegExp('id="annDateMet"[^>]*value="' + REAL_MET + '"').test(HTML_SRC) &&
    new RegExp('id="annDateLove"[^>]*value="' + REAL_LOVE + '"').test(HTML_SRC),
    `met=${REAL_MET} love=${REAL_LOVE}`);

  check('H3 exactly one call site in app.js can move the canonical',
    (APP_SRC.match(/setAnniversaryCanonical\s*\(/g) || []).length === 1 &&
    /function saveAnniversaries\(\)/.test(APP_SRC),
    `calls=${(APP_SRC.match(/setAnniversaryCanonical\s*\(/g) || []).length}`);

  check('H4 that call site is reachable only from the two date inputs onchange',
    (HTML_SRC.match(/onchange="saveAnniversaries\(\)"/g) || []).length === 2 &&
    !/addEventListener\([^)]*saveAnniversaries/.test(APP_SRC) &&
    !/setInterval\([^)]*saveAnniversaries|setTimeout\([^)]*saveAnniversaries/.test(APP_SRC),
    `onchange=${(HTML_SRC.match(/onchange="saveAnniversaries\(\)"/g) || []).length}`);

  check('H5 saveAnniversaries validates before it writes, so a malformed input cannot reach the canonical',
    /isValidAnnDate\(met\)/.test(APP_SRC) && /isValidAnnDate\(love\)/.test(APP_SRC) &&
    /\\d\{4\}-\\d\{2\}-\\d\{2\}/.test(APP_SRC),
    'validation present on both inputs');
}

// ── §2.4 regression: an ordinary push must not erase a canonical ────────────
// The Worker replaces the WHOLE file (worker/src/index.js ghWrite does
// JSON.stringify(payload)), so `anniversaries: null` in a push does not mean
// "this device has no opinion" — it deletes the partner's canonical. Since cases
// B/D deliberately leave ANN_SHARED unset, before this fix the next ordinary
// push from such a device erased the shared record, and the next fresh device
// re-initialised it to the shipped defaults: two real dates, silently gone.
{
  const d = device();
  // This device has pulled — it has SEEN the peer's canonical — and sits in case
  // D (custom local dates, divergent), so it holds no canonical of its own.
  d.put('cycle-ann-met', LOCAL_MET);
  d.put('cycle-ann-love', LOCAL_LOVE);
  d.S.resolveAnniversaries({ met: PEER_MET, love: PEER_LOVE });

  const out = d.S.collect().anniversaries;
  check('I1 a device with no canonical of its own re-declares the peer pair instead of null',
    !!out && out.met === PEER_MET && out.love === PEER_LOVE,
    `out=${JSON.stringify(out)} ownCanonical=${JSON.stringify(d.get('shared-anniversaries') || null)} ` +
    `seen=${JSON.stringify(d.get('shared-ann-remote'))}`);

  check('I2 the same device still refused to adopt the peer pair — the conflict stays open',
    !d.get('shared-anniversaries') && !!d.S.getAnnConflict(),
    `canonical=${JSON.stringify(d.get('shared-anniversaries') || null)} conflict=${JSON.stringify(d.S.getAnnConflict())}`);
}

// ── §2.4: a remote that genuinely has no canonical is still allowed to be null ─
{
  const d = device();
  d.put('cycle-ann-met', LOCAL_MET);
  d.put('cycle-ann-love', LOCAL_LOVE);
  d.S.resolveAnniversaries(null); // remote carries no canonical at all
  check('I3 a confirmed-empty remote still reports null — that is a fact, not an erasure',
    d.get('shared-ann-remote') === 'none' && d.S.collect().anniversaries === null,
    `seen=${JSON.stringify(d.get('shared-ann-remote'))} out=${JSON.stringify(d.S.collect().anniversaries)}`);
}

// ── §2.3/§2.4: two human edits must not be settled by push order ─────────────
{
  const d = device();
  d.set('shared-anniversaries', { met: SAVED_MET, love: SAVED_LOVE }); // this human's edit
  d.put('shared-ann-pending', '1');                                    // ...not yet published
  const out = d.S.resolveAnniversaries({ met: PEER_MET, love: PEER_LOVE }); // the other human edited too
  const c = d.S.getAnnConflict();
  check('I4 two unpublished human edits are recorded as a conflict, not won by whoever pushes last',
    !!c && c.reason === 'pending-vs-remote' &&
    !!c.local && c.local.met === SAVED_MET && !!c.remote && c.remote.met === PEER_MET,
    `conflict=${JSON.stringify(c)}`);
  check('I5 the local edit is still not rolled back by the peer value',
    !!out && out.met === SAVED_MET,
    `out=${JSON.stringify(out)}`);
  check('I6 the peer canonical was not adopted underneath the unpublished user edit',
    d.get('shared-anniversaries').met === SAVED_MET,
    `canonical=${JSON.stringify(d.get('shared-anniversaries'))}`);
}

// ── §2.3 "stop and report": the trace must survive a reload ──────────────────
{
  const d = device();
  d.put('cycle-ann-met', LOCAL_MET);
  d.put('cycle-ann-love', LOCAL_LOVE);
  d.S.resolveAnniversaries(null); // case B → conflict
  const persisted = d.get('shared-ann-conflict');
  check('I7 the conflict is persisted, so a refresh cannot silently drop the "needs a human" state',
    !!persisted && persisted.reason === 'customized-local-no-remote',
    `persisted=${JSON.stringify(persisted)}`);
}

{
  // A freshly loaded page: no in-memory conflict, only what was written to storage.
  const d = device();
  d.set('shared-ann-conflict', {
    reason: 'divergent-first-init',
    local: { met: LOCAL_MET, love: LOCAL_LOVE },
    remote: { met: PEER_MET, love: PEER_LOVE },
  });
  const c = d.S.getAnnConflict();
  check('I8 after a reload getAnnConflict() still reports the unresolved conflict, read back from storage',
    !!c && c.reason === 'divergent-first-init' && !!c.remote && c.remote.met === PEER_MET,
    `conflict=${JSON.stringify(c)}`);
}

{
  const d = device();
  d.put('cycle-ann-met', LOCAL_MET);
  d.put('cycle-ann-love', LOCAL_LOVE);
  d.S.resolveAnniversaries(null);
  const raised = !!d.S.getAnnConflict();
  d.S.setAnniversaryCanonical(SAVED_MET, SAVED_LOVE); // the human decides, explicitly
  check('I9 the explicit Settings save clears the conflict — a human decision ends it',
    raised && d.S.getAnnConflict() === null && d.get('shared-ann-conflict') === undefined,
    `raised=${raised} after=${JSON.stringify(d.S.getAnnConflict() || null)}`);
}

// ── static guards: the erasing shape must not come back ──────────────────────
check('I10 collect() no longer emits a bare null for anniversaries — the one shape that erases the canonical',
  !/anniversaries:\s*getJSON\(\s*ANN_SHARED\s*,\s*null\s*\)/.test(strip(SYNC_SRC)) &&
  /anniversaries:\s*_annOutbound\(\)/.test(SYNC_SRC) &&
  /function _annOutbound\(\)/.test(SYNC_SRC),
  'uses _annOutbound()');

check('I11 the outbound value never consults a clock — no timestamp may decide a real date',
  (function () {
    const body = /function _annOutbound\(\)\s*\{([\s\S]*?)\n  \}/.exec(SYNC_SRC);
    return !!body && !/Date\.now|new Date|getTime|updated|lastWrite/.test(body[1]);
  })(),
  'no clock in _annOutbound');

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
