import api from './api';
import { User, CreateUserInput, UpdateUserInput, ApiResponse, PaginatedResponse } from '@/types';

/**
 * User Service
 * Service để quản lý users (CRUD operations)
 */
export const userService = {
  /**
   * Lấy danh sách users với pagination
   */
  async getUsers(page: number = 1, limit: number = 10): Promise<PaginatedResponse<User>> {
    const response = await api.get<PaginatedResponse<User>>('/api/users', {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết 1 user
   */
  async getUser(userId: number): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/api/users/${userId}`);
    return response.data.data;
  },

  /**
   * Tạo user mới
   */
  async createUser(data: CreateUserInput): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/api/users', data);
    return response.data.data;
  },

  /**
   * Cập nhật thông tin user
   */
  async updateUser(userId: number, data: UpdateUserInput): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/api/users/${userId}`, data);
    return response.data.data;
  },

  /**
   * Xóa user
   */
  async deleteUser(userId: number): Promise<void> {
    await api.delete(`/api/users/${userId}`);
  },

  /**
   * Toggle trạng thái active/inactive của user
   */
  async toggleUserStatus(userId: number, isActive: boolean): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(`/api/users/${userId}/status`, {
      is_active: isActive
    });
    return response.data.data;
  },

  /**
   * Đổi mật khẩu user
   */
  async changePassword(userId: number, newPassword: string): Promise<void> {
    await api.patch(`/api/users/${userId}/password`, {
      password: newPassword
    });
  },

  /**
   * Tìm kiếm users theo email hoặc tên
   */
  async searchUsers(query: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<User>> {
    const response = await api.get<PaginatedResponse<User>>('/api/users', {
      params: { page, limit, search: query }
    });
    return response.data;
  },

  /**
   * Lọc users theo user_type
   */
  async getUsersByType(userType: 'admin' | 'driver' | 'parent', page: number = 1, limit: number = 10): Promise<PaginatedResponse<User>> {
    const response = await api.get<PaginatedResponse<User>>('/api/users', {
      params: { page, limit, user_type: userType }
    });
    return response.data;
  }
};
