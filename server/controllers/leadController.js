import { Lead } from '../models/index.js';

/**
 * @openapi
 * /api/leads:
 *   get:
 *     summary: Retrieve a paginated list of leads
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: niche
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A paginated list of leads
 */
export const getLeads = async (req, res) => {
    try {
        const { page = 1, limit = 20, niche, city } = req.query;
        const offset = (page - 1) * limit;

        const where = { organizationId: req.user.organizationId };
        if (niche) where.niche = niche;
        if (city) where.city = city;

        const { count, rows } = await Lead.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            leads: rows
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

/**
 * @openapi
 * /api/leads/{id}:
 *   get:
 *     summary: Get lead details
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lead details
 *       404:
 *         description: Lead not found
 */
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

/**
 * @openapi
 * /api/leads/{id}:
 *   delete:
 *     summary: Delete a lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lead deleted successfully
 */
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
