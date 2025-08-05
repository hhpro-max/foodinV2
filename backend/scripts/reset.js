require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL not set in .env file. Please ensure it is present in backend/.env");
  process.exit(1);
}

const dbName = new URL(databaseUrl).pathname.substring(1);

// Connect to the default 'postgres' database to perform maintenance
const maintenancePool = new Pool({
  connectionString: databaseUrl.replace(/\/[^/]*$/, '/postgres'),
});

async function resetDatabase() {
  const client = await maintenancePool.connect();
  try {
    console.log(`Terminating connections to "${dbName}"...`);
    await client.query(`SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${dbName}' AND pid <> pg_backend_pid();`);
    console.log(`Dropping database "${dbName}"...`);
    await client.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    console.log(`Creating database "${dbName}"...`);
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log('Database reset successfully.');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  } finally {
    client.release();
    await maintenancePool.end();
  }
}

resetDatabase();