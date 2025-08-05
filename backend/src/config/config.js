require('dotenv').config({ path: '../../.env' });

module.exports = {
  development: {
    url: process.env.DATABASE_URL || 'postgresql://foodin_user:foodin_password@localhost:5432/foodin_db',
    dialect: 'postgres',
  },
  test: {
    url: process.env.DATABASE_URL || 'postgresql://foodin_user:foodin_password@localhost:5432/foodin_db',
    dialect: 'postgres',
  },
  production: {
    url: process.env.DATABASE_URL || 'postgresql://foodin_user:foodin_password@localhost:5432/foodin_db',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};