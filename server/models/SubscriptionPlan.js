import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
    },
    limits: {
        type: DataTypes.JSON,
        defaultValue: {},
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    timestamps: true,
});
