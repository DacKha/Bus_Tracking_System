'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { driverService } from '@/lib/driverService';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LoadingOverlay } from '@/components/Loading';
import AttendanceTracker from '@/components/AttendanceTracker';
import {
  Calendar,
  Clock,
  Bus,
  MapPin,
  Users,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function DriverAttendancePage() {
  return (
    <ProtectedRoute allowedRoles={['driver']}>
      <DriverAttendanceContent />
    </ProtectedRoute>
  );
}

interface Schedule {
  schedule_id: number;
  route_name: string;
  bus_number: string;
  schedule_type: 'morning' | 'afternoon';
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_students: number;
}

interface Student {
  schedule_student_id: number;
  student_id: number;
  student_name: string;
  class_name: string;
  parent_name: string;
  parent_user_id: number;
  pickup_status: 'pending' | 'picked_up' | 'absent';
  pickup_time: string | null;
  dropoff_status: 'pending' | 'dropped_off' | 'absent';
  dropoff_time: string | null;
}

function DriverAttendanceContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  // Load today's schedules
  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user?.user_id) return;

      // Get driver info
      const driversResponse = await driverService.getDrivers(1, 100);
      const driversData = Array.isArray(driversResponse.data) ? driversResponse.data : [];
      const currentDriver = driversData.find((d: any) => d.user_id === user.user_id);

      if (currentDriver) {
        // Get today's schedules
        const today = new Date().toISOString().split('T')[0];
        const schedulesResponse = await driverService.getDriverSchedules(currentDriver.driver_id, today);
        const schedulesData = Array.isArray(schedulesResponse.data) ? schedulesResponse.data : [];
        setSchedules(schedulesData);

        // Auto-select first in-progress or scheduled schedule
        const activeSchedule = schedulesData.find((s: Schedule) => 
          s.status === 'in_progress' || s.status === 'scheduled'
        );
        if (activeSchedule) {
          await selectSchedule(activeSchedule);
        } else if (schedulesData.length > 0) {
          await selectSchedule(schedulesData[0]);
        }
      }
    } catch (err: any) {
      setError('Không thể tải dữ liệu');
      console.error('Error loading schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  // Select schedule and load students
  const selectSchedule = async (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/schedules/${schedule.schedule_id}/attendance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setStudents(result.data || []);
      }
    } catch (err) {
      console.error('Error loading students:', err);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [user]);

  if (loading) {
    return <LoadingOverlay message="Đang tải..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
          <button
            onClick={loadSchedules}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Điểm danh học sinh</h1>
          <p className="text-gray-600">Đánh dấu đón và trả học sinh cho các chuyến đi</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Schedule List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Lịch trình hôm nay</h2>
                <button
                  onClick={loadSchedules}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Làm mới"
                >
                  <RefreshCw size={18} className="text-gray-600" />
                </button>
              </div>

              {schedules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Không có lịch trình nào hôm nay</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {schedules.map((schedule) => (
                    <button
                      key={schedule.schedule_id}
                      onClick={() => selectSchedule(schedule)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        selectedSchedule?.schedule_id === schedule.schedule_id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {schedule.schedule_type === 'morning' ? '🌅 Sáng' : '🌆 Chiều'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          schedule.status === 'in_progress'
                            ? 'bg-green-100 text-green-700'
                            : schedule.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {schedule.status === 'in_progress' ? 'Đang đi' : schedule.status === 'scheduled' ? 'Đã lên lịch' : 'Hoàn thành'}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Bus size={14} />
                          <span>{schedule.bus_number}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{schedule.start_time} - {schedule.end_time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          <span>{schedule.route_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={14} />
                          <span>{schedule.total_students} học sinh</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Content - Attendance Tracker */}
          <div className="lg:col-span-2">
            {selectedSchedule ? (
              <>
                {/* Schedule Info Card */}
                <div className="mb-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold mb-1">
                        {selectedSchedule.schedule_type === 'morning' ? 'Chuyến sáng' : 'Chuyến chiều'}
                      </h3>
                      <p className="text-blue-100 text-sm">{selectedSchedule.route_name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{selectedSchedule.start_time}</div>
                      <div className="text-blue-100 text-sm">Giờ khởi hành</div>
                    </div>
                  </div>
                </div>

                {/* Attendance Tracker */}
                <AttendanceTracker
                  scheduleId={selectedSchedule.schedule_id}
                  students={students}
                  scheduleType={selectedSchedule.schedule_type}
                  onAttendanceUpdate={() => selectSchedule(selectedSchedule)}
                />
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Chọn lịch trình để điểm danh
                </h3>
                <p className="text-gray-600">
                  Vui lòng chọn một lịch trình từ danh sách bên trái
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
