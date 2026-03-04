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

    // 2. Chatwoot (Create contact)
    if (organization.chatwootUrl && organization.chatwootToken) {
        // Chatwoot API: POST /api/v1/accounts/{account_id}/contacts
        // This is a simplified example, usually needs accountId
        promises.push(
            axios.post(`${organization.chatwootUrl}/contacts`, {
                name: lead.name,
                phone_number: lead.phone,
                custom_attributes: {
                    niche: lead.niche,
                    city: lead.city,
                    source: 'WhatsCloud'
                }
            }, {
                headers: { 'api_access_token': organization.chatwootToken }
            }).catch(e => logger.error(`[Chatwoot] Export failed: ${e.message}`))
        );
    }

    // 3. ACC CRM (Generic Webhook)
    if (organization.accWebhookUrl) {
        promises.push(
            axios.post(organization.accWebhookUrl, {
                lead: {
                    fullName: lead.name,
                    phone: lead.phone,
                    location: lead.city,
                    industry: lead.niche
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
