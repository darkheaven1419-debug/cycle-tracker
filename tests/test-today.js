/**
 * Phase 2 regression test — the homepage Today card ("今天有你的东西").
 *
 * Verifies the since-last-visit window over partner content, that own content is
 * excluded, that stale (already-seen) content is consumed rather than replayed,
 * that the pull path refreshes the card with no page reload, and that the
 * existing dashboard cards / Todo injection are untouched.
 *
 * Run: node tests/test-today.js
 *
 * Each scenario gets its own browser context so `cycle-last-open-<profile>`
 * starts from a known state; service workers are blocked for determinism.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8932;
const URL = `http://localhost:${PORT}/index.html`;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

const HOUR = 3600000;
const DAY = 86400000;

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
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

/** Fresh context per scenario: the last-open marker must start from a known state. */
async function scenario(browser, seed) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true, isMobile: true, deviceScaleFactor: 3,
    serviceWorkers: 'block',
  });
  await ctx.addInitScript((s) => {
    try {
      window.__errs = [];
      window.addEventListener('error', (e) => window.__errs.push('ERR: ' + e.message));
      window.addEventListener('unhandledrejection', (e) => {
        window.__errs.push('REJ: ' + ((e.reason && e.reason.message) || e.reason));
      });
      // Count real invocations during boot: install a setter before either
      // module defines them, so the count is not an artefact of when we look.
      ['initDashboard', 'renderDashboard'].forEach((n) => {
        let real;
        Object.defineProperty(window, n, {
          configurable: true,
          get() { return real; },
          set(fn) {
            if (real) { real = fn; return; }
            real = function () {
              const k = '__calls_' + n;
              window[k] = (window[k] || 0) + 1;
              window.__log = window.__log || [];
              try {
                const r = fn.apply(this, arguments);
                window.__log.push([n, !!document.getElementById('panel-dashboard'), !!document.getElementById('dash-today'), null]);
                return r;
              } catch (e) {
                window.__log.push([n, !!document.getElementById('panel-dashboard'), !!document.getElementById('dash-today'), e.message]);
                throw e;
              }
            };
          },
        });
      });
      // Catch whoever detaches the Today card, and from where.
      window.__mut = [];
      (function install() {
        const root = document.documentElement;
        if (!root) return setTimeout(install, 0);
        new MutationObserver((muts) => {
          muts.forEach((m) => {
            if (!m.removedNodes) return;
            Array.prototype.forEach.call(m.removedNodes, (n) => {
              const hit = n.id === 'dash-today' || (n.querySelector && n.querySelector('#dash-today'));
              if (hit) {
                window.__mut.push({
                  what: n.id || n.className || n.nodeName,
                  from: m.target.id || m.target.className || m.target.nodeName,
                  t: Date.now(),
                });
              }
            });
          });
        }).observe(root, { childList: true, subtree: true });
      })();
      localStorage.setItem('cycle-active-profile', 'andjela');
      sessionStorage.setItem('cycle-logged-in', '1');
      Object.keys(s).forEach((k) => localStorage.setItem(k, typeof s[k] === "string" ? s[k] : JSON.stringify(s[k])));
      // Sample the dashboard panel from the very first tick so we can tell
      // "never created" apart from "created then wiped".
      window.__tl = [];
      const t0 = Date.now();
      const iv = setInterval(() => {
        const p = document.getElementById('panel-dashboard');
        const state = !p ? 'no-panel' : (document.getElementById('dash-today') ? 'HAS-TODAY' : 'no-today');
        const tl = window.__tl;
        if (!tl.length || tl[tl.length - 1][1] !== state) tl.push([Date.now() - t0, state, p ? Array.prototype.map.call(p.children, (c) => c.id || c.className.split(" ")[0]).join("|") : ""]);
        if (tl.length > 40) clearInterval(iv);
      }, 40);
    } catch (e) { /* ignore */ }
  }, seed);

  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('  [pageerror]', e.message.split('\n')[0]));
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') {
      console.log(`  [console.${m.type()}]`, m.text().slice(0, 220));
    }
  });

  const remote = { state: null };
  await page.route('**/*', (route) => {
    const u = route.request().url();
    if (u.includes('/contents/shared-state.json') && remote.state) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sha: 'test-sha',
          content: Buffer.from(JSON.stringify(remote.state), 'utf8').toString('base64'),
        }),
      });
    }
    if (u.includes('api.github.com') || u.includes('open-meteo')) return route.abort();
    return route.continue();
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.tab[data-panel="dashboard"]', { timeout: 15000 });

  return { page, ctx, remote };
}

