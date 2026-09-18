// Service Worker — Anđelin Ciklus v10 (offline.html, auto-clean caches, full CSS+JS cache)
// Network-First for all dynamic assets, Cache-First for static
// Features: Background Sync for offline diary saves, cache-first for fonts

// ── 版本号唯一来源 ────────────────────────────────────────────────
// APP_VERSION 必须与 index.html 里每个 <script src="?v=..."> 的版本号、
// 以及 app.js 里 register('sw.js?v=...') 的版本号一致。
// tests/test-version-consistency.js 会强制校验，漂移即测试失败。
// 注意：这与 CACHE_STATIC 的 vNN 是两回事 —— 前者是资源查询串（决定
// 浏览器/SW 的 cache key），后者是 SW 自身的缓存代际（决定 activate 时
// 删掉哪些旧 cache）。两者不要合并。
const APP_VERSION = '7.3.0';
const V = '?v=' + APP_VERSION;

// Phase 1C：v31 → v32。改的是 ./css/v2.css（Our Story 的整段新样式）、
// ./index.html（新增一个 script 标签）、以及一个全新的 cache-first 文件
// ./js/module-memories.js —— 不换这个名字，已装 SW 的客户端在部署后仍会拿旧
// 文件，整个 Memories 页对老客户端就不可见。activate 会删掉所有不在
// CURRENT_CACHES 里的旧 cache，所以改名即完成刷新。
// （Phase 1B.5 刷新过 ./css/v2.css、./js/sync.js、./js/render-love.js、
//  ./js/module-dashboard.js：v30 → v31；Phase 1B 同一批：v29 → v30；
//  Phase 2C 刷新过 ./app.js 与 ./js/fix-stats.js：v28 → v29。）
const CACHE_STATIC = 'ciklus-static-v32';
const CACHE_FONTS = 'ciklus-fonts-v1';

// 这个列表必须逐一等于 index.html 实际发出的请求 URL（含/不含 ?v= 都要一致）。
// 之前这里是清一色的裸路径，而 index.html 有 23 个脚本带 ?v=7.3.0 ——
// cache key 对不上，install 阶段的预缓存对那 23 个文件等于没做。
// 反过来，不带 ?v= 的 11 个 module-*.js / fix-*.js 才是真正命中的那批。
const STATIC_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './app.js' + V,
  './css/tokens.css',
  './css/calendar.css',
  './css/v2.css',
  './js/i18n.js' + V,
  './js/auth.js' + V,
  './js/weather.js' + V,
  './js/sync.js' + V,
  './js/ui-core.js' + V,
  './js/chart-renderer.js' + V,
  './js/cycle-core.js' + V,
  './js/cycle-engine.js' + V,
  './js/render-calendar.js' + V,
  './js/lunar.js' + V,
  './js/calendar-culture.js' + V,
  './js/translate.js' + V,
  './js/theme.js' + V,
  './js/social.js' + V,
  './js/culture-cards.js' + V,
  './js/calendar.js' + V,
  './js/shared-calendar.js' + V,
  './js/barry.js' + V,
  './js/render-mood.js' + V,
  './js/render-love.js' + V,
  './js/render-misc.js' + V,
  './js/gsap-animations.js' + V,
  './js/module-holidays.js',
  './js/module-sleep.js',
  './js/module-settings.js',
  './js/module-dashboard.js',
  './js/module-stats.js',
  './js/fix-css.js',
  './js/fix-diary.js',
  './js/module-memories.js',
  './js/fix-stats.js',
  './js/fix-all.js',
  './js/fix-panel.js',
  './libs/gsap.min.js',
  './libs/ScrollTrigger.min.js',

  './calendar-data.json',
  './data/quotes.json',
  './data/culture-knowledge.json',
  './data/data.json',
  './data/solar-terms.json',
  './data/holidays.json',
  './manifest.json',
];

self.addEventListener('install', function (event) {
  // 预缓存完成之前不要进入 activated —— 否则可能出现
  // 「新 SW 已接管、但 cache 还是空的」窗口期。
  event.waitUntil(
    caches.open(CACHE_STATIC).then(function (cache) {
      return Promise.allSettled(
        STATIC_ASSETS.map(function (url) {
          return cache.add(url).catch(function () {});
        })
      );
    })
  );
  // 这里【故意不调用】self.skipWaiting()。
  // 无条件 skipWaiting 会让新 SW 立刻接管已打开的旧页面，
  // 紧接着 activate 删掉旧 cache —— 而旧页面手里还引用着被删掉的资源，
  // 就出现「旧页面 + 新 SW」的混搭状态。
  // 改为让新 SW 停在 waiting，等所有页面关闭后由浏览器自然激活。
  // 需要立即更新时，页面可 postMessage({type:'SKIP_WAITING'})（见下方 message 处理）。
});

