/**
 * Phase 2C — 回忆 is two modes: 「我们的故事」 and 「📖 日记」.
 *
 * Phase 2B.9 made one long page and borrowed the diary editor up into it. This
 * round removes that mechanism entirely and splits the panel instead: the same
 * #panel-diary carries `.mem-mode-story` or `.mem-mode-diary`, and CSS decides
 * which half is on screen. Nothing is moved — which is what keeps
 * js/fix-diary.js's `.lpc-row` guard (`wc.parentNode === panel &&
 * pc.parentNode === panel`) true, and therefore keeps the letter-paper row
 * alive. Moving the write card into any new container makes that guard
 * permanently false, and the row silently never gets built.
 *
 * The seven things the round was specified to get right are the seven things
 * asserted here:
 *   1. every historical diary date is still reachable
 *   2. the story half shows one card and no list (see the Phase 2E note)
 *   3. the story half's remaining door into 📖 日记 lands in diary mode
 *   4. the story trim is display only — 📖 日记 keeps its own navigation, and
 *      _items() still reads every day
 *   5. the partner's letter is readable without writing anything first
 *   6. text being edited is not wiped by a story re-render
 *   7. 320 / 768 / 1440 in three languages, light and dark
 *
 * RE-TARGETED BY PHASE 2E, NOT WEAKENED. The 极简 Memories round deleted the
 * story timeline that points 2 and 3 were originally written against:
 * DIARY_REF_CAP / _capDiaryRefs / the date-reference rows are gone from the
 * engine, and .diary-timeline-section / .diary-mailbox-card / .mem-diary-head
 * are gone from index.html. Each check that named one of them was moved onto
 * what still exists rather than dropped, because what those checks were really
 * protecting — that the diary half is untouched and that every day is still
 * reachable through it — is exactly what that round's §十 point 13 asks about.
 * Point 2 is now the single-card assertion; point 3 is the 「📖 看全部日记」
 * door.
 *
 * Touches nothing: reads the repo over local HTTP into a throwaway browser
 * context and seeds synthetic storage. Every Worker request is fulfilled
 * locally; GitHub/weather/translate are aborted. No production data is read or
 * written, and only synthetic sentences are typed.
 *
 * Run: node tests/test-phase2c-modes.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8961;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

const APP_KEY = 'test-app-key-phase2c-000000000000000000000';
const SYNTH = 'Synthetic sentence — not a real memory.';
/* Her side of the newest day. Seeded alone (Barry wrote nothing that day) so
   "the letter opens without writing first" is a real observation and not an
   artefact of both sides being filled in. */
const HER_SENTINEL = 'Synthetic letter from the partner — not a real memory.';
const TYPED = 'Synthetic unsaved paragraph — not a real memory.';

/* Twelve diary days, all inside the last 24 days so the month picker (30 days
   back) can reach every one of them. The newest belongs to andjela alone. */
const DIARY_DAYS = 12;

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

/**
 * Source with comments stripped. Several checks here assert that something is
 * GONE, and the honest way to record a deletion in this repo is to write a
 * comment saying what was deleted and why — so the bare identifier survives in
 * prose. An absence check that reads raw source therefore measures the comment,
 * not the code. Strip first, then look.
 */
