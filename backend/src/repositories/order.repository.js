const Order = require('../models/order.model');
const OrderItem = require('../models/order_item.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Profile = require('../models/profile.model');
const BaseRepository = require('./base.repository');

class OrderRepository extends BaseRepository {
  constructor(sequelize) {
    super(sequelize, Order);
  }

  async getOrderById(orderId) {
    return this.model.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'orderProduct',
              include: [
                {
                  model: User,
                  as: 'productSeller',
                  attributes: ['id'],
                  include: [
                    {
                      model: Profile,
                      as: 'profileInfo',
                      attributes: ['firstName', 'lastName', 'email'],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: 'orderBuyer',
          attributes: ['id'],
          include: [
            {
              model: Profile,
              as: 'profileInfo',
              attributes: ['firstName', 'lastName', 'email'],
            },
          ],
        },
      ],
    });
  }
}

module.exports = OrderRepository;