import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'MXN',
    },
    method: {
        type: DataTypes.ENUM('OPENPAY', 'SPEI', 'CARD', 'CASH'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'),
        defaultValue: 'PENDING',
    },
    externalId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    receiptUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    creditsAdded: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
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
