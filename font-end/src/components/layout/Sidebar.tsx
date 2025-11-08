'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [userType, setUserType] = useState<string>('admin');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserType(user.user_type || 'admin');
    }
  }, []);

  const adminMenuItems = [
    { label: 'Tổng quan', href: '/admin' },
    { label: 'Người dùng', href: '/admin/users' },
    { label: 'Học sinh', href: '/admin/student' },
    { label: 'Phụ huynh', href: '/admin/parent' },
    { label: 'Tài xế', href: '/admin/driver' },
    { label: 'Xe buýt', href: '/admin/bus' },
    { label: 'Tuyến đường', href: '/admin/route' },
    { label: 'Lịch trình', href: '/admin/schedule' },
    { label: 'Tin nhắn', href: '/admin/message' },
    { label: 'Cài đặt', href: '/admin/setting' },
  ];

  const driverMenuItems = [
    { label: 'Trang chủ', href: '/driver/home' },
    { label: 'Học sinh', href: '/driver/students' },
    { label: 'Tin nhắn', href: '/driver/messages' },
    { label: 'Cài đặt', href: '/driver/settings' },
  ];

  const parentMenuItems = [
    { label: 'Trang chủ', href: '/parents/home' },
    { label: 'Theo dõi xe', href: '/parents/tracking' },
    { label: 'Thông báo', href: '/parents/notifications' },
    { label: 'Sự cố', href: '/parents/incident' },
    { label: 'Tin nhắn', href: '/parents/messages' },
    { label: 'Cài đặt', href: '/parents/settings' },
  ];

  let menuItems = adminMenuItems;
  if (userType === 'driver') {
    menuItems = driverMenuItems;
  } else if (userType === 'parent') {
    menuItems = parentMenuItems;
  }

  return (
    <nav className="flex-1 p-4 text-gray-700">
      <ul className="space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}


