/**
 * Home first-screen behaviour — what the couple space actually shows on open.
 *
 * Why this exists: tests/test-phase1a-ia.js asserts the Home blocks are built in
 * the right *DOM order*, and it was fully green while the real first screen was
 * 100% month calendar — the blocks existed, correctly ordered, entirely below a
 * global `#calendarContainer` that lived in the app shell outside every panel.
 * Order is not visibility. This suite asserts the rendered geometry instead:
 * on Home the couple content must be on screen and the calendar must not be.
 *
 * The calendar still has to work — it now belongs to the Cycle panel, so the
 * second half of this file proves it renders and is reachable there.
 *
 * Run: node tests/test-home-first-screen.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8934;
const URL = `http://localhost:${PORT}/index.html`;
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

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

/** Geometry of the active panel's first screen, measured live. */
const FIRST_SCREEN = () => {
  const vis = (el) => !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
  const box = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { visible: vis(el), top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) };
  };
  const inScreen = (b) => !!b && b.visible && b.top < innerHeight && b.bottom > 0;
  const fully = (b) => !!b && b.visible && b.top >= 0 && b.bottom <= innerHeight;
  const active = document.querySelector('.panel.active');
  const dash = active && active.id === 'panel-dashboard' ? active : null;
  return {
    vh: innerHeight,
    activePanel: active ? active.id : null,
    title: (document.getElementById('h-title') || {}).textContent || null,
    calendar: box('#calendarContainer'),
    calInsideStats: !!(active && active.id === 'panel-stats' && active.querySelector('#calendarContainer')),
    coupleHead: box('#dash-couple-head'),
    today: box('#dash-today'),
    connect: box('#dash-connect'),
    herCycle: box('#dash-her-cycle'),
    links: box('#dash-links-card'),
    firstBlock: dash && dash.children.length
      ? (dash.children[0].id || dash.children[0].className) : null,
    inScreen: {
      coupleHead: inScreen(box('#dash-couple-head')),
      today: inScreen(box('#dash-today')),
      connect: inScreen(box('#dash-connect')),
      herCycle: inScreen(box('#dash-her-cycle')),
    },
    coupleHeadFully: fully(box('#dash-couple-head')),
    /* The bottom nav is sized by JS from the app's content column
       (js/fix-all.js _fixNavigation). It used to measure `.calendar`'s rect,
       which collapses to all zeros once the calendar lives in a panel that is
       display:none — silently zeroing the nav to width 0 while all 18 suites
       stayed green. Anything the nav is measured from must be always-laid-out. */
    nav: (function () {
      const el = document.querySelector('nav.tabs-nav');
      const app = document.querySelector('.app');
      if (!el || !app) return null;
      const nb = el.getBoundingClientRect();
      const ab = app.getBoundingClientRect();
      const cs = getComputedStyle(app);
      const pl = parseFloat(cs.paddingLeft) || 0;
      const pr = parseFloat(cs.paddingRight) || 0;
      return {
        w: Math.round(nb.width), left: Math.round(nb.left), h: Math.round(nb.height),
        appContentW: Math.round(ab.width - pl - pr),
        appContentLeft: Math.round(ab.left + pl),
      };
    })(),
  };
};

async function open(browser, width, height, mobile) {
  const ctx = await browser.newContext({
    viewport: { width, height }, hasTouch: mobile, isMobile: mobile,
    deviceScaleFactor: 1, serviceWorkers: 'block',
  });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem('cycle-active-profile', 'barry');
      sessionStorage.setItem('cycle-logged-in', '1');
    } catch (e) { /* ignore */ }
  });
  await ctx.route('**/*', (route) => {
    const u = route.request().url();
    if (u.indexOf(`http://localhost:${PORT}`) === 0) return route.continue();
    if (u.indexOf('workers.dev') !== -1) return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    return route.abort();
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]));
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.panel.active', { timeout: 20000 });
  await page.waitForTimeout(1500);
  return { ctx, page, errors };
}

