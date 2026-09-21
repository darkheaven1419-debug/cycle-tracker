/**
 * Phase 2B.6 — the two pre-existing defects fixed alongside Memories.
 *
 * Neither of these is a Memories feature, and neither was found by looking at
 * the page. Both were silent: the code ran, nothing threw, and the screen showed
 * something that was merely wrong.
 *
 *   1. sendHug() wrote `hug-count-<day>` into localStorage, and renderHug() read
 *      it back from sessionStorage. Nothing ever wrote sessionStorage, so the
 *      read was always 0. That value is not just a label — it gates the
 *      `else if (r > 0)` branch, so the "hug sent, waiting for one back" state
 *      was UNREACHABLE: after sending, the card fell through to the plain
 *      "send a hug" button again, and the two hearts never rendered at all.
 *      The same mismatch sat in a pre-Phase-1C duplicate of both functions in
 *      js/social.js, so which definition wins the load order decided whether the
 *      bug was visible. Both are asserted, because both are live code paths.
 *
 *   2. Know Me asked "was that right?" twice. `knowMeLead` says it ("she guessed
 *      you — was she right?") and `knowMeFb` said it again directly above the two
 *      answer buttons. In Chinese the two sentences were literally identical, so
 *      the duplication was visible rather than merely redundant. The lead is
 *      pinned character-for-character by two other suites; the second copy was
 *      pinned by nothing, so the second copy is the one that had to go. What must
 *      NOT change is the lead, and this suite re-asserts it where the removal
 *      happened.
 *
 * Run: node tests/test-phase2b6-polish.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8988;
const URL = `http://localhost:${PORT}/index.html`;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

const LOVE_SRC = fs.readFileSync(path.join(ROOT, 'js/render-love.js'), 'utf8');
const SOCIAL_SRC = fs.readFileSync(path.join(ROOT, 'js/social.js'), 'utf8');

const APP_KEY = 'test-app-key-phase2b6-polish-000000000000000000';

/* The lead as tests/test-phase2b-knowme.js pins it, for the Barry viewer. */
const LEAD_HERS = 'Ona je poga\u{0111}ala tebe \u{2014} je li pogodila?';
const LEAD_HERS_ZH = '\u{5979}\u{731C}\u{4E86}\u{4F60}\u{2014}\u{2014}\u{731C}\u{5BF9}\u{4E86}\u{5417}\u{FF1F}';

