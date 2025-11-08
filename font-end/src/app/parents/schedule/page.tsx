'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Calendar, Clock, MapPin, Users, Bus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import BusTrackingMap from '@/components/BusTrackingMap';

interface Schedule {
  schedule_id: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  route_name: string;
  route_type: 'pickup' | 'dropoff';
  bus_number: string;
  driver_name: string;
  driver_phone: string;
  start_time: string;
  end_time: string;
  date: string;
  total_students: number;
}

interface Student {
  student_id: number;
  student_name: string;
  pickup_status: 'pending' | 'picked_up' | 'absent';
  dropoff_status: 'pending' | 'dropped_off' | 'absent';
  pickup_time?: string;
  dropoff_time?: string;
}

const ParentSchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTracking, setShowTracking] = useState(false);
  const { connected, onScheduleStatusUpdate, onAttendanceUpdate } = useSocket();

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    // Listen for real-time schedule updates
    const scheduleCleanup = onScheduleStatusUpdate((data) => {
      console.log('Schedule status updated:', data);
      fetchSchedules();
      if (selectedSchedule?.schedule_id === data.schedule_id) {
        fetchStudents(data.schedule_id);
      }
    });

    // Listen for real-time attendance updates
    const attendanceCleanup = onAttendanceUpdate((data) => {
      console.log('Attendance updated:', data);
      if (selectedSchedule?.schedule_id === data.schedule_id) {
        fetchStudents(data.schedule_id);
      }
    });

    return () => {
      // Cleanup functions if they exist
      if (typeof scheduleCleanup === 'function') scheduleCleanup();
      if (typeof attendanceCleanup === 'function') attendanceCleanup();
    };
  }, [onScheduleStatusUpdate, onAttendanceUpdate, selectedSchedule]);

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
        
        if (!selectedSchedule && data.data && data.data.length > 0) {
          setSelectedSchedule(data.data[0]);
          fetchStudents(data.data[0].schedule_id);
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

  const fetchStudents = async (scheduleId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/schedules/${scheduleId}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
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

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'scheduled':
        return {
          label: 'Đã lên lịch',
          color: 'bg-blue-100 text-blue-700',
          icon: <Clock size={20} />,
          description: 'Xe chưa khởi hành'
        };
      case 'in_progress':
        return {
          label: 'Đang di chuyển',
          color: 'bg-green-100 text-green-700',
          icon: <Bus size={20} />,
          description: 'Xe đang trên đường'
        };
      case 'completed':
        return {
          label: 'Hoàn thành',
          color: 'bg-gray-100 text-gray-700',
          icon: <CheckCircle size={20} />,
          description: 'Chuyến đi đã hoàn tất'
        };
      case 'cancelled':
        return {
          label: 'Đã hủy',
          color: 'bg-red-100 text-red-700',
          icon: <XCircle size={20} />,
          description: 'Chuyến đi bị hủy'
        };
      default:
        return {
          label: 'Không xác định',
          color: 'bg-gray-100 text-gray-700',
          icon: <AlertCircle size={20} />,
          description: ''
        };
    }
  };

  const getAttendanceStatus = (student: Student, routeType: string) => {
    const status = routeType === 'pickup' ? student.pickup_status : student.dropoff_status;
    const time = routeType === 'pickup' ? student.pickup_time : student.dropoff_time;

    switch (status) {
      case 'picked_up':
      case 'dropped_off':
        return {
          label: routeType === 'pickup' ? 'Đã đón' : 'Đã trả',
          color: 'text-green-700',
          icon: <CheckCircle size={18} />,
          time
        };
      case 'absent':
        return {
          label: 'Vắng mặt',
          color: 'text-red-700',
          icon: <XCircle size={18} />,
          time: null
        };
      default:
        return {
          label: 'Chờ xử lý',
          color: 'text-gray-500',
          icon: <Clock size={18} />,
          time: null
        };
    }
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch trình xe buýt</h1>
          <p className="text-gray-600">Theo dõi lịch trình và trạng thái học sinh của bạn</p>
        </div>

        {!connected && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-yellow-600" size={24} />
            <div>
              <p className="font-semibold text-yellow-900">Mất kết nối real-time</p>
              <p className="text-sm text-yellow-700">Đang cố gắng kết nối lại...</p>
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
            <p className="text-gray-600">Con bạn không có lịch trình xe buýt cho ngày hôm nay.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Schedule List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-6">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="font-semibold text-gray-900">Lịch trình hôm nay</h2>
                  <p className="text-sm text-gray-600">{formatDate(new Date().toISOString())}</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {schedules.map((schedule) => {
                    const statusDisplay = getStatusDisplay(schedule.status);
                    return (
                      <div
                        key={schedule.schedule_id}
                        onClick={() => {
                          setSelectedSchedule(schedule);
                          fetchStudents(schedule.schedule_id);
                        }}
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
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            schedule.route_type === 'pickup' 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {schedule.route_type === 'pickup' ? 'Đón' : 'Trả'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <Clock size={16} />
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </div>

                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusDisplay.color}`}>
                          {statusDisplay.icon}
                          {statusDisplay.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Schedule Details */}
            <div className="lg:col-span-2 space-y-6">
              {selectedSchedule ? (
                <>
                  {/* Status Card */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedSchedule.route_name}</h2>
                        <p className="text-gray-600">{selectedSchedule.route_type === 'pickup' ? 'Đón học sinh' : 'Trả học sinh'}</p>
                      </div>
                      {(() => {
                        const statusDisplay = getStatusDisplay(selectedSchedule.status);
                        return (
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-lg font-semibold ${statusDisplay.color}`}>
                            {statusDisplay.icon}
                            {statusDisplay.label}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Clock size={24} className="text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-600">Thời gian</p>
                          <p className="font-semibold">{formatTime(selectedSchedule.start_time)} - {formatTime(selectedSchedule.end_time)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Bus size={24} className="text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-600">Xe bus</p>
                          <p className="font-semibold">{selectedSchedule.bus_number}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Users size={24} className="text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-600">Tài xế</p>
                          <p className="font-semibold">{selectedSchedule.driver_name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Users size={24} className="text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-600">Số học sinh</p>
                          <p className="font-semibold">{selectedSchedule.total_students} học sinh</p>
                        </div>
                      </div>
                    </div>

                    {/* Tracking Button */}
                    {selectedSchedule.status === 'in_progress' && (
                      <button
                        onClick={() => setShowTracking(!showTracking)}
                        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      >
                        <MapPin size={20} />
                        {showTracking ? 'Ẩn bản đồ' : 'Theo dõi xe bus'}
                      </button>
                    )}
                  </div>

                  {/* Real-time Tracking Map */}
                  {showTracking && selectedSchedule.status === 'in_progress' && (
                    <BusTrackingMap 
                      scheduleId={selectedSchedule.schedule_id}
                      routeName={selectedSchedule.route_name}
                      busNumber={selectedSchedule.bus_number}
                    />
                  )}

                  {/* Student List */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Danh sách học sinh</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {students.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          Không có thông tin học sinh
                        </div>
                      ) : (
                        students.map((student) => {
                          const attendanceStatus = getAttendanceStatus(student, selectedSchedule.route_type);
                          return (
                            <div key={student.student_id} className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Users size={20} className="text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">{student.student_name}</p>
                                    {attendanceStatus.time && (
                                      <p className="text-xs text-gray-500">
                                        {formatTime(attendanceStatus.time)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className={`flex items-center gap-2 font-semibold ${attendanceStatus.color}`}>
                                  {attendanceStatus.icon}
                                  {attendanceStatus.label}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
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

export default ParentSchedulePage;
