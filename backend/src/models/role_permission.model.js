const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Role = require('./role.model');
const Permission = require('./permission.model');

const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  roleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Role,
      key: 'id',
    },
  },
  permissionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Permission,
      key: 'id',
    },
  },
}, {
  timestamps: true,
  tableName: 'role_permissions',
});

module.exports = RolePermission;
