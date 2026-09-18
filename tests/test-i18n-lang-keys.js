/**
 * i18n — language-key resolution for the content tables.
 *
 * Phase 0-C fixed three sites where a table was keyed with the bare code `zh`
 * but looked up with the full locale `zh-CN`. `obj['zh-CN']` is undefined, so
 * the lookup fell through to `|| obj.sr` and Chinese users silently read
 * Serbian. Nothing threw, nothing logged — which is exactly why these need a
 * test rather than a one-time fix.
 *
 * The same shape recurs (bare `zh` vs `zh-CN`), so this file pins BOTH halves:
 *   · the data really is keyed `zh` (so the fallback is load-bearing), and
 *   · the lookup really widens to the base language before giving up.
 *
 * Run: node tests/test-i18n-lang-keys.js
 */
'use strict';

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

// Mirrors the production fallback chain: exact locale, then base language,
// then Serbian. Kept here so the simulation below tests the same rule the
// app uses rather than a re-invention of it.
const resolve = (map, lang) =>
  map[lang] || map[String(lang).split('-')[0]] || map.sr;

// ── 1. Know-Me questions (Daily Question) ──────────────────────────────
// Declared twice: once in js/social.js and again in js/render-love.js.
// Both are keyed sr / zh / en — bare `zh`, no `zh-CN`.
for (const file of ['js/social.js', 'js/render-love.js']) {
  const src = read(file);
  const items = src.match(/q:\{sr:"[^"]*",zh:"[^"]*",en:"[^"]*"\}/g) || [];
  check(`${file}: Know-Me questions are keyed sr/zh/en (bare zh)`,
    items.length > 0, `items=${items.length}`);

  // Extract one q-map and prove the zh-CN lookup only works via the fallback.
  const sample = items.length ? items[0].slice(3).replace(/^\{/, '').replace(/\}$/, '') : '';
  const pairs = sample ? sample.match(/[a-zA-Z-]+:"[^"]*"/g) || [] : [];
  const map = {};
  for (const p of pairs) {
    const i = p.indexOf(':');
    map[p.slice(0, i)] = p.slice(i + 1).replace(/^"|"$/g, '');
  }
  check(`${file}: a question has zh but NOT zh-CN (fallback is required)`,
    !!map.zh && !map['zh-CN'],
    `keys=${Object.keys(map).join(',') || 'none'}`);
  check(`${file}: resolving lang='zh-CN' yields Chinese, not Serbian`,
    !!map.zh && resolve(map, 'zh-CN') === map.zh && resolve(map, 'zh-CN') !== map.sr,
    `got=${JSON.stringify(String(resolve(map, 'zh-CN') || '').slice(0, 12))}`);
}

// The literal fix chains, pinned so an edit that reverts them fails here.
check('js/render-love.js: renderKnowMe widens to the base language',
  read('js/render-love.js').includes('a=n.q[lang]||n.q[lang.split("-")[0]]||n.q.sr'));
check('js/social.js: renderKnowMe widens to the base language',
  read('js/social.js').includes('a=t.q[lang]||t.q[lang.split("-")[0]]||t.q.sr'));

// ── 2. Daily love messages ─────────────────────────────────────────────
// DAILY_LOVE_MESSAGES had only zh + sr. The renderer indexed it with h.en
// for English, producing the literal string "💌 undefined".
{
  const src = read('js/weather.js');
  const items = src.match(/\{zh:"[^"]*",sr:"[^"]*",en:"[^"]*"\}/g) || [];
  check('js/weather.js: every daily love message now carries en',
    items.length === 12, `with_en=${items.length} expected=12`);
  check('js/weather.js: the English branch cannot render undefined',
    src.includes('0===(lang||"").indexOf("en")?(h.en||h.zh):h.sr'));
}

// ── 3. DASH_I18N is keyed by language, not by identity ─────────────────
{
  const src = read('js/module-dashboard.js');
  const start = src.indexOf('var DASH_I18N');
  const block = src.slice(start, src.indexOf('var DAILY_QS'));
  check('DASH_I18N has a column for each supported language',
    /\bsr:\s*\{/.test(block) && /'zh-CN':\s*\{/.test(block) && /\ben:\s*\{/.test(block),
    `sr=${/\bsr:\s*\{/.test(block)} zh-CN=${/'zh-CN':\s*\{/.test(block)} en=${/\ben:\s*\{/.test(block)}`);
  check('DASH_I18N no longer conflates identity with language',
    !/\bbarry:\s*\{/.test(block) && !/\bandjela:\s*\{/.test(block),
    `barry=${/\bbarry:\s*\{/.test(block)} andjela=${/\bandjela:\s*\{/.test(block)}`);

  // The three columns must expose the same keys, or a language silently loses
  // a label. Bounded by the next column's opening brace rather than by the next
  // '}' — the values contain \u{...} escapes whose closing brace would end the
  // slice after the first property and make every column compare equal at one.
  const cut = (from, to) => {
    const a = block.indexOf(from);
    const b = to === null ? block.lastIndexOf('};') : block.indexOf(to);
    if (a === -1 || b === -1 || b <= a) return [];
    // Start after the column's own opening brace, or the header line
    // (`sr: {`) is itself matched as a key named `sr`.
    const body = block.slice(block.indexOf('{', a) + 1, b);
    return body.match(/^\s*(\w+):/gm)?.map((k) => k.trim().replace(':', '')) || [];
  };
  const sr = cut('sr: {', "'zh-CN': {").sort();
  const zh = cut("'zh-CN': {", 'en: {').sort();
  const en = cut('en: {', null).sort();

  // Asserted against the known width, so a truncated extraction fails loudly
  // instead of satisfying the equality below with three empty-ish arrays.
  check('each DASH_I18N column declares all 12 labels',
    sr.length === 12 && zh.length === 12 && en.length === 12,
    `sr=${sr.length} zh-CN=${zh.length} en=${en.length}`);
  check('all three DASH_I18N columns declare the same keys',
    sr.join() === zh.join() && sr.join() === en.join(),
    `sr=[${sr.join(',')}] zh=[${zh.join(',')}] en=[${en.join(',')}]`);

  check('dl() resolves by language with an sr fallback',
    src.includes("var L = (typeof lang !== 'undefined' && lang) ? lang : 'sr';"));
}

console.log(`\n${passed}/${passed + failed} passed`);
process.exit(failed ? 1 : 0);
