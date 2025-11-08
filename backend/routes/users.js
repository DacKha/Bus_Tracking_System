const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByType
} = require('../controllers/userController');
const { protect, authorize, authorizeOwnerOrAdmin } = require('../middleware/auth');
const { userValidation } = require('../middleware/validation');

// Tất cả routes cần authentication
router.use(protect);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get('/', authorize('admin'), getAllUsers);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private (Admin)
 */
router.post('/', authorize('admin'), userValidation.create, createUser);

/**
 * @route   GET /api/users/by-type/:type
 * @desc    Get users by type (admin/driver/parent)
 * @access  Private (Admin)
 */
router.get('/by-type/:type', authorize('admin'), getUsersByType);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private
 */
router.put('/:id', authorizeOwnerOrAdmin, userValidation.update, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private (Admin)
 */
router.delete('/:id', authorize('admin'), userValidation.delete, deleteUser);

module.exports = router;
