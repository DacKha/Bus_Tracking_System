const express = require('express');
const router = express.Router();
const {
  getAllParents,
  getParentById,
  createParent,
  updateParent,
  deleteParent,
  getMyChildren,
  getParentStudents,
  getTodaySchedulesForChildren,
  getScheduleHistoryForChildren
,
  getParentByUserId
} = require('../controllers/parentController');

const { protect, authorize } = require('../middleware/auth');

// ===========================================
// ROUTES CHO ADMIN QUẢN LÝ PARENTS
// ===========================================

// Lấy tất cả parents (chỉ admin)
router.get('/', protect, authorize('admin'), getAllParents);

// Tạo parent mới (chỉ admin)
router.post('/', protect, authorize('admin'), createParent);

// Lấy thông tin 1 parent
router.get('/:id', protect, getParentById);

// Cập nhật parent (admin hoặc chính parent đó)
router.put('/:id', protect, updateParent);

// Xóa parent (chỉ admin)
router.delete('/:id', protect, authorize('admin'), deleteParent);

// ===========================================
// ROUTES CHO PARENT XEM THÔNG TIN CON
// ===========================================

// Parent xem danh sách con của mình
router.get('/me/children', protect, authorize('parent'), getMyChildren);

// Parent xem lịch trình hôm nay của con
router.get('/me/schedules/today', protect, authorize('parent'), getTodaySchedulesForChildren);

// Parent xem lịch sử lịch trình của con
router.get('/me/schedules/history', protect, authorize('parent'), getScheduleHistoryForChildren);

// ===========================================
// ROUTES CHO ADMIN XEM STUDENTS CỦA PARENT
// ===========================================

// Admin xem danh sách con của 1 parent
router.get('/:id/students', protect, authorize('admin'), getParentStudents);

// Lấy thông tin parent theo user_id
router.get('/user/:userId', protect, getParentByUserId);

module.exports = router;
