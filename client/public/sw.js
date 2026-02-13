const CACHE_VERSION = 'v3';
const STATIC_CACHE = `exentax-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `exentax-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `exentax-images-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.png',
  '/logo-icon.png',
  '/benefits-no-vat.png',
  '/benefits-no-tax.png',
  '/benefits-no-fees.png',
  '/benefits-banking.png',
  '/clear-pricing.png',
  '/business-specialists.png',
  '/personal-support.png'
];

const MAX_DYNAMIC_CACHE_SIZE = 75;
const MAX_IMAGE_CACHE_SIZE = 50;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name.startsWith('exentax-') && 
                     name !== STATIC_CACHE && 
                     name !== DYNAMIC_CACHE && 
                     name !== IMAGE_CACHE;
            })
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxSize) {
    await cache.delete(keys[0]);
    await limitCacheSize(cacheName, maxSize);
  }
}

async function cacheFirst(request, cacheName, maxSize) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      limitCacheSize(cacheName, maxSize);
    }
    return response;
  } catch (error) {
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
      limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE);
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    
    if (request.mode === 'navigate') {
      const indexCached = await caches.match('/');
      if (indexCached) return indexCached;
    }
    
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, response.clone());
          limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE);
        });
      }
      return response.clone();
    })
    .catch(() => null);
  
  if (cached) {
    fetchPromise.catch(() => {});
    return cached;
  }
  
  const networkResponse = await fetchPromise;
  return networkResponse || new Response('', { status: 503, statusText: 'Offline' });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') return;

  const destination = request.destination;

  if (destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE));
  } else if (destination === 'font') {
    event.respondWith(cacheFirst(request, STATIC_CACHE, 20));
  } else if (destination === 'style' || url.pathname.endsWith('.css')) {
    event.respondWith(staleWhileRevalidate(request));
  } else if (destination === 'script' || url.pathname.endsWith('.js')) {
    event.respondWith(staleWhileRevalidate(request));
  } else if (destination === 'document' || request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  if (event.data === 'clearCache') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});
