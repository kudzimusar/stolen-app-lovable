// Service Worker for STOLEN App - PWA Support
const CACHE_NAME = 'stolen-app-v2';
const STATIC_CACHE_NAME = 'stolen-app-static-v2';
const DYNAMIC_CACHE_NAME = 'stolen-app-dynamic-v2';

// Core app routes and assets to cache
const urlsToCache = [
  '/',
  '/dashboard',
  '/register',
  '/login',
  '/my-devices',
  '/register-device',
  '/check-device',
  '/marketplace',
  '/lost-found-report',
  '/community-board',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/badge-72x72.png',
  '/manifest.json'
];

// Install event - Cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(urlsToCache).catch((error) => {
          console.error('[Service Worker] Cache failed:', error);
          // Continue even if some files fail to cache
        });
      })
      .then(() => {
        // Force activation of new service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME && cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - Network first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (except for API calls we want to cache)
  if (url.origin !== location.origin && !url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache dynamic content
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                // Only cache GET requests and same-origin requests
                if (request.method === 'GET' && url.origin === location.origin) {
                  cache.put(request, responseToCache);
                }
              });

            return response;
          })
          .catch(() => {
            // Network failed, return offline page if available
            if (request.headers.get('accept').includes('text/html')) {
              return caches.match('/');
            }
          });
      })
  );
});

// Push event
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Lost & Found Update', body: event.data.text() };
    }
  }

  const options = {
    body: data.body || 'New update from STOLEN',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: data.tag || 'stolen-app-update',
    data: data.data || {},
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    vibrate: data.vibrate || [200, 100, 200],
    timestamp: Date.now(),
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon-192x192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Lost & Found Update', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Determine URL to open based on notification data
  let urlToOpen = '/dashboard';
  
  if (event.notification.data) {
    if (event.notification.data.url) {
      urlToOpen = event.notification.data.url;
    } else if (event.notification.data.reportId) {
      urlToOpen = `/community-board#report-${event.notification.data.reportId}`;
    } else if (event.notification.data.deviceId) {
      urlToOpen = `/device/${event.notification.data.deviceId}`;
    } else if (event.notification.data.listingId) {
      urlToOpen = `/marketplace/${event.notification.data.listingId}`;
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'lost-found-sync') {
    event.waitUntil(
      // Sync lost/found reports when back online
      syncLostFoundReports()
    );
  }
});

async function syncLostFoundReports() {
  try {
    // Get pending reports from IndexedDB
    const pendingReports = await getPendingReports();
    
    for (const report of pendingReports) {
      try {
        await fetch('/api/v1/lost-found/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${report.authToken}`
          },
          body: JSON.stringify(report.data)
        });
        
        // Remove from pending after successful sync
        await removePendingReport(report.id);
      } catch (error) {
        console.error('Failed to sync report:', error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// IndexedDB helpers for offline storage
async function getPendingReports() {
  // Implementation would use IndexedDB to get pending reports
  return [];
}

async function removePendingReport(id) {
  // Implementation would remove report from IndexedDB
  return true;
}
