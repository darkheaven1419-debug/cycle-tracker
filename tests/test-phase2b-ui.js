/**
 * Phase 2B — the real page, with only one of the two credentials on the device.
 *
 * The Node suites prove the gate logic; this one proves the wiring in the real
 * index.html with the real script load order. It runs three scenarios, each in a
 * fresh browser context so the stored credentials are unambiguous:
 *
 *   A. App Secret only   — every Pull entry point must reach the Worker, and the
 *                          page must never read the PAT or call GitHub.
 *   B. GitHub PAT only   — no Pull may happen, but Push must still work off the
 *                          PAT, which is what keeps 2B from breaking Push.
 *   C. Settings page     — the UI must speak of an App Secret, verify against
 *                          /health, and show the actor it got back.
 *
 * What is asserted is the transport (which URL, which header) and the storage
 * reads, never the content of private data. All upstream calls are answered or
 * aborted locally, so nothing leaves the machine.
 *
 * Items covered: 2, 3, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17.
 * Run: node tests/test-phase2b-ui.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8935;
const PAGE = `http://localhost:${PORT}/index.html`;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

// Synthetic credentials. Not the real secrets, and they guard nothing.
const APP_KEY = 'test-app-key-ui-000000000000000000000000';
const GH_TOKEN = 'ghp_SYNTHETIC_UI_PAT_00000000';
const WORKER_HOST = 'cycle-tracker-data.cycletracker-barry.workers.dev';
const WORKER_STATE = 'https://' + WORKER_HOST + '/state';
const WORKER_HEALTH = 'https://' + WORKER_HOST + '/health';
const GH_CONTENTS = 'api.github.com/repos/darkheaven1419-debug/cycle-tracker/contents/shared-state.json';

const ENVELOPE = {
  sha: 'f'.repeat(40),
  state: { gratitude: [{ text: 'synthetic-ui-gratitude', time: 1 }] },
};

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

/**
 * Opens the page with the given credentials and the full instrumented wiring:
 * a per-transport call ledger, a localStorage read ledger, and a captured 60s
 * timer. `seed.ghToken === null` means "do not store a PAT at all".
 */
async function openPage(browser, seed) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true, isMobile: true, deviceScaleFactor: 3,
    serviceWorkers: 'block',
  });

  await ctx.addInitScript((s) => {
    try {
      if (s.appKey !== null) localStorage.setItem('ct-app-key', s.appKey);
      if (s.ghToken !== null) localStorage.setItem('gh-token', s.ghToken);
      localStorage.setItem('cycle-active-profile', 'andjela');
      sessionStorage.setItem('cycle-logged-in', '1');
      // Record every storage read by key, so "the Pull path never touched the
      // PAT" is an observation rather than a reading of the source.
      const realGet = Storage.prototype.getItem;
      window.__reads = [];
      Storage.prototype.getItem = function (k) {
        try { window.__reads.push(String(k)); } catch (e) { /* ignore */ }
        return realGet.call(this, k);
      };
      const realSetInterval = window.setInterval;
      window.__ivs = [];
      window.setInterval = function (fn, ms) {
        window.__ivs.push({ fn: fn, ms: ms });
        return realSetInterval.apply(this, arguments);
      };
    } catch (e) { /* ignore */ }
  }, seed);

  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]));

  const seen = { worker: [], health: [], github: [], authHeaders: [], healthAuth: [] };
  let wakeWorker = null;
  const nextWorkerHit = () => new Promise((res) => { wakeWorker = res; });

  await page.route('**/*', (route) => {
    const req = route.request();
    const u = req.url();
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
      seen.authHeaders.push(req.headers()['authorization'] || '');
      if (wakeWorker) { const w = wakeWorker; wakeWorker = null; w(); }
      return route.fulfill({
        status: 200, contentType: 'application/json',
        headers: cors, body: JSON.stringify(ENVELOPE),
      });
    }
    if (u === WORKER_HEALTH) {
      seen.health.push(u);
      seen.healthAuth.push(req.headers()['authorization'] || '');
      return route.fulfill({
        status: 200, contentType: 'application/json',
        headers: cors, body: JSON.stringify({ ok: true, actor: 'barry' }),
      });
    }
    if (u.indexOf(GH_CONTENTS) !== -1) {
      seen.github.push(req.method() + ' ' + u);
      if (req.method() === 'PUT') {
        return route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify({ content: { sha: 'a'.repeat(40) } }),
        });
      }
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          sha: 'b'.repeat(40),
          content: Buffer.from('{"gratitude":[]}', 'utf8').toString('base64'),
        }),
      });
    }
    if (u.indexOf('api.github.com') !== -1 || u.indexOf('open-meteo') !== -1) return route.abort();
    return route.continue();
  });

  await page.goto(PAGE, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.tab[data-panel="dashboard"]', { timeout: 15000 });
  return {
    ctx, page, seen, errors, nextWorkerHit,
    resetReads: () => page.evaluate(() => { window.__reads = []; }),
  };
}

