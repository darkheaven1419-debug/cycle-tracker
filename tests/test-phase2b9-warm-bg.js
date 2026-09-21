/**
 * Phase 2B.9 — the light background no longer changes after the first frame.
 *
 * The report was "warm yellow first, then about a second later it turns the
 * white-pink I don't like". The cause was a setTimeout(...,3000) at the end of
 * index.html that forced document.body's background to var(--bg) with an inline
 * !important. At >=768px that overrode the warm radial gradient
 * css/calendar.css:6251 paints on body, and because body carries
 * `transition: background 0.3s` (css/calendar.css:415-417) the override rendered
 * as a visible cross-fade about three seconds into every load. The script's
 * other statement, hiding #appLoader, was a no-op: it only ran when
 * style.display was already "none".
 *
 * Two halves, because "the script is gone" and "the background is stable" are
 * different claims:
 *   - static: the override is absent, every place that declares the main site's
 *     light page colour agrees on the warm value, and the old cool value is gone
 *     from everywhere it could still paint;
 *   - behavioural: a real boot samples the computed body background at 600ms and
 *     again at 4500ms — well past the old three-second trigger plus its 300ms
 *     transition — and the two must be byte-identical, at 320/768/1440.
 *
 * Dark mode is asserted to be UNTOUCHED, not to be flicker-free. It has a
 * separate, pre-existing boot flash: index.html hardcodes data-theme="light" and
 * the deferred app.js corrects it at ~400-500ms. This round deliberately left
 * that alone — fixing it means changing boot order and the per-profile theme
 * key, which is outside what was asked.
 *
 * Run: node tests/test-phase2b9-warm-bg.js
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

/* The warm cream. Not a new colour: it is the first stop of the >=768px
   gradient, so the flat mobile surface and the desktop gradient agree. */
const WARM_HEX = '#f7efe9';
const WARM_RGB = 'rgb(247, 239, 233)';
/* Midnight Couple, unchanged by this round. */
const NIGHT_HEX = '#0f1220';
/* What the page used to be, and what must no longer be reachable. */
const STALE_HEX = '#f4f2f8';

/* Three widths, because the old override only bit at >=768px: below it the
   gradient never applied, so 320 is the control that must ALSO be warm now. */
const CONFIGS = [{ tag: '320', w: 320, h: 800 }, { tag: '768', w: 768, h: 1024 }, { tag: '1440', w: 1440, h: 900 }];

/* 600ms is after the sheet is applied and the theme is settled; 4500ms is past
   the old 3000ms trigger plus the 300ms transition, so any late write shows. */
const EARLY_MS = 600;
const LATE_MS = 4500;

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

/** The properties the flicker moved between: flat colour and gradient. */
const SAMPLE = function () {
  const cs = getComputedStyle(document.body);
  return {
    color: cs.backgroundColor,
    image: cs.backgroundImage,
    inline: document.body.getAttribute('style') || '',
  };
};

