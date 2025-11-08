const Tracking = require('../models/Tracking');
const { sendSuccess } = require('../utils/helpers');
const { SUCCESS_MESSAGES, HTTP_STATUS } = require('../utils/constants');

/**
 * @desc    Save GPS location (from driver app)
 * @route   POST /api/tracking/location
 * @access  Private (Driver)
 */
const saveLocation = async (req, res, next) => {
  try {
    const { schedule_id, latitude, longitude, speed, heading, accuracy } = req.body;

    const trackingId = await Tracking.create({
      schedule_id,
      latitude,
      longitude,
      speed,
      heading,
      accuracy
    });

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    io.to(`schedule-${schedule_id}`).emit('location-updated', {
      schedule_id,
      latitude,
      longitude,
      speed,
      heading,
      timestamp: new Date()
    });

    sendSuccess(res, { tracking_id: trackingId }, 'Vị trí đã được lưu', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current location of schedule
 * @route   GET /api/tracking/schedule/:scheduleId
 * @access  Private
 */
const getCurrentLocation = async (req, res, next) => {
  try {
    const scheduleId = parseInt(req.params.scheduleId);

    const location = await Tracking.getCurrentLocation(scheduleId);

    sendSuccess(res, location);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get tracking history
 * @route   GET /api/tracking/history/:scheduleId
 * @access  Private
 */
const getHistory = async (req, res, next) => {
  try {
    const scheduleId = parseInt(req.params.scheduleId);
    const { start_time, end_time, limit } = req.query;

    const history = await Tracking.getHistory(scheduleId, {
      start_time,
      end_time,
      limit: limit ? parseInt(limit) : undefined
    });

    sendSuccess(res, history);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recent locations (last 5 minutes)
 * @route   GET /api/tracking/recent/:scheduleId
 * @access  Private
 */
const getRecentLocations = async (req, res, next) => {
  try {
    const scheduleId = parseInt(req.params.scheduleId);
    const { minutes = 5 } = req.query;

    const locations = await Tracking.getRecentLocations(scheduleId, parseInt(minutes));

    sendSuccess(res, locations);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get tracking statistics
 * @route   GET /api/tracking/stats/:scheduleId
 * @access  Private
 */
const getStatistics = async (req, res, next) => {
  try {
    const scheduleId = parseInt(req.params.scheduleId);

    const stats = await Tracking.getStatistics(scheduleId);

    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get multiple schedules current locations (for dashboard map)
 * @route   POST /api/tracking/multiple
 * @access  Private (Admin)
 */
const getMultipleLocations = async (req, res, next) => {
  try {
    const { schedule_ids } = req.body;

    if (!Array.isArray(schedule_ids) || schedule_ids.length === 0) {
      return sendSuccess(res, []);
    }

    const locations = await Tracking.getMultipleCurrentLocations(schedule_ids);

    sendSuccess(res, locations);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveLocation,
  getCurrentLocation,
  getHistory,
  getRecentLocations,
  getStatistics,
  getMultipleLocations
};
