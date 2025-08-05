const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Tag = sequelize.define('Tag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'tags',
  timestamps: false,
});

// Define associations
Tag.associate = function(models) {
  // Tag belongs to many Products
  Tag.belongsToMany(models.Product, {
    through: models.ProductTag,
    foreignKey: 'tagId',
    otherKey: 'productId',
    as: 'products',
  });
};

module.exports = Tag;
