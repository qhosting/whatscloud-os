import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('SUPER_ADMIN', 'ACCOUNT_OWNER', 'ACCOUNT_AGENT'),
    defaultValue: 'ACCOUNT_OWNER'
  },
  credits: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: true, // Initially null for orphans or during setup, but expected for production
  }
}, {
  timestamps: true,
});
