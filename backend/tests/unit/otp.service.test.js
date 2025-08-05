const OTPService = require('../../src/services/otp.service');
const { User } = require('../../src/models');
const ApiError = require('../../src/utils/ApiError');

// Mock user repository
const mockUserRepo = {
  findByPhone: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

// Mock Kavenegar API
jest.mock('kavenegar', () => ({
  KavenegarApi: jest.fn().mockImplementation(() => ({
    Send: jest.fn((params, callback) => callback(null, 'success')),
  })),
}));

describe('OTPService', () => {
  let otpService;

  beforeEach(() => {
    otpService = new OTPService({ userRepo: mockUserRepo });
    jest.clearAllMocks();
  });

  describe('generateOtp', () => {
    it('should generate a 6-digit OTP', () => {
      const otp = otpService.generateOtp();
      expect(otp).toMatch(/^\d{6}$/);
    });
  });

  describe('sendOtp', () => {
    it('should create a new user if not exists and send OTP', async () => {
      const phone = '+989123456789';
      const otp = '123456';
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      mockUserRepo.findByPhone.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue({ id: 'user-id', phone });

      // Mock the generateOtp method to return a fixed value
      otpService.generateOtp = jest.fn().mockReturnValue(otp);

      await otpService.sendOtp(phone);

      expect(mockUserRepo.findByPhone).toHaveBeenCalledWith(phone);
      expect(otpService.generateOtp).toHaveBeenCalled();
      expect(mockUserRepo.create).toHaveBeenCalledWith({
        phone,
        otp,
        otpExpires: expect.any(Date),
        isActive: false,
      });
    });

    it('should update existing user and send OTP', async () => {
      const phone = '+989123456789';
      const otp = '123456';
      const user = { id: 'user-id', phone };

      mockUserRepo.findByPhone.mockResolvedValue(user);
      mockUserRepo.update.mockResolvedValue(user);

      // Mock the generateOtp method to return a fixed value
      otpService.generateOtp = jest.fn().mockReturnValue(otp);

      await otpService.sendOtp(phone);

      expect(mockUserRepo.findByPhone).toHaveBeenCalledWith(phone);
      expect(otpService.generateOtp).toHaveBeenCalled();
      expect(mockUserRepo.update).toHaveBeenCalledWith(user.id, {
        otp,
        otpExpires: expect.any(Date),
      });
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and activate user', async () => {
      const phone = '+989123456789';
      const otp = '123456';
      const user = {
        id: 'user-id',
        phone,
        otp,
        otpExpires: new Date(Date.now() + 10 * 60 * 1000),
        isVerified: false,
      };

      mockUserRepo.findByPhone.mockResolvedValue(user);
      mockUserRepo.update.mockResolvedValue({ ...user, isVerified: true });

      const result = await otpService.verifyOtp(phone, otp);

      expect(mockUserRepo.findByPhone).toHaveBeenCalledWith(phone);
      expect(mockUserRepo.update).toHaveBeenCalledWith(user.id, {
        otp: null,
        otpExpires: null,
        isVerified: true,
      });
      expect(result).toHaveProperty('isVerified', true);
    });

    it('should throw error for invalid OTP', async () => {
      const phone = '+989123456789';
      const otp = '123456';
      const invalidOtp = '654321';
      const user = {
        id: 'user-id',
        phone,
        otp,
        otpExpires: new Date(Date.now() + 10 * 60 * 1000),
      };

      mockUserRepo.findByPhone.mockResolvedValue(user);

      await expect(otpService.verifyOtp(phone, invalidOtp)).rejects.toThrow('Invalid OTP');
    });

    it('should throw error for expired OTP', async () => {
      const phone = '+989123456789';
      const otp = '123456';
      const user = {
        id: 'user-id',
        phone,
        otp,
        otpExpires: new Date(Date.now() - 10 * 60 * 1000),
      };

      mockUserRepo.findByPhone.mockResolvedValue(user);

      await expect(otpService.verifyOtp(phone, otp)).rejects.toThrow('OTP has expired');
    });
  });
});