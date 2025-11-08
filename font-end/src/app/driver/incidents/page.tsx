'use client';

import React, { useState, useEffect } from 'react';
import IncidentReportForm from '@/components/IncidentReportForm';
import { useSocket } from '@/context/SocketContext';
import { AlertTriangle, Plus, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';

interface Incident {
  incident_id: number;
  schedule_id: number;
  incident_type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  route_name?: string;
  bus_number?: string;
  schedule_date?: string;
}

interface Schedule {
  schedule_id: number;
  route_name: string;
  bus_number: string;
  status: string;
}

const DriverIncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { onIncidentAlert } = useSocket();

  useEffect(() => {
    fetchIncidents();
    fetchTodaySchedules();

    const cleanup = onIncidentAlert((data) => {
      console.log('New incident alert:', data);
      fetchIncidents();
    });

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [onIncidentAlert]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/incidents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setIncidents(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaySchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`http://localhost:5000/api/schedules?date=${today}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSchedules(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const config = {
      low: { label: 'Thấp', color: 'bg-green-100 text-green-700' },
      medium: { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-700' },
      high: { label: 'Cao', color: 'bg-orange-100 text-orange-700' },
      critical: { label: 'Nghiêm trọng', color: 'bg-red-100 text-red-700' }
    };
    const cfg = config[severity as keyof typeof config] || config.medium;
    return <span className={`px-2 py-1 rounded text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      reported: { label: 'Đã báo cáo', icon: <Clock size={14} />, color: 'bg-blue-100 text-blue-700' },
      in_progress: { label: 'Đang xử lý', icon: <AlertTriangle size={14} />, color: 'bg-yellow-100 text-yellow-700' },
      resolved: { label: 'Đã giải quyết', icon: <CheckCircle size={14} />, color: 'bg-green-100 text-green-700' },
      closed: { label: 'Đã đóng', icon: <XCircle size={14} />, color: 'bg-gray-100 text-gray-700' }
    };
    const cfg = config[status as keyof typeof config] || config.reported;
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${cfg.color}`}>
        {cfg.icon}
        {cfg.label}
      </span>
    );
  };

  const getIncidentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      mechanical: 'Sự cố cơ học',
      traffic: 'Giao thông',
      student_behavior: 'Hành vi học sinh',
      safety: 'An toàn',
      medical: 'Y tế',
      weather: 'Thời tiết',
      other: 'Khác'
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý sự cố</h1>
          <p className="text-gray-600">Báo cáo và theo dõi các sự cố trong chuyến đi</p>
        </div>

        {/* Report Button */}
        {!showReportForm && schedules.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowReportForm(true)}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center gap-2"
            >
              <Plus size={20} />
              Báo cáo sự cố mới
            </button>
          </div>
        )}

        {/* Report Form */}
        {showReportForm && (
          <div className="mb-6">
            {schedules.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <AlertTriangle size={48} className="mx-auto text-yellow-600 mb-3" />
                <p className="text-yellow-800 font-semibold">Không có lịch trình hôm nay</p>
                <p className="text-yellow-700 text-sm mt-1">Bạn cần có lịch trình để báo cáo sự cố</p>
                <button
                  onClick={() => setShowReportForm(false)}
                  className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn chuyến đi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSchedule || ''}
                    onChange={(e) => setSelectedSchedule(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">-- Chọn chuyến đi --</option>
                    {schedules.map(s => (
                      <option key={s.schedule_id} value={s.schedule_id}>
                        {s.route_name} - Xe {s.bus_number} ({s.status})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSchedule && (
                  <IncidentReportForm
                    scheduleId={selectedSchedule}
                    onSuccess={() => {
                      setShowReportForm(false);
                      setSelectedSchedule(null);
                      fetchIncidents();
                    }}
                    onCancel={() => {
                      setShowReportForm(false);
                      setSelectedSchedule(null);
                    }}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Incidents List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">Lịch sử sự cố</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto" />
            </div>
          ) : incidents.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <AlertTriangle size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-semibold">Chưa có sự cố nào được báo cáo</p>
              <p className="text-sm mt-1">Nhấn "Báo cáo sự cố mới" để tạo báo cáo</p>
            </div>
          ) : (
            <div className="divide-y">
              {incidents.map((incident) => (
                <div key={incident.incident_id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                        {getSeverityBadge(incident.severity)}
                        {getStatusBadge(incident.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(incident.created_at).toLocaleString('vi-VN')}
                        </span>
                        {incident.route_name && (
                          <span>📍 {incident.route_name}</span>
                        )}
                        {incident.bus_number && (
                          <span>🚌 Xe {incident.bus_number}</span>
                        )}
                        <span className="px-2 py-0.5 bg-gray-100 rounded">
                          {getIncidentTypeLabel(incident.incident_type)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverIncidentsPage;
