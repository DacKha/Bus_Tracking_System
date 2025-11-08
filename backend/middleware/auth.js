const { verifyToken } = require('../config/jwt');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');
const { ERROR_MESSAGES } = require('../utils/constants');

// Middleware xac thuc JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Lay token tu header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Kiem tra token co ton tai khong
    if (!token) {
      throw new AuthenticationError(ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Kiem tra va giai ma token
    const decoded = verifyToken(token);

    // Gan thong tin nguoi dung vao request
    req.user = {
      userId: decoded.userId,
      userType: decoded.userType,
      email: decoded.email
    };

    next();
  } catch (error) {
    if (error.message === 'Token khong hop le hoac het han') {
      return next(new AuthenticationError(ERROR_MESSAGES.TOKEN_EXPIRED));
    }
    next(error);
  }
};

// Middleware kiem tra quyen truy cap theo vai tro
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError(ERROR_MESSAGES.UNAUTHORIZED));
    }

    if (!roles.includes(req.user.userType)) {
      return next(
        new AuthorizationError(
          `Chi ${roles.join(', ')} moi co quyen truy cap tai nguyen nay`
        )
      );
    }

    next();
  };
};

// Xac thuc tuy chon - khong bat buoc dang nhap
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        req.user = {
          userId: decoded.userId,
          userType: decoded.userType,
          email: decoded.email
        };
      } catch (error) {
        // Token khong hop le, tiep tuc khong co user
        req.user = null;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Kiem tra chu so huu hoac admin
const authorizeOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new AuthenticationError(ERROR_MESSAGES.UNAUTHORIZED));
  }

  const targetUserId = parseInt(req.params.id);

  // Admin hoac chinh user do moi duoc phep
  if (req.user.userType === 'admin' || req.user.userId === targetUserId) {
    return next();
  }

  return next(
    new AuthorizationError('Ban khong co quyen truy cap tai nguyen nay')
  );
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  authorizeOwnerOrAdmin
};
