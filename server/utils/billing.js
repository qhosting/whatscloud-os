import { Organization } from '../models/Organization.js';
import { SubscriptionPlan } from '../models/SubscriptionPlan.js';
import logger from '../config/logger.js';

/**
 * Deducts technical quota from an organization.
 * @param {string} organizationId 
 * @param {'waMessages' | 'sms' | 'leads' | 'pbxMinutes'} type 
 * @param {number} amount 
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const checkAndDeductQuota = async (organizationId, type, amount = 1) => {
    try {
        const org = await Organization.findByPk(organizationId, {
            include: [{ model: SubscriptionPlan, as: 'SubscriptionPlan' }]
        });

        if (!org) return { success: false, error: 'Organization not found' };

        // If no plan, assume FREE limits (managed by the DB default if we want, or here)
        let limits = org.SubscriptionPlan?.limits || {};
        
        // Map types to limit keys
        const limitMap = {
            waMessages: 'maxWaMessages',
            sms: 'maxSms',
            leads: 'maxLeads',
            pbxMinutes: 'maxPbxMinutes'
        };

        const usageMap = {
            waMessages: 'waUsage',
            sms: 'smsUsage',
            leads: 'leadsUsage',
            pbxMinutes: 'pbxUsage'
        };

        const limitKey = limitMap[type];
        const usageKey = usageMap[type];

        const maxAllowed = limits[limitKey] || 0;
        const currentUsage = org[usageKey] || 0;

        // Check if unlimited (999999 or similar convention)
        if (maxAllowed >= 900000) {
            await org.increment(usageKey, { by: amount });
            return { success: true };
        }

        if (currentUsage + amount > maxAllowed) {
            logger.warn(`[BILLING] Org ${organizationId} reached ${type} limit (${currentUsage}/${maxAllowed})`);
            return { success: false, error: `Límite de ${type} alcanzado (${maxAllowed}). Por favor mejora tu plan.` };
        }

        // Deduct/Increment usage
        await org.increment(usageKey, { by: amount });
        
        return { success: true };
    } catch (e) {
        logger.error(`[BILLING] Error deducting quota: ${e.message}`);
        return { success: false, error: 'Internal billing error' };
    }
};
