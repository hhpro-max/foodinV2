const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { formatIranianPhone } = require('../utils/phoneFormatter');

const sendOtp = catchAsync(async (req, res) => {
  const { otpService } = req.container;
  const formattedPhone = formatIranianPhone(req.body.phone);
  await otpService.sendOtp(formattedPhone);
  res.status(204).send();
});

const verifyOtp = catchAsync(async (req, res) => {
  const { authService } = req.container;
  const formattedPhone = formatIranianPhone(req.body.phone);
  const result = await authService.verifyOtpAndLogin(formattedPhone, req.body.otp);
  res.send(result);
});

module.exports = {
  sendOtp,
  verifyOtp,
};