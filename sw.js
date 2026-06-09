// Service Worker — Anđelin Ciklus
// Cache-First for static assets, Network-First for HTML

const CACHE_STATIC = 'ciklus-static-v1';
const CACHE_PAGES = 'ciklus-pages-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/calendar-data.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_STATIC && key !== CACHE_PAGES)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Google Fonts — stale-while-revalidate
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_STATIC).then((cache) => cache.put(request, clone));
          return response;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // CSS / JS — cache first
  if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }

  // Navigation — network first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_PAGES).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Everything else — network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
