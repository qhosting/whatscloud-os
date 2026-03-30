import cron from 'node-cron';
import { Op } from 'sequelize';
import { CrmTask, Lead, User, Organization } from '../models/index.js';
import axios from 'axios';
import logger from '../config/logger.js';

export const startNotificationCron = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        logger.info('[CRON] Checking for overdue CRM Tasks...');
        try {
            const overdueTasks = await CrmTask.findAll({
                where: {
                    status: 'PENDING',
                    dueDate: { [Op.lt]: new Date() }
                },
                include: [
                    { model: Lead, attributes: ['businessName', 'phone'] },
                    { model: User, as: 'agent', attributes: ['email'] },
                    { model: Organization, attributes: ['name'] }
                ]
            });

            if (overdueTasks.length === 0) return;

            logger.info(`[CRON] Found ${overdueTasks.length} overdue tasks.`);

            const wahaUrl = process.env.WAHA_URL || 'http://localhost:3000';
            const wahaApiKey = process.env.WAHA_API_KEY || '';

            for (const task of overdueTasks) {
                // 1. WhatsApp Action (Via WAHA)
                // Fallback name to email if needed, no phone exists on User model yet
                const agentName = task.agent?.email?.split('@')[0] || 'Agente';
                if (task.agent && task.agent.phone) {
                    const messageText = `⚠️ *Aviso de Sistema PWA: Tarea Vencida*\n\nHola ${agentName}, tienes un seguimiento vencido:\n\n*Cliente:* ${task.Lead?.businessName || 'N/A'}\n*Tarea:* ${task.type} - ${task.title}\n*Venció:* ${task.dueDate.toLocaleString()}\n\nPor favor, ingresa a tu CRM PWA para actualizar el estado.`;
                    
                    try {
                        // Assuming session 'default' or org specific session
                        await axios.post(`${wahaUrl}/api/sendText`, {
                            session: 'default', // Using default session for employee notifications
                            chatId: `${task.agent.phone}@c.us`,
                            text: messageText
                        }, {
                            headers: wahaApiKey ? { 'X-Api-Key': wahaApiKey } : {}
                        });
                        logger.info(`[CRON] WhatsApp alert sent to ${task.agent.phone} for Task ${task.id}`);
                    } catch (e) {
                        logger.error(`[CRON] WAHA Notification failed for Task ${task.id} - ${e.message}`);
                    }
                }
                
                // 2. PWA Native Notification Hook (Frontend driven)
                // The frontend PWA will poll /api/crm/my-agenda and use the standard Notification API 
                // in the browser ServiceWorker to alert the user locally if status='PENDING' & dueDate < now.
            }

        } catch (error) {
            logger.error(`[CRON] Error in overdue tasks job: ${error.message}`);
        }
    });
};
