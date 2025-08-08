const Joi = require('joi');

const invoiceId = {
  params: Joi.object().keys({
    invoiceId: Joi.string().uuid().required(),
  }),
};

const createInvoice = {
  body: Joi.object().keys({
    orderId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required(),
    dueDate: Joi.date().iso().required(),
    status: Joi.string().valid('pending', 'paid', 'overdue').default('pending')
  }),
};

module.exports = {
  invoiceId,
  createInvoice,
};