import { processAgentMessage } from '../services/agentService.js';
import { BotConfig } from '../models/BotConfig.js'; // This is the Mongoose one for now
import logger from '../config/logger.js';

export const handleAgentChat = async (req, res) => {
    const { message, contactId } = req.body;
    const { id: userId, organizationId } = req.user;

    if (!message) return res.status(400).json({ error: "Message is required" });

    try {
        // Fetch specific bot config for this user or org
        let config = await BotConfig.findOne({ userId });
        if (!config) {
            config = { systemPrompt: "Eres un asistente de WhatsCloud.", temperature: 0.7 };
        }

        const { text, actionTriggered } = await processAgentMessage(
            organizationId, 
            contactId || `user-${userId}`, // Fallback to user if no contactId
            message, 
            config
        );

        res.json({ response: text, actionTriggered });

    } catch (error) {
        logger.error(`[CHAT-CONTROLLER] Error: ${error.message}`);
        res.status(500).json({ error: "Agent unavailable" });
    }
};
