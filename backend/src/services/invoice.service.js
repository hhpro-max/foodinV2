const InvoiceRepository = require('../repositories/invoice.repository');
const InvoiceItemRepository = require('../repositories/invoice_item.repository');

class InvoiceService {
  constructor(sequelize) {
    this.invoiceRepository = new InvoiceRepository(sequelize);
    this.invoiceItemRepository = new InvoiceItemRepository(sequelize);
  }

  async createInvoice(buyerId, sellerId, orderId, items) {
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    const invoice = await this.invoiceRepository.create({
      buyerId,
      sellerId,
      orderId,
      totalAmount,
      status: 'pending',
    });

    for (const item of items) {
      await this.invoiceItemRepository.create({
        invoiceId: invoice.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
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

  async getInvoicesByBuyer(buyerId) {
    return this.invoiceRepository.findByBuyer(buyerId);
  }

  async getMyInvoices(userId, roles) {
    const isSeller = roles.some(role => role.name === 'seller');
    const invoices = await this.invoiceRepository.findByUser(userId, isSeller);
    
    return invoices.map(invoice => {
      const plainInvoice = invoice.get({ plain: true });
      
      if (!isSeller) {
        // For buyers, include delivery code if available
        const deliveryConfirmation = invoice.DeliveryConfirmationForBuyer;
        if (deliveryConfirmation) {
          plainInvoice.deliveryCode = deliveryConfirmation.deliveryCode;
        }
      }
      
      return plainInvoice;
    });
  }
}

module.exports = InvoiceService;
