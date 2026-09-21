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
 * Two halves:
 *   1. static — read the sources and prove the invariants that no rendering can
 *      demonstrate (locale parity, reduced-motion coverage, the absence of any
 *      write path, the sync contract still at 18 fields).
 *   2. browser — seed real localStorage shapes and assert what reaches the
 *      timeline, with the timestamps the data actually has.
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
     wording is the thing §十一 and §四 pin, so assert it is really there. */
  check('M3 §十一 empty-state wording is the "not much here yet" phrasing, not "no data"',
    /Ovde još nema mnogo priča\./.test(MEM_SRC) &&
    /这里还没有很多故事。/.test(MEM_SRC) &&
    /There aren't many stories here yet\./.test(MEM_SRC) &&
    !/没有数据|Nema podataka|No data/i.test(MEM_SRC),
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
  /* §九: {title, note} and nothing else — no timestamp to place on a timeline. */
  'shared-song-barry': { title: 'Naša pesma', note: 'uz kafu' },
  'shared-song-andjela': { title: 'Zvuci Beograda', note: '' },
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

  /* ── M12..M29: the timeline and what feeds it ─────────────────────────── */
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

        /* §九: the song is not a dated memory. */
        songOnTimeline: items.some((i) => /Naša pesma|Zvuci Beograda/.test(i.text)),
        songCard: !!document.getElementById('memSong'),
        songRows: Array.prototype.map.call(
          document.querySelectorAll('#memSong .mem-song-row'),
          (r) => r.textContent.trim()),

        /* §四: structure and order. */
        rootFirst: !!(root && panel && panel.firstElementChild === root),
        hasHead: !!document.querySelector('#memRoot .dch-names'),
        headText: (document.querySelector('#memRoot .dch-names') || {}).textContent || '',
        hasFeatured: !!document.getElementById('memFeatured'),
        featuredText: ((document.getElementById('memFeatured') || {}).textContent || '').trim(),
        timelineRows: document.querySelectorAll('#memRoot .mem-row').length,
        monthCount: document.querySelectorAll('#memRoot .mem-month').length,
        monthLabels: Array.prototype.map.call(
          document.querySelectorAll('#memRoot .mem-month-label'), (e) => e.textContent),
        diaryHeadIdx: kids.findIndex((k) => k.classList && k.classList.contains('mem-diary-head')),
        timelineIdx: kids.findIndex((k) => k.id === 'memTimeline'),
        hasDiaryHead: !!document.querySelector('#memRoot .mem-diary-head'),
        title: (document.querySelector('#memRoot .mem-sub') || {}).textContent || '',
        dqText: (by('dq')[0] || {}).text || '',
        feat: (function () {
          const f = window.__memories.featured(items, Date.now());
          return f ? { id: f.id, text: f.text } : null;
        })(),
      };
    });

    check('M12 diary entries reach the timeline off their YYYY-MM-DD key',
      d.diaryN === 4 && d.keys.indexOf('diary:' + dayKeyAgo(35) + ':andjela') !== -1,
      `diary=${d.diaryN}`);
    check('M13 a diary slot with no `time` still lands on its own date',
      !!d.noTime && d.noTimeTs === d.expect35,
      `ts=${d.noTimeTs} expected=${d.expect35}`);
    check('M14 a contradictory `time` is ignored — the key wins',
      d.badTime === d.expect50, `ts=${d.badTime} expected=${d.expect50}`);
    check('M15 gratitude reaches the timeline', d.grat === 2, `grat=${d.grat}`);
    check('M16 Daily Question reaches the timeline',
      d.dq === 1 && /nasmeješ/.test(d.dqText), `dq=${d.dq} text=${d.dqText}`);
    check('M17 Know Me reaches the timeline', d.km === 1, `km=${d.km}`);

    check('M18 §二 physical discomfort is not part of the story',
      !d.uncomfLeaked && /kafi/.test(d.legacyJoined),
      `leaked=${d.uncomfLeaked} legacy="${d.legacyJoined}"`);
    check('M19 legacy thanks/wish field generation still renders',
      /cveće/.test(d.wishJoined) && /ovakvih/.test(d.wishJoined),
      `joined="${d.wishJoined}"`);

    check('M20 §九 the song carries no date and is NOT placed on the timeline',
      !d.songOnTimeline && d.timelineRows > 0,
      `onTimeline=${d.songOnTimeline} rows=${d.timelineRows}`);
    check('M21 §九 Our Song is shown as its own undated card, one row per person',
      d.songCard && d.songRows.length === 2 &&
      d.songRows.join('|').indexOf('Naša pesma') !== -1 &&
      d.songRows.join('|').indexOf('Zvuci Beograda') !== -1,
      `rows=${JSON.stringify(d.songRows)}`);

    check('M22 §十 annDateMet produces the 相识 milestone from the central table',
      d.mile.some((m) => m.id === 'mile:met' && /^相识 \d+ 天$/.test(m.text)),
      JSON.stringify(d.mile));
    check('M23 §十 annDateLove produces the 相恋 milestone from the central table',
      d.mile.some((m) => m.id === 'mile:love' && /^相恋 \d+ 天$/.test(m.text)),
      JSON.stringify(d.mile));

    check('M24 §四 the story block is #panel-diary\'s first child',
      d.rootFirst && d.title.length > 0, `firstChildIsRoot=${d.rootFirst} title="${d.title}"`);
    check('M25 §四 couple header renders Barry × Anđela',
      d.hasHead && /Barry/.test(d.headText) && /Anđela/.test(d.headText),
      `"${d.headText}"`);
    check('M26 §四 Featured Memory renders above the timeline',
      d.hasFeatured && d.timelineIdx > 0 && d.featuredText.length > 0,
      `featured="${d.featuredText.slice(0, 60)}"`);
    check('M27 the timeline is grouped by month',
      d.monthCount >= 2 && d.monthLabels.every((l) => /^\d{4}\.\d{2}$/.test(l)),
      `months=${JSON.stringify(d.monthLabels)}`);
    check('M28 §八 the diary keeps its own heading, below the story',
      d.hasDiaryHead && d.diaryHeadIdx > d.timelineIdx,
      `diaryHeadIdx=${d.diaryHeadIdx} timelineIdx=${d.timelineIdx}`);
    check('M29 no page errors while rendering the story', errs.length === 0,
      errs.join(' | ') || 'none');

    /* ── M30..M32: Featured determinism, in the pure function ───────────── */
    const det = await page.evaluate(() => {
      const items = window.__memories.items(Date.now());
      const now = Date.now();
      const a = window.__memories.featured(items, now);
      const b = window.__memories.featured(items.slice().reverse(), now);
      /* Simulate the other phone: identical content, different insertion order.
         Nothing in the pick may depend on the order the entries happen to sit
         in on one device. */
      const c = window.__memories.featured(items.slice().sort((x, y) => (x.id < y.id ? 1 : -1)), now);

      const pool = items.filter((i) => {
        const age = (now - i.ts) / 864e5;
        return i.kind !== 'milestone' && age >= 7 && age <= 400;
      }).sort((x, y) => x.ts - y.ts || (x.id < y.id ? -1 : 1));
      const midnight = new Date(); midnight.setHours(0, 0, 0, 0);
      const p = (v) => (v < 10 ? '0' : '') + v;
      const key = (t) => t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate());
      return {
        n: pool.length,
        sameOrder: !!a && !!b && a.id === b.id,
        sameShuffled: !!a && !!c && a.id === c.id,
        idx: pool.findIndex((i) => a && i.id === a.id),
        todayIdx: window.__memories.hash(key(midnight)) % pool.length,
        yestIdx: window.__memories.hash(key(new Date(midnight.getTime() - 864e5))) % pool.length,
      };
    });

    check('M30 §五 the Featured pick is a pure function of the date and the item ids',
      det.sameOrder && det.sameShuffled && det.n > 0,
      `n=${det.n} sameOrder=${det.sameOrder} sameShuffled=${det.sameShuffled}`);
    check('M31 the pick is the one the date hash selects (no hidden state)',
      det.idx === det.todayIdx, `picked=${det.idx} expected=${det.todayIdx}`);
    check('M32 §五 "no two days running" is derived, not remembered',
      det.n < 2 || det.idx !== det.yestIdx,
      `today=${det.idx} yesterday=${det.yestIdx} n=${det.n}`);

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
    const it = d.feat;
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
        hasTimeline: !!document.getElementById('memTimeline'),
        hasFeatured: !!document.getElementById('memFeatured'),
        rows: document.querySelectorAll('#memRoot .mem-row').length,
        mile: items.filter((i) => i.kind === 'milestone').map((m) => m.text),
        anchorDates: [...document.querySelectorAll('#memAnchor .mem-anchor-day')].map((n) => n.textContent),
        hasDiaryHead: !!document.querySelector('#memRoot .mem-diary-head'),
        dateStrip: !!document.querySelector('#panel-diary .diary-date-strip-wrap, #panel-diary .diary-date-strip'),
        writeCard: !!document.querySelector('#panel-diary textarea, #panel-diary .diary-write, #panel-diary #diaryText'),
        rootInPanel: !!(root && root.parentElement === document.getElementById('panel-diary')),
      };
    });
    check('M38 §十一 first use never reads as "no data"',
      !/没有数据|Nema podataka|No data/i.test(e.bodyText) && e.hasTimeline,
      `hasEmpty=${e.hasEmpty} rows=${e.rows}`);
    check('M39 §十一 a fresh install opens on the real milestones, not a table of nothing',
      e.rows === 2 && e.mile.length === 2 &&
      e.mile.some((m) => /^相识 \d+ 天$/.test(m)) && e.mile.some((m) => /^相恋 \d+ 天$/.test(m)),
      `rows=${e.rows} mile=${JSON.stringify(e.mile)}`);
    check('M40 §八 the diary writing loop survives a story with no entries of its own',
      e.hasDiaryHead && e.dateStrip && e.writeCard && e.rootInPanel,
      `strip=${e.dateStrip} write=${e.writeCard}`);

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
        hasTimeline: !!document.getElementById('memTimeline'),
        hasSong: !!document.getElementById('memSong'),
        hasAnchor: !!document.getElementById('memAnchor'),
        hasDiaryHead: !!document.querySelector('#memRoot .mem-diary-head'),
        rootInPanel: !!(root && root.parentElement === document.getElementById('panel-diary')),
      };
    });
    check('M41 §十一 with nothing at all, the empty card carries the "we will fill it" wording',
      z.n === 0 && z.hasEmpty && !z.hasFeatured && !z.hasTimeline && !z.hasSong &&
      /还没有很多故事/.test(z.emptyText) && /填满/.test(z.emptyText) && z.hasDiaryHead && z.rootInPanel,
      `n=${z.n} "${z.emptyText}"`);

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
        featIdx: kids.findIndex((k) => k.id === 'memFeatured'),
        timelineIdx: kids.findIndex((k) => k.id === 'memTimeline'),
        moreText: more ? more.textContent : null,
        moreCount: document.querySelectorAll('#dash-story-line .dsl-more').length,
        lineCount: document.querySelectorAll('#dash-story-line').length,
      };
    });

    check('M44 §八 the anchor sits inside the story block, above everything it frames',
      a.inRoot && a.anchorIdx >= 0 && a.timelineIdx > a.anchorIdx &&
      (a.featIdx === -1 || a.featIdx > a.anchorIdx),
      `inRoot=${a.inRoot} anchor=${a.anchorIdx} featured=${a.featIdx} timeline=${a.timelineIdx}`);

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

  await browser.close();
  srv.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) console.log('failed: ' + failed.map((f) => f.name.split(' ')[0]).join(', '));
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
