require('dotenv').config({ path: './backend/.env' });
const sequelize = require('../src/config/sequelize');

// Import all models
const models = require('../src/models/index');
const { seedDatabase } = require('./seed');

async function truncateAndReseed() {
  try {
    console.log('🔄 Starting database truncate and reseed process...');
    
    // Sync all models to ensure they exist
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Get all model names
    const modelNames = Object.keys(models);
    
    // Disable foreign key checks
    await sequelize.query('SET CONSTRAINTS ALL DEFERRED;');
    
    // Truncate all tables
    console.log('🗑️  Truncating all tables...');
    for (const modelName of modelNames) {
      const model = models[modelName];
      if (model && typeof model.truncate === 'function') {
        await model.truncate({ cascade: true });
        console.log(`  Truncated table: ${model.tableName || modelName}`);
      }
    }
    
    // Re-enable foreign key checks
    await sequelize.query('SET CONSTRAINTS ALL IMMEDIATE;');
    
    console.log('✅ All tables truncated successfully');
    
    // Run the seeder
    console.log('🌱 Starting reseeding process...');
    await seedDatabase();
    
    console.log('✅ Database truncate and reseed completed successfully!');
    
  } catch (error) {
    console.error('❌ Truncate and reseed failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  truncateAndReseed().catch(console.error);
}

module.exports = { truncateAndReseed };