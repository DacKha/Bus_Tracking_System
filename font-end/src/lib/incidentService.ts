/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

interface Incident {
  incident_id: number;
  schedule_id: number;
  reported_by: number;
  incident_type: 'accident' | 'breakdown' | 'delay' | 'emergency' | 'other';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'in_progress' | 'resolved' | 'closed';
  latitude?: number;
  longitude?: number;
  resolved_at?: string;
  resolved_by?: number;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

interface IncidentResponse {
  success: boolean;
  data: Incident[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SingleIncidentResponse {
  success: boolean;
  data: Incident;
}

interface CreateIncidentInput {
  schedule_id: number;
  incident_type: 'accident' | 'breakdown' | 'delay' | 'emergency' | 'other';
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  latitude?: number;
  longitude?: number;
}

interface UpdateIncidentInput {
  title?: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'reported' | 'in_progress' | 'resolved' | 'closed';
}

interface ResolveIncidentInput {
  resolution_notes: string;
}

export const incidentService = {
  // Lấy danh sách sự cố
  async getIncidents(page = 1, limit = 10): Promise<IncidentResponse> {
    const response = await api.get<IncidentResponse>('/api/incidents', {
      params: { page, limit }
    });
    return response.data;
  },

  // Lấy chi tiết 1 sự cố
  async getIncident(incidentId: number): Promise<SingleIncidentResponse> {
    const response = await api.get<SingleIncidentResponse>(`/api/incidents/${incidentId}`);
    return response.data;
  },

  // Báo cáo sự cố mới
  async reportIncident(data: CreateIncidentInput): Promise<SingleIncidentResponse> {
    const response = await api.post<SingleIncidentResponse>('/api/incidents', data);
    return response.data;
  },

  // Cập nhật sự cố
  async updateIncident(incidentId: number, data: UpdateIncidentInput): Promise<SingleIncidentResponse> {
    const response = await api.put<SingleIncidentResponse>(`/api/incidents/${incidentId}`, data);
    return response.data;
  },

  // Xóa sự cố
  async deleteIncident(incidentId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/incidents/${incidentId}`);
    return response.data;
  },

  // Đánh dấu sự cố đã giải quyết
  async resolveIncident(incidentId: number, data: ResolveIncidentInput): Promise<SingleIncidentResponse> {
    const response = await api.put<SingleIncidentResponse>(`/api/incidents/${incidentId}/resolve`, data);
    return response.data;
  },

  // Lấy danh sách sự cố chưa giải quyết
  async getUnresolvedIncidents(page = 1, limit = 10): Promise<IncidentResponse> {
    const response = await api.get<IncidentResponse>('/api/incidents/unresolved', {
      params: { page, limit }
    });
    return response.data;
  },

  // Lấy danh sách sự cố nghiêm trọng
  async getCriticalIncidents(page = 1, limit = 10): Promise<IncidentResponse> {
    const response = await api.get<IncidentResponse>('/api/incidents/critical', {
      params: { page, limit }
    });
    return response.data;
  },

  // Lấy thống kê sự cố
  async getIncidentStats(): Promise<any> {
    const response = await api.get('/api/incidents/stats');
    return response.data;
  }
};
