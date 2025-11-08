const express = require('express');
const router = express.Router();
const {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  updateScheduleStatus,
  getScheduleStudents,
  addStudentToSchedule,
  removeStudentFromSchedule,
  updatePickupStatus,
  updateDropoffStatus,
  getPendingPickups,
  getPendingDropoffs,
  getTodaySchedules,
  markStudentPickup,
  markStudentDropoff,
  getAttendanceStatus,
  getAttendanceReport
} = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/auth');
const { scheduleValidation } = require('../middleware/validation');

// Tất cả routes cần authentication
router.use(protect);

/**
 * @route   GET /api/schedules
 * @desc    Get all schedules
 * @access  Private
 */
router.get('/', getAllSchedules);

/**
 * @route   POST /api/schedules
 * @desc    Create new schedule
 * @access  Private (Admin)
 */
router.post('/', authorize('admin'), scheduleValidation.create, createSchedule);

/**
 * @route   GET /api/schedules/today
 * @desc    Get today schedules
 * @access  Private
 */
router.get('/today', getTodaySchedules);

/**
 * @route   GET /api/schedules/:id
 * @desc    Get schedule by ID (with students)
 * @access  Private
 */
router.get('/:id', getScheduleById);

/**
 * @route   PUT /api/schedules/:id
 * @desc    Update schedule
 * @access  Private (Admin)
 */
router.put('/:id', authorize('admin'), updateSchedule);

/**
 * @route   DELETE /api/schedules/:id
 * @desc    Delete schedule
 * @access  Private (Admin)
 */
router.delete('/:id', authorize('admin'), deleteSchedule);

/**
 * @route   PUT /api/schedules/:id/status
 * @desc    Update schedule status
 * @access  Private (Admin or Driver)
 */
router.put('/:id/status', authorize('admin', 'driver'), updateScheduleStatus);

/**
 * @route   GET /api/schedules/:id/students
 * @desc    Get schedule students
 * @access  Private
 */
router.get('/:id/students', getScheduleStudents);

/**
 * @route   POST /api/schedules/:id/students
 * @desc    Add student to schedule
 * @access  Private (Admin)
 */
router.post('/:id/students', authorize('admin'), addStudentToSchedule);

/**
 * @route   DELETE /api/schedules/:id/students/:scheduleStudentId
 * @desc    Remove student from schedule
 * @access  Private (Admin)
 */
router.delete('/:id/students/:scheduleStudentId', authorize('admin'), removeStudentFromSchedule);

/**
 * @route   PUT /api/schedules/:id/pickup/:scheduleStudentId
 * @desc    Update pickup status
 * @access  Private (Driver)
 */
router.put('/:id/pickup/:scheduleStudentId', authorize('driver'), updatePickupStatus);

/**
 * @route   PUT /api/schedules/:id/dropoff/:scheduleStudentId
 * @desc    Update dropoff status
 * @access  Private (Driver)
 */
router.put('/:id/dropoff/:scheduleStudentId', authorize('driver'), updateDropoffStatus);

/**
 * @route   GET /api/schedules/:id/pending-pickups
 * @desc    Get pending pickups
 * @access  Private
 */
router.get('/:id/pending-pickups', getPendingPickups);

/**
 * @route   GET /api/schedules/:id/pending-dropoffs
 * @desc    Get pending dropoffs
 * @access  Private
 */
router.get('/:id/pending-dropoffs', getPendingDropoffs);

/**
 * @route   POST /api/schedules/:id/students/:studentId/pickup
 * @desc    Mark student as picked up
 * @access  Private (Driver)
 */
router.post('/:id/students/:studentId/pickup', authorize('driver'), markStudentPickup);

/**
 * @route   POST /api/schedules/:id/students/:studentId/dropoff
 * @desc    Mark student as dropped off
 * @access  Private (Driver)
 */
router.post('/:id/students/:studentId/dropoff', authorize('driver'), markStudentDropoff);

/**
 * @route   GET /api/schedules/:id/attendance
 * @desc    Get attendance status for schedule
 * @access  Private
 */
router.get('/:id/attendance', getAttendanceStatus);

/**
 * @route   GET /api/schedules/attendance/report
 * @desc    Get attendance report
 * @access  Private (Admin)
 */
router.get('/attendance/report', authorize('admin'), getAttendanceReport);

module.exports = router;
