/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Driver } from '@/types';
import { driverService } from '@/lib/driverService';

interface DriverFormProps {
  driver?: Driver; // Nếu có driver = Edit mode, không có = Create mode
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DriverForm({ driver, onSuccess, onCancel }: DriverFormProps) {
  const isEditMode = !!driver;

  // Form state
  const [formData, setFormData] = useState({
    email: driver?.email || '',
    password: '',
    full_name: driver?.full_name || '',
    phone: driver?.phone || '',
    license_number: driver?.license_number || '',
    license_expiry: driver?.license_expiry || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        // Update driver
        await driverService.updateDriver(driver.driver_id, {
          full_name: formData.full_name,
          phone: formData.phone,
          license_number: formData.license_number,
          license_expiry: formData.license_expiry,
        } as any);
      } else {
        // Create new driver
        if (!formData.password) {
          setError('Mật khẩu là bắt buộc');
          setLoading(false);
          return;
        }
        await driverService.createDriver(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
      console.error('Error saving driver:', err);
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

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isEditMode}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 disabled:bg-gray-100"
          required
        />
      </div>

      {/* Password */}
      {!isEditMode && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
            required
            minLength={6}
          />
        </div>
      )}

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
          required
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Số điện thoại
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
        />
      </div>

      {/* License Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Số giấy phép lái xe <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="license_number"
          value={formData.license_number}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
          required
        />
      </div>

      {/* License Expiry */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ngày hết hạn giấy phép <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="license_expiry"
          value={formData.license_expiry}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
          required
        />
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
