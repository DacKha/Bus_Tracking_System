/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Student } from '@/types';
import { studentService } from '@/lib/studentService';
import { userService } from '@/lib/userService';

interface StudentFormProps {
  student?: Student;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StudentForm({ student, onSuccess, onCancel }: StudentFormProps) {
  const isEditMode = !!student;

  // Form state
  const [formData, setFormData] = useState({
    parent_id: student?.parent_id || '',
    full_name: student?.full_name || '',
    date_of_birth: student?.date_of_birth || '',
    gender: student?.gender || 'male' as 'male' | 'female' | 'other',
    grade: student?.grade || '',
    class: student?.class_name || '',
    student_code: student?.student_code || '',
    pickup_address: student?.pickup_address || '',
    dropoff_address: student?.dropoff_address || '',
    special_needs: student?.special_needs || ''
  });

  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load danh sách phụ huynh
  useEffect(() => {
    const loadParents = async () => {
      try {
  const response = await userService.getUsersByType('parent', 1, 100);
  const payload = response as any;
  const rawData = payload?.data?.data ?? payload?.data ?? payload;
  const parentsArray = Array.isArray(rawData) ? rawData : [];
  setParents(parentsArray);
      } catch (err) {
        console.error('Error loading parents:', err);
      }
    };
    loadParents();
  }, []);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.parent_id || formData.parent_id === '') {
        setError('Vui lòng chọn phụ huynh');
        setLoading(false);
        return;
      }

      if (isEditMode) {
        // Update student
        await studentService.updateStudent(student.student_id, {
          full_name: formData.full_name,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          grade: formData.grade,
          class: formData.class,
          student_code: formData.student_code,
          pickup_address: formData.pickup_address,
          dropoff_address: formData.dropoff_address,
          special_needs: formData.special_needs
        });
      } else {
        // Create new student
        await studentService.createStudent({
          parent_id: Number(formData.parent_id),
          full_name: formData.full_name,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          grade: formData.grade,
          class: formData.class,
          student_code: formData.student_code,
          pickup_address: formData.pickup_address,
          dropoff_address: formData.dropoff_address,
          special_needs: formData.special_needs
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
      console.error('Error saving student:', err);
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

      {/* Parent Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phụ huynh <span className="text-red-500">*</span>
        </label>
        <select
          name="parent_id"
          value={formData.parent_id}
          onChange={handleChange}
          disabled={isEditMode}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 disabled:bg-gray-100"
          required
        >
          <option value="">-- Chọn phụ huynh --</option>
          {parents.map(parent => (
            <option key={parent.user_id} value={parent.user_id}>
              {parent.full_name} ({parent.email})
            </option>
          ))}
        </select>
      </div>

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

      {/* Date of Birth & Gender */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày sinh <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giới tính <span className="text-red-500">*</span>
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
            required
          >
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>
      </div>

      {/* Grade & Class */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Khối
          </label>
          <input
            type="text"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            placeholder="Ví dụ: 1, 2, 3..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lớp
          </label>
          <input
            type="text"
            name="class"
            value={formData.class}
            onChange={handleChange}
            placeholder="Ví dụ: 1A, 2B..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
          />
        </div>
      </div>

      {/* Student Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mã học sinh
        </label>
        <input
          type="text"
          name="student_code"
          value={formData.student_code}
          onChange={handleChange}
          placeholder="Ví dụ: HS001"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
        />
      </div>

      {/* Pickup Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Địa chỉ đón
        </label>
        <textarea
          name="pickup_address"
          value={formData.pickup_address}
          onChange={handleChange}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
        />
      </div>

      {/* Dropoff Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Địa chỉ trả
        </label>
        <textarea
          name="dropoff_address"
          value={formData.dropoff_address}
          onChange={handleChange}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
        />
      </div>

      {/* Special Needs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nhu cầu đặc biệt
        </label>
        <textarea
          name="special_needs"
          value={formData.special_needs}
          onChange={handleChange}
          rows={2}
          placeholder="Ví dụ: Dị ứng thực phẩm, cần chăm sóc đặc biệt..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
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
