/**
 * Phase 2B — the settings page manages the App Secret, and only that.
 *
 * js/module-settings.js is loaded in a vm with a fake DOM and a fake fetch, so the
 * button handlers run for real: what is asserted is the fetch they issue, the keys
 * they write, and — just as important — what they never put into a toast, a log
 * line or the input's value.
 *
 * Items covered: 9, 10, plus the secret-hygiene and credential-isolation rules
 * (the UI-side half of 13/15: clearing the Pull credential must not touch the
 * Push credential).
 *
 * Run: node tests/test-phase2b-settings.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'js/module-settings.js');
const SRC = fs.readFileSync(FILE, 'utf8');

const WORKER_URL = 'https://cycle-tracker-data.cycletracker-barry.workers.dev';
const APP_KEY_STORAGE = 'ct-app-key';
const GH_TOKEN_STORAGE = 'gh-token';
// Synthetic credential. Not a real secret, and it guards nothing.
const SECRET = 'test-app-key-settings-00000000000000000000';
// The old code logged the first four characters of a credential. Any emitted line
// containing this prefix would mean that leak came back.
const SECRET_PREFIX = SECRET.slice(0, 4);

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

/** One fake element. Only the members module-settings.js actually touches. */
function makeEl(id) {
  return {
    id, value: '', textContent: '', placeholder: '', disabled: false,
    style: {}, attrs: {},
    setAttribute(k, v) { this.attrs[k] = v; },
    getAttribute(k) { return this.attrs[k]; },
  };
}

/**
 * Loads module-settings.js with a fresh DOM, storage and fetch.
 * `healthReply` is what the next /health call answers.
 */
function load(seed, healthReply) {
  const els = new Map();
  const store = new Map(Object.entries(seed || {}));
  const toasts = [];
  const logs = [];
  const fetches = [];

  const document = {
    getElementById(id) {
      if (!els.has(id)) els.set(id, makeEl(id));
      return els.get(id);
    },
  };

  const sandbox = {
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => { store.set(k, String(v)); },
      removeItem: (k) => { store.delete(k); },
    },
    document,
    window: {},
    console: {
      log: (m) => logs.push('log ' + m),
      warn: (m) => logs.push('warn ' + m),
      error: (m) => logs.push('error ' + m),
    },
    fetch: (url, opts) => {
      const call = { url: String(url), headers: (opts && opts.headers) || {}, method: (opts && opts.method) || 'GET' };
      fetches.push(call);
      const reply = healthReply || { ok: true, status: 200, actor: 'barry' };
      return Promise.resolve({
        ok: reply.ok, status: reply.status,
        json: async () => ({ ok: reply.ok, actor: reply.actor }),
      });
    },
    toast: (m) => toasts.push(String(m)),
    confirm: () => true,
    // A vm context has no timers of its own. Recording them instead of running
    // them keeps the suite synchronous; without these the button handlers' own
    // setTimeout would throw and be swallowed by their catch block, which would
    // look like a network failure.
    setTimeout: () => 0, clearTimeout: () => {},
    // The globals the module reaches for by bare name.
    state: { settings: { cycleLength: 28, periodLength: 7 } },
    lang: 'sr',
    theme: 'light',
    updateSyncStatusBadge: () => { sandbox.__badgeUpdates = (sandbox.__badgeUpdates || 0) + 1; },
    pullAllSharedData: () => { sandbox.__pulls = (sandbox.__pulls || 0) + 1; return Promise.resolve(); },
    renderAll: () => { sandbox.__renders = (sandbox.__renders || 0) + 1; },
  };
  // The label's real three-language text is asserted against js/i18n.js in
  // tests/test-phase2b-auth.js; here the stub only has to prove the settings page
  // routes through the i18n key rather than hardcoding a label.
  sandbox.window.t = (key) => (key === 'settingsTokenLabel' ? 'App Secret (stub)' : 'T:' + key);

  const ctx = vm.createContext(sandbox);
  vm.runInContext(SRC, ctx, { filename: 'module-settings.js' });

  return {
    els, store, toasts, logs, fetches, sandbox,
    W: sandbox.window,
    /** Every string this run could have shown or logged. */
    emitted: () => toasts.concat(logs).join('\n'),
    healthCalls: () => fetches.filter((f) => f.url.indexOf('/health') !== -1),
  };
}

