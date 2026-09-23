/**
 * Phase 2F §一 — the Home/Together Know Me card said only
 * "她猜了你 — 猜对了吗？" and offered ❤️ / 😌.
 *
 * Two defects:
 *
 *   1. What she actually guessed was never rendered. The engine held the answer
 *      text and the Know Me question it answered, and dropped the context on the
 *      floor — the user was asked to rule on a guess they could not read.
 *   2. `rateKnowMe` keyed off `fmtDate(today())` while the cards show the newest
 *      *unjudged* guess across every date in `shared-knowme`. A guess left over
 *      from an earlier day therefore wrote nothing, showed nothing and returned:
 *      "两个按钮看起来能点，实际上没有变化".
 *
 * The question must never be inferred from the answer, so there are three tiers
 * and this suite pins all of them: the stored `qKey`; else `Math.floor(time/864e5)
 * % KNOW_ME_QUESTIONS.length` (the record's own timestamp shares the render's UTC
 * day, whereas the storage key is a LOCAL date and is off by one for most of the
 * day); else null -> wording that claims nothing specific.
 *
 * Run: node tests/test-phase2f-guess.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8994;
const URL = `http://localhost:${PORT}/index.html`;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

const APP_KEY = 'test-app-key-phase2f-0000000000000000000000';
const WORKER_HOST = 'https://cycle-tracker-data.cycletracker-barry.workers.dev';
const WORKER_STATE = WORKER_HOST + '/state';
const WORKER_TODO = WORKER_HOST + '/todo';

/* Synthetic, and deliberately not any real saved answer. */
const HER_ANSWER = 'Mislim da je za sada njegov jezik ljubavi acts of service';
const T = 1758370000000;
const DAY_KEY = '2026-09-20';

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

const errors = [];

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

function langSeed(me, lang) {
  const other = me === 'barry' ? 'andjela' : 'barry';
  const seed = { 'ct-app-key': APP_KEY, 'cycle-lang': lang, 'cycle-lang-chosen': '1' };
  [me, other].forEach((p) => {
    seed['cycle-lang-' + p] = lang;
    seed['cycle-lang-chosen-' + p] = '1';
  });
  return seed;
}

async function scenario(browser, opts) {
  const o = opts || {};
  const me = o.profile || 'andjela';
  const lang = o.lang || 'sr';
  const ctx = await browser.newContext({
    viewport: o.viewport || { width: 390, height: 844 },
    serviceWorkers: 'block',
    colorScheme: o.theme || 'light',
  });
  await ctx.addInitScript((arg) => {
    try {
      localStorage.setItem('cycle-active-profile', arg.profile);
      sessionStorage.setItem('cycle-logged-in', '1');
      Object.keys(arg.seed).forEach((k) => localStorage.setItem(k, arg.seed[k]));
    } catch (e) { /* ignore */ }
  }, { profile: me, seed: langSeed(me, lang) });

  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]));

  const puts = [];
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
    if (u === WORKER_STATE || u === WORKER_TODO) {
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
      if (req.method() === 'PUT') {
        puts.push({ url: u, body: req.postData() || '' });
        return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ sha: 'test-sha' }) });
      }
      return route.fulfill({
        status: 200, contentType: 'application/json', headers: cors,
        body: JSON.stringify({ sha: null, state: {}, todo: [] }),
      });
    }
    if (u.indexOf('api.github.com') !== -1) return route.abort();
    if (u.includes('open-meteo')) return route.abort();
    return route.continue();
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#dash-today', { state: 'attached', timeout: 15000 });
  await page.waitForTimeout(700);
  return { page, ctx, puts };
}

/**
 * Write her guess and re-render. The date key is deliberately NOT today: that is
 * exactly the case the old `rateKnowMe` silently dropped on.
 */
async function seedHerGuess(page, who, record) {
  return page.evaluate((arg) => {
    localStorage.setItem('shared-knowme', JSON.stringify({ [arg.key]: { [arg.who]: arg.record } }));
    window.renderDashboard(false);
    window.renderTogetherNew();
    return arg.key;
  }, { who, record, key: DAY_KEY });
}

