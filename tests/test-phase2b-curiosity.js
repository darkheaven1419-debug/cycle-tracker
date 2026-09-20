/**
 * Phase 2B.2 — the Daily Question on Home must read as curiosity, not as a chore.
 *
 * §七 rules out the framing outright: "Daily Question 不是「今天必须完成任务」，
 * 应该是：「我想知道她怎么答」". On Together, Phase 2A §1 already put a status lead
 * above the question (qLeadHas* / qLeadLook*). Home — the landing panel, the one the
 * §七 loop is supposed to live on — did not get it: its card was pinned to a single
 * static CTA ("Odgovori →", _updateV2Labels at module-dashboard.js:531) no matter
 * what state the exchange was in. So the one moment that actually creates the pull
 * — she has answered, I have not, and her answer is one tap away — looked exactly
 * like the moment where nobody has said anything.
 *
 * This suite pins the state-dependent Home card, and pins that nothing else moved:
 * the question itself still comes from getDailyQuestion(), no new key is stored,
 * and the states where there is genuinely nothing to be curious about keep the
 * plain "answer" CTA rather than inventing a nudge.
 *
 * Run: node tests/test-phase2b-curiosity.js
 *
 * The qKey is NOT hard-coded: `_dqCurrent` derives it from the day and from
 * DAILY_QS.sr.length, neither of which this file should have to mirror. Instead
 * each scenario asks the app to write a probe answer and reads the key back, so
 * the seed cannot drift out of step with the question rotation.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8964;
const URL = `http://localhost:${PORT}/index.html`;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

const APP_KEY = 'test-app-key-phase2b-curiosity-000000000000000';
const WORKER_HOST = 'https://cycle-tracker-data.cycletracker-barry.workers.dev';
const WORKER_STATE = WORKER_HOST + '/state';
const WORKER_TODO = WORKER_HOST + '/todo';

const HERS = 'NJEN ODGOVOR';
const MINE = 'MOJ ODGOVOR';

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

/**
 * Language is PER PROFILE, so every scenario pins all four keys that app.js
 * consults (app.js:477 reads the unprefixed 'cycle-lang'; app.js:443 auto-selects
 * when the unprefixed 'cycle-lang-chosen' is absent). Without all four the
 * wording assertions would compare whichever language the auto-select happened to
 * land on, and would pass or fail for the wrong reason.
 */
function langSeed(me) {
  const other = me === 'barry' ? 'andjela' : 'barry';
  const seed = { 'ct-app-key': APP_KEY, 'cycle-lang': 'sr', 'cycle-lang-chosen': '1' };
  [me, other].forEach((p) => {
    seed['cycle-lang-' + p] = 'sr';
    seed['cycle-lang-chosen-' + p] = '1';
  });
  return seed;
}

async function scenario(browser, extra, profile) {
  const me = profile || 'andjela';
  const seed = Object.assign(langSeed(me), extra || {});
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
  await page.waitForSelector('#dash-connect', { state: 'attached', timeout: 15000 });
  await page.waitForTimeout(400);
  return { page, ctx, remote, me };
}

/**
 * Put exactly the requested answers into `shared-daily-q` for TODAY's question,
 * then repaint Home.
 *
 * The qKey is discovered by writing a probe answer through the app's own
 * `answerDailyQ` and reading back the record it created — so this file never has
 * to know how `_dqCurrent` derives the key, and the seed cannot silently stop
 * matching after the question rotation changes.
 */
async function seedAnswers(page, answers) {
  return page.evaluate((arg) => {
    window.answerDailyQ('PROBE-KEY-DISCOVERY');
    const list = JSON.parse(localStorage.getItem('shared-daily-q') || '[]');
    const probe = list[list.length - 1];
    if (!probe) throw new Error('answerDailyQ wrote nothing');
    const qKey = probe.qKey;
    const fresh = [];
    Object.keys(arg.answers).forEach((from) => {
      fresh.push({ qKey: qKey, from: from, answer: arg.answers[from], time: Date.now() - 60000 });
    });
    localStorage.setItem('shared-daily-q', JSON.stringify(fresh));
    window.renderDashboard();
    return qKey;
  }, { answers });
}

