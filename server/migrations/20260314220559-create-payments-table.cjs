'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING,
        defaultValue: 'MXN',
      },
      method: {
        type: Sequelize.ENUM('OPENPAY', 'SPEI', 'CARD', 'CASH'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'),
        defaultValue: 'PENDING',
      },
      externalId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      receiptUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      creditsAdded: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
    await queryInterface.dropTable('Payments');
  }
};
