/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Schedule } from '@/types';
import { scheduleService } from '@/lib/scheduleService';
import { routeService } from '@/lib/routeService';
import { busService } from '@/lib/busService';
import { driverService } from '@/lib/driverService';

interface ScheduleFormProps {
  schedule?: Schedule;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ScheduleForm({ schedule, onSuccess, onCancel }: ScheduleFormProps) {
  const isEditMode = !!schedule;

  // Form state
  const [formData, setFormData] = useState({
    route_id: schedule?.route_id || 0,
    bus_id: schedule?.bus_id || 0,
    driver_id: schedule?.driver_id || 0,
    trip_type: schedule?.trip_type || 'pickup' as 'pickup' | 'dropoff',
    schedule_date: schedule?.schedule_date ? schedule.schedule_date.split('T')[0] : '',
    start_time: schedule?.start_time || '',
    end_time: schedule?.end_time || '',
    notes: schedule?.notes || ''
  });

  // Dropdown data
  const [routes, setRoutes] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  // Load routes, buses, drivers on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [routesRes, busesRes, driversRes] = await Promise.all([
          routeService.getRoutes(1, 100),
          busService.getBuses(1, 100),
          driverService.getDrivers(1, 100)
        ]);
        setRoutes(routesRes.data || []);
        setBuses(busesRes.data || []);
        setDrivers(driversRes.data || []);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.route_id || formData.route_id === 0) {
      setError('Vui lòng chọn tuyến đường');
      return;
    }
    if (!formData.bus_id || formData.bus_id === 0) {
      setError('Vui lòng chọn xe buýt');
      return;
    }
    if (!formData.driver_id || formData.driver_id === 0) {
      setError('Vui lòng chọn tài xế');
      return;
    }
    if (!formData.schedule_date) {
      setError('Vui lòng chọn ngày');
      return;
    }
    if (!formData.start_time) {
      setError('Vui lòng chọn giờ bắt đầu');
      return;
    }

    setLoading(true);

    try {
      if (isEditMode) {
        // Update schedule
        await scheduleService.updateSchedule(schedule.schedule_id, {
          route_id: Number(formData.route_id),
          bus_id: Number(formData.bus_id),
          driver_id: Number(formData.driver_id),
          trip_type: formData.trip_type,
          schedule_date: formData.schedule_date,
          start_time: formData.start_time,
          end_time: formData.end_time || undefined,
          notes: formData.notes || undefined
        });
      } else {
        // Create new schedule
        await scheduleService.createSchedule({
          route_id: Number(formData.route_id),
          bus_id: Number(formData.bus_id),
          driver_id: Number(formData.driver_id),
          trip_type: formData.trip_type,
          schedule_date: formData.schedule_date,
          start_time: formData.start_time,
          end_time: formData.end_time || undefined,
          notes: formData.notes || undefined
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
      console.error('Error saving schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Route */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tuyến đường <span className="text-red-500">*</span>
        </label>
        <select
          name="route_id"
          value={formData.route_id}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
          required
        >
          <option value={0}>Chọn tuyến đường</option>
          {routes.map((route) => (
            <option key={route.route_id} value={route.route_id}>
              {route.route_name}
            </option>
          ))}
        </select>
      </div>

      {/* Bus */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Xe buýt <span className="text-red-500">*</span>
        </label>
        <select
          name="bus_id"
          value={formData.bus_id}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
          required
        >
          <option value={0}>Chọn xe buýt</option>
          {buses.map((bus) => (
            <option key={bus.bus_id} value={bus.bus_id}>
              {bus.bus_number} - {bus.license_plate} (Sức chứa: {bus.capacity})
            </option>
          ))}
        </select>
      </div>

      {/* Driver */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tài xế <span className="text-red-500">*</span>
        </label>
        <select
          name="driver_id"
          value={formData.driver_id}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
          required
        >
          <option value={0}>Chọn tài xế</option>
          {drivers.map((driver) => (
            <option key={driver.driver_id} value={driver.driver_id}>
              {driver.full_name} - {driver.phone}
            </option>
          ))}
        </select>
      </div>

      {/* Schedule Type & Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loại lịch trình <span className="text-red-500">*</span>
          </label>
          <select
            name="trip_type"
            value={formData.trip_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
            required
          >
            <option value="pickup">Đón</option>
            <option value="dropoff">Trả</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="schedule_date"
            value={formData.schedule_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
            required
          />
        </div>
      </div>

      {/* Start Time & End Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giờ bắt đầu <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giờ kết thúc dự kiến
          </label>
          <input
            type="time"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ghi chú
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Ghi chú về lịch trình..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
        >
          {loading ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Tạo mới'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
