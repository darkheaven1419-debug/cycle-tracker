/**
 * Phase 2D — the legacy GitHub PAT channel is gone and cannot come back.
 *
 * Phase 2C moved every shared-data transport onto the Worker, so the browser's
 * only credential is the App Secret (localStorage['ct-app-key']). Phase 2D then
 * removed what was left of the old PAT story: the recovery/migration block in
 * fix-all.js, the never-loaded render-settings.js, the stale dist bundles, and
 * the api.github.com dns-prefetch.
 *
 * Two halves, because "removed" and "cannot be resurrected" are different claims:
 *   - static: the recovery code, the dead files and the stale bundles are gone,
 *     and every remaining api.github.com in runtime code is a comment or the SW's
 *     defensive bypass — i.e. no transport;
 *   - behavioural: a device that still carries a legacy gh-token in BOTH storages
 *     and in the URL ends a boot with the value deleted (not migrated), the URL
 *     scrubbed, ct-app-key untouched, and zero requests to GitHub.
 *
 * Run: node tests/test-phase2d-cleanup.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8934;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

const APP_KEY = 'test-app-key-phase2d-0000000000000000000000';
// Deliberately NOT credential-shaped. These are synthetic leftovers whose only
// job is to prove the scrub runs; nothing should read them as a real token.
const LEGACY_STORED = 'synthetic-legacy-gh-token-value';
const LEGACY_IN_URL = 'synthetic-legacy-url-param';

const WORKER_HOST = 'cycle-tracker-data.cycletracker-barry.workers.dev';
const WORKER_STATE = 'https://' + WORKER_HOST + '/state';

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

/** Every file the browser can actually execute. */
const RUNTIME = ['app.js', 'index.html', 'sw.js'].concat(
  fs.readdirSync(path.join(ROOT, 'js'))
    .filter((f) => f.endsWith('.js'))
    .map((f) => 'js/' + f)
);

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
 * One boot with a legacy PAT planted everywhere an old build could have put it,
 * plus a GitHub tripwire: any request that reaches api.github.com is recorded
 * and aborted, because in Phase 2D nothing should ever go there.
 */
