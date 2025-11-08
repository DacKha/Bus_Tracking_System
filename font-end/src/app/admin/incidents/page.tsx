'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useSocket } from '@/context/SocketContext';
import { AlertTriangle, CheckCircle, Clock, XCircle, Filter, TrendingUp } from 'lucide-react';

interface Incident {
  incident_id: number;
  schedule_id: number;
  incident_type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  resolved_at?: string;
  route_name?: string;
  bus_number?: string;
  schedule_date?: string;
  reporter_name?: string;
  resolver_name?: string;
  resolution_notes?: string;
}

interface Stats {
  total: number;
  reported: number;
  in_progress: number;
  resolved: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export default function AdminIncidentsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <IncidentsContent />
    </ProtectedRoute>
  );
}

function IncidentsContent() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', severity: '' });
  const { onIncidentAlert } = useSocket();

  useEffect(() => {
    fetchIncidents();
    fetchStats();

    const cleanup = onIncidentAlert((data) => {
      console.log('New incident:', data);
      fetchIncidents();
      fetchStats();
    });

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [onIncidentAlert, filter]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.severity) params.append('severity', filter.severity);

      const response = await fetch(`http://localhost:5000/api/incidents?${params}`, {
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

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/incidents/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleResolve = async () => {
    if (!selectedIncident || !resolutionNotes.trim()) {
      alert('Vui lòng nhập ghi chú giải quyết');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/incidents/${selectedIncident.incident_id}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resolution_notes: resolutionNotes })
      });

      if (response.ok) {
        alert('Đã giải quyết sự cố thành công!');
        setShowResolveModal(false);
        setSelectedIncident(null);
        setResolutionNotes('');
        fetchIncidents();
        fetchStats();
      }
    } catch (error) {
      console.error('Error resolving incident:', error);
      alert('Có lỗi khi giải quyết sự cố');
    }
  };

  const updateStatus = async (incidentId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/incidents/${incidentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchIncidents();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating status:', error);
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý sự cố</h1>
          <p className="text-gray-600">Theo dõi và xử lý các sự cố trong hệ thống</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng sự cố</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <TrendingUp size={32} className="text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Chờ xử lý</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.reported}</p>
                </div>
                <Clock size={32} className="text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Nghiêm trọng</p>
                  <p className="text-2xl font-bold text-red-700">{stats.critical + stats.high}</p>
                </div>
                <AlertTriangle size={32} className="text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Đã giải quyết</p>
                  <p className="text-2xl font-bold text-green-700">{stats.resolved}</p>
                </div>
                <CheckCircle size={32} className="text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter size={20} className="text-gray-600" />
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="reported">Đã báo cáo</option>
              <option value="in_progress">Đang xử lý</option>
              <option value="resolved">Đã giải quyết</option>
            </select>

            <select
              value={filter.severity}
              onChange={(e) => setFilter(prev => ({ ...prev, severity: e.target.value }))}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">Tất cả mức độ</option>
              <option value="critical">Nghiêm trọng</option>
              <option value="high">Cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>

            <button
              onClick={() => setFilter({ status: '', severity: '' })}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Incidents List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto" />
            </div>
          ) : incidents.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <AlertTriangle size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-semibold">Không có sự cố nào</p>
            </div>
          ) : (
            <div className="divide-y">
              {incidents.map((incident) => (
                <div key={incident.incident_id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                        {getSeverityBadge(incident.severity)}
                        {getStatusBadge(incident.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span>📅 {new Date(incident.created_at).toLocaleString('vi-VN')}</span>
                        {incident.route_name && <span>📍 {incident.route_name}</span>}
                        {incident.bus_number && <span>🚌 Xe {incident.bus_number}</span>}
                        {incident.reporter_name && <span>👤 {incident.reporter_name}</span>}
                      </div>

                      {incident.resolution_notes && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                          <p className="font-semibold text-green-900">Giải pháp:</p>
                          <p className="text-green-800">{incident.resolution_notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      {incident.status === 'reported' && (
                        <>
                          <button
                            onClick={() => updateStatus(incident.incident_id, 'in_progress')}
                            className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                          >
                            Bắt đầu xử lý
                          </button>
                          <button
                            onClick={() => {
                              setSelectedIncident(incident);
                              setShowResolveModal(true);
                            }}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Giải quyết
                          </button>
                        </>
                      )}
                      {incident.status === 'in_progress' && (
                        <button
                          onClick={() => {
                            setSelectedIncident(incident);
                            setShowResolveModal(true);
                          }}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Giải quyết
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resolve Modal */}
        {showResolveModal && selectedIncident && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Giải quyết sự cố</h3>
              <p className="text-gray-700 mb-4"><strong>{selectedIncident.title}</strong></p>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú giải quyết <span className="text-red-500">*</span>
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Mô tả cách giải quyết sự cố..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 resize-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowResolveModal(false);
                    setSelectedIncident(null);
                    setResolutionNotes('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleResolve}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Xác nhận giải quyết
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
