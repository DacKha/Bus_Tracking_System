'use client';

import { Bus } from '@/types';
import { format } from 'date-fns';

interface BusDetailProps {
  bus: Bus;
}

export default function BusDetail({ bus }: BusDetailProps) {
  // Status badge
  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      maintenance: 'bg-yellow-100 text-yellow-700',
      inactive: 'bg-gray-100 text-gray-700'
    };
    const labels = {
      active: 'Hoạt động',
      maintenance: 'Bảo trì',
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
          <h3 className="text-xl font-bold text-gray-900">{bus.bus_number}</h3>
          <p className="text-gray-600 text-sm mt-1">ID: #{bus.bus_id}</p>
          <p className="text-gray-600 text-sm">Biển số: {bus.license_plate}</p>
        </div>
        {getStatusBadge(bus.status)}
      </div>

      {/* Thông tin xe */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">Thông tin xe</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Sức chứa</p>
            <p className="font-medium text-gray-900">{bus.capacity} chỗ</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Model</p>
            <p className="font-medium text-gray-900">{bus.model || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Năm sản xuất</p>
            <p className="font-medium text-gray-900">{bus.year || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Màu sắc</p>
            <p className="font-medium text-gray-900">{bus.color || '-'}</p>
          </div>
        </div>
      </div>

      {/* Ngày tạo */}
      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Ngày tạo</p>
            <p className="font-medium text-gray-900">{formatDate(bus.created_at)}</p>
          </div>
          <div>
            <p className="text-gray-600">Cập nhật lần cuối</p>
            <p className="font-medium text-gray-900">{formatDate(bus.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
