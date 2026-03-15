'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Leads');
    
    if (!tableInfo.email) {
      await queryInterface.addColumn('Leads', 'email', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    if (!tableInfo.website) {
      await queryInterface.addColumn('Leads', 'website', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Leads', 'email');
    await queryInterface.removeColumn('Leads', 'website');
  }
};