function code(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

/** Local-date key N days back — the same YYYY-MM-DD keying the app uses. */
function dayKeyAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const p = (x) => (x < 10 ? '0' : '') + x;
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

/** The 12 diary days, in the exact shape saveDiaryEntry writes. */
function diarySeed() {
  const o = {};
  o[dayKeyAgo(1)] = {
    andjela: { text: HER_SENTINEL, mood: '', time: Date.now() - 86400000 },
  };
  for (let i = 0; i < DIARY_DAYS - 1; i++) {
    const back = 3 + i * 2; // 3,5,…,23
    o[dayKeyAgo(back)] = {
      barry: { text: SYNTH + ' #' + i, mood: '', time: Date.now() - back * 86400000 },
    };
  }
  return o;
}

/** Every seeded diary key, newest first — the order the assertions walk in. */
function seededDays() {
  return Object.keys(diarySeed()).sort().reverse();
}

function gratSeed(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push({
      text: SYNTH + ' g' + i,
      time: Date.now() - (i + 1) * 86400000,
      from: i % 2 ? 'barry' : 'andjela',
    });
  }
  return out;
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
 * One boot: seed the diary and some gratitude in `language`, open 回忆 the way a
 * person does (a real click on the tab), and leave the page ready to poke at.
 * Every Worker request is answered locally; GitHub/weather/translate abort.
 */
async function boot(browser, vp, opts) {
  opts = opts || {};
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    hasTouch: true, isMobile: vp.w < 768, deviceScaleFactor: 1,
    serviceWorkers: 'block',
  });
  const L = opts.lang || 'zh-CN';
  await ctx.addInitScript((s) => {
    try {
      window.alert = function () {};
      window.confirm = function () { return true; };
      sessionStorage.setItem('cycle-logged-in', '1');
      localStorage.setItem('cycle-active-profile', 'barry');
      localStorage.setItem('cycle-lang', s.lang);
      localStorage.setItem('cycle-lang-barry', s.lang);
      localStorage.setItem('cycle-lang-chosen-barry', '1');
      localStorage.setItem('ct-app-key', s.appKey);
      localStorage.setItem('cycle-ann-met', '2026-03-19');
      localStorage.setItem('cycle-ann-love', '2026-05-07');
      localStorage.setItem('shared-diary', JSON.stringify(s.diary));
      localStorage.setItem('shared-gratitude', JSON.stringify(s.grat));
      localStorage.setItem('cycle-theme', s.theme);
    } catch (e) { /* ignore */ }
  }, { lang: L, appKey: APP_KEY, diary: diarySeed(), grat: gratSeed(5), theme: opts.theme || 'light' });

  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message.split('\n')[0]));
  await page.route('**/*', (route) => {
    const req = route.request();
    const u = req.url();
    const origin = req.headers()['origin'];
    const cors = origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {};
    if (u.indexOf('workers.dev') !== -1) {
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
      return route.fulfill({
        status: 200, contentType: 'application/json', headers: cors,
        body: JSON.stringify({ sha: null, state: {} }),
      });
    }
    if (u.indexOf('api.github.com') !== -1) return route.abort();
    if (u.includes('open-meteo') || u.includes('translate.google') || u.includes('mymemory')) return route.abort();
    return route.continue();
  });

  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.tab[data-panel="diary"]', { timeout: 15000 });
  await page.click('.tab[data-panel="diary"]');
  await page.waitForSelector('#memModeBar', { timeout: 15000 });
  await page.waitForTimeout(opts.settle || 1500);
  return { ctx, page, errs };
}

