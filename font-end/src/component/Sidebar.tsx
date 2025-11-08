'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Tổng quan', href: '/admin' },
    { label: 'Người dùng', href: '/admin/users' },
    { label: 'Học sinh', href: '/admin/student' },
    { label: 'Tài xế', href: '/admin/driver' },
    { label: 'Xe buýt', href: '/admin/bus' },
    { label: 'Tuyến đường', href: '/admin/route' },
    { label: 'Lịch trình', href: '/admin/schedule' },
    { label: 'Tin nhắn', href: '/admin/message' },
    { label: 'Cài đặt', href: '/admin/setting' },
  ];

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
