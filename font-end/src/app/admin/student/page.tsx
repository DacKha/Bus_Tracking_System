/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, Search, Plus, Eye, Edit, Trash2, X, Filter } from 'lucide-react';
import { studentService } from '@/lib/studentService';
import { Student } from '@/types';

export default function StudentsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <StudentsContent />
    </ProtectedRoute>
  );
}

function StudentsContent() {
  const { user, token } = useAuth();
  
  // State
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Student>>({
    full_name: '',
    student_code: '',
    date_of_birth: '',
    gender: 'male',
    grade: '1',
    class_name: 'A',
    parent_name: '',
    parent_phone: '',
    pickup_address: '',
    dropoff_address: '',
    is_active: true,
  });

  // Load students
  const loadStudents = async () => {
    if (!token || !user) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await studentService.getStudents(1, 100);
      const studentsList = response?.data ?? [];
      setStudents(studentsList as any);
      setFilteredStudents(studentsList as any);
    } catch (error: any) {
      console.error('Lỗi tải danh sách học sinh:', error);
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Load on mount - only when user and token are available
  useEffect(() => {
    if (user && token) {
      loadStudents();
    }
  }, [token]);

  // Filter students
  useEffect(() => {
    let result = [...students];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(student =>
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.student_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.parent_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by grade
    if (filterGrade !== 'all') {
      result = result.filter(student => student.grade === filterGrade);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(student => student.is_active === (filterStatus === 'active'));
    }

    setFilteredStudents(result);
  }, [students, searchQuery, filterGrade, filterStatus]);

  // Handle create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await studentService.createStudent(formData as any);
      setShowCreateModal(false);
      resetForm();
      alert('Tạo học sinh thành công!');
      loadStudents();
    } catch (err: any) {
      console.error('Lỗi tạo học sinh:', err.message);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle edit
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      await studentService.updateStudent(selectedStudent.student_id, formData);
      setShowEditModal(false);
      setSelectedStudent(null);
      resetForm();
      alert('Cập nhật học sinh thành công!');
      loadStudents();
    } catch (err: any) {
      console.error('Lỗi cập nhật học sinh:', err.message);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedStudent) return;

    try {
      await studentService.deleteStudent(selectedStudent.student_id);
      setShowDeleteModal(false);
      setSelectedStudent(null);
      alert('Xóa học sinh thành công!');
      loadStudents();
    } catch (err: any) {
      console.error('Lỗi xóa học sinh:', err.message);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Toggle status
  const handleToggleStatus = async (student: Student) => {
    try {
      await studentService.updateStudent(student.student_id, {
        is_active: !student.is_active,
      } as any);

      setStudents(students.map(s =>
        s.student_id === student.student_id ? { ...s, is_active: !s.is_active } : s
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

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    // Convert null values to empty strings to prevent React warnings
    setFormData({
      ...student,
      student_code: student.student_code || '',
      pickup_address: student.pickup_address || '',
      dropoff_address: student.dropoff_address || '',
    });
    setShowEditModal(true);
  };

  const openDetailModal = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const openDeleteModal = (student: Student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      full_name: '',
      student_code: '',
      date_of_birth: '',
      gender: 'male',
      grade: '1',
      class_name: 'A',
      parent_name: '',
      parent_phone: '',
      pickup_address: '',
      dropoff_address: '',
      is_active: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách học sinh...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý học sinh</h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">Quản lý thông tin học sinh và phụ huynh</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2 justify-center transition-colors"
        >
          <Plus size={20} />
          <span>Thêm học sinh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, mã HS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Grade Filter */}
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
          >
            <option value="all">Tất cả khối</option>
            <option value="1">Khối 1</option>
            <option value="2">Khối 2</option>
            <option value="3">Khối 3</option>
            <option value="4">Khối 4</option>
            <option value="5">Khối 5</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang học</option>
            <option value="inactive">Nghỉ học</option>
          </select>
        </div>

        {/* Stats */}
        <div className="mt-4 text-sm text-gray-600">
          Hiển thị <span className="font-semibold text-gray-900">{filteredStudents.length}</span> / {students.length} học sinh
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Mã HS</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Họ tên</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Giới tính</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Lớp</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Phụ huynh</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Địa chỉ đón</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{student.student_code}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <GraduationCap size={16} className="text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{student.full_name}</div>
                        <div className="text-xs text-gray-500">{student.date_of_birth}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {student.gender === 'male' ? 'Nam' : student.gender === 'female' ? 'Nữ' : 'Khác'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.grade}{student.class_name}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{student.parent_name}</div>
                    <div className="text-xs text-gray-500">{student.parent_phone}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{student.pickup_address}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(student)}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        student.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {student.is_active ? 'Đang học' : 'Nghỉ học'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openDetailModal(student)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openEditModal(student)}
                        className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(student)}
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

        {filteredStudents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <GraduationCap size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Không tìm thấy học sinh nào</p>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredStudents.map((student) => (
          <div key={student.student_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <GraduationCap size={20} className="text-yellow-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{student.full_name}</div>
                  <div className="text-sm text-gray-500">{student.student_code}</div>
                </div>
              </div>
              <button
                onClick={() => handleToggleStatus(student)}
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  student.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {student.is_active ? 'Đang học' : 'Nghỉ học'}
              </button>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Lớp:</span>
                <span className="font-medium text-gray-900">{student.grade}{student.class_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Giới tính:</span>
                <span className="text-gray-900">
                  {student.gender === 'male' ? 'Nam' : student.gender === 'female' ? 'Nữ' : 'Khác'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phụ huynh:</span>
                <span className="text-gray-900">{student.parent_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SĐT:</span>
                <span className="text-gray-900">{student.parent_phone}</span>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Địa chỉ đón:</div>
                <div className="text-gray-900 text-xs">{student.pickup_address}</div>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-200">
              <button
                onClick={() => openDetailModal(student)}
                className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors"
              >
                <Eye size={16} />
                <span className="text-sm font-medium">Chi tiết</span>
              </button>
              <button
                onClick={() => openEditModal(student)}
                className="flex-1 px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 flex items-center justify-center gap-2 transition-colors"
              >
                <Edit size={16} />
                <span className="text-sm font-medium">Sửa</span>
              </button>
              <button
                onClick={() => openDeleteModal(student)}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {filteredStudents.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <GraduationCap size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Không tìm thấy học sinh nào</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {showCreateModal ? 'Thêm học sinh mới' : 'Chỉnh sửa học sinh'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedStudent(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={showCreateModal ? handleCreate : handleEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* Student Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mã học sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.student_code}
                    onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Khối <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="1">Khối 1</option>
                    <option value="2">Khối 2</option>
                    <option value="3">Khối 3</option>
                    <option value="4">Khối 4</option>
                    <option value="5">Khối 5</option>
                  </select>
                </div>

                {/* Class Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lớp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.class_name}
                    onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                    placeholder="A, B, C..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* Parent Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên phụ huynh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.parent_name}
                    onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* Parent Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    SĐT phụ huynh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.parent_phone}
                    onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* Pickup Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ đón <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.pickup_address}
                    onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* Dropoff Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ trả
                  </label>
                  <input
                    type="text"
                    value={formData.dropoff_address}
                    onChange={(e) => setFormData({ ...formData, dropoff_address: e.target.value })}
                    placeholder="Để trống nếu giống địa chỉ đón"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Is Active */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Đang học</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-semibold transition-colors"
                >
                  {showCreateModal ? 'Thêm học sinh' : 'Cập nhật'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedStudent(null);
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
      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Chi tiết học sinh</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedStudent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
                  <GraduationCap size={32} className="text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedStudent.full_name}</h3>
                  <p className="text-gray-600">{selectedStudent.student_code}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Ngày sinh</div>
                  <div className="font-medium text-gray-900">{selectedStudent.date_of_birth}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Giới tính</div>
                  <div className="font-medium text-gray-900">
                    {selectedStudent.gender === 'male' ? 'Nam' : selectedStudent.gender === 'female' ? 'Nữ' : 'Khác'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Lớp</div>
                  <div className="font-medium text-gray-900">{selectedStudent.grade}{selectedStudent.class_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Trạng thái</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedStudent.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedStudent.is_active ? 'Đang học' : 'Nghỉ học'}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Thông tin phụ huynh</h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Họ tên</div>
                    <div className="font-medium text-gray-900">{selectedStudent.parent_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Số điện thoại</div>
                    <div className="font-medium text-gray-900">{selectedStudent.parent_phone}</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Địa chỉ đưa đón</h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Địa chỉ đón</div>
                    <div className="text-gray-900">{selectedStudent.pickup_address}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Địa chỉ trả</div>
                    <div className="text-gray-900">{selectedStudent.dropoff_address || selectedStudent.pickup_address}</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="text-sm text-gray-600">Ngày tạo: {selectedStudent.created_at}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Xác nhận xóa</h2>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Bạn có chắc chắn muốn xóa học sinh <strong>{selectedStudent.full_name}</strong>?
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
                  setSelectedStudent(null);
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
