/**
 * Phase 4 test — the minimal Echo UI: an emoji reaction row under each gratitude note.
 *
 * Covers one-tap write + propagate, idempotent re-tap, switching emoji, showing the
 * partner's reactions, showing which one is mine, legacy notes, rejection of emoji
 * outside the allowed set, and the pull path refreshing without a reload.
 *
 * Run: node tests/test-echo.js
 *
 * Service workers are blocked for determinism; the gratitude card lives in
 * #panel-stats, so every scenario opens that tab before touching the buttons.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8933;
const URL = `http://localhost:${PORT}/index.html`;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

const T1 = 1700000000000; // barry's note, seeded first → rendered second (slice(-5).reverse())
const T2 = 1700000001000; // andjela's note

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

async function scenario(browser, seed) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true, isMobile: true, deviceScaleFactor: 3,
    serviceWorkers: 'block',
  });
  await ctx.addInitScript((s) => {
    try {
      localStorage.setItem('cycle-active-profile', 'andjela');
      sessionStorage.setItem('cycle-logged-in', '1');
      Object.keys(s).forEach((k) => localStorage.setItem(k, typeof s[k] === 'string' ? s[k] : JSON.stringify(s[k])));
    } catch (e) { /* ignore */ }
  }, seed);

  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]));

  const remote = { state: null };
  await page.route('**/*', (route) => {
    const u = route.request().url();
    if (u.includes('/contents/shared-state.json') && remote.state) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sha: 'test-sha',
          content: Buffer.from(JSON.stringify(remote.state), 'utf8').toString('base64'),
        }),
      });
    }
    if (u.includes('api.github.com') || u.includes('open-meteo')) return route.abort();
    return route.continue();
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.tab[data-panel="stats"]', { timeout: 15000 });
  await page.click('.tab[data-panel="stats"]');
  await page.waitForTimeout(500);
  // The stats tab handler only calls renderStatsPanel(); the gratitude wall is
  // filled by renderAll()/the pull path (sync.js calls renderGratitude() after a
  // pull, which the aborted api.github.com route here prevents). Verified against
  // HEAD: the wall is equally empty at boot before this change, so the render is
  // driven explicitly. E9 still exercises the real pull → render path.
  await page.evaluate(() => { if (typeof window.renderGratitude === 'function') window.renderGratitude(); });
  await page.waitForTimeout(100);
  return { page, ctx, remote };
}

const echoList = (page) => page.evaluate(() => {
  try { return JSON.parse(localStorage.getItem('shared-gratitude-echo') || '[]'); } catch (e) { return null; }
});

/** Per-block snapshot: the note row, and each emoji button's label / mine flag / count. */
const rows = (page) => page.evaluate(() => Array.from(document.querySelectorAll('#gratList .grat-block')).map((b) => ({
  text: b.querySelector('.gratitude-item') ? b.querySelector('.gratitude-item').innerText.replace(/\s+/g, ' ').trim() : null,
  heart: b.querySelector('.gratitude-heart') ? b.querySelector('.gratitude-heart').textContent : null,
  translate: !!b.querySelector('.gratitude-item button'),
  echo: Array.from(b.querySelectorAll('.grat-echo-btn')).map((x) => ({
    emoji: x.childNodes[0].textContent,
    mine: x.classList.contains('mine'),
    count: x.querySelector('.grat-echo-n') ? x.querySelector('.grat-echo-n').textContent : '0',
  })),
})));

const B = (block, nth) => `#gratList .grat-block:nth-child(${block}) .grat-echo-btn:nth-child(${nth})`;

