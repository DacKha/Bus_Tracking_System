'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import BusTrackingMap from '@/components/BusTrackingMap';
import api from '@/lib/api';
import {
  MapPin,
  Navigation,
  AlertCircle,
  RefreshCw,
  Activity,
  Map
} from 'lucide-react';

interface Schedule {
  schedule_id: number;
  route_name: string;
  bus_number: string;
  driver_name: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  start_time: string;
  end_time: string;
}

export default function AdminTrackingPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <TrackingContent />
    </ProtectedRoute>
  );
}

function TrackingContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSchedules, setActiveSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  useEffect(() => {
    loadActiveSchedules();
    const interval = setInterval(loadActiveSchedules, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadActiveSchedules = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/api/schedules/today');
      const schedules = response.data.data || [];
      
      const active = schedules.filter((s: Schedule) => s.status === 'in_progress');
      setActiveSchedules(active);

      if (active.length > 0 && !selectedSchedule) {
        setSelectedSchedule(active[0]);
      }
    } catch (err: any) {
      console.error('Error loading schedules:', err);
      setError('Không thể tải danh sách xe buýt');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-green-100 text-green-700 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_progress': return 'Đang chạy';
      case 'scheduled': return 'Đã lên lịch';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  if (loading && activeSchedules.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error && activeSchedules.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle className="mx-auto text-red-600 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi tải dữ liệu</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadActiveSchedules}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw size={20} />
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeSchedules.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Map className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Không có xe buýt đang hoạt động
            </h2>
            <p className="text-gray-600 mb-6">
              Hiện tại không có chuyến xe nào đang chạy. Vui lòng kiểm tra lại sau.
            </p>
            <button
              onClick={loadActiveSchedules}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw size={20} />
              Làm mới
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Theo dõi xe buýt real-time
            </h1>
            <p className="text-gray-600">
              Giám sát vị trí và trạng thái của tất cả xe buýt đang hoạt động
            </p>
          </div>
          <button
            onClick={loadActiveSchedules}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={18} />
            Làm mới
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="text-green-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">
                  Xe đang hoạt động ({activeSchedules.length})
                </h2>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto">
                {activeSchedules.map((schedule) => (
                  <button
                    key={schedule.schedule_id}
                    onClick={() => setSelectedSchedule(schedule)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      selectedSchedule?.schedule_id === schedule.schedule_id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="text-blue-600 flex-shrink-0" size={18} />
                        <h3 className="font-semibold text-gray-900">
                          {schedule.route_name}
                        </h3>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(schedule.status)}`}>
                        {getStatusText(schedule.status)}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Xe:</span>
                        <span>{schedule.bus_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Tài xế:</span>
                        <span>{schedule.driver_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Giờ:</span>
                        <span>{schedule.start_time} - {schedule.end_time}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-8">
            {selectedSchedule ? (
              <BusTrackingMap
                scheduleId={selectedSchedule.schedule_id}
                routeName={selectedSchedule.route_name}
                busNumber={selectedSchedule.bus_number}
                driverName={selectedSchedule.driver_name}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Map className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Chọn xe buýt để xem vị trí
                </h3>
                <p className="text-gray-600">
                  Nhấn vào một xe buýt bên trái để hiển thị vị trí real-time
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">📊 Thông tin hệ thống:</h4>
          <div className="grid grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <span className="font-medium">Tổng xe đang chạy:</span> {activeSchedules.length}
            </div>
            <div>
              <span className="font-medium">Cập nhật:</span> Real-time
            </div>
            <div>
              <span className="font-medium">Tần suất làm mới:</span> 30 giây
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
