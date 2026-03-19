import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Conversation = sequelize.define('Conversation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    organizationId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    leadId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    connectionId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('OPEN', 'SNOOZED', 'CLOSED', 'BOT_HANDLED'),
        defaultValue: 'BOT_HANDLED'
    },
    lastMessageAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    unreadCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'conversations',
    timestamps: true
});
