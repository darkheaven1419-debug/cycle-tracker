/**
 * Day-counter wording — the two anniversaries must never share a label.
 *
 * Why this exists: Home showed two different numbers under identical wording
 * ("184 天在一起" in the couple header, "♥ 134 天在一起" in the pill), so the
 * pair read as a contradiction. Neither value was wrong — they come from two
 * different date fields (annDateMet vs annDateLove, 49 days apart with the
 * defaults). The defect was that both rendered the SAME string.
 *
 * The trap that let this survive: the label was not stored once. It existed in
 * the i18n table AND as a hardcoded `"sr"===lang ? ... : ...` ternary inside
 * updateLoveCounter, so changing the table alone would not have fixed it. The
 * hardcoded copy is asserted gone below.
 *
 * The {n} placeholder is what lets each language order the words itself:
 * Chinese wants the label first ("相识 184 天"), Serbian/English want it last
 * ("184 dana od susreta"). Every template must carry it, or a call site's
 * .replace() silently produces a label with no number in it.
 *
 * Run: node tests/test-day-counter-labels.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

let passed = 0;
let failed = 0;
function check(name, ok, detail) {
  if (ok) {
    passed++;
    console.log(`PASS  ${name}${detail ? '  — ' + detail : ''}`);
  } else {
    failed++;
    console.error(`FAIL  ${name}${detail ? '  — ' + detail : ''}`);
  }
}

/* The three language objects are declared in the same order in every table, and
   each holds both keys, so occurrence N of one key is the same language as
   occurrence N of the other. Index-wise comparison is therefore language-wise
   comparison, without having to parse the object structure. */
const all = (src, key) => (src.match(new RegExp(key + ':"[^"]*"', 'g')) || [])
  .map((s) => s.slice(s.indexOf(':') + 1).replace(/^"|"$/g, ''));

const i18n = read('js/i18n.js');
const dash = read('js/module-dashboard.js');
const misc = read('js/render-misc.js');

const love = all(i18n, 'loveCounterTogether');   // annDateLove — 相恋
const met = all(i18n, 'loveCounterMet');         // annDateMet  — 相识
const LANGS = ['sr', 'zh-CN', 'en'];

check('both day-counter keys exist in all three languages',
  love.length === 3 && met.length === 3,
  `love=${love.length} met=${met.length}`);

/* ── 1. The core requirement: never the same label for the two metrics ── */
for (let i = 0; i < Math.min(love.length, met.length); i++) {
  check(`[${LANGS[i] || i}] the two metrics do not share a label`,
    love[i] !== met[i], `love=${JSON.stringify(love[i])} met=${JSON.stringify(met[i])}`);
}

/* The V2 table's met label heads the couple header and must not collide with
   the i18n love label either — that collision was the reported symptom. */
