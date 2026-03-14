'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Organizations', 'stripeCustomerId');
    await queryInterface.removeColumn('Organizations', 'stripeSubscriptionId');
    await queryInterface.addColumn('Organizations', 'openpayCustomerId', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Organizations', 'openpayCustomerId');
    await queryInterface.addColumn('Organizations', 'stripeCustomerId', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Organizations', 'stripeSubscriptionId', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
