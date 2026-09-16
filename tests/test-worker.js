/**
 * Phase 1 contract test — the private data Worker.
 *
 * Runs the real Worker source in-process. There is no network: `globalThis.fetch`
 * is swapped for a fake GitHub that implements the Contents API's compare-and-swap
 * semantics (sha mismatch → 409, sha missing on an existing file → 422), so the
 * CAS behaviour under test is the Worker's, not a mock's.
 *
 * Run: node tests/test-worker.js
 *
 * The slow assertions are I5/I5b, which wait out the Worker's real 8-second
 * upstream timeout, twice (one retry). Everything else is milliseconds.
 */
'use strict';

const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

// ── synthetic credentials — never real, never logged ────────────────────────
const PAT = 'ghp_TESTPAT_do_not_log';
const KEY_A = 'appkey-andjela-test';
const KEY_B = 'appkey-barry-test';

const ORIGIN = 'https://darkheaven1419-debug.github.io';
const EVIL_ORIGIN = 'https://evil.example';
const WORKER_URL = 'https://cycle-tracker-data.test.workers.dev';

const REPO = 'darkheaven1419-debug/cycle-tracker-data';
const STATE_FILE = 'shared-state.json';
const TODO_FILE = 'shared-todolist.json';

const UPSTREAM_RE = new RegExp(
  '^https://api\\.github\\.com/repos/' + REPO.replace(/[/.]/g, '\\$&') +
  '/contents/(shared-state|shared-todolist)\\.json(\\?.*)?$'
);

