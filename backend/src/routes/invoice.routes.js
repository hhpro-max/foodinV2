const express = require('express');
const InvoiceController = require('../controllers/invoice.controller');
const { validateParams } = require('../middlewares/validateRequest');
const { orderId } = require('../validations/order.validation');
const { invoiceId } = require('../validations/invoice.validation');

const router = express.Router();

module.exports = (sequelize) => {
  const invoiceController = new InvoiceController(sequelize);

  router.post('/create', (req, res, next) => invoiceController.createInvoice(req, res, next));
  router.patch('/:invoiceId/pay',
    validateParams(invoiceId),
    (req, res, next) => invoiceController.markInvoiceAsPaid(req, res, next)
  );

  router.get('/order/:orderId',
    validateParams(orderId),
    (req, res, next) => invoiceController.getInvoicesByOrderId(req, res, next)
  );

  return router;
};
