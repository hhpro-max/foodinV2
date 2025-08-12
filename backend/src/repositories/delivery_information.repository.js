const BaseRepository = require('./base.repository');

class DeliveryInformationRepository extends BaseRepository {
  constructor(sequelize) {
    const DeliveryInformation = sequelize.models.DeliveryInformation;
    super(sequelize, DeliveryInformation);
  }

  async findByInvoiceId(invoiceId) {
    const { Op } = require('sequelize');
    return this.findOne({
      
        [Op.or]: [{ buyerInvoiceId: invoiceId }, { sellerInvoiceId: invoiceId }],
      
    });
  }
}

module.exports = DeliveryInformationRepository;