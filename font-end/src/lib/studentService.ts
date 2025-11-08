import api from './api';
import { Student } from '@/types';

interface StudentResponse {
  success: boolean;
  data: Student[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SingleStudentResponse {
  success: boolean;
  data: Student;
}

interface CreateStudentInput {
  parent_id: number;
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  grade?: string;
  class?: string;
  student_code?: string;
  pickup_address?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  dropoff_address?: string;
  dropoff_latitude?: number;
  dropoff_longitude?: number;
  special_needs?: string;
  photo_url?: string;
}

interface UpdateStudentInput {
  full_name?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  grade?: string;
  class?: string;
  student_code?: string;
  pickup_address?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  dropoff_address?: string;
  dropoff_latitude?: number;
  dropoff_longitude?: number;
  special_needs?: string;
  photo_url?: string;
  is_active?: boolean;
}

export const studentService = {
  // Lấy danh sách học sinh có phân trang
  async getStudents(page = 1, limit = 10): Promise<StudentResponse> {
    const response = await api.get<StudentResponse>('/api/students', {
      params: { page, limit }
    });
    return response.data;
  },

  // Tìm kiếm học sinh
  async searchStudents(search: string, page = 1, limit = 10): Promise<StudentResponse> {
    const response = await api.get<StudentResponse>('/api/students', {
      params: { search, page, limit }
    });
    return response.data;
  },

  // Lấy học sinh theo phụ huynh
  async getStudentsByParent(parentId: number, page = 1, limit = 10): Promise<StudentResponse> {
    const response = await api.get<StudentResponse>(`/api/students/parent/${parentId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Lấy học sinh theo trạng thái
  async getStudentsByStatus(
    isActive: boolean,
    page = 1,
    limit = 10
  ): Promise<StudentResponse> {
    const response = await api.get<StudentResponse>('/api/students', {
      params: { is_active: isActive, page, limit }
    });
    return response.data;
  },

  // Lấy chi tiết 1 học sinh
  async getStudent(studentId: number): Promise<SingleStudentResponse> {
    const response = await api.get<SingleStudentResponse>(`/api/students/${studentId}`);
    return response.data;
  },

  // Tạo học sinh mới
  async createStudent(data: CreateStudentInput): Promise<SingleStudentResponse> {
    const response = await api.post<SingleStudentResponse>('/api/students', data);
    return response.data;
  },

  // Cập nhật học sinh
  async updateStudent(studentId: number, data: UpdateStudentInput): Promise<SingleStudentResponse> {
    const response = await api.put<SingleStudentResponse>(`/api/students/${studentId}`, data);
    return response.data;
  },

  // Xóa học sinh
  async deleteStudent(studentId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/students/${studentId}`);
    return response.data;
  },

  // Toggle trạng thái active
  async toggleStatus(studentId: number, isActive: boolean): Promise<SingleStudentResponse> {
    const response = await api.patch<SingleStudentResponse>(
      `/api/students/${studentId}/status`,
      { is_active: isActive }
    );
    return response.data;
  },

  // Lấy lịch sử đưa đón
  async getPickupHistory(studentId: number, date?: string) {
    const response = await api.get(`/api/students/${studentId}/history`, {
      params: { date }
    });
    return response.data;
  }
};
