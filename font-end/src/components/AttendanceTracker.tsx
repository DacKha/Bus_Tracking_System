'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Check, X, Clock, User, MapPin, Phone } from 'lucide-react';

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

interface AttendanceTrackerProps {
  scheduleId: number;
  students: Student[];
  scheduleType: 'morning' | 'afternoon';
  onAttendanceUpdate: () => void;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  scheduleId,
  students: initialStudents,
  scheduleType,
  onAttendanceUpdate
}) => {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [loading, setLoading] = useState<number | null>(null);
  const { sendAttendanceUpdate, onAttendanceUpdate: onSocketUpdate, connected } = useSocket();

  // Update local state when props change
  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  // Listen for real-time attendance updates from other drivers/sources
  useEffect(() => {
    if (!connected) return;

    onSocketUpdate((data) => {
      if (data.schedule_id === scheduleId) {
        setStudents(prev => 
          prev.map(student => 
            student.student_id === data.student_id
              ? {
                  ...student,
                  [`${data.attendance_type}_status`]: data.status,
                  [`${data.attendance_type}_time`]: new Date().toLocaleTimeString('vi-VN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                }
              : student
          )
        );
      }
    });
  }, [connected, scheduleId, onSocketUpdate]);

  const handlePickup = async (student: Student) => {
    try {
      setLoading(student.student_id);

      const response = await fetch(`/api/schedules/${scheduleId}/students/${student.student_id}/pickup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Update local state
        const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        setStudents(prev =>
          prev.map(s =>
            s.student_id === student.student_id
              ? { ...s, pickup_status: 'picked_up', pickup_time: now }
              : s
          )
        );

        // Emit Socket.IO event
        sendAttendanceUpdate({
          schedule_id: scheduleId,
          student_id: student.student_id,
          attendance_type: 'pickup',
          status: 'picked_up'
        });

        onAttendanceUpdate();
      }
    } catch (error) {
      console.error('Error marking pickup:', error);
      alert('Không thể đánh dấu đón học sinh');
    } finally {
      setLoading(null);
    }
  };

  const handleDropoff = async (student: Student) => {
    try {
      setLoading(student.student_id);

      const response = await fetch(`/api/schedules/${scheduleId}/students/${student.student_id}/dropoff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Update local state
        const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        setStudents(prev =>
          prev.map(s =>
            s.student_id === student.student_id
              ? { ...s, dropoff_status: 'dropped_off', dropoff_time: now }
              : s
          )
        );

        // Emit Socket.IO event
        sendAttendanceUpdate({
          schedule_id: scheduleId,
          student_id: student.student_id,
          attendance_type: 'dropoff',
          status: 'dropped_off'
        });

        onAttendanceUpdate();
      }
    } catch (error) {
      console.error('Error marking dropoff:', error);
      alert('Không thể đánh dấu trả học sinh');
    } finally {
      setLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'picked_up':
      case 'dropped_off':
        return 'text-green-600 bg-green-50';
      case 'absent':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'picked_up':
      case 'dropped_off':
        return <Check size={16} />;
      case 'absent':
        return <X size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'picked_up':
        return 'Đã đón';
      case 'dropped_off':
        return 'Đã trả';
      case 'absent':
        return 'Vắng';
      default:
        return 'Chờ';
    }
  };

  const completedCount = students.filter(s => 
    scheduleType === 'morning' ? s.dropoff_status === 'dropped_off' : s.pickup_status === 'picked_up'
  ).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Điểm danh học sinh</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hoàn thành:</span>
            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">
              {completedCount}/{students.length}
            </span>
          </div>
        </div>
        {!connected && (
          <div className="mt-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-1 rounded">
            ⚠️ Chế độ offline - Cập nhật real-time không khả dụng
          </div>
        )}
      </div>

      {/* Student List */}
      <div className="divide-y divide-gray-100">
        {students.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <User size={48} className="mx-auto mb-2 text-gray-300" />
            <p>Chưa có học sinh nào trong lịch trình này</p>
          </div>
        ) : (
          students.map((student) => (
            <div key={student.student_id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                {/* Student Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{student.student_name}</h4>
                      <p className="text-sm text-gray-600">{student.class_name}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1 ml-13">
                    <Phone size={12} />
                    Phụ huynh: {student.parent_name}
                  </p>
                </div>

                {/* Attendance Actions */}
                <div className="flex gap-2">
                  {/* Pickup Status */}
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Đón</p>
                    {student.pickup_status === 'pending' ? (
                      <button
                        onClick={() => handlePickup(student)}
                        disabled={loading === student.student_id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                        {loading === student.student_id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <Check size={16} />
                            Đánh dấu
                          </>
                        )}
                      </button>
                    ) : (
                      <div className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium ${getStatusColor(student.pickup_status)}`}>
                        {getStatusIcon(student.pickup_status)}
                        <div>
                          <div>{getStatusText(student.pickup_status)}</div>
                          {student.pickup_time && (
                            <div className="text-xs opacity-75">{student.pickup_time}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dropoff Status */}
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Trả</p>
                    {student.dropoff_status === 'pending' ? (
                      <button
                        onClick={() => handleDropoff(student)}
                        disabled={loading === student.student_id || student.pickup_status !== 'picked_up'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
                        title={student.pickup_status !== 'picked_up' ? 'Cần đón học sinh trước' : ''}
                      >
                        {loading === student.student_id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <Check size={16} />
                            Đánh dấu
                          </>
                        )}
                      </button>
                    ) : (
                      <div className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium ${getStatusColor(student.dropoff_status)}`}>
                        {getStatusIcon(student.dropoff_status)}
                        <div>
                          <div>{getStatusText(student.dropoff_status)}</div>
                          {student.dropoff_time && (
                            <div className="text-xs opacity-75">{student.dropoff_time}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AttendanceTracker;
