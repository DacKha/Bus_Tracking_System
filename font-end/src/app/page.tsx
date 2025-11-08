'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    router.replace('/login');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
