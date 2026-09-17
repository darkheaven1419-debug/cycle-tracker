/**
 * Phase 2B — the Pull credential is the App Secret, and only the Pull credential.
 *
 * Phase 2B changed which stored key decides whether a pull may run. The property
 * under test is an *isolation* property with two halves:
 *   - ct-app-key alone is sufficient and necessary for every Pull gate;
 *   - gh-token neither enables a Pull nor is even read on the Pull path.
 *
 * Transport is stubbed here on purpose: that the pulled envelope really comes from
 * the Worker is already proven by tests/test-sync-merge.js (real Worker in-process)
 * and tests/test-phase2a-pull.js (real browser). This suite drives the gate itself,
 * including the 60s timer, deterministically and without a browser.
 *
 * Items covered: 1, 2, 3, 4, 6, 11, 12, 16.
 * Run: node tests/test-phase2b-auth.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js/sync.js'), 'utf8');
const APP = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
const I18N = fs.readFileSync(path.join(ROOT, 'js/i18n.js'), 'utf8');

const WORKER_HOST = 'cycle-tracker-data.cycletracker-barry.workers.dev';
const APP_KEY_STORAGE = 'ct-app-key';
const GH_TOKEN_STORAGE = 'gh-token';
// Synthetic credentials. Not the real secrets, and they guard nothing.
const APP_KEY = 'test-app-key-phase2b-00000000000000000000';
const GH_TOKEN = 'ghp_SYNTHETIC_PUSH_PAT_0000000000';

const ENVELOPE = {
  sha: 'e'.repeat(40),
  state: { gratitude: [{ text: 'synthetic-remote-gratitude', time: 1 }] },
};

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

/**
 * One vm "device" with its own localStorage. Every fetch is recorded per
 * transport, every localStorage read is recorded by key, and getGitHubToken is a
 * spy — so "the Pull path never consulted the PAT" is an observation, not a
 * reading of the source.
 */
function createDevice(opts) {
  opts = opts || {};
  const store = new Map();
  const ledger = { worker: [], github: [], reads: [], tokenCalls: 0, intervals: [] };

  function route(u) {
    const url = String(u);
    if (url.indexOf(WORKER_HOST) !== -1) {
      ledger.worker.push(url);
      return Promise.resolve(new Response(JSON.stringify(ENVELOPE), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      }));
    }
    if (url.indexOf('api.github.com') !== -1) {
      ledger.github.push(url);
      return Promise.resolve(new Response('{}', {
        status: 200, headers: { 'Content-Type': 'application/json' },
      }));
    }
    return Promise.reject(new Error('unexpected fetch: ' + url));
  }

  const sandbox = {
    localStorage: {
      getItem: (k) => { ledger.reads.push(String(k)); return store.has(k) ? store.get(k) : null; },
      setItem: (k, v) => { store.set(k, String(v)); },
      removeItem: (k) => { store.delete(k); },
    },
    document: { getElementById: () => null, addEventListener: () => {}, removeEventListener: () => {} },
    window: {},
    console: { log: () => {}, warn: () => {}, error: () => {} },
    fetch: (u) => route(u),
    // The Push credential, as a spy. Present on every device so that a Pull that
    // reached for the PAT would be caught rather than throw.
    getGitHubToken: function () { ledger.tokenCalls++; return opts.ghTokenValue || ''; },
    btoa: globalThis.btoa, atob: globalThis.atob,
    escape: globalThis.escape, unescape: globalThis.unescape,
    setTimeout: () => 0, clearTimeout: () => {},
    setInterval: (fn, ms) => { ledger.intervals.push({ fn, ms }); return ledger.intervals.length; },
    clearInterval: () => {},
  };
  const ctx = vm.createContext(sandbox);
  vm.runInContext(SRC + '\n;globalThis.__Sync = SyncModule;', ctx, { filename: 'sync.js' });

  if (opts.appKey) store.set(APP_KEY_STORAGE, opts.appKey);
  if (opts.ghToken) store.set(GH_TOKEN_STORAGE, GH_TOKEN);

  return {
    ledger,
    S: vm.runInContext('__Sync', ctx),
    globalAppSecret: () => vm.runInContext('typeof getAppSecret === "function" ? getAppSecret() : null', ctx),
    readKeys: () => new Set(store.keys()),
    /** Clears the observation ledgers so the next assertion covers only its own call. */
    reset() { ledger.worker.length = 0; ledger.github.length = 0; ledger.reads.length = 0; ledger.tokenCalls = 0; },
    async pull() { await vm.runInContext('pullAllSharedData()', ctx); },
    async push() { await vm.runInContext('pushAllSharedData()', ctx); },
  };
}

const tick = () => new Promise((r) => setTimeout(r, 30));
const has = (arr, needle) => arr.some((x) => String(x).indexOf(needle) !== -1);

