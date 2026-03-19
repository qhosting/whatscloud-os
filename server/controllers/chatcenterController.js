import { WhatsAppConnection, AIPersona } from '../models/index.js';
import logger from '../config/logger.js';

// --- WHATSAPP CONNECTION MANAGEMENT ---

export const getConnections = async (req, res) => {
    try {
        const { organizationId } = req.user;
        const connections = await WhatsAppConnection.findAll({ where: { organizationId } });
        res.json(connections);
    } catch (error) {
        logger.error(`[CHATCENTER] Get Connections Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch connections' });
    }
};

export const createConnection = async (req, res) => {
    try {
        const { organizationId } = req.user;
        const { provider, identifier, phoneNumber } = req.body;
        
        const connection = await WhatsAppConnection.create({
            organizationId,
            provider,
            identifier,
            phoneNumber,
            status: 'CONNECTING'
        });

        res.status(201).json(connection);
    } catch (error) {
        logger.error(`[CHATCENTER] Create Connection Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to create connection' });
    }
};

export const updateConnectionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { organizationId } = req.user;
        const { status, aiEnabled } = req.body;

        const connection = await WhatsAppConnection.findOne({ where: { id, organizationId } });
        if (!connection) return res.status(404).json({ error: 'Connection not found' });

        await connection.update({ 
            status: status !== undefined ? status : connection.status,
            aiEnabled: aiEnabled !== undefined ? aiEnabled : connection.aiEnabled
        });

        res.json(connection);
    } catch (error) {
        logger.error(`[CHATCENTER] Update Connection Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to update connection' });
    }
};

export const deleteConnection = async (req, res) => {
    try {
        const { id } = req.params;
        const { organizationId } = req.user;
        
        const deleted = await WhatsAppConnection.destroy({ where: { id, organizationId } });
        if (!deleted) return res.status(404).json({ error: 'Connection not found' });
        
        res.json({ success: true });
    } catch (error) {
        logger.error(`[CHATCENTER] Delete Connection Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to delete connection' });
    }
};

// --- AI PERSONA MANAGEMENT ---

export const getAIPersonas = async (req, res) => {
    try {
        const { organizationId } = req.user;
        const personas = await AIPersona.findAll({ where: { organizationId } });
        res.json(personas);
    } catch (error) {
        logger.error(`[CHATCENTER] Get Personas Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch personas' });
    }
};

export const saveAIPersona = async (req, res) => {
    try {
        const { organizationId } = req.user;
        const { id, name, systemPrompt, temperature, isActive } = req.body;

        if (id) {
            // Update
            const persona = await AIPersona.findOne({ where: { id, organizationId } });
            if (!persona) return res.status(404).json({ error: 'Persona not found' });
            
            await persona.update({ name, systemPrompt, temperature, isActive });
            return res.json(persona);
        } else {
            // Create
            const persona = await AIPersona.create({
                organizationId,
                name,
                systemPrompt,
                temperature,
                isActive
            });
            return res.status(201).json(persona);
        }
    } catch (error) {
        logger.error(`[CHATCENTER] Save Persona Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to save persona' });
    }
};

export const deleteAIPersona = async (req, res) => {
    try {
        const { id } = req.params;
        const { organizationId } = req.user;
        
        const deleted = await AIPersona.destroy({ where: { id, organizationId } });
        if (!deleted) return res.status(404).json({ error: 'Persona not found' });
        
        res.json({ success: true });
    } catch (error) {
        logger.error(`[CHATCENTER] Delete Persona Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to delete persona' });
    }
};
