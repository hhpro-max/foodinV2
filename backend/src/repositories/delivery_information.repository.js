const { DeliveryInformation } = require('../models');
const BaseRepository = require('./base.repository');

class DeliveryInformationRepository extends BaseRepository {
  constructor() {
    super(DeliveryInformation);
  }

  async findByInvoiceId(invoiceId) {
    const { Op } = require('sequelize');
    return this.findOne({
      where: {
        [Op.or]: [{ buyerInvoiceId: invoiceId }, { sellerInvoiceId: invoiceId }],
      },
    });
  }
}

module.exports = DeliveryInformationRepository;