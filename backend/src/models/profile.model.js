const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./user.model');

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: User,
      key: 'id',
    },
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'first_name',
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'last_name',
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'email',
  },
  customerCode: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'customer_code',
    unique: true,
  },
}, {
  timestamps: true,
  tableName: 'profiles',
});

// Define associations
Profile.associate = function(models) {
  // Profile belongs to User
  Profile.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
  });
};

module.exports = Profile;
