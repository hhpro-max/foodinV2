const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./user.model');

const LegalPerson = sequelize.define('LegalPerson', {
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
  economicCode: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'economic_code',
    unique: true,
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'company_name',
  },
}, {
  timestamps: true,
  tableName: 'legal_persons',
});

module.exports = LegalPerson;