async function bootWithLegacyPat(browser, opts) {
  opts = opts || {};
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true, isMobile: true, deviceScaleFactor: 3,
    serviceWorkers: 'block',
  });
  await ctx.addInitScript((s) => {
    try {
      localStorage.setItem('cycle-active-profile', 'andjela');
      sessionStorage.setItem('cycle-logged-in', '1');
      localStorage.setItem('gh-token', s.stored);
      sessionStorage.setItem('gh-token', s.stored);
      if (s.appKey) localStorage.setItem('ct-app-key', s.appKey);
    } catch (e) { /* ignore */ }
  }, { stored: LEGACY_STORED, appKey: opts.appKey || '' });

  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message.split('\n')[0]));

  const githubCalls = [];
  await page.route('**/*', (route) => {
    const req = route.request();
    const u = req.url();
    const origin = req.headers()['origin'];
    const cors = origin ? {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      Vary: 'Origin',
    } : {};
    if (u === WORKER_STATE) {
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
      return route.fulfill({
        status: 200, contentType: 'application/json', headers: cors,
        body: JSON.stringify({ sha: null, state: {} }),
      });
    }
    if (u.indexOf('api.github.com') !== -1) {
      githubCalls.push(req.method() + ' ' + u);
      return route.abort();
    }
    if (u.includes('open-meteo')) return route.abort();
    return route.continue();
  });

  const query = opts.urlParams
    ? `?token=${encodeURIComponent(LEGACY_IN_URL)}&gh-token=${encodeURIComponent(LEGACY_IN_URL)}`
    : '';
  await page.goto(`http://localhost:${PORT}/index.html${query}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.tab[data-panel="dashboard"]', { timeout: 15000 });
  await page.waitForTimeout(300);

  const observed = await page.evaluate(() => {
    const get = (store, k) => { try { return store.getItem(k); } catch (e) { return 'ERR'; } };
    return {
      localGh: get(localStorage, 'gh-token'),
      sessionGh: get(sessionStorage, 'gh-token'),
      appKey: get(localStorage, 'ct-app-key'),
      search: window.location.search,
      hasDashboardTab: !!document.querySelector('.tab[data-panel="dashboard"]'),
      hasSettingsInput: !!document.getElementById('set-gh-token'),
      stateIsObject: !!(window.state && typeof window.state === 'object'),
    };
  });

  await ctx.close();
  return { observed, githubCalls, pageErrors };
}

(async () => {
  // ── A. the recovery logic is gone, not merely unused ──
  {
    const fa = read('js/fix-all.js');
    const readsGh = /(getItem|setItem)\(\s*['"]gh-token/.test(fa);
    check('D1 fix-all.js no longer reads or writes gh-token (no recovery, no migration)',
      !readsGh, `getItem/setItem on gh-token present=${readsGh}`);

    // The delete-only scrub is what replaces it. Without it, a device could keep
    // a stale PAT in storage forever, which is the "resurrectable" state.
    const scrubs = /localStorage\.removeItem\(\s*['"]gh-token['"]\s*\)/.test(fa) &&
      /sessionStorage\.removeItem\(\s*['"]gh-token['"]\s*\)/.test(fa);
    check('D1b fix-all.js deletes any residual gh-token from both storages', scrubs,
      `removeItem both storages=${scrubs}`);

    // §七 7.1: the App Secret must not be touched by the PAT scrub. Assert the
    // storage operations, not the word: the comment above is allowed to name it,
    // and only an op could actually clobber the live credential.
    const touchesAppKey = /(get|set|remove)Item\(\s*['"]ct-app-key/.test(fa);
    check('D1c fix-all.js never touches ct-app-key in code (the scrub cannot clobber it)',
      !touchesAppKey, `storage ops on ct-app-key present=${touchesAppKey}`);

    const readers = RUNTIME.filter((f) => /getItem\(\s*['"]gh-token/.test(read(f)));
    check('D2 no runtime file reads gh-token at all (it is not a credential anywhere)',
      readers.length === 0, `readers=${readers.join(',') || 'none'}`);
  }

  // ── B. the dead code and the stale artifacts are actually gone ──
  {
    const gone = ['js/render-settings.js', 'dist/js/render-settings.js']
      .filter((f) => exists(f));
    check('D3 render-settings.js and its dist mirror are deleted', gone.length === 0,
      `still present=${gone.join(',') || 'none'}`);

    const bundles = ['dist/bundle/app.bundle.js', 'dist/bundle/app.bundle.min.js',
      'dist/bundle/app.bundle.min.js.map'].filter((f) => exists(f));
    const html = read('index.html');
    const loadsBundle = /<script[^>]*src=["']?[^"'\s>]*bundle/.test(html);
    const precachesBundle = read('sw.js').indexOf('bundle') !== -1;
    check('D4 stale dist bundles deleted, and neither loaded nor precached',
      bundles.length === 0 && !loadsBundle && !precachesBundle,
      `present=${bundles.length} loaded=${loadsBundle} precached=${precachesBundle}`);
  }

  // ── C. no runtime transport to GitHub anywhere ──
  {
    const offenders = [];
    RUNTIME.forEach((f) => {
      read(f).split('\n').forEach((line, i) => {
        if (line.indexOf('api.github.com') === -1) return;
        const t = line.trim();
        const isComment = t.startsWith('//') || t.startsWith('*') || t.startsWith('/*');
        // sw.js keeps one defensive bypass literal. It is not a transport: it
        // returns before respondWith, so no request is ever issued from it.
        const isBypass = f === 'sw.js' && /url\.hostname\.includes\('api\.github\.com'\)/.test(line);
        if (!isComment && !isBypass) offenders.push(f + ':' + (i + 1));
      });
    });
    check('D5 every api.github.com left in runtime code is a comment or the SW bypass',
      offenders.length === 0, `non-comment uses=${offenders.join(',') || 'none'}`);

    const prefetch = [...read('index.html').matchAll(/<link[^>]*dns-prefetch[^>]*>/g)]
      .map((m) => m[0]);
    const toGithub = prefetch.filter((p) => p.indexOf('api.github.com') !== -1);
    const toWeather = prefetch.filter((p) => p.indexOf('open-meteo') !== -1);
    check('D6 api.github.com dns-prefetch removed, the weather prefetch kept',
      toGithub.length === 0 && toWeather.length === 1,
      `githubPrefetch=${toGithub.length} weatherPrefetch=${toWeather.length}`);
  }

  // ── D. source/dist consistency and the SW version (§九: keep it current —
  // Phase 2D pinned v29, Phase 1B carried it to v30, Phase 1B.5 to v31,
  // Phase 1C to v32, Phase 1D took it to v35, Phase 1E to v37, the 1E
  // follow-up to v38, Phase 1.9 to v39, Phase 2B.3 to v40, Phase 2B.4 to v41
  // and Phase 2B.5 to v42, Phase 2B.6 to v43 — that last one moved both axes at
  // once: CACHE_STATIC for the bare './js/module-memories.js' and './css/v2.css',
  // APP_VERSION 7.3.8 → 7.3.9 for the versioned './js/render-love.js' and
  // './js/social.js'. Phase 2B.7 then moved only CACHE_STATIC, to v44, for the
  // bare './js/module-memories.js' alone: the timeline stops repeating the
  // featured memory and dates its newest rows relatively. No versioned asset
  // changed, so APP_VERSION stayed 7.3.9. Phase 2B.8 moved only CACHE_STATIC
  // again, to v45, for the two bare paths './js/module-memories.js' and
  // './css/v2.css': a row near the top of Memories that scrolls down to the
  // existing diary write card. APP_VERSION stayed 7.3.9 there too.) ──
  {
    const drift = ['app.js', 'js/fix-all.js', 'js/module-settings.js', 'index.html', 'sw.js']
      .filter((f) => read(f) !== read('dist/' + f));
    check('D7 the 2D-touched runtime files have byte-identical dist mirrors',
      drift.length === 0, `drift=${drift.join(',') || 'none'}`);

    const sw = read('sw.js');
    check('D8 CACHE_STATIC is the current name and no older one survives',
      /const CACHE_STATIC = 'ciklus-static-v45';/.test(sw) && sw.indexOf('ciklus-static-v44') === -1,
      `v45=${/ciklus-static-v45/.test(sw)} v44=${sw.indexOf('ciklus-static-v44') !== -1}`);

    // The files 2D changed must still be covered by the precache list, or a
    // later cache-name bump would not refresh them.
    const missing = ['./js/fix-all.js', './js/module-settings.js', './app.js']
      .filter((f) => sw.indexOf("'" + f + "'") === -1);
    check('D9 the changed runtime files are still in STATIC_ASSETS',
      missing.length === 0, `missing=${missing.join(',') || 'none'}`);
  }

  // ── E. behaviour: the PAT is deleted, not migrated ──
  const srv = await serve();
  const browser = await chromium.launch();

  {
    const { observed, githubCalls, pageErrors } = await bootWithLegacyPat(browser, {
      appKey: APP_KEY,
      urlParams: true,
    });
    check('D10 the stored legacy gh-token is deleted from localStorage and sessionStorage',
      observed.localGh === null && observed.sessionGh === null,
      `local=${observed.localGh === null ? 'null' : 'PRESENT'} session=${observed.sessionGh === null ? 'null' : 'PRESENT'}`);

    check('D11 the URL is scrubbed of ?token= and ?gh-token=',
      observed.search.indexOf('token') === -1,
      `search="${observed.search}"`);

    check('D12 ct-app-key survives the PAT scrub untouched',
      observed.appKey === APP_KEY,
      `appKeyMatch=${observed.appKey === APP_KEY}`);

    check('D13 the app still boots with the settings UI wired',
      observed.hasDashboardTab && observed.hasSettingsInput && observed.stateIsObject && pageErrors.length === 0,
      `tab=${observed.hasDashboardTab} input=${observed.hasSettingsInput} state=${observed.stateIsObject} errors=${pageErrors.slice(0, 2).join(' | ')}`);

    check('D14 zero requests to api.github.com during that boot',
      githubCalls.length === 0, githubCalls.slice(0, 3).join(' | ') || 'githubCalls=0');
  }

  // ── F. a legacy PAT alone is not a credential on any path ──
  {
    const { observed, githubCalls } = await bootWithLegacyPat(browser, { appKey: '' });
    check('D15 with no ct-app-key, a legacy PAT still authorises nothing (no GitHub call)',
      observed.localGh === null && githubCalls.length === 0,
      `localGh=${observed.localGh === null ? 'null' : 'PRESENT'} githubCalls=${githubCalls.length}`);
  }

  // ── G. the deletion is permanent: no mechanism re-creates the key ──
  {
    const writers = RUNTIME.filter((f) => /setItem\(\s*['"]gh-token/.test(read(f)));
    check('D16 nothing in runtime code can write gh-token back',
      writers.length === 0, `writers=${writers.join(',') || 'none'}`);
  }

  await browser.close();
  srv.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
