'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Organizations', 'subscriptionPlanId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'SubscriptionPlans',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Organizations', 'subscriptionPlanId');
  }
};
