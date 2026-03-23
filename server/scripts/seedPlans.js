import { SubscriptionPlan } from '../models/SubscriptionPlan.js';
import { sequelize } from '../config/database.js';

const plans = [
    { 
        name: 'FREE (Comunidad)', 
        price: 0, 
        limits: { maxUsers: 2, maxWaMessages: 100, maxSms: 0, maxLeads: 20, maxPbxMinutes: 0 },
        isActive: true
    },
    { 
        name: 'AI STARTER (Emprendedor)', 
        price: 29.90, 
        limits: { maxUsers: 5, maxWaMessages: 500, maxSms: 20, maxLeads: 100, maxPbxMinutes: 0 },
        isActive: true
    },
    { 
        name: 'PROFESSIONAL (Crecimiento)', 
        price: 59.90, 
        limits: { maxUsers: 15, maxWaMessages: 2000, maxSms: 100, maxLeads: 500, maxPbxMinutes: 10 },
        isActive: true
    },
    { 
        name: 'VENTAS PRO (Aceleración)', 
        price: 99.90, 
        limits: { maxUsers: 30, maxWaMessages: 5000, maxSms: 500, maxLeads: 2000, maxPbxMinutes: 60 },
        isActive: true
    },
    { 
        name: 'CALL CENTER AI (Escala)', 
        price: 189.90, 
        limits: { maxUsers: 50, maxWaMessages: 10000, maxSms: 2000, maxLeads: 5000, maxPbxMinutes: 300 },
        isActive: true
    },
    { 
        name: 'ENTERPRISE (Corporativo)', 
        price: 349.90, 
        limits: { maxUsers: 100, maxWaMessages: 50000, maxSms: 10000, maxLeads: 20000, maxPbxMinutes: 1000 },
        isActive: true
    },
    { 
        name: 'GOD MODE (Unlimited)', 
        price: 999.90, 
        limits: { maxUsers: 999, maxWaMessages: 999999, maxSms: 999999, maxLeads: 999999, maxPbxMinutes: 999999 },
        isActive: true
    }
];

const seedPlans = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection established.');
        
        for (const plan of plans) {
            const [p, created] = await SubscriptionPlan.findOrCreate({
                where: { name: plan.name },
                defaults: plan
            });
            if (created) {
                console.log(`Plan Created: ${plan.name}`);
            } else {
                console.log(`Plan Exists: ${plan.name} - Updating limits...`);
                await p.update({ limits: plan.limits, price: plan.price });
            }
        }
        console.log('All 7 Plans synchronized!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding plans:', error);
        process.exit(1);
    }
};

seedPlans();
