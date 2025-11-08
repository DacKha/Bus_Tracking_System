import api from './api';

// Interface cho response
interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      user_id: number;
      email: string;
      full_name: string;
      user_type: 'admin' | 'driver' | 'parent';
      phone?: string;
      avatar_url?: string;
    };
    token: string;
  };
}

interface User {
  user_id: number;
  email: string;
  full_name: string;
  user_type: 'admin' | 'driver' | 'parent';
  phone?: string;
  avatar_url?: string;
}

// Auth Service
export const authService = {
  // Login
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // Get current user
  async getMe(): Promise<User> {
    const response = await api.get<{ success: boolean; data: User }>('/api/auth/me');
    return response.data.data;
  },

  // Logout
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Check if user is logged in
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  },

  // Get stored token
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  // Get stored user
  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  },
};
