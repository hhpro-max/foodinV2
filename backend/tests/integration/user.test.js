const request = require('supertest');
const app = require('../../src/app');
const { User, Profile, NaturalPerson, LegalPerson } = require('../../src/models');
const { createTestUser, generateToken } = require('../utils/testUtils');

describe('User API', () => {
  describe('POST /api/v1/users/profile/complete', () => {
    it('should complete profile for natural person and activate user', async () => {
      // Create inactive user
      const user = await createTestUser({ 
        userType: 'natural',
        isActive: false 
      });
      
      const token = generateToken(user.id);
      
      const profileData = {
        user_type: 'natural',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        national_id: '1234567890'
      };
      
      const response = await request(app)
        .post('/api/v1/users/profile/complete')
        .set('Authorization', `Bearer ${token}`)
        .send(profileData)
        .expect(200);
      
      expect(response.body).toHaveProperty('message', 'Profile completed and user activated successfully');
      expect(response.body.data.user).toHaveProperty('isActive', true);
      expect(response.body.data.user).toHaveProperty('userType', 'natural');
      
      // Check that profile was created
      const profile = await Profile.findOne({ where: { userId: user.id } });
      expect(profile).toBeDefined();
      expect(profile.firstName).toBe('John');
      expect(profile.lastName).toBe('Doe');
      expect(profile.email).toBe('john.doe@example.com');
      
      // Check that natural person was created
      const naturalPerson = await NaturalPerson.findOne({ where: { userId: user.id } });
      expect(naturalPerson).toBeDefined();
      expect(naturalPerson.nationalId).toBe('1234567890');
    });

    it('should complete profile for legal person and activate user', async () => {
      // Create inactive user
      const user = await createTestUser({ 
        userType: 'legal',
        isActive: false 
      });
      
      const token = generateToken(user.id);
      
      const profileData = {
        user_type: 'legal',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        economic_code: '1234567890',
        company_name: 'Test Company'
      };
      
      const response = await request(app)
        .post('/api/v1/users/profile/complete')
        .set('Authorization', `Bearer ${token}`)
        .send(profileData)
        .expect(200);
      
      expect(response.body).toHaveProperty('message', 'Profile completed and user activated successfully');
      expect(response.body.data.user).toHaveProperty('isActive', true);
      expect(response.body.data.user).toHaveProperty('userType', 'legal');
      
      // Check that profile was created
      const profile = await Profile.findOne({ where: { userId: user.id } });
      expect(profile).toBeDefined();
      expect(profile.firstName).toBe('John');
      expect(profile.lastName).toBe('Doe');
      expect(profile.email).toBe('john.doe@example.com');
      
      // Check that legal person was created
      const legalPerson = await LegalPerson.findOne({ where: { userId: user.id } });
      expect(legalPerson).toBeDefined();
      expect(legalPerson.economicCode).toBe('1234567890');
      expect(legalPerson.companyName).toBe('Test Company');
    });

    it('should return 400 for missing required fields for natural person', async () => {
      // Create inactive user
      const user = await createTestUser({ 
        userType: 'natural',
        isActive: false 
      });
      
      const token = generateToken(user.id);
      
      const profileData = {
        user_type: 'natural',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com'
        // Missing national_id
      };
      
      const response = await request(app)
        .post('/api/v1/users/profile/complete')
        .set('Authorization', `Bearer ${token}`)
        .send(profileData)
        .expect(400);
    });

    it('should return 400 for missing required fields for legal person', async () => {
      // Create inactive user
      const user = await createTestUser({ 
        userType: 'legal',
        isActive: false 
      });
      
      const token = generateToken(user.id);
      
      const profileData = {
        user_type: 'legal',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com'
        // Missing economic_code and company_name
      };
      
      const response = await request(app)
        .post('/api/v1/users/profile/complete')
        .set('Authorization', `Bearer ${token}`)
        .send(profileData)
        .expect(400);
    });
  });

  describe('PUT /api/v1/users/profile', () => {
    it('should update profile for active user', async () => {
      // Create active user with profile
      const user = await createTestUser({ 
        userType: 'natural',
        isActive: true 
      });
      
      const token = generateToken(user.id);
      
      const profileData = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com'
      };
      
      const response = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(profileData)
        .expect(200);
      
      expect(response.body.data.user).toHaveProperty('firstName', 'Jane');
      expect(response.body.data.user).toHaveProperty('lastName', 'Smith');
      expect(response.body.data.user).toHaveProperty('email', 'jane.smith@example.com');
    });

    it('should return 401 for inactive user trying to update profile', async () => {
      // Create inactive user
      const user = await createTestUser({ 
        userType: 'natural',
        isActive: false 
      });
      
      const token = generateToken(user.id);
      
      const profileData = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com'
      };
      
      const response = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(profileData)
        .expect(401);
      
      expect(response.body).toHaveProperty('message', 'Your account has been deactivated. Please contact support.');
    });
  });
});