/** First `--bg: #rrggbb` in a stylesheet — the light one, since it comes first. */
const bgOf = (css) => ((css.match(/--bg:\s*(#[0-9a-fA-F]{6})/) || [])[1] || '').toLowerCase();
/** Drop HTML and CSS comments, so prose that names a value is not read as a declaration. */
const stripComments = (s) => s.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
/** The light theme-color meta, tolerating the minified no-space form. */
const lightMetaOf = (html) => {
  const m = html.match(/name="theme-color"\s*content="(#[0-9a-fA-F]{6})"\s*media="\(prefers-color-scheme:\s*light\)"/i)
    || html.match(/name="theme-color"content="(#[0-9a-fA-F]{6})"media="\(prefers-color-scheme: light\)"/i);
  return ((m || [])[1] || '').toLowerCase();
};

(async () => {
  const html = read('index.html');
  const tokens = read('css/tokens.css');
  const calendar = read('css/calendar.css');
  const offline = read('offline.html');
  const manifest = JSON.parse(read('manifest.json'));

  // ── A. the override is gone, not merely inert ──
  {
    const setProp = /setProperty\(\s*["']background["']/.test(html);
    check('A1 index.html no longer forces body background with an inline !important',
      !setProp, `setProperty("background") present=${setProp}`);

    // The whole script was the problem, not just its second statement: leaving
    // the timer behind would keep a 3s write firing at body for no reason.
    const lateTimer = /setTimeout\([^)]{0,400}appLoader/.test(html);
    check('A1b the three-second boot timer itself is gone, not just its effect',
      !lateTimer, `setTimeout(...appLoader) present=${lateTimer}`);
  }

  // ── B. every declaration of the main site's light surface agrees ──
  {
    const lightBg = bgOf(tokens);
    check('B1 css/tokens.css declares the warm light --bg', lightBg === WARM_HEX,
      `--bg=${lightBg}`);

    // The gradient's own first stop must be the same value, or the flat mobile
    // surface and the desktop gradient drift apart again.
    const gradientStop = new RegExp('radial-gradient\\(120% 80% at 50% 0%,\\s*' + WARM_HEX, 'i').test(calendar);
    check('B2 the >=768px light gradient starts on that same warm value', gradientStop,
      `first stop=${WARM_HEX} present=${gradientStop}`);

    const meta = lightMetaOf(html);
    check('B3 index.html light theme-color matches the page colour', meta === lightBg,
      `theme-color=${meta} --bg=${lightBg}`);

    /* The offline page is self-contained and was ALREADY warm (#f0e6e0); this
       round only removed the old cool value from it. The invariant that matters
       is that its browser-chrome colour matches its OWN page colour — pinning
       both to the main site's cream would make the two disagree. */
    const offBg = bgOf(offline);
    const offMeta = lightMetaOf(offline);
    check('B4 offline.html theme-color matches its own --bg, and is no longer the old cool value',
      offBg !== '' && offBg === offMeta && offBg !== STALE_HEX,
      `--bg=${offBg} theme-color=${offMeta}`);

    check('B5 manifest background_color is warm and theme_color is still Midnight Couple',
      manifest.background_color === WARM_HEX && manifest.theme_color === NIGHT_HEX,
      `bg=${manifest.background_color} theme=${manifest.theme_color}`);
  }

  // ── C. the old cool value is gone from every surface that can paint ──
  {
    /* Comments are stripped first. The fix documents itself in prose that names
       the old value ("was #f4f2f8"), and a raw substring search would flag the
       note explaining the change as though it were the change. Only surviving
       declarations count. */
    const stale = ['index.html', 'offline.html', 'manifest.json', 'css/tokens.css']
      .filter((f) => stripComments(read(f)).toLowerCase().indexOf(STALE_HEX) !== -1);
    check('C1 the old cool value survives in no declaration that could still paint the page',
      stale.length === 0, `still declared in=${stale.join(',') || 'none'}`);

    const mirrors = ['css/tokens.css', 'manifest.json', 'index.html', 'offline.html']
      .filter((f) => read(f) !== read('dist/' + f));
    check('C2 the four touched files have byte-identical dist mirrors',
      mirrors.length === 0, `drift=${mirrors.join(',') || 'none'}`);
  }

  // ── D. dark mode is untouched ──
  {
    const darkBlock = tokens.slice(tokens.search(/\[data-theme="dark"\]/));
    const nightBg = bgOf(darkBlock);
    check('D1 the dark --bg is still Midnight Couple', nightBg === NIGHT_HEX,
      `--bg=${nightBg}`);

    const darkGradient = /radial-gradient\(120% 80% at 50% 0%,\s*#251f22/i.test(calendar);
    check('D2 the >=768px dark gradient is unchanged', darkGradient,
      `first stop=#251f22 present=${darkGradient}`);
  }

  // ── E. behaviour: one frame, and it is the final one ──
  const srv = await serve();
  const browser = await chromium.launch();

  for (const cfg of CONFIGS) {
    const ctx = await browser.newContext({
      viewport: { width: cfg.w, height: cfg.h },
      hasTouch: true, isMobile: cfg.w < 768, deviceScaleFactor: 1,
      serviceWorkers: 'block',
    });
    await ctx.addInitScript(() => {
      try {
        window.alert = function () {};
        window.confirm = function () { return true; };
        sessionStorage.setItem('cycle-logged-in', '1');
        localStorage.setItem('cycle-active-profile', 'barry');
        localStorage.setItem('cycle-theme', 'light');
        localStorage.setItem('cycle-lang', 'zh-CN');
        localStorage.setItem('cycle-lang-barry', 'zh-CN');
        localStorage.setItem('cycle-lang-chosen-barry', '1');
        localStorage.setItem('ct-app-key', 'p2b9-bg-test-not-a-real-key');
        localStorage.setItem('cycle-ann-met', '2026-03-19');
        localStorage.setItem('cycle-ann-love', '2026-05-07');
        localStorage.setItem('shared-diary', '{}');
      } catch (e) { /* ignore */ }
    });

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

    await page.waitForTimeout(EARLY_MS);
    const early = await page.evaluate(SAMPLE);
    await page.waitForTimeout(LATE_MS - EARLY_MS);
    const late = await page.evaluate(SAMPLE);

    const earlyKey = early.color + ' | ' + early.image;
    const lateKey = late.color + ' | ' + late.image;

    check(`E${cfg.tag} the body background is identical at ${EARLY_MS}ms and ${LATE_MS}ms`,
      earlyKey === lateKey,
      earlyKey === lateKey ? `held ${early.color}` : `early=${earlyKey}  late=${lateKey}`);

    // Warm on both surfaces: flat below 768, gradient at and above it.
    const warm = cfg.w < 768
      ? early.color === WARM_RGB && early.image === 'none'
      : early.image.indexOf('radial-gradient') === 0 && early.image.indexOf('247, 239, 233') !== -1;
    check(`E${cfg.tag}b the first frame is the warm cream surface`,
      warm, `color=${early.color} image=${early.image.slice(0, 56)}`);

    check(`E${cfg.tag}c no inline background survives on body`,
      early.inline.indexOf('background') === -1 && late.inline.indexOf('background') === -1,
      `early="${early.inline}" late="${late.inline}"`);

    check(`E${cfg.tag}d boot raised no page errors`, errs.length === 0,
      errs.slice(0, 2).join(' | '));

    await ctx.close();
  }

  await browser.close();
  srv.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
