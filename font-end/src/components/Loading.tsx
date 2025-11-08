// Loading Spinner component
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-yellow-500 ${sizeClasses[size]}`} />
  );
}

// Loading overlay for full page
export function LoadingOverlay({ message = 'Đang tải...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-700">{message}</p>
      </div>
    </div>
  );
}

// Loading for table/list
export function LoadingTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
      ))}
    </div>
  );
}
