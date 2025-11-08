/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { studentService } from '@/lib/studentService';
import { Student } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LoadingOverlay } from '@/components/Loading';
import DataTable, { Column } from '@/components/DataTable';
import Modal from '@/components/Modal';
import StudentDetail from '@/components/StudentDetail';
import {
  GraduationCap,
  Eye,
  Search,
  X,
  Phone,
  MapPin
} from 'lucide-react';

export default function DriverStudentsPage() {
  return (
    <ProtectedRoute allowedRoles={['driver']}>
      <DriverStudentsContent />
    </ProtectedRoute>
  );
}

function DriverStudentsContent() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const limit = 10;

  // Load students
  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');

      let response;
      if (searchQuery) {
        response = await studentService.searchStudents(searchQuery, currentPage, limit);
      } else {
        response = await studentService.getStudents(currentPage, limit);
      }

      setStudents(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotal(response.pagination?.total || 0);
    } catch (err: any) {
      setError('Không thể tải danh sách học sinh');
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [currentPage]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    loadStudents();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    setTimeout(loadStudents, 0);
  };

  // Handle view detail
  const handleViewDetail = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  // Define columns
  const columns: Column<Student>[] = [
    {
      key: 'student_id',
      label: 'Mã HS',
      render: (row) => <span className="font-mono text-sm">#{row.student_id}</span>
    },
    {
      key: 'full_name',
      label: 'Họ tên',
      render: (row) => (
        <div className="flex items-center gap-2">
          <GraduationCap size={16} className="text-gray-400" />
          <span className="font-medium">{row.full_name}</span>
        </div>
      )
    },
    {
      key: 'date_of_birth',
      label: 'Ngày sinh',
      render: (row) => (
        <span className="text-sm">
          {new Date(row.date_of_birth).toLocaleDateString('vi-VN')}
        </span>
      )
    },
    {
      key: 'gender',
      label: 'Giới tính',
      render: (row) => {
        const labels = {
          male: 'Nam',
          female: 'Nữ',
          other: 'Khác'
        };
        return <span className="text-sm">{labels[row.gender]}</span>;
      }
    },
    {
      key: 'school_name',
      label: 'Trường',
      render: (row) => <span className="text-sm">{row.school_name || '-'}</span>
    },
    {
      key: 'grade',
      label: 'Lớp',
      render: (row) => (
        <span className="text-sm">
          {row.grade || '-'} {row.class_name && `/ ${row.class_name}`}
        </span>
      )
    },
    {
      key: 'parent_name',
      label: 'Phụ huynh',
      render: (row) => (
        <div>
          <p className="text-sm font-medium">{row.parent_name || '-'}</p>
          {row.parent_phone && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Phone size={12} />
              {row.parent_phone}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Trạng thái',
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.is_active
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {row.is_active ? 'Hoạt động' : 'Ngừng'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Hành động',
      render: (row) => (
        <button
          onClick={() => handleViewDetail(row)}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          title="Xem chi tiết"
        >
          <Eye size={16} />
        </button>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="p-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Danh sách học sinh</h1>
            <p className="text-gray-600 mt-1">Thông tin tất cả học sinh trong hệ thống</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <span className="text-red-700">{error}</span>
            <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Search */}
        <div className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã học sinh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tìm
          </button>
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="mb-4 text-sm text-gray-600">
          Tổng số: <span className="font-semibold">{total}</span> học sinh
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <DataTable
            columns={columns}
            data={students}
            loading={loading}
            pagination={{
              page: currentPage,
              limit: limit,
              total: total,
              totalPages: totalPages
            }}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Chi tiết học sinh"
          size="md"
        >
          {selectedStudent && <StudentDetail student={selectedStudent} />}
        </Modal>
      </div>
    </div>
  );
}
