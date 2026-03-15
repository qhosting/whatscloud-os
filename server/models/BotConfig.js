import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const BotConfig = sequelize.define('BotConfig', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true
    },
    organizationId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    systemPrompt: {
        type: DataTypes.TEXT,
        defaultValue: ''
    },
    knowledgeBase: {
        type: DataTypes.TEXT,
        defaultValue: ''
    },
    temperature: {
        type: DataTypes.FLOAT,
        defaultValue: 0.7
    },
    actions: {
        type: DataTypes.JSONB,
        defaultValue: []
    }
}, {
    timestamps: true
});
