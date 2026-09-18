/**
 * Phase 1A — the couple-space information architecture.
 *
 * These are static guarantees about source files, deliberately not a browser
 * test: every hazard below is a *shape* hazard, and shape hazards are cheapest
 * to catch by reading the source. The three that actually bite:
 *
 *   1. Nav labels are positionally coupled. app.js does
 *      `document.querySelectorAll('.tb-label').forEach((el, i) => el.textContent = t('tabs')[i])`,
 *      so adding or reordering a `.tb-label` silently mislabels every tab after
 *      it — no throw, no log, just wrong words.
 *   2. `switchToTab(id)` resolves the slot with `indexOf(id)` and bails on -1.
 *      A panel missing from _tabOrder is therefore unreachable AND silent.
 *   3. `_bootDashboard` used to probe for `#dash-today` as a stand-in for "the
 *      dashboard is already built". The V2 homepage now ships a static
 *      `#dash-today` for first paint, so that probe would match before
 *      initDashboard() ever ran, and boot would exit having built nothing.
 *
 * Run: node tests/test-phase1a-ia.js
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

// The V2 IA, in visual order. Everything below is pinned against this one list.
const VISIBLE_SLOTS = ['dashboard', 'together', 'diary', 'stats', 'settings'];
const HIDDEN_SLOTS = ['symptoms'];

const html = read('index.html');
const app = read('app.js');
const i18n = read('js/i18n.js');
const dash = read('js/module-dashboard.js');
const css = read('css/calendar.css');

/* ── Nav markup ─────────────────────────────────────────────────────────── */

const navButtons = [...html.matchAll(/<button class="tab[^"]*"([^>]*)>([\s\S]*?)<\/button>/g)]
  .map((m) => ({
    panel: (m[1].match(/data-panel="([^"]+)"/) || [])[1],
    labelId: (m[2].match(/id="tb-([^"]+)"/) || [])[1] || null,
    hidden: /\bhidden\b/.test(m[1]),
  }));

check('nav has exactly 5 labelled tabs', navButtons.filter((b) => b.labelId).length === 5,
  `labelled=${navButtons.filter((b) => b.labelId).length}`);

check('labelled tabs are the 5 V2 slots in order',
  JSON.stringify(navButtons.filter((b) => b.labelId).map((b) => b.panel)) === JSON.stringify(VISIBLE_SLOTS),
  `got=${JSON.stringify(navButtons.filter((b) => b.labelId).map((b) => b.panel))}`);

check('each labelled tab carries its own tb-<panel> id',
  navButtons.filter((b) => b.labelId).every((b) => b.labelId === b.panel),
  JSON.stringify(navButtons.filter((b) => b.labelId).map((b) => b.labelId)));

/* The symptoms router must exist as a real .tab (switchToTab clicks it) but
   carry no .tb-label, or it would consume a slot in the positional assignment
   and shift every label after it. */
const symBtn = navButtons.find((b) => b.panel === 'symptoms');
check('symptoms router button exists', !!symBtn);
check('symptoms router carries no .tb-label', !!symBtn && symBtn.labelId === null,
  `labelId=${symBtn && symBtn.labelId}`);
check('symptoms router is hidden in markup', !!symBtn && symBtn.hidden);

/* ── i18n label tables ──────────────────────────────────────────────────── */

const tabsArrays = [...i18n.matchAll(/tabs:\[([^\]]*)\]/g)].map((m) => m[1].split(','));
check('all 3 languages declare a tabs array', tabsArrays.length === 3, `found=${tabsArrays.length}`);
check('every tabs array has exactly 5 entries (positional coupling)',
  tabsArrays.length === 3 && tabsArrays.every((a) => a.length === VISIBLE_SLOTS.length),
  JSON.stringify(tabsArrays.map((a) => a.length)));

