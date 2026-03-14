'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AgentMemories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      contactIdentifier: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      longTermFacts: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      conversationHistory: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      lastInteractionAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      organizationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Organizations', key: 'id' },
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

    await queryInterface.addIndex('AgentMemories', ['contactIdentifier', 'organizationId'], {
        unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('AgentMemories');
  }
};
