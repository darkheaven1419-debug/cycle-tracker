/**
 * Phase 2B.8 — the "write a diary entry" entry point at the top of Memories.
 *
 * The diary editor was never broken and never removed. It is simply far away:
 * #memRoot is #panel-diary's first child, so the more the couple writes, the
 * further down the write card sinks (measured at 320x800: +415px with 0 entries,
 * +6822px with 100). This round adds one row near the top of Memories that says
 * "you can write here too" and — only on a real tap — scrolls to the existing
 * card. Nothing was deleted, duplicated or re-modelled.
 *
 * Both halves of that claim are testable, so both are tested here:
 *   - static: the copy lives in the module's OWN MEM_I18N table (three locales,
 *     no second i18n mechanism), the button is emitted between the story's
 *     opening and the featured card, it is a <button> with no inline onclick,
 *     the handler scrolls and does nothing else, and nothing anywhere
 *     auto-scrolls;
 *   - behavioural: at 320/768/1440 the row renders inside #memRoot, is at least
 *     44px tall, never overflows horizontally, says the right thing in each of
 *     the three languages, does NOT move the page when the tab merely opens,
 *     DOES reach the write card when tapped, and leaves date switching, editing
 *     and saving — including the Worker push — exactly as they were.
 *
 * Touches nothing: reads the repo over local HTTP into a throwaway browser
 * context and seeds synthetic storage. Every Worker request is fulfilled
 * locally; GitHub/weather/translate are aborted. No production data is read or
 * written, and only synthetic sentences are typed.
 *
 * Run: node tests/test-phase2b8-write-cta.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8936;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

const APP_KEY = 'test-app-key-phase2b8-000000000000000000000';
const SYNTH = 'Synthetic sentence — not a real memory.';
const TYPED = 'Synthetic diary sentence — not a real memory.';
/* Days of synthetic story. 10 days back in steps of two reaches 18 days, which
   is past FEATURED_MIN_AGE (7) — without at least one memory that old the
   featured card is not rendered at all and the placement assertion below would
   have nothing to sit between. */
const SEED = 10;

/** The copy, as specified for this round. Serbian is the app's base locale. */
const COPY = {
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

/** Geometry of the CTA row plus the horizontal-overflow answer, in one pass. */
const MEASURE = function () {
  const cta = document.getElementById('memWriteCta');
  const wc = document.getElementById('diaryWriteCard');
  const strip = document.querySelector('#panel-diary .diary-date-strip');
  const root = document.getElementById('memRoot');
  const vh = window.innerHeight;
  if (!cta) return { exists: false };
  const r = cta.getBoundingClientRect();
  const within = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { top: Math.round(b.top), bottom: Math.round(b.bottom), inView: b.top < vh && b.bottom > 0 };
  };
  return {
    exists: true,
    insideMemRoot: !!cta.closest('#memRoot'),
    text: cta.textContent.replace(/\s+/g, ' ').trim(),
    height: Math.round(r.height),
    top: Math.round(r.top),
    right: Math.round(r.right),
    tag: cta.tagName.toLowerCase(),
    type: cta.getAttribute('type'),
    inlineOnclick: cta.hasAttribute('onclick'),
    /* The render chain must place it after the story's opening and before the
       featured card, so its index among #memRoot's children sits between theirs.
       Phase 2E fills the card into #memFeaturedBox instead of into the innerHTML
       string, so the card is now a grandchild of #memRoot — the box is the child
       whose position orders it. `hasFeaturedCard` keeps the ordering claim from
       being satisfied by an empty box. */
    childIndex: root ? Array.prototype.indexOf.call(root.children, cta) : -1,
    anchorIndex: root ? Array.prototype.indexOf.call(root.children, document.getElementById('memAnchor')) : -1,
    featuredIndex: root ? Array.prototype.indexOf.call(root.children, document.getElementById('memFeaturedBox')) : -1,
    hasFeaturedCard: !!document.getElementById('memFeatured'),
    writeCard: within(wc),
    dateStrip: within(strip),
    hasTextarea: !!document.getElementById('diaryTextarea'),
    dateButtons: document.querySelectorAll('#panel-diary .diary-date-btn').length,
    scrollY: Math.round(window.scrollY),
    docScrollWidth: document.documentElement.scrollWidth,
    docClientWidth: document.documentElement.clientWidth,
    dayKeys: Object.keys(JSON.parse(localStorage.getItem('shared-diary') || '{}')).length,
  };
};

