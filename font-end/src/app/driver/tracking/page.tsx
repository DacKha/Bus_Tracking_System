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
  Play,
  Square
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

export default function DriverTrackingPage() {
  return (
    <ProtectedRoute allowedRoles={['driver']}>
      <TrackingContent />
    </ProtectedRoute>
  );
}

function TrackingContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSchedule, setActiveSchedule] = useState<Schedule | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const watchId = useState<number | null>(null)[0];

  useEffect(() => {
    loadActiveSchedule();
  }, []);

  const loadActiveSchedule = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/api/schedules/today');
      const schedules = response.data.data || [];
      
      const active = schedules.find((s: Schedule) => s.status === 'in_progress');
      if (active) {
        setActiveSchedule(active);
      } else {
        setError('Không có lịch trình đang hoạt động');
      }
    } catch (err: any) {
      console.error('Error loading schedule:', err);
      setError('Không thể tải lịch trình');
    } finally {
      setLoading(false);
    }
  };

  const startSharing = () => {
    if (!activeSchedule) return;

    if ('geolocation' in navigator) {
        const id = navigator.geolocation.watchPosition(
        async (position) => {
          try {
            await api.post('/api/tracking/location', {
              schedule_id: activeSchedule.schedule_id,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              speed: position.coords.speed || 0,
              heading: position.coords.heading || 0,
              accuracy: position.coords.accuracy
            });
            setIsSharing(true);
          } catch (error) {
            console.error('Error sending location:', error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Không thể lấy vị trí. Vui lòng bật GPS và cấp quyền truy cập.');
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000
        }
      );
      
      if (id) {
        (watchId as any) = id;
      }
    } else {
      alert('Trình duyệt không hỗ trợ GPS');
    }
  };

  const stopSharing = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setIsSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error && !activeSchedule) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle className="mx-auto text-amber-600 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Không có lịch trình đang hoạt động
            </h2>
            <p className="text-gray-600 mb-6">
              Vui lòng bắt đầu chuyến đi từ trang Lịch trình để kích hoạt tracking.
            </p>
            <button
              onClick={loadActiveSchedule}
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Theo dõi vị trí xe buýt
          </h1>
          <p className="text-gray-600">
            Chia sẻ vị trí real-time với phụ huynh và quản lý
          </p>
        </div>

        {activeSchedule && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <MapPin className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {activeSchedule.route_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Xe: {activeSchedule.bus_number} • {activeSchedule.start_time} - {activeSchedule.end_time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!isSharing ? (
                    <button
                      onClick={startSharing}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                    >
                      <Play size={20} />
                      Bắt đầu chia sẻ vị trí
                    </button>
                  ) : (
                    <button
                      onClick={stopSharing}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
                    >
                      <Square size={20} />
                      Dừng chia sẻ
                    </button>
                  )}
                </div>
              </div>

              {isSharing && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-green-700">
                      Đang chia sẻ vị trí real-time
                    </span>
                  </div>
                </div>
              )}
            </div>

            <BusTrackingMap
              scheduleId={activeSchedule.schedule_id}
              routeName={activeSchedule.route_name}
              busNumber={activeSchedule.bus_number}
              driverName={activeSchedule.driver_name}
            />

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Hướng dẫn:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Nhấn "Bắt đầu chia sẻ vị trí" để gửi vị trí real-time đến phụ huynh</li>
                <li>• Vị trí được cập nhật tự động mỗi 5 giây</li>
                <li>• Đảm bảo GPS và kết nối internet luôn bật</li>
                <li>• Vị trí sẽ hiển thị trên bản đồ của phụ huynh</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
