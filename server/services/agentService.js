import { GoogleGenAI } from "@google/genai";
import { AgentMemory, Lead, Organization } from '../models/index.js';
import logger from '../config/logger.js';

const ai = new GoogleGenAI(process.env.API_KEY);

/**
 * Neural Agent Core: Handles conversation with memory and tool use.
 */
export const processAgentMessage = async (organizationId, contactIdentifier, userMessage, botConfig) => {
    try {
        const model = ai.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            systemInstruction: botConfig.systemPrompt || "Eres un Agente Neural de WhatsCloud. Tu objetivo es ayudar al usuario de forma eficiente y profesional."
        });

        // 1. Get or Create Memory
        let [memory] = await AgentMemory.findOrCreate({
            where: { organizationId, contactIdentifier },
            defaults: { conversationHistory: [] }
        });

        // 2. Prepare Tool Definitions (Function Calling)
        // We'll implement these later in a specialized 'tools' object
        const tools = {
            check_leads: async ({ category }) => {
                const count = await Lead.count({ where: { organizationId, category } });
                return `Hay ${count} leads en la categoría ${category}.`;
            },
            get_company_info: async () => {
                const org = await Organization.findByPk(organizationId);
                return `Empresa: ${org.name}, Status: ${org.status}, Plan: ${org.plan}.`;
            }
        };

        // 3. Build Chat with context
        // Gemini supports chat sessions. We inject memory facts first.
        const memoryContext = `CONTEXTO DEL CONTACTO (HECHOS CONOCIDOS): ${JSON.stringify(memory.longTermFacts)}.`;
        
        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: memoryContext }] },
                { role: "model", parts: [{ text: "Entendido. Recordaré estos datos para nuestra conversación." }] },
                ...memory.conversationHistory.slice(-10).map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                }))
            ]
        });

        // 4. Send message and handle tools (For now simple text, we can expand to actual Function Calling API)
        const result = await chat.sendMessage(userMessage);
        const responseText = result.response.text();

        // 5. Update Memory (History)
        const newHistory = [...memory.conversationHistory, 
            { role: 'user', text: userMessage, timestamp: new Date() },
            { role: 'model', text: responseText, timestamp: new Date() }
        ];
        
        // Auto-extract facts (Implicit Memory)
        // We could run a small analysis to see if any new facts appeared
        
        await memory.update({ 
            conversationHistory: newHistory.slice(-20), // Keep last 20
            lastInteractionAt: new Date()
        });

        return responseText;

    } catch (error) {
        logger.error(`[AGENT-SERVICE] Error: ${error.message}`);
        return "Lo siento, tuve un error neural al procesar tu mensaje. Reinténtalo en un momento.";
    }
};

/**
 * Summarizes conversation to update LongTermFacts.
 */
export const consolidateMemory = async (memoryId) => {
    // This would be a background job to keep memory lean and factual
};
