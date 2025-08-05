'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('permissions', 'codename', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      after: 'id'
    });

    // Add index for better performance
    await queryInterface.addIndex('permissions', ['codename']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('permissions', 'codename');
  }
};