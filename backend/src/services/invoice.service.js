const InvoiceRepository = require('../repositories/invoice.repository');
const InvoiceItemRepository = require('../repositories/invoice_item.repository');

class InvoiceService {
  constructor(sequelize) {
    this.invoiceRepository = new InvoiceRepository(sequelize);
    this.invoiceItemRepository = new InvoiceItemRepository(sequelize);
  }

  async createInvoice(buyerId, sellerId, orderId, items) {
    const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    const invoice = await this.invoiceRepository.create({
      buyerId,
      sellerId,
      orderId,
      total,
      status: 'pending',
    });

    for (const item of items) {
      await this.invoiceItemRepository.create({
        invoice_id: invoice.id,
        ...item,
      });
    }

    return invoice;
  }

  async markInvoiceAsPaid(invoiceId) {
    return this.invoiceRepository.update(invoiceId, { status: 'paid' });
  }
  async getInvoicesByOrderId(orderId) {
    return this.invoiceRepository.findByOrderId(orderId);
  }
}

module.exports = InvoiceService;
