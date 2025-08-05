const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Product = require('./product.model');
const User = require('./user.model');

const ProductApproval = sequelize.define('ProductApproval', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Product,
      key: 'id',
    },
  },
  adminId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  salePrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'product_approvals',
});

module.exports = ProductApproval;