(async () => {
  const srv = await serve();
  const browser = await chromium.launch();
  const grat = [{ text: 'Hvala ti za sve', from: 'barry', time: T1 }, { text: 'Hvala tebi', from: 'andjela', time: T2 }];

  // ---- E1: every note gets the five-emoji row, in order ----
  {
    const s = await scenario(browser, { 'shared-gratitude': grat });
    const r = await rows(s.page);
    const order = r[0] && r[0].echo.map((x) => x.emoji).join('');
    check('E1 each note shows the five emoji in order',
      r.length === 2 && r.every((x) => x.echo.length === 5) && order === '❤️😘🥰😂👍',
      `blocks=${r.length} order=${order}`);
    await s.ctx.close();
  }

  // ---- E2: one tap writes exactly one record and marks itself as mine ----
  {
    const s = await scenario(browser, { 'shared-gratitude': grat, 'gh-token': 'test-token' });
    await s.page.evaluate(() => {
      window.__pushed = 0;
      const orig = window.pushAllSharedData;
      window.pushAllSharedData = function () { window.__pushed++; if (orig) orig.apply(this, arguments); };
    });
    await s.page.click(B(2, 1)); // ❤️ on barry's note
    await s.page.waitForTimeout(400);

    const list = await echoList(s.page);
    const rec = list[0] || {};
    const ok = list.length === 1 && rec.noteFrom === 'barry' && rec.noteTime === T1 &&
      rec.from === 'andjela' && rec.emoji === '❤️' && typeof rec.time === 'number' && rec.time > 0;
    check('E2 one tap writes one correctly shaped record', ok, JSON.stringify(list));

    const r = await rows(s.page);
    const heart = r[1].echo[0];
    check('E2b my own reaction is highlighted and counted',
      heart.mine === true && heart.count === '1' && r[0].echo[0].mine === false,
      JSON.stringify(r[1].echo[0]));

    const pushed = await s.page.evaluate(() => window.__pushed);
    check('E2c the tap propagates to sync', pushed === 1, `pushAllSharedData calls=${pushed}`);
    await s.ctx.close();
  }

  // ---- E3: tapping the same emoji again is idempotent ----
  {
    const s = await scenario(browser, { 'shared-gratitude': grat });
    await s.page.click(B(2, 1));
    await s.page.waitForTimeout(300);
    await s.page.click(B(2, 1));
    await s.page.waitForTimeout(300);
    const list = await echoList(s.page);
    const r = await rows(s.page);
    check('E3 re-tapping the same emoji changes nothing',
      list.length === 1 && list[0].emoji === '❤️' && r[1].echo[0].count === '1',
      `n=${list.length} emoji=${list[0] && list[0].emoji} count=${r[1].echo[0].count}`);
    await s.ctx.close();
  }

  // ---- E4: a different emoji replaces my own reaction, it does not add one ----
  {
    const s = await scenario(browser, { 'shared-gratitude': grat });
    await s.page.click(B(2, 1)); // ❤️
    await s.page.waitForTimeout(300);
    await s.page.click(B(2, 2)); // 😘
    await s.page.waitForTimeout(300);
    const list = await echoList(s.page);
    const r = await rows(s.page);
    check('E4 switching emoji updates my single record',
      list.length === 1 && list[0].emoji === '😘' &&
      r[1].echo[1].mine === true && r[1].echo[0].mine === false && r[1].echo[0].count === '0',
      `list=${JSON.stringify(list)} mineAt=${r[1].echo.findIndex((x) => x.mine)}`);
    await s.ctx.close();
  }

  // ---- E5/E6: the partner's reaction shows, and mine is distinguishable from it ----
  {
    const s = await scenario(browser, {
      'shared-gratitude': grat,
      'shared-gratitude-echo': [
        { noteFrom: 'andjela', noteTime: T2, from: 'barry', emoji: '🥰', time: T2 + 1000 },
      ],
    });
    const r = await rows(s.page);
    const partner = r[0].echo[2]; // andjela's note, 🥰
    check("E5 partner's reaction is displayed but not marked as mine",
      partner.count === '1' && partner.mine === false, JSON.stringify(partner));

    // now both of us react with the same emoji
    await s.page.click(B(1, 3));
    await s.page.waitForTimeout(400);
    const r2 = await rows(s.page);
    check('E6 both reactions on one emoji show a count of 2 with mine highlighted',
      r2[0].echo[2].count === '2' && r2[0].echo[2].mine === true, JSON.stringify(r2[0].echo[2]));
    await s.ctx.close();
  }

  // ---- E7: a legacy note without a timestamp gets no reaction row, and does not break ----
  {
    const s = await scenario(browser, {
      'shared-gratitude': [{ text: 'stara beleska', from: 'barry' }, { text: 'nova', from: 'barry', time: T1 }],
    });
    const r = await rows(s.page);
    // slice(-5).reverse() renders newest first, so the dated note is block 0.
    check('E7 legacy note renders without a reaction row, dated note keeps its own',
      r.length === 2 && r[0].text.includes('nova') && r[0].echo.length === 5 &&
      r[1].text.includes('stara beleska') && r[1].echo.length === 0,
      JSON.stringify(r.map((x) => [x.text, x.echo.length])));
    await s.ctx.close();
  }

  // ---- E8: reactions outside the allowed set are rejected ----
  {
    const s = await scenario(browser, { 'shared-gratitude': grat });
    await s.page.evaluate((t) => {
      window.reactGratitude('barry', t, '💀');
      window.reactGratitude('barry', t, '');
      window.reactGratitude('barry', 'not-a-time', '❤️');
    }, T1);
    await s.page.waitForTimeout(200);
    const list = await echoList(s.page);
    check('E8 emoji outside the set, and malformed identities, are rejected',
      list.length === 0, JSON.stringify(list));
    await s.ctx.close();
  }

  // ---- E9: the pull path surfaces a partner reaction with no reload ----
  {
    const s = await scenario(browser, { 'shared-gratitude': grat, 'gh-token': 'test-token' });
    s.remote.state = { gratitude: grat };
    await s.page.evaluate(() => window.pullAllSharedData());
    await s.page.waitForTimeout(600);
    const before = (await rows(s.page))[0].echo[4].count;

    s.remote.state = {
      gratitude: grat,
      gratitudeEcho: [{ noteFrom: 'andjela', noteTime: T2, from: 'barry', emoji: '👍', time: T2 + 5000 }],
    };
    await s.page.evaluate(() => window.pullAllSharedData());
    await s.page.waitForTimeout(900);
    const after = (await rows(s.page))[0].echo[4].count;
    check('E9 a pulled partner reaction appears without a reload',
      before === '0' && after === '1', `before=${before} after=${after}`);
    await s.ctx.close();
  }

  // ---- E10: regression — the note itself is untouched and still escaped ----
  {
    const s = await scenario(browser, {
      'shared-gratitude': [{ text: '<b>bold</b> & "quoted"', from: 'barry', time: T1 }],
    });
    const r = await rows(s.page);
    const inner = await s.page.evaluate(() => document.getElementById('gratList').innerHTML);
    check('E10 note text, heart and translate button are unchanged, and still escaped',
      r[0].text.includes('<b>bold</b> & "quoted"') && r[0].heart === '👦' && r[0].translate === true &&
      !inner.includes('<b>'),
      `heart=${r[0].heart} translate=${r[0].translate} escaped=${!inner.includes('<b>')}`);
    await s.ctx.close();
  }

  await browser.close();
  srv.close();

  check('R1 no uncaught page error in any scenario', errors.length === 0, errors.slice(0, 3).join(' | '));

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