(async () => {
  const srv = await serve();
  const browser = await chromium.launch();

  // ═══════════ Scenario A: the App Secret is the only credential ═══════════
  {
    const { ctx, page, seen, errors, nextWorkerHit, resetReads } =
      await openPage(browser, { appKey: APP_KEY, ghToken: null });
    check('U1 with only an App Secret, boot pulls from the Worker (item 5)',
      seen.worker.length >= 1, `worker=${seen.worker.length} errors=${JSON.stringify(errors)}`);
    check('U2 the App Secret is sent as a Bearer header, never in the URL (item 5)',
      seen.authHeaders.length > 0 && seen.authHeaders.every((h) => h === 'Bearer ' + APP_KEY) &&
      seen.worker.every((u) => u.indexOf(APP_KEY) === -1),
      `headersOk=${seen.authHeaders.every((h) => h === 'Bearer ' + APP_KEY)} urlLeaked=${seen.worker.some((u) => u.indexOf(APP_KEY) !== -1)}`);

    // Profile switch is a Pull entry point.
    await resetReads();
    const before = seen.worker.length;
    const hit = nextWorkerHit();
    await page.evaluate(() => { try { window.switchProfile('barry'); } catch (e) { /* asserted below */ } });
    const got = await Promise.race([hit.then(() => true), page.waitForTimeout(8000).then(() => false)]);
    check('U3 with only an App Secret, a profile switch still pulls (item 7)',
      got && seen.worker.length > before,
      `hit=${got} before=${before} after=${seen.worker.length}`);

    // Reading the partner's diary is a Pull entry point.
    await resetReads();
    const beforeDiary = seen.worker.length;
    const diaryHit = nextWorkerHit();
    const called = await page.evaluate(() => {
      if (typeof window.pullPartnerEntry !== 'function') return 'missing';
      try { window.pullPartnerEntry('2026-01-01'); return 'ok'; } catch (e) { return 'threw:' + e.message; }
    });
    const diaryGot = await Promise.race([diaryHit.then(() => true), page.waitForTimeout(8000).then(() => false)]);
    check('U4 with only an App Secret, reading the partner diary pulls (item 8)',
      called === 'ok' && diaryGot && seen.worker.length > beforeDiary,
      `call=${called} hit=${diaryGot} before=${beforeDiary} after=${seen.worker.length}`);

    // The Pull path never reads the Push credential (item 11), observed live.
    const ghReads = await page.evaluate(() => window.__reads.filter((k) => k === 'gh-token').length);
    const readsObserved = await page.evaluate(() => window.__reads.length);
    check('U5 the Pull entry points never read localStorage[gh-token] (item 11)',
      ghReads === 0, `ghTokenReads=${ghReads} readsObserved=${readsObserved}`);

    // And nothing on this device ever reached GitHub (item 12).
    check('U6 a device with no PAT makes zero api.github.com requests (item 12)',
      seen.github.length === 0, `github=${JSON.stringify(seen.github)}`);

    // Push must not silently fall back to the App Secret (item 15).
    const workerBeforePush = seen.worker.length;
    const pushed = await page.evaluate(() => {
      try { window.pushAllSharedData(); return true; } catch (e) { return false; }
    });
    await page.waitForTimeout(1500);
    check('U7 a Push with no GitHub PAT does not fall back to the App Secret (item 15)',
      pushed && seen.github.length === 0 && seen.worker.length === workerBeforePush,
      `pushed=${pushed} github=${seen.github.length} workerBefore=${workerBeforePush} workerAfter=${seen.worker.length}`);
    // Pre-existing, and NOT a load-order artifact: renderSharedDiary is called
    // unguarded at app.js:112 and app.js:600 but is defined nowhere in the tree
    // (js/sync.js:455 is the only other call, and it is typeof-guarded; app.js:346
    // lists the name among functions that no longer exist). The 2A browser run
    // reported the same error, so it predates Phase 2B. Phase 2B must not fix it
    // (that would be an unrelated change), so it is filtered by name here — any
    // *other* page error still fails this assertion.
    const KNOWN_NOISE = 'renderSharedDiary is not defined';
    const unexpected = errors.filter((e) => e.indexOf(KNOWN_NOISE) === -1);
    check('U8 no page error beyond the pre-existing renderSharedDiary ReferenceError',
      unexpected.length === 0,
      `unexpected=${JSON.stringify(unexpected)} knownNoise=${errors.length - unexpected.length}`);

    await ctx.close();
  }

  // ═══════════ Scenario B: the GitHub PAT is the only credential ═══════════
  {
    const { ctx, page, seen, errors, resetReads } =
      await openPage(browser, { appKey: null, ghToken: GH_TOKEN });
    check('U9 with only a GitHub PAT, boot performs no Pull and no Worker request (items 2, 3)',
      seen.worker.length === 0, `worker=${seen.worker.length}`);

    await resetReads();
    const before = seen.github.length;
    const pushed = await page.evaluate(() => {
      try { window.pushAllSharedData(); return true; } catch (e) { return false; }
    });
    await page.waitForTimeout(3000);
    const ghReads = await page.evaluate(() => window.__reads.filter((k) => k === 'gh-token').length);
    check('U10 with only a GitHub PAT, a Push still reads that PAT and writes to GitHub (items 13, 14, 15)',
      pushed && ghReads >= 1 && seen.github.length > before &&
      seen.github.some((c) => c.indexOf('PUT') === 0),
      `pushed=${pushed} ghTokenReads=${ghReads} github=${JSON.stringify(seen.github)}`);
    check('U11 the PAT-only scenario never contacted the Worker',
      seen.worker.length === 0, `worker=${seen.worker.length}`);
    check('U12 no page error was raised in the PAT-only scenario',
      errors.length === 0, `errors=${JSON.stringify(errors)}`);

    await ctx.close();
  }

  // ═══════════ Scenario C: the settings page ═══════════
  {
    const { ctx, page, seen, errors } = await openPage(browser, { appKey: APP_KEY, ghToken: GH_TOKEN });

    const ui = await page.evaluate(() => {
      window.loadSettingsUI();
      const input = document.getElementById('set-gh-token');
      const label = document.getElementById('github-token-label');
      const hint = document.getElementById('set-h-token');
      const test = document.getElementById('testTokenBtn');
      const clear = document.getElementById('clearTokenBtn');
      return {
        inputType: input ? input.getAttribute('type') : null,
        inputValue: input ? input.value : null,
        placeholder: input ? input.getAttribute('placeholder') : null,
        label: label ? label.textContent : null,
        hint: hint ? hint.textContent : null,
        testLabel: test ? test.textContent : null,
        clearLabel: clear ? clear.textContent : null,
        html: document.documentElement.outerHTML,
      };
    });

    check('U13 the settings auth input is a password field and is never pre-filled (item 17)',
      ui.inputType === 'password' && ui.inputValue === '' && ui.placeholder === 'App Secret',
      `type=${ui.inputType} valueEmpty=${ui.inputValue === ''} placeholder=${JSON.stringify(ui.placeholder)}`);
    // The credential name belongs on the label; the hint reports connection state
    // ("this device is configured"), which is what makes the field's emptiness
    // legible without ever putting the secret back in the DOM.
    check('U14 the settings page is labelled for an App Secret, not a GitHub token (item 17)',
      ui.label.indexOf('App Secret') !== -1 &&
      ui.hint.length > 0 && ui.hint.indexOf('GitHub') === -1 &&
      ui.testLabel.length > 0 && ui.testLabel.indexOf('GitHub') === -1 &&
      ui.html.indexOf('GitHub Token') === -1 && ui.html.indexOf('ghp_') === -1,
      `label=${JSON.stringify(ui.label)} hint=${JSON.stringify(ui.hint)} testBtn=${JSON.stringify(ui.testLabel)} clearBtn=${JSON.stringify(ui.clearLabel)} githubTokenInDom=${ui.html.indexOf('GitHub Token') !== -1}`);

    // Clicking the test button must verify against the Worker's /health.
    seen.health.length = 0;
    await page.evaluate(() => { document.getElementById('testTokenBtn').click(); });
    await page.waitForFunction(
      () => document.getElementById('testTokenBtn').textContent.indexOf('barry') !== -1,
      { timeout: 5000 }).catch(() => {});
    const btnText = await page.evaluate(() => document.getElementById('testTokenBtn').textContent);
    check('U15 the settings test button verifies against the Worker /health (items 9, 10)',
      seen.health.length === 1 && seen.health[0] === WORKER_HEALTH &&
      seen.healthAuth[0] === 'Bearer ' + APP_KEY && btnText.indexOf('barry') !== -1,
      `healthCalls=${seen.health.length} authOk=${seen.healthAuth[0] === 'Bearer ' + APP_KEY} btn=${JSON.stringify(btnText)}`);
    check('U16 the settings test never called api.github.com or /user',
      seen.github.length === 0, `github=${JSON.stringify(seen.github)}`);
    check('U17 no page error was raised in the settings scenario',
      errors.length === 0, `errors=${JSON.stringify(errors)}`);

    await ctx.close();
  }

  await browser.close();
  srv.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
