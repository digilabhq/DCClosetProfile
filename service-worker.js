// service-worker.js
const CACHE = "dcp-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles/main.css",
  "./app.js",
  "./config/questions.js",
  "./utils/pdf-generator.js",
  "./assets/images/icons/Icon.png",
  "./assets/images/icons/Logo.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => r))
  );
});
