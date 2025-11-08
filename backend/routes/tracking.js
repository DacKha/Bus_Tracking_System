const express = require('express');
const router = express.Router();
const {
  saveLocation,
  getCurrentLocation,
  getHistory,
  getRecentLocations,
  getStatistics,
  getMultipleLocations
} = require('../controllers/trackingController');
const { protect, authorize } = require('../middleware/auth');

// Tất cả routes cần authentication
router.use(protect);

/**
 * @route   POST /api/tracking/location
 * @desc    Save GPS location (from driver app)
 * @access  Private (Driver)
 */
router.post('/location', authorize('driver'), saveLocation);

/**
 * @route   POST /api/tracking/multiple
 * @desc    Get multiple schedules current locations (for dashboard)
 * @access  Private
 */
router.post('/multiple', getMultipleLocations);

/**
 * @route   GET /api/tracking/schedule/:scheduleId
 * @desc    Get current location of schedule
 * @access  Private
 */
router.get('/schedule/:scheduleId', getCurrentLocation);

/**
 * @route   GET /api/tracking/history/:scheduleId
 * @desc    Get tracking history
 * @access  Private
 */
router.get('/history/:scheduleId', getHistory);

/**
 * @route   GET /api/tracking/recent/:scheduleId
 * @desc    Get recent locations (last 5 minutes)
 * @access  Private
 */
router.get('/recent/:scheduleId', getRecentLocations);

/**
 * @route   GET /api/tracking/stats/:scheduleId
 * @desc    Get tracking statistics
 * @access  Private
 */
router.get('/stats/:scheduleId', getStatistics);

module.exports = router;
