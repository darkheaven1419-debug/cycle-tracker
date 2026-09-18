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

// ── Phase 2C：共享数据的传输层是 Worker，不再是 GitHub Contents API ──
// 只用合成凭据；真实 app secret 绝不出现在测试里。
const APP_KEY = 'test-app-key-phase2c-today-0000000000000000';
const WORKER_HOST = 'https://cycle-tracker-data.cycletracker-barry.workers.dev';
const WORKER_STATE = WORKER_HOST + '/state';
const WORKER_TODO = WORKER_HOST + '/todo';

// 任何打到旧 GitHub 路径的请求都是传输层回归，不是网络事故：记下来，最后统一断言。
const githubCalls = [];

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

  const remote = { state: null, todo: [] };
  await page.route('**/*', (route) => {
    const req = route.request();
    const u = req.url();
    // Phase 2C：共享数据经 Worker 读写，所以假远端现在是 Worker，CORS 契约一并模拟
    // （与 tests/test-phase2a-pull.js 的写法一致）。页面 origin 是 localhost，不是生产
    // Pages origin，因此回显浏览器实际发来的 Origin —— 否则浏览器会拦掉响应，pull 永远
    // 应用不上，看起来像代码坏了，实际是夹具没搭好。
    const origin = req.headers()['origin'];
    const cors = origin ? {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      Vary: 'Origin',
    } : {};
    if (u === WORKER_STATE) {
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
      if (req.method() === 'PUT') {
        return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ sha: 'test-sha' }) });
      }
      // 远端还没被写入时返回空信封 —— 等价于旧夹具「mock 未就绪就不供给数据」。
      return route.fulfill({
        status: 200, contentType: 'application/json', headers: cors,
        body: JSON.stringify({ sha: remote.state ? 'test-sha' : null, state: remote.state || {} }),
      });
    }
    if (u === WORKER_TODO) {
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
      if (req.method() === 'PUT') {
        return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ sha: 'test-todo-sha' }) });
      }
      return route.fulfill({
        status: 200, contentType: 'application/json', headers: cors,
        body: JSON.stringify({ sha: null, todo: remote.todo || [] }),
      });
    }
    // GitHub 现在是绊线而不是传输层：打到这里就说明某条共享数据路径回退了。
    if (u.indexOf('api.github.com') !== -1) {
      githubCalls.push(req.method() + ' ' + u);
      return route.abort();
    }
    if (u.includes('open-meteo')) return route.abort();
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
        // Phase 2C：凭据是本机 App Secret；旧 getGitHubToken() 已在 2C-3 删除。
        // 只报长度，不回显值；这是失败路径的诊断输出，不参与断言。
        appKeyLen: (function () { try { return String(localStorage.getItem('ct-app-key') || '').length; } catch (e) { return -1; } })(),
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
      // 'gh-token' 仍然种下去：设备上留着旧 PAT 不应该改变任何行为（GitHub 现在是绊线）。
      'gh-token': 'test-token',
      'ct-app-key': APP_KEY, // Phase 2C：Pull 的凭据
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
      order: Array.from(document.getElementById('panel-dashboard').children)
        .map((n) => n.id || (n.classList.contains('dash-quote') ? 'dash-quote' : n.className)),
      quickMark: !!document.getElementById('fix-quick-mark'),
    }));
    check('T8 existing dashboard cards intact',
      shape.welcome && shape.stats && shape.connect && shape.links && shape.quickMark,
      JSON.stringify(shape));
    /* V2 homepage sequence: identity → what she left me → the cycle, with the
       Todo card injected next to .dash-quote by fix-stats.js. Pinned as a full
       ordered list because Phase 1A deliberately put the couple header above the
       Today card, so "Today is first" is no longer the invariant worth guarding. */
    const HOME_ORDER = ['dash-couple-head', 'dash-today', 'dash-connect', 'dash-quote', 'dash-her-cycle', 'dash-links-card'];
    const homeOrder = shape.order.filter((c) => c !== 'todoListCard');
    check('T8b homepage blocks are in the V2 order',
      JSON.stringify(homeOrder) === JSON.stringify(HOME_ORDER), `order=${JSON.stringify(shape.order)}`);

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

  // T11：10 个场景跑完后，没有任何一次共享数据请求落到 GitHub。种了 gh-token 的 T6 也在内，
  // 所以这一条同时证明「设备上留着旧 PAT 也不会把任何路径拉回 GitHub」。
  check('T11 no shared-data request reached api.github.com in any scenario',
    githubCalls.length === 0, githubCalls.slice(0, 3).join(' | ') || 'githubCalls=0');

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
