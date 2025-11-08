const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Middleware để kiểm tra validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    throw new ValidationError('Dữ liệu không hợp lệ', errorMessages);
  }
  next();
};

/**
 * Validation rules cho Authentication
 */
const authValidation = {
  register: [
    body('email')
      .isEmail()
      .withMessage('Email không hợp lệ')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('full_name')
      .notEmpty()
      .withMessage('Họ tên không được để trống')
      .trim(),
    body('phone')
      .optional()
      .matches(/^[0-9]{10,11}$/)
      .withMessage('Số điện thoại không hợp lệ'),
    body('user_type')
      .isIn(['admin', 'driver', 'parent'])
      .withMessage('Loại người dùng không hợp lệ'),
    validate
  ],

  login: [
    body('email')
      .isEmail()
      .withMessage('Email không hợp lệ')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Mật khẩu không được để trống'),
    validate
  ],

  changePassword: [
    body('current_password')
      .notEmpty()
      .withMessage('Mật khẩu hiện tại không được để trống'),
    body('new_password')
      .isLength({ min: 6 })
      .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
    validate
  ]
};

/**
 * Validation rules cho User
 */
const userValidation = {
  create: [
    ...authValidation.register
  ],

  update: [
    param('id').isInt().withMessage('ID không hợp lệ'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email không hợp lệ'),
    body('full_name')
      .optional()
      .notEmpty()
      .withMessage('Họ tên không được để trống'),
    body('phone')
      .optional()
      .matches(/^[0-9]{10,11}$/)
      .withMessage('Số điện thoại không hợp lệ'),
    validate
  ],

  delete: [
    param('id').isInt().withMessage('ID không hợp lệ'),
    validate
  ]
};

/**
 * Validation rules cho Student
 */
const studentValidation = {
  create: [
    body('parent_id')
      .isInt()
      .withMessage('Parent ID không hợp lệ'),
    body('full_name')
      .notEmpty()
      .withMessage('Họ tên không được để trống'),
    body('date_of_birth')
      .optional()
      .isDate()
      .withMessage('Ngày sinh không hợp lệ'),
    body('gender')
      .optional()
      .isIn(['male', 'female', 'other'])
      .withMessage('Giới tính không hợp lệ'),
    validate
  ],

  update: [
    param('id').isInt().withMessage('ID không hợp lệ'),
    body('full_name')
      .optional()
      .notEmpty()
      .withMessage('Họ tên không được để trống'),
    validate
  ]
};

/**
 * Validation rules cho Bus
 */
const busValidation = {
  create: [
    body('bus_number')
      .notEmpty()
      .withMessage('Số xe không được để trống'),
    body('license_plate')
      .notEmpty()
      .withMessage('Biển số xe không được để trống'),
    body('capacity')
      .isInt({ min: 1 })
      .withMessage('Sức chứa phải là số nguyên dương'),
    validate
  ],

  update: [
    param('id').isInt().withMessage('ID không hợp lệ'),
    body('capacity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Sức chứa phải là số nguyên dương'),
    validate
  ]
};

/**
 * Validation rules cho Schedule
 */
const scheduleValidation = {
  create: [
    body('route_id').isInt().withMessage('Route ID không hợp lệ'),
    body('bus_id').isInt().withMessage('Bus ID không hợp lệ'),
    body('driver_id').isInt().withMessage('Driver ID không hợp lệ'),
    body('schedule_date').isDate().withMessage('Ngày không hợp lệ'),
    body('trip_type')
      .isIn(['pickup', 'dropoff'])
      .withMessage('Loại chuyến không hợp lệ'),
    body('start_time')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Giờ bắt đầu không hợp lệ (HH:MM)'),
    validate
  ]
};

module.exports = {
  validate,
  authValidation,
  userValidation,
  studentValidation,
  busValidation,
  scheduleValidation
};
