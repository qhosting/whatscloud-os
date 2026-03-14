'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Organizations
    await queryInterface.createTable('Organizations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      plan: {
        type: Sequelize.ENUM('FREE', 'PRO', 'ENTERPRISE'),
        defaultValue: 'FREE',
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'SUSPENDED', 'CANCELLED'),
        defaultValue: 'ACTIVE',
      },
      n8nWebhookUrl: { type: Sequelize.STRING, allowNull: true },
      chatwootUrl: { type: Sequelize.STRING, allowNull: true },
      chatwootToken: { type: Sequelize.STRING, allowNull: true },
      accWebhookUrl: { type: Sequelize.STRING, allowNull: true },
      twilioAccountSid: { type: Sequelize.STRING, allowNull: true },
      twilioAuthToken: { type: Sequelize.STRING, allowNull: true },
      twilioPhoneNumber: { type: Sequelize.STRING, allowNull: true },
      stripeCustomerId: { type: Sequelize.STRING, allowNull: true },
      stripeSubscriptionId: { type: Sequelize.STRING, allowNull: true },
      subscriptionStatus: { type: Sequelize.STRING, defaultValue: 'none' },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 2. Users
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('SUPER_ADMIN', 'ACCOUNT_OWNER', 'ACCOUNT_AGENT'),
        defaultValue: 'ACCOUNT_OWNER'
      },
      credits: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      organizationId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Organizations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 3. Leads
    await queryInterface.createTable('Leads', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: { type: Sequelize.STRING, allowNull: true },
      phone: { type: Sequelize.STRING, allowNull: false },
      niche: { type: Sequelize.STRING, allowNull: true },
      city: { type: Sequelize.STRING, allowNull: true },
      country: { type: Sequelize.STRING, allowNull: true },
      website: { type: Sequelize.STRING, allowNull: true },
      address: { type: Sequelize.TEXT, allowNull: true },
      rating: { type: Sequelize.FLOAT, defaultValue: 0 },
      reviews: { type: Sequelize.INTEGER, defaultValue: 0 },
      metadata: { type: Sequelize.JSONB, defaultValue: {} },
      organizationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Organizations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      aiScore: { type: Sequelize.INTEGER, allowNull: true },
      aiSummary: { type: Sequelize.TEXT, allowNull: true },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Indexes
    await queryInterface.addIndex('Leads', ['phone', 'organizationId'], {
      unique: true,
      name: 'unique_lead_per_org'
    });
    await queryInterface.addIndex('Leads', ['niche', 'city'], {
      name: 'leads_niche_city_idx'
    });
    await queryInterface.addIndex('Leads', ['organizationId'], {
      name: 'leads_org_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Leads');
    await queryInterface.dropTable('Users');
    await queryInterface.dropTable('Organizations');
  }
};
