const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');


const getProfile = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const profile = await req.container.userService.getUserProfile(userId);
  
  res.status(200).json({
    status: 'success',
    data: { user: profile },
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const profileData = req.body;
  
  const updatedProfile = await req.container.userService.updateUserProfile(userId, profileData);
  
  res.status(200).json({
    status: 'success',
    data: { user: updatedProfile },
  });
});

const getUserPermissions = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const permissions = await req.container.userService.getUserPermissions(userId);
  
  res.status(200).json({
    status: 'success',
    data: { permissions },
  });
});

const assignRole = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { roleId } = req.body;
  
  if (!roleId) {
    throw ApiError.badRequest('Role ID is required');
  }

  const result = await req.container.userService.assignUserRole(userId, roleId);
  
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const removeRole = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { roleId } = req.body;
  
  if (!roleId) {
    throw ApiError.badRequest('Role ID is required');
  }

  const result = await req.container.userService.removeUserRole(userId, roleId);
  
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const deactivateUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  
  const result = await req.container.userService.deactivateUser(userId);
  
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const activateUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  
  const result = await req.container.userService.activateUser(userId);
  
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const completeProfile = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const profileData = req.body;
  
  // Complete user profile and activate user
  const updatedProfile = await req.container.userService.completeUserProfile(userId, profileData);
  
  res.status(200).json({
    status: 'success',
    message: 'Profile completed and user activated successfully',
    data: { user: updatedProfile },
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, role } = req.query;
  
  const result = await req.container.userService.getAllUsers({ page, limit, role });
  
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const chooseRole = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { role } = req.body;

  await req.container.userService.chooseRole(userId, role);

  res.status(200).json({
    status: 'success',
    message: 'Role chosen successfully',
  });
});

module.exports = {
  getProfile,
  updateProfile,
  completeProfile,
  getUserPermissions,
  assignRole,
  removeRole,
  deactivateUser,
  activateUser,
  getAllUsers,
  chooseRole,
};