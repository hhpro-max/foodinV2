'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add stock_quantity column
    await queryInterface.addColumn('products', 'stock_quantity', {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    });

    // Add min_order_quantity column
    await queryInterface.addColumn('products', 'min_order_quantity', {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 1,
    });

    // Add unit column
    await queryInterface.addColumn('products', 'unit', {
      type: Sequelize.ENUM('piece', 'kg', 'g', 'lb', 'oz', 'liter', 'ml', 'm', 'cm', 'mm'),
      allowNull: false,
      defaultValue: 'piece',
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove columns in reverse order
    await queryInterface.removeColumn('products', 'unit');
    await queryInterface.removeColumn('products', 'min_order_quantity');
    await queryInterface.removeColumn('products', 'stock_quantity');
  }
};