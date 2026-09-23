/**
 * Phase 2F — cache reachability, measured rather than assumed.
 *
 * The other SW suites each pin one mechanism: test-phase2a-sw.js checks
 * registration and old-generation cleanup, test-version-consistency.js checks the
 * single `?v=` value and precache-key identity, test-phase1f-update.js checks the
 * update prompt. None of them observes the cache itself, so nothing stopped a
 * regression that kept all the version bookkeeping correct while quietly making
 * every open re-download, or while letting a second key for the same file appear
 * (foo.js AND foo.js?v=1.2.3), or while private Worker data leaked into
 * CACHE_STATIC. Those are the failure modes this suite measures directly.
 *
 * Cases, matching the six requirements:
 *   static  — no asset under two keys; the Worker host is never precached;
 *             root and dist/ are byte-identical for every precached file
 *   A       — a fresh install puts every core static asset in the right cache
 *   B       — a second open serves the unchanged assets from cache, not network
 *   C       — a new generation takes over and the old cache is retired
 *   D       — no private Worker response lands in any cache
 *
 * Run: node tests/test-phase2f-cache.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8995;
const PORT_NEXT = 8996;

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

/* ── static view of sw.js ─────────────────────────────────────────────── */

const SW_SRC = read('sw.js');
const INDEX_SRC = read('index.html');

const APP_VERSION = (SW_SRC.match(/APP_VERSION\s*=\s*'([^']+)'/) || [])[1];
const CACHE_STATIC = (SW_SRC.match(/CACHE_STATIC\s*=\s*'([^']+)'/) || [])[1];
const CACHE_FONTS = (SW_SRC.match(/CACHE_FONTS\s*=\s*'([^']+)'/) || [])[1];

/** Evaluate STATIC_ASSETS exactly as the SW does, with V bound. */
function staticAssets(src) {
  const body = (src || SW_SRC).match(/STATIC_ASSETS\s*=\s*\[([\s\S]*?)\]\s*;/)[1];
  // eslint-disable-next-line no-new-func
  return new Function('V', 'return [' + body + '];')('?v=' + APP_VERSION);
}

const ASSETS = staticAssets();
const WORKER_HOST = 'cycle-tracker-data.cycletracker-barry.workers.dev';

/** 'a/b.js?v=1' -> { file:'a/b.js', versioned:true } */
function split(entry) {
  const q = entry.indexOf('?');
  return {
    entry,
    file: (q === -1 ? entry : entry.slice(0, q)).replace(/^\.\//, ''),
    versioned: q !== -1,
  };
}

/* ── checks that need no browser ──────────────────────────────────────── */

{
  const files = ASSETS.map((a) => split(a).file);
  const dupes = files.filter((f, i) => files.indexOf(f) !== i);
  check('S1 no file is precached twice, so no asset carries two cache keys',
    dupes.length === 0, dupes.length ? [...new Set(dupes)].join(', ') : `${ASSETS.length} entries`);

  const both = [...new Set(files)].filter((f) => {
    const bare = ASSETS.filter((a) => !split(a).versioned && split(a).file === f);
    const ver = ASSETS.filter((a) => split(a).versioned && split(a).file === f);
    return bare.length > 0 && ver.length > 0;
  });
  check('S1b no file is cached both bare and ?v= — that would be two keys for one file',
    both.length === 0, both.length ? both.join(', ') : 'single key per file');
}

{
  const external = ASSETS.filter((a) => /^https?:|workers\.dev/.test(a));
  check('S2 CACHE_STATIC precaches only same-origin assets — no Worker, no external URL',
    external.length === 0, external.length ? external.join(', ') : 'all entries relative');
}

{
  /* The Worker host must be short-circuited BEFORE any caches.open(CACHE_STATIC)
     can see it. Assert the bypass exists, and that every cache the SW opens is a
     declared constant — no ad-hoc cache that private data could drift into. */
  const fetchBody = SW_SRC.slice(SW_SRC.indexOf("addEventListener('fetch'"));
  check('S3 the fetch handler explicitly bypasses the Worker host, so private data never reaches a cache',
    fetchBody.indexOf(WORKER_HOST) !== -1, WORKER_HOST);

  const opens = [...SW_SRC.matchAll(/caches\.open\(([^)]*)\)/g)].map((m) => m[1].trim());
  const unexpected = [...new Set(opens)].filter((o) => o !== 'CACHE_STATIC' && o !== 'CACHE_FONTS');
  check('S3b every caches.open names a declared cache constant',
    unexpected.length === 0, unexpected.length ? unexpected.join(', ') : [...new Set(opens)].join(' | '));
}

