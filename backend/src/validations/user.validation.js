const Joi = require('joi');
const { commonSchemas } = require('../middlewares/validateRequest');

const updateProfileSchema = Joi.object({
  user_type: Joi.string().valid('natural', 'legal').optional(),
  first_name: Joi.string().min(2).max(50).optional(),
  last_name: Joi.string().min(2).max(50).optional(),
  email: commonSchemas.email,
  national_id: commonSchemas.nationalId.optional(),
  economic_code: commonSchemas.economicCode.optional(),
  company_name: Joi.string().min(2).max(100).optional(),
});

const completeProfileSchema = Joi.object({
  user_type: Joi.string().valid('natural', 'legal').required(),
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  email: commonSchemas.email.required(),
  national_id: commonSchemas.nationalId.when('user_type', {
    is: 'natural',
    then: Joi.required(),
    otherwise: Joi.optional().allow(null, '')
  }),
  economic_code: Joi.string()
    .pattern(/^\d{11}$/)
    .messages({
      'string.pattern.base': 'Economic code must be exactly 11 digits',
    })
    .when('user_type', {
      is: 'legal',
      then: Joi.required(),
      otherwise: Joi.optional().allow(null, '').allow('')
    }),
  company_name: Joi.string().min(2).max(100).when('user_type', {
    is: 'legal',
    then: Joi.required(),
    otherwise: Joi.optional().allow(null, '')
  }),
});

const assignRoleSchema = Joi.object({
  roleId: Joi.string().uuid().required(),
});

const chooseRoleSchema = Joi.object({
  role: Joi.string().valid('buyer', 'seller').required(),
});

module.exports = {
  updateProfileSchema,
  completeProfileSchema,
  assignRoleSchema,
  chooseRoleSchema,
};