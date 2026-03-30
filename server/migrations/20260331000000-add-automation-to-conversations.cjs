'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add lastAgentActiveAt to track human intervention
    await queryInterface.addColumn('conversations', 'lastAgentActiveAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // 2. We use 'OPEN' as 'MANUAL' for now, but to be explicitly clear we can ensure 
    // the enum supports our logic. Actually, current statuses are: 'OPEN', 'SNOOZED', 'CLOSED', 'BOT_HANDLED'.
    // Let's add 'MANUAL' to the enum if Postgres allows it easily, or just stick to 'OPEN' as manual.
    // The user wants 'BotIA connected' and 'pause on human message'.
    // Since we can't easily update ENUMs in some Sequelize versions without raw SQL:
    await queryInterface.sequelize.query('ALTER TYPE "enum_conversations_status" ADD VALUE IF NOT EXISTS \'MANUAL\';');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('conversations', 'lastAgentActiveAt');
    // Removing values from ENUM is not supported by Postgres without recreating the type.
  }
};
