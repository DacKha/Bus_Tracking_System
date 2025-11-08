const Schedule = require('../models/Schedule');
const Notification = require('../models/Notification');
const { sendSuccess } = require('../utils/helpers');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { SUCCESS_MESSAGES, HTTP_STATUS } = require('../utils/constants');
const { notifyStudentPickedUp, notifyStudentDroppedOff } = require('../services/notificationService');

const getAllSchedules = async (req, res, next) => {
  try {
    const {
      schedule_date,
      start_date,
      end_date,
      status,
      trip_type,
      driver_id,
      bus_id,
      route_id,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;

    const schedules = await Schedule.findAll({
      schedule_date,
      start_date,
      end_date,
      status,
      trip_type,
      driver_id: driver_id ? parseInt(driver_id) : undefined,
      bus_id: bus_id ? parseInt(bus_id) : undefined,
      route_id: route_id ? parseInt(route_id) : undefined,
      limit: parseInt(limit),
      offset
    });

    const total = await Schedule.count({
      schedule_date,
      status,
      driver_id
    });

    sendSuccess(res, schedules, 'Lay danh sach lich trinh thanh cong', 200, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

const getScheduleById = async (req, res, next) => {
  try {
    const scheduleId = parseInt(req.params.id);

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      throw new NotFoundError('Không tìm thấy lịch trình');
    }

    // Lấy danh sách students
    const students = await Schedule.getStudents(scheduleId);

    sendSuccess(res, { ...schedule, students });
  } catch (error) {
    next(error);
  }
};

const createSchedule = async (req, res, next) => {
  try {
    const {
      route_id,
      bus_id,
      driver_id,
      schedule_date,
      trip_type,
      start_time,
      end_time,
      notes
    } = req.body;

    const scheduleId = await Schedule.create({
      route_id,
      bus_id,
      driver_id,
      schedule_date,
      trip_type,
      start_time,
      end_time,
      notes
    });

    const schedule = await Schedule.findById(scheduleId);

    sendSuccess(res, schedule, SUCCESS_MESSAGES.CREATED, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

const updateSchedule = async (req, res, next) => {
  try {
    const scheduleId = parseInt(req.params.id);

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      throw new NotFoundError('Không tìm thấy lịch trình');
    }

    await Schedule.update(scheduleId, req.body);

    const updatedSchedule = await Schedule.findById(scheduleId);

    sendSuccess(res, updatedSchedule, SUCCESS_MESSAGES.UPDATED);
  } catch (error) {
    next(error);
  }
};

const deleteSchedule = async (req, res, next) => {
  try {
    const scheduleId = parseInt(req.params.id);

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      throw new NotFoundError('Không tìm thấy lịch trình');
    }

    await Schedule.delete(scheduleId);

    sendSuccess(res, null, SUCCESS_MESSAGES.DELETED);
  } catch (error) {
    next(error);
  }
};

const updateScheduleStatus = async (req, res, next) => {
  try {
    const scheduleId = parseInt(req.params.id);
    const { status } = req.body;

    await Schedule.updateStatus(scheduleId, status);

    const io = req.app.get('io');
    const schedule = await Schedule.findById(scheduleId);

    // Emit Socket.IO event for status change
    io.to(`schedule-${scheduleId}`).emit('schedule-status-changed', {
      schedule_id: scheduleId,
      status,
      updated_by: req.user.full_name || 'System',
      timestamp: new Date().toISOString()
    });

    // Send notifications based on status
    if (status === 'in_progress') {
      // Notify parents that bus has started
      const students = await Schedule.getStudents(scheduleId);
      const parentIds = [...new Set(students.map((s) => s.parent_id))];
      
      const { notifyScheduleStatusChange } = require('../services/notificationService');
      await notifyScheduleStatusChange(io, parentIds, {
        schedule_id: scheduleId,
        status,
        route_name: schedule.route_name,
        bus_number: schedule.bus_number
      });
    } else if (status === 'completed') {
      // Notify about completion
      io.to(`schedule-${scheduleId}`).emit('schedule-completed', {
        schedule_id: scheduleId,
        timestamp: new Date().toISOString()
      });
    }

    sendSuccess(res, schedule, 'Cập nhật trạng thái thành công');
  } catch (error) {
    next(error);
  }
};

// =============== STUDENTS ===============

const getScheduleStudents = async (req, res, next) => {
  try {
    const scheduleId = parseInt(req.params.id);

    const students = await Schedule.getStudents(scheduleId);

    sendSuccess(res, students);
  } catch (error) {
    next(error);
  }
};

const addStudentToSchedule = async (req, res, next) => {
  try {
    const scheduleId = parseInt(req.params.id);
    const { student_id, stop_id } = req.body;

    await Schedule.addStudent({
      schedule_id: scheduleId,
      student_id,
      stop_id
    });

    const students = await Schedule.getStudents(scheduleId);

    sendSuccess(res, students, 'Thêm học sinh vào lịch trình thành công');
  } catch (error) {
    next(error);
  }
};

const removeStudentFromSchedule = async (req, res, next) => {
  try {
    const scheduleStudentId = parseInt(req.params.scheduleStudentId);

    await Schedule.removeStudent(scheduleStudentId);

    sendSuccess(res, null, 'Xóa học sinh khỏi lịch trình thành công');
  } catch (error) {
    next(error);
  }
};

// =============== PICKUP/DROPOFF ===============

const updatePickupStatus = async (req, res, next) => {
  try {
    const scheduleStudentId = parseInt(req.params.scheduleStudentId);
    const { status, latitude, longitude } = req.body;

    await Schedule.updatePickupStatus(scheduleStudentId, status, latitude, longitude);

    // Gửi notification cho parent
    // TODO: Implement notification

    // Emit socket event
    const io = req.app.get('io');
    const scheduleId = req.params.scheduleId; // Cần pass qua route
    io.to(`schedule-${scheduleId}`).emit('pickup-status-changed', {
      scheduleStudentId,
      status,
      latitude,
      longitude
    });

    sendSuccess(res, null, 'Cập nhật trạng thái đón thành công');
  } catch (error) {
    next(error);
  }
};

const updateDropoffStatus = async (req, res, next) => {
  try {
    const scheduleStudentId = parseInt(req.params.scheduleStudentId);
    const { status, latitude, longitude } = req.body;

    await Schedule.updateDropoffStatus(scheduleStudentId, status, latitude, longitude);

    // Emit socket event
    const io = req.app.get('io');
    const scheduleId = req.params.scheduleId;
    io.to(`schedule-${scheduleId}`).emit('dropoff-status-changed', {
      scheduleStudentId,
      status,
      latitude,
      longitude
    });

    sendSuccess(res, null, 'Cập nhật trạng thái trả thành công');
  } catch (error) {
    next(error);
  }
};

const getPendingPickups = async (req, res, next) => {
  try {
    const scheduleId = parseInt(req.params.id);

    const students = await Schedule.getPendingPickups(scheduleId);

    sendSuccess(res, students);
  } catch (error) {
    next(error);
  }
};

const getPendingDropoffs = async (req, res, next) => {
  try {
    const scheduleId = parseInt(req.params.id);

    const students = await Schedule.getPendingDropoffs(scheduleId);

    sendSuccess(res, students);
  } catch (error) {
    next(error);
  }
};

const getTodaySchedules = async (req, res, next) => {
  try {
    const { driver_id, status, trip_type } = req.query;

    const schedules = await Schedule.getToday({
      driver_id: driver_id ? parseInt(driver_id) : undefined,
      status,
      trip_type
    });

    sendSuccess(res, schedules, 'Lay lich trinh hom nay thanh cong');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark student as picked up
 * @route   POST /api/schedules/:id/students/:studentId/pickup
 * @access  Private (Driver)
 */
const markStudentPickup = async (req, res, next) => {
  try {
    const scheduleId = parseInt(req.params.id);
    const studentId = parseInt(req.params.studentId);

    const success = await Schedule.markStudentPickup(scheduleId, studentId);

    if (!success) {
      throw new NotFoundError('Không tìm thấy học sinh trong lịch trình');
    }

    // Get student and parent info for notification
    const attendanceData = await Schedule.getAttendanceStatus(scheduleId);
    const studentData = attendanceData.find(s => s.student_id === studentId);

    if (studentData && studentData.parent_user_id) {
      const io = req.app.get('io');
      const pickupTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      
      await notifyStudentPickedUp(
        io,
        studentData.parent_user_id,
        studentData.student_name,
        pickupTime
      );

      // Emit real-time update via Socket.IO
      io.to(`schedule-${scheduleId}`).emit('attendance-update', {
        schedule_id: scheduleId,
        student_id: studentId,
        attendance_type: 'pickup',
        status: 'picked_up',
        timestamp: new Date().toISOString(),
        driver_name: req.user.full_name
      });
    }

    sendSuccess(res, null, 'Đã đánh dấu đón học sinh');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark student as dropped off
 * @route   POST /api/schedules/:id/students/:studentId/dropoff
 * @access  Private (Driver)
 */
const markStudentDropoff = async (req, res, next) => {
  try {
    const scheduleId = parseInt(req.params.id);
    const studentId = parseInt(req.params.studentId);

    const success = await Schedule.markStudentDropoff(scheduleId, studentId);

    if (!success) {
      throw new NotFoundError('Không tìm thấy học sinh trong lịch trình');
    }

    // Get student and parent info for notification
    const attendanceData = await Schedule.getAttendanceStatus(scheduleId);
    const studentData = attendanceData.find(s => s.student_id === studentId);

    if (studentData && studentData.parent_user_id) {
      const io = req.app.get('io');
      const dropoffTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      
      await notifyStudentDroppedOff(
        io,
        studentData.parent_user_id,
        studentData.student_name,
        dropoffTime
      );

      // Emit real-time update via Socket.IO
      io.to(`schedule-${scheduleId}`).emit('attendance-update', {
        schedule_id: scheduleId,
        student_id: studentId,
        attendance_type: 'dropoff',
        status: 'dropped_off',
        timestamp: new Date().toISOString(),
        driver_name: req.user.full_name
      });
    }

    sendSuccess(res, null, 'Đã đánh dấu trả học sinh');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance status for schedule
 * @route   GET /api/schedules/:id/attendance
 * @access  Private
 */
const getAttendanceStatus = async (req, res, next) => {
  try {
    const scheduleId = parseInt(req.params.id);

    const attendance = await Schedule.getAttendanceStatus(scheduleId);

    sendSuccess(res, attendance, 'Lấy trạng thái điểm danh thành công');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance report
 * @route   GET /api/schedules/attendance/report
 * @access  Private (Admin)
 */
const getAttendanceReport = async (req, res, next) => {
  try {
    const { start_date, end_date, student_id, route_id } = req.query;

    if (!start_date || !end_date) {
      return sendSuccess(res, [], 'Vui lòng cung cấp start_date và end_date');
    }

    const report = await Schedule.getAttendanceReport(start_date, end_date, {
      student_id: student_id ? parseInt(student_id) : undefined,
      route_id: route_id ? parseInt(route_id) : undefined
    });

    sendSuccess(res, report, 'Lấy báo cáo điểm danh thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  updateScheduleStatus,
  getScheduleStudents,
  addStudentToSchedule,
  removeStudentFromSchedule,
  updatePickupStatus,
  updateDropoffStatus,
  getPendingPickups,
  getPendingDropoffs,
  getTodaySchedules,
  markStudentPickup,
  markStudentDropoff,
  getAttendanceStatus,
  getAttendanceReport
};
