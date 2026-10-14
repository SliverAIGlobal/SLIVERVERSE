const CACHE_NAME = 'hana-runner-v2.4-pro';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2'
];

// Install Event - Pre-cache Core Application Shell & External CDNs
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching Application Shell & WASM Library');
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(err => console.warn('[Service Worker] Install warning:', err))
const CACHE_NAME = 'launchpad-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/registry/AppRegistry.js',
  '/src/engine/Valuator.js',
  '/src/store/LocalStore.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate Event - Clean Up Obsolete Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Purging Obsolete Cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch Event - Advanced Stale-While-Revalidate Caching Strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Cache ONNX / WASM model weights aggressively
  if (url.hostname.includes('huggingface.co') || url.hostname.includes('jsdelivr.net')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Stale-while-revalidate for local assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
        }
        return networkResponse;
      }).catch(() => {
        /* Network fail - serve cached fallback */
      });

      return cachedResponse || fetchPromise;
    })
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((res) => {
      return (
        res ||
        fetch(e.request).then((networkRes) => {
          if (
            networkRes.ok &&
            e.request.url.startsWith(self.location.origin)
          ) {
            const cacheCopy = networkRes.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(e.request, cacheCopy));
          }
          return networkRes;
        })
      );
    }).catch(() => caches.match('/index.html'))
  );
});
