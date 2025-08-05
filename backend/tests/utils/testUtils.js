const jwt = require('jsonwebtoken');
const { User, Profile, NaturalPerson, LegalPerson, Role, UserRole, Product } = require('../../src/models');

/**
 * Generate a valid JWT token for a user
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET || 'test-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const getAuthHeader = (token) => `Bearer ${token}`;

/**
 * Create a test user
 * @param {string} roleName - e.g. 'admin', 'seller'
 * @param {Object} userData - User data
 * @returns {Object} Created user with token
 */
const createTestUser = async (roleName, userData = {}) => {
  const defaultUserData = {
    phone: `+989${Math.floor(Math.random() * 100000000).toString().padStart(9, '0')}`,
    userType: 'natural',
    isActive: true,
    isVerified: true,
  };

  const user = await User.create({ ...defaultUserData, ...userData });

  if (roleName) {
    const role = await Role.findOne({ where: { name: roleName } });
    if (role) {
      await UserRole.create({ userId: user.id, roleId: role.id });
    } else {
      throw new Error(`Role '${roleName}' not found. Make sure to seed roles.`);
    }
  }

  const token = generateToken(user.id);
  const userWithToken = user.toJSON();
  userWithToken.token = token;

  return userWithToken;
};

const createTestProduct = async (sellerId, productData = {}) => {
  const defaultProductData = {
    sellerId,
    name: 'Test Product',
    description: 'This is a test product.',
    purchasePrice: 100.00,
    status: 'pending',
    isActive: true,
  };

  const product = await Product.create({ ...defaultProductData, ...productData });
  return product;
};

/**
 * Create a test profile
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data
 * @returns {Object} Created profile
 */
const createTestProfile = async (userId, profileData = {}) => {
  const defaultProfileData = {
    userId,
    firstName: 'Test',
    lastName: 'User',
    email: `test${Math.floor(Math.random() * 100000)}@example.com`,
    customerCode: `CUS${Math.floor(Math.random() * 1000000)}`,
  };

  const profile = await Profile.create({ ...defaultProfileData, ...profileData });
  return profile;
};

/**
 * Create a test natural person
 * @param {string} userId - User ID
 * @param {Object} naturalPersonData - Natural person data
 * @returns {Object} Created natural person
 */
const createTestNaturalPerson = async (userId, naturalPersonData = {}) => {
  const defaultNaturalPersonData = {
    userId,
    nationalId: Math.floor(Math.random() * 10000000000).toString().padStart(10, '0'),
  };

  const naturalPerson = await NaturalPerson.create({ ...defaultNaturalPersonData, ...naturalPersonData });
  return naturalPerson;
};

/**
 * Create a test legal person
 * @param {string} userId - User ID
 * @param {Object} legalPersonData - Legal person data
 * @returns {Object} Created legal person
 */
const createTestLegalPerson = async (userId, legalPersonData = {}) => {
  const defaultLegalPersonData = {
    userId,
    economicCode: Math.floor(Math.random() * 10000000000).toString().padStart(10, '0'),
    companyName: `Test Company ${Math.floor(Math.random() * 1000)}`,
  };

  const legalPerson = await LegalPerson.create({ ...defaultLegalPersonData, ...legalPersonData });
  return legalPerson;
};

/**
 * Create a complete test user with profile and person data
 * @param {string} userType - User type ('natural' or 'legal')
 * @returns {Object} Created user with associated data
 */
const createCompleteTestUser = async (userType = 'natural') => {
  const user = await createTestUser({ userType, isActive: false });
  const profile = await createTestProfile(user.id);
  
  if (userType === 'natural') {
    const naturalPerson = await createTestNaturalPerson(user.id);
    return { user, profile, naturalPerson };
  } else {
    const legalPerson = await createTestLegalPerson(user.id);
    return { user, profile, legalPerson };
  }
};

module.exports = {
  generateToken,
  getAuthHeader,
  createTestUser,
  createTestProduct,
  createTestProfile,
  createTestNaturalPerson,
  createTestLegalPerson,
  createCompleteTestUser,
};