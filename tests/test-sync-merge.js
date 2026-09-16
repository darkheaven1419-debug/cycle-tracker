/**
 * Phase 3 test — gratitude / gratitudeEcho merge safety in the sync layer.
 *
 * Two independent vm "devices" share one in-memory fake GitHub Contents API, so
 * push()/pull() run for real (including the pre-push fetch + merge) without a
 * browser. Every device has its own localStorage; the remote is the only thing
 * they have in common.
 *
 * Run: node tests/test-sync-merge.js
 *
 * The property under test is that neither direction of a sync can destroy the
 * other side's fresh content: A's push must not drop B's new note, B's push must
 * not drop A's new reaction, and near-simultaneous writes must union.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js/sync.js'), 'utf8');

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

/** Host-realm copy of a vm-realm value, so assertions compare plain data. */
const j = (x) => JSON.parse(JSON.stringify(x));

// ── fake GitHub Contents API ──
function createRemote() {
  const api = {
    content: null,   // the shared-state.json blob, or null when the file does not exist yet
    sha: 0,
    offline: false,
    conflicts: 0,
    writes: 0,
    async fetch(url, opts) {
      if (api.offline) throw new Error('offline');
      const method = (opts && opts.method) || 'GET';
      if (method === 'GET') {
        if (api.content === null) return { status: 404, ok: false, statusText: 'Not Found' };
        return {
          status: 200, ok: true,
          json: async () => ({
            sha: 'sha' + api.sha,
            content: Buffer.from(JSON.stringify(api.content), 'utf8').toString('base64'),
          }),
        };
      }
      const body = JSON.parse(opts.body);
      const current = api.content === null ? undefined : 'sha' + api.sha;
      if (body.sha !== current) { api.conflicts++; return { status: 409, ok: false, statusText: 'Conflict' }; }
      api.content = JSON.parse(Buffer.from(body.content, 'base64').toString('utf8'));
      api.sha++; api.writes++;
      return { status: 200, ok: true, json: async () => ({}) };
    },
  };
  return api;
}

// ── one "device": its own localStorage, shares the remote ──
function createDevice(name, remote) {
  const store = new Map();
  const logs = [];
  const timers = [];
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
    fetch: (url, opts) => remote.fetch(url, opts),
    getGitHubToken: () => 'test-token',
    btoa: globalThis.btoa, atob: globalThis.atob,
    escape: globalThis.escape, unescape: globalThis.unescape,
    // Fake timers: push()/pull() schedule retries via setTimeout. Recording them
    // instead of running them keeps the test synchronous and leak-free.
    setTimeout: (fn, ms) => { timers.push(ms); return 0; },
    clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {},
  };
  const ctx = vm.createContext(sandbox);
  vm.runInContext(SRC + '\n;globalThis.__Sync = SyncModule;', ctx, { filename: 'sync.js' });
  return {
    name, logs, timers,
    S: vm.runInContext('__Sync', ctx),
    set(k, v) { store.set(k, JSON.stringify(v)); },
    get(k) { const r = store.get(k); return r === undefined ? null : JSON.parse(r); },
  };
}

const note = (from, time, text) => ({ text, from, time });
const echo = (noteFrom, noteTime, from, emoji, time) => ({ noteFrom, noteTime, from, emoji, time });

