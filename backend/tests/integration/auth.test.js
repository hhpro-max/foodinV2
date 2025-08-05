const request = require('supertest');
const app = require('../../src/app');
const { User } = require('../../src/models');
const { createTestUser } = require('../utils/testUtils');

describe('Authentication API', () => {
  describe('POST /api/v1/auth/send-otp', () => {
    it('should send OTP to a new user and create an inactive user', async () => {
      const phone = '+989123456789';
      
      const response = await request(app)
        .post('/api/v1/auth/send-otp')
        .send({ phone })
        .expect(204);
      
      // Check that user was created
      const user = await User.findOne({ where: { phone } });
      expect(user).toBeDefined();
      expect(user.phone).toBe(phone);
      expect(user.isActive).toBe(false);
      expect(user.otp).toBeDefined();
      expect(user.otpExpires).toBeDefined();
    });

    it('should send OTP to an existing user and update their OTP', async () => {
      const phone = '+989123456789';
      
      // Create user first
      const user = await createTestUser({ phone });
      const oldOtp = user.otp;
      
      const response = await request(app)
        .post('/api/v1/auth/send-otp')
        .send({ phone })
        .expect(204);
      
      // Check that user's OTP was updated
      const updatedUser = await User.findOne({ where: { phone } });
      expect(updatedUser).toBeDefined();
      expect(updatedUser.otp).not.toBe(oldOtp);
      expect(updatedUser.otpExpires).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/verify-otp', () => {
    it('should verify OTP and return user data and tokens', async () => {
      const phone = '+989123456789';
      const otp = '123456';
      
      // Create user with OTP
      await createTestUser({ phone, otp, otpExpires: new Date(Date.now() + 10 * 60 * 1000) });
      
      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({ phone, otp })
        .expect(200);
      
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.user.phone).toBe(phone);
      expect(response.body.tokens.access).toHaveProperty('token');
      expect(response.body.tokens.access).toHaveProperty('expires');
    });

    it('should return 400 for invalid OTP', async () => {
      const phone = '+989123456789';
      const otp = '123456';
      const invalidOtp = '654321';
      
      // Create user with OTP
      await createTestUser({ phone, otp, otpExpires: new Date(Date.now() + 10 * 60 * 1000) });
      
      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({ phone, otp: invalidOtp })
        .expect(400);
      
      expect(response.body).toHaveProperty('message', 'Invalid OTP');
    });

    it('should return 400 for expired OTP', async () => {
      const phone = '+989123456789';
      const otp = '123456';
      
      // Create user with expired OTP
      await createTestUser({ phone, otp, otpExpires: new Date(Date.now() - 10 * 60 * 1000) });
      
      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({ phone, otp })
        .expect(400);
      
      expect(response.body).toHaveProperty('message', 'OTP has expired');
    });
  });
});