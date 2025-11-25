// Service Worker for STOLEN App - PWA Support
const CACHE_NAME = 'stolen-app-v2';
const STATIC_CACHE_NAME = 'stolen-app-static-v2';
const DYNAMIC_CACHE_NAME = 'stolen-app-dynamic-v2';

// Core app routes and assets to cache (with base path)
const BASE_PATH = '/stolen-app-lovable';
const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/dashboard`,
  `${BASE_PATH}/register`,
  `${BASE_PATH}/login`,
  `${BASE_PATH}/my-devices`,
  `${BASE_PATH}/register-device`,
  `${BASE_PATH}/check-device`,
  `${BASE_PATH}/marketplace`,
  `${BASE_PATH}/lost-found-report`,
  `${BASE_PATH}/community-board`,
  `${BASE_PATH}/icon-192x192.png`,
  `${BASE_PATH}/icon-512x512.png`,
  `${BASE_PATH}/badge-72x72.png`,
  `${BASE_PATH}/manifest.json`
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
              return caches.match(`${BASE_PATH}/`);
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
    icon: '/stolen-app-lovable/icon-192x192.png',
    badge: '/stolen-app-lovable/badge-72x72.png',
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
  let urlToOpen = `${BASE_PATH}/dashboard`;
  
  if (event.notification.data) {
    if (event.notification.data.url) {
      urlToOpen = event.notification.data.url.startsWith('/') 
        ? `${BASE_PATH}${event.notification.data.url}`
        : event.notification.data.url;
    } else if (event.notification.data.reportId) {
      urlToOpen = `${BASE_PATH}/community-board#report-${event.notification.data.reportId}`;
    } else if (event.notification.data.deviceId) {
      urlToOpen = `${BASE_PATH}/device/${event.notification.data.deviceId}`;
    } else if (event.notification.data.listingId) {
      urlToOpen = `${BASE_PATH}/marketplace/${event.notification.data.listingId}`;
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

// Periodic Background Sync - Sync data at regular intervals
self.addEventListener('periodicsync', (event) => {
  console.log('[Service Worker] Periodic sync event:', event.tag);
  
  if (event.tag === 'device-status-sync') {
    event.waitUntil(
      syncDeviceStatus()
    );
  } else if (event.tag === 'notifications-sync') {
    event.waitUntil(
      syncNotifications()
    );
  } else if (event.tag === 'marketplace-updates') {
    event.waitUntil(
      syncMarketplaceUpdates()
    );
  }
});

// Periodic sync functions
async function syncDeviceStatus() {
  try {
    console.log('[Service Worker] Syncing device status...');
    // Sync device status updates
    const response = await fetch(`${BASE_PATH}/api/v1/devices/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // Update cache with latest device status
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cache.put(`${BASE_PATH}/api/v1/devices/status`, response.clone());
      console.log('[Service Worker] Device status synced successfully');
    }
  } catch (error) {
    console.error('[Service Worker] Failed to sync device status:', error);
  }
}

async function syncNotifications() {
  try {
    console.log('[Service Worker] Syncing notifications...');
    // Sync pending notifications
    const response = await fetch(`${BASE_PATH}/api/v1/notifications/pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const notifications = await response.json();
      // Process and display notifications
      for (const notification of notifications) {
        self.registration.showNotification(notification.title, {
          body: notification.body,
          icon: `${BASE_PATH}/icon-192x192.png`,
          badge: `${BASE_PATH}/badge-72x72.png`,
          tag: notification.id,
          data: notification.data
        });
      }
      console.log('[Service Worker] Notifications synced successfully');
    }
  } catch (error) {
    console.error('[Service Worker] Failed to sync notifications:', error);
  }
}

async function syncMarketplaceUpdates() {
  try {
    console.log('[Service Worker] Syncing marketplace updates...');
    // Sync marketplace listings and updates
    const response = await fetch(`${BASE_PATH}/api/v1/marketplace/updates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const updates = await response.json();
      // Update cache with latest marketplace data
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cache.put(`${BASE_PATH}/api/v1/marketplace/updates`, response.clone());
      console.log('[Service Worker] Marketplace updates synced successfully');
    }
  } catch (error) {
    console.error('[Service Worker] Failed to sync marketplace updates:', error);
  }
}

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
