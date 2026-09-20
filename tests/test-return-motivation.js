/**
 * Phase 2A — 回访动机（return motivation）回归测试。
 *
 * 这一阶段没有新功能，只有表达方式的改变，所以这个文件钉的是「表达」本身：
 * 它必须仍然指向同一份数据，而且不能把对称性、传输层或输入顺序弄坏。
 *
 * 四组：
 *   L  Daily Question 的状态引子（§一，方案 A）：她未答 / 她已答 / 双方已答，
 *      以及 Barry 一侧的写法。引子只读 mine / theirs，所以它不可能伪造对方
 *      已经回答 —— L2 直接把「对方没答」渲染出来验这一条。
 *   H  Home（§二、§三）：有她的新内容时给出可点的回应入口、没有时是新空态、
 *      点行仍然进 Together、以及最要紧的一条「没有第二份 shared state」——
 *      H5/H6 用「一处点击，两个界面同时只出现一条回应记录」来证明 Home 与
 *      Together 共用的是同一份 shared-gratitude-echo，而不是各存一份。
 *   I  i18n（§六.3）：三套语言在同一状态下的文案逐条比对。v2() 找不到键会原样
 *      回退成键名，所以「文本不等于键名」本身就是一条有效的缺失检查。
 *   S  静态不变量（§六.4、§六.5）：引子在问题区之上、dq-line 的「我先对方后」
 *      顺序原样保留、没有任何共享数据路径回到 GitHub。
 *
 * 运行：node tests/test-return-motivation.js
 *
 * 基线是实测的，不是推测的：在 Phase 2A 之前的 HEAD 8b09bb8 上跑同一个文件，
 * 结果是 6 条 FAIL + 1 条 FATAL，正好落在本阶段改的三处 —— L1/L1b/L2/L3/L5
 * （引子还不存在，lead 是 null，DOM 顺序从 q 开始）、H1（Home 上没有回应入口，
 * ask=null buttons=0）、H2（还是「Za sada ništa novo Ostavi poruku u Dnevniku」
 * 那个工具感空态），然后 H5 找不到 #dash-today .tnew-react .grat-echo-btn 超时。
 * 其余各条在改动前后都通过：它们钉的是「没有被弄坏的东西」，本来就不该翻转。
 * 一个诚实的缺口：L4 单独看没有区分力 —— 引子整体缺失时 lead 也是 null，它得
 * 靠 L1/L2/L3/L5 一起才成立，别把它当成 §一 的独立覆盖。
 *
 * 每个场景一个独立 context —— cycle-last-open-<profile> 必须从已知状态起步；
 * service worker 一律屏蔽，保证测的是当前源码而不是缓存。
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8943;
const URL = `http://localhost:${PORT}/index.html`;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
};

const MIN = 60000;

/* 页面自己算出来的同一身份：epoch 天数 + 它在题库里的下标。与语言、时区无关。 */
const DAY = Math.floor(Date.now() / 864e5);
const QK = DAY + ':' + (DAY % 7);

/* Phase 2C：共享数据的传输层是 Worker，不再是 GitHub Contents API。
   只用合成凭据，真实 app secret 绝不出现在测试里。 */
const APP_KEY = 'test-app-key-phase2a-return-000000000000000';
const WORKER_HOST = 'https://cycle-tracker-data.cycletracker-barry.workers.dev';
const WORKER_STATE = WORKER_HOST + '/state';
const WORKER_TODO = WORKER_HOST + '/todo';

/* 打到旧 GitHub 路径的请求是传输层回归，不是网络事故：记下来，最后一次断言。 */
const githubCalls = [];

/* 一个空场景里本来就有哪些 shared-* 键。H4b / H5c 拿它做差集，而不是写死一份
   键名清单 —— 要证明的是「Home 没有引入第二份 state」，不是「键名恰好是这三
   个」。由 H2（什么都没种）填充，后面的 H4b / H5c 再读它。 */
