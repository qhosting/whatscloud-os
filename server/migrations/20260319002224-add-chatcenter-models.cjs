'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. whatsapp_connections
    await queryInterface.createTable('whatsapp_connections', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      organizationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Organizations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      provider: {
        type: Sequelize.ENUM('WAHA', 'YCLOUD'),
        defaultValue: 'WAHA'
      },
      identifier: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('DISCONNECTED', 'CONNECTING', 'CONNECTED', 'ERROR'),
        defaultValue: 'DISCONNECTED'
      },
      aiEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 2. conversations
    await queryInterface.createTable('conversations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      organizationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Organizations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      leadId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Leads',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      connectionId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'whatsapp_connections',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      status: {
        type: Sequelize.ENUM('OPEN', 'SNOOZED', 'CLOSED', 'BOT_HANDLED'),
        defaultValue: 'BOT_HANDLED'
      },
      lastMessageAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      unreadCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 3. messages
    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      conversationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'conversations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      direction: {
        type: Sequelize.ENUM('INCOMING', 'OUTGOING'),
        allowNull: false
      },
      sender: {
        type: Sequelize.ENUM('LEAD', 'AGENT', 'BOT', 'AI'),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('TEXT', 'IMAGE', 'DOCUMENT', 'AUDIO', 'BUTTONS', 'LIST'),
        defaultValue: 'TEXT'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      status: {
        type: Sequelize.ENUM('SENT', 'DELIVERED', 'READ', 'FAILED'),
        allowNull: true
      },
      providerMessageId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 4. ai_personas
    await queryInterface.createTable('ai_personas', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      organizationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Organizations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      systemPrompt: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      temperature: {
        type: Sequelize.FLOAT,
        defaultValue: 0.7
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ai_personas');
    await queryInterface.dropTable('messages');
    await queryInterface.dropTable('conversations');
    await queryInterface.dropTable('whatsapp_connections');
  }
};
