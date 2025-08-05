const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id',
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
  tableName: 'categories',
});

// Define associations
Category.associate = function(models) {
  // Category has many Products
  Category.hasMany(models.Product, {
    foreignKey: 'categoryId',
    as: 'products',
  });
  
  // Category belongs to Parent Category (self-reference)
  Category.belongsTo(models.Category, {
    foreignKey: 'parentId',
    as: 'parent',
  });
  
  // Category has many Child Categories (self-reference)
  Category.hasMany(models.Category, {
    foreignKey: 'parentId',
    as: 'children',
  });
};

module.exports = Category;