const DAY = 864e5;
const TODAY = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
function dayKeyAgo(n) {
  const d = new Date(TODAY.getTime() - n * DAY);
  const p = (x) => (x < 10 ? '0' : '') + x;
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
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

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

// ══════════════════════════════════════════════════════════════════════════
// 1. STATIC — the store mismatch cannot come back on either code path
// ══════════════════════════════════════════════════════════════════════════

{
  /* Both files carry a full "send a hug" / "draw a hug" pair. Only one wins the
     load order (the live pair is asserted in the browser half below), so a fix
     applied to one and not the other would look fixed on one machine and stay
     broken on another. Assert the contract on both, by name. */
  const hugFiles = [['js/render-love.js', LOVE_SRC], ['js/social.js', SOCIAL_SRC]];
  const rows = hugFiles.map(([name, src]) => {
    const reads = (src.match(/localStorage\.getItem\("hug-count-/g) || []).length;
    const writes = (src.match(/localStorage\.setItem\("hug-count-/g) || []).length;
    /* Anything that reaches for the day's count through sessionStorage — the
       exact shape of the bug — regardless of how it is spelled. */
    const stray = (src.match(/sessionStorage[^;\n]{0,80}hug-count|hug-count[^;\n]{0,80}sessionStorage/g) || []).length;
    const anySession = (src.match(/sessionStorage/g) || []).length;
    return { name, reads, writes, stray, anySession };
  });
  check('P1 both hug implementations read and write the day count through the same store',
    rows.every((r) => r.reads >= 2 && r.writes === 1 && r.stray === 0),
    rows.map((r) => `${r.name}: ${r.reads} reads, ${r.writes} write, ${r.stray} sessionStorage`).join(' | '));
  check('P2 neither file touches sessionStorage at all',
    rows.every((r) => r.anySession === 0),
    rows.map((r) => `${r.name}=${r.anySession}`).join(' '));
}

{
  /* Know Me, with comments removed: the block comment above knowMeFb quotes the
     sentence it explains, so a raw source scan would count the explanation as a
     second occurrence. The code is what ships to the browser. */
  const code = LOVE_SRC.replace(/\/\*[\s\S]*?\*\//g, '');
  const removed = [
    ['zh', /["']猜对了吗？["']/],
    ['sr', /["']Da li je tačno\?["']/],
    ['en', /["']Was that right\?["']/],
  ].filter(([, re]) => re.test(code)).map(([k]) => k);
  check('P3 the second "was that right?" prompt is gone from the shipped code',
    removed.length === 0, `still present in: ${removed.join(',') || 'none'}`);

  /* And the half that had to survive — the lead — really did survive. */
  check('P4 the lead that asks the question once is untouched in all three locales',
    /她猜了你——猜对了吗？/.test(code) &&
    /She guessed you — was she right\?/.test(code) &&
    /Ona je pogađala tebe — je li pogodila\?/.test(code),
    'lead wording unchanged');

  /* The answer buttons are the answer. If they ever disappear the removal above
     stops being safe, because then nothing on the card would say what the lead
     is asking about. */
  check('P5 the two answer buttons are still rendered in that branch',
    /km-fb["'][^>]*rateKnowMe\(\\?'yes\\?'\)/.test(code) &&
    /km-fb["'][^>]*rateKnowMe\(\\?'almost\\?'\)/.test(code),
    'yes/almost buttons present');
}

// ══════════════════════════════════════════════════════════════════════════
// 2. BROWSER
// ══════════════════════════════════════════════════════════════════════════

(async () => {
  const srv = await serve();
  const browser = await chromium.launch();
  let OUT = null;
  try { OUT = path.join(__dirname, '..', '.claude-verify', 'p2b6'); fs.mkdirSync(OUT, { recursive: true }); } catch (e) { OUT = null; }

  function langSeed(me, lang) {
    const other = me === 'barry' ? 'andjela' : 'barry';
    const seed = { 'ct-app-key': APP_KEY, 'cycle-lang': lang, 'cycle-lang-chosen': '1' };
    [me, other].forEach((p) => {
      seed['cycle-lang-' + p] = lang;
      seed['cycle-lang-chosen-' + p] = '1';
    });
    return seed;
  }

  async function open(me, lang, extra) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true, isMobile: true, deviceScaleFactor: 2,
      serviceWorkers: 'block',
    });
    await ctx.addInitScript((arg) => {
      try {
        localStorage.setItem('cycle-active-profile', arg.profile);
        sessionStorage.setItem('cycle-logged-in', '1');
        Object.keys(arg.seed).forEach((k) => {
          const v = arg.seed[k];
          localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
        });
      } catch (e) { /* ignore */ }
    }, { profile: me, seed: Object.assign(langSeed(me, lang), extra || {}) });

    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message.split('\n')[0]));
    await page.route('**/*', (route) => {
      const u = route.request().url();
      if (u.indexOf('api.github.com') !== -1) return route.abort();
      if (u.includes('open-meteo') || u.includes('translate.google') ||
          u.includes('mymemory') || u.includes('argosopentech')) return route.abort();
      if (u.includes('workers.dev')) {
        const o = route.request().headers()['origin'];
        return route.fulfill({
          status: 200, contentType: 'application/json',
          headers: o ? { 'Access-Control-Allow-Origin': o, Vary: 'Origin' } : {},
          body: JSON.stringify({ sha: null, state: {} }),
        });
      }
      return route.continue();
    });

    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.tab[data-panel="together"]', { timeout: 15000 });
    await page.click('.tab[data-panel="together"]');
    await page.waitForTimeout(1200);
    return { ctx, page, errs };
  }

  const shoot = async (page, name) => {
    if (!OUT) return;
    await page.screenshot({ path: path.join(OUT, name + '.png') });
  };

  /* ── P6..P13: the hug loop ─────────────────────────────────────────────── */
  {
    const { ctx, page, errs } = await open('barry', 'zh-CN');

    /* The live definitions are the ones that matter — a fix in the file that
       loses the load order would not change what a person sees. */
    const live = await page.evaluate(() => ({
      send: typeof window.sendHug === 'function' ? window.sendHug.toString() : null,
      draw: typeof window.renderHug === 'function' ? window.renderHug.toString() : null,
    }));
    check('P6 the live sendHug/renderHug are the ones reading the shared store',
      !!live.send && !!live.draw &&
      /localStorage\.setItem\("hug-count-/.test(live.send) &&
      /localStorage\.getItem\("hug-count-/.test(live.draw) &&
      !/sessionStorage/.test(live.send) && !/sessionStorage/.test(live.draw),
      `send=${(live.send || '').slice(0, 40)}… draw=${(live.draw || '').slice(0, 40)}…`);

    const initial = await page.evaluate(() => {
      window.renderHug();
      const c = document.getElementById('hugContent');
      return {
        sendBtn: !!document.querySelector('#hugContent .hug-btn'),
        sentState: !!document.querySelector('#hugContent .hug-sent-state'),
        hearts: document.querySelectorAll('#hugContent .hh-heart').length,
        key: window.fmtDate(new Date()),
        count: localStorage.getItem('hug-count-' + window.fmtDate(new Date())),
      };
    });
    check('P7 with no hug sent today the card offers the hug, and nothing else',
      initial.sendBtn && !initial.sentState && initial.count === null,
      `sendBtn=${initial.sendBtn} sentState=${initial.sentState} count=${initial.count}`);
    await shoot(page, 'hug-0-before');

    /* First hug. */
    const one = await page.evaluate((key) => {
      window.sendHug();
      const c = document.getElementById('hugContent');
      const hearts = [...c.querySelectorAll('.hh-heart')].map((h) => h.textContent);
      const again = c.querySelector('.hug-back-btn');
      return {
        count: localStorage.getItem('hug-count-' + key),
        sentState: !!c.querySelector('.hug-sent-state'),
        waiting: (c.querySelector('.hss-text') || {}).textContent || '',
        hearts,
        used: c.querySelectorAll('.hh-heart.used').length,
        againText: again ? again.textContent.trim() : null,
        shared: !!localStorage.getItem('shared-hug'),
        sendBtn: !!c.querySelector('.hug-btn'),
      };
    }, initial.key);

    /* This is the assertion the bug failed: r was always 0, so this branch was
       never reached and the card fell back to the plain send button. */
    check('P8 after one hug the card shows the sent state, not another invitation',
      one.sentState && one.sendBtn === false && one.count === '1',
      `sentState=${one.sentState} sendBtn=${one.sendBtn} count=${one.count}`);
    check('P9 the wait is stated and the remaining hug is offered',
      one.waiting.length > 0 && /\(1\)/.test(one.againText || ''),
      `waiting="${one.waiting}" again="${one.againText}"`);
    check('P10 one of two hearts is filled — the count is visible, not just stored',
      one.hearts.length === 2 && one.hearts[0] === '❤️' && one.hearts[1] === '\u{1F90D}' &&
      one.used === 1,
      `hearts=${JSON.stringify(one.hearts)} used=${one.used}`);
    await shoot(page, 'hug-1-sent');

    /* Second hug, then the refusal. */
    const two = await page.evaluate((key) => {
      window.sendHug();
      const c = document.getElementById('hugContent');
      const after2 = {
        count: localStorage.getItem('hug-count-' + key),
        hearts: [...c.querySelectorAll('.hh-heart')].map((h) => h.textContent),
        againText: (c.querySelector('.hug-back-btn') || {}).textContent || '',
      };
      const before3 = localStorage.getItem('shared-hug');
      window.sendHug();
      window.sendHug();
      const after3 = {
        count: localStorage.getItem('hug-count-' + key),
        sameShared: localStorage.getItem('shared-hug') === before3,
      };
      return { after2, after3 };
    }, initial.key);

    check('P11 the second hug fills the second heart and offers none left',
      two.after2.count === '2' && two.after2.hearts.join('') === '❤️❤️' &&
      /\(0\)/.test(two.after2.againText),
      `count=${two.after2.count} hearts=${JSON.stringify(two.after2.hearts)} again="${two.after2.againText.trim()}"`);
    check('P12 the 2-a-day limit still refuses the third and fourth, quietly',
      two.after3.count === '2' && two.after3.sameShared,
      `count=${two.after3.count} nothing new written=${two.after3.sameShared}`);
    await shoot(page, 'hug-2-limit');

    check('P13 no page error through the whole hug loop', errs.length === 0,
      errs.slice(0, 3).join(' | ') || 'none');
    await ctx.close();
  }

  /* ── P14..P19: Know Me says it once, in every locale ───────────────────── */
  {
    const today = dayKeyAgo(0);
    /* Barry is viewing, so the partner is Anđela and the lead is the "she
       guessed you" half. Her answer exists with no verdict yet — the only state
       in which the removed prompt could ever render. */
    const knowMe = {
      'shared-knowme': {
        [today]: {
          barry: { answer: 'Beograd', time: Date.now() - 3600e3 },
          andjela: { answer: 'Novi Sad', time: Date.now() - 1800e3 },
        },
      },
    };

    const CASES = [
      { lang: 'zh-CN', lead: LEAD_HERS_ZH, banned: /猜对了吗？/g, bannedN: 1, gone: null },
      { lang: 'sr', lead: LEAD_HERS, banned: /je li pogodila\?/g, bannedN: 1, gone: /Da li je tačno\?/ },
      { lang: 'en', lead: 'She guessed you — was she right?', banned: /was she right\?/gi, bannedN: 1, gone: /Was that right\?/ },
    ];

    for (const c of CASES) {
      const { ctx, page, errs } = await open('barry', c.lang, knowMe);
      const k = await page.evaluate(() => {
        window.renderKnowMe();
        const box = document.getElementById('knowMeContent');
        const text = (box || {}).textContent || '';
        return {
          text,
          leads: document.querySelectorAll('#knowMeContent .km-lead').length,
          leadText: ((document.querySelector('#knowMeContent .km-lead') || {}).textContent || '').trim(),
          fbBtns: document.querySelectorAll('#knowMeContent .km-fb').length,
          partnerShown: /Novi Sad/.test(text),
        };
      });
      const tag = `P-${c.lang}`;

      check(`${tag} the live moment is stated exactly once`,
        k.leads === 1 && (k.text.match(c.banned) || []).length === c.bannedN,
        `leads=${k.leads} occurrences=${(k.text.match(c.banned) || []).length} ` +
        `banned=${JSON.stringify(c.banned.source)}`);
      check(`${tag} the lead is still the wording the other suites pin`,
        k.leadText === c.lead, `lead="${k.leadText}"`);
      check(`${tag} the two answer buttons survive the removal`,
        k.fbBtns === 2 && k.partnerShown,
        `buttons=${k.fbBtns} partnerAnswerShown=${k.partnerShown}`);
      if (c.gone) {
        check(`${tag} the second, duplicated prompt is gone from the screen`,
          !c.gone.test(k.text), `absent=${JSON.stringify(c.gone.source)}`);
      }
      check(`${tag} no page error`, errs.length === 0, errs.slice(0, 2).join(' | ') || 'none');
      await shoot(page, 'knowme-' + c.lang);
      await ctx.close();
    }
  }

  await browser.close();
  srv.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed` +
    (OUT ? `  (PNGs in .claude-verify/p2b6/)` : ''));
  if (failed.length) console.log('failed: ' + failed.map((f) => f.name.split(' ')[0]).join(', '));
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
