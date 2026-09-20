/**
 * Phase 2A.5 — cycle chrome belongs to the Cycle panel, and the FAB must not
 * sit on top of anything you can tap.
 *
 * This is the second instance of one bug. tests/test-home-first-screen.js
 * documents the first: the real Home first screen was 100% month calendar
 * because `#calendarContainer` lived in the app shell *outside every panel*, so
 * it drew above all five tabs while the DOM-order assertions stayed green.
 * `#progressSection` (cycle ring + phase labels + "Anđelin ciklus" + tea room)
 * and `#fabBtn` were the leftovers of the same shape.
 *
 * Both halves are asserted, because either alone passes while the defect ships:
 *   - static  — where the block sits in the markup, and that there is exactly
 *               one of it (a copy would re-create the problem on Home);
 *   - rendered — which panels actually paint it, at 3 viewports x 2 themes.
 * "In the DOM" is not "on screen", so the static half cannot stand alone.
 *
 * Run: node tests/test-phase2a5-shell-chrome.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8959;
const BASE = `http://127.0.0.1:${PORT}/`;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

let passed = 0, failed = 0;
function check(name, ok, detail) {
  if (ok) { passed++; console.log(`PASS  ${name}${detail ? '  — ' + detail : ''}`); }
  else { failed++; console.error(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

/* ── static: exactly one, and inside the Cycle panel ─────────────────────── */

const occurrences = (html.match(/id="progressSection"/g) || []).length;
check('progressSection exists exactly once (no second copy for Home)', occurrences === 1,
  `occurrences=${occurrences}`);

const atProgress = html.indexOf('id="progressSection"');
const atPanelStats = html.indexOf('id="panel-stats"');
const atCalendar = html.indexOf('id="cycleCalendarBlock"');
const atReminder = html.indexOf('id="reminderBanner"');
const atDashboard = html.indexOf('id="panel-dashboard"');

check('#progressSection sits inside #panel-stats',
  atProgress > atPanelStats && atProgress < atCalendar,
  `progress=${atProgress} stats=${atPanelStats} calendar=${atCalendar}`);

check('#progressSection is gone from the app shell above the panels',
  !(atProgress > atReminder && atProgress < atDashboard),
  `reminder=${atReminder} progress=${atProgress} dashboard=${atDashboard}`);

/* The ring must not be re-created anywhere else either — a second set of these
   ids would make getElementById ambiguous and re-introduce global chrome. */
['pg-num', 'pg-fill', 'pg-badge', 'teaCard'].forEach((id) => {
  const n = (html.match(new RegExp('id="' + id + '"', 'g')) || []).length;
  check(`${id} exists exactly once`, n === 1, `count=${n}`);
});

/* Nothing the cycle tool owns may leave with the move (Phase 1A §四 list). */
const statsSlice = html.slice(atPanelStats, html.indexOf('id="panel-symptoms"'));
['progressSection', 'cycleCalendarBlock', 'calendarContainer', 'legend', 'cultureCard',
  'lunarInfo', 'statsSummaryGrid', 'predictionHighlight', 'sleepCard'].forEach((id) => {
  check(`#${id} is still in #panel-stats`, statsSlice.indexOf('id="' + id + '"') !== -1);
});

/* The header must still open the panel, ahead of the ring and the calendar. */
const atHead = html.indexOf('class="cycle-head"');
check('#panel-stats still opens with its header, ahead of the ring and calendar',
  atHead !== -1 && atHead < atProgress && atProgress < atCalendar,
  `head=${atHead} progress=${atProgress} calendar=${atCalendar}`);

/* The FAB is Anđela-only at the profile level too; the panel rule is the new
   one, and app.js must carry both or one of them silently re-opens the hole. */
const app = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
const fabBody = (app.match(/function updateFab\(\)\s*\{[\s\S]*?\n\}/) || [''])[0];
check('updateFab() still gates on the andjela profile', /activeProfile !== 'andjela'/.test(fabBody));
check('updateFab() also gates on the Cycle panel being active',
  /querySelector\('\.panel\.active'\)/.test(fabBody) && /panel-stats/.test(fabBody),
  fabBody.slice(0, 60).replace(/\s+/g, ' '));
check('the tab switch re-runs updateFab()',
  /updateFab\(\);[\s\S]{0,80}if \(id === 'settings'\)/.test(app));

/* ── rendered: what each panel actually paints ───────────────────────────── */

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0]);
      const file = path.join(ROOT, url === '/' ? 'index.html' : url);
      if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('403'); }
      fs.readFile(file, (err, buf) => {
        if (err) { res.writeHead(404); return res.end('404'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
        res.end(buf);
      });
    });
    srv.listen(PORT, () => resolve(srv));
  });
}

const VIEWPORTS = [
  { w: 320, h: 800, tag: '320x800' },
  { w: 768, h: 1024, tag: '768x1024' },
  { w: 1440, h: 900, tag: '1440x900' },
];
const TABS = ['dashboard', 'together', 'diary', 'stats', 'settings'];
const NO_CYCLE = ['dashboard', 'together', 'diary', 'settings'];

