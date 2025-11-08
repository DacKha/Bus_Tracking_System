const { pool } = require('../config/database');

class Student {
  /**
   * Tạo student mới
   */
  static async create(studentData) {
    const {
      parent_id,
      full_name,
      date_of_birth,
      gender,
      grade,
      class: className,
      student_code,
      photo_url,
      pickup_address,
      pickup_latitude,
      pickup_longitude,
      dropoff_address,
      dropoff_latitude,
      dropoff_longitude,
      special_needs
    } = studentData;

    const [result] = await pool.query(
      `INSERT INTO students (
        parent_id, full_name, date_of_birth, gender, grade, class, student_code,
        photo_url, pickup_address, pickup_latitude, pickup_longitude,
        dropoff_address, dropoff_latitude, dropoff_longitude, special_needs
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parent_id, full_name, date_of_birth, gender, grade, className, student_code,
        photo_url, pickup_address, pickup_latitude, pickup_longitude,
        dropoff_address, dropoff_latitude, dropoff_longitude, special_needs
      ]
    );

    return result.insertId;
  }

  /**
   * Lấy student theo ID
   */
  static async findById(studentId) {
    const [rows] = await pool.query(
      `SELECT s.*, p.parent_id, u.full_name as parent_name, u.phone as parent_phone, u.email as parent_email
       FROM students s
       JOIN parents p ON s.parent_id = p.parent_id
       JOIN users u ON p.user_id = u.user_id
       WHERE s.student_id = ?`,
      [studentId]
    );
    return rows[0];
  }

  /**
   * Lấy tất cả students
   */
  static async findAll(filters = {}) {
    let query = `
      SELECT s.*, u.full_name as parent_name, u.phone as parent_phone, u.email as parent_email
      FROM students s
      JOIN parents p ON s.parent_id = p.parent_id
      JOIN users u ON p.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];

    // Filter by parent
    if (filters.parent_id) {
      query += ` AND s.parent_id = ?`;
      params.push(filters.parent_id);
    }

    // Filter by active
    if (filters.is_active !== undefined) {
      query += ` AND s.is_active = ?`;
      params.push(filters.is_active);
    }

    // Filter by grade
    if (filters.grade) {
      query += ` AND s.grade = ?`;
      params.push(filters.grade);
    }

    // Filter by class
    if (filters.class) {
      query += ` AND s.class = ?`;
      params.push(filters.class);
    }

    // Search
    if (filters.search) {
      query += ` AND (s.full_name LIKE ? OR s.student_code LIKE ? OR u.full_name LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    query += ` ORDER BY s.full_name ASC`;

    // Pagination
    if (filters.limit) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Đếm tổng số students
   */
  static async count(filters = {}) {
    let query = `SELECT COUNT(*) as total FROM students WHERE 1=1`;
    const params = [];

    if (filters.parent_id) {
      query += ` AND parent_id = ?`;
      params.push(filters.parent_id);
    }

    if (filters.is_active !== undefined) {
      query += ` AND is_active = ?`;
      params.push(filters.is_active);
    }

    if (filters.grade) {
      query += ` AND grade = ?`;
      params.push(filters.grade);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  /**
   * Cập nhật student
   */
  static async update(studentId, studentData) {
    const fields = [];
    const values = [];

    const allowedFields = [
      'full_name', 'date_of_birth', 'gender', 'grade', 'class', 'student_code',
      'photo_url', 'pickup_address', 'pickup_latitude', 'pickup_longitude',
      'dropoff_address', 'dropoff_latitude', 'dropoff_longitude', 'special_needs', 'is_active'
    ];

    allowedFields.forEach(field => {
      if (studentData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(studentData[field]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(studentId);

    const [result] = await pool.query(
      `UPDATE students SET ${fields.join(', ')} WHERE student_id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * Xóa student (soft delete)
   */
  static async softDelete(studentId) {
    const [result] = await pool.query(
      `UPDATE students SET is_active = FALSE WHERE student_id = ?`,
      [studentId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Xóa student vĩnh viễn
   */
  static async delete(studentId) {
    const [result] = await pool.query(
      `DELETE FROM students WHERE student_id = ?`,
      [studentId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Lấy students theo route
   */
  static async findByRoute(routeId, scheduleDate = null) {
    let query = `
      SELECT DISTINCT s.*, ss.pickup_status, ss.dropoff_status
      FROM students s
      JOIN schedule_students ss ON s.student_id = ss.student_id
      JOIN schedules sch ON ss.schedule_id = sch.schedule_id
      WHERE sch.route_id = ? AND s.is_active = TRUE
    `;
    const params = [routeId];

    if (scheduleDate) {
      query += ` AND sch.schedule_date = ?`;
      params.push(scheduleDate);
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Lấy lịch trình của student
   */
  static async getSchedules(studentId, filters = {}) {
    let query = `
      SELECT s.*, r.route_name, b.bus_number, ss.pickup_status, ss.dropoff_status,
             u.full_name as driver_name, u.phone as driver_phone
      FROM schedules s
      JOIN schedule_students ss ON s.schedule_id = ss.schedule_id
      JOIN routes r ON s.route_id = r.route_id
      JOIN buses b ON s.bus_id = b.bus_id
      JOIN drivers d ON s.driver_id = d.driver_id
      JOIN users u ON d.user_id = u.user_id
      WHERE ss.student_id = ?
    `;
    const params = [studentId];

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
   * Kiểm tra student_code đã tồn tại chưa
   */
  static async codeExists(studentCode, excludeStudentId = null) {
    let query = `SELECT COUNT(*) as count FROM students WHERE student_code = ?`;
    const params = [studentCode];

    if (excludeStudentId) {
      query += ` AND student_id != ?`;
      params.push(excludeStudentId);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].count > 0;
  }

  /**
   * Lấy students chưa được assign vào route
   */
  static async getUnassigned(scheduleId) {
    const [rows] = await pool.query(
      `SELECT s.*, u.full_name as parent_name, u.phone as parent_phone
       FROM students s
       JOIN parents p ON s.parent_id = p.parent_id
       JOIN users u ON p.user_id = u.user_id
       WHERE s.is_active = TRUE
       AND s.student_id NOT IN (
         SELECT student_id FROM schedule_students WHERE schedule_id = ?
       )
       ORDER BY s.full_name`,
      [scheduleId]
    );
    return rows;
  }
}

module.exports = Student;
