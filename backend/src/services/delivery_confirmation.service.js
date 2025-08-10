const { sequelize } = require('../models');
const DeliveryConfirmationRepository = require('../repositories/delivery_confirmation.repository');
const InvoiceRepository = require('../repositories/invoice.repository');
const ApiError = require('../utils/ApiError');

class DeliveryConfirmationService {
  constructor() {
    this.deliveryConfirmationRepository = new DeliveryConfirmationRepository(sequelize);
    this.invoiceRepository = new InvoiceRepository(sequelize);
  }

  async confirmDelivery(deliveryCode, sellerInvoiceId, sellerId) {
    const deliveryConfirmation = await this.deliveryConfirmationRepository.findOne({
      where: {
        deliveryCode,
        sellerInvoiceId
      },
    });

    if (!deliveryConfirmation) {
      throw new ApiError(404, 'Delivery confirmation not found');
    }

    // Verify the seller owns the invoice
    const sellerInvoice = await this.invoiceRepository.findById(sellerInvoiceId);
    
    if (!sellerInvoice) {
      throw new ApiError(404, 'Seller invoice not found');
    }

    if (sellerInvoice.sellerId.toString() !== sellerId.toString()) {
      throw new ApiError(403, 'Forbidden');
    }

    const updatedDeliveryConfirmation = await this.deliveryConfirmationRepository.update(deliveryConfirmation.id, { status: 'CONFIRMED' });

    await this.invoiceRepository.update(deliveryConfirmation.buyerInvoiceId, { status: 'paid' });

    await this.invoiceRepository.update(deliveryConfirmation.sellerInvoiceId, { status: 'paid' });

    return updatedDeliveryConfirmation;
  }
}

module.exports = DeliveryConfirmationService;