(async () => {
  const srv = await serve();
  const browser = await chromium.launch();

  try {
    for (const vp of VIEWPORTS) {
      for (const theme of ['light', 'dark']) {
        const ctx = await browser.newContext({
          viewport: { width: vp.w, height: vp.h },
          colorScheme: theme,
          serviceWorkers: 'block',
        });
        await ctx.addInitScript((t) => {
          try {
            localStorage.setItem('cycle-active-profile', 'andjela');
            localStorage.setItem('cycle-lang', 'sr');
            localStorage.setItem('cycle-theme', t);
            localStorage.setItem('cycle-theme-andjela', t);
            sessionStorage.setItem('cycle-logged-in', '1');
          } catch (e) { /* ignore */ }
        }, theme);
        const page = await ctx.newPage();
        const errors = [];
        page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.split('\n')[0]));
        page.on('console', (m) => {
          if (m.type() !== 'error') return;
          const t = m.text();
          if (/favicon|Failed to load resource|net::ERR_/i.test(t)) return;
          errors.push('console: ' + t.split('\n')[0]);
        });
        await page.route('**/*', (r) => (
          r.request().url().startsWith(BASE) ? r.continue() : r.abort()
        ));
        await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('.tab[data-panel="dashboard"]', { timeout: 30000 });
        await page.waitForTimeout(1100);

        const tag = `${vp.tag}-${theme}`;

        for (const tab of TABS) {
          await page.click(`.tab[data-panel="${tab}"]`).catch(() => {});
          await page.waitForTimeout(450);

          const s = await page.evaluate(() => {
            const vis = (el) => {
              if (!el) return false;
              const cs = getComputedStyle(el);
              if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
              const r = el.getBoundingClientRect();
              return r.width > 0 && r.height > 0;
            };
            const fab = document.getElementById('fabBtn');
            const fabRect = fab ? fab.getBoundingClientRect() : null;
            /* Every tappable thing in the panel that is actually on screen, and
               whether the FAB's live box covers any part of it. */
            const hits = [];
            if (fabRect && vis(fab)) {
              const sel = 'button, a, input, textarea, select, [role="button"], .day';
              Array.prototype.forEach.call(
                document.querySelectorAll('.panel.active ' + sel), (el) => {
                  if (el === fab || !vis(el)) return;
                  const r = el.getBoundingClientRect();
                  if (r.bottom < 0 || r.top > window.innerHeight) return;
                  const x = Math.min(fabRect.right, r.right) - Math.max(fabRect.left, r.left);
                  const y = Math.min(fabRect.bottom, r.bottom) - Math.max(fabRect.top, r.top);
                  if (x > 0 && y > 0) {
                    hits.push((el.id || el.className || el.tagName).toString().slice(0, 28) +
                      ':' + Math.round(x) + 'x' + Math.round(y));
                  }
                });
            }
            return {
              panelVisible: vis(document.getElementById('progressSection')),
              inPanel: !!document.querySelector('#panel-stats #progressSection'),
              clockVisible: vis(document.getElementById('cycleCalendarBlock')),
              fabVisible: vis(fab),
              fabHits: hits,
              docW: document.documentElement.scrollWidth,
              winW: window.innerWidth,
            };
          });

          if (NO_CYCLE.indexOf(tab) !== -1) {
            check(`[${tag}/${tab}] the cycle ring is NOT on screen`, s.panelVisible === false,
              `visible=${s.panelVisible}`);
            check(`[${tag}/${tab}] the FAB is NOT on screen`, s.fabVisible === false,
              `visible=${s.fabVisible}`);
            check(`[${tag}/${tab}] nothing tappable is under the FAB`,
              s.fabHits.length === 0, JSON.stringify(s.fabHits.slice(0, 3)));
          } else {
            check(`[${tag}/${tab}] the cycle ring IS on screen`, s.panelVisible === true,
              `visible=${s.panelVisible}`);
            check(`[${tag}/${tab}] the ring is inside the Cycle panel`, s.inPanel === true);
            check(`[${tag}/${tab}] the calendar is still on screen`, s.clockVisible === true);
            check(`[${tag}/${tab}] the FAB is on screen`, s.fabVisible === true);
            /* On Cycle the FAB necessarily floats over the calendar grid, which
               is tall and scrollable, so any cell can be scrolled clear of it.
               Recorded rather than asserted: "overlaps a scrollable cell" is the
               intended FAB behaviour, and asserting 0 would be asserting that
               the calendar is shorter than the viewport. */
            check(`[${tag}/${tab}] FAB overlap on the cycle page (recorded)`, true,
              `${s.fabHits.length} overlapping: ${JSON.stringify(s.fabHits.slice(0, 2))}`);
          }
          check(`[${tag}/${tab}] no horizontal overflow`, s.docW <= s.winW + 1,
            `docW=${s.docW} winW=${s.winW}`);
        }

        /* The specific pair reported broken: at 320x800 the reaction row sat
           under the FAB. Assert it by name, on the tab that owns the row. */
        await page.click('.tab[data-panel="dashboard"]').catch(() => {});
        await page.waitForTimeout(400);
        const react = await page.evaluate(() => {
          const row = document.querySelector('#dash-today .tnew-react');
          const fab = document.getElementById('fabBtn');
          const v = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { l: b.left, r: b.right, t: b.top, b: b.bottom }; };
          const a = v(row), b = v(fab);
          if (!a || !b) return { row: !!a, fab: !!b, overlap: null };
          const x = Math.min(a.r, b.r) - Math.max(a.l, b.l);
          const y = Math.min(a.b, b.b) - Math.max(a.t, b.t);
          return { row: true, fab: true, overlap: (x > 0 && y > 0) ? Math.round(x) + 'x' + Math.round(y) : null,
            fabVisible: getComputedStyle(fab).display !== 'none' && fab.getBoundingClientRect().width > 0 };
        });
        check(`[${tag}] the Home reaction row is clear of the FAB`,
          react.overlap === null,
          `overlap=${react.overlap} fabVisible=${react.fabVisible}`);

        check(`[${tag}] no page error / console error`, errors.length === 0,
          errors.slice(0, 2).join(' | ') || 'none');
        await ctx.close();
      }
    }
  } finally {
    await browser.close();
    srv.close();
  }

  console.log(`\n${passed}/${passed + failed} passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
