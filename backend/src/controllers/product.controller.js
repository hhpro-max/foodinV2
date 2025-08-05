const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Seller routes
const createProduct = catchAsync(async (req, res) => {
  const sellerId = req.user.id;
  const productData = req.body;
  const imageFiles = req.files || [];

  const product = await req.container.productService.createProduct(
    sellerId,
    productData,
    imageFiles
  );

  res.status(201).json({
    status: 'success',
    data: { product },
  });
});

const updateProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const sellerId = req.user.id;
  const productData = req.body;
  const imageFiles = req.files || [];

  const product = await req.container.productService.updateProduct(
    productId,
    sellerId,
    productData,
    imageFiles
  );

  res.status(200).json({
    status: 'success',
    data: { product },
  });
});

const deleteProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const sellerId = req.user.id;

  const result = await req.container.productService.deleteProduct(productId, sellerId);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const getSellerProducts = catchAsync(async (req, res) => {
  const sellerId = req.user.id;
  const filters = req.query;

  const result = await req.container.productService.getSellerProducts(sellerId, filters);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const updateProductStock = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const { quantity, operation = 'add' } = req.body;

  if (!quantity || quantity <= 0) {
    throw ApiError.badRequest('Quantity must be a positive number');
  }

  const product = await req.container.productService.updateStock(
    productId,
    quantity,
    operation
  );

  res.status(200).json({
    status: 'success',
    data: { product },
  });
});

// Public routes
const getProducts = catchAsync(async (req, res) => {
  const filters = req.query;

  const result = await req.container.productService.getApprovedProducts(filters);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const getProductById = catchAsync(async (req, res) => {
  const { productId } = req.params;

  const product = await req.container.productService.getProductById(productId);

  // Only show approved products to non-admins/sellers (unless it's their own product)
  const isOwner = req.user && product.seller_id === req.user.id;
  const isAdmin = req.user && req.user.roles.includes('admin');

  if (product.status !== 'approved' && !isOwner && !isAdmin) {
    throw ApiError.notFound('Product not found');
  }

  res.status(200).json({
    status: 'success',
    data: { product },
  });
});

const searchProducts = catchAsync(async (req, res) => {
  const { search, category_id, seller_id, page = 1, limit = 20 } = req.query;

  if (!search && !category_id && !seller_id) {
    throw ApiError.badRequest('At least one search parameter is required');
  }

  const result = await req.container.productService.getApprovedProducts({
    search,
    category_id,
    seller_id,
    page,
    limit,
  });

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

// Admin routes
const getPendingProducts = catchAsync(async (req, res) => {
  const filters = req.query;

  const result = await req.container.productService.getPendingProducts(filters);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const approveProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const adminId = req.user.id;
  const approvalData = req.body;

  if (!approvalData.sale_price || approvalData.sale_price <= 0) {
    throw ApiError.badRequest('Sale price is required and must be positive');
  }

  const product = await req.container.productService.approveProduct(
    productId,
    adminId,
    approvalData
  );

  res.status(200).json({
    status: 'success',
    data: { product },
  });
});

const rejectProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const adminId = req.user.id;
  const rejectionData = req.body;

  const product = await req.container.productService.rejectProduct(
    productId,
    adminId,
    rejectionData
  );

  res.status(200).json({
    status: 'success',
    data: { product },
  });
});

const getAllProducts = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, seller_id, category_id } = req.query;

  const result = await req.container.productService.getAllProducts({
    page,
    limit,
    status,
    seller_id,
    category_id
  });

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const getProductStats = catchAsync(async (req, res) => {
  const stats = await req.container.productService.getProductStats();

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

const getTopSellingProducts = catchAsync(async (req, res) => {
  const { limit = 10 } = req.query;

  const products = await req.container.productService.getTopSellingProducts(
    parseInt(limit)
  );

  res.status(200).json({
    status: 'success',
    data: { products },
  });
});

const getLowStockProducts = catchAsync(async (req, res) => {
  const { threshold = 10, limit = 50 } = req.query;

  const products = await req.container.productService.getLowStockProducts(
    parseInt(threshold),
    parseInt(limit)
  );

  res.status(200).json({
    status: 'success',
    data: { products },
  });
});

// Image upload middleware
const uploadProductImages = upload.array('images', 5);

module.exports = {
  // Seller routes
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  updateProductStock,

  // Public routes
  getProducts,
  getProductById,
  searchProducts,

  // Admin routes
  getPendingProducts,
  approveProduct,
  rejectProduct,
  getAllProducts,
  getProductStats,
  getTopSellingProducts,
  getLowStockProducts,

  // Middleware
  uploadProductImages,
};