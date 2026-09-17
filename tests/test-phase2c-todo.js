/**
 * Phase 2C-2 — the shared Todo list lives on the Worker, and concurrent writes merge.
 *
 * The defect this suite pins down: the old `_pushTodo()` was a whole-array overwrite
 * (`GET sha → PUT the entire local array`). Two people adding one item each in the
 * same window meant the later PUT erased the earlier item, and a partner's stale copy
 * reverted a completion the other had just made. Neither is a crash — the data just
 * quietly goes wrong, which is why it needs explicit concurrency tests rather than a
 * smoke test.
 *
 * What is asserted here:
 *   - a push is `GET /todo` then `PUT /todo` with the sha the GET handed back, using
 *     the App Secret as a Bearer token and never touching GitHub;
 *   - the merge rules from the spec block in js/fix-stats.js behave as written
 *     (R1..R5, including the tombstone rules that make a delete propagate);
 *   - T1 concurrent add — both survive;
 *   - T2 toggle/delete concurrency — the completion survives AND the delete survives;
 *   - T3 a genuinely stale baseSha is answered 409, recovered from the envelope's own
 *     snapshot and sha, with no extra GET;
 *   - T4 repeated pull/push converges with no duplicate ids;
 *   - T5 the 120s poll is registered and gated on the App Secret, not the PAT;
 *   - an unreachable Worker is a failure, never a fallback to GitHub.
 *
 * The Worker is a scripted CAS store (not the real one) because the conflict branches
 * have to be forced deterministically. That the real Worker implements this contract is
 * covered by tests/test-worker.js; that the real Worker drives the shared-state path
 * end-to-end is covered by tests/test-sync-merge.js.
 *
 * Both real source files are loaded into the vm — js/sync.js first, because
 * js/fix-stats.js resolves the Worker URL through `SyncModule.workerUrl` and reads its
 * credential through the global `getAppSecret`. Driving the real files means the
 * credential wiring is tested, not assumed.
 *
 * All content below is synthetic. No real todo text, no real credential.
 *
 * Run: node tests/test-phase2c-todo.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SYNC_SRC = fs.readFileSync(path.join(ROOT, 'js/sync.js'), 'utf8');
const TODO_SRC = fs.readFileSync(path.join(ROOT, 'js/fix-stats.js'), 'utf8');

const WORKER_HOST = 'cycle-tracker-data.cycletracker-barry.workers.dev';
const APP_KEY_STORAGE = 'ct-app-key';
const TODO_STORAGE = 'shared-todolist';
// Synthetic credentials. Not real secrets.
const APP_KEY = 'test-app-key-phase2c-todo-00000000000000000';
const GH_TOKEN = 'ghp_SYNTHETIC_TODO_PAT_0000000000';
const SHA_A = 'a'.repeat(40);
const SHA_B = 'b'.repeat(40);
const SHA_C = 'c'.repeat(40);
const SHA_D = 'd'.repeat(40);

/** The field names a live todo record has always had. Phase 2C-2 must not rename any. */
const LIVE_FIELDS = ['id', 'text', 'author', 'createdAt', 'completed', 'completedBy', 'completedAt'];
/** The tombstone shape introduced by Phase 2C-2, and nothing more. */
const TOMB_FIELDS = ['id', 'deleted', 'deletedAt', 'deletedBy'];

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

const tick = () => new Promise((r) => setTimeout(r, 5));
const json = (status, obj) => new Response(JSON.stringify(obj), {
  status, headers: { 'Content-Type': 'application/json' },
});

/** A synthetic live record. */
const live = (id, text, author, createdAt) => ({
  id, text, author, createdAt, completed: false, completedBy: null, completedAt: null,
});

/** A fresh sha sequence for a shared store. */
function shaSeq() {
  let n = 0;
  return () => [SHA_B, SHA_C, SHA_D, 'e'.repeat(40)][n++] || 'f'.repeat(40);
}

/**
 * A scripted Worker CAS store plus one vm "device".
 *
 * `shared` lets two devices talk to the same store, which is what makes a concurrency
 * test meaningful: the second device's local copy is stale in exactly the way a real
 * partner device's copy is stale.
 *
 * opts.seedTodo      the device's local shared-todolist before anything runs
 * opts.appKey        seed ct-app-key (omit for a device with no credential)
 * opts.ghToken       seed gh-token, and make getGitHubToken a counting spy
 * opts.remoteTodo    the store's current todo array
 * opts.remoteSha     the store's current sha
 * opts.conflictsBeforeSuccess  force this many 409s before a PUT can land
 * opts.workerDown    every Worker call rejects — the no-fallback case
 * opts.failGetOnly   the GET rejects but the PUT is served (read-failure path)
 * opts.shared        an existing store to join, instead of a private one
 */
