const Joi = require('joi');

const sendOtp = {
  body: Joi.object().keys({
    phone: Joi.string()
      .pattern(/^(\+98|0)?9\d{9}$/)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be a valid Iranian mobile number',
      }),
  }),
};

const verifyOtp = {
  body: Joi.object().keys({
    phone: Joi.string()
      .pattern(/^(\+98|0)?9\d{9}$/)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be a valid Iranian mobile number',
      }),
    otp: Joi.string().required(),
  }),
};

module.exports = {
  sendOtp,
  verifyOtp,
};