const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  changePassword,
  logout,
  refreshToken
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authValidation } = require('../middleware/validation');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public (hoặc Admin only)
 */
router.post('/register', authValidation.register, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authValidation.login, login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', protect, getMe);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.put('/change-password', protect, authValidation.changePassword, changePassword);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', protect, logout);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh-token', protect, refreshToken);

module.exports = router;
