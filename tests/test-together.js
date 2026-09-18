/**
 * Phase 1B test — Together.
 *
 * Covers the three things Phase 1B is actually about:
 *   §4 Daily Question — one question a day that BOTH people answer, each seeing
 *      the other's answer, merged rather than overwritten on sync.
 *   §3 "New from your partner" — a since-last-visit hint over already-timestamped
 *      data, per person, that goes quiet once seen. Deliberately not an unread
 *      system: no global flag, nothing to clear, nothing to conflict.
 *   §8 the first screen asks something of the viewer instead of listing content.
 *
 * Symmetry (§9) is tested by running the same scenarios as both profiles: Barry
 * is not the viewer and Anđela is not the producer.
 *
 * Run: node tests/test-together.js
 *
 * Service workers are blocked for determinism; the Worker is stubbed and
 * api.github.com is a tripwire, exactly as in tests/test-echo.js.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8934;
const URL = `http://localhost:${PORT}/index.html`;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

/* The same identity the page computes: epoch day + its index into a 7-item pool.
   Language- and timezone-independent, which is the whole point — Beijing and
   Kikinda land on the same value at the same instant. */
const DAY = Math.floor(Date.now() / 864e5);
const QK = DAY + ':' + (DAY % 7);

const T1 = 1700000000000;
const T2 = 1700000001000;

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

const errors = [];

const APP_KEY = 'test-app-key-phase1b-together-000000000000000';
const WORKER_HOST = 'https://cycle-tracker-data.cycletracker-barry.workers.dev';
const WORKER_STATE = WORKER_HOST + '/state';
const WORKER_TODO = WORKER_HOST + '/todo';

const githubCalls = [];

async function scenario(browser, seed, profile) {
  const me = profile || 'andjela';
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true, isMobile: true, deviceScaleFactor: 3,
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
  }, { profile: me, seed });

  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]));

  const remote = { state: null, todo: [] };
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
      if (req.method() === 'PUT') {
        return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ sha: 'test-sha' }) });
      }
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
    if (u.indexOf('api.github.com') !== -1) {
      githubCalls.push(req.method() + ' ' + u);
      return route.abort();
    }
    if (u.includes('open-meteo')) return route.abort();
    return route.continue();
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.tab[data-panel="together"]', { timeout: 15000 });
  await page.click('.tab[data-panel="together"]');
  await page.waitForTimeout(500);
  return { page, ctx, remote };
}

const dqList = (page) => page.evaluate(() => {
  try { return JSON.parse(localStorage.getItem('shared-daily-q') || '[]'); } catch (e) { return null; }
});

/** The Daily Question card as the user sees it. */
const dqUi = (page) => page.evaluate(() => {
  const host = document.getElementById('togetherDailyQ');
  if (!host) return null;
  const lines = Array.from(host.querySelectorAll('.dq-line')).map((l) => ({
    who: l.querySelector('.dq-who') ? l.querySelector('.dq-who').textContent : '',
    done: l.classList.contains('dq-done'),
    mark: l.querySelector('.dq-mark') ? l.querySelector('.dq-mark').textContent : '',
    ans: l.querySelector('.dq-ans') ? l.querySelector('.dq-ans').textContent : '',
  }));
  const input = document.getElementById('dqInput');
  const send = host.querySelector('.dq-send');
  return {
    question: host.querySelector('.dq-q') ? host.querySelector('.dq-q').textContent : '',
    input: input ? input.value : null,
    send: send ? send.textContent : null,
    lines: lines,
    both: !!host.querySelector('.dq-both'),
  };
});

const sendAnswer = async (page, text) => {
  await page.fill('#dqInput', text);
  await page.click('#togetherDailyQ .dq-send');
  await page.waitForTimeout(400);
};

