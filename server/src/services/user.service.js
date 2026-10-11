const { User } = require('../models');
const { AppError } = require('../utils/apiResponse');
const { ALL_ROLES } = require('../constants/roles');

const getProfile = async (userId) => {
  const user = await User.findById(userId).populate('department');
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  return user;
};

const updateProfile = async (userId, updates) => {
  const allowedFields = ['name', 'phone', 'profileImage'];
  const updateData = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).populate('department');

  return updatedUser;
};

const getAllUsers = async (query = {}) => {
  const { page = 1, limit = 20, role, search, status, department } = query;
  const filter = {};

  if (role) {
    filter.role = role;
  }

  if (status !== undefined) {
    filter.isActive = status === 'active' || status === 'true';
  }

  if (department) {
    filter.department = department;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(filter)
      .populate('department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId).populate('department');
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  return user;
};

const updateUserRole = async (userId, { role, department }) => {
  if (!role || !ALL_ROLES.includes(role)) {
    throw new AppError(`Valid role required: ${ALL_ROLES.join(', ')}`, 400, 'INVALID_ROLE');
  }

  const updateData = { role };
  if (department !== undefined) {
    updateData.department = department || null;
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).populate('department');

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user;
};

const updateUserStatus = async (userId, { isActive }) => {
  if (typeof isActive !== 'boolean') {
    throw new AppError('isActive boolean flag is required', 400, 'INVALID_STATUS');
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true, runValidators: true }
  ).populate('department');

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user;
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
};
