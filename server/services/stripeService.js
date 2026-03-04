import Stripe from 'stripe';
import logger from '../config/logger.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (org, priceId) => {
    try {
        const session = await stripe.checkout.sessions.create({
            customer: org.stripeCustomerId || undefined,
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/billing`,
            metadata: { organizationId: org.id }
        });

        logger.info(`[STRIPE] Checkout Session created: ${session.id} for Org ${org.id}`);
        return session;
    } catch (error) {
        logger.error(`[STRIPE] Session Error: ${error.message}`);
        throw error;
    }
};

export const handleStripeWebhook = async (event) => {
    const { Organization } = await import('../models/index.js');

    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const orgId = session.metadata.organizationId;
            await Organization.update({
                stripeCustomerId: session.customer,
                stripeSubscriptionId: session.subscription,
                subscriptionStatus: 'active',
                plan: 'PRO' // Default upgrade
            }, { where: { id: orgId } });
            logger.info(`[STRIPE] Organization ${orgId} upgraded to PRO`);
            break;

        case 'customer.subscription.deleted':
            const sub = event.data.object;
            await Organization.update({
                subscriptionStatus: 'cancelled',
                plan: 'FREE'
            }, { where: { stripeSubscriptionId: sub.id } });
            logger.info(`[STRIPE] Subscription ${sub.id} cancelled`);
            break;
    }
};
