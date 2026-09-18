/**
 * Version + precache-key consistency.
 *
 * The app version is hand-maintained in three places and there is no build step
 * to keep them in sync:
 *
 *   · index.html   — the ?v= query on 23 <script src> tags
 *   · app.js       — navigator.serviceWorker.register('sw.js?v=…')
 *   · sw.js        — const APP_VERSION, which drives every versioned
 *                    STATIC_ASSETS entry
 *
 * (version.json was a fourth until Phase 0-A. Nothing in the repo ever read it,
 *  so it was deleted rather than promoted to a source of truth.)
 *
 * Why drift matters: the Cache API keys on the full URL *including the query
 * string*. If sw.js precaches './js/i18n.js' while index.html asks for
 * 'js/i18n.js?v=7.3.0', the precache entry is never matched and install-time
 * precaching silently does nothing for that file. This test fails on drift in
 * either direction, and also asserts that every script the page loads is
 * precached under an identical key.
 *
 * Run: node tests/test-version-consistency.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

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

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

// ── 1. sw.js is the single version source ───────────────────────────────
const swMatch = sw.match(/const APP_VERSION = '([^']+)'/);
check('sw.js declares a single APP_VERSION constant', !!swMatch,
  swMatch ? swMatch[1] : 'not found');
const VERSION = swMatch ? swMatch[1] : '__none__';

// ── 2. index.html carries exactly that version, and only that one ───────
const htmlVersions = [...new Set(
  [...html.matchAll(/\?v=([0-9A-Za-z._-]+)/g)].map((m) => m[1])
)];
check('index.html uses exactly one ?v= value',
  htmlVersions.length === 1, `found=${htmlVersions.join(',') || 'none'}`);
check('index.html ?v= equals sw.js APP_VERSION',
  htmlVersions.length === 1 && htmlVersions[0] === VERSION,
  `html=${htmlVersions.join(',') || 'none'} sw=${VERSION}`);

// ── 3. app.js registers the SW with the same version ────────────────────
const regMatch = app.match(/serviceWorker\.register\('sw\.js\?v=([^']+)'\)/);
check('app.js registers the SW with the same version',
  !!regMatch && regMatch[1] === VERSION,
  `app.js=${regMatch ? regMatch[1] : 'not found'} sw=${VERSION}`);

// ── 4. STATIC_ASSETS mirrors the real request URLs ──────────────────────
// Evaluate sw.js in a sandbox to resolve the concatenated entries
// ('./app.js' + V) into the literal URLs install() will actually cache.
let assets = null;
try {
  const sandbox = { self: { addEventListener: function () {} } };
  vm.createContext(sandbox);
  vm.runInContext(sw + '\n;globalThis.__ASSETS = STATIC_ASSETS;', sandbox);
  assets = sandbox.__ASSETS;
} catch (e) {
  check('sw.js evaluates and exposes STATIC_ASSETS', false, String(e && e.message));
}
if (assets) {
  check('sw.js evaluates and exposes STATIC_ASSETS', Array.isArray(assets),
    `entries=${assets.length}`);

  const srcs = [...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1]);
  check('index.html loads its scripts via <script src>', srcs.length > 0,
    `scripts=${srcs.length}`);

  // Every script the page requests must be precached under the SAME key.
  const missing = srcs.filter((s) => assets.indexOf('./' + s) === -1);
  check('every index.html <script src> is precached under an identical key',
    missing.length === 0,
    `missing=${missing.slice(0, 8).join(', ') || 'none'}`);

  // And nothing in the list may point at a file that no longer exists.
  const gone = assets.filter((a) => {
    const clean = a.replace(/^\.\//, '').split('?')[0];
    if (clean === '' || clean === 'index.html') return false;
    return !fs.existsSync(path.join(ROOT, clean));
  });
  check('every precached path resolves to a file on disk', gone.length === 0,
    `missing=${gone.join(', ') || 'none'}`);
}

// ── 5. <meta name="version"> is the page's declared version ─────────────
// index.html carries it and (after Phase 0-E) nothing reads it at runtime —
// the only reader, js/fix-all.js, held a stale '7.2.0' fallback and was dead.
// Kept as a declared marker, so it is pinned here rather than left free to rot.
// index.html is minified — attributes have no space before them
// (`<meta name="version"content="7.3.0">`), so allow optional whitespace.
const metaMatch = html.match(/<meta name="version"\s*content="([^"]+)"/);
check('index.html <meta name="version"> equals APP_VERSION',
  !!metaMatch && metaMatch[1] === VERSION,
  `meta=${metaMatch ? metaMatch[1] : 'not found'} sw=${VERSION}`);

// ── 6. nothing under js/ may carry its own version literal ──────────────
// sw.js is the single source. A second literal anywhere is a future silent
// drift — fix-all.js had exactly that, with a stale '7.2.0' fallback.
{
  const jsDir = path.join(ROOT, 'js');
  const offenders = fs.readdirSync(jsDir)
    .filter((f) => f.endsWith('.js'))
    .map((f) => {
      const src = fs.readFileSync(path.join(jsDir, f), 'utf8');
      const m = src.match(/APP_VERSION\s*=\s*['"](\d+\.\d+\.\d+)['"]/);
      return m ? `${f}=${m[1]}` : null;
    })
    .filter(Boolean);
  check('no file under js/ hardcodes its own version literal',
    offenders.length === 0, offenders.join(', ') || 'none');
}

// ── 7. build.js derives the version instead of defaulting to a literal ──
{
  const build = fs.readFileSync(path.join(ROOT, 'build.js'), 'utf8');
  const hardcoded = build.match(/APP_VERSION\s*\|\|\s*'(\d+\.\d+\.\d+)'/);
  const readsSw = /readFileSync\([^)]*sw\.js/.test(build);
  check('build.js reads the version from sw.js (no hardcoded default)',
    readsSw && !hardcoded,
    `readsSw=${readsSw} hardcoded=${hardcoded ? hardcoded[1] : 'none'}`);
}

// ── 8. the manifest carries no version at all ───────────────────────────
// It used to say "Anđelin Ciklus v7" / "— v7.1" while the app was at 7.3.0.
// Dropping the version from the name is the fix: a value that is not there
// cannot drift.
{
  const manifest = fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8');
  const found = manifest.match(/\bv?\d+\.\d+(?:\.\d+)?\b/);
  check('manifest.json carries no version literal', !found,
    found ? `found=${found[0]}` : 'none');
}

console.log(`\n${passed}/${passed + failed} passed`);
process.exit(failed ? 1 : 0);
