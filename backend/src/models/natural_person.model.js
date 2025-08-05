const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./user.model');

const NaturalPerson = sequelize.define('NaturalPerson', {
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
  nationalId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'national_id',
    unique: true,
  },
}, {
  timestamps: true,
  tableName: 'natural_persons',
});

module.exports = NaturalPerson;
