const { pool } = require('../config/database');

class Route {
  /**
   * Tạo route mới
   */
  static async create(routeData) {
    const {
      route_name,
      route_code,
      description,
      estimated_duration,
      distance_km,
      status
    } = routeData;

    const [result] = await pool.query(
      `INSERT INTO routes (route_name, route_code, description, estimated_duration, distance_km, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [route_name, route_code, description, estimated_duration, distance_km, status || 'active']
    );

    return result.insertId;
  }

  /**
   * Lấy route theo ID (kèm stops)
   */
  static async findById(routeId, includeStops = true) {
    const [routes] = await pool.query(
      `SELECT * FROM routes WHERE route_id = ?`,
      [routeId]
    );

    if (!routes[0]) return null;

    const route = routes[0];

    if (includeStops) {
      const [stops] = await pool.query(
        `SELECT * FROM stops WHERE route_id = ? ORDER BY stop_order`,
        [routeId]
      );
      route.stops = stops;
    }

    return route;
  }

  /**
   * Lấy route theo code
   */
  static async findByCode(routeCode) {
    const [rows] = await pool.query(
      `SELECT * FROM routes WHERE route_code = ?`,
      [routeCode]
    );
    return rows[0];
  }

  /**
   * Lấy tất cả routes
   */
  static async findAll(filters = {}) {
    let query = `SELECT * FROM routes WHERE 1=1`;
    const params = [];

    // Filter by status
    if (filters.status) {
      query += ` AND status = ?`;
      params.push(filters.status);
    }

    // Search
    if (filters.search) {
      query += ` AND (route_name LIKE ? OR route_code LIKE ? OR description LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    query += ` ORDER BY route_code ASC`;

    // Pagination
    if (filters.limit) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Đếm tổng số routes
   */
  static async count(filters = {}) {
    let query = `SELECT COUNT(*) as total FROM routes WHERE 1=1`;
    const params = [];

    if (filters.status) {
      query += ` AND status = ?`;
      params.push(filters.status);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  /**
   * Cập nhật route
   */
  static async update(routeId, routeData) {
    const fields = [];
    const values = [];

    const allowedFields = [
      'route_name', 'route_code', 'description', 'estimated_duration', 'distance_km', 'status'
    ];

    allowedFields.forEach(field => {
      if (routeData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(routeData[field]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(routeId);

    const [result] = await pool.query(
      `UPDATE routes SET ${fields.join(', ')} WHERE route_id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * Xóa route
   */
  static async delete(routeId) {
    // Xóa stops trước (cascade sẽ tự động xóa)
    const [result] = await pool.query(
      `DELETE FROM routes WHERE route_id = ?`,
      [routeId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Lấy stops của route
   */
  static async getStops(routeId) {
    const [rows] = await pool.query(
      `SELECT * FROM stops WHERE route_id = ? ORDER BY stop_order`,
      [routeId]
    );
    return rows;
  }

  /**
   * Thêm stop vào route
   */
  static async addStop(stopData) {
    const {
      route_id,
      stop_name,
      stop_address,
      latitude,
      longitude,
      stop_order,
      estimated_arrival_time
    } = stopData;

    const [result] = await pool.query(
      `INSERT INTO stops (route_id, stop_name, stop_address, latitude, longitude, stop_order, estimated_arrival_time)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [route_id, stop_name, stop_address, latitude, longitude, stop_order, estimated_arrival_time]
    );

    return result.insertId;
  }

  /**
   * Cập nhật stop
   */
  static async updateStop(stopId, stopData) {
    const fields = [];
    const values = [];

    const allowedFields = [
      'stop_name', 'stop_address', 'latitude', 'longitude', 'stop_order', 'estimated_arrival_time'
    ];

    allowedFields.forEach(field => {
      if (stopData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(stopData[field]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(stopId);

    const [result] = await pool.query(
      `UPDATE stops SET ${fields.join(', ')} WHERE stop_id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * Xóa stop
   */
  static async deleteStop(stopId) {
    const [result] = await pool.query(
      `DELETE FROM stops WHERE stop_id = ?`,
      [stopId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Kiểm tra route_code đã tồn tại chưa
   */
  static async codeExists(routeCode, excludeRouteId = null) {
    let query = `SELECT COUNT(*) as count FROM routes WHERE route_code = ?`;
    const params = [routeCode];

    if (excludeRouteId) {
      query += ` AND route_id != ?`;
      params.push(excludeRouteId);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].count > 0;
  }

  /**
   * Lấy lịch trình của route
   */
  static async getSchedules(routeId, filters = {}) {
    let query = `
      SELECT s.*, b.bus_number, u.full_name as driver_name,
             COUNT(ss.student_id) as total_students
      FROM schedules s
      JOIN buses b ON s.bus_id = b.bus_id
      JOIN drivers d ON s.driver_id = d.driver_id
      JOIN users u ON d.user_id = u.user_id
      LEFT JOIN schedule_students ss ON s.schedule_id = ss.schedule_id
      WHERE s.route_id = ?
    `;
    const params = [routeId];

    if (filters.schedule_date) {
      query += ` AND s.schedule_date = ?`;
      params.push(filters.schedule_date);
    }

    if (filters.status) {
      query += ` AND s.status = ?`;
      params.push(filters.status);
    }

    query += ` GROUP BY s.schedule_id ORDER BY s.schedule_date DESC, s.start_time DESC`;

    const [rows] = await pool.query(query, params);
    return rows;
  }
}

module.exports = Route;
