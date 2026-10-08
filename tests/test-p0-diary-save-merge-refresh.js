/**
 * P0 (third round) — the SAVE path: the push-side merge must repaint the letter.
 *
 * The reported symptom, verbatim from the user:
 *
 *   "我在今天 2026-10-07 的日期上写了『早安』，她明明已经写了，但是我保存后，
 *    『🌸 Anđela 的信』仍然显示『Ta 这一天还没有写』。"
 *
 * tests/test-p0-diary-partner.js pins "a PULL must repaint the letter".
 * tests/test-p0-diary-production-path.js pins "the default landing day must
 * reconcile once the pull lands". Both pass, and both are about `pull()`.
 *
 * This suite is about the OTHER transport, and about the moment a person
 * actually spends their time in: pressing save.
 *
 *   saveDiaryEntry (js/fix-diary.js:203)
 *     → localStorage['shared-diary']            (his line, written synchronously)
 *     → pushAllSharedData()                     (NOT awaited — line 203)
 *     → _updatePartnerLetter(dateKey)           (line 204, runs immediately)
 *          ↑ renders the empty state, because her entry is not local yet
 *     ...later, on the network round-trip:
 *     → push() step 1: GET /state → _mergeRemoteIntoLocal(env.state)   (sync.js:736)
 *     → mergeDiary writes her entry into localStorage['shared-diary']  (sync.js:621)
 *          ↑ and NOTHING repaints. The card stays empty until some unrelated
 *            later event (the 60s auto-pull, a tab switch) happens to repaint it.
 *
 * `_refreshDiaryView()` is called from exactly one place in js/sync.js — inside
 * pull() (line 822). `_mergeRemoteIntoLocal()` has exactly two call sites —
 * sync.js:736 (push's pre-flight GET) and sync.js:690 (the 409 conflict branch)
 * — and neither repaints. That is the whole defect.
 *
 * Timing is the whole test. `pull()` DOES repaint, so a suite that seeds the
 * Worker with her entry before boot proves nothing — the startup pull delivers
 * it and the letter is warm by the time he types. Every case below therefore
 * boots against a Worker that does NOT yet hold her entry, lets the startup
 * pull settle against that empty state (asserted), and only THEN lets her
 * write. The auto-pull interval is 60000ms (js/sync.js:19) and every wait here
 * is under 15s, so no background pull can rescue the letter.
 *
 * Read-only with respect to the world: serves the repo over local HTTP into
 * throwaway browser contexts, answers every workers.dev request from a local
 * fixture that mirrors the real Worker's compare-and-swap contract, aborts
 * GitHub / weather / translate, blocks service workers. Synthetic sentences
 * only. No credential is read, requested, printed or rotated; no production
 * data is read or written.
 *
 * Run: node tests/test-p0-diary-save-merge-refresh.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8976;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

const APP_KEY = 'test-app-key-p0save-000000000000000000';

const HIS_TODAY = 'Synthetic — his line for today.';
const HER_TODAY = 'Synthetic — her line for today.';
const HER_OLD = 'Synthetic — her line from two days ago.';
const HIS_OLD = 'Synthetic — his line from two days ago.';

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

const slot = (text) => ({ text, mood: '', time: Date.now() });
const emptyState = () => ({ diary: {}, gratitude: [], gratitudeEcho: [], dailyQ: [], knowme: {} });

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
 * blob, 409 + latest content when baseSha is stale, zero interpretation of the
 * payload.
 *
 * `w.state`, `w.sha` and `w.afterGet` are mutable from the test after boot, so a
 * case can let her write at a precise moment in the sequence: before his save's
 * pre-flight GET (B — no conflict), or between that GET and his PUT (C — a real
 * 409), without touching anything else about the CAS contract.
 */
function makeWorker(opts) {
  opts = opts || {};
  const w = {
    sha: opts.sha || 'sha-1',
    state: opts.state || emptyState(),
    puts: [],
    gets: 0,
    lastGetDoneAt: 0,
    afterGet: null,
  };
  /* Her write, seen from the fixture's side: new content and a new sha, exactly
     as the real Worker's commit would produce both. */
  w.herWrite = (diary) => {
    w.state = { diary, gratitude: [], gratitudeEcho: [], dailyQ: [], knowme: {} };
    w.sha = 'sha-her-' + Object.keys(diary).length + '-' + (w.puts.length + 1);
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
      w.sha = 'sha-put-' + w.puts.length;
      return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ sha: w.sha }) });
    }
    w.gets++;
    const payload = JSON.stringify({ sha: w.sha, state: w.state });
    const out = await route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: payload });
    w.lastGetDoneAt = Date.now();
    if (w.afterGet) w.afterGet(w);
    return out;
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
  } catch (e) { /* ignore */ }
};