const v2met = (dash.match(/daysSinceMet: '[^']*'/g) || [])
  .map((s) => s.slice(s.indexOf(':') + 1).trim().replace(/^'|'$/g, ''));
check('the couple header has its own met label in all three languages',
  v2met.length === 3, `found=${v2met.length}`);
for (let i = 0; i < Math.min(v2met.length, love.length); i++) {
  check(`[${LANGS[i] || i}] the header's met label differs from the love label`,
    v2met[i] !== love[i], `header=${JSON.stringify(v2met[i])} love=${JSON.stringify(love[i])}`);
}

/* ── 2. Word order is the language's business, via {n} ────────────────── */
for (const [label, arr] of [['loveCounterTogether', love], ['loveCounterMet', met], ['daysSinceMet', v2met]]) {
  check(`${label}: every language's template carries the {n} placeholder`,
    arr.length > 0 && arr.every((v) => v.includes('{n}')),
    JSON.stringify(arr));
}
check('Chinese puts the label before the number (natural order)',
  met.some((v) => /^相识 \{n\} 天$/.test(v)) && love.some((v) => /^相恋 \{n\} 天$/.test(v)),
  `met=${JSON.stringify(met)} love=${JSON.stringify(love)}`);

/* ── 3. The duplicated literal is gone ───────────────────────────────── */
check('no hardcoded "dana zajedno" ternary survives in the renderer',
  !misc.includes('" dana zajedno"') && !misc.includes('" 天在一起"'),
  'render-misc.js still branches on lang for these labels');
check('the old shared wording is gone from every live file',
  !i18n.includes('天在一起') && !dash.includes('天在一起'),
  'the pre-fix wording still appears');
check('the pill routes through the love key',
  misc.includes('t("loveCounterTogether").replace("{n}",n)'));
check('the love-days row routes through the love key, not a literal',
  misc.includes('t("loveCounterTogether").replace("{n}",e)'));
check('the met row routes through the met key',
  misc.includes('t("loveCounterMet").replace("{n}",e)'));
check('the couple header renders the met sense, not the love sense',
  dash.includes(".replace('{n}', _days)") && dash.includes("v2('daysSinceMet')"),
  'header call site not updated');

/* ── 4. Live: what the user actually reads ───────────────────────────── */
const PORT = 8936;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

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

(async () => {
  const { chromium } = require('playwright');
  const srv = await serve();
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({
      viewport: { width: 320, height: 800 }, hasTouch: true, isMobile: true,
      deviceScaleFactor: 1, serviceWorkers: 'block',
    });
    await ctx.addInitScript(() => {
      try {
        localStorage.setItem('cycle-active-profile', 'barry');
        sessionStorage.setItem('cycle-logged-in', '1');
      } catch (e) { /* ignore */ }
    });
    await ctx.route('**/*', (route) => {
      const u = route.request().url();
      if (u.indexOf(`http://localhost:${PORT}`) === 0) return route.continue();
      if (u.indexOf('workers.dev') !== -1) return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      return route.abort();
    });
    const page = await ctx.newPage();
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.panel.active', { timeout: 20000 });
    await page.waitForTimeout(1500);

    const seen = await page.evaluate(() => {
      const txt = (id) => {
        const e = document.getElementById(id);
        return e ? (e.textContent || '').trim() : null;
      };
      return {
        pill: txt('titleLoveCounter'),        // annDateLove
        header: txt('dash-welcome'),          // annDateMet
        loveRows: txt('love-days-content'),
      };
    });

    /* Compare the words, ignoring the numbers: the numbers legitimately differ,
       so the wording must differ too rather than being the only signal. */
    const words = (s) => (s || '').replace(/[0-9]/g, '').replace(/\s+/g, ' ').trim();
    const digits = (s) => (s || '').replace(/[^0-9]/g, '');

    check('the love pill rendered a number',
      /\d/.test(seen.pill || ''), `pill=${JSON.stringify(seen.pill)}`);
    check('the couple header rendered a number',
      /\d/.test(seen.header || ''), `header=${JSON.stringify(seen.header)}`);
    check('the two rendered labels are not the same wording',
      !!seen.pill && !!seen.header && words(seen.pill) !== words(seen.header),
      `pill=${JSON.stringify(words(seen.pill))} header=${JSON.stringify(words(seen.header))}`);
    check('the two numbers come from different date fields',
      digits(seen.pill) !== digits(seen.header),
      `pill=${digits(seen.pill)} header=${digits(seen.header)}`);
    check('no rendered label left a bare {n} placeholder',
      !/\{n\}/.test(seen.pill || '') && !/\{n\}/.test(seen.header || '') &&
      !/\{n\}/.test(seen.loveRows || ''),
      `pill=${JSON.stringify(seen.pill)} header=${JSON.stringify(seen.header)}`);
    check('the love-days modal rendered text',
      !!seen.loveRows && seen.loveRows.length > 0,
      `rows=${JSON.stringify((seen.loveRows || '').slice(0, 80))}`);

    await ctx.close();
  } finally {
    await browser.close();
    srv.close();
  }

  console.log(`\n${passed}/${passed + failed} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
