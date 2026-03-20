/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

declare const self: ServiceWorkerGlobalScope

// Cleanup outdated caches
cleanupOutdatedCaches()

// Precache and route files
precacheAndRoute(self.__WB_MANIFEST)

// Cache Firebase API calls with network-first strategy
registerRoute(
  ({ url }) => url.origin === 'https://firestore.googleapis.com' || url.origin === 'https://identitytoolkit.googleapis.com',
  new NetworkFirst({
    cacheName: 'firebase-api',
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
)

// Cache images and fonts
registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'font',
  new CacheFirst({
    cacheName: 'assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
)

// Cache CSS and JS with stale-while-revalidate
registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'script',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
)

// Handle offline navigation to index.html
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'navigate',
    networkTimeoutSeconds: 3,
  })
)

// Background sync for failed mutations
self.addEventListener('sync', (event: Event) => {
  const syncEvent = event as (ExtendableEvent & { tag?: string })
  if (syncEvent.tag === 'sync-progress') {
    syncEvent.waitUntil(
      (async () => {
        try {
          const clients = await self.clients.matchAll();
          clients.forEach((client) =>
            client.postMessage({ type: 'SYNC_REQUESTED' })
          );
        } catch (err) {
          console.error('Error during background sync:', err)
        }
      })()
    );
  }
})

// Handle push notifications
self.addEventListener('push', (event: PushEvent) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/img/icon-192x192.png',
      badge: '/img/icon-192x192.png',
    }
    event.waitUntil(
      self.registration.showNotification('Goal Tracker', options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      // Focus existing window if open, otherwise open new one
      for (const client of clients) {
        if (client.type === 'window' && client.url === '/' && 'focus' in client) {
          return (client as WindowClient).focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/')
      }
    })
  )
})

// Handle messages from main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
