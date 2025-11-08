'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import ScheduleStatusControl from '@/components/ScheduleStatusControl';
import { Calendar, Clock, MapPin, Users, Bus, AlertCircle } from 'lucide-react';

interface Schedule {
  schedule_id: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  route_name: string;
  route_type: 'pickup' | 'dropoff';
  bus_number: string;
  driver_name: string;
  start_time: string;
  end_time: string;
  date: string;
  total_students: number;
  picked_up_count?: number;
  dropped_off_count?: number;
}

const DriverSchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const { connected, onScheduleStatusUpdate } = useSocket();

  useEffect(() => {
    fetchSchedules();

    // Listen for real-time schedule updates
    const cleanup = onScheduleStatusUpdate((data) => {
      console.log('Schedule status updated:', data);
      fetchSchedules();
    });

    return cleanup;
  }, [onScheduleStatusUpdate]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const today = new Date().toISOString().split('T')[0];

      const response = await fetch(`http://localhost:5000/api/schedules?date=${today}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSchedules(data.data || []);
        
        // Auto-select first schedule if none selected
        if (!selectedSchedule && data.data && data.data.length > 0) {
          setSelectedSchedule(data.data[0]);
        }
      } else {
        setError('Không thể tải lịch trình');
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Có lỗi xảy ra khi tải lịch trình');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    try {
      return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: 'Đã lên lịch', color: 'bg-blue-100 text-blue-700' },
      in_progress: { label: 'Đang di chuyển', color: 'bg-green-100 text-green-700' },
      completed: { label: 'Hoàn thành', color: 'bg-gray-100 text-gray-700' },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getRouteTypeBadge = (type: string) => {
    return type === 'pickup' ? (
      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
        Đón học sinh
      </span>
    ) : (
      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
        Trả học sinh
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý lịch trình</h1>
          <p className="text-gray-600">Cập nhật trạng thái chuyến đi và theo dõi tiến độ</p>
        </div>

        {/* Connection Status */}
        {!connected && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-yellow-600" size={24} />
            <div>
              <p className="font-semibold text-yellow-900">Mất kết nối real-time</p>
              <p className="text-sm text-yellow-700">Cập nhật vẫn được lưu nhưng thông báo có thể bị trễ</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {schedules.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có lịch trình hôm nay</h3>
            <p className="text-gray-600">Bạn chưa có lịch trình nào được phân công cho ngày hôm nay.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Schedule List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="font-semibold text-gray-900">Lịch trình hôm nay</h2>
                  <p className="text-sm text-gray-600">{formatDate(new Date().toISOString())}</p>
                </div>
                <div className="divide-y divide-gray-200 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.schedule_id}
                      onClick={() => setSelectedSchedule(schedule)}
                      className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedSchedule?.schedule_id === schedule.schedule_id
                          ? 'bg-blue-50 border-l-4 border-blue-600'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin size={18} className="text-gray-500" />
                          <span className="font-semibold text-gray-900">{schedule.route_name}</span>
                        </div>
                        {getRouteTypeBadge(schedule.route_type)}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Clock size={16} />
                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Bus size={16} />
                        Xe {schedule.bus_number}
                      </div>

                      {getStatusBadge(schedule.status)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Schedule Details & Control */}
            <div className="lg:col-span-2 space-y-6">
              {selectedSchedule ? (
                <>
                  {/* Schedule Info */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedSchedule.route_name}</h2>
                    
                    <div className="grid grid-cols-2 gap-6 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Loại chuyến</p>
                        <div className="flex items-center gap-2">
                          {getRouteTypeBadge(selectedSchedule.route_type)}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Xe bus</p>
                        <div className="flex items-center gap-2">
                          <Bus size={18} className="text-gray-500" />
                          <span className="font-semibold">{selectedSchedule.bus_number}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-1">Thời gian</p>
                        <div className="flex items-center gap-2">
                          <Clock size={18} className="text-gray-500" />
                          <span className="font-semibold">
                            {formatTime(selectedSchedule.start_time)} - {formatTime(selectedSchedule.end_time)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-1">Số học sinh</p>
                        <div className="flex items-center gap-2">
                          <Users size={18} className="text-gray-500" />
                          <span className="font-semibold">{selectedSchedule.total_students} học sinh</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress for in_progress status */}
                    {selectedSchedule.status === 'in_progress' && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-semibold text-green-900 mb-2">Tiến độ điểm danh:</p>
                        <div className="flex gap-4">
                          {selectedSchedule.route_type === 'pickup' ? (
                            <div className="text-green-700">
                              ✅ Đã đón: {selectedSchedule.picked_up_count || 0}/{selectedSchedule.total_students} học sinh
                            </div>
                          ) : (
                            <div className="text-green-700">
                              ✅ Đã trả: {selectedSchedule.dropped_off_count || 0}/{selectedSchedule.total_students} học sinh
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Control */}
                  <ScheduleStatusControl
                    schedule={selectedSchedule}
                    onStatusUpdate={() => {
                      fetchSchedules();
                    }}
                  />

                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          window.location.href = '/driver/attendance';
                        }}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                      >
                        <Users size={24} className="text-blue-600 mb-2" />
                        <p className="font-semibold text-gray-900">Điểm danh</p>
                        <p className="text-sm text-gray-600">Đánh dấu học sinh</p>
                      </button>

                      <button
                        onClick={() => {
                          window.location.href = '/driver/tracking';
                        }}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                      >
                        <MapPin size={24} className="text-blue-600 mb-2" />
                        <p className="font-semibold text-gray-900">GPS Tracking</p>
                        <p className="text-sm text-gray-600">Chia sẻ vị trí</p>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <p className="text-gray-600">Chọn một lịch trình để xem chi tiết</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverSchedulePage;
