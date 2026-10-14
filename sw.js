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
