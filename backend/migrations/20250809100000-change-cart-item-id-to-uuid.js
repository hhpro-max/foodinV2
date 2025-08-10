'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Enable the pgcrypto extension if not already enabled
      await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', { transaction });

      // Step 1: Drop the existing primary key constraint
      await queryInterface.removeConstraint('cart_items', 'cart_items_pkey', { transaction });

      // Step 2: Drop the old default value
      await queryInterface.sequelize.query(
        'ALTER TABLE "cart_items" ALTER COLUMN "id" DROP DEFAULT;',
        { transaction }
      );

      // Step 3: Change the id column type to UUID using a raw query with USING
      await queryInterface.sequelize.query(
        'ALTER TABLE "cart_items" ALTER COLUMN "id" TYPE UUID USING (gen_random_uuid());',
        { transaction }
      );

      // Step 4: Set the default value for the id column
      await queryInterface.sequelize.query(
        'ALTER TABLE "cart_items" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();',
        { transaction }
      );

      // Step 4: Add the primary key constraint back
      await queryInterface.addConstraint('cart_items', {
        fields: ['id'],
        type: 'primary key',
        name: 'cart_items_pkey',
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Revert the id column from UUID to INTEGER
      // Note: This will fail if the UUIDs are not valid integers.
      // A manual data migration would be needed for a production environment.
      await queryInterface.removeConstraint('cart_items', 'cart_items_pkey', { transaction });
      
      await queryInterface.changeColumn('cart_items', 'id', {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: false,
      }, { transaction });

      await queryInterface.addConstraint('cart_items', {
        fields: ['id'],
        type: 'primary key',
        name: 'cart_items_pkey',
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};