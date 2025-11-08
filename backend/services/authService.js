/**
 * Auth Service - Xử lý business logic cho authentication
 * Tách business logic ra khỏi Controller và Model
 */

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Parent = require('../models/Parent');
const { generateToken } = require('../config/jwt');
const { AuthenticationError, ConflictError } = require('../utils/errors');
const { ERROR_MESSAGES } = require('../utils/constants');

class AuthService {
  /**
   * Hash password
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Verify password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>}
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Tạo user mới với password đã được hash
   * @param {Object} userData - User data
   * @returns {Promise<number>} User ID
   */
  static async createUser(userData) {
    const { email, password, full_name, phone, user_type, driver_data, parent_data } = userData;

    // Kiểm tra email đã tồn tại
    const emailExists = await User.emailExists(email);
    if (emailExists) {
      throw new ConflictError('Email đã được sử dụng');
    }

    // Hash password
    const password_hash = await this.hashPassword(password);

    // Tạo user
    const userId = await User.create({
      email,
      password_hash, // Pass hash thay vì plain password
      full_name,
      phone,
      user_type,
      avatar_url: null
    });

    // Tạo driver record nếu là driver
    if (user_type === 'driver' && driver_data) {
      await Driver.create({
        user_id: userId,
        ...driver_data
      });
    }

    // Tạo parent record nếu là parent
    if (user_type === 'parent' && parent_data) {
      await Parent.create({
        user_id: userId,
        ...parent_data
      });
    }

    return userId;
  }

  /**
   * Authenticate user và kiểm tra credentials
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} User object
   */
  static async authenticateUser(email, password) {
    // Tìm user theo email
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AuthenticationError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Kiểm tra user có active không
    if (!user.is_active) {
      throw new AuthenticationError(ERROR_MESSAGES.USER_INACTIVE);
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AuthenticationError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    return user;
  }

  /**
   * Load thông tin bổ sung theo loại user
   * @param {Object} user - User object
   * @returns {Promise<Object>} Additional user info
   */
  static async loadUserProfile(user) {
    let additionalInfo = {};

    if (user.user_type === 'driver') {
      const driver = await Driver.findByUserId(user.user_id);
      additionalInfo.driver = driver;
    } else if (user.user_type === 'parent') {
      const parent = await Parent.findByUserId(user.user_id);
      if (parent) {
        const students = await Parent.getStudents(parent.parent_id);
        additionalInfo.parent = parent;
        additionalInfo.students = students;
      }
    }

    return additionalInfo;
  }

  /**
   * Xử lý login toàn bộ
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} { user, token }
   */
  static async login(email, password) {
    // Authenticate
    const user = await this.authenticateUser(email, password);

    // Generate token
    const token = generateToken({
      userId: user.user_id,
      userType: user.user_type,
      email: user.email
    });

    // Load additional info
    const additionalInfo = await this.loadUserProfile(user);

    // Xóa password hash trước khi trả về
    delete user.password_hash;

    return {
      user: { ...user, ...additionalInfo },
      token
    };
  }

  /**
   * Đổi password
   * @param {number} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  static async changePassword(userId, currentPassword, newPassword) {
    // Lấy user
    const user = await User.findById(userId);
    if (!user) {
      throw new AuthenticationError('Không tìm thấy người dùng');
    }

    // Verify password hiện tại
    const isPasswordValid = await this.verifyPassword(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Mật khẩu hiện tại không đúng');
    }

    // Hash password mới
    const password_hash = await this.hashPassword(newPassword);

    // Update password
    await User.update(userId, { password_hash });
  }
}

module.exports = AuthService;
