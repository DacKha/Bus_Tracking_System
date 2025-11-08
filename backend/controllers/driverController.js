const Driver = require('../models/Driver');
const User = require('../models/User');
const { sendSuccess } = require('../utils/helpers');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { SUCCESS_MESSAGES, HTTP_STATUS } = require('../utils/constants');

/**
 * @desc    Get all drivers
 * @route   GET /api/drivers
 * @access  Private (Admin)
 */
const getAllDrivers = async (req, res, next) => {
  try {
    const { status, is_active, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const drivers = await Driver.findAll({
      status,
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
      search,
      limit: parseInt(limit),
      offset
    });

    const total = await Driver.count({ status, is_active });

    sendSuccess(res, drivers, 'Lay danh sach tai xe thanh cong', 200, {
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
 * @desc    Get driver by ID
 * @route   GET /api/drivers/:id
 * @access  Private
 */
const getDriverById = async (req, res, next) => {
  try {
    const driverId = parseInt(req.params.id);

    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new NotFoundError('Không tìm thấy tài xế');
    }

    sendSuccess(res, driver);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new driver (kèm user)
 * @route   POST /api/drivers
 * @access  Private (Admin)
 */
const createDriver = async (req, res, next) => {
  try {
    const {
      email,
      password,
      full_name,
      phone,
      license_number,
      license_expiry,
      address,
      emergency_contact
    } = req.body;

    // Check email exists
    if (await User.emailExists(email)) {
      throw new ConflictError('Email đã được sử dụng');
    }

    // Check license exists
    if (await Driver.licenseExists(license_number)) {
      throw new ConflictError('Số bằng lái đã tồn tại');
    }

    // Tạo user trước
    const userId = await User.create({
      email,
      password,
      full_name,
      phone,
      user_type: 'driver'
    });

    // Tạo driver
    const driverId = await Driver.create({
      user_id: userId,
      license_number,
      license_expiry,
      address,
      emergency_contact
    });

    const driver = await Driver.findById(driverId);

    sendSuccess(res, driver, SUCCESS_MESSAGES.CREATED, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update driver
 * @route   PUT /api/drivers/:id
 * @access  Private (Admin)
 */
const updateDriver = async (req, res, next) => {
  try {
    const driverId = parseInt(req.params.id);
    const {
      license_number,
      license_expiry,
      address,
      emergency_contact,
      status,
      rating
    } = req.body;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new NotFoundError('Không tìm thấy tài xế');
    }

    // Check license conflict
    if (license_number && license_number !== driver.license_number) {
      if (await Driver.licenseExists(license_number, driverId)) {
        throw new ConflictError('Số bằng lái đã tồn tại');
      }
    }

    await Driver.update(driverId, {
      license_number,
      license_expiry,
      address,
      emergency_contact,
      status,
      rating
    });

    const updatedDriver = await Driver.findById(driverId);

    sendSuccess(res, updatedDriver, SUCCESS_MESSAGES.UPDATED);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete driver
 * @route   DELETE /api/drivers/:id
 * @access  Private (Admin)
 */
const deleteDriver = async (req, res, next) => {
  try {
    const driverId = parseInt(req.params.id);

    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new NotFoundError('Không tìm thấy tài xế');
    }

    await Driver.delete(driverId);

    sendSuccess(res, null, SUCCESS_MESSAGES.DELETED);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get driver schedules
 * @route   GET /api/drivers/:id/schedules
 * @access  Private
 */
const getDriverSchedules = async (req, res, next) => {
  try {
    const driverId = parseInt(req.params.id);
    const { schedule_date, status } = req.query;

    const schedules = await Driver.getSchedules(driverId, {
      schedule_date,
      status
    });

    sendSuccess(res, schedules);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get driver today schedules
 * @route   GET /api/drivers/:id/today
 * @access  Private
 */
const getDriverTodaySchedules = async (req, res, next) => {
  try {
    const driverId = parseInt(req.params.id);

    const schedules = await Driver.getTodaySchedules(driverId);

    sendSuccess(res, schedules);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get available drivers
 * @route   GET /api/drivers/available
 * @access  Private (Admin)
 */
const getAvailableDrivers = async (req, res, next) => {
  try {
    const { date } = req.query;

    const drivers = await Driver.getAvailable(date);

    sendSuccess(res, drivers);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update driver status
 * @route   PUT /api/drivers/:id/status
 * @access  Private (Admin hoặc chính driver đó)
 */
const updateDriverStatus = async (req, res, next) => {
  try {
    const driverId = parseInt(req.params.id);
    const { status } = req.body;

    await Driver.updateStatus(driverId, status);

    const driver = await Driver.findById(driverId);

    sendSuccess(res, driver, 'Cập nhật trạng thái thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  getDriverSchedules,
  getDriverTodaySchedules,
  getAvailableDrivers,
  updateDriverStatus
};
