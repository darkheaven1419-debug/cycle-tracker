// Service Worker — Anđelin Ciklus
// Cache-First for static assets, Network-First for HTML

const CACHE_STATIC = 'ciklus-static-v4';
const CACHE_PAGES = 'ciklus-pages-v4';

const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './calendar-data.js',
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

self.addEventListener('activate', function(event) {
  // Wipe ALL old caches so stale CSS/JS never served
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) { return caches.delete(key); }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  var request = event.request;
  var url = new URL(request.url);

  // Google Fonts — pass through
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    return;
  }

  // CSS / JS / HTML — network first, cache fallback for offline
  if (request.destination === 'style' || request.destination === 'script' || request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(function(response) {
        var clone = response.clone();
        caches.open(CACHE_STATIC).then(function(cache) { cache.put(request, clone); });
        return response;
      }).catch(function() {
        return caches.match(request);
      })
    );
    return;
  }

  // Everything else
  event.respondWith(
    fetch(request).catch(function() { return caches.match(request); })
  );
});
