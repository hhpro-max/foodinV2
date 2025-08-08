const express = require('express');
const addressController = require('../controllers/address.controller');
const { validateRequest, validateParams, validateQuery, commonSchemas } = require('../middlewares/validateRequest');
const auth = require('../middlewares/auth');
const {
  createAddressSchema,
  updateAddressSchema,
  searchNearbySchema,
  geocodeSchema,
  reverseGeocodeSchema,
  addressIdSchema
} = require('../validations/address.validation');

const router = express.Router();

// Apply authentication to all routes
router.use(auth.authenticate);

// Address CRUD routes

/**
 * @swagger
 * /addresses:
 *   get:
 *     summary: Get user addresses
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Address'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', addressController.getUserAddresses);

/**
 * @swagger
 * /addresses:
 *   post:
 *     summary: Create a new address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Address'
 *     responses:
 *       201:
 *         description: Address created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', validateRequest(createAddressSchema), addressController.createAddress);

/**
 * @swagger
 * /addresses/primary:
 *   get:
 *     summary: Get the user's primary address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Primary address retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Primary address not found
 *       500:
 *         description: Server error
 */
router.get('/primary', addressController.getPrimaryAddress);

/**
 * @swagger
 * /addresses/warehouse:
 *   get:
 *     summary: Get the user's warehouse address (for sellers)
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Warehouse address retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller access required
 *       404:
 *         description: Warehouse address not found
 *       500:
 *         description: Server error
 */
router.get('/warehouse', addressController.getWarehouseAddress);

// Search and geocoding routes

/**
 * @swagger
 * /addresses/search/nearby:
 *   get:
 *     summary: Search nearby addresses
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           format: float
 *           default: 1000
 *     responses:
 *       200:
 *         description: List of nearby addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Address'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/search/nearby', validateQuery(searchNearbySchema), addressController.searchNearbyAddresses);

/**
 * @swagger
 * /addresses/geocode:
 *   post:
 *     summary: Geocode an address (convert address to coordinates)
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Geocoding result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 latitude:
 *                   type: number
 *                 longitude:
 *                   type: number
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/geocode', validateRequest(geocodeSchema), addressController.geocodeAddress);

/**
 * @swagger
 * /addresses/reverse-geocode:
 *   post:
 *     summary: Reverse geocode (convert coordinates to address)
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latitude:
 *                 type: number
 *                 format: float
 *               longitude:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: Reverse geocoding result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/reverse-geocode', validateRequest(reverseGeocodeSchema), addressController.reverseGeocode);

// Individual address routes

/**
 * @swagger
 * /addresses/{addressId}:
 *   get:
 *     summary: Get an address by ID
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 */
router.get('/:addressId',
  validateParams(commonSchemas.addressId),
  addressController.getAddressById
);

/**
 * @swagger
 * /addresses/{addressId}:
 *   put:
 *     summary: Update an address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Address'
 *     responses:
 *       200:
 *         description: Address updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 */
router.put('/:addressId',
  validateParams(commonSchemas.addressId),
  validateRequest(updateAddressSchema),
  addressController.updateAddress
);

/**
 * @swagger
 * /addresses/{addressId}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Address ID
 *     responses:
 *       204:
 *         description: Address deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 */
router.delete('/:addressId',
  validateParams(commonSchemas.addressId),
  addressController.deleteAddress
);

/**
 * @swagger
 * /addresses/{addressId}/set-primary:
 *   patch:
 *     summary: Set an address as primary
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address set as primary successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 */
router.patch('/:addressId/set-primary',
  validateParams(commonSchemas.addressId),
  addressController.setPrimaryAddress
);

/**
 * @swagger
 * /addresses/{addressId}/set-warehouse:
 *   patch:
 *     summary: Set an address as warehouse (for sellers)
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address set as warehouse successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seller access required
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 */
router.patch('/:addressId/set-warehouse',
  validateParams(commonSchemas.addressId),
  auth.authorize(['seller']), // Only sellers can set warehouse addresses
  addressController.setWarehouseAddress
);

// Admin routes

/**
 * @swagger
 * /addresses/admin/stats:
 *   get:
 *     summary: Get address statistics (Admin only)
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Address statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAddresses:
 *                   type: integer
 *                 primaryAddressesCount:
 *                   type: integer
 *                 warehouseAddressesCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/admin/stats',
  auth.authorize(['admin']),
  addressController.getAddressStats
);

module.exports = router;