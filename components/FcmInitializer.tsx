'use client';

import { useFcmToken } from '@/hooks/useFcmToken';

/**
 * Composant sans rendu visuel — monte le hook useFcmToken
 * côté client pour initialiser Firebase Cloud Messaging.
 * Placé dans le layout racine pour couvrir toute l'application.
 */
export default function FcmInitializer() {
    useFcmToken();
    return null;
}
