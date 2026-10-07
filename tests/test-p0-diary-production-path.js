/**
 * P0 (second round) — the PRODUCTION PATH, end to end, on one continuous chain.
 *
 * tests/test-p0-diary-partner.js already pins "a pull must repaint the letter".
 * That suite passes 32/32 while the real users still saw "Ta 这一天还没有写",
 * because every one of its cases seeds the reader with an EMPTY local diary —
 * and an empty local diary makes the default landing day today by construction.
 * A real person has a history. This suite moves exactly that variable.
 *
 * The chain under test, in one line, for both directions:
 *
 *   saveDiaryEntry → localStorage['shared-diary'] → pushAllSharedData (PUT payload)
 *     → fake Worker (pure CAS) → pull → mergeDiary → _refreshDiaryView
 *     → _reconcileDiaryLanding → partner card
 *
 * The defect this suite pins (reproduced deterministically at 1172577):
 * Phase 2C's default landing day is _latestDiaryDate() — "the most recent day
 * that actually has content, else today" — computed from the LOCAL snapshot at
 * the moment 回忆 → 📖 日记 is entered. The startup pull is almost always still
 * in flight at that instant, so the partner's entry for today has not landed
 * yet, and the rule falls back to "the last day I myself wrote". The pull then
 * delivers her entry for today; the old seam repainted that same wrong day, so
 * the card kept saying 📭 while her text sat in localStorage. Both people hit it
 * symmetrically, which is why it read like a server problem.
 *
 * Read-only with respect to the world: serves the repo over local HTTP into
 * throwaway browser contexts, answers every workers.dev request from a local
 * fixture that mirrors the real Worker's compare-and-swap contract, aborts
 * GitHub / weather / translate, blocks service workers. Synthetic sentences
 * only. No credential is read, requested, printed or rotated; no production
 * data is read or written.
 *
 * Run: node tests/test-p0-diary-production-path.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8975;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

const APP_KEY = 'test-app-key-p0path-000000000000000000';

const HIS_TODAY = 'Synthetic — his line for today.';
const HER_TODAY = 'Synthetic — her line for today.';
const HIS_OLD = 'Synthetic — his line from two days ago.';

/** Slow enough that the card is provably on screen before the data arrives. */
const SLOW_MS = 2500;

