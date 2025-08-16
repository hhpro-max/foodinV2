'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add salePrice column
    await queryInterface.addColumn('product_approvals', 'sale_price', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    });

    // Add approvedAt column
    await queryInterface.addColumn('product_approvals', 'approved_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Remove status column
    await queryInterface.removeColumn('product_approvals', 'status');

    // Change admin_id to not allow null values
    await queryInterface.changeColumn('product_approvals', 'admin_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down (queryInterface, Sequelize) {
    // Change admin_id back to allow null values
    await queryInterface.changeColumn('product_approvals', 'admin_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Add status column back
    await queryInterface.addColumn('product_approvals', 'status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    });

    // Remove approvedAt column
    await queryInterface.removeColumn('product_approvals', 'approved_at');

    // Remove salePrice column
    await queryInterface.removeColumn('product_approvals', 'sale_price');
  }
};