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

/**
 * A CacheStorage stand-in that models *named buckets*, which is what a cache
 * version bump is actually about: install fills the new name, activate deletes
 * every name that is not current. The flat harness above cannot express that,
 * because it keys one shared Map by request.
 */
function createNamedCaches() {
  const buckets = new Map();
  const bucket = (name) => {
    if (!buckets.has(name)) buckets.set(name, new Set());
    return buckets.get(name);
  };
  const url = (x) => (typeof x === 'string' ? x : x.url);
  const makeCache = (name) => {
    bucket(name); // open() creates the cache, as the real CacheStorage does
    return {
      add: async (u) => { bucket(name).add(url(u)); },
      addAll: async (list) => { (list || []).forEach((u) => bucket(name).add(url(u))); },
      put: async (req) => { bucket(name).add(url(req)); },
      match: async () => undefined,
      keys: async () => Array.from(bucket(name)),
      delete: async (k) => bucket(name).delete(url(k)),
    };
  };
  return {
    names: () => Array.from(buckets.keys()),
    contents: (n) => Array.from(buckets.get(n) || []),
    api: {
      open: async (name) => makeCache(name),
      keys: async () => Array.from(buckets.keys()),
      delete: async (name) => buckets.delete(name),
      match: async () => undefined,
    },
  };
}

/**
 * Loads sw.js and returns its handlers plus the fake caches. Pass a CacheStorage
 * stand-in to drive install/activate against named buckets; omit it for the
 * flat request-keyed harness the fetch assertions use.
 */