// Clean up old cache versions — keep only current, delete everything else
const CURRENT_CACHES = [CACHE_STATIC, CACHE_FONTS];

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) {
              return CURRENT_CACHES.indexOf(key) === -1;
            })
            .map(function (key) {
              return caches.delete(key);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', function (event) {
  const request = event.request;
  const url = new URL(request.url);

  // 非 HTTP(S) 请求（chrome-extension:、data:、blob:、about: 等）一律跳过：
  // 不 respondWith、不 fetch、不进 Cache。
  // 否则 fetch()/caches.match() 会抛 "Request scheme 'chrome-extension' is unsupported"。
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Google Fonts — cache-first (fonts are versioned, rarely change)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then(function (cached) {
        if (cached) return cached;
        return fetch(request)
          .then(function (response) {
            const clone = response.clone();
            caches.open(CACHE_FONTS).then(function (cache) {
              cache.put(request, clone).catch(function () {});
            });
            return response;
          })
          .catch(function () {
            // 网络失败且缓存 miss：合成 503，绝不 resolve(undefined)。
            return new Response('', { status: 503, headers: { 'Content-Type': 'text/plain' } });
          });
      })
    );
    return;
  }

  // External APIs — bypass SW
  if (
    url.hostname.includes('api.github.com') ||
    url.hostname.includes('api.open-meteo.com') ||
    url.hostname.includes('translate.googleapis.com') ||
    url.hostname.includes('api.mymemory.translated.net') ||
    url.hostname.includes('translate.argosopentech.com') ||
    // 私有数据 Worker（Phase 2A 起 Pull 走这里）。
    // 精确匹配：这条路返回私人 diary / mood / gratitude 数据，
    // 绝不能被下面的 .json / 兜底分支写进 CACHE_STATIC。
    url.hostname === 'cycle-tracker-data.cycletracker-barry.workers.dev'
  ) {
    return;
  }

  // HTML — network first with timeout fallback (3s), then offline page / cached root / synthesized 503
  if (request.mode === 'navigate') {
    event.respondWith(
      Promise.race([
        fetch(request),
        new Promise(function (_, reject) {
          setTimeout(function () {
            reject(new Error('network timeout'));
          }, 3000);
        }),
      ]).catch(function () {
        // 网络失败/超时 → 依次回退：缓存的 offline.html → 缓存的根页面 → 合成 503。
        // caches.match() 在 miss 时 resolve(undefined) 而非 reject，
        // 必须显式判空兜底，保证 respondWith 永远拿到合法 Response。
        return caches.match('./offline.html').then(function (offline) {
          if (offline) return offline;
          return caches.match('./').then(function (root) {
            if (root) return root;
            return new Response(
              '<!DOCTYPE html><html lang="zh"><meta charset="utf-8"><title>Offline</title><body><h1>Offline</h1></body></html>',
              { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            );
          });
        });
      })
    );
    return;
  }

  // CSS/JS/Data — network first with cache fallback + background cache update
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'manifest' || url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          // Clone immediately — response body can only be read once
          const clone = response.clone();
          caches.open(CACHE_STATIC).then(function (cache) {
            cache.put(request, clone).catch(function () {});
          });
          return response;
        })
        .catch(function () {
          return caches.match(request).then(function (cached) {
            if (cached) return cached;
            // 网络失败且缓存 miss：合成 503，绝不 resolve(undefined)。
            return new Response('', { status: 503, headers: { 'Content-Type': 'text/plain' } });
          });
        })
    );
    return;
  }

  // Everything else: network first, no cache
  event.respondWith(
    fetch(request).catch(function () {
      return caches.match(request).then(function (cached) {
        if (cached) return cached;
        // 网络失败且缓存 miss：合成 503，绝不 resolve(undefined)。
        return new Response('', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      });
    })
  );
});

// ================================================================
// Background Sync — offline diary saves
// ================================================================

self.addEventListener('sync', function (event) {
  if (event.tag === 'sync-diary') {
    event.waitUntil(syncDiaryData());
  }
});

/**
 * Retrieve queued diary entries from IndexedDB and push them via the
 * app's sync endpoint. On success, clear the queue.
 */
function syncDiaryData() {
  // Fall back to the sync.js mechanism: open a client and re-trigger the
  // app-level sync function which knows how to push pending entries.
  return self.clients.matchAll().then(function (clients) {
    if (clients && clients.length) {
      clients.forEach(function (client) {
        client.postMessage({ type: 'SYNC_DIARY_TRIGGER' });
      });
    }
  });
}

// ================================================================
// Message event — allow the app to trigger a sync or perform
// other SW-level actions
// ================================================================

self.addEventListener('message', function (event) {
  const data = event.data || {};

  // 显式请求立即更新（页面侧可用它配合「有新版本」提示）。
  // 只在页面主动调用时触发，不再在 install 里无条件执行。
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  // Allow the app to ask the SW to try syncing now
  if (data.type === 'TRIGGER_SYNC') {
    self.registration.sync.register('sync-diary').catch(function () {
      // Sync registration failed — client should push immediately
    });
    return;
  }
});