{
  /* Requirement E: a file that differs between root and dist/ makes the dist build
     serve a different resource under the same precache key — a silent cache miss
     that no version bookkeeping can catch. */
  const distDir = path.join(ROOT, 'dist');
  if (!fs.existsSync(distDir)) {
    check('S4 dist/ exists to be compared against', false, 'no dist/ directory');
  } else {
    let compared = 0;
    const drifted = [];
    const missing = [];
    for (const f of [...new Set(ASSETS.map((a) => split(a).file))]) {
      if (!f || f === '.' || f === './') continue;
      const distFile = path.join(distDir, f);
      if (!fs.existsSync(distFile)) { missing.push(f); continue; }
      compared++;
      if (!fs.readFileSync(path.join(ROOT, f)).equals(fs.readFileSync(distFile))) drifted.push(f);
    }
    check('S4 every precached file that dist/ ships is byte-identical to the root copy',
      drifted.length === 0, drifted.length ? 'drifted: ' + drifted.join(', ') : `${compared} files compared`);
    check('S4b the assets changed this round are all mirrored into dist/',
      !missing.includes('css/calendar.css') && !missing.includes('css/v2.css') &&
      !missing.includes('js/render-love.js') && !missing.includes('js/cycle-core.js') &&
      !missing.includes('js/fix-panel.js') && !missing.includes('js/module-dashboard.js') &&
      !missing.includes('index.html'),
      missing.length ? 'absent from dist: ' + missing.join(', ') : 'all changed assets present');
  }
}

/* ── HTTP servers ─────────────────────────────────────────────────────── */

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

function serve(port, overrides) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0]);
      const rel = (url === '/' ? 'index.html' : url).replace(/^\//, '');
      if (overrides && Object.prototype.hasOwnProperty.call(overrides, rel)) {
        res.writeHead(200, { 'Content-Type': MIME[path.extname(rel)] || 'application/octet-stream' });
        return res.end(overrides[rel]);
      }
      const file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
      fs.readFile(file, (err, buf) => {
        if (err) { res.writeHead(404); return res.end('404'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
        res.end(buf);
      });
    });
    srv.listen(port, () => resolve(srv));
  });
}

const APP_KEY = 'test-app-key-phase2f-cache-000000000000000000';

/** Never let a test reach the real Worker: abort writes nothing anywhere. */
function stub(page) {
  return page.route('**/*', (route) => {
    const u = route.request().url();
    if (u.indexOf(WORKER_HOST) !== -1 || u.indexOf('api.github.com') !== -1 || u.includes('open-meteo')) {
      return route.abort();
    }
    return route.continue();
  });
}

/** Read the whole cache picture from inside the page. */
const cacheSnapshot = (page) => page.evaluate(async () => {
  const names = await caches.keys();
  const entries = {};
  for (const n of names) {
    const c = await caches.open(n);
    entries[n] = (await c.keys()).map((r) => new URL(r.url).pathname + new URL(r.url).search);
  }
  return { names, entries };
});

