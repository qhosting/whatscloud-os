import { GoogleGenAI } from "@google/genai";
import { AgentMemory, Lead, Organization } from '../models/index.js';
import logger from '../config/logger.js';

let ai = null;

/**
 * Neural Agent Core: Handles conversation with memory and tool use.
 */
export const processAgentMessage = async (organizationId, contactIdentifier, userMessage, botConfig) => {
    try {
        if (!ai) {
            const apiKey = process.env.API_KEY?.trim();
            if (!apiKey || apiKey === '' || apiKey === 'undefined') {
                return "Configuración IA pendiente: Por favor activa tu API_KEY en el panel de control.";
            }
            ai = new GoogleGenAI(apiKey);
        }

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
        const actionContext = botConfig.actions?.length > 0 
            ? `\nTIENES DISPONIBLES ESTAS ACCIONES MULTIMEDIA: 
               ${botConfig.actions.map(a => `- ${a.name}: usa el código ${a.triggerCode}`).join('\n')}
               Si el usuario necesita algo de esto, escribe el código EXACTO al final de tu respuesta.`
            : '';

        const memoryContext = `CONTEXTO DEL CONTACTO (HECHOS CONOCIDOS): ${JSON.stringify(memory.longTermFacts)}.${actionContext}`;
        
        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: memoryContext }] },
                { role: "model", parts: [{ text: "Entendido. Recordaré estos datos y códigos de acción para nuestra conversación." }] },
                ...memory.conversationHistory.slice(-10).map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                }))
            ]
        });

        // 4. Send message
        const result = await chat.sendMessage(userMessage);
        const responseText = result.response.text();

        // Detect if any smart action was triggered
        let triggeredAction = null;
        if (botConfig.actions) {
            for (const action of botConfig.actions) {
                if (responseText.includes(action.triggerCode)) {
                    triggeredAction = action;
                    break;
                }
            }
        }

        // 5. Update Memory (History)
        const newHistory = [...memory.conversationHistory, 
            { role: 'user', text: userMessage, timestamp: new Date() },
            { role: 'model', text: responseText, timestamp: new Date(), actionTriggered: triggeredAction }
        ];
        
        // Auto-extract facts (Implicit Memory)
        // We could run a small analysis to see if any new facts appeared
        
        await memory.update({ 
            conversationHistory: newHistory.slice(-20), // Keep last 20
            lastInteractionAt: new Date()
        });

        return { 
            text: responseText, 
            actionTriggered: triggeredAction 
        };

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
