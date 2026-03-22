import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const CrmTask = sequelize.define('CrmTask', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('CALL', 'VISIT', 'QUOTE', 'MESSAGE', 'MEETING', 'OTHER'),
        defaultValue: 'CALL',
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'PENDING',
        allowNull: false
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    leadId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    assignedTo: {
        type: DataTypes.UUID,
        allowNull: false, // User ID
    },
    organizationId: {
        type: DataTypes.UUID,
        allowNull: false, // Tenant Isolation
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['organizationId'],
            name: 'crmtasks_org_idx'
        },
        {
            fields: ['assignedTo'],
            name: 'crmtasks_assigned_idx'
        },
        {
            fields: ['leadId'],
            name: 'crmtasks_lead_idx'
        },
        {
            fields: ['dueDate', 'status'],
            name: 'crmtasks_due_status_idx' // Good for cron queries
        }
    ]
});
