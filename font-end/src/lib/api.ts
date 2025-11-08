import axios from 'axios';

// Tạo axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - tự động thêm token vào header
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi chung
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Nếu lỗi 401 (Unauthorized), xóa token và redirect về login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect về login (sẽ xử lý trong AuthContext)
  window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
