const CACHE_NAME = "harmoniq-ai-v2";

const APP_FILES = [
  "/Harmoniq-AI/",
  "/Harmoniq-AI/index.html",
  "/Harmoniq-AI/styles.css",
  "/Harmoniq-AI/app.js",
  "/Harmoniq-AI/manifest.json",

  "/Harmoniq-AI/locales/en.json",
  "/Harmoniq-AI/locales/ar.json",
  "/Harmoniq-AI/locales/tr.json",
  "/Harmoniq-AI/locales/fr.json",
  "/Harmoniq-AI/locales/es.json",
  "/Harmoniq-AI/locales/de.json"
];

/* Install */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_FILES);
    })
  );

  self.skipWaiting();
});

/* Activate */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

/* Fetch */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const clonedResponse =
              networkResponse.clone();

            caches.open(CACHE_NAME).then((cache) => {
              cache.put(
                event.request,
                clonedResponse
              );
            });
          }

          return networkResponse;
        })
        .catch(() => {
          return caches.match(
            "/Harmoniq-AI/index.html"
          );
        });
    })
  );
});
