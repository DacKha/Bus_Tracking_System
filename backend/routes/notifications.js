const express = require('express');
const router = express.Router();
const {
  getAllNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

// Tất cả routes cần authentication
router.use(protect);

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications of current user
 * @access  Private
 */
router.get('/', getAllNotifications);

/**
 * @route   POST /api/notifications
 * @desc    Create notification (Admin only)
 * @access  Private (Admin)
 */
router.post('/', authorize('admin'), createNotification);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread count
 * @access  Private
 */
router.get('/unread-count', getUnreadCount);

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Mark all as read
 * @access  Private
 */
router.put('/mark-all-read', markAllAsRead);

/**
 * @route   GET /api/notifications/:id
 * @desc    Get notification by ID
 * @access  Private
 */
router.get('/:id', getNotificationById);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', markAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id', deleteNotification);

module.exports = router;
