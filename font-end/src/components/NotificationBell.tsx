'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/lib/notificationService';
import { Bell, X, Check, CheckCheck, Trash2, Filter } from 'lucide-react';

interface AppNotification {
  notification_id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_read: boolean;
  created_at: string;
}

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { onNewNotification, connected } = useSocket();
  const { user, token } = useAuth();

  // Load notifications
  const loadNotifications = async () => {
    if (!token || !user) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(1, 20);
      const data = response.data;
      
      const mappedNotifications: AppNotification[] = (data.notifications || []).map((n: any) => ({
        notification_id: n.notification_id,
        user_id: n.user_id,
        title: n.title,
        message: n.message,
        type: (n.notification_type || 'info') as 'info' | 'warning' | 'success' | 'error',
        is_read: n.is_read,
        created_at: n.created_at
      }));
      
      setNotifications(mappedNotifications);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      loadNotifications();
    }
  }, [token]);

  // Listen for new notifications via Socket.IO
  useEffect(() => {
    if (!connected) return;

    const cleanup = onNewNotification((data) => {
      // Add new notification to the list
      const newNotification: AppNotification = {
        notification_id: data.notification_id,
        user_id: 0, // Will be set by backend
        title: data.title,
        message: data.message,
        type: data.type as 'info' | 'warning' | 'success' | 'error',
        is_read: false,
        created_at: data.timestamp
      };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show browser notification if permission granted
      if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
        new window.Notification(data.title, {
          body: data.message,
          icon: '/img/bus-icon.png',
          tag: `notification-${data.notification_id}`
        });
      }
    });

    return cleanup;
  }, [connected, onNewNotification]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'default') {
      window.Notification.requestPermission();
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      setNotifications(prev =>
        prev.map(n =>
          n.notification_id === notificationId
            ? { ...n, is_read: true }
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      const notification = notifications.find(n => n.notification_id === notificationId);
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      setNotifications(prev =>
        prev.filter(n => n.notification_id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return time.toLocaleDateString('vi-VN');
  };

  // Get notification icon color
  const getTypeColor = (type: string) => {
    const colors = {
      info: 'text-blue-600 bg-blue-100',
      success: 'text-green-600 bg-green-100',
      warning: 'text-yellow-600 bg-yellow-100',
      error: 'text-red-600 bg-red-100'
    };
    return colors[type as keyof typeof colors] || colors.info;
  };

  // Filter notifications
  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">Thông báo</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              {/* Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    filter === 'unread'
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Chưa đọc ({unreadCount})
                </button>
              </div>

              {/* Mark all as read */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  title="Đánh dấu tất cả đã đọc"
                >
                  <CheckCheck size={16} />
                  Đọc hết
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>Đang tải...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={48} className="mx-auto mb-2 text-gray-300" />
                <p className="font-medium">
                  {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.notification_id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Type Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(notification.type)}`}>
                        <Bell size={20} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-semibold ${
                            !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {!notification.is_read && (
                              <button
                                onClick={() => markAsRead(notification.notification_id)}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                title="Đánh dấu đã đọc"
                              >
                                <Check size={12} />
                                Đã đọc
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.notification_id)}
                              className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                              title="Xóa"
                            >
                              <Trash2 size={12} />
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = '/notifications'; // Navigate to full notifications page if exists
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
