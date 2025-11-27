const CACHE_NAME = 'petassistant-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/icon.png'
];

// 1. Instalează Service Worker-ul
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Activează și curăță cache-urile vechi
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. Interceptează cererile de rețea (necesar pentru PWA)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Returnează din cache sau ia de pe net
        return response || fetch(event.request);
      })
  );
});