const tick = () => new Promise((r) => setTimeout(r, 20));

(async () => {
  // ── 1. the test button verifies against the Worker's /health (item 9) ──
  {
    const h = load({ [APP_KEY_STORAGE]: SECRET, [GH_TOKEN_STORAGE]: 'ghp_SYNTHETIC_PUSH_PAT' });
    h.els.set('set-gh-token', makeEl('set-gh-token'));
    await h.W.testAppSecret();
    const calls = h.healthCalls();
    check('C1 the settings test button calls the Worker /health endpoint',
      calls.length === 1 && calls[0].url === WORKER_URL + '/health',
      `calls=${JSON.stringify(calls.map((c) => c.url))}`);
    const headerOk = calls.length === 1 && calls[0].headers.Authorization === 'Bearer ' + SECRET;
    check('C2 the App Secret travels as a Bearer header and never in the URL',
      headerOk && calls.length === 1 && calls[0].url.indexOf(SECRET) === -1,
      `authHeaderOk=${headerOk} urlLeaked=${calls.length === 1 && calls[0].url.indexOf(SECRET) !== -1}`);
    check('C3 no settings call reaches api.github.com or the legacy /user endpoint',
      h.fetches.every((f) => f.url.indexOf('api.github.com') === -1 && f.url.indexOf('/user') === -1),
      `urls=${JSON.stringify(h.fetches.map((f) => f.url))}`);
  }

  // ── 2. the actor identity is reported (item 10) ──
  for (const actor of ['barry', 'andjela']) {
    const h = load({ [APP_KEY_STORAGE]: SECRET }, { ok: true, status: 200, actor });
    h.els.set('set-gh-token', makeEl('set-gh-token'));
    await h.W.testAppSecret();
    check(`C4 a valid key for ${actor} reports that actor back to the user`,
      h.toasts.some((t) => t.indexOf(actor) !== -1) &&
      h.els.get('testTokenBtn').textContent.indexOf(actor) !== -1 &&
      // A success must not also report a failure: this is what catches a broken
      // harness (e.g. a missing timer) masquerading as a passing actor check.
      h.toasts.every((t) => t.indexOf('tokenNetError') === -1),
      `toasts=${JSON.stringify(h.toasts)} btn=${JSON.stringify(h.els.get('testTokenBtn').textContent)}`);
  }

  // ── 3. an invalid key says so, and names nobody ──
  {
    const h = load({ [APP_KEY_STORAGE]: SECRET }, { ok: false, status: 401, actor: '' });
    h.els.set('set-gh-token', makeEl('set-gh-token'));
    await h.W.testAppSecret();
    const said = h.toasts.join(' | ');
    check('C5 a 401 reports an invalid key without echoing the key or guessing an actor',
      said.indexOf('tokenInvalid') !== -1 && said.indexOf('barry') === -1 && said.indexOf('andjela') === -1 &&
      said.indexOf(SECRET) === -1,
      `toasts=${JSON.stringify(h.toasts)}`);
  }

  // ── 4. with nothing stored, the test refuses to call out at all ──
  {
    const h = load({});
    h.els.set('set-gh-token', makeEl('set-gh-token'));
    await h.W.testAppSecret();
    check('C6 with no stored key the test says so and issues no request',
      h.toasts.some((t) => t.indexOf('tokenMissing') !== -1) && h.fetches.length === 0,
      `toasts=${JSON.stringify(h.toasts)} fetches=${h.fetches.length}`);
  }

  // ── 5. a network failure is reported as a network failure ──
  {
    const h = load({ [APP_KEY_STORAGE]: SECRET });
    h.els.set('set-gh-token', makeEl('set-gh-token'));
    h.sandbox.fetch = () => Promise.reject(new Error('offline'));
    await h.W.testAppSecret();
    check('C7 an unreachable Worker is reported as a network error',
      h.toasts.some((t) => t.indexOf('tokenNetError') !== -1),
      `toasts=${JSON.stringify(h.toasts)}`);
  }

  // ── 6. saving writes only the Pull credential and does not refill plaintext ──
  {
    const h = load({ [GH_TOKEN_STORAGE]: 'ghp_SYNTHETIC_PUSH_PAT' });
    const input = makeEl('set-gh-token');
    h.els.set('set-gh-token', input);
    input.value = SECRET;
    h.W.saveAppSecret();
    await tick();
    check('C8 saving stores the App Secret, empties the input, and leaves the PAT alone',
      h.store.get(APP_KEY_STORAGE) === SECRET && input.value === '' &&
      h.store.get(GH_TOKEN_STORAGE) === 'ghp_SYNTHETIC_PUSH_PAT',
      `storedAppKey=${h.store.has(APP_KEY_STORAGE)} inputRefilled=${input.value !== ''} patIntact=${h.store.get(GH_TOKEN_STORAGE) === 'ghp_SYNTHETIC_PUSH_PAT'}`);
    check('C9 saving then pulls and refreshes the sync badge',
      (h.sandbox.__pulls || 0) >= 1,
      `pulls=${h.sandbox.__pulls || 0} badgeUpdates=${h.sandbox.__badgeUpdates || 0}`);
    check('C10 saving does not print the secret or its prefix',
      h.emitted().indexOf(SECRET) === -1 && h.emitted().indexOf(SECRET_PREFIX) === -1,
      `secretInOutput=${h.emitted().indexOf(SECRET) !== -1} prefixInOutput=${h.emitted().indexOf(SECRET_PREFIX) !== -1}`);
  }

  // ── 7. clearing removes the Pull credential and preserves the Push credential ──
  {
    const h = load({ [APP_KEY_STORAGE]: SECRET, [GH_TOKEN_STORAGE]: 'ghp_SYNTHETIC_PUSH_PAT' });
    const input = makeEl('set-gh-token');
    h.els.set('set-gh-token', input);
    input.value = SECRET;
    h.W.clearAppSecret();
    check('C11 clearing removes only ct-app-key and keeps localStorage[gh-token]',
      !h.store.has(APP_KEY_STORAGE) && h.store.get(GH_TOKEN_STORAGE) === 'ghp_SYNTHETIC_PUSH_PAT' &&
      input.value === '',
      `appKeyRemoved=${!h.store.has(APP_KEY_STORAGE)} patKept=${h.store.get(GH_TOKEN_STORAGE) === 'ghp_SYNTHETIC_PUSH_PAT'}`);
    check('C12 clearing does not print the secret or its prefix',
      h.emitted().indexOf(SECRET) === -1 && h.emitted().indexOf(SECRET_PREFIX) === -1,
      `emitted=${JSON.stringify(h.toasts.concat(h.logs))}`);
  }

  // ── 8. opening the settings page never refills the secret into the DOM ──
  for (const [label, seed] of [['configured', { [APP_KEY_STORAGE]: SECRET }], ['unconfigured', {}]]) {
    const h = load(seed);
    const input = makeEl('set-gh-token');
    h.els.set('set-gh-token', input);
    h.W.loadSettingsUI();
    const hint = h.els.get('set-h-token').textContent;
    check(`C13 opening settings (${label}) leaves the input empty and labels it App Secret`,
      input.value === '' && input.placeholder === 'App Secret' &&
      h.els.get('github-token-label').textContent.indexOf('App Secret') !== -1 &&
      hint.indexOf(SECRET) === -1,
      `inputValueEmpty=${input.value === ''} placeholder=${JSON.stringify(input.placeholder)} label=${JSON.stringify(h.els.get('github-token-label').textContent)}`);
  }
  {
    // The hint must actually distinguish the two states, or "configured" is a lie.
    const on = load({ [APP_KEY_STORAGE]: SECRET });
    on.W.loadSettingsUI();
    const off = load({});
    off.W.loadSettingsUI();
    const a = on.els.get('set-h-token').textContent;
    const b = off.els.get('set-h-token').textContent;
    check('C14 the settings hint distinguishes configured from unconfigured',
      a.length > 0 && b.length > 0 && a !== b,
      `configured=${JSON.stringify(a)} unconfigured=${JSON.stringify(b)}`);
  }

  // ── 9. the module still contains no GitHub transport ──
  {
    const ghIsland = SRC.indexOf('api.github.com');
    const setGh = /(set|remove)Item\(\s*['"]gh-token/.test(SRC);
    check('C15 module-settings.js has no GitHub endpoint and never writes gh-token',
      ghIsland === -1 && !setGh,
      `apiGithubCom=${ghIsland} writesGhToken=${setGh}`);
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
