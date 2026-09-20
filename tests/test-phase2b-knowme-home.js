/**
 * Phase 2B.4 — her Know Me guess must be answerable from Home, not only from
 * card 6 of 12 inside Together.
 *
 * 2B.1 connected "she left me something -> I can act on it right now" for
 * gratitude notes: `_replyTarget` finds the note and `_replyAffordanceHtml`
 * hangs the echo buttons under it. That path only ever looked at
 * `shared-gratitude`.
 *
 * §七's Home requirement ("要尽可能让：「她给我留了东西 → 我可以马上回应」成为
 * 第一层体验") therefore held only for one of the two one-tap surfaces. Know Me's
 * verdict (Tačno / Skoro) is the same kind of one-tap reply — she guessed me,
 * only I can rule on it — but its buttons existed only on the Know Me card,
 * measured at card 6 of 12 in Together (top≈1333px against vh=844 on a phone).
 * "Barry knows at first glance" already held (_collectTodayEvents has always
 * listed her guess on Home); "Barry can answer in one tap" did not.
 *
 * The fix deliberately does NOT touch `_replyTarget`: tests/test-phase2b-reply.js
 * R8 pins its two-branch structure, and its in-row matching relies on the
 * gratitude emoji + time while Know Me and Daily Question share the same emoji
 * and the 'knowme' label inside `_collectTodayEvents`, so emoji-matching a Know
 * Me row would be ambiguous.
 *
 * Run: node tests/test-phase2b-knowme-home.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8970;
const URL = `http://localhost:${PORT}/index.html`;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

const APP_KEY = 'test-app-key-phase2b4-0000000000000000000000';
const WORKER_HOST = 'https://cycle-tracker-data.cycletracker-barry.workers.dev';
const WORKER_STATE = WORKER_HOST + '/state';
const WORKER_TODO = WORKER_HOST + '/todo';

const githubCalls = [];

/* Partner-gendered: viewer andjela => partner is barry => the "he" wording. */
const LEAD_HIS = 'On je poga\u{0111}ao tebe \u{2014} je li pogodio?';
const LEAD_HERS = 'Ona je poga\u{0111}ala tebe \u{2014} je li pogodila?';

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

const errors = [];

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
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
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
  await page.waitForSelector('#dash-today', { state: 'attached', timeout: 15000 });
  await page.waitForTimeout(700);
  return { page, ctx };
}

/**
 * Write her guess. The date key comes from the app's own save path where it can
 * be reached; `_newestUnjudgedGuess` iterates every date in the object, so the
 * value of the key is not load-bearing here — only that the record carries a
 * finite `time` and no `fb`.
 */
async function seedHerGuess(page, record) {
  return page.evaluate((rec) => {
    let key = null;
    const ta = document.getElementById('knowMeInput');
    if (ta) {
      ta.value = 'PROBE-KEY-DISCOVERY';
      window.saveKnowMeAnswer();
      const w = JSON.parse(localStorage.getItem('shared-knowme') || '{}');
      key = Object.keys(w).pop();
    }
    if (!key) {
      const d = new Date();
      const p = (n) => (n < 10 ? '0' + n : '' + n);
      key = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
    }
    localStorage.setItem('shared-knowme', JSON.stringify({ [key]: { barry: rec } }));
    window.renderDashboard(false);
    window.renderTogetherNew();
    return key;
  }, record);
}

