const { DataTypes, Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  class DeliveryInformation extends Model {
    static associate(models) {
      this.belongsTo(models.Address, { as: 'buyerAddress', foreignKey: 'buyerAddressId' });
      this.belongsTo(models.Address, { as: 'sellerAddress', foreignKey: 'sellerAddressId' });
      this.belongsTo(models.Invoice, { as: 'buyerInvoice', foreignKey: 'buyerInvoiceId' });
      this.belongsTo(models.Invoice, { as: 'sellerInvoice', foreignKey: 'sellerInvoiceId' });
    }
  }

  DeliveryInformation.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true,
      },
      buyerAddressId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'addresses',
          key: 'id',
        },
      },
      sellerAddressId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'addresses',
          key: 'id',
        },
      },
      deliveryDateRequested: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      buyerInvoiceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'invoices',
          key: 'id',
        },
      },
      sellerInvoiceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'invoices',
          key: 'id',
        },
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },
    },
    {
      sequelize,
      modelName: 'DeliveryInformation',
      tableName: 'delivery_informations',
      timestamps: true,
    }
  );

  return DeliveryInformation;
};