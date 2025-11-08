const { HTTP_STATUS } = require('./constants');

/**
 * Custom Error Class
 */
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found Error
 */
class NotFoundError extends AppError {
  constructor(message = 'Không tìm thấy tài nguyên') {
    super(message, HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
}

/**
 * Validation Error
 */
class ValidationError extends AppError {
  constructor(message = 'Dữ liệu không hợp lệ', errors = []) {
    super(message, HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

/**
 * Authentication Error
 */
class AuthenticationError extends AppError {
  constructor(message = 'Xác thực thất bại') {
    super(message, HTTP_STATUS.UNAUTHORIZED, 'AUTH_ERROR');
  }
}

/**
 * Authorization Error
 */
class AuthorizationError extends AppError {
  constructor(message = 'Không có quyền truy cập') {
    super(message, HTTP_STATUS.FORBIDDEN, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Conflict Error
 */
class ConflictError extends AppError {
  constructor(message = 'Dữ liệu đã tồn tại') {
    super(message, HTTP_STATUS.CONFLICT, 'CONFLICT_ERROR');
  }
}

/**
 * Database Error
 */
class DatabaseError extends AppError {
  constructor(message = 'Lỗi cơ sở dữ liệu') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'DATABASE_ERROR');
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  DatabaseError
};
