const express = require('express');
const router = express.Router();
const {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  getRouteStops,
  addStop,
  updateStop,
  deleteStop,
  getRouteSchedules
} = require('../controllers/routeController');
const { protect, authorize } = require('../middleware/auth');

// Tất cả routes cần authentication
router.use(protect);

/**
 * @route   GET /api/routes
 * @desc    Get all routes
 * @access  Private
 */
router.get('/', getAllRoutes);

/**
 * @route   POST /api/routes
 * @desc    Create new route
 * @access  Private (Admin)
 */
router.post('/', authorize('admin'), createRoute);

/**
 * @route   GET /api/routes/:id
 * @desc    Get route by ID (with stops)
 * @access  Private
 */
router.get('/:id', getRouteById);

/**
 * @route   PUT /api/routes/:id
 * @desc    Update route
 * @access  Private (Admin)
 */
router.put('/:id', authorize('admin'), updateRoute);

/**
 * @route   DELETE /api/routes/:id
 * @desc    Delete route
 * @access  Private (Admin)
 */
router.delete('/:id', authorize('admin'), deleteRoute);

/**
 * @route   GET /api/routes/:id/stops
 * @desc    Get route stops
 * @access  Private
 */
router.get('/:id/stops', getRouteStops);

/**
 * @route   POST /api/routes/:id/stops
 * @desc    Add stop to route
 * @access  Private (Admin)
 */
router.post('/:id/stops', authorize('admin'), addStop);

/**
 * @route   PUT /api/routes/:id/stops/:stopId
 * @desc    Update stop
 * @access  Private (Admin)
 */
router.put('/:id/stops/:stopId', authorize('admin'), updateStop);

/**
 * @route   DELETE /api/routes/:id/stops/:stopId
 * @desc    Delete stop
 * @access  Private (Admin)
 */
router.delete('/:id/stops/:stopId', authorize('admin'), deleteStop);

/**
 * @route   GET /api/routes/:id/schedules
 * @desc    Get route schedules
 * @access  Private
 */
router.get('/:id/schedules', getRouteSchedules);

module.exports = router;
