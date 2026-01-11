'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/services/api';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAdmin: boolean;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminLogout: () => void;
}

interface SignupData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';
      
      if (storedToken) {
        setToken(storedToken);
        setIsAdmin(storedIsAdmin);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token: newToken, id } = response.data;
      
      setToken(newToken);
      setUser({ id, email });
      setIsAdmin(false);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify({ id, email }));
        localStorage.setItem('isAdmin', 'false');
      }
      
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  const signup = async (data: SignupData) => {
    try {
      await authAPI.signup(data);
      toast.success('Registration successful! Please login.');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      setIsAdmin(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAdmin');
      }
      toast.success('Logged out successfully');
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const { adminAuthAPI } = await import('@/services/api');
      const response = await adminAuthAPI.login({ email, password });
      const { token: newToken, id } = response.data;
      
      setToken(newToken);
      setUser({ id, email });
      setIsAdmin(true);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify({ id, email }));
        localStorage.setItem('isAdmin', 'true');
      }
      
      toast.success('Admin login successful!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Admin login failed');
      throw error;
    }
  };

  const adminLogout = async () => {
    try {
      if (token) {
        const { adminAuthAPI } = await import('@/services/api');
        await adminAuthAPI.logout();
      }
    } catch (error) {
      console.error('Admin logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      setIsAdmin(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAdmin');
      }
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        logout,
        isLoading,
        isAdmin,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
