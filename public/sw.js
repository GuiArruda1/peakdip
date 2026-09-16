// Service Worker: Network-First Architecture with Self-Destruct in Development
const CACHE_NAME = 'peak-dip-v2';

const isDev =
  self.location.hostname === 'localhost' ||
  self.location.hostname === '127.0.0.1' ||
  self.location.hostname.startsWith('192.168.');

// ─── IN DEVELOPMENT: AUTO-PURGE CACHES AND UNREGISTER ───
if (isDev) {
  self.addEventListener('install', () => {
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => self.registration.unregister())
        .then(() => self.clients.claim())
    );
  });

  // Do not intercept any fetch requests in development
  self.addEventListener('fetch', () => {});
} else {
  // ─── IN PRODUCTION: NETWORK-FIRST STRATEGY (ALWAYS SERVES NEW DEPLOYS IMMEDIATELY) ───
  const STATIC_SHELL = ['/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_SHELL).catch(() => {}))
    );
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys.map((key) => {
              if (key !== CACHE_NAME) return caches.delete(key);
            })
          )
        )
        .then(() => self.clients.claim())
    );
  });

  self.addEventListener('fetch', (event) => {
    // Only handle GET
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // 1. Navigation (HTML Pages): STRICT NETWORK FIRST
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return networkResponse;
          })
          .catch(() => {
            return caches.match(event.request).then((cached) => {
              return (
                cached ||
                new Response(
                  '<h1>Offline</h1><p>PEAK requires internet to stream live market timing data.</p>',
                  { headers: { 'Content-Type': 'text/html' } }
                )
              );
            });
          })
      );
      return;
    }

    // 2. Next.js Static Chunks (/_next/): NETWORK FIRST to prevent stale HMR / chunk mismatch
    if (url.pathname.startsWith('/_next/')) {
      event.respondWith(
        fetch(event.request)
          .then((networkResponse) => {
            return networkResponse;
          })
          .catch(() => {
            return caches.match(event.request);
          })
      );
      return;
    }

    // 3. API endpoints: Network first, cache fallback
    if (url.pathname.startsWith('/api/')) {
      event.respondWith(
        fetch(event.request)
          .then((res) => {
            if (res.status === 200) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return res;
          })
          .catch(() => caches.match(event.request))
      );
      return;
    }

    // 4. Static media/icons: Stale-while-revalidate
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith('http')) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        });
        return cached || fetchPromise;
      })
    );
  });
}

// Push notification handlers
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'PEAK Timing Alert';
  const options = {
    body: data.body || 'New market regime signal detected.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'peak-market-alert',
    renotify: true,
    data: data.url || '/',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
