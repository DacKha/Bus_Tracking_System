import api from './api';
import { Bus } from '@/types';

interface BusResponse {
  success: boolean;
  data: Bus[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SingleBusResponse {
  success: boolean;
  data: Bus;
}

interface CreateBusInput {
  bus_number: string;
  license_plate: string;
  capacity: number;
  model?: string;
  year?: number;
  color?: string;
  status?: 'active' | 'maintenance' | 'inactive';
}

interface UpdateBusInput {
  bus_number?: string;
  license_plate?: string;
  capacity?: number;
  model?: string;
  year?: number;
  color?: string;
  status?: 'active' | 'maintenance' | 'inactive';
}

export const busService = {
  // Lấy danh sách xe buýt có phân trang
  async getBuses(page = 1, limit = 10): Promise<BusResponse> {
    const response = await api.get<BusResponse>('/api/buses', {
      params: { page, limit }
    });
    return response.data;
  },

  // Tìm kiếm xe buýt
  async searchBuses(search: string, page = 1, limit = 10): Promise<BusResponse> {
    const response = await api.get<BusResponse>('/api/buses', {
      params: { search, page, limit }
    });
    return response.data;
  },

  // Lấy xe buýt theo trạng thái
  async getBusesByStatus(
    status: 'active' | 'maintenance' | 'inactive',
    page = 1,
    limit = 10
  ): Promise<BusResponse> {
    const response = await api.get<BusResponse>('/api/buses', {
      params: { status, page, limit }
    });
    return response.data;
  },

  // Lấy chi tiết 1 xe buýt
  async getBus(busId: number): Promise<SingleBusResponse> {
    const response = await api.get<SingleBusResponse>(`/api/buses/${busId}`);
    return response.data;
  },

  // Tạo xe buýt mới
  async createBus(data: CreateBusInput): Promise<SingleBusResponse> {
    const response = await api.post<SingleBusResponse>('/api/buses', data);
    return response.data;
  },

  // Cập nhật xe buýt
  async updateBus(busId: number, data: UpdateBusInput): Promise<SingleBusResponse> {
    const response = await api.put<SingleBusResponse>(`/api/buses/${busId}`, data);
    return response.data;
  },

  // Xóa xe buýt
  async deleteBus(busId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/buses/${busId}`);
    return response.data;
  },

  // Cập nhật status xe buýt
  async updateStatus(
    busId: number,
    status: 'active' | 'maintenance' | 'inactive'
  ): Promise<SingleBusResponse> {
    const response = await api.patch<SingleBusResponse>(
      `/api/buses/${busId}/status`,
      { status }
    );
    return response.data;
  },

  // Lấy lịch trình của xe buýt
  async getBusSchedules(busId: number, date?: string) {
    const response = await api.get(`/api/buses/${busId}/schedules`, {
      params: { date }
    });
    return response.data;
  },

  // Lấy xe buýt available (không được assign)
  async getAvailableBuses(date?: string, time?: string): Promise<BusResponse> {
    const response = await api.get<BusResponse>('/api/buses/available', {
      params: { date, time }
    });
    return response.data;
  }
};
