const BaseRepository = require('./base.repository');
const { Cart, CartItem, Product, Profile, ProductImage, User } = require('../models');

class CartRepository extends BaseRepository {
  constructor(sequelize) {
    super(sequelize, Cart);
  }

  async findByBuyer(buyerId) {
    return await this.model.findOne({
      where: { buyerId },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'description'],
              include: [
                {
                  model: User,
                  as: 'productSeller',
                  attributes: ['id'],
                  include: [{
                    model: Profile,
                    as: 'profileInfo',
                    attributes: ['firstName', 'lastName']
                  }],
                },
                {
                  model: ProductImage,
                  as: 'productImages',
                  attributes: [['url', 'imageUrl']]
                },
              ],
            },
          ],
        },
      ],
    });
  }

  async findOrCreateCart(buyerId, sessionId = null) {
    let cart = await this.findByBuyer(buyerId);

    if (!cart) {
      cart = await this.create({ buyerId, sessionId });
    }

    return cart;
  }

  async addItem(cartId, productId, quantity, unitPrice) {
    const item = await CartItem.findOne({ where: { cartId, productId } });
    if (item) {
      item.quantity += quantity;
      return await item.save();
    }
    return await CartItem.create({ cartId, productId, quantity, unitPrice });
  }

  async updateItemQuantity(cartId, productId, quantity) {
    const item = await CartItem.findOne({ where: { cartId, productId } });
    if (item) {
      item.quantity = quantity;
      return await item.save();
    }
    return null;
  }

  async removeItem(cartId, productId) {
    return await CartItem.destroy({ where: { cartId, productId } });
  }

  async clearCart(cartId, options = {}) {
    return await CartItem.destroy({ where: { cartId }, ...options });
  }

  async getCartSummary(cartId) {
    const { fn, col, literal } = this.sequelize.Sequelize;
    const summary = await CartItem.findAll({
      where: { cartId },
      attributes: [
        [fn('SUM', col('quantity')), 'totalQuantity'],
        [fn('SUM', literal('"unit_price" * quantity')), 'totalPrice'],
      ],
      raw: true,
    });
    return summary[0];
  }

  async getCartItemsBySeller(cartId) {
    return await CartItem.findAll({
      where: { cartId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['sellerId'],
        },
      ],
      group: ['product.sellerId'],
    });
  }

  async validateCartItems(cartId) {
    // Implementation for validating cart items using Sequelize
  }

  async removeInvalidItems(cartId) {
    // Implementation for removing invalid items using Sequelize
  }

  async updatePrices(cartId) {
    // Implementation for updating prices using Sequelize
  }

  async getCartStats() {
    // Implementation for getting cart stats using Sequelize
  }

  async getAbandonedCarts(daysOld = 7, limit = 100) {
    // Implementation for getting abandoned carts using Sequelize
  }
}

module.exports = CartRepository;