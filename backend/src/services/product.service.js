const ApiError = require('../utils/ApiError');
const path = require('path');
const fs = require('fs').promises;

class ProductService {
  constructor({ productRepo, userRepo, categoryRepo, productImageRepo, productApprovalRepo, tagRepo, notificationService, imageService }) {
    this.productRepo = productRepo;
    this.userRepo = userRepo;
    this.categoryRepo = categoryRepo;
    this.productImageRepo = productImageRepo;
    this.productApprovalRepo = productApprovalRepo;
    this.tagRepo = tagRepo;
    this.notificationService = notificationService;
    this.imageService = imageService;
  }

  async createProduct(sellerId, productData, imageFiles = []) {
    // Verify seller exists
    const seller = await this.userRepo.findById(sellerId);
    if (!seller) {
      throw ApiError.notFound('Seller not found');
    }

    // Validate category if provided
    if (productData.category_id) {
      const category = await this.categoryRepo.findById(productData.category_id);
      if (!category) {
        throw ApiError.notFound('Category not found');
      }
    }

    // Create product with pending status
    const product = await this.productRepo.create({
      sellerId: sellerId,
      name: productData.name,
      description: productData.description,
      categoryId: productData.category_id,
      purchasePrice: productData.purchase_price,
      stockQuantity: productData.stock_quantity || 0,
      minOrderQuantity: productData.min_order_quantity || 1,
      unit: productData.unit || 'piece',
      weight: productData.weight,
      dimensions: productData.dimensions && productData.dimensions !== '' ? JSON.stringify(productData.dimensions) : null,
      status: 'pending',
      is_active: true,
    });

    // Handle image uploads
    if (imageFiles && imageFiles.length > 0) {
      await this.imageService.saveProductImages(product.id, imageFiles);
    }

    // Handle tags
    if (productData.tags && productData.tags !== '' && productData.tags.length > 0) {
      await this.handleProductTags(product.id, productData.tags);
    }

    // Notify admins about new product for approval
    if (this.notificationService) {
      await this.notificationService.notifyAdmins('product', {
        type: 'product_pending_approval',
        title: 'New Product Pending Approval',
        message: `Product "${product.name}" by ${seller.first_name || seller.phone} is pending approval`,
        related_id: product.id,
        related_type: 'product',
      });
    }

    return await this.getProductById(product.id);
  }

  async updateProduct(productId, sellerId, productData, imageFiles = []) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Verify ownership
    if (product.seller_id !== sellerId) {
      throw ApiError.forbidden('You can only update your own products');
    }

    // Don't allow updates to approved products without admin approval
    if (product.status === 'approved') {
      throw ApiError.badRequest('Approved products cannot be modified. Contact admin for changes.');
    }

    // Validate category if provided
    if (productData.category_id) {
      const category = await this.categoryRepo.findById(productData.category_id);
      if (!category) {
        throw ApiError.notFound('Category not found');
      }
    }

    // Update product
    const updateData = {
      name: productData.name,
      description: productData.description,
      categoryId: productData.category_id,
      purchasePrice: productData.purchase_price,
      stockQuantity: productData.stock_quantity,
      minOrderQuantity: productData.min_order_quantity,
      unit: productData.unit,
      weight: productData.weight,
      dimensions: productData.dimensions && productData.dimensions !== '' ? JSON.stringify(productData.dimensions) : null,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedProduct = await this.productRepo.update(productId, updateData);

    // Handle new images
    if (imageFiles && imageFiles.length > 0) {
      await this.imageService.saveProductImages(productId, imageFiles);
    }

    // Handle tags
    if (productData.tags && productData.tags !== '' && productData.tags.length > 0) {
      await this.handleProductTags(productId, productData.tags);
    }

    return await this.getProductById(productId);
  }

  async deleteProduct(productId, sellerId) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Verify ownership
    if (product.seller_id !== sellerId) {
      throw ApiError.forbidden('You can only delete your own products');
    }

    // Soft delete by setting is_active to false
    await this.productRepo.update(productId, { is_active: false });

