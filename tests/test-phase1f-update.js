/**
 * Phase 1F — the PWA tells you a new version exists, and only you can take it.
 *
 * Phase 0 removed the unconditional skipWaiting() from sw.js: a new SW taking
 * over a page that still references the old cache produces "old page + new SW".
 * The cost of that fix was silence — a new version parked in waiting forever and
 * the user was never told. Phase 1F adds the page-side half.
 *
 * Two halves:
 *   - static: sw.js still does not skipWaiting in install and still answers
 *     SKIP_WAITING; app.js / index.html / css/v2.css carry the prompt, and the
 *     three constraints the prompt has to hold are visible in the source;
 *   - behavioural: with navigator.serviceWorker stubbed, a first install shows
 *     nothing, an update shows the bar, Update posts SKIP_WAITING and disables
 *     itself, and two controllerchange events still cause exactly one reload.
 *
 * Run: node tests/test-phase1f-update.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8936;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};
const WORKER_HOST = 'cycle-tracker-data.cycletracker-barry.workers.dev';

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

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

/** Stub navigator.serviceWorker before any app code runs, so the update
 *  lifecycle can be driven deterministically instead of raced. */
function stubSW() {
  try {
    sessionStorage.setItem('cycle-logged-in', '1');
    localStorage.setItem('cycle-active-profile', 'andjela');
    sessionStorage.setItem('p1f-loads', String((parseInt(sessionStorage.getItem('p1f-loads'), 10) || 0) + 1));
  } catch (e) { /* ignore */ }
  const mode = new URLSearchParams(location.search).get('swmode') || 'first';
  const ccListeners = [];
  const mkNode = () => {
    const h = {};
    return { _h: h, state: 'installing', addEventListener(t, cb) { (h[t] = h[t] || []).push(cb); } };
  };
  const installing = mkNode();
  const posted = [];
  const reg = {
    waiting: { postMessage(m) { posted.push(m && m.type); } },
    installing: installing,
    _h: {},
    addEventListener(t, cb) { (this._h[t] = this._h[t] || []).push(cb); },
  };
  const api = {
    controller: mode === 'update' ? { fake: true } : null,
    addEventListener(t, cb) { if (t === 'controllerchange') ccListeners.push(cb); },
    register() { return Promise.resolve(reg); },
  };
  Object.defineProperty(navigator, 'serviceWorker', { configurable: true, get() { return api; } });
  window.__p1f = {
    reg: reg,
    installing: installing,
    posted: posted,
    fire(obj, type) { (obj._h[type] || []).forEach((cb) => cb()); },
    fireControllerChange() { ccListeners.forEach((cb) => cb()); },
    loads() { return parseInt(sessionStorage.getItem('p1f-loads'), 10) || 0; },
  };
}

async function boot(browser, mode) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true, isMobile: true, deviceScaleFactor: 3,
    serviceWorkers: 'block',
  });
  await ctx.addInitScript(stubSW);
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message.split('\n')[0]));
  await page.route('**/*', (route) => {
    const req = route.request();
    const u = req.url();
    if (u.indexOf(WORKER_HOST) !== -1) {
      const origin = req.headers()['origin'];
      const cors = origin ? {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        Vary: 'Origin',
      } : {};
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
      return route.fulfill({
        status: 200, contentType: 'application/json', headers: cors,
        body: JSON.stringify({ sha: null, state: {} }),
      });
    }
    if (u.indexOf('api.github.com') !== -1) return route.abort();
    return route.continue();
  });
  await page.goto(`http://127.0.0.1:${PORT}/index.html?swmode=${mode}`);
  await page.waitForFunction(() => window.__p1f && window.__p1f.reg, null, { timeout: 10000 });
  return { ctx, page, pageErrors };
}

