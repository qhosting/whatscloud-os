import { Lead } from '../models/index.js';
import { sequelize } from '../config/database.js';

const targetDups = async () => {
    try {
        console.log("--- AGGRESSIVE CLEANUP ---");
        const allLeads = await Lead.findAll();
        console.log(`Analyzing ${allLeads.length} leads...`);
        
        const seen = new Set();
        const toDeleteIds = [];

        for (const lead of allLeads) {
            const cleanPhone = (lead.phone || '').replace(/\D/g, ''); // Extract only digits
            const key = `${cleanPhone}_${lead.organizationId}`;
            
            if (seen.has(key)) {
                toDeleteIds.push(lead.id);
            } else {
                seen.add(key);
            }
        }

        if (toDeleteIds.length > 0) {
            console.log(`Deleting ${toDeleteIds.length} semantic duplicates...`);
            await Lead.destroy({ where: { id: toDeleteIds } });
        } else {
            console.log("No semantic duplicates found.");
        }
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

targetDups();
