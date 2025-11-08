const { pool } = require('../config/database');

class Driver {
  /**
   * Tạo driver mới (kèm theo user)
   */
  static async create(driverData) {
    const {
      user_id,
      license_number,
      license_expiry,
      address,
      emergency_contact,
      status
    } = driverData;

    const [result] = await pool.query(
      `INSERT INTO drivers (user_id, license_number, license_expiry, address, emergency_contact, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, license_number, license_expiry, address, emergency_contact, status || 'available']
    );

    return result.insertId;
  }

  /**
   * Lấy driver theo ID
   */
  static async findById(driverId) {
    const [rows] = await pool.query(
      `SELECT d.*, u.email, u.full_name, u.phone, u.avatar_url, u.is_active
       FROM drivers d
       JOIN users u ON d.user_id = u.user_id
       WHERE d.driver_id = ?`,
      [driverId]
    );
    return rows[0];
  }

  /**
   * Lấy driver theo user_id
   */
  static async findByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT d.*, u.email, u.full_name, u.phone, u.avatar_url
       FROM drivers d
       JOIN users u ON d.user_id = u.user_id
       WHERE d.user_id = ?`,
      [userId]
    );
    return rows[0];
  }

  /**
   * Lấy tất cả drivers
   */
  static async findAll(filters = {}) {
    let query = `
      SELECT d.*, u.email, u.full_name, u.phone, u.avatar_url, u.is_active
      FROM drivers d
      JOIN users u ON d.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];

    // Filter by status
    if (filters.status) {
      query += ` AND d.status = ?`;
      params.push(filters.status);
    }

    // Filter by active
    if (filters.is_active !== undefined) {
      query += ` AND u.is_active = ?`;
      params.push(filters.is_active);
    }

    // Search
    if (filters.search) {
      query += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR d.license_number LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    query += ` ORDER BY d.created_at DESC`;

    // Pagination
    if (filters.limit) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Đếm tổng số drivers
   */
  static async count(filters = {}) {
    let query = `
      SELECT COUNT(*) as total
      FROM drivers d
      JOIN users u ON d.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ` AND d.status = ?`;
      params.push(filters.status);
    }

    if (filters.is_active !== undefined) {
      query += ` AND u.is_active = ?`;
      params.push(filters.is_active);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  /**
   * Cập nhật driver
   */
  static async update(driverId, driverData) {
    const fields = [];
    const values = [];

    if (driverData.license_number !== undefined) {
      fields.push('license_number = ?');
      values.push(driverData.license_number);
    }
    if (driverData.license_expiry !== undefined) {
      fields.push('license_expiry = ?');
      values.push(driverData.license_expiry);
    }
    if (driverData.address !== undefined) {
      fields.push('address = ?');
      values.push(driverData.address);
    }
    if (driverData.emergency_contact !== undefined) {
      fields.push('emergency_contact = ?');
      values.push(driverData.emergency_contact);
    }
    if (driverData.status !== undefined) {
      fields.push('status = ?');
      values.push(driverData.status);
    }
    if (driverData.rating !== undefined) {
      fields.push('rating = ?');
      values.push(driverData.rating);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(driverId);

    const [result] = await pool.query(
      `UPDATE drivers SET ${fields.join(', ')} WHERE driver_id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * Cập nhật status
   */
  static async updateStatus(driverId, status) {
    const [result] = await pool.query(
      `UPDATE drivers SET status = ? WHERE driver_id = ?`,
      [status, driverId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Xóa driver
   */
  static async delete(driverId) {
    const [result] = await pool.query(
      `DELETE FROM drivers WHERE driver_id = ?`,
      [driverId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Lấy lịch trình của driver
   */
  static async getSchedules(driverId, filters = {}) {
    let query = `
      SELECT s.*, r.route_name, r.route_code, b.bus_number, b.license_plate
      FROM schedules s
      JOIN routes r ON s.route_id = r.route_id
      JOIN buses b ON s.bus_id = b.bus_id
      WHERE s.driver_id = ?
    `;
    const params = [driverId];

    if (filters.schedule_date) {
      query += ` AND s.schedule_date = ?`;
      params.push(filters.schedule_date);
    }

    if (filters.status) {
      query += ` AND s.status = ?`;
      params.push(filters.status);
    }

    query += ` ORDER BY s.schedule_date DESC, s.start_time DESC`;

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Lấy lịch hôm nay của driver
   */
  static async getTodaySchedules(driverId) {
    const [rows] = await pool.query(
      `SELECT s.*, r.route_name, r.route_code, b.bus_number, b.license_plate,
              COUNT(ss.student_id) as total_students
       FROM schedules s
       JOIN routes r ON s.route_id = r.route_id
       JOIN buses b ON s.bus_id = b.bus_id
       LEFT JOIN schedule_students ss ON s.schedule_id = ss.schedule_id
       WHERE s.driver_id = ? AND s.schedule_date = CURDATE()
       GROUP BY s.schedule_id
       ORDER BY s.start_time`,
      [driverId]
    );
    return rows;
  }

  /**
   * Lấy drivers có sẵn (available)
   */
  static async getAvailable(date = null) {
    let query = `
      SELECT d.*, u.full_name, u.phone, u.email
      FROM drivers d
      JOIN users u ON d.user_id = u.user_id
      WHERE d.status = 'available' AND u.is_active = TRUE
    `;
    const params = [];

    // Nếu có date, kiểm tra driver chưa có lịch trong ngày đó
    if (date) {
      query += ` AND d.driver_id NOT IN (
        SELECT driver_id FROM schedules WHERE schedule_date = ?
      )`;
      params.push(date);
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Kiểm tra license_number đã tồn tại chưa
   */
  static async licenseExists(licenseNumber, excludeDriverId = null) {
    let query = `SELECT COUNT(*) as count FROM drivers WHERE license_number = ?`;
    const params = [licenseNumber];

    if (excludeDriverId) {
      query += ` AND driver_id != ?`;
      params.push(excludeDriverId);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].count > 0;
  }
}

module.exports = Driver;
