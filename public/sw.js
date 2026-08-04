self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'Ada pembaruan status pesanan Anda!',
    icon: '/icon-192.png',
    badge: '/badge.png',
    data: { 
      url: data.url || 'https://prinora.store/my-account?tab=orders' 
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Prinora Store', options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  
  const targetUrl = event.notification.data && event.notification.data.url 
    ? event.notification.data.url 
    : 'https://prinora.store/my-account?tab=orders';

  event.waitUntil(
    clients.openWindow(targetUrl)
  );
});