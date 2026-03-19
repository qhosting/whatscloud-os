import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    conversationId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    direction: {
        type: DataTypes.ENUM('INCOMING', 'OUTGOING'),
        allowNull: false
    },
    sender: {
        type: DataTypes.ENUM('LEAD', 'AGENT', 'BOT', 'AI'),
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('TEXT', 'IMAGE', 'DOCUMENT', 'AUDIO', 'BUTTONS', 'LIST'),
        defaultValue: 'TEXT'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    status: {
        type: DataTypes.ENUM('SENT', 'DELIVERED', 'READ', 'FAILED'),
        allowNull: true
    },
    providerMessageId: {
        type: DataTypes.STRING,
        allowNull: true // ID assigned by YCloud/WAHA
    }
}, {
    tableName: 'messages',
    timestamps: true
});
