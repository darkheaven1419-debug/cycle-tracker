/**
 * cycle-tracker — private shared-data Worker
 *
 * Sits between the public PWA (GitHub Pages) and the *private* data repository.
 * The browser holds only a per-person app secret; the GitHub PAT lives here as a
 * Worker secret and is never returned, logged, or echoed in an error.
 *
 * Design constraints (see /worker/README.md):
 *   - The GitHub owner/repo and the file paths are LITERALS. Nothing from the
 *     request ever reaches the upstream URL, so this cannot act as an open proxy.
 *   - The Worker does NOT interpret the payload. Merging stays in the browser,
 *     where sync.js's mergeDiary/mergeGratitude/mergeEcho are the single tested
 *     implementation. Here we only do compare-and-swap on GitHub's blob sha.
 *   - PUT is a true CAS: the client sends the sha it read; if the remote has moved
 *     on we answer 409 *with the current content* so the client can merge and
 *     retry in one round trip. Never "GET the sha and blindly PUT" — that would
 *     silently overwrite a partner write that landed in between.
 *
 * Secrets (set with `wrangler secret put`, never committed):
 *   GH_PAT            fine-grained PAT, contents:read/write, cycle-tracker-data only
 *   APP_KEY_ANDJELA   app secret for one person
 *   APP_KEY_BARRY     app secret for the other
 */

const GH_REPO = 'darkheaven1419-debug/cycle-tracker-data';
const GH_API = 'https://api.github.com';
const GH_ACCEPT = 'application/vnd.github.v3+json';
const GH_API_VERSION = '2022-11-28';

/**
 * Route -> resource. The upstream file name is looked up from this literal map,
 * which is what makes the "no arbitrary repo/path" guarantee structural rather
 * than a validation rule someone could later forget to call.
 */
const RESOURCES = {
  state: { file: 'shared-state.json', message: '🔄 Sync shared state' },
  todo: { file: 'shared-todolist.json', message: '🔄 Sync todo list' },
};

const ROUTES = {
  '/health': { GET: 'health' },
  '/state': { GET: 'state', PUT: 'state' },
  '/todo': { GET: 'todo', PUT: 'todo' },
};

/**
 * Own-property lookup for the tables above. Plain `table[key]` would resolve
 * `constructor`, `toString`, `__proto__` and friends to Object.prototype
 * members, so `GET /constructor` would answer 405 instead of 404 and a request
 * method named `constructor` would reach a handler that isn't there.
 */
function lookup(table, key) {
  return Object.prototype.hasOwnProperty.call(table, key) ? table[key] : null;
}

/**
 * The PWA's one and only origin. Requests carrying a different Origin are
 * refused outright (403) rather than merely denied CORS headers — the latter
 * would still let a hostile page trigger a state-changing write, since the
 * preflight is the only thing standing between it and a valid Bearer request.
 */
const ALLOWED_ORIGIN = 'https://darkheaven1419-debug.github.io';

/** Below GitHub's 1 MB Contents API limit, leaving room for base64 expansion. */
const MAX_BODY_BYTES = 900 * 1024;
const UPSTREAM_TIMEOUT_MS = 8000;
const UPSTREAM_ATTEMPTS = 2; // one retry, and only for transport/5xx failures

// ── errors ──────────────────────────────────────────────────────────────────

class UpstreamError extends Error {
  constructor(status) {
    super('upstream ' + status);
    this.name = 'UpstreamError';
    this.status = status;
  }
}
class UpstreamTimeout extends Error {
  constructor() {
    super('upstream timeout');
    this.name = 'UpstreamTimeout';
  }
}
class BadRequest extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'BadRequest';
    this.code = code;
  }
}

// ── response helpers ────────────────────────────────────────────────────────

function corsHeaders(request) {
  const headers = {
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  // Only ever granted to the production origin; never '*'.
  if (request.headers.get('Origin') === ALLOWED_ORIGIN) {
    headers['Access-Control-Allow-Origin'] = ALLOWED_ORIGIN;
  }
  return headers;
}

function json(data, status, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...corsHeaders(request),
    },
  });
}

function fail(code, message, status, request, extra) {
  return json(Object.assign({ error: code, message }, extra || {}), status, request);
}

