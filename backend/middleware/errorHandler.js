const { HTTP_STATUS } = require('../utils/constants');
const { sendError } = require('../utils/helpers');

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Loi server';
  let code = err.code || 'SERVER_ERROR';

  // Log error trong development
  if (process.env.NODE_ENV === 'development') {
    console.error('Loi:', err);
  }

  // MySQL Errors
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = HTTP_STATUS.CONFLICT;
    message = 'Du lieu da ton tai';
    code = 'DUPLICATE_ENTRY';
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Du lieu tham chieu khong ton tai';
    code = 'INVALID_REFERENCE';
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Token khong hop le';
    code = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Token da het han';
    code = 'TOKEN_EXPIRED';
  }

  // Validation Errors (express-validator)
  if (err.errors && Array.isArray(err.errors)) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = err.errors.map(e => e.msg).join(', ');
    code = 'VALIDATION_ERROR';
  }

  // Gui response loi
  // Thêm cả error và message để tương thích với frontend
  const response = {
    success: false,
    error: message,
    message: message,
    code
  };

  // Them stack trace trong development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// 404 Not Found Handler
const notFoundHandler = (req, res, next) => {
  const errorMessage = `Khong tim thay route ${req.originalUrl}`;
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: errorMessage,
    message: errorMessage,
    code: 'ROUTE_NOT_FOUND'
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
