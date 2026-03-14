import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Organization = sequelize.define('Organization', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    plan: {
        type: DataTypes.ENUM('FREE', 'PRO', 'ENTERPRISE'),
        defaultValue: 'FREE',
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'SUSPENDED', 'CANCELLED'),
        defaultValue: 'ACTIVE',
    },
    // Integration Fields
    n8nWebhookUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    chatwootUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    chatwootToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    accWebhookUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // VoIP / Twilio
    twilioAccountSid: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    twilioAuthToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    twilioPhoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // Stripe / Billing
    stripeCustomerId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    stripeSubscriptionId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    subscriptionStatus: {
        type: DataTypes.STRING,
        defaultValue: 'none',
    },
    // Asterisk / Issabel AMI
    amiHost: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    amiPort: {
        type: DataTypes.INTEGER,
        defaultValue: 5038,
    },
    amiUser: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    amiSecret: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    amiContext: {
        type: DataTypes.STRING,
        defaultValue: 'from-internal',
    }
}, {
    timestamps: true,
});
