const Joi = require('joi');

const orderId = {
  params: Joi.object().keys({
    orderId: Joi.string().uuid().required(),
  }),
};

module.exports = {
  orderId,
};