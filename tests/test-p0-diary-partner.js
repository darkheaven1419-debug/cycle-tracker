/**
 * P0 — each person can see the OTHER person's diary for today.
 *
 * The defect this pins: a pull brought the partner's entry into
 * localStorage['shared-diary'] correctly, but nothing re-rendered the partner
 * letter afterwards. js/sync.js's post-pull re-render block called
 * renderSharedDiary() and renderDateStrip() — the two functions that
 * js/render-diary.js defined (at its lines 196 and 31) and that went with that
 * file in dd01178 "revert: roll back everything to June 24 state". The
 * typeof guards turned the calls into silent no-ops, so the letter stayed
 * frozen at whatever it showed before the pull landed, i.e. 📭. app.js called
 * the same names unguarded, which threw inside a .then() with no .catch().
 * Both people hit it the same way: open the app, tap 回忆, tap 📖 日记 — the
 * pull has not landed yet.
 *
 * The fix routes every pull through one seam, window._refreshDiaryView()
 * (js/fix-diary.js), which re-renders the day currently on screen. This suite
 * asserts the outcome, not the seam: with the Worker answering slowly — so the
 * letter is provably rendered BEFORE the data arrives — the letter must catch
 * up on its own, with no user action of any kind.
 *
 * Touches nothing: serves the repo over local HTTP into throwaway browser
 * contexts and seeds synthetic storage. Every Worker request is answered by a
 * local fixture that mirrors the real one's compare-and-swap contract; GitHub,
 * weather and translate are aborted. No production data is read or written and
 * only synthetic sentences are typed.
 *
 * Run: node tests/test-p0-diary-partner.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8967;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

const APP_KEY = 'test-app-key-p0-000000000000000000000000';

const BARRY_TODAY = 'Synthetic — his line for today.';
const ANDJELA_TODAY = 'Synthetic — her line for today.';
const BARRY_OLD = 'Synthetic — his line from five days ago.';
const ANDJELA_OLD = 'Synthetic — her line from five days ago.';

/** A response slow enough that the letter is on screen before the data lands. */
const SLOW_MS = 2500;

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

/**
 * Source with comments stripped. Several checks below assert that something is
 * GONE, and this repo records deletions by writing a comment naming what was
 * deleted — index.html still names js/render-diary.js in exactly that way. A
 * raw absence check would therefore measure the prose, not the code. Strip
 * first, then look.
 */
function code(src) {
  return src
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '');
}

/** Local-date key N days back — the same YYYY-MM-DD keying the app uses. */
function dayKeyAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const p = (x) => (x < 10 ? '0' : '') + x;
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
const TODAY = dayKeyAgo(0);
const OLD = dayKeyAgo(5);

const slot = (text, agoDays) => ({ text, mood: '', time: Date.now() - (agoDays || 0) * 86400000 });

/** Canonical diary as the Worker would hold it. */
function diaryOf(pairs) {
  const d = {};
  pairs.forEach(([dk, who, text]) => {
    if (!d[dk]) d[dk] = {};
    d[dk][who] = slot(text, dk === TODAY ? 0 : 5);
  });
  return d;
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
 * A local stand-in for the Worker. It mirrors the real one's contract exactly:
 * pure compare-and-swap over an opaque `state` blob, 409 with the latest
 * content when baseSha is stale, and no interpretation of the payload at all —
 * which is itself the point (see S4).
 */
function makeWorker(opts) {
  opts = opts || {};
  const w = {
    sha: 'sha-1',
    state: { diary: opts.diary || {}, gratitude: [], gratitudeEcho: [], dailyQ: [], knowme: {} },
    puts: [],
    gets: 0,
  };
  w.handle = async (route) => {
    const req = route.request();
    const u = req.url();
    const origin = req.headers()['origin'];
    const cors = origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {};
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    if (u.indexOf('/todo') !== -1) {
      return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ sha: null, todo: [] }) });
    }
    if (opts.delayMs) await new Promise((r) => setTimeout(r, opts.delayMs));
    if (req.method() === 'PUT') {
      let body = null;
      try { body = JSON.parse(req.postData() || 'null'); } catch (e) { body = null; }
      w.puts.push({ baseSha: body && body.baseSha, diary: (body && body.state && body.state.diary) || null });
      if (!body || body.baseSha !== w.sha) {
        return route.fulfill({ status: 409, contentType: 'application/json', headers: cors, body: JSON.stringify({ sha: w.sha, state: w.state }) });
      }
      if (body.state) w.state = body.state;
      w.sha = 'sha-' + (w.puts.length + 1);
      return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ sha: w.sha }) });
    }
    w.gets++;
    return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ sha: w.sha, state: w.state }) });
  };
  return w;
}

