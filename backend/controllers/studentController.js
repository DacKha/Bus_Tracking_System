const Student = require('../models/Student');
const Parent = require('../models/Parent');
const { sendSuccess } = require('../utils/helpers');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { SUCCESS_MESSAGES, HTTP_STATUS } = require('../utils/constants');

/**
 * @desc    Get all students
 * @route   GET /api/students
 * @access  Private
 */
const getAllStudents = async (req, res, next) => {
  try {
    const { parent_id, grade, class: className, is_active, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const students = await Student.findAll({
      parent_id: parent_id ? parseInt(parent_id) : undefined,
      grade,
      class: className,
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
      search,
      limit: parseInt(limit),
      offset
    });

    const total = await Student.count({ parent_id, grade, class: className, is_active });

    sendSuccess(res, students, 'Lấy danh sách học sinh thành công', 200, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student by ID
 * @route   GET /api/students/:id
 * @access  Private
 */
const getStudentById = async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.id);

    const student = await Student.findById(studentId);
    if (!student) {
      throw new NotFoundError('Không tìm thấy học sinh');
    }

    sendSuccess(res, student);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new student
 * @route   POST /api/students
 * @access  Private (Admin hoặc Parent)
 */
const createStudent = async (req, res, next) => {
  try {
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
    } = req.body;

    // Check parent exists
    const parent = await Parent.findById(parent_id);
    if (!parent) {
      throw new NotFoundError('Không tìm thấy phụ huynh');
    }

    // Check student_code exists
    if (student_code && await Student.codeExists(student_code)) {
      throw new ConflictError('Mã học sinh đã tồn tại');
    }

    const studentId = await Student.create({
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
    });

    const student = await Student.findById(studentId);

    sendSuccess(res, student, SUCCESS_MESSAGES.CREATED, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update student
 * @route   PUT /api/students/:id
 * @access  Private (Admin hoặc Parent của student)
 */
const updateStudent = async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.id);

    const student = await Student.findById(studentId);
    if (!student) {
      throw new NotFoundError('Không tìm thấy học sinh');
    }

    // Check student_code conflict
    if (req.body.student_code && req.body.student_code !== student.student_code) {
      if (await Student.codeExists(req.body.student_code, studentId)) {
        throw new ConflictError('Mã học sinh đã tồn tại');
      }
    }

    await Student.update(studentId, req.body);

    const updatedStudent = await Student.findById(studentId);

    sendSuccess(res, updatedStudent, SUCCESS_MESSAGES.UPDATED);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete student
 * @route   DELETE /api/students/:id
 * @access  Private (Admin)
 */
const deleteStudent = async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.id);

    const student = await Student.findById(studentId);
    if (!student) {
      throw new NotFoundError('Không tìm thấy học sinh');
    }

    // Soft delete
    await Student.softDelete(studentId);

    sendSuccess(res, null, SUCCESS_MESSAGES.DELETED);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get students by parent
 * @route   GET /api/students/parent/:parentId
 * @access  Private
 */
const getStudentsByParent = async (req, res, next) => {
  try {
    const parentId = parseInt(req.params.parentId);

    const students = await Parent.getStudents(parentId);

    sendSuccess(res, students);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get students by route
 * @route   GET /api/students/route/:routeId
 * @access  Private
 */
const getStudentsByRoute = async (req, res, next) => {
  try {
    const routeId = parseInt(req.params.routeId);
    const { schedule_date } = req.query;

    const students = await Student.findByRoute(routeId, schedule_date);

    sendSuccess(res, students);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student schedules
 * @route   GET /api/students/:id/schedules
 * @access  Private
 */
const getStudentSchedules = async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.id);
    const { schedule_date, status } = req.query;

    const schedules = await Student.getSchedules(studentId, {
      schedule_date,
      status
    });

    sendSuccess(res, schedules);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByParent,
  getStudentsByRoute,
  getStudentSchedules
};