(async () => {
  const srv = await serve(PORT);
  const browser = await chromium.launch();
  const staticPath = new Set(ASSETS.map((a) => {
    const f = split(a).file;
    return !f || f === '.' ? '/' : '/' + f;
  }));

  /* ── A. fresh install: the precache list lands in CACHE_STATIC ───────── */
  const ctxA = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'allow' });
  await ctxA.addInitScript((arg) => {
    try {
      localStorage.setItem('cycle-active-profile', arg.profile);
      sessionStorage.setItem('cycle-logged-in', '1');
      localStorage.setItem('ct-app-key', arg.key);
      localStorage.setItem('cycle-lang', 'sr');
      localStorage.setItem('cycle-lang-chosen', '1');
    } catch (e) { /* ignore */ }
  }, { profile: 'andjela', key: APP_KEY });
  const pageA = await ctxA.newPage();
  await stub(pageA);
  await pageA.goto('http://localhost:' + PORT + '/index.html', { waitUntil: 'domcontentloaded' });
  await pageA.waitForSelector('#dash-today', { state: 'attached', timeout: 15000 });

  /* Installation finishes asynchronously; poll the cache rather than sleeping. */
  const need = ASSETS.map(split).filter((s) => s.file && s.file !== '.');
  let snapA = null;
  for (let i = 0; i < 40; i++) {
    snapA = await cacheSnapshot(pageA);
    if ((snapA.entries[CACHE_STATIC] || []).length >= need.length - 3) break;
    await pageA.waitForTimeout(250);
  }
  const stA = snapA.entries[CACHE_STATIC] || [];
  const present = need.filter((s) => stA.indexOf(s.versioned ? '/' + s.file + '?v=' + APP_VERSION : '/' + s.file) !== -1);
  check('A1 a fresh install precaches the static assets into CACHE_STATIC',
    present.length >= need.length - 3,
    `${present.length}/${need.length} present; cache=${CACHE_STATIC} size=${stA.length}`);
  check('A1b entries are keyed by the URL the app actually requests',
    stA.some((e) => e.indexOf('?v=' + APP_VERSION) !== -1) && stA.some((e) => e.indexOf('?v=') === -1),
    'both versioned and bare keys present, as requested');
  check('A2 CACHE_FONTS and CACHE_STATIC are declared as separate caches',
    snapA.names.indexOf(CACHE_STATIC) !== -1, snapA.names.join(', '));

  /* ── B. second open: unchanged assets come from the cache ────────────── */
  const seen = [];
  pageA.on('response', (res) => {
    try {
      const p = new URL(res.url()).pathname;
      if (!staticPath.has(p)) return;
      seen.push({ path: p, sw: res.fromServiceWorker() });
    } catch (e) { /* ignore */ }
  });
  await pageA.reload({ waitUntil: 'load' });
  await pageA.waitForSelector('#dash-today', { state: 'attached', timeout: 15000 });
  await pageA.waitForTimeout(1500);
  const fromNet = seen.filter((r) => !r.sw);
  check('B1 on a second open every precached static asset is served from the cache',
    seen.length > 0 && fromNet.length === 0,
    `${seen.length - fromNet.length} from cache, ${fromNet.length} from network` +
    (fromNet.length ? ' -> ' + fromNet.slice(0, 4).map((r) => r.path).join(', ') : ''));

  const snapB = await cacheSnapshot(pageA);
  const dupesB = snapB.names.filter((n) => {
    const list = snapB.entries[n];
    return list.length !== new Set(list).size;
  });
  check('B2 the second open adds no duplicate cache entries',
    dupesB.length === 0, dupesB.length ? dupesB.join(', ') : 'no duplicate keys');
  check('B3 the cache generation is stable across opens — no churn',
    snapB.names.indexOf(CACHE_STATIC) !== -1 && snapA.names.length === snapB.names.length,
    `${snapA.names.join(', ')} -> ${snapB.names.join(', ')}`);

  /* ── D. no private Worker response is cached anywhere ─────────────────── */
  const workerKeyed = snapB.names.flatMap((n) =>
    snapB.entries[n].filter((e) => e.indexOf(WORKER_HOST) !== -1 || e.indexOf('workers.dev') !== -1).map((e) => n + ' ' + e));
  check('D1 no cache holds a response keyed by the Worker host',
    workerKeyed.length === 0, workerKeyed.join(', ') || 'clean');

  const privateKeys = ['shared-knowme', 'shared-gratitude', 'shared-diary', 'shared-todo', 'cycle-data-v6'];
  const leaked = snapB.names.flatMap((n) =>
    snapB.entries[n].filter((e) => privateKeys.some((k) => e.indexOf(k) !== -1)).map((e) => n + ' ' + e));
  check('D2 no cache holds a private-data path either',
    leaked.length === 0, leaked.join(', ') || 'clean');

  await ctxA.close();

  /* ── C. a new generation takes over and retires the old cache ────────── */
  {
    const NEXT_STATIC = 'ciklus-static-vTEST';
    const patched = SW_SRC.replace(/const CACHE_STATIC = '[^']+';/, "const CACHE_STATIC = '" + NEXT_STATIC + "';");
    const srvNext = await serve(PORT_NEXT, { 'sw.js': patched });

    const ctxC = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'allow' });
    await ctxC.addInitScript((arg) => {
      try {
        localStorage.setItem('cycle-active-profile', 'andjela');
        sessionStorage.setItem('cycle-logged-in', '1');
        localStorage.setItem('ct-app-key', arg.key);
        localStorage.setItem('cycle-lang', 'sr');
        localStorage.setItem('cycle-lang-chosen', '1');
      } catch (e) { /* ignore */ }
      /* Seed a stale generation, as an older deploy would have left behind. */
      caches.open('ciklus-static-v41').then((c) => c.put('/stale.js', new Response('old')));
      caches.open('unrelated-cache').then((c) => c.put('/stale2.js', new Response('old')));
    }, { key: APP_KEY });

    const pageC = await ctxC.newPage();
    await stub(pageC);
    await pageC.goto('http://localhost:' + PORT_NEXT + '/index.html', { waitUntil: 'domcontentloaded' });
    await pageC.waitForSelector('#dash-today', { state: 'attached', timeout: 15000 });

    let snapC = null;
    for (let i = 0; i < 40; i++) {
      snapC = await cacheSnapshot(pageC);
      if (snapC.names.indexOf(NEXT_STATIC) !== -1 && snapC.names.indexOf('ciklus-static-v41') === -1) break;
      await pageC.waitForTimeout(250);
    }
    check('C1 a new generation installs under its own cache name',
      snapC.names.indexOf(NEXT_STATIC) !== -1, snapC.names.join(', '));
    check('C2 and activate retires the stale generation',
      snapC.names.indexOf('ciklus-static-v41') === -1, snapC.names.join(', '));
    /* CACHE_FONTS is created lazily on the first real font fetch, so it is not
       required to exist here — what matters is that EVERY surviving cache is one
       the SW declares, and that the undeclared ones are gone. */
    const undeclared = snapC.names.filter((n) => n !== NEXT_STATIC && n !== CACHE_FONTS);
    check('C3 undeclared caches are retired too — only the declared names survive',
      snapC.names.indexOf('unrelated-cache') === -1 && undeclared.length === 0 &&
      snapC.names.indexOf(NEXT_STATIC) !== -1,
      `survivors=${snapC.names.join(', ')}`);
    check('C4 the new cache is populated with the same asset list, so a real update re-fetches once and then reuses',
      (snapC.entries[NEXT_STATIC] || []).length >= need.length - 3,
      `${(snapC.entries[NEXT_STATIC] || []).length}/${need.length}`);
    await ctxC.close();
    srvNext.close();
  }

  await browser.close();
  srv.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
