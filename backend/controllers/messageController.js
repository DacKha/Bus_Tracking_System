const Message = require('../models/Message');
const { sendSuccess } = require('../utils/helpers');
const { NotFoundError } = require('../utils/errors');
const { SUCCESS_MESSAGES, HTTP_STATUS } = require('../utils/constants');

const getInbox = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { is_read, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const messages = await Message.getInbox(userId, {
      is_read: is_read !== undefined ? is_read === 'true' : undefined,
      limit: parseInt(limit),
      offset
    });

    const unreadCount = await Message.countUnread(userId);

    const response = {
      messages,
      unread_count: unreadCount
    };

    sendSuccess(res, response, 'Lấy hộp thư đến thành công', 200, {
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    next(error);
  }
};

const getSent = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const messages = await Message.getSent(userId, {
      limit: parseInt(limit),
      offset
    });

    sendSuccess(res, messages, 'Lấy tin nhắn đã gửi thành công', 200, {
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    next(error);
  }
};

const getMessageById = async (req, res, next) => {
  try {
    const messageId = parseInt(req.params.id);

    const message = await Message.findById(messageId);
    if (!message) {
      throw new NotFoundError('Không tìm thấy tin nhắn');
    }

    sendSuccess(res, message);
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.userId;
    const { receiver_id, subject, content, parent_message_id } = req.body;

    const messageId = await Message.create({
      sender_id: senderId,
      receiver_id,
      subject,
      content,
      parent_message_id
    });

    // Emit socket event
    const io = req.app.get('io');
    io.to(`user-${receiver_id}`).emit('new-message', {
      message_id: messageId,
      sender_id: senderId,
      subject
    });

    const message = await Message.findById(messageId);

    sendSuccess(res, message, 'Tin nhắn đã được gửi', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

const replyMessage = async (req, res, next) => {
  try {
    const senderId = req.user.userId;
    const parentMessageId = parseInt(req.params.parentMessageId);
    const { content } = req.body;

    const messageId = await Message.reply(parentMessageId, senderId, content);

    const message = await Message.findById(messageId);

    sendSuccess(res, message, 'Đã trả lời tin nhắn', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const messageId = parseInt(req.params.id);

    await Message.markAsRead(messageId);

    sendSuccess(res, null, 'Đã đánh dấu đã đọc');
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const messageId = parseInt(req.params.id);

    await Message.delete(messageId);

    sendSuccess(res, null, SUCCESS_MESSAGES.DELETED);
  } catch (error) {
    next(error);
  }
};

const getConversation = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const otherUserId = parseInt(req.params.otherUserId);
    const { limit = 50 } = req.query;

    const messages = await Message.getConversation(userId, otherUserId, parseInt(limit));

    sendSuccess(res, messages);
  } catch (error) {
    next(error);
  }
};

const getContacts = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const contacts = await Message.getContacts(userId);

    sendSuccess(res, contacts);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInbox,
  getSent,
  getMessageById,
  sendMessage,
  replyMessage,
  markAsRead,
  deleteMessage,
  getConversation,
  getContacts
};
