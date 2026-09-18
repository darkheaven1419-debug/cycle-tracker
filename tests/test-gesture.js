/**
 * Phase 1 regression test — diary date strip vs. page tab-swipe.
 *
 * Bug: a horizontal drag on the diary date strip both scrolled the strip AND bubbled to
 * `.app`, engaging the page tab-swipe and switching tabs on release.
 *
 * Run: node tests/test-gesture.js
 *
 * Service workers are blocked so the test is deterministic; SW behaviour is covered
 * separately by the regression pass.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8931;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

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

/** Dispatch a synthetic touch drag on `selector` so e.target is that element. */
async function touchDrag(page, selector, dx, dy) {
  return page.evaluate((a) => {
    const el = document.querySelector(a.sel);
    if (!el) return 'NOT_FOUND:' + a.sel;
    const r = el.getBoundingClientRect();
    const x0 = Math.round(r.left + r.width / 2);
    const y0 = Math.round(r.top + r.height / 2);
    const steps = 8;
    const ev = (type, x, y) => {
      const t = new Touch({ identifier: 1, target: el, clientX: x, clientY: y });
      const active = type === 'touchend' ? [] : [t];
      return new TouchEvent(type, {
        touches: active, targetTouches: active, changedTouches: [t],
        bubbles: true, cancelable: true,
      });
    };
    el.dispatchEvent(ev('touchstart', x0, y0));
    for (let i = 1; i <= steps; i++) {
      el.dispatchEvent(ev('touchmove', Math.round(x0 + (a.dx * i) / steps), Math.round(y0 + (a.dy * i) / steps)));
    }
    el.dispatchEvent(ev('touchend', x0 + a.dx, y0 + a.dy));
    return 'OK';
  }, { sel: selector, dx, dy });
}

const activePanel = (page) =>
  page.evaluate(() => {
    const t = document.querySelector('.tab.active');
    return t ? t.dataset.panel : null;
  });

async function gotoTab(page, tab) {
  await page.click(`.tab[data-panel="${tab}"]`);
  await page.waitForTimeout(600);
}

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

(async () => {
  const srv = await serve();
  const browser = await chromium.launch();

  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 3,
    serviceWorkers: 'block',
  });

  // Bypass PIN gate: auth.js boots straight into bootApp() when both are set.
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem('cycle-active-profile', 'andjela');
      sessionStorage.setItem('cycle-logged-in', '1');
    } catch (e) { /* ignore */ }
  });

  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('  [pageerror]', e.message.split('\n')[0]));

  await page.route('**/*', (route) => {
    const u = route.request().url();
    if (u.includes('api.github.com') || u.includes('open-meteo')) return route.abort();
    return route.continue();
  });

  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.tab[data-panel="diary"]', { timeout: 15000 });

  await gotoTab(page, 'diary');
  await page.waitForSelector('#diaryDateStrip .diary-date-btn', { timeout: 15000 });

  // ---- A1: horizontal drag on the strip must scroll it, not switch tabs ----
  await touchDrag(page, '#diaryDateStrip', -140, 0);
  await page.waitForTimeout(700);
  check('A1 drag on date strip does NOT switch tab', (await activePanel(page)) === 'diary', `panel=${await activePanel(page)}`);

  // ---- A2: same, but the drag starts on a date pill (deepest target) ----
  await touchDrag(page, '#diaryDateStrip .diary-date-btn', -140, 0);
  await page.waitForTimeout(700);
  check('A2 drag starting on a date pill does NOT switch tab', (await activePanel(page)) === 'diary', `panel=${await activePanel(page)}`);

  // ---- A3: same, dragging the strip to the right ----
  await touchDrag(page, '#diaryDateStrip', 140, 0);
  await page.waitForTimeout(700);
  check('A3 rightward drag on date strip does NOT switch tab', (await activePanel(page)) === 'diary', `panel=${await activePanel(page)}`);

  // ---- A4: vertical drag on the strip must not switch tabs ----
  await touchDrag(page, '#diaryDateStrip', -6, -140);
  await page.waitForTimeout(700);
  check('A4 vertical drag on date strip does NOT switch tab', (await activePanel(page)) === 'diary', `panel=${await activePanel(page)}`);

  // ---- A5: normal page area still swipes between tabs (regression guard) ----
  // V2 IA order is home → together → memories → cycle → settings, so the diary
  // panel's right-hand neighbour is now stats (it used to be settings).
  await touchDrag(page, '#panel-diary', -140, 0);
  await page.waitForTimeout(700);
  check('A5 swipe on normal page area STILL switches tab', (await activePanel(page)) === 'stats', `panel=${await activePanel(page)}`);

  // ---- A6: swipe back the other way ----
  await touchDrag(page, '#panel-stats', 140, 0);
  await page.waitForTimeout(700);
  check('A6 swipe back STILL switches tab', (await activePanel(page)) === 'diary', `panel=${await activePanel(page)}`);

  // ---- A7: PC mouse — clicking tabs still works ----
  await gotoTab(page, 'stats');
  check('A7 mouse click on tab still works', (await activePanel(page)) === 'stats', `panel=${await activePanel(page)}`);

  // ---- A8: short drag (< 60px) must not switch tabs even outside the strip ----
  await gotoTab(page, 'diary');
  await touchDrag(page, '#panel-diary', -30, 0);
  await page.waitForTimeout(700);
  check('A8 sub-threshold drag does not switch tab', (await activePanel(page)) === 'diary', `panel=${await activePanel(page)}`);

  // ---- A9/A10: static guarantees ----
  const src = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  const start = src.indexOf('/* Panel swipe gesture');
  const end = src.indexOf('ONBOARDING');
  const swipeIIFE = src.slice(start, end);
  check('A9 swipe handler never calls preventDefault', swipeIIFE.length > 0 && !swipeIIFE.includes('preventDefault'));
  const css = fs.readFileSync(path.join(ROOT, 'css/calendar.css'), 'utf8');
  const stripRule = css.slice(css.indexOf('.diary-date-strip {'), css.indexOf('.diary-date-strip::-webkit-scrollbar'));
  check('A10 date strip does not restrict touch-action (vertical scroll preserved)', stripRule.length > 0 && !stripRule.includes('touch-action'));

  await browser.close();
  srv.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