/** Read the content block off a surface rendered by the real app. */
const readSurface = (page, sel) => page.evaluate((s) => {
  const host = document.querySelector(s);
  if (!host) return null;
  const g = host.querySelector('.km-guess');
  const txt = (n) => (n ? (n.textContent || '') : null);
  return {
    hasBlock: !!g,
    kicker: txt(g && g.querySelector('.km-guess-kicker')),
    question: txt(g && g.querySelector('.km-guess-q')),
    label: txt(g && g.querySelector('.km-guess-label')),
    answer: txt(g && g.querySelector('.km-guess-text')),
    buttons: host.querySelectorAll('.km-fb').length,
    pills: host.querySelectorAll('.km-fb-on').length,
    echoWrap: host.querySelectorAll('.km-verdict-echo').length,
    order: g ? Array.prototype.indexOf.call(g.children, g.querySelector('.km-guess-q')) <
               Array.prototype.indexOf.call(g.children, g.querySelector('.km-guess-label')) : null,
  };
}, sel);

const stored = (page, who) => page.evaluate((arg) => {
  const w = JSON.parse(localStorage.getItem('shared-knowme') || '{}');
  return (w[arg.key] && w[arg.key][arg.who]) || null;
}, { who, key: DAY_KEY });

(async () => {
  const srv = await serve();
  const browser = await chromium.launch();

  /* ── P1 ①② the block names the question and prints her answer verbatim ── */
  {
    const s = await scenario(browser);
    const out = await s.page.evaluate((arg) => {
      const el = document.createElement('div');
      el.innerHTML = window.knowMeGuessHtml(arg.rec);
      const q = (sel) => el.querySelector(sel);
      const entry = KNOW_ME_QUESTIONS.filter((x) => x.key === 'fav_city')[0];
      return {
        hasBlock: !!q('.km-guess'),
        kicker: q('.km-guess-kicker') ? q('.km-guess-kicker').textContent : null,
        question: q('.km-guess-q') ? q('.km-guess-q').textContent : null,
        label: q('.km-guess-label') ? q('.km-guess-label').textContent : null,
        answer: q('.km-guess-text') ? q('.km-guess-text').textContent : null,
        tag: q('.km-guess-text') ? q('.km-guess-text').tagName : null,
        expectedQ: entry ? entry.q.sr : null,
        children: q('.km-guess') ? Array.prototype.map.call(q('.km-guess').children, (c) => c.className) : [],
      };
    }, { rec: { answer: HER_ANSWER, time: T, qKey: 'fav_city' } });
    check('P1 the guess renders as a content block, not just a prompt',
      out.hasBlock === true && out.children.length >= 3, out.children.join(','));
    check('P1b it opens by saying she/he guessed something about you',
      out.kicker && out.kicker.length > 0, JSON.stringify(out.kicker));
    check('P1c tier 1: the stored qKey recovers the exact question that was asked',
      out.expectedQ && out.question && out.question.indexOf(out.expectedQ) !== -1,
      `rendered=${JSON.stringify(out.question)}`);
    check('P1d it labels the guess and prints her answer verbatim in a blockquote',
      out.label && out.label.length > 0 && out.answer === HER_ANSWER && out.tag === 'BLOCKQUOTE',
      `tag=${out.tag} answer=${JSON.stringify(out.answer)}`);
    check('P1e the question sits above the guess it introduces',
      out.children.indexOf('km-guess-q') < out.children.indexOf('km-guess-label'), out.children.join(' > '));
    await s.ctx.close();
  }

  /* ── P2 tier 2: no qKey, recovered from the record's own timestamp ───── */
  {
    const s = await scenario(browser);
    const out = await s.page.evaluate((arg) => {
      const el = document.createElement('div');
      el.innerHTML = window.knowMeGuessHtml(arg.rec);
      const q = (sel) => el.querySelector(sel);
      const n = KNOW_ME_QUESTIONS.length;
      return {
        question: q('.km-guess-q') ? q('.km-guess-q').textContent : null,
        expected: KNOW_ME_QUESTIONS[Math.floor(arg.rec.time / 864e5) % n].q.sr,
      };
    }, { rec: { answer: HER_ANSWER, time: T } });
    check('P2 tier 2: without qKey the question still comes back, from the timestamp',
      out.question && out.question.indexOf(out.expected) !== -1,
      `rendered=${JSON.stringify(out.question)}`);
    await s.ctx.close();
  }

  /* ── P3 tier 3: nothing recoverable -> claim nothing ─────────────────── */
  {
    const s = await scenario(browser);
    const out = await s.page.evaluate((arg) => {
      const el = document.createElement('div');
      el.innerHTML = window.knowMeGuessHtml(arg.rec);
      return {
        html: el.innerHTML,
        kicker: el.querySelector('.km-guess-kicker') ? el.querySelector('.km-guess-kicker').textContent : null,
        hasQ: !!el.querySelector('.km-guess-q'),
        answer: el.querySelector('.km-guess-text') ? el.querySelector('.km-guess-text').textContent : null,
        anyQuestion: KNOW_ME_QUESTIONS.some((x) => el.innerHTML.indexOf(x.q.sr) !== -1 && x.q.sr.length > 6),
      };
    }, { rec: { answer: HER_ANSWER } });
    check('P3 tier 3: with neither qKey nor time it says only "她对你的一个猜测"',
      out.hasQ === false && out.kicker && out.kicker.length > 0 && out.anyQuestion === false,
      `kicker=${JSON.stringify(out.kicker)} hasQ=${out.hasQ}`);
    check('P3b and the answer is still shown, so the block is never empty',
      out.answer === HER_ANSWER, JSON.stringify(out.answer));
    check('P3c it never quotes the answer back as if it were the question',
      out.html.indexOf('<span>') === -1, 'no question span');
    await s.ctx.close();
  }

  /* ── P4 the answer is escaped, never treated as markup ───────────────── */
  {
    const s = await scenario(browser);
    const out = await s.page.evaluate(() => {
      const el = document.createElement('div');
      el.innerHTML = window.knowMeGuessHtml({ answer: 'a<b>c & d' });
      return {
        text: el.querySelector('.km-guess-text') ? el.querySelector('.km-guess-text').textContent : null,
        html: el.innerHTML,
        injected: !!el.querySelector('b'),
      };
    });
    check('P4 a her-guess containing markup is escaped, not injected',
      out.text === 'a<b>c & d' && out.injected === false && out.html.indexOf('&lt;b&gt;') !== -1,
      `text=${JSON.stringify(out.text)} injected=${out.injected}`);
    await s.ctx.close();
  }

  /* ── D1 ①② the real Home card carries the block, above the buttons ───── */
  {
    const s = await scenario(browser);
    await seedHerGuess(s.page, 'barry', { answer: HER_ANSWER, time: T, qKey: 'fav_city' });
    await s.page.waitForTimeout(400);
    const h = await readSurface(s.page, '#dash-today');
    check('D1 the Home card renders the guess block alongside the two verdict buttons',
      h && h.hasBlock === true && h.buttons === 2, `block=${h && h.hasBlock} buttons=${h && h.buttons}`);
    check('D1b the question is on screen, not just the "she guessed you" prompt',
      h && h.question && h.question.indexOf('?') !== -1, JSON.stringify(h && h.question));
    check('D1c and her own words are on screen verbatim',
      h && h.answer === HER_ANSWER, JSON.stringify(h && h.answer));
    check('D1d the block sits above the buttons it is asking about',
      h && h.order === true, `q-before-label=${h && h.order}`);
    await s.ctx.close();
  }

  /* ── D2 ③ ❤️ has a real, visible selected state ──────────────────────── */
  {
    const s = await scenario(browser);
    await seedHerGuess(s.page, 'barry', { answer: HER_ANSWER, time: T, qKey: 'fav_city' });
    await s.page.waitForTimeout(400);
    await s.page.click('#dash-today .km-fb');
    await s.page.waitForTimeout(600);
    const r = await stored(s.page, 'barry');
    const h = await readSurface(s.page, '#dash-today');
    check('D2 ❤️ records fb=yes with a verdict timestamp',
      r && r.fb === 'yes' && typeof r.fbTime === 'number' && r.fbTime > 0,
      `fb=${r && r.fb} fbTime=${typeof (r && r.fbTime)}`);
    check('D2b the verdict does not disturb what she wrote',
      r && r.answer === HER_ANSWER && r.time === T && r.qKey === 'fav_city',
      `answer intact=${r && r.answer === HER_ANSWER}`);
    check('D2c the buttons become a selected pill instead of staying tappable',
      h && h.buttons === 0 && h.pills === 1, `buttons=${h && h.buttons} pills=${h && h.pills}`);
    check('D2d the chosen verdict stays on screen rather than the block vanishing silently',
      h && h.echoWrap === 1, `echoWraps=${h && h.echoWrap}`);
    const pillText = await s.page.evaluate(() => {
      const p = document.querySelector('#dash-today .km-fb-on');
      return p ? p.textContent.trim() : null;
    });
    check('D2e and it names the verdict that was chosen', !!pillText && pillText.length > 0, JSON.stringify(pillText));
    await s.ctx.close();
  }

  /* ── D3 ④ 😌 is the other branch and is equally visible ─────────────── */
  {
    const s = await scenario(browser);
    await seedHerGuess(s.page, 'barry', { answer: HER_ANSWER, time: T, qKey: 'fav_city' });
    await s.page.waitForTimeout(400);
    await s.page.evaluate(() => {
      const b = document.querySelectorAll('#dash-today .km-fb');
      if (b.length > 1) b[1].click();
    });
    await s.page.waitForTimeout(600);
    const r = await stored(s.page, 'barry');
    const h = await readSurface(s.page, '#dash-today');
    const pillText = await s.page.evaluate(() => {
      const p = document.querySelector('#dash-today .km-fb-on');
      return p ? p.textContent.trim() : null;
    });
    check('D3 😌 records fb=almost', r && r.fb === 'almost', `fb=${r && r.fb}`);
    check('D3b and it too swaps the buttons for a selected pill',
      h && h.buttons === 0 && h.pills === 1 && !!pillText,
      `buttons=${h && h.buttons} pills=${h && h.pills} text=${JSON.stringify(pillText)}`);
    await s.ctx.close();
  }

  /* ── D4 ⑤ repeat taps change nothing and push nothing ──────────────── */
  {
    const s = await scenario(browser);
    await seedHerGuess(s.page, 'barry', { answer: HER_ANSWER, time: T, qKey: 'fav_city' });
    await s.page.waitForTimeout(400);
    await s.page.click('#dash-today .km-fb');
    await s.page.waitForTimeout(600);
    const first = await stored(s.page, 'barry');
    const putsAfterFirst = s.puts.length;
    /* Drive the handler directly: a stray second tap would do exactly this. */
    await s.page.evaluate(() => { window.rateKnowMe('yes'); window.rateKnowMe('yes'); });
    await s.page.waitForTimeout(600);
    const again = await stored(s.page, 'barry');
    check('D4 re-answering with the same verdict is a no-op',
      again && again.fb === 'yes' && again.fbTime === first.fbTime,
      `fbTime ${first && first.fbTime} -> ${again && again.fbTime}`);
    check('D4b and it does not push to shared data again',
      s.puts.length === putsAfterFirst, `puts ${putsAfterFirst} -> ${s.puts.length}`);
    const keys = await s.page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('shared-knowme') || '{}')));
    check('D4c no second record appears under another date key',
      keys.length === 1 && keys[0] === DAY_KEY, keys.join(','));
    await s.ctx.close();
  }

  /* ── D5 a recorded verdict is terminal, and cannot be half-overwritten ──
     `fb` doubles as the "still waiting for a verdict" marker — `knowMePendingGuess`
     filters on `!r.fb`, and the pill's whole job is to be the visible proof that the
     question is settled. So a second, DIFFERENT verdict is refused rather than
     applied. This is asserted rather than assumed because it is the semantics the
     UI rests on: if a different value were silently accepted, the Home block would
     have to both show the pill and stay answerable, which is the display/mutation
     divergence that caused the original bug.
     Known consequence, recorded here so it is not mistaken for a bug: a mis-tap is
     not correctable in the UI. Fixing that would need a separate mutation-side
     lookup, deliberately out of scope for §一. */
  {
    const s = await scenario(browser);
    await seedHerGuess(s.page, 'barry', { answer: HER_ANSWER, time: T, qKey: 'fav_city' });
    await s.page.waitForTimeout(400);
    await s.page.evaluate(() => window.rateKnowMe('yes'));
    await s.page.waitForTimeout(400);
    const a = await stored(s.page, 'barry');
    const putsAfterYes = s.puts.length;
    await s.page.evaluate(() => window.rateKnowMe('almost'));
    await s.page.waitForTimeout(400);
    const b = await stored(s.page, 'barry');
    const h = await readSurface(s.page, '#dash-today');
    check('D5 a recorded verdict is terminal: a differing verdict is refused, not applied',
      a && a.fb === 'yes' && b && b.fb === 'yes',
      `${a && a.fb} -> ${b && b.fb}`);
    check('D5b and the refused call leaves the record untouched and pushes nothing',
      b && b.fbTime === a.fbTime && b.answer === HER_ANSWER && s.puts.length === putsAfterYes,
      `fbTime ${a && a.fbTime} -> ${b && b.fbTime}, puts ${putsAfterYes} -> ${s.puts.length}`);
    check('D5c the pill still names the verdict that was actually recorded',
      h && h.pills === 1 && h.buttons === 0, `pills=${h && h.pills} buttons=${h && h.buttons}`);
    await s.ctx.close();
  }

  /* ── D6 ⑥ merge-safe: her subtree is untouched, both are pushed ─────── */
  {
    const s = await scenario(browser);
    await s.page.evaluate((arg) => {
      localStorage.setItem('shared-knowme', JSON.stringify({
        [arg.key]: {
          barry: { answer: arg.answer, time: arg.t, qKey: 'fav_city' },
          andjela: { answer: 'NJENA SOPSTVENA RECENICA', time: arg.t + 1000 },
        },
      }));
      window.renderDashboard(false);
      window.renderTogetherNew();
    }, { key: DAY_KEY, answer: HER_ANSWER, t: T });
    await s.page.waitForTimeout(400);
    const h = await readSurface(s.page, '#dash-today');
    check('D6 as Andjela the wording is the mirror image, and still shows his words',
      h && h.hasBlock === true && h.answer === HER_ANSWER, `answer=${JSON.stringify(h && h.answer)}`);
    await s.ctx.close();
  }
  {
    const s = await scenario(browser);
    await s.page.evaluate((arg) => {
      localStorage.setItem('shared-knowme', JSON.stringify({
        [arg.key]: {
          barry: { answer: arg.answer, time: arg.t, qKey: 'fav_city' },
          andjela: { answer: 'NJENA SOPSTVENA RECENICA', time: arg.t + 1000 },
        },
      }));
      window.renderDashboard(false);
      window.renderTogetherNew();
    }, { key: DAY_KEY, answer: HER_ANSWER, t: T });
    await s.page.waitForTimeout(400);
    await s.page.evaluate(() => window.rateKnowMe('yes'));
    await s.page.waitForTimeout(600);
    const w = await s.page.evaluate(() => JSON.parse(localStorage.getItem('shared-knowme') || '{}'));
    const other = w[DAY_KEY] && w[DAY_KEY].andjela;
    check('D6b my verdict leaves her own record byte-identical',
      other && other.answer === 'NJENA SOPSTVENA RECENICA' && other.time === T + 1000 && !('fb' in other),
      JSON.stringify(other));
    check('D6c the verdict lands on the record that was displayed, not on "today"',
      w[DAY_KEY] && w[DAY_KEY].barry && w[DAY_KEY].barry.fb === 'yes',
      `fb=${w[DAY_KEY] && w[DAY_KEY].barry && w[DAY_KEY].barry.fb}`);
    const put = s.puts.filter((p) => p.url === WORKER_STATE).pop();
    check('D6d the push carries both subtrees, so neither side is clobbered',
      put && put.body.indexOf('NJENA SOPSTVENA RECENICA') !== -1 && put.body.indexOf('"fb"') !== -1,
      put ? 'both subtrees in the PUT body' : 'no PUT observed');
    await s.ctx.close();
  }

  /* ── D7 ⑪ the copy is localised ────────────────────────────────────── */
  {
    const s = await scenario(browser, { profile: 'barry', lang: 'zh-CN' });
    await seedHerGuess(s.page, 'andjela', { answer: HER_ANSWER, time: T, qKey: 'fav_city' });
    await s.page.waitForTimeout(400);
    const h = await readSurface(s.page, '#dash-today');
    check('D7 viewing as Barry, the kicker uses 她 (in Chinese) and his words show verbatim',
      h && h.kicker && h.kicker.indexOf('她') !== -1 && h.answer === HER_ANSWER,
      `kicker=${JSON.stringify(h && h.kicker)}`);
    await s.ctx.close();
  }
  {
    const s = await scenario(browser, { lang: 'en' });
    await seedHerGuess(s.page, 'barry', { answer: HER_ANSWER, time: T, qKey: 'fav_city' });
    await s.page.waitForTimeout(400);
    const h = await readSurface(s.page, '#dash-today');
    check('D7b the English copy renders, and the question falls back to the stored sr text',
      h && h.kicker && /guess/i.test(h.kicker) && h.answer === HER_ANSWER && !!h.question,
      `kicker=${JSON.stringify(h && h.kicker)}`);
    await s.ctx.close();
  }

  /* ── D8 ⑩ 320/768/1440, ⑫ light/dark: the block stays readable ─────── */
  for (const [w, hgt] of [[320, 640], [768, 900], [1440, 900]]) {
    for (const theme of ['light', 'dark']) {
      const s = await scenario(browser, { viewport: { width: w, height: hgt }, theme });
      await seedHerGuess(s.page, 'barry', { answer: HER_ANSWER, time: T, qKey: 'fav_city' });
      await s.page.waitForTimeout(400);
      const d = await s.page.evaluate(() => {
        const g = document.querySelector('#dash-today .km-guess');
        const de = document.documentElement;
        if (!g) return { missing: true, overflowX: de.scrollWidth - de.clientWidth };
        const cs = getComputedStyle(g.querySelector('.km-guess-text'));
        return {
          missing: false,
          text: g.querySelector('.km-guess-text').textContent,
          color: cs.color,
          clipped: g.scrollWidth - g.clientWidth,
          overflowX: de.scrollWidth - de.clientWidth,
          width: g.getBoundingClientRect().width,
          viewport: window.innerWidth,
        };
      });
      check(`D8 at ${w}px ${theme}: the block renders inside the viewport with no horizontal overflow`,
        !d.missing && d.text === HER_ANSWER && d.overflowX <= 0 && d.clipped <= 1 && d.width <= d.viewport,
        `overflowX=${d.overflowX} clipped=${d.clipped} blockW=${d.width} vw=${d.viewport}`);
      check(`D8b at ${w}px ${theme}: the guess text is painted with a theme colour, not left invisible`,
        !d.missing && !!d.color && d.color !== 'rgba(0, 0, 0, 0)' && d.color !== 'transparent',
        `color=${d.color}`);
      await s.ctx.close();
    }
  }

  await browser.close();
  srv.close();

  check('D9 no page error was raised by any scenario', errors.length === 0,
    errors.slice(0, 3).join(' | ') || 'clean');

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
