import { BotConfig } from '../models/index.js';
import logger from '../config/logger.js';

export const getBotConfig = async (req, res) => {
    try {
        const config = await BotConfig.findOne({ userId: req.user.id });
        res.json(config || { error: 'No configuration found' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const updateBotConfig = async (req, res) => {
    const { systemPrompt, knowledgeBase } = req.body;
    try {
        const [config, created] = await BotConfig.upsert({
            userId: req.user.id,
            systemPrompt,
            knowledgeBase,
            organizationId: req.user.organizationId
        });
        res.json({ success: true, config, created });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