(async () => {
  // ════ Unit: merge rules ════
  {
    const d = createDevice('unit', createRemote());
    const M = d.S;

    // U1 — disjoint union, ordered oldest first
    {
      const out = j(M.mergeGratitude([note('a', 1000, 'A')], [note('b', 2000, 'B')]));
      check('U1 disjoint gratitude unions both sides, oldest first',
        out.length === 2 && out[0].text === 'A' && out[1].text === 'B', JSON.stringify(out));
    }

    // U2 — the same note on both devices stays a single note
    {
      const out = j(M.mergeGratitude([note('a', 1000, 'A')], [note('a', 1000, 'A')]));
      check('U2 identical note is not duplicated', out.length === 1, JSON.stringify(out));
    }

    // U3 — legacy notes without a usable timestamp survive on both sides
    {
      const out = j(M.mergeGratitude([{ text: 'old', from: 'a' }], [{ text: 'older', from: 'b' }]));
      check('U3 timestamp-less legacy notes are kept, not dropped',
        out.length === 2 && out.map((n) => n.text).sort().join(',') === 'old,older', JSON.stringify(out));
    }

    // U4 — garbage in, no throw, no data loss
    {
      const a = M.mergeGratitude(null, [note('a', 1, 'A')]);
      const b = M.mergeGratitude([note('a', 1, 'A')], 'nonsense');
      const c = M.mergeGratitude(undefined, undefined);
      const e = M.mergeEcho(null, [{ noteFrom: 'a', noteTime: 1, from: 'b', emoji: '❤️', time: 2 }, null, 7]);
      check('U4 malformed input never throws and never loses entries',
        j(a).length === 1 && j(b).length === 1 && j(c).length === 0 && j(e).length === 1,
        `a=${j(a).length} b=${j(b).length} c=${j(c).length} e=${j(e).length}`);
    }

    // U5 — the 20-note window addGratitude() already applies locally is preserved
    {
      const local = [], remote = [];
      for (let i = 0; i < 20; i++) local.push(note('a', i, 'L' + i));
      for (let i = 0; i < 20; i++) remote.push(note('b', 100 + i, 'R' + i));
      const out = j(M.mergeGratitude(local, remote));
      // 40 candidates, times 0-19 (local) and 100-119 (remote); the newest 20 are
      // exactly the remote batch, and every local one is dropped as the oldest.
      check('U5 union is capped to the newest 20 like addGratitude()',
        out.length === 20 && out[0].text === 'R0' && out[19].text === 'R19' &&
        out.every((n) => n.text[0] === 'R'),
        `n=${out.length} first=${out[0].text} last=${out[19].text}`);
    }

    // U6 — idempotent reaction: one record per (note, person)
    {
      const r = echo('a', 1000, 'barry', '❤️', 5000);
      const out = j(M.mergeEcho([r], [r]));
      check('U6 re-reacting with the same emoji is idempotent', out.length === 1, JSON.stringify(out));
    }

    // U7 — a conflicting record resolves by time, and resolves the same on both sides
    {
      const older = echo('a', 1000, 'barry', '❤️', 5000);
      const newer = echo('a', 1000, 'barry', '😘', 6000);
      const ab = j(M.mergeEcho([older], [newer]));
      const ba = j(M.mergeEcho([newer], [older]));
      check('U7 same-key conflict converges on the newer record from either side',
        ab.length === 1 && ab[0].emoji === '😘' && ba.length === 1 && ba[0].emoji === '😘',
        `ab=${ab[0].emoji} ba=${ba[0].emoji}`);
    }

    // U8 — the dedupe index must not be fooled by inherited Object properties
    {
      const out = j(M.mergeByTimeKey(
        [{ k: 'constructor', v: 1 }], [{ k: 'constructor', v: 2 }],
        (x) => x.k, () => 1, 0));
      check('U8 a key named "constructor" does not collide with Object.prototype',
        out.length === 1, JSON.stringify(out));
    }
  }

  // ════ Two devices, one remote ════
  const fresh = () => {
    const remote = createRemote();
    return { remote, A: createDevice('A', remote), B: createDevice('B', remote) };
  };

  // D1 — the plain happy path
  {
    const { remote, A, B } = fresh();
    A.set('shared-gratitude', [note('andjela', 1000, 'od A')]);
    await A.S.push();
    await B.S.pull();
    const b = B.get('shared-gratitude');
    check('D1 A writes, A pushes, B pulls → B has it',
      b.length === 1 && b[0].text === 'od A' && remote.content.gratitude.length === 1, JSON.stringify(b));
  }

  // D2 — near-simultaneous writes from both sides
  {
    const { remote, A, B } = fresh();
    A.set('shared-gratitude', [note('andjela', 1000, 'od A')]);
    B.set('shared-gratitude', [note('barry', 2000, 'od B')]);
    await A.S.push();
    await B.S.push();   // B pushes without pulling first
    await A.S.pull();
    const a = A.get('shared-gratitude'), b = B.get('shared-gratitude');
    check('D2 near-simultaneous writes union on both devices and on the remote',
      a.length === 2 && b.length === 2 && remote.content.gratitude.length === 2,
      `A=${a.map((n) => n.text)} B=${b.map((n) => n.text)} remote=${remote.content.gratitude.length}`);
  }

  // D3 — THE clobber case: A's push must not erase what B already pushed
  {
    const { remote, A, B } = fresh();
    B.set('shared-gratitude', [note('barry', 5000, 'B fresh')]);
    await B.S.push();

    A.set('shared-gratitude', [note('andjela', 1000, 'A stale')]); // A never pulled since
    await A.S.push();

    const texts = remote.content.gratitude.map((n) => n.text).sort().join(',');
    check("D3 A's push does not overwrite B's fresh note on the remote",
      texts === 'A stale,B fresh', texts);
  }

  // D4 — reaction travels A → B
  {
    const { A, B } = fresh();
    A.set('shared-gratitude', [note('andjela', 1000, 'note1')]);
    await A.S.push();
    await B.S.pull();

    A.set('shared-gratitude-echo', [echo('andjela', 1000, 'barry', '❤️', 5000)]);
    await A.S.push();
    await B.S.pull();
    const b = B.get('shared-gratitude-echo');
    check('D4 A reacts, B pulls → B sees the reaction',
      b.length === 1 && b[0].emoji === '❤️' && b[0].from === 'barry', JSON.stringify(b));
  }

  // D5 — near-simultaneous reactions from both sides
  {
    const { remote, A, B } = fresh();
    A.set('shared-gratitude', [note('andjela', 1000, 'note1')]);
    await A.S.push();
    await B.S.pull();

    A.set('shared-gratitude-echo', [echo('andjela', 1000, 'barry', '❤️', 5000)]);
    B.set('shared-gratitude-echo', [echo('andjela', 1000, 'andjela', '😘', 5001)]);
    await A.S.push();
    await B.S.push();
    await A.S.pull();

    const key = (x) => x.from + x.emoji;
    const a = A.get('shared-gratitude-echo').map(key).sort().join(','),
      b = B.get('shared-gratitude-echo').map(key).sort().join(',');
    check('D5 near-simultaneous reactions union on both devices',
      a === 'andjela😘,barry❤️' && b === a && remote.content.gratitudeEcho.length === 2,
      `A=[${a}] B=[${b}] remote=${remote.content.gratitudeEcho.length}`);
  }

  // D6 — a pull must not erase what this device wrote locally but never pushed
  {
    const { remote, A } = fresh();
    remote.content = { gratitude: [note('barry', 2000, 'from remote')] };
    A.set('shared-gratitude', [note('andjela', 1000, 'written offline')]);
    await A.S.pull();
    const a = A.get('shared-gratitude').map((n) => n.text).sort().join(',');
    check('D6 pull merges instead of replacing, so unpushed local notes survive',
      a === 'from remote,written offline', a);
  }

  // D7 — offline push leaves local data intact and recovers when back online
  {
    const { remote, A } = fresh();
    A.set('shared-gratitude', [note('andjela', 1000, 'offline note')]);
    remote.offline = true;
    await A.S.push();
    const intact = A.get('shared-gratitude');
    check('D7a offline push keeps local data intact and throws nothing',
      intact.length === 1 && A.timers.length > 0, `n=${intact.length} retries=${A.timers.length}`);

    remote.offline = false;
    await A.S.push();
    check('D7b back online, the same data lands on the remote',
      remote.content && remote.content.gratitude.length === 1, JSON.stringify(remote.content && remote.content.gratitude));
  }

  // D8 — repeated taps stay idempotent across the wire
  {
    const { remote, A, B } = fresh();
    A.set('shared-gratitude', [note('andjela', 1000, 'note1')]);
    await A.S.push();
    await B.S.pull();

    A.set('shared-gratitude-echo', [echo('andjela', 1000, 'andjela', '👍', 5000)]);
    await A.S.push();
    A.set('shared-gratitude-echo', [echo('andjela', 1000, 'andjela', '👍', 5000)]); // tapped again
    await A.S.push();
    await B.S.pull();
    check('D8 repeated taps produce exactly one record on both devices',
      A.get('shared-gratitude-echo').length === 1 && B.get('shared-gratitude-echo').length === 1 &&
      remote.content.gratitudeEcho.length === 1,
      `A=${A.get('shared-gratitude-echo').length} B=${B.get('shared-gratitude-echo').length} remote=${remote.content.gratitudeEcho.length}`);
  }

  // D9 — legacy remote state: no echo key at all, gratitude entries without time
  {
    const { remote, A } = fresh();
    remote.content = { gratitude: [{ text: 'legacy note', from: 'barry' }] };
    A.set('shared-gratitude', [{ text: 'legacy mine', from: 'andjela' }]);
    A.set('shared-gratitude-echo', [echo('barry', 0, 'andjela', '🥰', 10)]);
    await A.S.pull();
    const g = A.get('shared-gratitude'), e = A.get('shared-gratitude-echo');
    check('D9 legacy remote (no echo key, no timestamps) merges without loss',
      g.length === 2 && e.length === 1, `gratitude=${JSON.stringify(g)} echo=${e.length}`);
  }

  // D10 — diary merge semantics are untouched
  {
    const { remote, A } = fresh();
    remote.content = {
      gratitude: [],
      diary: { '2026-01-01': { andjela: { text: 'remote-a' } }, '2026-01-02': { barry: { text: 'remote-b' } } },
    };
    A.set('shared-diary', { '2026-01-01': { andjela: { text: 'local-a' } } });
    await A.S.pull();
    const d = A.get('shared-diary');
    check('D10 diary keeps its own semantics: local wins same day, remote-only day added',
      d['2026-01-01'].andjela.text === 'local-a' && d['2026-01-02'].barry.text === 'remote-b',
      JSON.stringify(d));
  }

  // D11 — other shared fields keep their existing replace behaviour
  {
    const { remote, A } = fresh();
    remote.content = { songs: { barry: { title: 'remote song' } }, gratitude: [] };
    A.set('shared-song-barry', { title: 'local song' });
    await A.S.pull();
    check('D11 unrelated shared fields are still replaced, not merged',
      A.get('shared-song-barry').title === 'remote song', JSON.stringify(A.get('shared-song-barry')));
  }

  // D12 — the cap also holds through a real sync
  {
    const { remote, A } = fresh();
    remote.content = { gratitude: [] };
    for (let i = 0; i < 20; i++) remote.content.gratitude.push(note('barry', 1000 + i, 'R' + i));
    const local = [];
    for (let i = 0; i < 20; i++) local.push(note('andjela', 5000 + i, 'L' + i));
    A.set('shared-gratitude', local);
    await A.S.push();
    const g = A.get('shared-gratitude');
    check('D12 sync path also caps gratitude at 20, newest kept',
      g.length === 20 && g[19].text === 'L19', `n=${g.length} last=${g[19] && g[19].text}`);
  }

  // D13 — a stale sha must never silently overwrite: the conflict path re-pulls
  {
    const { remote, A, B } = fresh();
    A.set('shared-gratitude', [note('andjela', 1000, 'A note')]);
    await A.S.push();
    B.set('shared-gratitude', [note('barry', 2000, 'B note')]);
    await B.S.push();
    // A re-pushes: it fetches the current sha first, so nothing is lost
    await A.S.push();
    const texts = remote.content.gratitude.map((n) => n.text).sort().join(',');
    check('D13 push against a stale local view merges rather than clobbering',
      texts === 'A note,B note' && remote.conflicts === 0, `remote=[${texts}] conflicts=${remote.conflicts}`);
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
