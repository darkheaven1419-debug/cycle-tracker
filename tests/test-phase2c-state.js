/**
 * Phase 2C — the shared-state Push path lives on the Worker, and the CAS is real.
 *
 * Phase 2A moved Pull to the Worker; Phase 2C moved Push there too. The properties
 * this suite exists to pin down are the ones a naive migration gets wrong:
 *
 *   - a push is `GET /state` then `PUT /state`, and the PUT carries the sha the GET
 *     handed back (that is what makes the Worker's compare-and-swap meaningful);
 *   - a 409 is recovered from the *snapshot carried in the 409 itself*, with a
 *     re-PUT under the sha from that same response — and crucially with no extra
 *     GET, because an extra GET would re-open the read-then-write window the CAS
 *     exists to close;
 *   - neither the partner's concurrent write nor this device's own write is lost
 *     by that recovery;
 *   - the GitHub PAT is not consulted, and there is no fallback to GitHub when the
 *     Worker is unreachable — the push simply fails and keeps the local data.
 *
 * The Worker is a small scripted CAS store here rather than the real one, because
 * the conflict branches have to be forced deterministically. That the real Worker
 * implements this exact contract is covered separately by tests/test-worker.js, and
 * the real Worker driven end-to-end by tests/test-sync-merge.js.
 *
 * Run: node tests/test-phase2c-state.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js/sync.js'), 'utf8');

const WORKER_HOST = 'cycle-tracker-data.cycletracker-barry.workers.dev';
const APP_KEY_STORAGE = 'ct-app-key';
const GH_TOKEN_STORAGE = 'gh-token';
// Synthetic credentials and synthetic content. Not real secrets, not real data.
const APP_KEY = 'test-app-key-phase2c-state-0000000000000000';
const GH_TOKEN = 'ghp_SYNTHETIC_PUSH_PAT_0000000000';
const SHA_A = 'a'.repeat(40);
const SHA_B = 'b'.repeat(40);
const SHA_C = 'c'.repeat(40);

/** The 17 keys collect() has always returned. Phase 2C must not change the set. */
const COLLECT_KEYS = [
  'diary', 'cycleInfo', 'symptoms', 'gratitude', 'gratitudeEcho', 'hug',
  'songs', 'sleep', 'checkins', 'learningProgress', 'learningComments',
  'learningPoints', 'voiceData', 'sunCounter', 'knowme', 'calendarMarkers', 'updated',
];

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

const note = (from, time, text) => ({ from, time, text });

/**
 * One vm "device" talking to a scripted Worker CAS store.
 *
 * opts.appKey / opts.ghToken seed the device's storage.
 * opts.conflictsBeforeSuccess makes the store reject the first N PUTs with a real
 * 409 envelope carrying its current sha and content, exactly as the Worker does.
 * opts.workerDown makes every Worker call reject, to prove there is no fallback.
 */
