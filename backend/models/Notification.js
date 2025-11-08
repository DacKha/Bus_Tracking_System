const { pool } = require('../config/database');

class Notification {
  /**
   * Tạo notification mới
   */
  static async create(notificationData) {
    const {
      user_id,
      title,
      message,
      notification_type,
      related_entity_type,
      related_entity_id
    } = notificationData;

    const [result] = await pool.query(
      `INSERT INTO notifications (
        user_id, title, message, notification_type,
        related_entity_type, related_entity_id
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user_id, title, message, notification_type || 'info',
        related_entity_type, related_entity_id
      ]
    );

    return result.insertId;
  }

  /**
   * Lấy notification theo ID
   */
  static async findById(notificationId) {
    const [rows] = await pool.query(
      `SELECT * FROM notifications WHERE notification_id = ?`,
      [notificationId]
    );
    return rows[0];
  }

  /**
   * Lấy tất cả notifications của user
   */
  static async findByUser(userId, filters = {}) {
    try {
      let query = `SELECT * FROM notifications WHERE user_id = ?`;
      const params = [userId];

      if (filters.is_read !== undefined) {
        query += ` AND is_read = ?`;
        params.push(filters.is_read);
      }

      if (filters.notification_type) {
        query += ` AND notification_type = ?`;
        params.push(filters.notification_type);
      }

      query += ` ORDER BY created_at DESC`;

      if (filters.limit) {
        query += ` LIMIT ? OFFSET ?`;
        params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
      }

      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      console.error('Error in Notification.findByUser:', error);
      throw error;
    }
  }

  /**
   * Đếm notifications chưa đọc
   */
  static async countUnread(userId) {
    try {
      const [rows] = await pool.query(
        `SELECT COUNT(*) as count FROM notifications
         WHERE user_id = ? AND is_read = FALSE`,
        [userId]
      );
      return rows[0].count;
    } catch (error) {
      console.error('Error in Notification.countUnread:', error);
      throw error;
    }
  }

  /**
   * Đánh dấu đã đọc
   */
  static async markAsRead(notificationId) {
    const [result] = await pool.query(
      `UPDATE notifications SET is_read = TRUE WHERE notification_id = ?`,
      [notificationId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Đánh dấu tất cả đã đọc
   */
  static async markAllAsRead(userId) {
    const [result] = await pool.query(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE`,
      [userId]
    );
    return result.affectedRows;
  }

  /**
   * Xóa notification
   */
  static async delete(notificationId) {
    const [result] = await pool.query(
      `DELETE FROM notifications WHERE notification_id = ?`,
      [notificationId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Xóa tất cả notifications của user
   */
  static async deleteAllByUser(userId) {
    const [result] = await pool.query(
      `DELETE FROM notifications WHERE user_id = ?`,
      [userId]
    );
    return result.affectedRows;
  }

  /**
   * Xóa notifications cũ (để tiết kiệm dung lượng)
   */
  static async deleteOld(days = 30) {
    const [result] = await pool.query(
      `DELETE FROM notifications
       WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY) AND is_read = TRUE`,
      [days]
    );
    return result.affectedRows;
  }

  /**
   * Gửi notification cho nhiều users
   */
  static async sendToMultiple(userIds, notificationData) {
    if (!userIds || userIds.length === 0) return 0;

    const { title, message, notification_type, related_entity_type, related_entity_id } = notificationData;

    const values = userIds.map(userId => [
      userId, title, message, notification_type || 'info',
      related_entity_type, related_entity_id
    ]);

    const [result] = await pool.query(
      `INSERT INTO notifications (
        user_id, title, message, notification_type,
        related_entity_type, related_entity_id
      ) VALUES ?`,
      [values]
    );

    return result.affectedRows;
  }

  /**
   * Gửi notification cho tất cả parents có con trong schedule
   */
  static async notifyParentsBySchedule(scheduleId, notificationData) {
    const [parents] = await pool.query(
      `SELECT DISTINCT p.user_id
       FROM parents p
       JOIN students s ON p.parent_id = s.parent_id
       JOIN schedule_students ss ON s.student_id = ss.student_id
       WHERE ss.schedule_id = ?`,
      [scheduleId]
    );

    const parentUserIds = parents.map(p => p.user_id);
    return await this.sendToMultiple(parentUserIds, notificationData);
  }
}

module.exports = Notification;
