import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const WhatsAppConnection = sequelize.define('WhatsAppConnection', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    organizationId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    provider: {
        type: DataTypes.ENUM('WAHA', 'YCLOUD'),
        defaultValue: 'WAHA'
    },
    identifier: {
        type: DataTypes.STRING, // WAHA session name or YCloud WhatsApp ID
        allowNull: true
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('DISCONNECTED', 'CONNECTING', 'CONNECTED', 'ERROR'),
        defaultValue: 'DISCONNECTED'
    },
    aiEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    tableName: 'whatsapp_connections',
    timestamps: true
});
