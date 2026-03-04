import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const CreditTransaction = sequelize.define('CreditTransaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('DEDUCTION', 'RECHARGE', 'BONUS', 'REFUND'),
        allowNull: false,
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    organizationId: {
        type: DataTypes.UUID,
        allowNull: false,
    }
}, {
    timestamps: true,
});