/** Mode + layout state, read from the live DOM in one pass. */
const MEASURE = function () {
  const panel = document.getElementById('panel-diary');
  const shown = (el) => {
    if (!el) return false;
    const b = el.getBoundingClientRect();
    return b.width > 0 && b.height > 0;
  };
  const box = (el) => {
    const b = el ? el.getBoundingClientRect() : null;
    return b ? { w: Math.round(b.width), h: Math.round(b.height), top: Math.round(b.top) } : null;
  };
  const modeBtn = document.getElementById('memModeDiary');
  const storyBtn = document.getElementById('memModeStory');
  const todayBtn = document.getElementById('diaryTodayBtn');
  return {
    modeStory: panel ? panel.classList.contains('mem-mode-story') : null,
    modeDiary: panel ? panel.classList.contains('mem-mode-diary') : null,
    memRootShown: shown(document.getElementById('memRoot')),
    stripShown: shown(document.querySelector('#panel-diary .diary-date-strip-wrap')),
    writeCardShown: shown(document.getElementById('diaryWriteCard')),
    letterShown: shown(document.getElementById('letterPartnerCard')),
    /* §一 deleted these nodes, so "is it shown" would be vacuously false for
       all three of them whatever the code did. Existence is the honest question
       now: the claim is that the display layer left the markup. */
    timelineSection: !!document.querySelector('#panel-diary .diary-timeline-section'),
    mailboxCard: !!document.querySelector('#panel-diary .diary-mailbox-card'),
    diaryHead: !!document.querySelector('#memRoot .mem-diary-head'),
    storyTabText: storyBtn ? storyBtn.textContent.trim() : '',
    diaryTabText: modeBtn ? modeBtn.textContent.trim() : '',
    storyTabActive: storyBtn ? storyBtn.classList.contains('is-active') : null,
    diaryTabActive: modeBtn ? modeBtn.classList.contains('is-active') : null,
    storyTabAria: storyBtn ? storyBtn.getAttribute('aria-selected') : null,
    diaryTabAria: modeBtn ? modeBtn.getAttribute('aria-selected') : null,
    /* §一 threw the long list away. Both of these must read 0 in story mode:
       the date references, and the non-diary rows that used to share the
       timeline with them. */
    refCount: document.querySelectorAll('#memRoot .mem-row-ref').length,
    otherRows: document.querySelectorAll('#memRoot .mem-row').length,
    featCards: document.querySelectorAll('#memRoot .mem-feat').length,
    featText: ((document.querySelector('#memRoot .mem-feat-text') || {}).textContent || '').trim(),
    writeDate: (document.getElementById('diaryWriteDate') || {}).textContent || '',
    textarea: (document.getElementById('diaryTextarea') || {}).value || null,
    hasTextarea: !!document.getElementById('diaryTextarea'),
    hasLock: !!document.getElementById('letterLocked'),
    letterText: ((document.getElementById('letterPartnerContent') || {}).textContent || '').trim(),
    letterVisible: shown(document.getElementById('letterPartnerContent')),
    todayBtnShown: shown(todayBtn),
    todayBtnText: todayBtn ? todayBtn.textContent.trim() : '',
    todayBtnH: box(todayBtn) ? box(todayBtn).h : null,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    theme: document.documentElement.getAttribute('data-theme'),
  };
};

