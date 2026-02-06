// ============================================
// FIREBASE MESSAGING SERVICE WORKER
// Web Push Notifications - OS Level Banners
// ============================================

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAr8rU1Bqwx_ZczoMWuRkWGvGxN3jTlg38",
  authDomain: "e-dr-tim-pharmacy.firebaseapp.com",
  projectId: "e-dr-tim-pharmacy",
  storageBucket: "e-dr-tim-pharmacy.firebasestorage.app",
  messagingSenderId: "412254956944",
  appId: "1:412254956944:web:60d385128056eb8b3cd715",
  measurementId: "G-KWSQ9YZDEN"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

console.log('[SW] 🚀 Firebase Messaging Service Worker initialized');

// ============================================
// BACKGROUND MESSAGE HANDLER
// ============================================

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] 📨 Received background message:', payload);

  // Extract notification data
  const notificationTitle = payload.notification?.title || payload.data?.title || 'e-Dr TIM Pharmacy';
  const notificationBody = payload.notification?.body || payload.data?.body || 'Vous avez une nouvelle notification';

  // CRITICAL: Notification options for OS-level banner
  const notificationOptions = {
    body: notificationBody,
    icon: '/assets/img/image.png', // App icon
    badge: '/assets/img/badge.png', // Small badge icon
    image: payload.notification?.image || payload.data?.image, // Large image (optional)
    vibrate: [200, 100, 200], // Vibration pattern
    tag: 'pharmacy-notification', // Overwrites previous notifications with same tag
    requireInteraction: true, // Keeps notification visible until user dismisses (desktop)
    renotify: true, // Vibrate/sound even if replacing notification
    silent: false, // Play sound

    // Data to pass to notification click handler
    data: {
      url: payload.data?.url || payload.fcmOptions?.link || '/view/index.html',
      orderId: payload.data?.orderId,
      pharmacyId: payload.data?.pharmacyId,
      timestamp: Date.now(),
      ...payload.data
    },

    // Action buttons (optional - shows in some OS notifications)
    actions: [
      {
        action: 'open',
        title: 'Ouvrir',
        icon: '/assets/img/open-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Ignorer',
        icon: '/assets/img/close-icon.png'
      }
    ]
  };

  console.log('[SW] 🔔 Showing notification:', {
    title: notificationTitle,
    options: notificationOptions
  });

  // CRITICAL: Use self.registration.showNotification for OS banner
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ============================================
// NOTIFICATION CLICK HANDLER
// ============================================

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 🖱️ Notification clicked:', event);

  // Close the notification
  event.notification.close();

  // Get the URL to open from notification data
  const urlToOpen = event.notification.data?.url || '/view/index.html';
  const fullUrl = new URL(urlToOpen, self.location.origin).href;

  console.log('[SW] 🌐 Opening URL:', fullUrl);

  // Handle action button clicks
  if (event.action === 'dismiss') {
    console.log('[SW] 👋 User dismissed notification');
    return;
  }

  // CRITICAL: Open or focus the app window
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      console.log('[SW] 📱 Found', clientList.length, 'client window(s)');

      // Check if there's already a window open with the app
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];

        // If window is already open, focus it and navigate
        if (client.url.includes(self.location.origin)) {
          console.log('[SW] ✅ Focusing existing window:', client.url);

          // Navigate to the URL
          if ('navigate' in client) {
            client.navigate(fullUrl);
          }

          // Focus the window
          return client.focus();
        }
      }

      // If no window is open, open a new one
      console.log('[SW] 🆕 Opening new window:', fullUrl);
      return clients.openWindow(fullUrl);
    })
  );
});

// ============================================
// INSTALL & ACTIVATE HANDLERS
// ============================================

self.addEventListener('install', (event) => {
  console.log('[SW] ⚙️ Service Worker installing...');
  self.skipWaiting(); // Activate immediately
});

self.addEventListener('activate', (event) => {
  console.log('[SW] ✅ Service Worker activated');
  event.waitUntil(clients.claim()); // Take control of all clients immediately
});

console.log('[SW] ✅ Service Worker script loaded');
