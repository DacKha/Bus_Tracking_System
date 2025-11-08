/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/lib/authService';
import { useRouter } from 'next/navigation';

// Interface cho Nguoi dung
interface User {
  user_id: number;
  email: string;
  full_name: string;
  user_type: 'admin' | 'driver' | 'parent';
  phone?: string;
  avatar_url?: string;
}

// Interface cho AuthContext
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Tao Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user tu localStorage khi component mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = authService.getUser();
        const storedToken = authService.getToken();

        if (storedUser && storedToken) {
          setUser(storedUser);
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Loi khi load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Ham login
  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);

      if (response.success) {
        const { user: userData, token: userToken } = response.data;

        // Luu vao localStorage
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));

        // Cap nhat state
        setUser(userData);
        setToken(userToken);

        // Redirect dua vao user_type
        if (userData.user_type === 'admin') {
          router.push('/admin');
        } else if (userData.user_type === 'driver') {
          router.push('/driver');
        } else if (userData.user_type === 'parent') {
          router.push('/parents/home');
        }
      }
    } catch (error: any) {
      console.error('Loi dang nhap:', error);
      throw new Error(error.response?.data?.error || 'Dang nhap that bai');
    }
  };

  // Ham dang xuat
  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook de su dung AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phai duoc su dung trong AuthProvider');
  }
  return context;
}


