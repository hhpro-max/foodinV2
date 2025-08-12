const Joi = require('joi');

const createDeliveryInformation = {
  body: Joi.object().keys({
    buyerAddressId: Joi.string().uuid().required(),
    sellerAddressId: Joi.string().uuid().required(),
    deliveryDateRequested: Joi.date().optional(),
    buyerInvoiceId: Joi.string().uuid().required(),
    sellerInvoiceId: Joi.string().uuid().required(),
    status: Joi.string().optional(),
  }),
};

const updateDeliveryInformation = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object().keys({
    deliveryDateRequested: Joi.date().optional(),
    status: Joi.string().optional(),
  }),
};

const getDeliveryInformationByInvoiceId = {
  params: Joi.object().keys({
    invoiceId: Joi.string().uuid().required(),
  }),
};

module.exports = {
  createDeliveryInformation,
  updateDeliveryInformation,
  getDeliveryInformationByInvoiceId,
};