async function boot(browser, opts) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true, isMobile: true, deviceScaleFactor: 1,
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
const LETTER_EMPTY = () => {
  const cc = document.getElementById('letterPartnerContent');
  const t = cc ? (cc.textContent || '') : '';
  return t.indexOf('Nothing from your partner') !== -1 || t.indexOf('还没有写') !== -1;
};

/**
 * Wait until the network has genuinely gone quiet — not merely until the letter
 * happens to look empty, which is true from the first millisecond and proves
 * nothing.
 *
 * This matters because js/fix-diary.js:509 observes `#panel-diary`'s class and,
 * when the panel activates, schedules ANOTHER pull 300ms later. That pull calls
 * `_refreshDiaryView()` on arrival, so anything written while it is still in
 * flight gets repainted by it — and a suite that mistimes this measures that
 * pull instead of the save path it is claiming to test.
 *
 * So: wait for at least `minGets` GETs, then for a quiet window longer than the
 * fixture's simulated latency after the last one was answered.
 */
async function quietNetwork(page, worker, minGets, quietMs, maxMs) {
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    const idle = worker.lastGetDoneAt && (Date.now() - worker.lastGetDoneAt) > quietMs;
    if (worker.gets >= minGets && idle) return true;
    await page.waitForTimeout(100);
  }
  return false;
}

/**
 * Measure the SAVE path with the PULL path switched off.
 *
 * pull() is a different transport, and it is already pinned by
 * tests/test-p0-diary-partner.js and tests/test-p0-diary-production-path.js.
 * But pull() repaints the letter on arrival, and js/fix-diary.js:509 schedules
 * an extra pull shortly after the diary panel activates. Left alone, that stray
 * pull lands after the write often enough to mask the defect — this suite was
 * observed passing one run (2 GETs) and failing the next (3 GETs) against
 * identical code.
 *
 * Blocking it is not weakening the test; it is what makes the test measure the
 * push path at all. `__pullsBlocked` records whether anything tried, so a case
 * can say out loud that no pull ran.
 */
async function blockPulls(page) {
  await page.evaluate(() => {
    window.__pullsBlocked = 0;
    window.pullAllSharedData = function () { window.__pullsBlocked++; return Promise.resolve(); };
  });
}

/** Poll a node-side predicate while the page keeps running. */
async function waitOn(page, pred, ms) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (pred()) return true;
    await page.waitForTimeout(200);
  }
  return pred();
}

/**
 * The observable facts. "Which day is on screen" is read from the date strip's
 * highlighted day — the user-visible answer — not from _diaryViewDate, which
 * lives inside js/fix-diary.js's IIFE and is deliberately not on window.
 */
const FACTS = function () {
  const squash = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const cur = document.querySelector('#diaryDateStrip .diary-date-btn.current');
  const cc = document.getElementById('letterPartnerContent');
  let sd = {};
  try { sd = JSON.parse(localStorage.getItem('shared-diary') || '{}'); } catch (e) { /* ignore */ }
  const days = {};
  Object.keys(sd).forEach((k) => { days[k] = Object.keys(sd[k] || {}).sort(); });
  return {
    viewDate: cur ? cur.dataset.date : null,
    letter: squash(cc ? cc.textContent : ''),
    localDays: days,
    textarea: (document.getElementById('diaryTextarea') || {}).value || '',
  };
};
const facts = (page) => page.evaluate(FACTS);

/** Save the way a person does: type into the editor, then run the save path. */
async function writeDiary(page, text) {
  await page.fill('#diaryTextarea', text);
  await page.evaluate(() => { window.saveDiaryEntry(); });
}

