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

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', cartController.getCart);

/**
 * @swagger
 * /cart/summary:
 *   get:
 *     summary: Get cart summary
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartSummary'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/summary', cartController.getCartSummary);

/**
 * @swagger
 * /cart/by-seller:
 *   get:
 *     summary: Get cart items grouped by seller
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart items grouped by seller
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SellerCartGroup'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/by-seller', cartController.getCartItemsBySeller);

/**
 * @swagger
 * /cart/validate:
 *   get:
 *     summary: Validate cart items
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart validation result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartValidation'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/validate', cartController.validateCart);

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartItemRequest'
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/add',
  validateRequest(addToCartSchema),
  cartController.addToCart
);

/**
 * @swagger
 * /cart/add-multiple:
 *   post:
 *     summary: Add multiple items to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/CartItemRequest'
 *     responses:
 *       201:
 *         description: Items added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/add-multiple',
  validateRequest(bulkAddSchema),
  cartController.addMultipleToCart
);

/**
 * @swagger
 * /cart/checkout/prepare:
 *   post:
 *     summary: Prepare cart for checkout
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutPreparation'
 *     responses:
 *       200:
 *         description: Checkout preparation completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CheckoutPreparationResult'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/checkout/prepare',
  validateRequest(prepareCheckoutSchema),
  cartController.prepareCheckout
);

/**
 * @swagger
 * /cart/items/{product_id}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartItemUpdate'
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Server error
 */
router.put('/items/:product_id',
  validateParams(commonSchemas.product_id),
  validateRequest(updateCartItemSchema),
  cartController.updateCartItem
);

/**
 * @swagger
 * /cart/items/bulk-update:
 *   put:
 *     summary: Update multiple cart items
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/BulkCartItemUpdate'
 *     responses:
 *       200:
 *         description: Cart items updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/items/bulk-update',
  validateRequest(bulkUpdateSchema),
  cartController.updateMultipleCartItems
);

/**
 * @swagger
 * /cart/items/{product_id}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Item removed from cart
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Server error
 */
router.delete('/items/:product_id',
  validateParams(commonSchemas.product_id),
  cartController.removeFromCart
);

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Cart cleared successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/clear', cartController.clearCart);

// Admin routes

/**
 * @swagger
 * /cart/admin/stats:
 *   get:
 *     summary: Get cart statistics (Admin only)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/admin/stats',
  auth.checkPermission('cart.statistics'),
  cartController.getCartStats
);

/**
 * @swagger
 * /cart/admin/abandoned:
 *   get:
 *     summary: Get abandoned carts (Admin only)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *         description: Days since last activity
 *     responses:
 *       200:
 *         description: Abandoned carts retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AbandonedCart'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/admin/abandoned',
  auth.checkPermission('cart.abandoned'),
  validateQuery(adminQuerySchema),
  cartController.getAbandonedCarts
);

module.exports = router;