/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Eye, Edit, Trash2, Plus, Search, X, Filter, UserPlus, RefreshCw } from 'lucide-react';
import { userService } from '@/lib/userService';

interface User {
  user_id: number;
  email: string;
  full_name: string;
  phone?: string;
  user_type: 'admin' | 'driver' | 'parent';
  is_active: boolean;
  created_at: string;
}

export default function UsersPage() {
  const { user, token } = useAuth();
  
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'admin' | 'driver' | 'parent'>('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    password: '',
    user_type: 'parent' as 'admin' | 'driver' | 'parent',
  });

  // Load users
  const loadUsers = async () => {
    if (!token || !user) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await userService.getUsers(1, 100);
      const usersList = response?.data ?? [];
      setUsers(usersList as any);
    } catch (error: any) {
      console.error('Lỗi tải danh sách người dùng:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      loadUsers();
    }
  }, [token]);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchSearch = searchQuery === '' ||
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchType = filterType === 'all' || user.user_type === filterType;

    return matchSearch && matchType;
  });

  // Handle create user
  const handleCreate = () => {
    setFormData({
      email: '',
      full_name: '',
      phone: '',
      password: '',
      user_type: 'parent',
    });
    setShowCreateModal(true);
  };

  // Handle submit create
  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await userService.createUser({
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        password: formData.password,
        user_type: formData.user_type,
      });

      setShowCreateModal(false);
      alert('Tạo người dùng thành công!');
      loadUsers();
    } catch (err: any) {
      console.error('Lỗi tạo người dùng:', err.message);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle edit
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      phone: user.phone || '',
      password: '',
      user_type: user.user_type,
    });
    setShowEditModal(true);
  };

  // Handle submit edit
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await userService.updateUser(selectedUser.user_id, {
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        user_type: formData.user_type,
      } as any);

      setShowEditModal(false);
      alert('Cập nhật thành công!');
      loadUsers();
    } catch (err: any) {
      console.error('Lỗi cập nhật người dùng:', err.message);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle delete
  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await userService.deleteUser(selectedUser.user_id);
      setShowDeleteModal(false);
      alert('Xóa thành công!');
      loadUsers();
    } catch (err: any) {
      console.error('Lỗi xóa người dùng:', err.message);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Toggle status
  const toggleStatus = async (user: User) => {
    try {
      await userService.updateUser(user.user_id, {
        is_active: !user.is_active,
      } as any);

      setUsers(users.map(u =>
        u.user_id === user.user_id
          ? { ...u, is_active: !u.is_active }
          : u
      ));
    } catch (err: any) {
      console.error('Lỗi cập nhật trạng thái:', err.message);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // View detail
  const handleViewDetail = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý Người dùng</h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            Quản lý tài khoản Admin, Tài xế và Phụ huynh
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center transition-colors"
        >
          <UserPlus size={20} />
          <span>Thêm người dùng</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Filter by type */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
            >
              <option value="all">Tất cả loại người dùng</option>
              <option value="admin">Admin</option>
              <option value="driver">Tài xế</option>
              <option value="parent">Phụ huynh</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Tìm thấy <span className="font-semibold text-gray-900">{filteredUsers.length}</span> người dùng
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Họ tên</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Điện thoại</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Loại</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                        #{user.user_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.user_type === 'admin' ? 'bg-purple-100 text-purple-700' :
                          user.user_type === 'driver' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {user.user_type === 'admin' ? 'Admin' :
                           user.user_type === 'driver' ? 'Tài xế' :
                           'Phụ huynh'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleStatus(user)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            user.is_active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {user.is_active ? 'Hoạt động' : 'Tạm khóa'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <div key={user.user_id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.phone && <p className="text-sm text-gray-600">{user.phone}</p>}
                    </div>
                    <span className="text-xs font-mono text-gray-500">#{user.user_id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.user_type === 'admin' ? 'bg-purple-100 text-purple-700' :
                      user.user_type === 'driver' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {user.user_type === 'admin' ? 'Admin' :
                       user.user_type === 'driver' ? 'Tài xế' :
                       'Phụ huynh'}
                    </span>
                    <button
                      onClick={() => toggleStatus(user)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.is_active ? 'Hoạt động' : 'Tạm khóa'}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetail(user)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="flex-1 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-colors"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {showCreateModal ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'}
              </h2>
            </div>

            <form onSubmit={showCreateModal ? handleSubmitCreate : handleSubmitEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Họ tên</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {showCreateModal && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Loại tài khoản</label>
                <select
                  value={formData.user_type}
                  onChange={(e) => setFormData({ ...formData, user_type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="parent">Phụ huynh</option>
                  <option value="driver">Tài xế</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  {showCreateModal ? 'Tạo mới' : 'Cập nhật'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Chi tiết người dùng</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">ID</label>
                <p className="text-gray-900">#{selectedUser.user_id}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Email</label>
                <p className="text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Họ tên</label>
                <p className="text-gray-900">{selectedUser.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Số điện thoại</label>
                <p className="text-gray-900">{selectedUser.phone || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Loại tài khoản</label>
                <p className="text-gray-900">
                  {selectedUser.user_type === 'admin' ? 'Admin' :
                   selectedUser.user_type === 'driver' ? 'Tài xế' :
                   'Phụ huynh'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Trạng thái</label>
                <p className="text-gray-900">
                  {selectedUser.is_active ? 'Hoạt động' : 'Tạm khóa'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Ngày tạo</label>
                <p className="text-gray-900">{selectedUser.created_at}</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Xác nhận xóa</h2>
              <p className="text-gray-700 mb-2">
                Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser.full_name}</strong>?
              </p>
              <p className="text-sm text-red-600">
                Hành động này không thể hoàn tác!
              </p>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Xóa
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
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
