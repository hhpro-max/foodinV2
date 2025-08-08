const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const authenticate = catchAsync(async (req, res, next) => {
  // Get token from header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('You are not logged in! Please log in to get access.');
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

  // Check if user still exists
  const currentUser = await req.container.userRepo.findWithRoles(decoded.sub);
  if (!currentUser) {
    throw ApiError.unauthorized('The user belonging to this token does no longer exist.');
  }

  // Check if user is active
  if (!currentUser.isActive) {
    throw ApiError.unauthorized('Your account has been deactivated. Please contact support.');
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

const authenticateInactive = catchAsync(async (req, res, next) => {
  // Get token from header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('You are not logged in! Please log in to get access.');
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

  // Check if user still exists
  const currentUser = await req.container.userRepo.findById(decoded.sub);
  if (!currentUser) {
    throw ApiError.unauthorized('The user belonging to this token does no longer exist.');
  }

  // Grant access to protected route even if user is inactive
  req.user = currentUser;
  next();
});

const authorize = (roles = []) => {
  return catchAsync(async (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('You must be logged in to access this resource.');
    }

    // Get user roles
    const userWithRoles = await req.container.userRepo.findWithRoles(req.user.id);
    
    if (!userWithRoles || !userWithRoles.roles) {
      throw ApiError.forbidden('You do not have permission to perform this action.');
    }

    // Check if user has any of the required roles
    const userRoles = userWithRoles.roles || [];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      throw ApiError.forbidden('You do not have permission to perform this action.');
    }

    next();
  });
};

const checkPermission = (permission) => {
  return catchAsync(async (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('You must be logged in to access this resource.');
    }

    // Get user permissions
    const permissions = await req.container.userRepo.getUserPermissions(req.user.id);
    
    if (!permissions.includes(permission)) {
      throw ApiError.forbidden(`You do not have the '${permission}' permission.`);
    }

    next();
  });
};

const optionalAuth = catchAsync(async (req, res, next) => {
  // Get token from header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

      // Check if user still exists
      const currentUser = await req.container.userRepo.findById(decoded.sub);
      if (currentUser && currentUser.isActive) {
        req.user = currentUser;
      }
    } catch (error) {
      // Token is invalid, but we continue without user
      req.user = null;
    }
  }

  next();
});

// Rate limiting for sensitive operations
const rateLimitByUser = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    
    if (!attempts.has(userId)) {
      attempts.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const userAttempts = attempts.get(userId);
    
    if (now > userAttempts.resetTime) {
      // Reset the counter
      attempts.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userAttempts.count >= maxAttempts) {
      throw ApiError.tooManyRequests('Too many attempts. Please try again later.');
    }

    userAttempts.count++;
    next();
  };
};

module.exports = {
  authenticate,
  authenticateInactive,
  authorize,
  checkPermission,
  optionalAuth,
  rateLimitByUser,
};