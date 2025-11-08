import api from './api';

interface Parent {
  parent_id: number;
  user_id: number;
  phone?: string;
  address?: string;
  relationship?: string;
  email?: string;
  full_name?: string;
}

interface ParentResponse {
  success: boolean;
  data: Parent;
}

export const parentService = {
  // Lấy thông tin parent từ user_id
  async getParentByUserId(userId: number): Promise<ParentResponse> {
    const response = await api.get<ParentResponse>(`/api/parents/user/${userId}`);
    return response.data;
  },

  // Lấy danh sách con của parent
  async getChildren(parentId: number) {
    const response = await api.get(`/api/students/parent/${parentId}`);
    return response.data;
  },

  // Lấy lịch trình của học sinh
  async getStudentSchedules(studentId: number, date?: string) {
    const response = await api.get(`/api/students/${studentId}/schedules`, {
      params: { date }
    });
    return response.data;
  }
};
