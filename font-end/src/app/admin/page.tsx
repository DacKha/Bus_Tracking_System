/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Schedule } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import StatsCard from '@/components/StatsCard';
import TodaySchedules from '@/components/TodaySchedules';
import Modal from '@/components/Modal';
import ScheduleDetail from '@/components/ScheduleDetail';
import {
  Users,
  UserCheck,
  GraduationCap,
  Bus,
  Wrench,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  PlayCircle
} from 'lucide-react';

interface DashboardStats {
  totalDrivers: number;
  activeDrivers: number;
  totalStudents: number;
  activeStudents: number;
  totalBuses: number;
  activeBuses: number;
  maintenanceBuses: number;
  totalRoutes: number;
  activeRoutes: number;
  totalSchedules: number;
  todaySchedules: number;
  pendingSchedules: number;
  inProgressSchedules: number;
  completedSchedules: number;
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, token } = useAuth();
  
  // State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showScheduleDetail, setShowScheduleDetail] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  // Load dashboard data
  const loadDashboard = async () => {
    if (!token || !user) {
      return;
    }
    
    try {
      setLoading(true);
      const { dashboardService } = await import('@/lib/dashboardService');
      const { scheduleService } = await import('@/lib/scheduleService');

      const statsData = await dashboardService.getDashboardStats();
      const schedulesResponse = await scheduleService.getTodaySchedules();
      
      const schedulesData = Array.isArray(schedulesResponse.data) 
        ? schedulesResponse.data 
        : [];

      setStats(statsData);
      setTodaySchedules(schedulesData as Schedule[]);
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      setStats({
        totalDrivers: 0,
        activeDrivers: 0,
        totalStudents: 0,
        activeStudents: 0,
        totalBuses: 0,
        activeBuses: 0,
        maintenanceBuses: 0,
        totalRoutes: 0,
        activeRoutes: 0,
        totalSchedules: 0,
        todaySchedules: 0,
        pendingSchedules: 0,
        inProgressSchedules: 0,
        completedSchedules: 0,
      });
      setTodaySchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // Load on mount - only when user and token are available
  useEffect(() => {
    if (user && token) {
      loadDashboard();
    }
  }, [user, token]);

  // Handle schedule click
  const handleScheduleClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowScheduleDetail(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">Tổng quan hệ thống quản lý xe buýt học đường</p>
        </div>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-200 flex items-center gap-2 justify-center transition-colors"
        >
          <RefreshCw size={16} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Stats Grid - Row 1: Drivers, Students, Buses, Routes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Tổng số tài xế"
          value={stats?.totalDrivers || 0}
          icon={Users}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          subtitle={`${stats?.activeDrivers || 0} đang hoạt động`}
        />
        <StatsCard
          title="Tổng số học sinh"
          value={stats?.totalStudents || 0}
          icon={GraduationCap}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          subtitle={`${stats?.activeStudents || 0} đang hoạt động`}
        />
        <StatsCard
          title="Tổng số xe buýt"
          value={stats?.totalBuses || 0}
          icon={Bus}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          subtitle={`${stats?.activeBuses || 0} hoạt động, ${stats?.maintenanceBuses || 0} bảo trì`}
        />
        <StatsCard
          title="Tổng số tuyến"
          value={stats?.totalRoutes || 0}
          icon={MapPin}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
          subtitle={`${stats?.activeRoutes || 0} đang hoạt động`}
        />
      </div>

      {/* Stats Grid - Row 2: Schedule Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Lịch trình hôm nay"
          value={stats?.todaySchedules || 0}
          icon={Calendar}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
          subtitle="Tổng số chuyến"
        />
        <StatsCard
          title="Chờ khởi hành"
          value={stats?.pendingSchedules || 0}
          icon={Clock}
          iconColor="text-gray-600"
          iconBgColor="bg-gray-100"
          subtitle="Chưa bắt đầu"
        />
        <StatsCard
          title="Đang thực hiện"
          value={stats?.inProgressSchedules || 0}
          icon={PlayCircle}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          subtitle="Đang di chuyển"
        />
        <StatsCard
          title="Hoàn thành"
          value={stats?.completedSchedules || 0}
          icon={CheckCircle}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          subtitle="Đã hoàn tất"
        />
      </div>

      {/* Today's Schedules */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <TodaySchedules
          schedules={todaySchedules}
          onViewDetail={handleScheduleClick}
        />
      </div>

      {/* Schedule Detail Modal */}
      <Modal
        isOpen={showScheduleDetail}
        onClose={() => setShowScheduleDetail(false)}
        title="Chi tiết lịch trình"
        size="lg"
      >
        {selectedSchedule && <ScheduleDetail schedule={selectedSchedule} />}
      </Modal>
    </div>
  );
}


