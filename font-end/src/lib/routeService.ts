import api from './api';
import { Route, Stop } from '@/types';

interface RouteResponse {
  success: boolean;
  data: Route[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SingleRouteResponse {
  success: boolean;
  data: Route;
}

interface StopsResponse {
  success: boolean;
  data: Stop[];
}

interface SingleStopResponse {
  success: boolean;
  data: Stop;
}

interface CreateRouteInput {
  route_name: string;
  description?: string;
  distance_km?: number;
  estimated_duration_minutes?: number;
  estimated_duration?: number;  // Alias
  status?: 'active' | 'inactive';
}

interface UpdateRouteInput {
  route_name?: string;
  description?: string;
  distance_km?: number;
  estimated_duration_minutes?: number;
  estimated_duration?: number;  // Alias
  status?: 'active' | 'inactive';
}

interface CreateStopInput {
  stop_name: string;
  stop_address?: string;
  latitude?: number;
  longitude?: number;
  stop_order: number;
  estimated_arrival_time?: string;
}

interface UpdateStopInput {
  stop_name?: string;
  stop_address?: string;
  latitude?: number;
  longitude?: number;
  stop_order?: number;
  estimated_arrival_time?: string;
}

export const routeService = {
  // Lấy danh sách tuyến đường có phân trang
  async getRoutes(page = 1, limit = 10): Promise<RouteResponse> {
    const response = await api.get<RouteResponse>('/api/routes', {
      params: { page, limit }
    });
    return response.data;
  },

  // Tìm kiếm tuyến đường
  async searchRoutes(search: string, page = 1, limit = 10): Promise<RouteResponse> {
    const response = await api.get<RouteResponse>('/api/routes', {
      params: { search, page, limit }
    });
    return response.data;
  },

  // Lấy tuyến đường theo trạng thái
  async getRoutesByStatus(
    status: 'active' | 'inactive',
    page = 1,
    limit = 10
  ): Promise<RouteResponse> {
    const response = await api.get<RouteResponse>('/api/routes', {
      params: { status, page, limit }
    });
    return response.data;
  },

  // Lấy chi tiết 1 tuyến đường
  async getRoute(routeId: number): Promise<SingleRouteResponse> {
    const response = await api.get<SingleRouteResponse>(`/api/routes/${routeId}`);
    return response.data;
  },

  // Tạo tuyến đường mới
  async createRoute(data: CreateRouteInput): Promise<SingleRouteResponse> {
    const response = await api.post<SingleRouteResponse>('/api/routes', data);
    return response.data;
  },

  // Cập nhật tuyến đường
  async updateRoute(routeId: number, data: UpdateRouteInput): Promise<SingleRouteResponse> {
    const response = await api.put<SingleRouteResponse>(`/api/routes/${routeId}`, data);
    return response.data;
  },

  // Xóa tuyến đường
  async deleteRoute(routeId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/routes/${routeId}`);
    return response.data;
  },

  // Lấy danh sách điểm dừng của tuyến đường
  async getRouteStops(routeId: number): Promise<StopsResponse> {
    const response = await api.get<StopsResponse>(`/api/routes/${routeId}/stops`);
    return response.data;
  },

  // Thêm điểm dừng vào tuyến đường
  async addStop(routeId: number, data: CreateStopInput): Promise<SingleStopResponse> {
    const response = await api.post<SingleStopResponse>(`/api/routes/${routeId}/stops`, data);
    return response.data;
  },

  // Cập nhật điểm dừng
  async updateStop(
    routeId: number,
    stopId: number,
    data: UpdateStopInput
  ): Promise<SingleStopResponse> {
    const response = await api.put<SingleStopResponse>(
      `/api/routes/${routeId}/stops/${stopId}`,
      data
    );
    return response.data;
  },

  // Xóa điểm dừng
  async deleteStop(routeId: number, stopId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/routes/${routeId}/stops/${stopId}`);
    return response.data;
  },

  // Lấy lịch trình của tuyến đường
  async getRouteSchedules(routeId: number, date?: string) {
    const response = await api.get(`/api/routes/${routeId}/schedules`, {
      params: { date }
    });
    return response.data;
  }
};
