/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { User, CreateUserInput, UpdateUserInput } from '@/types';
import { userService } from '@/lib/userService';
import { LoadingSpinner } from '@/components/Loading';

interface UserFormProps {
  user?: User; // Nếu có user thì là Edit mode, không có thì là Create mode
  onSuccess: () => void;
  onCancel: () => void;
}

export default function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const isEditMode = !!user;

  // Form state
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    user_type: user?.user_type || 'parent' as 'admin' | 'driver' | 'parent'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    // Password validation (chỉ khi Create hoặc khi có nhập password trong Edit)
    if (!isEditMode) {
      if (!formData.password) {
        errors.password = 'Mật khẩu không được để trống';
      } else if (formData.password.length < 6) {
        errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    } else if (formData.password) {
      // Trong Edit mode, nếu có nhập password thì phải validate
      if (formData.password.length < 6) {
        errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    }

    // Full name validation
    if (!formData.full_name) {
      errors.full_name = 'Họ tên không được để trống';
    } else if (formData.full_name.length < 3) {
      errors.full_name = 'Họ tên phải có ít nhất 3 ký tự';
    }

    // Phone validation (optional)
    if (formData.phone) {
      const phoneWithoutSpaces = formData.phone.replace(/\s/g, '');
      if (!/^[0-9]{10,11}$/.test(phoneWithoutSpaces)) {
        errors.phone = 'Số điện thoại phải có 10-11 chữ số';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        // Edit mode
        const updateData: UpdateUserInput = {
          full_name: formData.full_name,
          phone: formData.phone ? formData.phone.replace(/\s/g, '') : undefined
        };

        await userService.updateUser(user.user_id, updateData);

        // Nếu có thay đổi password
        if (formData.password) {
          await userService.changePassword(user.user_id, formData.password);
        }
      } else {
        // Create mode
        const createData: CreateUserInput = {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone: formData.phone ? formData.phone.replace(/\s/g, '') : undefined,
          user_type: formData.user_type
        };

        await userService.createUser(createData);
      }

      onSuccess();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message ||
                          (isEditMode ? 'Không thể cập nhật user' : 'Không thể tạo user');
      setError(errorMessage);
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error khi user bắt đầu sửa
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
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
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 ${
            fieldErrors.email ? 'border-red-500' : 'border-gray-300'
          } ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          placeholder="example@email.com"
        />
        {fieldErrors.email && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mật khẩu {!isEditMode && <span className="text-red-500">*</span>}
          {isEditMode && <span className="text-gray-500 text-xs ml-1">(Để trống nếu không đổi)</span>}
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 ${
            fieldErrors.password ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={isEditMode ? 'Nhập mật khẩu mới (nếu muốn đổi)' : 'Nhập mật khẩu'}
        />
        {fieldErrors.password && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      {(!isEditMode || formData.password) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Xác nhận mật khẩu <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 ${
              fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nhập lại mật khẩu"
          />
          {fieldErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
          )}
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
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 ${
            fieldErrors.full_name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nguyễn Văn A"
        />
        {fieldErrors.full_name && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.full_name}</p>
        )}
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
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 ${
            fieldErrors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="0123456789"
        />
        {fieldErrors.phone && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
        )}
      </div>

      {/* User Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Loại người dùng <span className="text-red-500">*</span>
        </label>
        <select
          name="user_type"
          value={formData.user_type}
          onChange={handleChange}
          disabled={isEditMode}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 ${
            isEditMode ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
          }`}
        >
          <option value="parent">Phụ huynh</option>
          <option value="driver">Tài xế</option>
          <option value="admin">Admin</option>
        </select>
        {isEditMode && (
          <p className="mt-1 text-xs text-gray-500">Không thể thay đổi loại người dùng</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <LoadingSpinner size="sm" />}
          {loading ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật' : 'Tạo mới')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
