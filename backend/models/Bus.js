const { pool } = require('../config/database');

class Bus {
  /**
   * Tạo bus mới
   */
  static async create(busData) {
    const {
      bus_number,
      license_plate,
      capacity,
      model,
      year,
      status,
      last_maintenance_date,
      next_maintenance_date
    } = busData;

    const [result] = await pool.query(
      `INSERT INTO buses (
        bus_number, license_plate, capacity, model, year, status,
        last_maintenance_date, next_maintenance_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bus_number, license_plate, capacity, model, year, status || 'active',
        last_maintenance_date, next_maintenance_date
      ]
    );

    return result.insertId;
  }

  /**
   * Lấy bus theo ID
   */
  static async findById(busId) {
    const [rows] = await pool.query(
      `SELECT * FROM buses WHERE bus_id = ?`,
      [busId]
    );
    return rows[0];
  }

  /**
   * Lấy bus theo bus_number
   */
  static async findByBusNumber(busNumber) {
    const [rows] = await pool.query(
      `SELECT * FROM buses WHERE bus_number = ?`,
      [busNumber]
    );
    return rows[0];
  }

  /**
   * Lấy tất cả buses
   */
  static async findAll(filters = {}) {
    let query = `SELECT * FROM buses WHERE 1=1`;
    const params = [];

    // Filter by status
    if (filters.status) {
      query += ` AND status = ?`;
      params.push(filters.status);
    }

    // Search
    if (filters.search) {
      query += ` AND (bus_number LIKE ? OR license_plate LIKE ? OR model LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    query += ` ORDER BY bus_number ASC`;

    // Pagination
    if (filters.limit) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Đếm tổng số buses
   */
  static async count(filters = {}) {
    let query = `SELECT COUNT(*) as total FROM buses WHERE 1=1`;
    const params = [];

    if (filters.status) {
      query += ` AND status = ?`;
      params.push(filters.status);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  /**
   * Cập nhật bus
   */
  static async update(busId, busData) {
    const fields = [];
    const values = [];

    const allowedFields = [
      'bus_number', 'license_plate', 'capacity', 'model', 'year', 'status',
      'last_maintenance_date', 'next_maintenance_date'
    ];

    allowedFields.forEach(field => {
      if (busData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(busData[field]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(busId);

    const [result] = await pool.query(
      `UPDATE buses SET ${fields.join(', ')} WHERE bus_id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * Cập nhật status
   */
  static async updateStatus(busId, status) {
    const [result] = await pool.query(
      `UPDATE buses SET status = ? WHERE bus_id = ?`,
      [status, busId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Xóa bus
   */
  static async delete(busId) {
    const [result] = await pool.query(
      `DELETE FROM buses WHERE bus_id = ?`,
      [busId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Lấy buses có sẵn (không có lịch trong ngày)
   */
  static async getAvailable(date = null) {
    let query = `
      SELECT * FROM buses
      WHERE status = 'active'
    `;
    const params = [];

    if (date) {
      query += ` AND bus_id NOT IN (
        SELECT bus_id FROM schedules WHERE schedule_date = ?
      )`;
      params.push(date);
    }

    query += ` ORDER BY bus_number`;

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Lấy lịch trình của bus
   */
  static async getSchedules(busId, filters = {}) {
    let query = `
      SELECT s.*, r.route_name, r.route_code, u.full_name as driver_name
      FROM schedules s
      JOIN routes r ON s.route_id = r.route_id
      JOIN drivers d ON s.driver_id = d.driver_id
      JOIN users u ON d.user_id = u.user_id
      WHERE s.bus_id = ?
    `;
    const params = [busId];

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
   * Kiểm tra bus_number đã tồn tại chưa
   */
  static async busNumberExists(busNumber, excludeBusId = null) {
    let query = `SELECT COUNT(*) as count FROM buses WHERE bus_number = ?`;
    const params = [busNumber];

    if (excludeBusId) {
      query += ` AND bus_id != ?`;
      params.push(excludeBusId);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].count > 0;
  }

  /**
   * Kiểm tra license_plate đã tồn tại chưa
   */
  static async licensePlateExists(licensePlate, excludeBusId = null) {
    let query = `SELECT COUNT(*) as count FROM buses WHERE license_plate = ?`;
    const params = [licensePlate];

    if (excludeBusId) {
      query += ` AND bus_id != ?`;
      params.push(excludeBusId);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].count > 0;
  }

  /**
   * Lấy buses cần bảo trì sớm (trong 7 ngày tới)
   */
  static async getNeedMaintenance() {
    const [rows] = await pool.query(
      `SELECT * FROM buses
       WHERE next_maintenance_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
       AND status = 'active'
       ORDER BY next_maintenance_date ASC`
    );
    return rows;
  }
}

module.exports = Bus;