(async () => {
  console.log('\n════ A · source pins — the shape of the fix, not its prose ════\n');

  const syncCode = code(read('js/sync.js'));

  const mergeAt = syncCode.indexOf('function _mergeRemoteIntoLocal');
  const mergeBody = syncCode.slice(mergeAt, syncCode.indexOf('async function _putState'));
  const pullAt = syncCode.indexOf('async function pull(');
  const pullBody = syncCode.slice(pullAt, syncCode.indexOf('function updateBadge'));

  check('A1 _mergeRemoteIntoLocal exists and still writes the merged diary to localStorage',
    mergeAt !== -1 &&
    /localStorage\.setItem\('shared-diary', JSON\.stringify\(merged\)\)/.test(mergeBody),
    `found=${mergeAt !== -1}`);

  check('A2 the push-side merge now repaints the diary view — this is the fix',
    /_refreshDiaryView/.test(mergeBody),
    `refreshInMerge=${/_refreshDiaryView/.test(mergeBody)}`);

  check('A3 the repaint is conditional on the diary actually changing — no repaint storm on every push',
    /diaryChanged/.test(mergeBody),
    `diaryChangedFlag=${/diaryChanged/.test(mergeBody)}`);

  check('A4 the merge semantics themselves are untouched — still mergeDiary, still slot-level',
    /mergeDiary\(localDiary, remoteState\.diary\)/.test(mergeBody),
    `mergeDiaryCall=${/mergeDiary\(localDiary, remoteState\.diary\)/.test(mergeBody)}`);

  check('A5 pull() keeps its own repaint — the earlier fix is not traded away',
    /_refreshDiaryView/.test(pullBody),
    `refreshInPull=${/_refreshDiaryView/.test(pullBody)}`);

  check('A6 the save path is unchanged: saveDiaryEntry still does not await the push',
    /pushAllSharedData\(\);\s*\n\s*_updatePartnerLetter\(dateKey\);/.test(code(read('js/fix-diary.js'))),
    'saveDiaryEntry shape unchanged');

  const drift = [];
  for (const f of ['js/sync.js', 'js/fix-diary.js']) {
    if (read(f) !== read('dist/' + f)) drift.push(f);
  }
  check('A7 dist mirrors are byte-identical',
    drift.length === 0, `drift=${drift.join(',') || 'none'}`);

  const srv = await serve();
  const browser = await chromium.launch();

  console.log('\n════ B · the save path: she writes while he is typing ════\n');
  {
    /* He opens the app against an empty Worker and the startup pull settles on
       nothing. Then she writes. He types his line and saves — and her entry is
       already on the Worker when push() does its pre-flight GET. No conflict,
       so this is the plain merge path. Nothing else may be needed. */
    const worker = makeWorker({ delayMs: 700 });
    const { ctx, page, errs } = await boot(browser, { profile: 'barry', worker, localDiary: {} });
    await openDiary(page, 700);
    const settled = await quietNetwork(page, worker, 2, 900, 15000);
    await blockPulls(page);

    const before = await facts(page);
    check('B1 precondition — the boot/open pulls landed on an empty Worker and the network is quiet',
      settled && before.viewDate === TODAY && Object.keys(before.localDays).length === 0,
      `quiet=${settled} gets=${worker.gets} viewDate=${before.viewDate} localDays=${JSON.stringify(before.localDays)}`);

    /* She writes now — after the pull, before his save. */
    worker.herWrite({ [TODAY]: { andjela: slot(HER_TODAY) } });

    await writeDiary(page, HIS_TODAY);
    /* No tab switch, no reload, no manual sync — just wait for the round trip. */
    const caught = await waitFor(page, LETTER_HAS, HER_TODAY, 12000);
    const after = await facts(page);

    check('B2 *** the letter shows her line after save ***  (fails => the reported P0)',
      caught,
      `letter=${JSON.stringify(after.letter.slice(0, 70))}`);

    check('B3 his own line survived the merge — the merge is a union, not a clobber',
      (after.localDays[TODAY] || []).includes('barry'),
      `today=${JSON.stringify(after.localDays[TODAY] || [])}`);

    check('B4 her line reached his localStorage — the merge itself was never the problem',
      (after.localDays[TODAY] || []).includes('andjela'),
      `today=${JSON.stringify(after.localDays[TODAY] || [])}`);

    check('B5 he never left today',
      after.viewDate === TODAY, `viewDate=${after.viewDate}`);

    check('B5b no pull ran during the measurement window — what B2 measured is the push path',
      (await page.evaluate(() => window.__pullsBlocked)) === 0,
      `pullsBlocked=${await page.evaluate(() => window.__pullsBlocked)}`);

    /* The repaint happens during the pre-flight merge — i.e. BEFORE the PUT is
       even sent — so counting PUTs right here reads 0 and proves nothing. Wait
       for the PUT to land, then a beat longer, so a second one would be caught. */
    await waitOn(page, () => worker.puts.length >= 1, 8000);
    await page.waitForTimeout(1500);

    check('B5c the repaint did not trigger a second push — no push→refresh→push loop',
      worker.puts.length === 1,
      `puts=${worker.puts.length}`);

    check('B6 no page error', errs.length === 0, `errors=${JSON.stringify(errs.slice(0, 3))}`);
    await ctx.close();
  }

  console.log('\n════ C · the 409 path: she writes between my GET and my PUT ════\n');
  {
    /* Same start, but her write lands in the window between push()'s pre-flight
       GET and his PUT, so the PUT carries a stale baseSha and 409s. The 409
       envelope is what brings her entry in — a path that never touches pull()
       and, before the fix, never repainted either. */
    const worker = makeWorker({ delayMs: 300 });
    const { ctx, page, errs } = await boot(browser, { profile: 'barry', worker, localDiary: {} });
    await openDiary(page, 700);
    const settled = await quietNetwork(page, worker, 2, 900, 15000);
    await blockPulls(page);

    check('C0 precondition — the boot/open pulls landed empty and the network is quiet, so the 409 branch is what must deliver her line',
      settled, `quiet=${settled} gets=${worker.gets}`);

    /* Armed only NOW, so it fires on the save's pre-flight GET — after that
       response's payload has been computed. Her entry therefore reaches him
       only through the 409 envelope. */
    const emptySha = worker.sha;
    worker.afterGet = (w) => { w.afterGet = null; w.herWrite({ [TODAY]: { andjela: slot(HER_TODAY) } }); };

    await writeDiary(page, HIS_TODAY);

    /* Two PUTs: the conflicted one, then the 3s-later retry against the new sha. */
    const conflicted = await waitOn(page, () => worker.puts.length >= 2, 15000);
    check('C1 the PUT really did conflict and then retried — the 409 branch is exercised, not skipped',
      conflicted && worker.puts[0].baseSha === emptySha && worker.puts[1].baseSha !== emptySha,
      `puts=${JSON.stringify(worker.puts.map((p) => p.baseSha))} emptySha=${emptySha}`);

    const caught = await waitFor(page, LETTER_HAS, HER_TODAY, 8000);
    const after = await facts(page);

    check('C2 *** the 409 merge repaints the letter ***',
      caught,
      `letter=${JSON.stringify(after.letter.slice(0, 70))}`);

    check('C3 his line was not lost to the conflict',
      (after.localDays[TODAY] || []).includes('barry'),
      `today=${JSON.stringify(after.localDays[TODAY] || [])}`);

    check('C4 no page error', errs.length === 0, `errors=${JSON.stringify(errs.slice(0, 3))}`);
    await ctx.close();
  }

  console.log('\n════ D · she genuinely did not write — the empty state must stay ════\n');
  {
    const worker = makeWorker({ delayMs: 400 });
    const { ctx, page, errs } = await boot(browser, { profile: 'barry', worker, localDiary: {} });
    await openDiary(page, 700);
    await quietNetwork(page, worker, 2, 900, 15000);
    await blockPulls(page);
    await writeDiary(page, HIS_TODAY);
    await page.waitForTimeout(3000);
    const after = await facts(page);

    check('D1 the empty state survives — a missing partner entry is not a bug',
      after.letter.indexOf('Nothing from your partner') !== -1,
      `letter=${JSON.stringify(after.letter.slice(0, 60))}`);

    check('D2 his own line is still saved and still pushed',
      (after.localDays[TODAY] || []).includes('barry') && worker.puts.length >= 1,
      `today=${JSON.stringify(after.localDays[TODAY] || [])} puts=${worker.puts.length}`);

    check('D3 no page error', errs.length === 0, `errors=${JSON.stringify(errs.slice(0, 3))}`);
    await ctx.close();
  }

  console.log('\n════ E · the user is reading and typing on a day they chose ════\n');
  {
    /* He has a history on two days, so he lands on the newer one. He then taps
       the older date — the human path, which hands control back (_diaryUserPicked)
       — and types. A merge arrives carrying her text for that older day.
       Requirements: the view must not move, his in-progress text must survive,
       and the letter for the day he is actually looking at must update. */
    const worker = makeWorker({ delayMs: 500 });
    worker.state = { diary: { [TODAY]: { barry: slot(HIS_TODAY) } }, gratitude: [], gratitudeEcho: [], dailyQ: [], knowme: {} };
    const { ctx, page, errs } = await boot(browser, {
      profile: 'barry', worker,
      localDiary: { [TODAY]: { barry: slot(HIS_TODAY) }, [OLD]: { barry: slot(HIS_OLD) } },
    });
    await openDiary(page, 700);
    await page.waitForFunction(
      () => !!document.querySelector('#diaryDateStrip .diary-date-btn.current'),
      null, { timeout: 10000 }
    );
    await quietNetwork(page, worker, 2, 900, 15000);
    await blockPulls(page);

    const landed = await facts(page);
    check('E1 precondition — he lands on the newer day',
      landed.viewDate === TODAY,
      `viewDate=${landed.viewDate} expected=${TODAY}`);

    /* A real tap on the date strip (this is what sets _diaryUserPicked), then a real edit. */
    await page.click(`#diaryDateStrip .diary-date-btn[data-date="${OLD}"]`);
    await page.waitForTimeout(300);
    const picked = await facts(page);
    check('E2 precondition — the tap moved him to the older day',
      picked.viewDate === OLD, `viewDate=${picked.viewDate} expected=${OLD}`);

    /* She writes her line for that older day, after his pull, before his save. */
    worker.herWrite({ [TODAY]: { barry: slot(HIS_TODAY) }, [OLD]: { barry: slot(HIS_OLD), andjela: slot(HER_OLD) } });

    await writeDiary(page, 'Synthetic — still typing this line.');
    const caught = await waitFor(page, LETTER_HAS, HER_OLD, 12000);
    const after = await facts(page);

    check('E3 *** the letter for the day he is LOOKING AT updated ***',
      caught,
      `viewDate=${after.viewDate} letter=${JSON.stringify(after.letter.slice(0, 70))}`);

    check('E4 the view never moved off the day he chose',
      after.viewDate === OLD, `viewDate=${after.viewDate} expected=${OLD}`);

    check('E5 his in-progress text was not cleared by the repaint',
      after.textarea.indexOf('still typing this line') !== -1,
      `textarea=${JSON.stringify(after.textarea.slice(0, 60))}`);

    check('E6 today was merged too, without dragging the view to it',
      (after.localDays[TODAY] || []).includes('andjela') === false &&
      (after.localDays[TODAY] || []).includes('barry') &&
      after.viewDate === OLD,
      `today=${JSON.stringify(after.localDays[TODAY] || [])} viewDate=${after.viewDate}`);

    check('E7 no page error', errs.length === 0, `errors=${JSON.stringify(errs.slice(0, 3))}`);
    await ctx.close();
  }

  console.log('\n════ F · the other direction — she sees him ════\n');
  {
    const worker = makeWorker({ delayMs: 700 });
    const { ctx, page, errs } = await boot(browser, { profile: 'andjela', worker, localDiary: {} });
    await openDiary(page, 700);
    await quietNetwork(page, worker, 2, 900, 15000);
    await blockPulls(page);
    worker.herWrite({ [TODAY]: { barry: slot(HIS_TODAY) } });
    await writeDiary(page, HER_TODAY);

    const caught = await waitFor(page, LETTER_HAS, HIS_TODAY, 12000);
    const after = await facts(page);

    check('F1 *** she sees his line after her own save ***', caught,
      `letter=${JSON.stringify(after.letter.slice(0, 70))}`);

    check('F2 both sides are in her localStorage',
      (after.localDays[TODAY] || []).includes('barry') &&
      (after.localDays[TODAY] || []).includes('andjela'),
      `today=${JSON.stringify(after.localDays[TODAY] || [])}`);

    check('F3 no page error', errs.length === 0, `errors=${JSON.stringify(errs.slice(0, 3))}`);
    await ctx.close();
  }

  await browser.close();
  srv.close();
  console.log(failures ? `\n${failures} FAILED\n` : '\nall checks passed\n');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
