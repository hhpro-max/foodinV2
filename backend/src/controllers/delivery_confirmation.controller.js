const catchAsync = require('../utils/catchAsync');
const { deliveryConfirmationService } = require('../services');

const confirmDelivery = catchAsync(async (req, res) => {
  const { delivery_code, seller_invoice_id } = req.body;
  const sellerId = req.user.id;

  const deliveryConfirmation = await deliveryConfirmationService.confirmDelivery(delivery_code, seller_invoice_id, sellerId);

  res.status(200).json({
    status: 'success',
    data: deliveryConfirmation
  });
});

module.exports = {
  confirmDelivery,
};