/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Message } from '@/types';
import { messageService } from '@/lib/messageService';

interface MessageFormProps {
  message?: Message; // If present, it's a reply
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MessageForm({ message, onSuccess, onCancel }: MessageFormProps) {
  const isReply = !!message;

  // Form state
  const [formData, setFormData] = useState({
    receiver_id: message?.sender_id || 0,
    subject: isReply ? `RE: ${message.subject}` : '',
    message_content: ''
  });

  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [error, setError] = useState('');

  // Load contacts on mount (only for new message, not reply)
  useEffect(() => {
    if (!isReply) {
      const loadContacts = async () => {
        try {
          setLoadingContacts(true);
          const response = await messageService.getContacts();
          setContacts(response.data);
        } catch (err) {
          console.error('Error loading contacts:', err);
          setError('Không thể tải danh sách liên hệ');
        } finally {
          setLoadingContacts(false);
        }
      };
      loadContacts();
    } else {
      setLoadingContacts(false);
    }
  }, [isReply]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!isReply && (!formData.receiver_id || formData.receiver_id === 0)) {
      setError('Vui lòng chọn người nhận');
      return;
    }
    if (!isReply && !formData.subject.trim()) {
      setError('Vui lòng nhập tiêu đề');
      return;
    }
    if (!formData.message_content.trim()) {
      setError('Vui lòng nhập nội dung tin nhắn');
      return;
    }

    setLoading(true);

    try {
      if (isReply && message) {
        // Reply to message
        await messageService.replyMessage(message.message_id, {
          content: formData.message_content
        });
      } else {
        // Send new message
        await messageService.sendMessage({
          receiver_id: Number(formData.receiver_id),
          subject: formData.subject,
          content: formData.message_content
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingContacts) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Receiver (only for new message) */}
      {!isReply && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Người nhận <span className="text-red-500">*</span>
          </label>
          <select
            name="receiver_id"
            value={formData.receiver_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
            required
          >
            <option value={0}>Chọn người nhận</option>
            {contacts.map((contact) => (
              <option key={contact.user_id} value={contact.user_id}>
                {contact.full_name} ({contact.user_type}) - {contact.email}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Subject (only for new message) */}
      {!isReply && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Nhập tiêu đề tin nhắn..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
            required
          />
        </div>
      )}

      {/* Show original message if reply */}
      {isReply && message && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-700 mb-1">Trả lời tin nhắn:</p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Tiêu đề:</strong> {message.subject}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Từ:</strong> {message.sender_name}
          </p>
          <p className="text-sm text-gray-500 italic border-l-2 border-gray-300 pl-2">
            {message.content}
          </p>
        </div>
      )}

      {/* Message Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nội dung <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message_content"
          value={formData.message_content}
          onChange={handleChange}
          placeholder="Nhập nội dung tin nhắn..."
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
          required
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
        >
          {loading ? 'Đang gửi...' : isReply ? 'Gửi trả lời' : 'Gửi tin nhắn'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