// ── auth ────────────────────────────────────────────────────────────────────

/** Length-independent compare, so a wrong key cannot be narrowed byte by byte. */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length || a.length === 0) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Resolves the caller's identity, or null. The PAT is never involved here. */
function actorFrom(request, env) {
  const header = request.headers.get('Authorization') || '';
  const match = /^Bearer[ \t]+(.+)$/i.exec(header.trim());
  if (!match) return null;
  const key = match[1].trim();
  if (safeEqual(key, env.APP_KEY_ANDJELA)) return 'andjela';
  if (safeEqual(key, env.APP_KEY_BARRY)) return 'barry';
  return null;
}

// ── base64 <-> UTF-8 ────────────────────────────────────────────────────────
// The browser's decodeURIComponent(escape(atob(x))) trick is not used here;
// TextDecoder/TextEncoder handle Serbian diacritics and Chinese directly.

function decodeBase64Utf8(b64) {
  const bin = atob(String(b64).replace(/\s+/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function encodeBase64Utf8(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

// ── upstream ────────────────────────────────────────────────────────────────

function timeoutGuard(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, release: () => clearTimeout(timer) };
}

function ghRequest(env, path, init) {
  return {
    url: GH_API + '/repos/' + GH_REPO + '/contents/' + path,
    init: {
      ...init,
      headers: {
        Authorization: 'Bearer ' + env.GH_PAT,
        Accept: GH_ACCEPT,
        'X-GitHub-Api-Version': GH_API_VERSION,
        'User-Agent': 'cycle-tracker-worker',
        ...((init && init.headers) || {}),
      },
    },
  };
}

async function ghSend(env, path, init) {
  const { url, init: full } = ghRequest(env, path, init);
  let lastError = null;

  for (let attempt = 0; attempt < UPSTREAM_ATTEMPTS; attempt++) {
    const guard = timeoutGuard(UPSTREAM_TIMEOUT_MS);
    try {
      const resp = await fetch(url, { ...full, signal: guard.signal });
      if (resp.status >= 500 && attempt < UPSTREAM_ATTEMPTS - 1) {
        lastError = new UpstreamError(resp.status);
        continue;
      }
      return resp;
    } catch (e) {
      lastError = guard.signal.aborted ? new UpstreamTimeout() : e;
      if (attempt === UPSTREAM_ATTEMPTS - 1) throw lastError;
    } finally {
      guard.release();
    }
  }
  throw lastError;
}

/** Reads one data file. A missing file is a normal empty state, not an error. */
async function ghRead(env, resource) {
  const resp = await ghSend(env, RESOURCES[resource].file, { method: 'GET' });
  if (resp.status === 404) return { sha: null, data: null };
  if (!resp.ok) throw new UpstreamError(resp.status);

  const body = await resp.json();
  if (!body || typeof body.content !== 'string' || !body.content) {
    return { sha: body && body.sha ? body.sha : null, data: null };
  }
  let data = null;
  try {
    data = JSON.parse(decodeBase64Utf8(body.content));
  } catch (e) {
    // A corrupted remote must not be silently replaced by whatever we send next.
    throw new UpstreamError(500);
  }
  return { sha: body.sha || null, data };
}

/** Writes one data file with the sha the caller believes is current. */
async function ghWrite(env, resource, payload, sha, actor) {
  const resp = await ghSend(env, RESOURCES[resource].file, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Attribution: the per-person app secret is what lets the commit history
      // finally distinguish who wrote what.
      message: RESOURCES[resource].message + ' [' + actor + ']',
      content: encodeBase64Utf8(JSON.stringify(payload, null, 2)),
      ...(sha ? { sha } : {}),
    }),
  });
  if (resp.status === 409 || resp.status === 422) return { conflict: true };
  if (!resp.ok) throw new UpstreamError(resp.status);
  const body = await resp.json();
  return { sha: (body && body.content && body.content.sha) || null };
}

// ── request parsing ─────────────────────────────────────────────────────────

