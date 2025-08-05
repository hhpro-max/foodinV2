const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./user.model');
const Category = require('./category.model');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'seller_id',
    references: {
      model: User,
      key: 'id',
    },
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'category_id',
    references: {
      model: Category,
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  purchasePrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'purchase_price',
  },
  salePrice: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'sale_price',
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
}, {
  timestamps: true,
  tableName: 'products',
});

// Define associations
Product.associate = function(models) {
  // Product belongs to User (seller)
  Product.belongsTo(models.User, {
    foreignKey: 'sellerId',
    as: 'seller',
  });
  
  // Product belongs to Category
  Product.belongsTo(models.Category, {
    foreignKey: 'categoryId',
    as: 'category',
  });
  
  // Product has many ProductImages
  Product.hasMany(models.ProductImage, {
    foreignKey: 'productId',
    as: 'images',
  });
  
  // Product belongs to many Tags
  Product.belongsToMany(models.Tag, {
    through: models.ProductTag,
    foreignKey: 'productId',
    otherKey: 'tagId',
    as: 'tags',
  });

  Product.hasMany(models.ProductApproval, {
    foreignKey: 'productId',
    as: 'approvals',
  });
};

module.exports = Product;
