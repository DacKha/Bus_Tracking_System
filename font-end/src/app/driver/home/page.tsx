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
  Bus,
  MapPin,
  User,
  RefreshCw,
  Play,
  Square
} from 'lucide-react';

export default function DriverHomePage() {
  return (
    <ProtectedRoute allowedRoles={['driver']}>
      <DriverHomeContent />
    </ProtectedRoute>
  );
}

interface ScheduleStudent {
  schedule_student_id: number;
  student_id: number;
  student_name: string;
  pickup_status: 'scheduled' | 'picked_up' | 'absent';
  dropoff_status: 'scheduled' | 'dropped_off' | 'absent';
  pickup_time?: string;
  dropoff_time?: string;
}

function DriverHomeContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSchedule, setActiveSchedule] = useState<Schedule | null>(null);
  const [students, setStudents] = useState<ScheduleStudent[]>([]);
  const [driverInfo, setDriverInfo] = useState<any>(null);

  // Load active schedule
  const loadActiveSchedule = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user?.user_id) return;

      // Lấy thông tin driver
  const driversResponse = await driverService.getDrivers(1, 100);
  const driversPayload = driversResponse as any;
  const driversRaw = driversPayload?.data?.data ?? driversPayload?.data ?? driversPayload;
  const driversData = Array.isArray(driversRaw) ? driversRaw : [];
      const currentDriver = driversData.find((d: any) => d.user_id === user.user_id);

      if (currentDriver) {
        setDriverInfo(currentDriver);

        // Lấy lịch trình hôm nay
        const today = new Date().toISOString().split('T')[0];
  const schedulesData = await driverService.getDriverSchedules(currentDriver.driver_id, today);

  // Tìm lịch trình đang in_progress hoặc pending
  const schedulesPayload = schedulesData as any;
  const schedulesRaw = schedulesPayload?.data?.data ?? schedulesPayload?.data ?? schedulesPayload;
  const schedulesArray = Array.isArray(schedulesRaw) ? schedulesRaw : [];
        const active = schedulesArray.find(
          (s: Schedule) => s.status === 'in_progress' || s.status === 'scheduled'
        );

        if (active) {
          setActiveSchedule(active);
          // Load students của schedule này
          const studentsData = await scheduleService.getScheduleStudents(active.schedule_id);
          const studentsPayload = studentsData as any;
          const studentsRaw = studentsPayload?.data?.data ?? studentsPayload?.data ?? studentsPayload;
          setStudents((Array.isArray(studentsRaw) ? studentsRaw : []) as any);
        }
      }
    } catch (err: any) {
      setError('Không thể tải dữ liệu');
      console.error('Error loading active schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveSchedule();
  }, [user]);

  // Handle start schedule
  const handleStartSchedule = async () => {
    if (!activeSchedule) return;
    try {
      await scheduleService.updateStatus(activeSchedule.schedule_id, 'in_progress');
      loadActiveSchedule();
    } catch (err) {
      alert('Không thể bắt đầu chuyến đi');
    }
  };

  // Handle complete schedule
  const handleCompleteSchedule = async () => {
    if (!activeSchedule) return;
    if (!confirm('Bạn có chắc chắn muốn kết thúc chuyến đi?')) return;
    try {
      await scheduleService.updateStatus(activeSchedule.schedule_id, 'completed');
      loadActiveSchedule();
    } catch (err) {
      alert('Không thể kết thúc chuyến đi');
    }
  };

  // Handle pickup status
  const handlePickupStatus = async (scheduleStudentId: number, status: 'picked_up' | 'absent') => {
    if (!activeSchedule) return;
    try {
      await scheduleService.updatePickupStatus(activeSchedule.schedule_id, scheduleStudentId, status);
      loadActiveSchedule();
    } catch (err) {
      alert('Không thể cập nhật trạng thái');
    }
  };

  // Handle dropoff status
  const handleDropoffStatus = async (scheduleStudentId: number, status: 'dropped_off' | 'absent') => {
    if (!activeSchedule) return;
    try {
      await scheduleService.updateDropoffStatus(activeSchedule.schedule_id, scheduleStudentId, status);
      loadActiveSchedule();
    } catch (err) {
      alert('Không thể cập nhật trạng thái');
    }
  };

  if (loading) {
    return <LoadingOverlay message="Đang tải..." />;
  }

  if (!activeSchedule) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Bus className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không có chuyến xe đang hoạt động
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn chưa có lịch trình nào đang diễn ra hoặc sắp bắt đầu hôm nay
          </p>
          <button
            onClick={loadActiveSchedule}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Làm mới
          </button>
        </div>
      </div>
    );
  }

  const pendingPickups = students.filter((s) => s.pickup_status === 'scheduled');
  const pickedUpStudents = students.filter((s) => s.pickup_status === 'picked_up');
  const pendingDropoffs = students.filter(
    (s) => s.pickup_status === 'picked_up' && s.dropoff_status === 'scheduled'
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chuyến đi hiện tại</h1>
              <p className="text-gray-600 mt-1">{activeSchedule.route_name}</p>
            </div>
            <button
              onClick={loadActiveSchedule}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Làm mới
            </button>
          </div>

          {/* Schedule Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Bus size={16} />
                <span className="text-sm">Xe buýt</span>
              </div>
              <p className="font-semibold text-gray-900">{activeSchedule.bus_number}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Clock size={16} />
                <span className="text-sm">Thời gian</span>
              </div>
              <p className="font-semibold text-gray-900">
                {activeSchedule.start_time}
                {activeSchedule.end_time && ` - ${activeSchedule.end_time}`}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Calendar size={16} />
                <span className="text-sm">Loại</span>
              </div>
              <p className="font-semibold text-gray-900">
                {activeSchedule.trip_type === 'pickup' ? 'Đón' : 'Trả'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <User size={16} />
                <span className="text-sm">Học sinh</span>
              </div>
              <p className="font-semibold text-gray-900">{students.length} học sinh</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-3">
            {activeSchedule.status === 'scheduled' && (
              <button
                onClick={handleStartSchedule}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
              >
                <Play size={20} />
                Bắt đầu chuyến đi
              </button>
            )}
            {activeSchedule.status === 'in_progress' && (
              <button
                onClick={handleCompleteSchedule}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
              >
                <Square size={20} />
                Kết thúc chuyến đi
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chờ đón</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {pendingPickups.length}
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
                <p className="text-sm text-gray-600">Đã đón</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {pickedUpStudents.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chờ trả</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {pendingDropoffs.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Danh sách học sinh</h2>
          </div>

          <div className="p-6">
            {students.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Chưa có học sinh nào trong chuyến đi này</p>
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
                  <div
                    key={student.schedule_student_id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{student.student_name}</h3>
                        <div className="mt-2 flex items-center gap-4">
                          {/* Pickup Status */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Đón:</span>
                            {student.pickup_status === 'scheduled' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handlePickupStatus(student.schedule_student_id, 'picked_up')}
                                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                >
                                  Đã đón
                                </button>
                                <button
                                  onClick={() => handlePickupStatus(student.schedule_student_id, 'absent')}
                                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                >
                                  Vắng
                                </button>
                              </div>
                            ) : (
                              <span
                                className={`px-3 py-1 rounded text-sm font-medium ${
                                  student.pickup_status === 'picked_up'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {student.pickup_status === 'picked_up' ? 'Đã đón' : 'Vắng'}
                                {student.pickup_time && ` (${student.pickup_time})`}
                              </span>
                            )}
                          </div>

                          {/* Dropoff Status */}
                          {student.pickup_status === 'picked_up' && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Trả:</span>
                              {student.dropoff_status === 'scheduled' ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      handleDropoffStatus(student.schedule_student_id, 'dropped_off')
                                    }
                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                  >
                                    Đã trả
                                  </button>
                                </div>
                              ) : (
                                <span className="px-3 py-1 rounded text-sm font-medium bg-green-100 text-green-700">
                                  Đã trả
                                  {student.dropoff_time && ` (${student.dropoff_time})`}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