function loadSw(cachesApi) {
  const caches = cachesApi ? null : createCaches();
  const handlers = {};
  const sandbox = {
    self: {
      addEventListener: (type, fn) => { handlers[type] = fn; },
      skipWaiting: () => {},
      clients: { claim: async () => {}, matchAll: async () => [], openWindow: async () => {} },
      registration: { sync: { register: async () => {} }, showNotification: async () => {} },
      location: { href: 'http://localhost:8933/', origin: 'http://localhost:8933' },
    },
    caches: cachesApi || caches.api,
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

  // ── S11..S14 — Phase 1D bumped CACHE_STATIC three times: v32 → v33 for the
  // calendar palette, v33 → v34 for the panel restructure, then v34 → v35 for
  // the calendar structural alignment (Phase 1C did v31 → v32,
  // Phase 1B.5 v30 → v31, Phase 1B v29 → v30 and Phase 2C v28 → v29, the same
  // way); Phase 1F v35 → v36 for the new-version prompt, and Phase 1E v36 → v37
  // for the product-wide visual unification (accent ink, control sizing, and the
  // theme/manifest chrome colour all landing in one commit), then v37 → v38 when
  // the review found 1E-D's 44px floor was still being overridden by two legacy
  // media queries in css/calendar.css, then v39 → v40 in Phase 2B.3 when
  // css/v2.css gained the Know Me lead rule (.km-lead). That one is the same
  // bare-path hazard as v38: './css/v2.css' is precached WITHOUT a ?v= suffix,
  // so its cache key never moves on its own and an installed client would keep
  // serving the unstyled lead for good.
  // v40 → v41 in Phase 2B.4, for './js/module-dashboard.js' — also a bare path.
  // v38 → v39 (Phase 1.9) is the generation where this invariant was MISSED
  // three times running: 228a6d7, 39b8d9c and 0122578 all changed
  // ./js/module-dashboard.js and bumped only APP_VERSION, which does nothing for
  // a bare path. S15 below exists because of that; see the sw.js comment chain.
  // The bump is the only thing that makes a deploy reach a client
  // that already has the old SW installed: these assets sit in STATIC_ASSETS
  // and are served cache-first, so without a new cache name the stale copies
  // keep winning and the fixes stay invisible. These four assertions prove the
  // mechanism, not just that a string changed.
  {
    const src = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
    const hasV41 = /const CACHE_STATIC = 'ciklus-static-v41';/.test(src);
    const hasV40 = /ciklus-static-v40/.test(src);
    check('S11 CACHE_STATIC is the new name and the old one is fully gone',
      hasV41 && !hasV40, `v41=${hasV41} v40StillPresent=${hasV40}`);

    // The refresh only happens for files that are actually precached. Read the
    // list out of the source so a later edit that drops one of them fails here.
    // Phase 2C's pair, the four Together assets (Phase 1B added them, 1B.5
    // changed them again) and Phase 1D's four all have to be present — one new
    // generation name is what re-fetches all of them.
    //
    // Phase 1D's four earn their place more than most: './css/tokens.css' and
    // './css/calendar.css' are listed WITHOUT a ?v= suffix, so their cache key
    // never changes on its own. A missing entry here means an installed client
    // keeps the old saturated calendar fills for good.
    const changed = [
      './app.js', './js/fix-stats.js',
      './css/v2.css', './js/sync.js', './js/render-love.js', './js/module-dashboard.js',
      // Phase 1C's own three: the new module, the stylesheet it lives in, and
      // the page that now loads it.
      './js/module-memories.js', './index.html',
      // Phase 1D's own four: the token layer, the calendar stylesheet, the
      // calendar-month fix, and the later-loading file that actually won.
      './css/tokens.css', './css/calendar.css', './js/fix-all.js',
      // Phase 1D's second commit: the panel restructure, its stylesheet, and
      // the three-language copy for the header it added.
      './js/i18n.js',
      // Phase 1F changed './index.html', './app.js' and './css/v2.css' — all
      // three are already listed above (index.html via Phase 1C, app.js and
      // v2.css via Phase 1D), so the v36 name re-fetches them with no new entry.
      // Phase 1D has no fourth group: its third commit changed './app.js' and
      // './css/calendar.css' again — the weekday gutter span it stops emitting
      // and the grid tracks it corrected — and both are already listed above,
      // so the v35 name re-fetches them without adding an entry.
      // Phase 1E's three that were not already listed above: the injector
      // stylesheet (bare path, and its !important outranks every linked sheet,
      // so a stale copy would keep painting the old inks over the new ones),
      // the offline page and the manifest.
      './js/fix-css.js', './offline.html', './manifest.json',
    ];
    const missing = changed.filter((f) => src.indexOf("'" + f + "'") === -1);
    check('S12 every asset the bump exists to refresh is in STATIC_ASSETS',
      missing.length === 0, `missing=${missing.join(',') || 'none'}`);
  }

  // S13 — an installed client still holds v37; one generation back holds v36,
  // with v35..v31 further back. Run the real activate handler: every stale
  // bucket must be deleted, the current one must survive. This is the step that
  // actually evicts the old copies of the cache-first assets.
  {
    const named = createNamedCaches();
    const h = loadSw(named.api).handlers;
    await named.api.open('ciklus-static-v31');
    await named.api.open('ciklus-static-v32');
    await named.api.open('ciklus-static-v33');
    await named.api.open('ciklus-static-v34');
    await named.api.open('ciklus-static-v35');
    await named.api.open('ciklus-static-v36');
    await named.api.open('ciklus-static-v37');
    await named.api.open('ciklus-static-v38');
    await named.api.open('ciklus-static-v39');
    await named.api.open('ciklus-static-v40');
    await named.api.open('ciklus-static-v41');
    await named.api.open('ciklus-fonts-v1');
    let done = null;
    h.activate({ waitUntil: (p) => { done = p; } });
    await done;
    const names = named.names();
    check('S13 activate evicts the stale v31..v40 buckets and keeps v41 + fonts',
      names.indexOf('ciklus-static-v31') === -1 &&
      names.indexOf('ciklus-static-v32') === -1 &&
      names.indexOf('ciklus-static-v33') === -1 &&
      names.indexOf('ciklus-static-v34') === -1 &&
      names.indexOf('ciklus-static-v35') === -1 &&
      names.indexOf('ciklus-static-v36') === -1 &&
      names.indexOf('ciklus-static-v37') === -1 &&
      names.indexOf('ciklus-static-v38') === -1 &&
      names.indexOf('ciklus-static-v39') === -1 &&
      names.indexOf('ciklus-static-v40') === -1 &&
      names.indexOf('ciklus-static-v41') !== -1 &&
      names.indexOf('ciklus-fonts-v1') !== -1,
      `caches=${names.join(',')}`);
  }

  // S14 — and install (the other half) fills the NEW bucket with the precache
  // list. S13 evicts, S14 re-populates; together they are the refresh.
  //
  // 2026-09-18 (Phase 0-E): the expected keys are now derived from what the page
  // actually requests. Cache API keys are full URLs including the query string,
  // so the previous bare './app.js' entry could never be matched by an
  // index.html that asks for 'app.js?v=…' — the precache for it was inert.
  // STATIC_ASSETS was aligned with the real request URLs; the version is read
  // out of sw.js so a future bump cannot silently re-break the match.
  {
    const swSrc = fs.readFileSync(SW_FILE, 'utf8');
    const verMatch = swSrc.match(/const APP_VERSION = '([^']+)'/);
    check('S14a sw.js exposes a single APP_VERSION constant',
      !!verMatch, `match=${verMatch ? verMatch[1] : 'none'}`);

    const ver = verMatch ? verMatch[1] : '0';
    // app.js carries ?v= in index.html. js/fix-stats.js is one of the 11 scripts
    // index.html loads WITHOUT ?v= (Phase 1C added js/module-memories.js as the
    // 11th), so it must stay bare here.
    const expected = [`./app.js?v=${ver}`, './js/fix-stats.js'];

    const named = createNamedCaches();
    const h = loadSw(named.api).handlers;
    let done = null;
    h.install({ waitUntil: (p) => { done = p; } });
    await done;
    const got = named.contents('ciklus-static-v41');
    const missing = expected.filter((f) => got.indexOf(f) === -1);
    check('S14b install precaches the exact URLs the page requests (app.js?vN, fix-stats.js)',
      got.length > 40 && missing.length === 0,
      `entries=${got.length} expected=${expected.join(',')} missing=${missing.join(',') || 'none'}`);
  }

  // ── S15 — "did you bump the RIGHT axis?" is a question about a commit, not
  // about a file, so this walks git history instead of reading sw.js text.
  //
  // For every commit since the one that introduced the CURRENT generation name:
  // if it changed an asset that STATIC_ASSETS lists as a BARE path, it must also
  // have moved CACHE_STATIC. Nothing else can make an installed client re-fetch a
  // bare asset — its cache key is the path, which never moves, and the SW serves
  // it cache-first. APP_VERSION is the wrong lever for it and does nothing at all.
  //
  // This is the check v38 → v39 needed and did not have: 228a6d7, 39b8d9c and
  // 0122578 each changed ./js/module-dashboard.js — a bare path — and bumped only
  // APP_VERSION, so an installed client kept the older copy for the whole of that
  // generation. Anchoring at the current generation keeps those three out of scope
  // by construction (they predate the name) while making the next one fail here.
  {
    const git = (args) => require('child_process')
      .execSync('git ' + args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

    /** The paths STATIC_ASSETS lists WITHOUT a version suffix — the other axis. */
    const barePaths = () => {
      const src = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
      const start = src.indexOf('const STATIC_ASSETS');
      const block = src.slice(start, src.indexOf('];', start));
      const bare = [];
      block.split('\n').forEach((line) => {
        if (/\+\s*V/.test(line)) return; // versioned: APP_VERSION's axis, not this one
        const m = line.match(/'\.\/([^']+)'/);
        if (m && m[1]) bare.push(m[1]);
      });
      return bare;
    };

    let violations = [];
    let inspected = 0;
    let generation = 'unknown';
    let anchor = 'unknown';
    try {
      const bare = barePaths();
      const headSw = git('show HEAD:sw.js');
      const genMatch = headSw.match(/const CACHE_STATIC = '([^']+)'/);
      generation = genMatch ? genMatch[1] : 'unknown';

      // NOTE: deliberately no `^` or `~` in any git call below. execSync on
      // Windows goes through cmd.exe, where `^` is the ESCAPE character — so
      // `sha^..HEAD` silently collapses to `sha..HEAD`, the range comes back
      // empty, and this check passes vacuously instead of going red. That is the
      // precise failure mode it exists to catch, so the range is built in JS and
      // parents are read from rev-list rather than spelled with `^`.
      // Commits older than sw.js itself have no such blob, so every read of it
      // goes through this rather than throwing on the first ancestor of its
      // creation. generation is `ciklus-static-vNN` — no quoting needed, which
      // matters because cmd.exe treats single quotes as literal characters.
      const safeShow = (rev) => {
        try { return git('show ' + rev + ':sw.js'); } catch (e) { return ''; }
      };

      const all = git('log --format=%H HEAD').trim().split('\n').filter(Boolean);
      // -S returns every commit whose change to sw.js altered that string's
      // count; the OLDEST of them is the one that introduced the name.
      const introducing = git('log -S' + generation + ' --format=%H -- sw.js')
        .trim().split('\n').filter(Boolean).pop();
      anchor = introducing || 'none';
      if (!introducing) throw new Error('no commit carries ' + generation);

      const commits = all.slice(0, all.indexOf(introducing) + 1);
      inspected = commits.length;
      commits.forEach((sha) => {
        const changed = git('diff-tree --no-commit-id --name-only -r ' + sha)
          .trim().split('\n').filter(Boolean);
        const bareHit = changed.filter((f) => bare.indexOf(f) !== -1);
        if (!bareHit.length) return;
        const parents = git('rev-list --parents -n 1 ' + sha).trim().split(/\s+/).slice(1);
        if (!parents.length) return; // root commit: no parent to compare with
        const nameOf = (rev) => {
          const m = safeShow(rev).match(/ciklus-static-v\d+/);
          return m ? m[0] : null;
        };
        if (nameOf(parents[0]) === nameOf(sha)) {
          violations.push(sha.slice(0, 7) + ' changed ' + bareHit.join(',') + ' without moving CACHE_STATIC');
        }
      });
    } catch (e) {
      violations.push('could not read history: ' + e.message.split('\n')[0]);
    }

    check('S15 no commit since the current generation changed a bare-precached asset without moving CACHE_STATIC',
      violations.length === 0 && inspected > 0,
      `generation=${generation} since=${anchor.slice(0, 7)} commits=${inspected} ` +
      (violations.length ? violations.slice(0, 3).join(' | ') : 'violations=0'));
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
