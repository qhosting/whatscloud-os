import { sequelize } from '../config/database.js';
import { CrmTask } from '../models/index.js';

const syncTable = async () => {
    try {
        await sequelize.authenticate();
        console.log("DB connection OK");
        await CrmTask.sync({ alter: true });
        console.log("CrmTask table synced successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error syncing table:", error);
        process.exit(1);
    }
}

syncTable();
