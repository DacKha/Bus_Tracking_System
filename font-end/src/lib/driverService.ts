import api from './api';
import { Driver } from '@/types';

interface DriverResponse {
  success: boolean;
  message: string;
  data: Driver[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SingleDriverResponse {
  success: boolean;
  message: string;
  data: Driver;
}

interface CreateDriverInput {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  license_number: string;
  license_expiry: string;
  address?: string;
  emergency_contact?: string;
}

interface UpdateDriverInput {
  full_name?: string;
  phone?: string;
  license_number?: string;
  license_expiry?: string;
  address?: string;
  emergency_contact?: string;
  status?: 'available' | 'on_trip' | 'off_duty';
}

export const driverService = {
  // Lấy danh sách tài xế có phân trang
  async getDrivers(page = 1, limit = 10): Promise<DriverResponse> {
    const response = await api.get<DriverResponse>('/api/drivers', {
      params: { page, limit }
    });
    return response.data;
  },

  // Tìm kiếm tài xế
  async searchDrivers(search: string, page = 1, limit = 10): Promise<DriverResponse> {
    const response = await api.get<DriverResponse>('/api/drivers', {
      params: { search, page, limit }
    });
    return response.data;
  },

  // Lấy tài xế theo status
  async getDriversByStatus(
    status: 'available' | 'on_trip' | 'off_duty',
    page = 1,
    limit = 10
  ): Promise<DriverResponse> {
    const response = await api.get<DriverResponse>('/api/drivers', {
      params: { status, page, limit }
    });
    return response.data;
  },

  // Lấy chi tiết 1 tài xế
  async getDriver(driverId: number): Promise<SingleDriverResponse> {
    const response = await api.get<SingleDriverResponse>(`/api/drivers/${driverId}`);
    return response.data;
  },

  // Tạo tài xế mới
  async createDriver(data: CreateDriverInput): Promise<SingleDriverResponse> {
    const response = await api.post<SingleDriverResponse>('/api/drivers', data);
    return response.data;
  },

  // Cập nhật tài xế
  async updateDriver(driverId: number, data: UpdateDriverInput): Promise<SingleDriverResponse> {
    const response = await api.put<SingleDriverResponse>(`/api/drivers/${driverId}`, data);
    return response.data;
  },

  // Xóa tài xế
  async deleteDriver(driverId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/drivers/${driverId}`);
    return response.data;
  },

  // Cập nhật status tài xế
  async updateStatus(
    driverId: number,
    status: 'available' | 'on_trip' | 'off_duty'
  ): Promise<SingleDriverResponse> {
    const response = await api.patch<SingleDriverResponse>(
      `/api/drivers/${driverId}/status`,
      { status }
    );
    return response.data;
  },

  // Lấy lịch trình của tài xế
  async getDriverSchedules(driverId: number, date?: string) {
    const response = await api.get(`/api/drivers/${driverId}/schedules`, {
      params: { date }
    });
    return response.data;
  }
};
