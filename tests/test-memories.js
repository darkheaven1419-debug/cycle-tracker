/**
 * Phase 1C — Memories / Our Story (`js/module-memories.js`).
 *
 * What this suite is actually protecting. §三 of the phase brief forbids a
 * second data model, so the module stores nothing: every row is derived at
 * render time from keys the app already had. That makes the interesting
 * failures silent ones — a memory that quietly gets a fabricated date, a second
 * copy of content written into localStorage, a Featured pick that differs
 * between the two phones. None of those break the page, so none of them would
 * be caught by looking at it. They are asserted here instead.
 *
 * Phase 2E deleted the timeline, the diary reference rows and the song card, so
 * 「我们的故事」 is now one card: 「✦ 今天想起」 picks a single real entry, 「再看看
 * 一个」 steps through that day's fixed order, 「📖 看全部日记」 hands the reader to
 * 📖 日记. Browsing a history is Diary's job now; Memories stopped duplicating it.
 * The assertions that pinned the timeline are gone, replaced by the properties
 * the new shape actually has to hold: exactly one card (never a long list), a
 * pick that is a pure function of the calendar plus the entry ids and does not
 * repeat within a week, and a step-through order that is stable for the day and
 * cannot show the same entry twice running.
 *
 * Two halves:
 *   1. static — read the sources and prove the invariants that no rendering can
 *      demonstrate (locale parity, reduced-motion coverage, the absence of any
 *      write path, the sync contract still at 19 fields, and the absence of the
 *      renderers this phase deleted).
 *   2. browser — seed real localStorage shapes and assert what the card shows,
 *      with the timestamps the data actually has.
 *
 * Run: node tests/test-memories.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8846;
const URL = `http://localhost:${PORT}/index.html`;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

const MEM_SRC = fs.readFileSync(path.join(ROOT, 'js/module-memories.js'), 'utf8');
const V2_CSS = fs.readFileSync(path.join(ROOT, 'css/v2.css'), 'utf8');
const SYNC_SRC = fs.readFileSync(path.join(ROOT, 'js/sync.js'), 'utf8');

/* This repo documents deletions in comments, so a deleted identifier survives in
   prose ("Phase 2E — _rowHtml 与 _timelineHtml 在这里，已删除"). Any assertion
   that something is ABSENT must read the code, not the explanation of why it is
   gone — otherwise the check passes on the comment that says it was removed. */
const MEM_CODE = MEM_SRC
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '');

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

const DAY = 864e5;
const TODAY = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
/** Days-ago expressed as a local YYYY-MM-DD key, so the fixture is stable
    regardless of when the suite runs. */
function dayKeyAgo(n) {
  const d = new Date(TODAY.getTime() - n * DAY);
  const p = (x) => (x < 10 ? '0' : '') + x;
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
const AGO = (n) => Date.now() - n * DAY;

// ══════════════════════════════════════════════════════════════════════════
// 1. STATIC — invariants no rendering can show
// ══════════════════════════════════════════════════════════════════════════

/* ── locale parity ─────────────────────────────────────────────────────── */
{
  const start = MEM_SRC.indexOf('var MEM_I18N = {');
  const end = MEM_SRC.indexOf('\n  };', start);
  const table = MEM_SRC.slice(start, end);
  const marks = ["\n    sr: {", "\n    'zh-CN': {", "\n    en: {"];
  const at = marks.map((m) => table.indexOf(m));
  check('M1 the three locale blocks are all present and in order',
    at.every((i) => i !== -1) && at[0] < at[1] && at[1] < at[2],
    `offsets=${at.join(',')}`);

  const keysOf = (from, to) => {
    const body = table.slice(from, to === -1 ? table.length : to);
    const out = [];
    const re = /(?:^|\n)\s{6}(?:'([^']+)'|([A-Za-z_$][\w$]*))\s*:/g;
    let m;
    while ((m = re.exec(body))) out.push(m[1] || m[2]);
    return out.sort();
  };
  const sr = keysOf(at[0], at[1]);
  const zh = keysOf(at[1], at[2]);
  const en = keysOf(at[2], -1);

  const same = (a, b) => a.length === b.length && a.every((k, i) => k === b[i]);
  check('M2 sr / zh-CN / en carry the identical key set',
    sr.length > 0 && same(sr, zh) && same(sr, en),
    `sr=${sr.length} zh=${zh.length} en=${en.length} ` +
    `onlySr=${sr.filter((k) => zh.indexOf(k) === -1).join(',') || 'none'} ` +
    `onlyZh=${zh.filter((k) => sr.indexOf(k) === -1).join(',') || 'none'}`);

  /* A parity check alone would pass on three empty-ish tables; the phase's own
     wording is the thing §十一 and §四 pin, so assert it is really there.

     Read from MEM_CODE, not MEM_SRC: a plain absence test over the raw source
     reads the comments too, and this repo's convention is to explain deletions in
     prose. Phase 2E's own header says "Nothing is stored and no data is touched"
     — which is a sentence about the design, and tripped this check the moment it
     was written. The rule being asserted is about the STRINGS THE MODULE SHIPS. */
  check('M3 §十一 empty-state wording is the "not much here yet" phrasing, not "no data"',
    /Ovde još nema mnogo priča\./.test(MEM_CODE) &&
    /这里还没有很多故事。/.test(MEM_CODE) &&
    /There aren't many stories here yet\./.test(MEM_CODE) &&
    !/没有数据|Nema podataka|No data/i.test(MEM_CODE),
    'empty strings present, no "no data" phrasing');
}