async function openDashboard(page) {
  const def = await page.evaluate(() => {
    const t = document.querySelector('.tab.active');
    return t ? t.dataset.panel : null;
  });
  if (def !== 'dashboard') await page.click('.tab[data-panel="dashboard"]');
  try {
    await page.waitForSelector('#dash-today', { state: 'attached', timeout: 15000 });
  } catch (e) {
    const diag = await page.evaluate(() => {
      const p = document.getElementById('panel-dashboard');
      const kids = (n) => Array.prototype.map.call(n.children, (c) => c.id || c.className.split(' ')[0]);
      const before = p ? kids(p) : [];
      let renderAllErr = null;
      try { window.renderAll(); } catch (e) { renderAllErr = e.message; }
      let threw = null;
      try { window.renderDashboard(); } catch (e) { threw = e.message; }
      const after = p ? kids(p) : [];
      return {
        before, after, threw,
        bootState: typeof window.state,
        tokenLen: String(window.getGitHubToken ? (window.getGitHubToken() || '') : '').length,
        errs: window.__errs || [],
        timeline: window.__tl || [],
        renderAllErr,
        initCalls: window.__calls_initDashboard || 0,
        renderCalls: window.__calls_renderDashboard || 0,
        callLog: window.__log || [],
        mut: window.__mut || [],
      };
    });
    console.log('  [diag]', JSON.stringify(diag, null, 1));
    throw e;
  }
  return def;
}

const todayText = (page) => page.evaluate(() => {
  const el = document.getElementById('dash-today');
  return el ? el.innerText || el.textContent || '' : '';
});

