/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Schedule } from '@/types';
import { format } from 'date-fns';
import { Clock, MapPin, Bus, User, Calendar } from 'lucide-react';

interface TodaySchedulesProps {
  schedules: Schedule[];
  onViewDetail?: (schedule: Schedule) => void;
}

export default function TodaySchedules({ schedules, onViewDetail }: TodaySchedulesProps) {
  // Format time
  const formatTime = (time?: string) => {
    if (!time) return '-';
    return time.substring(0, 5);
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200'
    };
    const labels = {
      pending: 'Chờ khởi hành',
      in_progress: 'Đang chạy',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${
          colors[status as keyof typeof colors]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (schedules.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Không có lịch trình hôm nay
          </h3>
          <p className="text-sm text-gray-500">
            Chưa có lịch trình nào được lên kế hoạch cho hôm nay
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar size={20} className="text-yellow-600" />
          Lịch trình hôm nay ({schedules.length})
        </h2>
      </div>
      <div className="divide-y divide-gray-200">
        {schedules.map((schedule) => (
          <div
            key={schedule.schedule_id}
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => onViewDetail?.(schedule)}
          >
            <div className="flex items-start justify-between">
              {/* Left side - Schedule info */}
              <div className="flex-1 space-y-2">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-gray-900">
                    #{schedule.schedule_id}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                    {schedule.trip_type === 'pickup' ? 'Đón' : 'Trả'}
                  </span>
                  {getStatusBadge(schedule.status)}
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={14} className="text-gray-400" />
                    <span>{formatTime(schedule.start_time)}</span>
                    {schedule.end_time && (
                      <span className="text-gray-400">
                        → {formatTime(schedule.end_time)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="truncate">
                      {schedule.route_name || `Tuyến #${schedule.route_id}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Bus size={14} className="text-gray-400" />
                    <span>{schedule.bus_number || `Xe #${schedule.bus_id}`}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <User size={14} className="text-gray-400" />
                    <span className="truncate">
                      {schedule.driver_name || `Tài xế #${schedule.driver_id}`}
                    </span>
                  </div>
                </div>

                {/* Notes if any */}
                {schedule.notes && (
                  <p className="text-xs text-gray-500 italic truncate">
                    {schedule.notes}
                  </p>
                )}
              </div>

              {/* Right side - Quick actions or additional info */}
              <div className="ml-4">
                {schedule.status === 'in_progress' && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">Đang chạy</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