async function readJsonBody(request) {
  const declared = Number(request.headers.get('Content-Length') || 0);
  if (declared > MAX_BODY_BYTES) throw new BadRequest('too_large', 'Payload too large');

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw new BadRequest('too_large', 'Payload too large');

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new BadRequest('bad_json', 'Body is not valid JSON');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new BadRequest('bad_json', 'Body must be a JSON object');
  }
  return parsed;
}

/**
 * Minimal shape guard. This is a type check, not data interpretation — the
 * merge rules stay in the browser. It exists so a buggy client cannot overwrite
 * a good remote file with something the app will never be able to read back.
 */
function assertPayload(resource, payload) {
  const expected = resource === 'todo' ? 'todo' : 'state';
  const value = payload[expected];
  if (resource === 'todo') {
    if (!Array.isArray(value)) throw new BadRequest('bad_payload', 'todo must be an array');
  } else if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequest('bad_payload', 'state must be an object');
  }
  if (payload.baseSha != null && typeof payload.baseSha !== 'string') {
    throw new BadRequest('bad_payload', 'baseSha must be a string or null');
  }
  return value;
}

// ── handlers ────────────────────────────────────────────────────────────────

function handleRead(env, resource, request) {
  return ghRead(env, resource).then((current) =>
    resource === 'todo'
      ? json({ sha: current.sha, todo: current.data }, 200, request)
      : json({ sha: current.sha, state: current.data }, 200, request)
  );
}

async function handleWrite(env, resource, actor, request) {
  const body = await readJsonBody(request);
  const value = assertPayload(resource, body);
  const baseSha = body.baseSha == null ? null : body.baseSha;

  // Compare-and-swap against the sha the client actually read.
  const current = await ghRead(env, resource);
  if (baseSha !== current.sha) return conflict(resource, current, request);

  const written = await ghWrite(env, resource, value, current.sha, actor);
  if (written.conflict) {
    // Someone landed between our read and our write. Hand back the fresh
    // content so the client can merge and retry without an extra round trip.
    return conflict(resource, await ghRead(env, resource), request);
  }
  return json({ sha: written.sha }, 200, request);
}

function conflict(resource, current, request) {
  return fail('conflict', 'Remote changed; merge and retry', 409, request,
    resource === 'todo'
      ? { sha: current.sha, todo: current.data }
      : { sha: current.sha, state: current.data });
}

// ── entry ───────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const method = request.method.toUpperCase();

    // Preflight. Answered before the origin gate so a disallowed origin gets a
    // clean 403 instead of a header-less 204 that reads like a server bug.
    if (method === 'OPTIONS') {
      if (request.headers.get('Origin') && request.headers.get('Origin') !== ALLOWED_ORIGIN) {
        return new Response(null, { status: 403, headers: { Vary: 'Origin' } });
      }
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const origin = request.headers.get('Origin');
    if (origin && origin !== ALLOWED_ORIGIN) {
      return fail('bad_origin', 'Origin not allowed', 403, request);
    }

    // Route and method are resolved before auth on purpose: the route table is
    // published in the public repo, so hiding it buys nothing, and answering
    // 404/405 first keeps each failure mode independently observable.
    const table = lookup(ROUTES, new URL(request.url).pathname);
    if (!table) return fail('not_found', 'Unknown route', 404, request);
    const target = lookup(table, method);
    if (!target) {
      return new Response(null, {
        status: 405,
        headers: { Allow: 'GET, PUT, OPTIONS', ...corsHeaders(request) },
      });
    }

    const actor = actorFrom(request, env);
    if (!actor) {
      return new Response(
        JSON.stringify({ error: 'bad_key', message: 'Missing or invalid app secret' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            'WWW-Authenticate': 'Bearer',
            ...corsHeaders(request),
          },
        }
      );
    }

    if (target === 'health') return json({ ok: true, actor }, 200, request);

    try {
      return method === 'GET'
        ? await handleRead(env, target, request)
        : await handleWrite(env, target, actor, request);
    } catch (e) {
      if (e instanceof BadRequest) return fail(e.code, e.message, 400, request);
      if (e instanceof UpstreamTimeout) return fail('timeout', 'Upstream timed out', 504, request);
      // Never surface the upstream body: it can echo request headers.
      return fail('upstream', 'Upstream request failed', 502, request);
    }
  },
};