/** Synthetic device state only. Nothing here is a real credential. */
const SEED = (s) => {
  try {
    window.alert = function () {};
    window.confirm = function () { return true; };
    sessionStorage.setItem('cycle-logged-in', '1');
    localStorage.setItem('cycle-active-profile', s.profile);
    localStorage.setItem('cycle-lang', 'en');
    localStorage.setItem('cycle-lang-barry', 'en');
    localStorage.setItem('cycle-lang-andjela', 'en');
    localStorage.setItem('cycle-lang-chosen-barry', '1');
    localStorage.setItem('cycle-lang-chosen-andjela', '1');
    localStorage.setItem('ct-app-key', s.appKey);
    localStorage.setItem('cycle-ann-met', '2026-03-19');
    localStorage.setItem('cycle-ann-love', '2026-05-07');
    localStorage.setItem('shared-diary', JSON.stringify(s.localDiary));
    localStorage.setItem('cycle-theme', 'light');
  } catch (e) { /* ignore */ }
};

async function boot(browser, opts) {
  const vp = opts.vp || { w: 390, h: 844 };
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    hasTouch: true, isMobile: vp.w < 768, deviceScaleFactor: 1,
    serviceWorkers: 'block',
  });
  await ctx.addInitScript(SEED, {
    profile: opts.profile, appKey: APP_KEY, localDiary: opts.localDiary || {},
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message.split('\n')[0]));
  await page.route('**/*', (route) => {
    const u = route.request().url();
    if (u.indexOf('workers.dev') !== -1) return opts.worker.handle(route);
    if (u.indexOf('api.github.com') !== -1) return route.abort();
    if (u.includes('open-meteo') || u.includes('translate.google') || u.includes('mymemory')) return route.abort();
    return route.continue();
  });
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.tab[data-panel="diary"]', { timeout: 15000 });
  return { ctx, page, errs };
}

/** Enter 回忆 → 📖 日记 the way a person does: a real click on each. */
async function openDiary(page, settle) {
  await page.click('.tab[data-panel="diary"]');
  await page.waitForSelector('#memModeBar', { timeout: 15000 });
  await page.click('#memModeDiary');
  if (settle) await page.waitForTimeout(settle);
}

/* Polling waits, not fixed sleeps: the assertions below are about what ends up
   on screen, and a sleep long enough to be safe is a sleep that hides a hang. */
async function waitFor(page, fn, arg, ms) {
  const t0 = Date.now();
  for (;;) {
    if (await page.evaluate(fn, arg)) return true;
    if (Date.now() - t0 > ms) return false;
    await page.waitForTimeout(150);
  }
}

