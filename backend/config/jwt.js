const jwt = require('jsonwebtoken');

// Cau hinh JWT
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your_fallback_secret_key_change_this',
  expiresIn: process.env.JWT_EXPIRE || '24h'
};

// Tao JWT token cho nguoi dung
const generateToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn
  });
};

// Kiem tra va giai ma JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    throw new Error('Token khong hop le hoac het han');
  }
};

module.exports = {
  jwtConfig,
  generateToken,
  verifyToken
};
