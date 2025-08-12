const express = require('express');
const {
  validateRequest,
  validateParams,
} = require('../middlewares/validateRequest');
const deliveryInformationValidation = require('../validations/delivery_information.validation');
const deliveryInformationController = require('../controllers/delivery_information.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: DeliveryInformation
 *   description: Delivery information management
 */

/**
 * @swagger
 * /delivery-informations:
 *   post:
 *     summary: Create a new delivery information record
 *     tags: [DeliveryInformation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryInformation'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryInformation'
 */
router
  .route('/')
  .post(
    validateRequest(deliveryInformationValidation.createDeliveryInformation.body),
    deliveryInformationController.createDeliveryInformation
  );

/**
 * @swagger
 * /delivery-informations/{id}:
 *   get:
 *     summary: Get delivery information by ID
 *     tags: [DeliveryInformation]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Delivery information ID
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryInformation'
 *   patch:
 *     summary: Update delivery information
 *     tags: [DeliveryInformation]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Delivery information ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deliveryDateRequested:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryInformation'
 */
router
  .route('/:id')
  .get(
    validateParams(deliveryInformationValidation.updateDeliveryInformation.params),
    deliveryInformationController.getDeliveryInformationById
  )
  .patch(
    validateParams(deliveryInformationValidation.updateDeliveryInformation.params),
    validateRequest(deliveryInformationValidation.updateDeliveryInformation.body),
    deliveryInformationController.updateDeliveryInformation
  );

/**
 * @swagger
 * /delivery-informations/invoice/{invoiceId}:
 *   get:
 *     summary: Get delivery information by invoice ID
 *     tags: [DeliveryInformation]
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryInformation'
 */
router
  .route('/invoice/:invoiceId')
  .get(
    validateParams(
      deliveryInformationValidation.getDeliveryInformationByInvoiceId.params
    ),
    deliveryInformationController.getDeliveryInformationByInvoiceId
  );

module.exports = router;