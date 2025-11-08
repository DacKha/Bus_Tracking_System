const { pool } = require('../config/database');

class Parent {
  /**
   * Tạo parent mới
   */
  static async create(parentData) {
    const { user_id, address, emergency_contact, relationship } = parentData;

    const [result] = await pool.query(
      `INSERT INTO parents (user_id, address, emergency_contact, relationship)
       VALUES (?, ?, ?, ?)`,
      [user_id, address, emergency_contact, relationship]
    );

    return result.insertId;
  }

  /**
   * Lấy parent theo ID
   */
  static async findById(parentId) {
    const [rows] = await pool.query(
      `SELECT p.*, u.email, u.full_name, u.phone, u.avatar_url, u.is_active
       FROM parents p
       JOIN users u ON p.user_id = u.user_id
       WHERE p.parent_id = ?`,
      [parentId]
    );
    return rows[0];
  }

  /**
   * Lấy parent theo user_id
   */
  static async findByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT p.*, u.email, u.full_name, u.phone, u.avatar_url
       FROM parents p
       JOIN users u ON p.user_id = u.user_id
       WHERE p.user_id = ?`,
      [userId]
    );
    return rows[0];
  }

  /**
   * Lấy tất cả parents
   */
  static async findAll(filters = {}) {
    let query = `
      SELECT p.*, u.email, u.full_name, u.phone, u.avatar_url, u.is_active
      FROM parents p
      JOIN users u ON p.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];

    // Filter by active
    if (filters.is_active !== undefined) {
      query += ` AND u.is_active = ?`;
      params.push(filters.is_active);
    }

    // Search
    if (filters.search) {
      query += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    query += ` ORDER BY p.created_at DESC`;

    // Pagination
    if (filters.limit) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Đếm tổng số parents
   */
  static async count(filters = {}) {
    let query = `
      SELECT COUNT(*) as total
      FROM parents p
      JOIN users u ON p.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.is_active !== undefined) {
      query += ` AND u.is_active = ?`;
      params.push(filters.is_active);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  /**
   * Cập nhật parent
   */
  static async update(parentId, parentData) {
    const fields = [];
    const values = [];

    if (parentData.address !== undefined) {
      fields.push('address = ?');
      values.push(parentData.address);
    }
    if (parentData.emergency_contact !== undefined) {
      fields.push('emergency_contact = ?');
      values.push(parentData.emergency_contact);
    }
    if (parentData.relationship !== undefined) {
      fields.push('relationship = ?');
      values.push(parentData.relationship);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(parentId);

    const [result] = await pool.query(
      `UPDATE parents SET ${fields.join(', ')} WHERE parent_id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * Xóa parent
   */
  static async delete(parentId) {
    const [result] = await pool.query(
      `DELETE FROM parents WHERE parent_id = ?`,
      [parentId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Lấy danh sách học sinh của parent
   */
  static async getStudents(parentId) {
    const [rows] = await pool.query(
      `SELECT * FROM students WHERE parent_id = ? AND is_active = TRUE ORDER BY full_name`,
      [parentId]
    );
    return rows;
  }

  /**
   * Lấy lịch trình của các con
   */
  static async getChildrenSchedules(parentId, date = null) {
    let query = `
      SELECT s.*, r.route_name, b.bus_number, st.full_name as student_name,
             ss.pickup_status, ss.dropoff_status, u.full_name as driver_name
      FROM schedules s
      JOIN schedule_students ss ON s.schedule_id = ss.schedule_id
      JOIN students st ON ss.student_id = st.student_id
      JOIN routes r ON s.route_id = r.route_id
      JOIN buses b ON s.bus_id = b.bus_id
      JOIN drivers d ON s.driver_id = d.driver_id
      JOIN users u ON d.user_id = u.user_id
      WHERE st.parent_id = ?
    `;
    const params = [parentId];

    if (date) {
      query += ` AND s.schedule_date = ?`;
      params.push(date);
    } else {
      query += ` AND s.schedule_date = CURDATE()`;
    }

    query += ` ORDER BY s.start_time`;

    const [rows] = await pool.query(query, params);
    return rows;
  }
}

module.exports = Parent;