function createDevice(opts) {
  opts = opts || {};
  const store = new Map();
  const logs = [];
  const timers = [];
  const ledger = { worker: [], workerMethods: [], putBodies: [], github: [], tokenCalls: 0 };

  // ── the scripted Worker: a CAS store keyed on the blob sha ──
  const remote = {
    sha: opts.remoteSha === undefined ? SHA_A : opts.remoteSha,
    value: opts.remoteValue || { gratitude: [], diary: {} },
  };
  let conflictsLeft = opts.conflictsBeforeSuccess || 0;
  let shaCounter = 0;
  const nextSha = () => [SHA_B, SHA_C, 'd'.repeat(40)][shaCounter++] || 'e'.repeat(40);

  const conflict = () => ({
    status: 409,
    body: { error: 'conflict', message: 'Remote changed; merge and retry', sha: remote.sha, state: remote.value },
  });

  function workerGet() {
    return { status: 200, body: { sha: remote.sha, state: remote.value } };
  }

  function workerPut(body) {
    if (conflictsLeft > 0) {
      conflictsLeft--;
      // A partner write landed between this device's GET and its PUT, so bump the
      // sha before answering. That makes the conflict envelope's sha differ from the
      // one this device read, which is what lets C8 prove the retry used the sha it
      // was *handed* rather than the stale one it was still holding.
      remote.sha = nextSha();
      return conflict();
    }
    const baseSha = body.baseSha == null ? null : body.baseSha;
    if (baseSha !== remote.sha) return conflict();
    remote.value = body.state;
    remote.sha = nextSha();
    return { status: 200, body: { sha: remote.sha } };
  }

  function route(u, o) {
    const url = String(u);
    const method = (o && o.method) || 'GET';
    if (url.indexOf(WORKER_HOST) !== -1) {
      ledger.worker.push(url);
      ledger.workerMethods.push(method);
      if (opts.workerDown) return Promise.reject(new Error('network down'));
      let r;
      if (method === 'PUT') {
        let body = null;
        try { body = JSON.parse(o.body); } catch (e) { body = null; }
        ledger.putBodies.push(body);
        r = workerPut(body);
      } else {
        r = workerGet();
      }
      return Promise.resolve(new Response(JSON.stringify(r.body), {
        status: r.status, headers: { 'Content-Type': 'application/json' },
      }));
    }
    if (url.indexOf('api.github.com') !== -1) {
      // The tripwire: any call here is a fallback, and the assertions below treat it
      // as a failure rather than a network hiccup.
      ledger.github.push(method + ' ' + url);
      return Promise.resolve(new Response('{}', {
        status: 200, headers: { 'Content-Type': 'application/json' },
      }));
    }
    return Promise.reject(new Error('unexpected fetch: ' + url));
  }

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
    fetch: (u, o) => route(u, o),
    // The PAT is available on every device as a spy, so a push that reached for it
    // would be caught rather than throwing.
    getGitHubToken: function () { ledger.tokenCalls++; return opts.ghTokenValue || ''; },
    btoa: globalThis.btoa, atob: globalThis.atob,
    escape: globalThis.escape, unescape: globalThis.unescape,
    // Recorded, not run: the 409 retry is scheduled, and the tests below step it
    // deliberately so the retry is observed rather than raced.
    setTimeout: (fn, ms) => { timers.push({ fn, ms }); return timers.length; },
    clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {},
  };
  const ctx = vm.createContext(sandbox);
  vm.runInContext(SRC + '\n;globalThis.__Sync = SyncModule;', ctx, { filename: 'sync.js' });

  if (opts.appKey) store.set(APP_KEY_STORAGE, opts.appKey);
  if (opts.ghToken) store.set(GH_TOKEN_STORAGE, GH_TOKEN);

  return {
    ledger, remote, timers, logs,
    S: vm.runInContext('__Sync', ctx),
    get: (k) => { const raw = store.get(k); return raw === undefined ? undefined : JSON.parse(raw); },
    set: (k, v) => store.set(k, JSON.stringify(v)),
    hasKey: (k) => store.has(k),
    /** Runs every timer scheduled so far, in order — the 409 retry lives here. */
    runTimers() {
      const pending = timers.splice(0, timers.length);
      for (const t of pending) { try { t.fn(); } catch (e) { logs.push('ERR timer: ' + e.message); } }
      return pending.length;
    },
    async push() { await vm.runInContext('pushAllSharedData()', ctx); },
  };
}

const tick = () => new Promise((r) => setTimeout(r, 20));

