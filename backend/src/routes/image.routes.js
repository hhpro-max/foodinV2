const express = require('express');
const imageController = require('../controllers/image.controller');

const router = express.Router();

/**
 * @swagger
 * /images/products/{filename}:
 *   get:
 *     summary: Serve a product image by filename
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The image filename
 *     responses:
 *       200:
 *         description: The image file
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid filename
 *       404:
 *         description: Image not found
 */
router.get('/products/:filename', imageController.serveProductImage);

module.exports = router;