import axios from 'axios';
import logger from '../config/logger.js';

/**
 * Sends SMS using LabsMobile API
 * @param {Object} org - Organization object containing LabsMobile credentials
 * @param {string} to - Recipient phone number in international format (e.g., 521...)
 * @param {string} body - Message content
 */
export const sendLabsMobileSms = async (org, to, body) => {
    const user = org.labsMobileUser || process.env.LABSMOBILE_USER;
    const token = org.labsMobileToken || process.env.LABSMOBILE_TOKEN;
    const sender = org.labsMobileSender || 'WhatsCloud';

    if (!user || !token) {
        throw new Error('LabsMobile credentials not configured');
    }

    try {
        // Sanitize phone: remove '+' if present, LabsMobile expects numeric string
        const phone = to.replace('+', '');

        const response = await axios.post('https://api.labsmobile.com/api/send', {
            message: body,
            tpoa: sender,
            recipient: [
                { msisdn: phone }
            ]
        }, {
            auth: {
                username: user,
                password: token
            }
        });

        if (response.status === 201 || response.status === 200) {
            logger.info(`[LabsMobile] SMS sent to ${phone}: ${JSON.stringify(response.data)}`);
            return response.data;
        } else {
            throw new Error(`LabsMobile error: ${response.status} - ${JSON.stringify(response.data)}`);
        }
    } catch (error) {
        const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        logger.error(`[LabsMobile] SMS Send Failed: ${errorMsg}`);
        throw new Error(`LabsMobile delivery failed: ${errorMsg}`);
    }
};
