/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LoadingOverlay } from '@/components/Loading';
import { incidentService } from '@/lib/incidentService';
import {
  AlertTriangle,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  MapPin,
  Users,
  MessageSquare,
  Image as ImageIcon,
  X,
  RefreshCw,
} from 'lucide-react';
import Modal from '@/components/Modal';

interface Incident {
  incident_id: number;
  schedule_id: number;
  bus_number: string;
  student_name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'scheduled' | 'in_progress' | 'resolved';
  created_at: string;
  resolved_at?: string;
}

interface Schedule {
  schedule_id: number;
  bus_number: string;
  route_name: string;
  driver_name: string;
  driver_phone: string;
  status: string;
}

export default function IncidentPage() {
  return (
    <ProtectedRoute allowedRoles={['parent']}>
      <IncidentContent />
    </ProtectedRoute>
  );
}

function IncidentContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'report' | 'history'>('report');

  // Form states
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // History states
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Load schedules on mount
  useEffect(() => {
    loadSchedules();
    loadIncidents();
  }, []);

  const loadSchedules = async () => {
    try {
      setSchedules([]);
    } catch (error) {
      console.error('Error loading schedules:', error);
      setSchedules([]);
    }
  };

  const loadIncidents = async () => {
    try {
      setIncidents([]);
    } catch (error) {
      console.error('Error loading incidents:', error);
      setIncidents([]);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos([...photos, ...newFiles]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmitIncident = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSchedule || !description.trim()) {
      alert('Vui lòng chọn chuyến xe và nhập mô tả sự cố');
      return;
    }

    setSubmitting(true);
    try {
      await incidentService.reportIncident({
        schedule_id: selectedSchedule.schedule_id,
        incident_type: 'other',
        title: `Sự cố ${severity}`,
        description,
        severity,
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setDescription('');
        setPhotos([]);
        setSeverity('medium');
        loadIncidents();
      }, 2000);
    } catch (error) {
      console.error('Error submitting incident:', error);
      alert('Gửi yêu cầu thất bại. Vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'Rất Nghiêm Trọng';
      case 'high':
        return 'Nghiêm Trọng';
      case 'medium':
        return 'Trung Bình';
      case 'low':
        return 'Nhẹ';
      default:
        return severity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'Đã Giải Quyết';
      case 'in_progress':
        return 'Đang Xử Lý';
      case 'pending':
        return 'Chờ Xử Lý';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle size={32} />
            <div>
              <h1 className="text-2xl font-bold">Báo Cáo Sự Cố</h1>
              <p className="text-red-100 mt-1">Thông báo nhanh về sự cố xảy ra với xe hoặc con bạn</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'report'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Gửi Báo Cáo Sự Cố
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Lịch Sử Báo Cáo ({incidents.length})
          </button>
        </div>

        {/* Report Tab */}
        {activeTab === 'report' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {submitSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-green-900">Gửi báo cáo thành công!</p>
                  <p className="text-sm text-green-700 mt-1">
                    Chúng tôi sẽ xử lý ngay và thông báo cho bạn
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitIncident} className="space-y-6">
              {/* Select Schedule */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Chọn Chuyến Xe
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {schedules.map((schedule) => (
                    <button
                      key={schedule.schedule_id}
                      type="button"
                      onClick={() => setSelectedSchedule(schedule)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedSchedule?.schedule_id === schedule.schedule_id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-red-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold text-gray-900">{schedule.bus_number}</span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            schedule.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-700'
                              : schedule.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {schedule.status === 'in_progress'
                            ? 'Đang chuyển động'
                            : schedule.status === 'completed'
                            ? 'Hoàn thành'
                            : 'Chờ khởi hành'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{schedule.route_name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone size={14} />
                        <span>{schedule.driver_phone}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Schedule Details */}
              {selectedSchedule && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-blue-600 font-semibold mb-1">Tài Xế</p>
                      <p className="text-sm font-medium text-gray-900">{selectedSchedule.driver_name}</p>
                      <p className="text-sm text-gray-600">{selectedSchedule.driver_phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-semibold mb-1">Tuyến Đường</p>
                      <p className="text-sm font-medium text-gray-900">{selectedSchedule.route_name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Severity Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Mức Độ Nghiêm Trọng
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['low', 'medium', 'high', 'critical'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSeverity(level as any)}
                      className={`p-3 rounded-lg border-2 transition-all font-medium text-sm ${
                        severity === level
                          ? `${getSeverityColor(level)} border-current`
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {getSeverityLabel(level)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Mô Tả Chi Tiết Sự Cố
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Vui lòng mô tả chi tiết sự cố: nơi xảy ra, những gì đã xảy ra, ai liên quan, v.v."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {description.length}/500 ký tự
                </p>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Đính Kèm Ảnh (Tùy Chọn)
                </label>

                {/* Photo Preview */}
                {photos.length > 0 && (
                  <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${index}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Input */}
                <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer">
                  <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm font-medium text-gray-700">Nhấn để chọn ảnh</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Hỗ trợ JPG, PNG (Tối đa 5MB mỗi file)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
                {photos.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Đã chọn {photos.length} ảnh
                  </p>
                )}
              </div>

              {/* Emergency Contact Info */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-semibold text-amber-900 mb-2">
                  Trường Hợp Khẩn Cấp:
                </p>
                <div className="space-y-1 text-sm text-amber-800">
                  <p>Gọi ngay cho tài xế hoặc liên hệ trung tâm điều phối xe</p>
                  <p className="font-semibold">Trung Tâm: 1900-1234 (24/7)</p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !selectedSchedule}
                className={`w-full px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                  submitting || !selectedSchedule
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Gửi Báo Cáo Sự Cố
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {incidents.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Chưa có báo cáo sự cố
                </h3>
                <p className="text-gray-600">
                  Bạn sẽ thấy lịch sử báo cáo của mình ở đây
                </p>
              </div>
            ) : (
              incidents.map((incident) => (
                <div
                  key={incident.incident_id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900">
                          {incident.bus_number} - {incident.student_name}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                            incident.severity
                          )}`}
                        >
                          {getSeverityLabel(incident.severity)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {incident.description}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                        incident.status
                      )}`}
                    >
                      {getStatusLabel(incident.status)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <span>
                        {new Date(incident.created_at).toLocaleDateString('vi-VN')} {' '}
                        {new Date(incident.created_at).toLocaleTimeString('vi-VN')}
                      </span>
                    </div>

                    {incident.resolved_at && (
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-600" />
                        <span>
                          Giải quyết:{' '}
                          {new Date(incident.resolved_at).toLocaleTimeString('vi-VN')}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setSelectedIncident(incident);
                        setShowDetailModal(true);
                      }}
                      className="text-red-600 hover:text-red-700 font-medium ml-auto"
                    >
                      Chi Tiết →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Chi Tiết Báo Cáo Sự Cố"
        size="md"
      >
        {selectedIncident && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-600 font-semibold mb-1">XE BUS</p>
              <p className="text-lg font-semibold text-gray-900">
                {selectedIncident.bus_number}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600 font-semibold mb-1">HỌC SINH</p>
              <p className="text-lg font-semibold text-gray-900">
                {selectedIncident.student_name}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600 font-semibold mb-1">MỨC ĐỘ NGHIÊM TRỌNG</p>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border inline-block ${getSeverityColor(
                  selectedIncident.severity
                )}`}
              >
                {getSeverityLabel(selectedIncident.severity)}
              </span>
            </div>

            <div>
              <p className="text-xs text-gray-600 font-semibold mb-1">TRẠNG THÁI</p>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${getStatusColor(
                  selectedIncident.status
                )}`}
              >
                {getStatusLabel(selectedIncident.status)}
              </span>
            </div>

            <div>
              <p className="text-xs text-gray-600 font-semibold mb-1">MÔ TẢ</p>
              <p className="text-gray-900">{selectedIncident.description}</p>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={14} className="text-gray-400" />
                <span>
                  Báo cáo:{' '}
                  {new Date(selectedIncident.created_at).toLocaleDateString('vi-VN')} {' '}
                  {new Date(selectedIncident.created_at).toLocaleTimeString('vi-VN')}
                </span>
              </div>

              {selectedIncident.resolved_at && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle size={14} />
                  <span>
                    Giải quyết:{' '}
                    {new Date(selectedIncident.resolved_at).toLocaleDateString('vi-VN')} {' '}
                    {new Date(selectedIncident.resolved_at).toLocaleTimeString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
