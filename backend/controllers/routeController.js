const Route = require('../models/Route');
const { sendSuccess } = require('../utils/helpers');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { SUCCESS_MESSAGES, HTTP_STATUS } = require('../utils/constants');

const getAllRoutes = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const routes = await Route.findAll({
      status,
      search,
      limit: parseInt(limit),
      offset
    });

    const total = await Route.count({ status });

    sendSuccess(res, routes, 'Lấy danh sách tuyến đường thành công', 200, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

const getRouteById = async (req, res, next) => {
  try {
    const routeId = parseInt(req.params.id);
    const includeStops = req.query.includeStops !== 'false';

    const route = await Route.findById(routeId, includeStops);
    if (!route) {
      throw new NotFoundError('Không tìm thấy tuyến đường');
    }

    sendSuccess(res, route);
  } catch (error) {
    next(error);
  }
};

const createRoute = async (req, res, next) => {
  try {
    const { route_name, route_code, description, estimated_duration, distance_km, status } = req.body;

    // Check route_code exists
    if (await Route.codeExists(route_code)) {
      throw new ConflictError('Mã tuyến đường đã tồn tại');
    }

    const routeId = await Route.create(req.body);
    const route = await Route.findById(routeId);

    sendSuccess(res, route, SUCCESS_MESSAGES.CREATED, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

const updateRoute = async (req, res, next) => {
  try {
    const routeId = parseInt(req.params.id);

    const route = await Route.findById(routeId, false);
    if (!route) {
      throw new NotFoundError('Không tìm thấy tuyến đường');
    }

    // Check route_code conflict
    if (req.body.route_code && req.body.route_code !== route.route_code) {
      if (await Route.codeExists(req.body.route_code, routeId)) {
        throw new ConflictError('Mã tuyến đường đã tồn tại');
      }
    }

    await Route.update(routeId, req.body);
    const updatedRoute = await Route.findById(routeId);

    sendSuccess(res, updatedRoute, SUCCESS_MESSAGES.UPDATED);
  } catch (error) {
    next(error);
  }
};

const deleteRoute = async (req, res, next) => {
  try {
    const routeId = parseInt(req.params.id);

    const route = await Route.findById(routeId, false);
    if (!route) {
      throw new NotFoundError('Không tìm thấy tuyến đường');
    }

    await Route.delete(routeId);

    sendSuccess(res, null, SUCCESS_MESSAGES.DELETED);
  } catch (error) {
    next(error);
  }
};

// =============== STOPS ===============

const getRouteStops = async (req, res, next) => {
  try {
    const routeId = parseInt(req.params.id);

    const stops = await Route.getStops(routeId);

    sendSuccess(res, stops);
  } catch (error) {
    next(error);
  }
};

const addStop = async (req, res, next) => {
  try {
    const routeId = parseInt(req.params.id);

    const stopData = {
      ...req.body,
      route_id: routeId
    };

    const stopId = await Route.addStop(stopData);

    const stops = await Route.getStops(routeId);

    sendSuccess(res, stops, 'Thêm điểm dừng thành công', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

const updateStop = async (req, res, next) => {
  try {
    const stopId = parseInt(req.params.stopId);

    await Route.updateStop(stopId, req.body);

    sendSuccess(res, null, 'Cập nhật điểm dừng thành công');
  } catch (error) {
    next(error);
  }
};

const deleteStop = async (req, res, next) => {
  try {
    const stopId = parseInt(req.params.stopId);

    await Route.deleteStop(stopId);

    sendSuccess(res, null, 'Xóa điểm dừng thành công');
  } catch (error) {
    next(error);
  }
};

const getRouteSchedules = async (req, res, next) => {
  try {
    const routeId = parseInt(req.params.id);
    const { schedule_date, status } = req.query;

    const schedules = await Route.getSchedules(routeId, {
      schedule_date,
      status
    });

    sendSuccess(res, schedules);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  getRouteStops,
  addStop,
  updateStop,
  deleteStop,
  getRouteSchedules
};
