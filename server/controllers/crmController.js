import { CrmTask, Lead, User, Organization } from '../models/index.js';
import { Op } from 'sequelize';
import logger from '../config/logger.js';
import { sequelize } from '../config/database.js';

export const getDashboardMetrics = async (req, res) => {
    try {
        const { organizationId } = req.user;
        
        // Leads Funnel
        const leadsData = await Lead.findAll({
            where: { organizationId },
            attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['status']
        });
        
        let funnel = { NEW: 0, CONTACTED: 0, VISITED: 0, QUOTED: 0, WON: 0, LOST: 0 };
        leadsData.forEach(l => funnel[l.status] = parseInt(l.dataValues.count));
        
        // Task Metrics
        const totalTasks = await CrmTask.count({ where: { organizationId } });
        const pendingTasks = await CrmTask.count({ where: { organizationId, status: 'PENDING' } });
        const overdueTasks = await CrmTask.count({ 
            where: { 
                organizationId, 
                status: 'PENDING',
                dueDate: { [Op.lt]: new Date() }
            } 
        });

        res.json({ funnel, tasks: { total: totalTasks, pending: pendingTasks, overdue: overdueTasks } });
    } catch (error) {
        logger.error(`[CRM] Get Metrics Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
};

export const getMyAgenda = async (req, res) => {
    try {
        const { organizationId, id, role } = req.user;
        
        let whereClause = { organizationId };
        if (role !== 'ACCOUNT_OWNER' && role !== 'SUPER_ADMIN') {
            whereClause.assignedTo = id; // Vendedor solo ve las suyas
        }

        const tasks = await CrmTask.findAll({
            where: whereClause,
            include: [
                { model: Lead, attributes: ['id', 'businessName', 'phone', 'status', 'niche'] },
                { model: User, as: 'agent', attributes: ['id', 'email', 'name'] } // Si el admin quiere ver a todos
            ],
            order: [['dueDate', 'ASC']]
        });
        res.json(tasks);
    } catch (error) {
        logger.error(`[CRM] Get Agenda Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch agenda' });
    }
};

export const createTask = async (req, res) => {
    try {
        const { organizationId, id } = req.user;
        const { title, type, description, dueDate, leadId, assignedTo } = req.body;

        const task = await CrmTask.create({
            title, type, description, dueDate, leadId,
            assignedTo: assignedTo || id,
            organizationId
        });

        res.status(201).json(task);
    } catch (error) {
        logger.error(`[CRM] Create Task Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to create task' });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { organizationId, id: userId, role } = req.user;
        
        const task = await CrmTask.findOne({ where: { id, organizationId } });
        if (!task) return res.status(404).json({ error: 'Task not found' });
        
        if (role !== 'ACCOUNT_OWNER' && role !== 'SUPER_ADMIN' && task.assignedTo !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const updates = req.body;
        if (updates.status === 'COMPLETED' && task.status !== 'COMPLETED') {
            updates.completedAt = new Date();
        }

        await task.update(updates);
        res.json(task);
    } catch (error) {
        logger.error(`[CRM] Update Task Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to update task' });
    }
};

export const getBusinessProfile = async (req, res) => {
    try {
        const { organizationId } = req.user;
        const org = await Organization.findByPk(organizationId, {
            attributes: ['id', 'name', 'businessNiche', 'businessDescription', 'businessLocation']
        });
        res.json(org);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const updateBusinessProfile = async (req, res) => {
    try {
        const { organizationId } = req.user;
        const { businessNiche, businessDescription, businessLocation } = req.body;
        
        const org = await Organization.findByPk(organizationId);
        if (!org) return res.status(404).json({ error: 'Organization not found' });

        await org.update({ businessNiche, businessDescription, businessLocation });
        res.json(org);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
