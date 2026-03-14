import { User } from './User.js';
import { Organization } from './Organization.js';
import { Lead } from './Lead.js';
import { CreditTransaction } from './CreditTransaction.js';
import { BotConfig } from './BotConfig.js';
import { VoiceCampaign } from './VoiceCampaign.js';

// Relations
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

export {
    User,
    Organization,
    Lead,
    CreditTransaction,
    BotConfig,
    VoiceCampaign
};
