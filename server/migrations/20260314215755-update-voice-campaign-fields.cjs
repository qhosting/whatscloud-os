'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('VoiceCampaigns', 'audience', { type: Sequelize.JSONB, defaultValue: [] });
    await queryInterface.addColumn('VoiceCampaigns', 'pbxHost', { type: Sequelize.STRING, allowNull: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('VoiceCampaigns', 'audience');
    await queryInterface.removeColumn('VoiceCampaigns', 'pbxHost');
  }
};