/** The Home card exactly as a person meets it. */
const card = (page) => page.evaluate(() => {
  const el = document.getElementById('dash-connect');
  if (!el) return null;
  const lead = document.getElementById('dash-q-lead');
  const cta = document.getElementById('dash-q-cta');
  const q = document.getElementById('dailyConnectQ');
  const style = lead ? getComputedStyle(lead) : null;
  return {
    text: (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim(),
    leadExists: !!lead,
    leadText: lead ? (lead.textContent || '').replace(/\s+/g, ' ').trim() : null,
    leadVisible: !!lead && lead.hidden !== true && !!style && style.display !== 'none',
    /* DOM order matters: the lead is a status about the question, so it has to sit
       above the question, not below the CTA. */
    leadBeforeQuestion: !!(lead && q) &&
      (lead.compareDocumentPosition(q) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
    cta: cta ? (cta.textContent || '').trim() : null,
    question: q ? (q.textContent || '').trim() : null,
    /* The CTA must stay a navigation button, not become a new inline action. */
    ctaOnclick: cta ? cta.getAttribute('onclick') : null,
  };
});

(async () => {
  const srv = await serve();
  const browser = await chromium.launch();

  // ---- C1: he answered, I have not — the state §七 is actually about ----
  // Viewer is Anđela, author is Barry, so the lead describes HIM and the suffix is
  // the M one — the same rule _renderDailyQ uses (module-dashboard.js:696, keyed
  // off ctx.partner, not off the viewer).
  {
    const s = await scenario(browser, {});
    await seedAnswers(s.page, { barry: HERS });
    const c = await card(s.page);
    check('C1 when he has answered and I have not, Home says so',
      c.leadExists && c.leadVisible && c.leadText === 'Ve\u{0107} je odgovorio',
      `leadVisible=${c.leadVisible} lead=${JSON.stringify(c.leadText)}`);
    check('C1b and the button points at his answer instead of at a task',
      c.cta === 'Pogledaj njegov odgovor \u{2192}',
      `cta=${JSON.stringify(c.cta)}`);
    check('C1c the old task framing is not what I see in that state',
      c.cta !== 'Odgovori \u{2192}',
      `cta=${JSON.stringify(c.cta)}`);
    check('C1d the status line sits above the question, not under the button',
      c.leadBeforeQuestion === true, `leadBeforeQuestion=${c.leadBeforeQuestion}`);
    check('C1e and it is still a button that navigates, not an inline answer box',
      c.ctaOnclick === "switchToTab('together')", `onclick=${JSON.stringify(c.ctaOnclick)}`);
    await s.ctx.close();
  }

  // ---- C2: nobody has answered — there is nothing to be curious about ----
  {
    const s = await scenario(browser, {});
    const c = await card(s.page);
    check('C2 with no answer on either side, no status line is invented',
      c.leadExists && !c.leadVisible && !c.leadText,
      `leadVisible=${c.leadVisible} lead=${JSON.stringify(c.leadText)}`);
    check('C2b and the plain answer button stays, because answering IS the action',
      c.cta === 'Odgovori \u{2192}', `cta=${JSON.stringify(c.cta)}`);
    await s.ctx.close();
  }

  // ---- C3: both answered — her answer is still the thing I want ----
  {
    const s = await scenario(browser, {});
    await seedAnswers(s.page, { andjela: MINE, barry: HERS });
    const c = await card(s.page);
    check('C3 once we have both answered, Home still offers his answer',
      c.cta === 'Pogledaj njegov odgovor \u{2192}', `cta=${JSON.stringify(c.cta)}`);
    check('C3b but the redundant status line is gone — there is no suspense left',
      c.leadExists && !c.leadVisible,
      `leadVisible=${c.leadVisible} lead=${JSON.stringify(c.leadText)}`);
    check('C3c neither answer is printed on the Home card',
      c.text.indexOf(HERS) === -1 && c.text.indexOf(MINE) === -1,
      `text="${c.text.slice(0, 80)}"`);
    await s.ctx.close();
  }

  // ---- C4: I answered, she has not — nothing of hers to look at ----
  {
    const s = await scenario(browser, {});
    await seedAnswers(s.page, { andjela: MINE });
    const c = await card(s.page);
    check('C4 with only my own answer in, the button does not promise hers',
      c.cta === 'Sa\u{010D}uvaj izmenu', `cta=${JSON.stringify(c.cta)}`);
    check('C4b and no status line is shown, because there is no news',
      c.leadExists && !c.leadVisible, `leadVisible=${c.leadVisible}`);
    await s.ctx.close();
  }

  // ---- C5: symmetry — Barry is not the only viewer. This is §七's own direction:
  // viewer Barry, author Anđela, so the F forms are the ones that must appear. ----
  {
    const s = await scenario(browser, {}, 'barry');
    await seedAnswers(s.page, { andjela: HERS });
    const c = await card(s.page);
    check('C5 with Barry signed in and Anđela the author, the wording flips to hers',
      c.leadVisible && c.leadText === 'Ve\u{0107} je odgovorila' &&
      c.cta === 'Pogledaj njen odgovor \u{2192}',
      `lead=${JSON.stringify(c.leadText)} cta=${JSON.stringify(c.cta)}`);
    await s.ctx.close();
  }

  // ---- C6: the question itself is untouched ----
  {
    const s = await scenario(browser, {});
    await seedAnswers(s.page, { barry: HERS });
    const c = await card(s.page);
    const expected = await s.page.evaluate(() => window.getDailyQuestion
      ? window.getDailyQuestion() : null);
    check('C6 the card still shows the question of the day, unchanged',
      !!c.question && c.question.length > 0 && (expected === null || c.question === expected),
      `question="${c.question}"`);
    await s.ctx.close();
  }

  // ---- C7: nothing new is stored, and no direct GitHub call ----
  {
    const s = await scenario(browser, {});
    await seedAnswers(s.page, { barry: HERS });
    const keys = await s.page.evaluate(() => Object.keys(localStorage)
      .filter((k) => /unread|badge|seen|unanswered|pending|nudge|remind|curio/i.test(k)));
    check('C7 no unread / badge / seen / nudge key is invented for this',
      keys.length === 0, JSON.stringify(keys));
    check('C7b nothing was fetched from GitHub directly (Browser -> Worker only)',
      githubCalls.length === 0, JSON.stringify(githubCalls.slice(0, 2)));
    await s.ctx.close();
  }

  // ---- C8: static guards so the two states cannot silently collapse again ----
  {
    const src = fs.readFileSync(path.join(ROOT, 'js', 'module-dashboard.js'), 'utf8');
    const body = (src.match(/function _updateConnectCard\([\s\S]{0,2000}?\n  \}/) || [''])[0];
    check('C8 _updateConnectCard reads the exchange state rather than a constant',
      /_dqEntries\(/.test(body) && /_dqCurrent\(/.test(body),
      body ? body.slice(0, 120).replace(/\s+/g, ' ') : 'not found');
    check('C8b the CTA is no longer assigned once, unconditionally, at label time',
      !/set\('dash-q-cta',\s*v2\('qAnswer'\)\)/.test(src),
      'the static assignment is gone');
    check('C8c the lead element exists in the Home skeleton',
      /id="dash-q-lead"/.test(src), 'skeleton carries #dash-q-lead');
  }

  check('C9 no uncaught page error across every scenario',
    errors.length === 0, errors.slice(0, 3).join(' | ') || 'none');

  await browser.close();
  srv.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
