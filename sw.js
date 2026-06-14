// sw.js - Service Worker para SHATTS
self.addEventListener('push', function(event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { title: 'SHATTS', body: event.data.text() };
        }
    }

    const title = data.title || '📱 SHATTS';
    const options = {
        body: data.body || 'Tienes una nueva actividad',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const urlToOpen = event.notification.data.url;
    event.waitUntil(
        clients.openWindow(urlToOpen)
    );
});
