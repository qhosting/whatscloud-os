'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Organizations', 'amiHost', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Organizations', 'amiPort', { type: Sequelize.INTEGER, defaultValue: 5038 });
    await queryInterface.addColumn('Organizations', 'amiUser', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Organizations', 'amiSecret', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Organizations', 'amiContext', { type: Sequelize.STRING, defaultValue: 'from-internal' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Organizations', 'amiHost');
    await queryInterface.removeColumn('Organizations', 'amiPort');
    await queryInterface.removeColumn('Organizations', 'amiUser');
    await queryInterface.removeColumn('Organizations', 'amiSecret');
    await queryInterface.removeColumn('Organizations', 'amiContext');
  }
};
