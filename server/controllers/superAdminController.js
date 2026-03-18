import { Organization, User, CreditTransaction } from '../models/index.js';
import { sequelize } from '../config/database.js';
import logger from '../config/logger.js';

// GET ALL ORGANIZATIONS (TENANTS)
export const getAllOrganizations = async (req, res) => {
    try {
        const orgs = await Organization.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(orgs);
    } catch (e) {
        logger.error(`[SUPER-ADMIN] List Orgs Error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
};

// GET ALL USERS
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            include: [{ model: Organization, as: 'organization' }],
            order: [['createdAt', 'DESC']]
        });
        res.json(users);
    } catch (e) {
        logger.error(`[SUPER-ADMIN] List Users Error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
};

// UPDATE ORGANIZATION (Plan, Status, etc)
export const updateOrganization = async (req, res) => {
    const { id } = req.params;
    const { plan, status, n8nWebhookUrl, amiHost } = req.body;
    try {
        const org = await Organization.findByPk(id);
        if (!org) return res.status(404).json({ error: 'Org not found' });

        await org.update({ 
            plan: plan || org.plan, 
            status: status || org.status,
            n8nWebhookUrl: n8nWebhookUrl !== undefined ? n8nWebhookUrl : org.n8nWebhookUrl,
            amiHost: amiHost !== undefined ? amiHost : org.amiHost
        });

        res.json({ message: 'Organization updated', org });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// ADJUST CREDITS MANUALLY (SUPER ADMIN POWER)
export const adjustUserCredits = async (req, res) => {
    const { userId, amount, reason } = req.body;
    const t = await sequelize.transaction();

    try {
        const user = await User.findByPk(userId, { transaction: t });
        if (!user) {
            await t.rollback();
            return res.status(404).json({ error: 'User not found' });
        }

        const oldCredits = user.credits;
        const newCredits = oldCredits + amount;
        
        await user.update({ credits: newCredits }, { transaction: t });

        await CreditTransaction.create({
            userId,
            organizationId: user.organizationId,
            amount,
            type: amount > 0 ? 'ADJUSTMENT_ADD' : 'ADJUSTMENT_SUB',
            description: reason || 'Manual adjustment by SuperAdmin'
        }, { transaction: t });

        await t.commit();
        res.json({ message: 'Credits adjusted', userId, oldCredits, newCredits });
    } catch (e) {
        await t.rollback();
        logger.error(`[SUPER-ADMIN] Credit Adjust Error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
};
