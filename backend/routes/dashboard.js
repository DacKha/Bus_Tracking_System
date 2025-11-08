const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

// Tat ca routes can authentication
router.use(protect);

// GET /api/dashboard/stats - Lay thong ke dashboard
router.get('/stats', authorize('admin'), getDashboardStats);

module.exports = router;
