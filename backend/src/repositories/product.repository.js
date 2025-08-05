const BaseRepository = require('./base.repository');
const { Product, Category, ProductImage, Tag, User, Profile } = require('../models');

class ProductRepository extends BaseRepository {
  constructor(sequelize) {
    super(sequelize, Product);
  }

  async findWithDetails(id) {
    return await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images', order: [['displayOrder', 'ASC']] },
        { model: Tag, as: 'tags' },
        {
          model: User,
          as: 'seller',
          include: [{ model: Profile, as: 'profile' }],
        },
      ],
    });
  }

  async findBySeller(sellerId, conditions = {}, orderBy = [['createdAt', 'DESC']], limit = null, offset = null) {
    return await Product.findAll({
      where: { sellerId, ...conditions },
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images', order: [['displayOrder', 'ASC']] },
      ],
      order: orderBy,
      limit,
      offset,
    });
  }

  async findApproved(conditions = {}, orderBy = [['createdAt', 'DESC']], limit = null, offset = null) {
    return await Product.findAll({
      where: { status: 'approved', is_active: true, ...conditions },
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images', order: [['displayOrder', 'ASC']] },
        { model: Tag, as: 'tags' },
        {
          model: User,
          as: 'seller',
          include: [{ model: Profile, as: 'profile' }],
        },
      ],
      order: orderBy,
      limit,
      offset,
    });
  }

  async findPendingApproval(limit = null, offset = null) {
    return await Product.findAll({
      where: { status: 'pending' },
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images', order: [['displayOrder', 'ASC']] },
        {
          model: User,
          as: 'seller',
          include: [{ model: Profile, as: 'profile' }],
        },
      ],
      order: [['createdAt', 'ASC']],
      limit,
      offset,
    });
  }

  async searchProducts(searchTerm, categoryId = null, sellerId = null, limit = 20, offset = 0) {
    const { Op } = this.sequelize.Sequelize;
    const where = {
      status: 'approved',
      is_active: true,
    };

    if (searchTerm) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${searchTerm}%` } },
        { description: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    return await Product.findAll({
      where,
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images', order: [['displayOrder', 'ASC']] },
        { model: Tag, as: 'tags' },
        {
          model: User,
          as: 'seller',
          include: [{ model: Profile, as: 'profile' }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }

  async updateStock(productId, quantity) {
    const product = await Product.findByPk(productId);
    if (product) {
      product.stockQuantity += quantity;
      await product.save();
    }
    return product;
  }

  async checkStock(productId, requiredQuantity) {
    const product = await Product.findByPk(productId, {
      attributes: ['stockQuantity'],
    });
    if (!product) return false;
    return product.stockQuantity >= requiredQuantity;
  }

  async getProductStats() {
    const { fn, col } = this.sequelize.Sequelize;
    const stats = await Product.findAll({
      attributes: [
        [fn('COUNT', col('id')), 'totalProducts'],
        [fn('SUM', col('stockQuantity')), 'totalStock'],
        [fn('AVG', col('salePrice')), 'averagePrice'],
      ],
      raw: true,
    });
    return stats[0];
  }

  async getTopSellingProducts(limit = 10) {
    // This would require order data - placeholder for now
    return await Product.findAll({
      where: { status: 'approved', is_active: true },
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images', order: [['displayOrder', 'ASC']] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
    });
  }

  async getLowStockProducts(threshold = 10, limit = 50) {
    const { Op } = this.sequelize.Sequelize;
    return await Product.findAll({
      where: {
        stockQuantity: { [Op.lte]: threshold },
        status: 'approved',
        is_active: true,
      },
      include: [
        { model: Category, as: 'category' },
        {
          model: User,
          as: 'seller',
          include: [{ model: Profile, as: 'profile' }],
        },
      ],
      order: [['stockQuantity', 'ASC']],
      limit,
    });
  }
}

module.exports = ProductRepository;