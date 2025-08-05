const OrderRepository = require('../repositories/order.repository');
const OrderItemRepository = require('../repositories/order_item.repository');
const InvoiceService = require('./invoice.service');
const CartRepository = require('../repositories/cart.repository');
const { sequelize } = require('../models');

class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository();
    this.orderItemRepository = new OrderItemRepository();
    this.invoiceService = new InvoiceService(sequelize);
    this.cartRepository = new CartRepository();
  }

  async createOrder(buyerId) {
    const cart = await this.cartRepository.getCartByUserId(buyerId);
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const total = cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

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
        unitPrice: item.product.price,
      });
      await this.orderItemRepository.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.product.price,
      });
    }

    for (const sellerId in itemsBySeller) {
      const items = itemsBySeller[sellerId];
      await this.invoiceService.createInvoice(buyerId, sellerId, order.id, items);
    }

    await this.cartRepository.clearCart(cart.id);

    return this.orderRepository.getOrderById(order.id);
  }
}

module.exports = OrderService;