const otpService = require('./otp.service');
const tokenService = require('./token.service');
// userService is a class, so we need to instantiate it with dependencies
const UserService = require('./user.service');

module.exports = {
  otpService,
  tokenService,
  UserService
};