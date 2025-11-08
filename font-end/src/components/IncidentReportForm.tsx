'use client';

import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface IncidentReportFormProps {
  scheduleId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const INCIDENT_TYPES = [
  { value: 'mechanical', label: 'Sự cố cơ học' },
  { value: 'traffic', label: 'Sự cố giao thông' },
  { value: 'student_behavior', label: 'Hành vi học sinh' },
  { value: 'safety', label: 'An toàn' },
  { value: 'medical', label: 'Y tế' },
  { value: 'weather', label: 'Thời tiết' },
  { value: 'other', label: 'Khác' }
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Thấp', color: 'text-green-700 bg-green-100' },
  { value: 'medium', label: 'Trung bình', color: 'text-yellow-700 bg-yellow-100' },
  { value: 'high', label: 'Cao', color: 'text-orange-700 bg-orange-100' },
  { value: 'critical', label: 'Nghiêm trọng', color: 'text-red-700 bg-red-100' }
];

const IncidentReportForm: React.FC<IncidentReportFormProps> = ({ scheduleId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    incident_type: '',
    title: '',
    description: '',
    severity: 'medium',
    latitude: null as number | null,
    longitude: null as number | null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ GPS');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setGettingLocation(false);
      },
      (err) => {
        setError('Không thể lấy vị trí GPS: ' + err.message);
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.incident_type || !formData.title || !formData.description) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          schedule_id: scheduleId,
          ...formData
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Đã báo cáo sự cố thành công! Admin sẽ xử lý sớm nhất.');
        onSuccess && onSuccess();
      } else {
        const data = await response.json();
        setError(data.message || 'Không thể báo cáo sự cố');
      }
    } catch (err) {
      console.error('Error reporting incident:', err);
      setError('Có lỗi xảy ra khi báo cáo sự cố');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-red-600" size={28} />
          <h2 className="text-2xl font-bold text-gray-900">Báo cáo sự cố</h2>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Incident Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại sự cố <span className="text-red-500">*</span>
          </label>
          <select
            name="incident_type"
            value={formData.incident_type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
            required
          >
            <option value="">-- Chọn loại sự cố --</option>
            {INCIDENT_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mức độ nghiêm trọng <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SEVERITY_LEVELS.map(level => (
              <button
                key={level.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, severity: level.value }))}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  formData.severity === level.value
                    ? level.color + ' border-2 border-current'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ví dụ: Xe hỏng động cơ"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả chi tiết <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Mô tả chi tiết về sự cố..."
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-gray-900"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vị trí GPS</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={getLocation}
              disabled={gettingLocation}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {gettingLocation ? 'Đang lấy vị trí...' : 'Lấy vị trí hiện tại'}
            </button>
            {formData.latitude && formData.longitude && (
              <span className="text-sm text-green-700 flex items-center">
                ✓ Đã có vị trí GPS
              </span>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Hủy
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Đang gửi...' : 'Báo cáo sự cố'}
          </button>
        </div>
      </form>

      {/* Info */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        <p><strong>Lưu ý:</strong> Admin sẽ nhận được thông báo ngay lập tức về sự cố của bạn. Trong trường hợp khẩn cấp, hãy gọi số điện thoại hotline.</p>
      </div>
    </div>
  );
};

export default IncidentReportForm;
