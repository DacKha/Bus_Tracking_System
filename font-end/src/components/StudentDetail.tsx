'use client';

import { Student } from '@/types';
import { format } from 'date-fns';

interface StudentDetailProps {
  student: Student;
}

export default function StudentDetail({ student }: StudentDetailProps) {
  // Gender label
  const getGenderLabel = (gender: string) => {
    const labels = {
      male: 'Nam',
      female: 'Nữ',
      other: 'Khác'
    };
    return labels[gender as keyof typeof labels] || gender;
  };

  // Status badge
  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
      }`}>
        {isActive ? 'Đang học' : 'Nghỉ học'}
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

  // Calculate age
  const calculateAge = (dob?: string) => {
    if (!dob) return '-';
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return `${age} tuổi`;
    } catch {
      return '-';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{student.full_name}</h3>
          <p className="text-gray-600 text-sm mt-1">ID: #{student.student_id}</p>
          {student.student_code && (
            <p className="text-gray-600 text-sm">Mã HS: {student.student_code}</p>
          )}
        </div>
        {getStatusBadge(student.is_active)}
      </div>

      {/* Thông tin cơ bản */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">Thông tin cơ bản</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Ngày sinh</p>
            <p className="font-medium text-gray-900">{formatDate(student.date_of_birth)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tuổi</p>
            <p className="font-medium text-gray-900">{calculateAge(student.date_of_birth)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Giới tính</p>
            <p className="font-medium text-gray-900">{getGenderLabel(student.gender)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Lớp</p>
            <p className="font-medium text-gray-900">
              {student.grade && student.class_name
                ? `${student.grade}${student.class_name}`
                : student.class_name || student.grade || '-'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Thông tin phụ huynh */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">Thông tin phụ huynh</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Họ tên phụ huynh</p>
            <p className="font-medium text-gray-900">{student.parent_name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Số điện thoại</p>
            <p className="font-medium text-gray-900">{student.parent_phone || '-'}</p>
          </div>
        </div>
      </div>

      {/* Địa chỉ đưa đón */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">Địa chỉ đưa đón</h4>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Địa chỉ đón</p>
            <p className="font-medium text-gray-900">{student.pickup_address || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Địa chỉ trả</p>
            <p className="font-medium text-gray-900">{student.dropoff_address || '-'}</p>
          </div>
        </div>
      </div>

      {/* Nhu cầu đặc biệt */}
      {student.special_needs && (
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-3">Nhu cầu đặc biệt</h4>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-gray-900">{student.special_needs}</p>
          </div>
        </div>
      )}

      {/* Ngày tạo */}
      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Ngày tạo</p>
            <p className="font-medium text-gray-900">{formatDate(student.created_at)}</p>
          </div>
          <div>
            <p className="text-gray-600">Cập nhật lần cuối</p>
            <p className="font-medium text-gray-900">{formatDate(student.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