let baselineSharedKeys = null;

/* 「她留了一条便签」是 H 组大部分场景的共同起点。种下去的那个 shared-* 键本身
   会被写进 localStorage —— 它是测试种的，不是 Home 造的，所以在做键集差集时
   必须先把种下去的键扣掉，否则差集里会混进测试自己的痕迹。 */
const herNoteSeed = () => ({
  'ct-app-key': APP_KEY,
  'shared-gratitude': [{ text: 'NJENA PORUKA', from: 'barry', time: Date.now() - MIN }],
});
const seededSharedKeys = (seed) => Object.keys(seed).filter((k) => k.indexOf('shared-') === 0);

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

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

/* 语言显式种下去，而不是靠默认值：auth.js 的 selectLogin 把 Barry 定为 zh-CN、
   Anđela 定为 sr —— 这是产品决定（两个人真的读不同的语言），测试跟着它走，
   而不是把它当成巧合。种 cycle-lang 让场景与登录屏是否渲染无关地确定。 */
async function scenario(browser, seed, profile) {
  const prof = profile || 'andjela';
  const lang = prof === 'barry' ? 'zh-CN' : 'sr';
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    serviceWorkers: 'block',
  });
  await ctx.addInitScript((s) => {
    try {
      localStorage.setItem('cycle-active-profile', s.profile);
      localStorage.setItem('cycle-lang', s.lang);
      sessionStorage.setItem('cycle-logged-in', '1');
      Object.keys(s.seed).forEach((k) => {
        const v = s.seed[k];
        localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
      });
    } catch (e) { /* ignore */ }
  }, { profile: prof, lang, seed });

  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message.split('\n')[0]));

  const remote = { state: null, todo: [] };
  await page.route('**/*', (route) => {
    const req = route.request();
    const u = req.url();
    /* 页面 origin 是 localhost，不是生产 Pages origin，所以回显浏览器实际发来的
       Origin，否则浏览器会拦掉响应 —— 那是夹具没搭好，不是代码坏了。 */
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
  await page.waitForSelector('.tab[data-panel="dashboard"]', { timeout: 15000 });
  return { page, ctx, remote, pageErrors };
}

async function openTab(page, panel) {
  const active = await page.evaluate(() => {
    const t = document.querySelector('.tab.active');
    return t ? t.dataset.panel : null;
  });
  if (active !== panel) {
    await page.click(`.tab[data-panel="${panel}"]`);
    await page.waitForTimeout(450);
  }
}

const homeText = (page) => page.evaluate(() => {
  const el = document.getElementById('dash-today');
  return el ? (el.innerText || el.textContent || '') : '';
});

/**
 * Daily Question 的探针。只读渲染出来的东西，不读源码 —— 引子必须在问题区
 * 之上（DOM 顺序），而 dq-line 的顺序是 D6/D7 钉住的对称性不变量，所以两者
 * 一起采下来。
 */
const dqProbe = (page) => page.evaluate(() => {
  const host = document.getElementById('togetherDailyQ');
  if (!host) return null;
  const lead = host.querySelector('.dq-lead');
  const sub = host.querySelector('.dq-lead-sub');
  /* .dq-lead-sub 嵌在 .dq-lead 里，textContent 会把两半粘成一句；引子那半句
     得单独取，否则「她已经回答了」和「看看她怎么答 ↓」在断言里分不开。 */
  const leadOwn = (function () {
    if (!lead) return null;
    const c = lead.cloneNode(true);
    const s = c.querySelector('.dq-lead-sub');
    if (s) s.remove();
    return c.textContent.trim();
  })();
  return {
    lead: leadOwn,
    leadSub: sub ? sub.textContent.trim() : null,
    both: !!host.querySelector('.dq-both'),
    lines: Array.prototype.map.call(host.querySelectorAll('.dq-line'), (l) => ({
      who: l.querySelector('.dq-who').textContent.trim(),
      ans: l.querySelector('.dq-ans').textContent.trim(),
      done: l.classList.contains('dq-done'),
    })),
    /* DOM 顺序：引子必须排在问题之前，问题必须排在两行答案之前。 */
    order: Array.prototype.map.call(host.children, (k) => {
      if (k.classList.contains('dq-lead')) return 'lead';
      if (k.id === 'togetherDailyQText') return 'q';
      if (k.classList.contains('dq-line')) return 'line';
      if (k.classList.contains('dq-both')) return 'both';
      return k.tagName.toLowerCase();
    }),
  };
});

const echoStore = (page) => page.evaluate(() => {
  try { return JSON.parse(localStorage.getItem('shared-gratitude-echo') || '[]'); }
  catch (e) { return null; }
});

const sharedKeys = (page) => page.evaluate(() => {
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.indexOf('shared-') === 0) out.push(k);
  }
  return out.sort();
});

