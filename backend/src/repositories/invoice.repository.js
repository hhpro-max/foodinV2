const Invoice = require('../models/invoice.model');
const InvoiceItem = require('../models/invoice_item.model');
const BaseRepository = require('./base.repository');

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
    const whereClause = isSeller ? { sellerId: userId } : { buyerId: userId };
    return await this.model.findAll({
      where: whereClause,
      include: [
        {
          model: InvoiceItem,
          as: 'invoiceItems',
        },
      ],
    });
  }
}

module.exports = InvoiceRepository;