/**
 * The diary's own flow, driven the way a person drives it: pick a past day in
 * the strip, type into the real textarea, press the real save button, then read
 * back what landed in shared-diary. The day key is taken from the button's own
 * data-date rather than assumed, so the assertion is about the wiring and not
 * about which day the strip happens to default to.
 */
const DIARY_FLOW = async function (sentence) {
  /* Phase 2C — the date strip and the editor live in 📖 日记 mode now. In the
     default story mode they are still in the DOM but `display: none`, so their
     buttons exist and cannot be clicked. Switch modes through the module's own
     entry point first — the same one the CTA tap uses — rather than clicking a
     hidden element. */
  if (window.__memories && window.__memories.setMode) window.__memories.setMode('diary');
  await new Promise((r) => setTimeout(r, 600));
  const p = (x) => (x < 10 ? '0' : '') + x;
  const d = new Date();
  const today = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  const btns = Array.prototype.slice.call(document.querySelectorAll('#panel-diary .diary-date-btn'))
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

  const wc = document.getElementById('diaryWriteCard');
  const cands = Array.prototype.slice.call(wc.querySelectorAll('button, [role="button"], a[href]'))
    .filter((b) => getComputedStyle(b).display !== 'none' && b.offsetParent !== null);
  const btn = cands.find((b) => /save|保存|sačuvaj|sacuvaj|shrani/i.test(b.id + ' ' + b.textContent)) ||
    cands[cands.length - 1];
  if (!btn) return { ok: false, why: 'no visible save control', chosen };
  btn.click();
  await new Promise((r) => setTimeout(r, 1400));

  let parsed = null;
  try { parsed = JSON.parse(localStorage.getItem('shared-diary') || 'null'); } catch (e) {}
  const slot = parsed && parsed[chosen] ? parsed[chosen] : null;
  return {
    ok: true,
    chosen,
    clicked: (btn.id ? '#' + btn.id : btn.tagName.toLowerCase()) + ' "' +
      btn.textContent.replace(/\s+/g, ' ').trim().slice(0, 20) + '"',
    savedToChosen: !!slot,
    savedText: slot && slot.barry ? slot.barry.text : null,
    savedShape: slot && slot.barry ? Object.keys(slot.barry).sort().join(',') : null,
    dayKeys: parsed ? Object.keys(parsed).length : null,
  };
};