/** Read the affordance off one surface. */
const readSurface = (page, sel) => page.evaluate((s) => {
  const host = document.querySelector(s);
  if (!host) return null;
  const react = host.querySelector('.tnew-react-km');
  const lead = host.querySelector('.km-lead');
  return {
    hidden: host.hidden === true,
    reactBlocks: host.querySelectorAll('.tnew-react-km').length,
    buttons: host.querySelectorAll('.tnew-react-km .km-fb').length,
    echobuttons: host.querySelectorAll('.tnew-react .grat-echo-btn').length,
    leadText: lead ? (lead.textContent || '').trim() : null,
    /* the .km-lead has to sit above the buttons it introduces */
    leadAboveButtons: !!lead && !!react &&
      (lead.compareDocumentPosition(react) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
    text: (host.innerText || '').replace(/\s+/g, ' ').trim(),
  };
}, sel);

const T = 1758370000000;

(async () => {
  const srv = await serve();
  const browser = await chromium.launch();

  // ---- H1: her unjudged guess is answerable from Home ----
  {
    const s = await scenario(browser);
    await seedHerGuess(s.page, { answer: 'Kikinda', time: T });
    await s.page.waitForTimeout(300);
    const h = await readSurface(s.page, '#dash-today');
    check('H1 her unjudged guess puts a one-tap verdict on Home',
      h && h.reactBlocks === 1 && h.buttons === 2, `blocks=${h && h.reactBlocks} buttons=${h && h.buttons}`);
    check('H1b and it says whose guess it is, above the buttons',
      h && h.leadText === LEAD_HIS && h.leadAboveButtons === true,
      `lead=${JSON.stringify(h && h.leadText)} above=${h && h.leadAboveButtons}`);
    await s.ctx.close();
  }

  // ---- H2: the tap actually records the verdict, and Home clears ----
  {
    const s = await scenario(browser);
    await seedHerGuess(s.page, { answer: 'Kikinda', time: T });
    await s.page.waitForTimeout(300);
    await s.page.click('#dash-today .tnew-react-km .km-fb', { timeout: 5000 }).catch(() => {});
    await s.page.waitForTimeout(600);
    const after = await s.page.evaluate(() => {
      const km = JSON.parse(localStorage.getItem('shared-knowme') || '{}');
      const day = km[Object.keys(km)[0]] || {};
      const host = document.getElementById('dash-today');
      return {
        fb: day.barry ? day.barry.fb : null,
        fbTime: day.barry ? typeof day.barry.fbTime : null,
        answerUntouched: day.barry ? day.barry.answer : null,
        stillThere: host.querySelectorAll('.tnew-react-km').length,
      };
    });
    check('H2 the verdict lands on HER record, and only fb/fbTime change',
      after.fb === 'yes' && after.fbTime === 'number' && after.answerUntouched === 'Kikinda',
      `fb=${after.fb} fbTime=${after.fbTime} answer=${after.answerUntouched}`);
    check('H2b and the affordance disappears from Home — cleared by the action, not by time',
      after.stillThere === 0, `blocks=${after.stillThere}`);
    await s.ctx.close();
  }

  // ---- H3: an already-judged guess is not offered again ----
  {
    const s = await scenario(browser);
    await seedHerGuess(s.page, { answer: 'Kikinda', time: T, fb: 'almost', fbTime: T });
    await s.page.waitForTimeout(300);
    const h = await readSurface(s.page, '#dash-today');
    check('H3 once I have ruled on it, Home stops offering it',
      h && h.reactBlocks === 0, `blocks=${h && h.reactBlocks}`);
    await s.ctx.close();
  }

  // ---- H4: nothing guessed — no affordance, and Home still renders ----
  {
    const s = await scenario(browser);
    const h = await readSurface(s.page, '#dash-today');
    check('H4 with no guess from her, no verdict row is invented',
      h && h.reactBlocks === 0, `blocks=${h && h.reactBlocks}`);
    check('H4b and Home still renders its own empty state',
      h && h.text.length > 0, `text="${h && h.text.slice(0, 60)}"`);
    await s.ctx.close();
  }

  // ---- H5: the same affordance on Together — symmetry is structural ----
  //
  // `#together-new` is created by the Together panel's builder, which the app
  // runs on tab activation — until then the element does not exist and
  // `_renderTogetherNew` returns early. So the tab has to be opened before this
  // can say anything about Together at all.
  {
    const s = await scenario(browser);
    await s.page.click('.tab[data-panel="together"]');
    await s.page.waitForSelector('#together-new', { state: 'attached', timeout: 15000 });
    await seedHerGuess(s.page, { answer: 'Kikinda', time: T });
    await s.page.waitForTimeout(300);
    const t = await readSurface(s.page, '#together-new');
    check('H5 Together offers the same verdict via the same helper',
      t && t.reactBlocks === 1 && t.buttons === 2 && t.leadText === LEAD_HIS,
      `blocks=${t && t.reactBlocks} buttons=${t && t.buttons} lead=${JSON.stringify(t && t.leadText)}`);
    await s.ctx.close();
  }

  // ---- H6: symmetry — wording follows the partner, not the viewer ----
  {
    const s = await scenario(browser, 'barry');
    await s.page.evaluate(() => {
      const d = new Date();
      const p = (n) => (n < 10 ? '0' + n : '' + n);
      const key = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
      localStorage.setItem('shared-knowme', JSON.stringify({ [key]: { andjela: { answer: 'Novi Sad', time: 1758370000000 } } }));
      window.renderDashboard(false);
      window.renderTogetherNew();
    });
    await s.page.waitForTimeout(400);
    const h = await readSurface(s.page, '#dash-today');
    check('H6 with Barry signed in and Anđela the author, the wording flips to hers',
      h && h.leadText === LEAD_HERS, `lead=${JSON.stringify(h && h.leadText)}`);
    await s.ctx.close();
  }

  // ---- H7: no new state, no direct GitHub call ----
  {
    const s = await scenario(browser);
    await seedHerGuess(s.page, { answer: 'Kikinda', time: T });
    await s.page.waitForTimeout(300);
    const keys = await s.page.evaluate(() => Object.keys(localStorage)
      .filter((k) => /unread|badge|seen|score|streak|points|km-affordance/i.test(k)));
    check('H7 no unread / badge / score key is invented for this', keys.length === 0, JSON.stringify(keys));
    check('H7b nothing was fetched from GitHub directly (Browser -> Worker only)',
      githubCalls.length === 0, JSON.stringify(githubCalls.slice(0, 2)));
    await s.ctx.close();
  }

  // ---- H8: static guards ----
  {
    const dash = fs.readFileSync(path.join(ROOT, 'js', 'module-dashboard.js'), 'utf8');
    const love = fs.readFileSync(path.join(ROOT, 'js', 'render-love.js'), 'utf8');
    /* Count the ASSIGNMENT form, not every mention of the name: the definition
       line `function _knowMeAffordanceHtml(ctx) {` matches a bare name pattern
       too, and counting it would let a path that stopped calling the helper
       still pass on the strength of its own definition. */
    const wired = (dash.match(/var kmHtml = _knowMeAffordanceHtml\(ctx\);/g) || []).length;
    check('H8 Home and Together both route through the one helper',
      wired === 2, `wired call sites=${wired}`);
    check('H8b it reuses the existing renderers rather than reimplementing them',
      /_newestUnjudgedGuess\(/.test(dash) && /knowMeFb\(t\.note\)/.test(dash) &&
      /knowMeLead\(null,\s*t\.note\)/.test(dash),
      'reuses knowMeFb + knowMeLead');
    /* The gratitude path must be untouched: its row matching is emoji-based and
       its two-branch structure is pinned by test-phase2b-reply.js R8. */
    const body = (dash.match(/function _replyTarget\([\s\S]{0,1400}?\n  \}/) || [''])[0];
    check('H8c _replyTarget is untouched and keeps its pinned two-branch form',
      /_iEchoed\(/.test(body) && /unanswered/i.test(body) && !/knowme/i.test(body),
      `len=${body.length}`);
    check('H8d judging repaints every surface, so a Home tap cannot leave a stale row',
      /_refreshEchoSurfaces\(\)/.test(love.slice(love.indexOf('function rateKnowMe'))) &&
      /renderKnowMe/.test(love.slice(love.indexOf('function _refreshEchoSurfaces'), love.indexOf('function reactGratitude'))),
      'rateKnowMe -> _refreshEchoSurfaces -> renderKnowMe');
    check('H8e no scoring vocabulary entered the Home affordance',
      !/\b(score|level|streak|rank)\b/i.test(dash.slice(dash.indexOf('_newestUnjudgedGuess'), dash.indexOf('function _renderTogetherNew'))),
      'no scoring vocabulary');
  }

  check('H9 no uncaught page error across every scenario',
    errors.length === 0, errors.slice(0, 3).join(' | ') || 'none');

  await browser.close();
  srv.close();
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
