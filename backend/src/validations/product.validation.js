const Joi = require('joi');
const { commonSchemas } = require('../middlewares/validateRequest');

const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(2000).optional(),
  category_id: Joi.string().uuid().optional(),
  purchase_price: Joi.number().positive().precision(2).required(),
  stock_quantity: Joi.number().integer().min(0).default(0),
  min_order_quantity: Joi.number().integer().min(1).default(1),
  unit: Joi.string().max(50).default('piece'),
  weight: Joi.number().positive().precision(3).optional(),
  dimensions: Joi.object({
    length: Joi.number().positive(),
    width: Joi.number().positive(),
    height: Joi.number().positive(),
  }).optional().allow(null).allow(''),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional().allow(null).allow(''),
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  description: Joi.string().max(2000).optional(),
  category_id: Joi.string().uuid().optional(),
  purchase_price: Joi.number().positive().precision(2).optional(),
  stock_quantity: Joi.number().integer().min(0).optional(),
  min_order_quantity: Joi.number().integer().min(1).optional(),
  unit: Joi.string().max(50).optional(),
  weight: Joi.number().positive().precision(3).optional(),
  dimensions: Joi.object({
    length: Joi.number().positive(),
    width: Joi.number().positive(),
    height: Joi.number().positive(),
  }).optional().allow(null).allow(''),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional().allow(null).allow(''),
});

const approveProductSchema = Joi.object({
  sale_price: Joi.number().positive().precision(2).required(),
  notes: Joi.string().max(500).optional(),
});

const rejectProductSchema = Joi.object({
  notes: Joi.string().max(500).required(),
});

const updateStockSchema = Joi.object({
  quantity: Joi.number().integer().positive().required(),
  operation: Joi.string().valid('add', 'subtract').default('add'),
});

const productFiltersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('pending', 'approved', 'rejected').optional(),
  category_id: Joi.string().uuid().optional(),
  seller_id: Joi.string().uuid().optional(),
  search: Joi.string().min(2).max(100).optional(),
});

const productIdSchema = Joi.object({
  productId: Joi.string().uuid().required(),
});

const statsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(10),
  threshold: Joi.number().integer().min(1).max(1000).default(10),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  approveProductSchema,
  rejectProductSchema,
  updateStockSchema,
  productFiltersSchema,
  productIdSchema,
  statsQuerySchema,
};