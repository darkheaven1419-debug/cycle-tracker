/**
 * Phase 2A — browser verification of the migrated Pull path.
 *
 * Runs the real index.html in Chromium with both credentials seeded, and checks
 * the three call sites that still decide whether a pull happens:
 *   - boot (app.js bootApp)
 *   - the 60s auto-pull interval (sync.js _startAutoPull)
 *   - profile switch (app.js switchProfile)
 *
 * Every Worker request is answered locally with a synthetic {sha,state} envelope;
 * api.github.com is aborted so nothing leaves the machine. What is asserted is the
 * transport: which URL was called, that the app secret travels as a Bearer header
 * and never in the URL, and that the pull actually applied the envelope's state.
 *
 * Run: node tests/test-phase2a-pull.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8933;
const PAGE = `http://localhost:${PORT}/index.html`;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

// Synthetic credentials. Not the real app secret, which is never used in tests.
const APP_KEY = 'test-app-key-browser-0000000000000000000';
const GH_TOKEN = 'test-gh-token';
const WORKER_STATE = 'https://cycle-tracker-data.cycletracker-barry.workers.dev/state';
const GH_STATE = 'api.github.com/repos/darkheaven1419-debug/cycle-tracker/contents/shared-state.json';

// The envelope the real Worker returns, with a realistic 40-hex blob sha.
const REMOTE_STATE = {
  diary: { '2026-01-01': { barry: { text: 'synthetic-remote-note' } } },
  gratitude: [{ text: 'synthetic-remote-gratitude', from: 'barry', time: 2000 }],
};
const ENVELOPE = { sha: 'b'.repeat(40), state: REMOTE_STATE };

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0]);
      const file = path.join(ROOT, url === '/' ? 'index.html' : url);
      if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
      fs.readFile(file, (err, buf) => {
        if (err) { res.writeHead(404); return res.end('404'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
        res.end(buf);
      });
    });
    srv.listen(PORT, () => resolve(srv));
  });
}

(async () => {
  const srv = await serve();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true, isMobile: true, deviceScaleFactor: 3,
    serviceWorkers: 'block',
  });

  await ctx.addInitScript((seed) => {
    try {
      localStorage.setItem('gh-token', seed.ghToken);          // still needed: push is unmigrated
      localStorage.setItem('ct-app-key', seed.appKey);         // Phase 2A: pull credential
      localStorage.setItem('cycle-active-profile', 'andjela');
      sessionStorage.setItem('cycle-logged-in', '1');
      // Capture the auto-pull interval so its callback can be fired on demand
      // instead of waiting a real 60 seconds.
      const realSetInterval = window.setInterval;
      window.__ivs = [];
      window.setInterval = function (fn, ms) {
        window.__ivs.push({ fn: fn, ms: ms });
        return realSetInterval.apply(this, arguments);
      };
    } catch (e) { /* ignore */ }
  }, { appKey: APP_KEY, ghToken: GH_TOKEN });

  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('  [pageerror]', e.message.split('\n')[0]));

  const seen = { worker: [], github: [], ghSeq: [], authOk: null, urlHasKey: false };
  let wakeWorker = null;
  let wakeGh = null;
  const nextWorkerHit = () => new Promise((res) => { wakeWorker = res; });
  const nextGhPush = () => new Promise((res) => { wakeGh = res; });

  await page.route('**/*', (route) => {
    const req = route.request();
    const u = req.url();
    // Stand in for the Worker, including its CORS contract. The page origin here
    // is localhost, not the production Pages origin, so echo whatever Origin the
    // browser sent — otherwise the browser blocks the response and the pull never
    // gets applied, which would look like a code failure when it is test setup.
    const origin = req.headers()['origin'];
    const cors = origin ? {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      Vary: 'Origin',
    } : {};
    if (u === WORKER_STATE) {
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
      seen.worker.push(u);
      const auth = req.headers()['authorization'] || '';
      if (seen.authOk === null) seen.authOk = (auth === 'Bearer ' + APP_KEY);
      if (u.indexOf(APP_KEY) !== -1 || u.indexOf('?') !== -1) seen.urlHasKey = true;
      if (wakeWorker) { const w = wakeWorker; wakeWorker = null; w(); }
      return route.fulfill({
        status: 200, contentType: 'application/json',
        headers: cors, body: JSON.stringify(ENVELOPE),
      });
    }
    // A minimal fake Contents API for the still-unmigrated push path, so that
    // push() genuinely completes (GET sha → PUT) and the sequence below is real
    // rather than a list of aborted calls.
    if (u.indexOf(GH_STATE) !== -1) {
      seen.github.push(req.method() + ' ' + u);
      seen.ghSeq.push(req.method());
      if (req.method() === 'PUT') {
        if (wakeGh) { const w = wakeGh; wakeGh = null; w(); }
        return route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify({ content: { sha: 'c'.repeat(40) } }),
        });
      }
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          sha: 'd'.repeat(40),
          content: Buffer.from('{"gratitude":[]}', 'utf8').toString('base64'),
        }),
      });
    }
    if (u.indexOf('api.github.com') !== -1 || u.indexOf('open-meteo') !== -1) return route.abort();
    return route.continue();
  });

  // ── 1. boot pulls through the Worker ──
  {
    const hit = nextWorkerHit();
    await page.goto(PAGE, { waitUntil: 'domcontentloaded' });
    const got = await Promise.race([hit.then(() => true), page.waitForTimeout(8000).then(() => false)]);
    await page.waitForSelector('.tab[data-panel="dashboard"]', { timeout: 15000 });
    check('P1 boot pulls from the Worker /state endpoint', got, `worker=${seen.worker.length}`);
    check('P2 the app secret travels as a Bearer header, never in the URL',
      seen.authOk === true && seen.urlHasKey === false,
      `bearerOk=${seen.authOk} urlLeakedKey=${seen.urlHasKey}`);
  }

  // ── 2. the envelope is applied, not stored as state ──
  {
    const applied = await page.evaluate(() => {
      const g = JSON.parse(localStorage.getItem('shared-gratitude') || 'null');
      const d = JSON.parse(localStorage.getItem('shared-diary') || 'null');
      return {
        gratitude: g ? g.map((n) => n.text) : null,
        diaryDay: d && d['2026-01-01'] ? d['2026-01-01'].barry.text : null,
        shaLeaked: localStorage.getItem('shared-sha'),
      };
    });
    check('P3 the envelope was unwrapped in the browser: state applied, sha not written to storage',
      applied.gratitude && applied.gratitude.indexOf('synthetic-remote-gratitude') !== -1 &&
      applied.diaryDay === 'synthetic-remote-note' && applied.shaLeaked === null,
      `gratitude=${JSON.stringify(applied.gratitude)} diary=${applied.diaryDay} shaKey=${applied.shaLeaked}`);
  }

  // ── 3. auto-pull wiring ──
  // Observed (see the P4 note below): the session-restore boot does NOT register
  // the 60s timer. app.js and js/auth.js are untouched by Phase 2A, and
  // _startAutoPull's body is untouched too, so that is pre-existing, not a
  // regression — but it means "the timer fires on its own" is not observable here.
  // What IS observable, and what item 7 actually turns on, is the wiring:
  // bootApp → startAutoPull → the 60s callback → a pull that now reaches the Worker.
  {
    const probe = await page.evaluate(() => {
      const count = () => window.__ivs.filter((i) => i.ms === 60000).length;
      const before = count();
      let threw = null;
      try { window.bootApp(); } catch (e) { threw = e.message; }
      return {
        before, after: count(), threw,
        ivsMs: window.__ivs.map((i) => i.ms),
        wrapped: typeof window.bootApp === 'function' && window.bootApp.toString().indexOf('startAutoPull') !== -1,
      };
    });
    check('P4 the auto-pull entry point (bootApp → SyncModule.startAutoPull) registers the 60s timer',
      probe.after > probe.before && probe.threw === null,
      `before=${probe.before} after=${probe.after} threw=${probe.threw} wrapped=${probe.wrapped} ` +
      `allIntervals=[${probe.ivsMs.join(',')}]`);
  }

  {
    const before = seen.worker.length;
    const hit = nextWorkerHit();
    const fired = await page.evaluate(() => window.__ivs
      .filter((i) => i.ms === 60000)
      .map((i) => { try { i.fn(); return true; } catch (e) { return 'threw:' + e.message; } }));
    const got = await Promise.race([hit.then(() => true), page.waitForTimeout(5000).then(() => false)]);
    check('P5 the 60s auto-pull callback still pulls, and now reaches the Worker',
      fired.length > 0 && fired.every((x) => x === true) && got && seen.worker.length > before,
      `fired=${JSON.stringify(fired)} hit=${got} before=${before} after=${seen.worker.length}`);
  }

  // ── 4. profile switch still pulls, through the Worker ──
  {
    const before = seen.worker.length;
    const hit = nextWorkerHit();
    const switched = await page.evaluate(() => {
      try { window.switchProfile('barry'); return true; } catch (e) { return false; }
    });
    const got = await Promise.race([hit.then(() => true), page.waitForTimeout(8000).then(() => false)]);
    check('P6 profile switch still pulls, and now reaches the Worker',
      switched && got && seen.worker.length > before,
      `switched=${switched} hit=${got} before=${before} after=${seen.worker.length}`);
  }

  // ── 5. push still goes to GitHub; every GitHub read is the read half of a push ──
  // push() is GET-sha-then-PUT. A pull that still read GitHub would leave an
  // unpaired GET in this sequence — that is what this asserts against, and the
  // push below makes the sequence non-empty so the assertion is not vacuous.
  {
    const gh = nextGhPush();
    const pushed = await page.evaluate(() => {
      try { window.pushAllSharedData(); return true; } catch (e) { return false; }
    });
    const reached = await Promise.race([gh.then(() => true), page.waitForTimeout(8000).then(() => false)]);
    const lastSync = await page.evaluate(() => localStorage.getItem('shared-last-sync'));
    let unpaired = 0;
    for (let i = 0; i < seen.ghSeq.length; i++) {
      if (seen.ghSeq[i] === 'GET' && seen.ghSeq[i + 1] !== 'PUT') unpaired++;
    }
    check('P7 push still goes to GitHub, and no shared-state.json GET is left unpaired',
      pushed && reached && seen.ghSeq.length > 0 && unpaired === 0 && !!lastSync,
      `seq=[${seen.ghSeq.join(',')}] unpairedGets=${unpaired} lastSync=${!!lastSync} workerPulls=${seen.worker.length}`);
  }

  await ctx.close();
  await browser.close();
  srv.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
