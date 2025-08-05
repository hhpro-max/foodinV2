const InvoiceItem = require('../models/invoice_item.model');

class InvoiceItemRepository {
  async findById(id) {
    return await InvoiceItem.findByPk(id);
  }

  async create(data) {
    return await InvoiceItem.create(data);
  }

  async update(id, data) {
    return await InvoiceItem.update(data, { where: { id } });
  }

  async delete(id) {
    return await InvoiceItem.destroy({ where: { id } });
  }
}

module.exports = InvoiceItemRepository;