(async () => {
  // ── C1..C11 — static: the invariants no rendering can demonstrate ──
  {
    const memSrc = read('js/module-memories.js');
    const fixSrc = read('js/fix-diary.js');
    const css = read('css/v2.css');
    const html = read('index.html');
    const memCode = code(memSrc);
    const fixCode = code(fixSrc);

    // C1 — §一 removed the story timeline, and with it the render budget that
    // used to govern it. Gone from the code, not hidden behind a flag: the
    // checks read comment-stripped source because this repo documents its
    // deletions in prose, so the bare identifiers survive in comments.
    check('C1 §一 DIARY_REF_CAP, _capDiaryRefs and the timeline renderers are gone',
      !/DIARY_REF_CAP|_capDiaryRefs/.test(memCode) &&
      !/_timelineHtml|_rowHtml|_songHtml|_relDay/.test(memCode),
      `cap=${/DIARY_REF_CAP/.test(memCode)} helper=${/_capDiaryRefs/.test(memCode)}`);

    // C2 — but the trim is display only (§一: 展示层简化). `_items()` must still
    // read the whole diary. If that read ever grew a cap, the trim would have
    // quietly become a data limit, and 📖 日记 would be what broke — which is
    // the one thing this round promised not to do.
    check('C2 §一 the trim is display only: the read path has no cap on diary days',
      /function _items\(now\)/.test(memCode) &&
      /localStorage\.getItem\(key\)/.test(memCode) &&
      !/_items\([^)]*\)\s*\.\s*(slice|filter)\(/.test(memCode),
      'full read, no slice/filter at the call site');

    // C3 — nothing moves. If any of the diary nodes ever gets appended into a
    // new container, fix-diary.js's `.lpc-row` guard goes permanently false and
    // the letter-paper row is never built again — silently.
    check('C3 no diary node is moved into #memRoot — the .lpc-row guard stays true',
      memCode.indexOf('memWriteHost') === -1 &&
      memCode.indexOf('appendChild(wc)') === -1 &&
      memCode.indexOf('appendChild(pc)') === -1 &&
      memCode.indexOf('_toggleWrite') === -1 &&
      memCode.indexOf('_expandWrite') === -1 &&
      /wc\.parentNode === panel && pc\.parentNode === panel/.test(fixCode),
      `borrowMachinery=${memCode.indexOf('memWriteHost') !== -1}`);

    // C4 — the write-lock is gone, from the engine, the markup and the i18n.
    check('C4 the write-lock is fully removed (engine, markup and locale maps)',
      fixCode.indexOf('myEntry') === -1 &&
      fixCode.indexOf('letterLocked') === -1 &&
      fixCode.indexOf('lockText') === -1 &&
      html.indexOf('letterLocked') === -1,
      `engine=${fixCode.indexOf('myEntry') === -1} html=${html.indexOf('letterLocked') === -1}`);

    /* C5 — her letter is signed by its author. Reading the reader's own
       signature was a real bug: it put Barry's name under Anđela's words.
       Scoped to _updatePartnerLetter's body on purpose. `_getLatestSignature
       (user)` is legitimate ELSEWHERE — _renderOwnSignature previews the
       reader's own signature, which is exactly what `user` means there. A
       file-wide absence check would have to condemn that too, so it would end up
       either wrong or vacuous. Slice from the empty-state branch to the catch. */
    const from = fixCode.indexOf('if (!partnerEntry||!partnerEntry.text)');
    const to = fixCode.indexOf("console.warn('[伴侣的信]");
    const letterBody = (from !== -1 && to > from) ? fixCode.slice(from, to) : '';
    check("C5 the partner's letter is signed for `partner`, never with the reader's own signature",
      letterBody.length > 0 &&
      /_getLatestSignature\(partner\)/.test(letterBody) &&
      /localStorage\.getItem\(partner\+'-signature-'/.test(letterBody) &&
      /\(partner==='barry'\?'Barry':'/.test(letterBody) &&
      !/_getLatestSignature\(user\)/.test(letterBody) &&
      !/user\+'-signature-'/.test(letterBody),
      `body=${letterBody.length}B partnerSig=${/_getLatestSignature\(partner\)/.test(letterBody)} userSig=${/_getLatestSignature\(user\)/.test(letterBody)}`);

    // C6 — the default landing date exists, rejects anything that is not a date
    // key, and refuses to land on a day that has not happened.
    check('C6 _latestDiaryDate rejects non-date keys and future dates',
      /window\._latestDiaryDate = _latestDiaryDate;/.test(fixSrc) &&
      /\^\\d\{4\}-\\d\{2\}-\\d\{2\}\$/.test(fixSrc) &&
      /if \(k > today\) return;/.test(fixSrc) &&
      /\(b && b\.text\) \|\| \(a && a\.text\)/.test(fixSrc),
      'guarded');

    // C7 — the mode is a pair of classes on the panel, and both halves of the
    // show/hide exist. A missing rule means both modes render at once.
    const hidesRoot = /#panel-diary\.mem-mode-diary #memRoot \{[\s\S]*?display: none;/.test(css);
    const hidesDiary = /#panel-diary\.mem-mode-story[\s\S]*?\{\s*\n\s*display: none;/.test(css);
    check('C7 both mode rules exist in the stylesheet (story hides the diary half, diary hides the story half)',
      hidesRoot && hidesDiary && /\.mem-mode-btn\.is-active/.test(css),
      `hideRoot=${hidesRoot} hideDiary=${hidesDiary}`);

    // C8 — the mode bar is OUTSIDE #memRoot. Inside, hiding #memRoot would hide
    // the switch itself and diary mode would be a one-way door.
    check('C8 #memModeBar is inserted before #memRoot, not inside it',
      /panel\.insertBefore\(bar, host\)/.test(memSrc),
      'sibling, not child');

    // C9 — no new data model, no new storage key. §三 still holds.
    const writes = ['localStorage.setItem', 'sessionStorage.setItem', 'indexedDB']
      .filter((k) => memCode.indexOf(k) !== -1);
    check('C9 the module still writes no storage of its own', writes.length === 0,
      `found=${writes.join(',') || 'none'}`);

    // C10 — the save path is untouched, so the sync protocol is untouched.
    check('C10 the save path is unchanged: saveDiaryEntry → shared-diary → pushAllSharedData',
      /localStorage\.setItem\('shared-diary'/.test(fixSrc) &&
      /pushAllSharedData\(\)/.test(fixSrc),
      'worker path intact');

    // C11 — the dist mirrors are hand-maintained; a missed copy ships the old
    // engine, and this round changed four bare paths.
    const drift = ['js/module-memories.js', 'js/fix-diary.js', 'css/v2.css', 'index.html', 'sw.js']
      .filter((f) => read(f) !== read('dist/' + f));
    check('C11 the changed runtime files have byte-identical dist mirrors',
      drift.length === 0, `drift=${drift.join(',') || 'none'}`);
  }

  // ── C12..C29 — behaviour, in a real browser ──
  const srv = await serve();
  const browser = await chromium.launch();

  const VIEWPORTS = [
    { tag: '320', w: 320, h: 800 },
    { tag: '768', w: 768, h: 1024 },
    { tag: '1440', w: 1440, h: 900 },
  ];

  /* Point 2 — the cap. Twelve seeded days, so the rendered reference count is
     six and provably not "however many happened to exist". */
  for (const vp of VIEWPORTS) {
    const { ctx, page, errs } = await boot(browser, vp);
    const m0 = await page.evaluate(MEASURE);

    // Point 1, first half — 回忆 opens on the story, with the diary half off.
    check(`C12 [${vp.tag}] 回忆 opens in story mode, with the diary half hidden`,
      m0.modeStory && m0.memRootShown && !m0.stripShown && !m0.writeCardShown &&
      !m0.letterShown &&
      m0.storyTabActive && !m0.diaryTabActive,
      `story=${m0.modeStory} root=${m0.memRootShown} strip=${m0.stripShown} write=${m0.writeCardShown} letter=${m0.letterShown}`);

    // §一 — the two containers the story half used to hand the diary's own
    // nodes to are gone from the markup entirely. Now that they are deleted,
    // "hidden" and "absent" look the same on screen; only existence tells them
    // apart, and only absence is what was asked for.
    check(`C12b [${vp.tag}] §一 the timeline and mailbox containers are gone from the DOM`,
      !m0.timelineSection && !m0.mailboxCard && !m0.diaryHead,
      `timeline=${m0.timelineSection} mailbox=${m0.mailboxCard} head=${m0.diaryHead}`);

    // Point 2, retargeted §二 — the story half holds exactly one content card
    // and no list at all. Twelve days are seeded, so a list that survived would
    // read 12 here, and the old cap that would have made it 6 is gone by C1.
    check(`C13 [${vp.tag}] §二 the story half is one card and no list`,
      m0.featCards === 1 && m0.refCount === 0 && m0.otherRows === 0 && m0.featText.length > 0,
      `cards=${m0.featCards} refs=${m0.refCount} rows=${m0.otherRows} of ${DIARY_DAYS} seeded days, text=${m0.featText.length}B`);

    await ctx.close();
    check(`C14 [${vp.tag}] no page errors during boot`, errs.length === 0,
      errs.slice(0, 2).join(' | ') || 'none');
  }

  /* Points 1, 3, 4 and 5 — walked in one boot, because they are the same walk:
     tap a reference, land on that date, then reach every other date through
     📖 日记's own navigation. */
  {
    const { ctx, page, errs } = await boot(browser, VIEWPORTS[0]);
    const days = seededDays();
    const newest = days[0];

    // Point 5 — the very first thing: her letter, before anything is written.
    const before = await page.evaluate(() => {
      window.__memories.setMode('diary');
      return { landDate: (document.getElementById('diaryWriteDate') || {}).textContent || '' };
    });
    await page.waitForTimeout(400);
    const letter = await page.evaluate(MEASURE);
    check("C15 point 5 — the partner's letter is readable on a day the reader never wrote",
      letter.letterShown && letter.letterText.indexOf(HER_SENTINEL) !== -1 && !letter.hasLock,
      `visible=${letter.letterShown} hasLock=${letter.hasLock} text="${letter.letterText.slice(0, 40)}"`);

    // Point 4, first half — the mode switch landed on the newest day that has
    // content, not on today (today is empty in this fixture).
    check('C16 the default landing date is the most recent day that actually has content',
      before.landDate.indexOf(newest) !== -1 && letter.writeDate.indexOf(newest) !== -1,
      `landed="${letter.writeDate}" expected to contain ${newest}`);

    // C17 — 「今天」 exists, is a real 44px target, and goes back to today.
    const todayKey = dayKeyAgo(0);
    await page.click('#diaryTodayBtn');
    await page.waitForTimeout(400);
    const afterToday = await page.evaluate(MEASURE);
    check('C17 the 「今天」 button is a 44px target and returns to today',
      letter.todayBtnShown && letter.todayBtnH >= 44 && afterToday.writeDate.indexOf(todayKey) !== -1,
      `shown=${letter.todayBtnShown} h=${letter.todayBtnH} date="${afterToday.writeDate}"`);

    /* Point 3, retargeted §六 — the reference rows that used to carry a date and
       land on it are gone, and the story half's remaining door into 📖 日记 is
       「📖 看全部日记」. The round trip is worth as much as the door: coming back
       to story mode must rebuild the single card, which is what returning to
       the reference list used to prove. */
    await page.click('#memModeStory');
    await page.waitForTimeout(300);
    const back = await page.evaluate(MEASURE);
    check('C18 returning to story mode rebuilds the card and hides the diary half again',
      back.modeStory && back.memRootShown && back.featCards === 1 &&
      !back.stripShown && !back.writeCardShown,
      `mode=${back.modeStory} cards=${back.featCards} strip=${back.stripShown}`);

    await page.click('#memRoot .mem-feat-all');
    await page.waitForTimeout(500);
    const landed = await page.evaluate(MEASURE);
    /* Deliberately not asserting WHICH date: §六 hands the date to 📖 日记's own
       navigation, and this block has just sent it to today via the 「今天」
       button, so the door is only obliged to land on a real date. C20 walks
       every seeded day from here. */
    check('C19 point 3 — 「📖 看全部日记」 enters 📖 日记, editor and all',
      landed.modeDiary && !landed.memRootShown && landed.stripShown &&
      landed.writeCardShown && landed.hasTextarea &&
      /\d{4}-\d{2}-\d{2}/.test(landed.writeDate),
      `diaryMode=${landed.modeDiary} strip=${landed.stripShown} write=${landed.writeCardShown} date="${landed.writeDate}"`);

    // Point 1 — every seeded day is reachable, including the ones the 6-cap
    // dropped from the timeline, and each one loads its own text.
    const walk = [];
    for (const k of days) {
      const got = await page.evaluate((key) => {
        window._onDateBtnClick(key);
        return {
          writeDate: (document.getElementById('diaryWriteDate') || {}).textContent || '',
          text: (document.getElementById('diaryTextarea') || {}).value || '',
          // Whose day is it? On the andjela-only day the textarea is Barry's and
          // is legitimately empty — that is the fixture C15 depends on.
          partnerLetter: ((document.getElementById('letterPartnerContent') || {}).textContent || ''),
        };
      }, k);
      await page.waitForTimeout(60);
      walk.push({
        k,
        landed: got.writeDate.indexOf(k) !== -1,
        // Every day must load its own writer's text; the newest day's writer is
        // andjela, so it is her letter that must be populated there.
        content: k === newest
          ? got.partnerLetter.indexOf(HER_SENTINEL) !== -1
          : got.text.length > 0,
      });
    }
    const unreachable = walk.filter((w) => !(w.landed && w.content)).map((w) => w.k);
    /* This is the check that survives §一 intact, and it is the one that
       matters: the story half may show a single card, but nothing may become
       unreachable. The old wording counted the six days the cap dropped from
       the timeline; the cap is gone, the twelve days are not. */
    check('C20 point 1 — all twelve seeded diary days are still reachable through 📖 日记',
      unreachable.length === 0 && walk.length === DIARY_DAYS,
      `reached=${walk.length - unreachable.length}/${DIARY_DAYS} unreachable=${unreachable.join(',') || 'none'}`);

    // Point 4, second half — the trim really is display only. The module still
    // hands the full list to anyone who asks, and the featured card is a pick
    // out of that same list rather than a second, narrower read of storage.
    const counts = await page.evaluate(() => {
      /* All three take (items, now) — and `now` is not optional in practice:
         the pool's age window is `now - it.ts`, so an undefined now makes every
         comparison NaN and the pool reads 0 rather than erroring. Passing one
         clock through all three is what makes the last clause meaningful. */
      const now = Date.now();
      const all = window.__memories.items(now);
      const pool = window.__memories.pool(all, now);
      const feat = window.__memories.featured(all, now);
      return {
        total: all.length,
        diary: all.filter((i) => i.kind === 'diary').length,
        inPool: pool.length,
        featKind: feat && feat.kind,
        featIsPooled: !!feat && pool.indexOf(feat) !== -1,
      };
    });
    check('C21 point 4 — the story trim does not limit the data: all 12 diary days still reachable',
      counts.diary === DIARY_DAYS && counts.total > counts.diary &&
      counts.inPool >= 1 && counts.featIsPooled &&
      ['diary', 'grat', 'km'].indexOf(counts.featKind) !== -1,
      `items=${counts.total} diary=${counts.diary} pool=${counts.inPool} feat=${counts.featKind} pooled=${counts.featIsPooled}`);

    // …and 📖 日记 itself is not filtered at all: it keeps its own navigation.
    const stripButtons = await page.evaluate(() => {
      window.__memories.setMode('diary');
      return document.querySelectorAll('#diaryDateStrip .diary-date-btn').length;
    });
    check('C22 point 4 — 📖 日记 keeps its own navigation (the ±7-day date strip)',
      stripButtons === 7, `stripButtons=${stripButtons}`);

    // Point 6 — text being edited survives a story re-render. #memRoot's
    // innerHTML is rebuilt on every activation (twice, via the 1200ms second
    // pass), and the write card is not in it, so nothing should touch it.
    await page.evaluate((t) => {
      const ta = document.getElementById('diaryTextarea');
      ta.value = t;
      ta.focus();
    }, TYPED);
    await page.evaluate(() => { window.renderMemories(); window.initSharedDiaryTab(); });
    await page.waitForTimeout(1800);
    const survived = await page.evaluate((t) => {
      const ta = document.getElementById('diaryTextarea');
      return {
        exists: !!ta,
        intact: !!ta && ta.value === t,
        writeCardPresent: !!document.getElementById('diaryWriteCard'),
        diaryMode: document.getElementById('panel-diary').classList.contains('mem-mode-diary'),
      };
    }, TYPED);
    check('C23 point 6 — unsaved text survives a story re-render and the 1200ms second pass',
      survived.exists && survived.intact && survived.writeCardPresent && survived.diaryMode,
      `exists=${survived.exists} intact=${survived.intact} card=${survived.writeCardPresent} mode=${survived.diaryMode}`);

    /* Leaving the tab and coming back is the path that tore down and rebuilt
       every borrowed node in 2B.9. Nothing is borrowed now, so the editor must
       simply still be there, still take input, and still be in diary mode. */
    await page.click('.tab[data-panel="dashboard"]');
    await page.waitForTimeout(500);
    await page.click('.tab[data-panel="diary"]');
    await page.waitForTimeout(1800);
    const returned = await page.evaluate(() => {
      const ta = document.getElementById('diaryTextarea');
      const panel = document.getElementById('panel-diary');
      if (!ta) return { exists: false };
      ta.value = '';
      ta.focus();
      ta.value = 'x';
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      const took = ta.value === 'x';
      ta.value = '';
      return {
        exists: true, took,
        card: !!document.getElementById('diaryWriteCard'),
        mode: panel.classList.contains('mem-mode-diary'),
      };
    });
    check('C23b after a tab away and back the editor still exists, still takes input, and the mode is remembered',
      returned.exists && returned.took && returned.card && returned.mode,
      `exists=${returned.exists} took=${returned.took} card=${returned.card} mode=${returned.mode}`);

    /* The letter-paper row itself: the thing the no-move design exists to
       protect. If the guard had gone false, #diaryWriteCard and
       #letterPartnerCard would no longer share a .lpc-row — and nothing else in
       this file would notice. */
    const row = await page.evaluate(() => {
      const wc = document.getElementById('diaryWriteCard');
      const pc = document.getElementById('letterPartnerCard');
      const n = (el) => (el ? (el.className || '').split(' ')[0] : null);
      return {
        writeParent: n(wc && wc.parentNode),
        letterParent: n(pc && pc.parentNode),
        sameParent: !!(wc && pc && wc.parentNode === pc.parentNode),
      };
    });
    check('C24 the letter-paper row still exists and still holds both cards',
      row.writeParent === 'lpc-row' && row.letterParent === 'lpc-row' && row.sameParent,
      `write=${row.writeParent} letter=${row.letterParent}`);

    check('C25 no page errors across the mode walk', errs.length === 0,
      errs.slice(0, 2).join(' | ') || 'none');
    await ctx.close();
  }

  /* Point 7 — three languages. The mode bar's own copy is the only new text
     this round added, so it is the only text that can be missing a locale. */
  {
    const { ctx, page, errs } = await boot(browser, VIEWPORTS[1], { lang: 'zh-CN' });
    const EXPECT = {
      'zh-CN': { story: '我们的故事', diary: '日记', today: '今天' },
      sr: { story: 'Naša priča', diary: 'Dnevnik', today: 'Danas' },
      en: { story: 'Our Story', diary: 'Diary', today: 'Today' },
    };
    for (const L of ['zh-CN', 'sr', 'en']) {
      /* The mode bar reads window.lang live, but the 「今天」 button is repainted
         by _updateDiaryLang, which the app triggers on a language switch via
         initSharedDiaryTab (300ms deferred). Drive the real path, not a
         hand-set string, or this would test the test. */
      const got = await page.evaluate((l) => {
        window.lang = l;
        window.renderMemories();
        if (typeof window.initSharedDiaryTab === 'function') window.initSharedDiaryTab();
        return true;
      }, L);
      await page.waitForTimeout(700);
      const got2 = await page.evaluate(() => {
        const s = document.getElementById('memModeStory');
        const d = document.getElementById('memModeDiary');
        const t = document.getElementById('diaryTodayBtn');
        return {
          story: s ? s.textContent.trim() : '',
          diary: d ? d.textContent.trim() : '',
          today: t ? t.textContent.trim() : '',
        };
      });
      check(`C26 [${L}] the mode bar and the 「今天」 button render that locale's own copy`,
        got2.story === EXPECT[L].story &&
        got2.diary.indexOf(EXPECT[L].diary) !== -1 &&
        got2.today.indexOf(EXPECT[L].today) !== -1,
        `story="${got2.story}" diary="${got2.diary}" today="${got2.today}"`);
    }
    check('C27 no page errors across the locale switches', errs.length === 0,
      errs.slice(0, 2).join(' | ') || 'none');
    await ctx.close();
  }

  /* Point 7 — light and dark. Both must render the mode bar and both modes;
     the colours are tokens, so a theme that fails here means a hardcoded value
     crept into the new rules. */
  for (const theme of ['light', 'dark']) {
    const { ctx, page, errs } = await boot(browser, VIEWPORTS[0], { theme });
    const story = await page.evaluate(MEASURE);
    await page.click('#memModeDiary');
    await page.waitForTimeout(400);
    const diary = await page.evaluate(MEASURE);
    check(`C28 [${theme}] both modes render in ${theme}, with no horizontal overflow`,
      story.theme === theme && story.memRootShown && !story.stripShown &&
      diary.memRootShown === false && diary.stripShown && diary.writeCardShown &&
      story.scrollWidth <= story.clientWidth && diary.scrollWidth <= diary.clientWidth,
      `theme=${story.theme} story=${story.memRootShown}/${story.stripShown} diary=${diary.memRootShown}/${diary.stripShown} overflow=${story.scrollWidth - story.clientWidth}/${diary.scrollWidth - diary.clientWidth}`);
    check(`C29 [${theme}] no page errors`, errs.length === 0,
      errs.slice(0, 2).join(' | ') || 'none');
    await ctx.close();
  }

  await browser.close();
  srv.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    console.log('failed: ' + failed.map((r) => r.name).join(', '));
    process.exitCode = 1;
  }
})();
