const Bus = require('../models/Bus');
const { sendSuccess } = require('../utils/helpers');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { SUCCESS_MESSAGES, HTTP_STATUS } = require('../utils/constants');

const getAllBuses = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const buses = await Bus.findAll({
      status,
      search,
      limit: parseInt(limit),
      offset
    });

    const total = await Bus.count({ status });

    sendSuccess(res, buses, 'Lay danh sach xe buyt thanh cong', 200, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

const getBusById = async (req, res, next) => {
  try {
    const busId = parseInt(req.params.id);

    const bus = await Bus.findById(busId);
    if (!bus) {
      throw new NotFoundError('Không tìm thấy xe buýt');
    }

    sendSuccess(res, bus);
  } catch (error) {
    next(error);
  }
};

const createBus = async (req, res, next) => {
  try {
    const {
      bus_number,
      license_plate,
      capacity,
      model,
      year,
      status,
      last_maintenance_date,
      next_maintenance_date
    } = req.body;

    // Check conflicts
    if (await Bus.busNumberExists(bus_number)) {
      throw new ConflictError('Số xe đã tồn tại');
    }

    if (await Bus.licensePlateExists(license_plate)) {
      throw new ConflictError('Biển số xe đã tồn tại');
    }

    const busId = await Bus.create(req.body);
    const bus = await Bus.findById(busId);

    sendSuccess(res, bus, SUCCESS_MESSAGES.CREATED, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

const updateBus = async (req, res, next) => {
  try {
    const busId = parseInt(req.params.id);

    const bus = await Bus.findById(busId);
    if (!bus) {
      throw new NotFoundError('Không tìm thấy xe buýt');
    }

    // Check conflicts
    if (req.body.bus_number && req.body.bus_number !== bus.bus_number) {
      if (await Bus.busNumberExists(req.body.bus_number, busId)) {
        throw new ConflictError('Số xe đã tồn tại');
      }
    }

    if (req.body.license_plate && req.body.license_plate !== bus.license_plate) {
      if (await Bus.licensePlateExists(req.body.license_plate, busId)) {
        throw new ConflictError('Biển số xe đã tồn tại');
      }
    }

    await Bus.update(busId, req.body);
    const updatedBus = await Bus.findById(busId);

    sendSuccess(res, updatedBus, SUCCESS_MESSAGES.UPDATED);
  } catch (error) {
    next(error);
  }
};

const deleteBus = async (req, res, next) => {
  try {
    const busId = parseInt(req.params.id);

    const bus = await Bus.findById(busId);
    if (!bus) {
      throw new NotFoundError('Không tìm thấy xe buýt');
    }

    await Bus.delete(busId);

    sendSuccess(res, null, SUCCESS_MESSAGES.DELETED);
  } catch (error) {
    next(error);
  }
};

const getAvailableBuses = async (req, res, next) => {
  try {
    const { date } = req.query;

    const buses = await Bus.getAvailable(date);

    sendSuccess(res, buses);
  } catch (error) {
    next(error);
  }
};

const getBusSchedules = async (req, res, next) => {
  try {
    const busId = parseInt(req.params.id);
    const { schedule_date, status } = req.query;

    const schedules = await Bus.getSchedules(busId, {
      schedule_date,
      status
    });

    sendSuccess(res, schedules);
  } catch (error) {
    next(error);
  }
};

const getBusesNeedMaintenance = async (req, res, next) => {
  try {
    const buses = await Bus.getNeedMaintenance();

    sendSuccess(res, buses);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
  getAvailableBuses,
  getBusSchedules,
  getBusesNeedMaintenance
};
