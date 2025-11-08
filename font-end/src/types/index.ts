// ============================================
// USER TYPES
// ============================================

export interface User {
  user_id: number;
  email: string;
  full_name: string;
  phone?: string;
  user_type: 'admin' | 'driver' | 'parent';
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  user_type: 'admin' | 'driver' | 'parent';
}

export interface UpdateUserInput {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

// ============================================
// DRIVER TYPES
// ============================================

export interface Driver {
  driver_id: number;
  user_id: number;
  license_number: string;
  license_expiry?: string;
  experience_years?: number;
  status: 'active' | 'inactive' | 'on_leave';
  created_at: string;
  updated_at?: string;
  // Joined data
  email?: string;
  full_name?: string;
  phone?: string;
  address?: string;
  emergency_contact?: string;
  rating?: number;
}

// ============================================
// PARENT TYPES
// ============================================

export interface Parent {
  parent_id: number;
  user_id: number;
  phone?: string;
  address?: string;
  relationship?: string;
  created_at: string;
  updated_at?: string;
  // Joined data
  email?: string;
  full_name?: string;
}

// ============================================
// STUDENT TYPES
// ============================================

export interface Student {
  student_id: number;
  parent_id: number;
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address?: string;
  school_name?: string;
  grade?: string;
  class_name?: string;
  medical_notes?: string;
  photo_url?: string;
  student_code?: string;
  pickup_address?: string;
  dropoff_address?: string;
  special_needs?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  // Joined data
  parent_name?: string;
  parent_phone?: string;
}

// ============================================
// BUS TYPES
// ============================================

export interface Bus {
  bus_id: number;
  bus_number: string;
  capacity: number;
  model?: string;
  year?: number;
  color?: string;
  license_plate?: string;
  status: 'active' | 'maintenance' | 'inactive';
  created_at: string;
  updated_at?: string;
}

// ============================================
// ROUTE TYPES
// ============================================

export interface Route {
  route_id: number;
  route_name: string;
  description?: string;
  distance_km?: number;
  estimated_duration_minutes?: number;
  estimated_duration?: number;  // Alias for estimated_duration_minutes
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
}

export interface Stop {
  stop_id: number;
  route_id: number;
  stop_name: string;
  stop_address?: string;
  latitude?: number;
  longitude?: number;
  stop_order: number;
  estimated_arrival_time?: string;
  created_at: string;
}

// ============================================
// SCHEDULE TYPES
// ============================================

export interface Schedule {
  schedule_id: number;
  route_id: number;
  bus_id: number;
  driver_id: number;
  trip_type: 'pickup' | 'dropoff';  // Fixed #2: was schedule_type with 'morning' | 'afternoon'
  schedule_date: string;  // Fixed #1: was scheduled_date
  start_time: string;
  end_time?: string;  // Fixed #4: was estimated_end_time
  actual_start_time?: string;
  actual_end_time?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';  // Fixed #5: was 'pending'
  notes?: string;
  created_at: string;
  updated_at?: string;
  // Joined data
  route_name?: string;
  bus_number?: string;
  driver_name?: string;
}

// ============================================
// MESSAGE TYPES
// ============================================

export interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  subject: string;
  content: string;  // Fixed #3: was message_content
  message_content?: string;  // Alternative field name
  is_read: boolean;
  parent_message_id?: number;
  created_at: string;
  read_at?: string;
  // Joined data
  sender_name?: string;
  sender_email?: string;
  sender_type?: 'admin' | 'driver' | 'parent';
  receiver_name?: string;
  receiver_email?: string;
  receiver_type?: 'admin' | 'driver' | 'parent';
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export interface CreateRouteInput {
  route_name: string;
  description?: string;
  distance_km?: number;
  estimated_duration?: number;
  estimated_duration_minutes?: number;
}

export interface UpdateRouteInput {
  route_name?: string;
  description?: string;
  distance_km?: number;
  estimated_duration?: number;
  estimated_duration_minutes?: number;
}
