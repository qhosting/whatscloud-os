import twilio from 'twilio';
import logger from '../config/logger.js';

export const initiateTwilioCall = async (org, to, from = null) => {
    if (!org.twilioAccountSid || !org.twilioAuthToken) {
        throw new Error('Twilio not configured for this organization');
    }

    const client = twilio(org.twilioAccountSid, org.twilioAuthToken);
    const fromNumber = from || org.twilioPhoneNumber;

    if (!fromNumber) {
        throw new Error('No Twilio phone number configured');
    }

    try {
        const call = await client.calls.create({
            url: 'http://demo.twilio.com/docs/voice.xml', // Future: customizable TwiML
            to,
            from: fromNumber
        });

        logger.info(`[Twilio] Call initiated: ${call.sid}`);
        return call;
    } catch (error) {
        logger.error(`[Twilio] Call Error: ${error.message}`);
        throw error;
    }
};

export const sendTwilioSms = async (org, to, body) => {
    if (!org.twilioAccountSid || !org.twilioAuthToken) {
        throw new Error('Twilio not configured');
    }

    const client = twilio(org.twilioAccountSid, org.twilioAuthToken);
    const fromNumber = org.twilioPhoneNumber;

    try {
        const sms = await client.messages.create({
            body,
            to,
            from: fromNumber
        });

        logger.info(`[Twilio] SMS Sent: ${sms.sid}`);
        return sms;
    } catch (error) {
        logger.error(`[Twilio] SMS Error: ${error.message}`);
        throw error;
    }
};
