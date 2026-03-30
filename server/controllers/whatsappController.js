import { GoogleGenAI } from "@google/genai";
import { 
    WhatsAppConnection, 
    Conversation, 
    Message, 
    Lead, 
    Message, 
    Lead, 
    AIPersona,
    Organization,
    Product,
    Category,
    SubscriptionPlan
} from '../models/index.js';
import axios from 'axios';
import logger from '../config/logger.js';
import { checkAndDeductQuota } from '../utils/billing.js';

let aiConfigs = {}; // Cache for initialized AI instances

const getAI = (apiKey) => {
    if (aiConfigs[apiKey]) return aiConfigs[apiKey];
    if (apiKey && apiKey !== '' && apiKey !== 'undefined') {
        try {
            const ai = new GoogleGenAI({ apiKey });
            aiConfigs[apiKey] = ai;
            return ai;
        } catch (error) {
            logger.error(`[WHATSAPP] Failed to initialize Gemini AI: ${error.message}`);
        }
    }
    return null;
};

// Assuming WAHA Webhook format: POST /webhook/whatsapp
export const handleIncomingMessage = async (req, res) => {
    try {
        // Acknowledge immediately to prevent webhook retries
        res.sendStatus(200);

        const { payload, event } = req.body;
        // Verify it's a message event
        if (event !== 'message' || !payload || !payload.from || !payload.body) {
            return;
        }

        const senderPhone = payload.from.replace('@c.us', '');
        const messageText = payload.body;
        const sessionId = req.body.session || 'default'; // WAHA session name

        logger.info(`[WHATSAPP] Incoming msg from ${senderPhone}: ${messageText}`);

        // 1. Find the corresponding WhatsApp connection
        const connection = await WhatsAppConnection.findOne({
            where: { identifier: sessionId, status: 'CONNECTED' },
            include: [{ model: Organization }]
        });

        if (!connection) {
            logger.warn(`[WHATSAPP] Connection not found for session ${sessionId}`);
            return;
        }

        const orgId = connection.organizationId;

        // 2. Find or Create Lead
        let [lead, createdLead] = await Lead.findOrCreate({
            where: { phone: senderPhone, organizationId: orgId },
            defaults: {
                phone: senderPhone,
                organizationId: orgId,
                status: 'NEW',
                businessName: 'Desconocido', // Can be updated later
                lastActivity: new Date()
            }
        });

        if (createdLead) {
            // Check Quota for new leads
            const quota = await checkAndDeductQuota(orgId, 'leads', 1);
            if (!quota.success) {
                logger.warn(`[BILLING] Lead creation denied for org ${orgId}: ${quota.error}`);
                // Optional: we could delete the lead or mark it as 'OVER_QUOTA'
                // For now, we allow creation but log the error.
            }
        } else {
            await lead.update({ lastActivity: new Date() });
        }

        // 3. Find or Create Conversation
        let [conversation, createdConv] = await Conversation.findOrCreate({
            where: { 
                leadId: lead.id, 
                organizationId: orgId,
                status: 'OPEN' // Only attach to open conversations, or create one
            },
            defaults: {
                leadId: lead.id,
                organizationId: orgId,
                connectionId: connection.id,
                status: 'OPEN',
                lastMessageAt: new Date(),
                unreadCount: 1
            }
        });

        if (!createdConv) {
            await conversation.update({
                lastMessageAt: new Date(),
                unreadCount: conversation.unreadCount + 1,
                connectionId: connection.id // Update connection if changed
            });
        }

        // 4. Save Incoming Message
        await Message.create({
            conversationId: conversation.id,
            direction: 'INCOMING',
            sender: 'LEAD',
            type: 'TEXT',
            content: messageText,
            status: 'RECEIVED',
            providerMessageId: payload.id
        });

        // 5. Handle AI Auto-Reply if enabled
        if (connection.aiEnabled) {
            // --- AUTOMATION: 10-Min Auto-Resume ---
            const tenMinutesInMs = 10 * 60 * 1000;
            const isManualStatus = conversation.status === 'MANUAL';
            const agentInactiveTime = conversation.lastAgentActiveAt ? Date.now() - new Date(conversation.lastAgentActiveAt).getTime() : Infinity;

            if (isManualStatus && agentInactiveTime < tenMinutesInMs) {
                logger.info(`[WHATSAPP] AI Paused for ${senderPhone} (Manual intervention active)`);
                return;
            }

            // If it was manual but timeout hit, reactivate bot
            if (isManualStatus && agentInactiveTime >= tenMinutesInMs) {
                logger.info(`[WHATSAPP] AI Resuming for ${senderPhone} after 10 min inactivity`);
                await conversation.update({ status: 'BOT_HANDLED' });
            }

            const aiPersona = await AIPersona.findOne({
                where: { organizationId: orgId, isActive: true }
            });

            if (aiPersona && process.env.API_KEY) {
                const aiInstance = getAI(process.env.API_KEY);
                if (aiInstance) {
                    await handleAIReply(aiInstance, aiPersona, conversation, messageText, senderPhone, sessionId, orgId);
                }
            }
        }

    } catch (error) {
        logger.error(`[WHATSAPP] Webhook Processing Error: ${error.message}`);
    }
};

