import { useState, useEffect } from 'react';
import { accService } from '../services/accService';

export const usePushNotifications = () => {
    const [permission, setPermission] = useState<NotificationPermission>(
        typeof window !== 'undefined' ? Notification.permission : 'default'
    );

    const subscribeUser = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push messaging is not supported in this browser');
            return;
        }

        try {
            // Wait for service worker to be ready
            const registration = await navigator.serviceWorker.ready;

            // Get VAPID public key from environment
            const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            
            if (!publicKey) {
                console.error('VITE_VAPID_PUBLIC_KEY not found in environment');
                return;
            }

            // Check if already subscribed
            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                // Subscribe the user
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey)
                });
                console.log('[PUSH] New Subscription created:', subscription);
            }

            // Send subscription to backend
            await accService.subscribeToPush(subscription);
            setPermission(Notification.permission);
            
            return true;
        } catch (error) {
            console.error('[PUSH] Failed to subscribe:', error);
            return false;
        }
    };

    // Helper to convert VAPID key
    function urlBase64ToUint8Array(base64String: string) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    return { permission, subscribeUser };
};
