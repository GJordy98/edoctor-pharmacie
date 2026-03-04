'use client';

import { useEffect, useRef } from 'react';
import { getFcmToken, getFirebaseMessaging, onMessage } from '@/lib/firebase';
import { api } from '@/lib/api-client';

const FCM_TOKEN_KEY = 'fcm_token';

/**
 * Hook qui :
 * 1. Demande la permission de notification
 * 2. Récupère le token FCM
 * 3. L'envoie au backend (POST /api/v1/register-fcm-token/)
 * 4. Écoute les notifications en premier plan et les affiche via la Notifications API
 *
 * À utiliser dans un composant Client au plus haut niveau de l'arbre (ex. layout).
 */
export function useFcmToken() {
    const initialized = useRef(false);

    useEffect(() => {
        // Évite la double initialisation en mode développement (React StrictMode)
        if (initialized.current) return;
        initialized.current = true;

        async function initFcm() {
            // Vérifie le support navigateur
            if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
                console.warn('[FCM] Notifications push non supportées par ce navigateur.');
                return;
            }

            // Vérifie qu'un utilisateur est connecté (token d'accès présent)
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                console.info('[FCM] Aucun utilisateur connecté – FCM non initialisé.');
                return;
            }

            // Demande la permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.warn('[FCM] Permission de notification refusée.');
                return;
            }

            // Récupère le token FCM
            const token = await getFcmToken();
            if (!token) {
                console.error('[FCM] Impossible de récupérer le token FCM.');
                return;
            }

            // Enregistre le token côté backend uniquement s'il a changé
            const storedToken = localStorage.getItem(FCM_TOKEN_KEY);
            if (token !== storedToken) {
                try {
                    await api.registerFcmToken(token);
                    localStorage.setItem(FCM_TOKEN_KEY, token);
                    console.info('[FCM] Token enregistré avec succès.');
                } catch (err) {
                    console.error('[FCM] Erreur lors de l\'enregistrement du token :', err);
                }
            } else {
                console.info('[FCM] Token FCM déjà enregistré, pas de nouvel enregistrement.');
            }

            // Écoute les notifications en premier plan (app ouverte)
            try {
                const messaging = getFirebaseMessaging();
                onMessage(messaging, (payload) => {
                    console.log('[FCM] Notification reçue en premier plan :', payload);
                    const title = payload.notification?.title || 'Nouvelle notification';
                    const body = payload.notification?.body || '';
                    // Affiche une notification native si la permission est accordée
                    if (Notification.permission === 'granted') {
                        new Notification(title, {
                            body,
                            icon: '/images/brand-logos/desktop-logo.png',
                        });
                    }
                });
            } catch (err) {
                console.error('[FCM] Erreur lors de l\'écoute des messages en premier plan :', err);
            }
        }

        initFcm();
    }, []);
}
