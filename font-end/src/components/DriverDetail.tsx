'use client';

import { Driver } from '@/types';
import { format } from 'date-fns';

interface DriverDetailProps {
  driver: Driver;
}

export default function DriverDetail({ driver }: DriverDetailProps) {
  // Status badge
  const getStatusBadge = (status: string) => {
    const colors = {
      available: 'bg-green-100 text-green-700',
      on_trip: 'bg-blue-100 text-blue-700',
      off_duty: 'bg-gray-100 text-gray-700'
    };
    const labels = {
      available: 'Sẵn sàng',
      on_trip: 'Đang chạy',
      off_duty: 'Nghỉ việc'
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
          <h3 className="text-xl font-bold text-gray-900">{driver.full_name}</h3>
          <p className="text-gray-600 text-sm mt-1">ID: #{driver.driver_id}</p>
        </div>
        {getStatusBadge(driver.status)}
      </div>

      {/* Thông tin cơ bản */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">Thông tin cơ bản</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium text-gray-900">{driver.email || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Số điện thoại</p>
            <p className="font-medium text-gray-900">{driver.phone || '-'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-600">Địa chỉ</p>
            <p className="font-medium text-gray-900">{driver.address?.toString() || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Liên hệ khẩn cấp</p>
            <p className="font-medium text-gray-900">{driver.emergency_contact?.toString() || '-'}</p>
          </div>
        </div>
      </div>

      {/* Giấy phép lái xe */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">Giấy phép lái xe</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Số giấy phép</p>
            <p className="font-medium text-gray-900">{driver.license_number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Ngày hết hạn</p>
            <p className="font-medium text-gray-900">{formatDate(driver.license_expiry)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Đánh giá</p>
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-900">{driver.rating || '5.00'}</span>
              <span className="text-yellow-500">★</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ngày tạo */}
      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Ngày tạo</p>
            <p className="font-medium text-gray-900">{formatDate(driver.created_at)}</p>
          </div>
          <div>
            <p className="text-gray-600">Cập nhật lần cuối</p>
            <p className="font-medium text-gray-900">{formatDate(driver.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
