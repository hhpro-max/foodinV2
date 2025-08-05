const express = require('express');
const OrderController = require('../controllers/order.controller');
const auth = require('../middlewares/auth');

const router = express.Router();

module.exports = () => {
  const orderController = new OrderController();

  router.post('/create', auth(), orderController.createOrder);

  return router;
};