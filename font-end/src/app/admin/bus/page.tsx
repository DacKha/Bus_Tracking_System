/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { Bus as BusIcon, Search, Plus, Eye, Edit, Trash2, X, Wrench } from 'lucide-react';
import { busService } from '@/lib/busService';

// Interface
interface Bus {
  bus_id: number;
  bus_number: string;
  license_plate: string;
  capacity: number;
  model: string;
  year: number;
  status: 'active' | 'maintenance' | 'inactive';
  last_maintenance: string;
  created_at: string;
}

export default function BusesPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <BusesContent />
    </ProtectedRoute>
  );
}

function BusesContent() {
  const { user, token } = useAuth();
  
  // State
  const [buses, setBuses] = useState<Bus[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'maintenance' | 'inactive'>('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Bus>>({
    bus_number: '',
    license_plate: '',
    capacity: 30,
    model: '',
    year: new Date().getFullYear(),
    status: 'active',
    last_maintenance: new Date().toISOString().split('T')[0],
  });

  // Load buses
  const loadBuses = async () => {
    if (!token || !user) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await busService.getBuses(1, 100);
      const busesList = response?.data ?? [];
      setBuses(busesList as any);
      setFilteredBuses(busesList as any);
    } catch (error: any) {
      console.error('Lỗi tải danh sách xe buýt:', error);
      setBuses([]);
      setFilteredBuses([]);
    } finally {
      setLoading(false);
    }
  };

  // Load on mount - only when user and token are available
  useEffect(() => {
    if (user && token) {
      loadBuses();
    }
  }, [token]);

  // Filter buses
  useEffect(() => {
    let result = [...buses];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(bus =>
        bus.bus_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bus.license_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bus.model.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(bus => bus.status === filterStatus);
    }

    setFilteredBuses(result);
  }, [buses, searchQuery, filterStatus]);

  // Handle create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await busService.createBus(formData as any);
      setShowCreateModal(false);
      resetForm();
      alert('Tạo xe buýt thành công!');
      loadBuses();
    } catch (err: any) {
      console.error('Lỗi tạo xe buýt:', err.message);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle edit
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBus) return;

    try {
      await busService.updateBus(selectedBus.bus_id, formData);
      setShowEditModal(false);
      setSelectedBus(null);
      resetForm();
      alert('Cập nhật xe buýt thành công!');
      loadBuses();
    } catch (err: any) {
      console.error('Lỗi cập nhật xe buýt:', err.message);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedBus) return;

    try {
      await busService.deleteBus(selectedBus.bus_id);
      setShowDeleteModal(false);
      setSelectedBus(null);
      alert('Xóa xe buýt thành công!');
      loadBuses();
    } catch (err: any) {
      console.error('Lỗi xóa xe buýt:', err.message);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Toggle status
  const handleToggleStatus = async (bus: Bus) => {
    try {
      const statusCycle: Record<string, 'active' | 'maintenance' | 'inactive'> = {
        'active': 'maintenance',
        'maintenance': 'inactive',
        'inactive': 'active',
      };

      const newStatus = statusCycle[bus.status];
      await busService.updateBus(bus.bus_id, { status: newStatus });

      setBuses(buses.map(b =>
        b.bus_id === bus.bus_id ? { ...b, status: newStatus } : b
      ));
    } catch (err: any) {
      console.error('Lỗi cập nhật trạng thái:', err.message);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Open modals
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (bus: Bus) => {
    setSelectedBus(bus);
    setFormData(bus);
    setShowEditModal(true);
  };

  const openDetailModal = (bus: Bus) => {
    setSelectedBus(bus);
    setShowDetailModal(true);
  };

  const openDeleteModal = (bus: Bus) => {
    setSelectedBus(bus);
    setShowDeleteModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      bus_number: '',
      license_plate: '',
      capacity: 30,
      model: '',
      year: new Date().getFullYear(),
      status: 'active',
      last_maintenance: new Date().toISOString().split('T')[0],
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách xe buýt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý xe buýt</h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">Quản lý thông tin xe buýt và lịch bảo trì</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2 justify-center transition-colors"
        >
          <Plus size={20} />
          <span>Thêm xe buýt</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo số xe, biển số..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="maintenance">Bảo trì</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>

        {/* Stats */}
        <div className="mt-4 text-sm text-gray-600">
          Hiển thị <span className="font-semibold text-gray-900">{filteredBuses.length}</span> / {buses.length} xe buýt
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Số xe</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Biển số</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Model</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Sức chứa</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Năm SX</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bảo trì gần nhất</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBuses.map((bus) => (
                <tr key={bus.bus_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <BusIcon size={16} className="text-purple-600" />
                      </div>
                      <span className="font-medium text-gray-900">{bus.bus_number}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{bus.license_plate}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{bus.model}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{bus.capacity} chỗ</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{bus.year}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{bus.last_maintenance}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(bus)}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        bus.status === 'active'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : bus.status === 'maintenance'
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {bus.status === 'active' ? 'Hoạt động' : bus.status === 'maintenance' ? 'Bảo trì' : 'Không hoạt động'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openDetailModal(bus)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openEditModal(bus)}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(bus)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBuses.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <BusIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Không tìm thấy xe buýt nào</p>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredBuses.map((bus) => (
          <div key={bus.bus_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <BusIcon size={20} className="text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{bus.bus_number}</div>
                  <div className="text-sm text-gray-500">{bus.license_plate}</div>
                </div>
              </div>
              <button
                onClick={() => handleToggleStatus(bus)}
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  bus.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : bus.status === 'maintenance'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {bus.status === 'active' ? 'Hoạt động' : bus.status === 'maintenance' ? 'Bảo trì' : 'Không hoạt động'}
              </button>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Model:</span>
                <span className="font-medium text-gray-900">{bus.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sức chứa:</span>
                <span className="text-gray-900">{bus.capacity} chỗ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Năm SX:</span>
                <span className="text-gray-900">{bus.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bảo trì gần nhất:</span>
                <span className="text-gray-900">{bus.last_maintenance}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-200">
              <button
                onClick={() => openDetailModal(bus)}
                className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors"
              >
                <Eye size={16} />
                <span className="text-sm font-medium">Chi tiết</span>
              </button>
              <button
                onClick={() => openEditModal(bus)}
                className="flex-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 flex items-center justify-center gap-2 transition-colors"
              >
                <Edit size={16} />
                <span className="text-sm font-medium">Sửa</span>
              </button>
              <button
                onClick={() => openDeleteModal(bus)}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {filteredBuses.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <BusIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Không tìm thấy xe buýt nào</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {showCreateModal ? 'Thêm xe buýt mới' : 'Chỉnh sửa xe buýt'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedBus(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={showCreateModal ? handleCreate : handleEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bus Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số xe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bus_number}
                    onChange={(e) => setFormData({ ...formData, bus_number: e.target.value })}
                    placeholder="BUS-001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* License Plate */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Biển số <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.license_plate}
                    onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                    placeholder="51B-12345"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Hyundai County"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Năm sản xuất <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    min="2000"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sức chứa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    min="10"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* Last Maintenance */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bảo trì gần nhất <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.last_maintenance}
                    onChange={(e) => setFormData({ ...formData, last_maintenance: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="active">Hoạt động</option>
                    <option value="maintenance">Bảo trì</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold transition-colors"
                >
                  {showCreateModal ? 'Thêm xe buýt' : 'Cập nhật'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedBus(null);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Chi tiết xe buýt</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedBus(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center">
                  <BusIcon size={32} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedBus.bus_number}</h3>
                  <p className="text-gray-600 font-mono">{selectedBus.license_plate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Model</div>
                  <div className="font-medium text-gray-900">{selectedBus.model}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Năm sản xuất</div>
                  <div className="font-medium text-gray-900">{selectedBus.year}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Sức chứa</div>
                  <div className="font-medium text-gray-900">{selectedBus.capacity} chỗ</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Trạng thái</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedBus.status === 'active' ? 'bg-green-100 text-green-700' :
                    selectedBus.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedBus.status === 'active' ? 'Hoạt động' :
                     selectedBus.status === 'maintenance' ? 'Bảo trì' : 'Không hoạt động'}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Thông tin bảo trì</h4>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Bảo trì gần nhất</div>
                  <div className="font-medium text-gray-900">{selectedBus.last_maintenance}</div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="text-sm text-gray-600">Ngày tạo: {selectedBus.created_at}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Xác nhận xóa</h2>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Bạn có chắc chắn muốn xóa xe buýt <strong>{selectedBus.bus_number}</strong> ({selectedBus.license_plate})?
              </p>
              <p className="text-sm text-red-600">
                Hành động này không thể hoàn tác!
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex gap-3 rounded-b-lg">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
              >
                Xóa
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedBus(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
