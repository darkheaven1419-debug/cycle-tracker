/**
 * Phase 1.9 §二 — the fabricated period-record injector is gone and cannot return.
 *
 * js/fix-stats.js used to carry a seeding IIFE: whenever state.records.length < 2
 * it pushed two hardcoded 2026 records (2026-05-28, 2026-06-24), filled in their
 * periodEnds, and called saveState(). saveState() writes shared-cycle-data
 * whenever records.length > 0, and schedules pushAllSharedData() 1500ms later —
 * so a plain page load could put two records the user never typed into the
 * couple's shared state. app.js's loadState() did the same thing for one record
 * on a fresh andjela install.
 *
 * Two halves, because "deleted" and "cannot come back" are different claims:
 *   - static: the seed data and the saveState() call are gone from both files,
 *     and a tombstone explains why so a later "fix the empty state" change does
 *     not silently reintroduce it;
 *   - behavioural: four boots — empty, one record, three records, and a plain
 *     load — prove empty state stays empty, that a sub-two-record state is left
 *     alone rather than topped up, that no /state write reaches the Worker, and
 *     that real records survive untouched.
 *
 * The discriminating case is the empty boot: before this change the injector
 * created two records there, saveState() then satisfied its `records.length > 0`
 * guard, and a PUT followed. Zero records is therefore the state in which the
 * old behaviour and the new one differ observably.
 *
 * Run: node tests/test-phase19-integrity.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8941;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

const WORKER_HOST = 'cycle-tracker-data.cycletracker-barry.workers.dev';
const PROFILE = 'andjela';
const STATE_KEY = 'cycle-data-v6-' + PROFILE;
const SHARED_CYCLE_KEY = 'shared-cycle-data';

// The exact values the removed injector wrote. Synthetic dates, but the same
// ones the seed hardcoded — these are what must never reappear.
const INJECTED_DATES = ['2026-05-28', '2026-06-24'];
// Plain synthetic "real" records: what a user would actually have entered.
const ONE_RECORD = ['2026-01-15'];
const THREE_RECORDS = ['2026-01-15', '2026-02-12', '2026-03-11'];

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

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

/** Persisted shape loadState() expects, with records as 'YYYY-MM-DD' strings. */
function persistedState(records) {
  return {
    records: records.slice(),
    periodEnds: {},
    symptoms: {},
    moods: {},
    diaries: {},
    settings: { cycleLength: 28, periodLength: 7, manualOverride: false },
    _migrated: true,
  };
}

/**
 * One boot. `records` seeds the profile's persisted state; omit it entirely for
 * a genuinely fresh install. Every request to the private Worker is recorded and
 * fulfilled locally — a PUT there is the thing this test exists to catch, so it
 * must be observed rather than allowed through.
 */
