'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { notificationService } from '@/lib/notificationService';
import {
  Bell,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  Check,
  CheckCheck,
  RefreshCw
} from 'lucide-react';

interface Notification {
  notification_id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: 'info' | 'warning' | 'success' | 'error' | 'alert';
  is_read: boolean;
  created_at: string;
}

export default function DriverNotificationsPage() {
  return (
    <ProtectedRoute allowedRoles={['driver']}>
      <NotificationsContent />
    </ProtectedRoute>
  );
}

function NotificationsContent() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [filter, page]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(page, 20);
      const data = response.data;

      let notifs = data.notifications || [];
      if (filter === 'unread') {
        notifs = notifs.filter((n: Notification) => !n.is_read);
      }

      setNotifications(notifs);
      setTotalCount(notifs.length);
      setUnreadCount(data.unread_count || 0);
      setHasMore(notifs.length === 20);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.notification_id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId: number) => {
    if (!confirm('Bạn có chắc muốn xóa thông báo này?')) return;

    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.notification_id !== notificationId));
      setTotalCount(prev => prev - 1);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-green-500" size={24} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={24} />;
      case 'error': return <XCircle className="text-red-500" size={24} />;
      default: return <Info className="text-blue-500" size={24} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' ? true : !n.is_read
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông báo</h1>
          <p className="text-gray-600">
            Tất cả thông báo của bạn
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Bell className="text-orange-600" size={20} />
                <span className="font-semibold text-gray-900">
                  Tổng: {totalCount}
                </span>
              </div>
              
              {unreadCount > 0 && (
                <div className="px-3 py-1 bg-red-100 border border-red-200 rounded-full text-sm font-semibold text-red-700">
                  {unreadCount} chưa đọc
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === 'unread'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Chưa đọc
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium flex items-center gap-2"
                >
                  <CheckCheck size={18} />
                  Đánh dấu tất cả
                </button>
              )}

              <button
                onClick={() => loadNotifications()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Làm mới"
              >
                <RefreshCw size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {loading && notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent mx-auto mb-4" />
                <p className="text-gray-600">Đang tải...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo'}
                </h3>
                <p className="text-gray-600">
                  {filter === 'unread' 
                    ? 'Tất cả thông báo đã được đọc'
                    : 'Thông báo mới sẽ xuất hiện ở đây'
                  }
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.notification_id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.is_read ? 'bg-orange-50/30' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.notification_type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className={`font-semibold text-gray-900 mb-1 ${
                            !notification.is_read ? 'text-orange-900' : ''
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {notification.message}
                          </p>
                        </div>

                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-orange-600 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.created_at)}
                        </span>

                        <div className="flex items-center gap-2">
                          {!notification.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.notification_id)}
                              className="px-3 py-1 text-xs font-medium text-orange-600 hover:bg-orange-100 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Check size={14} />
                              Đánh dấu đã đọc
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(notification.notification_id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {hasMore && filteredNotifications.length >= 20 && (
            <div className="p-4 border-t border-gray-200 text-center">
              <button
                onClick={() => setPage(prev => prev + 1)}
                disabled={loading}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium text-sm"
              >
                {loading ? 'Đang tải...' : 'Tải thêm'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
