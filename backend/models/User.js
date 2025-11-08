const { pool } = require('../config/database');

class User {
  /**
   * Tạo user mới
   * @param {Object} userData - Phải chứa password_hash đã được hash sẵn
   */
  static async create(userData) {
    const { email, password_hash, full_name, phone, user_type, avatar_url } = userData;

    // Model chỉ chứa database operation, không hash password
    const [result] = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone, user_type, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, password_hash, full_name, phone, user_type, avatar_url]
    );

    return result.insertId;
  }

  /**
   * Lấy user theo ID
   */
  static async findById(userId) {
    const [rows] = await pool.query(
      `SELECT user_id, email, full_name, phone, user_type, avatar_url, is_active, created_at, updated_at
       FROM users
       WHERE user_id = ?`,
      [userId]
    );
    return rows[0];
  }

  /**
   * Lấy user theo email
   */
  static async findByEmail(email) {
    const [rows] = await pool.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    return rows[0];
  }

  /**
   * Lấy tất cả users
   */
  static async findAll(filters = {}) {
    let query = `SELECT user_id, email, full_name, phone, user_type, avatar_url, is_active, created_at
                 FROM users WHERE 1=1`;
    const params = [];

    // Filter by user_type
    if (filters.user_type) {
      query += ` AND user_type = ?`;
      params.push(filters.user_type);
    }

    // Filter by is_active
    if (filters.is_active !== undefined) {
      query += ` AND is_active = ?`;
      params.push(filters.is_active);
    }

    // Search by name or email
    if (filters.search) {
      query += ` AND (full_name LIKE ? OR email LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    // Pagination
    if (filters.limit) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Đếm tổng số users
   */
  static async count(filters = {}) {
    let query = `SELECT COUNT(*) as total FROM users WHERE 1=1`;
    const params = [];

    if (filters.user_type) {
      query += ` AND user_type = ?`;
      params.push(filters.user_type);
    }

    if (filters.is_active !== undefined) {
      query += ` AND is_active = ?`;
      params.push(filters.is_active);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  /**
   * Cập nhật user
   * Lưu ý: password_hash phải được hash sẵn trước khi truyền vào
   */
  static async update(userId, userData) {
    const fields = [];
    const values = [];

    // Build dynamic update query
    if (userData.email !== undefined) {
      fields.push('email = ?');
      values.push(userData.email);
    }
    if (userData.full_name !== undefined) {
      fields.push('full_name = ?');
      values.push(userData.full_name);
    }
    if (userData.phone !== undefined) {
      fields.push('phone = ?');
      values.push(userData.phone);
    }
    if (userData.avatar_url !== undefined) {
      fields.push('avatar_url = ?');
      values.push(userData.avatar_url);
    }
    if (userData.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(userData.is_active);
    }
    if (userData.password_hash !== undefined) {
      fields.push('password_hash = ?');
      values.push(userData.password_hash);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(userId);

    const [result] = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * Xóa user (soft delete - set is_active = false)
   */
  static async softDelete(userId) {
    const [result] = await pool.query(
      `UPDATE users SET is_active = FALSE WHERE user_id = ?`,
      [userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Xóa user vĩnh viễn (hard delete)
   */
  static async delete(userId) {
    const [result] = await pool.query(
      `DELETE FROM users WHERE user_id = ?`,
      [userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Kiểm tra email đã tồn tại chưa
   */
  static async emailExists(email, excludeUserId = null) {
    let query = `SELECT COUNT(*) as count FROM users WHERE email = ?`;
    const params = [email];

    if (excludeUserId) {
      query += ` AND user_id != ?`;
      params.push(excludeUserId);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].count > 0;
  }
}

module.exports = User;
