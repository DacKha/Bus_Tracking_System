const { pool } = require('../config/database');

class Tracking {
  /**
   * Lưu vị trí GPS mới
   */
  static async create(trackingData) {
    const {
      schedule_id,
      latitude,
      longitude,
      speed,
      heading,
      accuracy
    } = trackingData;

    const [result] = await pool.query(
      `INSERT INTO tracking (schedule_id, latitude, longitude, speed, heading, accuracy)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [schedule_id, latitude, longitude, speed, heading, accuracy]
    );

    return result.insertId;
  }

  /**
   * Lấy vị trí hiện tại (mới nhất) của schedule
   */
  static async getCurrentLocation(scheduleId) {
    const [rows] = await pool.query(
      `SELECT * FROM tracking
       WHERE schedule_id = ?
       ORDER BY recorded_at DESC
       LIMIT 1`,
      [scheduleId]
    );
    return rows[0];
  }

  /**
   * Lấy lịch sử di chuyển của schedule
   */
  static async getHistory(scheduleId, filters = {}) {
    let query = `
      SELECT * FROM tracking
      WHERE schedule_id = ?
    `;
    const params = [scheduleId];

    // Filter by time range
    if (filters.start_time && filters.end_time) {
      query += ` AND recorded_at BETWEEN ? AND ?`;
      params.push(filters.start_time, filters.end_time);
    }

    query += ` ORDER BY recorded_at ASC`;

    // Limit results
    if (filters.limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(filters.limit));
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Lấy vị trí trong khoảng thời gian gần đây (phút)
   */
  static async getRecentLocations(scheduleId, minutes = 5) {
    const [rows] = await pool.query(
      `SELECT * FROM tracking
       WHERE schedule_id = ?
       AND recorded_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
       ORDER BY recorded_at ASC`,
      [scheduleId, minutes]
    );
    return rows;
  }

  /**
   * Xóa tracking data cũ (để tiết kiệm dung lượng)
   */
  static async deleteOld(days = 30) {
    const [result] = await pool.query(
      `DELETE FROM tracking
       WHERE recorded_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [days]
    );
    return result.affectedRows;
  }

  /**
   * Lấy tổng quãng đường đã đi (tính từ lịch sử GPS)
   */
  static async calculateDistance(scheduleId) {
    const history = await this.getHistory(scheduleId);

    if (history.length < 2) return 0;

    let totalDistance = 0;

    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1];
      const curr = history[i];

      // Haversine formula
      const R = 6371; // Earth radius in km
      const dLat = this.toRad(curr.latitude - prev.latitude);
      const dLon = this.toRad(curr.longitude - prev.longitude);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRad(prev.latitude)) *
        Math.cos(this.toRad(curr.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      totalDistance += distance;
    }

    return totalDistance.toFixed(2);
  }

  static toRad(value) {
    return (value * Math.PI) / 180;
  }

  /**
   * Kiểm tra xe có đang di chuyển không (có location update trong 5 phút gần đây)
   */
  static async isActive(scheduleId, minutes = 5) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count FROM tracking
       WHERE schedule_id = ?
       AND recorded_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
      [scheduleId, minutes]
    );
    return rows[0].count > 0;
  }

  /**
   * Lấy tracking info cho nhiều schedules (cho dashboard)
   */
  static async getMultipleCurrentLocations(scheduleIds) {
    if (!scheduleIds || scheduleIds.length === 0) return [];

    const placeholders = scheduleIds.map(() => '?').join(',');

    const [rows] = await pool.query(
      `SELECT t1.*
       FROM tracking t1
       INNER JOIN (
         SELECT schedule_id, MAX(recorded_at) as max_time
         FROM tracking
         WHERE schedule_id IN (${placeholders})
         GROUP BY schedule_id
       ) t2
       ON t1.schedule_id = t2.schedule_id AND t1.recorded_at = t2.max_time`,
      scheduleIds
    );

    return rows;
  }

  /**
   * Lấy thống kê tracking
   */
  static async getStatistics(scheduleId) {
    const [rows] = await pool.query(
      `SELECT
         COUNT(*) as total_points,
         AVG(speed) as avg_speed,
         MAX(speed) as max_speed,
         MIN(recorded_at) as start_time,
         MAX(recorded_at) as end_time
       FROM tracking
       WHERE schedule_id = ?`,
      [scheduleId]
    );

    const stats = rows[0];
    stats.distance = await this.calculateDistance(scheduleId);

    return stats;
  }
}

module.exports = Tracking;
