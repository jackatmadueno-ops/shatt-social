importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyB2NqLgdLYhO6oouvulQyyuz0u-MwZmmnY",
    authDomain: "shatt-b92e1.firebaseapp.com",
    projectId: "shatt-b92e1",
    storageBucket: "shatt-b92e1.firebasestorage.app",
    messagingSenderId: "583744258749",
    appId: "1:583744258749:web:5d9d46285143ebf8d06dd4",
    measurementId: "G-KHSWMTQKV6"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('📩 Notificación en segundo plano:', payload);
    const notificationTitle = payload.notification?.title || 'SHATTS';
    const notificationOptions = {
        body: payload.notification?.body || 'Tienes un nuevo mensaje',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200]
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
