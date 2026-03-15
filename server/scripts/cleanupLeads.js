import { Lead } from '../models/index.js';
import { sequelize } from '../config/database.js';

const cleanupDuplicates = async () => {
    try {
        console.log("--- STARTING DATABASE CLEANUP: DUPLICATE LEADS ---");
        
        // Find duplicate leads (same phone and organizationId)
        const duplicates = await sequelize.query(`
            SELECT phone, "organizationId", COUNT(*) 
            FROM "Leads" 
            GROUP BY phone, "organizationId" 
            HAVING COUNT(*) > 1
        `, { type: sequelize.QueryTypes.SELECT });

        console.log(`Found ${duplicates.length} duplicate patterns.`);

        for (const dup of duplicates) {
            // Keep the one with the latest aiScore or just the latest createdAt
            const allOfThem = await Lead.findAll({
                where: { 
                    phone: dup.phone, 
                    organizationId: dup.organizationId 
                },
                order: [['createdAt', 'DESC']]
            });

            // Keep the first one, delete the rest
            const toDelete = allOfThem.slice(1).map(l => l.id);
            if (toDelete.length > 0) {
                console.log(`Deleting ${toDelete.length} duplicates for phone ${dup.phone}`);
                await Lead.destroy({ where: { id: toDelete } });
            }
        }

        console.log("--- CLEANUP COMPLETED ---");
        process.exit(0);
    } catch (error) {
        console.error("Cleanup Failed:", error);
        process.exit(1);
    }
};

cleanupDuplicates();
