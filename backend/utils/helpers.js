// Gui response thanh cong
const sendSuccess = (res, data, message = 'Thanh cong', statusCode = 200, pagination = null) => {
  const response = {
    success: true,
    message,
    data
  };

  // Them pagination neu co - luon o top level, khong nest trong data
  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

// Gui response loi
const sendError = (res, message, statusCode = 500, code = null) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
    code
  });
};

// Tinh khoang cach giua hai toa do bang cong thuc Haversine
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Ban kinh Trai Dat (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Chuyen do sang radian
const toRad = (value) => {
  return (value * Math.PI) / 180;
};

// Dinh dang ngay thanh YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Dinh dang gio thanh HH:MM:SS
const formatTime = (date) => {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

// Phan trang ket qua
const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { limit: parseInt(limit), offset: parseInt(offset) };
};

// Tao chuoi ngau nhien
const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Ham delay (cho doi)
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
  sendSuccess,
  sendError,
  calculateDistance,
  formatDate,
  formatTime,
  paginate,
  generateRandomString,
  sleep
};