(async () => {
  // ── W1..W8 — static: where the copy lives, what is emitted, what is not ──
  const memSrc = read('js/module-memories.js');
  {
    // W1 — the copy is in MEM_I18N and nowhere else. "One i18n mechanism" is a
    // claim about the absence of a second table, so assert the absence too.
    const inTable = Object.keys(COPY).filter((k) => memSrc.indexOf("writeCta: '" + COPY[k] + "'") !== -1);
    check('W1 MEM_I18N carries the CTA copy in all three locales',
      inTable.length === 3, `found=${inTable.join(',') || 'none'} missing=${Object.keys(COPY).filter((k) => inTable.indexOf(k) === -1).join(',') || 'none'}`);

    const elsewhere = ['js/i18n.js', 'app.js', 'index.html']
      .filter((f) => read(f).indexOf('writeCta') !== -1 || read(f).indexOf(COPY['zh-CN']) !== -1);
    check('W1b the copy exists only in MEM_I18N — no second i18n mechanism',
      elsewhere.length === 0, `also-present-in=${elsewhere.join(',') || 'none'}`);

    // The row is a <button>, not an <a>: no new route, no new state.
    const emit = memSrc.match(/function _writeCtaHtml\(\) \{[\s\S]*?\n  \}/);
    check('W2 the row is emitted as a <button type="button"> with the module id',
      !!emit && /'<button type="button" class="mem-write-cta" id="memWriteCta">'/.test(emit[0]),
      `found=${!!emit}`);

    // Order inside the render chain: after the story's opening, before the
    // featured card. That ordering is the placement decision, so pin it.
    // Sliced by index rather than matched with a regex: the repo's files carry
    // CRLF, and a `;\n` terminator silently never matches them.
    const chainAt = memSrc.indexOf('host.innerHTML = _headHtml()');
    const order = chainAt === -1 ? '' : memSrc.slice(chainAt, chainAt + 700);
    const iAnchor = order.indexOf('_anchorHtml(now)');
    const iCta = order.indexOf('_writeCtaHtml()');
    /* Phase 2E: the card is no longer interpolated into this chain — it is
       rendered into #memFeaturedBox just after, so the「再看看一个」button can
       rebuild it alone. The order the round cares about is unchanged; the
       element that pins it moved one level down, so this asserts the box's
       position in the chain AND that the box is what the card is filled into. */
    const iFeat = order.indexOf('memFeaturedBox');
    check('W3 the row renders after the story anchor and before the featured card',
      chainAt !== -1 && iAnchor !== -1 && iCta !== -1 && iFeat !== -1 &&
      iAnchor < iCta && iCta < iFeat &&
      /getElementById\('memFeaturedBox'\)[\s\S]{0,400}?innerHTML = _featuredHtml\(/.test(memSrc),
      `chainAt=${chainAt} anchor=${iAnchor} cta=${iCta} featuredBox=${iFeat}`);

    // The listener is bound, not inlined — an innerHTML rebuild drops the old
    // node with its listener, so a bound handler can never stack.
    check('W4 the click handler is bound with addEventListener (no inline onclick)',
      /var cta = document\.getElementById\('memWriteCta'\);[\s\S]{0,200}addEventListener\('click',/.test(memSrc) &&
      memSrc.indexOf('onclick="_openDiary') === -1 &&
      memSrc.indexOf("onclick='_openDiary") === -1,
      'bound=true inline=false');

    /* Phase 2C is the third mechanism for the same promise, and the only one
       that removed the previous mechanism outright. 2B.8 sent the reader down to
       the editor (_goToDiary + scrollIntoView); 2B.9 borrowed the editor up to
       the reader; 2C switches 回忆 into 📖 日记 mode, which is a class on
       #panel-diary. What must survive every one of those is the boundary this
       check was really protecting: exactly ONE editor exists, it is the one
       index.html already owns, and nothing new was built to stand beside it.
       So assert the new path (the tap routes through _openDiary, the same entry
       point a reference row uses) and the absence of the old one (no
       #memWriteHost, no node movement) in the same breath. */
    /* The absence checks below run on the source with comments stripped: the
       honest way to record a deletion in this repo is a comment naming what was
       deleted, so the bare identifiers `memWriteHost` / `_toggleWrite` /
       `_expandWrite` survive in prose. Testing raw source would measure the
       comment rather than the code. */
    const memCode = memSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
    const bind = memCode.match(/var cta = document\.getElementById\('memWriteCta'\);[\s\S]{0,300}?\n  \}/);
    const bindSrc = bind ? bind[0] : '';
    check('W5 the handler switches to diary mode via _openDiary; it builds no second editor and moves no node',
      bindSrc.indexOf('_openDiary(') !== -1 &&
      bindSrc.indexOf('createElement') === -1 &&
      bindSrc.indexOf('innerHTML') === -1 &&
      bindSrc.indexOf('appendChild') === -1 &&
      /function _openDiary\(dateKey\) \{/.test(memCode) &&
      memCode.indexOf('memWriteHost') === -1 &&
      memCode.indexOf('_toggleWrite') === -1 &&
      memCode.indexOf('_expandWrite') === -1,
      `opensDiary=${bindSrc.indexOf('_openDiary(') !== -1} builds=${bindSrc.indexOf('createElement') !== -1} host=${memCode.indexOf('memWriteHost') !== -1} toggle=${memCode.indexOf('_toggleWrite') !== -1}`);

    // No new scroll state and no data writes: the module must not remember,
    // restore or synthesise anything. This is the "no new state" boundary.
    const writes = [
      /localStorage\.setItem/.test(memSrc) ? 'localStorage.setItem' : '',
      /sessionStorage\.setItem/.test(memSrc) ? 'sessionStorage.setItem' : '',
      /history\.(replace|push)State/.test(memSrc) ? 'history.*State' : '',
    ].filter(Boolean);
    check('W6 the module writes no storage and adds no scroll state',
      writes.length === 0, `found=${writes.join(',') || 'none'}`);

    // 2B.9 took scrolling out of this module entirely: the editor comes to the
    // reader, so there is no tap-reachable scroll left either. Zero is the
    // correct count now, and it is a stronger statement than the old one.
    const occurrences = memSrc.split('scrollIntoView').length - 1;
    check('W6b the module no longer scrolls at all — the editor comes to the reader',
      occurrences === 0, `occurrences=${occurrences}`);

    /* The dist mirrors are hand-maintained; a missed copy ships the old engine.
       Phase 2C changed two more runtime files than 2B.9 did — index.html lost
       the write-lock markup and js/fix-diary.js lost the code behind it — so
       both are pinned here now. */
    const drift = ['js/module-memories.js', 'js/fix-diary.js', 'css/v2.css', 'index.html', 'sw.js']
      .filter((f) => read(f) !== read('dist/' + f));
    check('W7 the changed files have byte-identical dist mirrors',
      drift.length === 0, `drift=${drift.join(',') || 'none'}`);

    // The stylesheet half: the row must actually be styled, must take the
    // project's 44px floor, and must stop moving under reduced motion.
    const css = read('css/v2.css');
    const rule = css.match(/\.mem-write-cta \{[\s\S]*?\n\}/);
    check('W8 .mem-write-cta exists and takes var(--touch-target) as its floor',
      !!rule && /min-height: var\(--touch-target\)/.test(rule[0]),
      `rule=${!!rule} floor=${!!rule && /min-height: var\(--touch-target\)/.test(rule[0])}`);
    const rm = css.match(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/);
    check('W8b the row is in the reduced-motion selector list',
      !!rm && /\.mem-write-cta,/.test(rm[0]), `listed=${!!rm && /\.mem-write-cta,/.test(rm[0])}`);
  }

  // ── W9..W16 — behaviour, in a real browser at the three widths ──
  const srv = await serve();
  const browser = await chromium.launch();

  for (const vp of VIEWPORTS) {
    const { ctx, page, errs } = await boot(browser, vp, { count: SEED, lang: 'zh-CN' });
    const m = await page.evaluate(MEASURE);

    check(`W9 [${vp.tag}] the row renders inside #memRoot as a real button`,
      m.exists && m.insideMemRoot && m.tag === 'button' && m.type === 'button' && !m.inlineOnclick,
      `exists=${m.exists} inMemRoot=${m.insideMemRoot} tag=${m.tag} type=${m.type} inlineOnclick=${m.inlineOnclick}`);

    check(`W10 [${vp.tag}] it sits between the story anchor and the featured card`,
      m.anchorIndex !== -1 && m.featuredIndex !== -1 && m.hasFeaturedCard &&
      m.anchorIndex < m.childIndex && m.childIndex < m.featuredIndex,
      `anchor=${m.anchorIndex} cta=${m.childIndex} featuredBox=${m.featuredIndex} card=${m.hasFeaturedCard}`);

    check(`W11 [${vp.tag}] the tap target is at least 44px tall`,
      m.height >= 44, `height=${m.height}px top=${m.top}px`);

    check(`W12 [${vp.tag}] no horizontal overflow, and the row fits its column`,
      m.docScrollWidth <= m.docClientWidth && m.right <= m.docClientWidth,
      `scrollWidth=${m.docScrollWidth} clientWidth=${m.docClientWidth} ctaRight=${m.right}`);

    check(`W13 [${vp.tag}] the label is the zh-CN copy`,
      m.text.indexOf(COPY['zh-CN']) !== -1, `text="${m.text}"`);

    // W14 — the settled product decision (app.js:2836-2839: the comments are
    // there, the scroll code deliberately is not): opening the tab must not move
    // the page. Two assertions, because "did not move" and "did not go to the
    // diary" are different claims. Measured from the top, where no clamp can
    // masquerade as a position, and asserted with the write card explicitly
    // out of view — an auto-scroll would show up as both a non-zero offset and
    // a visible card.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(150);
    await page.click('.tab[data-panel="dashboard"]');
    await page.waitForTimeout(250);
    await page.click('.tab[data-panel="diary"]');
    await page.waitForTimeout(900);
    const after = await page.evaluate(() => {
      const wc = document.getElementById('diaryWriteCard');
      const b = wc ? wc.getBoundingClientRect() : null;
      return {
        y: Math.round(window.scrollY),
        writeCardInView: !!(b && b.top < window.innerHeight && b.bottom > 0),
      };
    });
    check(`W14 [${vp.tag}] switching to Memories leaves the page where it was`,
      after.y === 0, `scrollY=${after.y}`);
    check(`W14b [${vp.tag}] and it does not bring the diary editor into view`,
      !after.writeCardInView, `writeCardInView=${after.writeCardInView}`);

    // W14c — the module's own render runs on every tab activation (twice, via
    // the 1200ms second pass), so the CTA must not move the page either. This is
    // the same code path the tab click takes. Two sources of noise are drained
    // before anything is compared: the pending render passes (rebuilding
    // innerHTML lets the browser re-anchor the scroll, and a render still in
    // flight reads as a jump this round did not cause), and the app's own smooth
    // scroll-behaviour, which means a position is only stable once two reads
    // agree.
    const settle = async (target) => {
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

    await page.waitForTimeout(1800);
    const held = await settle(300);
    /* Phase 2E shortened the story half to a single card (§一), and at these
       three widths the document can now be short enough that window.scrollTo()
       moves nothing. That makes the old `held > 0` precondition unsatisfiable
       rather than false — measured here instead of assumed, so the check below
       can say which case it was in. */
    const fitsViewport = await page.evaluate(
      () => document.documentElement.scrollHeight <= window.innerHeight + 1);
    await page.evaluate(() => window.initSharedDiaryTab());
    await page.waitForTimeout(1800);
    const heldAfter = await page.evaluate(() => {
      const wc = document.getElementById('diaryWriteCard');
      const b = wc ? wc.getBoundingClientRect() : null;
      return {
        y: Math.round(window.scrollY),
        writeCardInView: !!(b && b.top < window.innerHeight && b.bottom > 0),
      };
    });
    /* The claim this check exists for is "the re-render does not move the page",
       and both branches test it: a scrollable page must keep the position it was
       put at, and a page that fits the viewport must stay at 0. The branch is
       named in the detail line so neither case can pass silently. */
    check(`W14c [${vp.tag}] re-rendering Memories (the tab-activation path) does not scroll the page`,
      !heldAfter.writeCardInView &&
      (fitsViewport ? held === 0 && heldAfter.y === 0 : held > 0 && heldAfter.y === held),
      `${fitsViewport ? 'fits-viewport' : 'scrollable'} before=${held} after=${heldAfter.y} writeCardInView=${heldAfter.writeCardInView}`);

    const stillThere = await page.evaluate(MEASURE);
    check(`W15 [${vp.tag}] the diary editor is untouched below the story`,
      stillThere.hasTextarea && stillThere.dateButtons > 0 && !!stillThere.dateStrip && !!stillThere.writeCard,
      `textarea=${stillThere.hasTextarea} dateButtons=${stillThere.dateButtons} dateStrip=${!!stillThere.dateStrip} writeCard=${!!stillThere.writeCard}`);

    check(`W16 [${vp.tag}] no page errors during boot`,
      errs.length === 0, errs.slice(0, 2).join(' | ') || 'none');
    await ctx.close();
  }

  // ── W17..W19 — the three locales, driven by changing the app's own language
  // and re-rendering. This also proves the listener survives a re-render,
  // because the tap is exercised after the switches, not just once at boot.
  {
    const { ctx, page } = await boot(browser, VIEWPORTS[0], { count: SEED, lang: 'zh-CN' });
    for (const L of ['zh-CN', 'sr', 'en']) {
      const got = await page.evaluate((l) => {
        window.lang = l;
        window.initSharedDiaryTab();
        const cta = document.getElementById('memWriteCta');
        return { text: cta ? cta.textContent.replace(/\s+/g, ' ').trim() : '', bound: !!cta };
      }, L);
      check(`W17 [${L}] the CTA renders that locale's own string`,
        got.bound && got.text.indexOf(COPY[L]) !== -1, `text="${got.text}" expected="${COPY[L]}"`);
    }

    // Requirement 3 — the tap reaches the editor. Done last, in English, so it
    // doubles as the re-render proof.
    await page.evaluate(() => { window.lang = 'en'; window.initSharedDiaryTab(); window.scrollTo(0, 0); });
    await page.waitForTimeout(400);
    const start = await page.evaluate(() => {
      const wc = document.getElementById('diaryWriteCard');
      return { y: Math.round(window.scrollY), cardTop: wc ? Math.round(wc.getBoundingClientRect().top) : null };
    });
    await page.click('#memWriteCta');
    /* Sampled twice on purpose: right after the tap, and again well past the
       1200ms second render initSharedDiaryTab schedules. 2B.9 has to survive
       BOTH. An editor that opens and then shuts itself is not "in front of you",
       and a fast reader would never get a character down. */
    const after = await page.evaluate(() => ({
      y: Math.round(window.scrollY),
      mode: document.getElementById('panel-diary').classList.contains('mem-mode-diary'),
    }));
    await page.waitForTimeout(1600);
    const landed = await page.evaluate(() => {
      const panel = document.getElementById('panel-diary');
      const wc = document.getElementById('diaryWriteCard');
      const strip = document.querySelector('#panel-diary .diary-date-strip');
      const shown = (el) => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      };
      if (!wc) return { inView: false };
      const b = wc.getBoundingClientRect();
      return {
        y: Math.round(window.scrollY),
        mode: panel.classList.contains('mem-mode-diary'),
        storyHidden: !shown(document.getElementById('memRoot')),
        cardShown: shown(wc),
        stripShown: shown(strip),
        editors: document.querySelectorAll('#diaryTextarea').length,
        cardTop: Math.round(b.top),
        cardBottom: Math.round(b.bottom),
        inView: b.top < window.innerHeight && b.bottom > 0,
        vh: window.innerHeight,
      };
    });
    check('W18 tapping the row switches 回忆 into 📖 日记 with the editor in view, without moving the page',
      landed.mode && landed.cardShown && landed.inView && landed.y === after.y,
      `from=${start.y} justAfter=${after.y} at1600=${landed.y} mode=${landed.mode} cardShown=${landed.cardShown} cardTop=${landed.cardTop} cardBottom=${landed.cardBottom} vh=${landed.vh} inView=${landed.inView}`);
    check('W18b the story half gives way, the strip arrives, and exactly one editor exists',
      landed.storyHidden && landed.stripShown && landed.editors === 1,
      `storyHidden=${landed.storyHidden} stripShown=${landed.stripShown} textareas=${landed.editors}`);

    // The tap must not create or alter anything.
    const untouched = await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('shared-diary') || '{}')).length);
    check('W19 the tap writes no data and creates no empty entry',
      untouched === SEED, `dayKeys=${untouched} expected=${SEED}`);
    await ctx.close();
  }

  // ── W20..W23 — the diary still does its job, end to end, with the CTA in the
  // page: date switch + edit + save + Worker push in one pass. This is the
  // "completely unaffected" claim, so it is asserted against the button's own
  // data-date rather than an assumed day.
  {
    const { ctx, page, workerCalls } = await boot(browser, VIEWPORTS[0], { count: SEED, lang: 'zh-CN' });
    const flow = await page.evaluate(DIARY_FLOW, TYPED);
    check('W20 a past day can be selected, edited and saved to exactly that day',
      flow.ok && flow.savedToChosen && flow.savedText === TYPED,
      JSON.stringify(flow));

    check('W21 the saved slot keeps the shared-diary shape (text/mood/time)',
      flow.ok && flow.savedShape === 'mood,text,time', `shape=${flow.savedShape}`);

    await page.waitForTimeout(600);
    const pushed = workerCalls.filter((c) => c.indexOf('PUT') === 0);
    check('W22 the save still reaches the Worker (shared-diary is pushed, not just stored)',
      pushed.length > 0, `PUTs=${pushed.slice(0, 3).join(' | ') || 'none'} of ${workerCalls.length} worker calls`);

    check('W23 saving added exactly one day key and left the rest alone',
      flow.dayKeys === SEED + 1, `dayKeys=${flow.dayKeys} expected=${SEED + 1} (${SEED} seeded + 1 saved)`);
    await ctx.close();
  }

  await browser.close();
  srv.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
