import { User, Organization, CreditTransaction } from '../models/index.js';
import { sendLabsMobileSms } from '../services/smsService.js';
import logger from '../config/logger.js';
import { checkAndDeductQuota } from '../utils/billing.js';

export const createSmsCampaign = async (req, res) => {
    const { campaignName, message, audience, cost } = req.body;
    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    if (!message || !audience || audience.length === 0) {
        return res.status(400).json({ error: 'Missing campaign data' });
    }

    try {
        const user = await User.findByPk(userId);
        const org = await Organization.findByPk(organizationId);

        // Process sequentially (could be backgrounded, but for now simple)
        for (const lead of audience) {
            try {
                // --- BILLING: Check Quota per SMS ---
                const quota = await checkAndDeductQuota(organizationId, 'sms', 1);
                if (!quota.success) {
                    logger.warn(`[BILLING] SMS quota reached for org ${organizationId}: ${quota.error}`);
                    failCount++;
                    continue; // Stop or continue? Let's continue for those already processed if any, but better fail remaining
                }

                // Replace variables in message
                let sanitizedMessage = message
                    .replace(/{{nombre_negocio}}/g, lead.name || 'Cliente')
                    .replace(/{{telefono}}/g, lead.phone || '');

                await sendLabsMobileSms(org, lead.phone, sanitizedMessage);
                sentCount++;
            } catch (err) {
                logger.error(`[SMS-CAMPAIGN] Failed for ${lead.phone}: ${err.message}`);
                failCount++;
            }
        }

        // Log transaction
        await CreditTransaction.create({
            amount: -cost,
            type: 'DEDUCTION',
            description: `Campaña SMS: ${campaignName} (${sentCount} enviados)`,
            userId,
            organizationId
        });

        res.json({
            success: true,
            message: `Campaña finalizada: ${sentCount} enviados, ${failCount} fallidos.`,
            remainingCredits: user.credits - cost
        });

    } catch (error) {
        logger.error(`[SMS-CAMPAIGN] Global Error: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
};
