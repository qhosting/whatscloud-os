'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('VoiceCampaigns', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('tts', 'audio_file'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'scheduled', 'processing', 'completed', 'failed'),
        defaultValue: 'pending',
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      totalLeads: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      answeredCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      failedCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      cost: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      scheduledAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      organizationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Organizations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('VoiceCampaigns');
  }
};
