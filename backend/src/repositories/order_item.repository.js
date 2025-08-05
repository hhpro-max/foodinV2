const OrderItem = require('../models/order_item.model');
const BaseRepository = require('./base.repository');

class OrderItemRepository extends BaseRepository {
  constructor() {
    super(OrderItem);
  }
}

module.exports = OrderItemRepository;