let failures = 0;
function check(name, pass, detail) {
  if (!pass) failures++;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '\n        ' + detail : ''}`);
}

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
/* Comments stripped before any "this must exist / must not exist" assertion: this
   repo records deletions by writing a comment naming the deleted thing, so a raw
   grep measures prose as often as it measures code. */
const code = (src) => src
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '');

const pad = (x) => (x < 10 ? '0' : '') + x;
function dayKeyAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
const TODAY = dayKeyAgo(0);
const OLD = dayKeyAgo(2);

/** The YYYY-MM-DD key a device in `tz` would compute at instant `iso`. */
function keyInZone(iso, tz) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(iso));
}

const slot = (text, agoDays) => ({ text, mood: '', time: Date.now() - (agoDays || 0) * 86400000 });

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
 * Local stand-in for the Worker: pure compare-and-swap over an opaque `state`
 * blob, 409 + latest content when baseSha is stale, and zero interpretation of
 * the payload — that un-opinionated-ness is itself part of what is being
 * asserted (the Worker cannot be blamed for dropping a diary side it never
 * parses).
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

/** Synthetic device state only. `ct-app-key` here is a test string, not a secret. */
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
    localStorage.setItem('shared-diary', JSON.stringify(s.localDiary || {}));
    localStorage.setItem('cycle-theme', 'light');

    if (s.iso) {
      /* Freeze the clock without breaking `new Date(key)` / Date.parse: only the
         zero-argument forms are pinned. */
      const RealDate = Date;
      const fixed = new RealDate(s.iso).getTime();
      function FakeDate() {
        if (!(this instanceof FakeDate)) return new RealDate(fixed).toString();
        if (arguments.length === 0) return new RealDate(fixed);
        const a = [null].concat([].slice.call(arguments));
        return new (Function.prototype.bind.apply(RealDate, a))();
      }
      FakeDate.prototype = RealDate.prototype;
      FakeDate.now = function () { return fixed; };
      FakeDate.parse = RealDate.parse;
      FakeDate.UTC = RealDate.UTC;
      window.Date = FakeDate;
    }
  } catch (e) { /* ignore */ }
};

async function boot(browser, opts) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true, isMobile: true, deviceScaleFactor: 1,
    serviceWorkers: 'block',
    timezoneId: opts.timezoneId || undefined,
  });
  await ctx.addInitScript(SEED, {
    profile: opts.profile, appKey: APP_KEY,
    localDiary: opts.localDiary || {}, iso: opts.iso || null,
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

/**
 * The observable facts. "Which day is on screen" is read from the date strip's
 * highlighted day — the user-visible answer — not from _diaryViewDate, which
 * lives inside js/fix-diary.js's IIFE and is deliberately not on window.
 */
const FACTS = function () {
  const strip = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const cur = document.querySelector('#diaryDateStrip .diary-date-btn.current');
  const cc = document.getElementById('letterPartnerContent');
  let sd = {};
  try { sd = JSON.parse(localStorage.getItem('shared-diary') || '{}'); } catch (e) { /* ignore */ }
  const days = {};
  Object.keys(sd).forEach((k) => { days[k] = Object.keys(sd[k] || {}).sort(); });
  return {
    viewDate: cur ? cur.dataset.date : null,
    writeDateEl: strip((document.getElementById('diaryWriteDate') || {}).textContent),
    letter: strip(cc ? cc.textContent : ''),
    localDays: days,
    textarea: (document.getElementById('diaryTextarea') || {}).value || '',
  };
};

/** Save the way a person does: type into the editor, then run the save path. */
async function writeDiary(page, text) {
  await page.fill('#diaryTextarea', text);
  await page.evaluate(() => { window.saveDiaryEntry(); });
}

(async () => {
  console.log('\n════ A · source pins — the shape of the fix, not its prose ════\n');

  const fixSrc = read('js/fix-diary.js');
  const memSrc = read('js/module-memories.js');
  const fixCode = code(fixSrc);
  const memCode = code(memSrc);

  const reconcile = fixCode.slice(
    fixCode.indexOf('function _reconcileDiaryLanding'),
    fixCode.indexOf('window._refreshDiaryView'),
  );
  /* Anchor on the ASSIGNMENTS, not the bare name: the string
     `window._onDateBtnClick` also occurs inside the date strip's inline onclick
     markup, and indexOf would find that first. */
  const seamAt = fixCode.indexOf('window._refreshDiaryView = function');
  const seamBody = fixCode.slice(seamAt, seamAt + 500);
  const clickAt = fixCode.indexOf('window._onDateBtnClick = function');
  const clickBody = fixCode.slice(clickAt, clickAt + 200);
  const landAt = memCode.indexOf('function _landDiary');
  const landBody = memCode.slice(landAt, memCode.indexOf('function _openDiary'));

  check('A1 the post-pull seam runs a landing reconcile before it repaints',
    reconcile.length > 0 && /_reconcileDiaryLanding\s*\(/.test(seamBody),
    `reconcile=${reconcile.length}B calledFromSeam=${/_reconcileDiaryLanding\s*\(/.test(seamBody)}`);

  check('A2 the reconcile only ever moves the view FORWARD (never back onto a day already read)',
    /want\s*>\s*_diaryViewDate/.test(reconcile) && !/want\s*!==\s*_diaryViewDate/.test(reconcile),
    'forward-only');

  check('A3 the reconcile yields to a reader who took over (hand-picked day, or typing)',
    /if\s*\(\s*_diaryUserPicked\s*\)\s*return/.test(reconcile) && /diaryTextarea/.test(fixCode),
    'guard present');

  check('A4 it is still Phase 2C\'s rule underneath: _latestDiaryDate, not a second landing rule',
    /window\._latestDiaryDate\s*=\s*_latestDiaryDate;/.test(fixCode) &&
    /if \(k > today\) return;/.test(fixCode) &&
    /\(b && b\.text\) \|\| \(a && a\.text\)/.test(fixCode),
    'Phase 2C rule intact');

  check('A5 a human picking a day hands over control; the programmatic landing does not',
    /_diaryUserPicked\s*=\s*true/.test(clickBody) &&
    /window\._landDiaryTo\s*=\s*function/.test(fixCode) &&
    landBody.indexOf('_landDiaryTo') !== -1 &&
    landBody.indexOf('_landDiaryTo') < landBody.indexOf('_onDateBtnClick'),
    'human flags, program does not');

  check('A6 the landing entry into diary mode is unchanged and still one-shot',
    /function _landDiary\s*\(/.test(memCode) && /_latestDiaryDate/.test(landBody) &&
    /_diaryEntered/.test(memCode),
    'landing entry intact');

  check('A7 the reconcile introduces no new storage key of its own',
    !/setItem\([^)]*(userPicked|landDate|reconcile)/i.test(fixCode) &&
    !/setItem\([^)]*(userPicked|landDate|reconcile)/i.test(memCode),
    'no new key');

  check('A8 the write path is the protocol it was: saveDiaryEntry → shared-diary → pushAllSharedData',
    /localStorage\.setItem\('shared-diary'/.test(fixCode) && /pushAllSharedData\(\)/.test(fixCode),
    'save path untouched');

  const drift = ['js/fix-diary.js', 'js/module-memories.js']
    .filter((f) => read(f) !== read('dist/' + f));
  check('A9 the two edited runtime files have byte-identical dist mirrors',
    drift.length === 0, `drift=${drift.join(',') || 'none'}`);

  console.log('\n════ B · the production chain, in a real browser ════\n');

  const srv = await serve();
  const browser = await chromium.launch();

  /* ── B1..B3 — save → local → push payload → pull → merge → render, one writer ── */
  console.log('── B1/B2/B3 — one side writes; the payload, the merge, the card ──\n');
  {
    const w = makeWorker({});
    const hers = await boot(browser, { profile: 'andjela', worker: w });

    await openDiary(hers.page, 300);
    await hers.page.evaluate((t) => { window._onDateBtnClick(t); }, TODAY);
    await writeDiary(hers.page, HER_TODAY);
    const t0 = Date.now();
    while (!w.puts.length && Date.now() - t0 < 8000) await hers.page.waitForTimeout(100);

    const herLocal = await hers.page.evaluate(FACTS);
    const lastPut = w.puts.length ? (w.puts[w.puts.length - 1].diary || {})[TODAY] : null;
    check('B1 a save lands in localStorage under her key, AND the push payload carries that same slot',
      !!(herLocal.localDays[TODAY] || []).includes('andjela') &&
      !!(lastPut && lastPut.andjela),
      `localToday=${JSON.stringify(herLocal.localDays[TODAY])} putSlot=${JSON.stringify(lastPut ? Object.keys(lastPut) : null)}`);

    check('B2 the canonical state holds her entry (the Worker never drops a side it does not parse)',
      !!(w.state.diary[TODAY] && w.state.diary[TODAY].andjela),
      `canonicalToday=${JSON.stringify(Object.keys(w.state.diary[TODAY] || {}))}`);

    /* His device: empty local history, so the only thing under test is the pull. */
    const his = await boot(browser, { profile: 'barry', worker: w });
    await openDiary(his.page, 300);
    const got = await waitFor(his.page, LETTER_HAS, HER_TODAY, 10000);
    const hisFacts = await his.page.evaluate(FACTS);

    check('B3 pull → merge → render: his card shows her line, with no user action',
      got, `view=${hisFacts.viewDate} letter=${JSON.stringify(hisFacts.letter.slice(0, 50))}`);

    check('B3b the merge did not fabricate his own side of the day',
      !(hisFacts.localDays[TODAY] || []).includes('barry'),
      `hisLocalToday=${JSON.stringify(hisFacts.localDays[TODAY])}`);

    check('B3c neither device raised a page error',
      hers.errs.length === 0 && his.errs.length === 0,
      `her=${JSON.stringify(hers.errs.slice(0, 2))} his=${JSON.stringify(his.errs.slice(0, 2))}`);

    await hers.ctx.close();
    await his.ctx.close();
  }

  /* ── B4 — both write the same day: CAS read-back, no clobber, each sees the other ── */
  console.log('\n── B4 — both sides write the same day ──\n');
  {
    const w = makeWorker({});
    for (const [profile, text] of [['barry', HIS_TODAY], ['andjela', HER_TODAY]]) {
      const d = await boot(browser, { profile, worker: w });
      await openDiary(d.page, 200);
      await d.page.evaluate((t) => { window._onDateBtnClick(t); }, TODAY);
      await writeDiary(d.page, text);
      await d.page.waitForTimeout(2500);
      await d.ctx.close();
    }
    const who = w.state.diary[TODAY] ? Object.keys(w.state.diary[TODAY]).sort() : null;
    check('B4 two devices saving the same day leave BOTH sides canonical — no clobber',
      JSON.stringify(who) === JSON.stringify(['andjela', 'barry']),
      `canonical=${JSON.stringify(who)} puts=${w.puts.length}`);
    check('B4b every push carried a live baseSha (the CAS read-back held)',
      w.puts.length >= 2 && w.puts.every((p) => !!p.baseSha) &&
      w.puts[w.puts.length - 1].baseSha !== w.puts[0].baseSha,
      JSON.stringify(w.puts.map((p) => p.baseSha)));

    /* A reader must see the partner's line, never her own, from the merged state. */
    const reader = await boot(browser, { profile: 'andjela', worker: w });
    await openDiary(reader.page, 200);
    const seen = await waitFor(reader.page, LETTER_HAS, HIS_TODAY, 10000);
    const rf = await reader.page.evaluate(FACTS);
    check('B4c the partner renderer reads the PARTNER slot, never the reader\'s own',
      seen && rf.letter.indexOf(HER_TODAY) === -1,
      `letter=${JSON.stringify(rf.letter.slice(0, 60))}`);
    await reader.ctx.close();
  }

  /* ── B5..B8 — the P0 itself: a local history pulls the landing off today ── */
  console.log('\n── B5/B6/B7/B8 — late pull against a reader who has his own history ──\n');
  {
    const w = makeWorker({ delayMs: SLOW_MS, diary: { [TODAY]: { andjela: slot(HER_TODAY, 0) } } });
    const his = await boot(browser, {
      profile: 'barry',
      worker: w,
      localDiary: { [dayKeyAgo(1)]: { barry: slot(HIS_OLD, 1) }, [OLD]: { barry: slot(HIS_OLD, 2) } },
    });
    await openDiary(his.page, 300);
    const early = await his.page.evaluate(FACTS);

    check('B5 precondition: he lands on his OWN last written day, not today — the pull has not landed',
      early.viewDate === dayKeyAgo(1) && early.viewDate !== TODAY,
      `view=${early.viewDate} today=${TODAY} letter=${JSON.stringify(early.letter.slice(0, 40))}`);

    const caught = await waitFor(his.page, LETTER_HAS, HER_TODAY, SLOW_MS + 12000);
    const after = await his.page.evaluate(FACTS);

    check('B5b her entry really did arrive in his localStorage — push/pull/merge are exonerated',
      !!(after.localDays[TODAY] || []).includes('andjela'),
      `hisDays=${JSON.stringify(after.localDays)}`);

    check('B5c *** P0 *** the card shows her line — no tab switch, no refresh, no hand-changed date',
      caught && after.letter.indexOf(HER_TODAY) !== -1,
      `view=${after.viewDate} letter=${JSON.stringify(after.letter.slice(0, 60))}`);

    check('B5d the landing reconciled onto today instead of repainting the wrong day',
      after.viewDate === TODAY,
      `view=${after.viewDate} expected=${TODAY}`);

    /* B6 — a reader who picks a day keeps it, even when a pull lands afterwards. */
    const back = dayKeyAgo(2);
    await his.page.click(`#diaryDateStrip .diary-date-btn[data-date="${back}"]`);
    await his.page.waitForTimeout(300);
    await his.page.evaluate(() => { window._refreshDiaryView(); });
    await his.page.waitForTimeout(300);
    const pinned = await his.page.evaluate(FACTS);
    check('B6 a day the reader picked himself is never yanked away by a later pull',
      pinned.viewDate === back,
      `view=${pinned.viewDate} expected=${back}`);

    /* B7 — and a full refresh still lands right and shows her line. */
    await his.page.reload({ waitUntil: 'domcontentloaded' });
    await his.page.waitForSelector('.tab[data-panel="diary"]', { timeout: 15000 });
    await openDiary(his.page, 500);
    const reloaded = await waitFor(his.page, LETTER_HAS, HER_TODAY, SLOW_MS + 12000);
    const rf = await his.page.evaluate(FACTS);
    check('B7 after a full refresh her line is on screen again',
      reloaded && rf.letter.indexOf(HER_TODAY) !== -1,
      `view=${rf.viewDate} letter=${JSON.stringify(rf.letter.slice(0, 50))}`);

    check('B8 no page error anywhere in the P0 walk',
      his.errs.length === 0, JSON.stringify(his.errs.slice(0, 3)));

    await his.ctx.close();
  }

  /* ── B9 — two profiles against one canonical state ── */
  console.log('\n── B9 — two profiles, one canonical state ──\n');
  {
    const w = makeWorker({
      diary: { [TODAY]: { barry: slot(HIS_TODAY, 0), andjela: slot(HER_TODAY, 0) } },
    });
    const asHim = await boot(browser, { profile: 'barry', worker: w });
    const asHer = await boot(browser, { profile: 'andjela', worker: w });
    await openDiary(asHim.page, 200);
    await openDiary(asHer.page, 200);
    const gotHim = await waitFor(asHim.page, LETTER_HAS, HER_TODAY, 10000);
    const gotHer = await waitFor(asHer.page, LETTER_HAS, HIS_TODAY, 10000);
    const fHim = await asHim.page.evaluate(FACTS);
    const fHer = await asHer.page.evaluate(FACTS);

    check('B9 each profile sees the OTHER profile\'s line for the same day — no cross-contamination',
      gotHim && gotHer &&
      fHim.letter.indexOf(HIS_TODAY) === -1 && fHer.letter.indexOf(HER_TODAY) === -1,
      `him=${JSON.stringify(fHim.letter.slice(0, 40))} her=${JSON.stringify(fHer.letter.slice(0, 40))}`);

    check('B9b and both still hold both sides locally — the slot model is intact',
      (fHim.localDays[TODAY] || []).join() === 'andjela,barry' &&
      (fHer.localDays[TODAY] || []).join() === 'andjela,barry',
      `him=${JSON.stringify(fHim.localDays[TODAY])} her=${JSON.stringify(fHer.localDays[TODAY])}`);

    await asHim.ctx.close();
    await asHer.ctx.close();
  }

  /* ── B10 — the timezone boundary ──
     The date key is deliberately LOCAL to each device. Two people six hours apart
     can be on different calendar days at the same instant; that is a real
     property of the design, not a defect, and this case pins what actually
     happens across it: her entry keeps HER key, reaches his device intact, and is
     readable one tap away. */
  console.log('\n── B10 — the timezone boundary ──\n');
  {
    const ISO = '2026-10-07T16:30:00.000Z';
    const TZ_HER = 'Europe/Zagreb';   /* 18:30 — still 2026-10-07 */
    const TZ_HIM = 'Asia/Shanghai';   /* 00:30 next day — 2026-10-08 */
    const HER_KEY = keyInZone(ISO, TZ_HER);
    const HIS_KEY = keyInZone(ISO, TZ_HIM);
    const HER_TZ_LINE = 'Synthetic — her line, written on her today.';

    const w = makeWorker({});
    const her = await boot(browser, { profile: 'andjela', worker: w, timezoneId: TZ_HER, iso: ISO });
    await openDiary(her.page, 800);
    await writeDiary(her.page, HER_TZ_LINE);
    const t0 = Date.now();
    while (!w.puts.length && Date.now() - t0 < 8000) await her.page.waitForTimeout(100);
    const herFacts = await her.page.evaluate(FACTS);

    const him = await boot(browser, { profile: 'barry', worker: w, timezoneId: TZ_HIM, iso: ISO });
    await openDiary(him.page, 1200);
    await him.page.waitForTimeout(1500);
    const after = await him.page.evaluate(FACTS);

    check('B10 the two devices really are on different local dates at the same instant',
      HER_KEY !== HIS_KEY && herFacts.viewDate === HER_KEY,
      `herKey=${HER_KEY} hisKey=${HIS_KEY} herView=${herFacts.viewDate}`);

    check('B10b her entry kept HER key and crossed the boundary intact',
      !!(after.localDays[HER_KEY] || []).includes('andjela'),
      `hisDays=${JSON.stringify(after.localDays)}`);

    /* One tap back to her day — the boundary is real, but the entry is not lost.
       The landing stays on HIS today on purpose: "her newest entry is one key
       behind mine" is a calendar difference, not a sync failure, and dragging a
       reader backwards off today is not this fix's job. */
    await him.page.evaluate((k) => { window._onDateBtnClick(k); }, HER_KEY);
    await him.page.waitForTimeout(400);
    const read = await him.page.evaluate(FACTS);
    check('B10c one tap to her key and her line is there — the boundary costs a tap, never the entry',
      read.letter.indexOf(HER_TZ_LINE) !== -1,
      `view=${read.viewDate} letter=${JSON.stringify(read.letter.slice(0, 60))}`);

    check('B10d no page error across the boundary',
      her.errs.length === 0 && him.errs.length === 0,
      `her=${JSON.stringify(her.errs.slice(0, 2))} his=${JSON.stringify(him.errs.slice(0, 2))}`);

    await her.ctx.close();
    await him.ctx.close();
  }

  await browser.close();
  srv.close();
  console.log(failures ? `\n${failures} FAILED\n` : '\nall checks passed\n');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
