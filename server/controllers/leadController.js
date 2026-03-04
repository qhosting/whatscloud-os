import { Lead } from '../models/index.js';

export const getLeads = async (req, res) => {
    try {
        const leads = await Lead.findAll({
            where: { organizationId: req.user.organizationId },
            order: [['createdAt', 'DESC']]
        });
        res.json(leads);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getLeadDetail = async (req, res) => {
    const { id } = req.params;
    try {
        const lead = await Lead.findOne({
            where: { id, organizationId: req.user.organizationId }
        });
        if (!lead) return res.status(404).json({ error: 'Lead not found' });
        res.json(lead);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const deleteLead = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await Lead.destroy({
            where: { id, organizationId: req.user.organizationId }
        });
        res.json({ success: !!deleted });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
