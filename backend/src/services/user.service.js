const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

class UserService {
  constructor({ userRepo, profileRepo, otpService, roleRepo, naturalPersonRepo, legalPersonRepo }) {
    this.userRepo = userRepo;
    this.profileRepo = profileRepo;
    this.otpService = otpService;
    this.roleRepo = roleRepo;
    this.naturalPersonRepo = naturalPersonRepo;
    this.legalPersonRepo = legalPersonRepo;
  }


  async getUserProfile(userId) {
    const user = await this.userRepo.findWithProfile(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return this.sanitizeUser(user);
  }

  async updateUserProfile(userId, profileData) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Update user basic info
    const userUpdates = {};
    if (profileData.user_type) {
      userUpdates.userType = profileData.user_type;
    }

    if (Object.keys(userUpdates).length > 0) {
      await this.userRepo.update(userId, userUpdates);
    }

    // Update or create profile
    if (this.profileRepo) {
      await this.updateOrCreateProfile(userId, profileData);
    }

    // Return updated user profile
    return await this.getUserProfile(userId);
  }

  async completeUserProfile(userId, profileData) {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) {
        throw ApiError.notFound('User not found');
      }

      // Validate required fields based on user type
      if (!profileData.user_type) {
        throw ApiError.badRequest('User type is required');
      }

      if (!profileData.first_name || !profileData.last_name) {
        throw ApiError.badRequest('First name and last name are required');
      }

      if (!profileData.email) {
        throw ApiError.badRequest('Email is required');
      }

      // Validate user type specific fields
      if (profileData.user_type === 'natural' && !profileData.national_id) {
        throw ApiError.badRequest('National ID is required for natural persons');
      }

      if (profileData.user_type === 'legal') {
        if (!profileData.economic_code) {
          throw ApiError.badRequest('Economic code is required for legal persons');
        }
        if (!profileData.company_name) {
          throw ApiError.badRequest('Company name is required for legal persons');
        }
      }

      // Update user basic info
      const userUpdates = {};
      if (profileData.user_type) {
        userUpdates.userType = profileData.user_type;
      }

      if (Object.keys(userUpdates).length > 0) {
        await this.userRepo.update(userId, userUpdates);
      }

      // Update or create profile
      if (this.profileRepo) {
        await this.updateOrCreateProfile(userId, profileData);
      }

      // Activate user after profile completion
      await this.userRepo.activateUser(userId);

      // Return updated user profile
      return await this.getUserProfile(userId);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        // Handle duplicate national_id specifically
        if (error.errors.some(e => e.path === 'national_id')) {
          throw ApiError.conflict('National ID must be unique');
        }
        // Handle duplicate economic_code for legal persons
        if (error.errors.some(e => e.path === 'economic_code')) {
          throw ApiError.conflict('Economic code must be unique');
        }
        // Handle other unique constraints
        throw ApiError.conflict('Duplicate value for unique field');
      }
      throw error;
    }
  }

  async updateOrCreateProfile(userId, profileData) {
    const existingProfile = await this.profileRepo.findOne({ userId: userId });
    
    const profileFields = {
      firstName: profileData.first_name,
      lastName: profileData.last_name,
      email: profileData.email,
    };

    // Remove undefined fields
    Object.keys(profileFields).forEach(key => {
      if (profileFields[key] === undefined) {
        delete profileFields[key];
      }
    });

    if (existingProfile) {
      await this.profileRepo.update(existingProfile.id, profileFields);
    } else {
      // Generate customer code
      const customerCode = await this.generateCustomerCode();
      await this.profileRepo.create({
        userId: userId,
        customerCode: customerCode,
        ...profileFields,
      });
    }

    // Handle natural/legal person specific data
    if (profileData.national_id || profileData.economic_code) {
      await this.updatePersonSpecificData(userId, profileData);
    }
  }

  async updatePersonSpecificData(userId, profileData) {
    if (profileData.national_id) {
      // Handle natural person
      const existingNaturalPerson = await this.naturalPersonRepo.findByUserId(userId);

      if (existingNaturalPerson) {
        await this.naturalPersonRepo.updateByUserId(userId, {
          nationalId: profileData.national_id
        });
      } else {
        await this.naturalPersonRepo.createForUser(userId, profileData.national_id);
      }
    }

    if (profileData.economic_code) {
      // Handle legal person
      const existingLegalPerson = await this.legalPersonRepo.findByUserId(userId);

      const legalData = {
        economicCode: profileData.economic_code,
        companyName: profileData.company_name,
      };

      if (existingLegalPerson) {
        await this.legalPersonRepo.updateByUserId(userId, legalData);
      } else {
        await this.legalPersonRepo.createForUser(userId, legalData.economicCode, legalData.companyName);
      }
    }
  }

  async generateCustomerCode() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CUS${timestamp}${random}`;
  }

  async getUserPermissions(userId) {
    const permissions = await this.userRepo.getUserPermissions(userId);
    return permissions;
  }

  async assignUserRole(userId, roleId) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    await this.userRepo.assignRole(userId, roleId);
    return { message: 'Role assigned successfully' };
  }

  async removeUserRole(userId, roleId) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const removed = await this.userRepo.removeRole(userId, roleId);
    if (!removed) {
      throw ApiError.notFound('Role assignment not found');
    }

    return { message: 'Role removed successfully' };
  }

  async chooseRole(userId, roleName) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const role = await this.roleRepo.findByName(roleName);
    if (!role) {
      throw ApiError.notFound(`Role '${roleName}' not found`);
    }

    // Check if user already has the role
    const userRoles = await this.userRepo.getRoles(userId);
    if (userRoles.some(userRole => userRole.id === role.id)) {
      throw ApiError.conflict(`User already has the '${roleName}' role`);
    }
    
    await this.userRepo.assignRole(userId, role.id);
  }

  async deactivateUser(userId) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    await this.userRepo.deactivateUser(userId);
    return { message: 'User deactivated successfully' };
  }

  async activateUser(userId) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    await this.userRepo.activateUser(userId);
    return { message: 'User activated successfully' };
  }

  async getAllUsers({ page = 1, limit = 10, role }) {
    let users;
    if (role) {
      users = await this.userRepo.getUsersByRole(role);
    } else {
      const offset = (page - 1) * limit;
      users = await this.userRepo.findAll({}, [['createdAt', 'DESC']], limit, offset);
    }
    
    // Sanitize users data
    const sanitizedUsers = users.map(user => {
      const { password_hash, ...sanitizedUser } = user;
      return sanitizedUser;
    });
    
    return {
      users: sanitizedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: sanitizedUsers.length,
      }
    };
  }

  // Helper methods
  normalizePhone(phone) {
    // Remove all non-digit characters
    let normalized = phone.replace(/\D/g, '');
    
    // Handle different Iranian phone number formats
    if (normalized.startsWith('98')) {
      normalized = '+' + normalized;
    } else if (normalized.startsWith('0')) {
      normalized = '+98' + normalized.substring(1);
    } else if (normalized.startsWith('9')) {
      normalized = '+98' + normalized;
    }
    
    return normalized;
  }


  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      throw ApiError.unauthorized('Invalid token');
    }
  }

  sanitizeUser(user) {
    // Convert Sequelize model instance to plain object if needed
    let userData = user;
    if (user && typeof user.toJSON === 'function') {
      userData = user.toJSON();
    }
    
    // Remove password_hash if it exists
    const { password_hash, ...sanitizedUser } = userData;
    return sanitizedUser;
  }

  async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = UserService;