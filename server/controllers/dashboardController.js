import { Lead, CreditTransaction, User } from '../models/index.js';
import { sequelize } from '../config/database.js';

/**
 * @openapi
 * /api/dashboard/stats:
 *   get:
 *     summary: Retrieve aggregate statistics for the dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
export const getStats = async (req, res) => {
    try {
        const organizationId = req.user.organizationId;

        // 1. Total Leads
        const totalLeads = await Lead.count({ where: { organizationId } });

        // 2. High Quality Leads (Score > 80)
        const highQualityLeads = await Lead.count({ 
            where: { 
                organizationId,
                aiScore: { [sequelize.Sequelize.Op.gte]: 80 }
            } 
        });

        // 3. Recent Leads (Last 24h)
        const ONE_DAY = 24 * 60 * 60 * 1000;
        const recentLeads = await Lead.count({
            where: {
                organizationId,
                createdAt: { [sequelize.Sequelize.Op.gte]: new Date(Date.now() - ONE_DAY) }
            }
        });

        // 4. Credits Remaining
        const user = await User.findByPk(req.user.id);
        const credits = user?.credits || 0;

        // 5. Leads by Niche (Top 5)
        const leadsByNiche = await Lead.findAll({
            where: { organizationId },
            attributes: [
                'niche',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['niche'],
            order: [[sequelize.literal('count'), 'DESC']],
            limit: 5,
            raw: true
        });

        res.json({
            summary: {
                totalLeads,
                highQualityLeads,
                recentLeads,
                creditsRemaining: credits
            },
            charts: {
                leadsByNiche
            }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