(async () => {
  const srv = await serve();
  const browser = await chromium.launch();
  const allErrors = [];

  /* ── Static: the calendar must belong to the Cycle panel, not the shell ── */
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const statsAt = html.indexOf('id="panel-stats"');
  const calAt = html.indexOf('id="calendarContainer"');
  const dashAt = html.indexOf('id="panel-dashboard"');
  check('the calendar lives inside #panel-stats, not the app shell',
    calAt !== -1 && statsAt !== -1 && calAt > statsAt,
    `statsAt=${statsAt} calendarAt=${calAt}`);
  check('the calendar was relocated, not duplicated',
    (html.match(/id="calendarContainer"/g) || []).length === 1 &&
    (html.match(/id="cycleCalendarBlock"/g) || []).length === 1,
    `calendar=${(html.match(/id="calendarContainer"/g) || []).length} block=${(html.match(/id="cycleCalendarBlock"/g) || []).length}`);
  check('#panel-dashboard no longer contains any calendar node',
    dashAt !== -1 && statsAt !== -1 && html.slice(dashAt, statsAt).indexOf('calendarContainer') === -1);

  /* ── Live: Home's first screen must be the couple space ────────────────── */
  for (const vp of [{ n: '320x800', w: 320, h: 800, m: true }, { n: '1440x900', w: 1440, h: 900, m: false }]) {
    const { ctx, page, errors } = await open(browser, vp.w, vp.h, vp.m);
    allErrors.push(...errors);

    const s = await page.evaluate(FIRST_SCREEN);
    check(`[${vp.n}] Home is the active panel`, s.activePanel === 'panel-dashboard', `active=${s.activePanel}`);
    check(`[${vp.n}] the calendar is NOT on Home's first screen`,
      !s.calendar.visible, `calendar=${JSON.stringify(s.calendar)}`);
    check(`[${vp.n}] Couple Header is fully on the first screen`, s.coupleHeadFully,
      `head=${JSON.stringify(s.coupleHead)} vh=${s.vh}`);
    check(`[${vp.n}] Today for Us is on the first screen`, s.inScreen.today,
      `today=${JSON.stringify(s.today)}`);
    check(`[${vp.n}] a partner-interaction entry is on the first screen`,
      s.inScreen.connect || s.inScreen.links,
      `connect=${JSON.stringify(s.connect)} links=${JSON.stringify(s.links)}`);
    check(`[${vp.n}] the first Home block is the couple header, not the cycle summary`,
      s.firstBlock === 'dash-couple-head', `first=${s.firstBlock}`);
    check(`[${vp.n}] Her Cycle does not dominate the first screen`,
      !s.herCycle.visible || s.herCycle.h < s.vh * 0.5,
      `herCycleH=${s.herCycle.h} vh=${s.vh}`);
    check(`[${vp.n}] the identity title is the couple space, not "Anđelin Ciklus"`,
      !!s.title && s.title.indexOf('Ciklus') === -1,
      `title=${JSON.stringify(s.title)}`);

    /* ── The calendar must still work on Cycle ── */
    await page.click('.tab[data-panel="stats"]');
    await page.waitForTimeout(900);
    const c = await page.evaluate(() => {
      const el = document.getElementById('calendarContainer');
      const active = document.querySelector('.panel.active');
      const days = document.querySelectorAll('#daysGrid .day').length;
      const label = (document.getElementById('monthLabel') || {}).textContent || '';
      const r = el ? el.getBoundingClientRect() : null;
      return {
        visible: !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length)),
        top: r ? Math.round(r.top) : null, days, label,
        insideActive: !!(active && active.querySelector('#calendarContainer')),
      };
    });
    check(`[${vp.n}] the full calendar renders inside Cycle`, c.visible && c.insideActive,
      `visible=${c.visible} insideActivePanel=${c.insideActive} top=${c.top}`);
    check(`[${vp.n}] the calendar still fills its day grid`, c.days >= 28 && c.label.length > 0,
      `days=${c.days} label=${JSON.stringify(c.label.slice(0, 18))}`);

    /* ── Navigation still intact ── */
    const seq = [];
    for (const t of ['dashboard', 'together', 'diary', 'stats', 'settings']) {
      await page.click(`.tab[data-panel="${t}"]`);
      await page.waitForTimeout(400);
      seq.push(await page.evaluate(() => (document.querySelector('.panel.active') || {}).id));
    }
    check(`[${vp.n}] all five tabs still route correctly`,
      JSON.stringify(seq) === JSON.stringify(['panel-dashboard', 'panel-together', 'panel-diary', 'panel-stats', 'panel-settings']),
      JSON.stringify(seq));

    /* A zero-width nav still "routes correctly" when clicked programmatically,
       which is why routing alone never caught this. Assert it is actually
       painted, and spans the app column the way it did before the move. */
    check(`[${vp.n}] the bottom nav is painted with real width`,
      !!s.nav && s.nav.w > 0 && s.nav.h > 0,
      `nav=${JSON.stringify(s.nav)}`);
    check(`[${vp.n}] the nav spans the app content column (not a hidden panel's zeros)`,
      !!s.nav && Math.abs(s.nav.w - s.nav.appContentW) <= 1 && Math.abs(s.nav.left - s.nav.appContentLeft) <= 1,
      `nav=${JSON.stringify(s.nav)}`);

    await ctx.close();
  }

  await browser.close();
  srv.close();

  check('no uncaught page error in any viewport', allErrors.length === 0, allErrors.slice(0, 3).join(' | '));

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
