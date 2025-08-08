const request = require('supertest');
const app = require('../../src/app');
const {
  User,
  Product,
  Cart,
  CartItem,
  Order,
  Invoice,
  sequelize
} = require('../../src/models');
const TokenService = require('../../src/services/token.service');
const moment = require('moment');
const jwt = require('jsonwebtoken');

describe('Order Routes', () => {
  let buyer, seller1, seller2, product1, product2, token;

  beforeAll(async () => {
    await sequelize.sync({
      force: true
    });

    // Manually initialize the container
    app.use((req, res, next) => {
      req.container = {
        userRepo: require('../../src/repositories/user.repository')(sequelize),
        profileRepo: require('../../src/repositories/profile.repository')(sequelize),
        addressRepo: require('../../src/repositories/address.repository')(sequelize),
        productRepo: require('../../src/repositories/product.repository')(sequelize),
        categoryRepo: require('../../src/repositories/category.repository')(sequelize),
        cartRepo: require('../../src/repositories/cart.repository')(sequelize),
        naturalPersonRepo: require('../../src/repositories/natural_person.repository')(sequelize),
        legalPersonRepo: require('../../src/repositories/legal_person.repository')(sequelize),
        roleRepo: require('../../src/repositories/role.repository')(sequelize),
        productImageRepo: require('../../src/repositories/product_image.repository')(sequelize),
        productApprovalRepo: require('../../src/repositories/product_approval.repository')(sequelize),
        tagRepo: require('../../src/repositories/tag.repository')(sequelize),
        userService: require('../../src/services/user.service')(sequelize),
        cartService: require('../../src/services/cart.service')(sequelize),
      };
      next();
    });

    buyer = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'buyer@example.com',
      password: 'password123',
      phone: '1234567890',
      isEmailVerified: true,
    });
    seller1 = await User.create({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'seller1@example.com',
      password: 'password123',
      phone: '1234567891',
      isEmailVerified: true,
    });
    seller2 = await User.create({
      firstName: 'Jim',
      lastName: 'Beam',
      email: 'seller2@example.com',
      password: 'password123',
      phone: '1234567892',
      isEmailVerified: true,
    });

    product1 = await Product.create({
      name: 'Product 1',
      description: 'Description 1',
      price: 10,
      purchasePrice: 5,
      stock: 100,
      sellerId: seller1.id,
    });
    product2 = await Product.create({
      name: 'Product 2',
      description: 'Description 2',
      price: 20,
      purchasePrice: 10,
      stock: 100,
      sellerId: seller2.id,
    });

    const cart = await Cart.create({
      buyerId: buyer.id
    });
    await CartItem.create({
      cartId: cart.id,
      productId: product1.id,
      quantity: 2
    });
    await CartItem.create({
      cartId: cart.id,
      productId: product2.id,
      quantity: 1
    });

    // Generate token with correct secret
    token = jwt.sign(
      { sub: buyer.id, iat: moment().unix(), exp: moment().add(15, 'minutes').unix(), type: 'access' },
      process.env.JWT_SECRET
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/v1/orders/create', () => {
    it('should create an order and generate invoices for each seller', async () => {
      const res = await request(app)
        .post('/api/v1/orders/create')
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe('pending');
      expect(res.body.total).toBe(40); // (2 * 10) + (1 * 20)
      expect(res.body.items).toHaveLength(2);

      const order = await Order.findByPk(res.body.id, {
        include: ['items']
      });
      expect(order).not.toBeNull();

      const invoices = await Invoice.findAll({
        where: {
          orderId: order.id
        }
      });
      expect(invoices).toHaveLength(2);

      const seller1Invoice = invoices.find(inv => inv.sellerId === seller1.id);
      const seller2Invoice = invoices.find(inv => inv.sellerId === seller2.id);

      expect(seller1Invoice).not.toBeNull();
      expect(seller1Invoice.total).toBe(20);
      expect(seller2Invoice).not.toBeNull();
      expect(seller2Invoice.total).toBe(20);

      const cart = await Cart.findOne({
        where: {
          userId: buyer.id
        },
        include: ['items']
      });
      expect(cart.items).toHaveLength(0);
    });

    it('should return 401 if user is not authenticated', async () => {
      await request(app)
        .post('/api/v1/orders/create')
        .expect(401);
    });
  });

  describe('GET /api/v1/invoices/order/:orderId', () => {
    let order;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/v1/orders/create')
        .set('Authorization', `Bearer ${token}`);
      order = res.body;
    });

    it('should return all invoices for a given order', async () => {
      const res = await request(app)
        .get(`/api/v1/invoices/order/${order.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveLength(2);
    });

    it('should return 401 if user is not authenticated', async () => {
      await request(app)
        .get(`/api/v1/invoices/order/${order.id}`)
        .expect(401);
    });

    it('should return 400 if orderId is not a valid UUID', async () => {
      await request(app)
        .get('/api/v1/invoices/order/invalid-uuid')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });
  });
});