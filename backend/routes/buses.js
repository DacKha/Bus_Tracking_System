const express = require('express');
const router = express.Router();
const {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
  getAvailableBuses,
  getBusSchedules,
  getBusesNeedMaintenance
} = require('../controllers/busController');
const { protect, authorize } = require('../middleware/auth');
const { busValidation } = require('../middleware/validation');

// Tất cả routes cần authentication
router.use(protect);

/**
 * @route   GET /api/buses
 * @desc    Get all buses
 * @access  Private
 */
router.get('/', getAllBuses);

/**
 * @route   POST /api/buses
 * @desc    Create new bus
 * @access  Private (Admin)
 */
router.post('/', authorize('admin'), busValidation.create, createBus);

/**
 * @route   GET /api/buses/available
 * @desc    Get available buses
 * @access  Private (Admin)
 */
router.get('/available', authorize('admin'), getAvailableBuses);

/**
 * @route   GET /api/buses/maintenance-needed
 * @desc    Get buses need maintenance
 * @access  Private (Admin)
 */
router.get('/maintenance-needed', authorize('admin'), getBusesNeedMaintenance);

/**
 * @route   GET /api/buses/:id
 * @desc    Get bus by ID
 * @access  Private
 */
router.get('/:id', getBusById);

/**
 * @route   PUT /api/buses/:id
 * @desc    Update bus
 * @access  Private (Admin)
 */
router.put('/:id', authorize('admin'), busValidation.update, updateBus);

/**
 * @route   DELETE /api/buses/:id
 * @desc    Delete bus
 * @access  Private (Admin)
 */
router.delete('/:id', authorize('admin'), deleteBus);

/**
 * @route   GET /api/buses/:id/schedules
 * @desc    Get bus schedules
 * @access  Private
 */
router.get('/:id/schedules', getBusSchedules);

module.exports = router;