(async () => {
  const srv = await serve();
  const browser = await chromium.launch();

  // ---- T1: partner content from today shows on initial load ----
  {
    const s = await scenario(browser, {
      'shared-gratitude': [{ text: 'Hvala ti za danas', from: 'barry', time: Date.now() - HOUR }],
    });
    const def = await openDashboard(s.page);
    const txt = await todayText(s.page);
    check('T1 initial load shows partner content', txt.includes('Hvala ti za danas') && txt.includes('Ima nešto od njega'),
      `defaultTab=${def} text="${txt.replace(/\s+/g, ' ').slice(0, 70)}"`);
    check('T1b relative time rendered', /pre 1 h/.test(txt), txt.replace(/\s+/g, ' ').slice(0, 70));
    await s.ctx.close();
  }

  // ---- T2: empty state when the partner has produced nothing ----
  {
    const s = await scenario(browser, {});
    await openDashboard(s.page);
    const txt = await todayText(s.page);
    check('T2 empty state shown when nothing from partner', txt.includes('Za sada ništa novo'), txt.slice(0, 60));
    await s.ctx.close();
  }

  // ---- T3: my own content must never appear in the card ----
  {
    const s = await scenario(browser, {
      'shared-gratitude': [{ text: 'MOJA PORUKA', from: 'andjela', time: Date.now() - HOUR }],
    });
    await openDashboard(s.page);
    const txt = await todayText(s.page);
    check('T3 own content excluded', !txt.includes('MOJA PORUKA') && txt.includes('Za sada ništa novo'), txt.slice(0, 60));
    await s.ctx.close();
  }

  // ---- T4: already-seen content is consumed, not replayed ----
  {
    const s = await scenario(browser, {
      'cycle-last-open-andjela': String(Date.now()),
      'shared-gratitude': [{ text: 'STARA VEST', from: 'barry', time: Date.now() - HOUR }],
    });
    await openDashboard(s.page);
    const txt = await todayText(s.page);
    check('T4 seen content not replayed (window = last open)', !txt.includes('STARA VEST'), txt.slice(0, 60));
    await s.ctx.close();
  }

  // ---- T5: content before the window boundary is excluded ----
  {
    const s = await scenario(browser, {
      'shared-gratitude': [{ text: 'PRESTARO', from: 'barry', time: Date.now() - 3 * DAY }],
    });
    await openDashboard(s.page);
    const txt = await todayText(s.page);
    check('T5 pre-window content excluded (window starts today)', !txt.includes('PRESTARO'), txt.slice(0, 60));
    await s.ctx.close();
  }

  // ---- T6: the pull path refreshes the card with no page reload ----
  {
    const s = await scenario(browser, {
      'gh-token': 'test-token',
      'shared-gratitude': [{ text: 'PRVA', from: 'barry', time: Date.now() - 2 * HOUR }],
    });
    s.remote.state = { gratitude: [{ text: 'PRVA', from: 'barry', time: Date.now() - 2 * HOUR }] };
    await openDashboard(s.page);
    const before = await todayText(s.page);

    // Partner writes while the page is open; the 60s timer calls exactly this.
    s.remote.state = {
      gratitude: [
        { text: 'PRVA', from: 'barry', time: Date.now() - 2 * HOUR },
        { text: 'NOVA PORUKA', from: 'barry', time: Date.now() - 60000 },
      ],
    };
    await s.page.evaluate(() => window.pullAllSharedData());
    await s.page.waitForTimeout(900);
    const after = await todayText(s.page);
    check('T6 pull refreshes Today without reload',
      before.includes('PRVA') && !before.includes('NOVA PORUKA') && after.includes('NOVA PORUKA'),
      `before="${before.replace(/\s+/g, ' ').slice(0, 40)}" after="${after.replace(/\s+/g, ' ').slice(0, 40)}"`);

    // The pull-driven refresh must not replay the entrance animation.
    const spy = await s.page.evaluate(() => {
      let called = 0;
      const orig = window.animateDashboardCards;
      window.animateDashboardCards = function () { called++; if (orig) orig.apply(this, arguments); };
      window.renderDashboard(false);
      const afterNoAnim = called;
      window.renderDashboard();
      const afterAnim = called;
      window.animateDashboardCards = orig;
      return { afterNoAnim, afterAnim };
    });
    check('T6b pull refresh skips entrance animation', spy.afterNoAnim === 0 && spy.afterAnim === 1,
      `noAnimate=${spy.afterNoAnim} animate=${spy.afterAnim}`);
    await s.ctx.close();
  }

  // ---- T7: reload stays consistent (seen is consumed) ----
  {
    const s = await scenario(browser, {
      'shared-gratitude': [{ text: 'VIDJENO', from: 'barry', time: Date.now() - HOUR }],
    });
    await openDashboard(s.page);
    const first = await todayText(s.page);
    await s.page.reload({ waitUntil: 'domcontentloaded' });
    await s.page.waitForSelector('.tab[data-panel="dashboard"]', { timeout: 15000 });
    await openDashboard(s.page);
    await s.page.waitForTimeout(400);
    const second = await todayText(s.page);
    check('T7 reload consistent: first view sees it, second does not',
      first.includes('VIDJENO') && !second.includes('VIDJENO'),
      `first="${first.replace(/\s+/g, ' ').slice(0, 32)}" second="${second.replace(/\s+/g, ' ').slice(0, 32)}"`);
    await s.ctx.close();
  }

  // ---- T8/T9: existing dashboard cards and the Todo injection survive ----
  {
    const s = await scenario(browser, {
      'shared-gratitude': [{ text: 'Zdravo', from: 'barry', time: Date.now() - HOUR }],
    });
    await openDashboard(s.page);
    const shape = await s.page.evaluate(() => ({
      welcome: !!document.getElementById('dash-welcome'),
      stats: !!document.getElementById('dash-stats-cards'),
      connect: !!document.getElementById('dash-connect'),
      links: !!document.querySelector('#panel-dashboard .dash-links'),
      todayFirst: document.getElementById('panel-dashboard').firstElementChild.id,
      quickMark: !!document.getElementById('fix-quick-mark'),
    }));
    check('T8 existing dashboard cards intact',
      shape.welcome && shape.stats && shape.connect && shape.links && shape.quickMark,
      JSON.stringify(shape));
    check('T8b Today card is the first block on the homepage', shape.todayFirst === 'dash-today', `first=${shape.todayFirst}`);

    await s.page.waitForTimeout(3600); // fix-stats polls at 500ms and 3s
    const todo = await s.page.evaluate(() => !!document.getElementById('todoListCard'));
    check('T9 Todo card injection still works', todo);
    await s.ctx.close();
  }

  // ---- T10: trilingual wording resolves for all three languages ----
  {
    const s = await scenario(browser, { 'shared-gratitude': [{ text: 'X', from: 'barry', time: Date.now() - HOUR }] });
    await openDashboard(s.page);
    const heads = await s.page.evaluate(() => {
      const out = {};
      ['sr', 'en', 'zh-CN'].forEach((l) => {
        window.lang = l;
        window.renderDashboard(false);
        const el = document.getElementById('dash-today');
        out[l] = el ? el.innerText.replace(/\s+/g, ' ').trim() : '';
      });
      return out;
    });
    check('T10 all three languages render the headline',
      heads.sr.includes('Ima nešto od njega') && heads.en.includes('Something from him') && heads['zh-CN'].includes('有他的东西'),
      JSON.stringify(heads));
    await s.ctx.close();
  }

  await browser.close();
  srv.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
