import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const AgentMemory = sequelize.define('AgentMemory', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    contactIdentifier: {
        type: DataTypes.STRING, // Can be Phone Number or ChatId
        allowNull: false,
    },
    longTermFacts: {
        type: DataTypes.JSONB, // Stores key info: { name: "Juan", likes: "Pizza", lastProblem: "Payment error" }
        defaultValue: {},
    },
    conversationHistory: {
        type: DataTypes.JSONB, // Stores last N messages: [{role: "user", text: "..."}, {role: "model", text: "..."}]
        defaultValue: [],
    },
    lastInteractionAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    organizationId: {
        type: DataTypes.UUID,
        allowNull: false,
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['contactIdentifier', 'organizationId']
        }
    ]
});
