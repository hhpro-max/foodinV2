const OrderRepository = require('../repositories/order.repository');
const OrderItemRepository = require('../repositories/order_item.repository');
const InvoiceService = require('./invoice.service');
const CartRepository = require('../repositories/cart.repository');
const UserRepository = require('../repositories/user.repository');
const { sequelize } = require('../models');

class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository(sequelize);
    this.orderItemRepository = new OrderItemRepository(sequelize);
    this.invoiceService = new InvoiceService(sequelize);
    this.cartRepository = new CartRepository(sequelize);
    this.userRepository = new UserRepository(sequelize);
  }

  async createOrder(buyerId) {
    const cart = await this.cartRepository.findByBuyer(buyerId);
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const total = cart.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    const order = await this.orderRepository.create({
      buyerId,
      total,
      status: 'pending',
    });

    const itemsBySeller = {};
    for (const item of cart.items) {
      const sellerId = item.product.sellerId;
      if (!itemsBySeller[sellerId]) {
        itemsBySeller[sellerId] = [];
      }
      itemsBySeller[sellerId].push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
      await this.orderItemRepository.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
    }

    const adminUser = await this.userRepository.findByRole('admin');
    if (!adminUser) {
      throw new Error('Admin user not found');
    }
    const foodinId = adminUser.id;

    for (const sellerId in itemsBySeller) {
      const items = itemsBySeller[sellerId];
      // Create seller invoice
      await this.invoiceService.createInvoice(foodinId, sellerId, order.id, items);
      // Create buyer invoice
      await this.invoiceService.createInvoice(buyerId, foodinId, order.id, items);
    }

    await this.cartRepository.clearCart(cart.id);

    return this.orderRepository.getOrderById(order.id);
  }
}

module.exports = OrderService;