const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const getCart = catchAsync(async (req, res) => {
  const buyerId = req.user.id;
  
  const result = await req.container.cartService.getCart(buyerId);
  
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const addToCart = catchAsync(async (req, res) => {
  const buyerId = req.user.id;
  const { product_id, quantity = 1 } = req.body;
  
  if (!product_id) {
    throw ApiError.badRequest('Product ID is required');
  }
  
  if (quantity <= 0) {
    throw ApiError.badRequest('Quantity must be positive');
  }
  
  const result = await req.container.cartService.addToCart(buyerId, product_id, quantity);
  
  res.status(200).json({
    status: 'success',
    data: result,
    message: 'Item added to cart successfully',
  });
});

const updateCartItem = catchAsync(async (req, res) => {
  const buyerId = req.user.id;
  const { product_id } = req.params;
  const { quantity } = req.body;
  
  if (quantity < 0) {
    throw ApiError.badRequest('Quantity cannot be negative');
  }
  
  const result = await req.container.cartService.updateCartItem(buyerId, product_id, quantity);
  
  res.status(200).json({
    status: 'success',
    data: result,
    message: quantity === 0 ? 'Item removed from cart' : 'Cart item updated successfully',
  });
});

const removeFromCart = catchAsync(async (req, res) => {
  const buyerId = req.user.id;
  const { product_id } = req.params;
  
  const result = await req.container.cartService.removeFromCart(buyerId, product_id);
  
  res.status(200).json({
    status: 'success',
    data: result,
    message: 'Item removed from cart successfully',
  });
});

const clearCart = catchAsync(async (req, res) => {
  const buyerId = req.user.id;
  
  const result = await req.container.cartService.clearCart(buyerId);
  
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const getCartItemsBySeller = catchAsync(async (req, res) => {
  const buyerId = req.user.id;
  
  const itemsBySeller = await req.container.cartService.getCartItemsBySeller(buyerId);
  
  res.status(200).json({
    status: 'success',
    data: { sellers: itemsBySeller },
  });
});

const validateCart = catchAsync(async (req, res) => {
  const buyerId = req.user.id;
  
  const result = await req.container.cartService.validateCart(buyerId);
  
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const prepareCheckout = catchAsync(async (req, res) => {
  const buyerId = req.user.id;
  const { address_id } = req.body;
  
  const checkoutData = await req.container.cartService.prepareCheckout(buyerId, address_id);
  
  res.status(200).json({
    status: 'success',
    data: checkoutData,
  });
});

const getCartSummary = catchAsync(async (req, res) => {
  const buyerId = req.user.id;
  
  const summary = await req.container.cartService.getCartSummary(buyerId);
  
  res.status(200).json({
    status: 'success',
    data: summary,
  });
});

// Admin routes
const getCartStats = catchAsync(async (req, res) => {
  const stats = await req.container.cartService.getCartStats();
  
  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

const getAbandonedCarts = catchAsync(async (req, res) => {
  const { days = 7, limit = 100 } = req.query;
  
  const carts = await req.container.cartService.getAbandonedCarts(
    parseInt(days),
    parseInt(limit)
  );
  
  res.status(200).json({
    status: 'success',
    data: { carts },
  });
});

// Bulk operations
const addMultipleToCart = catchAsync(async (req, res) => {
  const buyerId = req.user.id;
  const { items } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw ApiError.badRequest('Items array is required');
  }
  
  const results = [];
  const errors = [];
  
  for (const item of items) {
    try {
      const result = await req.container.cartService.addToCart(
        buyerId,
        item.product_id,
        item.quantity || 1
      );
      results.push({
        product_id: item.product_id,
        success: true,
        data: result,
      });
    } catch (error) {
      errors.push({
        product_id: item.product_id,
        success: false,
        error: error.message,
      });
    }
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      results,
      errors,
      success_count: results.length,
      error_count: errors.length,
    },
  });
});

const updateMultipleCartItems = catchAsync(async (req, res) => {
  const buyerId = req.user.id;
  const { items } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw ApiError.badRequest('Items array is required');
  }
  
  const results = [];
  const errors = [];
  
  for (const item of items) {
    try {
      const result = await req.container.cartService.updateCartItem(
        buyerId,
        item.product_id,
        item.quantity
      );
      results.push({
        product_id: item.product_id,
        success: true,
        data: result,
      });
    } catch (error) {
      errors.push({
        product_id: item.product_id,
        success: false,
        error: error.message,
      });
    }
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      results,
      errors,
      success_count: results.length,
      error_count: errors.length,
    },
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartItemsBySeller,
  validateCart,
  prepareCheckout,
  getCartSummary,
  
  // Admin routes
  getCartStats,
  getAbandonedCarts,
  
  // Bulk operations
  addMultipleToCart,
  updateMultipleCartItems,
};