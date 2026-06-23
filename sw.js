// Service Worker — Anđelin Ciklus v7
// Network-First for all dynamic assets, Cache-First for static

var CACHE_STATIC = 'ciklus-static-v17';

var STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './js/i18n.js',
  './js/lunar.js',
  './js/calendar-culture.js',
  './js/chinese-learn.js',
  './calendar-data.json',
  './data/culture.json',
  './data/lessons.json',
  './data/achievements.json',
  './manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_STATIC).then(function(cache) {
      return Promise.allSettled(
        STATIC_ASSETS.map(function(url) {
          return cache.add(url).catch(function() {});
        })
      );
    })
  );
  self.skipWaiting();
});

// Clean up old cache versions
var KNOWN_CACHES = ['ciklus-static-v17'];

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(key) { return KNOWN_CACHES.indexOf(key) === -1; })
          .map(function(key) { return caches.delete(key); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  var request = event.request;
  var url = new URL(request.url);

  // Google Fonts — bypass SW
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    return;
  }

  // External APIs — bypass SW
  if (url.hostname.includes('api.github.com') || url.hostname.includes('api.open-meteo.com') ||
      url.hostname.includes('translate.googleapis.com') || url.hostname.includes('api.mymemory.translated.net') ||
      url.hostname.includes('translate.argosopentech.com')) {
    return;
  }

  // HTML — network first, no cache
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(function() {
      return caches.match(request);
    }));
    return;
  }

  // CSS/JS/Data — network first with cache fallback + background cache update
  if (request.destination === 'style' || request.destination === 'script' ||
      request.destination === 'manifest' || url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(request).then(function(response) {
        // Clone immediately — response body can only be read once
        var clone = response.clone();
        caches.open(CACHE_STATIC).then(function(cache) {
          cache.put(request, clone);
        });
        return response;
      }).catch(function() {
        return caches.match(request);
      })
    );
    return;
  }

  // Everything else: network first, no cache
  event.respondWith(
    fetch(request).catch(function() { return caches.match(request); })
  );
});
