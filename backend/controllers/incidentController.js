const Incident = require('../models/Incident');
const Notification = require('../models/Notification');
const { sendSuccess } = require('../utils/helpers');
const { NotFoundError } = require('../utils/errors');
const { SUCCESS_MESSAGES, HTTP_STATUS } = require('../utils/constants');
const { notifyAdminsIncident, notifyIncident } = require('../services/notificationService');

const getAllIncidents = async (req, res, next) => {
  try {
    const {
      status,
      severity,
      incident_type,
      schedule_id,
      date,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;

    const incidents = await Incident.findAll({
      status,
      severity,
      incident_type,
      schedule_id: schedule_id ? parseInt(schedule_id) : undefined,
      date,
      limit: parseInt(limit),
      offset
    });

    const total = await Incident.count({ status, severity });

    sendSuccess(res, incidents, 'Lấy danh sách sự cố thành công', 200, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

const getIncidentById = async (req, res, next) => {
  try {
    const incidentId = parseInt(req.params.id);

    const incident = await Incident.findById(incidentId);
    if (!incident) {
      throw new NotFoundError('Không tìm thấy sự cố');
    }

    sendSuccess(res, incident);
  } catch (error) {
    next(error);
  }
};

const reportIncident = async (req, res, next) => {
  try {
    const reportedBy = req.user.userId;
    const {
      schedule_id,
      incident_type,
      title,
      description,
      severity,
      latitude,
      longitude
    } = req.body;

    const incidentId = await Incident.create({
      schedule_id,
      reported_by: reportedBy,
      incident_type,
      title,
      description,
      severity,
      latitude,
      longitude
    });

    // Get Socket.IO instance
    const io = req.app.get('io');

    // Get incident details for notification
    const incident = await Incident.findById(incidentId);

    // Notify admins about new incident
    await notifyAdminsIncident(io, incident);

    // Emit socket event to schedule room
    io.to(`schedule-${schedule_id}`).emit('incident-reported', {
      incident_id: incidentId,
      severity,
      title
    });

    sendSuccess(res, incident, 'Đã báo cáo sự cố', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

const updateIncident = async (req, res, next) => {
  try {
    const incidentId = parseInt(req.params.id);

    const incident = await Incident.findById(incidentId);
    if (!incident) {
      throw new NotFoundError('Không tìm thấy sự cố');
    }

    await Incident.update(incidentId, req.body);

    const updatedIncident = await Incident.findById(incidentId);

    sendSuccess(res, updatedIncident, SUCCESS_MESSAGES.UPDATED);
  } catch (error) {
    next(error);
  }
};

const resolveIncident = async (req, res, next) => {
  try {
    const incidentId = parseInt(req.params.id);
    const resolvedBy = req.user.userId;
    const { resolution_notes } = req.body;

    await Incident.resolve(incidentId, resolvedBy, resolution_notes);

    const incident = await Incident.findById(incidentId);

    sendSuccess(res, incident, 'Đã giải quyết sự cố');
  } catch (error) {
    next(error);
  }
};

const deleteIncident = async (req, res, next) => {
  try {
    const incidentId = parseInt(req.params.id);

    await Incident.delete(incidentId);

    sendSuccess(res, null, SUCCESS_MESSAGES.DELETED);
  } catch (error) {
    next(error);
  }
};

const getUnresolvedIncidents = async (req, res, next) => {
  try {
    const incidents = await Incident.getUnresolved();

    sendSuccess(res, incidents);
  } catch (error) {
    next(error);
  }
};

const getCriticalIncidents = async (req, res, next) => {
  try {
    const incidents = await Incident.getCritical();

    sendSuccess(res, incidents);
  } catch (error) {
    next(error);
  }
};

const getStatistics = async (req, res, next) => {
  try {
    const { date, start_date, end_date } = req.query;

    const stats = await Incident.getStatistics({
      date,
      start_date,
      end_date
    });

    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllIncidents,
  getIncidentById,
  reportIncident,
  updateIncident,
  resolveIncident,
  deleteIncident,
  getUnresolvedIncidents,
  getCriticalIncidents,
  getStatistics
};
