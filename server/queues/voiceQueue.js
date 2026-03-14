import Queue from 'bull';
import AmiClient from 'asterisk-manager';
import { VoiceCampaign, Organization } from '../models/index.js';
import logger from '../config/logger.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const voiceQueue = new Queue('voice-campaign-queue', REDIS_URL);

voiceQueue.process(async (job) => {
    const { campaignId } = job.data;
    const campaign = await VoiceCampaign.findByPk(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const org = await Organization.findByPk(campaign.organizationId);
    if (!org || !org.amiHost) {
        await campaign.update({ status: 'failed' });
        throw new Error('AMI not configured for this organization');
    }

    await campaign.update({ status: 'processing' });

    // Initialize AMI Client for this job
    const ami = new AmiClient(org.amiPort, org.amiHost, org.amiUser, org.amiSecret);
    
    try {
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('AMI Connection Timeout')), 5000);
            ami.on('connect', () => {
                clearTimeout(timeout);
                resolve();
            });
            ami.on('error', (err) => {
                 clearTimeout(timeout);
                 reject(err);
            });
            ami.keepConnected();
        });

        logger.info(`[VOICE_QUEUE] Connected to AMI at ${org.amiHost} for Campaign ${campaign.name}`);

        const audience = campaign.audience || [];
        let success = 0;
        let failure = 0;

        for (const contact of audience) {
            const phone = contact.phone.replace(/\D/g, ''); // Clean phone
            if (!phone) continue;

            const action = {
                'Action': 'Originate',
                'Channel': `Local/${phone}@${org.amiContext}`,
                'Context': 'whatscloud-campaign', // Custom context the user should add to Issabel
                'Exten': 's',
                'Priority': 1,
                'Async': 'true',
                'Variable': [
                    `CAMPAIGN_ID=${campaignId}`,
                    `CONTENT_TYPE=${campaign.type}`,
                    `MESSAGE_CONTENT=${campaign.content}`
                ].join(',')
            };

            await new Promise((resolve) => {
                ami.action(action, (err, res) => {
                    if (err) {
                        logger.error(`[VOICE_QUEUE] AMI Originate Failed for ${phone}: ${err.message}`);
                        failure++;
                    } else {
                        success++;
                    }
                    resolve();
                });
            });

            // Small delay to avoid overwhelming the AMI/PBX
            await new Promise(r => setTimeout(r, 500));
        }

        await campaign.update({ 
            status: 'completed', 
            answeredCount: success, // Note: "Success" here means initiation was accepted by Asterisk
            failedCount: failure
        });

        logger.info(`[VOICE_QUEUE] Campaign ${campaign.name} Finished. Sent: ${success}, Error: ${failure}`);

    } catch (error) {
        logger.error(`[VOICE_QUEUE] Fatal processing error: ${error.message}`);
        await campaign.update({ status: 'failed' });
    } finally {
        // Disconnect AMI to free resources
        try { ami.disconnect(); } catch (e) {}
    }
});
