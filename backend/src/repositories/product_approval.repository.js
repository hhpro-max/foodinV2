const BaseRepository = require('./base.repository');
const { ProductApproval } = require('../models');

class ProductApprovalRepository extends BaseRepository {
  constructor(sequelize) {
    super(sequelize, ProductApproval);
  }

  async findByProductId(productId) {
    return await this.findAll({ productId });
  }

  async createApproval(productId, adminId, status, salePrice = null, notes = null) {
    return await this.create({ productId, adminId, status, salePrice, notes });
  }
}

module.exports = ProductApprovalRepository;