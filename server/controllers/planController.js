import { SubscriptionPlan, Organization } from '../models/index.js';
import logger from '../config/logger.js';

export const getAllPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.findAll({
            order: [['price', 'ASC']]
        });
        res.json(plans);
    } catch (e) {
        logger.error(`[SUPER-ADMIN] List Plans Error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
};

export const createPlan = async (req, res) => {
    try {
        const { name, price, limits, isActive } = req.body;
        
        const newPlan = await SubscriptionPlan.create({
            name,
            price: price || 0,
            limits: limits || {},
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json(newPlan);
    } catch (e) {
        logger.error(`[SUPER-ADMIN] Create Plan Error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
};

export const updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, limits, isActive } = req.body;

        const plan = await SubscriptionPlan.findByPk(id);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        await plan.update({
            name: name || plan.name,
            price: price !== undefined ? price : plan.price,
            limits: limits || plan.limits,
            isActive: isActive !== undefined ? isActive : plan.isActive
        });

        res.json(plan);
    } catch (e) {
        logger.error(`[SUPER-ADMIN] Update Plan Error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
};

export const deletePlan = async (req, res) => {
    try {
        const { id } = req.params;

        const plan = await SubscriptionPlan.findByPk(id);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        // Verification: Ensure no active orgs are using this plan before deletion
        const orgsUsingPlan = await Organization.count({ where: { subscriptionPlanId: id } });
        if (orgsUsingPlan > 0) {
            return res.status(400).json({ error: 'Cannot delete plan because there are organizations currently subscribed to it.' });
        }

        await plan.destroy();
        res.json({ success: true, message: 'Plan deleted' });
    } catch (e) {
        logger.error(`[SUPER-ADMIN] Delete Plan Error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
};
