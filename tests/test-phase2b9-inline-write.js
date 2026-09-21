/**
 * Phase 2B.9 — the write row opens the diary editor in place.
 *
 * Phase 2B.8 put a row at the top of Memories that scrolled down to the existing
 * write card. This round keeps the row and changes what it does: the three nodes
 * the diary panel owns for writing — .diary-date-strip-wrap, #diaryFullCal and
 * #diaryWriteCard — are MOVED (never copied) into a host inside #memRoot, and
 * moved back before the next rebuild. No scroll, no modal, no second editor, no
 * new data model, and the save path is untouched.
 *
 * Both halves are testable, so both are tested here:
 *   - static: the copy lives in the module's OWN MEM_I18N table in three locales,
 *     the host is emitted right after the button, the nodes are parked BEFORE the
 *     innerHTML rebuild (the one ordering that keeps the diary alive), nothing in
 *     the module scrolls any more, and the module still writes no storage;
 *   - behavioural: the row moves the REAL #diaryWriteCard into the Memories area
 *     above #memFeatured, the page does not scroll, the date strip comes with it
 *     so a past day is still selectable, a past day can still be saved through
 *     #diarySaveBtn into the existing {text,mood,time} shape, and — the exact
 *     regression the park exists to prevent — after a tab away and back
 *     #diaryWriteCard is still there and #diaryTextarea still takes input.
 *
 * Touches nothing: reads the repo over local HTTP into a throwaway browser
 * context and seeds synthetic storage. Every Worker request is fulfilled
 * locally; GitHub/weather/translate are aborted. No production data is read or
 * written, and only synthetic sentences are typed.
 *
 * Run: node tests/test-phase2b9-inline-write.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8937;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

const APP_KEY = 'test-app-key-phase2b9-000000000000000000000';
const SYNTH = 'Synthetic sentence — not a real memory.';
const TYPED = 'Synthetic in-place diary sentence — not a real memory.';
/* Days of synthetic story. 10 days back in steps of two reaches 18 days, past
   FEATURED_MIN_AGE (7) — without one memory that old #memFeatured is not rendered
   at all and "the editor ends up above the featured card" would have nothing to
   be above. It also puts real distance between the row and the write card, which
   is what the "far smaller than the old travel" assertion needs. */
const SEED = 10;

/** The collapse label, as specified for this round. sr is the app's base locale. */
const COPY = {
  'zh-CN': '收起日记',
  sr: 'Sakrij dnevnik',
  en: 'Hide the diary',
};
/** The collapsed label, already pinned by Phase 2B.8 — unchanged this round. */
const OPEN_COPY = {
  'zh-CN': '写一篇日记',
  sr: 'Napiši dnevnik',
  en: 'Write a diary entry',
};

const VIEWPORTS = [
  { tag: '320', w: 320, h: 800 },
  { tag: '768', w: 768, h: 1024 },
  { tag: '1440', w: 1440, h: 900 },
];

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

/** Local-date key N days back — the same YYYY-MM-DD keying fix-diary.js uses. */
function dayKeyAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const p = (x) => (x < 10 ? '0' : '') + x;
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

