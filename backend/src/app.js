const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const sequelize = require('./config/sequelize');
const models = require('./models');
const { globalErrorHandler, notFound } = require('./middlewares/errorHandler');
const swaggerSpec = require('./config/swagger');

// Import repositories
const UserRepository = require('./repositories/user.repository');
const ProfileRepository = require('./repositories/profile.repository');
const AddressRepository = require('./repositories/address.repository');
const ProductRepository = require('./repositories/product.repository');
const CategoryRepository = require('./repositories/category.repository');
const CartRepository = require('./repositories/cart.repository');
const NaturalPersonRepository = require('./repositories/natural_person.repository');
const LegalPersonRepository = require('./repositories/legal_person.repository');
const RoleRepository = require('./repositories/role.repository');
const ProductImageRepository = require('./repositories/product_image.repository');
const ProductApprovalRepository = require('./repositories/product_approval.repository');
const TagRepository = require('./repositories/tag.repository');

// Import services
const UserService = require('./services/user.service');
const AddressService = require('./services/address.service');
const ProductService = require('./services/product.service');
const CartService = require('./services/cart.service');
const OTPService = require('./services/otp.service');
const AuthService = require('./services/auth.service');
const CategoryService = require('./services/category.service');

// Import routes
const userRoutes = require('./routes/user.routes');
const addressRoutes = require('./routes/address.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const notificationRoutes = require('./routes/notification.routes');
const authRoutes = require('./routes/auth.routes');
const orderRoutes = require('./routes/order.routes');
const deliveryConfirmationRoutes = require('./routes/delivery_confirmation.routes');
const deliveryInformationRoutes = require('./routes/delivery_information.routes');
const categoryRoutes = require('./routes/category.routes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Dependency injection middleware
app.use((req, res, next) => {
  // Initialize repositories
  const userRepo = new UserRepository(sequelize);
  const naturalPersonRepo = new NaturalPersonRepository(sequelize);
  const legalPersonRepo = new LegalPersonRepository(sequelize);
  const profileRepo = new ProfileRepository(sequelize, naturalPersonRepo, legalPersonRepo);
  const addressRepo = new AddressRepository(sequelize);
  const productRepo = new ProductRepository(sequelize);
  const categoryRepo = new CategoryRepository(sequelize);
  const cartRepo = new CartRepository(sequelize);
  const roleRepo = new RoleRepository(sequelize);
  const productImageRepo = new ProductImageRepository(sequelize);
  const productApprovalRepo = new ProductApprovalRepository(sequelize);
  const tagRepo = new TagRepository(sequelize);
  
  // Initialize services
  const otpService = new OTPService({ userRepo });
  const authService = new AuthService({ otpService });
  const userService = new UserService({ userRepo, profileRepo, otpService, roleRepo, naturalPersonRepo, legalPersonRepo });
  const addressService = new AddressService({ addressRepo, userRepo });
  const categoryService = new CategoryService({ categoryRepo });
  const productService = new ProductService({
    productRepo,
    userRepo,
    categoryRepo,
    productImageRepo,
    productApprovalRepo,
    tagRepo,
    notificationService: null // Will be implemented later
  });
  const cartService = new CartService({ cartRepo, productRepo, userRepo });
  
  // Attach to request object
  req.container = {
    userRepo,
    profileRepo,
    addressRepo,
    productRepo,
    categoryRepo,
    cartRepo,
    naturalPersonRepo,
    legalPersonRepo,
    roleRepo,
    productImageRepo,
    productApprovalRepo,
    tagRepo,
    userService,
    addressService,
    categoryService,
    productService,
    cartService,
    otpService,
    authService,
  };
  
  next();
});

// API routes
const apiRouter = express.Router();

// API routes
apiRouter.use('/users', userRoutes);
apiRouter.use('/addresses', addressRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/invoices', invoiceRoutes(sequelize));
apiRouter.use('/notifications', notificationRoutes(sequelize));
apiRouter.use('/auth', authRoutes);
apiRouter.use('/orders', orderRoutes());
apiRouter.use('/delivery-confirmations', deliveryConfirmationRoutes);
apiRouter.use('/delivery-informations', deliveryInformationRoutes);
apiRouter.use('/categories', categoryRoutes);

app.use('/api/v1', apiRouter);

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Handle unhandled routes
app.all('*', notFound);

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;