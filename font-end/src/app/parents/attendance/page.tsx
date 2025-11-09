'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LoadingOverlay } from '@/components/Loading';
import api from '@/lib/api';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Bus,
  MapPin,
  RefreshCw
} from 'lucide-react';

interface AttendanceRecord {
  schedule_id: number;
  schedule_date: string;
  start_time: string;
  end_time: string;
  route_name: string;
  bus_number: string;
  driver_name: string;
  student_name: string;
  pickup_status: 'pending' | 'picked_up' | 'absent';
  pickup_time: string | null;
  dropoff_status: 'pending' | 'dropped_off' | 'absent';
  dropoff_time: string | null;
  schedule_type: 'morning' | 'afternoon';
}

export default function ParentAttendancePage() {
  return (
    <ProtectedRoute allowedRoles={['parent']}>
      <AttendanceContent />
    </ProtectedRoute>
  );
}

function AttendanceContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/api/parents/me/schedules/today');
      const data = response.data.data || response.data || [];
      setSchedules(data);
    } catch (err: any) {
      console.error('Error loading attendance:', err);
      setError('Không thể tải dữ liệu điểm danh');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'picked_up':
      case 'dropped_off':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle size={16} />
            {status === 'picked_up' ? 'Đã đón' : 'Đã trả'}
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <XCircle size={16} />
            Vắng
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            <AlertCircle size={16} />
            Chờ
          </span>
        );
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Điểm danh học sinh</h1>
          <p className="text-gray-600">Xem lịch sử điểm danh đón/trả của con</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Calendar className="text-blue-600" size={24} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn ngày
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>

            <button
              onClick={loadAttendance}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              Làm mới
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingOverlay message="Đang tải dữ liệu điểm danh..." />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="mx-auto text-red-600 mb-3" size={48} />
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={loadAttendance}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        ) : schedules.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không có lịch trình
            </h3>
            <p className="text-gray-600">
              Không có dữ liệu điểm danh cho ngày đã chọn.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((record) => (
              <div
                key={`${record.schedule_id}-${record.student_name}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {record.student_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(record.schedule_date)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Bus size={16} />
                        <span>Xe: <strong>{record.bus_number}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} />
                        <span>Tuyến: <strong>{record.route_name}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User size={16} />
                        <span>Tài xế: <strong>{record.driver_name}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} />
                        <span>
                          {formatTime(record.start_time)} - {formatTime(record.end_time)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Trạng thái đón
                      </p>
                      <div className="flex items-center justify-between">
                        {getStatusBadge(record.pickup_status)}
                        {record.pickup_time && (
                          <span className="text-sm text-gray-600">
                            {formatTime(record.pickup_time)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Trạng thái trả
                      </p>
                      <div className="flex items-center justify-between">
                        {getStatusBadge(record.dropoff_status)}
                        {record.dropoff_time && (
                          <span className="text-sm text-gray-600">
                            {formatTime(record.dropoff_time)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {record.pickup_status === 'picked_up' && record.dropoff_status === 'dropped_off' && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 font-medium text-center">
                      ✅ Đã hoàn thành chuyến đi an toàn
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
