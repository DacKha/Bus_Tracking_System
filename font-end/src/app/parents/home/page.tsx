/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { parentService } from '@/lib/parentService';
import { Student } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LoadingOverlay } from '@/components/Loading';
import Modal from '@/components/Modal';
import StudentDetail from '@/components/StudentDetail';
import {
  GraduationCap,
  Calendar,
  Bus,
  Clock,
  MapPin,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function ParentHomePage() {
  return (
    <ProtectedRoute allowedRoles={['parent']}>
      <ParentHomeContent />
    </ProtectedRoute>
  );
}

interface Schedule {
  schedule_id: number;
  route_name: string;
  bus_number: string;
  schedule_type: 'morning' | 'afternoon';
  scheduled_date: string;
  start_time: string;
  status: string;
  pickup_status?: string;
  dropoff_status?: string;
  pickup_time?: string;
  dropoff_time?: string;
}

function ParentHomeContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [childSchedules, setChildSchedules] = useState<Schedule[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [parentInfo, setParentInfo] = useState<any>(null);

  // Load children
  const loadChildren = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user?.user_id) return;

      // Lấy thông tin parent
      const parentData = await parentService.getParentByUserId(user.user_id);
      const parentInfo = parentData?.data;
      setParentInfo(parentInfo);

      // Lấy danh sách con - format chuẩn: { success, message, data }
      const childrenResponse = await parentService.getChildren(parentInfo.parent_id);
      const childrenArray = childrenResponse?.data || [];
      setChildren(childrenArray);

      // Tự động chọn con đầu tiên nếu có
      if (childrenArray && childrenArray.length > 0) {
        handleSelectChild(childrenArray[0]);
      }
    } catch (err: any) {
      setError('Không thể tải dữ liệu');
      console.error('Error loading children:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle select child
  const handleSelectChild = async (child: Student) => {
    setSelectedChild(child);
    try {
      const today = new Date().toISOString().split('T')[0];
      const schedulesResponse = await parentService.getStudentSchedules(child.student_id, today);
      const schedulesArray = schedulesResponse?.data || [];
      setChildSchedules(schedulesArray);
    } catch (err) {
      console.error('Error loading schedules:', err);
    }
  };

  useEffect(() => {
    loadChildren();
  }, [user]);

  if (loading) {
    return <LoadingOverlay message="Đang tải..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
          <button
            onClick={loadChildren}
            className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <GraduationCap className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có thông tin con</h2>
          <p className="text-gray-600 mb-6">
            Vui lòng liên hệ nhà trường để thêm thông tin con bạn vào hệ thống
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Xin chào, {user?.full_name}!</h1>
              <p className="text-green-100 mt-1">Theo dõi con bạn đi học</p>
            </div>
            <button
              onClick={loadChildren}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Làm mới
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Children Cards */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Con của bạn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((child) => (
              <div
                key={child.student_id}
                onClick={() => handleSelectChild(child)}
                className={`bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer transition-all hover:shadow-md ${
                  selectedChild?.student_id === child.student_id
                    ? 'border-green-500 ring-2 ring-green-200'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="text-green-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{child.full_name}</h3>
                      <p className="text-sm text-gray-600">
                        {child.grade} {child.class_name && `- ${child.class_name}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChild(child);
                      setShowDetailModal(true);
                    }}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                  >
                    <Eye size={16} />
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={14} className="text-gray-400" />
                    <span>
                      {new Date(child.date_of_birth).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  {child.school_name && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="truncate">{child.school_name}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      child.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {child.is_active ? 'Đang học' : 'Ngừng học'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Child Schedules */}
        {selectedChild && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Lịch trình hôm nay - {selectedChild.full_name}
              </h2>
            </div>

            <div className="p-6">
              {childSchedules.length === 0 ? (
                <div className="text-center py-12">
                  <Bus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Không có lịch trình hôm nay</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {childSchedules.map((schedule) => (
                    <div
                      key={schedule.schedule_id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              schedule.schedule_type === 'morning'
                                ? 'bg-yellow-100'
                                : 'bg-blue-100'
                            }`}
                          >
                            {schedule.schedule_type === 'morning' ? (
                              <span className="text-2xl">🌅</span>
                            ) : (
                              <span className="text-2xl">🌆</span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {schedule.schedule_type === 'morning' ? 'Đón sáng' : 'Trả chiều'}
                            </h3>
                            <p className="text-sm text-gray-600">{schedule.route_name}</p>
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            schedule.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : schedule.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {schedule.status === 'completed'
                            ? 'Hoàn thành'
                            : schedule.status === 'in_progress'
                            ? 'Đang di chuyển'
                            : 'Chưa bắt đầu'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Bus size={16} className="text-gray-400" />
                          <span className="text-sm">Xe: {schedule.bus_number}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock size={16} className="text-gray-400" />
                          <span className="text-sm">Khởi hành: {schedule.start_time}</span>
                        </div>
                      </div>

                      {/* Pickup/Dropoff Status */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-600 mb-2">Trạng thái đón:</p>
                          <div className="flex items-center gap-2">
                            {schedule.pickup_status === 'picked_up' ? (
                              <>
                                <CheckCircle className="text-green-600" size={18} />
                                <span className="text-sm font-medium text-green-700">
                                  Đã đón
                                  {schedule.pickup_time && ` (${schedule.pickup_time})`}
                                </span>
                              </>
                            ) : schedule.pickup_status === 'absent' ? (
                              <>
                                <XCircle className="text-red-600" size={18} />
                                <span className="text-sm font-medium text-red-700">Vắng mặt</span>
                              </>
                            ) : (
                              <>
                                <Clock className="text-yellow-600" size={18} />
                                <span className="text-sm font-medium text-yellow-700">
                                  Chờ đón
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {schedule.pickup_status === 'picked_up' && (
                          <div>
                            <p className="text-xs text-gray-600 mb-2">Trạng thái trả:</p>
                            <div className="flex items-center gap-2">
                              {schedule.dropoff_status === 'dropped_off' ? (
                                <>
                                  <CheckCircle className="text-green-600" size={18} />
                                  <span className="text-sm font-medium text-green-700">
                                    Đã trả
                                    {schedule.dropoff_time && ` (${schedule.dropoff_time})`}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Clock className="text-blue-600" size={18} />
                                  <span className="text-sm font-medium text-blue-700">
                                    Đang trên xe
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Thông tin chi tiết"
        size="md"
      >
        {selectedChild && <StudentDetail student={selectedChild} />}
      </Modal>
    </div>
  );
}
