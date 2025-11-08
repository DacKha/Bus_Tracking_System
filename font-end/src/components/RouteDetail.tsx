/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Route, Stop } from '@/types';
import { routeService } from '@/lib/routeService';
import { format } from 'date-fns';
import { MapPin } from 'lucide-react';

interface RouteDetailProps {
  route: Route;
}

export default function RouteDetail({ route }: RouteDetailProps) {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loadingStops, setLoadingStops] = useState(true);

  // Load stops when component mounts
  useEffect(() => {
    const loadStops = async () => {
      try {
        setLoadingStops(true);
        const response = await routeService.getRouteStops(route.route_id);
        setStops(response.data);
      } catch (err) {
        console.error('Error loading stops:', err);
      } finally {
        setLoadingStops(false);
      }
    };

    loadStops();
  }, [route.route_id]);

  // Status badge
  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700'
    };
    const labels = {
      active: 'Hoạt động',
      inactive: 'Không hoạt động'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status as keyof typeof colors]}`}>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{route.route_name}</h3>
          <p className="text-gray-600 text-sm mt-1">ID: #{route.route_id}</p>
        </div>
        {getStatusBadge(route.status)}
      </div>

      {/* Description */}
      {route.description && (
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-2">Mô tả</h4>
          <p className="text-gray-700 text-sm">{route.description}</p>
        </div>
      )}

      {/* Thông tin tuyến đường */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">Thông tin tuyến đường</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Khoảng cách</p>
            <p className="font-medium text-gray-900">
              {route.distance_km ? `${route.distance_km} km` : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Thời gian ước tính</p>
            <p className="font-medium text-gray-900">
              {route.estimated_duration_minutes ? `${route.estimated_duration_minutes} phút` : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Điểm dừng */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">
          Điểm dừng ({stops.length})
        </h4>
        {loadingStops ? (
          <div className="text-center py-4 text-gray-500 text-sm">Đang tải...</div>
        ) : stops.length > 0 ? (
          <div className="space-y-3">
            {stops.map((stop, index) => (
              <div
                key={stop.stop_id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 font-semibold text-sm flex-shrink-0">
                  {stop.stop_order}
                </div>
                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{stop.stop_name}</p>
                      {stop.stop_address && (
                        <p className="text-sm text-gray-600 mt-1">{stop.stop_address}</p>
                      )}
                      {stop.estimated_arrival_time && (
                        <p className="text-xs text-gray-500 mt-1">
                          Thời gian dự kiến: {stop.estimated_arrival_time}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg">
            Chưa có điểm dừng nào
          </div>
        )}
      </div>

      {/* Ngày tạo */}
      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Ngày tạo</p>
            <p className="font-medium text-gray-900">{formatDate(route.created_at)}</p>
          </div>
          <div>
            <p className="text-gray-600">Cập nhật lần cuối</p>
            <p className="font-medium text-gray-900">{formatDate(route.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
