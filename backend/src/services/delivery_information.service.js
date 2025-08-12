const DeliveryInformationRepository = require('../repositories/delivery_information.repository');

class DeliveryInformationService {
  constructor() {
    this.deliveryInformationRepository = new DeliveryInformationRepository();
  }

  async createDeliveryInformation(data) {
    return this.deliveryInformationRepository.create(data);
  }

  async getDeliveryInformationById(id) {
    return this.deliveryInformationRepository.findById(id);
  }

  async updateDeliveryInformation(id, data) {
    return this.deliveryInformationRepository.update(id, data);
  }

  async getDeliveryInformationByInvoiceId(invoiceId) {
    return this.deliveryInformationRepository.findByInvoiceId(invoiceId);
  }
}

module.exports = DeliveryInformationService;