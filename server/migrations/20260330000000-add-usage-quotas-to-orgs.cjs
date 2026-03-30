'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('Organizations');
    
    if (!tableInfo.waUsage) {
      await queryInterface.addColumn('Organizations', 'waUsage', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      });
    }
    if (!tableInfo.smsUsage) {
      await queryInterface.addColumn('Organizations', 'smsUsage', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      });
    }
    if (!tableInfo.leadsUsage) {
      await queryInterface.addColumn('Organizations', 'leadsUsage', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      });
    }
    if (!tableInfo.pbxUsage) {
      await queryInterface.addColumn('Organizations', 'pbxUsage', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Organizations', 'waUsage');
    await queryInterface.removeColumn('Organizations', 'smsUsage');
    await queryInterface.removeColumn('Organizations', 'leadsUsage');
    await queryInterface.removeColumn('Organizations', 'pbxUsage');
  }
};
