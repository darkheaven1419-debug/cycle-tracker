/**
 * Phase 1E — one product, five surfaces.
 *
 * Phase 1E unified the visual language across Home / Together / Memories /
 * Cycle / Settings. Most of it is judgement and cannot be asserted. What CAN be
 * asserted is the part that was measurable, and that is what is pinned here:
 *
 *   - the ink layer: accent hues are tuned as FILLS and fail AA as text, so text
 *     uses the -ink tokens. In dark the two are the same value, which is why the
 *     conversion is safe there and why the invariant is worth pinning.
 *   - the substring trap this suite must not fall into itself: searching
 *     calendar.css for "color: var(--love)" also matches
 *     "border-color: var(--love)". Every assertion below is line-anchored.
 *   - the two layout fixes that were measured rather than eyeballed (Cycle key
 *     ragged on both edges; Memories featured card mostly empty at 1440).
 *   - the rendered result: the swept selectors actually clear 4.5:1 in BOTH
 *     themes, measured in a real browser, because "the declaration changed" and
 *     "the pixel changed" are different claims.
 *
 * Run: node tests/test-phase1e-polish.js
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

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

/** Value of a custom property inside a given `selector { ... }` block. */
function token(css, block, name) {
  const i = css.indexOf(block);
  if (i < 0) return null;
  const body = css.slice(i, css.indexOf('}', i));
  const m = body.match(new RegExp('--' + name + '\\s*:\\s*([^;]+);'));
  return m ? m[1].trim() : null;
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

/* Runs in the page: contrast of each selector against its real backdrop, plus
   the Cycle key's left edges. Mirrors the reasoning in .claude-verify/p1e-ink-check.js
   (display:none ancestors paint nothing; a gradient ancestor IS the surface, and
   the worst stop across it is the answer). */
function measure(cfg) {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const over = (f, b) => ({
    r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a),
    b: f.b * f.a + b.b * (1 - f.a), a: 1,
  });
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const effBgs = (el) => {
    const layers = [];
    let opaque = false;
    for (let n = el; n && n.nodeType === 1 && !opaque; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none') continue;
      const img = cs.backgroundImage;
      const stops = [];
      if (img && img !== 'none') {
        const re = /rgba?\([^)]+\)/g;
        let m;
        while ((m = re.exec(img))) { const c = parse(m[0]); if (c) stops.push(c); }
      }
      if (stops.length) {
        layers.push(stops);
        if (stops.every((s) => s.a >= 1)) opaque = true;
        continue;
      }
      const bg = parse(cs.backgroundColor);
      if (bg && bg.a > 0) { layers.push([bg]); if (bg.a >= 1) opaque = true; }
    }
    const WHITE = { r: 255, g: 255, b: 255, a: 1 };
    let cands = null;
    for (let i = layers.length - 1; i >= 0; i--) {
      if (cands === null) cands = layers[i].map((s) => over(s, WHITE));
      else {
        const next = [];
        for (const base of cands) for (const s of layers[i]) next.push(over(s, base));
        cands = next;
      }
    }
    return cands || [WHITE];
  };

  const out = { contrasts: [], legend: null, overflow: null };

  for (const sel of cfg.selectors) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const cs = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    const painted = box.width > 0 && box.height > 0;
    // A panel is shown, not stacked, so most selectors are unpainted while it is
    // closed. Their colour and background are still fully resolved by the
    // cascade, and those two values are the only inputs to the ratio.
    if (!painted && !cfg.includeHidden) continue;
    const fg = parse(cs.color);
    if (!fg) continue;
    const op = parseFloat(cs.opacity);
    const graded = (!op || isNaN(op)) ? 1 : op;
    let worst = null;
    for (const bg of effBgs(el)) {
      const r = ratio(over({ ...fg, a: fg.a * graded }, bg), bg);
      if (!worst || r < worst) worst = r;
    }
    out.contrasts.push({
      sel, ratio: Math.round(worst * 100) / 100,
      opacity: isNaN(op) ? 1 : op, painted,
    });
  }

  // Cycle key: every row must share the left edge. With centring the last row
  // floats mid-panel (measured 153/153 slack at 768), which reads as a break.
  const legend = document.querySelector('.legend');
  if (legend) {
    const rows = new Map();
    for (const kid of legend.children) {
      const r = kid.getBoundingClientRect();
      if (!r.width) continue;
      const top = Math.round(r.top);
      if (!rows.has(top)) rows.set(top, []);
      rows.get(top).push(Math.round(r.left));
    }
    const lefts = [...rows.values()].map((v) => Math.min(...v));
    out.legend = { rows: rows.size, min: Math.min(...lefts), max: Math.max(...lefts) };
  }

  const de = document.documentElement;
  out.overflow = de.scrollWidth - de.clientWidth;
  return out;
}

