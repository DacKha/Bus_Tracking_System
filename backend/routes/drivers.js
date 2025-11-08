const express = require('express');
const router = express.Router();
const {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  getDriverSchedules,
  getDriverTodaySchedules,
  getAvailableDrivers,
  updateDriverStatus
} = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');

// Tất cả routes cần authentication
router.use(protect);

/**
 * @route   GET /api/drivers
 * @desc    Get all drivers
 * @access  Private
 */
router.get('/', getAllDrivers);

/**
 * @route   POST /api/drivers
 * @desc    Create new driver
 * @access  Private (Admin)
 */
router.post('/', authorize('admin'), createDriver);

/**
 * @route   GET /api/drivers/available
 * @desc    Get available drivers
 * @access  Private (Admin)
 */
router.get('/available', authorize('admin'), getAvailableDrivers);

/**
 * @route   GET /api/drivers/:id
 * @desc    Get driver by ID
 * @access  Private
 */
router.get('/:id', getDriverById);

/**
 * @route   PUT /api/drivers/:id
 * @desc    Update driver
 * @access  Private (Admin)
 */
router.put('/:id', authorize('admin'), updateDriver);

/**
 * @route   DELETE /api/drivers/:id
 * @desc    Delete driver
 * @access  Private (Admin)
 */
router.delete('/:id', authorize('admin'), deleteDriver);

/**
 * @route   GET /api/drivers/:id/schedules
 * @desc    Get driver schedules
 * @access  Private
 */
router.get('/:id/schedules', getDriverSchedules);

/**
 * @route   GET /api/drivers/:id/today
 * @desc    Get driver today schedules
 * @access  Private
 */
router.get('/:id/today', getDriverTodaySchedules);

/**
 * @route   PUT /api/drivers/:id/status
 * @desc    Update driver status
 * @access  Private (Admin or Driver)
 */
router.put('/:id/status', updateDriverStatus);

module.exports = router;
