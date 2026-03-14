import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const VoiceCampaign = sequelize.define('VoiceCampaign', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('tts', 'audio_file'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'scheduled', 'processing', 'completed', 'failed'),
        defaultValue: 'pending',
    },
    content: {
        type: DataTypes.TEXT, // TTS text or Audio Filename
        allowNull: false,
    },
    totalLeads: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    answeredCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    failedCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    cost: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    scheduledAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    audience: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
    pbxHost: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    organizationId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    }
}, {
    timestamps: true,
});
