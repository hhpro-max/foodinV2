const express = require('express');
const InvoiceController = require('../controllers/invoice.controller');
const { validateRequest, validateParams, commonSchemas } = require('../middlewares/validateRequest');
const { createInvoice } = require('../validations/invoice.validation');
const { authenticate, checkPermission } = require('../middlewares/auth');

const router = express.Router();

module.exports = (sequelize) => {
  const invoiceController = new InvoiceController(sequelize);

  /**
   * @swagger
   * /invoices/create:
   *   post:
   *     summary: Create an invoice
   *     tags: [Invoices]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Invoice'
   *     responses:
   *       201:
   *         description: Invoice created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Invoice'
   *       400:
   *         description: Validation error
   *       500:
   *         description: Server error
   */
  router.post('/create',
    validateRequest(createInvoice),
    (req, res, next) => invoiceController.createInvoice(req, res, next));

  /**
   * @swagger
   * /invoices/{invoiceId}/pay:
   *   patch:
   *     summary: Mark an invoice as paid
   *     tags: [Invoices]
   *     parameters:
   *       - in: path
   *         name: invoiceId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Invoice ID
   *     responses:
   *       200:
   *         description: Invoice marked as paid
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Invoice'
   *       400:
   *         description: Validation error
   *       404:
   *         description: Invoice not found
   *       500:
   *         description: Server error
   */
  router.patch('/:invoiceId/pay',
    validateParams(commonSchemas.invoiceId),
    (req, res, next) => invoiceController.markInvoiceAsPaid(req, res, next)
  );

  /**
   * @swagger
   * /invoices/order/{orderId}:
   *   get:
   *     summary: Get invoices by order ID
   *     tags: [Invoices]
   *     parameters:
   *       - in: path
   *         name: orderId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Order ID
   *     responses:
   *       200:
   *         description: List of invoices for the order
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Invoice'
   *       400:
   *         description: Validation error
   *       404:
   *         description: Order not found
   *       500:
   *         description: Server error
   */
  router.get('/order/:orderId',
    validateParams(commonSchemas.id),
    (req, res, next) => invoiceController.getInvoicesByOrderId(req, res, next)
  );

  /**
   * @swagger
   * /invoices/my-invoices:
   *   get:
   *     summary: Get all invoices for the authenticated user
   *     tags: [Invoices]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: A list of invoices
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Invoice'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  /**
   * @swagger
   * /invoices/my-invoices:
   *   get:
   *     summary: Get all invoices for the authenticated user
   *     tags: [Invoices]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: A list of invoices
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Invoice'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.get('/my-invoices',
    authenticate,
    (req, res, next) => invoiceController.getMyInvoices(req, res, next)
  );

  /**
   * @swagger
   * /invoices:
   *   get:
   *     summary: Get all invoices (requires invoice.view_all permission)
   *     tags: [Invoices]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: A list of all invoices
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Invoice'
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - Insufficient permissions
   *       500:
   *         description: Server error
   */
  router.get('/',
    authenticate,
    checkPermission('invoice.view_all'),
    (req, res, next) => invoiceController.getAllInvoices(req, res, next)
  );

  /**
   * @swagger
   * /invoices/{invoiceId}/pdf:
   *   get:
   *     summary: Generate and download PDF invoice
   *     tags: [Invoices]
   *     parameters:
   *       - in: path
   *         name: invoiceId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Invoice ID
   *     responses:
   *       200:
   *         description: PDF invoice file
   *         content:
   *           application/pdf:
   *             schema:
   *               type: string
   *               format: binary
   *       400:
   *         description: Validation error
   *       404:
   *         description: Invoice not found
   *       500:
   *         description: Server error
   */
  router.get('/:invoiceId/pdf',
    validateParams(commonSchemas.invoiceId),
    (req, res, next) => invoiceController.generateInvoicePDF(req, res, next)
  );

  return router;
};
