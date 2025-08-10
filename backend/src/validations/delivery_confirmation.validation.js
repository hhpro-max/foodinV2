const Joi = require('joi');

const confirmDelivery = {
  body: Joi.object().keys({
    delivery_code: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
      .required(),
    seller_invoice_id: Joi.string()
      .guid({ version: 'uuidv4' })
      .required(),
  }),
};


module.exports = {
  confirmDelivery,
};