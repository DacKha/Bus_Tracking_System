/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Message } from '@/types';
import { messageService } from '@/lib/messageService';
import DataTable, { Column } from '@/components/DataTable';
import Modal from '@/components/Modal';
import { LoadingOverlay } from '@/components/Loading';
import ProtectedRoute from '@/components/ProtectedRoute';
import MessageForm from '@/components/MessageForm';
import MessageDetail from '@/components/MessageDetail';
import { Eye, Trash2, Plus, X, Inbox, Send, Mail, MailOpen } from 'lucide-react';
import { format } from 'date-fns';

export default function MessagesPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <MessagesContent />
    </ProtectedRoute>
  );
}

function MessagesContent() {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'inbox' | 'sent'>('inbox');

  // Modals
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const limit = 10;

  // Load messages
  const loadMessages = async () => {
    try {
      setLoading(true);
      setError('');

      const response = viewMode === 'inbox'
        ? await messageService.getInbox(currentPage, limit)
        : await messageService.getSent(currentPage, limit);

      const payload = response as any;
      const listData = payload?.data?.data ?? payload?.data ?? payload;
      setMessages(Array.isArray(listData) ? listData : []);
      const pagination = payload?.data?.pagination ?? payload?.pagination;
      if (pagination) {
        setTotalPages(pagination.totalPages ?? totalPages);
        setTotal(pagination.total ?? total);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể tải danh sách tin nhắn');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load khi component mount hoặc thay đổi page/view
  useEffect(() => {
    loadMessages();
  }, [currentPage, viewMode]);

  // Handle view detail
  const handleViewDetail = async (message: Message) => {
    setSelectedMessage(message);
    setShowDetailModal(true);

    // Mark as read if inbox and unread
    if (viewMode === 'inbox' && !message.is_read) {
      try {
        await messageService.markAsRead(message.message_id);
        loadMessages(); // Reload to update read status
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    }
  };

  // Handle reply
  const handleReply = () => {
    setShowDetailModal(false);
    setShowReplyModal(true);
  };

  // Handle delete
  const handleDelete = (message: Message) => {
    setSelectedMessage(message);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedMessage) return;

    try {
      setActionLoading(true);
      await messageService.deleteMessage(selectedMessage.message_id);
      setShowDeleteModal(false);
      setSelectedMessage(null);
      loadMessages();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể xóa tin nhắn');
      console.error('Error deleting message:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Format date
  const formatDate = (date?: string) => {
    if (!date) return '-';
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm');
    } catch {
      return date;
    }
  };

  // Define columns
  const columns: Column<Message>[] = [
    {
      key: 'message_id',
      label: 'ID',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">#{row.message_id}</span>
          {viewMode === 'inbox' && !row.is_read && (
            <Mail size={14} className="text-yellow-600" />
          )}
        </div>
      )
    },
    {
      key: viewMode === 'inbox' ? 'sender_name' : 'receiver_name',
      label: viewMode === 'inbox' ? 'Người gửi' : 'Người nhận',
      render: (row) => (
        <div>
          <div className="font-medium">
            {viewMode === 'inbox' ? row.sender_name : row.receiver_name}
          </div>
          <div className="text-xs text-gray-500">
            {viewMode === 'inbox' ? row.sender_email : row.receiver_email}
          </div>
        </div>
      )
    },
    {
      key: 'subject',
      label: 'Tiêu đề',
      render: (row) => (
        <div>
          <div className={`${!row.is_read && viewMode === 'inbox' ? 'font-bold' : ''}`}>
            {row.subject}
          </div>
          <div className="text-xs text-gray-500 truncate max-w-xs">
            {row.content}
          </div>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Thời gian',
      render: (row) => (
        <div className="text-sm">
          {formatDate(row.created_at)}
        </div>
      )
    },
    {
      key: 'is_read',
      label: 'Trạng thái',
      render: (row) => {
        if (viewMode === 'sent') {
          return row.is_read ? (
            <span className="flex items-center gap-1 text-green-600 text-sm">
              <MailOpen size={14} />
              Đã đọc
            </span>
          ) : (
            <span className="flex items-center gap-1 text-gray-600 text-sm">
              <Mail size={14} />
              Chưa đọc
            </span>
          );
        }
        return null;
      }
    },
    {
      key: 'actions',
      label: 'Hành động',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetail(row)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Xem chi tiết"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Xóa"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý tin nhắn</h1>
        <p className="text-gray-600 mt-1">Gửi và nhận tin nhắn với tài xế và phụ huynh</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <span className="text-red-700">{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
            <X size={16} />
          </button>
        </div>
      )}

      {/* View Mode Switcher & New Message Button */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setViewMode('inbox');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              viewMode === 'inbox'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Inbox size={20} />
            Hộp thư đến
          </button>
          <button
            onClick={() => {
              setViewMode('sent');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              viewMode === 'sent'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Send size={20} />
            Đã gửi
          </button>
        </div>

        <button
          onClick={() => setShowNewMessageModal(true)}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2"
        >
          <Plus size={20} />
          Soạn tin nhắn
        </button>
      </div>

      {/* Stats */}
      <div className="mb-4 text-sm text-gray-600">
        Tổng số: <span className="font-semibold">{total}</span> tin nhắn
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={messages}
        loading={loading}
        pagination={{
          page: currentPage,
          limit: limit,
          total: total,
          totalPages: totalPages
        }}
        onPageChange={setCurrentPage}
      />

      {/* New Message Modal */}
      <Modal
        isOpen={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
        title="Soạn tin nhắn mới"
        size="md"
      >
        <MessageForm
          onSuccess={() => {
            setShowNewMessageModal(false);
            if (viewMode === 'sent') {
              loadMessages();
            }
          }}
          onCancel={() => setShowNewMessageModal(false)}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Chi tiết tin nhắn"
        size="md"
      >
        {selectedMessage && (
          <MessageDetail
            message={selectedMessage}
            onReply={viewMode === 'inbox' ? handleReply : undefined}
          />
        )}
      </Modal>

      {/* Reply Modal */}
      <Modal
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        title="Trả lời tin nhắn"
        size="md"
      >
        {selectedMessage && (
          <MessageForm
            message={selectedMessage}
            onSuccess={() => {
              setShowReplyModal(false);
              setSelectedMessage(null);
            }}
            onCancel={() => setShowReplyModal(false)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Xác nhận xóa"
        size="sm"
      >
        <div>
          <p className="text-gray-700 mb-4">
            Bạn có chắc chắn muốn xóa tin nhắn <strong>{selectedMessage?.subject}</strong>?
          </p>
          <p className="text-sm text-red-600 mb-6">
            Hành động này không thể hoàn tác!
          </p>
          <div className="flex gap-3">
            <button
              onClick={confirmDelete}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {actionLoading ? 'Đang xóa...' : 'Xóa'}
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Hủy
            </button>
          </div>
        </div>
      </Modal>

      {/* Loading Overlay */}
      {actionLoading && <LoadingOverlay message="Đang xử lý..." />}
    </div>
  );
}
