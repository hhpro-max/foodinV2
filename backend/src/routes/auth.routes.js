const express = require('express');
const authController = require('../controllers/auth.controller');
const { validateRequest } = require('../middlewares/validateRequest');
const authValidation = require('../validations/auth.validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication
 */

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP to a user's phone
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *     responses:
 *       "204":
 *         description: No Content
 */
router.post('/send-otp', validateRequest(authValidation.sendOtp.body), authController.sendOtp);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP and log in the user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 */
router.post('/verify-otp', validateRequest(authValidation.verifyOtp.body), authController.verifyOtp);

module.exports = router;