(async () => {
  const browser = await chromium.launch();
  const srv = await serve();

  const sw = read('sw.js');
  const app = read('app.js');
  const html = read('index.html');
  const css = read('css/v2.css');

  // ── A. static: the two halves of the contract ──
  // sw.js explains the decision in prose right where the call used to live, so
  // the question is whether any STATEMENT still calls it, not whether the word
  // appears inside the install handler at all.
  const installSeg = sw.slice(sw.indexOf("addEventListener('install'"), sw.indexOf("addEventListener('activate'"));
  const liveSkipWaitingCall = installSeg.split('\n').some((line) => {
    const codeOnly = line.split('//')[0];
    return codeOnly.indexOf('skipWaiting') !== -1;
  });
  check('F1 install does not call skipWaiting (that was the old-page + new-SW mix)',
    !liveSkipWaitingCall,
    `installCallsSkipWaiting=${liveSkipWaitingCall}`);

  check('F2 the SW still answers SKIP_WAITING from the page',
    sw.indexOf("addEventListener('message'") !== -1 && sw.indexOf("data.type === 'SKIP_WAITING'") !== -1,
    `handler=${sw.indexOf("addEventListener('message'") !== -1}`);

  // test-version-consistency.js reads this same call out of app.js, so Phase 1F
  // moved it into setupUpdatePrompt() rather than dropping it.
  check('F3 app.js still registers the service worker',
    app.indexOf(".register('sw.js?v=") !== -1, `found=${app.indexOf(".register('sw.js?v=") !== -1}`);

  const guards = app.split('navigator.serviceWorker.controller').length - 1;
  check('F4 the prompt is gated on a controller, so a first install is not an update',
    guards === 2, `controllerGuards=${guards}`);

  check('F5 the reload is gated on the user having clicked Update',
    app.indexOf('if (!_updateAsked || _updateReloading) return;') !== -1, '');

  const onceIdx = app.indexOf('_updateReloading = true;');
  check('F6 the reload is one-shot (controllerchange can fire repeatedly)',
    onceIdx !== -1 && onceIdx < app.indexOf('location.reload();'),
    `guardBeforeReload=${onceIdx !== -1 && onceIdx < app.indexOf('location.reload();')}`);

  check('F7 index.html carries the prompt, its label and its button',
    html.indexOf('id="updateBanner"') !== -1 && html.indexOf('id="updateText"') !== -1 &&
    html.indexOf('id="updateBtn"') !== -1 && html.indexOf('role="status"') !== -1, '');

  const rmStart = css.indexOf('@media (prefers-reduced-motion: reduce)');
  const rmSeg = css.slice(rmStart, css.indexOf('animation: none', rmStart));
  check('F8 the bar honours reduced motion',
    rmSeg.indexOf('.update-banner') !== -1 && rmSeg.indexOf('.update-btn') !== -1,
    `inReducedMotionBlock=${rmSeg.indexOf('.update-banner') !== -1}`);

  const bIdx = css.indexOf('.update-banner {');
  const bBlock = css.slice(bIdx, css.indexOf('}', bIdx));
  check('F9 the bar is fixed above the nav (z-index 61 > nav 60) and clears its bottom edge',
    bIdx !== -1 && bBlock.indexOf('position: fixed') !== -1 &&
    bBlock.indexOf('z-index: 61') !== -1 && /bottom:\s*74px/.test(bBlock), '');

  // F9b/F9c pin two real defects the shipped bar had, both invisible to the
  // behavioural half below because the stub never lays anything out.
  //
  // The bar and the quick-add FAB share one band, and css/calendar.css pins the
  // FAB at z-index 70 -- above this bar's 61. Below ~548px the two overlap and
  // the FAB lands exactly on the Update button, so the only control that can
  // accept the update became unclickable on a phone. Raising our z-index would
  // merely invert the problem and wall off a core action, so the narrow-screen
  // rule stacks the bar above the FAB instead: 80 (FAB bottom) + 56 (FAB) + 10.
  const btnAnchor = css.indexOf('.update-banner span {');
  const btnIdx = css.indexOf('.update-btn {', btnAnchor);
  const btnBlock = css.slice(btnIdx, css.indexOf('}', btnIdx));
  check('F9b the Update button meets the 44px touch target',
    btnIdx !== -1 && /min-height:\s*44px/.test(btnBlock) && btnBlock.indexOf('inline-flex') !== -1,
    `minHeight44=${/min-height:\s*44px/.test(btnBlock)} inlineFlex=${btnBlock.indexOf('inline-flex') !== -1}`);

  const fabSrc = read('css/calendar.css');
  const fabIdx = fabSrc.indexOf('.fab {');
  const fabBlock = fabSrc.slice(fabIdx, fabSrc.indexOf('}', fabIdx));
  const fabZ = (fabBlock.match(/z-index:\s*(\d+)/) || [])[1];
  const narrowIdx = css.indexOf('@media (max-width: 560px)');
  const narrowEnd = narrowIdx === -1 ? -1 : css.indexOf('}', css.indexOf('}', narrowIdx) + 1) + 1;
  const narrowBlock = narrowEnd === -1 ? '' : css.slice(narrowIdx, narrowEnd);
  check('F9c on narrow screens the bar stacks above the quick-add FAB',
    fabZ === '70' && narrowBlock.indexOf('.update-banner') !== -1 &&
    /bottom:\s*calc\(146px \+ env\(safe-area-inset-bottom/.test(narrowBlock),
    `fabZ=${fabZ} narrowRule=${narrowBlock.indexOf('.update-banner') !== -1}`);

  check('F10 the three files the prompt lives in are precached, so a bump reaches them',
    ["'./index.html'", "'./app.js'", "'./css/v2.css'"].every((f) => sw.indexOf(f) !== -1), '');

  // ── B. behavioural: the real lifecycle, driven through the stub ──
  {
    const { ctx, page, pageErrors } = await boot(browser, 'first');
    await page.waitForTimeout(300);
    const shown = await page.evaluate(() => document.getElementById('updateBanner').classList.contains('show'));
    check('F11 a first install (no controller) shows no prompt', shown === false, `shown=${shown}`);
    check('F11b the boot raised no page errors', pageErrors.length === 0, pageErrors.join(' | ') || 'none');
    await ctx.close();
  }

  {
    const { ctx, page } = await boot(browser, 'update');
    await page.evaluate(() => window.__p1f.fire(window.__p1f.reg, 'updatefound'));
    await page.evaluate(() => {
      window.__p1f.installing.state = 'installed';
      window.__p1f.fire(window.__p1f.installing, 'statechange');
    });

    const shown = await page.evaluate(() => document.getElementById('updateBanner').classList.contains('show'));
    check('F12 an update (controller present) shows the prompt', shown === true, `shown=${shown}`);

    const txt = await page.evaluate(() => document.getElementById('updateText').textContent);
    const btnTxt = await page.evaluate(() => document.getElementById('updateBtn').textContent);
    check('F13 the prompt is localised', !!txt && !!btnTxt, `text=${txt} btn=${btnTxt}`);

    await page.evaluate(() => document.getElementById('updateBtn').click());
    const posted = await page.evaluate(() => window.__p1f.posted.slice());
    const disabled = await page.evaluate(() => document.getElementById('updateBtn').disabled);
    check('F14 Update posts SKIP_WAITING exactly once and disables the button',
      posted.length === 1 && posted[0] === 'SKIP_WAITING' && disabled === true,
      `posted=${posted.join(',') || 'none'} disabled=${disabled}`);

    const before = await page.evaluate(() => window.__p1f.loads());
    await page.evaluate(() => {
      window.__p1f.fireControllerChange();
      window.__p1f.fireControllerChange();
    });
    let sawOne = false;
    try {
      await page.waitForFunction((b) => window.__p1f && window.__p1f.loads() === b + 1, before, { timeout: 4000 });
      sawOne = true;
    } catch (e) { sawOne = false; }
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => window.__p1f.loads()).catch(() => -1);
    check('F15 two controllerchange events cause exactly one reload',
      sawOne && after === before + 1, `before=${before} after=${after}`);
    await ctx.close();
  }

  await browser.close();
  srv.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
