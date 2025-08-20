'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add is_primary column to product_images table
    await queryInterface.addColumn('product_images', 'is_primary', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove is_primary column from product_images table
    await queryInterface.removeColumn('product_images', 'is_primary');
  }
};