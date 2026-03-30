import webpush from 'web-push';
import { PushSubscription, User } from '../models/index.js';
import logger from '../config/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
};

webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || 'admin@whatscloud.io'}`,
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

export const subscribe = async (req, res) => {
    try {
        const { subscription, deviceType } = req.body;
        const userId = req.user.id;

        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ error: 'Invalid subscription' });
        }

        // Check if this specific endpoint already exists for this user to avoid duplicates
        const existing = await PushSubscription.findOne({ 
            where: { userId, 'subscription.endpoint': subscription.endpoint } 
        });

        if (existing) {
            return res.json({ message: 'Already subscribed', id: existing.id });
        }

        const newSub = await PushSubscription.create({
            userId,
            subscription,
            deviceType: deviceType || 'Web/PWA'
        });

        res.status(201).json(newSub);
    } catch (error) {
        logger.error(`[PUSH] Subscription Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
};

export const sendTestNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const { message } = req.body;

        const subs = await PushSubscription.findAll({ where: { userId } });
        
        if (subs.length === 0) {
            return res.status(404).json({ error: 'No subscriptions found for this user' });
        }

        const payload = JSON.stringify({
            title: 'WhatsCloud Pro',
            body: message || '¡Esto es una notificación de prueba!',
            icon: '/logo.png',
            data: { url: '/dashboard/crm' }
        });

        const results = await Promise.all(subs.map(sub => 
            webpush.sendNotification(sub.subscription, payload)
                .catch(err => {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Subscription has expired or is no longer valid
                        sub.destroy();
                    }
                    throw err;
                })
        ));

        res.json({ success: true, count: results.length });
    } catch (error) {
        logger.error(`[PUSH] Send Test Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to send notification' });
    }
};

/**
 * Utility function to send notifications to a user from other controllers
 */
export const notifyUser = async (userId, data) => {
    try {
        const subs = await PushSubscription.findAll({ where: { userId } });
        const payload = JSON.stringify({
            title: data.title || 'Alerta WhatsCloud',
            body: data.body || 'Nuevo evento',
            icon: '/logo.png',
            data: { url: data.url || '/' }
        });

        for (const sub of subs) {
            webpush.sendNotification(sub.subscription, payload).catch(err => {
                if (err.statusCode === 410) sub.destroy();
            });
        }
    } catch (error) {
        logger.error(`[PUSH] NotifyUser Error: ${error.message}`);
    }
};
