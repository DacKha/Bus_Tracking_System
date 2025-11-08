'use client';

import React, { useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Play, Square, CheckCircle, AlertCircle } from 'lucide-react';

interface Schedule {
  schedule_id: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  route_name: string;
  bus_number: string;
  start_time: string;
  end_time: string;
}

interface ScheduleStatusControlProps {
  schedule: Schedule;
  onStatusUpdate: () => void;
}

const ScheduleStatusControl: React.FC<ScheduleStatusControlProps> = ({
  schedule,
  onStatusUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { sendScheduleStatusUpdate, connected } = useSocket();

  const updateStatus = async (newStatus: string) => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/schedules/${schedule.schedule_id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Emit Socket.IO event
        if (connected) {
          sendScheduleStatusUpdate(schedule.schedule_id, newStatus);
        }

        onStatusUpdate();
      } else {
        const data = await response.json();
        setError(data.message || 'Không thể cập nhật trạng thái');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    switch (schedule.status) {
      case 'scheduled':
        return {
          label: 'Đã lên lịch',
          color: 'bg-blue-100 text-blue-700',
          icon: <AlertCircle size={20} />,
          nextAction: {
            label: 'Bắt đầu chuyến đi',
            status: 'in_progress',
            color: 'bg-green-600 hover:bg-green-700',
            icon: <Play size={20} />
          }
        };
      case 'in_progress':
        return {
          label: 'Đang di chuyển',
          color: 'bg-green-100 text-green-700',
          icon: <Play size={20} />,
          nextAction: {
            label: 'Hoàn thành chuyến đi',
            status: 'completed',
            color: 'bg-blue-600 hover:bg-blue-700',
            icon: <CheckCircle size={20} />
          }
        };
      case 'completed':
        return {
          label: 'Đã hoàn thành',
          color: 'bg-gray-100 text-gray-700',
          icon: <CheckCircle size={20} />,
          nextAction: null
        };
      case 'cancelled':
        return {
          label: 'Đã hủy',
          color: 'bg-red-100 text-red-700',
          icon: <Square size={20} />,
          nextAction: null
        };
      default:
        return {
          label: 'Không xác định',
          color: 'bg-gray-100 text-gray-700',
          icon: <AlertCircle size={20} />,
          nextAction: null
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Current Status */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Trạng thái hiện tại</h3>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-lg font-semibold ${statusInfo.color}`}>
          {statusInfo.icon}
          {statusInfo.label}
        </div>
      </div>

      {/* Action Button */}
      {statusInfo.nextAction && (
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-3">Cập nhật trạng thái</h3>
          <button
            onClick={() => updateStatus(statusInfo.nextAction!.status)}
            disabled={loading}
            className={`w-full text-white rounded-lg py-3 px-4 font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${statusInfo.nextAction.color}`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Đang xử lý...
              </>
            ) : (
              <>
                {statusInfo.nextAction.icon}
                {statusInfo.nextAction.label}
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Lưu ý:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          {schedule.status === 'scheduled' && (
            <>
              <li>• Nhấn "Bắt đầu chuyến đi" khi xe khởi hành</li>
              <li>• Phụ huynh sẽ nhận thông báo real-time</li>
              <li>• GPS tracking sẽ được kích hoạt tự động</li>
            </>
          )}
          {schedule.status === 'in_progress' && (
            <>
              <li>• Đánh dấu điểm danh học sinh đầy đủ</li>
              <li>• Nhấn "Hoàn thành" khi trả xong học sinh cuối</li>
              <li>• Dữ liệu sẽ được lưu vào báo cáo</li>
            </>
          )}
          {schedule.status === 'completed' && (
            <li>• Chuyến đi đã hoàn thành thành công ✅</li>
          )}
        </ul>
      </div>

      {/* Connection Status */}
      {!connected && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
          ⚠️ Mất kết nối real-time. Cập nhật vẫn được lưu nhưng thông báo có thể bị trễ.
        </div>
      )}
    </div>
  );
};

export default ScheduleStatusControl;
