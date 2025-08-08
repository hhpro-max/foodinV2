const express = require('express');
const OrderController = require('../controllers/order.controller');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

module.exports = () => {
  const orderController = new OrderController();

  /**
   * @swagger
   * /orders/create:
   *   post:
   *     summary: Create a new order from the user's cart
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       201:
   *         description: Order created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Order'
   *       400:
   *         description: Validation error or cart is empty
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.post('/create', authenticate, orderController.createOrder);

  return router;
};