// Load Catalog Context
const loadCatalogContext = async (organizationId) => {
    try {
        const products = await Product.findAll({
            where: { organizationId, isActive: true },
            include: [{ model: Category }]
        });
        if (!products || products.length === 0) return '';
        let text = `\n\n[Catálogo de Productos Disponibles]\nPuedes vender estos productos. Si el cliente pregunta, ofrécelos y dales el precio:\n`;
        products.forEach(p => {
            text += `- ${p.name} (${p.Category?.name || 'Catálogo'}): $${parseFloat(p.price).toFixed(2)} - ${p.description || ''}\n`;
        });
        return text;
    } catch (e) {
        return '';
    }
};

const handleAIReply = async (aiInstance, persona, conversation, userMessage, phone, sessionId, organizationId) => {
    try {
        const catalogContext = await loadCatalogContext(organizationId);

        // Fetch recent conversation history for context (last 10 messages)
        const history = await Message.findAll({
            where: { conversationId: conversation.id },
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        const historyContext = history.reverse().map(m => `${m.sender}: ${m.content}`).join('\n');

        const actionContext = persona.actions?.length > 0 
            ? `\nTIENES DISPONIBLES ESTAS ACCIONES MULTIMEDIA: 
               ${persona.actions.map(a => `- ${a.name}: usa el código EXACTO ${a.triggerCode}`).join('\n')}
               Si el usuario necesita algo de esto, escribe el código AL FINAL de tu respuesta.`
            : '';

        const prompt = `
            [System Configuration]
            Eres un asistente virtual llamado ${persona.name}.
            ${persona.systemPrompt}
            ${catalogContext}
            ${actionContext}
            
            [Historial de Conversación]
            ${historyContext}
            
            [Instrucción]
            Responde de manera natural y concisa basándote en el historial y tus instrucciones del sistema.
            Responde SIEMPRE en Español.
        `;

        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        const aiReply = response.text || "Lo siento, estoy teniendo problemas técnicos.";

        // --- TOKEN USAGE TRACKING ---
        if (response.usageMetadata && response.usageMetadata.totalTokenCount) {
            const tokens = response.usageMetadata.totalTokenCount;
            await Organization.increment('aiTokensUsage', { 
                by: tokens, 
                where: { id: organizationId } 
            });
            logger.info(`[AI-USAGE] Org ${organizationId} consumed ${tokens} tokens (WhatsApp)`);
        }

        // --- BILLING: Check Quota before sending ---
        const quota = await checkAndDeductQuota(organizationId, 'waMessages', 1);
        if (!quota.success) {
            logger.warn(`[BILLING] AI message blocked for org ${organizationId}: ${quota.error}`);
            return; // Don't send the message
        }

        // 6. Send Reply via WAHA
        const wahaUrl = process.env.WAHA_URL || 'http://localhost:3000';
        await axios.post(`${wahaUrl}/api/sendText`, {
            session: sessionId,
            chatId: `${phone}@c.us`,
            text: aiReply
        }, {
            headers: {
                'X-Api-Key': process.env.WAHA_API_KEY || ''
            }
        });

        // 7. Save Outgoing Message
        await Message.create({
            conversationId: conversation.id,
            direction: 'OUTGOING',
            sender: 'AI',
            type: 'TEXT',
            content: aiReply,
            status: 'SENT'
        });

        await conversation.update({ lastMessageAt: new Date() });
        logger.info(`[WHATSAPP] AI Replied to ${phone}: ${aiReply.substring(0, 50)}...`);

    } catch (error) {
        logger.error(`[WHATSAPP] AI Reply Error: ${error.message}`);
    }
};

// API Endpoint to fetch chats for the Live Inbox
export const getInboxConversations = async (req, res) => {
    try {
        const { organizationId } = req.user;
        const limit = parseInt(req.query.limit) || 20;

        const conversations = await Conversation.findAll({
            where: { organizationId },
            include: [
                { model: Lead, attributes: ['id', 'businessName', 'phone'] },
                { 
                    model: Message, 
                    as: 'messages',
                    limit: 1, 
                    order: [['createdAt', 'DESC']]
                }
            ],
            order: [['lastMessageAt', 'DESC']],
            limit
        });

        res.json(conversations);
    } catch (error) {
        logger.error(`[INBOX] Fetch Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
};

// API Endpoint to fetch messages for a specific conversation
export const getConversationMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const { organizationId } = req.user;

        // Verify ownership
        const conversation = await Conversation.findOne({
            where: { id, organizationId }
        });

        if (!conversation) return res.status(404).json({ error: 'Not found' });

        const messages = await Message.findAll({
            where: { conversationId: id },
            order: [['createdAt', 'ASC']]
        });

        // Mark as read
        if (conversation.unreadCount > 0) {
            await conversation.update({ unreadCount: 0 });
        }

        res.json(messages);
    } catch (error) {
        logger.error(`[INBOX] Get Messages Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

// API Endpoint for human agent to send a message manually
export const sendManualMessage = async (req, res) => {
    try {
        const { id } = req.params; // conversation Id
        const { text } = req.body;
        const { organizationId } = req.user;

        const conversation = await Conversation.findOne({
            where: { id, organizationId },
            include: [Lead, WhatsAppConnection]
        });

        if (!conversation || !conversation.WhatsAppConnection) {
            return res.status(404).json({ error: 'Conversation or Connection not found' });
        }

        // --- BILLING: Check Quota ---
        const quota = await checkAndDeductQuota(organizationId, 'waMessages', 1);
        if (!quota.success) {
            return res.status(403).json({ error: quota.error });
        }

        // Send via WAHA
        const wahaUrl = process.env.WAHA_URL || 'http://localhost:3000';
        await axios.post(`${wahaUrl}/api/sendText`, {
            session: conversation.WhatsAppConnection.identifier,
            chatId: `${conversation.Lead.phone}@c.us`,
            text: text
        }, {
            headers: { 'X-Api-Key': process.env.WAHA_API_KEY || '' }
        });

        // Save Message
        const savedMessage = await Message.create({
            conversationId: conversation.id,
            direction: 'OUTGOING',
            sender: 'AGENT',
            type: 'TEXT',
            content: text,
            status: 'SENT'
        });

        await conversation.update({ 
            lastMessageAt: new Date(),
            lastAgentActiveAt: new Date(),
            status: 'MANUAL' // Force manual if bot had it
        });

        res.json(savedMessage);
    } catch (error) {
        logger.error(`[INBOX] Send Manual Message Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to send message' });
    }
};
