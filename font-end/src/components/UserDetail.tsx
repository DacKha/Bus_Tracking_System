'use client';

import { User } from '@/types';
import { Calendar, Mail, Phone, User as UserIcon, Shield, CheckCircle, XCircle } from 'lucide-react';

interface UserDetailProps {
  user: User;
}

export default function UserDetail({ user }: UserDetailProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get user type label and color
  const getUserTypeInfo = (type: string) => {
    const info = {
      admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700', icon: Shield },
      driver: { label: 'Tài xế', color: 'bg-blue-100 text-blue-700', icon: UserIcon },
      parent: { label: 'Phụ huynh', color: 'bg-green-100 text-green-700', icon: UserIcon }
    };
    return info[type as keyof typeof info] || info.parent;
  };

  const typeInfo = getUserTypeInfo(user.user_type);
  const TypeIcon = typeInfo.icon;

  return (
    <div className="space-y-6">
      {/* Avatar and Name */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-2xl font-bold">
          {user.full_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{user.full_name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeInfo.color} flex items-center gap-1`}>
              <TypeIcon size={12} />
              {typeInfo.label}
            </span>
            {user.is_active ? (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
                <CheckCircle size={12} />
                Hoạt động
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 flex items-center gap-1">
                <XCircle size={12} />
                Tạm khóa
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* ID */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <span className="text-gray-600 font-mono text-sm">#</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">ID</p>
            <p className="text-base font-medium text-gray-900">#{user.user_id}</p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Mail className="text-blue-600" size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-base font-medium text-gray-900">{user.email}</p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <Phone className="text-green-600" size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Số điện thoại</p>
            <p className="text-base font-medium text-gray-900">{user.phone || 'Chưa cập nhật'}</p>
          </div>
        </div>

        {/* Created At */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <Calendar className="text-purple-600" size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Ngày tạo</p>
            <p className="text-base font-medium text-gray-900">{formatDate(user.created_at)}</p>
          </div>
        </div>

        {/* Updated At */}
        {user.updated_at && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <Calendar className="text-orange-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Cập nhật lần cuối</p>
              <p className="text-base font-medium text-gray-900">{formatDate(user.updated_at)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Avatar URL (if exists) */}
      {user.avatar_url && (
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-500 mb-2">Avatar URL</p>
          <a
            href={user.avatar_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm break-all"
          >
            {user.avatar_url}
          </a>
        </div>
      )}

      {/* Additional Info based on user type */}
      <div className="pt-4 border-t">
        <p className="text-sm text-gray-500 mb-2">Thông tin bổ sung</p>
        <div className="bg-gray-50 rounded-lg p-3">
          {user.user_type === 'admin' && (
            <p className="text-sm text-gray-700">
              Tài khoản Admin có toàn quyền quản lý hệ thống
            </p>
          )}
          {user.user_type === 'driver' && (
            <p className="text-sm text-gray-700">
              Tài khoản tài xế có thể quản lý lịch trình và cập nhật trạng thái xe bus
            </p>
          )}
          {user.user_type === 'parent' && (
            <p className="text-sm text-gray-700">
              Tài khoản phụ huynh có thể theo dõi con em và nhận thông báo
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