    return { message: 'Product deleted successfully' };
  }

  async getProductById(productId) {
    const product = await this.productRepo.findWithDetails(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Parse dimensions if exists
    if (product.dimensions) {
      try {
        product.dimensions = JSON.parse(product.dimensions);
      } catch (error) {
        product.dimensions = null;
      }
    }

    return product;
  }

  async getSellerProducts(sellerId, filters = {}) {
    const { page = 1, limit = 20, status, category_id } = filters;
    const offset = (page - 1) * limit;

    const conditions = {};
    if (status) conditions.status = status;
    if (category_id) conditions.categoryId = category_id;

    const products = await this.productRepo.findBySeller(
      sellerId,
      conditions,
      [['createdAt', 'DESC']],
      limit,
      offset
    );

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: products.length,
      },
    };
  }

  async getApprovedProducts(filters = {}) {
    const { page = 1, limit = 20, category_id, search } = filters;
    const offset = (page - 1) * limit;

    const conditions = {
      status: 'approved',
      is_active: true,
    };
    if (category_id) {
      conditions.categoryId = category_id;
    }

    let products;
    if (search) {
      products = await this.productRepo.searchProducts(search, filters, limit, offset);
    } else {
      products = await this.productRepo.findApprovedWithTagsAndImages(
        conditions,
        [['createdAt', 'DESC']],
        limit,
        offset
      );
    }

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: products.length,
      },
    };
  }

  async getPendingProducts(filters = {}) {
    const { page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    const products = await this.productRepo.findPendingApproval(limit, offset);

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: products.length,
      },
    };
  }

  async approveProduct(productId, adminId, approvalData) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    if (product.status !== 'pending') {
      throw ApiError.badRequest('Only pending products can be approved');
    }

    const t = await this.productRepo.sequelize.transaction();

    try {
      // Update product status, sale price, and activate product
      await product.update(
        {
          status: 'approved',
          salePrice: approvalData.sale_price,
          is_active: true,
        },
        { transaction: t }
      );

      // Create approval record
      await this.productApprovalRepo.create({
        productId,
        adminId,
        salePrice: approvalData.sale_price,
        approvedAt: new Date(),
        notes: approvalData.notes || null,
      }, { transaction: t });

      await t.commit();

      // Notify seller
      if (this.notificationService) {
        await this.notificationService.notifyUser(product.seller_id, {
          type: 'product_approved',
          title: 'Product Approved',
          message: `Your product "${product.name}" has been approved and is now available for sale`,
          related_id: productId,
          related_type: 'product',
        });
      }

      return await this.getProductById(productId);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async rejectProduct(productId, adminId, rejectionData) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    if (product.status !== 'pending') {
      throw ApiError.badRequest('Only pending products can be rejected');
    }

    const t = await this.productRepo.sequelize.transaction();

    try {
      // Update product status
      await product.update(
        {
          status: 'rejected',
        },
        { transaction: t }
      );

      // Create approval record
      await this.productApprovalRepo.create({
        productId,
        adminId,
        salePrice: null,
        approvedAt: null,
        notes: rejectionData.notes || 'Product rejected',
      }, { transaction: t });

      await t.commit();

      // Notify seller
      if (this.notificationService) {
        await this.notificationService.notifyUser(product.seller_id, {
          type: 'product_rejected',
          title: 'Product Rejected',
          message: `Your product "${product.name}" has been rejected. Reason: ${rejectionData.notes || 'No reason provided'}`,
          related_id: productId,
          related_type: 'product',
        });
      }

      return await this.getProductById(productId);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async updateStock(productId, quantity, operation = 'add') {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const stockChange = operation === 'subtract' ? -Math.abs(quantity) : Math.abs(quantity);
    const updatedProduct = await this.productRepo.updateStock(productId, stockChange);

    if (updatedProduct.stockQuantity < 0) {
      throw ApiError.badRequest('Insufficient stock');
    }

    return updatedProduct;
  }


  async handleProductTags(productId, tagNames) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const tags = await Promise.all(
      tagNames.map(name =>
        this.tagRepo.findOrCreateByName(name).then(([tag]) => tag)
      )
    );

    await product.setTags(tags);
  }

  async getProductStats() {
    const stats = await this.productRepo.getProductStats();
    return stats;
  }

  async getTopSellingProducts(limit = 10) {
    const products = await this.productRepo.getTopSellingProducts(limit);
    return products;
  }

  async getLowStockProducts(threshold = 10, limit = 50) {
    const products = await this.productRepo.getLowStockProducts(threshold, limit);
    return products;
  }

  async getAllProducts({ page = 1, limit = 20, status, seller_id, category_id }) {
    const offset = (page - 1) * limit;

    const conditions = {};
    if (status) conditions.status = status;
    if (seller_id) conditions.sellerId = seller_id;
    if (category_id) conditions.categoryId = category_id;

    const products = await this.productRepo.findAll(
      conditions,
      [['createdAt', 'DESC']],
      limit,
      offset
    );

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: products.length,
      },
    };
  }
}

module.exports = ProductService;