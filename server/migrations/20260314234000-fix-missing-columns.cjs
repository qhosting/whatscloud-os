'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('--- STARTING DATABASE SCHEMA DIAGNOSTIC ---');
    
    // 1. Fix Users table
    try {
      const usersColumns = await queryInterface.describeTable('Users');
      if (!usersColumns.organizationId) {
        console.log('[FIX] Adding organizationId to Users...');
        await queryInterface.addColumn('Users', 'organizationId', {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'Organizations', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        });
      } else {
        console.log('[SKIP] organizationId already exists in Users.');
      }
    } catch (e) {
      console.error('[ERROR] Failed to process Users table:', e.message);
    }

    // 2. Fix Organizations table
    try {
      const orgColumns = await queryInterface.describeTable('Organizations');
      const fieldsToAdd = [
        { name: 'labsMobileUser', type: Sequelize.STRING },
        { name: 'labsMobileToken', type: Sequelize.STRING },
        { name: 'labsMobileSender', type: Sequelize.STRING }
      ];

      for (const field of fieldsToAdd) {
        if (!orgColumns[field.name]) {
          console.log(`[FIX] Adding ${field.name} to Organizations...`);
          await queryInterface.addColumn('Organizations', field.name, {
            type: field.type,
            allowNull: true
          });
        } else {
          console.log(`[SKIP] ${field.name} already exists in Organizations.`);
        }
      }
    } catch (e) {
      console.error('[ERROR] Failed to process Organizations table:', e.message);
    }
    
    console.log('--- SCHEMA DIAGNOSTIC COMPLETED ---');
  },

  async down(queryInterface, Sequelize) {
    // Usually no need to remove in a fix migration unless specifically requested
  }
};
