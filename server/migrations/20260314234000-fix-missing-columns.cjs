'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Users');
    
    // 1. Fix Users table if organizationId is missing
    if (!tableInfo.organizationId) {
      await queryInterface.addColumn('Users', 'organizationId', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Organizations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }

    // 2. Add LabsMobile fields to Organizations
    const orgTableInfo = await queryInterface.describeTable('Organizations');
    if (!orgTableInfo.labsMobileUser) {
      await queryInterface.addColumn('Organizations', 'labsMobileUser', { type: Sequelize.STRING, allowNull: true });
    }
    if (!orgTableInfo.labsMobileToken) {
      await queryInterface.addColumn('Organizations', 'labsMobileToken', { type: Sequelize.STRING, allowNull: true });
    }
    if (!orgTableInfo.labsMobileSender) {
      await queryInterface.addColumn('Organizations', 'labsMobileSender', { type: Sequelize.STRING, allowNull: true });
    }
  },

  async down(queryInterface, Sequelize) {
    // Usually no need to remove in a fix migration unless specifically requested
  }
};
