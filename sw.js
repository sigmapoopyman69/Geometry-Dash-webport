const CACHE_NAME = 'gd-webport-cdn-v1';
const GH_PATH = '/Geometry-Dash-webport'; 

// Only pre-cache local shell files during installation
const LOCAL_ASSETS = [
  `${GH_PATH}/`,
  `${GH_PATH}/index.html`,
  `${GH_PATH}/manifest.json`
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(LOCAL_ASSETS))
  );
});

// Fetch Event: Cache-First Strategy with Network Fallback
self.addEventListener('fetch', (event) => {
  // Only intercept HTTP/HTTPS requests (ignores chrome-extension:// etc.)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Return from cache if found
      }

      // Otherwise, fetch from network (jsDelivr or GitHub)
      return fetch(event.request).then((networkResponse) => {
        // Check if the response is valid to cache
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Clone the response and save it to cache dynamically
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    }).catch(() => {
      // Offline fallback can go here if needed
    })
  );
});
