// Service Worker for Lost and Found Push Notifications
const CACHE_NAME = 'stolen-app-v1';
const urlsToCache = [
  '/',
  '/community-board',
  '/lost-found-report',
  '/icon-192x192.png',
  '/badge-72x72.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
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
    body: data.body || 'New lost or found device report',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: data.tag || 'lost-found-update',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View Report',
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

  // Default action or 'view' action
  const urlToOpen = event.notification.data?.reportId 
    ? `/community-board#report-${event.notification.data.reportId}`
    : '/community-board';

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
