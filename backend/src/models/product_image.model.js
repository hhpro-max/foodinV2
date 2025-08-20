const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ProductImage = sequelize.define('ProductImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id',
    },
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'product_images',
  timestamps: false,
});

// Define associations
ProductImage.associate = function(models) {
  // ProductImage belongs to Product
  ProductImage.belongsTo(models.Product, {
    foreignKey: 'productId',
    as: 'product',
  });
};

module.exports = ProductImage;