(async () => {
  // ── 1. ct-app-key alone is enough for a Pull ──
  {
    const d = createDevice({ appKey: APP_KEY, ghTokenValue: '' });
    d.reset();
    await d.pull();
    check('B1 an App Secret alone lets a Pull reach the Worker',
      d.ledger.worker.length >= 1 && d.globalAppSecret() === APP_KEY,
      `worker=${d.ledger.worker.length} secretPresent=${!!d.globalAppSecret()}`);
  }

  // ── 2. no ct-app-key and no gh-token: no Worker request at all ──
  {
    const d = createDevice({});
    d.reset();
    await d.pull();
    check('B2 with no stored credential a Pull issues no Worker request',
      d.ledger.worker.length === 0 && d.ledger.github.length === 0,
      `worker=${d.ledger.worker.length} github=${d.ledger.github.length}`);
  }

  // ── 3. gh-token alone must NOT unlock the Pull ──
  {
    const d = createDevice({ ghToken: GH_TOKEN, ghTokenValue: GH_TOKEN });
    d.reset();
    await d.pull();
    check('B3 a stored GitHub PAT alone does not unlock a Pull',
      d.ledger.worker.length === 0,
      `worker=${d.ledger.worker.length} ghTokenStored=${d.readKeys().has(GH_TOKEN_STORAGE)}`);
  }

  // ── 4. ct-app-key without any gh-token still pulls ──
  {
    const d = createDevice({ appKey: APP_KEY, ghTokenValue: '' });
    d.reset();
    await d.pull();
    check('B4 an App Secret with no GitHub PAT on the device still pulls',
      d.ledger.worker.length >= 1 && !d.readKeys().has(GH_TOKEN_STORAGE),
      `worker=${d.ledger.worker.length} ghTokenStored=${d.readKeys().has(GH_TOKEN_STORAGE)}`);
  }

  // ── 5. the Pull path never reads the Push credential (item 11) ──
  // The device has a *valid-looking* PAT available, so the only reason it goes
  // untouched is that the Pull path does not want it.
  {
    const d = createDevice({ appKey: APP_KEY, ghToken: GH_TOKEN, ghTokenValue: GH_TOKEN });
    d.reset();
    await d.pull();
    const readGhToken = d.ledger.reads.filter((k) => k === GH_TOKEN_STORAGE).length;
    check('B5 a Pull neither calls getGitHubToken nor reads localStorage[gh-token]',
      d.ledger.worker.length >= 1 && d.ledger.tokenCalls === 0 && readGhToken === 0,
      `worker=${d.ledger.worker.length} getGitHubTokenCalls=${d.ledger.tokenCalls} ghTokenReads=${readGhToken}`);
  }

  // ── 6. a Pull never contacts GitHub (item 12) ──
  {
    const d = createDevice({ appKey: APP_KEY, ghToken: GH_TOKEN, ghTokenValue: GH_TOKEN });
    d.reset();
    await d.pull();
    check('B6 a Pull issues zero api.github.com requests',
      d.ledger.github.length === 0 && d.ledger.worker.length >= 1,
      `github=${d.ledger.github.length} worker=${d.ledger.worker.length}`);
  }

  // ── 7. the 60s timer is gated on the App Secret (item 6) ──
  {
    const d = createDevice({ appKey: APP_KEY, ghTokenValue: '' });
    d.reset();
    d.S.startAutoPull();
    const sixty = d.ledger.intervals.filter((i) => i.ms === 60000);
    const fired = sixty.map((i) => { try { i.fn(); return 'ok'; } catch (e) { return 'threw:' + e.message; } });
    await tick();
    check('B7 the 60s auto-pull fires a Pull when the App Secret is present',
      sixty.length === 1 && fired.every((f) => f === 'ok') && d.ledger.worker.length >= 1,
      `timers=${sixty.length} fired=[${fired.join(',')}] worker=${d.ledger.worker.length}`);
    d.S.stopAutoPull();
  }

  // ── 8. the same timer stays silent without it — and a PAT does not wake it ──
  {
    const d = createDevice({ ghToken: GH_TOKEN, ghTokenValue: GH_TOKEN });
    d.reset();
    d.S.startAutoPull();
    const sixty = d.ledger.intervals.filter((i) => i.ms === 60000);
    sixty.forEach((i) => { try { i.fn(); } catch (e) { /* recorded by the assertion below */ } });
    await tick();
    check('B8 the 60s auto-pull stays silent when only a GitHub PAT is stored',
      sixty.length === 1 && d.ledger.worker.length === 0 && d.ledger.github.length === 0,
      `timers=${sixty.length} worker=${d.ledger.worker.length} github=${d.ledger.github.length}`);
    d.S.stopAutoPull();
  }

  // ── 9. the Push path uses the App Secret, never the PAT and never GitHub (2C) ──
  // Supersedes the Phase 2B form of this check, which asserted the opposite: that a
  // Push still obtained the PAT and wrote to GitHub, because 2B had migrated Pull
  // only. Phase 2C moved Push to the Worker, so the PAT is no longer consulted at
  // all. The device below still has a *valid-looking* PAT available.
  {
    const d = createDevice({ appKey: APP_KEY, ghToken: GH_TOKEN, ghTokenValue: GH_TOKEN });
    d.reset();
    await d.push();
    check('B9 a Push reaches the Worker with the App Secret and calls neither getGitHubToken nor GitHub',
      d.ledger.worker.length === 2 && d.ledger.tokenCalls === 0 && d.ledger.github.length === 0,
      `worker=${d.ledger.worker.length} getGitHubTokenCalls=${d.ledger.tokenCalls} github=${d.ledger.github.length}`);
  }

  // ── 10. the App Secret alone is enough to push; a PAT alone is enough for nothing ──
  {
    const d = createDevice({ appKey: APP_KEY, ghTokenValue: '' });
    d.reset();
    await d.push();
    check('B10 a Push works off the App Secret with no GitHub PAT on the device',
      d.ledger.worker.length === 2 && d.ledger.github.length === 0,
      `worker=${d.ledger.worker.length} github=${d.ledger.github.length}`);
  }
  {
    const d = createDevice({ ghToken: GH_TOKEN, ghTokenValue: GH_TOKEN });
    d.reset();
    await d.push();
    check('B10b with only a GitHub PAT a Push does nothing at all — no Worker, and no GitHub fallback',
      d.ledger.worker.length === 0 && d.ledger.github.length === 0,
      `worker=${d.ledger.worker.length} github=${d.ledger.github.length}`);
  }

  // ── 11. the Pull gates in app.js are all keyed on the App Secret (items 5/7/8 source form) ──
  {
    // The four Pull gates in app.js: profile switch, partner diary, boot, symptoms tab.
    const gate = /if \(typeof getAppSecret === 'function' && getAppSecret\(\)\)/g;
    const gateNegated = /if \(typeof getAppSecret !== 'function' \|\| !getAppSecret\(\)\) return;/g;
    const nGate = (APP.match(gate) || []).length;
    const nNeg = (APP.match(gateNegated) || []).length;
    // No Pull gate may still be guarded by the Push credential.
    const tokenGatedPull = (APP.match(/if \(typeof getGitHubToken === 'function' && getGitHubToken\(\)\)/g) || []).length;
    check('B11 every app.js Pull gate is keyed on the App Secret, none on the PAT',
      nGate >= 3 && nNeg >= 1 && tokenGatedPull === 0,
      `appSecretGates=${nGate} appSecretNegatedGuards=${nNeg} patGatedPullGates=${tokenGatedPull}`);
  }

  // ── 12. the 60s gate in sync.js no longer consults the PAT ──
  {
    const at = SRC.indexOf('_startAutoPull');
    const autoPull = SRC.slice(at, at + 900);
    check('B12 the auto-pull gate in sync.js no longer mentions getGitHubToken',
      autoPull.indexOf('getAppSecret') !== -1 && autoPull.indexOf('getGitHubToken') === -1,
      `hasAppSecret=${autoPull.indexOf('getAppSecret') !== -1} hasGitHubToken=${autoPull.indexOf('getGitHubToken') !== -1}`);
  }

  // ── 13. three-language auth strings exist, and none of them says "GitHub Token" (item 16) ──
  {
    const KEYS = ['tokenSaved', 'tokenValid', 'tokenInvalid', 'tokenMissing', 'tokenConfirmClear',
      'tokenCleared', 'settingsTokenLabel', 'settingsTokenHintEnabled', 'settingsTokenHintDisabled'];
    const CJK = /[一-鿿]/;
    const bad = [];
    for (const key of KEYS) {
      const hits = [...I18N.matchAll(new RegExp(key + ':"([^"]*)"', 'g'))].map((m) => m[1]);
      if (hits.length !== 3) { bad.push(`${key}:${hits.length}`); continue; }
      const hasZh = hits.some((v) => CJK.test(v));
      const hasLatin = hits.some((v) => !CJK.test(v));
      // sr and en are both Latin; require the three values to be mutually distinct
      // so a copy-paste that left English in the Serbian slot is caught.
      if (!hasZh || !hasLatin || new Set(hits).size !== 3) bad.push(`${key}:langs`);
    }
    check('B13 all nine auth strings exist in three distinct languages',
      bad.length === 0, bad.length ? 'bad=' + bad.join(',') : `keys=${KEYS.length}`);

    const label = [...I18N.matchAll(/settingsTokenLabel:"([^"]*)"/g)].map((m) => m[1]);
    check('B14 the settings label names the App Secret, not a GitHub token',
      label.length === 3 && label.every((v) => v.indexOf('App Secret') !== -1) &&
      I18N.indexOf('GitHub Token') === -1,
      `labels=${JSON.stringify(label)} githubTokenMentions=${I18N.split('GitHub Token').length - 1}`);
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
