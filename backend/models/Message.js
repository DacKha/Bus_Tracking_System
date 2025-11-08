const { pool } = require('../config/database');

class Message {
  /**
   * Tạo message mới
   */
  static async create(messageData) {
    const {
      sender_id,
      receiver_id,
      subject,
      content,
      parent_message_id
    } = messageData;

    const [result] = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, subject, content, parent_message_id)
       VALUES (?, ?, ?, ?, ?)`,
      [sender_id, receiver_id, subject, content, parent_message_id]
    );

    return result.insertId;
  }

  /**
   * Lấy message theo ID
   */
  static async findById(messageId) {
    const [rows] = await pool.query(
      `SELECT m.*,
              sender.full_name as sender_name, sender.email as sender_email,
              receiver.full_name as receiver_name, receiver.email as receiver_email
       FROM messages m
       JOIN users sender ON m.sender_id = sender.user_id
       JOIN users receiver ON m.receiver_id = receiver.user_id
       WHERE m.message_id = ?`,
      [messageId]
    );
    return rows[0];
  }

  /**
   * Lấy inbox của user (tin nhắn nhận được)
   */
  static async getInbox(userId, filters = {}) {
    let query = `
      SELECT m.*,
             sender.full_name as sender_name,
             sender.email as sender_email,
             sender.avatar_url as sender_avatar
      FROM messages m
      JOIN users sender ON m.sender_id = sender.user_id
      WHERE m.receiver_id = ?
    `;
    const params = [userId];

    // Filter by is_read
    if (filters.is_read !== undefined) {
      query += ` AND m.is_read = ?`;
      params.push(filters.is_read);
    }

    query += ` ORDER BY m.created_at DESC`;

    // Pagination
    if (filters.limit) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Lấy sent messages của user (tin nhắn đã gửi)
   */
  static async getSent(userId, filters = {}) {
    let query = `
      SELECT m.*,
             receiver.full_name as receiver_name,
             receiver.email as receiver_email,
             receiver.avatar_url as receiver_avatar
      FROM messages m
      JOIN users receiver ON m.receiver_id = receiver.user_id
      WHERE m.sender_id = ?
    `;
    const params = [userId];

    query += ` ORDER BY m.created_at DESC`;

    // Pagination
    if (filters.limit) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Lấy conversation giữa 2 users
   */
  static async getConversation(user1Id, user2Id, limit = 50) {
    const [rows] = await pool.query(
      `SELECT m.*,
              sender.full_name as sender_name,
              receiver.full_name as receiver_name
       FROM messages m
       JOIN users sender ON m.sender_id = sender.user_id
       JOIN users receiver ON m.receiver_id = receiver.user_id
       WHERE (m.sender_id = ? AND m.receiver_id = ?)
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC
       LIMIT ?`,
      [user1Id, user2Id, user2Id, user1Id, limit]
    );
    return rows;
  }

  /**
   * Đếm messages chưa đọc
   */
  static async countUnread(userId) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count FROM messages
       WHERE receiver_id = ? AND is_read = FALSE`,
      [userId]
    );
    return rows[0].count;
  }

  /**
   * Đánh dấu đã đọc
   */
  static async markAsRead(messageId) {
    const [result] = await pool.query(
      `UPDATE messages SET is_read = TRUE WHERE message_id = ?`,
      [messageId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Đánh dấu tất cả messages từ sender đã đọc
   */
  static async markConversationAsRead(receiverId, senderId) {
    const [result] = await pool.query(
      `UPDATE messages SET is_read = TRUE
       WHERE receiver_id = ? AND sender_id = ? AND is_read = FALSE`,
      [receiverId, senderId]
    );
    return result.affectedRows;
  }

  /**
   * Xóa message
   */
  static async delete(messageId) {
    const [result] = await pool.query(
      `DELETE FROM messages WHERE message_id = ?`,
      [messageId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Lấy danh sách người đã nhắn tin (contacts)
   */
  static async getContacts(userId) {
    const [rows] = await pool.query(
      `SELECT DISTINCT u.user_id, u.full_name, u.email, u.avatar_url,
              MAX(m.created_at) as last_message_time,
              COUNT(CASE WHEN m.is_read = FALSE AND m.receiver_id = ? THEN 1 END) as unread_count
       FROM users u
       JOIN messages m ON (u.user_id = m.sender_id OR u.user_id = m.receiver_id)
       WHERE (m.sender_id = ? OR m.receiver_id = ?)
       AND u.user_id != ?
       GROUP BY u.user_id
       ORDER BY last_message_time DESC`,
      [userId, userId, userId, userId]
    );
    return rows;
  }

  /**
   * Reply message
   */
  static async reply(parentMessageId, senderId, content) {
    // Lấy message gốc
    const parentMessage = await this.findById(parentMessageId);
    if (!parentMessage) {
      throw new Error('Parent message not found');
    }

    // Tạo reply (đảo sender/receiver)
    return await this.create({
      sender_id: senderId,
      receiver_id: parentMessage.sender_id,
      subject: `Re: ${parentMessage.subject}`,
      content: content,
      parent_message_id: parentMessageId
    });
  }
}

module.exports = Message;
