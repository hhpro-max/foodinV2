const DeliveryInformationService = require('../services/delivery_information.service');
const catchAsync = require('../utils/catchAsync');

class DeliveryInformationController {
  constructor() {
    this.deliveryInformationService = new DeliveryInformationService();
  }

  createDeliveryInformation = catchAsync(async (req, res) => {
    const deliveryInformation = await this.deliveryInformationService.createDeliveryInformation(req.body);
    res.status(201).json(deliveryInformation);
  });

  getDeliveryInformationById = catchAsync(async (req, res) => {
    const deliveryInformation = await this.deliveryInformationService.getDeliveryInformationById(req.params.id);
    res.status(200).json(deliveryInformation);
  });

  updateDeliveryInformation = catchAsync(async (req, res) => {
    const deliveryInformation = await this.deliveryInformationService.updateDeliveryInformation(req.params.id, req.body);
    res.status(200).json(deliveryInformation);
  });

  getDeliveryInformationByInvoiceId = catchAsync(async (req, res) => {
    const deliveryInformation = await this.deliveryInformationService.getDeliveryInformationByInvoiceId(
      req.params.invoiceId
    );
    res.status(200).json(deliveryInformation);
  });
}

module.exports = new DeliveryInformationController();