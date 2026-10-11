/**
 * Standard API Response utilities adhering to PRD specifications.
 */

const successResponse = (res, statusCode = 200, message = 'Success', data = {}, meta = undefined) => {
  const payload = {
    success: true,
    message,
    data,
  };

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', code = 'INTERNAL_ERROR', errors = undefined) => {
  const payload = {
    success: false,
    message,
    code,
  };

  if (errors !== undefined) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};

class AppError extends Error {
  constructor(message, statusCode = 400, code = 'BAD_REQUEST', errors = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  successResponse,
  errorResponse,
  AppError,
};