const enTabs = (tabsArrays.find((a) => a[0].indexOf('Home') !== -1) || []).map((s) => s.replace(/"/g, '').trim());
check('English labels match the V2 slot order',
  JSON.stringify(enTabs) === JSON.stringify(['Home', 'Together', 'Memories', 'Cycle', 'Settings']),
  JSON.stringify(enTabs));

check('symptomsEntry is translated in all 3 languages',
  (i18n.match(/symptomsEntry:/g) || []).length === 3,
  `found=${(i18n.match(/symptomsEntry:/g) || []).length}`);

/* ── Router order arrays ────────────────────────────────────────────────── */

const parseList = (src, name) => {
  const m = src.match(new RegExp('const\\s+' + name + '\\s*=\\s*\\[([^\\]]*)\\]'));
  return m ? m[1].split(',').map((s) => s.replace(/['"\s]/g, '')).filter(Boolean) : [];
};

const tabOrder = parseList(app, '_tabOrder');
const swipeOrder = parseList(app, '_swipeOrder');

check('_tabOrder covers all 5 visible slots plus the hidden routers',
  JSON.stringify(tabOrder) === JSON.stringify(VISIBLE_SLOTS.concat(HIDDEN_SLOTS)),
  JSON.stringify(tabOrder));

check('_swipeOrder is exactly the visible slots', JSON.stringify(swipeOrder) === JSON.stringify(VISIBLE_SLOTS),
  JSON.stringify(swipeOrder));

check('_swipeOrder never routes to a hidden panel',
  HIDDEN_SLOTS.every((s) => swipeOrder.indexOf(s) === -1), JSON.stringify(swipeOrder));

/* A slot in either list with no matching button would make switchToTab a no-op. */
const btnPanels = navButtons.map((b) => b.panel);
check('every routed slot has a matching .tab button',
  tabOrder.every((s) => btnPanels.indexOf(s) !== -1),
  `routed=${JSON.stringify(tabOrder)} buttons=${JSON.stringify(btnPanels)}`);

/* ── Boot guard regression ──────────────────────────────────────────────── */

const bootBody = (dash.match(/function _bootDashboard\(\)\s*\{[\s\S]{0,400}/) || [''])[0];
check('_bootDashboard guards on _initialized', /if\s*\(_initialized\)\s*return;/.test(bootBody),
  bootBody.slice(0, 80).replace(/\s+/g, ' '));
check('_bootDashboard does NOT probe for #dash-today (static markup makes it a false positive)',
  bootBody.length > 0 && !/getElementById\(\s*'dash-today'\s*\)/.test(bootBody));

/* ── Homepage block order ───────────────────────────────────────────────── */

/* Marker strings, not an id sweep: the skeleton also contains nested ids
   (dash-welcome, dash-q-title, dash-stats-cards …) which an id sweep would
   compare as if they were top-level blocks. `.dash-quote` is listed because
   fix-stats.js injects #todoListCard next to it, so its position is
   load-bearing even though the div carries no id of its own. */
const HOME_ORDER = [
  ['dash-couple-head', 'id="dash-couple-head"'],
  ['dash-today', 'id="dash-today"'],
  ['dash-connect', 'id="dash-connect"'],
  ['dash-quote', 'class="card dash-card dash-quote"'],
  ['dash-her-cycle', 'id="dash-her-cycle"'],
  ['dash-links-card', 'id="dash-links-card"'],
];
const skel = (dash.match(/function _initSkeleton\(panel\)\s*\{[\s\S]*?_initialized = true;/) || [''])[0];
const skelAt = HOME_ORDER.map(([name, needle]) => ({ name, at: skel.indexOf(needle) }));
check('skeleton builds every homepage block', skel.length > 0 && skelAt.every((p) => p.at !== -1),
  `missing=${JSON.stringify(skelAt.filter((p) => p.at === -1).map((p) => p.name))}`);
check('skeleton builds the homepage in the V2 order',
  skelAt.every((p, i) => p.at !== -1 && (i === 0 || p.at > skelAt[i - 1].at)),
  JSON.stringify(skelAt.map((p) => p.name + '@' + p.at)));

check('skeleton still ships the .dash-quote anchor that fix-stats.js injects next to',
  /class="card dash-card dash-quote"/.test(skel));

/* ── Together relocation ────────────────────────────────────────────────── */

const panelSrc = {};
{
  const marks = [...html.matchAll(/id="panel-([a-z]+)"/g)];
  marks.forEach((m, i) => {
    const end = i + 1 < marks.length ? marks[i + 1].index : html.length;
    if (!panelSrc[m[1]]) panelSrc[m[1]] = html.slice(m.index, end);
  });
}

const MOVED = ['hugCard', 'songCard', 'gratCard', 'knowMeCard', 'checkinCard', 'relTipCard'];
check('all 6 couple cards live in #panel-together',
  !!panelSrc.together && MOVED.every((id) => panelSrc.together.indexOf('id="' + id + '"') !== -1),
  `missing=${JSON.stringify(MOVED.filter((id) => !panelSrc.together || panelSrc.together.indexOf('id="' + id + '"') === -1))}`);
check('no couple card was left behind in #panel-stats',
  !!panelSrc.stats && MOVED.every((id) => panelSrc.stats.indexOf('id="' + id + '"') === -1),
  `left=${JSON.stringify(MOVED.filter((id) => panelSrc.stats && panelSrc.stats.indexOf('id="' + id + '"') !== -1))}`);

/* renderKnowMe is absent from applyAllUI's `connection` group, so renderTogether
   repainting all six on entry is what keeps Know Me fresh after a sync pull. */
const togetherBody = (dash.match(/function renderTogether\(\)\s*\{[\s\S]*?\n  \}/) || [''])[0];
['renderHug', 'renderGratitude', 'renderSong', 'renderCheckin', 'renderKnowMe', 'renderRelTips']
  .forEach((fn) => {
    check(`renderTogether refreshes via ${fn}`, togetherBody.indexOf(fn) !== -1);
  });

/* ── V2_I18N column parity ──────────────────────────────────────────────── */

const v2body = (dash.match(/V2_I18N\s*=\s*\{[\s\S]*?\n  \};/) || [''])[0];
/* Values are written `'\u{1F338} …'`, so a `[^}]*` capture stops inside the
   first escape sequence and yields exactly one key — which is how an earlier
   version of this test reported a vacuous "same keys in all 3 languages" pass.
   Capture up to the language object's own closing brace instead. */
const keysOf = (lang) => {
  const m = v2body.match(new RegExp("['\"]?" + lang + "['\"]?\\s*:\\s*\\{([\\s\\S]*?)\\n    \\}"));
  return m ? [...m[1].matchAll(/([A-Za-z_][A-Za-z0-9_]*)\s*:/g)].map((x) => x[1]).sort() : [];
};
const srKeys = keysOf('sr');
const zhKeys = keysOf('zh-CN');
const enKeys = keysOf('en');
/* Pinned to the real count: `> 0` is what let the brace-capture bug above pass
   as "same keys in all 3 languages" while only ever seeing one key. Raised 7 -> 14
   in Phase 1B, when the Daily Question card added its own copy (qYours,
   qPlaceholder, qSend, qUpdate, qSaved, qWaiting, qBoth) to all three columns. */
const V2_KEYS_PER_LANG = 14;
check('V2_I18N was found with all its keys', v2body.length > 0 && srKeys.length === V2_KEYS_PER_LANG,
  `keys=${srKeys.length}`);
check('V2_I18N sr / zh-CN / en declare the same keys',
  srKeys.length > 0 && JSON.stringify(srKeys) === JSON.stringify(zhKeys) && JSON.stringify(srKeys) === JSON.stringify(enKeys),
  `sr=${srKeys.length} zh=${zhKeys.length} en=${enKeys.length}`);

/* ── Symptoms entry, now inside the Cycle panel ─────────────────────────── */

check('#symEntryCard lives in #panel-stats',
  !!panelSrc.stats && panelSrc.stats.indexOf('id="symEntryCard"') !== -1);
check('symptoms entry routes through switchToTab',
  !!panelSrc.stats && /id="sym-entry-btn"[^>]*onclick="switchToTab\('symptoms'\)"/.test(panelSrc.stats));
check('symptoms entry is Barry-only, reusing the existing body.is-barry flag',
  /body\.is-barry\s+\.v2-sym-entry\s*\{[^}]*display:\s*block/.test(css) &&
  /\.v2-sym-entry\s*\{[^}]*display:\s*none/.test(css));

/* ── Cycle de-weighting on Home ─────────────────────────────────────────── */

check('#dash-her-cycle is ordered last-but-one on the homepage',
  /#dash-her-cycle\s*\{\s*order:\s*5;/.test(css));
check('the hidden symptoms tab is not rendered in the nav',
  /#tab-symptoms\s*\{\s*display:\s*none\s*!important/.test(css));

console.log(`\n${passed}/${passed + failed} passed`);
process.exit(failed ? 1 : 0);
