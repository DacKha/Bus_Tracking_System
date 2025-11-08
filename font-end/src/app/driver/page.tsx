/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { driverService } from '@/lib/driverService';
import { scheduleService } from '@/lib/scheduleService';
import { Schedule } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LoadingOverlay } from '@/components/Loading';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Bus,
  Users,
  MapPin,
  RefreshCw
} from 'lucide-react';

export default function DriverDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['driver']}>
      <DriverDashboardContent />
    </ProtectedRoute>
  );
}

function DriverDashboardContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [driverInfo, setDriverInfo] = useState<any>(null);

  // Load dashboard data
  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user?.user_id) return;

      // Lay thong tin driver tu user_id
      const driversResponse = await driverService.getDrivers(1, 100);
      // API tra ve: { success, message, data: [...], pagination: {...} }
      const driversData = Array.isArray(driversResponse.data) 
        ? driversResponse.data 
        : [];
      const currentDriver = driversData.find((d: any) => d.user_id === user.user_id);

      if (currentDriver) {
        setDriverInfo(currentDriver);

        // Lay lich trinh hom nay cua driver
        const today = new Date().toISOString().split('T')[0];
        const schedulesResponse = await driverService.getDriverSchedules(currentDriver.driver_id, today);
        // API tra ve: { success, message, data: [...] }
        const schedulesData = Array.isArray(schedulesResponse.data)
          ? schedulesResponse.data
          : [];
        setTodaySchedules(schedulesData);
      }
    } catch (err: any) {
      setError('Khong the tai du lieu dashboard');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user]);

  if (loading) {
    return <LoadingOverlay message="Đang tải dashboard..." />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600" size={24} />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={loadDashboard}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const pendingSchedules = todaySchedules.filter((s) => s.status === 'scheduled');
  const inProgressSchedules = todaySchedules.filter((s) => s.status === 'in_progress');
  const completedSchedules = todaySchedules.filter((s) => s.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Xin chào, {user?.full_name}!
              </h1>
              <p className="text-gray-600 mt-1">
                Tài xế • Giấy phép: {driverInfo?.license_number || 'N/A'}
              </p>
            </div>
            <button
              onClick={loadDashboard}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={16} />
              Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chờ khởi hành</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {pendingSchedules.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang thực hiện</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {inProgressSchedules.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bus className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã hoàn thành</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {completedSchedules.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Today's Schedules */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Lịch trình hôm nay
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {todaySchedules.length} chuyến xe
                </p>
              </div>
              <Calendar className="text-gray-400" size={24} />
            </div>
          </div>

          <div className="p-6">
            {todaySchedules.length === 0 ? (
              <div className="text-center py-12">
                <Bus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Không có lịch trình hôm nay</p>
                <p className="text-sm text-gray-400 mt-1">
                  Bạn có thể nghỉ ngơi hoặc liên hệ quản lý
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaySchedules.map((schedule) => (
                  <div
                    key={schedule.schedule_id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              schedule.status === 'scheduled'
                                ? 'bg-yellow-100 text-yellow-700'
                                : schedule.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-700'
                                : schedule.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {schedule.status === 'scheduled'
                              ? 'Chờ khởi hành'
                              : schedule.status === 'in_progress'
                              ? 'Đang thực hiện'
                              : schedule.status === 'completed'
                              ? 'Hoàn thành'
                              : 'Đã hủy'}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            {schedule.trip_type === 'pickup' ? 'Đón' : 'Trả'}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin size={16} className="text-gray-400" />
                            <span className="font-medium">{schedule.route_name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Bus size={16} className="text-gray-400" />
                            <span>Xe: {schedule.bus_number || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock size={16} className="text-gray-400" />
                            <span>
                              {schedule.start_time}
                              {schedule.end_time && ` - ${schedule.end_time}`}
                            </span>
                          </div>
                        </div>

                        {schedule.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">{schedule.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="ml-4">
                        {schedule.status === 'scheduled' && (
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
                            Bắt đầu
                          </button>
                        )}
                        {schedule.status === 'in_progress' && (
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors">
                            Chi tiết
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
              <Calendar className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                Xem lịch trình
              </p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
              <Users className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                Danh sách học sinh
              </p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
              <MapPin className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                Tuyến đường
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
