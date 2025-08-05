const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

const sendOtp = catchAsync(async (req, res) => {
  const { otpService } = req.container;
  await otpService.sendOtp(req.body.phone);
  res.status(204).send();
});

const verifyOtp = catchAsync(async (req, res) => {
  const { authService } = req.container;
  const result = await authService.verifyOtpAndLogin(req.body.phone, req.body.otp);
  res.send(result);
});

module.exports = {
  sendOtp,
  verifyOtp,
};