const Joi = require('joi');
const { commonSchemas } = require('../middlewares/validateRequest');

const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  parentId: Joi.string().uuid().optional().allow(null),
  isActive: Joi.boolean().default(true),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(500).optional(),
  parentId: Joi.string().uuid().optional().allow(null),
  isActive: Joi.boolean().optional(),
});

const categoryFiltersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  includeChildren: Joi.boolean().default(false),
});

const categoryIdSchema = Joi.object({
  categoryId: Joi.string().uuid().required(),
});

const parentIdSchema = Joi.object({
  parentId: Joi.string().uuid().required(),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  categoryFiltersSchema,
  categoryIdSchema,
  parentIdSchema,
};