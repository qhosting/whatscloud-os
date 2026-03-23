'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('GlobalSettings', [
      {
        key: 'support_whatsapp',
        value: '5219991234567',
        description: 'Número de WhatsApp para el botón flotante de soporte en la landing page',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'site_name',
        value: 'WhatsCloud',
        description: 'Nombre global del sitio',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('GlobalSettings', null, {});
  }
};
