/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Settings,
  Bell,
  Shield,
  User,
  Phone,
  Mail,
  MapPin,
  Save,
  Check,
} from 'lucide-react';

interface ParentProfile {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  notifications_enabled: boolean;
  sms_enabled: boolean;
  email_alerts_enabled: boolean;
  delay_alert_threshold: number; // phút
}

export default function SettingsPage() {
  return (
    <ProtectedRoute allowedRoles={['parent']}>
      <SettingsContent />
    </ProtectedRoute>
  );
}

function SettingsContent() {
  const { user } = useAuth();
  const [savedMessage, setSavedMessage] = useState('');
  const [profile, setProfile] = useState<ParentProfile>({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    notifications_enabled: true,
    sms_enabled: false,
    email_alerts_enabled: true,
    delay_alert_threshold: 5,
  });

  const handleProfileChange = (field: keyof ParentProfile, value: any) => {
    setProfile({
      ...profile,
      [field]: value,
    });
  };

  const handleSaveProfile = async () => {
    try {
      // await parentService.updateProfile(user?.user_id, profile);

      setSavedMessage('Cài đặt đã được lưu thành công!');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Cài Đặt</h1>
        <p className="text-gray-600 mt-1">Quản lý thông tin tài khoản và tùy chọn thông báo</p>
      </div>

      {/* Success Message */}
      {savedMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <Check className="text-green-600" size={20} />
          <p className="text-green-700 font-medium">{savedMessage}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="text-green-600" size={20} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Thông Tin Tài Khoản</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đầy đủ
                </label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => handleProfileChange('full_name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    Email
                  </div>
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    Số điện thoại
                  </div>
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  placeholder="0901234567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    Địa chỉ
                  </div>
                </label>
                <textarea
                  value={profile.address}
                  onChange={(e) => handleProfileChange('address', e.target.value)}
                  placeholder="Nhập địa chỉ của bạn"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="text-blue-600" size={20} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Thông Báo</h2>
            </div>

            <div className="space-y-4">
              {/* Push Notifications */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Thông báo trong ứng dụng</p>
                  <p className="text-sm text-gray-600">Nhận thông báo ngay trong ứng dụng</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.notifications_enabled}
                    onChange={(e) => handleProfileChange('notifications_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {/* SMS Alerts */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Tin nhắn SMS</p>
                  <p className="text-sm text-gray-600">Nhận cảnh báo qua SMS (có thể tính phí)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.sms_enabled}
                    onChange={(e) => handleProfileChange('sms_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {/* Email Alerts */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Email thông báo</p>
                  <p className="text-sm text-gray-600">Nhận cảnh báo qua email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.email_alerts_enabled}
                    onChange={(e) => handleProfileChange('email_alerts_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {/* Delay Alert Threshold */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <label className="block font-medium text-gray-900 mb-3">
                  Cảnh báo khi xe trễ quá
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={profile.delay_alert_threshold}
                    onChange={(e) => handleProfileChange('delay_alert_threshold', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <div className="px-4 py-2 bg-gray-100 rounded-lg min-w-max">
                    <span className="font-semibold text-gray-900">{profile.delay_alert_threshold} phút</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Bạn sẽ nhận được cảnh báo nếu xe trễ hơn {profile.delay_alert_threshold} phút
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Quick Links */}
        <div className="space-y-6">
          {/* Security Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="text-purple-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Bảo Mật</h3>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                ✓ Tài khoản của bạn được bảo vệ bằng mật khẩu mạnh
              </p>
              <p className="text-sm text-gray-600">
                ✓ Dữ liệu được mã hóa khi truyền
              </p>
              <button className="w-full mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium transition-colors">
                Đổi Mật Khẩu
              </button>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Hỗ Trợ</h3>
            <p className="text-sm text-gray-600 mb-4">
              Bạn cần giúp đỡ? Liên hệ với chúng tôi
            </p>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors">
              Liên Hệ Hỗ Trợ
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3 justify-end">
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
          Hủy
        </button>
        <button
          onClick={handleSaveProfile}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium transition-colors"
        >
          <Save size={16} />
          Lưu Cài Đặt
        </button>
      </div>
    </div>
  );
}
