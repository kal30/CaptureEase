const CACHE_NAME = 'captureez-app-v2';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/captureez-icon-192.png',
  '/captureez-icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;

  if (!isSameOrigin) {
    return;
  }

  const isNavigationRequest = event.request.mode === 'navigate';

  if (isNavigationRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', responseClone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      });
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  if (action === 'resolved' || action === 'improved' || action === 'no_change') {
    event.waitUntil(
      broadcastQuickResponse({
        incidentId: data.incidentId,
        effectiveness: action,
        followUpIndex: data.followUpIndex || 0,
      }).then(() =>
        self.registration.showNotification('Response Recorded! 🎉', {
          body: 'Your feedback has been saved. Open CaptureEz to see details.',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `response-${data.incidentId}`,
          requireInteraction: false,
          actions: [],
        })
      )
    );
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        const url = data.incidentId
          ? `${self.location.origin}/?followup=${data.incidentId}&index=${data.followUpIndex || 0}`
          : self.location.origin;
        return clients.openWindow(url);
      }

      return undefined;
    })
  );
});

async function broadcastQuickResponse(payload) {
  try {
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (allClients.length) {
      allClients.forEach((client) => {
        client.postMessage({ type: 'FOLLOWUP_QUICK_RESPONSE', payload });
      });
      return;
    }

    if (clients.openWindow) {
      const url = `${self.location.origin}/?followup=${encodeURIComponent(payload.incidentId)}&effectiveness=${encodeURIComponent(payload.effectiveness)}&index=${encodeURIComponent(payload.followUpIndex || 0)}`;
      await clients.openWindow(url);
    }
  } catch (error) {
    console.error('Error broadcasting quick response:', error);
  }
}

self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: '/favicon.ico',
    data: data.data || {},
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction ?? true,
    actions: data.actions || [],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