const LETTER_HAS = (t) => {
  const cc = document.getElementById('letterPartnerContent');
  return !!cc && (cc.textContent || '').indexOf(t) !== -1;
};
const LOCAL_HAS = (a) => {
  let sd = {};
  try { sd = JSON.parse(localStorage.getItem('shared-diary') || '{}'); } catch (e) { return false; }
  return !!(sd[a.dk] && sd[a.dk][a.who]);
};
const MEASURE = function (t) {
  const strip = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const cc = document.getElementById('letterPartnerContent');
  const card = document.getElementById('letterPartnerCard');
  const shown = (el) => { if (!el) return false; const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
  let sd = {};
  try { sd = JSON.parse(localStorage.getItem('shared-diary') || '{}'); } catch (e) { /* ignore */ }
  /* Which day is on screen, read from the day the date strip highlights — the
     user-visible answer. _diaryViewDate is the same fact but lives inside
     js/fix-diary.js's IIFE and is deliberately not on window. */
  const cur = document.querySelector('#diaryDateStrip .diary-date-btn.current');
  return {
    letter: strip(cc ? cc.textContent : ''),
    letterShown: shown(cc),
    cardShown: shown(card),
    todaySlot: sd[t.dk] ? Object.keys(sd[t.dk]).sort() : null,
    profile: (typeof activeProfile !== 'undefined') ? activeProfile : null,
    viewDate: cur ? cur.dataset.date : null,
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
  };
};
const measure = (page, dk) => page.evaluate(MEASURE, { dk: dk || TODAY });

(async () => {
  /* ═══════════ S1..S7 — the mechanism, read from source ═══════════ */
  {
    const fixCode = code(read('js/fix-diary.js'));
    const syncCode = code(read('js/sync.js'));
    const appCode = code(read('app.js'));

    check('S1 the post-pull re-render seam exists and is exported',
      /window\._refreshDiaryView\s*=/.test(fixCode), 'window._refreshDiaryView');

    /* The two dead names must have no live call anywhere. Comments may still
       name them — that is how this repo records a deletion — so strip first. */
    const deadCalls = ['app.js', 'js/sync.js', 'js/fix-diary.js']
      .filter((f) => /renderSharedDiary\s*\(|renderDateStrip\s*\(/.test(code(read(f))));
    check('S2 no live call remains to the two functions that went with js/render-diary.js',
      deadCalls.length === 0, `still calling=${deadCalls.join(',') || 'none'}`);

    /* Every path that can bring the partner's entry in must reach the seam:
       two sites in app.js (profile switch, boot) and two in sync.js — pull(),
       plus the push-side merge. That second one is the 2026-10-07 fix: the
       merge writes the partner's line into localStorage from push()'s
       pre-flight GET and from _putState's 409 retry, and until then neither
       told the UI anything, so "I saved and it still says 📭" only healed on
       the next 60s auto-pull.
       Count call sites, not mentions — each site names the seam twice. */
    const appHits = (appCode.match(/_refreshDiaryView\s*\(/g) || []).length;
    const syncHits = (syncCode.match(/_refreshDiaryView\s*\(/g) || []).length;
    const mergeBody = syncCode.slice(
      syncCode.indexOf('function _mergeRemoteIntoLocal'),
      syncCode.indexOf('async function _putState')
    );
    const inMerge = /_refreshDiaryView\s*\(/.test(mergeBody);
    check('S3 boot, profile switch, pull and the push-side merge all route through the one seam',
      appHits === 2 && syncHits === 2 && inMerge,
      `app.js=${appHits} sync.js=${syncHits} inMerge=${inMerge}`);

    check('S4 the Worker still never interprets the payload — no diary knowledge at all',
      !/diary/i.test(code(read('worker/src/index.js'))), 'worker is a pure CAS passthrough');

    /* The renderer must ship in the precached bundle, and no renderer for the
       deleted file may be precached or loaded under any guise. */
    const sw = read('sw.js');
    const html = read('index.html');
    const preloadsDeleted = /render-diary/.test(code(sw)) || /render-diary/.test(code(html));
    check('S5 the Service Worker precaches js/fix-diary.js and loads no render-diary of any kind',
      /'\.\/js\/fix-diary\.js'/.test(sw) && !preloadsDeleted &&
      !fs.existsSync(path.join(ROOT, 'js/render-diary.js')),
      'fix-diary precached bare, render-diary absent from sw, html and disk');

    /* The deleted file really did define the two names, and really is gone —
       asserted against git itself so the claim in the header cannot rot.
       The parent revision is resolved with rev-parse first: execSync shells out
       through cmd.exe on Windows, where the `^` in `dd01178^:path` is an escape
       character and would silently eat the colon. `~1` is not special there. */
    let definedIt = null;
    try {
      const { execSync } = require('child_process');
      const parent = execSync('git rev-parse dd01178~1', { cwd: ROOT, encoding: 'utf8' }).trim();
      const before = execSync(`git show ${parent}:js/render-diary.js`, { cwd: ROOT, encoding: 'utf8' });
      definedIt = /function renderDateStrip\s*\(/.test(before) && /function renderSharedDiary\s*\(/.test(before);
    } catch (e) { definedIt = 'git-query-failed: ' + e.message.split('\n')[0]; }
    check('S6 the deleted js/render-diary.js is where those two names came from (dd01178)',
      definedIt === true, `defined both=${definedIt}`);

    const drift = ['app.js', 'js/sync.js', 'js/fix-diary.js', 'js/module-memories.js', 'index.html', 'sw.js']
      .filter((f) => read(f) !== read('dist/' + f));
    check('S7 the changed runtime files have byte-identical dist mirrors',
      drift.length === 0, `drift=${drift.join(',') || 'none'}`);
  }

  /* ═══════════ D — behaviour, in a real browser ═══════════ */
  const srv = await serve();
  const browser = await chromium.launch();

  try {
    /* D1 — THE REGRESSION. The Worker answers slowly, so the letter is
       provably on screen before the partner's entry exists locally. It must
       catch up on its own: no tap, no tab switch, no reload. */
    {
      const w = makeWorker({ delayMs: SLOW_MS, diary: diaryOf([[TODAY, 'andjela', ANDJELA_TODAY]]) });
      const { ctx, page, errs } = await boot(browser, { profile: 'barry', worker: w });
      await openDiary(page, 300);

      const early = await measure(page);
      check('D1a barry: before the pull lands the letter is empty (the precondition is real)',
        !early.letter.includes(ANDJELA_TODAY), JSON.stringify({ letter: early.letter.slice(0, 50) }));

      const caught = await waitFor(page, LETTER_HAS, ANDJELA_TODAY, SLOW_MS + 9000);
      check('D1b barry: the letter catches up on its own, with no user action at all',
        caught, JSON.stringify((await measure(page)).letter.slice(0, 70)));

      const local = await page.evaluate(LOCAL_HAS, { dk: TODAY, who: 'andjela' });
      check('D1c barry: her entry lands in local storage too, so the merge was never the problem',
        local, JSON.stringify({ todaySlot: (await measure(page)).todaySlot }));
      check('D1d barry: no page error', errs.length === 0, `errors=${JSON.stringify(errs.slice(0, 3))}`);
      await ctx.close();
    }

    /* D2 — mirrored, so this is not a one-way coincidence. */
    {
      const w = makeWorker({ delayMs: SLOW_MS, diary: diaryOf([[TODAY, 'barry', BARRY_TODAY]]) });
      const { ctx, page } = await boot(browser, { profile: 'andjela', worker: w });
      await openDiary(page, 300);
      const caught = await waitFor(page, LETTER_HAS, BARRY_TODAY, SLOW_MS + 9000);
      check('D2 andjela: mirrored — his today entry reaches her letter on its own',
        caught, JSON.stringify((await measure(page)).letter.slice(0, 70)));
      await ctx.close();
    }

    /* D3 — both wrote today: each reads the other's, never their own. */
    {
      const w = makeWorker({
        diary: diaryOf([[TODAY, 'barry', BARRY_TODAY], [TODAY, 'andjela', ANDJELA_TODAY]]),
      });
      const { ctx, page } = await boot(browser, { profile: 'barry', worker: w });
      await openDiary(page, 200);
      await waitFor(page, LETTER_HAS, ANDJELA_TODAY, 8000);
      const m = await measure(page);
      check('D3a barry, both wrote today: he reads hers, and never his own line',
        m.letter.includes(ANDJELA_TODAY) && !m.letter.includes(BARRY_TODAY),
        JSON.stringify({ letter: m.letter.slice(0, 60), todaySlot: m.todaySlot }));

      await page.evaluate(() => { if (window.switchProfile) window.switchProfile('andjela'); });
      await page.waitForTimeout(600);
      await page.evaluate(() => { if (window.initSharedDiaryTab) window.initSharedDiaryTab(); });
      await waitFor(page, LETTER_HAS, BARRY_TODAY, 9000);
      const m2 = await measure(page);
      check('D3b andjela on the same device: she reads his, and never her own line',
        m2.letter.includes(BARRY_TODAY) && !m2.letter.includes(ANDJELA_TODAY),
        JSON.stringify({ letter: m2.letter.slice(0, 60), profile: m2.profile }));
      await ctx.close();
    }

    /* D4 — only she wrote today: he sees hers; nothing is invented on his side. */
    {
      const w = makeWorker({ diary: diaryOf([[TODAY, 'andjela', ANDJELA_TODAY]]) });
      const { ctx, page } = await boot(browser, { profile: 'barry', worker: w });
      await openDiary(page, 200);
      await waitFor(page, LETTER_HAS, ANDJELA_TODAY, 8000);
      const m = await measure(page);
      check('D4a barry: only she wrote — he still reads it, with no write of his own required',
        m.letter.includes(ANDJELA_TODAY) && m.cardShown,
        JSON.stringify({ letter: m.letter.slice(0, 50), card: m.cardShown }));
      const hisSlot = await page.evaluate((t) => {
        const sd = JSON.parse(localStorage.getItem('shared-diary') || '{}');
        return !!(sd[t] && sd[t].barry);
      }, TODAY);
      check('D4b barry: nothing was fabricated into his own slot',
        hisSlot === false, `barry slot present=${hisSlot}`);
      await ctx.close();
    }

    /* D5/D6 — today by default, a historical day on demand, and back. */
    {
      const w = makeWorker({
        diary: diaryOf([
          [TODAY, 'andjela', ANDJELA_TODAY],
          [OLD, 'andjela', ANDJELA_OLD],
          [OLD, 'barry', BARRY_OLD],
        ]),
      });
      const { ctx, page } = await boot(browser, {
        profile: 'barry',
        localDiary: { [TODAY]: { barry: slot(BARRY_TODAY, 0) } },
        worker: w,
      });
      await openDiary(page, 200);
      await waitFor(page, LETTER_HAS, ANDJELA_TODAY, 8000);
      const mToday = await measure(page);
      check('D5 today: the letter shows her line for today',
        mToday.viewDate === TODAY && mToday.letter.includes(ANDJELA_TODAY),
        JSON.stringify({ viewDate: mToday.viewDate, letter: mToday.letter.slice(0, 50) }));

      await page.evaluate((d) => { window._onDateBtnClick(d); }, OLD);
      await page.waitForTimeout(600);
      const mOld = await measure(page);
      check('D6 five days back: her line for that day shows, and today\'s does not',
        mOld.letter.includes(ANDJELA_OLD) && !mOld.letter.includes(ANDJELA_TODAY),
        JSON.stringify({ viewDate: mOld.viewDate, letter: mOld.letter.slice(0, 60) }));

      await page.evaluate((d) => { window._onDateBtnClick(d); }, TODAY);
      await page.waitForTimeout(600);
      const mBack = await measure(page);
      check('D6b back to today: her today line returns',
        mBack.letter.includes(ANDJELA_TODAY),
        JSON.stringify({ viewDate: mBack.viewDate, letter: mBack.letter.slice(0, 50) }));
      await ctx.close();
    }

    /* D7/D8 — leaving diary mode and coming back, then a full refresh. */
    {
      const w = makeWorker({ diary: diaryOf([[TODAY, 'andjela', ANDJELA_TODAY]]) });
      const { ctx, page } = await boot(browser, { profile: 'barry', worker: w });
      await openDiary(page, 200);
      await waitFor(page, LETTER_HAS, ANDJELA_TODAY, 8000);

      await page.evaluate(() => { window.__memories.setMode('story'); });
      await page.waitForTimeout(400);
      // Wipe the local copy while the letter is off screen, so a stale DOM
      // would be indistinguishable from a fresh render.
      await page.evaluate(() => { localStorage.setItem('shared-diary', '{}'); });
      await page.evaluate(() => { window.__memories.setMode('diary'); });
      const cameBack = await waitFor(page, LETTER_HAS, ANDJELA_TODAY, 9000);
      check('D7 leaving 日记 and coming back re-renders the letter rather than showing a stale card',
        cameBack, JSON.stringify((await measure(page)).letter.slice(0, 60)));

      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.tab[data-panel="diary"]', { timeout: 15000 });
      await openDiary(page, 200);
      const afterReload = await waitFor(page, LETTER_HAS, ANDJELA_TODAY, 9000);
      check('D8 after a full refresh her line is still there',
        afterReload, JSON.stringify((await measure(page)).letter.slice(0, 60)));
      await ctx.close();
    }

    /* D9/D10 — the write path: it pushes, it merges, and her side survives. */
    {
      const w = makeWorker({ diary: diaryOf([[TODAY, 'andjela', ANDJELA_TODAY]]) });
      const { ctx, page } = await boot(browser, { profile: 'barry', worker: w });
      await openDiary(page, 200);
      await waitFor(page, LETTER_HAS, ANDJELA_TODAY, 9000);

      await page.fill('#diaryTextarea', BARRY_TODAY);
      await page.evaluate(() => { window.saveDiaryEntry(); });
      await page.waitForTimeout(2500);

      const pushed = w.puts.length ? w.puts[w.puts.length - 1] : null;
      check('D9 barry\'s save pushes a payload that still carries her entry',
        !!(pushed && pushed.diary && pushed.diary[TODAY] && pushed.diary[TODAY].andjela &&
           pushed.diary[TODAY].barry && pushed.diary[TODAY].barry.text === BARRY_TODAY),
        `baseSha=${JSON.stringify(pushed && pushed.baseSha)}`);

      const bothLocal = await page.evaluate((t) => {
        const sd = JSON.parse(localStorage.getItem('shared-diary') || '{}');
        return sd[t] ? Object.keys(sd[t]).sort() : null;
      }, TODAY);
      check('D10 after his save the day holds BOTH entries locally — hers was merged, not replaced',
        JSON.stringify(bothLocal) === JSON.stringify(['andjela', 'barry']),
        JSON.stringify(bothLocal));

      check('D10b his own editor is untouched by the partner render',
        (await page.evaluate(() => (document.getElementById('diaryTextarea') || {}).value)) === BARRY_TODAY,
        'his text still in #diaryTextarea');
      await ctx.close();
    }

    /* D11 — push, then a fresh device pulls: both sides survive the round trip. */
    {
      const w = makeWorker({ diary: diaryOf([[TODAY, 'andjela', ANDJELA_TODAY]]) });
      const dev1 = await boot(browser, { profile: 'barry', worker: w });
      await openDiary(dev1.page, 200);
      await waitFor(dev1.page, LETTER_HAS, ANDJELA_TODAY, 9000);
      await dev1.page.fill('#diaryTextarea', BARRY_TODAY);
      await dev1.page.evaluate(() => { window.saveDiaryEntry(); });
      await dev1.page.waitForTimeout(2500);
      await dev1.ctx.close();

      const dev2 = await boot(browser, { profile: 'barry', worker: w });
      await openDiary(dev2.page, 200);
      await waitFor(dev2.page, LETTER_HAS, ANDJELA_TODAY, 9000);
      const m = await measure(dev2.page);
      check('D11 a second device pulls and sees BOTH sides of the day',
        Array.isArray(m.todaySlot) && m.todaySlot.indexOf('barry') !== -1 && m.todaySlot.indexOf('andjela') !== -1,
        JSON.stringify({ todaySlot: m.todaySlot }));
      check('D11b and its letter shows hers, not his',
        m.letter.includes(ANDJELA_TODAY) && !m.letter.includes(BARRY_TODAY),
        JSON.stringify(m.letter.slice(0, 60)));
      await dev2.ctx.close();
    }

    /* D12 — two devices save in sequence against a CAS Worker: no clobber. */
    {
      const w = makeWorker({});
      for (const [profile, text] of [['barry', BARRY_TODAY], ['andjela', ANDJELA_TODAY]]) {
        const d = await boot(browser, { profile, worker: w });
        await openDiary(d.page, 200);
        await d.page.waitForTimeout(1500);
        await d.page.evaluate((t) => { window._onDateBtnClick(t); }, TODAY);
        await d.page.waitForTimeout(400);
        await d.page.fill('#diaryTextarea', text);
        await d.page.evaluate(() => { window.saveDiaryEntry(); });
        await d.page.waitForTimeout(2500);
        await d.ctx.close();
      }
      const canon = w.state.diary;
      const who = canon && canon[TODAY] ? Object.keys(canon[TODAY]).sort() : null;
      check('D12 two devices saving in sequence leave BOTH entries in the canonical state',
        JSON.stringify(who) === JSON.stringify(['andjela', 'barry']),
        JSON.stringify({ canonical: who, puts: w.puts.length }));
      check('D12b neither push carried a stale baseSha — the CAS read-back held',
        w.puts.length >= 2 && w.puts.every((p) => !!p.baseSha) &&
        w.puts[w.puts.length - 1].baseSha !== w.puts[0].baseSha,
        JSON.stringify(w.puts.map((p) => p.baseSha)));
    }

    /* D13 — the storage schema is exactly what it was. */
    {
      const w = makeWorker({});
      const { ctx, page } = await boot(browser, {
        profile: 'barry',
        localDiary: { [TODAY]: { barry: slot(BARRY_TODAY, 0) }, [OLD]: { andjela: slot(ANDJELA_OLD, 5) } },
        worker: w,
      });
      await openDiary(page, 200);
      await page.waitForTimeout(1500);
      const shape = await page.evaluate(() => {
        const sd = JSON.parse(localStorage.getItem('shared-diary') || '{}');
        const dateKeys = Object.keys(sd);
        const users = new Set();
        const fields = new Set();
        dateKeys.forEach((k) => Object.keys(sd[k]).forEach((u) => {
          users.add(u);
          Object.keys(sd[k][u]).forEach((f) => fields.add(f));
        }));
        return { dateKeys, users: Array.from(users).sort(), fields: Array.from(fields).sort() };
      });
      const datesOk = shape.dateKeys.length > 0 && shape.dateKeys.every((k) => /^\d{4}-\d{2}-\d{2}$/.test(k));
      const usersOk = shape.users.every((u) => u === 'barry' || u === 'andjela');
      // `hug` is a legacy sibling field still found in older rows.
      const fieldsOk = shape.fields.every((f) => ['text', 'mood', 'time', 'hug'].indexOf(f) !== -1);
      check('D13 the shared-diary schema is unchanged: YYYY-MM-DD → {barry|andjela} → {text,mood,time}',
        datesOk && usersOk && fieldsOk, JSON.stringify(shape));
      await ctx.close();
    }

    /* D14 — the letter is actually on screen at 320 / 768 / 1440. */
    for (const tag of ['320', '768', '1440']) {
      const w = makeWorker({
        diary: diaryOf([[TODAY, 'andjela', ANDJELA_TODAY], [OLD, 'andjela', ANDJELA_OLD]]),
      });
      const vp = tag === '320' ? { w: 320, h: 800 } : tag === '768' ? { w: 768, h: 1024 } : { w: 1440, h: 900 };
      const { ctx, page, errs } = await boot(browser, { profile: 'barry', worker: w, vp });
      await openDiary(page, 200);
      const shown = await waitFor(page, LETTER_HAS, ANDJELA_TODAY, 9000);
      const m = await measure(page);
      check(`D14 [${tag}] the partner letter is visible with no horizontal overflow`,
        shown && m.letterShown && m.cardShown && m.overflowX <= 1,
        `letter=${m.letterShown} card=${m.cardShown} overflowX=${m.overflowX} errs=${errs.length}`);
      await ctx.close();
    }
  } finally {
    await browser.close();
    srv.close();
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
