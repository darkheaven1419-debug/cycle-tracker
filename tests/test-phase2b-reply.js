/**
 * Phase 2B — the reply opportunity must survive the view.
 *
 * §七 asks that "she left something for me -> I can reply right away" be the
 * FIRST-LAYER experience on Home. Phase 1B.5 and 2A already hung the reply row
 * off the newest partner note on both Home (#dash-today) and Together
 * (#together-new), reusing the one Echo primitive.
 *
 * What they did not cover is how that row EXPIRES. `_replyTarget` was bounded by
 * the since-last-open window, and `_markTodaySeen` advances that window on
 * pagehide/visibilitychange. So the affordance was consumed by SEEING, not by
 * REPLYING: glance at the app once and close it, and the note can never be
 * answered from the first screen again — even though the person never replied.
 *
 * That contradicts the file's own stated intent at module-dashboard.js:430-432
 * ("the reply row must not disappear just because the list got crowded"). It
 * solved that for one cause of disappearance (crowding) and left the other
 * (the window advancing) in place.
 *
 * This suite pins the fix, and pins that the fix does NOT undo the design it
 * sits next to: the *list* still does not replay what you have already seen
 * (tests/test-today.js T4). Only the *action* outlives the view.
 *
 * Run: node tests/test-phase2b-reply.js
 *
 * Each scenario gets its own context so `cycle-last-open-<profile>` starts from
 * a known state; service workers are blocked for determinism.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8961;
const URL = `http://localhost:${PORT}/index.html`;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

/* An old timestamp: far outside any since-last-open window a test would seed. */
const T_OLD = 1700000000000;
/* ASCII-only note bodies so the assertions cannot be defeated by encoding. */
const OLD_NOTE = 'STARA BELESKA VAN PROZORA';
const FRESH_NOTE = 'HVALA JUTROS';

const APP_KEY = 'test-app-key-phase2b-reply-000000000000000000';
const WORKER_HOST = 'https://cycle-tracker-data.cycletracker-barry.workers.dev';
const WORKER_STATE = WORKER_HOST + '/state';
const WORKER_TODO = WORKER_HOST + '/todo';

const githubCalls = [];

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
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

const errors = [];

async function scenario(browser, seed, profile) {
  const me = profile || 'andjela';
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true, isMobile: true, deviceScaleFactor: 3,
    serviceWorkers: 'block',
  });
  await ctx.addInitScript((arg) => {
    try {
      localStorage.setItem('cycle-active-profile', arg.profile);
      sessionStorage.setItem('cycle-logged-in', '1');
      Object.keys(arg.seed).forEach((k) => {
        const v = arg.seed[k];
        localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
      });
    } catch (e) { /* ignore */ }
  }, { profile: me, seed });

  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]));

  const remote = { state: null, todo: [] };
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
      if (req.method() === 'PUT') {
        return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ sha: 'test-sha' }) });
      }
      return route.fulfill({
        status: 200, contentType: 'application/json', headers: cors,
        body: JSON.stringify({ sha: remote.state ? 'test-sha' : null, state: remote.state || {} }),
      });
    }
    if (u === WORKER_TODO) {
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
      if (req.method() === 'PUT') {
        return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ sha: 'test-todo-sha' }) });
      }
      return route.fulfill({
        status: 200, contentType: 'application/json', headers: cors,
        body: JSON.stringify({ sha: null, todo: remote.todo || [] }),
      });
    }
    if (u.indexOf('api.github.com') !== -1) {
      githubCalls.push(req.method() + ' ' + u);
      return route.abort();
    }
    if (u.includes('open-meteo')) return route.abort();
    return route.continue();
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.tab[data-panel="dashboard"]', { timeout: 15000 });
  const active = await page.evaluate(() => document.querySelector('.panel.active').id);
  if (active !== 'panel-dashboard') {
    await page.click('.tab[data-panel="dashboard"]');
    await page.waitForTimeout(600);
  }
  await page.waitForSelector('#dash-today', { state: 'attached', timeout: 15000 });
  await page.waitForTimeout(500);
  return { page, ctx, remote };
}

/**
 * Read one of the two surfaces. Both hang the same `_replyAffordanceHtml` off
 * the newest partner note, so the same shape is asserted for each.
 *
 * `text` is the surface's own rendered text: the point of the T4-style guard is
 * that the note BODY must not reappear there. Only the action may persist.
 */
