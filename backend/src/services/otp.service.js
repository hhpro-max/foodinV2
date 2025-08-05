const Kavenegar = require('kavenegar');
const ApiError = require('../utils/ApiError');

class OTPService {
  constructor({ userRepo }) {
    this.userRepo = userRepo;
    this.kavenegarApi = Kavenegar.KavenegarApi({
      apikey: process.env.KAVENEGAR_API_KEY || "34314C31797679334774456C6C302F3354553556394139594450663971374C32653041464C6D2B446F43493D",
    });
  }

  /**
   * Generate a random 6-digit OTP
   * @returns {string}
   */
  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP to a user's phone
   * @param {string} phone
   * @returns {Promise<void>}
   */
  async sendOtp(phone) {
    const otp = this.generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user = await this.userRepo.findByPhone(phone);

    if (user) {
      await this.userRepo.update(user.id, { otp, otpExpires });
    } else {
      user = await this.userRepo.create({ phone, otp, otpExpires, isActive: false });
    }
    //TODO DELETE THE LINE AFTER THIS FOR SECUIRITY
    console.log(`OTP for ${phone}: ${otp}`); // For debugging, remove in production
    //TODO delete function line after testing
   /* this.kavenegarApi.Send({
        message: otp,
        sender: "2000660110",
        receptor: phone
    },
    function(response, status) {
        console.log(response);
        console.log(status);
    });  */  
//    this.kavenegarApi.VerifyLookup({
//      receptor: phone,
//      token: otp,
//      template: "registerverify"
//    }, function(response, status) {
//      if (status !== 200) {
//        throw new ApiError(status, 'Failed to send OTP');
//      }
//    });
  }

  /**
   * Verify OTP
   * @param {string} phone
   * @param {string} otp
   * @returns {Promise<User>}
   */
  async verifyOtp(phone, otp) {
    const user = await this.userRepo.findByPhone(phone);

    if (!user || user.otp !== otp) {
      throw new ApiError(400, 'Invalid OTP');
    }

    if (user.otpExpires < new Date()) {
      throw new ApiError(400, 'OTP has expired');
    }

    await this.userRepo.update(user.id, {
      otp: null,
      otpExpires: null,
      isVerified: true,
    });

    return user;
  }
}

module.exports = OTPService;