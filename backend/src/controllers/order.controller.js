const OrderService = require('../services/order.service');
const catchAsync = require('../utils/catchAsync');

class OrderController {
  constructor() {
    this.orderService = new OrderService();
  }

  createOrder = catchAsync(async (req, res) => {
    const order = await this.orderService.createOrder(req.user.id);
    res.status(201).json(order);
  });
}

module.exports = OrderController;