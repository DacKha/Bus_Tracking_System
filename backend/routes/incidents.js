const express = require('express');
const router = express.Router();
const {
  getAllIncidents,
  getIncidentById,
  reportIncident,
  updateIncident,
  resolveIncident,
  deleteIncident,
  getUnresolvedIncidents,
  getCriticalIncidents,
  getStatistics
} = require('../controllers/incidentController');
const { protect, authorize } = require('../middleware/auth');

// Tất cả routes cần authentication
router.use(protect);

/**
 * @route   GET /api/incidents
 * @desc    Get all incidents
 * @access  Private
 */
router.get('/', getAllIncidents);

/**
 * @route   POST /api/incidents
 * @desc    Report new incident
 * @access  Private
 */
router.post('/', reportIncident);

/**
 * @route   GET /api/incidents/unresolved
 * @desc    Get unresolved incidents
 * @access  Private
 */
router.get('/unresolved', getUnresolvedIncidents);

/**
 * @route   GET /api/incidents/critical
 * @desc    Get critical incidents (high/critical severity)
 * @access  Private
 */
router.get('/critical', getCriticalIncidents);

/**
 * @route   GET /api/incidents/stats
 * @desc    Get incident statistics
 * @access  Private (Admin)
 */
router.get('/stats', authorize('admin'), getStatistics);

/**
 * @route   GET /api/incidents/:id
 * @desc    Get incident by ID
 * @access  Private
 */
router.get('/:id', getIncidentById);

/**
 * @route   PUT /api/incidents/:id
 * @desc    Update incident
 * @access  Private (Admin)
 */
router.put('/:id', authorize('admin'), updateIncident);

/**
 * @route   PUT /api/incidents/:id/resolve
 * @desc    Resolve incident
 * @access  Private (Admin)
 */
router.put('/:id/resolve', authorize('admin'), resolveIncident);

/**
 * @route   DELETE /api/incidents/:id
 * @desc    Delete incident
 * @access  Private (Admin)
 */
router.delete('/:id', authorize('admin'), deleteIncident);

module.exports = router;
