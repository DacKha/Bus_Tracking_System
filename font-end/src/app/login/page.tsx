/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInputs = (): boolean => {
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email không hợp lệ');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs()) return;

    setError('');
    setLoading(true);

    try {
      // Sử dụng login function từ AuthContext
      await login(email.trim(), password);
      // AuthContext sẽ tự động chuyển hướng
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart School Bus</h1>
            <p className="text-gray-700 font-medium">Hệ Thống Quản Lý Xe Buýt</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
              <p className="text-red-800 font-medium text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="email@example.com"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-900 font-medium"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Mật Khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-900 font-medium pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 font-bold text-sm"
                  tabIndex={-1}
                >
                  {showPassword ? 'Ẩn' : 'Xem'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-60 mt-6"
            >
              {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-gray-600 mt-6 font-medium">
            © 2025 Smart School Bus
          </p>
        </div>
      </div>
    </div>
  );
}
