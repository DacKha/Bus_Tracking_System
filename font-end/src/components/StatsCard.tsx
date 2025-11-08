/* eslint-disable @typescript-eslint/no-explicit-any */
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100',
  subtitle,
  trend
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            {trend && (
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${iconBgColor} ${iconColor} p-4 rounded-lg`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
