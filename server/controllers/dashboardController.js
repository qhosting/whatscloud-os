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

        // 6. Lead Volume Last 7 Days (Time Series)
        const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
        const leadVolumeHistory = await Lead.findAll({
            where: {
                organizationId,
                createdAt: { [sequelize.Sequelize.Op.gte]: new Date(Date.now() - SEVEN_DAYS) }
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
            raw: true
        });
 
        // 6.5 Leads by Niche
        const leadsByNiche = await Lead.findAll({
            where: { organizationId },
            attributes: [
                ['niche', 'niche'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['niche'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            limit: 5,
            raw: true
        });

        // 7. AI Score Distribution
        const scoreRanges = [
            { label: '0-20', min: 0, max: 20 },
            { label: '21-40', min: 21, max: 40 },
            { label: '41-60', min: 41, max: 60 },
            { label: '61-80', min: 61, max: 80 },
            { label: '81-100', min: 81, max: 100 }
        ];

        const scoreDistribution = await Promise.all(scoreRanges.map(async (range) => {
            const count = await Lead.count({
                where: {
                    organizationId,
                    aiScore: { [sequelize.Sequelize.Op.between]: [range.min, range.max] }
                }
            });
            return { name: range.label, value: count };
        }));

        // 8. Leads by Status
        const leadsByStatus = await Lead.findAll({
            where: { organizationId },
            attributes: [
                ['status', 'status'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        // 9. Overdue Follow-ups
        const overdueFollowUps = await Lead.count({
            where: {
                organizationId,
                followUpDate: { [sequelize.Sequelize.Op.lt]: new Date() },
                status: { [sequelize.Sequelize.Op.notIn]: ['WON', 'LOST'] }
            }
        });

        res.json({
            summary: {
                totalLeads,
                highQualityLeads,
                recentLeads,
                creditsRemaining: credits,
                overdueFollowUps,
                estimatedROI: highQualityLeads * 250
            },
            charts: {
                leadsByNiche,
                leadVolumeHistory,
                scoreDistribution,
                leadsByStatus
            }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
