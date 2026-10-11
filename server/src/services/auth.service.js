const { User } = require('../models');
const { createAuthTokens, refreshTokens, revokeToken } = require('./token.service');
const { AppError } = require('../utils/apiResponse');
const { ROLES } = require('../constants/roles');

const register = async ({ name, email, password, phone, role }) => {
  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required', 400, 'MISSING_FIELDS');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new AppError('An account with this email address already exists', 409, 'EMAIL_EXISTS');
  }

  // Citizens register publicly. Officers/Admins are designated by Admin, but we can allow role if explicitly provided in dev/testing.
  const userRole = role && Object.values(ROLES).includes(role) ? role : ROLES.CITIZEN;

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    phone: phone ? phone.trim() : '',
    role: userRole,
    isActive: true,
  });

  const tokens = await createAuthTokens(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    },
    ...tokens
  };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('Email and password are required', 400, 'MISSING_CREDENTIALS');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() })
    .select('+password')
    .populate('department');

  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AppError('This account has been deactivated. Please contact administrator.', 403, 'ACCOUNT_DEACTIVATED');
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Update last login timestamp
  user.lastLoginAt = new Date();
  await user.save();

  const tokens = await createAuthTokens(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone,
      profileImage: user.profileImage,
      lastLoginAt: user.lastLoginAt,
    },
    ...tokens,
  };
};

const logout = async (refreshToken) => {
  if (refreshToken) {
    await revokeToken(refreshToken);
  }
};

const refreshSession = async (refreshToken) => {
  return refreshTokens(refreshToken);
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).populate('department');
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    phone: user.phone,
    profileImage: user.profileImage,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
};

module.exports = {
  register,
  login,
  logout,
  refreshSession,
  getCurrentUser,
};
