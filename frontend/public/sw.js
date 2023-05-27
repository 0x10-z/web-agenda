self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open("mi-cache").then(function (cache) {
      return cache.addAll([
        "/index.html",
        "/icon.png",
        "/estilo.css",
        "/app.js",
      ]);
    })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});
