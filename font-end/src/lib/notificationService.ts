import api from './api';

interface Notification {
  notification_id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: 'info' | 'warning' | 'alert' | 'success';
  related_entity_type?: string;
  related_entity_id?: number;
  is_read: boolean;
  created_at: string;
}

interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    unread_count: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SingleNotificationResponse {
  success: boolean;
  data: Notification;
}

interface UnreadCountResponse {
  success: boolean;
  data: {
    unread_count: number;
  };
}

interface CreateNotificationInput {
  user_id: number;
  title: string;
  message: string;
  notification_type?: 'info' | 'warning' | 'alert' | 'success';
  related_entity_type?: string;
  related_entity_id?: number;
}

export const notificationService = {
  // Lấy danh sách thông báo
  async getNotifications(page = 1, limit = 20): Promise<NotificationResponse> {
    const response = await api.get<NotificationResponse>('/api/notifications', {
      params: { page, limit }
    });
    return response.data;
  },

  // Lấy chi tiết 1 thông báo
  async getNotification(notificationId: number): Promise<SingleNotificationResponse> {
    const response = await api.get<SingleNotificationResponse>(
      `/api/notifications/${notificationId}`
    );
    return response.data;
  },

  // Tạo thông báo mới
  async createNotification(data: CreateNotificationInput): Promise<SingleNotificationResponse> {
    const response = await api.post<SingleNotificationResponse>('/api/notifications', data);
    return response.data;
  },

  // Lấy số lượng thông báo chưa đọc
  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await api.get<UnreadCountResponse>('/api/notifications/unread-count');
    return response.data;
  },

  // Đánh dấu thông báo đã đọc
  async markAsRead(notificationId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  // Đánh dấu tất cả thông báo đã đọc
  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    const response = await api.put('/api/notifications/mark-all-read');
    return response.data;
  },

  // Xóa thông báo
  async deleteNotification(notificationId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/notifications/${notificationId}`);
    return response.data;
  }
};
