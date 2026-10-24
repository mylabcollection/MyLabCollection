const CACHE_NAME = 'my-lab-collection-shell-v2-notifications';
const APP_SHELL = ['/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('my-lab-collection-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Keep the existing network-first navigation behavior and cache only the app shell.
  if (request.mode === 'navigate' || url.pathname === '/index.html') {
    event.respondWith(fetch(request).then(response => {
      if (response && response.ok) caches.open(CACHE_NAME).then(cache => cache.put('/index.html', response.clone()));
      return response;
    }).catch(() => caches.match('/index.html')));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
});
// Background push is handled only when a properly configured server sends Web Push.
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) { data = { body: event.data ? event.data.text() : '' }; }
  const title = String(data.title || 'My Lab Collection');
  const options = {
    body: String(data.body || 'You have a new notification.'),
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: String(data.tag || 'mlc-notification'),
    data: { url: typeof data.url === 'string' && data.url.startsWith('/') ? data.url : '/index.html' },
    renotify: false
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = event.notification.data && event.notification.data.url ? event.notification.data.url : '/index.html';
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const client of list) {
      if ('focus' in client) return client.navigate(target).then(c => c ? c.focus() : client.focus());
    }
    return self.clients.openWindow(target);
  }));
});
