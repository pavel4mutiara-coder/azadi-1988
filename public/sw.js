
const CACHE_NAME = 'azadi-cache-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Add a list of paths that should always bypass cache
const BYPASS_CACHE_PATHS = [
  '/api/',
  '/admin',
  '/_firebase/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use cache.addAll but catch individual failures to avoid blocking the whole installation
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Network-first strategy with cache fallback for everything
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin or non-GET requests
  if (event.request.method !== 'GET' || !url.origin.startsWith(self.location.origin)) {
    return;
  }

  // Bypass cache for specific paths
  if (BYPASS_CACHE_PATHS.some(path => url.pathname.includes(path))) {
    return;
  }

  // Navigation requests (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match('/index.html')) || Response.error();
      })
    );
    return;
  }

  // Assets (JS, CSS, Images) - Network first, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then(async (response) => {
        if (response.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone());
        }
        return response;
      })
      .catch(async () => {
        const response = await caches.match(event.request);
        if (response) return response;
        
        // Fallback for missing resources
        if (event.request.destination === 'image') {
          return new Response('', { status: 404, statusText: 'Not Found' });
        }
        return Response.error();
      })
  );
});
