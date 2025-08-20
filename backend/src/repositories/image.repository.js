const BaseRepository = require('./base.repository');
const { ProductImage } = require('../models');

class ImageRepository extends BaseRepository {
  constructor(sequelize) {
    super(sequelize, ProductImage);
  }

  async createForProduct(productId, imageUrl, filename, displayOrder, isPrimary = false) {
    return await this.create({
      productId,
      url: imageUrl,
      displayOrder,
      isPrimary: isPrimary || false,
    });
  }

  async getImagesByProductId(productId) {
    return await this.findAll({
      where: { productId },
      order: [['displayOrder', 'ASC']],
    });
  }

  async getPrimaryImage(productId) {
    return await this.findOne({
      where: { 
        productId,
        isPrimary: true 
      },
    });
  }

  async updateImageDisplayOrder(imageId, newOrder) {
    return await this.update(imageId, { displayOrder: newOrder });
  }

  async deleteImage(imageId) {
    return await this.delete(imageId);
  }

  async deleteImagesByProductId(productId) {
    return await this.destroy({
      where: { productId },
    });
  }
}

module.exports = ImageRepository;