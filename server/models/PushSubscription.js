import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const PushSubscription = sequelize.define('PushSubscription', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    subscription: {
        type: DataTypes.JSONB, // The subscription object from the browser
        allowNull: false,
    },
    deviceType: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['userId'],
            name: 'push_subscriptions_user_idx'
        }
    ]
});
