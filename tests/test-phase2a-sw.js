/**
 * Phase 2A — Service Worker bypass for the private-data Worker host.
 *
 * The Worker host was not in sw.js's external-API bypass list, so /state fell
 * through to the generic branches. It is not cached today (the .json branch is
 * skipped because the path is /state, and the catch-all never calls cache.put),
 * but that is incidental: any later route change, or a PUT in a later phase,
 * would put private relationship data into CACHE_STATIC.
 *
 * This drives sw.js's real fetch handler in a vm with fake caches/fetch, which is
 * deterministic and needs no browser. The control case proves the harness can
 * observe a cache write at all — without it, "nothing was cached" would be
 * vacuous.
 *
 * Run: node tests/test-phase2a-sw.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const WORKER_HOST = 'cycle-tracker-data.cycletracker-barry.workers.dev';
const WORKER_URL = 'https://' + WORKER_HOST + '/state';
const CONTROL_URL = 'http://localhost:8933/data/holidays.json';
// Overridable so the bypass can be negative-controlled: point this at a copy of
// sw.js with the Worker line removed and S2/S4 must fail.
const SW_FILE = process.env.SW_FILE || path.join(ROOT, 'sw.js');

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

/**
 * Minimal CacheStorage stand-in that records every put() and counts every
 * lookup. The lookup counter is what lets Phase 2C assert that a /state or /todo
 * write (and read) is not merely "not cached" but never looked up at all.
 */
function createCaches() {
  const store = new Map();
  const lookups = [];
  const key = (req) => (typeof req === 'string' ? req : req.url);
  const cache = {
    put: async (req, res) => { store.set(key(req), res); },
    match: async (req) => { lookups.push(key(req)); return store.get(key(req)); },
    keys: async () => Array.from(store.keys()),
    addAll: async () => {},
    delete: async () => true,
  };
  return {
    store,
    lookups,
    api: {
      open: async () => cache,
      match: async (req) => { lookups.push(key(req)); return store.get(key(req)); },
      keys: async () => Array.from(store.keys()),
      delete: async () => true,
    },
  };
}

/** Loads sw.js and returns its fetch handler plus the fake caches. */
function loadSw() {
  const caches = createCaches();
  const handlers = {};
  const sandbox = {
    self: {
      addEventListener: (type, fn) => { handlers[type] = fn; },
      skipWaiting: () => {},
      clients: { claim: async () => {}, matchAll: async () => [], openWindow: async () => {} },
      registration: { sync: { register: async () => {} }, showNotification: async () => {} },
      location: { href: 'http://localhost:8933/', origin: 'http://localhost:8933' },
    },
    caches: caches.api,
    fetch: async (req) => new Response('network:' + (typeof req === 'string' ? req : req.url), { status: 200 }),
    Response, Request, URL, Headers,
    console: { log: () => {}, warn: () => {}, error: () => {} },
    setTimeout, clearTimeout, setInterval, clearInterval,
  };
  sandbox.self.self = sandbox.self;
  vm.runInContext(fs.readFileSync(SW_FILE, 'utf8'), vm.createContext(sandbox), { filename: 'sw.js' });
  return { caches, handlers, sandbox };
}

/** Fires the fetch handler; returns what it passed to respondWith (null = bypass). */
function fire(handlers, url, opts) {
  const request = new Request(url, opts || {});
  let responded = null;
  handlers.fetch({
    request,
    respondWith: (p) => { responded = p; },
    waitUntil: () => {},
  });
  return responded;
}

