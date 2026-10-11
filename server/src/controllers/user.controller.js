const userService = require('../services/user.service');
const { successResponse } = require('../utils/apiResponse');

const getMyProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user._id);
    return successResponse(res, 200, 'Profile retrieved', { user });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user._id, req.body);
    return successResponse(res, 200, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const result = await userService.getAllUsers(req.query);
    return successResponse(res, 200, 'Users retrieved successfully', result.users, result.pagination);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return successResponse(res, 200, 'User retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const user = await userService.updateUserRole(req.params.id, req.body);
    return successResponse(res, 200, 'User role updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const user = await userService.updateUserStatus(req.params.id, req.body);
    return successResponse(res, 200, 'User status updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
};
