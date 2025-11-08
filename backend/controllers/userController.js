const User = require('../models/User');
const Driver = require('../models/Driver');
const Parent = require('../models/Parent');
const { sendSuccess } = require('../utils/helpers');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { SUCCESS_MESSAGES, HTTP_STATUS } = require('../utils/constants');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private (Admin)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { user_type, is_active, search, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const users = await User.findAll({
      user_type,
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
      search,
      limit: parseInt(limit),
      offset
    });

    const total = await User.count({ user_type, is_active });

    sendSuccess(res, users, 'Lay danh sach nguoi dung thanh cong', 200, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private (Admin hoặc chính user đó)
 */
const getUserById = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    // Lấy thông tin bổ sung
    let additionalInfo = {};
    if (user.user_type === 'driver') {
      additionalInfo.driver = await Driver.findByUserId(userId);
    } else if (user.user_type === 'parent') {
      const parent = await Parent.findByUserId(userId);
      additionalInfo.parent = parent;
      additionalInfo.students = await Parent.getStudents(parent.parent_id);
    }

    sendSuccess(res, { ...user, ...additionalInfo });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new user
 * @route   POST /api/users
 * @access  Private (Admin)
 */
const createUser = async (req, res, next) => {
  try {
    const { email, password, full_name, phone, user_type, avatar_url } = req.body;

    // Check email exists
    if (await User.emailExists(email)) {
      throw new ConflictError('Email đã được sử dụng');
    }

    const userId = await User.create({
      email,
      password,
      full_name,
      phone,
      user_type,
      avatar_url
    });

    const user = await User.findById(userId);

    sendSuccess(res, user, SUCCESS_MESSAGES.CREATED, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private (Admin hoặc chính user đó)
 */
const updateUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Remove password and password_hash from update data (security)
    const { password, password_hash, ...updateData } = req.body;

    // Check user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    // Check email conflict (nếu đổi email)
    if (email && email !== user.email) {
      if (await User.emailExists(email, userId)) {
        throw new ConflictError('Email đã được sử dụng');
      }
    }

    await User.update(userId, {
      email,
      full_name,
      phone,
      avatar_url,
      is_active
    });

    const updatedUser = await User.findById(userId);

    sendSuccess(res, updatedUser, SUCCESS_MESSAGES.UPDATED);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user (soft delete)
 * @route   DELETE /api/users/:id
 * @access  Private (Admin)
 */
const deleteUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    // Soft delete
    await User.softDelete(userId);

    sendSuccess(res, null, SUCCESS_MESSAGES.DELETED);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get users by type
 * @route   GET /api/users/by-type/:type
 * @access  Private (Admin)
 */
const getUsersByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const users = await User.findAll({
      user_type: type,
      limit: parseInt(limit),
      offset
    });

    const total = await User.count({ user_type: type });

    sendSuccess(res, users, 'Lay danh sach nguoi dung theo loai thanh cong', 200, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};


/**
 * @desc    Toggle user status (active/inactive)
 * @route   PATCH /api/users/:id/status
 * @access  Private (Admin)
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const { is_active } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    await User.update(userId, { is_active });
    const updatedUser = await User.findById(userId);

    sendSuccess(res, updatedUser, 'Cập nhật trạng thái thành công');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user password (admin only)
 * @route   PATCH /api/users/:id/password
 * @access  Private (Admin)
 */
const changeUserPassword = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const { password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await User.update(userId, { password_hash });

    sendSuccess(res, null, 'Đổi mật khẩu thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByType
};