function createDevice(opts) {
  opts = opts || {};
  const own = new Map();
  const logs = [];
  const timers = [];
  const intervals = [];
  const ledger = { worker: [], methods: [], putBodies: [], github: [], tokenCalls: 0 };

  const shared = opts.shared || {
    remote: {
      sha: opts.remoteSha === undefined ? SHA_A : opts.remoteSha,
      value: opts.remoteTodo ? opts.remoteTodo.map((t) => Object.assign({}, t)) : [],
    },
    nextSha: shaSeq(),
    conflictsLeft: opts.conflictsBeforeSuccess || 0,
  };
  const remote = shared.remote;

  const conflictBody = () => ({
    error: 'conflict', message: 'Remote changed; merge and retry',
    sha: remote.sha, todo: remote.value,
  });

  function route(u, o) {
    const url = String(u);
    const method = (o && o.method) || 'GET';
    if (url.indexOf(WORKER_HOST) !== -1) {
      ledger.worker.push(url);
      ledger.methods.push(method);
      if (opts.workerDown) return Promise.reject(new Error('network down'));
      if (url.indexOf('/todo') === -1) return Promise.resolve(json(404, { error: 'not found' }));
      if (method === 'PUT') {
        let body = null;
        try { body = JSON.parse(o.body); } catch (e) { body = null; }
        ledger.putBodies.push(body);
        if (shared.conflictsLeft > 0) {
          shared.conflictsLeft--;
          // A partner write landed inside this device's read-then-write window, so bump
          // the sha before answering. That makes the envelope's sha differ from the one
          // this device read — which is what lets check T3b prove the retry used the sha
          // it was *handed* rather than the stale one it still held.
          remote.sha = shared.nextSha();
          return Promise.resolve(json(409, conflictBody()));
        }
        const baseSha = (body && body.baseSha != null) ? body.baseSha : null;
        if (baseSha !== remote.sha) return Promise.resolve(json(409, conflictBody()));
        remote.value = (body && body.todo) || [];
        remote.sha = shared.nextSha();
        return Promise.resolve(json(200, { sha: remote.sha }));
      }
      if (opts.failGetOnly) return Promise.reject(new Error('read failed'));
      return Promise.resolve(json(200, { sha: remote.sha, todo: remote.value }));
    }
    if (url.indexOf('api.github.com') !== -1) {
      // The tripwire. Any call here is a fallback, and the assertions treat it as a
      // failure rather than as a network hiccup.
      ledger.github.push(method + ' ' + url);
      return Promise.resolve(new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }
    return Promise.reject(new Error('unexpected fetch: ' + url));
  }

  let inputValue = '';
  let scheduled = 0;
  const sandbox = {
    localStorage: {
      getItem: (k) => (own.has(k) ? own.get(k) : null),
      setItem: (k, v) => { own.set(k, String(v)); },
      removeItem: (k) => { own.delete(k); },
    },
    document: {
      // Only the todo input is needed: window._addTodo() reads it, and every other
      // lookup returning null makes _render() and _createTodoCard() bail early, which
      // is what keeps this suite DOM-free.
      getElementById: (id) => (id === 'todoInput' ? { value: inputValue } : null),
      querySelectorAll: () => [],
      createElement: () => ({ appendChild() {}, innerHTML: '' }),
      addEventListener: () => {}, removeEventListener: () => {},
    },
    console: {
      log: (m) => logs.push(String(m)),
      warn: (m) => logs.push('WARN ' + m),
      error: (m) => logs.push('ERR ' + m),
    },
    fetch: (u, o) => route(u, o),
    activeProfile: opts.profile || 'andjela',
    btoa: globalThis.btoa, atob: globalThis.atob,
    escape: globalThis.escape, unescape: globalThis.unescape,
    // Recorded, not run: every retry is scheduled, so the tests step it deliberately
    // and observe the retry instead of racing it. The monotonic counter alongside the
    // array is what lets a test count schedules *since construction* even after
    // runTimers() has drained the array.
    setTimeout: (fn, ms) => { timers.push({ fn, ms }); return ++scheduled; },
    clearTimeout: () => {},
    setInterval: (fn, ms) => { intervals.push({ fn, ms }); return intervals.length; },
    clearInterval: () => {},
  };
  sandbox.window = sandbox; // as in a browser, so window.state and the global agree
  sandbox.getGitHubToken = function () { ledger.tokenCalls++; return opts.ghToken ? GH_TOKEN : ''; };
  sandbox.window.state = { records: [0, 0], todoList: [] };

  if (opts.seedTodo) own.set(TODO_STORAGE, JSON.stringify(opts.seedTodo));
  if (opts.appKey) own.set(APP_KEY_STORAGE, opts.appKey);
  if (opts.ghToken) own.set('gh-token', GH_TOKEN);

  const ctx = vm.createContext(sandbox);
  vm.runInContext(SYNC_SRC, ctx, { filename: 'sync.js' });
  vm.runInContext(TODO_SRC, ctx, { filename: 'fix-stats.js' });

  // Requests recorded during construction come from the load-time pull in
  // js/fix-stats.js — the same initial _pullTodo() the pre-2C code had. Tests that
  // assert an exact request sequence measure the delta from here, so that pull is not
  // silently folded into whatever the test does next; T-A0 asserts it on its own.
  const base = { methods: ledger.methods.length, worker: ledger.worker.length, timers: scheduled };

  return {
    ledger, remote, timers, intervals, logs, shared, base,
    W: sandbox.window,
    /** Requests issued after construction (the load-time pull excluded). */
    methodsSince: () => ledger.methods.slice(base.methods),
    /** Timers scheduled after construction (fix-stats.js's own retries excluded). */
    timersSince: () => scheduled - base.timers,
    /** How many requests the load-time pull issued. */
    loadRequests: base.methods,
    /** The device's live in-memory list. */
    list: () => sandbox.window.state.todoList,
    /** The device's persisted list. */
    stored: () => JSON.parse(own.get(TODO_STORAGE) || '[]'),
    hasKey: (k) => own.has(k),
    /** Drive the real public entry points, exactly as the UI does. */
    add(text) { inputValue = text; sandbox.window._addTodo(); },
    toggle(id) { sandbox.window._toggleTodo(id); },
    del(id) { sandbox.window._deleteTodo(id); },
    async push() { await sandbox.window._pushTodo(); },
    async pull() { await sandbox.window._pullTodo(); },
    /** Let the un-awaited GET→PUT chain inside add/toggle/delete finish. */
    async settle() { for (let i = 0; i < 8; i++) await tick(); },
    /** Runs every scheduled retry, in order — that is where the 409 recovery lives. */
    runTimers() {
      const pending = timers.splice(0, timers.length);
      for (const t of pending) { try { t.fn(); } catch (e) { logs.push('ERR timer: ' + e.message); } }
      return pending.length;
    },
    /** Fires every registered interval callback (the 120s poll). */
    fireIntervals(ms) {
      const hits = intervals.filter((i) => ms === undefined || i.ms === ms);
      for (const i of hits) { try { i.fn(); } catch (e) { logs.push('ERR interval: ' + e.message); } }
      return hits.length;
    },
  };
}

(async () => {
  // ── 1. the transport: GET then PUT /todo, App Secret as Bearer, no GitHub ──
  {
    const d = createDevice({ appKey: APP_KEY, ghToken: GH_TOKEN, remoteTodo: [] });
    // Real load behaviour, kept from before Phase 2C: an App-Secret device pulls the
    // todo list once as soon as the page loads, without waiting for the 120s poll.
    check('T-A0 the page load issues exactly one /todo GET, before any user action',
      d.loadRequests === 1 && d.ledger.methods[0] === 'GET',
      `loadRequests=${d.loadRequests} methods=[${d.ledger.methods.join(',')}]`);
    d.add('synthetic-a');
    await d.settle();
    const bodies = d.ledger.putBodies;
    check('T-A1 a Todo push is a Worker /todo GET then PUT',
      d.methodsSince().join(',') === 'GET,PUT' &&
      d.ledger.worker.every((u) => u.indexOf('/todo') !== -1),
      `methodsSince=[${d.methodsSince().join(',')}] urls=${d.ledger.worker.length}`);
    check('T-A2 the PUT carries the baseSha the GET handed back, and the todo array',
      bodies.length === 1 && bodies[0].baseSha === SHA_A && Array.isArray(bodies[0].todo) &&
      bodies[0].todo.length === 1,
      `baseSha=${bodies.length ? String(bodies[0].baseSha).slice(0, 8) : 'none'} todo=${bodies.length ? bodies[0].todo.length : 'n/a'}`);
    check('T-A3 the App Secret travels as a Bearer header, never in the URL or the body',
      d.ledger.worker.every((u) => u.indexOf(APP_KEY) === -1) &&
      JSON.stringify(bodies).indexOf(APP_KEY) === -1,
      `urlLeak=${d.ledger.worker.some((u) => u.indexOf(APP_KEY) !== -1)} bodyLeak=${JSON.stringify(bodies).indexOf(APP_KEY) !== -1}`);
    check('T-A4 no GitHub request anywhere, and the PAT is never consulted',
      d.ledger.github.length === 0 && d.ledger.tokenCalls === 0,
      `github=${d.ledger.github.length} getGitHubTokenCalls=${d.ledger.tokenCalls}`);
    check('T-A5 js/fix-stats.js contains no GitHub API endpoint literal',
      TODO_SRC.indexOf('https://api.github.com') === -1,
      `found=${TODO_SRC.indexOf('https://api.github.com')}`);
  }

  // ── 2. the merge rules, unit-tested against the real implementations ──
  {
    const d = createDevice({ appKey: APP_KEY });
    const { merge, pick } = d.W._todoMergeRules;
    const key = (list) => list.map((t) => t.id).sort().join(',');

    // R1 — different ids take the union
    {
      const out = merge([live('b1', 'synthetic-b', 'barry', '2026-01-02')],
        [live('a1', 'synthetic-a', 'andjela', '2026-01-01')]);
      check('T-M1 R1 different ids: the union is kept, both survive',
        out.length === 2 && key(out) === 'a1,b1', `ids=[${key(out)}]`);
    }

    // R2a — one completed, one not: the completion wins and brings its own attribution
    {
      const done = Object.assign(live('a1', 'synthetic-a', 'andjela', '2026-01-01'),
        { completed: true, completedBy: 'barry', completedAt: '2026-01-05' });
      const not = live('a1', 'synthetic-a', 'andjela', '2026-01-01');
      const fwd = pick(not, done);
      const rev = pick(done, not);
      check('T-M2 R2a a completion beats a non-completion, taking its completedBy/completedAt',
        fwd.completed === true && fwd.completedBy === 'barry' && fwd.completedAt === '2026-01-05' &&
        rev.completed === true && rev.completedBy === 'barry' && rev.completedAt === '2026-01-05',
        `fwd=${fwd.completed}/${fwd.completedBy} rev=${rev.completed}/${rev.completedBy}`);
    }

    // R2b — both completed: the later completedAt wins, in either argument order
    {
      const early = Object.assign(live('a1', 'synthetic-a', 'andjela', '2026-01-01'),
        { completed: true, completedBy: 'andjela', completedAt: '2026-01-03' });
      const late = Object.assign(live('a1', 'synthetic-a', 'andjela', '2026-01-01'),
        { completed: true, completedBy: 'barry', completedAt: '2026-01-09' });
      check('T-M3 R2b of two completions the later completedAt wins, order-independently',
        pick(early, late).completedBy === 'barry' && pick(late, early).completedBy === 'barry',
        `fwd=${pick(early, late).completedBy} rev=${pick(late, early).completedBy}`);
    }

    // R2b tie-break — same completedAt: deterministic, and the same both ways round
    {
      const x = Object.assign(live('a1', 'synthetic-a', 'andjela', '2026-01-01'),
        { completed: true, completedBy: 'andjela', completedAt: '2026-01-09' });
      const y = Object.assign(live('a1', 'synthetic-a', 'andjela', '2026-01-01'),
        { completed: true, completedBy: 'barry', completedAt: '2026-01-09' });
      check('T-M4 R2b a completedAt tie is broken deterministically and symmetrically',
        pick(x, y).completedBy === pick(y, x).completedBy,
        `fwd=${pick(x, y).completedBy} rev=${pick(y, x).completedBy}`);
    }

    // R3 — the tombstone rules, which are what make a delete propagate
    {
      const gone = { id: 'a1', deleted: true, deletedAt: '2026-01-07', deletedBy: 'barry' };
      const alive = live('a1', 'synthetic-a', 'andjela', '2026-01-01');
      const fwd = pick(alive, gone);
      const rev = pick(gone, alive);
      check('T-M5 R3 a tombstone beats a live record, in either argument order',
        fwd.deleted === true && rev.deleted === true && fwd.id === 'a1' && rev.id === 'a1',
        `fwd.deleted=${fwd.deleted} rev.deleted=${rev.deleted}`);
      // And a completed live record must not out-rank a tombstone: deleting a done item
      // has to stay deleted, otherwise a resurrect loop is possible.
      const doneLive = Object.assign({}, alive, { completed: true, completedBy: 'andjela', completedAt: '2026-01-08' });
      check('T-M6 R3 a tombstone also beats a *completed* live record',
        pick(doneLive, gone).deleted === true && pick(gone, doneLive).deleted === true,
        `fwd.deleted=${pick(doneLive, gone).deleted} rev.deleted=${pick(gone, doneLive).deleted}`);
    }

    // R4 — two tombstones for the same id
    {
      const t1 = { id: 'a1', deleted: true, deletedAt: '2026-01-07', deletedBy: 'andjela' };
      const t2 = { id: 'a1', deleted: true, deletedAt: '2026-01-09', deletedBy: 'barry' };
      check('T-M7 R4 of two tombstones the later deletedAt wins, order-independently',
        pick(t1, t2).deletedAt === '2026-01-09' && pick(t2, t1).deletedAt === '2026-01-09',
        `fwd=${pick(t1, t2).deletedAt} rev=${pick(t2, t1).deletedAt}`);
    }

    // R2c + R5 — an id collision (the case fact F2 says cannot happen) is still total,
    // and the output order is stable and id-sorted
    {
      const a = live('x1', 'synthetic-a', 'andjela', '2026-01-01');
      const b = live('x1', 'synthetic-b', 'barry', '2026-01-02');
      const fwd = pick(a, b), rev = pick(b, a);
      check('T-M8 R2c an id collision resolves by createdAt, symmetrically',
        fwd.text === rev.text && fwd.text === 'synthetic-b',
        `fwd=${fwd.text} rev=${rev.text}`);
      const out = merge([live('c1', 'synthetic-c', 'andjela', '2026-01-03'),
        live('a1', 'synthetic-a', 'andjela', '2026-01-01')],
      [live('b1', 'synthetic-b', 'barry', '2026-01-02')]);
      check('T-M9 R5 the merged array is id-sorted, so identical inputs give identical output',
        out.map((t) => t.id).join(',') === 'a1,b1,c1', `ids=[${out.map((t) => t.id).join(',')}]`);
    }

    // R5 — idempotence and order-independence, which is what makes the 409 retry converge
    {
      const l = [live('a1', 'synthetic-a', 'andjela', '2026-01-01'),
        Object.assign(live('b1', 'synthetic-b', 'barry', '2026-01-02'), { completed: true, completedBy: 'barry', completedAt: '2026-01-06' })];
      const r = [live('b1', 'synthetic-b', 'barry', '2026-01-02'),
        { id: 'c1', deleted: true, deletedAt: '2026-01-07', deletedBy: 'andjela' }];
      const once = JSON.stringify(merge(l, r));
      const twice = JSON.stringify(merge(merge(l, r), r));
      const swapped = JSON.stringify(merge(r, l));
      check('T-M10 R1–R5 the merge is idempotent (merge(merge(a,b),b) === merge(a,b))',
        once === twice, `same=${once === twice}`);
      check('T-M11 R1–R5 the merge is argument-order independent',
        once === swapped, `same=${once === swapped}`);
    }
  }

  // ── 3. T1 — concurrent add: both items survive ──
  {
    const store = { remote: { sha: SHA_A, value: [] }, nextSha: shaSeq(), conflictsLeft: 0 };
    const A = createDevice({ appKey: APP_KEY, shared: store });
    const B = createDevice({ appKey: APP_KEY, shared: store, profile: 'barry' });

    A.add('synthetic-from-a');
    await A.settle();
    // B still holds the pre-add picture, exactly like a partner device that has not
    // pulled yet. Under the old whole-array PUT this is where A's item was erased.
    B.add('synthetic-from-b');
    await B.settle();

    const texts = store.remote.value.filter((t) => !t.deleted).map((t) => t.text).sort();
    check('T1 two concurrent adds both survive on the Worker',
      texts.length === 2 && texts.join(',') === 'synthetic-from-a,synthetic-from-b',
      `remote=[${texts.join(',')}]`);
    check('T1b the second device PUT the union, not just its own single item',
      B.ledger.putBodies.length === 1 && B.ledger.putBodies[0].todo.length === 2,
      `putItems=${B.ledger.putBodies.length ? B.ledger.putBodies[0].todo.length : 'n/a'}`);
    check('T1c T1 issued no GitHub request and no 409 was even needed',
      A.ledger.github.length === 0 && B.ledger.github.length === 0 &&
      B.methodsSince().join(',') === 'GET,PUT',
      `github=${A.ledger.github.length + B.ledger.github.length} bMethods=[${B.methodsSince().join(',')}]`);
  }

  // ── 4. T2 — one device completes an item while the other deletes a different one ──
  {
    const one = live('t1', 'synthetic-one', 'andjela', '2026-01-01');
    const two = live('t2', 'synthetic-two', 'andjela', '2026-01-02');
    const store = { remote: { sha: SHA_A, value: [one, two] }, nextSha: shaSeq(), conflictsLeft: 0 };
    // Both devices start from the same served snapshot, so B's copy is genuinely stale
    // with respect to A's toggle below.
    const A = createDevice({ appKey: APP_KEY, shared: store, seedTodo: [one, two] });
    const B = createDevice({ appKey: APP_KEY, shared: store, seedTodo: [one, two], profile: 'barry' });

    A.toggle('t1');
    await A.settle();
    B.del('t2');
    await B.settle();

    const byId = {};
    store.remote.value.forEach((t) => { byId[t.id] = t; });
    check('T2 A\'s completion of Todo 1 survives B\'s concurrent delete of Todo 2',
      !!byId.t1 && byId.t1.completed === true && byId.t1.completedBy === 'andjela',
      `t1.completed=${byId.t1 && byId.t1.completed} completedBy=${byId.t1 && byId.t1.completedBy}`);
    check('T2b Todo 2 is deleted on the Worker, as a tombstone rather than a vanished row',
      !!byId.t2 && byId.t2.deleted === true && byId.t2.deletedBy === 'barry' && !byId.t2.text,
      `t2.deleted=${byId.t2 && byId.t2.deleted} deletedBy=${byId.t2 && byId.t2.deletedBy}`);
    check('T2c neither item was lost to a whole-array overwrite',
      store.remote.value.length === 2 && !!byId.t1 && !!byId.t2,
      `remoteItems=${store.remote.value.length} ids=[${Object.keys(byId).sort().join(',')}]`);
    check('T2d the tombstone is kept in storage (so it can propagate) but not rendered',
      B.stored().some((t) => t.id === 't2' && t.deleted === true) &&
      B.list().some((t) => t.id === 't2'),
      `storedHasTombstone=${B.stored().some((t) => t.id === 't2')}`);
    check('T2e the delete propagated with no GitHub and no extra GET',
      B.ledger.github.length === 0 && B.methodsSince().join(',') === 'GET,PUT',
      `github=${B.ledger.github.length} methods=[${B.methodsSince().join(',')}]`);
  }

  // ── 5. T3 — a genuinely stale baseSha: 409, recover from the envelope, no extra GET ──
  {
    const partner = live('p1', 'synthetic-partner', 'barry', '2026-01-01');
    const d = createDevice({
      appKey: APP_KEY, remoteTodo: [partner], conflictsBeforeSuccess: 1,
      seedTodo: [live('m1', 'synthetic-mine', 'andjela', '2026-01-02')],
    });
    await d.push();
    const afterFirst = d.methodsSince();
    // runTimers() drains everything pending, which includes js/fix-stats.js's own
    // pre-existing progress-bar timers — hence the delta, not the raw count.
    const drained = d.runTimers();
    await d.settle();

    check('T3 a stale baseSha is answered 409 and the retry re-PUTs without an extra GET',
      afterFirst.join(',') === 'GET,PUT' && d.methodsSince().join(',') === 'GET,PUT,PUT' &&
      d.timersSince() === 1,
      `first=[${afterFirst.join(',')}] total=[${d.methodsSince().join(',')}] scheduledSince=${d.timersSince()} drained=${drained}`);
    // The two shas must differ: the first PUT used what this device read (SHA_A), the
    // retry must use what the 409 handed back. Equal shas would mean the client retried
    // under its own stale sha, which the store would reject forever.
    check('T3b the retry re-PUTs with the sha carried by the 409 envelope, not its own stale one',
      d.ledger.putBodies.length === 2 &&
      d.ledger.putBodies[0].baseSha === SHA_A &&
      d.ledger.putBodies[1].baseSha !== SHA_A,
      `baseShas=[${d.ledger.putBodies.map((b) => String(b.baseSha).slice(0, 8)).join(',')}]`);
    // The decisive data-safety property: the partner's item was only ever visible in the
    // 409 body, so if the recovery had re-used its own stale snapshot the partner's item
    // would be missing here.
    const texts = d.remote.value.filter((t) => !t.deleted).map((t) => t.text).sort();
    check('T3c the 409 recovery keeps both the partner item and this device item',
      texts.join(',') === 'synthetic-mine,synthetic-partner', `remote=[${texts.join(',')}]`);
    check('T3d the recovered push touched no GitHub', d.ledger.github.length === 0,
      `github=${d.ledger.github.length}`);
  }

  // ── 6. the retry cap holds at 3 attempts ──
  {
    const d = createDevice({
      appKey: APP_KEY, conflictsBeforeSuccess: 99,
      remoteTodo: [live('p1', 'synthetic-partner', 'barry', '2026-01-01')],
    });
    d.add('synthetic-mine');
    await d.settle();
    let rounds = 0;
    while (d.runTimers() > 0 && rounds < 10) { rounds++; await d.settle(); }
    const puts = d.ledger.methods.filter((m) => m === 'PUT').length;
    check('T-R1 repeated conflicts stop after the 3-attempt cap and schedule no further retry',
      puts === 3 && rounds <= 3 && d.ledger.github.length === 0,
      `puts=${puts} retryRounds=${rounds} github=${d.ledger.github.length}`);
    // The local list here holds the item added by this device *and* the partner item the
    // load-time pull brought in. A push that never lands must erase neither.
    const localTexts = d.list().filter((t) => !t.deleted).map((t) => t.text).sort();
    check('T-R2 a push that exhausts its retries keeps the local data and reports the cap',
      localTexts.join(',') === 'synthetic-mine,synthetic-partner' &&
      d.logs.some((l) => l.indexOf('WARN') === 0 && l.indexOf('上限') !== -1),
      `local=[${localTexts.join(',')}] cappedWarning=${d.logs.some((l) => l.indexOf('上限') !== -1)}`);
  }

  // ── 7. T4 — repeated pull/push converges, with no duplicate ids ──
  {
    const one = live('t1', 'synthetic-one', 'andjela', '2026-01-01');
    const two = Object.assign(live('t2', 'synthetic-two', 'barry', '2026-01-02'),
      { completed: true, completedBy: 'barry', completedAt: '2026-01-09' });
    const store = { remote: { sha: SHA_A, value: [one, two] }, nextSha: shaSeq(), conflictsLeft: 0 };
    const d = createDevice({ appKey: APP_KEY, shared: store, seedTodo: [one, two] });

    let digest = null, stable = true, unique = true;
    for (let i = 0; i < 4; i++) {
      await d.pull();
      await d.push();
      await d.settle();
      const ids = d.list().map((t) => t.id);
      const now = JSON.stringify(d.stored());
      if (new Set(ids).size !== ids.length) unique = false;
      if (digest === null) digest = now; else if (digest !== now) stable = false;
    }
    check('T4 four pull/push rounds produce no duplicate ids and a stable item count',
      unique && d.list().length === 2, `unique=${unique} count=${d.list().length}`);
    check('T4b the stored list is byte-identical across rounds — the merge converges',
      stable, `stable=${stable}`);
    check('T4c those rounds touched no GitHub', d.ledger.github.length === 0,
      `github=${d.ledger.github.length}`);
  }

  // ── 8. T5 — the 120s poll is registered and gated on the App Secret ──
  {
    const store = { remote: { sha: SHA_A, value: [live('t1', 'synthetic-one', 'andjela', '2026-01-01')] }, nextSha: shaSeq(), conflictsLeft: 0 };
    const d = createDevice({ appKey: APP_KEY, shared: store });
    const poll = d.intervals.filter((i) => i.ms === 120000);
    check('T5 the 120s Todo poll is registered', poll.length === 1,
      `intervals=[${d.intervals.map((i) => i.ms).join(',')}]`);
    const before = d.ledger.worker.length;
    const fired = d.fireIntervals(120000);
    await d.settle();
    check('T5b firing the poll performs a /todo pull with the App Secret',
      fired === 1 && d.ledger.worker.length > before &&
      d.ledger.methods[d.ledger.methods.length - 1] === 'GET' &&
      d.list().some((t) => t.id === 't1'),
      `fired=${fired} worker=${d.ledger.worker.length} items=${d.list().length}`);
    check('T5c the poll never consults the GitHub PAT',
      d.ledger.tokenCalls === 0 && d.ledger.github.length === 0,
      `getGitHubTokenCalls=${d.ledger.tokenCalls} github=${d.ledger.github.length}`);
    // And the gate is the secret, not the PAT: a device holding only a PAT does nothing.
    const p = createDevice({
      ghToken: GH_TOKEN,
      shared: { remote: { sha: SHA_A, value: [] }, nextSha: shaSeq(), conflictsLeft: 0 },
    });
    p.fireIntervals(120000);
    await p.settle();
    check('T5d the poll is gated on the App Secret — a device with only a PAT issues no request',
      p.ledger.worker.length === 0 && p.ledger.github.length === 0 && p.ledger.tokenCalls === 0,
      `worker=${p.ledger.worker.length} github=${p.ledger.github.length} patCalls=${p.ledger.tokenCalls}`);
  }

  // ── 9. the Worker being unreachable is a failure, never a fallback to GitHub ──
  {
    const d = createDevice({ appKey: APP_KEY, ghToken: GH_TOKEN, workerDown: true, remoteTodo: [] });
    d.add('synthetic-mine');
    await d.settle();
    check('T-N1 an unreachable Worker produces zero GitHub requests and keeps the local item',
      d.ledger.github.length === 0 && d.list().filter((t) => !t.deleted).length === 1 &&
      d.stored().filter((t) => !t.deleted).length === 1,
      `github=${d.ledger.github.length} localItems=${d.list().length}`);
    // Exactly one retry chain, not two: the failed pre-push GET must not schedule its
    // own retry on top of the one the failed PUT schedules, or the 3-attempt cap leaks.
    check('T-N2 the failure is surfaced and exactly one retry chain is scheduled',
      d.timersSince() === 1 && d.logs.some((l) => l.indexOf('WARN') === 0),
      `timersSince=${d.timersSince()} warned=${d.logs.some((l) => l.indexOf('WARN') === 0)}`);
    const d2 = createDevice({ appKey: APP_KEY, ghToken: GH_TOKEN, workerDown: true, remoteTodo: [] });
    await d2.pull();
    check('T-N3 a failed pull leaves the local list alone and still reaches no GitHub',
      d2.ledger.github.length === 0 && d2.list().length === 0,
      `github=${d2.ledger.github.length} items=${d2.list().length}`);
    // The cap has to hold when *everything* fails, not only when a PUT conflicts:
    // with the Worker unreachable both the pre-push GET and the PUT throw every round.
    let rounds = 0;
    while (d.runTimers() > 0 && rounds < 10) { rounds++; await d.settle(); }
    const puts = d.methodsSince().filter((m) => m === 'PUT').length;
    check('T-N4 with the Worker persistently down the PUT attempts still stop at the cap of 3',
      puts === 3 && rounds <= 3 && d.ledger.github.length === 0,
      `puts=${puts} rounds=${rounds} github=${d.ledger.github.length}`);
  }

  // ── 10. a failed pre-push GET must not become a blind overwrite ──
  // baseSha stays null in that branch, and the Worker's CAS treats null ≠ currentSha as
  // a conflict, so the partner's item cannot be erased by a device that failed to read.
  {
    const partner = live('p1', 'synthetic-partner', 'barry', '2026-01-01');
    const d = createDevice({
      appKey: APP_KEY, remoteTodo: [partner], failGetOnly: true,
      seedTodo: [live('m1', 'synthetic-mine', 'andjela', '2026-01-02')],
    });
    await d.push();
    check('T-G1 a failed pre-push GET sends baseSha:null and is refused with a 409, not accepted',
      d.ledger.putBodies.length === 1 && d.ledger.putBodies[0].baseSha === null &&
      d.remote.value.filter((t) => !t.deleted).length === 1,
      `baseSha=${String(d.ledger.putBodies[0].baseSha)} remoteItems=${d.remote.value.length}`);
    d.runTimers();
    await d.settle();
    const texts = d.remote.value.filter((t) => !t.deleted).map((t) => t.text).sort();
    check('T-G2 exactly one retry is scheduled, it recovers, and the partner item survives',
      d.timersSince() === 1 && texts.join(',') === 'synthetic-mine,synthetic-partner',
      `scheduledSince=${d.timersSince()} remote=[${texts.join(',')}]`);
  }

  // ── 11. field names and the tombstone shape are exactly as specified ──
  {
    const one = live('t1', 'synthetic-one', 'andjela', '2026-01-01');
    const store = { remote: { sha: SHA_A, value: [one] }, nextSha: shaSeq(), conflictsLeft: 0 };
    const d = createDevice({ appKey: APP_KEY, shared: store, seedTodo: [one] });
    d.toggle('t1');
    await d.settle();
    d.del('t1');
    await d.settle();
    const rec = d.list().find((t) => t.id === 't1');
    const other = createDevice({ appKey: APP_KEY, remoteTodo: [] });
    other.add('synthetic-x');
    await other.settle();
    const liveKeys = Object.keys(other.list()[0]).sort().join(',');
    check('T-S1 a live record keeps exactly its historical seven field names — no renames',
      liveKeys === LIVE_FIELDS.slice().sort().join(','), `keys=[${liveKeys}]`);
    const tombKeys = Object.keys(rec).sort().join(',');
    check('T-S2 a tombstone has exactly the four specified fields',
      tombKeys === TOMB_FIELDS.slice().sort().join(','), `keys=[${tombKeys}]`);
    check('T-S3 the tombstone carries a YYYY-MM-DD deletedAt, matching the existing date format',
      /^\d{4}-\d{2}-\d{2}$/.test(rec.deletedAt || '') && rec.deletedBy === 'andjela',
      `deletedAt=${rec.deletedAt} deletedBy=${rec.deletedBy}`);
    check('T-S4 the PUT body carries only baseSha + todo, with no credential and no repo path',
      d.ledger.putBodies.concat(other.ledger.putBodies).every((b) => {
        const s = JSON.stringify(b);
        return s.indexOf(APP_KEY) === -1 && s.indexOf('gh-token') === -1 &&
          s.indexOf('contents/') === -1 && Object.keys(b).sort().join(',') === 'baseSha,todo';
      }),
      `bodies=${d.ledger.putBodies.length + other.ledger.putBodies.length}`);
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
