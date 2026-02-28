const CACHE_NAME = "site-cache-v2";
const ASSETS = [
  "/",
  "/index.html",
  "/products.html",
  "/product-details.html",
  "/about.html",
  "/contact.html",
  "/css/style.css",
  "/css/products.css",
  "/css/product-details.css",
  "/js/script.js",
  "/js/products.js",
  "/js/product-details.js",
  "/js/google-translate.js",
  "/images/logo-modern.png",
  "/images/favicon.ico",
  "/site.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Network-first for HTML documents (always get fresh content)
  if (
    req.destination === "document" ||
    req.headers.get("accept")?.includes("text/html")
  ) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return networkRes;
        })
        .catch(() => caches.match(req)),
    );
    return;
  }

  // Cache-first for static assets (scripts, styles, images, fonts)
  if (["script", "style", "image", "font"].includes(req.destination)) {
    event.respondWith(
      caches.match(req).then(
        (cacheRes) =>
          cacheRes ||
          fetch(req).then((networkRes) => {
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(req, networkRes.clone()));
            return networkRes;
          }),
      ),
    );
  }
});
