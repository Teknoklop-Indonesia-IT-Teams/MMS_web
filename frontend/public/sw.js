const CACHE_NAME = "mms-v1";
const urlsToCache = ["/", "/manifest.json", "/vite.svg"];

self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching files");
      return cache.addAll(urlsToCache).catch((error) => {
        console.error("Service Worker: Cache addAll failed:", error);
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch((error) => {
          console.log(
            "Service Worker: Fetch failed for",
            event.request.url,
            error
          );
          if (event.request.destination === "document") {
            return caches.match("/");
          }
          return new Response("Resource not available", { status: 404 });
        })
      );
    })
  );
});

self.addEventListener("activate", (event) => {
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
  self.clients.claim();
});
