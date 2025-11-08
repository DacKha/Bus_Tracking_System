import api from './api';

interface TrackingLocation {
  tracking_id: number;
  schedule_id: number;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  recorded_at: string;
}

interface CurrentLocationResponse {
  success: boolean;
  data: TrackingLocation | null;
}

interface TrackingHistoryResponse {
  success: boolean;
  data: TrackingLocation[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SaveLocationInput {
  schedule_id: number;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
}

interface TrackingStatsResponse {
  success: boolean;
  data: {
    total_distance: number;
    average_speed: number;
    max_speed: number;
    total_points: number;
    duration: number;
  };
}

export const trackingService = {
  // Lưu vị trí GPS hiện tại
  async saveLocation(data: SaveLocationInput): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/api/tracking/location', data);
    return response.data;
  },

  // Lấy vị trí hiện tại của xe
  async getCurrentLocation(scheduleId: number): Promise<CurrentLocationResponse> {
    const response = await api.get<CurrentLocationResponse>(`/api/tracking/schedule/${scheduleId}`);
    return response.data;
  },

  // Lấy lịch sử tracking của lịch trình
  async getTrackingHistory(
    scheduleId: number,
    page = 1,
    limit = 100
  ): Promise<TrackingHistoryResponse> {
    const response = await api.get<TrackingHistoryResponse>(
      `/api/tracking/history/${scheduleId}`,
      {
        params: { page, limit }
      }
    );
    return response.data;
  },

  // Lấy các vị trí gần đây
  async getRecentLocations(scheduleId: number, limit = 10): Promise<TrackingHistoryResponse> {
    const response = await api.get<TrackingHistoryResponse>(
      `/api/tracking/recent/${scheduleId}`,
      {
        params: { limit }
      }
    );
    return response.data;
  },

  // Lấy vị trí của nhiều lịch trình cùng lúc
  async getMultipleLocations(scheduleIds: number[]): Promise<{
    success: boolean;
    data: { [scheduleId: number]: TrackingLocation | null };
  }> {
    const response = await api.post('/api/tracking/multiple', { scheduleIds });
    return response.data;
  },

  // Lấy thống kê tracking
  async getTrackingStats(scheduleId: number): Promise<TrackingStatsResponse> {
    const response = await api.get<TrackingStatsResponse>(
      `/api/tracking/stats/${scheduleId}`
    );
    return response.data;
  }
};
