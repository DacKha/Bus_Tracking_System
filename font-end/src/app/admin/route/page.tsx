/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { Map, Search, Plus, Eye, Edit, Trash2, X, MapPin } from 'lucide-react';
import { routeService } from '@/lib/routeService';

// Interface
interface RouteStop {
  stop_order: number;
  stop_name: string;
  stop_address: string;
  arrival_time?: string;
}

interface Route {
  route_id: number;
  route_name: string;
  description: string;
  distance_km: number;
  estimated_duration_minutes: number;
  status: 'active' | 'inactive';
  stops: RouteStop[];
  created_at: string;
}

export default function RoutesPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <RoutesContent />
    </ProtectedRoute>
  );
}

function RoutesContent() {
  const { user, token } = useAuth();
  
  // State
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Route>>({
    route_name: '',
    description: '',
    distance_km: 0,
    estimated_duration_minutes: 0,
    status: 'active',
    stops: [],
  });

  // Load routes
  const loadRoutes = async () => {
    if (!token || !user) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await routeService.getRoutes(1, 100);
      const routesList = response?.data ?? [];
      const routesWithStops = routesList.map((route: any) => ({
        ...route,
        stops: Array.isArray(route?.stops) ? route.stops : []
      }));
      setRoutes(routesWithStops);
      setFilteredRoutes(routesWithStops);
    } catch (error: any) {
      console.error('Lỗi tải danh sách tuyến đường:', error);
      setRoutes([]);
      setFilteredRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  // Load on mount - only when user and token are available
  useEffect(() => {
    if (user && token) {
      loadRoutes();
    }
  }, [token]);

  // Filter routes
  useEffect(() => {
    let result = [...routes];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(route =>
        route.route_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(route => route.status === filterStatus);
    }

    setFilteredRoutes(result);
  }, [routes, searchQuery, filterStatus]);

  // Handle create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await routeService.createRoute(formData as any);
      setShowCreateModal(false);
      resetForm();
      alert('Tạo tuyến đường thành công!');
      loadRoutes();
    } catch (err: any) {
      console.error('Lỗi tạo tuyến đường:', err.message);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle edit
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute) return;

    try {
      await routeService.updateRoute(selectedRoute.route_id, formData as any);
      setShowEditModal(false);
      setSelectedRoute(null);
      resetForm();
      alert('Cập nhật tuyến đường thành công!');
      loadRoutes();
    } catch (err: any) {
      console.error('Lỗi cập nhật tuyến đường:', err.message);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedRoute) return;

    try {
      await routeService.deleteRoute(selectedRoute.route_id);
      setShowDeleteModal(false);
      setSelectedRoute(null);
      alert('Xóa tuyến đường thành công!');
      loadRoutes();
    } catch (err: any) {
      console.error('Lỗi xóa tuyến đường:', err.message);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Toggle status
  const handleToggleStatus = async (route: Route) => {
    try {
      const newStatus = route.status === 'active' ? 'inactive' : 'active';
      await routeService.updateRoute(route.route_id, { status: newStatus });

      setRoutes(routes.map(r =>
        r.route_id === route.route_id ? { ...r, status: newStatus } : r
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

  const openEditModal = (route: Route) => {
    setSelectedRoute(route);
    setFormData(route);
    setShowEditModal(true);
  };

  const openDetailModal = (route: Route) => {
    setSelectedRoute(route);
    setShowDetailModal(true);
  };

  const openDeleteModal = (route: Route) => {
    setSelectedRoute(route);
    setShowDeleteModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      route_name: '',
      description: '',
      distance_km: 0,
      estimated_duration_minutes: 0,
      status: 'active',
      stops: [],
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách tuyến đường...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý tuyến đường</h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">Quản lý tuyến đường và điểm dừng</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 justify-center transition-colors"
        >
          <Plus size={20} />
          <span>Thêm tuyến đường</span>
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
              placeholder="Tìm kiếm theo tên tuyến..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>

        {/* Stats */}
        <div className="mt-4 text-sm text-gray-600">
          Hiển thị <span className="font-semibold text-gray-900">{filteredRoutes.length}</span> / {routes.length} tuyến đường
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tên tuyến</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Mô tả</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Khoảng cách</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Thời gian</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Điểm dừng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRoutes.map((route) => (
                <tr key={route.route_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Map size={16} className="text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{route.route_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{route.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{route.distance_km} km</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{route.estimated_duration_minutes} phút</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{route.stops.length} điểm</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(route)}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        route.status === 'active'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {route.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openDetailModal(route)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openEditModal(route)}
                        className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(route)}
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

        {filteredRoutes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Map size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Không tìm thấy tuyến đường nào</p>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredRoutes.map((route) => (
          <div key={route.route_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Map size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{route.route_name}</div>
                  <div className="text-sm text-gray-500">{route.stops.length} điểm dừng</div>
                </div>
              </div>
              <button
                onClick={() => handleToggleStatus(route)}
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  route.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {route.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
              </button>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <p className="text-gray-700">{route.description}</p>
              <div className="flex justify-between">
                <span className="text-gray-600">Khoảng cách:</span>
                <span className="font-medium text-gray-900">{route.distance_km} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thời gian:</span>
                <span className="text-gray-900">{route.estimated_duration_minutes} phút</span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-200">
              <button
                onClick={() => openDetailModal(route)}
                className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors"
              >
                <Eye size={16} />
                <span className="text-sm font-medium">Chi tiết</span>
              </button>
              <button
                onClick={() => openEditModal(route)}
                className="flex-1 px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 flex items-center justify-center gap-2 transition-colors"
              >
                <Edit size={16} />
                <span className="text-sm font-medium">Sửa</span>
              </button>
              <button
                onClick={() => openDeleteModal(route)}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {filteredRoutes.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Map size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Không tìm thấy tuyến đường nào</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal - Simplified for now, stops management can be added later */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {showCreateModal ? 'Thêm tuyến đường mới' : 'Chỉnh sửa tuyến đường'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedRoute(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={showCreateModal ? handleCreate : handleEdit} className="p-6 space-y-4">
              {/* Route Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên tuyến <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.route_name}
                  onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
                  placeholder="Tuyến A - Quận 1 - Quận 3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả ngắn về tuyến đường"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Distance */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Khoảng cách (km) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.distance_km}
                    onChange={(e) => setFormData({ ...formData, distance_km: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Thời gian (phút) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.estimated_duration_minutes}
                    onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                <p>Lưu ý: Quản lý điểm dừng sẽ được thêm sau khi tạo tuyến đường.</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors"
                >
                  {showCreateModal ? 'Thêm tuyến đường' : 'Cập nhật'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedRoute(null);
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
      {showDetailModal && selectedRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Chi tiết tuyến đường</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedRoute(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <Map size={32} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedRoute.route_name}</h3>
                  <p className="text-gray-600">{selectedRoute.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Khoảng cách</div>
                  <div className="font-medium text-gray-900">{selectedRoute.distance_km} km</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Thời gian dự kiến</div>
                  <div className="font-medium text-gray-900">{selectedRoute.estimated_duration_minutes} phút</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Số điểm dừng</div>
                  <div className="font-medium text-gray-900">{selectedRoute.stops.length} điểm</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Trạng thái</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedRoute.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedRoute.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-blue-600" />
                  Điểm dừng trên tuyến
                </h4>
                <div className="space-y-3">
                  {selectedRoute.stops.map((stop) => (
                    <div key={stop.stop_order} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">{stop.stop_order}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{stop.stop_name}</div>
                        <div className="text-sm text-gray-600">{stop.stop_address}</div>
                        {stop.arrival_time && (
                          <div className="text-xs text-gray-500 mt-1">Giờ đến: {stop.arrival_time}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="text-sm text-gray-600">Ngày tạo: {selectedRoute.created_at}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Xác nhận xóa</h2>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Bạn có chắc chắn muốn xóa tuyến đường <strong>{selectedRoute.route_name}</strong>?
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
                  setSelectedRoute(null);
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
