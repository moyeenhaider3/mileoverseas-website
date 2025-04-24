const CACHE_NAME = 'site-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/products.html',
  '/product-details.html',
  '/about.html',
  '/contact.html',
  '/css/style.css',
  '/css/products.css',
  '/css/product-details.css',
  '/js/script.js',
  '/js/products.js',
  '/js/product-details.js',
  '/js/localization/localization.js',
  '/images/logo-modern.png',
  '/images/favicon.ico',
  '/site.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (['document','script','style','image','font'].includes(req.destination)) {
    event.respondWith(
      caches.match(req).then(cacheRes =>
        cacheRes ||
        fetch(req).then(networkRes => {
          caches.open(CACHE_NAME).then(cache => cache.put(req, networkRes.clone()));
          return networkRes;
        })
      )
    );
  }
});