/* ── §十: the milestone vocabulary comes from the central table ─────────── */
{
  const i18n = fs.readFileSync(path.join(ROOT, 'js/i18n.js'), 'utf8');
  check('M4 §十 milestones read loveCounterMet / loveCounterTogether, never a re-authored string',
    /_t\('loveCounterMet'/.test(MEM_SRC) &&
    /_t\('loveCounterTogether'/.test(MEM_SRC) &&
    /loveCounterMet:"相识 \{n\} 天"/.test(i18n) &&
    /loveCounterTogether:"相恋 \{n\} 天"/.test(i18n),
    'module reads the central keys; central table still says 相识/相恋');
}

/* ── reduced-motion coverage (§四 非常轻的动效) ─────────────────────────── */
{
  const block = V2_CSS.slice(V2_CSS.indexOf('@media (prefers-reduced-motion: reduce)'));
  const body = block.slice(0, block.indexOf('\n}'));
  const animated = ['.mem-feat', '.dash-story-line'];
  const missing = animated.filter((s) => body.indexOf(s) === -1);
  check('M5 every selector this phase animates is in the reduced-motion reset',
    missing.length === 0, `missing=${missing.join(',') || 'none'}`);
  check('M6 that reset actually kills animation and transition',
    /animation:\s*none\s*!important/.test(body) && /transition:\s*none\s*!important/.test(body),
    'animation/transition reset present');
}

/* ── §六 the Home line's own trailer clearance ─────────────────────────────
   The measured proof is M43; this is the intent behind it, stated where a
   reader of the stylesheet's rules will look. Scoped to narrow screens on
   purpose: at ≥768 the scroll margin is already ~96px, so a wider rule would
   only open dead space inside the links card. */
{
  const m = V2_CSS.match(/@media \(max-width: 480px\) \{\s*\.dash-story-line \{[^}]*margin-bottom:\s*32px/);
  check('M6b the Home line carries its own narrow-screen trailer clearance',
    !!m, m ? 'scoped rule present' : 'rule missing — the line will sit under the nav at 320');
}

/* ── §三/§七: nothing is written, nothing is duplicated ────────────────── */
{
  const writes = MEM_SRC.match(/\.(setItem|removeItem)\s*\(/g) || [];
  check('M7 the module has no storage write path at all', writes.length === 0,
    `writes=${writes.length}`);

  /* Phase 2E §一 — the timeline is deleted, and this pins the deletion at the
     level that matters: the renderers are gone from the CODE, and no second
     selection path took their place. The pick is computed from the full list
     once, in _renderFeatured, and there is exactly one place that turns an item
     into markup. Asserting only the rendered page could not tell "one card" from
     "one card above a list that happens to be empty today". */
  check('M7b §一 the timeline renderers are gone, not merely unreachable',
    !/_timelineHtml|_rowHtml|_capDiaryRefs|_songHtml|_relDay\s*\(/.test(MEM_CODE) &&
    !/TIMELINE_CAP|DIARY_REF_CAP|CLIP_ROW|CLIP_REF|REL_DAYS/.test(MEM_CODE),
    'no timeline / ref-cap / relative-day helper left in the code');
  check('M7c the pick is computed once, from the full list',
    /function _renderFeatured\(\)/.test(MEM_CODE) &&
    /_featuredPool\(_items\(now\),\s*now\)/.test(MEM_CODE) &&
    (MEM_CODE.match(/= _featuredHtml\(/g) || []).length === 1,
    'one renderer, one pool, one call site');
  /* §五 — the card's date line reads as "how long ago", from the strings the
     module already had. This is the only dating the card does: the entry's own
     real timestamp, never a re-authored one. */
  check('M7d the card dates itself with _ago, off the entry\'s real timestamp',
    /_esc\(_ago\(it\.ts\)\)/.test(MEM_CODE) &&
    /function _ago\(ts\)/.test(MEM_CODE) &&
    /var d = Math\.floor\(\(Date\.now\(\) - ts\) \/ 864e5\)/.test(MEM_CODE),
    'floor-days since the real ts, through the locale table');

  /* §十三: no new memories field. The contract is the same 19 names
     tests/test-phase2c-state.js pins in COLLECT_KEYS — 17 pinned by Phase 2C,
     + dailyQ (Phase 1B), + anniversaries (Phase 1.9 §2.2, the shared canonical
     相识/相恋 dates). Match the object literal's
     own indentation (6 spaces) so the nested songs/checkins pairs, which sit at
     8, cannot be mistaken for top-level fields. */
  const COLLECT_KEYS = [
    'diary', 'cycleInfo', 'symptoms', 'gratitude', 'gratitudeEcho', 'dailyQ', 'hug',
    'songs', 'sleep', 'checkins', 'learningProgress', 'learningComments',
    'learningPoints', 'voiceData', 'sunCounter', 'knowme', 'calendarMarkers',
    'anniversaries', 'updated',
  ];
  const collectBody = SYNC_SRC.slice(SYNC_SRC.indexOf('function collect()'));
  const collect = collectBody.slice(0, collectBody.indexOf('\n  }'));
  const names = (collect.match(/\n {6}([A-Za-z_$][\w$]*)\s*:/g) || [])
    .map((s) => s.trim().replace(/:$/, ''));
  const gone = COLLECT_KEYS.filter((k) => names.indexOf(k) === -1);
  const added = names.filter((k) => COLLECT_KEYS.indexOf(k) === -1);
  check('M8 §十三 the sync contract carries the reviewed 19 fields (18 + anniversaries)',
    names.length === 19 && gone.length === 0 && added.length === 0,
    `n=${names.length} gone=${gone.join(',') || 'none'} added=${added.join(',') || 'none'}`);
  check('M9 sync.js gained no memories key',
    !/memor|ourStory|featured/i.test(SYNC_SRC), 'no memories vocabulary in sync.js');
}

/* ── §十三 red lines: no direct GitHub channel ─────────────────────────── */
{
  check('M10 no api.github.com anywhere in the new module',
    MEM_SRC.indexOf('api.github.com') === -1, 'absent');
  check('M11 no gh-token read in the new module',
    MEM_SRC.indexOf('gh-token') === -1, 'absent');
}

// ══════════════════════════════════════════════════════════════════════════
// 2. BROWSER
// ══════════════════════════════════════════════════════════════════════════

const RICH = {
  'cycle-lang': 'zh-CN',
  'ct-app-key': 'memories-test-key-not-a-real-one',
  'cycle-ann-met': '2026-03-19',
  'cycle-ann-love': '2026-05-07',

  /* §一: the diary carries three coexisting field generations. The first slot
     has NO `time` at all — 13 of 81 live slots are like that — and the fourth
     carries a `time` that contradicts its key. Both must date off the key. */
  'shared-diary': {
    [dayKeyAgo(35)]: { andjela: { text: 'Šetnja pored reke', mood: 'mirno' } },
    [dayKeyAgo(40)]: { barry: { happy: 'Bili smo na kafi', uncomf: 'glavobolja' } },
    [dayKeyAgo(45)]: { andjela: { thanks: 'Hvala za cveće', wish: 'Želim više ovakvih dana' } },
    [dayKeyAgo(50)]: { barry: { text: 'Kasno smo legli', time: 1 } },
  },
  'shared-gratitude': [
    { text: 'Hvala ti što si tu', from: 'andjela', time: AGO(30) },
    { text: 'Hvala za čaj', from: 'barry', time: AGO(31) },
  ],
  'shared-daily-q': [
    { qKey: 'q1', from: 'andjela', answer: 'Zato što me nasmeješ', time: AGO(25) },
  ],
  'shared-knowme': {
    [dayKeyAgo(20)]: { barry: { answer: 'Beograd', time: AGO(20) } },
  },
  /* §七: {title, note} and nothing else — no timestamp, and no card any more. The
     two keys stay in the fixture precisely so the suite can prove the data is
     still there after the display layer stopped reading it. */
  'shared-song-barry': { title: 'Naša pesma', note: 'uz kafu' },
  'shared-song-andjela': { title: 'Zvuci Beograda', note: '' },
};

/* The fixture for the card's own date line, one context per locale. Exactly ONE
   entry sits inside Featured's 7..400-day window — aged 10 days, so the label is
   the day-count branch of _ago and no month boundary is involved — which makes
   the pool a single item and the 4-day-old and 900-day-old entries provably
   ineligible. A pool of one is deliberate twice over: the card is deterministic
   without knowing the date hash, and 「再看看一个」 must be absent (there is no
   second candidate, and a button that does nothing is worse than no button). */
const AGED = {
  'ct-app-key': 'memories-test-key-not-a-real-one',
  'cycle-ann-met': '2026-03-19',
  'cycle-ann-love': '2026-05-07',
  'shared-diary': {
    [dayKeyAgo(10)]: { andjela: { text: 'Šetnja pored reke, deset dana kasnije' } },
    [dayKeyAgo(4)]: { barry: { text: 'Pre četiri dana' } },
    [dayKeyAgo(900)]: { barry: { text: 'Odavno, ali zapisano' } },
  },
};

(async () => {
  const srv = await serve();
  const browser = await chromium.launch();

  async function open(seed, lang, vp) {
    const ctx = await browser.newContext({
      viewport: vp || { width: 390, height: 844 },
      hasTouch: true, isMobile: true, deviceScaleFactor: 2,
      serviceWorkers: 'block',
    });
    /* AuthModule.init() hides #loginOverlay only when BOTH are true: the
       session flag and a stored profile. Without the profile it deletes the
       profile key and re-shows the overlay, which then swallows every click. */
    const s = Object.assign({ 'cycle-active-profile': 'barry' }, seed);
    const L = lang || 'zh-CN';
    /* loadPerProfileSettings() reads the profile-scoped key, and re-defaults it
       unless `-chosen` is set — so both are needed for a deliberate locale. */
    s['cycle-lang'] = L;
    s['cycle-lang-barry'] = L;
    /* profileKey('cycle-lang-chosen'), i.e. base + '-' + activeProfile. Without
       it the cleanse in loadPerProfileSettings() nulls a Serbian pick for Barry
       and falls back to his zh-CN default. */
    s['cycle-lang-chosen-barry'] = '1';
    s['cycle-lang-chosen'] = '1';
    await ctx.addInitScript((arg) => {
      try {
        sessionStorage.setItem('cycle-logged-in', '1');
        Object.keys(arg.seed).forEach((k) => {
          const v = arg.seed[k];
          localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
        });
      } catch (e) {}
    }, { seed: s });

    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message.split('\n')[0]));
    await page.route('**/*', (route) => {
      const u = route.request().url();
      if (u.indexOf('api.github.com') !== -1) return route.abort();
      if (u.includes('open-meteo') || u.includes('translate.google') ||
          u.includes('mymemory') || u.includes('argosopentech')) return route.abort();
      if (u.includes('workers.dev')) {
        const o = route.request().headers()['origin'];
        return route.fulfill({
          status: 200, contentType: 'application/json',
          headers: o ? { 'Access-Control-Allow-Origin': o, Vary: 'Origin' } : {},
          body: JSON.stringify({ sha: null, state: {} }),
        });
      }
      return route.continue();
    });

    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.tab[data-panel="diary"]', { timeout: 15000 });
    await page.click('.tab[data-panel="diary"]');
    await page.waitForTimeout(1200);
    return { ctx, page, errs };
  }

  /* ── M12..M29: the one card, and the pool behind it ───────────────────────
     Phase 2E §一 replaced "what reaches the timeline" with "what reaches the
     card". The data-level claims the old M12..M19 made are unchanged — the items
     are still derived from the same keys with the same timestamps — so they are
     kept and only re-labelled; what is new is that only three kinds may be
     candidates at all, that the card is the ONLY thing the story renders, and
     that the song is neither a memory nor a card any more. */
  {
    const { ctx, page, errs } = await open(RICH);
    const d = await page.evaluate(() => {
      const items = window.__memories.items(Date.now());
      const by = (k) => items.filter((i) => i.kind === k);
      const diary = by('diary');
      const midnight = (n) => { const x = new Date(); x.setHours(0, 0, 0, 0); return x.getTime() - n * 864e5; };
      const p = (v) => (v < 10 ? '0' : '') + v;
      const dk = (n) => {
        const t = new Date(midnight(n));
        return t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate());
      };
      const one = (id) => items.filter((i) => i.id === id)[0] || null;
      const root = document.getElementById('memRoot');
      const panel = document.getElementById('panel-diary');
      const kids = Array.prototype.slice.call(root ? root.children : []);
      const txt = (sel, scope) => ((scope || document).querySelector(sel) || {}).textContent || '';
      const ls = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
      const pool = window.__memories.pool(items, Date.now());
      return {
        keys: items.map((i) => i.id),
        diaryN: diary.length,
        grat: by('grat').length,
        dq: by('dq').length,
        km: by('km').length,
        mile: by('milestone').map((m) => ({ id: m.id, text: m.text })),

        /* §一: dated off the key, not off `time`. */
        noTime: one('diary:' + dk(35) + ':andjela'),
        noTimeTs: (one('diary:' + dk(35) + ':andjela') || {}).ts,
        expect35: midnight(35),
        badTime: (one('diary:' + dk(50) + ':barry') || {}).ts,
        expect50: midnight(50),

        /* §二: physical discomfort stays out of the story. */
        uncomfLeaked: /glavobolja/.test(JSON.stringify(items)),
        legacyJoined: (one('diary:' + dk(40) + ':barry') || {}).text || '',
        wishJoined: (one('diary:' + dk(45) + ':andjela') || {}).text || '',

        /* §七: the song is not a memory and no longer a card either — but the
           data it came from must be exactly where it was. */
        songInItems: items.some((i) => /Naša pesma|Zvuci Beograda/.test(i.text)),
        songCard: !!document.getElementById('memSong'),
        songData: [ls('shared-song-barry'), ls('shared-song-andjela')],

        /* §三: which kinds may be candidates, and which may not. */
        poolKinds: [...new Set(pool.map((i) => i.kind))].sort(),
        poolHasDq: pool.some((i) => i.kind === 'dq'),
        poolHasMile: pool.some((i) => i.kind === 'milestone'),
        poolIds: pool.map((i) => i.id),

        /* §四: structure and order. Phase 2C put #memModeBar in front of
           #memRoot, so "the story leads" is now two nodes deep. */
        modeBarFirst: !!(panel && panel.firstElementChild &&
          panel.firstElementChild.id === 'memModeBar'),
        rootSecond: !!(root && panel && root.previousElementSibling &&
          root.previousElementSibling.id === 'memModeBar'),
        hasHead: !!document.querySelector('#memRoot .dch-names'),
        headText: (document.querySelector('#memRoot .dch-names') || {}).textContent || '',
        title: (document.querySelector('#memRoot .mem-sub') || {}).textContent || '',

        /* §一/§二: exactly one card, and nothing list-shaped under it. */
        hasFeatured: !!document.getElementById('memFeatured'),
        featuredId: (function () {
          const f = window.__memories.featured(items, Date.now());
          return f ? f.id : null;
        })(),
        featText: txt('#memFeatured .mem-feat-text').trim(),
        featKicker: txt('#memFeatured .mem-feat-kicker').trim(),
        featKind: txt('#memFeatured .mem-feat-kind').trim(),
        featActs: [...document.querySelectorAll('#memFeatured button')].map((b) => b.textContent.trim()),
        /* What the kind line should say, derived from whichever entry the date
           hash happened to pick — the pick is not fixed per run, so asserting a
           literal "日记" here would only pass on the days it happens to be one. */
        featKindOf: (function () {
          const f = window.__memories.featured(items, Date.now());
          if (!f) return null;
          return {
            kind: f.kind,
            want: { diary: '日记', grat: '感恩', km: '我了解的你' }[f.kind] || null,
            from: f.from === 'barry' ? 'Barry' : 'Anđela',
            age: window.__memories.ago(f.ts),
          };
        })(),
        hasMoreBtn: !!document.querySelector('#memFeatured .mem-feat-more'),
        hasAllBtn: !!document.querySelector('#memFeatured .mem-feat-all'),
        cards: document.querySelectorAll('#memRoot .card').length,
        listBits: document.querySelectorAll(
          '#memRoot .mem-timeline, #memRoot .mem-month, #memRoot .mem-row,' +
          '#memRoot .mem-month-label, #memRoot #memTimeline').length,
        diaryHead: !!document.querySelector('#memRoot .mem-diary-head, #memRoot #memDiaryHead'),
        featuredIdx: kids.findIndex((k) => k.id === 'memFeaturedBox'),
        anchorIdx: kids.findIndex((k) => k.id === 'memAnchor'),
        dqText: (by('dq')[0] || {}).text || '',
      };
    });

    check('M12 diary entries are derived off their YYYY-MM-DD key',
      d.diaryN === 4 && d.keys.indexOf('diary:' + dayKeyAgo(35) + ':andjela') !== -1,
      `diary=${d.diaryN}`);
    check('M13 a diary slot with no `time` still lands on its own date',
      !!d.noTime && d.noTimeTs === d.expect35,
      `ts=${d.noTimeTs} expected=${d.expect35}`);
    check('M14 a contradictory `time` is ignored — the key wins',
      d.badTime === d.expect50, `ts=${d.badTime} expected=${d.expect50}`);
    check('M15 gratitude is read', d.grat === 2, `grat=${d.grat}`);
    check('M16 Know Me is read', d.km === 1, `km=${d.km}`);

    /* §三 — the daily question is deliberately NOT a candidate: its answer has no
       question attached, so shown alone it is a fragment. It is still read (the
       data is untouched) which is what makes this a filter and not a deletion. */
    check('M17 §三 the daily question is still read but never enters the pool',
      d.dq === 1 && /nasmeješ/.test(d.dqText) && !d.poolHasDq && d.poolKinds.indexOf('dq') === -1,
      `dq=${d.dq} inPool=${d.poolHasDq}`);

    check('M18 §二 physical discomfort is not part of the story',
      !d.uncomfLeaked && /kafi/.test(d.legacyJoined),
      `leaked=${d.uncomfLeaked} legacy="${d.legacyJoined}"`);
    check('M19 legacy thanks/wish field generation still renders',
      /cveće/.test(d.wishJoined) && /ovakvih/.test(d.wishJoined),
      `joined="${d.wishJoined}"`);

    /* §七 — the song card is deleted from the display layer and the song itself
       is not a memory; the two storage keys are byte-for-byte where they were. */
    check('M20 §七 the song is not a memory and has no card, but its data is untouched',
      !d.songInItems && !d.songCard && d.songData[0] !== null && d.songData[1] !== null &&
      /Naša pesma/.test(d.songData[0]) && /Zvuci Beograda/.test(d.songData[1]),
      `inItems=${d.songInItems} card=${d.songCard} data=${JSON.stringify(d.songData)}`);
    check('M21 §三 the pool holds diary, gratitude and know-me — and nothing else',
      d.poolKinds.join(',') === 'diary,grat,km',
      `kinds=${JSON.stringify(d.poolKinds)} n=${d.poolIds.length}`);

    check('M22 §十 annDateMet produces the 相识 milestone from the central table',
      d.mile.some((m) => m.id === 'mile:met' && /^相识 \d+ 天$/.test(m.text)),
      JSON.stringify(d.mile));
    check('M23 §十 annDateLove produces the 相恋 milestone from the central table',
      d.mile.some((m) => m.id === 'mile:love' && /^相恋 \d+ 天$/.test(m.text)),
      JSON.stringify(d.mile));
    /* §三 — milestones are dates, not moments, so they live in the anchor only.
       Being derived is what M22/M23 prove; this proves they never became cards. */
    check('M23b §三 milestones are anchored, never candidates',
      !d.poolHasMile && d.poolKinds.indexOf('milestone') === -1,
      `inPool=${d.poolHasMile}`);

    /* Phase 2C moved this by one node: #memModeBar is inserted immediately
       before #memRoot, so the story block is no longer the panel's first child —
       it is the first child of the *story half* of the panel. What §四 was really
       protecting (the story leads, the diary furniture follows it) still holds,
       so the claim is restated as "the mode bar is first, and #memRoot is
       directly after it" rather than dropped. */
    check('M24 §四 the mode bar is #panel-diary\'s first child and the story block follows it',
      d.modeBarFirst && d.rootSecond && d.title.length > 0,
      `modeBarFirst=${d.modeBarFirst} rootSecond=${d.rootSecond} title="${d.title}"`);
    check('M25 §四 couple header renders Barry × Anđela',
      d.hasHead && /Barry/.test(d.headText) && /Anđela/.test(d.headText),
      `"${d.headText}"`);

    /* §一/§二 — the whole point of the phase: one card, and no list. Both halves
       are asserted, because "the timeline is empty today" and "the timeline does
       not exist" look identical in a screenshot. */
    check('M26 §二 exactly one card is rendered, above nothing',
      d.hasFeatured && d.featuredIdx > d.anchorIdx && d.featText.length > 0,
      `featured=${d.featuredIdx} anchor=${d.anchorIdx} text="${d.featText.slice(0, 50)}"`);
    check('M27 §一 no timeline, no month grouping, no rows',
      d.listBits === 0, `list-shaped nodes=${d.listBits}`);
    /* §五 — the card's four lines, and the regression they now guard: the kind
       line must name the picked entry's real kind, its real author and a real
       age. "NaN 年前" is what a mistyped render produced once (the sequence handed
       back pool indices instead of items), and it is invisible unless asserted. */
    check('M28 §五 the card carries the kicker, the real content, and the two exits',
      /✦/.test(d.featKicker) && /今天想起/.test(d.featKicker) &&
      !!d.featKindOf && !!d.featKindOf.want &&
      d.featKind.indexOf(d.featKindOf.want) !== -1 &&
      d.featKind.indexOf(d.featKindOf.from) !== -1 &&
      d.featKind.indexOf(d.featKindOf.age) !== -1 &&
      d.featKind.indexOf('NaN') === -1 &&
      d.hasAllBtn && /看全部日记/.test(d.featActs.join('|')),
      `kicker="${d.featKicker}" kind="${d.featKind}" ` +
      `want=${JSON.stringify(d.featKindOf)} acts=${JSON.stringify(d.featActs)}`);

    /* Phase 2C's second heading is gone with the timeline it closed. What §八 of
       the ORIGINAL layout protected — that the story and the diary are visibly
       two things — is now carried by #memModeBar, which M24 pins. */
    check('M29 no page errors while rendering the story, and no stray second heading',
      errs.length === 0 && !d.diaryHead,
      (errs.join(' | ') || 'none') + ` diaryHead=${d.diaryHead}`);

    /* ── M30..M32: Featured determinism, in the pure function ───────────── */
    const det = await page.evaluate(() => {
      const M = window.__memories;
      const items = M.items(Date.now());
      const now = Date.now();
      const a = M.featured(items, now);
      const b = M.featured(items.slice().reverse(), now);
      /* Simulate the other phone: identical content, different insertion order.
         Nothing in the pick may depend on the order the entries happen to sit
         in on one device. */
      const c = M.featured(items.slice().sort((x, y) => (x.id < y.id ? 1 : -1)), now);

      const pool = M.pool(items, now);
      const n = pool.length;
      const midnight = new Date(); midnight.setHours(0, 0, 0, 0);
      const p = (v) => (v < 10 ? '0' : '') + v;
      const key = (t) => t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate());
      const keyAgo = (d) => key(new Date(midnight.getTime() - d * 864e5));

      /* Every index the last FEATURED_LOOKBACK days would have picked. Those are
         exactly the ones today may not land on — the old rule only compared with
         yesterday, which repeats whenever the pool is small. */
      const recent = [];
      for (let d = 1; d <= M.lookback; d++) recent.push(M.hash(keyAgo(d)) % n);
      const yKind = n ? pool[M.hash(keyAgo(1)) % n].kind : null;
      const todayIdx = M.dailyIndex(pool, now);
      return {
        n: n,
        lookback: M.lookback,
        sameOrder: !!a && !!b && a.id === b.id,
        sameShuffled: !!a && !!c && a.id === c.id,
        picked: a ? a.id : null,
        idx: pool.findIndex((i) => a && i.id === a.id),
        dailyIdx: todayIdx,
        todayKind: n ? pool[todayIdx].kind : null,
        yKind: yKind,
        otherKindExists: pool.some((i) => i.kind !== yKind),
        repeatsRecent: recent.indexOf(todayIdx) !== -1,
        recent: recent,
        /* §三: whatever today happens to select, it is always from the pool. */
        pickedInPool: !!a && pool.some((i) => i.id === a.id),
        pickedFeaturable: !!a && M.featurable(a),
        /* Regression guard: the day's order must hold ITEMS, not pool indices.
           It held indices once, and the card rendered "NaN 年前" over an empty
           body — or vanished entirely when the index happened to be 0. */
        seqAreItems: (function () {
          const s = M.sequence(pool, now);
          return s.length === 0 ||
            s.every((x) => x && typeof x.id === 'string' && typeof x.ts === 'number');
        })(),
        seqLen: M.sequence(pool, now).length,
      };
    });

    check('M30 §五 the Featured pick is a pure function of the date and the item ids',
      det.sameOrder && det.sameShuffled && det.n > 0 && det.pickedInPool && det.pickedFeaturable &&
      det.seqAreItems && det.seqLen === det.n,
      `n=${det.n} sameOrder=${det.sameOrder} sameShuffled=${det.sameShuffled} ` +
      `inPool=${det.pickedInPool} seqItems=${det.seqAreItems} seqLen=${det.seqLen}`);
    check('M31 the pick is the one the date hash selects (no hidden state)',
      det.idx === det.dailyIdx, `picked=${det.idx} expected=${det.dailyIdx}`);
    /* §五 新增 — the window widened from "not yesterday" to "not the last seven
       days". Only assertable when the pool is bigger than the window: with
       fewer candidates than days there is nothing left to move to. */
    check('M32 §五 the pick does not repeat any of the last seven days',
      det.n <= det.lookback || det.repeatsRecent === false,
      `picked=${det.idx} recent=${JSON.stringify(det.recent)} n=${det.n}`);
    /* §五 新增 — "昨天是日记，今天也还是日记" is the重复 a person actually notices,
       so when the pool holds another kind the pick switches. Guarded the same way:
       a pool of one kind cannot diversify. */
    check('M32b §五 a same-kind run is broken when another kind is available',
      !det.otherKindExists || det.todayKind !== det.yKind,
      `yesterday=${det.yKind} today=${det.todayKind} otherAvailable=${det.otherKindExists}`);

    /* ── M33/M34: §六 Home line ─────────────────────────────────────────── */
    const home = await page.evaluate(() => {
      const line = document.getElementById('dash-story-line');
      const card = document.getElementById('dash-links-card');
      return {
        inCard: !!(line && card && card.contains(line)),
        hidden: line ? line.hidden : null,
        text: line ? line.textContent.trim() : null,
        kicker: !!document.querySelector('#dash-story-line .dsl-kicker'),
        dupes: document.querySelectorAll('#dash-links-card #dash-story-line').length,
      };
    });
    const it = d.featText ? { id: d.featuredId, text: d.featText } : null;
    check('M33 §六 Home carries exactly one From Our Story line, inside the links card',
      home.inCard && home.dupes === 1 && home.kicker,
      `inCard=${home.inCard} dupes=${home.dupes}`);
    check('M34 §六 the Home line resurfaces the same memory, not a second one',
      home.hidden === false && !!it && home.text.indexOf(it.text.slice(0, 30)) !== -1,
      `home="${(home.text || '').slice(0, 70)}" featured="${it ? it.text.slice(0, 40) : ''}"`);

    /* ── M43: the Home line is actually reachable on a phone ────────────────
       The bottom nav is fixed at 66px + 14px margins, while .app's trailer
       clearance is only 20px at phone widths (the 80px rule lives inside
       @media (min-width:768px)). Every panel's last element therefore ends up
       ~21px underneath the nav at 320. On Home that last element is this line,
       so without its own scoped clearance the one entry point into the story
       is the one thing a thumb cannot hit. Measured, not grepped: this is a
       hit test, so it fails if the rule is dropped *or* if the geometry moves
       out from under it. */
    const phone = await open(RICH, 'zh-CN', { width: 320, height: 800 });
    await phone.page.click('.tab[data-panel="dashboard"]');
    await phone.page.waitForTimeout(700);
    const reach = await phone.page.evaluate(async () => {
      /* html{scroll-behavior:smooth} — an instant jump plus a wait, or the
         measurement reads a position mid-animation. */
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 700));
      const el = document.getElementById('dash-story-line');
      if (!el || el.hidden) return { present: false };
      const b = el.getBoundingClientRect();
      const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
      const hit = document.elementFromPoint(cx, cy);
      const nav = document.querySelector('.tabs-nav') || document.querySelector('.tabs');
      return {
        present: true,
        hitIsLine: !!(hit && (hit === el || el.contains(hit))),
        hitDesc: hit ? (hit.tagName + '.' + (hit.className || '')).slice(0, 60) : null,
        gap: nav ? Math.round(nav.getBoundingClientRect().top - b.bottom) : null,
        bottom: Math.round(b.bottom),
      };
    });
    check('M43 §六 the Home line is hittable at 320 (own trailer clearance, above the nav)',
      reach.present && reach.hitIsLine && reach.gap !== null && reach.gap >= 0,
      `hit=${reach.hitDesc} gap=${reach.gap} bottom=${reach.bottom}`);
    await phone.ctx.close();

    /* The decisive §三 assertion: rendering the story must not add a single
       storage key, and no memories-shaped key may exist at all. */
    const after = await page.evaluate(() => {
      const snap = () => Object.keys(localStorage).sort();
      const shared = (a) => a.filter((k) => k.indexOf('shared-') === 0).join(',');
      const before = snap();
      window.renderMemories();
      if (typeof window.applyAllUI === 'function') window.applyAllUI();
      const mid = snap();
      return {
        stable: before.join(',') === mid.join(','),
        keys: mid,
        memoriesKey: mid.some((k) => /memor|ourStory|featured/i.test(k)),
        sharedSame: shared(before) === shared(mid),
        shared: mid.filter((k) => k.indexOf('shared-') === 0),
      };
    });
    check('M35 §三 re-rendering the story writes nothing to localStorage',
      after.stable, `keys=${after.keys.length}`);
    check('M36 §三 no memories-shaped storage key exists',
      !after.memoriesKey, `keys=${after.keys.join(',')}`);
    /* §十三: the transport carries exactly what it carried before. Anything the
       story needed to sync would show up here as a new shared-* key. */
    check('M37 a full render adds no shared-* key — nothing new to transport',
      after.sharedSame, `shared=${after.shared.join(',')}`);

    await ctx.close();
  }

  /* ── M38..M41: first use, and the two states that actually exist ─────────
     §十一 asks that first use never read as "no data". With the shipped
     anniversary defaults both dates are already in the past, so a brand-new
     install is NOT empty: it opens on the two real milestones
     (相识 X 天 / 相恋 X 天) derived from dates the app already stores. That is
     the honest first screen and it is asserted here. The empty card is the
     genuinely-zero-item branch — reachable when the anniversary has not
     arrived yet — and it is exercised separately rather than assumed. */
  {
    const fresh = await open({
      'cycle-lang': 'zh-CN', 'ct-app-key': 'memories-test-key-not-a-real-one',
    });
    const e = await fresh.page.evaluate(() => {
      const root = document.getElementById('memRoot');
      const items = window.__memories.items(Date.now());
      return {
        bodyText: (root || {}).textContent || '',
        hasEmpty: !!document.getElementById('memEmpty'),
        hasFeatured: !!document.getElementById('memFeatured'),
        cards: document.querySelectorAll('#memRoot .card').length,
        rows: document.querySelectorAll('#memRoot .mem-row, #memRoot .mem-month').length,
        mile: items.filter((i) => i.kind === 'milestone').map((m) => m.text),
        anchorDates: [...document.querySelectorAll('#memAnchor .mem-anchor-day')].map((n) => n.textContent),
        dateStrip: !!document.querySelector('#panel-diary .diary-date-strip-wrap, #panel-diary .diary-date-strip'),
        writeCard: !!document.querySelector('#panel-diary textarea, #panel-diary .diary-write, #panel-diary #diaryText'),
        rootInPanel: !!(root && root.parentElement === document.getElementById('panel-diary')),
      };
    });
    /* The honest first screen: no denial, no empty card, and the story's real
       beginning stated. It is NOT "two cards" — the header and the anchor are not
       .card, and asserting a count would pin the stylesheet rather than the
       behaviour. */
    check('M38 §十一 first use never reads as "no data"',
      !/没有数据|Nema podataka|No data/i.test(e.bodyText) && !e.hasEmpty &&
      e.anchorDates.length === 2 && /Barry/.test(e.bodyText),
      `hasEmpty=${e.hasEmpty} dates=${JSON.stringify(e.anchorDates)}`);
    /* §三 finishes what §十一 started: with only the two milestones derived and
       nothing old enough to be a card, the honest first screen is the header, the
       anchor and the write CTA — never an empty-state card denying the story, and
       never a list. */
    check('M39 §十一 a fresh install opens on the real milestones, not a table of nothing',
      e.mile.length === 2 && e.rows === 0 && !e.hasFeatured &&
      e.mile.some((m) => /^相识 \d+ 天$/.test(m)) && e.mile.some((m) => /^相恋 \d+ 天$/.test(m)),
      `rows=${e.rows} featured=${e.hasFeatured} mile=${JSON.stringify(e.mile)}`);
    check('M40 §九 the diary writing loop survives a story with no entries of its own',
      e.dateStrip && e.writeCard && e.rootInPanel,
      `strip=${e.dateStrip} write=${e.writeCard} rootInPanel=${e.rootInPanel}`);

    /* §八 of the phase brief (the "our story has a beginning" half): a brand-new
       install has no diary, but it does have two real dates the app already
       stores. Before the anchor strip the page opened straight onto 相识 X 天
       at the BOTTOM of a newest-first timeline — the beginning of the story was
       the last thing reachable. The anchor states it at the top. Falling back
       to the shipped defaults is the point: this asserts the dates come from
       the same canonical keys the milestones read, with no data seeded. */
    check('M49 §八 a fresh install states the beginning of the story at the top of the page',
      e.anchorDates.length === 2 &&
      e.anchorDates[0] === '2026.03.19' && e.anchorDates[1] === '2026.05.07',
      `dates=${JSON.stringify(e.anchorDates)}`);
    await fresh.ctx.close();

    /* The zero-item branch, reached by dating both milestones into the future. */
    const future = new Date(TODAY.getTime() + 400 * DAY);
    const p = (x) => (x < 10 ? '0' : '') + x;
    const futureKey = future.getFullYear() + '-' + p(future.getMonth() + 1) + '-' + p(future.getDate());
    const blank = await open({
      'cycle-lang': 'zh-CN', 'ct-app-key': 'memories-test-key-not-a-real-one',
      'cycle-ann-met': futureKey, 'cycle-ann-love': futureKey,
    });
    const z = await blank.page.evaluate(() => {
      const root = document.getElementById('memRoot');
      return {
        n: window.__memories.items(Date.now()).length,
        hasEmpty: !!document.getElementById('memEmpty'),
        emptyText: ((document.getElementById('memEmpty') || {}).textContent || '').trim(),
        hasFeatured: !!document.getElementById('memFeatured'),
        hasAnchor: !!document.getElementById('memAnchor'),
        listBits: document.querySelectorAll(
          '#memRoot .mem-timeline, #memRoot .mem-month, #memRoot .mem-row, #memRoot .mem-song').length,
        rootInPanel: !!(root && root.parentElement === document.getElementById('panel-diary')),
      };
    });
    check('M41 §十一 with nothing at all, the empty card carries the "we will fill it" wording',
      z.n === 0 && z.hasEmpty && !z.hasFeatured && z.listBits === 0 &&
      /还没有很多故事/.test(z.emptyText) && /填满/.test(z.emptyText) && z.rootInPanel,
      `n=${z.n} "${z.emptyText}" listBits=${z.listBits}`);

    /* The anchor is gated on the same condition the milestones use — 相识 must
       already be in the past. Without that gate a future-dated pair would print
       a future date in the past tense and a negative day count under it, i.e.
       the page would assert a story that has not started. The caption lives
       inside #memAnchor, so the element's absence covers both. */
    check('M50 §八 the anchor is withheld while the story has not begun yet',
      z.hasAnchor === false, `hasAnchor=${z.hasAnchor}`);
    await blank.ctx.close();
  }

  /* ── M42: milestones speak each locale's own words ───────────────────── */
  {
    const { ctx, page } = await open(RICH, 'sr');
    const t = await page.evaluate(() => {
      const items = window.__memories.items(Date.now());
      return {
        sub: (document.querySelector('#memRoot .mem-sub') || {}).textContent || '',
        mile: items.filter((i) => i.kind === 'milestone').map((m) => m.text),
      };
    });
    // §2.6 fixes the Serbian anniversary vocabulary: met -> upoznavanje (相识),
    // love -> zaljubljenost (相恋). The literals this check used to require
    // ('od prvog susreta', 'dana zajedno') were the exact wording §2.6 bans, so
    // the expectation moves to the new contract. The assertion is not relaxed:
    // it still demands two locale-specific phrases, both of them required.
    check('M42 Serbian locale renders its own title and milestone wording',
      /uspomene/i.test(t.sub) &&
      t.mile.some((m) => /od upoznavanja/.test(m)) &&
      t.mile.some((m) => /dana zaljubljenosti/.test(m)),
      `sub="${t.sub}" mile=${JSON.stringify(t.mile)}`);
    await ctx.close();
  }

  /* ── M44..M48: the story's beginning, and the way back into it ───────────
     The timeline is newest-first, so the two milestones that ARE the beginning
     sat at its very bottom: the page opened on a random old moment and only
     reached 相识 X 天 after a full scroll. The anchor states the origin at the
     top so everything below reads as "since then" — and it is the only place on
     the page carrying full YYYY.MM.DD dates. */
  {
    const { ctx, page } = await open(RICH);
    const a = await page.evaluate(() => {
      const root = document.getElementById('memRoot');
      const anchor = document.getElementById('memAnchor');
      const kids = Array.prototype.slice.call(root ? root.children : []);
      const line = document.getElementById('dash-story-line');
      const more = document.querySelector('#dash-story-line .dsl-more');
      return {
        inRoot: !!(anchor && root && root.contains(anchor)),
        labels: Array.prototype.map.call(
          document.querySelectorAll('#memAnchor .mem-anchor-label'), (n) => n.textContent.trim()),
        caption: ((document.querySelector('#memAnchor .mem-anchor-line') || {}).textContent || '').trim(),
        anchorIdx: kids.findIndex((k) => k.id === 'memAnchor'),
        featIdx: kids.findIndex((k) => k.id === 'memFeaturedBox'),
        writeIdx: kids.findIndex((k) => k.id === 'memWriteCta'),
        moreText: more ? more.textContent : null,
        moreCount: document.querySelectorAll('#dash-story-line .dsl-more').length,
        lineCount: document.querySelectorAll('#dash-story-line').length,
      };
    });

    /* §二 — the anchor is the first thing the story says, and the card sits
       under it. Phase 2E removed the timeline this used to be measured against,
       so the claim is now the stronger one: the anchor precedes EVERY other
       block in #memRoot's order, and it is the only place carrying full dates. */
    check('M44 §八 the anchor sits inside the story block, above everything it frames',
      a.inRoot && a.anchorIdx >= 0 &&
      (a.featIdx === -1 || a.featIdx > a.anchorIdx) &&
      (a.writeIdx === -1 || a.writeIdx > a.anchorIdx),
      `inRoot=${a.inRoot} anchor=${a.anchorIdx} featured=${a.featIdx} write=${a.writeIdx}`);

    /* §2.6 fixes the vocabulary (met -> 相识, love -> 相恋) and bans the vague
       alternatives. The labels come from the central table, so this asserts both
       that the module still reads those keys and that what a person sees is the
       approved wording — not a re-authored string that drifted. */
    check('M45 §2.6 the anchor speaks the approved 相识/相恋 vocabulary, never 相遇/在一起',
      /annMetLabel/.test(MEM_SRC) && /annLoveLabel/.test(MEM_SRC) &&
      /初次相识/.test(a.labels.join('|')) && /相恋的日子/.test(a.labels.join('|')) &&
      !/相遇|在一起/.test(a.labels.join('|') + a.caption),
      `labels=${JSON.stringify(a.labels)} caption="${a.caption}"`);

    check('M46 §八 the caption counts the real 相识→相恋 interval',
      /49/.test(a.caption), `caption="${a.caption}"`);

    check('M47 §六 the way back into the story is still one line, and now says so',
      a.lineCount === 1 && a.moreCount === 1 && a.moreText === '›',
      `lines=${a.lineCount} more=${a.moreCount} text=${JSON.stringify(a.moreText)}`);
    await ctx.close();

    /* The dates must come from the canonical keys, so the strip and the
       milestones can never disagree about when the story started. */
    const seeded = await open(Object.assign({}, RICH, {
      'cycle-ann-met': '2025-11-02', 'cycle-ann-love': '2026-01-15',
    }));
    const b = await seeded.page.evaluate(() => ({
      dates: [...document.querySelectorAll('#memAnchor .mem-anchor-day')].map((n) => n.textContent),
      mile: window.__memories.items(Date.now())
        .filter((i) => i.kind === 'milestone').map((m) => m.text),
    }));
    check('M48 §八 the anchor reads the canonical keys, not a literal in the module',
      b.dates.length === 2 && b.dates[0] === '2025.11.02' && b.dates[1] === '2026.01.15',
      `dates=${JSON.stringify(b.dates)} mile=${JSON.stringify(b.mile)}`);
    await seeded.ctx.close();

    /* The defect the Home fallback closes: a story written yesterday is not yet
       old enough to be Featured (7 days), and the line used to hide instead —
       the one way back into the story disappearing exactly when there was
       something new to come back for. Milestones are not eligible: the header
       already carries those day counts. */
    const freshOnly = await open({
      'cycle-lang': 'zh-CN', 'ct-app-key': 'memories-test-key-not-a-real-one',
      'shared-gratitude': [{ text: 'Sveža stvar', from: 'barry', time: AGO(2) }],
    });
    const h = await freshOnly.page.evaluate(() => {
      const line = document.getElementById('dash-story-line');
      const f = window.__memories.featured(window.__memories.items(Date.now()), Date.now());
      return {
        hidden: line ? line.hidden : null,
        text: line ? line.textContent.trim() : null,
        featured: f ? f.id : null,
      };
    });
    check('M51 §六 a story too new to be Featured still reaches Home',
      h.hidden === false && h.featured === null && /Sveža/.test(h.text || ''),
      `hidden=${h.hidden} featured=${h.featured} text="${(h.text || '').slice(0, 60)}"`);
    await freshOnly.ctx.close();
  }

  /* ── the card's own date line, in each locale, at 320 ─────────────────────
     The card says "Anđela · 2 个月前" and that number comes from the entry's REAL
     timestamp through the module's existing strings — no AI summary, no rewritten
     sentence, no invented fact (§五). Display only: the item is still dated at its
     own local midnight, i.e. the label changed and nothing else. */
  {
    const LABELS = {
      'zh-CN': { ago: '10 天前', kicker: '今天想起', all: '看全部日记' },
      sr: { ago: 'pre 10 dana', kicker: 'Danas se setih', all: 'Svi dnevni unosi' },
      en: { ago: '10 days ago', kicker: 'Today I remember', all: 'See all diary entries' },
    };
    for (const L of ['zh-CN', 'sr', 'en']) {
      const want = LABELS[L];
      /* 320 is also this block's overflow question: the card carries the longest
         strings the module owns (kicker + kind + age + the two exits), so 320 is
         where they have to still fit. */
      const { ctx, page } = await open(AGED, L, { width: 320, height: 800 });
      const n = await page.evaluate(() => {
        const items = window.__memories.items(Date.now());
        const M = window.__memories;
        const now = Date.now();
        const mid = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
        const pool = M.pool(items, now);
        const f = M.featured(items, now);
        const txt = (sel) => ((document.querySelector(sel) || {}).textContent || '').trim();
        const card = document.getElementById('memFeatured');
        return {
          itemCount: items.length,
          poolCount: pool.length,
          poolIds: pool.map((i) => i.id),
          picked: f ? f.id : null,
          /* The card must not have moved the data: the pick is still dated at its
             own local midnight. */
          tsIsMidnight: !!f && f.ts === mid(f.ts),
          ageDays: f ? Math.floor((now - f.ts) / 864e5) : null,
          kicker: txt('#memFeatured .mem-feat-kicker'),
          kind: txt('#memFeatured .mem-feat-kind'),
          text: txt('#memFeatured .mem-feat-text'),
          allText: txt('#memFeatured .mem-feat-all'),
          hasMore: !!document.querySelector('#memFeatured .mem-feat-more'),
          cards: document.querySelectorAll('#memRoot .card').length,
          listBits: document.querySelectorAll(
            '#memRoot .mem-timeline, #memRoot .mem-month, #memRoot .mem-row, #memRoot .mem-song').length,
          /* Real overflow, measured as a rectangle leaving the viewport.

             NOT scrollWidth > clientWidth. That heuristic is wrong for this
             stylesheet: `.card` is a pre-existing Phase 1A.5 component whose
             padding makes scrollWidth exceed clientWidth on every card in the
             app, while documentElement.scrollWidth is exactly the viewport — so
             it reports an overflow that no one can see, on a node this phase did
             not create. A rect outside the viewport is a fact; a padded box is a
             measurement artefact. */
          doc: document.documentElement.scrollWidth,
          over: [card, document.getElementById('memWriteCta'), card && card.querySelector('.mem-feat-text')]
            .filter((e) => e)
            .map((e) => ({ e: e, r: e.getBoundingClientRect() }))
            .filter((x) => x.r.width > 0 && (x.r.right > window.innerWidth + 1 || x.r.left < -1))
            .map((x) => (x.e.className || x.e.id) + ':' + Math.round(x.r.left) + '..' + Math.round(x.r.right)),
        };
      });

      check(`M52·${L} the card dates the entry from its real timestamp, in this locale`,
        n.poolCount === 1 && n.picked === 'diary:' + dayKeyAgo(10) + ':andjela' &&
        n.ageDays === 10 && n.tsIsMidnight &&
        n.kicker.indexOf(want.kicker) !== -1 &&
        /* The literal đ, not \u{0111}: without the /u flag that escape is read as
           the literal text "u{0111}", so the assertion silently never matched. */
        /Anđela/.test(n.kind) && n.kind.indexOf(want.ago) !== -1 &&
        /Šetnja pored reke/.test(n.text) && n.allText.indexOf(want.all) !== -1,
        `picked=${n.picked} age=${n.ageDays} midnight=${n.tsIsMidnight} ` +
        `kicker="${n.kicker}" kind="${n.kind}" text="${n.text}" all="${n.allText}"`,
      );

      /* §三 — only the 10-day-old entry is a candidate. The 4-day-old one is too
         new and the 900-day-old one is an archive; both are still READ, which is
         what makes the window a filter rather than a deletion. Five items: three
         diary slots plus the two milestones the anchor derives. */
      check(`M53·${L} the age window excludes without deleting, and one candidate means no advance button`,
        n.itemCount === 5 && n.poolCount === 1 &&
        n.poolIds.indexOf('diary:' + dayKeyAgo(4) + ':barry') === -1 &&
        n.poolIds.indexOf('diary:' + dayKeyAgo(900) + ':barry') === -1 &&
        n.hasMore === false && n.listBits === 0,
        `items=${n.itemCount} pool=${JSON.stringify(n.poolIds)} more=${n.hasMore} ` +
        `cards=${n.cards} listBits=${n.listBits}`,
      );

      check(`M54·${L} no horizontal overflow at 320 with the card's longer strings`,
        n.doc <= 321 && n.over.length === 0,
        `scrollWidth=${n.doc} overflowing=${JSON.stringify(n.over)}`,
      );
      await ctx.close();
    }
  }

  /* ── M55/M56: the pick is rendered exactly once ────────────────────────────
     §二 asks for one card, and the failure this guards against is the one the
     timeline caused: the same entry appearing twice on one page with nothing
     saying the two were the same record. Now it is stronger — not "not repeated
     in the list" but "not repeated anywhere in the story block". */
  {
    const { ctx, page } = await open(RICH);
    const a = await page.evaluate(() => {
      const items = window.__memories.items(Date.now());
      const f = window.__memories.featured(items, Date.now());
      const clip = (s, n) => {
        const t = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
        return t.length > n ? t.slice(0, n - 1) + '…' : t;
      };
      const rootText = (document.getElementById('memRoot') || {}).textContent || '';
      const featText = clip(f ? f.text : '', 220);
      return {
        n: items.length,
        poolCount: window.__memories.pool(items, Date.now()).length,
        featShown: ((document.querySelector('#memFeatured .mem-feat-text') || {}).textContent || '').trim(),
        featText,
        cards: document.querySelectorAll('#memRoot .card').length,
        rootText: rootText.length,
        occurrences: featText ? rootText.split(featText).length - 1 : -1,
        /* No other entry's text may appear on this page either: the card shows
           exactly one memory, not a preview of several. */
        othersShown: items.filter((i) => {
          if (!f || i.id === f.id) return false;
          const t = clip(i.text, 60);
          return t.length > 8 && rootText.indexOf(t) !== -1;
        }).map((i) => i.id),
      };
    });

    check('M55 §二 the pick is the card, and it is the only memory on the page',
      a.featShown === a.featText && a.n > 0 && a.poolCount > 0 &&
      a.cards <= 4 && a.othersShown.length === 0,
      `items=${a.n} pool=${a.poolCount} cards=${a.cards} alsoShown=${JSON.stringify(a.othersShown)}`);
    check('M56 §二 the pick\'s text appears exactly once inside the story block',
      a.occurrences === 1, `occurrences=${a.occurrences}`);
    await ctx.close();
  }

  /* ── N1..N6: 「再看看一个」, the cursor, and 📖 看全部日记 ──────────────────
     §四's step-through and §六's exit, both of which need a real click rather
     than a pure-function call. The RICH fixture has seven candidates, so the
     whole order fits in one pass and the wrap-around is observable. */
  {
    const { ctx, page } = await open(RICH);
    const walk = await page.evaluate(async () => {
      const M = window.__memories;
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const shown = () => ((document.querySelector('#memFeatured .mem-feat-text') || {})
        .textContent || '').trim();
      const items = M.items(Date.now());
      const pool = M.pool(items, Date.now());
      const byText = (t) => (pool.filter((i) => i.text === t)[0] || {}).id || null;
      const first = shown();
      const seen = [first];
      const cursorBefore = M.cursor();
      const hits = [];
      /* One full lap plus one: the eighth click must land back on the first. */
      for (let i = 0; i < pool.length + 1; i++) {
        const btn = document.querySelector('#memFeatured .mem-feat-more');
        if (!btn) { hits.push('NO_BUTTON'); break; }
        btn.click();
        await sleep(30);
        seen.push(shown());
        hits.push(document.querySelector('#memFeatured .mem-feat-more') ? 'ok' : 'NO_BUTTON');
      }
      return {
        poolIds: pool.map((i) => i.id),
        poolLen: pool.length,
        first: first,
        firstId: byText(first),
        seen: seen,
        seenIds: seen.map(byText),
        unique: [...new Set(seen.slice(0, pool.length))].length,
        consecutiveDupes: seen.slice(1).filter((t, i) => t === seen[i]).length,
        /* seen[0] is the card before any click, so seen[pool.length] is the one
           after a full lap: it must be the first entry again, and the click after
           that must carry on to the second — a wrap, not a reset. */
        wrapped: seen[pool.length] === first && seen[pool.length + 1] === seen[1],
        cursorBefore: cursorBefore,
        cursorAfter: M.cursor(),
        hits: hits,
      };
    });

    check('N1 §四 「再看看一个」 walks the day\'s whole order without repeating',
      walk.poolLen >= 3 && walk.unique === walk.poolLen && walk.consecutiveDupes === 0,
      `pool=${walk.poolLen} unique=${walk.unique} dupesInARow=${walk.consecutiveDupes}`);
    check('N2 §四 the order is fixed for the day, and it wraps rather than sticking',
      walk.wrapped === true && walk.cursorAfter === walk.cursorBefore + walk.poolLen + 1,
      `first="${walk.first.slice(0, 24)}" wrapped=${walk.wrapped} ` +
      `cursor=${walk.cursorBefore}->${walk.cursorAfter}`);
    /* The default (the card a refresh shows) is the date-hash pick, which is what
       the cursor starts on — the two cannot disagree. */
    check('N3 §四 the walk starts on the daily pick, not on an arbitrary entry',
      walk.firstId === walk.seenIds[0] && !!walk.firstId,
      `first=${walk.firstId}`);

    /* §六 + point 8 of the brief: 「📖 看全部日记」 lands in the real Diary, with
       the full diary furniture reachable — not a filtered or read-only view. */
    const exit = await page.evaluate(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const btn = document.querySelector('#memFeatured .mem-feat-all');
      const before = window.__memories.mode();
      if (btn) btn.click();
      await sleep(500);
      const panel = document.getElementById('panel-diary');
      const cs = (sel) => {
        const e = document.querySelector(sel);
        if (!e) return null;
        const s = getComputedStyle(e);
        return { display: s.display, visible: !!(e.offsetWidth || e.offsetHeight) };
      };
      return {
        before: before,
        mode: window.__memories.mode(),
        panelClass: panel ? panel.className : '',
        tabActive: !!document.querySelector('#memModeDiary.is-active'),
        storyHidden: cs('#memRoot'),
        strip: cs('#panel-diary .diary-date-strip-wrap'),
        write: cs('#panel-diary #diaryWriteCard'),
        textarea: !!document.getElementById('diaryTextarea'),
        calendar: !!document.querySelector('#panel-diary #diaryFullCal'),
      };
    });
    check('N4 §六 「📖 看全部日记」 switches to the full Diary, not to a copy',
      exit.before === 'story' && exit.mode === 'diary' &&
      /mem-mode-diary/.test(exit.panelClass) && exit.tabActive &&
      exit.storyHidden && exit.storyHidden.display === 'none' &&
      exit.strip && exit.strip.display !== 'none' &&
      exit.write && exit.write.display !== 'none' &&
      exit.textarea && exit.calendar,
      `mode=${exit.mode} panel="${exit.panelClass}" strip=${JSON.stringify(exit.strip)} ` +
      `write=${JSON.stringify(exit.write)}`);

    /* Point 4 of the brief. A diary too short to carry a card on its own is still
       a diary: it is not deleted, not filtered out of the data, and it still opens
       in 📖 日记 with its text in the editor. The length floor is a rule about
       what may be the ONE thing on screen, nothing else. */
    const before = await page.evaluate(() => window.__memories.pool(
      window.__memories.items(Date.now()), Date.now()).length);
    await ctx.close();

    const short = await open(Object.assign({}, RICH, {
      'shared-diary': Object.assign({}, RICH['shared-diary'], {
        [dayKeyAgo(20)]: { barry: { text: 'Ljubav' } },
      }),
    }));
    const s = await short.page.evaluate(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const M = window.__memories;
      const items = M.items(Date.now());
      const id = 'diary:' + (function () {
        const d = new Date(); d.setHours(0, 0, 0, 0);
        d.setTime(d.getTime() - 20 * 864e5);
        const p = (v) => (v < 10 ? '0' : '') + v;
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
      })() + ':barry';
      const it = items.filter((i) => i.id === id)[0] || null;
      const pool = M.pool(items, Date.now());
      /* Open the real Diary on that exact date and read the editor back. */
      M.openDiary(id.split(':')[1]);
      await sleep(700);
      const ta = document.getElementById('diaryTextarea');
      const stored = (function () {
        try { return JSON.parse(localStorage.getItem('shared-diary')); } catch (e) { return null; }
      })();
      return {
        inItems: !!it,
        textLen: it ? it.text.length : null,
        minLen: M.minDiaryLen,
        featurable: it ? M.featurable(it) : null,
        inPool: pool.some((i) => i.id === id),
        storedText: stored && stored[id.split(':')[1]] && stored[id.split(':')[1]].barry
          ? stored[id.split(':')[1]].barry.text : null,
        editorText: ta ? ta.value : null,
        mode: M.mode(),
      };
    });
    check('N5 §三 a diary shorter than the floor is not a candidate — and is not touched',
      s.inItems && s.textLen === 6 && s.textLen < s.minLen &&
      s.featurable === false && s.inPool === false && s.storedText === 'Ljubav',
      `len=${s.textLen}/${s.minLen} featurable=${s.featurable} inPool=${s.inPool} ` +
      `stored="${s.storedText}"`);
    check('N5b §九 that same short diary still opens in 📖 日记 with its text',
      s.mode === 'diary' && s.editorText === 'Ljubav',
      `mode=${s.mode} editor="${s.editorText}"`);
    await short.ctx.close();

    /* Point 7 of the brief: the cursor lives in memory only. A fresh context is
       the honest test — it is what a refresh gives — and it must land back on the
       daily pick with no storage written anywhere. */
    const fresh = await open(RICH);
    const r = await fresh.page.evaluate(() => ({
      cursor: window.__memories.cursor(),
      shown: ((document.querySelector('#memFeatured .mem-feat-text') || {})
        .textContent || '').trim(),
      expected: (function () {
        const M = window.__memories;
        const now = Date.now();
        const pool = M.pool(M.items(now), now);
        const f = M.featured(M.items(now), now);
        return f ? f.text.slice(0, 40) : null;
      })(),
      keysTouched: Object.keys(localStorage).filter((k) => /cursor|memory|story/i.test(k)),
    }));
    check('N6 §四 a refresh restores the day\'s default, and the cursor is never stored',
      r.cursor === 0 && !!r.expected && r.shown.indexOf(r.expected) !== -1 &&
      r.keysTouched.length === 0,
      `cursor=${r.cursor} shown="${r.shown.slice(0, 30)}" keys=${JSON.stringify(r.keysTouched)} ` +
      `(pool before the short-diary context: ${before})`);
    await fresh.ctx.close();
  }

  /* ── M57: 80 ineligible entries, and the one that is eligible ──────────────
     The cap this used to test is gone, so the fixture now tests the window from
     the other side: 80 gratitude entries dated in the FUTURE are all outside
     7..400 days, which leaves the single 20-day-old entry as the entire pool. It
     is the pick, nothing else is, and 80 future timestamps reach _ago without
     producing a negative day count anywhere on the page. */
  {
    const futureItems = [];
    for (let i = 1; i <= 80; i++) {
      futureItems.push({ text: 'Budućnost ' + i, from: 'barry', time: Date.now() + i * DAY });
    }
    const big = await open({
      'cycle-lang': 'zh-CN', 'ct-app-key': 'memories-test-key-not-a-real-one',
      'cycle-ann-met': '2026-03-19', 'cycle-ann-love': '2026-05-07',
      'shared-gratitude': futureItems,
      'shared-diary': { [dayKeyAgo(20)]: { andjela: { text: 'Dvadeset dana' } } },
    });
    const o = await big.page.evaluate(() => {
      const M = window.__memories;
      const items = M.items(Date.now());
      const now = Date.now();
      const f = M.featured(items, now);
      const pool = M.pool(items, now);
      const rootText = (document.getElementById('memRoot') || {}).textContent || '';
      return {
        n: items.length,
        poolLen: pool.length,
        picked: f ? f.id : null,
        featText: ((document.querySelector('#memFeatured .mem-feat-text') || {}).textContent || '').trim(),
        kinds: [...new Set(pool.map((i) => i.kind))],
        futureInPool: pool.some((i) => i.ts > now),
        /* A negative age would read as a fabricated date; nothing on the page may
           carry one. */
        negDays: /-\d+\s*(天|dana|days)/.test(rootText),
        listBits: document.querySelectorAll(
          '#memRoot .mem-timeline, #memRoot .mem-row, #memRoot .mem-month, #memRoot .mem-more').length,
        cards: document.querySelectorAll('#memRoot .card').length,
      };
    });
    check('M57 §三 80 future-dated entries are ineligible; the one in-window entry is the pick',
      o.n === 83 && o.poolLen === 1 && !o.futureInPool &&
      o.picked === 'diary:' + dayKeyAgo(20) + ':andjela' && /Dvadeset/.test(o.featText) &&
      o.negDays === false && o.listBits === 0,
      `items=${o.n} pool=${o.poolLen} picked=${o.picked} kinds=${JSON.stringify(o.kinds)} ` +
      `negDays=${o.negDays} listBits=${o.listBits} cards=${o.cards}`);
    await big.ctx.close();

    /* The one-item edge: the only memory is also the pick, so the story is not
       empty while a naive implementation would render the empty card under it. */
    const fp = (x) => (x < 10 ? '0' : '') + x;
    const fDate = new Date(TODAY.getTime() + 400 * DAY);
    const only = await open({
      'cycle-lang': 'zh-CN', 'ct-app-key': 'memories-test-key-not-a-real-one',
      'cycle-ann-met': fDate.getFullYear() + '-' + fp(fDate.getMonth() + 1) + '-' + fp(fDate.getDate()),
      'cycle-ann-love': fDate.getFullYear() + '-' + fp(fDate.getMonth() + 1) + '-' + fp(fDate.getDate()),
      'shared-diary': { [dayKeyAgo(20)]: { andjela: { text: 'Jedina uspomena' } } },
    });
    const one = await only.page.evaluate(() => ({
      n: window.__memories.items(Date.now()).length,
      hasFeatured: !!document.getElementById('memFeatured'),
      hasEmpty: !!document.getElementById('memEmpty'),
      hasMore: !!document.querySelector('#memFeatured .mem-feat-more'),
      listBits: document.querySelectorAll(
        '#memRoot .mem-timeline, #memRoot .mem-row, #memRoot .mem-month').length,
      featText: ((document.querySelector('#memFeatured .mem-feat-text') || {}).textContent || '').trim(),
    }));
    check('M58 a story whose only memory is the pick shows it once, with no empty card or list',
      one.n === 1 && one.hasFeatured && !one.hasEmpty && !one.hasMore &&
      one.listBits === 0 && /Jedina uspomena/.test(one.featText),
      `items=${one.n} featured=${one.hasFeatured} emptyCard=${one.hasEmpty} ` +
      `more=${one.hasMore} listBits=${one.listBits}`);
    await only.ctx.close();
  }

  /* ── N7: 3 locales × 3 widths × 2 themes ──────────────────────────────────
     Points 10..12 of the brief in one sweep. One context per locale, resized and
     re-themed in place: the card is the same DOM at all eighteen combinations, so
     re-navigating for each cell would test the server, not the layout. Every cell
     asserts the same five things — the card is there, its own box does not
     overflow, nothing list-shaped appeared, the theme actually applied, and the
     ✦「今天想起」 kicker is in the right language — which is what makes a
     regression at one width in one theme visible. */
  {
    const KICKER = { 'zh-CN': '今天想起', sr: 'Danas se setih', en: 'Today I remember' };
    const ALLDIARY = { 'zh-CN': '看全部日记', sr: 'Svi dnevni unosi', en: 'See all diary entries' };
    for (const L of ['zh-CN', 'sr', 'en']) {
      const { ctx, page } = await open(RICH, L, { width: 320, height: 800 });
      const bad = [];
      for (const w of [320, 768, 1440]) {
        for (const theme of ['light', 'dark']) {
          await page.setViewportSize({ width: w, height: 800 });
          await page.evaluate((t) => {
            document.documentElement.setAttribute('data-theme', t);
            try { localStorage.setItem('cycle-theme', t); } catch (e) {}
          }, theme);
          await page.waitForTimeout(220);
          const c = await page.evaluate(() => {
            const card = document.getElementById('memFeatured');
            const t = (sel) => ((document.querySelector(sel) || {}).textContent || '').trim();
            /* Scoped to the card and the CTA — the nodes this phase owns. A sweep
               over every descendant would also catch the pre-existing furniture
               (the anchor strip, the mode bar), which this phase did not touch and
               must not be blamed for. Measured as a rect leaving the viewport, not
               as scrollWidth > clientWidth: `.card`'s own padding trips that
               heuristic on every card in the app. */
            const mine = card
              ? [...card.querySelectorAll('*'), card,
                  ...[...document.querySelectorAll('#memWriteCta, #memWriteCta *')]]
              : [];
            const overflowing = mine
              .map((e) => ({ e: e, r: e.getBoundingClientRect() }))
              .filter((x) => x.r.width > 0 &&
                (x.r.right > window.innerWidth + 1 || x.r.left < -1))
              .map((x) => (x.e.className || x.e.id || x.e.tagName) + ':' +
                Math.round(x.r.left) + '..' + Math.round(x.r.right));
            return {
              hasCard: !!card,
              kicker: t('#memFeatured .mem-feat-kicker'),
              text: t('#memFeatured .mem-feat-text'),
              all: t('#memFeatured .mem-feat-all'),
              doc: document.documentElement.scrollWidth,
              inner: window.innerWidth,
              listBits: document.querySelectorAll(
                '#memRoot .mem-timeline, #memRoot .mem-row, #memRoot .mem-month, #memRoot .mem-song').length,
              overflowing: overflowing,
              theme: document.documentElement.getAttribute('data-theme'),
            };
          });
          const ok = c.hasCard && c.text.length > 0 && c.listBits === 0 &&
            c.theme === theme && c.doc <= w + 1 && c.overflowing.length === 0 &&
            c.kicker.indexOf(KICKER[L]) !== -1 && c.all.indexOf(ALLDIARY[L]) !== -1;
          if (!ok) {
            bad.push(`${L}/${w}/${theme}: doc=${c.doc} over=${JSON.stringify(c.overflowing)} ` +
              `card=${c.hasCard} list=${c.listBits} theme=${c.theme} ` +
              `kicker="${c.kicker}" all="${c.all}"`);
          }
        }
      }
      check(`N7·${L} the card holds at 320/768/1440 in both themes`,
        bad.length === 0, bad.length ? bad.join(' || ') : '18/18 cells clean');
      await ctx.close();
    }
  }

  await browser.close();
  srv.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) console.log('failed: ' + failed.map((f) => f.name.split(' ')[0]).join(', '));
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
