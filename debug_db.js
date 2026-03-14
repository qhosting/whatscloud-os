import { sequelize } from './server/config/database.js';

async function check() {
  try {
    const [results] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'Users';");
    console.log('Columns in Users table:', results.map(r => r.column_name));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
