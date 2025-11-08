import api from './api';
import { Message } from '@/types';

interface MessageResponse {
  success: boolean;
  data: {
    messages: Message[];
    unread_count?: number;
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

interface SingleMessageResponse {
  success: boolean;
  data: Message;
}

interface ContactResponse {
  success: boolean;
  data: {
    user_id: number;
    full_name: string;
    email: string;
    user_type: 'admin' | 'driver' | 'parent';
    avatar_url?: string;
  }[];
}

interface SendMessageInput {
  receiver_id: number;
  subject: string;
  content: string;
}

interface ReplyMessageInput {
  content: string;
}

export const messageService = {
  // Lấy hộp thư đến
  async getInbox(page = 1, limit = 10): Promise<MessageResponse> {
    const response = await api.get<MessageResponse>('/api/messages/inbox', {
      params: { page, limit }
    });
    return response.data;
  },

  // Lấy tin nhắn đã gửi
  async getSent(page = 1, limit = 10): Promise<MessageResponse> {
    const response = await api.get<MessageResponse>('/api/messages/sent', {
      params: { page, limit }
    });
    return response.data;
  },

  // Lấy danh sách liên hệ
  async getContacts(): Promise<ContactResponse> {
    const response = await api.get<ContactResponse>('/api/messages/contacts');
    return response.data;
  },

  // Lấy chi tiết 1 tin nhắn
  async getMessage(messageId: number): Promise<SingleMessageResponse> {
    const response = await api.get<SingleMessageResponse>(`/api/messages/${messageId}`);
    return response.data;
  },

  // Gửi tin nhắn mới
  async sendMessage(data: SendMessageInput): Promise<SingleMessageResponse> {
    const response = await api.post<SingleMessageResponse>('/api/messages', data);
    return response.data;
  },

  // Trả lời tin nhắn
  async replyMessage(
    parentMessageId: number,
    data: ReplyMessageInput
  ): Promise<SingleMessageResponse> {
    const response = await api.post<SingleMessageResponse>(
      `/api/messages/${parentMessageId}/reply`,
      data
    );
    return response.data;
  },

  // Đánh dấu đã đọc
  async markAsRead(messageId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/api/messages/${messageId}/read`);
    return response.data;
  },

  // Xóa tin nhắn
  async deleteMessage(messageId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/messages/${messageId}`);
    return response.data;
  },

  // Lấy cuộc hội thoại với 1 người
  async getConversation(otherUserId: number): Promise<MessageResponse> {
    const response = await api.get<MessageResponse>(
      `/api/messages/conversation/${otherUserId}`
    );
    return response.data;
  }
};
