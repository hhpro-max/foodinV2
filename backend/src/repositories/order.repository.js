const Order = require('../models/order.model');
const OrderItem = require('../models/order_item.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const BaseRepository = require('./base.repository');

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  async getOrderById(orderId) {
    return this.model.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              include: [
                {
                  model: User,
                  as: 'seller',
                  attributes: ['id', 'firstName', 'lastName', 'email'],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });
  }
}

module.exports = OrderRepository;