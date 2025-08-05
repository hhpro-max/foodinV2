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
router.get('/', addressController.getUserAddresses);
router.post('/', validateRequest(createAddressSchema), addressController.createAddress);

router.get('/primary', addressController.getPrimaryAddress);
router.get('/warehouse', addressController.getWarehouseAddress);

// Search and geocoding routes
router.get('/search/nearby', validateQuery(searchNearbySchema), addressController.searchNearbyAddresses);
router.post('/geocode', validateRequest(geocodeSchema), addressController.geocodeAddress);
router.post('/reverse-geocode', validateRequest(reverseGeocodeSchema), addressController.reverseGeocode);

// Individual address routes
router.get('/:addressId', 
  validateParams(commonSchemas.addressId),
  addressController.getAddressById
);

router.put('/:addressId', 
  validateParams(commonSchemas.addressId),
  validateRequest(updateAddressSchema), 
  addressController.updateAddress
);

router.delete('/:addressId', 
  validateParams(commonSchemas.addressId),
  addressController.deleteAddress
);

router.patch('/:addressId/set-primary', 
  validateParams(commonSchemas.addressId),
  addressController.setPrimaryAddress
);

router.patch('/:addressId/set-warehouse', 
  validateParams(commonSchemas.addressId),
  auth.authorize(['seller']), // Only sellers can set warehouse addresses
  addressController.setWarehouseAddress
);

// Admin routes
router.get('/admin/stats', 
  auth.authorize(['admin']), 
  addressController.getAddressStats
);

module.exports = router;