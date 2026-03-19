import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const AIPersona = sequelize.define('AIPersona', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    organizationId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false // e.g., "Sofía Asistente"
    },
    systemPrompt: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    temperature: {
        type: DataTypes.FLOAT,
        defaultValue: 0.7
    },
    knowledgeBase: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    actions: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: []
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'ai_personas',
    timestamps: true
});
