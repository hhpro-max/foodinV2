const TokenService = require('./token.service');

class AuthService {
  constructor({ otpService }) {
    this.otpService = otpService;
    this.tokenService = new TokenService();
  }

  async verifyOtpAndLogin(phone, otp) {
    const user = await this.otpService.verifyOtp(phone, otp);
    const tokens = await this.tokenService.generateAuthTokens(user);
    return { user, tokens };
  }
}

module.exports = AuthService;
