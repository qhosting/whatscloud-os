import cron from 'node-cron';
import { Lead } from '../models/index.js';
import { notifyFollowUp } from './notificationService.js';
import logger from '../config/logger.js';
import { Op } from 'sequelize';

export const initCrons = () => {
    // Run every day at 10 AM (Follow-up Check)
    cron.schedule('0 10 * * *', async () => {
        logger.info('CRM: Checking for due follow-ups...');
        
        try {
            const today = new Date();
            const startOfDay = new Date(today.setHours(0,0,0,0));
            const endOfDay = new Date(today.setHours(23,59,59,999));

            const dueLeads = await Lead.findAll({
                where: {
                    followUpDate: {
                        [Op.between]: [startOfDay, endOfDay]
                    },
                    status: {
                        [Op.notIn]: ['WON', 'LOST']
                    }
                }
            });

            for (const lead of dueLeads) {
                await notifyFollowUp(lead);
                logger.info(`CRM: Notified follow-up for ${lead.businessName}`);
            }
        } catch (e) {
            logger.error(`CRM: Cron follow-up failed: ${e.message}`);
        }
    });

    logger.info('Crons initialized: Daily 10 AM follow-up notification.');
};
