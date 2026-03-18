import axios from 'axios';
import logger from '../config/logger.js';

export const sendWahaMessage = async (phone, text) => {
    try {
        const wahaUrl = process.env.WAHA_URL || 'http://localhost:3000';
        const wahaApiKey = process.env.WAHA_API_KEY;
        
        await axios.post(`${wahaUrl}/api/sendText`, {
            chatId: `${phone}@c.us`,
            text: text,
            session: 'default'
        }, {
            headers: { 'X-Api-Key': wahaApiKey }
        });
        
        logger.info(`WAHA notification sent to ${phone}`);
    } catch (e) {
        logger.error(`WAHA notification failed for ${phone}: ${e.message}`);
    }
};

export const sendYCloudMessage = async (phone, text) => {
    try {
        const ycloudApiKey = process.env.YCLOUD_API_KEY;
        
        await axios.post('https://api.ycloud.com/v1/whatsapp/messages', {
            from: process.env.YCLOUD_WA_ID,
            to: phone,
            type: 'text',
            text: { body: text }
        }, {
            headers: { 'X-API-Key': ycloudApiKey }
        });
        
        logger.info(`YCloud notification sent to ${phone}`);
    } catch (e) {
        logger.error(`YCloud notification failed for ${phone}: ${e.message}`);
    }
};

export const notifyFollowUp = async (lead) => {
    const message = `🚀 Recordatorio de Seguimiento: ${lead.businessName}.\n📌 Notas: ${lead.notes || 'Sin notas'}. \n📞 Teléfono: ${lead.phone}`;
    
    // Send to both for redundancy or based on config
    if (process.env.NOTIFICATION_PREFERENCE === 'WAHA') {
        await sendWahaMessage(lead.phone, message);
    } else {
        await sendYCloudMessage(lead.phone, message);
    }
};
