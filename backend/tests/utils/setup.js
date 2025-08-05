// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '7d';

const sequelize = require('../../src/config/sequelize');
const { User, Profile, NaturalPerson, LegalPerson } = require('../../src/models');
const { seedDatabase } = require('../../scripts/seed');

// Set timeout for tests
jest.setTimeout(30000);

// Setup before all tests
beforeAll(async () => {
  // Connect to database
  try {
    await sequelize.sync({ force: true });
    console.log('Database synchronized for tests');
    await seedDatabase({ closeConnection: false });
  } catch (error) {
    console.error('Unable to synchronize and seed the database:', error);
    process.exit(1);
  }
});

// Cleanup after each test
afterEach(async () => {
  // Clean up database tables
  await User.destroy({ where: {}, truncate: true, cascade: true });
  await Profile.destroy({ where: {}, truncate: true, cascade: true });
  await NaturalPerson.destroy({ where: {}, truncate: true, cascade: true });
  await LegalPerson.destroy({ where: {}, truncate: true, cascade: true });
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connection
  await sequelize.close();
});