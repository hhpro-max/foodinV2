const Joi = require('joi');

const createAddressSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  address_line: Joi.string().min(5).max(500).required(),
  city: Joi.string().min(2).max(100).required(),
  postal_code: Joi.string().pattern(/^\d{10}$/).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  is_primary: Joi.boolean().optional(),
  is_warehouse: Joi.boolean().optional(),
});

const updateAddressSchema = Joi.object({
  title: Joi.string().min(2).max(100).optional(),
  address_line: Joi.string().min(5).max(500).optional(),
  city: Joi.string().min(2).max(100).optional(),
  postal_code: Joi.string().pattern(/^\d{10}$/).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  is_primary: Joi.boolean().optional(),
  is_warehouse: Joi.boolean().optional(),
});

const searchNearbySchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  radius: Joi.number().min(1).max(100).default(10),
  limit: Joi.number().min(1).max(100).default(50),
});

const geocodeSchema = Joi.object({
  address_line: Joi.string().min(5).max(500).required(),
  city: Joi.string().min(2).max(100).required(),
});

const reverseGeocodeSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});

const addressIdSchema = Joi.object({
  addressId: Joi.string().uuid().required(),
});

module.exports = {
  createAddressSchema,
  updateAddressSchema,
  searchNearbySchema,
  geocodeSchema,
  reverseGeocodeSchema,
  addressIdSchema,
};