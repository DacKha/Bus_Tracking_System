const { pool } = require('../config/database');
const { sendSuccess } = require('../utils/helpers');

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = {};

    // Lay thong tin drivers
    const [driversData] = await pool.query(`
      SELECT 
        COUNT(*) as totalDrivers,
        SUM(CASE WHEN d.status = 'available' AND u.is_active = TRUE THEN 1 ELSE 0 END) as activeDrivers
      FROM drivers d
      JOIN users u ON d.user_id = u.user_id
    `);
    stats.totalDrivers = driversData[0].totalDrivers;
    stats.activeDrivers = driversData[0].activeDrivers;

    // Lay thong tin students
    const [studentsData] = await pool.query(`
      SELECT 
        COUNT(*) as totalStudents,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as activeStudents
      FROM students
    `);
    stats.totalStudents = studentsData[0].totalStudents;
    stats.activeStudents = studentsData[0].activeStudents;

    // Lay thong tin buses
    const [busesData] = await pool.query(`
      SELECT 
        COUNT(*) as totalBuses,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeBuses,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenanceBuses
      FROM buses
    `);
    stats.totalBuses = busesData[0].totalBuses;
    stats.activeBuses = busesData[0].activeBuses;
    stats.maintenanceBuses = busesData[0].maintenanceBuses;

    // Lay thong tin routes
    const [routesData] = await pool.query(`
      SELECT 
        COUNT(*) as totalRoutes,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeRoutes
      FROM routes
    `);
    stats.totalRoutes = routesData[0].totalRoutes;
    stats.activeRoutes = routesData[0].activeRoutes;

    // Lay thong tin schedules
    const [schedulesData] = await pool.query(`
      SELECT 
        COUNT(*) as totalSchedules
      FROM schedules
    `);
    stats.totalSchedules = schedulesData[0].totalSchedules;

    // Lay thong tin schedules hom nay
    const [todaySchedulesData] = await pool.query(`
      SELECT 
        COUNT(*) as todaySchedules,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as pendingSchedules,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgressSchedules,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedSchedules
      FROM schedules
      WHERE schedule_date = CURDATE()
    `);
    stats.todaySchedules = todaySchedulesData[0].todaySchedules || 0;
    stats.pendingSchedules = todaySchedulesData[0].pendingSchedules || 0;
    stats.inProgressSchedules = todaySchedulesData[0].inProgressSchedules || 0;
    stats.completedSchedules = todaySchedulesData[0].completedSchedules || 0;

    sendSuccess(res, stats, 'Lay thong tin dashboard thanh cong');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
