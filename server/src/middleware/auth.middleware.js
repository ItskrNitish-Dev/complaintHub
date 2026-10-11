const { User } = require('../models');
const { verifyAccessToken } = require('../services/token.service');
const { AppError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Authentication required. Please log in.', 401, 'UNAUTHORIZED');
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.sub).populate('department');
    if (!user) {
      throw new AppError('The user belonging to this token no longer exists.', 401, 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403, 'ACCOUNT_DEACTIVATED');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden: role '${req.user.role}' is not authorized to access this resource`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.sub).populate('department');
      if (user && user.isActive) {
        req.user = user;
      }
    } catch {
      // Ignored for optional auth
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
};
