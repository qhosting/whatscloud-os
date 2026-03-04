import AmiClient from 'asterisk-manager';
import { Organization } from '../models/index.js';
import { initiateTwilioCall } from '../services/voipService.js';
import logger from '../config/logger.js';

let ami = null;

// Global AMI fallback (Legacy system-wide config)
const AMI_HOST = process.env.AMI_HOST?.trim();
const AMI_USER = process.env.AMI_USER?.trim();
const AMI_SECRET = process.env.AMI_SECRET?.trim();

if (AMI_HOST && AMI_USER && AMI_SECRET) {
    ami = new AmiClient(
        process.env.AMI_PORT || 5038,
        AMI_HOST,
        AMI_USER,
        AMI_SECRET
    );
    ami.keepConnected();
    ami.on('error', (err) => logger.error(`[AMI] Error: ${err.message}`));
    ami.on('connect', () => logger.info('[AMI] Connected successfully'));
}

export const initiateCall = async (req, res) => {
    const { destination, extension, context = 'from-internal', method = 'AUTO' } = req.body;
    const user = req.user;

    if (!destination) {
        return res.status(400).json({ error: 'Missing destination number' });
    }

    try {
        const org = await Organization.findByPk(user.organizationId);
        if (!org) return res.status(404).json({ error: 'Organization not found' });

        // Strategy selection
        // 1. Try Twilio if configured
        if ((method === 'TWILIO' || method === 'AUTO') && org.twilioAccountSid && org.twilioAuthToken) {
            logger.info(`[VoIP] Using Twilio for User ${user.id} -> ${destination}`);
            const call = await initiateTwilioCall(org, destination);
            return res.json({ status: 'success', provider: 'twilio', callSid: call.sid });
        }

        // 2. Fallback to AMI (Asterisk)
        if ((method === 'AMI' || method === 'AUTO') && ami) {
            if (!extension) return res.status(400).json({ error: 'Extension required for AMI calls' });

            logger.info(`[VoIP] Using AMI for User ${user.id}: Ext ${extension} -> ${destination}`);

            const action = {
                'Action': 'Originate',
                'Channel': `SIP/${extension}`,
                'Context': context,
                'Exten': destination,
                'Priority': 1,
                'CallerID': `WhatsCloud <${destination}>`,
                'Async': 'true'
            };

            return new Promise((resolve) => {
                ami.action(action, (err, response) => {
                    if (err) {
                        logger.error(`[AMI] Call Failed: ${err.message}`);
                        return resolve(res.status(500).json({ error: 'AMI Call initiation failed', details: err.message }));
                    }
                    resolve(res.json({ status: 'success', provider: 'ami', pbx_response: response }));
                });
            });
        }

        res.status(503).json({ error: 'No VoIP provider available or configured for this organization' });

    } catch (error) {
        logger.error(`[VoIP] Error: ${error.message}`);
        res.status(500).json({ error: 'Internal server error during call initiation' });
    }
};
