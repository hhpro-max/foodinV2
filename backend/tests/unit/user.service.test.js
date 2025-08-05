const UserService = require('../../src/services/user.service');
const { User, Profile, NaturalPerson, LegalPerson } = require('../../src/models');
const ApiError = require('../../src/utils/ApiError');

// Mock repositories
const mockUserRepo = {
  findById: jest.fn(),
  update: jest.fn(),
  activateUser: jest.fn(),
  findWithProfile: jest.fn(),
};

const mockProfileRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const mockNaturalPersonRepo = {
  findByUserId: jest.fn(),
  createForUser: jest.fn(),
  updateByUserId: jest.fn(),
};

const mockLegalPersonRepo = {
  findByUserId: jest.fn(),
  createForUser: jest.fn(),
  updateByUserId: jest.fn(),
};

const mockOtpService = {
  verifyOtp: jest.fn(),
};

const mockRoleRepo = {};

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService({
      userRepo: mockUserRepo,
      profileRepo: mockProfileRepo,
      otpService: mockOtpService,
      roleRepo: mockRoleRepo,
      naturalPersonRepo: mockNaturalPersonRepo,
      legalPersonRepo: mockLegalPersonRepo,
    });
    jest.clearAllMocks();
  });

  describe('completeUserProfile', () => {
    it('should complete profile for natural person and activate user', async () => {
      const userId = 'user-id';
      const profileData = {
        user_type: 'natural',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        national_id: '1234567890',
      };

      const user = { id: userId, userType: null };
      mockUserRepo.findById.mockResolvedValue(user);
      mockProfileRepo.findOne.mockResolvedValue(null);
      mockProfileRepo.create.mockResolvedValue({ id: 'profile-id', userId });
      mockNaturalPersonRepo.findByUserId.mockResolvedValue(null);
      mockNaturalPersonRepo.createForUser.mockResolvedValue({ id: 'natural-person-id', userId });
      mockUserRepo.update.mockResolvedValue({ ...user, userType: 'natural' });
      mockUserRepo.activateUser.mockResolvedValue({ ...user, userType: 'natural', isActive: true });
      mockUserRepo.findWithProfile.mockResolvedValue({ 
        id: userId, 
        userType: 'natural', 
        isActive: true,
        profile: { id: 'profile-id', userId },
        naturalPerson: { id: 'natural-person-id', userId }
      });

      const result = await userService.completeUserProfile(userId, profileData);

      expect(mockUserRepo.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepo.update).toHaveBeenCalledWith(userId, { userType: 'natural' });
      expect(mockProfileRepo.create).toHaveBeenCalledWith({
        userId,
        customerCode: expect.any(String),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      });
      expect(mockNaturalPersonRepo.createForUser).toHaveBeenCalledWith(userId, '1234567890');
      expect(mockUserRepo.activateUser).toHaveBeenCalledWith(userId);
    });

    it('should complete profile for legal person and activate user', async () => {
      const userId = 'user-id';
      const profileData = {
        user_type: 'legal',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        economic_code: '1234567890',
        company_name: 'Test Company',
      };

      const user = { id: userId, userType: null };
      mockUserRepo.findById.mockResolvedValue(user);
      mockProfileRepo.findOne.mockResolvedValue(null);
      mockProfileRepo.create.mockResolvedValue({ id: 'profile-id', userId });
      mockLegalPersonRepo.findByUserId.mockResolvedValue(null);
      mockLegalPersonRepo.createForUser.mockResolvedValue({ id: 'legal-person-id', userId });
      mockUserRepo.update.mockResolvedValue({ ...user, userType: 'legal' });
      mockUserRepo.activateUser.mockResolvedValue({ ...user, userType: 'legal', isActive: true });
      mockUserRepo.findWithProfile.mockResolvedValue({ 
        id: userId, 
        userType: 'legal', 
        isActive: true,
        profile: { id: 'profile-id', userId },
        legalPerson: { id: 'legal-person-id', userId }
      });

      const result = await userService.completeUserProfile(userId, profileData);

      expect(mockUserRepo.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepo.update).toHaveBeenCalledWith(userId, { userType: 'legal' });
      expect(mockProfileRepo.create).toHaveBeenCalledWith({
        userId,
        customerCode: expect.any(String),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      });
      expect(mockLegalPersonRepo.createForUser).toHaveBeenCalledWith(userId, '1234567890', 'Test Company');
      expect(mockUserRepo.activateUser).toHaveBeenCalledWith(userId);
    });

    it('should throw error for missing user type', async () => {
      const userId = 'user-id';
      const profileData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
      };

      const user = { id: userId };
      mockUserRepo.findById.mockResolvedValue(user);

      await expect(userService.completeUserProfile(userId, profileData)).rejects.toThrow('User type is required');
    });

    it('should throw error for missing required fields', async () => {
      const userId = 'user-id';
      const profileData = {
        user_type: 'natural',
        first_name: 'John',
        // Missing last_name and email
      };

      const user = { id: userId };
      mockUserRepo.findById.mockResolvedValue(user);

      await expect(userService.completeUserProfile(userId, profileData)).rejects.toThrow('First name and last name are required');
    });

    it('should throw error for missing national ID for natural person', async () => {
      const userId = 'user-id';
      const profileData = {
        user_type: 'natural',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        // Missing national_id
      };

      const user = { id: userId };
      mockUserRepo.findById.mockResolvedValue(user);

      await expect(userService.completeUserProfile(userId, profileData)).rejects.toThrow('National ID is required for natural persons');
    });

    it('should throw error for missing economic code for legal person', async () => {
      const userId = 'user-id';
      const profileData = {
        user_type: 'legal',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        company_name: 'Test Company',
        // Missing economic_code
      };

      const user = { id: userId };
      mockUserRepo.findById.mockResolvedValue(user);

      await expect(userService.completeUserProfile(userId, profileData)).rejects.toThrow('Economic code is required for legal persons');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      const userId = 'user-id';
      const profileData = {
        user_type: 'natural',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
      };

      const user = { id: userId, userType: 'natural' };
      const profile = { id: 'profile-id', userId };
      
      mockUserRepo.findById.mockResolvedValue(user);
      mockProfileRepo.findOne.mockResolvedValue(profile);
      mockProfileRepo.update.mockResolvedValue({ ...profile, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' });
      mockUserRepo.update.mockResolvedValue({ ...user, userType: 'natural' });
      mockUserRepo.findWithProfile.mockResolvedValue({
        id: userId,
        userType: 'natural',
        profile: { id: 'profile-id', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' }
      });

      const result = await userService.updateUserProfile(userId, profileData);

      expect(mockUserRepo.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepo.update).toHaveBeenCalledWith(userId, { userType: 'natural' });
      expect(mockProfileRepo.update).toHaveBeenCalledWith('profile-id', {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
      });
    });
  });
});