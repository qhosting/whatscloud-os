'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('Admin123!', salt);
    const ownerHash = await bcrypt.hash('Owner123!', salt);

    const orgId = '00000000-0000-0000-0000-000000000001';

    // 1. Create a Default Organization if not exists
    const [orgs] = await queryInterface.sequelize.query(
      `SELECT id FROM "Organizations" WHERE id = '${orgId}'`
    );
    
    if (orgs.length === 0) {
      await queryInterface.bulkInsert('Organizations', [{
        id: orgId,
        name: 'WhatsCloud Corp',
        slug: 'whatscloud-corp',
        plan: 'ENTERPRISE',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    }

    // 2. Insert Users if not exist
    const [users] = await queryInterface.sequelize.query(
      `SELECT email FROM "Users" WHERE email IN ('admin@whatscloud.mx', 'owner@example.com')`
    );
    
    const existingEmails = users.map(u => u.email);

    const usersToInsert = [];
    if (!existingEmails.includes('admin@whatscloud.mx')) {
      usersToInsert.push({
        id: '11111111-1111-1111-1111-111111111111',
        email: 'admin@whatscloud.mx',
        password_hash: adminHash,
        role: 'SUPER_ADMIN',
        credits: 9999,
        organizationId: orgId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    if (!existingEmails.includes('owner@example.com')) {
      usersToInsert.push({
        id: '22222222-2222-2222-2222-222222222222',
        email: 'owner@example.com',
        password_hash: ownerHash,
        role: 'ACCOUNT_OWNER',
        credits: 500,
        organizationId: orgId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    if (usersToInsert.length > 0) {
      await queryInterface.bulkInsert('Users', usersToInsert, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {
      email: ['admin@whatscloud.mx', 'owner@example.com']
    }, {});
  }
};
