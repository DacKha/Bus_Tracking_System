'use client';

import { LucideIcon, Inbox, Search, AlertCircle, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  type?: 'default' | 'search' | 'error';
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  type = 'default'
}: EmptyStateProps) {
  const getDefaultIcon = () => {
    switch (type) {
      case 'search':
        return Search;
      case 'error':
        return AlertCircle;
      default:
        return Inbox;
    }
  };

  const DisplayIcon = Icon || getDefaultIcon();

  const getColorClass = () => {
    switch (type) {
      case 'search':
        return 'text-blue-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className={`mb-4 ${getColorClass()}`}>
        <DisplayIcon size={64} strokeWidth={1.5} />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-gray-500 text-center max-w-md mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          {action.label}
        </button>
      )}
    </div>
  );
}
