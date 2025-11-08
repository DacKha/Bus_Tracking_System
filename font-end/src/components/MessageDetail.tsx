'use client';

import { Message } from '@/types';
import { format } from 'date-fns';
import { Mail, User, Calendar, Clock } from 'lucide-react';

interface MessageDetailProps {
  message: Message;
  onReply?: () => void;
}

export default function MessageDetail({ message, onReply }: MessageDetailProps) {
  // Format date
  const formatDate = (date?: string) => {
    if (!date) return '-';
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm');
    } catch {
      return date;
    }
  };

  // Get user type badge
  const getUserTypeBadge = (type?: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-700',
      driver: 'bg-blue-100 text-blue-700',
      parent: 'bg-green-100 text-green-700'
    };
    const labels = {
      admin: 'Quản trị',
      driver: 'Tài xế',
      parent: 'Phụ huynh'
    };
    if (!type) return null;
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[type as keyof typeof colors]}`}>
        {labels[type as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">{message.subject}</h3>
          {!message.is_read && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
              Chưa đọc
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">ID: #{message.message_id}</p>
      </div>

      {/* Sender Info */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-3">
          <User size={18} className="text-gray-400" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">Người gửi</p>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">{message.sender_name || 'Không rõ'}</p>
              {getUserTypeBadge(message.sender_type)}
            </div>
            {message.sender_email && (
              <p className="text-sm text-gray-500">{message.sender_email}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Mail size={18} className="text-gray-400" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">Người nhận</p>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">{message.receiver_name || 'Không rõ'}</p>
              {getUserTypeBadge(message.receiver_type)}
            </div>
            {message.receiver_email && (
              <p className="text-sm text-gray-500">{message.receiver_email}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">Thời gian gửi</p>
            <p className="font-medium text-gray-900">{formatDate(message.created_at)}</p>
          </div>
        </div>

        {message.read_at && (
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Thời gian đọc</p>
              <p className="font-medium text-gray-900">{formatDate(message.read_at)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Message Content */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">Nội dung</h4>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-gray-700 whitespace-pre-wrap">{message.message_content}</p>
        </div>
      </div>

      {/* Reply Button */}
      {onReply && (
        <div className="border-t pt-4">
          <button
            onClick={onReply}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Trả lời
          </button>
        </div>
      )}
    </div>
  );
}
