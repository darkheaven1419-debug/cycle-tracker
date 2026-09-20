/**
 * Phase 2B.3 — Know Me must open on the live moment, not on a form.
 *
 * §七 rules out the quiz framing for Know Me ("Know Me 不是「做题得分」，
 * 应该是：「我想猜她」"). The scoring half was already refused by the renderer's own
 * comment at js/render-love.js:79-83 ("不是考试：没有分数、没有排名、不记录连对",
 * with the verdict stored on the judged record so both people see it). What was
 * left is the FIRST IMPRESSION: `renderKnowMe` opened with either my textarea
 * (when I had not answered) or my own answer, so the card read as the day's
 * homework rather than as something about her.
 *
 * `knowMeLead` now names the one live thing on the card, and only that:
 *   - she guessed me and I have not judged it -> the one-tap reply, said first
 *   - I have not guessed her yet             -> the suspense itself
 *   - otherwise                              -> nothing at all
 *
 * Run: node tests/test-phase2b-knowme.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8966;
const URL = `http://localhost:${PORT}/index.html`;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

const APP_KEY = 'test-app-key-phase2b-knowme-000000000000000000';
const WORKER_HOST = 'https://cycle-tracker-data.cycletracker-barry.workers.dev';
const WORKER_STATE = WORKER_HOST + '/state';
const WORKER_TODO = WORKER_HOST + '/todo';

const githubCalls = [];

/* The lead is gendered by PARTNER, not by viewer: "andjela"===activeProfile means
   the partner is Barry, so the M wording is the one that must appear. */
const LEAD_HIS = 'On je poga\u{0111}ao tebe \u{2014} je li pogodio?';
const LEAD_HERS = 'Ona je poga\u{0111}ala tebe \u{2014} je li pogodila?';
const LEAD_GUESS_HIM = 'Pogodi ga';

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

/** All four language keys per profile — the same set tests/test-memories.js uses. */
function langSeed(me) {
  const other = me === 'barry' ? 'andjela' : 'barry';
  const seed = { 'ct-app-key': APP_KEY, 'cycle-lang': 'sr', 'cycle-lang-chosen': '1' };
  [me, other].forEach((p) => {
    seed['cycle-lang-' + p] = 'sr';
    seed['cycle-lang-chosen-' + p] = '1';
  });
  return seed;
}

async function scenario(browser, profile) {
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
  }, { profile: me, seed: langSeed(me) });

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
  await page.click('.tab[data-panel="together"]');
  await page.waitForTimeout(800);
  await page.waitForSelector('#knowMeContent', { state: 'attached', timeout: 15000 });
  return { page, ctx };
}

/**
 * Replace today's Know Me records and repaint.
 *
 * The date key is NOT hard-coded: a probe answer is written through the app's own
 * `saveKnowMeAnswer()` and the key read back off the record it created, so this
 * file cannot drift out of step with however `fmtDate(today())` is computed.
 * `records` values are stored verbatim, so a scenario can leave `fb` off to model
 * "not judged yet".
 */
async function seedKnowMe(page, records) {
  return page.evaluate((arg) => {
    let key = null;
    const ta = document.getElementById('knowMeInput');
    if (ta) {
      ta.value = 'PROBE-KEY-DISCOVERY';
      window.saveKnowMeAnswer();
      const wrote = JSON.parse(localStorage.getItem('shared-knowme') || '{}');
      const keys = Object.keys(wrote);
      key = keys.length ? keys[keys.length - 1] : null;
    }
    if (!key) {
      /* Already answered earlier in this scenario, so the textarea is not on the
         page. Fall back to the app's own date formatter when it is reachable. */
      const d = new Date();
      const p = (n) => (n < 10 ? '0' + n : '' + n);
      key = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
    }
    const fresh = {};
    Object.keys(arg.records).forEach((p) => { fresh[p] = arg.records[p]; });
    localStorage.setItem('shared-knowme', JSON.stringify({ [key]: fresh }));
    window.renderKnowMe();
    return key;
  }, { records });
}

