const Joi = require('joi');
const { commonSchemas } = require('../middlewares/validateRequest');

const addToCartSchema = Joi.object({
  product_id: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).default(1),
});

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required(),
});

const prepareCheckoutSchema = Joi.object({
  address_id: Joi.string().uuid().optional(),
});

const bulkAddSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      product_id: Joi.string().uuid().required(),
      quantity: Joi.number().integer().min(1).default(1),
    })
  ).min(1).max(50).required(),
});

const bulkUpdateSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      product_id: Joi.string().uuid().required(),
      quantity: Joi.number().integer().min(0).required(),
    })
  ).min(1).max(50).required(),
});

const productIdSchema = Joi.object({
  product_id: Joi.string().uuid().required(),
});

const adminQuerySchema = Joi.object({
  days: Joi.number().integer().min(1).max(365).default(7),
  limit: Joi.number().integer().min(1).max(1000).default(100),
});

module.exports = {
  addToCartSchema,
  updateCartItemSchema,
  prepareCheckoutSchema,
  bulkAddSchema,
  bulkUpdateSchema,
  productIdSchema,
  adminQuerySchema,
};