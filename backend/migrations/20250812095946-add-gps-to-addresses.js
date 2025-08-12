'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('addresses', 'gps_latitude', {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true,
    });
    await queryInterface.addColumn('addresses', 'gps_longitude', {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('addresses', 'gps_latitude');
    await queryInterface.removeColumn('addresses', 'gps_longitude');
  }
};
