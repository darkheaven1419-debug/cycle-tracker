/**
 * Phase 1.9 §七 — a cold-cache boot still paints solar terms, with no fabricated
 * record involved.
 *
 * The bug this pins was latent and masked. js/render-calendar.js only called
 * ensureSolarTermData() inside the branch where getSolarTerm() had already
 * returned a term — but getSolarTerm() reads the very cache that
 * ensureSolarTermData() fills, and the load is async (fetch calendar-data.json).
 * So if the first render ran before the data arrived, the cache was empty, the
 * `if (solarTerm)` branch was skipped, the `else` branch did not exist, and the
 * label stayed missing forever: nothing retried and nothing redrew.
 *
 * What hid it was §二's injector. js/fix-stats.js wrote two fabricated records on
 * any boot with fewer than two, saveState() persisted them, and the resulting
 * render pass redrew the calendar late enough that the cache had arrived. Removing
 * the injector removed the accidental redraw — which is why this test exists now
 * and did not need to exist before. render-calendar.js:227-237 adds the missing
 * branch and a redraw callback.
 *
 * Two scenarios, because "the label appears" is only meaningful next to "the label
 * can fail to appear":
 *   A  empty install, cold cache  -> .solar-term-label present, text non-empty,
 *      and window.state.records is still empty (no fabricated record was needed);
 *   B  control, calendar-data.json aborted -> zero labels. This proves A measures
 *      the lazy load rather than some always-on rendering path, and that the
 *      assertion could actually fail.
 *
 * Measured against HEAD this suite scores 6/7, and the split is the point: G1
 * PASSES there. The injector's late redraw really did paint the labels, so the
 * original bug is invisible to a "does the label appear" check on its own. G5 is
 * what discriminates — at HEAD it reports liveRecords=2, saved=present, because
 * the two fabricated records that bought the redraw are still in localStorage.
 * Keep both halves for that reason: G1 guards the render path, G5 guards the
 * reason it used to work by accident. A future "the calendar looks empty on first
 * load" fix must not be allowed to reintroduce a fake-record redraw to satisfy G1.
 *
 * Run: node tests/test-phase19-emptystate.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8942;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

const WORKER_HOST = 'cycle-tracker-data.cycletracker-barry.workers.dev';
const PROFILE = 'andjela';
const SOLAR_CACHE_KEY = 'cycle-solarterms';

// The two September 2026 terms in calendar-data.json. September is the month this
// suite runs in, and every month carries exactly two terms, so this stays true.
const EXPECTED_TERMS = ['Bela rosa', 'Jesenja ravnodnevica'];

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
 * One cold boot with genuinely empty localStorage — no seeded state, and no
 * cycle-solarterms, so ensureSolarTermData() must really fetch.
 *
 * `blockCalendarData` aborts calendar-data.json, the control condition. Everything
 * else (the Worker, other assets) is held identical so the two boots differ in
 * exactly one variable.
 */
async function boot(browser, opts) {
  opts = opts || {};
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    serviceWorkers: 'block',
  });
  await ctx.addInitScript((s) => {
    try {
      localStorage.setItem('cycle-active-profile', s.profile);
      sessionStorage.setItem('cycle-logged-in', '1');
    } catch (e) { /* ignore */ }
  }, { profile: PROFILE });

  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message.split('\n')[0]));

  await page.route('**/*', (route) => {
    const u = route.request().url();
    if (u.indexOf(WORKER_HOST) !== -1) {
      return route.fulfill({
        status: 200, contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ sha: null, state: {} }),
      });
    }
    if (opts.blockCalendarData && /calendar-data\.json(\?|$)/.test(u)) return route.abort();
    if (!u.startsWith(`http://localhost:${PORT}/`)) return route.abort();
    return route.continue();
  });

  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.tab[data-panel="dashboard"]', { timeout: 15000 });

  // Give the lazy path its fetch + setTimeout(cb, 0) + redraw, then a margin.
  await page.waitForTimeout(3000);

  const observed = await page.evaluate((cacheKey) => {
    const labels = Array.from(document.querySelectorAll('.solar-term-label'));
    const profile = localStorage.getItem('cycle-active-profile');
    return {
      labelCount: labels.length,
      labelTexts: labels.map((el) => el.textContent),
      solarTermDays: document.querySelectorAll('.solar-term-day').length,
      cachedAtBoot: localStorage.getItem(cacheKey) ? 'present' : 'absent',
      savedRecords: profile ? localStorage.getItem('cycle-data-v6-' + profile) : null,
      liveRecordCount: ((window.state && window.state.records) || []).length,
    };
  }, SOLAR_CACHE_KEY);

  await ctx.close();
  return { observed, pageErrors };
}

(async () => {
  const srv = await serve();
  const browser = await chromium.launch();

  try {
    // ── A: empty install, cold cache ──
    const a = await boot(browser, {});
    const o = a.observed;
    const texts = o.labelTexts.join(' | ');

    check('G1 a cold empty install renders at least one solar-term label',
      o.labelCount > 0,
      `labels=${o.labelCount} texts="${texts}"`);

    check('G2 every rendered label carries a real name, not undefined/empty',
      o.labelCount > 0 &&
        o.labelTexts.length === o.labelCount &&
        o.labelTexts.every((t) => typeof t === 'string' && t.trim().length > 0) &&
        !/undefined|null|NaN/.test(texts),
      `texts="${texts}"`);

    // The names must be the ones calendar-data.json actually holds for the month,
    // which also proves the label came from the fetched data and not a stub.
    const matched = EXPECTED_TERMS.filter((n) => texts.indexOf(n) !== -1);
    check('G3 the label text is the real September term from calendar-data.json',
      matched.length > 0,
      `matched=${JSON.stringify(matched)} expected one of ${JSON.stringify(EXPECTED_TERMS)}`);

    check('G4 the calendar marked those days as solar-term days',
      o.solarTermDays > 0, `solar-term-day cells=${o.solarTermDays}`);

    // The §二 tie-in: this redraw happened on an install with zero records. If a
    // fabricated record were still being injected, it would show up here.
    check('G5 the labels appeared with zero records — no injected record was needed to trigger the redraw',
      o.liveRecordCount === 0 && !/2026-05-28|2026-06-24/.test(o.savedRecords || ''),
      `liveRecords=${o.liveRecordCount} saved=${o.savedRecords ? 'present' : 'absent'}`);

    check('G6 the cold boot raised no uncaught page error',
      a.pageErrors.length === 0, a.pageErrors.join(' | ') || 'none');

    // ── B: control — calendar-data.json aborted ──
    const b = await boot(browser, { blockCalendarData: true });
    check('G7 control: with calendar-data.json blocked, no solar-term label renders',
      b.observed.labelCount === 0,
      `labels=${b.observed.labelCount} — a non-zero count means G1 is not measuring the lazy load`);
  } finally {
    await browser.close();
    srv.close();
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length === 0 ? 0 : 1);
})();
