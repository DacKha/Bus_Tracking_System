const express = require('express');
const router = express.Router();
const {
  getInbox,
  getSent,
  getMessageById,
  sendMessage,
  replyMessage,
  markAsRead,
  deleteMessage,
  getConversation,
  getContacts,
  markConversationAsRead
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// Tất cả routes cần authentication
router.use(protect);

/**
 * @route   GET /api/messages/inbox
 * @desc    Get inbox messages
 * @access  Private
 */
router.get('/inbox', getInbox);

/**
 * @route   GET /api/messages/sent
 * @desc    Get sent messages
 * @access  Private
 */
router.get('/sent', getSent);

/**
 * @route   GET /api/messages/contacts
 * @desc    Get contacts list
 * @access  Private
 */
router.get('/contacts', getContacts);

/**
 * @route   POST /api/messages
 * @desc    Send new message
 * @access  Private
 */
router.post('/', sendMessage);

/**
 * @route   GET /api/messages/conversation/:otherUserId
 * @desc    Get conversation with user
 * @access  Private
 */
router.get('/conversation/:otherUserId', getConversation);

/**
 * @route   PUT /api/messages/conversation/:otherUserId/read
 * @desc    Mark conversation as read
 * @access  Private
 */
router.put('/conversation/:otherUserId/read', markConversationAsRead);

/**
 * @route   POST /api/messages/:parentMessageId/reply
 * @desc    Reply to message
 * @access  Private
 */
router.post('/:parentMessageId/reply', replyMessage);

/**
 * @route   GET /api/messages/:id
 * @desc    Get message by ID
 * @access  Private
 */
router.get('/:id', getMessageById);

/**
 * @route   PUT /api/messages/:id/read
 * @desc    Mark message as read
 * @access  Private
 */
router.put('/:id/read', markAsRead);

/**
 * @route   DELETE /api/messages/:id
 * @desc    Delete message
 * @access  Private
 */
router.delete('/:id', deleteMessage);

module.exports = router;
