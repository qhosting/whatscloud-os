'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ai_personas', 'knowledgeBase', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('ai_personas', 'actions', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: []
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ai_personas', 'knowledgeBase');
    await queryInterface.removeColumn('ai_personas', 'actions');
  }
};
