const BaseRepository = require('./base.repository');
const { ProductImage } = require('../models');

class ProductImageRepository extends BaseRepository {
  constructor(sequelize) {
    super(sequelize, ProductImage);
  }

  async findByProductId(productId) {
    return await this.findAll({ productId });
  }

  async createForProduct(productId, url, altText, displayOrder, isPrimary) {
    return await this.create({ productId, url, altText, displayOrder, isPrimary });
  }
}

module.exports = ProductImageRepository;