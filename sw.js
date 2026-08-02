// ============================================================
// 🚀 SHATT - Service Worker COMPLETO (Notificaciones + Offline)
// ============================================================

const CACHE_NAME = 'shatt-v3';
const OFFLINE_URL = '/pb_public/inicio.html';

// 📦 ARCHIVOS A CACHEAR (para que funcione offline)
const urlsToCache = [
  '/',
  '/pb_public/inicio.html',
  '/pb_public/mi-perfil.html',
  '/pb_public/perfil.html',
  '/pb_public/diario.html',
  '/pb_public/shatts.html',
  '/pb_public/me.html',
  '/pb_public/iniciarsesion.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// ============================================================
// 📥 INSTALACIÓN - Guarda archivos en caché
// ============================================================
self.addEventListener('install', event => {
  console.log('📥 Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Archivos cacheados');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// ============================================================
// 🔄 ACTIVACIÓN - Limpia cachés viejos
// ============================================================
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando caché viejo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// ============================================================
// 🌐 INTERCEPTAR PETICIONES - Sirve desde caché o internet
// ============================================================
self.addEventListener('fetch', event => {
  // Ignorar peticiones a PocketBase (API)
  if (event.request.url.includes('shatt-social-production.up.railway.app')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si está en caché, devolverlo
        if (response) {
          return response;
        }
        
        // Si no está en caché, buscar en internet
        return fetch(event.request)
          .then(response => {
            // No cachear respuestas que no son exitosas
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clonar la respuesta y guardarla en caché
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Si no hay internet y no está en caché, mostrar página offline
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// ============================================================
// 🔔 NOTIFICACIONES PUSH (TU CÓDIGO ORIGINAL MEJORADO)
// ============================================================
self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch(e) {
      data = { title: '📩 SHATTS', body: event.data.text() };
    }
  }
  
  const title = data.title || '📩 SHATTS';
  const options = {
    body: data.body || 'Tienes un nuevo mensaje',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/pb_public/shatts.html'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ============================================================
// 👆 CLIC EN NOTIFICACIÓN
// ============================================================
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/pb_public/shatts.html')
  );
});
