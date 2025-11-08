/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  RefreshCw,
} from 'lucide-react';

interface Notification {
  notification_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute allowedRoles={['parent']}>
      <NotificationsContent />
    </ProtectedRoute>
  );
}

function NotificationsContent() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Load notifications
  const loadNotifications = async () => {
    try {
      setLoading(true);
      setNotifications([]);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleDeleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.notification_id !== id));
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications(
      notifications.map(n =>
        n.notification_id === id ? { ...n, is_read: true } : n
      )
    );
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter(n => !n.is_read)
      : notifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-600" size={24} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-600" size={24} />;
      case 'error':
        return <AlertTriangle className="text-red-600" size={24} />;
      default:
        return <Bell className="text-blue-600" size={24} />;
    }
  };

  const getNotificationBg = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-50';
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'error':
        return 'bg-red-50';
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Thông Báo</h1>
          <p className="text-gray-600 mt-1">
            {filteredNotifications.length} thông báo
          </p>
        </div>
        <button
          onClick={loadNotifications}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          <RefreshCw size={16} />
          Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Chưa đọc ({notifications.filter(n => !n.is_read).length})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Không có thông báo</h2>
          <p className="text-gray-600">Bạn sẽ nhận được thông báo về lịch trình của con</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.notification_id}
              className={`${getNotificationBg(notification.type, notification.is_read)} border-l-4 rounded-lg p-4 flex items-start gap-4 ${
                !notification.is_read ? 'border-l-green-500 shadow-sm' : 'border-l-gray-300'
              }`}
            >
              <div className="flex-shrink-0 pt-1">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {notification.title}
                  </h3>
                  {!notification.is_read && (
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                      Mới
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-700 mb-2">{notification.message}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>
                      {new Date(notification.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.notification_id)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.notification_id)}
                      className="text-red-600 hover:text-red-700 ml-2"
                      title="Xóa"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
