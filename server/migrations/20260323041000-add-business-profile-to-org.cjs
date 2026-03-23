'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Organizations', 'businessNiche', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Organizations', 'businessDescription', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('Organizations', 'businessLocation', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Organizations', 'businessNiche');
    await queryInterface.removeColumn('Organizations', 'businessDescription');
    await queryInterface.removeColumn('Organizations', 'businessLocation');
  }
};
