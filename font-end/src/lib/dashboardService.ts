/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';
import { driverService } from './driverService';
import { studentService } from './studentService';
import { busService } from './busService';
import { routeService } from './routeService';
import { scheduleService } from './scheduleService';

export interface DashboardStats {
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

export interface RecentActivity {
  id: number;
  type: 'schedule' | 'student' | 'driver' | 'bus' | 'route';
  action: 'created' | 'updated' | 'deleted';
  description: string;
  timestamp: string;
}

const extractList = (payload: any) => {
  const source = payload?.data?.data ?? payload?.data ?? payload;
  return Array.isArray(source) ? source : [];
};

export const dashboardService = {
  /**
   * Lay thong ke tong quan cho dashboard
   * Su dung API endpoint moi thay vi goi nhieu APIs rieng le
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Goi API dashboard endpoint moi
      const response = await api.get<{ success: boolean; message: string; data: DashboardStats }>('/api/dashboard/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return zeros neu co loi
      return {
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
        completedSchedules: 0
      };
    }
  },

  /**
   * Lấy lịch trình hôm nay
   */
  async getTodaySchedules() {
    return scheduleService.getTodaySchedules();
  },

  /**
   * Lấy lịch trình đang chạy
   */
  async getInProgressSchedules() {
    return scheduleService.getSchedulesByStatus('in_progress', 1, 100);
  }
};
