const otpService = require('./otp.service');
const tokenService = require('./token.service');
const DeliveryConfirmationService = require('./delivery_confirmation.service');
const CategoryService = require('./category.service');
// userService is a class, so we need to instantiate it with dependencies
const UserService = require('./user.service');

module.exports = {
  otpService,
  tokenService,
  UserService,
  CategoryService,
  deliveryConfirmationService: new DeliveryConfirmationService()
};