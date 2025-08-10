const Joi = require('joi');
const ApiError = require('../utils/ApiError');

const validateRequest = (validationSchema) => {
  return (req, res, next) => {
    const { error } = validationSchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      return next(new ApiError(400, errorMessage));
    }

    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      return next(new ApiError(400, errorMessage));
    }

    next();
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      return next(new ApiError(400, errorMessage));
    }

    next();
  };
};

// Common validation schemas
const commonSchemas = {
  id: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  userId: Joi.object({
    userId: Joi.string().uuid().required(),
  }),
  productId: Joi.object({
    productId: Joi.string().uuid().required(),
  }),
  addressId: Joi.object({
    addressId: Joi.string().uuid().required(),
  }),
  notificationId: Joi.object({
    notificationId: Joi.string().uuid().required(),
  }),
  invoiceId: Joi.object({
    invoiceId: Joi.string().uuid().required(),
  }),
  product_id: Joi.object({
    product_id: Joi.string().uuid().required(),
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  phone: Joi.string()
    .pattern(/^(\+98|0)?9\d{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be a valid Iranian mobile number',
    }),

  nationalId: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'National ID must be exactly 10 digits',
    }),

  economicCode: Joi.string()
    .pattern(/^\d{11}$/)
    .required()
    .messages({
      'string.pattern.base': 'Economic code must be exactly 11 digits',
    }),

  otp: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.pattern.base': 'OTP must be exactly 6 digits',
    }),

  email: Joi.string().email().optional(),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
    }),
};

module.exports = {
  validateRequest,
  validateQuery,
  validateParams,
  commonSchemas,
};