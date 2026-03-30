import { processAgentMessage } from '../services/agentService.js';
import { BotConfig } from '../models/BotConfig.js'; // This is the Mongoose one for now
import logger from '../config/logger.js';
import { GoogleGenAI, Type } from "@google/genai";

let aiInstance = null;
const getAI = () => {
    if (!aiInstance) {
        const apiKey = process.env.API_KEY?.trim();
        if (apiKey) aiInstance = new GoogleGenAI({ apiKey });
    }
    return aiInstance;
};

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

export const suggestQueries = async (req, res) => {
    const { profile } = req.body;
    
    try {
        const ai = getAI();
        if (!ai) return res.status(503).json({ error: "AI API Key no configurada en el servidor" });

        const prompt = `
            [SYSTEM: ACTIVATE STRATEGIC RADAR]
            Target Business:
            Niche: ${profile.businessNiche || ''}
            Description: ${profile.businessDescription || ''}
            Location: ${profile.businessLocation || ''}

            Task: Suggest 5 highly relevant search queries (niche + city) to find leads/partners in Mexico/LATAM.
            City suggestions should be based on economic relevance for the niche.
            
            Return JSON array: [{ "niche": "", "city": "", "reason": "" }]
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            niche: { type: Type.STRING },
                            city: { type: Type.STRING },
                            reason: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const suggestions = JSON.parse(response.text || '[]');
        res.json(suggestions);
    } catch (error) {
        logger.error(`[AI-SUGGEST] Error: ${error.message}`);
        res.status(500).json({ error: "Error procesando IA." });
    }
};
