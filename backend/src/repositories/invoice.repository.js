const Invoice = require('../models/invoice.model');
const InvoiceItem = require('../models/invoice_item.model');
const BaseRepository = require('./base.repository');

class InvoiceRepository extends BaseRepository {
  constructor() {
    super(Invoice);
  }

  async findByBuyer(buyerId) {
    return await this.model.findAll({
      where: { buyerId },
      include: [
        {
          model: InvoiceItem,
          as: 'items',
        },
      ],
    });
  }

  async findByIdWithDetails(invoiceId) {
    return await this.model.findByPk(invoiceId, {
      include: [
        {
          model: InvoiceItem,
          as: 'items',
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
          as: 'items',
        },
      ],
    });
  }
}

module.exports = InvoiceRepository;
