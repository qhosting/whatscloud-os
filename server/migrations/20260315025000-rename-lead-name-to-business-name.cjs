'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Leads');
    if (tableInfo.name && !tableInfo.businessName) {
      await queryInterface.renameColumn('Leads', 'name', 'businessName');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Leads');
    if (tableInfo.businessName && !tableInfo.name) {
      await queryInterface.renameColumn('Leads', 'businessName', 'name');
    }
  }
};
