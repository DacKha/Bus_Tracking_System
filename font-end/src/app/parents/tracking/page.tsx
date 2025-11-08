'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { parentService } from '@/lib/parentService';
import { Student } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LoadingOverlay } from '@/components/Loading';
import BusTrackingMap from '@/components/BusTrackingMap';
import {
  Bus,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Navigation
} from 'lucide-react';

export default function ParentTrackingPage() {
  return (
    <ProtectedRoute allowedRoles={['parent']}>
      <ParentTrackingContent />
    </ProtectedRoute>
  );
}

interface Schedule {
  schedule_id: number;
  route_name: string;
  bus_number: string;
  driver_name: string;
  schedule_type: 'morning' | 'afternoon';
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: string;
  pickup_status?: string;
  dropoff_status?: string;
  pickup_time?: string;
  dropoff_time?: string;
}

function ParentTrackingContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  // Load children and schedules
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user?.user_id) return;

      // Get parent info
      const parentData = await parentService.getParentByUserId(user.user_id);
      const parentInfo = parentData?.data;

      // Get children list
      const childrenResponse = await parentService.getChildren(parentInfo.parent_id);
      const childrenArray = childrenResponse?.data || [];
      setChildren(childrenArray);

      // Auto select first child
      if (childrenArray && childrenArray.length > 0) {
        await selectChild(childrenArray[0]);
      }
    } catch (err: any) {
      setError('Không thể tải dữ liệu');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Select child and load schedules
  const selectChild = async (child: Student) => {
    setSelectedChild(child);
    try {
      const today = new Date().toISOString().split('T')[0];
      const schedulesResponse = await parentService.getStudentSchedules(child.student_id, today);
      const schedulesArray = schedulesResponse?.data || [];
      setTodaySchedules(schedulesArray);

      // Auto select first in-progress or scheduled schedule
      const activeSchedule = schedulesArray.find((s: Schedule) => 
        s.status === 'in_progress' || s.status === 'scheduled'
      );
      if (activeSchedule) {
        setSelectedSchedule(activeSchedule);
      } else if (schedulesArray.length > 0) {
        setSelectedSchedule(schedulesArray[0]);
      }
    } catch (err) {
      console.error('Error loading schedules:', err);
    }
  };

  useEffect(() => {
    loadData();
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
            onClick={loadData}
            className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!children || children.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Bus className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có con em được đăng ký</h2>
          <p className="text-gray-600">Vui lòng liên hệ nhà trường để đăng ký.</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string; icon: React.ReactElement }> = {
      scheduled: {
        label: 'Đã lên lịch',
        color: 'bg-blue-100 text-blue-700',
        icon: <Calendar size={14} />
      },
      in_progress: {
        label: 'Đang di chuyển',
        color: 'bg-green-100 text-green-700',
        icon: <Navigation size={14} />
      },
      completed: {
        label: 'Hoàn thành',
        color: 'bg-gray-100 text-gray-700',
        icon: <CheckCircle size={14} />
      },
      cancelled: {
        label: 'Đã hủy',
        color: 'bg-red-100 text-red-700',
        icon: <AlertCircle size={14} />
      }
    };

    const badge = badges[status] || badges.scheduled;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Theo dõi xe buýt</h1>
          <p className="text-gray-600">Theo dõi vị trí xe buýt của con em trong thời gian thực</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Children & Schedules */}
          <div className="lg:col-span-1 space-y-4">
            {/* Children Selector */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Chọn học sinh</h2>
              <div className="space-y-2">
                {children.map((child) => (
                  <button
                    key={child.student_id}
                    onClick={() => selectChild(child)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedChild?.student_id === child.student_id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{child.full_name}</p>
                        <p className="text-sm text-gray-600">Lớp {child.class_name || 'N/A'}</p>
                      </div>
                      {selectedChild?.student_id === child.student_id && (
                        <CheckCircle className="text-blue-500" size={20} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Today's Schedules */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Lịch trình hôm nay</h2>
              
              {todaySchedules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Không có lịch trình nào hôm nay</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todaySchedules.map((schedule) => (
                    <button
                      key={schedule.schedule_id}
                      onClick={() => setSelectedSchedule(schedule)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        selectedSchedule?.schedule_id === schedule.schedule_id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {schedule.schedule_type === 'morning' ? '🌅 Sáng' : '🌆 Chiều'}
                        </span>
                        {getStatusBadge(schedule.status)}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Bus size={14} />
                          <span>{schedule.bus_number}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{schedule.start_time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          <span>{schedule.route_name}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Content - Map */}
          <div className="lg:col-span-2">
            {selectedSchedule ? (
              <BusTrackingMap
                scheduleId={selectedSchedule.schedule_id}
                routeName={selectedSchedule.route_name}
                busNumber={selectedSchedule.bus_number}
                driverName={selectedSchedule.driver_name}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Navigation className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Chọn lịch trình để theo dõi
                </h3>
                <p className="text-gray-600">
                  Vui lòng chọn một lịch trình từ danh sách bên trái để xem vị trí xe buýt
                </p>
              </div>
            )}

            {/* Pickup/Dropoff Status */}
            {selectedSchedule && (
              <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Trạng thái đón/trả</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Pickup */}
                  <div className={`p-4 rounded-lg border-2 ${
                    selectedSchedule.pickup_status === 'picked_up'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {selectedSchedule.pickup_status === 'picked_up' ? (
                        <CheckCircle className="text-green-600" size={20} />
                      ) : (
                        <Clock className="text-gray-400" size={20} />
                      )}
                      <span className="font-medium text-gray-900">Đón học sinh</span>
                    </div>
                    <p className={`text-sm ${
                      selectedSchedule.pickup_status === 'picked_up'
                        ? 'text-green-700'
                        : 'text-gray-600'
                    }`}>
                      {selectedSchedule.pickup_status === 'picked_up'
                        ? `Đã đón lúc ${selectedSchedule.pickup_time}`
                        : 'Chưa đón'}
                    </p>
                  </div>

                  {/* Dropoff */}
                  <div className={`p-4 rounded-lg border-2 ${
                    selectedSchedule.dropoff_status === 'dropped_off'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {selectedSchedule.dropoff_status === 'dropped_off' ? (
                        <CheckCircle className="text-green-600" size={20} />
                      ) : (
                        <Clock className="text-gray-400" size={20} />
                      )}
                      <span className="font-medium text-gray-900">Trả học sinh</span>
                    </div>
                    <p className={`text-sm ${
                      selectedSchedule.dropoff_status === 'dropped_off'
                        ? 'text-green-700'
                        : 'text-gray-600'
                    }`}>
                      {selectedSchedule.dropoff_status === 'dropped_off'
                        ? `Đã trả lúc ${selectedSchedule.dropoff_time}`
                        : 'Chưa trả'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
