const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByParent,
  getStudentsByRoute,
  getStudentSchedules
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const { studentValidation } = require('../middleware/validation');

// Tất cả routes cần authentication
router.use(protect);

/**
 * @route   GET /api/students
 * @desc    Get all students
 * @access  Private
 */
router.get('/', getAllStudents);

/**
 * @route   POST /api/students
 * @desc    Create new student
 * @access  Private (Admin or Parent)
 */
router.post('/', studentValidation.create, createStudent);

/**
 * @route   GET /api/students/parent/:parentId
 * @desc    Get students by parent
 * @access  Private
 */
router.get('/parent/:parentId', getStudentsByParent);

/**
 * @route   GET /api/students/route/:routeId
 * @desc    Get students by route
 * @access  Private
 */
router.get('/route/:routeId', getStudentsByRoute);

/**
 * @route   GET /api/students/:id
 * @desc    Get student by ID
 * @access  Private
 */
router.get('/:id', getStudentById);

/**
 * @route   PUT /api/students/:id
 * @desc    Update student
 * @access  Private (Admin or Parent)
 */
router.put('/:id', studentValidation.update, updateStudent);

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete student (soft delete)
 * @access  Private (Admin)
 */
router.delete('/:id', authorize('admin'), deleteStudent);

/**
 * @route   GET /api/students/:id/schedules
 * @desc    Get student schedules
 * @access  Private
 */
router.get('/:id/schedules', getStudentSchedules);

module.exports = router;
