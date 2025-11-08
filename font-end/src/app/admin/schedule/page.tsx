/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Schedule } from '@/types';
import { scheduleService } from '@/lib/scheduleService';
import DataTable, { Column } from '@/components/DataTable';
import Modal from '@/components/Modal';
import { LoadingOverlay } from '@/components/Loading';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScheduleForm from '@/components/ScheduleForm';
import ScheduleDetail from '@/components/ScheduleDetail';
import { Eye, Edit, Trash2, Plus, Search, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function SchedulesPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <SchedulesContent />
    </ProtectedRoute>
  );
}

function SchedulesContent() {
  const { user, token } = useAuth();
  
  // State
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [filterDate, setFilterDate] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const limit = 10;

  // Load schedules
  const loadSchedules = async () => {
    if (!token || !user) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');

      let response;
      if (searchQuery) {
        response = await scheduleService.searchSchedules(searchQuery, currentPage, limit);
      } else if (filterDate) {
        response = await scheduleService.getSchedulesByDate(filterDate, currentPage, limit);
      } else if (filterStatus !== 'all') {
        response = await scheduleService.getSchedulesByStatus(filterStatus as any, currentPage, limit);
      } else {
        response = await scheduleService.getSchedules(currentPage, limit);
      }

      const payload = response as any;
      const listData = payload?.data?.data ?? payload?.data ?? payload;
      setSchedules(Array.isArray(listData) ? listData : []);
      const pagination = payload?.data?.pagination ?? payload?.pagination;
      if (pagination) {
        setTotalPages(pagination.totalPages ?? totalPages);
        setTotal(pagination.total ?? total);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể tải danh sách lịch trình');
      console.error('Error loading schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load khi component mount hoặc thay đổi page/filter - only when user and token are available
  useEffect(() => {
    if (user && token) {
      loadSchedules();
    }
  }, [token, currentPage, filterStatus, filterDate]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    loadSchedules();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    setTimeout(loadSchedules, 0);
  };

  // Handle view detail
  const handleViewDetail = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowDetailModal(true);
  };

  // Handle edit
  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowEditModal(true);
  };

  // Handle delete
  const handleDelete = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedSchedule) return;

    try {
      setActionLoading(true);
      await scheduleService.deleteSchedule(selectedSchedule.schedule_id);
      setShowDeleteModal(false);
      setSelectedSchedule(null);
      loadSchedules();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể xóa lịch trình');
      console.error('Error deleting schedule:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (schedule: Schedule) => {
    const statusFlow = {
      scheduled: 'in_progress',
      in_progress: 'completed',
      completed: 'completed',
      cancelled: 'scheduled'
    };

    const newStatus = statusFlow[schedule.status] as any;

    try {
      setActionLoading(true);
      await scheduleService.updateStatus(schedule.schedule_id, newStatus);
      loadSchedules();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể cập nhật trạng thái');
      console.error('Error updating status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Format date
  const formatDate = (date?: string) => {
    if (!date) return '-';
    try {
      return format(new Date(date), 'dd/MM/yyyy');
    } catch {
      return date;
    }
  };

  // Format time
  const formatTime = (time?: string) => {
    if (!time) return '-';
    return time.substring(0, 5);
  };

  // Define columns
  const columns: Column<Schedule>[] = [
    {
      key: 'schedule_id',
      label: 'ID',
      render: (row) => <span className="font-mono text-sm">#{row.schedule_id}</span>
    },
    {
      key: 'schedule_date',
      label: 'Ngày',
      render: (row) => (
        <div>
          <div className="font-medium">{formatDate(row.schedule_date)}</div>
          <div className="text-xs text-gray-500">
            {row.trip_type === 'pickup' ? 'Đón' : 'Trả'}
          </div>
        </div>
      )
    },
    {
      key: 'route_name',
      label: 'Tuyến đường',
      render: (row) => (
        <span className="text-sm">{row.route_name || `#${row.route_id}`}</span>
      )
    },
    {
      key: 'bus_number',
      label: 'Xe buýt',
      render: (row) => (
        <span className="text-sm">{row.bus_number || `#${row.bus_id}`}</span>
      )
    },
    {
      key: 'driver_name',
      label: 'Tài xế',
      render: (row) => (
        <span className="text-sm">{row.driver_name || `#${row.driver_id}`}</span>
      )
    },
    {
      key: 'start_time',
      label: 'Giờ',
      render: (row) => (
        <span className="text-sm">{formatTime(row.start_time)}</span>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => {
        const colors = {
          scheduled: 'bg-yellow-100 text-yellow-700',
          in_progress: 'bg-blue-100 text-blue-700',
          completed: 'bg-green-100 text-green-700',
          cancelled: 'bg-red-100 text-red-700'
        };
        const labels = {
          scheduled: 'Chờ',
          in_progress: 'Đang chạy',
          completed: 'Hoàn thành',
          cancelled: 'Đã hủy'
        };
        return (
          <button
            onClick={() => handleToggleStatus(row)}
            disabled={row.status === 'completed'}
            className={`px-2 py-1 rounded-full text-xs font-medium ${colors[row.status]} ${
              row.status !== 'completed' ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'
            }`}
          >
            {labels[row.status]}
          </button>
        );
      }
    },
    {
      key: 'actions',
      label: 'Hành động',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetail(row)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Xem chi tiết"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
            title="Sửa"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Xóa"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý lịch trình</h1>
        <p className="text-gray-600 mt-1">Quản lý lịch trình xe buýt đưa đón học sinh</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <span className="text-red-700">{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm lịch trình..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Tìm
          </button>
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Filter by date */}
        <div className="relative">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <Calendar className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>

        {/* Filter by status */}
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as any);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="scheduled">Chờ khởi hành</option>
          <option value="in_progress">Đang chạy</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>

        {/* Add button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2"
        >
          <Plus size={20} />
          Thêm lịch trình
        </button>
      </div>

      {/* Stats */}
      <div className="mb-4 text-sm text-gray-600">
        Tổng số: <span className="font-semibold">{total}</span> lịch trình
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={schedules}
        loading={loading}
        pagination={{
          page: currentPage,
          limit: limit,
          total: total,
          totalPages: totalPages
        }}
        onPageChange={setCurrentPage}
      />

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Thêm lịch trình mới"
        size="md"
      >
        <ScheduleForm
          onSuccess={() => {
            setShowCreateModal(false);
            loadSchedules();
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Chỉnh sửa lịch trình"
        size="md"
      >
        {selectedSchedule && (
          <ScheduleForm
            schedule={selectedSchedule}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedSchedule(null);
              loadSchedules();
            }}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedSchedule(null);
            }}
          />
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Chi tiết lịch trình"
        size="md"
      >
        {selectedSchedule && <ScheduleDetail schedule={selectedSchedule} />}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Xác nhận xóa"
        size="sm"
      >
        <div>
          <p className="text-gray-700 mb-4">
            Bạn có chắc chắn muốn xóa lịch trình <strong>#{selectedSchedule?.schedule_id}</strong>?
          </p>
          <p className="text-sm text-red-600 mb-6">
            Hành động này không thể hoàn tác!
          </p>
          <div className="flex gap-3">
            <button
              onClick={confirmDelete}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {actionLoading ? 'Đang xóa...' : 'Xóa'}
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Hủy
            </button>
          </div>
        </div>
      </Modal>

      {/* Loading Overlay */}
      {actionLoading && <LoadingOverlay message="Đang xử lý..." />}
    </div>
  );
}
