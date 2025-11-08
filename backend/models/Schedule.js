const { pool } = require('../config/database');

class Schedule {
  /**
   * Tạo schedule mới
   */
  static async create(scheduleData) {
    const {
      route_id,
      bus_id,
      driver_id,
      schedule_date,
      trip_type,
      start_time,
      end_time,
      status,
      notes
    } = scheduleData;

    const [result] = await pool.query(
      `INSERT INTO schedules (
        route_id, bus_id, driver_id, schedule_date, trip_type,
        start_time, end_time, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        route_id, bus_id, driver_id, schedule_date, trip_type,
        start_time, end_time, status || 'scheduled', notes
      ]
    );

    return result.insertId;
  }

  /**
   * Lấy schedule theo ID (kèm thông tin liên quan)
   */
  static async findById(scheduleId) {
    const [rows] = await pool.query(
      `SELECT s.*,
              r.route_name, r.route_code,
              b.bus_number, b.license_plate,
              u.full_name as driver_name, u.phone as driver_phone,
              COUNT(ss.student_id) as total_students
       FROM schedules s
       JOIN routes r ON s.route_id = r.route_id
       JOIN buses b ON s.bus_id = b.bus_id
       JOIN drivers d ON s.driver_id = d.driver_id
       JOIN users u ON d.user_id = u.user_id
       LEFT JOIN schedule_students ss ON s.schedule_id = ss.schedule_id
       WHERE s.schedule_id = ?
       GROUP BY s.schedule_id`,
      [scheduleId]
    );
    return rows[0];
  }

  /**
   * Lấy tất cả schedules
   */
  static async findAll(filters = {}) {
    let query = `
      SELECT s.*,
             r.route_name, r.route_code,
             b.bus_number,
             u.full_name as driver_name,
             COUNT(ss.student_id) as total_students
      FROM schedules s
      JOIN routes r ON s.route_id = r.route_id
      JOIN buses b ON s.bus_id = b.bus_id
      JOIN drivers d ON s.driver_id = d.driver_id
      JOIN users u ON d.user_id = u.user_id
      LEFT JOIN schedule_students ss ON s.schedule_id = ss.schedule_id
      WHERE 1=1
    `;
    const params = [];

    // Filter by date
    if (filters.schedule_date) {
      query += ` AND s.schedule_date = ?`;
      params.push(filters.schedule_date);
    }

    // Filter by date range
    if (filters.start_date && filters.end_date) {
      query += ` AND s.schedule_date BETWEEN ? AND ?`;
      params.push(filters.start_date, filters.end_date);
    }

    // Filter by status
    if (filters.status) {
      query += ` AND s.status = ?`;
      params.push(filters.status);
    }

    // Filter by trip_type
    if (filters.trip_type) {
      query += ` AND s.trip_type = ?`;
      params.push(filters.trip_type);
    }

    // Filter by driver
    if (filters.driver_id) {
      query += ` AND s.driver_id = ?`;
      params.push(filters.driver_id);
    }

    // Filter by bus
    if (filters.bus_id) {
      query += ` AND s.bus_id = ?`;
      params.push(filters.bus_id);
    }

    // Filter by route
    if (filters.route_id) {
      query += ` AND s.route_id = ?`;
      params.push(filters.route_id);
    }

    query += ` GROUP BY s.schedule_id ORDER BY s.schedule_date DESC, s.start_time DESC`;

    // Pagination
    if (filters.limit) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Đếm tổng số schedules
   */
  static async count(filters = {}) {
    let query = `SELECT COUNT(*) as total FROM schedules WHERE 1=1`;
    const params = [];

    if (filters.schedule_date) {
      query += ` AND schedule_date = ?`;
      params.push(filters.schedule_date);
    }

    if (filters.status) {
      query += ` AND status = ?`;
      params.push(filters.status);
    }

    if (filters.driver_id) {
      query += ` AND driver_id = ?`;
      params.push(filters.driver_id);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  /**
   * Cập nhật schedule
   */
  static async update(scheduleId, scheduleData) {
    const fields = [];
    const values = [];

    const allowedFields = [
      'route_id', 'bus_id', 'driver_id', 'schedule_date', 'trip_type',
      'start_time', 'end_time', 'status', 'actual_start_time', 'actual_end_time', 'notes'
    ];

    allowedFields.forEach(field => {
      if (scheduleData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(scheduleData[field]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(scheduleId);

    const [result] = await pool.query(
      `UPDATE schedules SET ${fields.join(', ')} WHERE schedule_id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * Cập nhật status
   */
  static async updateStatus(scheduleId, status) {
    const updates = { status };

    // Tự động set thời gian
    if (status === 'in_progress') {
      updates.actual_start_time = new Date();
    } else if (status === 'completed') {
      updates.actual_end_time = new Date();
    }

    const fields = Object.keys(updates).map(key => `${key} = ?`);
    const values = Object.values(updates);
    values.push(scheduleId);

    const [result] = await pool.query(
      `UPDATE schedules SET ${fields.join(', ')} WHERE schedule_id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * Xóa schedule
   */
  static async delete(scheduleId) {
    const [result] = await pool.query(
      `DELETE FROM schedules WHERE schedule_id = ?`,
      [scheduleId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Lấy students trong schedule
   */
  static async getStudents(scheduleId) {
    const [rows] = await pool.query(
      `SELECT ss.*, s.full_name, s.student_code, s.photo_url,
              st.stop_name, st.stop_address,
              u.full_name as parent_name, u.phone as parent_phone
       FROM schedule_students ss
       JOIN students s ON ss.student_id = s.student_id
       JOIN stops st ON ss.stop_id = st.stop_id
       JOIN parents p ON s.parent_id = p.parent_id
       JOIN users u ON p.user_id = u.user_id
       WHERE ss.schedule_id = ?
       ORDER BY st.stop_order`,
      [scheduleId]
    );
    return rows;
  }

  /**
   * Thêm student vào schedule
   */
  static async addStudent(data) {
    const { schedule_id, student_id, stop_id } = data;

    const [result] = await pool.query(
      `INSERT INTO schedule_students (schedule_id, student_id, stop_id)
       VALUES (?, ?, ?)`,
      [schedule_id, student_id, stop_id]
    );

    return result.insertId;
  }

  /**
   * Xóa student khỏi schedule
   */
  static async removeStudent(scheduleStudentId) {
    const [result] = await pool.query(
      `DELETE FROM schedule_students WHERE schedule_student_id = ?`,
      [scheduleStudentId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Cập nhật pickup status
   */
  static async updatePickupStatus(scheduleStudentId, status, latitude = null, longitude = null) {
    const [result] = await pool.query(
      `UPDATE schedule_students
       SET pickup_status = ?, pickup_time = NOW(), pickup_latitude = ?, pickup_longitude = ?
       WHERE schedule_student_id = ?`,
      [status, latitude, longitude, scheduleStudentId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Cập nhật dropoff status
   */
  static async updateDropoffStatus(scheduleStudentId, status, latitude = null, longitude = null) {
    const [result] = await pool.query(
      `UPDATE schedule_students
       SET dropoff_status = ?, dropoff_time = NOW(), dropoff_latitude = ?, dropoff_longitude = ?
       WHERE schedule_student_id = ?`,
      [status, latitude, longitude, scheduleStudentId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Lấy students chưa đón
   */
  static async getPendingPickups(scheduleId) {
    const [rows] = await pool.query(
      `SELECT ss.*, s.full_name, s.student_code, st.stop_name
       FROM schedule_students ss
       JOIN students s ON ss.student_id = s.student_id
       JOIN stops st ON ss.stop_id = st.stop_id
       WHERE ss.schedule_id = ? AND ss.pickup_status = 'pending'
       ORDER BY st.stop_order`,
      [scheduleId]
    );
    return rows;
  }

  /**
   * Lấy students chưa trả
   */
  static async getPendingDropoffs(scheduleId) {
    const [rows] = await pool.query(
      `SELECT ss.*, s.full_name, s.student_code, st.stop_name
       FROM schedule_students ss
       JOIN students s ON ss.student_id = s.student_id
       JOIN stops st ON ss.stop_id = st.stop_id
       WHERE ss.schedule_id = ? AND ss.dropoff_status = 'pending'
       ORDER BY st.stop_order`,
      [scheduleId]
    );
    return rows;
  }

  /**
   * Lấy schedules hôm nay
   */
  static async getToday(filters = {}) {
    filters.schedule_date = new Date().toISOString().split('T')[0];
    return await this.findAll(filters);
  }

  static async findByBusAndTime(busId, scheduleDate, startTime) {
    const [rows] = await pool.query(
      `SELECT * FROM schedules 
       WHERE bus_id = ? 
       AND schedule_date = ? 
       AND start_time = ?
       AND status NOT IN ('cancelled')`,
      [busId, scheduleDate, startTime]
    );
    return rows[0] || null;
  }

  static async findByDriverAndTime(driverId, scheduleDate, startTime) {
    const [rows] = await pool.query(
      `SELECT * FROM schedules 
       WHERE driver_id = ? 
       AND schedule_date = ? 
       AND start_time = ?
       AND status NOT IN ('cancelled')`,
      [driverId, scheduleDate, startTime]
    );
    return rows[0] || null;
  }

  /**
   * Mark student as picked up
   */
  static async markStudentPickup(scheduleId, studentId) {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const [result] = await pool.query(
      `UPDATE schedule_students 
       SET pickup_status = 'picked_up', 
           pickup_time = ?
       WHERE schedule_id = ? AND student_id = ?`,
      [now, scheduleId, studentId]
    );

    return result.affectedRows > 0;
  }

  /**
   * Mark student as dropped off
   */
  static async markStudentDropoff(scheduleId, studentId) {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const [result] = await pool.query(
      `UPDATE schedule_students 
       SET dropoff_status = 'dropped_off', 
           dropoff_time = ?
       WHERE schedule_id = ? AND student_id = ?`,
      [now, scheduleId, studentId]
    );

    return result.affectedRows > 0;
  }

  /**
   * Get attendance status for schedule
   */
  static async getAttendanceStatus(scheduleId) {
    const [rows] = await pool.query(
      `SELECT ss.schedule_student_id, ss.student_id, ss.schedule_id,
              ss.pickup_status, ss.pickup_time,
              ss.dropoff_status, ss.dropoff_time,
              st.full_name as student_name, st.class_name,
              p.parent_id, u.user_id as parent_user_id, u.full_name as parent_name
       FROM schedule_students ss
       JOIN students st ON ss.student_id = st.student_id
       JOIN parents p ON st.parent_id = p.parent_id
       JOIN users u ON p.user_id = u.user_id
       WHERE ss.schedule_id = ?
       ORDER BY st.full_name`,
      [scheduleId]
    );
    return rows;
  }

  /**
   * Get attendance report for date range
   */
  static async getAttendanceReport(startDate, endDate, filters = {}) {
    let query = `
      SELECT s.schedule_id, s.schedule_date, s.trip_type,
             r.route_name, b.bus_number,
             st.student_id, st.full_name as student_name, st.class_name,
             ss.pickup_status, ss.pickup_time,
             ss.dropoff_status, ss.dropoff_time
      FROM schedules s
      JOIN routes r ON s.route_id = r.route_id
      JOIN buses b ON s.bus_id = b.bus_id
      JOIN schedule_students ss ON s.schedule_id = ss.schedule_id
      JOIN students st ON ss.student_id = st.student_id
      WHERE s.schedule_date BETWEEN ? AND ?
    `;
    const params = [startDate, endDate];

    if (filters.student_id) {
      query += ` AND st.student_id = ?`;
      params.push(filters.student_id);
    }

    if (filters.route_id) {
      query += ` AND s.route_id = ?`;
      params.push(filters.route_id);
    }

    query += ` ORDER BY s.schedule_date DESC, st.full_name`;

    const [rows] = await pool.query(query, params);
    return rows;
  }

}

module.exports = Schedule;
