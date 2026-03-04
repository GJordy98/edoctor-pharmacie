import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDttvXdza5YXxz84r-5BIfcvy7Xhbvmb-Y',
    authDomain: 'e-dr-pharma-fcm.firebaseapp.com',
    projectId: 'e-dr-pharma-fcm',
    storageBucket: 'e-dr-pharma-fcm.firebasestorage.app',
    messagingSenderId: '42167148530',
    appId: '1:42167148530:web:aa5b1fbee26a5ba29c156b',
};

// Singleton – évite de réinitialiser Firebase plusieurs fois (Next.js hot-reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/**
 * Retourne l'instance Messaging Firebase.
 * Doit être appelée côté client seulement (window doit être défini).
 */
export function getFirebaseMessaging(): Messaging {
    if (typeof window === 'undefined') {
        throw new Error('Firebase Messaging est uniquement disponible côté client.');
    }
    return getMessaging(app);
}

/**
 * Récupère le token FCM pour l'appareil courant.
 * Nécessite que l'utilisateur ait accordé la permission de notification.
 */
export async function getFcmToken(): Promise<string | null> {
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
        console.error('[FCM] NEXT_PUBLIC_FIREBASE_VAPID_KEY est manquant dans .env.local');
        return null;
    }
    try {
        const messaging = getFirebaseMessaging();
        const token = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js'),
        });
        return token || null;
    } catch (error) {
        console.error('[FCM] Impossible de récupérer le token FCM :', error);
        return null;
    }
}

export { onMessage, getMessaging, app as firebaseApp };
