'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Leads', 'status', {
        type: Sequelize.STRING,
        defaultValue: 'NEW'
    });
    await queryInterface.addColumn('Leads', 'followUpDate', {
        type: Sequelize.DATE,
        allowNull: true
    });
    await queryInterface.addColumn('Leads', 'lastActivity', {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
    });
    await queryInterface.addColumn('Leads', 'notes', {
        type: Sequelize.TEXT,
        allowNull: true
    });
    await queryInterface.addColumn('Leads', 'priority', {
        type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH'),
        defaultValue: 'MEDIUM'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Leads', 'status');
    await queryInterface.removeColumn('Leads', 'followUpDate');
    await queryInterface.removeColumn('Leads', 'lastActivity');
    await queryInterface.removeColumn('Leads', 'notes');
    await queryInterface.removeColumn('Leads', 'priority');
  }
};
