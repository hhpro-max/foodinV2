const Invoice = require('../models/invoice.model');
const InvoiceItem = require('../models/invoice_item.model');
const BaseRepository = require('./base.repository');
const { Sequelize } = require('sequelize');

class InvoiceRepository extends BaseRepository {
  constructor(sequelize) {
    super(sequelize, Invoice);
  }

  async findByBuyer(buyerId) {
    return await this.model.findAll({
      where: { buyerId },
      include: [
        {
          model: InvoiceItem,
          as: 'invoiceItems',
        },
      ],
    });
  }

  async findByIdWithDetails(invoiceId) {
    return await this.model.findByPk(invoiceId, {
      include: [
        {
          model: InvoiceItem,
          as: 'invoiceItems',
        },
      ],
    });
  }
  async findByOrderId(orderId) {
    return await this.model.findAll({
      where: { orderId },
      include: [
        {
          model: InvoiceItem,
          as: 'invoiceItems',
        },
      ],
    });
  }
  async findByUser(userId, isSeller) {
    const { DeliveryConfirmation } = require('../models');
    const whereClause = isSeller ? { sellerId: userId } : { buyerId: userId };
    
    return await this.model.findAll({
      where: whereClause,
      include: [
        {
          model: InvoiceItem,
          as: 'invoiceItems',
        },
        ...(isSeller
          ? []
          : [
              {
                model: DeliveryConfirmation,
                as: 'DeliveryConfirmationForBuyer',
                required: false,
              },
            ])
      ],
    });
  }
}

module.exports = InvoiceRepository;
