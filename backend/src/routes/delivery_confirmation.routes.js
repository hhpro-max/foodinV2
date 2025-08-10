const express = require('express');
const auth = require('../middlewares/auth');
const validateRequest = require('../middlewares/validateRequest').validateRequest;
const deliveryConfirmationValidation = require('../validations/delivery_confirmation.validation');
const deliveryConfirmationController = require('../controllers/delivery_confirmation.controller');

const router = express.Router();
/**
 * @swagger
 * /delivery-confirmations/confirm:
 *   post:
 *     summary: Confirm delivery with a delivery code
 *     description: |
 *       Sellers use this endpoint to confirm delivery by entering the 6-digit code provided by the buyer.
 *       Upon successful confirmation:
 *         - Delivery confirmation status is updated to 'CONFIRMED'
 *         - Both buyer and seller invoices are marked as 'PAID'
 *     tags:
 *       - Delivery Confirmations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deliveryCode
 *               - sellerInvoiceId
 *             properties:
 *               delivery_code:
 *                 type: string
 *                 description: 6-digit delivery code provided by the buyer
 *                 example: "123456"
 *               seller_invoice_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the seller's invoice
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Delivery confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryConfirmation'
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden - Seller doesn't own the invoice
 *       404:
 *         description: Delivery confirmation not found
 */
router.post(
  '/confirm',
  auth.authenticate,
  //auth.checkPermission('delivery.confirm'), uncomment after define permissions
  validateRequest(deliveryConfirmationValidation.confirmDelivery.body),
  deliveryConfirmationController.confirmDelivery
);

module.exports = router;