// ── harness ─────────────────────────────────────────────────────────────────

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined ? '  — ' + detail : ''}`);
}

function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function abortError() {
  const e = new Error('The operation was aborted');
  e.name = 'AbortError';
  return e;
}

/**
 * A fake GitHub Contents API. Records every call so the test can assert on the
 * exact upstream URL and on the Authorization header the Worker sent.
 */
function makeGitHub(opts) {
  opts = opts || {};
  const files = Object.create(null); // file name -> { text, sha }
  const calls = [];
  const puts = [];
  let serial = 0;

  const nextSha = () => 'sha-' + (++serial);

  const gh = {
    calls,
    puts,
    files,
    seed(name, obj) {
      files[name] = { text: JSON.stringify(obj, null, 2), sha: nextSha() };
      return files[name].sha;
    },
    body(name) {
      const f = files[name];
      return f ? JSON.parse(f.text) : null;
    },
    /** Drop-in replacement for globalThis.fetch. */
    fetch(input, init) {
      const url = String(input);
      init = init || {};
      const method = (init.method || 'GET').toUpperCase();
      const record = { url, method, headers: init.headers || {} };
      calls.push(record);
      // Recorded here, not by the caller: a scenario's calls only exist after it
      // starts, so anything that snapshots gh.calls up-front sees an empty array.
      allUpstreamCalls.push(record);

      if (opts.hang) {
        // Never settles on its own — the Worker's AbortController must fire.
        return new Promise((resolve, reject) => {
          const signal = init.signal;
          if (!signal) return;
          if (signal.aborted) return reject(abortError());
          signal.addEventListener('abort', () => reject(abortError()));
        });
      }
      if (opts.failWith) {
        return Promise.resolve(jsonResponse({ message: 'upstream boom' }, opts.failWith));
      }

      const m = /^https:\/\/api\.github\.com\/repos\/([^/]+\/[^/]+)\/contents\/([^?]+)/.exec(url);
      if (!m) return Promise.resolve(jsonResponse({ message: 'Not Found' }, 404));

      const repo = m[1];
      const file = decodeURIComponent(m[2]);
      // Anything that is not the one hardcoded repo is a 404, exactly as GitHub
      // would answer. The R1 sweep asserts this never happens.
      if (repo !== REPO) return Promise.resolve(jsonResponse({ message: 'Not Found' }, 404));

      if (method === 'GET') {
        const f = files[file];
        if (!f) return Promise.resolve(jsonResponse({ message: 'Not Found' }, 404));
        return Promise.resolve(jsonResponse({
          sha: f.sha,
          content: Buffer.from(f.text, 'utf8').toString('base64'),
          encoding: 'base64',
          size: Buffer.byteLength(f.text, 'utf8'),
        }));
      }

      if (method === 'PUT') {
        let body;
        try {
          body = JSON.parse(init.body);
        } catch (e) {
          return Promise.resolve(jsonResponse({ message: 'bad body' }, 400));
        }
        puts.push(body);
        const f = files[file];

        // GitHub's real responses for the two CAS failure modes.
        if (f && !body.sha) return Promise.resolve(jsonResponse({ message: "sha wasn't supplied" }, 422));
        if (f && body.sha !== f.sha) return Promise.resolve(jsonResponse({ message: 'sha does not match' }, 409));
        if (!f && body.sha) return Promise.resolve(jsonResponse({ message: 'sha not found' }, 422));

        const text = Buffer.from(body.content, 'base64').toString('utf8');
        files[file] = { text, sha: nextSha() };
        return Promise.resolve(jsonResponse({
          content: { sha: files[file].sha, path: file, name: file },
          commit: { sha: 'commit-' + serial },
        }));
      }

      return Promise.resolve(jsonResponse({ message: 'Method Not Allowed' }, 405));
    },
  };

  return gh;
}

let worker = null;

const baseEnv = () => ({ GH_PAT: PAT, APP_KEY_ANDJELA: KEY_A, APP_KEY_BARRY: KEY_B });

function buildRequest(pathname, opts) {
  opts = opts || {};
  const headers = {};
  if (opts.origin !== null) headers.Origin = opts.origin === undefined ? ORIGIN : opts.origin;
  if (opts.auth !== null && opts.auth !== undefined) headers.Authorization = opts.auth;
  if (opts.headers) Object.assign(headers, opts.headers);

  const init = { method: opts.method || 'GET', headers };
  if (opts.body !== undefined) init.body = opts.body;
  return new Request(WORKER_URL + pathname, init);
}

/** Invoke the Worker with `gh` standing in for the network. */
async function call(gh, pathname, opts, env) {
  const prev = globalThis.fetch;
  globalThis.fetch = gh.fetch;
  try {
    return await worker.fetch(buildRequest(pathname, opts), env || baseEnv());
  } finally {
    globalThis.fetch = prev;
  }
}

async function body(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return { __raw: text };
  }
}

const AUTH_A = { auth: 'Bearer ' + KEY_A };

const SAMPLE_STATE = {
  diary: { '2026-01-01': { andjela: { text: 'test' } } },
  gratitude: [{ text: 'hvala', from: 'barry', time: 1700000000000 }],
  updated: 1700000000000,
};
const SAMPLE_TODO = [
  { id: 'm1abc2x9', text: 'kupiti cveće', author: 'andjela', createdAt: '2026-01-01', completed: false, completedBy: null, completedAt: null },
];

/** Every upstream call the whole run made — used for the R1 sweep. */
const allUpstreamCalls = [];

/**
 * A named marker at each scenario so the sweep is visible where it matters.
 * Recording itself happens inside makeGitHub().fetch; copying gh.calls from
 * here would snapshot the array before the scenario runs and make R1 pass
 * vacuously against an empty list.
 */
function track(gh) {
  return gh;
}

// ── the run ─────────────────────────────────────────────────────────────────

(async () => {
  const mod = await import(pathToFileURL(path.join(__dirname, '..', 'worker', 'src', 'index.js')).href);
  worker = mod.default;
  console.log('worker loaded from worker/src/index.js\n');

  // ═══ A. 鉴权 ══════════════════════════════════════════════════════════════
  console.log('== A. 鉴权 ==');
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/health', { auth: null });
    const b = await body(res);
    check('A1 无 secret → 401', res.status === 401 && b.error === 'bad_key', `status=${res.status} body=${JSON.stringify(b)}`);
    check('A1b 未鉴权请求不产生任何上游调用', gh.calls.length === 0, `upstream calls=${gh.calls.length}`);
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/health', { auth: 'Bearer totally-wrong-key' });
    check('A2 错 secret → 401', res.status === 401, `status=${res.status}`);
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/health', { auth: 'Bearer ' });
    check('A3 空 Bearer → 401', res.status === 401, `status=${res.status}`);
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/health', { auth: 'Basic ' + KEY_A });
    check('A4 非 Bearer 方案 → 401', res.status === 401, `status=${res.status}`);
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/health', AUTH_A);
    const b = await body(res);
    check('A5 正确 secret → /health 200', res.status === 200 && b.ok === true && b.actor === 'andjela', `status=${res.status} body=${JSON.stringify(b)}`);
    check('A5b /health 不访问上游', gh.calls.length === 0, `upstream calls=${gh.calls.length}`);
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/health', { auth: 'Bearer ' + KEY_B });
    const b = await body(res);
    check('A6 barry 的 secret 解析为 barry', res.status === 200 && b.actor === 'barry', JSON.stringify(b));
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/state', { auth: null });
    check('A7 GET /state 无 secret → 401', res.status === 401, `status=${res.status}`);
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/todo', { auth: null });
    check('A8 GET /todo 无 secret → 401', res.status === 401, `status=${res.status}`);
  }
  {
    // A Worker deployed without APP_KEY_* set must not let an empty Bearer
    // through: safeEqual rejects zero-length strings.
    const gh = track(makeGitHub());
    const res = await call(gh, '/health', { auth: 'Bearer ' }, { GH_PAT: PAT });
    check('A9 env 缺 APP_KEY_* 时空 Bearer 仍 → 401', res.status === 401, `status=${res.status}`);
  }

  // ═══ B. 路由 ══════════════════════════════════════════════════════════════
  console.log('\n== B. 路由 ==');
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/nope', AUTH_A);
    const b = await body(res);
    check('B1 非法 route → 404', res.status === 404 && b.error === 'not_found', `status=${res.status} body=${JSON.stringify(b)}`);
  }
  {
    // Regression: the route tables are plain object literals, so a naive
    // `ROUTES[pathname]` resolves these to Object.prototype members and would
    // answer 405 instead of 404.
    const gh = track(makeGitHub());
    const got = [];
    for (const p of ['/constructor', '/toString', '/__proto__', '/hasOwnProperty', '/valueOf']) {
      const res = await call(gh, p, AUTH_A);
      got.push(res.status);
    }
    check('B2 原型链路径 (/constructor 等) → 404 而非 405', got.every((s) => s === 404), got.join(','));
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/state', { method: 'DELETE', auth: 'Bearer ' + KEY_A });
    check('B3 非法 method (DELETE) → 405', res.status === 405, `status=${res.status}`);
    check('B3b 405 带 Allow 头', (res.headers.get('Allow') || '').includes('GET'), res.headers.get('Allow'));
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/health', { method: 'POST', auth: 'Bearer ' + KEY_A });
    check('B4 POST /health → 405', res.status === 405, `status=${res.status}`);
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/state/extra', AUTH_A);
    check('B5 子路径 /state/extra → 404', res.status === 404, `status=${res.status}`);
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/state/', AUTH_A);
    check('B6 尾斜杠 /state/ → 404', res.status === 404, `status=${res.status}`);
  }

  // ═══ C. CORS ══════════════════════════════════════════════════════════════
  console.log('\n== C. CORS ==');
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/state', { method: 'OPTIONS', headers: { 'Access-Control-Request-Method': 'PUT' } });
    check('C1 OPTIONS → 204', res.status === 204, `status=${res.status}`);
    check('C1b OPTIONS 回显正式 origin',
      res.headers.get('Access-Control-Allow-Origin') === ORIGIN,
      `ACAO=${res.headers.get('Access-Control-Allow-Origin')}`);
    check('C1c OPTIONS 声明方法与 Max-Age',
      (res.headers.get('Access-Control-Allow-Methods') || '').includes('PUT') &&
      res.headers.get('Access-Control-Max-Age') === '86400',
      `methods=${res.headers.get('Access-Control-Allow-Methods')} max-age=${res.headers.get('Access-Control-Max-Age')}`);
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/state', { method: 'OPTIONS', origin: EVIL_ORIGIN, headers: { 'Access-Control-Request-Method': 'PUT' } });
    check('C2 非正式 origin 的 OPTIONS → 403 且无 ACAO',
      res.status === 403 && res.headers.get('Access-Control-Allow-Origin') === null,
      `status=${res.status} ACAO=${res.headers.get('Access-Control-Allow-Origin')}`);
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/health', { origin: EVIL_ORIGIN, auth: 'Bearer ' + KEY_A });
    const b = await body(res);
    check('C3 非正式 origin 的请求 → 403',
      res.status === 403 && b.error === 'bad_origin' && res.headers.get('Access-Control-Allow-Origin') === null,
      `status=${res.status} ACAO=${res.headers.get('Access-Control-Allow-Origin')}`);
    check('C3b 被拒 origin 不产生上游调用', gh.calls.length === 0, `upstream calls=${gh.calls.length}`);
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/state', AUTH_A);
    check('C4 正式 origin 的响应带 ACAO',
      res.headers.get('Access-Control-Allow-Origin') === ORIGIN,
      res.headers.get('Access-Control-Allow-Origin'));
    check('C4b 响应恒带 Vary: Origin', (res.headers.get('Vary') || '').includes('Origin'), res.headers.get('Vary'));
  }
  {
    const responses = [
      await call(track(makeGitHub()), '/state', AUTH_A),
      await call(track(makeGitHub()), '/state', { method: 'OPTIONS' }),
      await call(track(makeGitHub()), '/nope', AUTH_A),
      await call(track(makeGitHub()), '/state', { origin: EVIL_ORIGIN, auth: 'Bearer ' + KEY_A }),
    ];
    const wildcards = responses.filter((r) => r.headers.get('Access-Control-Allow-Origin') === '*');
    check('C5 任何响应都不是 ACAO: *', wildcards.length === 0, `wildcards=${wildcards.length}`);
  }

  // ═══ D. 读取 ══════════════════════════════════════════════════════════════
  console.log('\n== D. 读取 ==');
  {
    const gh = track(makeGitHub());
    const sha = gh.seed(STATE_FILE, SAMPLE_STATE);
    const res = await call(gh, '/state', AUTH_A);
    const b = await body(res);
    check('D1 GET /state 正常返回 sha + state',
      res.status === 200 && b.sha === sha && JSON.stringify(b.state) === JSON.stringify(SAMPLE_STATE),
      `status=${res.status} sha=${b.sha}`);
  }
  {
    const gh = track(makeGitHub());
    const sha = gh.seed(TODO_FILE, SAMPLE_TODO);
    const res = await call(gh, '/todo', AUTH_A);
    const b = await body(res);
    check('D2 GET /todo 正常返回 sha + todo',
      res.status === 200 && b.sha === sha && Array.isArray(b.todo) && b.todo[0].id === 'm1abc2x9',
      `status=${res.status} sha=${b.sha}`);
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/state', AUTH_A);
    const b = await body(res);
    check('D3 文件不存在 → 200 且 sha/state 均为 null',
      res.status === 200 && b.sha === null && b.state === null, JSON.stringify(b));
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/todo', AUTH_A);
    const b = await body(res);
    check('D4 todo 文件不存在 → 200 且 sha/todo 均为 null',
      res.status === 200 && b.sha === null && b.todo === null, JSON.stringify(b));
  }
  {
    // Serbian diacritics and CJK must survive the base64 round trip.
    const gh = track(makeGitHub());
    const unicode = { note: 'čćžšđ 中文 🙂', updated: 1700000000000 };
    gh.seed(STATE_FILE, unicode);
    const res = await call(gh, '/state', AUTH_A);
    const b = await body(res);
    check('D5 变音符号与中文经 base64 往返无损', !!b.state && b.state.note === unicode.note, JSON.stringify(b.state));
  }

  // ═══ E. CAS ═══════════════════════════════════════════════════════════════
  console.log('\n== E. CAS ==');
  {
    const gh = track(makeGitHub());
    gh.seed(STATE_FILE, SAMPLE_STATE);
    const before = gh.files[STATE_FILE].sha;
    const next = { diary: { '2026-01-02': { barry: { text: 'novo' } } }, updated: 1700000001000 };
    const res = await call(gh, '/state', {
      method: 'PUT', auth: 'Bearer ' + KEY_A,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseSha: before, state: next }),
    });
    const b = await body(res);
    check('E1 baseSha 正确 → 200 且写入生效',
      res.status === 200 && typeof b.sha === 'string' && b.sha !== before &&
      JSON.stringify(gh.body(STATE_FILE)) === JSON.stringify(next),
      `status=${res.status} sha=${b.sha}`);
  }
  {
    const gh = track(makeGitHub());
    gh.seed(STATE_FILE, SAMPLE_STATE);
    const partner = { diary: { '2026-01-03': { barry: { text: 'partner' } } }, updated: 1700000002000 };
    // The partner lands first, so our baseSha is now stale.
    gh.files[STATE_FILE] = { text: JSON.stringify(partner), sha: 'sha-partner' };

    const res = await call(gh, '/state', {
      method: 'PUT', auth: 'Bearer ' + KEY_A,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseSha: 'sha-stale', state: SAMPLE_STATE }),
    });
    const b = await body(res);
    check('E2 baseSha 过期 → 409', res.status === 409 && b.error === 'conflict', `status=${res.status}`);
    check('E2b 409 带回远端当前内容（供客户端合并）',
      b.sha === 'sha-partner' && JSON.stringify(b.state) === JSON.stringify(partner), `sha=${b.sha}`);
    check('E2c 409 时远端未被覆盖',
      JSON.stringify(gh.body(STATE_FILE)) === JSON.stringify(partner));
  }
  {
    const gh = track(makeGitHub());
    gh.seed(STATE_FILE, SAMPLE_STATE);
    const res = await call(gh, '/state', {
      method: 'PUT', auth: 'Bearer ' + KEY_A,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseSha: null, state: SAMPLE_STATE }),
    });
    check('E3 远端已存在但 baseSha 为 null → 409', res.status === 409, `status=${res.status}`);
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/state', {
      method: 'PUT', auth: 'Bearer ' + KEY_A,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseSha: null, state: SAMPLE_STATE }),
    });
    const b = await body(res);
    check('E3b 远端为空且 baseSha 为 null → 200（首次写入）',
      res.status === 200 && typeof b.sha === 'string', `status=${res.status}`);
  }
  {
    const gh = track(makeGitHub());
    gh.seed(TODO_FILE, SAMPLE_TODO);
    const res = await call(gh, '/todo', {
      method: 'PUT', auth: 'Bearer ' + KEY_A,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseSha: 'sha-stale', todo: SAMPLE_TODO }),
    });
    const b = await body(res);
    check('E4 /todo 同样是 CAS：过期 baseSha → 409 + 当前 todo',
      res.status === 409 && b.error === 'conflict' && Array.isArray(b.todo) && b.todo[0].id === 'm1abc2x9',
      `status=${res.status}`);
  }
  {
    // The core anti-clobber shape: A reads, B lands, A writes with the sha it
    // read. A must be told to merge, not silently overwrite B.
    const gh = track(makeGitHub());
    const base = gh.seed(TODO_FILE, []);
    const read = await body(await call(gh, '/todo', AUTH_A));

    const bItem = { id: 'b0001', text: 'B 新增', author: 'barry', createdAt: '2026-01-01', completed: false, completedBy: null, completedAt: null };
    const bRes = await call(gh, '/todo', {
      method: 'PUT', auth: 'Bearer ' + KEY_B,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseSha: base, todo: [bItem] }),
    });

    const aItem = { id: 'a0001', text: 'A 新增', author: 'andjela', createdAt: '2026-01-01', completed: false, completedBy: null, completedAt: null };
    const aRes = await call(gh, '/todo', {
      method: 'PUT', auth: 'Bearer ' + KEY_A,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseSha: read.sha, todo: [aItem] }),
    });
    const aBody = await body(aRes);

    check('E5 并发新增：B 先落地，A 用旧 sha 写入', bRes.status === 200 && aRes.status === 409,
      `B=${bRes.status} A=${aRes.status}`);
    check('E5b A 拿到 B 的项而不是覆盖它',
      Array.isArray(aBody.todo) && aBody.todo.length === 1 && aBody.todo[0].id === 'b0001',
      JSON.stringify(aBody.todo));
    check('E5c 远端仍是 B 的写入，A 的项没有挤掉它',
      JSON.stringify(gh.body(TODO_FILE)) === JSON.stringify([bItem]),
      JSON.stringify(gh.body(TODO_FILE)));
  }
  {
    // The narrow race: the remote moves between the Worker's own read and its
    // PUT. The Worker must translate GitHub's 409 into a conflict, not a success.
    const gh = track(makeGitHub());
    gh.seed(STATE_FILE, SAMPLE_STATE);
    const sha = gh.files[STATE_FILE].sha;
    const sneaky = { diary: {}, updated: 1700000009000 };
    const originalFetch = gh.fetch;
    let injected = false;

    const wrapped = function (input, init) {
      if (!injected) {
        injected = true;
        gh.files[STATE_FILE] = { text: JSON.stringify(sneaky), sha: 'sha-injected' };
      }
      return originalFetch(input, init);
    };

    const prev = globalThis.fetch;
    globalThis.fetch = wrapped;
    let res;
    try {
      res = await worker.fetch(buildRequest('/state', {
        method: 'PUT', auth: 'Bearer ' + KEY_A,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseSha: sha, state: SAMPLE_STATE }),
      }), baseEnv());
    } finally {
      globalThis.fetch = prev;
    }
    const b = await body(res);
    check('E6 上游在 Worker 读与写之间抢先 → 409 而非 200',
      res.status === 409 && b.sha === 'sha-injected', `status=${res.status} sha=${b.sha}`);
    check('E6b 抢先写入的内容未被覆盖',
      JSON.stringify(gh.body(STATE_FILE)) === JSON.stringify(sneaky));
  }
  {
    const gh = track(makeGitHub());
    gh.seed(STATE_FILE, SAMPLE_STATE);
    const sha = gh.files[STATE_FILE].sha;
    const res = await call(gh, '/state', {
      method: 'PUT', auth: 'Bearer ' + KEY_A,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseSha: sha, state: SAMPLE_STATE }),
    });
    check('E7 PUT 的 commit message 标注了 actor',
      res.status === 200 && gh.puts.length === 1 && /\[andjela\]$/.test(gh.puts[0].message),
      gh.puts.length ? gh.puts[0].message : '(no put)');
  }
  {
    const gh = track(makeGitHub());
    gh.seed(STATE_FILE, SAMPLE_STATE);
    const sha = gh.files[STATE_FILE].sha;
    await call(gh, '/state', {
      method: 'PUT', auth: 'Bearer ' + KEY_B,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseSha: sha, state: SAMPLE_STATE }),
    });
    check('E8 barry 的写入标注 [barry]',
      gh.puts.length === 1 && /\[barry\]$/.test(gh.puts[0].message),
      gh.puts.length ? gh.puts[0].message : '(no put)');
  }

  // ═══ F. 输入校验 ══════════════════════════════════════════════════════════
  console.log('\n== F. 输入校验 ==');
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/state', {
      method: 'PUT', auth: 'Bearer ' + KEY_A,
      headers: { 'Content-Type': 'application/json' },
      body: 'not json at all',
    });
    const b = await body(res);
    check('F1 非 JSON body → 400 bad_json', res.status === 400 && b.error === 'bad_json', `${res.status} ${JSON.stringify(b)}`);
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/state', {
      method: 'PUT', auth: 'Bearer ' + KEY_A,
      headers: { 'Content-Type': 'application/json' },
      body: '[1,2,3]',
    });
    const b = await body(res);
    check('F2 顶层是数组 → 400 bad_json', res.status === 400 && b.error === 'bad_json', `${res.status} ${JSON.stringify(b)}`);
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/state', {
      method: 'PUT', auth: 'Bearer ' + KEY_A,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseSha: null, state: [1, 2] }),
    });
    const b = await body(res);
    check('F3 state 不是对象 → 400 bad_payload', res.status === 400 && b.error === 'bad_payload', `${res.status} ${JSON.stringify(b)}`);
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/todo', {
      method: 'PUT', auth: 'Bearer ' + KEY_A,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseSha: null, todo: { not: 'array' } }),
    });
    const b = await body(res);
    check('F4 todo 不是数组 → 400 bad_payload', res.status === 400 && b.error === 'bad_payload', `${res.status} ${JSON.stringify(b)}`);
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/state', {
      method: 'PUT', auth: 'Bearer ' + KEY_A,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseSha: 12345, state: {} }),
    });
    const b = await body(res);
    check('F5 baseSha 非字符串 → 400 bad_payload', res.status === 400 && b.error === 'bad_payload', `${res.status} ${JSON.stringify(b)}`);
  }
  {
    const gh = track(makeGitHub());
    const res = await call(gh, '/state', {
      method: 'PUT', auth: 'Bearer ' + KEY_A,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseSha: null, state: { pad: 'x'.repeat(900 * 1024 + 1) } }),
    });
    const b = await body(res);
    check('F6 body 超 900 KB → 400 too_large', res.status === 400 && b.error === 'too_large', `${res.status} ${b.error}`);
    check('F6b 超大 body 不产生上游写入', gh.puts.length === 0, `puts=${gh.puts.length}`);
  }
  {
    // A bad payload must not be able to overwrite a readable remote file.
    const gh = track(makeGitHub());
    gh.seed(STATE_FILE, SAMPLE_STATE);
    const res = await call(gh, '/state', {
      method: 'PUT', auth: 'Bearer ' + KEY_A,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseSha: gh.files[STATE_FILE].sha, state: 'a string' }),
    });
    check('F7 校验先于写入，远端未被破坏',
      res.status === 400 && JSON.stringify(gh.body(STATE_FILE)) === JSON.stringify(SAMPLE_STATE),
      `status=${res.status}`);
  }

  // ═══ G. PAT 不暴露 ════════════════════════════════════════════════════════
  console.log('\n== G. PAT 不暴露 ==');
  {
    const gh = track(makeGitHub());
    gh.seed(STATE_FILE, SAMPLE_STATE);
    const ghErr = track(makeGitHub({ failWith: 500 }));

    const responses = [
      await call(gh, '/health', AUTH_A),
      await call(gh, '/state', AUTH_A),
      await call(gh, '/todo', AUTH_A),
      await call(gh, '/nope', AUTH_A),
      await call(gh, '/state', { auth: null }),
      await call(gh, '/state', { auth: 'Bearer wrong' }),
      await call(ghErr, '/state', AUTH_A),
      await call(ghErr, '/state', {
        method: 'PUT', auth: 'Bearer ' + KEY_A,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseSha: null, state: {} }),
      }),
    ];

    let leakedInBody = 0;
    let leakedInHeader = 0;
    for (const r of responses) {
      const text = await r.clone().text();
      if (text.includes(PAT) || text.includes('ghp_') || text.includes('github_pat_')) leakedInBody += 1;
      for (const [, v] of r.headers) {
        if (String(v).includes(PAT)) leakedInHeader += 1;
      }
    }
    check('G1 任何响应体都不含 GitHub PAT', leakedInBody === 0, `leaking responses=${leakedInBody}`);
    check('G2 任何响应头都不含 GitHub PAT', leakedInHeader === 0, `leaking headers=${leakedInHeader}`);
  }
  {
    const gh = track(makeGitHub());
    gh.seed(STATE_FILE, SAMPLE_STATE);
    await call(gh, '/state', AUTH_A);
    const h = (gh.calls[0] && gh.calls[0].headers) || {};
    check('G3 上游确实用 Bearer PAT 鉴权（证明鉴权真的发生）',
      h.Authorization === 'Bearer ' + PAT,
      h.Authorization === undefined ? '(no header)' : 'Bearer ' + String(h.Authorization).slice(7, 11) + '…');
    check('G4 上游带 Accept 与 API 版本头',
      h.Accept === 'application/vnd.github.v3+json' && h['X-GitHub-Api-Version'] === '2022-11-28',
      `${h.Accept} / ${h['X-GitHub-Api-Version']}`);
  }
  {
    const gh = track(makeGitHub());
    gh.seed(STATE_FILE, SAMPLE_STATE);
    await call(gh, '/state', AUTH_A);
    // The browser's app secret must never be forwarded upstream.
    const leaked = gh.calls.filter((c) => {
      const s = JSON.stringify(c.headers);
      return s.includes(KEY_A) || s.includes(KEY_B);
    });
    check('G5 app secret 绝不发往上游', leaked.length === 0, `leaking upstream calls=${leaked.length}`);
  }
  {
    // A near-miss key from the production origin, so this reaches the auth
    // branch rather than being short-circuited by the origin gate.
    const gh = track(makeGitHub());
    const res = await call(gh, '/state', { auth: 'Bearer ' + KEY_A + '-wrong' });
    const b = await body(res);
    check('G6 鉴权失败响应不回显任何 key 内容',
      res.status === 401 && b.error === 'bad_key' &&
      !JSON.stringify(b).includes(KEY_A) && !JSON.stringify(b).includes(KEY_B),
      `status=${res.status} ${JSON.stringify(b)}`);
  }

  // ═══ H. 无开放代理 ════════════════════════════════════════════════════════
  console.log('\n== H. 无开放代理 ==');
  {
    const gh = track(makeGitHub());
    gh.seed(STATE_FILE, SAMPLE_STATE);
    await call(gh, '/state?repo=evil/evil&path=../../etc/passwd&ref=main', AUTH_A);
    const urls = gh.calls.map((c) => c.url);
    check('H1 query 参数无法改变上游 URL',
      urls.length === 1 && urls[0] === `https://api.github.com/repos/${REPO}/contents/${STATE_FILE}`,
      urls.join(' | '));
  }
  {
    const gh = track(makeGitHub());
    let upstreamTouched = 0;
    for (const p of ['/state/../../evil', '/state/%2e%2e/evil', '/..%2fstate', '/repos/evil/evil/contents/x']) {
      const before = gh.calls.length;
      const res = await call(gh, p, AUTH_A);
      if (res.status === 200 && gh.calls.length > before) upstreamTouched += 1;
    }
    check('H2 路径穿越探针未触达上游', upstreamTouched === 0, `touched=${upstreamTouched}`);
  }
  {
    const gh = track(makeGitHub());
    gh.seed(STATE_FILE, SAMPLE_STATE);
    gh.seed(TODO_FILE, SAMPLE_TODO);
    await call(gh, '/state', AUTH_A);
    await call(gh, '/todo', AUTH_A);
    const repos = new Set(gh.calls.map((c) => (/\/repos\/([^/]+\/[^/]+)\//.exec(c.url) || [])[1]));
    check('H3 上游只出现 cycle-tracker-data 一个仓库',
      repos.size === 1 && repos.has(REPO), [...repos].join(','));
    const files = new Set(gh.calls.map((c) => (/\/contents\/([^?]+)/.exec(c.url) || [])[1]));
    check('H4 上游只出现两个写死的文件名',
      files.size === 2 && files.has(STATE_FILE) && files.has(TODO_FILE), [...files].join(','));
    check('H4b 从不请求 shared-diary.json', ![...files].includes('shared-diary.json'), [...files].join(','));
  }

  // ═══ I. 上游错误 ══════════════════════════════════════════════════════════
  console.log('\n== I. 上游错误 ==');
  {
    const gh = track(makeGitHub({ failWith: 500 }));
    const res = await call(gh, '/state', AUTH_A);
    const b = await body(res);
    check('I1 上游 500 → 502', res.status === 502 && b.error === 'upstream', `${res.status} ${JSON.stringify(b)}`);
    check('I1b 上游 5xx 只重试一次（共 2 次调用）', gh.calls.length === 2, `calls=${gh.calls.length}`);
  }
  {
    // A dead PAT must not look like a dead app secret, or the client will tell
    // the user to re-enter a key that was never wrong.
    const gh = track(makeGitHub({ failWith: 401 }));
    const res = await call(gh, '/state', AUTH_A);
    const b = await body(res);
    check('I2 上游 401（PAT 失效）→ 502 而非 401', res.status === 502, `${res.status} ${JSON.stringify(b)}`);
  }
  {
    const gh = track(makeGitHub({ failWith: 403 }));
    const res = await call(gh, '/state', AUTH_A);
    check('I3 上游 403 → 502', res.status === 502, `status=${res.status}`);
  }
  {
    const gh = track(makeGitHub({ failWith: 500 }));
    const res = await call(gh, '/state', AUTH_A);
    const text = await res.clone().text();
    check('I4 错误响应不回传上游 body', !text.includes('upstream boom'), text.slice(0, 120));
  }
  {
    const gh = track(makeGitHub({ hang: true }));
    const started = Date.now();
    const res = await call(gh, '/state', AUTH_A);
    const b = await body(res);
    const elapsed = Date.now() - started;
    check('I5 上游超时 → 504', res.status === 504 && b.error === 'timeout', `${res.status} ${JSON.stringify(b)}`);
    check('I5b 超时确实由 8 秒 AbortController 触发', elapsed >= 8000 && elapsed < 30000, `${elapsed}ms`);
  }

  // ═══ R. 全局复查 ══════════════════════════════════════════════════════════
  console.log('\n== R. 全局复查 ==');
  {
    // Sweep every upstream call this whole run made. If any of them is not the
    // one hardcoded repo + one of the two hardcoded files, the Worker is an
    // open proxy and this catches it regardless of which scenario caused it.
    const bad = allUpstreamCalls.filter((c) => !UPSTREAM_RE.test(c.url));
    check('R1 全程无任何越界上游调用', bad.length === 0,
      bad.length ? bad.slice(0, 3).map((c) => c.url).join(' | ') : `${allUpstreamCalls.length} calls, all in scope`);
    check('R2 全程上游调用量 > 0（证明网络替身确实被使用）', allUpstreamCalls.length > 0, `${allUpstreamCalls.length}`);
  }
  {
    const src = fs.readFileSync(path.join(__dirname, '..', 'worker', 'src', 'index.js'), 'utf8');
    check('R3 Worker 源码中没有 console 输出', !/\bconsole\s*\./.test(src));
    check('R4 Worker 源码不读取浏览器存储或 URL 参数', !/localStorage|sessionStorage|searchParams/.test(src));
    check('R5 Worker 源码不含任何硬编码 PAT 形态的字符串', !/ghp_|github_pat_/.test(src));
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) console.log('FAILED:\n  ' + failed.map((f) => f.name).join('\n  '));
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error('FATAL', e);
  process.exit(2);
});