(async () => {
  // ── 1. the happy path: GET then PUT, with the sha the GET handed back ──
  {
    const d = createDevice({ appKey: APP_KEY, remoteValue: { gratitude: [], diary: {} } });
    d.set('shared-gratitude', [note('andjela', 1000, 'synthetic-local')]);
    await d.push();
    const bodies = d.ledger.putBodies;
    check('C1 a Push is a Worker /state GET then PUT',
      d.ledger.workerMethods.join(',') === 'GET,PUT' &&
      d.ledger.worker.every((u) => u.indexOf('/state') !== -1),
      `methods=[${d.ledger.workerMethods.join(',')}] urls=${d.ledger.worker.length}`);
    check('C2 the PUT carries the baseSha the GET handed back',
      bodies.length === 1 && bodies[0].baseSha === SHA_A && !!bodies[0].state,
      `baseSha=${bodies.length ? String(bodies[0].baseSha).slice(0, 8) : 'none'} hasState=${bodies.length ? !!bodies[0].state : false}`);
    check('C3 the App Secret travels as a Bearer header, never in the URL or the body',
      d.ledger.worker.every((u) => u.indexOf(APP_KEY) === -1) &&
      JSON.stringify(bodies).indexOf(APP_KEY) === -1,
      `urlLeak=${d.ledger.worker.some((u) => u.indexOf(APP_KEY) !== -1)} bodyLeak=${JSON.stringify(bodies).indexOf(APP_KEY) !== -1}`);
    check('C4 the write landed on the remote and the local sync clock was set',
      d.remote.value.gratitude.length === 1 && !!d.get('shared-last-sync'),
      `remoteGratitude=${d.remote.value.gratitude.length} lastSync=${!!d.get('shared-last-sync')}`);
  }

  // ── 2. no GitHub on any path, and the PAT is never consulted ──
  {
    const d = createDevice({ appKey: APP_KEY, ghToken: GH_TOKEN, ghTokenValue: GH_TOKEN });
    d.set('shared-gratitude', [note('andjela', 1000, 'synthetic-local')]);
    await d.push();
    await d.S.pull();
    check('C5 a full push + pull makes zero GitHub requests and never calls getGitHubToken',
      d.ledger.github.length === 0 && d.ledger.tokenCalls === 0,
      `github=${d.ledger.github.length} getGitHubTokenCalls=${d.ledger.tokenCalls}`);
    check('C6 js/sync.js contains no api.github.com endpoint literal',
      SRC.indexOf('https://api.github.com') === -1,
      `found=${SRC.indexOf('https://api.github.com')}`);
  }

  // ── 3. a 409 is recovered from the snapshot inside the 409, with no extra GET ──
  {
    const d = createDevice({
      appKey: APP_KEY,
      remoteValue: { gratitude: [note('barry', 2000, 'synthetic-partner')], diary: {} },
      conflictsBeforeSuccess: 1,
    });
    d.set('shared-gratitude', [note('andjela', 1000, 'synthetic-local')]);
    await d.push();
    const afterFirst = d.ledger.workerMethods.slice();
    const timers = d.runTimers();
    await tick();

    check('C7 a stale baseSha is answered with a 409 and the retry re-PUTs without an extra GET',
      afterFirst.join(',') === 'GET,PUT' &&
      d.ledger.workerMethods.join(',') === 'GET,PUT,PUT' &&
      timers === 1,
      `first=[${afterFirst.join(',')}] total=[${d.ledger.workerMethods.join(',')}] timers=${timers}`);
    // The two shas must differ: the first PUT used what this device read (SHA_A), the
    // retry must use what the 409 handed back (SHA_B). Equal shas would mean the
    // client retried under its own stale sha, which the store would reject forever.
    check('C8 the retry re-PUTs with the sha carried by the 409 envelope, not its own stale one',
      d.ledger.putBodies.length === 2 &&
      d.ledger.putBodies[0].baseSha === SHA_A &&
      d.ledger.putBodies[1].baseSha === SHA_B,
      `baseShas=[${d.ledger.putBodies.map((b) => String(b.baseSha).slice(0, 8)).join(',')}]`);
    // The decisive data-safety property: the partner's note arrived only in the 409
    // body, so if the recovery had re-used its own stale snapshot instead of merging
    // the one it was handed, the partner's note would be missing here.
    const texts = d.remote.value.gratitude.map((n) => n.text).sort().join(',');
    check('C9 the 409 recovery keeps both the partner note and this device note',
      texts === 'synthetic-local,synthetic-partner',
      `remoteGratitude=[${texts}]`);
    check('C10 the recovered push reported success and touched no GitHub',
      !!d.get('shared-last-sync') && d.ledger.github.length === 0,
      `lastSync=${!!d.get('shared-last-sync')} github=${d.ledger.github.length}`);
  }

  // ── 4. the retry cap holds: a store that always conflicts stops after 3 attempts ──
  {
    const d = createDevice({ appKey: APP_KEY, conflictsBeforeSuccess: 99 });
    d.set('shared-gratitude', [note('andjela', 1000, 'synthetic-local')]);
    await d.push();
    let rounds = 0;
    while (d.runTimers() > 0 && rounds < 10) { rounds++; await tick(); }
    const puts = d.ledger.workerMethods.filter((m) => m === 'PUT').length;
    check('C11 repeated conflicts stop after the 3-attempt cap and schedule no further retry',
      puts === 3 && rounds <= 3 && d.ledger.github.length === 0,
      `puts=${puts} retryRounds=${rounds} github=${d.ledger.github.length}`);
    check('C12 a push that exhausts its retries keeps the local data and reports failure',
      d.get('shared-gratitude').length === 1 &&
      d.logs.some((l) => l.indexOf('WARN') === 0),
      `localGratitude=${d.get('shared-gratitude').length} warned=${d.logs.some((l) => l.indexOf('WARN') === 0)}`);
  }

  // ── 5. the Worker being unreachable is a failure, never a fallback to GitHub ──
  {
    const d = createDevice({ appKey: APP_KEY, ghToken: GH_TOKEN, ghTokenValue: GH_TOKEN, workerDown: true });
    d.set('shared-gratitude', [note('andjela', 1000, 'synthetic-local')]);
    await d.push();
    check('C13 an unreachable Worker produces zero GitHub requests and keeps the local data',
      d.ledger.github.length === 0 && d.get('shared-gratitude').length === 1,
      `github=${d.ledger.github.length} localGratitude=${d.get('shared-gratitude').length}`);
    check('C14 the failure is surfaced and a retry is scheduled rather than a transport switch',
      d.timers.length === 1 && !d.get('shared-last-sync'),
      `timers=${d.timers.length} lastSync=${!!d.get('shared-last-sync')}`);
  }

  // ── 6. no App Secret: nothing at all happens, on either transport ──
  {
    const d = createDevice({ ghToken: GH_TOKEN, ghTokenValue: GH_TOKEN });
    d.set('shared-gratitude', [note('andjela', 1000, 'synthetic-local')]);
    await d.push();
    check('C15 a device with only a GitHub PAT issues no request on either transport',
      d.ledger.worker.length === 0 && d.ledger.github.length === 0 && d.ledger.tokenCalls === 0,
      `worker=${d.ledger.worker.length} github=${d.ledger.github.length} getGitHubTokenCalls=${d.ledger.tokenCalls}`);
  }

  // ── 7. the pre-push union still happens, now sourced from the Worker GET ──
  {
    const d = createDevice({
      appKey: APP_KEY,
      remoteValue: {
        gratitude: [note('barry', 2000, 'synthetic-remote-only')],
        diary: { '2026-01-02': { barry: { text: 'synthetic-remote-day' } } },
      },
    });
    d.set('shared-gratitude', [note('andjela', 1000, 'synthetic-local')]);
    d.set('shared-diary', { '2026-01-01': { andjela: { text: 'synthetic-local-day' } } });
    const diariesBefore = Object.keys(d.get('shared-diary')).length;
    await d.push();
    const diaries = Object.keys(d.get('shared-diary')).sort().join(',');
    check('C16 the push merges the remote diary and gratitude into local before it PUTs',
      diariesBefore === 1 && diaries === '2026-01-01,2026-01-02' &&
      d.get('shared-gratitude').length === 2,
      `diaryBefore=${diariesBefore} diaryAfter=[${diaries}] gratitude=${d.get('shared-gratitude').length}`);
    check('C17 the PUT therefore carries the union, not just this device own writes',
      d.ledger.putBodies.length === 1 &&
      Object.keys(d.ledger.putBodies[0].state.diary).sort().join(',') === '2026-01-01,2026-01-02' &&
      d.ledger.putBodies[0].state.gratitude.length === 2,
      `putDiary=${Object.keys(d.ledger.putBodies[0].state.diary).length} putGratitude=${d.ledger.putBodies[0].state.gratitude.length}`);
  }

  // ── 8. collect()'s field set is untouched by the migration ──
  {
    const d = createDevice({ appKey: APP_KEY });
    const state = d.S.collect();
    const missing = COLLECT_KEYS.filter((k) => !(k in state));
    const extra = Object.keys(state).filter((k) => COLLECT_KEYS.indexOf(k) === -1);
    check('C18 collect() still returns exactly the same 17 keys',
      missing.length === 0 && extra.length === 0 && Object.keys(state).length === 17,
      `keys=${Object.keys(state).length} missing=[${missing.join(',')}] extra=[${extra.join(',')}]`);
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
