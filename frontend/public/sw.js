const CACHE_NAME = "mms-v1";
const urlsToCache = ["/", "/manifest.json", "/vite.svg"];

// Install event - cache resources
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching files");
      return cache.addAll(urlsToCache).catch((error) => {
        console.error("Service Worker: Cache addAll failed:", error);
        // Continue installation even if some resources fail to cache
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip API calls and let them go directly to network
  if (event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return (
        response ||
        fetch(event.request).catch((error) => {
          console.log(
            "Service Worker: Fetch failed for",
            event.request.url,
            error
          );
          // Return a basic response for failed fetches
          if (event.request.destination === "document") {
            return caches.match("/");
          }
          return new Response("Resource not available", { status: 404 });
        })
      );
    })
  );
});

// Activate event - clean up old caches
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
