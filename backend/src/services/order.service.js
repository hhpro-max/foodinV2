const OrderRepository = require('../repositories/order.repository');
const OrderItemRepository = require('../repositories/order_item.repository');
const InvoiceService = require('./invoice.service');
const CartRepository = require('../repositories/cart.repository');
const UserRepository = require('../repositories/user.repository');
const DeliveryConfirmationRepository = require('../repositories/delivery_confirmation.repository');
const DeliveryInformationRepository = require('../repositories/delivery_information.repository');
const AddressRepository = require('../repositories/address.repository');
const { sequelize } = require('../models');

class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository(sequelize);
    this.orderItemRepository = new OrderItemRepository(sequelize);
    this.invoiceService = new InvoiceService(sequelize);
    this.cartRepository = new CartRepository(sequelize);
    this.userRepository = new UserRepository(sequelize);
    this.deliveryConfirmationRepository = new DeliveryConfirmationRepository(sequelize);
    this.deliveryInformationRepository = new DeliveryInformationRepository(sequelize);
    this.addressRepository = new AddressRepository(sequelize);
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
      // Correctly access sellerId through productSeller association
      const sellerId = item.product.productSeller.id;
      
      if (!sellerId) {
        throw new Error(`Product ${item.productId} has no sellerId`);
      }
      
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
      const sellerInvoice = await this.invoiceService.createInvoice(
        foodinId,
        sellerId,
        order.id,
        items
      );
      // Create buyer invoice
      const buyerInvoice = await this.invoiceService.createInvoice(
        buyerId,
        foodinId,
        order.id,
        items
      );

      const deliveryCode = Math.floor(100000 + Math.random() * 900000).toString();

      await this.deliveryConfirmationRepository.create({
        buyerInvoiceId: buyerInvoice.id,
        sellerInvoiceId: sellerInvoice.id,
        deliveryCode,
      });

      const buyerAddress = await this.addressRepository.findPrimaryAddress(buyerId);
      const sellerAddress = await this.addressRepository.findWarehouseAddress(sellerId);

      if (!buyerAddress || !sellerAddress) {
        throw new Error('Buyer or seller address not found');
      }

      const deliveryDateRequested = new Date();
      deliveryDateRequested.setDate(deliveryDateRequested.getDate() + 1);

      await this.deliveryInformationRepository.create({
        buyerAddressId: buyerAddress.id,
        sellerAddressId: sellerAddress.id,
        deliveryDateRequested,
        buyerInvoiceId: buyerInvoice.id,
        sellerInvoiceId: sellerInvoice.id,
        status: 'pending',
      });
    }

    await this.cartRepository.clearCart(cart.id);

    return this.orderRepository.getOrderById(order.id);
  }
}

module.exports = OrderService;