(async () => {
  const tokens = read('css/tokens.css');
  const cal = read('css/calendar.css');
  const v2 = read('css/v2.css');

  /* ── static: the ink layer ─────────────────────────────────────────────── */

  const lightInk = {
    love: token(tokens, ':root {', 'love-ink'),
    gold: token(tokens, ':root {', 'gold-ink'),
    sage: token(tokens, ':root {', 'sage-ink'),
  };
  check('E1 light defines all three -ink tokens',
    !!(lightInk.love && lightInk.gold && lightInk.sage),
    JSON.stringify(lightInk));

  // Dark's -ink tokens equal their fill hues. This is the invariant that made the
  // calendar.css conversion safe: in dark it changes no rendered colour at all.
  const darkBlock = tokens.slice(tokens.indexOf('[data-theme="dark"]'));
  const darkSame = ['love', 'gold', 'sage'].every(
    (k) => token(darkBlock, '[data-theme="dark"] {', k) === token(darkBlock, '[data-theme="dark"] {', k + '-ink')
  );
  check('E2 in dark each -ink token equals its fill hue (conversion is a no-op there)',
    darkSame, ['love', 'gold', 'sage'].map(
      (k) => `${k}=${token(darkBlock, '[data-theme="dark"] {', k)}/${token(darkBlock, '[data-theme="dark"] {', k + '-ink')}`).join(' '));

  const lightDiffers = ['gold', 'sage'].every(
    (k) => token(tokens, ':root {', k) !== token(tokens, ':root {', k + '-ink')
  );
  check('E3 in light each -ink token differs from its fill hue (the correction is real)',
    lightDiffers,
    ['gold', 'sage'].map((k) => `${k} ${token(tokens, ':root {', k)} -> ${token(tokens, ':root {', k + '-ink')}`).join(', '));

  // Line-anchored on purpose: a bare substring search for "color: var(--love)"
  // also matches "border-color: var(--love)", which is a legitimate fill use.
  const lines = cal.split('\n');
  const textHue = [];
  lines.forEach((ln, i) => {
    if (/^\s*color:\s*var\(--(love|gold|sage)\)\s*;/.test(ln)) {
      // name the enclosing rule so the exemption below can be checked
      let rule = '';
      for (let j = i; j >= 0; j--) {
        if (/\{\s*$/.test(lines[j])) { rule = lines[j].trim(); break; }
      }
      textHue.push({ line: i + 1, rule });
    }
  });
  const offending = textHue.filter((t) => !/\.star\b/.test(t.rule));
  check('E4 no rule paints TEXT in a fill hue (only the .star ambience layer may)',
    offending.length === 0,
    offending.length ? offending.map((o) => `L${o.line} ${o.rule}`).join(', ')
      : `${textHue.length} remaining, all .star`);

  const borders = lines.filter((ln) => /border-color:\s*var\(--(love|gold|sage)\)/.test(ln)).length;
  check('E5 border-color fills were preserved (the sweep was text-only)', borders >= 30,
    `${borders} border-color uses`);

  const diluted = lines.filter((ln, i) =>
    /^\s*opacity:\s*0\.6;\s*$/.test(ln) &&
    lines.slice(Math.max(0, i - 6), i + 6).some((x) => /lunar-fifteen|solar-term-label/.test(x)));
  check('E6 no opacity dilution left on the two accent labels', diluted.length === 0,
    diluted.length ? `L${lines.indexOf(diluted[0]) + 1}` : 'opacity: 1');

  /* ── static: the two measured layout fixes ─────────────────────────────── */

  const legendBlock = cal.slice(cal.indexOf('.legend {'), cal.indexOf('}', cal.indexOf('.legend {')));
  check('E7 Cycle key is left-aligned, so a wrapped row does not float mid-panel',
    /justify-content:\s*flex-start/.test(legendBlock),
    (legendBlock.match(/justify-content:[^;]+/) || ['(none)'])[0]);

  const feat = v2.slice(v2.indexOf('.mem-feat {'), v2.indexOf('}', v2.indexOf('.mem-feat {')));
  check('E8 Memories featured card is centred', /text-align:\s*center/.test(feat),
    (feat.match(/text-align:[^;]+/) || ['(none)'])[0]);

  const featText = v2.slice(v2.indexOf('.mem-feat-text {'), v2.indexOf('}', v2.indexOf('.mem-feat-text {')));
  check('E9 featured text is capped to a pull-quote measure',
    /max-width:\s*46ch/.test(featText) && /margin-inline:\s*auto/.test(featText),
    `max-width=${(featText.match(/max-width:[^;]+/) || ['(none)'])[0]}`);

  // The two overrides were deleted rather than left as a second, later word on
  // properties already fixed at source.
  const orphanOverride = v2.split('\n').some((ln) => /^\s*\.(footer-credit|solar-term-label)\b[^{]*\{/.test(ln));
  check('E10 v2.css no longer re-declares .footer-credit / .solar-term-label', !orphanOverride,
    orphanOverride ? 'override block still present' : 'fixed at source only');

  /* ── static: touch targets and the manifest ────────────────────────────── */

  check('E11 --touch-target is 44px', token(tokens, ':root {', 'touch-target') === '44px',
    String(token(tokens, ':root {', 'touch-target')));
  const touchUses = (v2.match(/var\(--touch-target\)/g) || []).length +
    (cal.match(/var\(--touch-target\)/g) || []).length;
  check('E12 the touch target token is actually applied', touchUses > 0, `${touchUses} uses`);

  const manifest = JSON.parse(read('manifest.json'));
  check('E13 manifest theme colour is Midnight Couple, not the old rose',
    manifest.theme_color === '#0f1220' && manifest.background_color === '#f4f2f8',
    `theme=${manifest.theme_color} bg=${manifest.background_color}`);

  /* ── static: dist mirrors ──────────────────────────────────────────────── */

  const mirrors = ['css/tokens.css', 'css/calendar.css', 'css/v2.css', 'sw.js',
    'manifest.json', 'index.html', 'offline.html', 'js/fix-css.js'];
  const drifted = mirrors.filter((rel) => {
    const a = path.join(ROOT, rel), b = path.join(ROOT, 'dist', rel);
    return !fs.existsSync(b) || !fs.readFileSync(a).equals(fs.readFileSync(b));
  });
  check('E14 every dist mirror is byte-identical to its source', drifted.length === 0,
    drifted.length ? drifted.join(', ') : `${mirrors.length} files`);

  /* ── behavioural: the rendered pixels ──────────────────────────────────── */

  const srv = await serve();
  const browser = await chromium.launch();

  // The selectors that exist without seeding. Each is a rule the sweep touched.
  const PROBED = ['.footer-credit', '.andjelin-label', '.day .lunar-date.lunar-fifteen',
    '.solar-term-label', '.tip-source'];

  for (const theme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript((t) => {
      try {
        localStorage.setItem('cycle-active-profile', 'andjela');
        sessionStorage.setItem('cycle-logged-in', '1');
        localStorage.setItem('cycle-theme', t);
        localStorage.setItem('cycle-theme-andjela', t);
      } catch (e) { /* ignore */ }
    }, theme);
    const page = await ctx.newPage();
    await page.route('**/*', (r) => (
      r.request().url().startsWith(`http://127.0.0.1:${PORT}/`) ? r.continue() : r.abort()
    ));
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('.tab[data-panel="dashboard"]', { timeout: 30000 });
    await page.waitForTimeout(1200);

    // Measure while each panel is open, keeping the first result per selector:
    // a selector from Cycle is not painted while Together is showing.
    const seen = new Map();
    const collect = (rows) => {
      for (const r of rows) if (!seen.has(r.sel)) seen.set(r.sel, r);
    };
    let last = null;
    for (const t of ['dashboard', 'together', 'diary', 'stats', 'symptoms', 'settings']) {
      await page.evaluate((tt) => { if (typeof window.switchToTab === 'function') window.switchToTab(tt); }, t);
      await page.waitForTimeout(400);
      const m = await page.evaluate(measure, { selectors: PROBED, includeHidden: false });
      collect(m.contrasts);
      last = m;
    }
    // #panel-tips has no tab; it is reached from inside Cycle. Then one pass that
    // also accepts unpainted-but-resolved elements, so every probed rule is
    // accounted for rather than silently skipped.
    await page.evaluate(() => { if (typeof window.renderTips === 'function') window.renderTips(); });
    await page.waitForTimeout(300);
    collect((await page.evaluate(measure, { selectors: PROBED, includeHidden: false })).contrasts);
    collect((await page.evaluate(measure, { selectors: PROBED, includeHidden: true })).contrasts);

    const graded = PROBED.map((s) => seen.get(s)).filter((c) => c && c.opacity !== 0);
    const bad = graded.filter((c) => c.ratio < 4.5);
    const painted = graded.filter((c) => c.painted).length;
    check(`E15 ${theme}: all ${PROBED.length} swept selectors meet 4.5:1 in the browser`,
      graded.length === PROBED.length && bad.length === 0,
      bad.length ? bad.map((b) => `${b.sel}=${b.ratio}`).join(', ')
        : `${graded.map((c) => `${c.sel.replace(/^\./, '')}=${c.ratio}`).join(' ')} (${painted} painted)`);

    check(`E16 ${theme}: no horizontal overflow at 390px`, last.overflow <= 0, `scrollWidth-clientWidth=${last.overflow}`);
    await ctx.close();
  }

  // Legend alignment at the two widths where it wrapped, on the Cycle panel.
  for (const w of [320, 768]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    await ctx.addInitScript(() => {
      try {
        localStorage.setItem('cycle-active-profile', 'andjela');
        sessionStorage.setItem('cycle-logged-in', '1');
        localStorage.setItem('cycle-theme', 'light');
      } catch (e) { /* ignore */ }
    });
    const page = await ctx.newPage();
    await page.route('**/*', (r) => (
      r.request().url().startsWith(`http://127.0.0.1:${PORT}/`) ? r.continue() : r.abort()
    ));
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('.tab[data-panel="dashboard"]', { timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.evaluate(() => { if (typeof window.switchToTab === 'function') window.switchToTab('stats'); });
    await page.waitForTimeout(700);
    const m = await page.evaluate(measure, { selectors: [] });
    check(`E17 Cycle key rows share one left edge at ${w}px`,
      !!m.legend && m.legend.rows >= 2 && m.legend.max - m.legend.min <= 2,
      m.legend ? `rows=${m.legend.rows} left edges ${m.legend.min}..${m.legend.max}` : 'no .legend');
    check(`E18 no horizontal overflow on Cycle at ${w}px`, m.overflow <= 0, `overflow=${m.overflow}`);
    await ctx.close();
  }

  await browser.close();
  srv.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
