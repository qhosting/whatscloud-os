import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Lead = sequelize.define('Lead', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    niche: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    website: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    reviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
    },
    organizationId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    aiScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    aiSummary: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['phone', 'organizationId'],
            name: 'unique_lead_per_org'
        },
        {
            fields: ['niche', 'city'],
            name: 'leads_niche_city_idx'
        },
        {
            fields: ['organizationId'],
            name: 'leads_org_idx'
        }
    ]
});
