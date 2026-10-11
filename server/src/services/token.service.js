const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { RefreshToken } = require('../models');
const { AppError } = require('../utils/apiResponse');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret_ch_default_2026';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_ch_default_2026';
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * Generate Access Token with standard payload { sub: userId, role: userRole }
 */
const signAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );
};

/**
 * Generate cryptographic Refresh Token
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

/**
 * Hash token for safe storage in DB
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Create access and refresh token pair and persist refresh token hash
 */
const createAuthTokens = async (user) => {
  const accessToken = signAccessToken(user);
  const rawRefreshToken = generateRefreshToken();
  const tokenHash = hashToken(rawRefreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await RefreshToken.create({
    tokenHash,
    user: user._id,
    expiresAt,
    revoked: false,
  });

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    expiresIn: ACCESS_EXPIRES,
  };
};

/**
 * Verify JWT Access Token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Access token expired', 401, 'TOKEN_EXPIRED');
    }
    throw new AppError('Invalid access token', 401, 'INVALID_TOKEN');
  }
};

/**
 * Rotate Refresh Token
 */
const refreshTokens = async (rawRefreshToken) => {
  if (!rawRefreshToken) {
    throw new AppError('Refresh token is required', 400, 'REFRESH_TOKEN_REQUIRED');
  }

  const tokenHash = hashToken(rawRefreshToken);
  const storedToken = await RefreshToken.findOne({ tokenHash }).populate('user');

  if (!storedToken) {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  if (storedToken.revoked) {
    // Possible token reuse attack - revoke all refresh tokens for this user
    await RefreshToken.updateMany({ user: storedToken.user._id }, { revoked: true });
    throw new AppError('Compromised token detected. Please login again.', 401, 'TOKEN_REUSE_DETECTED');
  }

  if (new Date() > storedToken.expiresAt) {
    storedToken.revoked = true;
    await storedToken.save();
    throw new AppError('Refresh token expired. Please login again.', 401, 'REFRESH_TOKEN_EXPIRED');
  }

  const user = storedToken.user;
  if (!user || !user.isActive) {
    throw new AppError('User account is deactivated or no longer exists', 403, 'ACCOUNT_INACTIVE');
  }

  // Revoke old token and issue new pair
  const newRawRefreshToken = generateRefreshToken();
  const newTokenHash = hashToken(newRawRefreshToken);

  storedToken.revoked = true;
  storedToken.replacedByToken = newTokenHash;
  await storedToken.save();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    tokenHash: newTokenHash,
    user: user._id,
    expiresAt,
    revoked: false,
  });

  const accessToken = signAccessToken(user);

  return {
    accessToken,
    refreshToken: newRawRefreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
  };
};

/**
 * Revoke single refresh token on logout
 */
const revokeToken = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;
  const tokenHash = hashToken(rawRefreshToken);
  await RefreshToken.findOneAndUpdate({ tokenHash }, { revoked: true });
};

module.exports = {
  signAccessToken,
  createAuthTokens,
  verifyAccessToken,
  refreshTokens,
  revokeToken,
};
