'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'driver' | 'parent'>;
}

/**
 * Protected Route Component
 * Bảo vệ route theo authentication và authorization
 *
 * @param children - Nội dung cần bảo vệ
 * @param allowedRoles - Danh sách roles được phép truy cập
 */
export default function ProtectedRoute({
  children,
  allowedRoles
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Đợi loading xong
    if (loading) return;

    // Nếu chưa login → redirect về login
    if (!user) {
      router.replace('/login');
      return;
    }

    // Kiểm tra role nếu có giới hạn
    if (allowedRoles && !allowedRoles.includes(user.user_type)) {
      // Redirect về trang phù hợp với role
      if (user.user_type === 'admin') {
        router.replace('/admin');
      } else if (user.user_type === 'driver') {
        router.replace('/driver');
      } else if (user.user_type === 'parent') {
        router.replace('/parents/home');
      }
      return;
    }

    // Có quyền truy cập
    setIsAuthorized(true);
  }, [user, loading, allowedRoles, router]);

  // Đang loading → hiển thị loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Chưa authorize → hiển thị loading (đang redirect)
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  // Có quyền → hiển thị nội dung
  return <>{children}</>;
}
