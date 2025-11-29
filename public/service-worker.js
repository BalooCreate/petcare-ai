const CACHE_NAME = "petassistant-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/icon.png"
];

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Fetch — NETWORK FIRST for all JS/CSS
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never cache Vite assets, let server deliver correct MIME
  if (url.pathname.startsWith("/assets/")) {
    return; // allow browser to fetch normally
  }

  // For static or HTML pages → Network First with fallback to cache
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
