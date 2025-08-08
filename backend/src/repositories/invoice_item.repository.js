const InvoiceItem = require('../models/invoice_item.model');
const BaseRepository = require('./base.repository');

class InvoiceItemRepository extends BaseRepository {
  constructor(sequelize) {
    super(sequelize, InvoiceItem);
  }
}

module.exports = InvoiceItemRepository;