/** `count` synthetic days, in the exact shape saveDiaryEntry writes. */
function diarySeed(count) {
  const o = {};
  for (let i = 0; i < count; i++) {
    o[dayKeyAgo(i * 2)] = {
      barry: { text: SYNTH, mood: '', time: Date.now() - i * 2 * 86400000 },
    };
  }
  return o;
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
 * One boot: seed `count` synthetic days in `language`, open the 回忆 tab the way
 * a person does (a real click on the tab), and leave the page ready to poke at.
 * Every Worker request is answered locally and recorded, so a PUT can be
 * asserted; api.github.com, open-meteo and the translate endpoints are aborted.
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
    } catch (e) { /* ignore */ }
  }, { lang: L, appKey: APP_KEY, diary: diarySeed(opts.count || 0) });

  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message.split('\n')[0]));
  const workerCalls = [];
  await page.route('**/*', (route) => {
    const req = route.request();
    const u = req.url();
    const origin = req.headers()['origin'];
    const cors = origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {};
    if (u.indexOf('workers.dev') !== -1) {
      workerCalls.push(req.method() + ' ' + u.replace(/^https:\/\/[^/]+/, ''));
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
  await page.waitForTimeout(opts.settle || 1500);
  return { ctx, page, errs, workerCalls };
}

/**
 * Everything the expand assertion needs, in one pass, read from the live DOM.
 * `cardDocTop` is the card's offset from the top of the document and therefore
 * exactly the distance the old scrollIntoView had to travel; `cardTop` is where
 * it sits in the viewport. Both are taken with the page pinned at scrollY 0.
 */
const MEASURE = function () {
  const cta = document.getElementById('memWriteCta');
  const host = document.getElementById('memWriteHost');
  const card = document.getElementById('diaryWriteCard');
  const strip = document.querySelectorAll('.diary-date-strip-wrap')[0];
  const feat = document.getElementById('memFeatured');
  const root = document.getElementById('memRoot');
  const y = window.scrollY;
  const rect = (el) => (el ? el.getBoundingClientRect() : null);
  const r = rect(cta), cb = rect(card), hb = rect(host), fb = rect(feat);
  return {
    ctaText: cta ? cta.textContent.replace(/\s+/g, ' ').trim() : null,
    ctaHeight: r ? Math.round(r.height) : null,
    ctaRight: r ? Math.round(r.right) : null,
    ctaAria: cta ? cta.getAttribute('aria-expanded') : null,
    ctaOpenClass: cta ? cta.classList.contains('is-open') : null,
    hostExists: !!host,
    hostOpen: host ? host.classList.contains('is-open') : null,
    hostChildren: host ? host.children.length : null,
    cardInHost: !!(card && host && host.contains(card)),
    cardInRoot: !!(card && root && root.contains(card)),
    /* "above #memFeatured" is asserted geometrically as well as structurally,
       because a moved node can be in the DOM and still be laid out below it. */
    cardAboveFeatured: !!(cb && fb) && cb.top < fb.top,
    stripInHost: !!(strip && host && host.contains(strip)),
    stripDateButtons: strip ? strip.querySelectorAll('.diary-date-btn[data-date]').length : 0,
    cardTop: cb ? Math.round(cb.top) : null,
    cardDocTop: cb ? Math.round(cb.top + y) : null,
    hostTop: hb ? Math.round(hb.top) : null,
    scrollY: Math.round(y),
    docScrollWidth: document.documentElement.scrollWidth,
    docClientWidth: document.documentElement.clientWidth,
    hasTextarea: !!document.getElementById('diaryTextarea'),
    textareaInHost: !!(host && document.getElementById('diaryTextarea') &&
      host.contains(document.getElementById('diaryTextarea'))),
    saveBtnInHost: !!(host && document.getElementById('diarySaveBtn') &&
      host.contains(document.getElementById('diarySaveBtn'))),
    calInHost: !!(host && document.getElementById('diaryFullCal') &&
      host.contains(document.getElementById('diaryFullCal'))),
    /* Where the card lives when it is NOT expanded — the .lpc-row fix-diary.js
       builds at runtime, or the panel itself. */
    panelChildren: Array.prototype.slice.call(
      (document.getElementById('panel-diary') || { children: [] }).children
    ).map((k) => (k.id ? '#' + k.id : '.' + String(k.className).split(' ')[0])),
    cardParent: card && card.parentNode
      ? (card.parentNode.id ? '#' + card.parentNode.id : '.' + String(card.parentNode.className).split(' ')[0])
      : null,
    /* The partner letter sits in the same .lpc-row the write card comes out of,
       so its position is the thing to watch: borrowing one card must not shuffle
       the other. */
    partnerParent: (() => {
      const pc = document.getElementById('letterPartnerCard');
      return pc && pc.parentNode
        ? (pc.parentNode.id ? '#' + pc.parentNode.id : '.' + String(pc.parentNode.className).split(' ')[0])
        : null;
    })(),
    dayKeys: Object.keys(JSON.parse(localStorage.getItem('shared-diary') || '{}')).length,
  };
};

/**
 * The diary's own flow, driven the way a person drives it AFTER expanding: pick a
 * past day in the (now moved) strip, type into the real textarea, press the real
 * #diarySaveBtn, then read back what landed in shared-diary. The day key is taken
 * from the button's own data-date rather than assumed, so the assertion is about
 * the wiring and not about which day the strip happens to default to.
 */
const DIARY_FLOW = async function (sentence) {
  const p = (x) => (x < 10 ? '0' : '') + x;
  const d = new Date();
  const today = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  const btns = Array.prototype.slice.call(document.querySelectorAll('.diary-date-btn'))
    .filter((b) => b.getAttribute('data-date'));
  const target = btns.find((b) => b.getAttribute('data-date') < today) || btns[0];
  if (!target) return { ok: false, why: 'no date buttons in the strip' };
  const chosen = target.getAttribute('data-date');
  target.click();
  await new Promise((r) => setTimeout(r, 400));

  const ta = document.getElementById('diaryTextarea');
  if (!ta) return { ok: false, why: 'no #diaryTextarea after a date switch', chosen };
  ta.value = sentence;
  ta.dispatchEvent(new Event('input', { bubbles: true }));
  ta.dispatchEvent(new Event('change', { bubbles: true }));

  const btn = document.getElementById('diarySaveBtn');
  if (!btn) return { ok: false, why: 'no #diarySaveBtn', chosen };
  btn.click();
  await new Promise((r) => setTimeout(r, 1400));

  let parsed = null;
  try { parsed = JSON.parse(localStorage.getItem('shared-diary') || 'null'); } catch (e) {}
  const slot = parsed && parsed[chosen] ? parsed[chosen] : null;
  return {
    ok: true,
    chosen,
    savedToChosen: !!slot,
    savedText: slot && slot.barry ? slot.barry.text : null,
    savedShape: slot && slot.barry ? Object.keys(slot.barry).sort().join(',') : null,
    dayKeys: parsed ? Object.keys(parsed).length : null,
    chosenIsPast: chosen < today,
  };
};

/** Park the page at the top and wait for the position to stop moving. */
const settle = async (page, target) => {
  await page.evaluate((y) => window.scrollTo(0, y), target);
  let y = -1;
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(300);
    const now = await page.evaluate(() => Math.round(window.scrollY));
    if (now === y) return now;
    y = now;
  }
  return y;
};

(async () => {
  // ── I1..I6 — static: where the copy lives, what is emitted, what is not ──
  const memSrc = read('js/module-memories.js');
  {
    // I1 — the copy is in MEM_I18N and nowhere else, in all three locales.
    const inTable = Object.keys(COPY).filter((k) => memSrc.indexOf("writeCollapse: '" + COPY[k] + "'") !== -1);
    check('I1 MEM_I18N carries the collapse label in all three locales',
      inTable.length === 3,
      `found=${inTable.join(',') || 'none'} missing=${Object.keys(COPY).filter((k) => inTable.indexOf(k) === -1).join(',') || 'none'}`);

    const elsewhere = ['js/i18n.js', 'app.js', 'index.html']
      .filter((f) => read(f).indexOf('writeCollapse') !== -1 || read(f).indexOf(COPY['zh-CN']) !== -1);
    check('I1b the copy exists only in MEM_I18N — no second i18n mechanism',
      elsewhere.length === 0, `also-present-in=${elsewhere.join(',') || 'none'}`);

    // The Phase 2B.8 label is untouched: this round adds a second state, it does
    // not rename the first one.
    const kept = Object.keys(OPEN_COPY).filter((k) => memSrc.indexOf("writeCta: '" + OPEN_COPY[k] + "'") !== -1);
    check('I1c the collapsed label is still the Phase 2B.8 copy, unchanged',
      kept.length === 3, `found=${kept.join(',') || 'none'}`);

    // I2 — the host is emitted immediately after the button, as a sibling.
    const emit = memSrc.match(/function _writeCtaHtml\(\) \{[\s\S]*?\n  \}/);
    const emitSrc = emit ? emit[0] : '';
    const iBtn = emitSrc.indexOf("'</button>'");
    const iHost = emitSrc.indexOf('<div class="mem-write-host" id="memWriteHost"></div>');
    check('I2 _writeCtaHtml emits #memWriteHost as a sibling right after the button',
      iBtn !== -1 && iHost !== -1 && iHost > iBtn,
      `buttonEnd=${iBtn} host=${iHost}`);

    // I3 — the park call must precede the innerHTML rebuild. This is the whole
    // safety argument: one line later and the write card is destroyed.
    const fnAt = memSrc.indexOf('function _render() {');
    const body = fnAt === -1 ? '' : memSrc.slice(fnAt, fnAt + 2500);
    const iPad = body.indexOf('_parkDiaryNodes();');
    const iHtml = body.indexOf('host.innerHTML = _headHtml()');
    check('I3 _render() parks the borrowed nodes before it rebuilds innerHTML',
      fnAt !== -1 && iPad !== -1 && iHtml !== -1 && iPad < iHtml,
      `renderAt=${fnAt} park=${iPad} innerHTML=${iHtml}`);

    // I4 — nothing scrolls any more, and the function that used to is gone.
    const scrolls = memSrc.split('scrollIntoView').length - 1;
    check('I4 the module no longer scrolls at all, and _goToDiary is gone',
      scrolls === 0 && memSrc.indexOf('_goToDiary') === -1,
      `scrollIntoView=${scrolls} goToDiary=${memSrc.indexOf('_goToDiary') !== -1}`);

    // I5 — still no new state. The borrow is in-memory only: no storage, no URL.
    const writes = [
      /localStorage\.setItem/.test(memSrc) ? 'localStorage.setItem' : '',
      /sessionStorage\.setItem/.test(memSrc) ? 'sessionStorage.setItem' : '',
      /history\.(replace|push)State/.test(memSrc) ? 'history.*State' : '',
    ].filter(Boolean);
    check('I5 the module still writes no storage and adds no scroll state',
      writes.length === 0, `found=${writes.join(',') || 'none'}`);

    // I6 — the save path this round must not have touched.
    const fixDiary = read('js/fix-diary.js');
    check('I6 the save path is untouched: saveDiaryEntry → shared-diary → pushAllSharedData',
      /sd\[dateKey\]\[user\]\.text = text; sd\[dateKey\]\[user\]\.mood = mood; sd\[dateKey\]\[user\]\.time = Date\.now\(\);/.test(fixDiary) &&
      /localStorage\.setItem\('shared-diary'/.test(fixDiary),
      'saveDiaryEntry writes the same three fields');

    // The stylesheet half: collapsed must be invisible AND zero-height.
    const css = read('css/v2.css');
    const closed = css.match(/\.mem-write-host \{\s*display: none;\s*\}/);
    const open = css.match(/\.mem-write-host\.is-open \{\s*display: block;\s*\}/);
    check('I6b collapsed the host is display:none (zero height, not merely transparent)',
      !!closed && !!open, `closed=${!!closed} open=${!!open}`);
    check('I6c the host adds no card chrome of its own — the write card keeps its own look',
      !/\.mem-write-host[^{]*\{[^}]*(background|border-radius|box-shadow|padding)/.test(css),
      'no background/border-radius/box-shadow/padding on the host');
  }

  // ── I7..I12 — behaviour, in a real browser at the three widths ──
  const srv = await serve();
  const browser = await chromium.launch();

  for (const vp of VIEWPORTS) {
    const { ctx, page, errs } = await boot(browser, vp, { count: SEED, lang: 'zh-CN' });

    await page.waitForTimeout(1800);
    const held = await settle(page, 0);
    const before = await page.evaluate(MEASURE);

    await page.click('#memWriteCta');
    await page.waitForTimeout(600);
    const after = await page.evaluate(MEASURE);

    check(`I7 [${vp.tag}] the row expands the real editor inside the Memories area`,
      after.cardInHost && after.cardInRoot && after.hostOpen && after.hostChildren === 3,
      `inHost=${after.cardInHost} inRoot=${after.cardInRoot} open=${after.hostOpen} hostKids=${after.hostChildren}`);

    // Geometrically, not just structurally: the card must be laid out inside the
    // host's block (below the strip and the calendar, which come first) and above
    // the featured memory.
    check(`I8 [${vp.tag}] the editor ends up above #memFeatured`,
      after.cardAboveFeatured && after.cardTop >= after.hostTop,
      `cardTop=${after.cardTop} hostTop=${after.hostTop} aboveFeatured=${after.cardAboveFeatured}`);

    // The point of the round: the editor comes to the row instead of the page
    // travelling to the editor. `before.cardDocTop` IS the old travel distance.
    check(`I9 [${vp.tag}] the editor is far nearer than the scroll it replaced`,
      before.cardTop !== null && after.cardTop !== null &&
      after.cardTop <= before.cardDocTop - 300,
      `oldTravel=${before.cardDocTop}px expandedTop=${after.cardTop}px`);

    check(`I10 [${vp.tag}] the page did not scroll`,
      Math.abs(after.scrollY - before.scrollY) <= 2,
      `before=${before.scrollY} after=${after.scrollY} (settled at ${held})`);

    check(`I11 [${vp.tag}] the date strip came along, so a past day is still reachable`,
      after.stripInHost && after.stripDateButtons > 0 && after.calInHost,
      `stripInHost=${after.stripInHost} dateButtons=${after.stripDateButtons} calInHost=${after.calInHost}`);

    check(`I12 [${vp.tag}] the textarea and the save button moved with it`,
      after.hasTextarea && after.textareaInHost && after.saveBtnInHost,
      `textarea=${after.hasTextarea} inHost=${after.textareaInHost} saveInHost=${after.saveBtnInHost}`);

    check(`I13 [${vp.tag}] no horizontal overflow, and the row is still >= 44px`,
      after.docScrollWidth <= after.docClientWidth && after.ctaHeight >= 44 &&
      after.ctaRight <= after.docClientWidth,
      `scrollWidth=${after.docScrollWidth} clientWidth=${after.docClientWidth} ctaRight=${after.ctaRight} height=${after.ctaHeight}`);

    // Substring, not equality: the button's text also carries the ✍️ and the ›.
    check(`I14 [${vp.tag}] the row now reads as the collapse label and says so accessibly`,
      after.ctaText.indexOf(COPY['zh-CN']) !== -1 && after.ctaAria === 'true' && after.ctaOpenClass === true,
      `text="${after.ctaText}" aria-expanded=${after.ctaAria}`);

    // And it is a toggle: a second tap puts everything back where it came from —
    // including the write card, which must return to the .lpc-row it came out of
    // rather than to the panel's own child list.
    await page.click('#memWriteCta');
    await page.waitForTimeout(500);
    const collapsed = await page.evaluate(MEASURE);
    check(`I15 [${vp.tag}] a second tap restores the panel exactly as it was`,
      collapsed.ctaText.indexOf(OPEN_COPY['zh-CN']) !== -1 && collapsed.ctaAria === 'false' &&
      !collapsed.cardInHost && collapsed.hostChildren === 0 &&
      collapsed.stripDateButtons > 0 && collapsed.saveBtnInHost === false &&
      collapsed.cardParent === before.cardParent &&
      collapsed.panelChildren.join(',') === before.panelChildren.join(','),
      `text="${collapsed.ctaText}" inHost=${collapsed.cardInHost} hostKids=${collapsed.hostChildren} ` +
      `children=${collapsed.panelChildren.join(',')} was=${before.panelChildren.join(',')} cardParent=${collapsed.cardParent}`);

    check(`I15b [${vp.tag}] the partner's letter never moved while the editor was borrowed`,
      after.partnerParent === before.partnerParent && collapsed.partnerParent === before.partnerParent,
      `before=${before.partnerParent} expanded=${after.partnerParent} collapsed=${collapsed.partnerParent}`);

    check(`I16 [${vp.tag}] no page errors during boot`,
      errs.length === 0, errs.slice(0, 2).join(' | ') || 'none');
    await ctx.close();
  }

  // ── I17..I18 — the three locales, driven by changing the app's own language
  // and re-rendering, then expanding in that locale.
  {
    const { ctx, page, errs } = await boot(browser, VIEWPORTS[0], { count: SEED, lang: 'zh-CN' });
    for (const L of ['zh-CN', 'sr', 'en']) {
      const collapsed = await page.evaluate((l) => {
        window.lang = l;
        window.initSharedDiaryTab();
        const cta = document.getElementById('memWriteCta');
        return cta ? cta.textContent.replace(/\s+/g, ' ').trim() : '';
      }, L);
      await page.waitForTimeout(400);
      await page.click('#memWriteCta');
      await page.waitForTimeout(400);
      const open = await page.evaluate(() => {
        const cta = document.getElementById('memWriteCta');
        const host = document.getElementById('memWriteHost');
        const card = document.getElementById('diaryWriteCard');
        return {
          text: cta ? cta.textContent.replace(/\s+/g, ' ').trim() : '',
          inHost: !!(host && card && host.contains(card)),
        };
      });
      check(`I17 [${L}] both states render that locale's own string`,
        collapsed.indexOf(OPEN_COPY[L]) !== -1 && open.text.indexOf(COPY[L]) !== -1 && open.inHost,
        `collapsed="${collapsed}" expanded="${open.text}" inHost=${open.inHost}`);
      await page.click('#memWriteCta');
      await page.waitForTimeout(300);
    }
    check('I18 no page errors across the locale switches',
      errs.length === 0, errs.slice(0, 2).join(' | ') || 'none');
    await ctx.close();
  }

  // ── I19..I22 — the diary still does its job, end to end, expanded: date
  // switch + edit + save + Worker push in one pass. This is the "provably
  // unchanged save path" claim, driven through the real controls.
  {
    const { ctx, page, workerCalls } = await boot(browser, VIEWPORTS[0], { count: SEED, lang: 'zh-CN' });
    await page.click('#memWriteCta');
    await page.waitForTimeout(500);
    const flow = await page.evaluate(DIARY_FLOW, TYPED);
    check('I19 expanded, a past day can be selected, edited and saved to exactly that day',
      flow.ok && flow.chosenIsPast && flow.savedToChosen && flow.savedText === TYPED,
      JSON.stringify(flow));

    check('I20 the saved slot keeps the shared-diary shape (text/mood/time)',
      flow.ok && flow.savedShape === 'mood,text,time', `shape=${flow.savedShape}`);

    await page.waitForTimeout(600);
    const pushed = workerCalls.filter((c) => c.indexOf('PUT') === 0);
    check('I21 the save still reaches the Worker (shared-diary is pushed, not just stored)',
      pushed.length > 0, `PUTs=${pushed.slice(0, 3).join(' | ') || 'none'} of ${workerCalls.length} worker calls`);

    check('I22 saving added exactly one day key and left the rest alone',
      flow.dayKeys === SEED + 1, `dayKeys=${flow.dayKeys} expected=${SEED + 1} (${SEED} seeded + 1 saved)`);
    await ctx.close();
  }

  // ── I23..I25 — the hazard itself. Expanded, then a re-render of #memRoot runs
  // (switching tabs is what a person does), and the write card must exist
  // afterwards. Without the park it is destroyed and every later
  // getElementById('diaryWriteCard') is null — silently, with no error. Coming
  // back at all is I24; coming back in the state the reader left it in is I25.
  {
    const { ctx, page, errs } = await boot(browser, VIEWPORTS[0], { count: SEED, lang: 'zh-CN' });
    await page.click('#memWriteCta');
    await page.waitForTimeout(500);
    const opened = await page.evaluate(() => {
      const host = document.getElementById('memWriteHost');
      return !!host && host.contains(document.getElementById('diaryWriteCard'));
    });

    await page.click('.tab[data-panel="dashboard"]');
    await page.waitForTimeout(600);
    await page.click('.tab[data-panel="diary"]');
    await page.waitForTimeout(2600);

    const survivor = await page.evaluate(async () => {
      const card = document.getElementById('diaryWriteCard');
      const ta = document.getElementById('diaryTextarea');
      const host = document.getElementById('memWriteHost');
      let typed = null;
      if (ta) {
        ta.value = '';
        ta.focus();
        ta.value = 'x';
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        typed = ta.value;
      }
      return {
        card: !!card,
        textarea: !!ta,
        typed: typed,
        hostOpen: host ? host.classList.contains('is-open') : null,
        cardInHost: !!(host && card && host.contains(card)),
        cardParent: card && card.parentNode
          ? (card.parentNode.id ? '#' + card.parentNode.id : '.' + String(card.parentNode.className).split(' ')[0])
          : null,
        saveBtn: !!document.getElementById('diarySaveBtn'),
        strip: document.querySelectorAll('.diary-date-strip-wrap').length,
        cal: !!document.getElementById('diaryFullCal'),
      };
    });

    check('I23 the card was genuinely expanded before the re-render',
      opened, `expandedBefore=${opened}`);

    check('I24 after a tab away and back #diaryWriteCard still exists and #diaryTextarea still takes input',
      survivor.card && survivor.textarea && survivor.typed === 'x' && survivor.saveBtn &&
      survivor.strip === 1 && survivor.cal,
      JSON.stringify(survivor));

    check('I25 and the re-render left it open, still in the host where the reader left it',
      survivor.hostOpen === true && survivor.cardInHost === true && survivor.cardParent === '#memWriteHost',
      `hostOpen=${survivor.hostOpen} cardInHost=${survivor.cardInHost} cardParent=${survivor.cardParent}`);

    check('I26 no page errors during the re-render cycle',
      errs.length === 0, errs.slice(0, 2).join(' | ') || 'none');
    await ctx.close();
  }

  await browser.close();
  srv.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