(async () => {
  const srv = await serve();
  const browser = await chromium.launch();

  // ---- D1: the first screen asks something of the viewer (§8) ----
  {
    const s = await scenario(browser, { 'ct-app-key': APP_KEY });
    const ui = await dqUi(s.page);
    const headOrder = await s.page.evaluate(() => {
      const host = document.getElementById('together-body');
      return Array.from(host.children).map((c) => c.id);
    });
    check('D1 the question and its answer box are on the first screen, above every card',
      !!ui && ui.question.length > 0 && ui.input !== null && ui.send !== null &&
      JSON.stringify(headOrder.slice(0, 3)) === JSON.stringify(['together-head', 'together-new', 'together-daily']),
      `q="${ui && ui.question}" order=${JSON.stringify(headOrder)}`);
    await s.ctx.close();
  }

  // ---- D2: answering writes one record, and only my own line says I answered ----
  {
    const s = await scenario(browser, { 'ct-app-key': APP_KEY });
    await sendAnswer(s.page, 'Zato što si ti');
    const list = await dqList(s.page);
    const rec = list[0] || {};
    check("D2 one answer writes one record under today's language-independent key",
      list.length === 1 && rec.qKey === QK && rec.from === 'andjela' &&
      rec.answer === 'Zato što si ti' && typeof rec.time === 'number' && rec.time > 0,
      JSON.stringify(list));

    const ui = await dqUi(s.page);
    check("D2b my line shows my answer; my partner's line still reads as unanswered",
      ui.lines.length === 2 && ui.lines[0].who === 'Anđela' && ui.lines[0].done &&
      ui.lines[0].ans === 'Zato što si ti' && ui.lines[1].who === 'Barry' &&
      ui.lines[1].done === false && ui.both === false,
      JSON.stringify(ui.lines));
    await s.ctx.close();
  }

  // ---- D3: both answered -> the partner's answer is visible and the pair is marked complete ----
  {
    const s = await scenario(browser, {
      'ct-app-key': APP_KEY,
      'shared-daily-q': [{ qKey: QK, from: 'barry', answer: 'Tvoj osmeh', time: T2 }],
    });
    await sendAnswer(s.page, 'Tvoje pismo');
    const ui = await dqUi(s.page);
    check('D3 when both have answered, both answers show and the pair reads as complete',
      ui.lines[0].ans === 'Tvoje pismo' && ui.lines[1].ans === 'Tvoj osmeh' &&
      ui.lines[0].done && ui.lines[1].done && ui.both === true,
      JSON.stringify(ui.lines) + ' both=' + ui.both);
    await s.ctx.close();
  }

  // ---- D4: re-answering replaces only my own record ----
  {
    const s = await scenario(browser, {
      'ct-app-key': APP_KEY,
      'shared-daily-q': [
        { qKey: QK, from: 'barry', answer: 'Tvoj osmeh', time: T2 },
        { qKey: QK, from: 'andjela', answer: 'prvi pokusaj', time: T1 },
      ],
    });
    await sendAnswer(s.page, 'drugi pokusaj');
    const list = await dqList(s.page);
    const mine = list.filter((e) => e.from === 'andjela');
    const theirs = list.filter((e) => e.from === 'barry');
    check("D4 editing my answer replaces my record and leaves my partner's untouched",
      list.length === 2 && mine.length === 1 && mine[0].answer === 'drugi pokusaj' &&
      theirs.length === 1 && theirs[0].answer === 'Tvoj osmeh',
      JSON.stringify(list));
    await s.ctx.close();
  }

  // ---- D5: refresh keeps it (it is stored state, not render state) ----
  {
    const s = await scenario(browser, { 'ct-app-key': APP_KEY });
    await sendAnswer(s.page, 'ostaje posle osvezavanja');
    await s.page.reload({ waitUntil: 'domcontentloaded' });
    await s.page.waitForSelector('.tab[data-panel="together"]', { timeout: 15000 });
    await s.page.click('.tab[data-panel="together"]');
    await s.page.waitForTimeout(500);
    const ui = await dqUi(s.page);
    check('D5 the answer survives a reload',
      ui.input === 'ostaje posle osvezavanja' && ui.lines[0].ans === 'ostaje posle osvezavanja',
      JSON.stringify(ui));
    await s.ctx.close();
  }

  // ---- D6: merge — a pull brings the partner's answer in WITHOUT erasing mine ----
  // This is why dailyQ is append-only and merged by (qKey|from) rather than
  // written wholesale: replace semantics would drop whichever side wrote second.
  // (knowme used to be the counter-example named here; Phase 1B.5 gave it its own
  // field-wise merge — see M1..M6 — so it is no longer one.)
  {
    const s = await scenario(browser, { 'ct-app-key': APP_KEY });
    await sendAnswer(s.page, 'moj odgovor');

    s.remote.state = { dailyQ: [{ qKey: QK, from: 'barry', answer: 'njegov odgovor', time: T2 }] };
    await s.page.evaluate(() => window.pullAllSharedData());
    await s.page.waitForTimeout(900);

    const list = await dqList(s.page);
    const ui = await dqUi(s.page);
    check("D6 a pull merges the partner's answer in and keeps mine",
      list.length === 2 && ui.lines[0].ans === 'moj odgovor' && ui.lines[1].ans === 'njegov odgovor' && ui.both,
      JSON.stringify(list));

    const pushed = await s.page.evaluate(() => {
      const st = window.collectSharedState ? window.collectSharedState() : null;
      return st ? st.dailyQ.length : -1;
    });
    check('D6b the state this device pushes carries both answers', pushed === 2, `dailyQ=${pushed}`);
    await s.ctx.close();
  }

  // ---- D7: §9 symmetry — Barry's side behaves identically ----
  {
    const s = await scenario(browser, {
      'ct-app-key': APP_KEY,
      'shared-daily-q': [{ qKey: QK, from: 'andjela', answer: 'njen odgovor', time: T2 }],
    }, 'barry');
    const before = await dqUi(s.page);
    check('D7 as Barry, the first screen shows the question box and her answer',
      before.lines[0].who === 'Barry' && before.lines[0].done === false &&
      before.lines[1].who === 'Anđela' && before.lines[1].ans === 'njen odgovor' && before.both === false,
      JSON.stringify(before.lines));

    await sendAnswer(s.page, 'barryjev odgovor');
    const list = await dqList(s.page);
    const ui = await dqUi(s.page);
    check('D7b Barry can answer too, and the pair then reads as complete',
      list.length === 2 && list.filter((e) => e.from === 'barry').length === 1 &&
      list.filter((e) => e.from === 'andjela')[0].answer === 'njen odgovor' &&
      ui.both === true,
      JSON.stringify(list));
    await s.ctx.close();
  }

  // ---- D8: §3 "new from your partner" — his reaction shows up inside the window ----
  {
    const s = await scenario(browser, {
      'ct-app-key': APP_KEY,
      'cycle-last-open-andjela': String(Date.now() - 3600000),
      'shared-gratitude': [{ text: 'Hvala ti', from: 'barry', time: T1 }],
      'shared-gratitude-echo': [{ noteFrom: 'barry', noteTime: T1, from: 'barry', emoji: '🫂', time: Date.now() }],
    });
    const hint = await s.page.evaluate(() => {
      const host = document.getElementById('together-new');
      return { hidden: host.hidden, html: host.innerHTML };
    });
    check('D8 a partner reaction inside the window raises the "new" hint',
      hint.hidden === false && hint.html.indexOf('🫂') !== -1,
      JSON.stringify(hint).slice(0, 200));
    await s.ctx.close();
  }

  // ---- D9: nothing fresh -> the hint stays away (it is not a content list) ----
  {
    const s = await scenario(browser, {
      'ct-app-key': APP_KEY,
      'cycle-last-open-andjela': String(Date.now() - 3600000),
      // Only her OWN note is recent: her partner left nothing, so there is nothing
      // to tell her about. "Seeing it is consuming it", not "list content".
      'shared-gratitude': [{ text: 'moja beleska', from: 'andjela', time: Date.now() }],
    });
    const hint = await s.page.evaluate(() => document.getElementById('together-new').hidden);
    check('D9 with nothing from the partner the hint stays hidden', hint === true, `hidden=${hint}`);
    await s.ctx.close();
  }

  // ---- D10: no unread system is invented anywhere ----
  {
    const s = await scenario(browser, {
      'ct-app-key': APP_KEY,
      'cycle-last-open-andjela': String(Date.now() - 3600000),
      'shared-gratitude-echo': [{ noteFrom: 'x', noteTime: T1, from: 'barry', emoji: '❤️', time: Date.now() }],
    });
    const keys = await s.page.evaluate(() => Object.keys(localStorage).filter((k) => /unread|badge|seen/i.test(k)));
    check('D10 no unread/badge/seen key is invented anywhere', keys.length === 0, JSON.stringify(keys));
    await s.ctx.close();
  }

  // ---- K1: §5 Know Me — the partner's guess can be marked, and the mark sticks ----
  // The question is about the OTHER person, so only the person being guessed
  // about can judge the guess. That is the whole interaction: no score, no streak.
  {
    const s = await scenario(browser, { 'ct-app-key': APP_KEY });
    const seen = await s.page.evaluate((t) => {
      const d = fmtDate(today());
      localStorage.setItem('shared-knowme', JSON.stringify({ [d]: { barry: { answer: 'Kikinda', time: t } } }));
      renderKnowMe();
      const box = document.getElementById('knowMeContent');
      return {
        date: d,
        buttons: Array.from(box.querySelectorAll('.km-fb')).map((b) => b.textContent),
        hasAnswer: box.textContent.indexOf('Kikinda') !== -1,
      };
    }, T1);
    check('K1 the partner\'s answer carries a way to mark it right or almost',
      seen.hasAnswer && seen.buttons.length === 2, JSON.stringify(seen));

    await s.page.click('#knowMeContent .km-fb');
    await s.page.waitForTimeout(400);
    const after = await s.page.evaluate((d) => {
      const km = JSON.parse(localStorage.getItem('shared-knowme') || '{}');
      return {
        entry: km[d] && km[d].barry,
        buttons: document.querySelectorAll('#knowMeContent .km-fb').length,
        text: document.getElementById('knowMeContent').textContent,
      };
    }, seen.date);
    check('K1b marking records the verdict on that answer, leaves the text intact, and stops asking',
      after.entry && after.entry.fb === 'yes' && after.entry.answer === 'Kikinda' &&
      after.entry.answer === 'Kikinda' && typeof after.entry.fbTime === 'number' &&
      after.buttons === 0 && after.text.indexOf('❤️') !== -1,
      JSON.stringify(after.entry) + ' buttons=' + after.buttons);
    await s.ctx.close();
  }

  // ---- K2: the verdict is visible to the person it was given to (§9) ----
  {
    const s = await scenario(browser, {
      'ct-app-key': APP_KEY,
    }, 'barry');
    const out = await s.page.evaluate((t) => {
      const d = fmtDate(today());
      localStorage.setItem('shared-knowme', JSON.stringify({
        [d]: {
          barry: { answer: 'moja procena', time: t },
          andjela: { answer: 'njena procena', time: t + 1, fb: 'almost', fbTime: t + 2 },
        },
      }));
      renderKnowMe();
      const box = document.getElementById('knowMeContent');
      return {
        buttons: box.querySelectorAll('.km-fb').length,
        text: box.textContent,
      };
    }, T1);
    check('K2 Barry sees the verdict on his own guess, and is not asked to mark it again',
      out.buttons === 0 && out.text.indexOf('😌') !== -1,
      JSON.stringify(out));
    await s.ctx.close();
  }

  // ---- K3: no scorekeeping was introduced ----
  {
    const s = await scenario(browser, { 'ct-app-key': APP_KEY });
    const keys = await s.page.evaluate(() => Object.keys(localStorage).filter((k) => /score|points|streak|level|badge|xp/i.test(k)));
    check('K3 no score / points / streak / level key exists', keys.length === 0, JSON.stringify(keys));
    await s.ctx.close();
  }

  // ══ §1 (Phase 1B.5) — the reply affordance is on the first screen ══════════
  // Measured before this phase: the reaction row sat at y≈1375, two screens below
  // the fold, because it lives inside the Gratitude card. The row is now hung off
  // the note it answers, inside #together-new, which is the second child of
  // #together-body — so it is on the first screen by construction, not by luck.
  const REPLY_SEED = {
    'ct-app-key': APP_KEY,
    'cycle-last-open-andjela': String(Date.now() - 3600000),
    'shared-gratitude': [
      { text: 'Hvala ti što si jutros bio tu', from: 'barry', time: Date.now() - 300000 },
      { text: 'stara beleska van prozora', from: 'barry', time: T1 },
    ],
  };

  const replyProbe = (page) => page.evaluate(() => {
    const host = document.getElementById('together-new');
    const react = host.querySelector('.tnew-react');
    const rows = Array.from(host.querySelectorAll('.tnew-row'));
    // Walk back past the .tnew-ask line when it is present: the block belongs to
    // the nearest PRECEDING row, which is not literally the previous sibling.
    let reactRow = react ? react.previousElementSibling : null;
    while (reactRow && !reactRow.classList.contains('tnew-row')) reactRow = reactRow.previousElementSibling;
    const box = react ? react.getBoundingClientRect() : null;
    return {
      hidden: host.hidden,
      head: host.querySelector('.tnew-head') ? host.querySelector('.tnew-head').textContent : '',
      top: host.getBoundingClientRect().top,
      reactCount: host.querySelectorAll('.tnew-react').length,
      btns: react ? react.querySelectorAll('.grat-echo-btn').length : 0,
      /* The bubble guard: a button nested inside .tnew-row would bubble its click
         to the row's switchToTab() and navigate away mid-tap. */
      nestedInRow: host.querySelectorAll('.tnew-row .grat-echo-btn').length,
      reactAboveFold: box ? box.top + box.height <= window.innerHeight : false,
      ask: host.querySelector('.tnew-ask') ? host.querySelector('.tnew-ask').textContent : null,
      isRowSibling: !!reactRow && rows.indexOf(reactRow) !== -1,
      rowText: reactRow ? reactRow.textContent : '',
    };
  });

  // ---- E1: the row is rendered, on the first screen, with all five reactions ----
  {
    const s = await scenario(browser, REPLY_SEED);
    const p = await replyProbe(s.page);
    check('E1 the reactions are rendered inside #together-new, above the fold',
      p.reactCount === 1 && p.btns === 5 && p.reactAboveFold === true && p.hidden === false,
      `count=${p.reactCount} btns=${p.btns} aboveFold=${p.reactAboveFold} top=${Math.round(p.top)}`);
    await s.ctx.close();
  }

  // ---- E2: they are siblings of the row, never children of it ----
  {
    const s = await scenario(browser, REPLY_SEED);
    const p = await replyProbe(s.page);
    check('E2 the reaction block is a sibling of .tnew-row, not nested inside it',
      p.nestedInRow === 0 && p.isRowSibling === true && p.rowText.indexOf('Hvala') !== -1,
      `nested=${p.nestedInRow} sibling=${p.isRowSibling} row="${p.rowText.slice(0, 40)}"`);
    await s.ctx.close();
  }

  // ---- E3: tapping one records the echo and does NOT navigate ----
  {
    const s = await scenario(browser, REPLY_SEED);
    const before = await s.page.evaluate(() => document.querySelector('.panel.active').id);
    await s.page.click('#together-new .tnew-react .grat-echo-btn');
    await s.page.waitForTimeout(400);
    const after = await s.page.evaluate((t) => {
      const echo = JSON.parse(localStorage.getItem('shared-gratitude-echo') || '[]');
      return { panel: document.querySelector('.panel.active').id, echo: echo, noteTime: t };
    }, Date.now() - 300000);
    check('E3 tapping a reaction in the new row records the echo and stays on Together',
      after.panel === before && after.panel === 'panel-together' &&
      after.echo.length === 1 && after.echo[0].from === 'andjela' &&
      String(after.echo[0].noteFrom) === 'barry' && after.echo[0].emoji === '❤️',
      `panel=${after.panel} (was ${before}) echo=${JSON.stringify(after.echo)}`);
    await s.ctx.close();
  }

  // ---- E4: once answered, the prompt goes quiet but the row stays usable ----
  {
    // noteTime must be the SAME number the note was seeded with, or the echo
    // points at nothing and the prompt stays up. Take it from the seed rather
    // than calling Date.now() again.
    const noteT = REPLY_SEED['shared-gratitude'][0].time;
    const s = await scenario(browser, Object.assign({}, REPLY_SEED, {
      'shared-gratitude-echo': [{
        noteFrom: 'barry', noteTime: noteT, from: 'andjela', emoji: '🫂', time: noteT + 60000,
      }],
    }));
    const p = await replyProbe(s.page);
    check('E4 after I have reacted the "you can reply" line is gone and the buttons remain',
      p.ask === null && p.btns === 5 && p.reactCount === 1,
      `ask=${p.ask} btns=${p.btns}`);
    await s.ctx.close();
  }

  // ---- E5: §9 symmetry — Barry gets his own phrasing, about her note ----
  {
    const s = await scenario(browser, Object.assign({}, REPLY_SEED, {
      'shared-gratitude': [{ text: 'Hvala ti za pesmu', from: 'andjela', time: Date.now() - 300000 }],
      'cycle-last-open-barry': String(Date.now() - 3600000),
    }), 'barry');
    const p = await replyProbe(s.page);
    check('E5 as Barry the prompt addresses her note in his own language',
      p.reactCount === 1 && p.btns === 5 && p.ask !== null && p.ask.indexOf('回应她') !== -1 &&
      p.rowText.indexOf('Hvala ti za pesmu') !== -1,
      `ask="${p.ask}" row="${p.rowText.slice(0, 40)}"`);
    await s.ctx.close();
  }

  // ---- E6: the affordance survives the note being pushed out of the top 3 ----
  // Four newer partner events (echo, daily answer, diary, todo) outrank the note,
  // so it is not one of the three rows shown. "You can reply" must not vanish
  // just because three other things happened.
  {
    const noteTime = Date.now() - 600000;
    const s = await scenario(browser, Object.assign({}, REPLY_SEED, {
      'shared-gratitude': [{ text: 'Hvala ti za sve', from: 'barry', time: noteTime }],
      'shared-gratitude-echo': [
        { noteFrom: 'barry', noteTime: T1, from: 'barry', emoji: '✨', time: Date.now() - 5000 },
      ],
      'shared-daily-q': [{ qKey: QK, from: 'barry', answer: 'njen odgovor', time: Date.now() - 4000 }],
      'shared-diary': (() => {
        const d = new Date().toISOString().slice(0, 10);
        return { [d]: { barry: { happy: 'bio sam srecan', time: Date.now() - 3000 } } };
      })(),
      'shared-todolist': [
        { text: 'kupi mleko', author: 'barry', completed: false, createdAt: new Date().toISOString().slice(0, 10) },
      ],
    }));
    const p = await replyProbe(s.page);
    check('E6 the reply block still renders when the note is not among the three shown rows',
      p.reactCount === 1 && p.btns === 5 && p.ask !== null,
      `count=${p.reactCount} btns=${p.btns} ask="${p.ask}"`);
    await s.ctx.close();
  }

  // ══ §2 (Phase 1B.5) — Know Me is merged field-wise, not replaced ═══════════
  // One [day][person] slot has two writers that never touch each other's fields:
  // the owner writes answer/time, the partner writes fb/fbTime. Whole-object
  // replace lets whichever snapshot lands last erase the other field, so
  // "Barry edits his guess and Anđela's ❤️ disappears" — or the reverse.
  // M1..M5 are unit tests on the exposed merge; M6 is the end-to-end path.

  // Bare `SyncModule`, not `window.SyncModule`: js/sync.js declares it with
  // `const` at script top level, which lands in the global *lexical* scope and
  // never becomes a window property.
  const kmMerge = (page, local, remote) => page.evaluate((a) => {
    return SyncModule.mergeKnowMe(a.local, a.remote);
  }, { local, remote });

  // ---- M1: the partner's verdict survives a snapshot that lacks it ----
  {
    const s = await scenario(browser, { 'ct-app-key': APP_KEY });
    const out = await kmMerge(s.page,
      { '2026-09-19': { barry: { answer: 'Kikinda', time: 10 } } },
      { '2026-09-19': { barry: { answer: 'Kikinda', time: 10, fb: 'yes', fbTime: 99 } } });
    check("M1 a snapshot carrying the partner's verdict keeps it, answer intact",
      out['2026-09-19'].barry.answer === 'Kikinda' && out['2026-09-19'].barry.fb === 'yes' &&
      out['2026-09-19'].barry.fbTime === 99,
      JSON.stringify(out));
    await s.ctx.close();
  }

  // ---- M2: and in the other direction (local has it, remote does not) ----
  {
    const s = await scenario(browser, { 'ct-app-key': APP_KEY });
    const out = await kmMerge(s.page,
      { '2026-09-19': { barry: { answer: 'Kikinda', time: 10, fb: 'almost', fbTime: 99 } } },
      { '2026-09-19': { barry: { answer: 'Kikinda', time: 10 } } });
    check("M2 a snapshot without the verdict does not erase the one I hold",
      out['2026-09-19'].barry.fb === 'almost' && out['2026-09-19'].barry.fbTime === 99,
      JSON.stringify(out));
    await s.ctx.close();
  }

  // ---- M3: the two fields are judged independently ----
  // Newer answer on one side, newer verdict on the other: both must win, which is
  // only possible if they are merged as separate fields rather than as a slot.
  {
    const s = await scenario(browser, { 'ct-app-key': APP_KEY });
    const out = await kmMerge(s.page,
      { d: { barry: { answer: 'novi odgovor', time: 50, fb: 'yes', fbTime: 1 } } },
      { d: { barry: { answer: 'stari odgovor', time: 10, fb: 'almost', fbTime: 80 } } });
    check('M3 newer answer and newer verdict both win, from opposite sides',
      out.d.barry.answer === 'novi odgovor' && out.d.barry.time === 50 &&
      out.d.barry.fb === 'almost' && out.d.barry.fbTime === 80,
      JSON.stringify(out));
    await s.ctx.close();
  }

  // ---- M4: legacy and half-formed records ----
  // Pre-1B.5 data has no fb/fbTime at all; a record may also carry fb with no
  // fbTime. Neither may be read as "newer than" a real verdict, and a tie has to
  // resolve the same way every time or two devices disagree forever.
  {
    const s = await scenario(browser, { 'ct-app-key': APP_KEY });
    const legacy = await kmMerge(s.page,
      { d: { andjela: { answer: 'staro', time: 5 } } },
      { d: { andjela: { answer: 'novo', time: 9 } } });
    const half = await kmMerge(s.page,
      { d: { barry: { answer: 'a', time: 5, fb: 'yes' } } },
      { d: { barry: { answer: 'a', time: 5, fb: 'almost', fbTime: 3 } } });
    const tie = await kmMerge(s.page,
      { d: { barry: { answer: 'lokalno', time: 7, fb: 'yes', fbTime: 7 } } },
      { d: { barry: { answer: 'udaljeno', time: 7, fb: 'almost', fbTime: 7 } } });
    check('M4 legacy records merge by answer time; a missing fbTime never outranks a real one',
      legacy.d.andjela.answer === 'novo' && legacy.d.andjela.time === 9 &&
      half.d.barry.fb === 'almost' && half.d.barry.fbTime === 3,
      `legacy=${JSON.stringify(legacy.d.andjela)} half=${JSON.stringify(half.d.barry)}`);
    check('M4b an exact tie resolves to local, deterministically',
      tie.d.barry.answer === 'lokalno' && tie.d.barry.fb === 'yes',
      JSON.stringify(tie.d.barry));
    await s.ctx.close();
  }

  // ---- M5: no field of either side is dropped, and no empty day shells appear ----
  {
    const s = await scenario(browser, { 'ct-app-key': APP_KEY });
    const out = await kmMerge(s.page,
      { d1: { barry: { answer: 'b', time: 1 } } },
      { d2: { andjela: { answer: 'a', time: 2 } } });
    const days = Object.keys(out).sort();
    check('M5 the day keys union, both people survive, nothing extra is invented',
      JSON.stringify(days) === JSON.stringify(['d1', 'd2']) &&
      !!out.d1.barry && !!out.d2.andjela &&
      JSON.stringify(out) === JSON.stringify({
        d1: { barry: { answer: 'b', time: 1 } },
        d2: { andjela: { answer: 'a', time: 2 } },
      }),
      JSON.stringify(out));
    await s.ctx.close();
  }

  // ---- M6: the real path — a pull landing on top of a fresh local answer ----
  // Barry answers; Anđela's snapshot arrives carrying her verdict on that very
  // answer plus her own guess. Both halves must survive the pull, and a reload.
  {
    const s = await scenario(browser, { 'ct-app-key': APP_KEY }, 'barry');
    const answered = await s.page.evaluate((t) => {
      const d = fmtDate(today());
      localStorage.setItem('shared-knowme', JSON.stringify({ [d]: { barry: { answer: 'Kikinda', time: t } } }));
      renderKnowMe();
      return d;
    }, Date.now() - 60000);

    s.remote.state = {
      knowme: {
        [answered]: {
          // Her copy of his answer is the older one; the verdict is newer than his
          // write, which is exactly the interleaving that used to lose data.
          barry: { answer: 'Kikinda', time: Date.now() - 60000, fb: 'yes', fbTime: Date.now() - 1000 },
          andjela: { answer: 'Beograd', time: Date.now() - 30000 },
        },
      },
    };
    await s.page.evaluate(() => window.pullAllSharedData());
    await s.page.waitForTimeout(900);

    const merged = await s.page.evaluate((d) => {
      const km = JSON.parse(localStorage.getItem('shared-knowme') || '{}');
      const box = document.getElementById('knowMeContent');
      return {
        barry: km[d] && km[d].barry,
        andjela: km[d] && km[d].andjela,
        buttons: box ? box.querySelectorAll('.km-fb').length : -1,
        text: box ? box.textContent : '',
      };
    }, answered);
    check("M6 a pull merges her verdict onto my answer instead of replacing the slot",
      merged.barry && merged.barry.answer === 'Kikinda' && merged.barry.fb === 'yes' &&
      typeof merged.barry.fbTime === 'number' &&
      merged.andjela && merged.andjela.answer === 'Beograd',
      JSON.stringify({ barry: merged.barry, andjela: merged.andjela }));

    /* Two separate things must be true, and they are the two halves of §5:
       his own answer now wears her verdict (no buttons on it — it is judged),
       and her answer still carries buttons (he has not judged it yet). */
    check('M6b the card shows her verdict on his answer and still lets him judge hers',
      merged.buttons === 2 && merged.text.indexOf('❤️ 正确！') !== -1 &&
      merged.text.indexOf('Beograd') !== -1,
      `buttons=${merged.buttons} text="${merged.text.replace(/\s+/g, ' ').slice(0, 90)}"`);

    // "刷新后保持": the merge has to be persisted, not just rendered.
    await s.page.reload({ waitUntil: 'domcontentloaded' });
    await s.page.waitForSelector('.tab[data-panel="together"]', { timeout: 15000 });
    const after = await s.page.evaluate((d) => {
      const km = JSON.parse(localStorage.getItem('shared-knowme') || '{}');
      return km[d] && km[d].barry;
    }, answered);
    check('M6c both facts survive a reload',
      after && after.answer === 'Kikinda' && after.fb === 'yes',
      JSON.stringify(after));
    await s.ctx.close();
  }

  // ---- M7: the state this device pushes carries the merged record, not a stub ----
  // If collect() or the push path rebuilt the slot, the next device would receive
  // the loss the merge just prevented.
  {
    const s = await scenario(browser, { 'ct-app-key': APP_KEY }, 'barry');
    const pushed = await s.page.evaluate((t) => {
      const d = fmtDate(today());
      localStorage.setItem('shared-knowme', JSON.stringify({
        [d]: { barry: { answer: 'Kikinda', time: t, fb: 'yes', fbTime: t + 1 } },
      }));
      const st = window.collectSharedState ? window.collectSharedState() : null;
      return st ? st.knowme[d] && st.knowme[d].barry : null;
    }, T1);
    check('M7 the pushed snapshot still carries both the answer and the verdict',
      pushed && pushed.answer === 'Kikinda' && pushed.fb === 'yes',
      JSON.stringify(pushed));
    await s.ctx.close();
  }

  await browser.close();
  srv.close();

  check('R1 no uncaught page error in any scenario', errors.length === 0, errors.slice(0, 3).join(' | '));
  check('R2 no shared-data request reached api.github.com in any scenario',
    githubCalls.length === 0, githubCalls.slice(0, 3).join(' | ') || 'githubCalls=0');

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
