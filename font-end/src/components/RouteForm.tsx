/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Route } from '@/types';
import { routeService } from '@/lib/routeService';

interface RouteFormProps {
  route?: Route;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RouteForm({ route, onSuccess, onCancel }: RouteFormProps) {
  const isEditMode = !!route;

  // Form state
  const [formData, setFormData] = useState({
    route_name: route?.route_name || '',
    description: route?.description || '',
    distance_km: route?.distance_km || 0,
    estimated_duration: route?.estimated_duration || 0,
    status: route?.status || 'active' as 'active' | 'inactive'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditMode) {
        // Update route
        await routeService.updateRoute(route.route_id, {
          route_name: formData.route_name,
          description: formData.description || undefined,
          distance_km: formData.distance_km > 0 ? Number(formData.distance_km) : undefined,
          estimated_duration: formData.estimated_duration > 0
            ? Number(formData.estimated_duration)
            : undefined,
          status: formData.status
        });
      } else {
        // Create new route
        await routeService.createRoute({
          route_name: formData.route_name,
          description: formData.description || undefined,
          distance_km: formData.distance_km > 0 ? Number(formData.distance_km) : undefined,
          estimated_duration: formData.estimated_duration > 0
            ? Number(formData.estimated_duration)
            : undefined,
          status: formData.status
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
      console.error('Error saving route:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Route Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên tuyến đường <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="route_name"
          value={formData.route_name}
          onChange={handleChange}
          placeholder="Ví dụ: Tuyến 1 - Trung tâm đến Quận 9"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Mô tả chi tiết về tuyến đường..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
        />
      </div>

      {/* Distance & Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Khoảng cách (km)
          </label>
          <input
            type="number"
            name="distance_km"
            value={formData.distance_km}
            onChange={handleChange}
            min="0"
            step="0.1"
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thời gian ước tính (phút)
          </label>
          <input
            type="number"
            name="estimated_duration"
            value={formData.estimated_duration}
            onChange={handleChange}
            min="0"
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Trạng thái <span className="text-red-500">*</span>
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
          required
        >
          <option value="active">Hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
        >
          {loading ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Tạo mới'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