(async () => {
  // The mirror must stay in sync (requirement 10).
  {
    const a = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
    const b = fs.readFileSync(path.join(ROOT, 'dist/sw.js'), 'utf8');
    check('S1 dist/sw.js is a byte-identical mirror of sw.js', a === b,
      `root=${a.length}B dist=${b.length}B identical=${a === b}`);
  }

  const { caches, handlers, sandbox } = loadSw();

  // S2 — the private-data Worker request takes the bypass: no respondWith, and
  // therefore no interaction with the Cache API at all.
  {
    const responded = fire(handlers, WORKER_URL, { headers: { Authorization: 'Bearer test-key' } });
    check('S2 a /state request to the Worker host bypasses the SW (no respondWith)',
      responded === null, `respondWith=${responded === null ? 'not called' : 'called'}`);
  }

  // S3 — control: a same-origin .json request DOES enter the caching branch and
  // does get written to the cache. Proves S2 can detect a cache write.
  {
    const responded = fire(handlers, CONTROL_URL);
    const cached = responded !== null;
    if (cached) await responded;
    await new Promise((r) => setTimeout(r, 20));
    const keys = Array.from(caches.store.keys());
    check('S3 control: a same-origin .json response is served and cached',
      cached && keys.some((k) => k.indexOf('holidays.json') !== -1),
      `respondedWith=${cached} cachedKeys=${keys.length}`);
  }

  // S4 — the bypass is checked BEFORE the .json branch, so it holds even if the
  // path later grows a .json suffix. This is the future-proofing the change buys.
  {
    const responded = fire(handlers, 'https://' + WORKER_HOST + '/state.json');
    check('S4 the bypass wins over the .json branch (ordering is correct)',
      responded === null, `respondWith=${responded === null ? 'not called' : 'called'}`);
  }

  // S5 — and nothing from the Worker host is in the cache afterwards.
  {
    const keys = Array.from(caches.store.keys());
    const leaked = keys.filter((k) => k.indexOf(WORKER_HOST) !== -1);
    check('S5 no Worker-host entry ends up in the cache', leaked.length === 0,
      `cacheKeys=${keys.length} workerEntries=${leaked.length}`);
  }

  // ── S6..S10 — Phase 2C added PUT /state and GET+PUT /todo to the same host.
  // The bypass is a hostname check placed before every branch, so it must be
  // method- and path-agnostic: all four combinations take it, none calls
  // respondWith, and none performs even a cache *lookup* — which is the stronger
  // property for a write, since a lookup that misses would still have put private
  // request metadata into the Cache API path.
  {
    const CASES = [
      ['S6', 'GET', '/state', 'a read of the private state'],
      ['S7', 'PUT', '/state', 'a write of the private state'],
      ['S8', 'GET', '/todo', 'a read of the private todo list'],
      ['S9', 'PUT', '/todo', 'a write of the private todo list'],
    ];
    for (const [id, method, path, label] of CASES) {
      const url = 'https://' + WORKER_HOST + path;
      const lookupsBefore = caches.lookups.length;
      const keysBefore = caches.store.size;
      const init = { method, headers: { Authorization: 'Bearer test-key' } };
      if (method === 'PUT') {
        init.body = JSON.stringify({ baseSha: null, todo: [] });
        init.headers['Content-Type'] = 'application/json';
      }
      const responded = fire(handlers, url, init);
      await new Promise((r) => setTimeout(r, 20));
      const newLookups = caches.lookups.length - lookupsBefore;
      check(`${id} ${method} ${path} — ${label} bypasses the SW entirely`,
        responded === null && newLookups === 0 && caches.store.size === keysBefore,
        `respondWith=${responded === null ? 'not called' : 'called'} cacheLookups=${newLookups} newCacheEntries=${caches.store.size - keysBefore}`);
    }
  }

  // S10 — the control that keeps S6..S9 from being vacuous. A cache *lookup* only
  // happens on the caching branch's offline path, so the control forces the network
  // to fail: the same-origin .json request must then fall back to caches.match and
  // be counted. Without this, a zero above could just mean a dead counter.
  {
    const lookupsBefore = caches.lookups.length;
    const realFetch = sandbox.fetch;
    sandbox.fetch = async () => { throw new Error('offline'); };
    const responded = fire(handlers, CONTROL_URL);
    if (responded !== null) await responded;
    await new Promise((r) => setTimeout(r, 20));
    sandbox.fetch = realFetch;
    const newLookups = caches.lookups.length - lookupsBefore;
    check('S10 control: an offline same-origin .json request does perform a cache lookup',
      newLookups > 0, `cacheLookups=${newLookups}`);
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