(async () => {
  const srv = await serve();
  const browser = await chromium.launch();

  try {
    /* ════════════ L — Daily Question 状态引子（§一 方案 A） ════════════ */

    // ---- L1: 双方都没答 -> 说她的状态，且不给任何「你欠一个回答」的暗示 ----
    {
      const s = await scenario(browser, { 'ct-app-key': APP_KEY });
      await openTab(s.page, 'together');
      const p = await dqProbe(s.page);
      check('L1 neither answered: the lead states the partner has not answered, with no pull line',
        p.lead === 'Još nije odgovorio na današnje pitanje' && p.leadSub === null,
        JSON.stringify({ lead: p.lead, sub: p.leadSub }));
      check('L1b the lead sits above the question, and the two answer lines stay below it',
        p.order[0] === 'lead' && p.order[1] === 'q' &&
        p.order.filter((x) => x === 'line').length === 2 &&
        p.order.indexOf('line') > p.order.indexOf('q'),
        JSON.stringify(p.order));
      check('L1c input order is unchanged: mine first, partner second',
        p.lines[0].who === 'Anđela' && p.lines[1].who === 'Barry' && !p.both,
        JSON.stringify(p.lines));
      await s.ctx.close();
    }

    // ---- L2: 她答了我没答 -> 引子说她答了，并给出「去看她怎么答」 ----
    {
      const s = await scenario(browser, {
        'ct-app-key': APP_KEY,
        'shared-daily-q': [{ qKey: QK, from: 'barry', answer: 'njen odgovor', time: Date.now() - 2 * MIN }],
      });
      await openTab(s.page, 'together');
      const p = await dqProbe(s.page);
      check('L2 partner answered: the lead says so and points at her answer',
        p.lead === 'Već je odgovorio' && p.leadSub === 'Pogledaj njegov odgovor ↓',
        JSON.stringify({ lead: p.lead, sub: p.leadSub }));
      check('L2b the lead never invents an answer of mine — my row is still the empty one',
        p.lines[0].who === 'Anđela' && p.lines[0].done === false &&
        p.lines[1].who === 'Barry' && p.lines[1].ans === 'njen odgovor' && p.lines[1].done === true,
        JSON.stringify(p.lines));
      await s.ctx.close();
    }

    // ---- L3: 对方没答 -> 引子说的是「她没答」，不是我该做什么 ----
    {
      const s = await scenario(browser, {
        'ct-app-key': APP_KEY,
        'shared-daily-q': [{ qKey: QK, from: 'andjela', answer: 'moj odgovor', time: Date.now() - 2 * MIN }],
      });
      await openTab(s.page, 'together');
      const p = await dqProbe(s.page);
      check('L3 I answered but she has not: the lead reports her side, not my obligation',
        p.lead === 'Još nije odgovorio na današnje pitanje' && p.leadSub === null,
        JSON.stringify({ lead: p.lead, sub: p.leadSub }));
      check('L3b my answer is on screen while the lead still sends the eye to her',
        p.lines[0].done === true && p.lines[0].ans === 'moj odgovor' && p.lines[1].done === false,
        JSON.stringify(p.lines));
      await s.ctx.close();
    }

    // ---- L4: 双方都答完 -> 不重复说同一件事（dq-both 已经在说） ----
    {
      const s = await scenario(browser, {
        'ct-app-key': APP_KEY,
        'shared-daily-q': [
          { qKey: QK, from: 'barry', answer: 'njegov odgovor', time: Date.now() - 3 * MIN },
          { qKey: QK, from: 'andjela', answer: 'moj odgovor', time: Date.now() - 2 * MIN },
        ],
      });
      await openTab(s.page, 'together');
      const p = await dqProbe(s.page);
      check('L4 both answered: no lead is shown, because .dq-both already carries that state',
        p.lead === null && p.both === true,
        JSON.stringify({ lead: p.lead, both: p.both }));
      check('L4b both answers are on screen and mine is still the first line',
        p.lines.length === 2 && p.lines[0].done && p.lines[1].done && p.lines[0].who === 'Anđela',
        JSON.stringify(p.lines));
      await s.ctx.close();
    }

    // ---- L5: Barry 一侧的写法是「她」，证明引子不是为查看者写的 ----
    {
      const s = await scenario(browser, {
        'ct-app-key': APP_KEY,
        'shared-daily-q': [{ qKey: QK, from: 'andjela', answer: 'njen odgovor', time: Date.now() - 2 * MIN }],
      }, 'barry');
      await openTab(s.page, 'together');
      const p = await dqProbe(s.page);
      /* Barry 的界面语言是中文（auth.js 的产品决定），所以 L5 一次验两件事：
         引子按对方的性别分写法，而且三套语言里的中文那套真的被用上了。 */
      check('L5 as Barry the lead reads "she answered" in his own language',
        p.lead === '她已经回答了' && p.leadSub === '看看她怎么答 ↓',
        JSON.stringify({ lead: p.lead, sub: p.leadSub }));
      check('L5b Barry is asked nothing extra: his line is the unanswered one',
        p.lines[0].who === 'Barry' && p.lines[0].done === false &&
        p.lines[1].who === 'Anđela' && p.lines[1].done === true,
        JSON.stringify(p.lines));
      await s.ctx.close();
    }

    /* ════════════ H — Home（§二 / §三） ════════════ */

    // ---- H1: 有她的新内容 -> 头一句 + 她的东西 + 一个能立刻按的回应入口 ----
    {
      const s = await scenario(browser, {
        'ct-app-key': APP_KEY,
        'shared-gratitude': [{ text: 'NJENA PORUKA', from: 'barry', time: Date.now() - MIN }],
      });
      await openTab(s.page, 'dashboard');
      const txt = await homeText(s.page);
      const afford = await s.page.evaluate(() => {
        const h = document.getElementById('dash-today');
        return {
          ask: h.querySelector('.tnew-ask') ? h.querySelector('.tnew-ask').textContent.trim() : null,
          buttons: h.querySelectorAll('.tnew-react .grat-echo-btn').length,
          insideRow: !!h.querySelector('div[onclick] .tnew-react'),
        };
      });
      check('H1 with her content Home shows her note and a reply affordance on the first screen',
        txt.includes('NJENA PORUKA') && txt.includes('Ima nešto od njega') &&
        afford.ask === 'Možeš da mu odgovoriš ↓' && afford.buttons === 5,
        JSON.stringify({ ask: afford.ask, buttons: afford.buttons }));
      check('H1b the reaction row is a sibling of the clickable row, not a child of it',
        afford.insideRow === false,
        `nested=${afford.insideRow} — a nested button would bubble into switchToTab()`);
      await s.ctx.close();
    }

    // ---- H2: 没有她的新内容 -> 情侣空间空态，而不是「今天没任务」 ----
    {
      const s = await scenario(browser, { 'ct-app-key': APP_KEY });
      await openTab(s.page, 'dashboard');
      const txt = await homeText(s.page);
      const afford = await s.page.evaluate(() => {
        const h = document.getElementById('dash-today');
        return { react: h.querySelectorAll('.tnew-react').length };
      });
      baselineSharedKeys = await sharedKeys(s.page);
      check('H2 the empty state is couple-space phrasing, not a task list',
        txt.includes('Još nema novih porukica') && txt.includes('Ovaj prostor čeka da nešto ostavite.'),
        txt.replace(/\s+/g, ' ').slice(0, 80));
      check('H2b with nothing to reply to, no reaction row is rendered',
        afford.react === 0, `react rows=${afford.react}`);
      await s.ctx.close();
    }

    // ---- H3: 点 Home 上的行仍然进 Together（入口没被回应行抢走） ----
    {
      const s = await scenario(browser, {
        'ct-app-key': APP_KEY,
        'shared-gratitude': [{ text: 'NJENA PORUKA', from: 'barry', time: Date.now() - MIN }],
      });
      await openTab(s.page, 'dashboard');
      await s.page.click('#dash-today div[onclick*="switchToTab"]');
      await s.page.waitForTimeout(500);
      const panel = await s.page.evaluate(() => {
        const t = document.querySelector('.tab.active');
        return t ? t.dataset.panel : null;
      });
      check('H3 tapping the row still navigates Home -> Together',
        panel === 'together', `active=${panel}`);
      await s.ctx.close();
    }

    // ---- H4: Home 不复制 Together 的内容，也不产生第二份 shared state ----
    {
      const seed = herNoteSeed();
      const s = await scenario(browser, seed);
      await openTab(s.page, 'dashboard');
      const before = await sharedKeys(s.page);
      const dup = await s.page.evaluate(() => {
        const h = document.getElementById('dash-today');
        return {
          togetherNewHost: !!h.querySelector('#together-new'),
          dailyQHost: !!h.querySelector('#togetherDailyQ'),
          copies: h.querySelectorAll('.tnew-row').length,
        };
      });
      check('H4 Home does not host a second copy of the Together cards',
        dup.togetherNewHost === false && dup.dailyQHost === false && dup.copies === 0,
        JSON.stringify(dup));
      /* 基准 = 空场景本来就有的键 ∪ 本场景种下去的键。两者相减之后剩下的差集
         才是「Home 有没有自己造 state」。 */
      const expectKeys = (baselineSharedKeys || []).concat(seededSharedKeys(seed)).sort();
      check('H4b Home adds no shared key of its own — only the one the scenario seeded',
        baselineSharedKeys !== null && before.join(',') === expectKeys.join(','),
        `with-her-note=[${before.join(',')}] expected=[${expectKeys.join(',')}]`);
      await s.ctx.close();
    }

    // ---- H5: Home 上点一下回应 -> 立刻可见，且只写一条记录 ----
    {
      const seed = herNoteSeed();
      const s = await scenario(browser, seed);
      await openTab(s.page, 'dashboard');
      await s.page.click('#dash-today .tnew-react .grat-echo-btn');
      await s.page.waitForTimeout(500);
      const after = await s.page.evaluate(() => {
        const h = document.getElementById('dash-today');
        const tab = document.querySelector('.tab.active');
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.indexOf('shared-') === 0) keys.push(k);
        }
        return {
          mine: h.querySelectorAll('.tnew-react .grat-echo-btn.mine').length,
          ask: h.querySelector('.tnew-ask') ? h.querySelector('.tnew-ask').textContent.trim() : null,
          panel: tab ? tab.dataset.panel : null,
          keys: keys.sort(),
        };
      });
      const store = await echoStore(s.page);
      check('H5 reacting on Home repaints Home immediately — the click is not swallowed',
        after.mine === 1 && after.ask === null,
        JSON.stringify({ mine: after.mine, ask: after.ask }));
      check('H5b the tap did not navigate away, so the reaction row really is a sibling',
        after.panel === 'dashboard', `panel=${after.panel}`);
      const known = (baselineSharedKeys || []).concat(seededSharedKeys(seed));
      const added = after.keys.filter((k) => known.indexOf(k) === -1);
      check('H5c one click writes exactly one echo record, into exactly one new key',
        Array.isArray(store) && store.length === 1 && store[0].noteFrom === 'barry' &&
        store[0].from === 'andjela' && added.join(',') === 'shared-gratitude-echo',
        JSON.stringify({ storeLen: store ? store.length : null, added }));
      await s.ctx.close();
    }

    // ---- H6: 同一份记录驱动两个界面 —— Together 那边也已经算回应过 ----
    {
      const s = await scenario(browser, {
        'ct-app-key': APP_KEY,
        'shared-gratitude': [{ text: 'NJENA PORUKA', from: 'barry', time: Date.now() - MIN }],
      });
      await openTab(s.page, 'dashboard');
      await s.page.click('#dash-today .tnew-react .grat-echo-btn');
      await s.page.waitForTimeout(400);
      await openTab(s.page, 'together');
      const t = await s.page.evaluate(() => {
        const h = document.getElementById('together-new');
        return {
          mine: h.querySelectorAll('.tnew-react .grat-echo-btn.mine').length,
          ask: h.querySelector('.tnew-ask') ? h.querySelector('.tnew-ask').textContent.trim() : null,
        };
      });
      const store = await echoStore(s.page);
      check('H6 the same single record drives Together too — no second copy, no second key',
        t.mine === 1 && t.ask === null && Array.isArray(store) && store.length === 1,
        JSON.stringify({ together: t, storeLen: store ? store.length : null }));
      await s.ctx.close();
    }

    /* ════════════ I — i18n（§六.3） ════════════ */

    // ---- I1: 三套语言，同一状态，逐条比对 ----
    {
      const s = await scenario(browser, {
        'ct-app-key': APP_KEY,
        'shared-daily-q': [{ qKey: QK, from: 'barry', answer: 'njen odgovor', time: Date.now() - 2 * MIN }],
      });
      /* 先让 Together 面板真的渲染过一次，否则 #togetherDailyQ 还不存在，
         renderDailyQ() 没有宿主可写。 */
      await openTab(s.page, 'together');
      const got = await s.page.evaluate(() => {
        const out = {};
        ['sr', 'en', 'zh-CN'].forEach((l) => {
          window.lang = l;
          window.renderDailyQ();
          window.renderDashboard(false);
          const host = document.getElementById('togetherDailyQ');
          const lead = host.querySelector('.dq-lead');
          const sub = host.querySelector('.dq-lead-sub');
          /* 与 dqProbe 同样的理由：sub 嵌在 lead 里面，textContent 会粘成一句。 */
          const leadOwn = (function () {
            if (!lead) return null;
            const c = lead.cloneNode(true);
            const s2 = c.querySelector('.dq-lead-sub');
            if (s2) s2.remove();
            return c.textContent.trim();
          })();
          out[l] = {
            lead: leadOwn,
            sub: sub ? sub.textContent.trim() : null,
            home: document.getElementById('dash-today').innerText.replace(/\s+/g, ' ').trim(),
          };
        });
        return out;
      });
      const want = {
        sr: ['Već je odgovorio', 'Pogledaj njegov odgovor ↓'],
        en: ["He's answered", 'See what he said ↓'],
        'zh-CN': ['他已经回答了', '看看他怎么答 ↓'],
      };
      const ok = Object.keys(want).every((l) =>
        got[l].lead === want[l][0] && got[l].sub === want[l][1]);
      check('I1 the status lead resolves in all three languages, and to three different strings',
        ok && new Set(Object.keys(got).map((l) => got[l].lead)).size === 3,
        JSON.stringify({ sr: got.sr.lead, en: got.en.lead, zh: got['zh-CN'].lead }));
      check('I1b no language falls back to the raw key name',
        Object.keys(got).every((l) =>
          got[l].lead && got[l].lead.indexOf('qLead') === -1 &&
          got[l].sub && got[l].sub.indexOf('qLead') === -1),
        JSON.stringify(Object.keys(got).map((l) => got[l].lead)));
      await s.ctx.close();
    }

    // ---- I2: 空态三语 —— 都不许留在旧措辞上 ----
    {
      const s = await scenario(browser, { 'ct-app-key': APP_KEY });
      const got = await s.page.evaluate(() => {
        const out = {};
        ['sr', 'en', 'zh-CN'].forEach((l) => {
          window.lang = l;
          window.renderDashboard(false);
          out[l] = document.getElementById('dash-today').innerText.replace(/\s+/g, ' ').trim();
        });
        return out;
      });
      check('I2 the couple-space empty state resolves in all three languages',
        got.sr.includes('Još nema novih porukica') &&
        got.en.includes('No new little notes yet') &&
        got['zh-CN'].includes('今天还没有新的小纸条'),
        JSON.stringify(got));
      /* 「还没有新的」是旧中文空态、也是新中文空态的子串，不能用它区分；改用旧提示句
         「去日记里留一句话」——那一句已经退役，且与任何新文案都不重叠。 */
      check('I2b the retired tool-feel wording is gone from sr / en / zh',
        !/Za sada ništa novo/.test(JSON.stringify(got)) &&
        !/Nothing new yet/.test(JSON.stringify(got)) &&
        !/去日记里留一句话/.test(JSON.stringify(got)),
        JSON.stringify(got).slice(0, 140));
      await s.ctx.close();
    }

    /* ════════════ S — 静态不变量（§六.4 / §六.5） ════════════ */

    {
      const src = fs.readFileSync(path.join(ROOT, 'js/module-dashboard.js'), 'utf8');
      const leadAt = src.indexOf("var lead = '';");
      const qAt = src.indexOf("'<div class=\"dq-q\" id=\"togetherDailyQText\"></div>'");
      const pairLine = 'line(ctx.me, mine) + line(ctx.partner, theirs)';
      const pairCount = src.split(pairLine).length - 1;
      check('S1 the status lead is built before the question box in _renderDailyQ',
        leadAt > 0 && qAt > 0 && leadAt < qAt,
        `leadAt=${leadAt} qAt=${qAt}`);
      check('S2 the symmetric line pair is still written exactly once, in the me-then-partner order',
        pairCount === 1, `occurrences=${pairCount}`);
      check('S3 the lead is derived only from mine/theirs — no new state is read',
        /if \(!\(mine && theirs\)\)/.test(src) && src.indexOf('qLead') !== -1,
        'the lead reads the two records already loaded for the two lines');
    }

    check('S4 no shared-data request reached api.github.com in any scenario',
      githubCalls.length === 0, githubCalls.slice(0, 3).join(' | ') || 'githubCalls=0');

    /* ---- S5: 设备上留着旧 PAT 也不能把任何路径拉回 GitHub ----
       用一个故意留下的 gh-token 跑完整交互（含一次真实点击），再看有没有 pageerror。 */
    {
      const s = await scenario(browser, {
        'ct-app-key': APP_KEY,
        'gh-token': 'ghp_this_should_never_be_read_000000000000',
        'shared-gratitude': [{ text: 'NJENA PORUKA', from: 'barry', time: Date.now() - MIN }],
      });
      await openTab(s.page, 'dashboard');
      await s.page.click('#dash-today .tnew-react .grat-echo-btn');
      await s.page.waitForTimeout(700);
      check('S5 a stale gh-token on the device is inert, and no page error is raised',
        githubCalls.length === 0 && s.pageErrors.length === 0,
        `github=${githubCalls.length} pageErrors=${s.pageErrors.join(' | ') || 'none'}`);
      await s.ctx.close();
    }
  } finally {
    await browser.close();
    srv.close();
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
