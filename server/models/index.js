import { User } from './User.js';
import { Organization } from './Organization.js';
import { Lead } from './Lead.js';
import { CreditTransaction } from './CreditTransaction.js';
import { BotConfig } from './BotConfig.js';
import { VoiceCampaign } from './VoiceCampaign.js';
import { Payment } from './Payment.js';
import { AgentMemory } from './AgentMemory.js';

import { WhatsAppConnection } from './WhatsAppConnection.js';
import { Conversation } from './Conversation.js';
import { Message } from './Message.js';
import { AIPersona } from './AIPersona.js';

import { Category } from './Category.js';
import { Product } from './Product.js';
import { Order } from './Order.js';
import { OrderItem } from './OrderItem.js';
import { CrmTask } from './CrmTask.js';
import { SubscriptionPlan } from './SubscriptionPlan.js';
import { GlobalSetting } from './GlobalSetting.js';

// Relations
Organization.belongsTo(SubscriptionPlan, { foreignKey: 'subscriptionPlanId', as: 'subscriptionPlan' });
SubscriptionPlan.hasMany(Organization, { foreignKey: 'subscriptionPlanId', as: 'organizations' });

Organization.hasMany(User, { foreignKey: 'organizationId', as: 'users' });
User.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

Organization.hasMany(Lead, { foreignKey: 'organizationId', as: 'leads' });
Lead.belongsTo(Organization, { foreignKey: 'organizationId' });

Organization.hasMany(CreditTransaction, { foreignKey: 'organizationId' });
CreditTransaction.belongsTo(Organization, { foreignKey: 'organizationId' });

User.hasMany(CreditTransaction, { foreignKey: 'userId' });
CreditTransaction.belongsTo(User, { foreignKey: 'userId' });

Organization.hasMany(VoiceCampaign, { foreignKey: 'organizationId' });
VoiceCampaign.belongsTo(Organization, { foreignKey: 'organizationId' });

User.hasMany(VoiceCampaign, { foreignKey: 'userId' });
VoiceCampaign.belongsTo(User, { foreignKey: 'userId' });

Organization.hasMany(Payment, { foreignKey: 'organizationId' });
Payment.belongsTo(Organization, { foreignKey: 'organizationId' });

User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });

Organization.hasMany(AgentMemory, { foreignKey: 'organizationId' });
AgentMemory.belongsTo(Organization, { foreignKey: 'organizationId' });

Organization.hasMany(BotConfig, { foreignKey: 'organizationId' });
BotConfig.belongsTo(Organization, { foreignKey: 'organizationId' });

User.hasOne(BotConfig, { foreignKey: 'userId' });
BotConfig.belongsTo(User, { foreignKey: 'userId' });

// ChatCenter Integration Relations
Organization.hasMany(WhatsAppConnection, { foreignKey: 'organizationId' });
WhatsAppConnection.belongsTo(Organization, { foreignKey: 'organizationId' });

Organization.hasMany(Conversation, { foreignKey: 'organizationId' });
Conversation.belongsTo(Organization, { foreignKey: 'organizationId' });

Lead.hasMany(Conversation, { foreignKey: 'leadId' });
Conversation.belongsTo(Lead, { foreignKey: 'leadId' });

WhatsAppConnection.hasMany(Conversation, { foreignKey: 'connectionId' });
Conversation.belongsTo(WhatsAppConnection, { foreignKey: 'connectionId' });

Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

Organization.hasMany(AIPersona, { foreignKey: 'organizationId' });
AIPersona.belongsTo(Organization, { foreignKey: 'organizationId' });

// Commerce Integration Relations
Organization.hasMany(Category, { foreignKey: 'organizationId' });
Category.belongsTo(Organization, { foreignKey: 'organizationId' });

Organization.hasMany(Product, { foreignKey: 'organizationId' });
Product.belongsTo(Organization, { foreignKey: 'organizationId' });

Organization.hasMany(Order, { foreignKey: 'organizationId' });
Order.belongsTo(Organization, { foreignKey: 'organizationId' });

Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

Lead.hasMany(Order, { foreignKey: 'leadId' });
Order.belongsTo(Lead, { foreignKey: 'leadId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// CRM Tracker Relations
Organization.hasMany(CrmTask, { foreignKey: 'organizationId' });
CrmTask.belongsTo(Organization, { foreignKey: 'organizationId' });

User.hasMany(CrmTask, { foreignKey: 'assignedTo', as: 'tasks' });
CrmTask.belongsTo(User, { foreignKey: 'assignedTo', as: 'agent' });

Lead.hasMany(CrmTask, { foreignKey: 'leadId', as: 'tasks' });
CrmTask.belongsTo(Lead, { foreignKey: 'leadId' });

export {
    User,
    Organization,
    Lead,
    CreditTransaction,
    BotConfig,
    VoiceCampaign,
    Payment,
    AgentMemory,
    WhatsAppConnection,
    Conversation,
    Message,
    AIPersona,
    Category,
    Product,
    Order,
    OrderItem,
    CrmTask,
    SubscriptionPlan,
    GlobalSetting
};