async function boot(browser, opts) {
  opts = opts || {};
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    serviceWorkers: 'block',
  });
  await ctx.addInitScript((s) => {
    try {
      localStorage.setItem('cycle-active-profile', s.profile);
      sessionStorage.setItem('cycle-logged-in', '1');
      if (s.state) localStorage.setItem(s.key, JSON.stringify(s.state));
    } catch (e) { /* ignore */ }
  }, {
    profile: PROFILE,
    key: STATE_KEY,
    state: opts.records ? persistedState(opts.records) : null,
  });

  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message.split('\n')[0]));

  const workerCalls = [];
  await page.route('**/*', (route) => {
    const req = route.request();
    const u = req.url();
    if (u.indexOf(WORKER_HOST) !== -1) {
      workerCalls.push(req.method() + ' ' + u.replace(/^https?:\/\/[^/]+/, ''));
      return route.fulfill({
        status: 200, contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ sha: null, state: {} }),
      });
    }
    if (!u.startsWith(`http://localhost:${PORT}/`)) return route.abort();
    return route.continue();
  });

  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.tab[data-panel="dashboard"]', { timeout: 15000 });
  // 200ms save debounce + 1500ms push debounce, with headroom.
  await page.waitForTimeout(2500);

  const observed = await page.evaluate((key) => {
    const iso = (d) => d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
    const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return 'ERR'; } };
    return {
      records: ((window.state && window.state.records) || []).map(iso),
      sharedCycleData: get(key.shared),
      persisted: get(key.state),
      booted: !!document.querySelector('.tab[data-panel="dashboard"]'),
      // Phase 1.9 §七 — the fake-Barry content, checked at runtime rather than
      // only in the source. js/render-misc.js shipped a SECOND copy of
      // randomThinkingOfYou() that no caller used; a static scan naming one file
      // would have missed it, but "is the global there at all" catches every
      // copy in every file, including any added later.
      hasFakeBarryToast: typeof window.randomThinkingOfYou !== 'undefined',
      // The live badge string, whichever definition won (app.js shadows
      // render-misc.js by load order, so this is the one users actually see).
      badgeText: (function () {
        const el = document.getElementById('specialBadgeText');
        return el ? el.textContent : null;
      })(),
      badgeVisible: (function () {
        const el = document.getElementById('specialBadge');
        return el ? el.style.display !== 'none' : false;
      })(),
      // Phase 1.9 §七 item 1 — every variant, not one draw.
      // renderSpecialBadge() picks Math.floor(Math.random() * 4), so asserting on
      // a single call is a coin flip: at HEAD index 2 of each language array was
      // the banned 'Barryjeva ljubav 💝' / "Barry's love 💝" / 'Barry 的爱 💝',
      // so the one-draw check passed whenever the draw happened to miss index 2.
      // Pinning Math.random to i/4 + 0.01 makes floor((i/4 + 0.01) * 4) === i, so
      // all four variants are visited deterministically and the assertion covers
      // the whole array instead of a sample of it.
      badgeVariants: (function () {
        if (typeof renderSpecialBadge !== 'function') return null;
        const el = document.getElementById('specialBadgeText');
        if (!el) return null;
        const orig = Math.random;
        const out = [];
        try {
          for (let i = 0; i < 4; i++) {
            Math.random = () => i / 4 + 0.01;
            renderSpecialBadge();
            out.push(el.textContent);
          }
        } catch (e) {
          return null;
        } finally {
          Math.random = orig;
        }
        return out;
      })(),
      // Phase 1.9 §七 item 4 — resolved against the LIVE DOM, not against
      // index.html's source. Two reasons that matters: js/fix-*.js can inject
      // markup at runtime, and an inline onclick is compiled with a scope chain
      // ending at the global scope, so it reaches top-level `const`/`let`
      // bindings that are NOT properties of window. typeof window[name] would
      // therefore report working handlers (js/weather.js exports a comma chain
      // of consts, e.g. clickSunCounter) as dead. new Function runs its body in
      // global scope, which is the same view the handler has.
      onclickCount: document.querySelectorAll('[onclick]').length,
      deadOnclick: (function () {
        const names = new Set();
        document.querySelectorAll('[onclick]').forEach((el) => {
          const m = /^\s*([A-Za-z_$][\w$]*)\s*\(/.exec(el.getAttribute('onclick') || '');
          if (m) names.add(m[1]);
        });
        const dead = [];
        for (const n of names) {
          let kind;
          try { kind = new Function('return typeof ' + n)(); } catch (e) { kind = 'THREW'; }
          if (kind !== 'function') dead.push(n + ':' + kind);
        }
        return dead.sort();
      })(),
    };
  }, { state: STATE_KEY, shared: SHARED_CYCLE_KEY });

  await ctx.close();
  return { observed, workerCalls, pageErrors };
}

