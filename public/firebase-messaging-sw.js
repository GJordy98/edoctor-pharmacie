// Service Worker Firebase Messaging
// Ce fichier DOIT se trouver à la racine de /public pour être servi à l'URL /firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuration Firebase (dupliquée ici car les Service Workers n'ont pas accès aux variables d'env Next.js)
firebase.initializeApp({
    apiKey: 'AIzaSyDttvXdza5YXxz84r-5BIfcvy7Xhbvmb-Y',
    authDomain: 'e-dr-pharma-fcm.firebaseapp.com',
    projectId: 'e-dr-pharma-fcm',
    storageBucket: 'e-dr-pharma-fcm.firebasestorage.app',
    messagingSenderId: '42167148530',
    appId: '1:42167148530:web:aa5b1fbee26a5ba29c156b',
});

const messaging = firebase.messaging();

// Gestion des notifications reçues en arrière-plan (app minimisée / onglet fermé)
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Notification reçue en arrière-plan :', payload);

    const notificationTitle = payload.notification?.title || 'Nouvelle notification';
    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/images/brand-logos/desktop-logo.png',
        badge: '/images/brand-logos/toggle-logo.png',
        data: payload.data || {},
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
