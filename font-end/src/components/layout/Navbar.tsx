/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Bell, LogOut, User, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Lấy thông tin user từ localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <header className="h-16 bg-blue-600 flex items-center justify-between px-4 lg:px-6 text-white shadow-md sticky top-0 z-50">
      {/* Left: Logo + Title */}
      <div className="flex items-center space-x-3">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <Image
          src="/icon_bus.png"
          alt="SSB Logo"
          width={48}
          height={48}
          className="h-10 w-10 object-contain"
        />
        <h1 className="text-lg lg:text-xl font-bold hidden sm:block">Smart School Bus</h1>
        <h1 className="text-lg font-bold sm:hidden">SSB</h1>
      </div>

      {/* Right: Notifications + User Menu */}
      <div className="flex items-center space-x-2 lg:space-x-4">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-blue-700 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 lg:space-x-3 p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium hidden md:block">{user.full_name}</span>
              <img
                src={user.avatar_url || 'https://i.pravatar.cc/40'}
                alt="Avatar"
                className="rounded-full w-8 h-8 border-2 border-white object-cover"
              />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              {/* Backdrop to close dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              ></div>

              {/* Dropdown Content */}
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-200">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">{user.full_name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <p className="text-xs text-blue-600 mt-1 capitalize">{user.user_type}</p>
                </div>

                {/* Menu Items */}
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push('/admin/setting');
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Cài đặt</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </>
          )}
          </div>
        )}
      </div>
    </header>
  );
}


