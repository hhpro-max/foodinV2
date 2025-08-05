const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Product = require('./product.model');
const Tag = require('./tag.model');

const ProductTag = sequelize.define('ProductTag', {
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Product,
      key: 'id',
    },
  },
  tagId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Tag,
      key: 'id',
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'product_tags',
  timestamps: false,
});

// Define associations
ProductTag.associate = function(models) {
  // ProductTag belongs to Product
  ProductTag.belongsTo(models.Product, {
    foreignKey: 'productId',
    as: 'product',
  });
  
  // ProductTag belongs to Tag
  ProductTag.belongsTo(models.Tag, {
    foreignKey: 'tagId',
    as: 'tag',
  });
};

module.exports = ProductTag;