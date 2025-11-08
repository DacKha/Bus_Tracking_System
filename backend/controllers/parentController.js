const Parent = require('../models/Parent');
const Student = require('../models/Student');
const Schedule = require('../models/Schedule');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { sendSuccess } = require('../utils/helpers');

// ===========================================
// LẤY DANH SÁCH PARENTS
// ===========================================

// Lấy tất cả parents (chỉ admin)
const getAllParents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const parents = await Parent.findAll({
      limit: parseInt(limit),
      offset: offset,
      search
    });

    const total = await Parent.count({ search });

    sendSuccess(res, parents, 'Lấy danh sách phụ huynh thành công', 200, {
      page: parseInt(page),
      limit: parseInt(limit),
      total: total,
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

// Lấy thông tin 1 parent theo ID
const getParentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const parent = await Parent.findById(id);

    if (!parent) {
      throw new NotFoundError('Không tìm thấy phụ huynh');
    }

    sendSuccess(res, parent);
  } catch (error) {
    next(error);
  }
};

// ===========================================
// TẠO & CẬP NHẬT PARENT
// ===========================================

// Tạo parent mới (chỉ admin)
const createParent = async (req, res, next) => {
  try {
    const { user_id, phone, address, relationship } = req.body;

    // Kiểm tra user_id có tồn tại không
    const parentExists = await Parent.findByUserId(user_id);
    if (parentExists) {
      throw new ValidationError('User này đã là phụ huynh rồi');
    }

    const parentData = {
      user_id,
      phone: phone || null,
      address: address || null,
      relationship: relationship || null
    };

    const parentId = await Parent.create(parentData);
    const newParent = await Parent.findById(parentId);

    sendSuccess(res, newParent, 'Tạo phụ huynh thành công');
  } catch (error) {
    next(error);
  }
};

// Cập nhật thông tin parent
const updateParent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { phone, address, relationship } = req.body;

    // Kiểm tra parent có tồn tại không
    const parent = await Parent.findById(id);
    if (!parent) {
      throw new NotFoundError('Không tìm thấy phụ huynh');
    }

    // Chỉ cho phép parent tự cập nhật hoặc admin cập nhật
    if (req.user.userType !== 'admin' && parent.user_id !== req.user.userId) {
      throw new ValidationError('Bạn không có quyền cập nhật thông tin này');
    }

    const updateData = {};
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (relationship !== undefined) updateData.relationship = relationship;

    await Parent.update(id, updateData);
    const updatedParent = await Parent.findById(id);

    sendSuccess(res, updatedParent, 'Cập nhật phụ huynh thành công');
  } catch (error) {
    next(error);
  }
};

// Xóa parent (chỉ admin)
const deleteParent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const parent = await Parent.findById(id);
    if (!parent) {
      throw new NotFoundError('Không tìm thấy phụ huynh');
    }

    await Parent.delete(id);

    sendSuccess(res, null, 'Xóa phụ huynh thành công');
  } catch (error) {
    next(error);
  }
};

// ===========================================
// QUẢN LÝ CON CÁI (STUDENTS)
// ===========================================

// Lấy danh sách con của parent
const getMyChildren = async (req, res, next) => {
  try {
    // Lấy parent_id từ user_id
    const parent = await Parent.findByUserId(req.user.userId);

    if (!parent) {
      throw new NotFoundError('Bạn không phải là phụ huynh');
    }

    const students = await Parent.getStudents(parent.parent_id);

    sendSuccess(res, students || []);
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách con của 1 parent (admin xem)
const getParentStudents = async (req, res, next) => {
  try {
    const { id } = req.params;

    const parent = await Parent.findById(id);
    if (!parent) {
      throw new NotFoundError('Không tìm thấy phụ huynh');
    }

    const students = await Parent.getStudents(id);

    sendSuccess(res, students || []);
  } catch (error) {
    next(error);
  }
};

// ===========================================
// XEM LỊCH TRÌNH CỦA CON
// ===========================================

// Lấy lịch trình hôm nay của con
const getTodaySchedulesForChildren = async (req, res, next) => {
  try {
    // Lấy parent_id từ user_id
    const parent = await Parent.findByUserId(req.user.userId);

    if (!parent) {
      throw new NotFoundError('Bạn không phải là phụ huynh');
    }

    // Lấy danh sách con
    const students = await Parent.getStudents(parent.parent_id);

    if (!students || students.length === 0) {
      return sendSuccess(res, []);
    }

    // Lấy lịch trình hôm nay của tất cả các con
    const schedules = [];
    for (const student of students) {
      const studentSchedules = await Schedule.getTodayByStudentId(student.student_id);
      if (studentSchedules && studentSchedules.length > 0) {
        schedules.push(...studentSchedules);
      }
    }

    sendSuccess(res, schedules);
  } catch (error) {
    next(error);
  }
};

// Lấy lịch sử lịch trình của con
const getScheduleHistoryForChildren = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Lấy parent_id từ user_id
    const parent = await Parent.findByUserId(req.user.userId);

    if (!parent) {
      throw new NotFoundError('Bạn không phải là phụ huynh');
    }

    // Lấy danh sách con
    const students = await Parent.getStudents(parent.parent_id);

    if (!students || students.length === 0) {
      return sendSuccess(res, [], 'Không có lịch sử lịch trình', 200, {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        totalPages: 0
      });
    }

    // Lấy lịch sử của tất cả các con (lấy của con đầu tiên làm mẫu)
    // Trong thực tế có thể cải tiến để lấy tất cả các con
    const studentId = students[0].student_id;
    const result = await Schedule.getByStudentId(studentId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    sendSuccess(res, result.schedules || [], 'Lấy lịch sử lịch trình thành công', result.pagination);
  } catch (error) {
    next(error);
  }
};


/**
 * @desc    Get parent by user ID
 * @route   GET /api/parents/user/:userId
 * @access  Private
 */
const getParentByUserId = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);

    const parent = await Parent.findByUserId(userId);
    if (!parent) {
      throw new NotFoundError('Không tìm thấy thông tin phụ huynh');
    }

    // Get parent's students
    const students = await Parent.getStudents(parent.parent_id);
    parent.students = students;

    sendSuccess(res, parent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // CRUD
  getAllParents,
  getParentById,
  createParent,
  updateParent,
  deleteParent,

  // Students
  getMyChildren,
  getParentStudents,

  // Schedules
  getTodaySchedulesForChildren,
  getScheduleHistoryForChildren
,
  getParentByUserId
};
