const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Invoice = require('./invoice.model');
const User = require('./user.model');

const DeliveryConfirmation = sequelize.define(
  'DeliveryConfirmation',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    buyerInvoiceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Invoice,
        key: 'id',
      },
    },
    sellerInvoiceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Invoice,
        key: 'id',
      },
    },
    deliveryCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED'),
      defaultValue: 'PENDING',
    },
  },
  {
    timestamps: true,
    tableName: 'delivery_confirmations',
  }
);

module.exports = DeliveryConfirmation;
