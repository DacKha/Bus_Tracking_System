'use client';

import { useState, useEffect } from 'react';
import { Schedule } from '@/types';
import { scheduleService } from '@/lib/scheduleService';
import { format } from 'date-fns';
import { Calendar, Clock, Bus, User, MapPin, Users } from 'lucide-react';

interface ScheduleDetailProps {
  schedule: Schedule;
}

interface ScheduleStudent {
  schedule_student_id: number;
  schedule_id: number;
  student_id: number;
  student_name?: string;
  student_code?: string;
  pickup_status: 'pending' | 'picked_up' | 'absent';
  dropoff_status: 'pending' | 'dropped_off' | 'absent';
  pickup_time?: string;
  dropoff_time?: string;
  notes?: string;
}

export default function ScheduleDetail({ schedule }: ScheduleDetailProps) {
  const [students, setStudents] = useState<ScheduleStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Load students when component mounts
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoadingStudents(true);
        const response = await scheduleService.getScheduleStudents(schedule.schedule_id);
        setStudents(response.data);
      } catch (err) {
        console.error('Error loading students:', err);
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, [schedule.schedule_id]);

  // Status badge
  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    const labels = {
      pending: 'Chờ khởi hành',
      in_progress: 'Đang chạy',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  // Pickup/Dropoff status badge
  const getPickupDropoffBadge = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-700',
      picked_up: 'bg-green-100 text-green-700',
      dropped_off: 'bg-blue-100 text-blue-700',
      absent: 'bg-red-100 text-red-700'
    };
    const labels = {
      pending: 'Chờ',
      picked_up: 'Đã đón',
      dropped_off: 'Đã trả',
      absent: 'Vắng'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  // Format date
  const formatDate = (date?: string) => {
    if (!date) return '-';
    try {
      return format(new Date(date), 'dd/MM/yyyy');
    } catch {
      return date;
    }
  };

  // Format time
  const formatTime = (time?: string) => {
    if (!time) return '-';
    return time.substring(0, 5); // HH:mm
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Lịch trình #{schedule.schedule_id}
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {schedule.trip_type === 'pickup' ? 'Đón' : 'Trả'}
          </p>
        </div>
        {getStatusBadge(schedule.status)}
      </div>

      {/* Schedule Info */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">Thông tin lịch trình</h4>
        <div className="space-y-3">
          {/* Date */}
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Ngày</p>
              <p className="font-medium text-gray-900">{formatDate(schedule.schedule_date)}</p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Giờ</p>
              <p className="font-medium text-gray-900">
                {formatTime(schedule.start_time)}
                {schedule.end_time && ` - ${formatTime(schedule.end_time)}`}
              </p>
            </div>
          </div>

          {/* Route */}
          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Tuyến đường</p>
              <p className="font-medium text-gray-900">{schedule.route_name || `#${schedule.route_id}`}</p>
            </div>
          </div>

          {/* Bus */}
          <div className="flex items-center gap-3">
            <Bus size={18} className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Xe buýt</p>
              <p className="font-medium text-gray-900">{schedule.bus_number || `#${schedule.bus_id}`}</p>
            </div>
          </div>

          {/* Driver */}
          <div className="flex items-center gap-3">
            <User size={18} className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Tài xế</p>
              <p className="font-medium text-gray-900">{schedule.driver_name || `#${schedule.driver_id}`}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actual Times (if in_progress or completed) */}
      {(schedule.actual_start_time || schedule.actual_end_time) && (
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-3">Thời gian thực tế</h4>
          <div className="grid grid-cols-2 gap-4">
            {schedule.actual_start_time && (
              <div>
                <p className="text-sm text-gray-600">Bắt đầu</p>
                <p className="font-medium text-gray-900">{formatTime(schedule.actual_start_time)}</p>
              </div>
            )}
            {schedule.actual_end_time && (
              <div>
                <p className="text-sm text-gray-600">Kết thúc</p>
                <p className="font-medium text-gray-900">{formatTime(schedule.actual_end_time)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {schedule.notes && (
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-2">Ghi chú</h4>
          <p className="text-gray-700 text-sm">{schedule.notes}</p>
        </div>
      )}

      {/* Students */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Users size={18} />
          Học sinh ({students.length})
        </h4>
        {loadingStudents ? (
          <div className="text-center py-4 text-gray-500 text-sm">Đang tải...</div>
        ) : students.length > 0 ? (
          <div className="space-y-2">
            {students.map((student) => (
              <div
                key={student.schedule_student_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{student.student_name}</p>
                  {student.student_code && (
                    <p className="text-sm text-gray-600">Mã HS: {student.student_code}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Đón</p>
                    {getPickupDropoffBadge(student.pickup_status)}
                    {student.pickup_time && (
                      <p className="text-xs text-gray-500 mt-1">{formatTime(student.pickup_time)}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Trả</p>
                    {getPickupDropoffBadge(student.dropoff_status)}
                    {student.dropoff_time && (
                      <p className="text-xs text-gray-500 mt-1">{formatTime(student.dropoff_time)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg">
            Chưa có học sinh nào trong lịch trình
          </div>
        )}
      </div>

      {/* Created/Updated */}
      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Ngày tạo</p>
            <p className="font-medium text-gray-900">{formatDate(schedule.created_at)}</p>
          </div>
          <div>
            <p className="text-gray-600">Cập nhật lần cuối</p>
            <p className="font-medium text-gray-900">{formatDate(schedule.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