const card = (page) => page.evaluate(() => {
  const host = document.getElementById('knowMeContent');
  if (!host) return null;
  const lead = host.querySelector('.km-lead');
  /* The lead IS the first div once it renders, so a plain `querySelector('div')`
     would return the lead itself and compareDocumentPosition against itself is 0.
     Pick the first div that is not the lead — that is the question line. */
  const q = [...host.querySelectorAll('div')].find((d) => !d.classList.contains('km-lead'));
  return {
    text: (host.innerText || host.textContent || '').replace(/\s+/g, ' ').trim(),
    leadExists: !!lead,
    leadText: lead ? (lead.textContent || '').replace(/\s+/g, ' ').trim() : null,
    /* The lead is a status about the card, so it has to precede the question. */
    leadIsFirst: !!lead && !!q && (lead.compareDocumentPosition(q) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
    fbButtons: host.querySelectorAll('.km-fb').length,
    hasInput: !!host.querySelector('#knowMeInput'),
  };
});

const T = 1700000000000;

(async () => {
  const srv = await serve();
  const browser = await chromium.launch();

  // ---- K1: she guessed me and I have not judged it ----
  {
    const s = await scenario(browser);
    await seedKnowMe(s.page, { barry: { answer: 'Kikinda', time: T } });
    const c = await card(s.page);
    check('K1 when he has guessed me and I have not judged it, the card says so first',
      c.leadExists && c.leadText === LEAD_HIS,
      `lead=${JSON.stringify(c.leadText)}`);
    check('K1b the status line comes before the question',
      c.leadIsFirst === true, `leadIsFirst=${c.leadIsFirst}`);
    check('K1c the one-tap verdict buttons are still there — the lead did not displace them',
      c.fbButtons === 2, `fbButtons=${c.fbButtons}`);
    await s.ctx.close();
  }

  // ---- K2: nothing recorded yet — the pull itself, not a homework form ----
  {
    const s = await scenario(browser);
    const c = await card(s.page);
    check('K2 with nothing recorded the card opens on the pull, not on the form',
      c.leadExists && c.leadText === LEAD_GUESS_HIM,
      `lead=${JSON.stringify(c.leadText)}`);
    check('K2b and the answer form is still what the pull leads to',
      c.hasInput === true, `hasInput=${c.hasInput}`);
    await s.ctx.close();
  }

  // ---- K3: I guessed, he has not — there is no news, so no line ----
  {
    const s = await scenario(browser);
    await seedKnowMe(s.page, { andjela: { answer: 'Novi Sad', time: T } });
    const c = await card(s.page);
    check('K3 with only my own guess in, no status line is invented',
      c.leadExists === false, `lead=${JSON.stringify(c.leadText)}`);
    await s.ctx.close();
  }

  // ---- K4: both sides settled — nothing left to say ----
  {
    const s = await scenario(browser);
    await seedKnowMe(s.page, {
      andjela: { answer: 'Novi Sad', time: T, fb: 'yes', fbTime: T },
      barry: { answer: 'Kikinda', time: T, fb: 'almost', fbTime: T },
    });
    const c = await card(s.page);
    check('K4 once both verdicts are in, the card goes quiet',
      c.leadExists === false, `lead=${JSON.stringify(c.leadText)}`);
    check('K4b and the recorded verdicts are still rendered',
      c.text.indexOf('\u{2764}') !== -1 || c.text.indexOf('\u{1F60C}') !== -1,
      `text="${c.text.slice(0, 90)}"`);
    await s.ctx.close();
  }

  // ---- K5: symmetry — the wording follows the partner, not the viewer ----
  {
    const s = await scenario(browser, 'barry');
    await seedKnowMe(s.page, { andjela: { answer: 'Kikinda', time: T } });
    const c = await card(s.page);
    check('K5 with Barry signed in and Anđela the author, the wording flips to hers',
      c.leadExists && c.leadText === LEAD_HERS,
      `lead=${JSON.stringify(c.leadText)}`);
    await s.ctx.close();
  }

  // ---- K6: nothing new stored, no direct GitHub call ----
  {
    const s = await scenario(browser);
    await seedKnowMe(s.page, { barry: { answer: 'Kikinda', time: T } });
    const keys = await s.page.evaluate(() => Object.keys(localStorage)
      .filter((k) => /unread|badge|seen|score|streak|points|km-lead/i.test(k)));
    check('K6 no score / streak / points / unread key is invented for this',
      keys.length === 0, JSON.stringify(keys));
    check('K6b nothing was fetched from GitHub directly (Browser -> Worker only)',
      githubCalls.length === 0, JSON.stringify(githubCalls.slice(0, 2)));
    await s.ctx.close();
  }

  // ---- K7: static guards ----
  {
    const love = fs.readFileSync(path.join(ROOT, 'js', 'render-love.js'), 'utf8');
    const css = fs.readFileSync(path.join(ROOT, 'css', 'v2.css'), 'utf8');
    check('K7 renderKnowMe actually calls the lead',
      /let c="";c\+=knowMeLead\(i,l\);c\+=/.test(love), 'call site present');
    check('K7b the lead reads the partner record and its verdict, not a constant',
      /function knowMeLead\(i,l\)\{/.test(love) && /l&&!l\.fb/.test(love) && /else if\(!i\)/.test(love),
      'three-state form present');
    check('K7c the lead is styled, so it cannot render as a bare block',
      /\.km-lead\s*\{/.test(css), '.km-lead rule present');
    check('K7d no score, level or streak vocabulary entered the card',
      !/\b(score|level|streak|points|rank)\b/i.test(love.slice(love.indexOf('function knowMeLead'), love.indexOf('function renderSong'))),
      'no scoring vocabulary in the Know Me block');
  }

  check('K8 no uncaught page error across every scenario',
    errors.length === 0, errors.slice(0, 3).join(' | ') || 'none');

  await browser.close();
  srv.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
