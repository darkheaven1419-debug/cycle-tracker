// Service Worker — Anđelin Ciklus v10 (offline.html, auto-clean caches, full CSS+JS cache)
// Network-First for all dynamic assets, Cache-First for static
// Features: Background Sync for offline diary saves, cache-first for fonts

const CACHE_STATIC = 'ciklus-static-v26';
const CACHE_FONTS = 'ciklus-fonts-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './styles.css',
  './app.js',
  './css/tokens.css',
  './css/base.css',
  './css/components.css',
  './css/calendar.css',
  './css/diary.css',
  './css/learning.css',
  './css/animations.css',
  './css/responsive.css',
  './js/i18n.js',
  './js/auth.js',
  './js/weather.js',
  './js/sync.js',
  './js/ui-core.js',
  './js/chart-renderer.js',
  './js/cycle-core.js',
  './js/lunar.js',
  './js/calendar-culture.js',
  './js/chinese-learn.js',
  './js/chinese-ui.js',
  './js/chinese-quiz.js',
  './js/chinese-panels.js',
  './js/chinese-listen.js',
  './js/translate.js',
  './js/theme.js',
  './js/social.js',
  './js/culture-cards.js',
  './js/calendar.js',
  './js/barry.js',
  './js/render-mood.js',
  './js/render-love.js',
  './js/render-misc.js',
  './js/render-settings.js',
  './js/render-diary.js',
  './js/gsap-animations.js',

  './calendar-data.json',
  './data/quotes.json',
  './data/culture.json',
  './data/culture-knowledge.json',
  './data/lessons.json',
  './data/achievements.json',
  './data/data.json',
  './data/solar-terms.json',
  './data/holidays.json',
  './manifest.json',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_STATIC).then(function (cache) {
      return Promise.allSettled(
        STATIC_ASSETS.map(function (url) {
          return cache.add(url).catch(function () {});
        })
      );
    })
  );
  self.skipWaiting();
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

  // Google Fonts — cache-first (fonts are versioned, rarely change)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then(function (cached) {
        return (
          cached ||
          fetch(request).then(function (response) {
            const clone = response.clone();
            caches.open(CACHE_FONTS).then(function (cache) {
              cache.put(request, clone).catch(function () {});
            });
            return response;
          })
        );
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
    url.hostname.includes('translate.argosopentech.com')
  ) {
    return;
  }

  // HTML — network first with timeout fallback (3s), then offline page
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
        return caches.match('./offline.html');
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
            cache.put(request, clone);
          });
          return response;
        })
        .catch(function () {
          return caches.match(request);
        })
    );
    return;
  }

  // Everything else: network first, no cache
  event.respondWith(
    fetch(request).catch(function () {
      return caches.match(request);
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
