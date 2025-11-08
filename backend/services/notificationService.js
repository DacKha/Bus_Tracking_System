const Notification = require('../models/Notification');
const { emitNotificationToUser, emitNotificationToRole } = require('../socket');

/**
 * Create and emit notification to a specific user
 * @param {Object} io - Socket.IO instance
 * @param {number} userId - User ID to send notification to
 * @param {Object} data - Notification data
 * @param {string} data.title - Notification title
 * @param {string} data.message - Notification message
 * @param {string} data.notification_type - Type: 'info', 'warning', 'alert', 'success'
 * @param {string} data.related_entity_type - Optional: Entity type (e.g., 'schedule', 'student')
 * @param {number} data.related_entity_id - Optional: Entity ID
 */
const createAndEmitNotification = async (io, userId, data) => {
  try {
    const notificationId = await Notification.create({
      user_id: userId,
      title: data.title,
      message: data.message,
      notification_type: data.notification_type || 'info',
      related_entity_type: data.related_entity_type,
      related_entity_id: data.related_entity_id
    });

    // Emit via Socket.IO
    emitNotificationToUser(io, userId, {
      notification_id: notificationId,
      title: data.title,
      message: data.message,
      type: data.notification_type || 'info',
      timestamp: new Date().toISOString()
    });

    return notificationId;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create and emit notifications to multiple users
 * @param {Object} io - Socket.IO instance
 * @param {Array<number>} userIds - Array of user IDs
 * @param {Object} data - Notification data
 */
const createAndEmitBulkNotifications = async (io, userIds, data) => {
  try {
    const notificationIds = [];

    for (const userId of userIds) {
      const notificationId = await createAndEmitNotification(io, userId, data);
      notificationIds.push(notificationId);
    }

    return notificationIds;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
};

/**
 * Notify parents when bus is approaching
 * @param {Object} io - Socket.IO instance
 * @param {number} scheduleId - Schedule ID
 * @param {Array<Object>} students - Array of students with parent info
 * @param {number} estimatedMinutes - Estimated arrival time in minutes
 */
const notifyBusApproaching = async (io, scheduleId, students, estimatedMinutes) => {
  const parentIds = [...new Set(students.map(s => s.parent_id))]; // Unique parent IDs

  const data = {
    title: '🚌 Xe buýt sắp đến',
    message: `Xe buýt sẽ đến trong khoảng ${estimatedMinutes} phút nữa`,
    notification_type: 'info',
    related_entity_type: 'schedule',
    related_entity_id: scheduleId
  };

  return createAndEmitBulkNotifications(io, parentIds, data);
};

/**
 * Notify parent when student is picked up
 * @param {Object} io - Socket.IO instance
 * @param {number} parentId - Parent user ID
 * @param {string} studentName - Student name
 * @param {string} time - Pickup time
 */
const notifyStudentPickedUp = async (io, parentId, studentName, time) => {
  const data = {
    title: '✅ Đã đón học sinh',
    message: `${studentName} đã được đón lúc ${time}`,
    notification_type: 'success',
    related_entity_type: 'student'
  };

  return createAndEmitNotification(io, parentId, data);
};

/**
 * Notify parent when student is dropped off
 * @param {Object} io - Socket.IO instance
 * @param {number} parentId - Parent user ID
 * @param {string} studentName - Student name
 * @param {string} time - Dropoff time
 */
const notifyStudentDroppedOff = async (io, parentId, studentName, time) => {
  const data = {
    title: '✅ Đã trả học sinh',
    message: `${studentName} đã được trả lúc ${time}`,
    notification_type: 'success',
    related_entity_type: 'student'
  };

  return createAndEmitNotification(io, parentId, data);
};

/**
 * Notify about incident
 * @param {Object} io - Socket.IO instance
 * @param {Array<number>} userIds - Array of user IDs to notify (parents, admin)
 * @param {Object} incident - Incident details
 */
const notifyIncident = async (io, userIds, incident) => {
  const data = {
    title: '⚠️ Báo cáo sự cố',
    message: `Sự cố: ${incident.incident_type} - ${incident.description}`,
    notification_type: 'alert',
    related_entity_type: 'incident',
    related_entity_id: incident.incident_id
  };

  return createAndEmitBulkNotifications(io, userIds, data);
};

/**
 * Notify admins about new incident
 * @param {Object} io - Socket.IO instance
 * @param {Object} incident - Incident details
 */
const notifyAdminsIncident = async (io, incident) => {
  // This uses Socket.IO room-based notification for all admins
  emitNotificationToRole(io, 'admin', {
    notification_id: 0, // Will be created per admin
    title: '🚨 Sự cố mới',
    message: `${incident.incident_type}: ${incident.description}`,
    type: 'alert',
    timestamp: new Date().toISOString()
  });
};

/**
 * Notify when schedule status changes
 * @param {Object} io - Socket.IO instance
 * @param {Array<number>} parentIds - Parent user IDs
 * @param {Object} schedule - Schedule details
 */
const notifyScheduleStatusChange = async (io, parentIds, schedule) => {
  const statusMessages = {
    scheduled: 'Lịch trình đã được lên lịch',
    in_progress: '🚌 Xe buýt đã khởi hành',
    completed: '✅ Chuyến đi hoàn thành',
    cancelled: '❌ Chuyến đi đã bị hủy'
  };

  const data = {
    title: 'Cập nhật lịch trình',
    message: statusMessages[schedule.status] || 'Trạng thái lịch trình đã thay đổi',
    notification_type: schedule.status === 'cancelled' ? 'alert' : 'info',
    related_entity_type: 'schedule',
    related_entity_id: schedule.schedule_id
  };

  return createAndEmitBulkNotifications(io, parentIds, data);
};

/**
 * Notify when new message received
 * @param {Object} io - Socket.IO instance
 * @param {number} recipientId - Recipient user ID
 * @param {string} senderName - Sender name
 */
const notifyNewMessage = async (io, recipientId, senderName) => {
  const data = {
    title: '💬 Tin nhắn mới',
    message: `Bạn có tin nhắn mới từ ${senderName}`,
    notification_type: 'info',
    related_entity_type: 'message'
  };

  return createAndEmitNotification(io, recipientId, data);
};

module.exports = {
  createAndEmitNotification,
  createAndEmitBulkNotifications,
  notifyBusApproaching,
  notifyStudentPickedUp,
  notifyStudentDroppedOff,
  notifyIncident,
  notifyAdminsIncident,
  notifyScheduleStatusChange,
  notifyNewMessage
};