const surface = (page, hostId) => page.evaluate((id) => {
  const host = document.getElementById(id);
  if (!host) return null;
  const react = host.querySelector('.tnew-react');
  return {
    hidden: !!host.hidden,
    text: (host.innerText || host.textContent || '').replace(/\s+/g, ' ').trim(),
    reactCount: host.querySelectorAll('.tnew-react').length,
    ask: host.querySelector('.tnew-ask') ? host.querySelector('.tnew-ask').textContent.trim() : null,
    btns: react ? react.querySelectorAll('.grat-echo-btn').length : 0,
    nestedInRow: host.querySelectorAll('.tnew-row .grat-echo-btn').length,
  };
}, hostId);

/** Together is only built once its tab is opened; Home is the landing panel. */
const openTogether = async (page) => {
  await page.click('.tab[data-panel="together"]');
  await page.waitForTimeout(700);
};

(async () => {
  const srv = await serve();
  const browser = await chromium.launch();

  /* An un-answered partner note that arrived BEFORE the window opened. This is
     the exact state the old code treated as "nothing to do". */
  const STALE_UNANSWERED = {
    'ct-app-key': APP_KEY,
    'cycle-last-open-andjela': String(Date.now() - 3600000),
    'shared-gratitude': [{ text: OLD_NOTE, from: 'barry', time: T_OLD }],
  };

  // ---- R1: the action outlives the view, on Home ----
  {
    const s = await scenario(browser, STALE_UNANSWERED);
    const home = await surface(s.page, 'dash-today');
    check('R1 an un-answered note from outside the window still offers the reply row on Home',
      home.reactCount === 1 && home.btns === 5 && home.ask !== null,
      `reactCount=${home.reactCount} btns=${home.btns} ask=${JSON.stringify(home.ask)}`);
    check('R1b the note BODY is still not replayed — only the action persists',
      home.text.indexOf(OLD_NOTE) === -1,
      `text="${home.text.slice(0, 70)}"`);
    check('R1c the vacuous empty copy is not shown alongside a live action',
      home.text.indexOf('nema novih') === -1,
      `text="${home.text.slice(0, 70)}"`);
    check('R1d the reply buttons are siblings of the row, never nested in it',
      home.nestedInRow === 0, `nested=${home.nestedInRow}`);
    await s.ctx.close();
  }

  // ---- R2: same rule on Together, or the two surfaces disagree ----
  {
    const s = await scenario(browser, STALE_UNANSWERED);
    await openTogether(s.page);
    const tog = await surface(s.page, 'together-new');
    check('R2 Together offers the same reply row for the same stale un-answered note',
      tog.hidden === false && tog.reactCount === 1 && tog.btns === 5,
      `hidden=${tog.hidden} reactCount=${tog.reactCount} btns=${tog.btns}`);
    check('R2b Together does not replay the note body either',
      tog.text.indexOf(OLD_NOTE) === -1, `text="${tog.text.slice(0, 70)}"`);
    await s.ctx.close();
  }

  // ---- R3: it clears by ACTING, which is the whole point ----
  {
    const s = await scenario(browser, Object.assign({}, STALE_UNANSWERED, {
      'shared-gratitude-echo': [{
        noteFrom: 'barry', noteTime: T_OLD, from: 'andjela', emoji: '\u{1F49E}', time: T_OLD + 60000,
      }],
    }));
    const home = await surface(s.page, 'dash-today');
    await openTogether(s.page);
    const tog = await surface(s.page, 'together-new');
    check('R3 once I have answered it, the row goes away on Home',
      home.reactCount === 0, `reactCount=${home.reactCount} text="${home.text.slice(0, 60)}"`);
    check('R3b and on Together, which falls back to hidden when there is nothing to do',
      tog.hidden === true && tog.reactCount === 0, `hidden=${tog.hidden} reactCount=${tog.reactCount}`);
    await s.ctx.close();
  }

  // ---- R4: a fresh note still wins — this fix must not change that ----
  {
    const freshT = Date.now() - 300000;
    const s = await scenario(browser, {
      'ct-app-key': APP_KEY,
      'cycle-last-open-andjela': String(Date.now() - 3600000),
      'shared-gratitude': [
        { text: OLD_NOTE, from: 'barry', time: T_OLD },
        { text: FRESH_NOTE, from: 'barry', time: freshT },
      ],
    });
    const home = await surface(s.page, 'dash-today');
    check('R4 a fresh note is still the one the reply row attaches to',
      home.reactCount === 1 && home.btns === 5 && home.text.indexOf(FRESH_NOTE) !== -1,
      `reactCount=${home.reactCount} hasFresh=${home.text.indexOf(FRESH_NOTE) !== -1} hasOld=${home.text.indexOf(OLD_NOTE) !== -1}`);
    check('R4b the older un-answered note is not dragged back into the list',
      home.text.indexOf(OLD_NOTE) === -1, `text="${home.text.slice(0, 90)}"`);
    await s.ctx.close();
  }

  // ---- R5: one tap from Home actually records the answer ----
  {
    const s = await scenario(browser, STALE_UNANSWERED);
    const before = await s.page.evaluate(() => document.querySelector('.panel.active').id);
    /* Short timeout + swallow: on a RED run the button does not exist yet, and a
       throwing click would abort the suite before the later checks report. */
    await s.page.click('#dash-today .tnew-react .grat-echo-btn', { timeout: 3000 }).catch(() => {});
    await s.page.waitForTimeout(500);
    const after = await s.page.evaluate(() => {
      let echo = [];
      try { echo = JSON.parse(localStorage.getItem('shared-gratitude-echo') || '[]'); } catch (e) {}
      return { panel: document.querySelector('.panel.active').id, echo: echo };
    });
    check('R5 tapping the reaction on Home records the echo and does not navigate away',
      after.panel === before && after.panel === 'panel-dashboard' &&
      after.echo.length === 1 && after.echo[0].from === 'andjela' &&
      String(after.echo[0].noteFrom) === 'barry' && after.echo[0].noteTime === T_OLD &&
      after.echo[0].emoji === '❤️',
      `panel=${after.panel} (was ${before}) echo=${JSON.stringify(after.echo)}`);
    const home = await surface(s.page, 'dash-today');
    check('R5b having answered it, the offer is gone without a reload',
      home.reactCount === 0, `reactCount=${home.reactCount}`);
    await s.ctx.close();
  }

  // ---- R6: symmetry — Barry is not the only viewer (§9) ----
  {
    const partnerNote = 'OD ANDJELE ZA BARIJA';
    /* Language is PER PROFILE: Barry renders Chinese by default, so comparing the
       two genders' wording is only meaningful with both pinned to the same
       language. Without this the assertion would be comparing zh-CN to sr and
       would "pass" for the wrong reason. */
    const s = await scenario(browser, {
      'ct-app-key': APP_KEY,
      /* app.js:477 sets window.lang from the UNPREFIXED 'cycle-lang', and
         app.js:443 auto-selects a language when profileKey('cycle-lang-chosen')
         is absent. Seeding the -barry key alone does nothing; all four are
         needed, which is the same set tests/test-memories.js:243-249 uses. */
      'cycle-lang': 'sr',
      'cycle-lang-barry': 'sr',
      'cycle-lang-chosen': '1',
      'cycle-lang-chosen-barry': '1',
      'cycle-last-open-barry': String(Date.now() - 3600000),
      'shared-gratitude': [{ text: partnerNote, from: 'andjela', time: T_OLD }],
    }, 'barry');
    const home = await surface(s.page, 'dash-today');
    check('R6 with Barry signed in and Anđela the author, the same rule applies',
      home.reactCount === 1 && home.btns === 5 && home.ask !== null,
      `reactCount=${home.reactCount} btns=${home.btns} ask=${JSON.stringify(home.ask)}`);
    check('R6b the wording addresses the partner, not a fixed gender',
      home.ask !== null && home.ask.indexOf('joj') !== -1,
      `ask=${JSON.stringify(home.ask)}`);
    await s.ctx.close();
  }

  // ---- R7: no unread system, and nothing new invented to store ----
  {
    const s = await scenario(browser, STALE_UNANSWERED);
    const keys = await s.page.evaluate(() => Object.keys(localStorage)
      .filter((k) => /unread|badge|seen|unanswered|pending|reply/i.test(k)));
    check('R7 no unread / badge / seen / pending-reply key is invented',
      keys.length === 0, JSON.stringify(keys));
    check('R7b nothing was fetched from GitHub directly (Browser -> Worker only)',
      githubCalls.length === 0, JSON.stringify(githubCalls.slice(0, 2)));
    await s.ctx.close();
  }

  // ---- R8: the old shape must not come back ----
  {
    const src = fs.readFileSync(path.join(ROOT, 'js', 'module-dashboard.js'), 'utf8');
    const body = (src.match(/function _replyTarget\([\s\S]{0,1400}?\n  \}/) || [''])[0];
    check('R8 _replyTarget ships the two-branch form (fresh first, un-answered fallback)',
      /_iEchoed\(/.test(body) && /unanswered/i.test(body),
      body ? body.slice(0, 100).replace(/\s+/g, ' ') : 'not found');
    check('R8b the window bound is no longer an unconditional early return',
      !/if\s*\(\s*g\.time\s*<=\s*since\s*\)\s*return\s*;/.test(src),
      'the old discard is gone');
  }

  check('R9 no uncaught page error across every scenario',
    errors.length === 0, errors.slice(0, 3).join(' | ') || 'none');

  await browser.close();
  srv.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
