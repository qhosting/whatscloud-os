import axios from 'axios';
import logger from '../config/logger.js';

/**
 * Sends lead data to multiple configured webhooks.
 */
export const exportLeadToIntegrations = async (lead, organization) => {
    const promises = [];

    // 1. n8n
    if (organization.n8nWebhookUrl) {
        promises.push(
            axios.post(organization.n8nWebhookUrl, {
                event: 'lead_captured',
                source: 'google_maps',
                data: lead,
                orgId: organization.id
            }).catch(e => logger.error(`[n8n] Export failed: ${e.message}`))
        );
    }

    // 2. ACC CRM (Generic Webhook)
    if (organization.accWebhookUrl) {
        // Enviar payload extendido con metadata de LeadScrapper
        promises.push(
            axios.post(organization.accWebhookUrl, {
                lead: {
                    fullName: lead.businessName || lead.name,
                    phone: lead.phone,
                    email: lead.email,
                    location: lead.city,
                    industry: lead.niche,
                    metrics: {
                        aiScore: lead.aiScore,
                        rating: lead.rating,
                        reviews: lead.reviews
                    },
                    socials: lead.metadata?.socials || {},
                    website: lead.website
                }
            }).catch(e => logger.error(`[ACC] Export failed: ${e.message}`))
        );
    }

    if (promises.length > 0) {
        logger.info(`[WEBHOOK] Exporting Lead ${lead.id} to ${promises.length} integrations...`);
        await Promise.all(promises);
    }
};

/**
 * Webhook for incoming events FROM n8n (Bidirectional)
 */
export const handleN8nIncoming = async (req, res) => {
    const { action, leadId, orgId } = req.body;
    logger.info(`[WEBHOOK] Received action from n8n: ${action} for lead ${leadId}`);

    // Future: implement logic to update lead status, start WA conversation, etc.
    res.json({ success: true, message: 'Action received from n8n' });
};
