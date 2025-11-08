/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Bus } from '@/types';
import { busService } from '@/lib/busService';

interface BusFormProps {
  bus?: Bus;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BusForm({ bus, onSuccess, onCancel }: BusFormProps) {
  const isEditMode = !!bus;

  // Form state
  const [formData, setFormData] = useState({
    bus_number: bus?.bus_number || '',
    license_plate: bus?.license_plate || '',
    capacity: bus?.capacity || 30,
    model: bus?.model || '',
    year: bus?.year || new Date().getFullYear(),
    color: bus?.color || '',
    status: bus?.status || 'active' as 'active' | 'maintenance' | 'inactive'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        // Update bus
        await busService.updateBus(bus.bus_id, {
          bus_number: formData.bus_number,
          license_plate: formData.license_plate,
          capacity: Number(formData.capacity),
          model: formData.model,
          year: Number(formData.year),
          color: formData.color,
          status: formData.status
        });
      } else {
        // Create new bus
        await busService.createBus({
          bus_number: formData.bus_number,
          license_plate: formData.license_plate,
          capacity: Number(formData.capacity),
          model: formData.model,
          year: Number(formData.year),
          color: formData.color,
          status: formData.status
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
      console.error('Error saving bus:', err);
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

      {/* Bus Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Số xe <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="bus_number"
          value={formData.bus_number}
          onChange={handleChange}
          placeholder="Ví dụ: BUS-001"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
          required
        />
      </div>

      {/* License Plate */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Biển số xe <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="license_plate"
          value={formData.license_plate}
          onChange={handleChange}
          placeholder="Ví dụ: 51A-12345"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
          required
        />
      </div>

      {/* Capacity & Year */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sức chứa <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            min="1"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Năm sản xuất
          </label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            min="2000"
            max={new Date().getFullYear() + 1}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
          />
        </div>
      </div>

      {/* Model */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Model
        </label>
        <input
          type="text"
          name="model"
          value={formData.model}
          onChange={handleChange}
          placeholder="Ví dụ: Hyundai County, Thaco TB120S"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
        />
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Màu sắc
        </label>
        <input
          type="text"
          name="color"
          value={formData.color}
          onChange={handleChange}
          placeholder="Ví dụ: Vàng, Xanh"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
        />
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
          <option value="maintenance">Bảo trì</option>
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
