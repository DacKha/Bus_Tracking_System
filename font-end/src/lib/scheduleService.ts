import api from './api';
import { Schedule } from '@/types';

interface ScheduleResponse {
  success: boolean;
  message: string;
  data: Schedule[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SingleScheduleResponse {
  success: boolean;
  message: string;
  data: Schedule;
}

interface CreateScheduleInput {
  route_id: number;
  bus_id: number;
  driver_id: number;
  trip_type: 'pickup' | 'dropoff';
  schedule_date: string;
  start_time: string;
  end_time?: string;
  notes?: string;
}

interface UpdateScheduleInput {
  route_id?: number;
  bus_id?: number;
  driver_id?: number;
  trip_type?: 'pickup' | 'dropoff';
  schedule_date?: string;
  start_time?: string;
  end_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

interface ScheduleStudent {
  schedule_student_id: number;
  schedule_id: number;
  student_id: number;
  pickup_status: 'pending' | 'picked_up' | 'absent';
  dropoff_status: 'pending' | 'dropped_off' | 'absent';
  pickup_time?: string;
  dropoff_time?: string;
  notes?: string;
  student_name?: string;
  student_code?: string;
}

interface ScheduleStudentsResponse {
  success: boolean;
  message: string;
  data: ScheduleStudent[];
}

export const scheduleService = {
  // Lấy danh sách lịch trình có phân trang
  async getSchedules(page = 1, limit = 10): Promise<ScheduleResponse> {
    const response = await api.get<ScheduleResponse>('/api/schedules', {
      params: { page, limit }
    });
    return response.data;
  },

  // Lấy lịch trình hôm nay
  async getTodaySchedules(): Promise<ScheduleResponse> {
    const response = await api.get<ScheduleResponse>('/api/schedules/today');
    return response.data;
  },

  // Tìm kiếm lịch trình
  async searchSchedules(search: string, page = 1, limit = 10): Promise<ScheduleResponse> {
    const response = await api.get<ScheduleResponse>('/api/schedules', {
      params: { search, page, limit }
    });
    return response.data;
  },

  // Lấy lịch trình theo trạng thái
  async getSchedulesByStatus(
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled',
    page = 1,
    limit = 10
  ): Promise<ScheduleResponse> {
    const response = await api.get<ScheduleResponse>('/api/schedules', {
      params: { status, page, limit }
    });
    return response.data;
  },

  // Lấy lịch trình theo ngày
  async getSchedulesByDate(date: string, page = 1, limit = 10): Promise<ScheduleResponse> {
    const response = await api.get<ScheduleResponse>('/api/schedules', {
      params: { schedule_date: date, page, limit }
    });
    return response.data;
  },

  // Lấy chi tiết 1 lịch trình
  async getSchedule(scheduleId: number): Promise<SingleScheduleResponse> {
    const response = await api.get<SingleScheduleResponse>(`/api/schedules/${scheduleId}`);
    return response.data;
  },

  // Tạo lịch trình mới
  async createSchedule(data: CreateScheduleInput): Promise<SingleScheduleResponse> {
    const response = await api.post<SingleScheduleResponse>('/api/schedules', data);
    return response.data;
  },

  // Cập nhật lịch trình
  async updateSchedule(scheduleId: number, data: UpdateScheduleInput): Promise<SingleScheduleResponse> {
    const response = await api.put<SingleScheduleResponse>(`/api/schedules/${scheduleId}`, data);
    return response.data;
  },

  // Xóa lịch trình
  async deleteSchedule(scheduleId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/schedules/${scheduleId}`);
    return response.data;
  },

  // Cập nhật trạng thái lịch trình
  async updateStatus(
    scheduleId: number,
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  ): Promise<SingleScheduleResponse> {
    const response = await api.put<SingleScheduleResponse>(`/api/schedules/${scheduleId}/status`, {
      status
    });
    return response.data;
  },

  // Lấy danh sách học sinh trong lịch trình
  async getScheduleStudents(scheduleId: number): Promise<ScheduleStudentsResponse> {
    const response = await api.get<ScheduleStudentsResponse>(`/api/schedules/${scheduleId}/students`);
    return response.data;
  },

  // Thêm học sinh vào lịch trình
  async addStudentToSchedule(scheduleId: number, studentId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/api/schedules/${scheduleId}/students`, { student_id: studentId });
    return response.data;
  },

  // Xóa học sinh khỏi lịch trình
  async removeStudentFromSchedule(
    scheduleId: number,
    scheduleStudentId: number
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/schedules/${scheduleId}/students/${scheduleStudentId}`);
    return response.data;
  },

  // Cập nhật trạng thái đón
  async updatePickupStatus(
    scheduleId: number,
    scheduleStudentId: number,
    status: 'pending' | 'picked_up' | 'absent'
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/api/schedules/${scheduleId}/pickup/${scheduleStudentId}`, {
      pickup_status: status
    });
    return response.data;
  },

  // Cập nhật trạng thái trả
  async updateDropoffStatus(
    scheduleId: number,
    scheduleStudentId: number,
    status: 'pending' | 'dropped_off' | 'absent'
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/api/schedules/${scheduleId}/dropoff/${scheduleStudentId}`, {
      dropoff_status: status
    });
    return response.data;
  },

  // Lấy danh sách chưa đón
  async getPendingPickups(scheduleId: number): Promise<ScheduleStudentsResponse> {
    const response = await api.get<ScheduleStudentsResponse>(`/api/schedules/${scheduleId}/pending-pickups`);
    return response.data;
  },

  // Lấy danh sách chưa trả
  async getPendingDropoffs(scheduleId: number): Promise<ScheduleStudentsResponse> {
    const response = await api.get<ScheduleStudentsResponse>(`/api/schedules/${scheduleId}/pending-dropoffs`);
    return response.data;
  }
};
