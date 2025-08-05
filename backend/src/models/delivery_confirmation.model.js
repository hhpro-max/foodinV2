const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Invoice = require('./invoice.model');
const User = require('./user.model');

const DeliveryConfirmation = sequelize.define('DeliveryConfirmation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  invoiceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Invoice,
      key: 'id',
    },
  },
  buyerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'delivery_confirmations',
});

module.exports = DeliveryConfirmation;
