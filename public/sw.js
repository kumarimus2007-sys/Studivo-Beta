// Studivo Service Worker for Push Notifications and Offline Support
const CACHE_NAME = 'studivo-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push Notifications
self.addEventListener('push', (event) => {
  let data = {
    title: 'Studivo Notification',
    body: 'You have a new update from Studivo!',
    icon: '/icon-512.png',
    badge: '/icon-512.png',
    url: 'https://mantechion.alc.onl/studivo/app/dashboard.php'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-512.png',
    badge: data.badge || '/icon-512.png',
    image: data.image,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || 'https://mantechion.alc.onl/studivo/app/dashboard.php',
      dateOfArrival: Date.now()
    },
    actions: [
      { action: 'open_app', title: 'Open Studivo' },
      { action: 'close', title: 'Dismiss' }
    ],
    tag: data.tag || 'studivo-notification',
    renotify: true,
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) 
    ? event.notification.data.url 
    : 'https://mantechion.alc.onl/studivo/app/dashboard.php';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('studivo') || client.url.includes(self.location.origin)) {
          if ('focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
