'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { MapPin, Navigation, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface BusLocation {
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  timestamp: string;
  driver_name?: string;
}

interface BusTrackingMapProps {
  scheduleId: number;
  routeName: string;
  busNumber: string;
  driverName?: string;
}

const BusTrackingMap: React.FC<BusTrackingMapProps> = ({
  scheduleId,
  routeName,
  busNumber,
  driverName
}) => {
  const { joinSchedule, leaveSchedule, onLocationUpdate, connected } = useSocket();
  const [location, setLocation] = useState<BusLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!connected || !scheduleId) return;

    // Join schedule room to receive updates
    joinSchedule(scheduleId);

    // Listen for location updates
    onLocationUpdate((data) => {
      if (data.schedule_id === scheduleId) {
        setLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          speed: data.speed,
          heading: data.heading,
          accuracy: data.accuracy,
          timestamp: data.timestamp,
          driver_name: data.driver_name
        });
        setLoading(false);
      }
    });

    // Timeout if no location received after 30 seconds
    const timeout = setTimeout(() => {
      if (!location) {
        setError('Không nhận được vị trí xe buýt. Có thể xe chưa khởi hành.');
        setLoading(false);
      }
    }, 30000);

    return () => {
      leaveSchedule(scheduleId);
      clearTimeout(timeout);
    };
  }, [scheduleId, connected, joinSchedule, leaveSchedule, onLocationUpdate, location]);

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Format coordinates
  const formatCoords = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  if (!connected) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center gap-3 text-yellow-600">
          <Loader2 className="animate-spin" size={24} />
          <span>Đang kết nối real-time tracking...</span>
        </div>
      </div>
    );
  }

  if (loading && !error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center gap-3 text-blue-600">
          <Loader2 className="animate-spin" size={24} />
          <span>Đang tìm vị trí xe buýt...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 text-amber-600">
          <AlertCircle size={24} />
          <div>
            <p className="font-medium">{error}</p>
            <p className="text-sm text-gray-600 mt-1">
              Vị trí sẽ được cập nhật khi xe buýt bắt đầu di chuyển.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{routeName}</h3>
            <p className="text-blue-100 text-sm">Xe buýt: {busNumber}</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-800/30 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Đang theo dõi</span>
          </div>
        </div>
      </div>

      {/* Map Placeholder (will be replaced with real map library) */}
      <div
        ref={mapRef}
        className="relative h-80 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center"
      >
        <div className="text-center">
          <MapPin size={64} className="mx-auto text-blue-600 mb-3" />
          <p className="text-gray-600 font-medium">
            Vị trí hiện tại: {formatCoords(location?.latitude || 0, location?.longitude || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Tích hợp Google Maps/Leaflet đang được phát triển
          </p>
        </div>
      </div>

      {/* Location Info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Speed */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Navigation size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Tốc độ</p>
              <p className="font-semibold text-gray-900">{location?.speed || 0} km/h</p>
            </div>
          </div>

          {/* Heading */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Navigation
                size={20}
                className="text-green-600"
                style={{ transform: `rotate(${location?.heading || 0}deg)` }}
              />
            </div>
            <div>
              <p className="text-xs text-gray-600">Hướng</p>
              <p className="font-semibold text-gray-900">{location?.heading || 0}°</p>
            </div>
          </div>

          {/* Last Update */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Cập nhật</p>
              <p className="font-semibold text-gray-900 text-sm">
                {location?.timestamp ? formatTime(location.timestamp) : 'N/A'}
              </p>
            </div>
          </div>

          {/* Driver */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <MapPin size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Tài xế</p>
              <p className="font-semibold text-gray-900 text-sm truncate">
                {location?.driver_name || driverName || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Accuracy indicator */}
        {location?.accuracy && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Độ chính xác GPS</span>
              <span className={`font-medium ${
                location.accuracy < 10 ? 'text-green-600' :
                location.accuracy < 30 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                ±{location.accuracy.toFixed(1)}m
              </span>
            </div>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  location.accuracy < 10 ? 'bg-green-500' :
                  location.accuracy < 30 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, (50 / location.accuracy) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusTrackingMap;
