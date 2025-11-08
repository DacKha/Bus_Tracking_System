// Cac loai vai tro nguoi dung
const USER_TYPES = {
  ADMIN: 'admin',
  DRIVER: 'driver',
  PARENT: 'parent'
};

// Trang thai tai xe
const DRIVER_STATUS = {
  AVAILABLE: 'available',
  ON_TRIP: 'on_trip',
  OFF_DUTY: 'off_duty'
};

// Trang thai xe bus
const BUS_STATUS = {
  ACTIVE: 'active',
  MAINTENANCE: 'maintenance',
  INACTIVE: 'inactive'
};

// Trang thai lich trinh
const SCHEDULE_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Loai chuyen (dua don hoac tra ve)
const TRIP_TYPES = {
  PICKUP: 'pickup',
  DROPOFF: 'dropoff'
};

// Trang thai don hoc sinh
const PICKUP_STATUS = {
  PENDING: 'pending',
  PICKED_UP: 'picked_up',
  ABSENT: 'absent',
  CANCELLED: 'cancelled'
};

// Trang thai tra hoc sinh
const DROPOFF_STATUS = {
  PENDING: 'pending',
  DROPPED_OFF: 'dropped_off',
  CANCELLED: 'cancelled'
};

// Loai thong bao
const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ALERT: 'alert',
  SUCCESS: 'success'
};

// Loai su co
const INCIDENT_TYPES = {
  ACCIDENT: 'accident',
  BREAKDOWN: 'breakdown',
  DELAY: 'delay',
  EMERGENCY: 'emergency',
  OTHER: 'other'
};

// Muc do nghiem trong cua su co
const INCIDENT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Trang thai su co
const INCIDENT_STATUS = {
  REPORTED: 'reported',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Cac thong bao loi
const ERROR_MESSAGES = {
  // Xac thuc
  INVALID_CREDENTIALS: 'Email hoac mat khau khong dung',
  UNAUTHORIZED: 'Ban can dang nhap de truy cap',
  FORBIDDEN: 'Ban khong co quyen truy cap',
  TOKEN_EXPIRED: 'Phien dang nhap da het han',

  // Nguoi dung
  USER_NOT_FOUND: 'Khong tim thay nguoi dung',
  USER_ALREADY_EXISTS: 'Email da duoc su dung',
  USER_INACTIVE: 'Tai khoan da bi vo hieu hoa',

  // Chung
  INVALID_INPUT: 'Du lieu dau vao khong hop le',
  NOT_FOUND: 'Khong tim thay du lieu',
  SERVER_ERROR: 'Loi server, vui long thu lai sau',
  DATABASE_ERROR: 'Loi co so du lieu'
};

// Cac thong bao thanh cong
const SUCCESS_MESSAGES = {
  CREATED: 'Tao moi thanh cong',
  UPDATED: 'Cap nhat thanh cong',
  DELETED: 'Xoa thanh cong',
  LOGIN_SUCCESS: 'Dang nhap thanh cong',
  LOGOUT_SUCCESS: 'Dang xuat thanh cong'
};

module.exports = {
  USER_TYPES,
  DRIVER_STATUS,
  BUS_STATUS,
  SCHEDULE_STATUS,
  TRIP_TYPES,
  PICKUP_STATUS,
  DROPOFF_STATUS,
  NOTIFICATION_TYPES,
  INCIDENT_TYPES,
  INCIDENT_SEVERITY,
  INCIDENT_STATUS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