(async () => {
  // ── A. the injector is gone from the source, not merely idle ──
  {
    const src = read('js/fix-stats.js');

    const seedArtifacts = ['defaultRecords', 'defaultPeriodEnds', '已注入默认周期记录'];
    const found = seedArtifacts.filter((s) => src.indexOf(s) !== -1);
    check('A1 the seed IIFE and its data are gone from js/fix-stats.js',
      found.length === 0, `still present=${found.join(',') || 'none'}`);

    // The dates themselves, in the form the seed wrote them.
    const dates = [/new Date\(\s*2026\s*,\s*4\s*,\s*28\s*\)/, /new Date\(\s*2026\s*,\s*5\s*,\s*24\s*\)/,
      /'2026-06-04'/, /'2026-07-02'/].filter((re) => re.test(src));
    check('A2 no hardcoded 2026 seed date or periodEnd survives in js/fix-stats.js',
      dates.length === 0, `patterns matched=${dates.length}`);

    // A tombstone, so a later "the empty state looks broken" change has to read
    // why this was removed before reintroducing it.
    check('A3 a tombstone records why the injector was removed',
      /Phase 1\.9/.test(src) && /shared state/.test(src),
      `phase19=${/Phase 1\.9/.test(src)} sharedState=${/shared state/.test(src)}`);

    // app.js: the one-record fresh-install default for andjela. Assert the code
    // SHAPE, not merely the absence of a date literal — the tombstone above names
    // the date it removed, so a bare literal scan would be tripped by the
    // documentation that exists to prevent the regression.
    const app = read('app.js');
    const seededShape = /activeProfile\s*===\s*'andjela'\s*\?\s*\[\s*new Date\(/.test(app);
    const seedLiteral = /new Date\(\s*2026\s*,\s*4\s*,\s*28\s*\)/.test(app);
    check('A4 app.js loadState() no longer pre-seeds an andjela period record',
      !seededShape && !seedLiteral && /records:\s*\[\s*\]/.test(app),
      `seededShape=${seededShape} seedLiteral=${seedLiteral} emptyRecordsDefault=${/records:\s*\[\s*\]/.test(app)}`);
  }

  // ── C. no system-generated string is presented as Barry's or Anđela's words ──
  // Phase 1.9 §一. The product may describe either of them, echo what they
  // actually typed, or sign a card with the app's own name — but a sentence the
  // system invented must never be shown as something they said.
  //
  // Block comments are stripped before every scan here, and that is load-bearing
  // rather than tidiness: the tombstones that exist to prevent these regressions
  // quote the very strings being banned, so a raw scan would flag the
  // documentation as the bug — the same trap A4 avoids for the seed date.
  {
    // js/i18n.js is in this list deliberately. It holds the largest concentration
    // of system-generated user-facing copy in the product (loveNoteSig,
    // sleepLateMsg, greeting.*), so it is where a well-meaning copy change would
    // land — and it was the one shipped file the C1/C4 scans did not read. C5
    // already covers its signatures; C1/C4 now cover its speaker attributions too.
    const CONTENT_FILES = ['app.js', 'js/i18n.js', 'js/weather.js', 'js/render-misc.js',
      'js/render-mood.js', 'js/render-love.js', 'js/module-dashboard.js',
      'js/social.js', 'js/module-memories.js'];
    // Both comment styles have to go. app.js writes its tombstones as // lines
    // while js/weather.js and js/render-misc.js write theirs as /* */ blocks, and
    // stripping only one style leaves the other's record of the removed string
    // looking like the string itself — which is exactly how the first run of this
    // section failed. Only whole-line // comments are stripped: a bare /\/\/.*/
    // pass would eat live code, because these files carry '//' inside API URLs.
    const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
    const code = {};
    for (const f of CONTENT_FILES) {
      try { code[f] = strip(read(f)); } catch (e) { code[f] = ''; }
    }
    const scan = (pairs) => {
      const hits = [];
      for (const f of CONTENT_FILES) {
        for (const [re, label] of pairs) if (re.test(code[f])) hits.push(f + ':' + label);
      }
      return hits;
    };

    // C1 — Barry named as the speaker of a first-person line. These are the exact
    // shapes removed from js/weather.js (the #weatherLove second line) and
    // js/render-misc.js (the toast): a 'Barry kaže:' / 'Barry says:' / 'Barry说：'
    // prefix, and the two "Barry was just thinking of you" toasts.
    const barryHits = scan([
      [/Barry kaže/, 'Barry kaže'], [/Barry says/, 'Barry says'], [/Barry说/, 'Barry说'],
      [/Barry je upravo pomislio/, 'Barry je upravo pomislio'],
      [/Barry was just thinking/, 'Barry was just thinking'],
      [/Barry 刚刚想到/, 'Barry 刚刚想到'],
    ]);
    check('C1 no system-generated string is attributed to Barry as its speaker',
      barryHits.length === 0, barryHits.join(', ') || 'none');

    // C2 — the toast function that carried them. js/render-misc.js kept a second
    // copy that no caller used; asserting the NAME is absent catches every copy
    // in every file, which scanning only the file you already know about would
    // not. The runtime half of this is C6.
    const toy = CONTENT_FILES.filter((f) => /randomThinkingOfYou/.test(code[f]));
    check('C2 the fake-Barry toast function is gone from every shipped file',
      toy.length === 0, toy.join(', ') || 'none');

    // C3 — the special badge, which §一 names explicitly. The live definition is
    // app.js's (it loads after render-misc.js and shadows it), so BOTH copies are
    // checked: the shadowed one is where a later script reorder would resurrect
    // the old text. Comments are already stripped above, so the tombstone that
    // records the removal does not trip this.
    // The marker must be the DEFINITION, not the name: app.js calls
    // renderSpecialBadge() at ~line 1266 and defines it at ~3333, so searching
    // for the bare name starts the slice at the call site and sweeps in hundreds
    // of lines of unrelated code that mention Barry — which is how this check
    // first failed on a file whose badge was already correct.
    const badgeRegion = (src) => {
      const i = src.indexOf('function renderSpecialBadge');
      if (i === -1) return '';
      const rest = src.slice(i);
      const end = rest.indexOf('function ', 10);
      return end === -1 ? rest.slice(0, 1200) : rest.slice(0, end);
    };
    const badgeBarry = ['app.js', 'js/render-misc.js']
      .filter((f) => /Barry/.test(badgeRegion(code[f])));
    check("C3 the special badge claims no feeling on Barry's behalf",
      badgeBarry.length === 0, badgeBarry.join(', ') || 'none');

    // C4 — the mirror image: nothing may speak as Anđela either. Nothing does
    // today, so this is the pin that keeps it that way. Note '— Anđelin Ciklus'
    // (the app's own name, and the only signature in the product) is not a match:
    // 'Anđelin' does not contain 'Anđela'.
    const andjelaHits = scan([
      [/Anđela kaže/, 'Anđela kaže'], [/Anđela says/, 'Anđela says'], [/Anđela说/, 'Anđela说'],
      [/Anđela je upravo/, 'Anđela je upravo'], [/Anđela was just/, 'Anđela was just'],
    ]);
    check('C4 no system-generated string is attributed to Anđela as its speaker',
      andjelaHits.length === 0, andjelaHits.join(', ') || 'none');

    // C8/C9 — the shapes C1/C4 are blind to BY CONSTRUCTION. C1/C4 match a
    // SPEAKER prefix ('Barry says:'), so they say nothing about a system string
    // that attributes an ACT, an AUTHORSHIP or a FEELING to one of the two
    // people: "Barry's tip: …", "Barry prati svaki tvoj ciklus", "Barry 陪着你
    // 走过每一个周期", "已标记 ✓ Barry在守护着你". All four shipped, and the
    // prefix scan reported clean the entire time — which is the reason these
    // checks exist rather than a fifth entry in the C1 list. The defect is the
    // same one §一 names: a real person did not write it and is not doing what
    // it claims.
    // 'Anđelin Ciklus' (the app's own name) is deliberately not a match: it does
    // not contain 'Anđela prati' / 'Anđela je uz tebe' as a substring, the same
    // trick C4 relies on.
    const actHits = scan([
      [/Barry['’]s\s+(tip|note|message|advice|words)/i, "Barry's tip"],
      [/Barry prati/, 'Barry prati'], [/Barry te čuva/, 'Barry te čuva'],
      [/Barry je uz tebe/, 'Barry je uz tebe'],
      [/Barry (is with you|walks with you|is watching over you|is looking after you)/i, 'Barry is with you'],
      [/Barry\s*(陪着你|在守护着你|守护着你)/, 'Barry 陪着你'],
    ]);
    check('C8 no system-generated string attributes an act, a tip or a feeling to Barry',
      actHits.length === 0, actHits.join(', ') || 'none');

    const andjelaActHits = scan([
      [/Anđela['’]s\s+(tip|note|message|advice|words)/i, "Anđela's tip"],
      [/Anđela prati/, 'Anđela prati'], [/Anđela te čuva/, 'Anđela te čuva'],
      [/Anđela je uz tebe/, 'Anđela je uz tebe'],
      [/Anđela (is with you|walks with you|is watching over you|is looking after you)/i, 'Anđela is with you'],
      [/Anđela\s*(陪着你|在守护着你|守护着你)/, 'Anđela 陪着你'],
    ]);
    check('C9 no system-generated string attributes an act, a tip or a feeling to Anđela',
      andjelaActHits.length === 0, andjelaActHits.join(', ') || 'none');

    // C10 — the largest surface of this defect was not JavaScript at all.
    // data/holidays.json carried system-authored `desc` copy that narrated the
    // two of them doing and saying things they never did, and no scan reached
    // it: CONTENT_FILES is JavaScript, and this is content. The invariant is
    // stated absolutely rather than as another pattern list, because a holiday
    // description has no legitimate reason to name either person — it describes
    // the holiday, not the couple. If a future edit wants to mention them, this
    // should stop it and force the conversation rather than let it through on a
    // pattern nobody updated.
    const HOLIDAY_FILES = ['data/holidays.json', 'dist/data/holidays.json'];
    const holidayBad = [];
    for (const f of HOLIDAY_FILES) {
      let raw;
      try { raw = read(f); } catch (e) { holidayBad.push(f + ':unreadable'); continue; }
      const named = (raw.match(/Barry|Anđela/g) || []).length;
      if (named > 0) holidayBad.push(f + ':' + named + ' name(s)');
      let parsed = null;
      try { parsed = JSON.parse(raw); } catch (e) { holidayBad.push(f + ':unparseable'); continue; }
      const entries = (parsed && parsed.holidays) || [];
      if (!entries.length) { holidayBad.push(f + ':no entries'); continue; }
      const thin = entries.filter((h) => !h || !h.desc || !h.desc.sr || !h.desc.zh || !h.desc.en);
      if (thin.length) holidayBad.push(f + ':' + thin.length + ' entry(s) missing a language');
    }
    check('C10 the holiday copy names neither person and stays complete in all three languages',
      holidayBad.length === 0, holidayBad.join(', ') || `checked ${HOLIDAY_FILES.length} files`);

    // C5 — a card signature must resolve to the app, not to a person. The love
    // note quotes classical verse (Su Shi, the Book of Songs); those lines are
    // quoted literature, so the signature is what tells the reader who is
    // speaking — and it has to be the app, because neither person wrote them.
    const i18n = read('js/i18n.js');
    const sigs = i18n.match(/loveNoteSig:"[^"]*"/g) || [];
    const namedSig = sigs.filter((s) => /Barry|Anđela/.test(s));
    check('C5 card signatures resolve to the app, not to a person',
      sigs.length >= 3 && namedSig.length === 0,
      `signatures=${sigs.length} namingAPerson=${namedSig.length} value=${sigs[0] || 'none'}`);

    // C5b/C5c — the love note, which §一 names first. This is the one surface
    // C1/C4 could not see, and the reason is structural rather than an oversight:
    // LOVE_NOTES held 150 hardcoded lines, every one of them first person and in
    // Barry's voice addressing Anđela, two of them naming him outright — and not
    // one carried a 'Barry kaže:' / 'Barry says:' prefix, because the entire
    // conceit is that he is the one speaking. C1 scans for attributive prefixes,
    // so it is blind to this shape by construction. C5 got close (it reads the
    // note's signature) but the signature was already correct: the app signed it
    // '— Anđelin Ciklus'. The lie was never in the signature. It was in the body.
    //
    // renderLoveNote() now hides the card rather than filling it, so there are two
    // properties to hold. C5b is that the copy has no caller left: the constant
    // survives in js/i18n.js as a corpse, and a corpse cannot speak — but only for
    // as long as nothing re-wires it, which is what scanning every other file for
    // the name establishes. js/i18n.js is excluded because that is where the
    // definition lives; it is the single occurrence of the identifier in the
    // shipped tree. C5c is the belt to that suspenders: the card is not populated
    // at all, so hiding it is not the only thing between those lines and a screen.
    // C5c also asserts the region is non-empty, so deleting renderLoveNote()
    // outright fails here instead of passing as a vacuous clean scan.
    const wired = CONTENT_FILES
      .filter((f) => f !== 'js/i18n.js')
      .filter((f) => /LOVE_NOTES/.test(code[f]));
    check('C5b the retired love-note copy has no caller in any shipped file',
      wired.length === 0, wired.join(', ') || 'none');

    // C5d — C5b generalised to the rest of the retired first-person family.
    // LOVE_NOTES is not the only corpse: these four are the other constants §一
    // was about, and each is a define-only symbol with exactly one home. "No file
    // other than its own may name it" catches a re-wire from anywhere at all
    // without hard-coding where that re-wire would happen, and — like C5b — it
    // allows the definitions to stay. The corpse may exist; it may not speak.
    const RETIRED = [
      ['loveNoteDefault', 'js/i18n.js'],
      ['specialBadgeTexts', 'js/i18n.js'],
      ['DAILY_LOVE_MESSAGES', 'js/weather.js'],
      ['getTodaysLoveMessage', 'js/weather.js'],
    ];
    const reWired = [];
    for (const [name, home] of RETIRED) {
      for (const f of CONTENT_FILES) {
        if (f === home) continue;
        if (new RegExp('\\b' + name + '\\b').test(code[f])) reWired.push(name + ' <- ' + f);
      }
    }
    check('C5d every retired first-person constant is read by no file but its own',
      reWired.length === 0, reWired.join(', ') || `checked ${RETIRED.length} symbols`);

    const loveNoteBody = (() => {
      const src = code['js/render-mood.js'];
      const i = src.indexOf('function renderLoveNote');
      if (i === -1) return '';
      const rest = src.slice(i);
      const end = rest.indexOf('function ', 10);
      return end === -1 ? rest.slice(0, 800) : rest.slice(0, end);
    })();
    const writesText = /loveNoteText/.test(loveNoteBody);
    check('C5c the love-note card is not populated with system-authored text',
      loveNoteBody.length > 0 && !writesText && /loveNoteCard/.test(loveNoteBody),
      `bodyLen=${loveNoteBody.length} writesText=${writesText} ` +
        `stillHidesCard=${/loveNoteCard/.test(loveNoteBody)}`);
  }

  // ── B. behaviour across four boot states ──
  const srv = await serve();
  const browser = await chromium.launch();

  {
    const { observed, workerCalls, pageErrors } = await boot(browser, {});
    check('B1 empty data does not auto-produce a period record',
      observed.booted && observed.records.length === 0,
      `booted=${observed.booted} records=[${observed.records.join(',')}]`);

    check('B2 a plain page load writes no shared-cycle-data',
      observed.sharedCycleData === null,
      `sharedCycleData=${observed.sharedCycleData === null ? 'absent' : observed.sharedCycleData}`);

    const puts = workerCalls.filter((c) => c.indexOf('PUT') === 0);
    check('B3 a plain page load pushes nothing to the Worker (no /state write)',
      puts.length === 0, `workerCalls=[${workerCalls.join(' | ') || 'none'}]`);

    check('B4 the empty boot raises no uncaught page error',
      pageErrors.length === 0, pageErrors.slice(0, 2).join(' | ') || 'none');

    // C6/C7 — the runtime halves of C2/C3, reusing this empty boot rather than
    // paying for a second page load. C2 proves no file defines the toast; this
    // proves the running app exposes no such global, which is the property that
    // actually decides whether a toast can fire. This is also the check that
    // caught js/render-misc.js's second copy: a scan naming js/weather.js alone
    // would have reported clean.
    check('C6 the fake-Barry toast is not defined at runtime',
      observed.hasFakeBarryToast === false,
      `randomThinkingOfYou defined=${observed.hasFakeBarryToast}`);

    // The badge is rendered for this profile, so the assertion is not vacuous —
    // if it ever stops rendering, that fails here rather than passing silently.
    // Requiring exactly 4 variants is the second half of that guard: if the array
    // shrinks, or renderSpecialBadge() stops resolving, this fails loudly instead
    // of comparing an empty list against the pattern and calling it clean.
    check('C7 every badge variant a user can see names no person',
      observed.badgeVisible === true &&
        Array.isArray(observed.badgeVariants) &&
        observed.badgeVariants.length === 4 &&
        observed.badgeVariants.every((s) => typeof s === 'string' && s.length > 0) &&
        observed.badgeVariants.every((s) => !/Barry|Anđela/.test(s)),
      `visible=${observed.badgeVisible} variants=${JSON.stringify(observed.badgeVariants)} ` +
        `loadTimeText=${JSON.stringify(observed.badgeText)}`);

    // D1 — §三's actual rule: no button anywhere throws on click. Asserting only
    // the three names the phase happened to list would have missed four more in
    // the diary panel (exportSharedDiary, showImportModal, shiftDiaryCalMonth ×2,
    // goDiaryCalToday) that came from the same never-committed js/render-diary.js.
    // The count guard keeps it non-vacuous: zero onclick attributes would
    // otherwise satisfy "no dead handlers" trivially.
    check('D1 every onclick handler in the rendered page resolves to a function',
      observed.deadOnclick.length === 0 && observed.onclickCount > 0,
      `handlers=${observed.onclickCount} dead=[${observed.deadOnclick.join(', ') || 'none'}]`);
  }

  {
    // One record is below the old `length < 2` trigger. It must be left alone,
    // not topped up to two.
    const { observed } = await boot(browser, { records: ONE_RECORD });
    const injected = INJECTED_DATES.filter((d) => observed.records.indexOf(d) !== -1);
    check('B5 fewer than two records does not auto-generate fake data',
      observed.records.length === ONE_RECORD.length && injected.length === 0,
      `records=[${observed.records.join(',')}] injected=[${injected.join(',') || 'none'}]`);
  }

  {
    const { observed } = await boot(browser, { records: THREE_RECORDS });
    check('B6 existing real records are not destroyed or reordered',
      observed.records.join(',') === THREE_RECORDS.join(','),
      `records=[${observed.records.join(',')}] expected=[${THREE_RECORDS.join(',')}]`);
  }

  // ── D. the dead entry points are gone from the source, not merely unreached ──
  // Phase 1.9 §三 + §七 items 4-5. D1 in section B proves the property against
  // the live DOM; these pin the source, so a later "the buttons are missing"
  // change has to read why they were removed before restoring them.
  {
    const html = read('index.html');

    // The three the phase named, plus the four it did not. All seven were onclick
    // targets of functions that exist nowhere in the repo: app.js says they were
    // "extracted to js/render-diary.js", and that file was never committed.
    const DEAD = ['exportAllData', 'importAllData', 'clearAllDiaries',
      'exportSharedDiary', 'showImportModal', 'shiftDiaryCalMonth', 'goDiaryCalToday'];
    const stillWired = DEAD.filter((n) => html.indexOf('onclick="' + n + '(') !== -1);
    check('D2 no button is wired to an undefined handler',
      stillWired.length === 0, stillWired.join(', ') || 'none');

    const ORPHAN_IDS = ['export-all-label', 'import-all-label', 'clear-diary-btn',
      'sd-export', 'sd-import', 'diaryCalMonthLabel'];
    const orphanEls = ORPHAN_IDS.filter((id) => html.indexOf('id="' + id + '"') !== -1);
    check("D3 the removed buttons' elements are gone from index.html",
      orphanEls.length === 0, orphanEls.join(', ') || 'none');

    // Both comment styles are stripped, for the reason section C documents: the
    // tombstones that prevent these regressions quote the very strings being
    // banned, so a raw scan reports the documentation as the bug.
    const stripAll = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

    const core = stripAll(read('js/ui-core.js'));
    const staleCases = ['export-data', 'import-data', 'clear-diary']
      .filter((a) => core.indexOf('"' + a + '"') !== -1);
    check('D4 the delegated click switch has no dead action cases',
      staleCases.length === 0, staleCases.join(', ') || 'none');

    // The trap this phase had to dodge twice: deleting an element while leaving
    // an UNGUARDED getElementById behind moves the crash from click-time to every
    // render. app.js's two sd-export/sd-import lines had no null check, which is
    // exactly why they could not simply be left alone.
    const appCode = stripAll(read('app.js'));
    const unguarded = ORPHAN_IDS.filter((id) => appCode.indexOf("getElementById('" + id + "')") !== -1);
    check('D5 no unguarded write to a removed element survives in app.js',
      unguarded.length === 0, unguarded.join(', ') || 'none');

    // §三 removed clearAllDiaries rather than restoring it BECAUSE it is
    // destructive with no safe scheme — so it must stay undefined, and every
    // destructive control that WAS kept must still confirm before acting.
    const allSrc = stripAll(['app.js', 'js/module-settings.js', 'js/fix-diary.js']
      .map((f) => read(f)).join('\n'));
    check('D6 the destructive clearAllDiaries is defined nowhere',
      allSrc.indexOf('clearAllDiaries') === -1,
      `defined=${allSrc.indexOf('clearAllDiaries') !== -1}`);

    const unconfirmed = [
      { fn: 'clearAllData', file: 'app.js' },
      { fn: 'clearAppSecret', file: 'js/module-settings.js' },
    ].filter((c) => {
      const src = read(c.file);
      const i = src.indexOf('function ' + c.fn + '(');
      // Missing counts as failure too: this asserts the guarded set, and a
      // silently absent function would otherwise satisfy it vacuously.
      return i === -1 || !/\bconfirm\(/.test(src.slice(i, i + 900));
    });
    check('D7 every retained destructive action still asks for confirmation',
      unconfirmed.length === 0,
      unconfirmed.map((c) => c.fn + '@' + c.file).join(', ') || 'clearAllData, clearAppSecret');

    // ── E: Phase 1.9 §五 — the panel-tips route is gone, not merely hidden ──
    // §五 asked that the unreachable panel stop producing dead render calls.
    // Pinning it at both levels matters: deleting only the markup would have
    // converted four silent no-ops into four hard TypeErrors, because app.js
    // dereferenced #panel-tips and #tips-list without null guards.
    const stripHtml = (s) => s.replace(/<!--[\s\S]*?-->/g, '');
    const htmlSrc = stripHtml(read('index.html'));
    const appNoComments = stripAll(read('app.js'));

    check('E1 no file still defines renderTips()',
      appNoComments.indexOf('function renderTips') === -1,
      `app.js defines=${appNoComments.indexOf('function renderTips') !== -1}`);

    check('E2 index.html has no live #panel-tips element',
      htmlSrc.indexOf('id="panel-tips"') === -1 && htmlSrc.indexOf('id="tips-list"') === -1,
      `panel-tips=${htmlSrc.indexOf('id="panel-tips"') !== -1} tips-list=${htmlSrc.indexOf('id="tips-list"') !== -1}`);

    check('E3 no tab or switchToTab target is named tips',
      htmlSrc.indexOf('data-panel="tips"') === -1 && htmlSrc.indexOf("switchToTab('tips')") === -1,
      `data-panel=${htmlSrc.indexOf('data-panel="tips"') !== -1} switchToTab=${htmlSrc.indexOf("switchToTab('tips')") !== -1}`);

    // app.js:1348 (pre-deletion) was the only unguarded #panel-tips deref in the
    // repo. Removing the markup without removing that line would have moved a
    // click-time no-op to a render-time throw — the trap §三 already hit twice.
    check('E4 app.js no longer dereferences #panel-tips',
      appNoComments.indexOf("getElementById('panel-tips')") === -1,
      `derefs=${appNoComments.indexOf("getElementById('panel-tips')") !== -1}`);

    // js/sync.js is the one reference deliberately left in place: its call is
    // guarded, so it degrades to a no-op. Asserting the guard is still there is
    // the point — a bare call left behind in a sync file would throw on every
    // pull, and §六 forbids touching sync anyway.
    const syncSrc = stripAll(read('js/sync.js'));
    const syncGuarded = /if \(typeof renderTips === 'function'\)/.test(syncSrc);
    const syncBare =
      (syncSrc.replace(/if \(typeof renderTips === 'function'\)[^\n]*/g, '').match(/renderTips\(\)/g) || []).length > 0;
    check('E5 the surviving renderTips reference in js/sync.js is still guarded',
      syncGuarded && !syncBare, `guarded=${syncGuarded} unguardedCall=${syncBare}`);

    // ── F: Phase 1.9 §四 — one canonical source for the anniversary dates ──
    // app.js resolved the same pair in three separate places and spelled the two
    // defaults out in six. These pin that app.js now has exactly one of each, so
    // a later edit cannot quietly reintroduce a second source that disagrees.
    //
    // Scope, stated deliberately: this covers app.js only. The same two literals
    // still appear in js/module-dashboard.js, js/module-settings.js,
    // js/module-memories.js and twice inside minified js/weather.js. They agree
    // today, and rewriting four more files for that was judged a worse trade than
    // reporting them — see the phase report's backlog.
    const accessorDefs = appNoComments.split('function getAnnDates()').length - 1;
    check('F1 getAnnDates() is defined exactly once, in app.js',
      accessorDefs === 1, `definitions=${accessorDefs}`);

    const rawReads = (appNoComments.match(/localStorage\.getItem\('cycle-ann-(met|love)'\)/g) || []).length;
    check('F2 app.js never reads the anniversary keys outside the accessor',
      rawReads === 0, `raw localStorage reads=${rawReads}`);

    const defaultLits = (appNoComments.match(/'(2026-03-19|2026-05-07)'/g) || []).length;
    check('F3 app.js spells the anniversary defaults exactly twice (one const pair)',
      defaultLits === 2, `default literals=${defaultLits}`);

    // The §四 live bug: this panel read the Settings *input element*, so before
    // loadSettingsUI() had run it badged whatever the static HTML attribute
    // said — the wrong day, decided purely by render order.
    const fdSrc = stripAll(read('js/fix-diary.js'));
    check('F4 js/fix-diary.js reads the accessor, not the Settings inputs',
      fdSrc.indexOf("getElementById('annDateMet')") === -1 && fdSrc.indexOf('getAnnDates') !== -1,
      `readsInput=${fdSrc.indexOf("getElementById('annDateMet')") !== -1} usesAccessor=${fdSrc.indexOf('getAnnDates') !== -1}`);
  }

  await browser.close();
  srv.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
