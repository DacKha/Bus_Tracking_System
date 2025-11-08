/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Eye, Edit, Trash2, Search, Filter, UserPlus, RefreshCw, Star } from 'lucide-react';
import { driverService } from '@/lib/driverService';

interface Driver {
  driver_id: number;
  email: string;
  full_name: string;
  phone: string;
  license_number: string;
  license_expiry: string;
  status: 'available' | 'on_trip' | 'off_duty';
  created_at: string;
}

export default function DriversPage() {
  const { user, token } = useAuth();
  
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'on_trip' | 'off_duty'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    password: '',
    license_number: '',
    license_expiry: '',
  });

  const loadDrivers = async () => {
    if (!token || !user) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await driverService.getDrivers(1, 100);
      const driversList = response?.data ?? [];
      setDrivers(driversList as any);
    } catch (error: any) {
      console.error('Lỗi tải danh sách tài xế:', error);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      loadDrivers();
    }
  }, [token]);

  const filteredDrivers = drivers.filter(driver => {
    const matchSearch = searchQuery === '' ||
      driver.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.phone.includes(searchQuery);

    const matchStatus = filterStatus === 'all' || driver.status === filterStatus;

    return matchSearch && matchStatus;
  });

  const handleCreate = () => {
    setFormData({
      email: '',
      full_name: '',
      phone: '',
      password: '',
      license_number: '',
      license_expiry: '',
    });
    setShowCreateModal(true);
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await driverService.createDriver({
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        password: formData.password,
        license_number: formData.license_number,
        license_expiry: formData.license_expiry,
      });

      setShowCreateModal(false);
      alert('Tạo tài xế thành công!');
      loadDrivers();
    } catch (err: any) {
      console.error('Lỗi tạo tài xế:', err.message);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (driver: Driver) => {
    setSelectedDriver(driver);
    setFormData({
      email: driver.email,
      full_name: driver.full_name,
      phone: driver.phone,
      password: '',
      license_number: driver.license_number,
      license_expiry: driver.license_expiry,
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;

    try {
      await driverService.updateDriver(selectedDriver.driver_id, {
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        license_number: formData.license_number,
        license_expiry: formData.license_expiry,
      } as any);

      setShowEditModal(false);
      alert('Cập nhật thành công!');
      loadDrivers();
    } catch (err: any) {
      console.error('Lỗi cập nhật tài xế:', err.message);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedDriver) return;

    try {
      await driverService.deleteDriver(selectedDriver.driver_id);
      setShowDeleteModal(false);
      alert('Xóa thành công!');
      loadDrivers();
    } catch (err: any) {
      console.error('Lỗi xóa tài xế:', err.message);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleStatus = async (driver: Driver) => {
    try {
      const statusCycle = { available: 'on_trip', on_trip: 'available', off_duty: 'available' } as const;
      const newStatus = statusCycle[driver.status];

      await driverService.updateStatus(driver.driver_id, newStatus);

      setDrivers(drivers.map(d =>
        d.driver_id === driver.driver_id
          ? { ...d, status: newStatus }
          : d
      ));
    } catch (err: any) {
      console.error('Lỗi cập nhật trạng thái:', err.message);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleViewDetail = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      available: { bg: 'bg-green-100', text: 'text-green-700', label: 'Sẵn sàng' },
      on_trip: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đang chạy' },
      off_duty: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Nghỉ việc' },
    };
    const badge = badges[status as keyof typeof badges];
    return { ...badge };
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý Tài xế</h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            Quản lý thông tin tài xế và trạng thái làm việc
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center transition-colors"
        >
          <UserPlus size={20} />
          <span>Thêm tài xế</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Sẵn sàng</option>
              <option value="on_trip">Đang chạy</option>
              <option value="off_duty">Nghỉ việc</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Tìm thấy <span className="font-semibold text-gray-900">{filteredDrivers.length}</span> tài xế
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy tài xế nào</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Họ tên</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Điện thoại</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Giấy phép</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDrivers.map((driver) => {
                    const statusBadge = getStatusBadge(driver.status);
                    return (
                      <tr key={driver.driver_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                          #{driver.driver_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{driver.full_name}</div>
                          <div className="text-xs text-gray-500">{driver.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {driver.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{driver.license_number}</div>
                          <div className="text-xs text-gray-500">HSD: {driver.license_expiry}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleStatus(driver)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${statusBadge.bg} ${statusBadge.text} hover:opacity-80`}
                          >
                            {statusBadge.label}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetail(driver)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Chi tiết"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleEdit(driver)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                              title="Sửa"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(driver)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Xóa"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-200">
              {filteredDrivers.map((driver) => {
                const statusBadge = getStatusBadge(driver.status);
                return (
                  <div key={driver.driver_id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{driver.full_name}</h3>
                        <p className="text-sm text-gray-600">{driver.email}</p>
                        <p className="text-sm text-gray-600">{driver.phone}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          GPLX: {driver.license_number} (HSD: {driver.license_expiry})
                        </p>
                      </div>
                      <span className="text-xs font-mono text-gray-500">#{driver.driver_id}</span>
                    </div>

                    <button
                      onClick={() => toggleStatus(driver)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
                    >
                      {statusBadge.label}
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetail(driver)}
                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => handleEdit(driver)}
                        className="flex-1 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(driver)}
                        className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modals - tương tự Users page, bỏ qua để tiết kiệm dung lượng */}
      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">
                {showCreateModal ? 'Thêm tài xế mới' : 'Chỉnh sửa tài xế'}
              </h2>
            </div>

            <form onSubmit={showCreateModal ? handleSubmitCreate : handleSubmitEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Họ tên</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {showCreateModal && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Số GPLX</label>
                <input
                  type="text"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  placeholder="VD: B2-123456"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hạn sử dụng GPLX</label>
                <input
                  type="date"
                  value={formData.license_expiry}
                  onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {showCreateModal ? 'Tạo mới' : 'Cập nhật'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Chi tiết tài xế</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <div className="p-6 space-y-4">
              <div><label className="text-sm font-semibold text-gray-600">ID</label><p>#{selectedDriver.driver_id}</p></div>
              <div><label className="text-sm font-semibold text-gray-600">Email</label><p>{selectedDriver.email}</p></div>
              <div><label className="text-sm font-semibold text-gray-600">Họ tên</label><p>{selectedDriver.full_name}</p></div>
              <div><label className="text-sm font-semibold text-gray-600">SĐT</label><p>{selectedDriver.phone}</p></div>
              <div><label className="text-sm font-semibold text-gray-600">GPLX</label><p>{selectedDriver.license_number}</p></div>
              <div><label className="text-sm font-semibold text-gray-600">HSD GPLX</label><p>{selectedDriver.license_expiry}</p></div>
              <div><label className="text-sm font-semibold text-gray-600">Trạng thái</label><p>{getStatusBadge(selectedDriver.status).label}</p></div>
            </div>

            <div className="p-6 border-t">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
              <p className="text-gray-700 mb-2">
                Bạn có chắc muốn xóa tài xế <strong>{selectedDriver.full_name}</strong>?
              </p>
              <p className="text-sm text-red-600">Hành động này không thể hoàn tác!</p>
            </div>

            <div className="p-6 border-t flex gap-3">
              <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                Xóa
              </button>
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
