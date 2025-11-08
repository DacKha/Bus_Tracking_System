'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCog,
  GraduationCap,
  Bus,
  MapPin,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Menu,
  X,
  LogOut
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.user_type !== 'admin') {
      router.push('/login');
      return;
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { href: '/admin', label: 'Trang chu', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Nguoi dung', icon: Users },
    { href: '/admin/driver', label: 'Tai xe', icon: UserCog },
    { href: '/admin/student', label: 'Hoc sinh', icon: GraduationCap },
    { href: '/admin/bus', label: 'Xe bus', icon: Bus },
    { href: '/admin/route', label: 'Tuyen duong', icon: MapPin },
    { href: '/admin/schedule', label: 'Lich trinh', icon: Calendar },
    { href: '/admin/messages', label: 'Tin nhan', icon: MessageSquare },
    { href: '/admin/incidents', label: 'Su co', icon: AlertTriangle },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Dang tai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg">
                  <Bus className="text-white" size={24} />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">Smart School Bus</h1>
                  <p className="text-xs text-gray-500">Quan tri vien</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Dang xuat</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            ></div>

            <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 lg:hidden overflow-y-auto">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">Menu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium text-sm"
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </>
        )}

        <aside className="hidden lg:flex w-64 min-h-screen bg-white shadow-lg flex-col border-r border-gray-200">
          <nav className="sticky top-20 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium text-sm"
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
