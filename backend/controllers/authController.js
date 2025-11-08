const User = require('../models/User');
const Driver = require('../models/Driver');
const Parent = require('../models/Parent');
const AuthService = require('../services/authService');
const { generateToken } = require('../config/jwt');
const { sendSuccess, sendError } = require('../utils/helpers');
const {
  AuthenticationError,
  ValidationError,
  ConflictError,
  NotFoundError
} = require('../utils/errors');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, HTTP_STATUS } = require('../utils/constants');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public (hoặc Admin only - tùy yêu cầu)
 */
const register = async (req, res, next) => {
  try {
    const { email, password, full_name, phone, user_type, driver_data, parent_data } = req.body;

    // Sử dụng AuthService để tạo user với password đã được hash
    const userId = await AuthService.createUser({
      email,
      password,
      full_name,
      phone,
      user_type,
      driver_data,
      parent_data
    });

    // Lấy user info không có password
    const user = await User.findById(userId);

    // Generate JWT token
    const token = generateToken({
      userId: user.user_id,
      userType: user.user_type,
      email: user.email
    });

    sendSuccess(res, { user, token }, SUCCESS_MESSAGES.CREATED, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Sử dụng AuthService để xử lý toàn bộ login logic
    const result = await AuthService.login(email, password);

    sendSuccess(res, result, SUCCESS_MESSAGES.LOGIN_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Lấy thông tin bổ sung
    let additionalInfo = {};

    if (user.user_type === 'driver') {
      const driver = await Driver.findByUserId(userId);
      additionalInfo.driver = driver;
    } else if (user.user_type === 'parent') {
      const parent = await Parent.findByUserId(userId);
      const students = await Parent.getStudents(parent.parent_id);
      additionalInfo.parent = parent;
      additionalInfo.students = students;
    }

    sendSuccess(res, { ...user, ...additionalInfo });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { current_password, new_password } = req.body;

    // Sử dụng AuthService để đổi password
    await AuthService.changePassword(userId, current_password, new_password);

    sendSuccess(res, null, 'Đổi mật khẩu thành công');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout (client-side sẽ xóa token)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    // JWT stateless, client sẽ xóa token
    // Nếu cần blacklist token, implement ở đây

    sendSuccess(res, null, SUCCESS_MESSAGES.LOGOUT_SUCCESS);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh token (optional - nếu cần)
 * @route   POST /api/auth/refresh-token
 * @access  Private
 */
const refreshToken = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user || !user.is_active) {
      throw new AuthenticationError(ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Generate new token
    const token = generateToken({
      userId: user.user_id,
      userType: user.user_type,
      email: user.email
    });

    sendSuccess(res, { token }, 'Token đã được làm mới');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  logout,
  refreshToken
};
