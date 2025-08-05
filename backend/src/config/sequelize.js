const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://foodin_user:foodin_password@localhost:5432/foodin_db', {
  dialect: 'postgres',
  logging: false, // Disable logging for cleaner output
  define: {
    underscored: true,
  },
});

module.exports = sequelize;
