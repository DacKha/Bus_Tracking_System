/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  LayoutDashboard,
  Calendar,
  Users,
  CheckSquare,
  MessageSquare,
  AlertTriangle,
  LogOut,
  Bus
} from 'lucide-react';

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { href: '/driver', label: 'Trang chu', icon: LayoutDashboard },
    { href: '/driver/schedule', label: 'Lich trinh', icon: Calendar },
    { href: '/driver/attendance', label: 'Diem danh', icon: CheckSquare },
    { href: '/driver/students', label: 'Hoc sinh', icon: Users },
    { href: '/driver/messages', label: 'Tin nhan', icon: MessageSquare },
    { href: '/driver/incidents', label: 'Su co', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/driver" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center shadow-lg">
                <Bus className="text-white" size={24} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Smart School Bus</h1>
                <p className="text-xs text-gray-500">Tai xe</p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Dang xuat</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        <nav className="bg-white border-r border-gray-200 lg:w-64 flex-shrink-0">
          <div className="sticky top-20 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium text-sm"
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
