const Notification = require('../models/Notification');
const { sendSuccess } = require('../utils/helpers');
const { NotFoundError } = require('../utils/errors');
const { SUCCESS_MESSAGES, HTTP_STATUS } = require('../utils/constants');

const getAllNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { is_read, notification_type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const notifications = await Notification.findByUser(userId, {
      is_read: is_read !== undefined ? is_read === 'true' : undefined,
      notification_type,
      limit: parseInt(limit),
      offset
    });

    const unreadCount = await Notification.countUnread(userId);

    const response = {
      notifications,
      unread_count: unreadCount
    };

    sendSuccess(res, response, 'Lấy danh sách thông báo thành công', 200, {
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error in getAllNotifications:', error);
    next(error);
  }
};

const getNotificationById = async (req, res, next) => {
  try {
    const notificationId = parseInt(req.params.id);

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new NotFoundError('Không tìm thấy thông báo');
    }

    sendSuccess(res, notification);
  } catch (error) {
    next(error);
  }
};

const createNotification = async (req, res, next) => {
  try {
    const {
      user_id,
      title,
      message,
      notification_type,
      related_entity_type,
      related_entity_id
    } = req.body;

    const notificationId = await Notification.create({
      user_id,
      title,
      message,
      notification_type,
      related_entity_type,
      related_entity_id
    });

    // Emit socket event
    const io = req.app.get('io');
    io.to(`user-${user_id}`).emit('new-notification', {
      notification_id: notificationId,
      title,
      message,
      notification_type
    });

    sendSuccess(res, { notification_id: notificationId }, SUCCESS_MESSAGES.CREATED, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notificationId = parseInt(req.params.id);

    await Notification.markAsRead(notificationId);

    sendSuccess(res, null, 'Đã đánh dấu đã đọc');
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const count = await Notification.markAllAsRead(userId);

    sendSuccess(res, { marked_count: count }, 'Đã đánh dấu tất cả đã đọc');
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const notificationId = parseInt(req.params.id);

    await Notification.delete(notificationId);

    sendSuccess(res, null, SUCCESS_MESSAGES.DELETED);
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const count = await Notification.countUnread(userId);

    sendSuccess(res, { unread_count: count });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
};
