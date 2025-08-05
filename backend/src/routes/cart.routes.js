const express = require('express');
const cartController = require('../controllers/cart.controller');
const { validateRequest, validateParams, validateQuery, commonSchemas } = require('../middlewares/validateRequest');
const auth = require('../middlewares/auth');
const {
  addToCartSchema,
  updateCartItemSchema,
  prepareCheckoutSchema,
  bulkAddSchema,
  bulkUpdateSchema,
  productIdSchema,
  adminQuerySchema
} = require('../validations/cart.validation');

const router = express.Router();

// Apply authentication to all routes
router.use(auth.authenticate);

// Buyer routes
router.get('/', cartController.getCart);
router.get('/summary', cartController.getCartSummary);
router.get('/by-seller', cartController.getCartItemsBySeller);
router.get('/validate', cartController.validateCart);

router.post('/add', 
  validateRequest(addToCartSchema), 
  cartController.addToCart
);

router.post('/add-multiple', 
  validateRequest(bulkAddSchema), 
  cartController.addMultipleToCart
);

router.post('/checkout/prepare', 
  validateRequest(prepareCheckoutSchema), 
  cartController.prepareCheckout
);

router.put('/items/:product_id', 
  validateParams(commonSchemas.product_id),
  validateRequest(updateCartItemSchema),
  cartController.updateCartItem
);

router.put('/items/bulk-update', 
  validateRequest(bulkUpdateSchema), 
  cartController.updateMultipleCartItems
);

router.delete('/items/:product_id', 
  validateParams(commonSchemas.product_id),
  cartController.removeFromCart
);

router.delete('/clear', cartController.clearCart);

// Admin routes
router.get('/admin/stats', 
  auth.authorize(['admin']), 
  cartController.getCartStats
);

router.get('/admin/abandoned', 
  auth.authorize(['admin']),
  validateQuery(adminQuerySchema),
  cartController.getAbandonedCarts
);

module.exports = router;