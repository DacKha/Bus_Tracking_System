const { pool } = require('../config/database');

class Incident {
  /**
   * Tạo incident mới
   */
  static async create(incidentData) {
    const {
      schedule_id,
      reported_by,
      incident_type,
      title,
      description,
      severity,
      latitude,
      longitude
    } = incidentData;

    const [result] = await pool.query(
      `INSERT INTO incidents (
        schedule_id, reported_by, incident_type, title, description,
        severity, status, latitude, longitude
      ) VALUES (?, ?, ?, ?, ?, ?, 'reported', ?, ?)`,
      [
        schedule_id, reported_by, incident_type, title, description,
        severity || 'medium', latitude, longitude
      ]
    );

    return result.insertId;
  }

  /**
   * Lấy incident theo ID
   */
  static async findById(incidentId) {
    const [rows] = await pool.query(
      `SELECT i.*,
              s.schedule_date, s.trip_type,
              r.route_name,
              b.bus_number,
              reporter.full_name as reporter_name,
              resolver.full_name as resolver_name
       FROM incidents i
       JOIN schedules s ON i.schedule_id = s.schedule_id
       JOIN routes r ON s.route_id = r.route_id
       JOIN buses b ON s.bus_id = b.bus_id
       JOIN users reporter ON i.reported_by = reporter.user_id
       LEFT JOIN users resolver ON i.resolved_by = resolver.user_id
       WHERE i.incident_id = ?`,
      [incidentId]
    );
    return rows[0];
  }

  /**
   * Lấy tất cả incidents
   */
  static async findAll(filters = {}) {
    let query = `
      SELECT i.*,
             s.schedule_date, s.trip_type,
             r.route_name,
             b.bus_number,
             u.full_name as reporter_name
      FROM incidents i
      JOIN schedules s ON i.schedule_id = s.schedule_id
      JOIN routes r ON s.route_id = r.route_id
      JOIN buses b ON s.bus_id = b.bus_id
      JOIN users u ON i.reported_by = u.user_id
      WHERE 1=1
    `;
    const params = [];

    // Filter by status
    if (filters.status) {
      query += ` AND i.status = ?`;
      params.push(filters.status);
    }

    // Filter by severity
    if (filters.severity) {
      query += ` AND i.severity = ?`;
      params.push(filters.severity);
    }

    // Filter by incident_type
    if (filters.incident_type) {
      query += ` AND i.incident_type = ?`;
      params.push(filters.incident_type);
    }

    // Filter by schedule
    if (filters.schedule_id) {
      query += ` AND i.schedule_id = ?`;
      params.push(filters.schedule_id);
    }

    // Filter by date
    if (filters.date) {
      query += ` AND s.schedule_date = ?`;
      params.push(filters.date);
    }

    query += ` ORDER BY i.created_at DESC`;

    // Pagination
    if (filters.limit) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Đếm tổng số incidents
   */
  static async count(filters = {}) {
    let query = `
      SELECT COUNT(*) as total
      FROM incidents i
      JOIN schedules s ON i.schedule_id = s.schedule_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ` AND i.status = ?`;
      params.push(filters.status);
    }

    if (filters.severity) {
      query += ` AND i.severity = ?`;
      params.push(filters.severity);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  /**
   * Cập nhật incident
   */
  static async update(incidentId, incidentData) {
    const fields = [];
    const values = [];

    const allowedFields = [
      'incident_type', 'title', 'description', 'severity', 'status',
      'latitude', 'longitude', 'resolution_notes'
    ];

    allowedFields.forEach(field => {
      if (incidentData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(incidentData[field]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(incidentId);

    const [result] = await pool.query(
      `UPDATE incidents SET ${fields.join(', ')} WHERE incident_id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * Cập nhật status
   */
  static async updateStatus(incidentId, status, resolvedBy = null, resolutionNotes = null) {
    const fields = ['status = ?'];
    const values = [status];

    if (status === 'resolved' || status === 'closed') {
      fields.push('resolved_at = NOW()');

      if (resolvedBy) {
        fields.push('resolved_by = ?');
        values.push(resolvedBy);
      }

      if (resolutionNotes) {
        fields.push('resolution_notes = ?');
        values.push(resolutionNotes);
      }
    }

    values.push(incidentId);

    const [result] = await pool.query(
      `UPDATE incidents SET ${fields.join(', ')} WHERE incident_id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * Giải quyết incident
   */
  static async resolve(incidentId, resolvedBy, resolutionNotes) {
    return await this.updateStatus(incidentId, 'resolved', resolvedBy, resolutionNotes);
  }

  /**
   * Xóa incident
   */
  static async delete(incidentId) {
    const [result] = await pool.query(
      `DELETE FROM incidents WHERE incident_id = ?`,
      [incidentId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Lấy incidents của schedule
   */
  static async getBySchedule(scheduleId) {
    const [rows] = await pool.query(
      `SELECT i.*, u.full_name as reporter_name
       FROM incidents i
       JOIN users u ON i.reported_by = u.user_id
       WHERE i.schedule_id = ?
       ORDER BY i.created_at DESC`,
      [scheduleId]
    );
    return rows;
  }

  /**
   * Lấy incidents chưa giải quyết
   */
  static async getUnresolved() {
    return await this.findAll({ status: 'reported' });
  }

  /**
   * Lấy incidents nghiêm trọng (high, critical)
   */
  static async getCritical() {
    const [rows] = await pool.query(
      `SELECT i.*,
              s.schedule_date, s.trip_type,
              r.route_name,
              b.bus_number,
              u.full_name as reporter_name
       FROM incidents i
       JOIN schedules s ON i.schedule_id = s.schedule_id
       JOIN routes r ON s.route_id = r.route_id
       JOIN buses b ON s.bus_id = b.bus_id
       JOIN users u ON i.reported_by = u.user_id
       WHERE i.severity IN ('high', 'critical')
       AND i.status NOT IN ('resolved', 'closed')
       ORDER BY
         CASE i.severity
           WHEN 'critical' THEN 1
           WHEN 'high' THEN 2
         END,
         i.created_at DESC`
    );
    return rows;
  }

  /**
   * Thống kê incidents
   */
  static async getStatistics(filters = {}) {
    let query = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'reported' THEN 1 ELSE 0 END) as reported,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low
      FROM incidents i
      JOIN schedules s ON i.schedule_id = s.schedule_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.date) {
      query += ` AND s.schedule_date = ?`;
      params.push(filters.date);
    }

    if (filters.start_date && filters.end_date) {
      query += ` AND s.schedule_date BETWEEN ? AND ?`;
      params.push(filters.start_date, filters.end_date);
    }

    const [rows] = await pool.query(query, params);
    return rows[0];
  }
}

module.exports = Incident;
